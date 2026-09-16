import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import GenesisCore from "../../core/index.js";
import { normalizeSolveOptions } from "../../core/solveOptions.js";
import {
    buildWorksheetViewModel,
    normalizeEquationInput,
    normalizeTargetVariableInput
} from "../../presentation/adapters/index.js";
import {
    buildColumnLayout,
    buildDisplayColumnLayout,
    resolveCellSemanticBounds,
    semanticSpanCenterX
} from "../../presentation/column_layout/index.js";
import {
    buildLatexDocumentFromNodes,
    buildStepNodes
} from "../../scripts/export_projection_pdf_core/index.js";
import { buildStepLayout } from "../../scripts/export_projection_pdf_core/stepLayout.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

function printUsage() {
    console.error(
        "Verwendung: node projects/complex_exponent_transition/render_b_real_transition.mjs " +
        "\"<boundary_eq>\" \"<landing_eq>\" [--target x] [--output Projektstand/pdf/datei.pdf]"
    );
}

function parseArgs(argv) {
    const args = [...argv];
    let boundaryEquation = null;
    let landingEquation = null;
    let targetVariable = "x";
    let outputPath = null;

    while (args.length > 0) {
        const token = args.shift();

        if (!token) {
            continue;
        }

        if (token === "--target") {
            targetVariable = args.shift() || "x";
            continue;
        }

        if (token === "--output") {
            outputPath = args.shift() || null;
            continue;
        }

        if (!boundaryEquation) {
            boundaryEquation = token;
            continue;
        }

        if (!landingEquation) {
            landingEquation = token;
        }
    }

    return {
        boundaryEquation,
        landingEquation,
        targetVariable,
        outputPath
    };
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function extractSingleLogBaseSpec(equation = "") {
    const match = String(equation || "").match(/log_([A-Za-z0-9]+)\(/);

    if (!match) {
        return null;
    }

    return {
        raw: match[0],
        baseText: match[1]
    };
}

function normalizeEquationForPreviewSolve(equation = "", logBaseSpec = null) {
    if (!logBaseSpec?.raw) {
        return equation;
    }

    return String(equation).replaceAll(logBaseSpec.raw, "log(");
}

function findSampleTextRenderNode(step) {
    return (step?.cells || []).find((cell) => cell?.renderNode?.type === "text")?.renderNode || {
        type: "text",
        text: "x",
        kind: "variable",
        layout: {
            boxRole: "text",
            axisBehavior: "baseline",
            nestingDepth: 0,
            fractionDepth: 0,
            maxFractionDepth: 0,
            containsFraction: false,
            axisMinHeightEm: 1.12,
            aboveAxisMinHeightEm: 0.92,
            belowAxisMinHeightEm: 0.86,
            axisTopReserveEm: 0.18,
            axisBottomReserveEm: 0.14,
            axisBalanceEm: 0.04,
            axisAboveEm: 0.52,
            axisBelowEm: 0.28,
            boxHeightEm: 0.8
        }
    };
}

function createBaseTextRenderNode(baseText, sampleRenderNode) {
    return {
        ...deepClone(sampleRenderNode),
        text: baseText,
        kind: /^\d+(?:\.\d+)?$/.test(baseText) ? "number" : "variable"
    };
}

function createBaseContentAtoms(baseText) {
    return [{
        id: `b-preview-base-${String(baseText).toLowerCase()}`,
        type: /^\d+(?:\.\d+)?$/.test(baseText) ? "NUMBER" : "VARIABLE",
        value: baseText,
        isVisible: true
    }];
}

function decorateLogFunctionNode(node, baseText, sampleRenderNode) {
    if (!node || node.type !== "function" || node.name !== "log") {
        return node;
    }

    node.baseText = baseText;
    node.baseArgument = createBaseTextRenderNode(baseText, sampleRenderNode);
    return node;
}

function decorateLogFunctionShell(shellNode, baseText) {
    if (!shellNode || shellNode.type !== "FUNCTION" || shellNode.name !== "log") {
        return shellNode;
    }

    shellNode.baseContent = createBaseContentAtoms(baseText);
    return shellNode;
}

function decorateLandingStepLogBase(step, baseText) {
    if (!baseText) {
        return step;
    }

    const decorated = deepClone(step);
    const sampleRenderNode = findSampleTextRenderNode(decorated);

    (decorated.cells || []).forEach((cell) => {
        if (cell?.renderNode) {
            decorateLogFunctionNode(cell.renderNode, baseText, sampleRenderNode);
        }

        if (cell?.sourceShellRenderNode) {
            decorateLogFunctionNode(cell.sourceShellRenderNode, baseText, sampleRenderNode);
        }

        if (cell?.sourceShellNode) {
            decorateLogFunctionShell(cell.sourceShellNode, baseText);
        }

        (Array.isArray(cell?.visibleAncestorShells) ? cell.visibleAncestorShells : []).forEach((descriptor) => {
            if (descriptor?.renderNode) {
                decorateLogFunctionNode(descriptor.renderNode, baseText, sampleRenderNode);
            }

            if (descriptor?.node) {
                decorateLogFunctionShell(descriptor.node, baseText);
            }
        });
    });

    return decorated;
}

function findEqualsAnchorCell(step) {
    return (step?.cells || []).find((cell) => (
        cell?.role === "anchor"
        || cell?.projectionRole === "equation_anchor"
        || cell?.text === "="
    )) || null;
}

function findEqualsAnchorCol(step) {
    const anchorCell = findEqualsAnchorCell(step);
    return Number.isInteger(anchorCell?.col) ? anchorCell.col : null;
}

function findEqualsAnchorX(step, displayLayout) {
    const anchorCell = (step?.cells || []).find((cell) => (
        cell?.role === "anchor"
        || cell?.projectionRole === "equation_anchor"
        || cell?.text === "="
    ));

    if (!anchorCell) {
        return null;
    }

    const bounds = resolveCellSemanticBounds(anchorCell);
    return semanticSpanCenterX(displayLayout, bounds.semanticStart, bounds.semanticEnd);
}

function shiftDisplayLayoutX(displayLayout, delta) {
    if (!Number.isFinite(delta) || delta === 0) {
        return displayLayout;
    }

    return {
        ...displayLayout,
        starts: (displayLayout?.starts || []).map((start) => start + delta)
    };
}

function createSingleStepViewModel(viewModel, step) {
    return {
        ...viewModel,
        steps: [deepClone(step)]
    };
}

function createPlacedSingleStepLayout(globalLayout, globalStepIndex) {
    return {
        heights: [globalLayout.heights?.[globalStepIndex] || 1.45],
        yByStep: [globalLayout.yByStep?.[globalStepIndex] || 1],
        bottom: globalLayout.bottom
    };
}

async function solveViewModel(equation, targetVariable) {
    const normalizedEquation = normalizeEquationInput(equation);
    const normalizedTarget = normalizeTargetVariableInput(targetVariable);
    const result = await GenesisCore.solve(
        normalizedEquation.normalized,
        normalizeSolveOptions({
            targetVariable: normalizedTarget,
            runtimeEngine: "genesis_runtime"
        })
    );

    if (result?.fehler) {
        throw new Error(result.fehler);
    }

    return buildWorksheetViewModel(result);
}

function resolveOutputPath(boundaryEquation, explicitOutputPath) {
    if (explicitOutputPath) {
        return path.resolve(projectRoot, explicitOutputPath);
    }

    const safe = String(boundaryEquation || "b_transition")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase() || "b_transition";

    return path.resolve(projectRoot, "Projektstand", "pdf", `${safe}__b_real_transition.pdf`);
}

function compilePdf(texPath, outputDir) {
    const result = spawnSync(
        "pdflatex",
        [
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-output-directory",
            outputDir,
            texPath
        ],
        {
            cwd: outputDir,
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "pdflatex fehlgeschlagen.");
    }
}

async function main() {
    const {
        boundaryEquation,
        landingEquation,
        targetVariable,
        outputPath
    } = parseArgs(process.argv.slice(2));

    if (!boundaryEquation || !landingEquation) {
        printUsage();
        process.exit(1);
    }

    const boundaryViewModel = await solveViewModel(boundaryEquation, targetVariable);
    const landingLogBaseSpec = extractSingleLogBaseSpec(landingEquation);
    const landingSolveEquation = normalizeEquationForPreviewSolve(landingEquation, landingLogBaseSpec);
    const landingViewModel = await solveViewModel(landingSolveEquation, targetVariable);

    const boundaryStep = deepClone(boundaryViewModel.steps?.[0] || {});
    const landingStep = decorateLandingStepLogBase(
        landingViewModel.steps?.[0] || {},
        landingLogBaseSpec?.baseText || ""
    );
    const boundarySingleStepViewModel = createSingleStepViewModel(boundaryViewModel, boundaryStep);
    const landingSingleStepViewModel = createSingleStepViewModel(landingViewModel, landingStep);
    const combinedVerticalViewModel = {
        steps: [boundaryStep, landingStep]
    };
    const verticalLayout = buildStepLayout(combinedVerticalViewModel, "standard");
    const boundaryPlacementLayout = createPlacedSingleStepLayout(verticalLayout, 0);
    const landingPlacementLayout = createPlacedSingleStepLayout(verticalLayout, 1);
    const boundarySemanticLayout = buildColumnLayout(boundarySingleStepViewModel, "standard");
    const landingSemanticLayout = buildColumnLayout(landingSingleStepViewModel, "standard");
    const boundaryDisplayLayout = buildDisplayColumnLayout(boundarySingleStepViewModel, "standard");
    const landingDisplayLayout = buildDisplayColumnLayout(landingSingleStepViewModel, "standard");
    const boundaryEqualsX = findEqualsAnchorX(boundaryStep, boundaryDisplayLayout);
    const landingEqualsX = findEqualsAnchorX(landingStep, landingDisplayLayout);
    const delta = Number.isFinite(boundaryEqualsX) && Number.isFinite(landingEqualsX)
        ? boundaryEqualsX - landingEqualsX
        : 0;
    const shiftedLandingDisplayLayout = shiftDisplayLayoutX(landingDisplayLayout, delta);
    const cleanNodes = [
        ...buildStepNodes(
            boundaryStep,
            0,
            boundaryPlacementLayout,
            boundarySemanticLayout,
            boundaryDisplayLayout,
            false,
            false,
            null,
            {
                powerInverseStyle: "root"
            }
        ),
        ...buildStepNodes(
            landingStep,
            0,
            landingPlacementLayout,
            landingSemanticLayout,
            shiftedLandingDisplayLayout,
            false,
            false,
            null,
            {
                powerInverseStyle: "root"
            }
        )
    ];

    const pdfPath = resolveOutputPath(boundaryEquation, outputPath);
    const outputDir = path.dirname(pdfPath);
    const texPath = pdfPath.replace(/\.pdf$/i, ".tex");

    fs.mkdirSync(outputDir, { recursive: true });

    const latex = buildLatexDocumentFromNodes({
        equation: `${boundaryEquation}  ->  ${landingEquation}`,
        targetVariable,
        cleanNodes,
        profile: "standard",
        profileName: "standard",
        profileLabel: "standard",
        includeDiagnosticPage: false
    });

    fs.writeFileSync(texPath, latex, "utf8");
    compilePdf(texPath, outputDir);

    console.log(`PDF geschrieben: ${pdfPath}`);
    console.log(`TeX geschrieben: ${texPath}`);
    console.log(`Boundary: ${boundaryEquation}`);
    console.log(`Landing: ${landingEquation}`);
    if (landingSolveEquation !== landingEquation) {
        console.log(`Landing-Solve-Normalform: ${landingSolveEquation}`);
        console.log(`Landing-Log-Basis: ${landingLogBaseSpec?.baseText || ""}`);
    }
    console.log(`Equals-Shift-Em: ${delta}`);
    console.log(`Boundary-Equals-Col: ${findEqualsAnchorCol(boundaryStep)}`);
    console.log(`Landing-Equals-Col: ${findEqualsAnchorCol(landingStep)}`);
}

await main();
