import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import GenesisCore from "../core/index.js";
import { normalizeSolveOptions } from "../core/solveOptions.js";
import {
    buildWorksheetViewModel,
    normalizeEquationInput,
    normalizeTargetVariableInput
} from "../presentation/adapters/index.js";
import { formatCellText } from "../components/Arbeitsblatt_Druckansicht/renderKernel.js";
import {
    defaultColumnLayoutProfileName,
    withHorizontalLayoutScale
} from "../presentation/column_layout/index.js";
import { buildLatexDocument } from "./export_projection_pdf_core/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../projects/complex_exponent_transition/real_bridge_handoff/index.js";
import {
    THEORY_CHILD_COLLECTION_KEYS,
    THEORY_CHILD_NODE_KEYS,
    formatTheoryNodeLabel
} from "../cockpit_user/adapters/theory_labels/index.js";
import { resolveCockpitRuntimeEnvironment } from "./cockpit_runtime_environment/index.mjs";
import {
    readJsonRequestBody,
    resolvePathWithinRoot
} from "./cockpit_http_boundary/index.mjs";
import {
    createPreviewWorkspace,
    pruneExpiredPreviewWorkspaces
} from "./cockpit_preview_workspace/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const previewDir = path.resolve(projectRoot, ".cockpit-preview");
const browserBundleBuildScript = path.resolve(__dirname, "build_browser_bundle.mjs");
const runtimeEnvironment = resolveCockpitRuntimeEnvironment();

const contentTypes = new Map([
    [".html", "text/html; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".png", "image/png"],
    [".pdf", "application/pdf"]
]);

const cockpitColorPalette = Object.freeze([
    Object.freeze({ key: "none", label: "Keine Farbe", value: "" }),
    Object.freeze({ key: "red", label: "Rot", value: "#B91C1C" }),
    Object.freeze({ key: "blue", label: "Blau", value: "#1D4ED8" }),
    Object.freeze({ key: "green", label: "Gruen", value: "#15803D" }),
    Object.freeze({ key: "orange", label: "Orange", value: "#D97706" }),
    Object.freeze({ key: "yellow", label: "Gelb", value: "#CA8A04" }),
    Object.freeze({ key: "black", label: "Schwarz", value: "#000000" })
]);

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    response.end(JSON.stringify(payload));
}

function sendFile(response, filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404);
        response.end("Nicht gefunden");
        return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const disableCache = [".html", ".css", ".js", ".png", ".pdf"].includes(extension);
    response.writeHead(200, {
        "Content-Type": contentTypes.get(extension) || "application/octet-stream",
        "Cache-Control": disableCache ? "no-store" : "no-cache"
    });

    fs.createReadStream(filePath).pipe(response);
}

function compilePdf(texPath, outputDir) {
    const result = spawnSync(
        runtimeEnvironment.pdflatexBinary,
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

function renderFirstPdfPageToPng(pdfPath, outputPrefix) {
    const result = spawnSync(
        runtimeEnvironment.pdftoppmBinary,
        ["-png", "-f", "1", "-singlefile", pdfPath, outputPrefix],
        {
            cwd: path.dirname(outputPrefix),
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "pdftoppm fehlgeschlagen.");
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

function ensureFreshBrowserBundle() {
    const result = spawnSync(
        process.execPath,
        [browserBundleBuildScript],
        {
            cwd: projectRoot,
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "Browser-Bundle konnte nicht gebaut werden.");
    }
}

function findColorValue(keyOrHex = "") {
    const normalized = String(keyOrHex || "").trim().toLowerCase();

    if (!normalized) {
        return "";
    }

    const paletteEntry = cockpitColorPalette.find((entry) => entry.key === normalized);
    if (paletteEntry) {
        return paletteEntry.value;
    }

    return keyOrHex;
}

function passiveExpressionTextFromAtoms(atoms = []) {
    return atoms
        .filter((atom) => atom?.projectionRole === "inverse_passive" && atom?.isVisible !== false)
        .map((atom) => formatCellText(atom))
        .filter(Boolean)
        .join(" ")
        .trim();
}

function expressionTextFromNodes(nodes = []) {
    return (Array.isArray(nodes) ? nodes : [])
        .filter(Boolean)
        .map((node) => formatTheoryNodeLabel(node))
        .filter(Boolean)
        .join(" ")
        .trim();
}

function walkTheoryNodes(nodes = [], visit) {
    const visitNode = typeof visit === "function" ? visit : null;
    if (!visitNode) {
        return;
    }

    const stack = Array.isArray(nodes) ? [...nodes] : [];

    while (stack.length > 0) {
        const current = stack.shift();
        if (!current) {
            continue;
        }

        if (current.isVisible === false) {
            continue;
        }

        visitNode(current);

        THEORY_CHILD_COLLECTION_KEYS.forEach((key) => {
            const children = Array.isArray(current?.[key]) ? current[key] : [];
            if (children.length > 0) {
                stack.unshift(...children);
            }
        });

        THEORY_CHILD_NODE_KEYS.forEach((key) => {
            if (current?.[key] && typeof current[key] === "object") {
                stack.unshift(current[key]);
            }
        });
    }
}

function collectTheoryNodeIds(nodes = []) {
    const ids = [];

    walkTheoryNodes(nodes, (node) => {
        if (node?.id) {
            ids.push(node.id);
        }
    });

    return ids;
}

function findTheoryNodesByIds(nodes = [], ids = []) {
    const normalizedIds = new Set((ids || []).filter(Boolean));
    if (normalizedIds.size === 0) {
        return [];
    }

    const matches = [];

    walkTheoryNodes(nodes, (node) => {
        if (node?.id && normalizedIds.has(node.id)) {
            matches.push(node);
        }
    });

    return matches;
}

function isAdditiveOperator(node) {
    return node?.type === "OPERATOR" && ["+", "-"].includes(String(node?.value || "").trim());
}

function splitAdditiveTerms(collection = []) {
    const nodes = Array.isArray(collection) ? collection.filter(Boolean) : [];
    const terms = [];
    let bodyStartIndex = 0;
    let signNode = null;
    let signSymbol = "+";

    nodes.forEach((node, index) => {
        if (!isAdditiveOperator(node)) {
            return;
        }

        const bodyNodes = nodes.slice(bodyStartIndex, index);
        if (bodyNodes.length > 0) {
            terms.push({
                signNode,
                signSymbol,
                bodyNodes,
                bodyIds: bodyNodes.map((bodyNode) => bodyNode?.id).filter(Boolean)
            });
        }

        signNode = node;
        signSymbol = String(node.value || "").trim() || "+";
        bodyStartIndex = index + 1;
    });

    const tailNodes = nodes.slice(bodyStartIndex);
    if (tailNodes.length > 0) {
        terms.push({
            signNode,
            signSymbol,
            bodyNodes: tailNodes,
            bodyIds: tailNodes.map((bodyNode) => bodyNode?.id).filter(Boolean)
        });
    }

    return terms;
}

function sameOrderedIds(left = [], right = []) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((value, index) => value === right[index]);
}

function findMatchingAdditiveTerm(collection = [], passiveExpressionIds = []) {
    const normalizedIds = (passiveExpressionIds || []).filter(Boolean);
    if (normalizedIds.length === 0) {
        return null;
    }

    const additiveTerms = splitAdditiveTerms(collection);

    return additiveTerms.find((term) => sameOrderedIds(term.bodyIds, normalizedIds))
        || additiveTerms.find((term) => normalizedIds.every((id) => term.bodyIds.includes(id)))
        || null;
}

function findSourceAdditiveTerm(theoryRow = null, strategy = {}) {
    const passiveExpressionIds = (strategy?.passiveExpressionIds || []).filter(Boolean);
    const sides = [
        { side: "left", collection: Array.isArray(theoryRow?.left) ? theoryRow.left : [] },
        { side: "right", collection: Array.isArray(theoryRow?.right) ? theoryRow.right : [] }
    ];

    for (const candidate of sides) {
        const matchingTerm = findMatchingAdditiveTerm(candidate.collection, passiveExpressionIds);
        if (matchingTerm) {
            return {
                side: candidate.side,
                term: matchingTerm
            };
        }
    }

    return null;
}

function resolveSourceAdditiveSignSymbol(sourceTerm = null) {
    if (sourceTerm?.signNode?.value === "-" || sourceTerm?.signNode?.value === "+") {
        return String(sourceTerm.signNode.value).trim();
    }

    if (sourceTerm?.bodyNodes?.length === 1 && sourceTerm.bodyNodes[0]?.type === "NEGATION") {
        return "-";
    }

    return "+";
}

function findGeneratedDivisionForStrategy(theoryRow = null, strategy = {}) {
    const passiveExpressionIds = (strategy?.passiveExpressionIds || []).filter(Boolean);
    if (passiveExpressionIds.length === 0) {
        return null;
    }

    const collections = [
        ...(Array.isArray(theoryRow?.left) ? theoryRow.left : []),
        ...(Array.isArray(theoryRow?.right) ? theoryRow.right : [])
    ];
    let matchingDivision = null;

    walkTheoryNodes(collections, (node) => {
        if (matchingDivision) {
            return;
        }

        if (node?.type !== "DIVISION" || node?.isGenerated !== true) {
            return;
        }

        if (String(node?.generatedByFamily || "").trim().toLowerCase() !== "fraction_birth") {
            return;
        }

        const originPassiveIds = (node?.originPassiveExpressionIds || []).filter(Boolean);
        if (sameOrderedIds(originPassiveIds, passiveExpressionIds)) {
            matchingDivision = node;
        }
    });

    return matchingDivision;
}

const shellLikeTypes = new Set([
    "GROUP",
    "FUNCTION",
    "ROOT",
    "POWER",
    "NEGATION",
    "DIVISION",
    "MULTIPLICATION",
    "ADDITION",
    "SUBTRACTION"
]);

const atomicTheoryNodeTypes = new Set([
    "VARIABLE",
    "NUMBER",
    "OPERATOR",
    "ANCHOR"
]);

function collectVisibleProjectionAtoms(step) {
    return Array.isArray(step?.positionedAtoms)
        ? step.positionedAtoms.filter((atom) => atom?.isVisible !== false)
        : [];
}

function appendSelector(selectors, selectorType, selectorValue) {
    const type = String(selectorType || "").trim();
    const value = String(selectorValue || "").trim();

    if (!type || !value) {
        return;
    }

    if (selectors.some((selector) => selector.selectorType === type && selector.selectorValue === value)) {
        return;
    }

    selectors.push({
        selectorType: type,
        selectorValue: value
    });
}

function appendModelIdSelectors(selectors, ids = [], options = {}) {
    const includeAtom = options.includeAtom !== false;
    const includeShell = options.includeShell !== false;

    (ids || []).forEach((id) => {
        if (!id) {
            return;
        }

        if (includeAtom) {
            appendSelector(selectors, "atom", id);
        }

        if (includeShell) {
            appendSelector(selectors, "shell-id", id);
        }
    });
}

function appendTheoryNodeSelectors(selectors, nodes = []) {
    walkTheoryNodes(nodes, (node) => {
        if (!node?.id) {
            return;
        }

        if (atomicTheoryNodeTypes.has(node.type)) {
            appendSelector(selectors, "atom", node.id);
            return;
        }

        if (shellLikeTypes.has(node.type)) {
            appendSelector(selectors, "shell-id", node.id);
        }
    });
}

function appendProjectionSelectors(selectors, atoms = [], predicate = null, options = {}) {
    const includeAtom = options.includeAtom !== false;
    const includeShell = options.includeShell === true;
    const resolvedPredicate = typeof predicate === "function" ? predicate : (() => true);

    (atoms || []).forEach((atom) => {
        if (!resolvedPredicate(atom)) {
            return;
        }

        if (includeAtom) {
            appendSelector(selectors, "atom", atom?.sourceAtomId || atom?.id || "");
        }

        if (includeShell && shellLikeTypes.has(atom?.type) && atom?.id) {
            appendSelector(selectors, "shell-id", atom.id);
        }
    });
}

function appendProjectionSourceSelectors(selectors, atoms = [], predicate = null, options = {}) {
    const includeAtom = options.includeAtom !== false;
    const includeShell = options.includeShell !== false;
    const resolvedPredicate = typeof predicate === "function" ? predicate : (() => true);

    (atoms || []).forEach((atom) => {
        if (!resolvedPredicate(atom)) {
            return;
        }

        if (includeAtom) {
            appendSelector(selectors, "atom", atom?.sourceAtomId || "");
        }

        if (includeShell) {
            appendSelector(selectors, "shell-id", atom?.sourceShellId || "");
        }
    });
}

function buildColorTarget(step, stepIndex, targetKind, previewLabel, selectors = []) {
    if (selectors.length === 0) {
        return null;
    }

    return {
        id: `step-${stepIndex}-${String(step?.strategy?.family || "transform").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        stepIndex,
        family: step?.strategy?.family || "transformation",
        stepLabel: `Zeile ${stepIndex + 1}`,
        targetKind,
        previewLabel,
        selectors
    };
}

function buildTargetVariableColorTarget(viewModel, targetVariable = "", projectionRows = []) {
    const normalizedTargetVariable = String(targetVariable || "").trim();

    if (!normalizedTargetVariable) {
        return null;
    }

    const selectors = [];

    (viewModel?.steps || []).forEach((step) => {
        (step?.cells || []).forEach((cell) => {
            if (cell?.isTarget !== true) {
                return;
            }

            const selectorIds = Array.isArray(cell?.representedSourceAtomIds) && cell.representedSourceAtomIds.length > 0
                ? cell.representedSourceAtomIds
                : [cell?.sourceAtomId || ""];

            selectorIds.forEach((id) => appendSelector(selectors, "atom", id));
        });
    });

    if (selectors.length === 0) {
        return null;
    }

    return {
        id: "target-variable",
        stepIndex: -1,
        family: "target_variable",
        stepLabel: "",
        targetKind: "target_variable",
        previewLabel: "Ziel",
        selectors
    };
}

function buildAdditiveStepTarget(step, stepIndex, theoryRow = null) {
    const strategy = step?.strategy || {};
    const visibleAtoms = collectVisibleProjectionAtoms(step);
    const selectors = [];
    const theoryCollections = [
        ...(Array.isArray(theoryRow?.left) ? theoryRow.left : []),
        ...(Array.isArray(theoryRow?.right) ? theoryRow.right : [])
    ];
    const passiveSourceNodes = findTheoryNodesByIds(
        theoryCollections,
        strategy.passiveExpressionIds || []
    );
    let generatedAdditiveShell = null;
    let generatedBindingGroup = null;

    walkTheoryNodes(theoryCollections, (node) => {
        if (
            !generatedAdditiveShell
            && ["ADDITION", "SUBTRACTION"].includes(node?.type)
            && node?.generatedByFamily === strategy.family
            && node?.originTargetId === strategy.targetId
        ) {
            generatedAdditiveShell = node;
        }

        if (
            !generatedBindingGroup
            && node?.type === "GROUP"
            && node?.generatedByFamily === strategy.family
            && node?.originTargetId === strategy.targetId
        ) {
            generatedBindingGroup = node;
        }
    });
    const currentInverseShell = visibleAtoms.find((atom) => (
        ["ADDITION", "SUBTRACTION"].includes(atom?.type)
        && atom?.visualMode === "INVERSE_SHELL"
        && String(atom?.id || "").startsWith(`generated-${String(strategy.family || "").trim().toLowerCase()}-`)
    ));
    const currentShellId = generatedAdditiveShell?.id || currentInverseShell?.id || null;
    const passiveAtoms = visibleAtoms.filter((atom) => (
        atom?.projectionRole === "inverse_passive"
        && (!currentShellId || atom?.sourceShellId === currentShellId)
    ));
    const operatorAtom = visibleAtoms.find((atom) => (
        atom?.projectionRole === "inverse_operator"
        && (!currentShellId || atom?.sourceShellId === currentShellId)
    ));
    const sourceAdditiveContext = findSourceAdditiveTerm(theoryRow, strategy);
    const sourceTerm = sourceAdditiveContext?.term || null;
    const rawPassiveText = expressionTextFromNodes(sourceTerm?.bodyNodes || [])
        || expressionTextFromNodes(passiveSourceNodes)
        || passiveExpressionTextFromAtoms(passiveAtoms)
        || "Term";
    const passiveRoot = sourceTerm?.bodyNodes?.[0] || passiveSourceNodes[0] || null;
    const passiveText = ["ADDITION", "SUBTRACTION"].includes(passiveRoot?.type)
        ? `(${rawPassiveText})`
        : rawPassiveText;
    const sourceOperatorText = resolveSourceAdditiveSignSymbol(sourceTerm);
    const inverseOperatorText = operatorAtom?.value || (strategy.inverseType === "ADDITION" ? "+" : "-");

    if (sourceTerm?.signNode?.id) {
        appendSelector(selectors, "atom", sourceTerm.signNode.id);
    }

    if (sourceTerm?.bodyNodes?.length > 0) {
        appendTheoryNodeSelectors(selectors, sourceTerm.bodyNodes);
    } else if (passiveSourceNodes.length > 0) {
        appendTheoryNodeSelectors(selectors, passiveSourceNodes);
    } else {
        appendModelIdSelectors(selectors, strategy.passiveExpressionIds || [], {
            includeAtom: true,
            includeShell: true
        });
    }

    if (generatedBindingGroup?.id) {
        appendSelector(selectors, "shell-id", generatedBindingGroup.id);
    }

    appendProjectionSelectors(selectors, visibleAtoms, (atom) => (
        (atom?.projectionRole === "inverse_operator" || atom?.projectionRole === "inverse_passive")
        && (!currentShellId || atom?.sourceShellId === currentShellId)
    ), {
        includeAtom: true,
        includeShell: false
    });

    return buildColorTarget(
        step,
        stepIndex,
        "additive_term",
        `${sourceOperatorText}${passiveText} -> ${inverseOperatorText}${passiveText}`,
        selectors
    );
}

function buildGroupReleaseTarget(step, stepIndex) {
    const strategy = step?.strategy || {};
    const visibleAtoms = collectVisibleProjectionAtoms(step);
    const selectors = [];

    appendModelIdSelectors(selectors, [
        strategy.targetId,
        ...(strategy.targetExpressionIds || [])
    ], {
        includeAtom: true,
        includeShell: true
    });

    appendProjectionSelectors(selectors, visibleAtoms, (atom) => (
        (strategy.targetExpressionIds || []).includes(atom?.sourceAtomId || atom?.id)
    ), {
        includeAtom: true,
        includeShell: true
    });

    return buildColorTarget(step, stepIndex, "group_release", "( ) -> Inhalt", selectors);
}

function buildNegativeSignTarget(step, stepIndex) {
    const strategy = step?.strategy || {};
    const visibleAtoms = collectVisibleProjectionAtoms(step);
    const selectors = [];
    const inverseNegationShell = visibleAtoms.find((atom) => atom?.type === "NEGATION" && atom?.visualMode === "INVERSE_SHELL");

    appendModelIdSelectors(selectors, [
        strategy.targetId,
        ...(strategy.targetExpressionIds || [])
    ], {
        includeAtom: true,
        includeShell: true
    });

    appendModelIdSelectors(selectors, [inverseNegationShell?.id], {
        includeAtom: true,
        includeShell: true
    });

    return buildColorTarget(step, stepIndex, "negation", "-( ) -> -( )", selectors);
}

function findGeneratedRootPowerShell(theoryRow = null, strategy = {}) {
    const collections = [
        ...(Array.isArray(theoryRow?.left) ? theoryRow.left : []),
        ...(Array.isArray(theoryRow?.right) ? theoryRow.right : [])
    ];
    let generatedShell = null;

    walkTheoryNodes(collections, (node) => {
        if (generatedShell) {
            return;
        }

        if (!node?.isGenerated || !["ROOT", "POWER"].includes(node?.type)) {
            return;
        }

        if (String(node?.generatedByFamily || "").trim().toLowerCase() !== "root_power") {
            return;
        }

        if (node?.originTargetId === strategy?.targetId) {
            generatedShell = node;
        }
    });

    return generatedShell;
}

function buildRootPowerTarget(step, stepIndex, theoryRow = null) {
    const strategy = step?.strategy || {};
    const selectors = [];
    const inverseShell = findGeneratedRootPowerShell(theoryRow, strategy);
    const previewLabel = strategy.sourceType === "ROOT"
        ? "sqrt( ) -> ( )^2"
        : "( )^2 -> sqrt( )";

    if (!inverseShell) {
        throw new Error(
            "Cockpit-Farbziel: root_power hat keine eindeutig erzeugte Gegenschale."
        );
    }

    appendModelIdSelectors(selectors, [strategy.targetId, inverseShell.id], {
        includeAtom: false,
        includeShell: true
    });

    return buildColorTarget(step, stepIndex, "shell", previewLabel, selectors);
}

function buildReciprocalFactorTarget(step, stepIndex, sourceTheoryRow = null, theoryRow = null) {
    const strategy = step?.strategy || {};
    const sourceCollections = [
        ...(Array.isArray(sourceTheoryRow?.left) ? sourceTheoryRow.left : []),
        ...(Array.isArray(sourceTheoryRow?.right) ? sourceTheoryRow.right : [])
    ];
    const passiveSourceNodes = findTheoryNodesByIds(
        sourceCollections,
        strategy.passiveExpressionIds || []
    );
    const sourceDivision = passiveSourceNodes.find((node) => node?.type === "DIVISION") || null;
    const generatedDivision = findGeneratedDivisionForStrategy(theoryRow, strategy);

    if (!sourceDivision || !generatedDivision) {
        throw new Error(
            "Cockpit-Farbziel: Der Core hat einen Kehrbruchfaktor angefordert, "
            + "aber Quell- oder Ergebnis-DIVISION fehlt."
        );
    }

    const selectors = [];
    const sourceNodes = [sourceDivision];
    const resultNodes = [generatedDivision];
    const sourceText = expressionTextFromNodes(sourceNodes);
    const resultText = expressionTextFromNodes(resultNodes);

    appendTheoryNodeSelectors(selectors, sourceNodes);
    appendTheoryNodeSelectors(selectors, resultNodes);

    return buildColorTarget(
        step,
        stepIndex,
        "reciprocal_factor",
        `${sourceText} -> ${resultText}`,
        selectors
    );
}

function buildFractionBirthTarget(step, stepIndex, theoryRow = null, sourceTheoryRow = null) {
    const strategy = step?.strategy || {};

    if (
        strategy.inverseMode === "reciprocal_factor"
        && strategy.passiveExpressionForm === "DIVISION"
    ) {
        return buildReciprocalFactorTarget(step, stepIndex, sourceTheoryRow, theoryRow);
    }

    const visibleAtoms = collectVisibleProjectionAtoms(step);
    const selectors = [];
    const generatedDivision = findGeneratedDivisionForStrategy(theoryRow, strategy);
    const denominatorSourceNodes = Array.isArray(generatedDivision?.denominator)
        ? generatedDivision.denominator
        : [];
    const denominatorSourceIds = collectTheoryNodeIds(denominatorSourceNodes);
    const denominatorAtoms = visibleAtoms.filter((atom) => (
        denominatorSourceIds.includes(atom?.sourceAtomId)
        || denominatorSourceIds.includes(atom?.sourceShellId)
    ));
    const denominatorText = expressionTextFromNodes(denominatorSourceNodes)
        || denominatorAtoms
        .map((atom) => atom?.text || atom?.value || formatCellText(atom))
        .filter(Boolean)
        .join(" ")
        .trim() || "Faktor";

    appendModelIdSelectors(selectors, [
        strategy.containerTargetId,
        strategy.operatorId,
        ...(strategy.operatorIds || []),
        ...(strategy.passiveExpressionIds || [])
    ], {
        includeAtom: true,
        includeShell: true
    });

    appendModelIdSelectors(selectors, denominatorSourceIds, {
        includeAtom: true,
        includeShell: true
    });

    appendProjectionSelectors(selectors, denominatorAtoms, null, {
        includeAtom: true,
        includeShell: true
    });

    return buildColorTarget(step, stepIndex, "fraction_denominator", `${denominatorText} -> Nenner`, selectors);
}

function buildFractionCollapseTarget(step, stepIndex, theoryRow = null) {
    const strategy = step?.strategy || {};
    const visibleAtoms = collectVisibleProjectionAtoms(step);
    const selectors = [];
    const sourceCollections = [
        ...(Array.isArray(theoryRow?.left) ? theoryRow.left : []),
        ...(Array.isArray(theoryRow?.right) ? theoryRow.right : [])
    ];
    const passiveSourceNodes = findTheoryNodesByIds(sourceCollections, strategy.passiveExpressionIds || []);
    const passiveSourceIds = collectTheoryNodeIds(passiveSourceNodes);
    const sourceShellIdSet = new Set(passiveSourceIds);
    const sourceAtomIdSet = new Set(passiveSourceIds);
    const generatedMultiplicationShellId = visibleAtoms.find((atom) => atom?.projectionRole === "product_operator")?.sourceShellId || null;
    const factorText = formatCellText(passiveSourceNodes[0])
        || expressionTextFromNodes(passiveSourceNodes)
        || visibleAtoms
            .filter((atom) => (
                sourceShellIdSet.has(atom?.sourceShellId)
                || sourceAtomIdSet.has(atom?.sourceAtomId)
            ))
            .map((atom) => atom?.text || atom?.value || formatCellText(atom))
            .filter(Boolean)
            .join(" ")
            .trim()
        || "Faktor";

    appendModelIdSelectors(selectors, [
        ...(strategy.passiveExpressionIds || [])
    ], {
        includeAtom: true,
        includeShell: true
    });

    appendTheoryNodeSelectors(selectors, passiveSourceNodes);

    appendModelIdSelectors(selectors, [generatedMultiplicationShellId], {
        includeAtom: true,
        includeShell: true
    });

    appendProjectionSourceSelectors(selectors, visibleAtoms, (atom) => (
        sourceShellIdSet.has(atom?.sourceShellId)
        || sourceAtomIdSet.has(atom?.sourceAtomId)
        || atom?.sourceShellId === generatedMultiplicationShellId
        || atom?.sourceAtomId === generatedMultiplicationShellId
    ), {
        includeAtom: true,
        includeShell: true
    });

    return buildColorTarget(step, stepIndex, "multiplicative_term", `/${factorText} -> *${factorText}`, selectors);
}

function buildFunctionInverseTarget(step, stepIndex, theoryRow = null) {
    const strategy = step?.strategy || {};
    const selectors = [];
    const theoryCollections = [
        ...(Array.isArray(theoryRow?.left) ? theoryRow.left : []),
        ...(Array.isArray(theoryRow?.right) ? theoryRow.right : [])
    ];
    let generatedInverseFunction = null;

    walkTheoryNodes(theoryCollections, (node) => {
        if (
            !generatedInverseFunction
            && node?.type === "FUNCTION"
            && node?.generatedByFamily === strategy.family
            && node?.originTargetId === strategy.targetId
        ) {
            generatedInverseFunction = node;
        }
    });
    const sourceName = strategy.sourceName || "f";
    const inverseName = strategy.inverseName || "g";

    if (!generatedInverseFunction?.id) {
        throw new Error(
            "Cockpit-Farbziel: Die Funktionsumkehr hat keine eindeutig erzeugte Gegenschale."
        );
    }

    appendModelIdSelectors(selectors, [strategy.targetId, generatedInverseFunction.id], {
        includeAtom: true,
        includeShell: false
    });

    return buildColorTarget(
        step,
        stepIndex,
        "function_shell",
        `${sourceName}( ) -> ${inverseName}( )`,
        selectors
    );
}

function buildGenericStepTarget(step, stepIndex) {
    const strategy = step?.strategy || {};
    const visibleAtoms = collectVisibleProjectionAtoms(step);
    const selectors = [];

    appendModelIdSelectors(selectors, [
        strategy.targetId,
        strategy.containerTargetId,
        strategy.operatorId,
        ...(strategy.operatorIds || []),
        ...(strategy.targetExpressionIds || []),
        ...(strategy.passiveExpressionIds || [])
    ], {
        includeAtom: true,
        includeShell: true
    });

    appendProjectionSelectors(selectors, visibleAtoms, (atom) => (
        atom?.visualMode === "INVERSE_SHELL" || Boolean(atom?.projectionRole)
    ), {
        includeAtom: true,
        includeShell: true
    });

    return buildColorTarget(
        step,
        stepIndex,
        "transformation",
        step?.strategy?.label || `Schritt ${stepIndex}`,
        selectors
    );
}

export function sanitizeHiddenStepIndexes(hiddenStepIndexes = [], totalStepCount = 0) {
    return [...new Set(
        (Array.isArray(hiddenStepIndexes) ? hiddenStepIndexes : [])
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value >= 0 && value < totalStepCount)
    )].sort((left, right) => left - right);
}

export function buildCockpitWorksheetViewModel(result = {}) {
    return buildWorksheetViewModel(result);
}

export function buildCanonicalCockpitSolveResult(result = {}, equation = "", targetVariable = "") {
    if (result?.bridgeMeta?.enabled === true) {
        return result;
    }

    const hasPowerExponentBoundary = (Array.isArray(result?.schritte) ? result.schritte : [])
        .some((step) => (
            step?.strategie?.family
            || step?.strategy?.family
            || step?.family
        ) === "power_exponent_release");

    if (!hasPowerExponentBoundary) {
        return result;
    }

    return buildBridgeWorksheetSolveResultFromSolveState(result, equation, targetVariable);
}

function normalizeTheoryNodeForCockpit(node, powerInverseStyle = "root") {
    if (Array.isArray(node)) {
        return node.map((entry) => normalizeTheoryNodeForCockpit(entry, powerInverseStyle));
    }

    if (!node || typeof node !== "object") {
        return node;
    }

    const clonedNode = { ...node };
    [
        "left",
        "right",
        "content",
        "baseContent",
        "passive",
        "factor",
        "numerator",
        "denominator",
        "exponentNodes"
    ].forEach((key) => {
        if (Array.isArray(clonedNode[key])) {
            clonedNode[key] = normalizeTheoryNodeForCockpit(clonedNode[key], powerInverseStyle);
        }
    });

    if (
        powerInverseStyle === "fractional-exponent"
        && clonedNode.type === "POWER"
        && clonedNode.generatedByFamily === "power_base_release"
    ) {
        clonedNode.generatedByFamily = null;
    }

    return clonedNode;
}

function formatCockpitTheoryNode(node, powerInverseStyle = "root") {
    const normalizedNode = normalizeTheoryNodeForCockpit(node, powerInverseStyle);
    return formatTheoryNodeLabel(normalizedNode);
}

function collectRowAtomLabels(step, theoryRow = null, options = {}) {
    const powerInverseStyle = options?.powerInverseStyle === "fractional-exponent"
        ? "fractional-exponent"
        : "root";
    const labelsFromTheoryRow = [];

    const appendTheoryNodes = (nodes = []) => {
        (Array.isArray(nodes) ? nodes : []).forEach((node) => {
            if (!node || node.isVisible === false) {
                return;
            }

            const label = String(formatCockpitTheoryNode(node, powerInverseStyle) || "").trim();
            if (label) {
                labelsFromTheoryRow.push(label);
            }
        });
    };

    appendTheoryNodes(theoryRow?.left);

    if (theoryRow?.anchor && theoryRow.anchor.isVisible !== false) {
        const anchorLabel = String(formatCockpitTheoryNode(theoryRow.anchor, powerInverseStyle) || "").trim();
        if (anchorLabel) {
            labelsFromTheoryRow.push(anchorLabel);
        }
    }

    appendTheoryNodes(theoryRow?.right);

    if (labelsFromTheoryRow.length > 0) {
        return labelsFromTheoryRow;
    }

    const labels = [];
    const seen = new Set();

    (step?.cells || []).forEach((cell) => {
        const label = String(cell?.text || "").trim();

        if (!label || label === "---") {
            return;
        }

        const key = `${cell?.row ?? 0}:${cell?.col ?? 0}:${label}`;
        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        labels.push(label);
    });

    return labels;
}

export function deriveRowTargets(viewModel, hiddenStepIndexes = [], theoryRows = [], options = {}) {
    const hiddenSet = new Set(hiddenStepIndexes);

    return (viewModel?.steps || []).map((step, stepIndex) => ({
        id: `row-${stepIndex}`,
        stepIndex,
        label: `Zeile ${stepIndex + 1}`,
        atoms: collectRowAtomLabels(step, theoryRows[stepIndex] || null, options),
        hidden: hiddenSet.has(stepIndex)
    }));
}

export function filterViewModelSteps(viewModel, hiddenStepIndexes = []) {
    const hiddenSet = new Set(hiddenStepIndexes);
    const maskedSteps = (viewModel?.steps || []).map((step, stepIndex) => ({
        ...step,
        hidden: hiddenSet.has(stepIndex)
    }));
    const diagnosticsSteps = Array.isArray(viewModel?.diagnostics?.steps)
        ? viewModel.diagnostics.steps.map((step) => ({
            ...step,
            hidden: hiddenSet.has(step?.stepIndex)
        }))
        : [];
    const layoutRows = Array.isArray(viewModel?.layout?.rows)
        ? viewModel.layout.rows.map((row) => ({
            ...row,
            hidden: hiddenSet.has(row?.stepIndex)
        }))
        : viewModel?.layout?.rows;

    return {
        ...viewModel,
        steps: maskedSteps,
        layout: viewModel?.layout
            ? {
                ...viewModel.layout,
                rows: layoutRows
            }
            : viewModel?.layout,
        diagnostics: viewModel?.diagnostics
            ? {
                ...viewModel.diagnostics,
                steps: diagnosticsSteps
            }
            : viewModel?.diagnostics
    };
}

export function deriveColorTargets(result, viewModel = null, hiddenStepIndexes = []) {
    const projectionRows = Array.isArray(result?.exportData?.projectionRows) ? result.exportData.projectionRows : [];
    const theoryRows = Array.isArray(result?.exportData?.outputContract?.theoryRows)
        ? result.exportData.outputContract.theoryRows
        : [];
    const hiddenSet = new Set(hiddenStepIndexes);
    const targets = [];

    projectionRows.forEach((step, stepIndex) => {
        if (stepIndex === 0 || hiddenSet.has(stepIndex)) {
            return;
        }

        const family = String(step?.strategy?.family || "").trim().toLowerCase();
        let target = null;

        if (["addition_release", "subtraction_release", "subtrahend_release"].includes(family)) {
            target = buildAdditiveStepTarget(step, stepIndex, theoryRows[stepIndex] || null);
        } else if (family === "group_release") {
            target = buildGroupReleaseTarget(step, stepIndex);
        } else if (family === "negative_sign_release") {
            target = buildNegativeSignTarget(step, stepIndex);
        } else if (family === "root_power") {
            target = buildRootPowerTarget(step, stepIndex, theoryRows[stepIndex] || null);
        } else if (family === "fraction_birth") {
            target = buildFractionBirthTarget(
                step,
                stepIndex,
                theoryRows[stepIndex] || null,
                theoryRows[stepIndex - 1] || null
            );
        } else if (["fraction_collapse", "fraction_denominator_release"].includes(family)) {
            target = buildFractionCollapseTarget(step, stepIndex, theoryRows[stepIndex] || null);
        } else if (["trig_inverse", "inverse_trig"].includes(family)) {
            target = buildFunctionInverseTarget(step, stepIndex, theoryRows[stepIndex] || null);
        } else {
            target = buildGenericStepTarget(step, stepIndex);
        }

        if (target) {
            targets.push(target);
        }
    });

    const targetVariableColorTarget = buildTargetVariableColorTarget(viewModel, result?.targetVariable || "", projectionRows);

    return targetVariableColorTarget
        ? [targetVariableColorTarget, ...targets]
        : targets;
}

function buildShellColorPolicyFromSelections(colorTargets = [], componentColors = {}) {
    const ruleSpecs = [];

    colorTargets.forEach((target) => {
        const selected = findColorValue(componentColors?.[target.id] || "");
        if (!selected) {
            return;
        }

        (target.selectors || []).forEach((selector) => {
            if (!selector?.selectorType || !selector?.selectorValue) {
                return;
            }

            ruleSpecs.push(`${selector.selectorType}:${selector.selectorValue}=${selected}`);
        });
    });

    if (ruleSpecs.length === 0) {
        return null;
    }

    return {
        fallback: "none",
        ruleSpec: ruleSpecs.join(";")
    };
}

function sanitizeComponentColors(colorTargets = [], componentColors = {}) {
    const allowedIds = new Set(colorTargets.map((target) => target.id));
    const sanitized = {};

    Object.entries(componentColors || {}).forEach(([key, value]) => {
        if (!allowedIds.has(key)) {
            return;
        }

        const resolved = findColorValue(value);
        if (!resolved) {
            return;
        }

        sanitized[key] = resolved;
    });

    return sanitized;
}

async function renderPreview(
    rawEquation,
    rawTargetVariable,
    rawRuntimeEngine,
    componentColors = {},
    hiddenStepIndexes = [],
    rawPowerInverseStyle = "root"
) {
    const normalizedEquation = normalizeEquationInput(String(rawEquation || "").trim());
    const targetVariable = normalizeTargetVariableInput(String(rawTargetVariable || "").trim());
    const runtimeEngine = String(rawRuntimeEngine || "").trim() || "genesis_runtime";
    const powerInverseStyle = rawPowerInverseStyle === "fractional-exponent"
        ? "fractional-exponent"
        : "root";

    if (!normalizedEquation.normalized) {
        throw new Error("Bitte zuerst eine Gleichung eingeben.");
    }

    const solveOptions = normalizeSolveOptions({
        targetVariable,
        runtimeEngine
    });

    const coreResult = await GenesisCore.solve(normalizedEquation.normalized, solveOptions);
    if (coreResult?.fehler) {
        throw new Error(coreResult.fehler);
    }
    const result = buildCanonicalCockpitSolveResult(
        coreResult,
        normalizedEquation.normalized,
        targetVariable
    );

    const viewModel = buildCockpitWorksheetViewModel(result);
    const sanitizedHiddenStepIndexes = sanitizeHiddenStepIndexes(hiddenStepIndexes, viewModel.steps.length);
    const filteredViewModel = filterViewModelSteps(viewModel, sanitizedHiddenStepIndexes);

    if ((viewModel.steps || []).length > 0 && sanitizedHiddenStepIndexes.length >= viewModel.steps.length) {
        throw new Error("Mindestens eine Zeile muss sichtbar bleiben.");
    }

    const rowTargets = deriveRowTargets(
        viewModel,
        sanitizedHiddenStepIndexes,
        result?.exportData?.outputContract?.theoryRows || [],
        {
            powerInverseStyle
        }
    );
    const colorTargets = deriveColorTargets(result, filteredViewModel, sanitizedHiddenStepIndexes);
    const appliedComponentColors = sanitizeComponentColors(colorTargets, componentColors);
    const shellColorPolicy = buildShellColorPolicyFromSelections(colorTargets, appliedComponentColors);
    const resolvedProfile = withHorizontalLayoutScale(defaultColumnLayoutProfileName, 1);
    const workspace = createPreviewWorkspace(previewDir);
    pruneExpiredPreviewWorkspaces(previewDir, { preserveIds: [workspace.id] });

    fs.writeFileSync(
        workspace.texPath,
        buildLatexDocument({
            equation: result.eingabe || normalizedEquation.normalized,
            targetVariable: result.targetVariable || targetVariable || null,
            viewModel: filteredViewModel,
            profile: resolvedProfile,
            profileLabel: defaultColumnLayoutProfileName,
            shellColors: Boolean(shellColorPolicy),
            shellColorPolicy,
            powerInverseStyle
        }),
        "utf8"
    );

    compilePdf(workspace.texPath, workspace.directory);
    renderFirstPdfPageToPng(workspace.pdfPath, workspace.pngPrefix);
    cleanupAuxiliaryFiles(workspace.directory, "current");

    if (!fs.existsSync(workspace.pngPath)) {
        throw new Error("Die Vorschau konnte nicht erzeugt werden.");
    }

    return {
        equation: normalizedEquation.normalized,
        targetVariable: result.targetVariable || targetVariable || "",
        runtimeEngine: solveOptions.runtimeEngine || "",
        previewUrl: `/preview/${workspace.id}/current.png`,
        pdfUrl: `/preview/${workspace.id}/current.pdf`,
        colorTargets: colorTargets.map((target) => ({
            id: target.id,
            stepIndex: target.stepIndex,
            family: target.family,
            stepLabel: target.stepLabel,
            targetKind: target.targetKind,
            previewLabel: target.previewLabel
        })),
        rowTargets,
        hiddenStepIndexes: sanitizedHiddenStepIndexes,
        powerInverseStyle,
        colorPalette: cockpitColorPalette.map((entry) => ({
            key: entry.key,
            label: entry.label,
            value: entry.value
        })),
        componentColors: appliedComponentColors
    };
}

function resolveStaticPath(urlPathname) {
    const safePath = urlPathname === "/" ? "index.html" : urlPathname;
    return resolvePathWithinRoot(projectRoot, safePath);
}

ensureFreshBrowserBundle();

const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

    if (request.method === "GET" && requestUrl.pathname === "/healthz") {
        sendJson(response, 200, { status: "ok" });
        return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/render") {
        try {
            const body = await readJsonRequestBody(request);
            const payload = await renderPreview(
                body.equation,
                body.targetVariable,
                body.runtimeEngine,
                body.componentColors || {},
                body.hiddenStepIndexes || [],
                body.powerInverseStyle || "root"
            );
            sendJson(response, 200, payload);
        } catch (error) {
            sendJson(response, Number(error?.statusCode) || 400, {
                fehler: error instanceof Error ? error.message : String(error)
            });
        }
        return;
    }

    if (request.method === "GET" && requestUrl.pathname.startsWith("/preview/")) {
        try {
            const previewPath = resolvePathWithinRoot(
                previewDir,
                requestUrl.pathname.slice("/preview/".length)
            );
            sendFile(response, previewPath);
        } catch {
            response.writeHead(404);
            response.end("Nicht gefunden");
        }
        return;
    }

    if (request.method === "GET") {
        try {
            const filePath = resolveStaticPath(requestUrl.pathname);
            sendFile(response, filePath);
        } catch {
            response.writeHead(404);
            response.end("Nicht gefunden");
        }
        return;
    }

    response.writeHead(405);
    response.end("Methode nicht erlaubt");
});

const isDirectRun = typeof process?.argv?.[1] === "string"
    && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
    server.listen(runtimeEnvironment.port, runtimeEnvironment.host, () => {
        console.log(
            `Cockpit-Server laeuft auf http://${runtimeEnvironment.host}:${runtimeEnvironment.port}/`
        );
    });
}
