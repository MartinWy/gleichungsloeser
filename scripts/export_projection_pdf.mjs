import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import GenesisCore from "../core/index.js";
import { normalizeSolveOptions } from "../core/solveOptions.js";
import {
    buildWorksheetViewModel,
    normalizeEquationInput,
    normalizeTargetVariableInput
} from "../presentation/adapters/index.js";
import {
    defaultColumnLayoutProfileName,
    withHorizontalLayoutScale
} from "../presentation/column_layout/index.js";
import { buildLatexDocument } from "./export_projection_pdf_core/index.js";

export {
    buildColumnLayout,
    cloneColumnLayoutProfile,
    defaultColumnLayoutProfileName,
    defaultColumnLayoutProfile,
    getColumnLayoutProfile,
    listColumnLayoutProfiles,
    resolveColumnLayoutProfile,
    withHorizontalLayoutScale
} from "../presentation/column_layout/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function printUsage() {
    console.error("Verwendung: node scripts/export_projection_pdf.mjs \"a*x+3=5\" [--target x] [--runtime-engine genesis_runtime] [--profile standard|kompakt|lesefreundlich] [--scale 3] [--right-side-factor-placement suffix|prefix] [--shell-colors] [--shell-color-kinds root,power] [--shell-color-hex D97706] [--color-rules \"shell:root=orange;function:sin=teal\"] [--output Projektstand/pdf/datei.pdf]");
}

function parseCommaSeparatedList(value) {
    if (typeof value !== "string") {
        return null;
    }

    const items = value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    return items.length > 0 ? [...new Set(items)] : null;
}

function buildShellColorPolicy(shellColorKinds = null, shellColorHex = null, colorRules = null) {
    const includeKinds = parseCommaSeparatedList(shellColorKinds);
    const defaultHex = typeof shellColorHex === "string" && shellColorHex.trim().length > 0
        ? shellColorHex.trim()
        : null;
    const ruleSpec = typeof colorRules === "string" && colorRules.trim().length > 0
        ? colorRules.trim()
        : null;

    if (!includeKinds && !defaultHex && !ruleSpec) {
        return null;
    }

    return {
        includeKinds,
        defaultHex,
        ruleSpec,
        fallback: defaultHex ? "none" : "palette"
    };
}

function parseArgs(argv) {
    const args = [...argv];
    let equation = null;
    let targetVariable = null;
    let runtimeEngine = null;
    let outputPath = null;
    let profileName = null;
    let horizontalScale = 1;
    let rightSideFactorPlacement = null;
    let shellColors = false;
    let shellColorKinds = null;
    let shellColorHex = null;
    let colorRules = null;

    while (args.length > 0) {
        const token = args.shift();

        if (!token) {
            continue;
        }

        if (token === "--target") {
            targetVariable = args.shift() || null;
            continue;
        }

        if (token === "--output") {
            outputPath = args.shift() || null;
            continue;
        }

        if (token === "--runtime-engine") {
            runtimeEngine = args.shift() || null;
            continue;
        }

        if (token === "--profile") {
            profileName = args.shift() || null;
            continue;
        }

        if (token === "--scale") {
            horizontalScale = Number(args.shift() || 1);
            continue;
        }

        if (token === "--right-side-factor-placement") {
            rightSideFactorPlacement = args.shift() || null;
            continue;
        }

        if (token === "--shell-colors") {
            shellColors = true;
            continue;
        }

        if (token === "--shell-color-kinds") {
            shellColorKinds = args.shift() || null;
            continue;
        }

        if (token === "--shell-color-hex") {
            shellColorHex = args.shift() || null;
            continue;
        }

        if (token === "--color-rules") {
            colorRules = args.shift() || null;
            continue;
        }

        if (!equation) {
            equation = token;
        }
    }

    return {
        equation,
        targetVariable,
        runtimeEngine,
        outputPath,
        profileName,
        horizontalScale,
        rightSideFactorPlacement,
        shellColors,
        shellColorKinds,
        shellColorHex,
        colorRules
    };
}

function sanitizeFileName(input) {
    return input
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase() || "gleichung";
}

function resolveOutputPath(equation, targetVariable, explicitOutputPath) {
    if (explicitOutputPath) {
        return path.resolve(projectRoot, explicitOutputPath);
    }

    const baseName = sanitizeFileName(`${equation}__${targetVariable || "auto"}__spaltentreu_latex_p4fixed`);
    return path.resolve(projectRoot, "Projektstand", "pdf", `${baseName}.pdf`);
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

function cleanupAuxiliaryFiles(outputDir, baseName) {
    [`${baseName}.aux`, `${baseName}.log`].forEach((fileName) => {
        const filePath = path.resolve(outputDir, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
}

async function main() {
    const {
        equation,
        targetVariable,
        runtimeEngine,
        outputPath,
        profileName,
        horizontalScale,
        rightSideFactorPlacement,
        shellColors,
        shellColorKinds,
        shellColorHex,
        colorRules
    } = parseArgs(process.argv.slice(2));

    if (!equation) {
        printUsage();
        process.exit(1);
    }

    if (!Number.isFinite(horizontalScale) || horizontalScale <= 0) {
        console.error("Die horizontale Skalierung muss eine positive Zahl sein.");
        process.exit(1);
    }

    const normalizedEquation = normalizeEquationInput(equation);
    const normalizedTargetVariable = normalizeTargetVariableInput(targetVariable);
    const solveOptions = normalizeSolveOptions({
        targetVariable: normalizedTargetVariable,
        runtimeEngine
    });

    if (typeof rightSideFactorPlacement === "string" && rightSideFactorPlacement.trim().length > 0) {
        solveOptions.rightSideFactorPlacement = rightSideFactorPlacement.trim().toLowerCase();
    }

    const result = await GenesisCore.solve(
        normalizedEquation.normalized,
        solveOptions
    );

    if (result?.fehler) {
        console.error(`Kernfehler: ${result.fehler}`);
        process.exit(1);
    }

    const viewModel = buildWorksheetViewModel(result);
    const pdfPath = resolveOutputPath(equation, normalizedTargetVariable, outputPath);
    const outputDir = path.dirname(pdfPath);
    const baseName = path.basename(pdfPath, ".pdf");
    const texPath = path.resolve(outputDir, `${baseName}.tex`);
    const resolvedProfileName = profileName || defaultColumnLayoutProfileName;
    const resolvedProfile = withHorizontalLayoutScale(resolvedProfileName, horizontalScale);
    const profileLabel = horizontalScale === 1
        ? resolvedProfileName
        : `${resolvedProfileName} @${horizontalScale}x`;
    const shellColorPolicy = buildShellColorPolicy(shellColorKinds, shellColorHex, colorRules);
    const shellColorsEnabled = shellColors || Boolean(shellColorPolicy);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
        texPath,
        buildLatexDocument({
            equation: result.eingabe || normalizedEquation.normalized,
            targetVariable: result.targetVariable || normalizedTargetVariable || null,
            viewModel,
            profile: resolvedProfile,
            profileLabel,
            shellColors: shellColorsEnabled,
            shellColorPolicy
        }),
        "utf8"
    );

    compilePdf(texPath, outputDir);
    cleanupAuxiliaryFiles(outputDir, baseName);

    console.log(`PDF geschrieben: ${pdfPath}`);
    console.log(`TeX geschrieben: ${texPath}`);
}

function isDirectExecution() {
    return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isDirectExecution()) {
    main().catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    });
}
