import {
    collectShellColorEntriesFromViewModel,
    normalizeShellColorPolicy,
    resolveElementColorForCell,
    resolveElementColorForNode
} from "../../presentation/shell_colors/index.js";
import { resolveFunctionNotation } from "../../components/Arbeitsblatt_Druckansicht/functionNotation.js";
import { resolveGreekLatexCommand } from "../../components/Arbeitsblatt_Druckansicht/greekSymbols.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";

const DEFAULT_SLOT_WIDTH_EM = 1.06;
const DEFAULT_ROW_HEIGHT_EM = 1.18;
const DEFAULT_AXIS_ROW_HEIGHT_EM = 0.92;
const DEFAULT_STEP_GAP_EM = 1.15;
const DEFAULT_ROW_PADDING_EM = 0.08;
const MAIN_FRACTION_OVERSHOOT_EM = 0.12;
const SECONDARY_FRACTION_OVERSHOOT_EM = 0.08;
const MAIN_FRACTION_LINE_WIDTH_PT = 0.45;
const SECONDARY_FRACTION_LINE_WIDTH_PT = 0.32;
const PAREN_LINE_WIDTH_PT = 0.45;
const ROOT_LINE_WIDTH_PT = 0.45;

function formatEm(value = 0) {
    const rounded = Math.round(Number(value || 0) * 1000) / 1000;
    return String(rounded).replace(/0+$/u, "").replace(/\.$/u, "") || "0";
}

function formatPt(value = 0) {
    const rounded = Math.round(Number(value || 0) * 1000) / 1000;
    return String(rounded).replace(/0+$/u, "").replace(/\.$/u, "") || "0";
}

function escapeLatexMathAtom(text) {
    const greek = resolveGreekLatexCommand(text);
    if (greek) {
        return greek;
    }

    if (text === "*" || text === "·") {
        return "\\cdot{}";
    }

    return String(text || "")
        .replace(/\\/g, "\\backslash ")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/_/g, "\\_")
        .replace(/%/g, "\\%")
        .replace(/&/g, "\\&")
        .replace(/#/g, "\\#")
        .replace(/\$/g, "\\$");
}

function escapeLatexText(text) {
    return String(text || "")
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\$/g, "\\$")
        .replace(/&/g, "\\&")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/%/g, "\\%")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}");
}

function wrapMathColor(latex = "", colorName = null) {
    if (!colorName || !latex) {
        return latex;
    }

    return `\\textcolor{${colorName}}{${latex}}`;
}

function resolveFunctionHeadLatex(name = "f", baseText = "") {
    const notation = resolveFunctionNotation(name, baseText);

    switch (notation.latexVariant) {
        case "ln":
            return "\\ln";
        case "lg":
            return "\\operatorname{lg}";
        case "log":
            return "\\log";
        case "log_with_base":
            return `\\log_{${escapeLatexMathAtom(notation.normalizedBaseText)}}`;
        default:
            if (notation.renderBaseArgument && notation.normalizedBaseText) {
                return `\\operatorname{${escapeLatexText(notation.renderLabel)}}_{${escapeLatexMathAtom(notation.normalizedBaseText)}}`;
            }

            return `\\operatorname{${escapeLatexText(notation.renderLabel)}}`;
    }
}

function renderNodeToLatex(node, policy = null, inheritedColorName = null) {
    if (!node) {
        return "";
    }

    const ownColor = resolveElementColorForNode(node, policy)?.latexColorName || inheritedColorName || null;

    switch (node.type) {
        case "text":
            return wrapMathColor(
                escapeLatexMathAtom(node.text || ""),
                ownColor
            );
        case "sequence":
            return (node.items || [])
                .map((item) => renderNodeToLatex(item, policy, ownColor))
                .filter(Boolean)
                .join("");
        case "group":
            return `${wrapMathColor("\\left(", ownColor)}${renderNodeToLatex(node.content, policy, ownColor)}${wrapMathColor("\\right)", ownColor)}`;
        case "function":
            return `${wrapMathColor(resolveFunctionHeadLatex(node.name || "f", node.baseText || ""), ownColor)}${wrapMathColor("\\left(", ownColor)}${renderNodeToLatex(node.argument, policy, ownColor)}${wrapMathColor("\\right)", ownColor)}`;
        case "root":
            if (node.degreeText) {
                return wrapMathColor(`\\sqrt[${escapeLatexMathAtom(node.degreeText)}]{${renderNodeToLatex(node.content, policy, ownColor)}}`, ownColor);
            }

            return wrapMathColor(`\\sqrt{${renderNodeToLatex(node.content, policy, ownColor)}}`, ownColor);
        case "power": {
            const baseLatex = renderNodeToLatex(node.base, policy, ownColor);
            const exponentLatex = node.exponentNode
                ? renderNodeToLatex(node.exponentNode, policy, ownColor)
                : escapeLatexMathAtom(node.exponent || "2");
            return `{${baseLatex}}^{${exponentLatex}}`;
        }
        case "negation":
            return `${wrapMathColor("-", ownColor)}${renderNodeToLatex(node.content, policy, ownColor)}`;
        case "multiplication": {
            const separator = typeof node.separator === "string" && node.separator.length > 0
                ? wrapMathColor(node.separator === "·" ? "\\cdot{}" : escapeLatexMathAtom(node.separator), ownColor)
                : "";
            return `${renderNodeToLatex(node.left, policy, ownColor)}${separator}${renderNodeToLatex(node.right, policy, ownColor)}`;
        }
        case "fraction":
            return `\\frac{${renderNodeToLatex(node.numerator, policy, ownColor)}}{${renderNodeToLatex(node.denominator, policy, ownColor)}}`;
        default:
            return "";
    }
}

function resolveCellLatex(cell, policy = null) {
    const inheritedColorName = resolveElementColorForCell(cell, policy)?.latexColorName || null;

    if (cell?.renderNode) {
        return renderNodeToLatex(cell.renderNode, policy, inheritedColorName);
    }

    return wrapMathColor(
        escapeLatexMathAtom(cell?.text || ""),
        inheritedColorName
    );
}

function buildRowMetrics(viewModel) {
    const rows = Array.isArray(viewModel?.layout?.rows) ? viewModel.layout.rows : [];
    const metrics = [];
    let cursor = 0;

    rows.forEach((row, index) => {
        const baseHeight = row?.kind === "step_gap"
            ? DEFAULT_STEP_GAP_EM
            : row?.kind === "axis"
                ? DEFAULT_AXIS_ROW_HEIGHT_EM
                : DEFAULT_ROW_HEIGHT_EM;
        const rowHeight = row?.kind === "step_gap"
            ? Math.max(baseHeight, Number(row?.minHeightEm) || 0)
            : Math.max(baseHeight, Number(row?.minHeightEm) || 0) + DEFAULT_ROW_PADDING_EM;
        const top = cursor;
        const bottom = cursor + rowHeight;
        const center = (top + bottom) / 2;

        metrics[index] = {
            top,
            bottom,
            center,
            height: rowHeight,
            kind: row?.kind || "axis",
            hidden: row?.hidden === true
        };

        cursor = bottom;
    });

    return {
        rows: metrics,
        totalHeight: cursor
    };
}

function buildColumnMetrics(viewModel, slotWidthEm = DEFAULT_SLOT_WIDTH_EM) {
    const columnCount = Math.max(1, Number(viewModel?.columnCount) || 1);
    const starts = [];
    const ends = [];

    for (let index = 0; index < columnCount; index += 1) {
        starts[index] = index * slotWidthEm;
        ends[index] = (index + 1) * slotWidthEm;
    }

    return {
        slotWidthEm,
        totalWidth: columnCount * slotWidthEm,
        start(col) {
            return starts[Math.max(0, Math.min(columnCount - 1, col))];
        },
        end(col) {
            return ends[Math.max(0, Math.min(columnCount - 1, col))];
        }
    };
}

function buildColumnMetricsFromDisplayLayout(displayLayout, fallbackSlotWidthEm = DEFAULT_SLOT_WIDTH_EM) {
    const slots = Array.isArray(displayLayout?.slots) ? displayLayout.slots : [];

    if (slots.length === 0) {
        return buildColumnMetrics(displayLayout, fallbackSlotWidthEm);
    }

    const starts = Array.isArray(displayLayout?.starts) ? displayLayout.starts : [];
    const totalWidth = Number.isFinite(displayLayout?.totalWidth) ? displayLayout.totalWidth : slots.reduce(
        (sum, slot) => sum + Math.max(0, Number(slot?.width) || 0),
        0
    );

    return {
        slotWidthEm: null,
        totalWidth,
        start(col) {
            const index = Math.max(0, Math.min(slots.length - 1, Number(col) || 0));
            return Number(starts[index]) || 0;
        },
        end(col) {
            const index = Math.max(0, Math.min(slots.length - 1, Number(col) || 0));
            const start = Number(starts[index]) || 0;
            const width = Math.max(0, Number(slots[index]?.width) || 0);
            return start + width;
        }
    };
}

function remapSemanticColToDisplaySlot(displayLayout, col) {
    if (!Number.isInteger(col)) {
        return col;
    }

    const slotIndex = displayLayout?.semanticToSlotIndex?.[col];
    return Number.isInteger(slotIndex) ? slotIndex : col;
}

function toDisplayCell(item, displayLayout) {
    const cell = item?.cell || {};

    return {
        ...cell,
        semanticColStart: cell?.colStart,
        semanticColEnd: cell?.colEnd,
        colStart: Number.isInteger(item?.displayStartSlot) ? item.displayStartSlot : cell?.colStart,
        colEnd: Number.isInteger(item?.displayEndSlot) ? item.displayEndSlot : cell?.colEnd,
        shellContentColStart: Number.isInteger(item?.displayShellContentStartSlot)
            ? item.displayShellContentStartSlot
            : remapSemanticColToDisplaySlot(displayLayout, cell?.shellContentColStart),
        shellContentColEnd: Number.isInteger(item?.displayShellContentEndSlot)
            ? item.displayShellContentEndSlot
            : remapSemanticColToDisplaySlot(displayLayout, cell?.shellContentColEnd)
    };
}

function cellBandLeft(cell, columns) {
    return columns.start(Number(cell?.colStart) || 0);
}

function cellBandRight(cell, columns) {
    return columns.end(Number(cell?.colEnd) || Number(cell?.colStart) || 0);
}

function cellBandCenter(cell, columns) {
    return (cellBandLeft(cell, columns) + cellBandRight(cell, columns)) / 2;
}

function hasVisibleCompositeFractionChildren(cell, stepCells = []) {
    if (cell?.projectionRole !== "closed_visible_shell" || cell?.renderNode?.type !== "fraction") {
        return false;
    }

    return stepCells.some((candidate) => (
        candidate !== cell
        && candidate?.kind === "fraction_line"
        && candidate?.colStart === cell?.colStart
        && candidate?.colEnd === cell?.colEnd
    ));
}

function resolveStepCells(step = null, allCells = []) {
    const stepIndex = Number(step?.stepIndex);

    return allCells.filter((cell) => cell?.stepIndex === stepIndex);
}

function shellContainsCell(candidate = null, shellId = "") {
    if (!candidate || typeof shellId !== "string" || shellId.length === 0) {
        return false;
    }

    if (candidate.sourceShellId === shellId) {
        return true;
    }

    const visibleAncestors = Array.isArray(candidate.visibleAncestorShells) ? candidate.visibleAncestorShells : [];
    return visibleAncestors.some((entry) => entry?.shellId === shellId);
}

function findFunctionArgumentBounds(cell, stepCells, rowMetrics) {
    const explicitTopRow = Number.isInteger(cell?.coreShellContentRowStart)
        ? cell.coreShellContentRowStart
        : (Number.isInteger(cell?.shellContentRowStart) ? cell.shellContentRowStart : null);
    const explicitBottomRow = Number.isInteger(cell?.coreShellContentRowEnd)
        ? cell.coreShellContentRowEnd
        : (Number.isInteger(cell?.shellContentRowEnd) ? cell.shellContentRowEnd : null);

    if (Number.isInteger(explicitTopRow) && Number.isInteger(explicitBottomRow)) {
        return {
            top: rowMetrics.rows[explicitTopRow]?.top || 0,
            bottom: rowMetrics.rows[explicitBottomRow]?.bottom || 0
        };
    }

    const shellId = typeof cell?.sourceShellId === "string" ? cell.sourceShellId : "";
    const contentColStart = Number.isInteger(cell?.shellContentColStart) ? cell.shellContentColStart : cell?.colStart;
    const contentColEnd = Number.isInteger(cell?.shellContentColEnd) ? cell.shellContentColEnd : cell?.colEnd;

    const relevantCells = stepCells.filter((candidate) => (
        candidate !== cell
        && candidate?.stepIndex === cell?.stepIndex
        && shellContainsCell(candidate, shellId)
        && Number(candidate?.colStart) <= contentColEnd
        && Number(candidate?.colEnd) >= contentColStart
        && candidate?.projectionRole !== "function_name"
        && candidate?.projectionRole !== "function_left"
        && candidate?.projectionRole !== "function_right"
    ));

    if (relevantCells.length === 0) {
        const selfRow = rowMetrics.rows[cell.row];
        return {
            top: selfRow?.top || 0,
            bottom: selfRow?.bottom || 0
        };
    }

    const minRow = Math.min(...relevantCells.map((candidate) => Number(candidate?.rowSpanStart ?? candidate?.row ?? 0)));
    const maxRow = Math.max(...relevantCells.map((candidate) => Number(candidate?.rowSpanEnd ?? candidate?.row ?? 0)));

    return {
        top: rowMetrics.rows[minRow]?.top || 0,
        bottom: rowMetrics.rows[maxRow]?.bottom || 0
    };
}

function buildLeftParenPath(x, top, bottom) {
    const mid = (top + bottom) / 2;
    const pinch = x - 0.32;
    const edge = x + 0.22;

    return `(${formatEm(edge)},${formatEm(-top)}) .. controls (${formatEm(pinch)},${formatEm(-((top + mid) / 2))}) and (${formatEm(pinch)},${formatEm(-((mid + bottom) / 2))}) .. (${formatEm(edge)},${formatEm(-bottom)})`;
}

function buildRightParenPath(x, top, bottom) {
    const mid = (top + bottom) / 2;
    const pinch = x + 0.32;
    const edge = x - 0.22;

    return `(${formatEm(edge)},${formatEm(-top)}) .. controls (${formatEm(pinch)},${formatEm(-((top + mid) / 2))}) and (${formatEm(pinch)},${formatEm(-((mid + bottom) / 2))}) .. (${formatEm(edge)},${formatEm(-bottom)})`;
}

function resolveFractionNestingDepth(cell = null) {
    const visibleAncestors = Array.isArray(cell?.visibleAncestorShells) ? cell.visibleAncestorShells : [];

    return visibleAncestors.filter((entry) => entry?.shellType === "DIVISION").length;
}

function resolveFractionLineWidthPt(cell = null) {
    return resolveFractionNestingDepth(cell) > 0
        ? SECONDARY_FRACTION_LINE_WIDTH_PT
        : MAIN_FRACTION_LINE_WIDTH_PT;
}

function resolveFractionOvershootEm(cell = null) {
    return resolveFractionNestingDepth(cell) > 0
        ? SECONDARY_FRACTION_OVERSHOOT_EM
        : MAIN_FRACTION_OVERSHOOT_EM;
}

function buildFractionLineCommand(cell, columns, rowMetrics, policy = null) {
    const row = rowMetrics.rows[cell.row];
    const color = resolveElementColorForCell(cell, policy)?.latexColorName || "black";
    const overshootEm = resolveFractionOvershootEm(cell);
    const startX = cellBandLeft(cell, columns) - overshootEm;
    const endX = cellBandRight(cell, columns) + overshootEm;
    const lineWidthPt = resolveFractionLineWidthPt(cell);

    return `\\draw[line width=${formatPt(lineWidthPt)}pt, color=${color}] (${formatEm(startX)},${formatEm(-row.center)}) -- (${formatEm(endX)},${formatEm(-row.center)});`;
}

function buildTextCellCommand(cell, columns, rowMetrics, policy = null) {
    const latex = resolveCellLatex(cell, policy);

    if (!latex) {
        return "";
    }

    const x = cellBandCenter(cell, columns);
    const row = rowMetrics.rows[cell.row];

    return `\\node[inner sep=0pt, outer sep=0pt, anchor=center] at (${formatEm(x)},${formatEm(-row.center)}) {$${latex}$};`;
}

function findPowerBaseBounds(cell, rowMetrics) {
    const topRowIndex = Number.isInteger(cell?.rowSpanStart) ? cell.rowSpanStart : cell?.row;
    const bottomRowIndex = Number.isInteger(cell?.rowSpanEnd) ? cell.rowSpanEnd : cell?.row;

    return {
        top: rowMetrics.rows[topRowIndex]?.top || 0,
        bottom: rowMetrics.rows[bottomRowIndex]?.bottom || 0
    };
}

function buildShellDelimiterCommand(cell, columns, rowMetrics, stepCells, policy = null) {
    const x = cellBandCenter(cell, columns);
    const isPowerDelimiter = cell.projectionRole === "power_left" || cell.projectionRole === "power_right";
    const bounds = isPowerDelimiter
        ? findPowerBaseBounds(cell, rowMetrics)
        : findFunctionArgumentBounds(cell, stepCells, rowMetrics);
    const color = resolveElementColorForCell(cell, policy)?.latexColorName || "black";
    const path = cell.projectionRole === "function_left" || cell.projectionRole === "power_left"
        ? buildLeftParenPath(x, bounds.top, bounds.bottom)
        : buildRightParenPath(x, bounds.top, bounds.bottom);

    return `\\draw[line width=${formatPt(PAREN_LINE_WIDTH_PT)}pt, color=${color}] ${path};`;
}

function buildRootHookCommand(cell, columns, rowMetrics, policy = null) {
    const leftX = cellBandLeft(cell, columns);
    const rightX = cellBandRight(cell, columns);
    const width = Math.max(0.01, rightX - leftX);
    const topRowIndex = Number.isInteger(cell?.shellContentRowStart)
        ? cell.shellContentRowStart
        : Number(cell?.row ?? 0);
    const bottomRowIndex = Number.isInteger(cell?.shellContentRowEnd)
        ? cell.shellContentRowEnd
        : Number(cell?.row ?? 0);
    const topY = rowMetrics.rows[topRowIndex]?.center ?? rowMetrics.rows[cell.row]?.top ?? 0;
    const bottomY = Math.max(
        topY + 0.22,
        (rowMetrics.rows[bottomRowIndex]?.bottom ?? rowMetrics.rows[cell.row]?.bottom ?? topY + 0.22) - 0.02
    );
    const hookStartY = topY + Math.max(0.14, (bottomY - topY) * 0.52);
    const hookStartX = leftX + width * 0.08;
    const hookTipX = leftX + width * 0.34;
    const hookRiseX = rightX;
    const color = resolveElementColorForCell(cell, policy)?.latexColorName || "black";

    return `\\draw[line width=${formatPt(ROOT_LINE_WIDTH_PT)}pt, color=${color}] (${formatEm(hookStartX)},${formatEm(-hookStartY)}) -- (${formatEm(hookTipX)},${formatEm(-bottomY)}) -- (${formatEm(hookRiseX)},${formatEm(-topY)});`;
}

function buildRootOverbarCommand(cell, columns, rowMetrics, policy = null) {
    const row = rowMetrics.rows[cell.row];
    const color = resolveElementColorForCell(cell, policy)?.latexColorName || "black";

    return `\\draw[line width=${formatPt(ROOT_LINE_WIDTH_PT)}pt, color=${color}] (${formatEm(cellBandLeft(cell, columns))},${formatEm(-row.center)}) -- (${formatEm(cellBandRight(cell, columns))},${formatEm(-row.center)});`;
}

function buildStepCommands(step, allCells, columns, rowMetrics, policy = null) {
    const stepCells = resolveStepCells(step, allCells)
        .filter((cell) => !hasVisibleCompositeFractionChildren(cell, resolveStepCells(step, allCells)))
        .sort((left, right) => {
            if ((left?.row ?? 0) !== (right?.row ?? 0)) {
                return (left?.row ?? 0) - (right?.row ?? 0);
            }

            if ((left?.colStart ?? 0) !== (right?.colStart ?? 0)) {
                return (left?.colStart ?? 0) - (right?.colStart ?? 0);
            }

            return String(left?.projectionRole || "").localeCompare(String(right?.projectionRole || ""));
        });

    const commands = [];

    stepCells.forEach((cell) => {
        if (cell?.kind === "fraction_line") {
            commands.push(buildFractionLineCommand(cell, columns, rowMetrics, policy));
            return;
        }

        if (cell?.projectionRole === "root_hook") {
            commands.push(buildRootHookCommand(cell, columns, rowMetrics, policy));
            return;
        }

        if (cell?.projectionRole === "root_overbar") {
            commands.push(buildRootOverbarCommand(cell, columns, rowMetrics, policy));
            return;
        }

        if (["function_left", "function_right", "power_left", "power_right"].includes(cell?.projectionRole)) {
            commands.push(buildShellDelimiterCommand(cell, columns, rowMetrics, stepCells, policy));
            return;
        }

        commands.push(buildTextCellCommand(cell, columns, rowMetrics, policy));
    });

    const body = commands.filter(Boolean).join("\n");

    if (step?.hidden === true) {
        return `\\begin{scope}[opacity=0]\n${body}\n\\end{scope}`;
    }

    return body;
}

function buildColorDefinitions(viewModel, shellColorPolicy = null) {
    const entries = collectShellColorEntriesFromViewModel(viewModel, shellColorPolicy);

    return entries
        .map((entry) => `\\definecolor{${entry.latexColorName}}{HTML}{${entry.latexHex}}`)
        .join("\n");
}

function buildPictureBody(viewModel, shellColorPolicy = null) {
    const normalizedPolicy = normalizeShellColorPolicy(shellColorPolicy);
    const rowMetrics = buildRowMetrics(viewModel);
    const displayModel = buildWorksheetDisplayModel(viewModel);
    const columns = buildColumnMetricsFromDisplayLayout(displayModel?.displayLayout);
    const allCells = Array.isArray(displayModel?.items)
        ? displayModel.items.map((item) => toDisplayCell(item, displayModel.displayLayout))
        : (Array.isArray(viewModel?.layout?.cells)
            ? viewModel.layout.cells
            : (viewModel?.steps || []).flatMap((step, stepIndex) => (step.cells || []).map((cell) => ({ ...cell, stepIndex }))));
    const steps = (viewModel?.steps || []).map((step, stepIndex) => ({ ...step, stepIndex }));
    const pictureHeight = rowMetrics.totalHeight;
    const pictureWidth = columns.totalWidth;

    const commands = steps
        .map((step) => buildStepCommands(step, allCells, columns, rowMetrics, normalizedPolicy))
        .filter(Boolean)
        .join("\n");

    return {
        pictureWidth,
        pictureHeight,
        commands
    };
}

export function buildStepNodes(viewModel = null) {
    return Array.isArray(viewModel?.steps)
        ? viewModel.steps.map((step, stepIndex) => ({
            stepIndex,
            hidden: step?.hidden === true,
            cells: Array.isArray(step?.cells) ? step.cells.map((cell) => ({ ...cell })) : []
        }))
        : [];
}

export function buildLatexDocumentFromNodes({
    viewModel,
    shellColorPolicy = null
} = {}) {
    return buildLatexDocument({
        viewModel,
        shellColorPolicy
    });
}

export function buildLatexDocument({
    equation = "",
    targetVariable = "",
    viewModel = null,
    shellColors = false,
    shellColorPolicy = null,
    showDocumentHeader = false
} = {}) {
    const safeViewModel = viewModel || {
        equation,
        targetVariable,
        columnCount: 1,
        steps: [],
        layout: {
            rows: [],
            cells: []
        }
    };
    const { pictureWidth, pictureHeight, commands } = buildPictureBody(
        safeViewModel,
        shellColors ? shellColorPolicy : null
    );
    const colorDefinitions = shellColors ? buildColorDefinitions(safeViewModel, shellColorPolicy) : "";
    const header = showDocumentHeader
        ? `\\node[anchor=west] at (0, ${formatEm(1.2)}) {\\small ${escapeLatexText(equation || "")} \\quad Ziel: ${escapeLatexText(targetVariable || "")}};`
        : "";

    return [
        "\\documentclass[tikz,border=10pt]{standalone}",
        "\\usepackage[T1]{fontenc}",
        "\\usepackage[utf8]{inputenc}",
        "\\usepackage{amsmath,amssymb}",
        "\\usepackage{xcolor}",
        "\\usepackage{tikz}",
        colorDefinitions,
        "\\begin{document}",
        `\\begin{tikzpicture}[x=1em,y=1em]`,
        `\\path[use as bounding box] (${formatEm(-0.8)},${formatEm(0.8)}) rectangle (${formatEm(pictureWidth + 0.8)},${formatEm(-(pictureHeight + 0.8))});`,
        header,
        commands,
        "\\end{tikzpicture}",
        "\\end{document}",
        ""
    ].filter(Boolean).join("\n");
}
