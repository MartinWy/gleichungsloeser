import {
    buildDisplayColumnLayout,
    buildColumnLayout,
    defaultColumnLayoutProfileName,
    displaySlotBoundaryX,
    displaySlotCenterX,
    displaySlotWidth,
    functionLeftSlotIndex,
    functionNameSlotIndex,
    functionRightSlotIndex,
    groupLeftSlotIndex,
    groupRightSlotIndex,
    powerLeftSlotIndex,
    powerRightSlotIndex,
    rootLeadSlotIndex,
    functionLeftBoundaryX,
    functionLeftWidth,
    functionNameBoundaryX,
    functionNameWidth,
    functionRightBoundaryX,
    functionRightWidth,
    groupLeftBoundaryX,
    groupLeftWidth,
    groupRightBoundaryX,
    groupRightWidth,
    powerLeftBoundaryX,
    powerLeftWidth,
    powerRightBoundaryX,
    powerRightWidth,
    rootLeadBoundaryX,
    rootLeadWidth,
    resolveCellSemanticBounds,
    resolveCellDisplaySlotBounds,
    semanticColumnBoundaryX,
    semanticColumnCenterX,
    semanticSpanCenterX
} from "../../presentation/column_layout/index.js";
import { decomposeVisibleShells, needsPowerParens } from "../../presentation/render_kernel/index.js";
import {
    columnWidthFor,
    escapeLatexMathAtom,
    escapeLatexText,
    fallbackCellWidthEm,
    formatEm,
    hasCellSpan,
    hiddenColumnWidthEm,
    p4Cell,
    spanWidth,
    widthsForSpan
} from "./shared.js";
import { resolveGreekLatexCommand } from "../../components/Arbeitsblatt_Druckansicht/greekSymbols.js";
import { buildRenderNode, formatCellText } from "../../components/Arbeitsblatt_Druckansicht/renderKernel.js";
import { resolveFunctionNotation } from "../../components/Arbeitsblatt_Druckansicht/functionNotation.js";
import { buildStepLayout } from "./stepLayout.js";
import {
    collectShellColorEntriesFromViewModel,
    resolveElementColorForCell,
    resolveElementColorForNode,
    resolveShellColor,
    resolveShellColorForNode
} from "../../presentation/shell_colors/index.js";

function resolveFractionDisplayGap(profile = {}) {
    const numeratorGapEm = Number(profile?.fractionDisplayEm?.numeratorGapEm);
    const denominatorGapEm = Number(profile?.fractionDisplayEm?.denominatorGapEm);

    return {
        numeratorGapEm: Number.isFinite(numeratorGapEm) && numeratorGapEm >= 0 ? numeratorGapEm : 0.14,
        denominatorGapEm: Number.isFinite(denominatorGapEm) && denominatorGapEm >= 0 ? denominatorGapEm : 0.18
    };
}

function formatHeaderInlineText(text) {
    const tokens = String(text || "").match(/[A-Za-z]+|[^A-Za-z]+/g) || [];

    return tokens.map((token) => {
        const greekCommand = resolveGreekLatexCommand(token);
        if (greekCommand) {
            return `\\ensuremath{${greekCommand}}`;
        }

        return `\\texttt{${escapeLatexText(token)}}`;
    }).join("");
}

function cellDisplayLeftBoundaryX(cell, displayLayout) {
    const { semanticStart } = resolveCellSemanticBounds(cell);

    if (cell?.renderNode?.type === "root") {
        return rootLeadBoundaryX(displayLayout, semanticStart, "left");
    }

    if (cell?.renderNode?.type === "function") {
        const nameLeft = functionNameWidth(displayLayout, semanticStart) > 0
            ? functionNameBoundaryX(displayLayout, semanticStart, "left")
            : null;
        const parenLeft = functionLeftWidth(displayLayout, semanticStart) > 0
            ? functionLeftBoundaryX(displayLayout, semanticStart, "left")
            : null;
        return nameLeft ?? parenLeft ?? semanticColumnBoundaryX(displayLayout, semanticStart, "left");
    }

    if (cell?.renderNode?.type === "group") {
        return groupLeftBoundaryX(displayLayout, semanticStart, "left");
    }

    if (isWrappedPowerCell(cell)) {
        return powerLeftBoundaryX(displayLayout, semanticStart, "left");
    }

    return semanticColumnBoundaryX(displayLayout, semanticStart, "left");
}

function cellDisplayRightBoundaryX(cell, displayLayout) {
    const { semanticEnd } = resolveCellSemanticBounds(cell);

    if (cell?.renderNode?.type === "function") {
        return functionRightBoundaryX(displayLayout, semanticEnd, "right");
    }

    if (cell?.renderNode?.type === "group") {
        return groupRightBoundaryX(displayLayout, semanticEnd, "right");
    }

    if (isWrappedPowerCell(cell)) {
        return powerRightBoundaryX(displayLayout, semanticEnd, "right");
    }

    return semanticColumnBoundaryX(displayLayout, semanticEnd, "right");
}

function cellDisplayWidth(cell, displayLayout) {
    return Math.max(0, cellDisplayRightBoundaryX(cell, displayLayout) - cellDisplayLeftBoundaryX(cell, displayLayout));
}

function rootShellWidth(cell, semanticLayout, displayLayout) {
    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);

    return rootLeadWidth(displayLayout, semanticStart) + spanWidth(semanticLayout, semanticStart, semanticEnd);
}

function visibleRootDisplayBounds(cell, displayLayout) {
    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);

    return {
        left: rootLeadBoundaryX(displayLayout, semanticStart, "left"),
        right: semanticColumnBoundaryX(displayLayout, semanticEnd, "right")
    };
}

function hasVisibleRootCore(cell) {
    if (!cell?.renderNode) {
        return false;
    }

    const shellModel = decomposeVisibleShells(cell.renderNode);
    return shellModel.coreNode?.type === "root";
}

function isWrappedPowerCell(cell) {
    return cell?.renderNode?.type === "power" && needsPowerParens(cell.renderNode.base);
}

function cellAnchorX(cell, displayLayout) {
    const projectionFragmentCenter = resolveProjectionFragmentDisplayCenterX(cell, displayLayout);
    if (Number.isFinite(projectionFragmentCenter)) {
        return projectionFragmentCenter;
    }

    if (hasVisibleRootCore(cell)) {
        const bounds = visibleRootDisplayBounds(cell, displayLayout);
        return bounds.left + ((bounds.right - bounds.left) / 2);
    }

    if (isWrappedPowerCell(cell) || cell?.renderNode?.type === "group" || cell?.renderNode?.type === "function") {
        const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);
        return semanticSpanCenterX(displayLayout, semanticStart, semanticEnd);
    }

    if (hasCellSpan(cell)) {
        return cellDisplayLeftBoundaryX(cell, displayLayout) + (cellDisplayWidth(cell, displayLayout) / 2);
    }

    return semanticColumnCenterX(displayLayout, cell?.col ?? 0);
}

function resolveProjectionFragmentShellCarrierBounds(cell) {
    // Projection fragments such as function names or delimiters keep the
    // semantic column they were assigned by the core. Shell metadata describes
    // surrounding spans, but must not pull the fragment back onto the shell
    // content column, otherwise independent atoms collapse onto one position.
    return resolveCellSemanticBounds(cell);
}

function resolveProjectionFragmentDisplayCenterX(cell, displayLayout) {
    if (!cell || !displayLayout) {
        return null;
    }

    const { semanticStart, semanticEnd } = resolveProjectionFragmentShellCarrierBounds(cell);

    switch (cell?.projectionRole) {
        case "function_name":
            return (
                functionNameBoundaryX(displayLayout, semanticStart, "left")
                + functionNameBoundaryX(displayLayout, semanticStart, "right")
            ) / 2;
        case "function_left":
            return (
                functionLeftBoundaryX(displayLayout, semanticStart, "left")
                + functionLeftBoundaryX(displayLayout, semanticStart, "right")
            ) / 2;
        case "function_right":
            return (
                functionRightBoundaryX(displayLayout, semanticEnd, "left")
                + functionRightBoundaryX(displayLayout, semanticEnd, "right")
            ) / 2;
        case "group_left":
            return (
                groupLeftBoundaryX(displayLayout, semanticStart, "left")
                + groupLeftBoundaryX(displayLayout, semanticStart, "right")
            ) / 2;
        case "group_right":
            return (
                groupRightBoundaryX(displayLayout, semanticEnd, "left")
                + groupRightBoundaryX(displayLayout, semanticEnd, "right")
            ) / 2;
        default:
            return null;
    }
}

function resolveProjectionFragmentDisplayWidth(cell, semanticLayout = null, displayLayout = null) {
    if (!cell) {
        return 0;
    }

    const { semanticStart, semanticEnd } = resolveProjectionFragmentShellCarrierBounds(cell);

    switch (cell?.projectionRole) {
        case "function_name": {
            const displayWidth = displayLayout ? functionNameWidth(displayLayout, semanticStart) : 0;
            return displayWidth > 0 ? displayWidth : columnWidthFor(semanticLayout, semanticStart);
        }
        case "function_left": {
            const displayWidth = displayLayout ? functionLeftWidth(displayLayout, semanticStart) : 0;
            return displayWidth > 0 ? displayWidth : columnWidthFor(semanticLayout, semanticStart);
        }
        case "function_right": {
            const displayWidth = displayLayout ? functionRightWidth(displayLayout, semanticEnd) : 0;
            return displayWidth > 0 ? displayWidth : columnWidthFor(semanticLayout, semanticEnd);
        }
        case "group_left": {
            const displayWidth = displayLayout ? groupLeftWidth(displayLayout, semanticStart) : 0;
            return displayWidth > 0 ? displayWidth : columnWidthFor(semanticLayout, semanticStart);
        }
        case "group_right": {
            const displayWidth = displayLayout ? groupRightWidth(displayLayout, semanticEnd) : 0;
            return displayWidth > 0 ? displayWidth : columnWidthFor(semanticLayout, semanticEnd);
        }
        default:
            return 0;
    }
}

function belongsToVisibleShell(cell, shellId = "") {
    if (!cell || typeof shellId !== "string" || shellId.length === 0) {
        return false;
    }

    if (cell?.sourceShellId === shellId || cell?.sourceAtomId === shellId) {
        return true;
    }

    return Array.isArray(cell?.visibleAncestorShells)
        && cell.visibleAncestorShells.some((descriptor) => descriptor?.shellId === shellId);
}

function resolveSingleBlockFractionChildAnchorX(cell, displayLayout, stepCells = []) {
    if (
        !cell
        || cell?.rowKind === "axis"
        || cell?.sourceShellNodeType !== "DIVISION"
        || typeof cell?.sourceShellId !== "string"
        || cell.sourceShellId.length === 0
    ) {
        return null;
    }

    const shellId = cell.sourceShellId;
    const memberCells = (Array.isArray(stepCells) ? stepCells : []).filter((stepCell) => belongsToVisibleShell(stepCell, shellId));

    if (memberCells.length === 0) {
        return null;
    }

    const nonLineRowMembers = memberCells.filter((stepCell) => (
        stepCell?.kind !== "fraction_line"
        && stepCell?.row === cell.row
    ));

    if (nonLineRowMembers.length !== 1 || nonLineRowMembers[0]?.id !== cell.id) {
        return null;
    }

    const semanticBounds = memberCells.map((memberCell) => resolveCellSemanticBounds(memberCell));
    const semanticStart = semanticBounds.reduce(
        (min, bounds) => Math.min(min, bounds.semanticStart),
        semanticBounds[0]?.semanticStart ?? (cell?.colStart ?? cell?.col ?? 0)
    );
    const semanticEnd = semanticBounds.reduce(
        (max, bounds) => Math.max(max, bounds.semanticEnd),
        semanticBounds[0]?.semanticEnd ?? (cell?.colEnd ?? cell?.col ?? semanticStart)
    );

    return semanticSpanCenterX(displayLayout, semanticStart, semanticEnd);
}

function cellAnchorY(cell, baseY = 0) {
    const shiftYEm = Number(cell?.cellMetrics?.shiftYEm);
    return baseY + (Number.isFinite(shiftYEm) ? shiftYEm : 0);
}

function normalizeSemanticSpan(start, end) {
    const normalizedStart = Number.isInteger(start) ? start : 0;
    const normalizedEnd = Number.isInteger(end) ? end : normalizedStart;

    return {
        semanticStart: Math.min(normalizedStart, normalizedEnd),
        semanticEnd: Math.max(normalizedStart, normalizedEnd)
    };
}

function hasProjectedShellContentSpan(cell = null) {
    return Number.isInteger(cell?.shellContentColStart)
        && Number.isInteger(cell?.shellContentColEnd);
}

function resolveProjectedShellContentBounds(cell = null) {
    const outerBounds = resolveCellSemanticBounds(cell);

    if (!hasProjectedShellContentSpan(cell)) {
        return outerBounds;
    }

    const { semanticStart, semanticEnd } = normalizeSemanticSpan(
        cell?.shellContentColStart,
        cell?.shellContentColEnd
    );

    return {
        semanticStart,
        semanticEnd,
        semanticSpanCount: Math.max(1, semanticEnd - semanticStart + 1)
    };
}

function resolveProjectedFractionChildBounds(cell = null, childKey = "numerator") {
    const range = cell?.shellCollectionRanges?.[childKey] || null;

    if (!range) {
        return null;
    }

    const rawStart = Number.isInteger(range?.colStart) ? range.colStart : range?.rawColStart;
    const rawEnd = Number.isInteger(range?.colEnd) ? range.colEnd : range?.rawColEnd;

    if (!Number.isInteger(rawStart) || !Number.isInteger(rawEnd)) {
        return null;
    }

    const { semanticStart, semanticEnd } = normalizeSemanticSpan(rawStart, rawEnd);

    return {
        semanticStart,
        semanticEnd,
        semanticSpanCount: Math.max(1, semanticEnd - semanticStart + 1)
    };
}

function hasProjectedFractionChildBounds(cell = null) {
    return Boolean(resolveProjectedFractionChildBounds(cell, "numerator"))
        && Boolean(resolveProjectedFractionChildBounds(cell, "denominator"));
}

function cellUsesGeneratedFractionProjection(cell = null) {
    if (cell?.sourceShellNode?.generatedByFamily) {
        return true;
    }

    const sourceAtomId = typeof cell?.sourceAtomId === "string" ? cell.sourceAtomId : "";
    const sourceShellId = typeof cell?.sourceShellId === "string" ? cell.sourceShellId : "";

    return sourceAtomId.startsWith("generated-") || sourceShellId.startsWith("generated-");
}

function renderIdentityMatchesClosedChromeShell(cell = null) {
    const renderNodeType = cell?.renderNode?.type || null;

    if (!["function", "group", "power"].includes(renderNodeType)) {
        return false;
    }

    const renderIdentityKeys = renderNodeIdentityKeys(cell.renderNode);

    if (renderIdentityKeys.size === 0) {
        return false;
    }

    return [cell?.sourceAtomId, cell?.sourceShellId]
        .filter((value) => typeof value === "string" && value.length > 0)
        .some((value) => renderIdentityKeys.has(value));
}

function cellRequiresStructuredShellProjection(cell = null, options = {}) {
    if (!renderIdentityMatchesClosedChromeShell(cell) || !hasProjectedShellContentSpan(cell)) {
        return false;
    }

    const shellModel = decomposeVisibleShells(cell?.renderNode, resolveRenderOptions(options));
    const coreNode = shellModel?.coreNode || null;

    return cell?.renderNode?.layout?.containsFraction === true
        || coreNode?.type === "fraction"
        || coreNode?.layout?.containsFraction === true;
}

function buildProjectedCoreCell(cell = null, options = {}) {
    if (!cellRequiresStructuredShellProjection(cell, options)) {
        return cell;
    }

    const coreContentStart = Number.isInteger(cell?.coreShellContentColStart)
        ? cell.coreShellContentColStart
        : null;
    const coreContentEnd = Number.isInteger(cell?.coreShellContentColEnd)
        ? cell.coreShellContentColEnd
        : null;
    const { semanticStart, semanticEnd } = coreContentStart !== null && coreContentEnd !== null
        ? normalizeSemanticSpan(coreContentStart, coreContentEnd)
        : resolveProjectedShellContentBounds(cell);
    const shellModel = decomposeVisibleShells(cell?.renderNode, resolveRenderOptions(options));
    const coreNode = shellModel?.coreNode || null;

    return {
        ...cell,
        renderNode: coreNode,
        sourceAtomId: cell?.coreShellSourceAtomId || coreNode?.sourceAtomId || cell?.sourceAtomId || null,
        sourceShellId: cell?.coreShellSourceShellId || coreNode?.shellId || coreNode?.sourceShellId || cell?.sourceShellId || null,
        shellContentColStart: coreContentStart ?? semanticStart,
        shellContentColEnd: coreContentEnd ?? semanticEnd,
        shellAlignmentColStart: Number.isInteger(cell?.coreShellAlignmentColStart)
            ? cell.coreShellAlignmentColStart
            : semanticStart,
        shellAlignmentColEnd: Number.isInteger(cell?.coreShellAlignmentColEnd)
            ? cell.coreShellAlignmentColEnd
            : semanticEnd,
        shellCollectionRanges: cell?.coreShellCollectionRanges || null,
        col: semanticStart,
        colStart: semanticStart,
        colEnd: semanticEnd
    };
}

function resolveProjectedCoreDisplayBounds(cell, displayLayout, stepIndex = 0, options = {}) {
    const projectedCoreCell = buildProjectedCoreCell(cell, options);
    return resolveDisplaySlotBounds(projectedCoreCell, displayLayout, stepIndex, options);
}

function resolveAxisRowBaselineY(step, baseY = 0, stepHeight = 0, rowIndex = null) {
    const rowMetrics = Array.isArray(step?.rowMetrics) ? step.rowMetrics : [];
    const resolvedRowIndex = Number.isInteger(rowIndex)
        ? rowIndex
        : rowMetrics.findIndex((metric) => metric?.kind === "axis");
    const axisMetric = resolvedRowIndex >= 0 ? rowMetrics[resolvedRowIndex] : null;

    if (!axisMetric || typeof axisMetric.axisBottomReserveEm !== "number") {
        return baseY;
    }

    const stepTop = baseY - (Math.max(0, stepHeight || 0) / 2);
    const rowBottom = stepTop + rowMetrics
        .slice(0, resolvedRowIndex + 1)
        .reduce((sum, metric) => sum + (metric?.minHeightEm || 0), 0);

    return rowBottom - axisMetric.axisBottomReserveEm;
}

function resolveStepRowBounds(step, baseY = 0, stepHeight = 0, rowIndex = 0) {
    const rowMetrics = Array.isArray(step?.rowMetrics) ? step.rowMetrics : [];
    const safeRowIndex = Number.isInteger(rowIndex) ? rowIndex : 0;
    const stepTop = baseY - (Math.max(0, stepHeight || 0) / 2);
    const rowTop = stepTop + rowMetrics
        .slice(0, safeRowIndex)
        .reduce((sum, metric) => sum + (metric?.minHeightEm || 0), 0);
    const rowHeight = rowMetrics[safeRowIndex]?.minHeightEm || 0;

    return {
        top: rowTop,
        bottom: rowTop + rowHeight,
        height: rowHeight
    };
}

function resolveStepCellAnchorY(step, cell, baseY = 0, stepHeight = 0) {
    if (cell?.rowKind === "axis") {
        return resolveAxisRowBaselineY(step, baseY, stepHeight, cell?.row);
    }

    if (!Number.isInteger(cell?.row)) {
        return cellAnchorY(cell, baseY);
    }

    const rowBounds = resolveStepRowBounds(step, baseY, stepHeight, cell.row);
    const axisExtents = resolveCellAxisExtents(cell);

    if (cell?.rowKind === "above_axis") {
        return rowBounds.bottom - axisExtents.axisBelowEm;
    }

    if (cell?.rowKind === "below_axis") {
        return rowBounds.top + axisExtents.axisAboveEm;
    }

    return cellAnchorY(cell, baseY);
}

function latexFunctionName(name, baseText = "") {
    const functionNotation = resolveFunctionNotation(name, baseText);
    const functionNames = {
        sin: "\\sin",
        cos: "\\cos",
        tan: "\\tan",
        asin: "\\operatorname{asin}",
        acos: "\\operatorname{acos}",
        atan: "\\operatorname{atan}",
        ln: "\\ln",
        log: "\\log"
    };

    switch (functionNotation.latexVariant) {
        case "lg":
            return "\\lg";
        case "ln":
            return "\\ln";
        case "log_with_base":
            return `\\log_{${escapeLatexMathAtom(functionNotation.normalizedBaseText)}}`;
        case "log":
            return "\\log";
        default:
            return functionNames[name] || `\\operatorname{${escapeLatexMathAtom(name || "f")}}`;
    }
}

function latexPowerExponent(value) {
    return `\\scriptstyle ${escapeLatexMathAtom(value || "2")}`;
}

function latexFractionLine(widthEm) {
    return `\\makebox[${formatEm(widthEm)}em][c]{\\ensuremath{\\vcenter{\\hrule width ${formatEm(widthEm)}em height \\pFourFractionRuleThickness}}}`;
}

function renderPowerExponentLatex(node, options = {}, shellColorName = null) {
    if (node?.exponentNode) {
        return wrapLatexColor(
            `{\\scriptstyle ${renderNodeToLatex(node.exponentNode, [], options)}}`,
            shellColorName
        );
    }

    return wrapLatexColor(latexPowerExponent(node?.exponent || "2"), shellColorName);
}

function latexRootDegree(value) {
    const normalized = String(value || "").trim();
    return normalized.length > 0
        ? escapeLatexMathAtom(normalized)
        : "";
}

function needsNegationDelimiter(node) {
    if (!node) {
        return false;
    }

    if (node.type === "fraction") {
        return false;
    }

    if (node.type === "sequence") {
        return !(node.items || []).every((item) => {
            if (!item) {
                return true;
            }

            if (item.type === "text") {
                if (item.kind !== "operator") {
                    return true;
                }

                return !["+", "-", "="].includes(item.text || "");
            }

            if (item.type === "sequence") {
                return !needsNegationDelimiter(item);
            }

            if (item.type === "fraction") {
                return true;
            }

            if (item.type === "negation") {
                return false;
            }

            return ["group", "function", "root", "power", "multiplication"].includes(item.type);
        });
    }

    return node.type === "negation";
}

function containsNestedInlineShell(node) {
    if (!node) {
        return false;
    }

    if (node.type === "sequence") {
        return (node.items || []).some((item) => containsNestedInlineShell(item));
    }

    return node.type !== "text";
}

function rootContentNode(node) {
    return node?.shellContent || node?.content || null;
}

function hasRenderableNodeContent(node) {
    if (!node) {
        return false;
    }

    if (node.type === "sequence") {
        return (node.items || []).some((item) => hasRenderableNodeContent(item));
    }

    return true;
}

function resolvePlacedCellAxisExtents(step, cell, referenceCell = null, options = {}) {
    const candidateNode = cell?.fractionRenderNode || cell?.renderNode;
    const candidateExtents = resolveNodeAxisExtents(candidateNode);

    if (!candidateExtents) {
        return null;
    }

    const stepBaseY = Number.isFinite(options?.stepBaseY) ? options.stepBaseY : 0;
    const stepHeight = Number.isFinite(options?.stepHeight) ? options.stepHeight : 0;

    if (!step) {
        return candidateExtents;
    }

    const candidateBaselineY = resolveStepCellAnchorY(step, cell, stepBaseY, stepHeight);
    const referenceBaselineY = referenceCell
        ? resolveStepCellAnchorY(step, referenceCell, stepBaseY, stepHeight)
        : resolveAxisRowBaselineY(step, stepBaseY, stepHeight);
    const baselineOffset = referenceBaselineY - candidateBaselineY;

    return {
        axisAboveEm: Math.max(0, baselineOffset + candidateExtents.axisAboveEm),
        axisBelowEm: Math.max(0, candidateExtents.axisBelowEm - baselineOffset)
    };
}

function isRootChromeProjectionRole(projectionRole = null) {
    return projectionRole === "root_hook"
        || projectionRole === "root_bar"
        || projectionRole === "root_overbar";
}

function collectProjectedRootContentCells(cell, stepCells = []) {
    if (cell?.renderNode?.type !== "root") {
        return [];
    }

    const rootBounds = resolveCellSemanticBounds(cell);

    return stepCells.filter((candidate) => {
        if (!candidate || candidate === cell) {
            return false;
        }

        if (isRootChromeProjectionRole(candidate?.projectionRole)) {
            return false;
        }

        if (candidate?.renderNode?.type === "root") {
            return false;
        }

        const bounds = resolveCellSemanticBounds(candidate);
        return bounds.semanticStart >= rootBounds.semanticStart && bounds.semanticEnd <= rootBounds.semanticEnd;
    });
}

function resolveProjectedRootContentExtents(cell, stepCells = [], options = {}) {
    const step = options?.step || null;

    return collectProjectedRootContentCells(cell, stepCells).reduce((current, candidate) => {
        const candidateExtents = resolvePlacedCellAxisExtents(step, candidate, cell, options);
        return mergeAxisExtents(current, candidateExtents);
    }, null);
}

function buildRootShellPhantomContent(extents = null, widthEm = fallbackCellWidthEm) {
    const safeWidthEm = Math.max(fallbackCellWidthEm, Number(widthEm) || 0);
    return `\\makebox[${formatEm(safeWidthEm)}em][l]{${buildDelimiterHeightStrut(extents)}}`;
}

function shouldRenderProjectedRootShell(cell, stepCells = []) {
    return cell?.renderNode?.type === "root"
        && !hasRenderableNodeContent(rootContentNode(cell.renderNode))
        && collectProjectedRootContentCells(cell, stepCells).length > 0;
}

function renderProjectedRootShellCellLatex(
    cell,
    semanticLayout = null,
    displayLayout = null,
    options = {},
    shellColorsEnabled = false,
    shellColorPolicy = null,
    widthOverrideEm = null
) {
    const stepCells = Array.isArray(options?.stepCells) ? options.stepCells : [];
    if (!shouldRenderProjectedRootShell(cell, stepCells)) {
        return null;
    }

    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);
    const contentWidthEm = spanWidth(semanticLayout, semanticStart, semanticEnd);
    const extents = resolveProjectedRootContentExtents(cell, stepCells, options)
        || resolveNodeAxisExtents(cell?.renderNode)
        || resolveNodeAxisExtents(rootContentNode(cell?.renderNode));
    const totalWidthEm = Number.isFinite(widthOverrideEm)
        ? widthOverrideEm
        : (displayLayout ? rootShellWidth(cell, semanticLayout, displayLayout) : Math.max(contentWidthEm, fallbackCellWidthEm));

    return wrapLatexColor(
        p4Cell(
            renderRootShellLatex(
                buildRootShellPhantomContent(extents, contentWidthEm),
                resolveNodeShellColorName(cell?.renderNode, shellColorsEnabled, shellColorPolicy)
            ),
            totalWidthEm
        )
    );
}

function renderNodeVisualWidth(node) {
    if (!node) {
        return 0;
    }

    switch (node.type) {
        case "sequence":
            return Math.max(1, (node.items || []).reduce((sum, item) => sum + renderNodeVisualWidth(item), 0));
        case "fraction":
            return Math.max(1, renderNodeVisualWidth(node.numerator), renderNodeVisualWidth(node.denominator));
        case "root":
            return Math.max(1, renderNodeVisualWidth(rootContentNode(node)));
        case "group":
            return Math.max(1, renderNodeVisualWidth(node.content));
        case "function":
            return Math.max(1, renderNodeVisualWidth(node.argument));
        case "multiplication":
            return Math.max(1, renderNodeVisualWidth(node.left) + renderNodeVisualWidth(node.right));
        case "power":
            return Math.max(1, renderNodeVisualWidth(node.base));
        case "negation":
            return Math.max(2, 1 + renderNodeVisualWidth(node.content));
        default:
            return 1;
    }
}

function widthForFixedCell(columnWidths, index) {
    return columnWidths?.[index] ?? fallbackCellWidthEm;
}

function sumFixedCellWidths(columnWidths = [], start = 0, count = 1) {
    let width = 0;

    for (let index = start; index < start + count; index += 1) {
        width += widthForFixedCell(columnWidths, index);
    }

    return width || fallbackCellWidthEm;
}

function centerLatexInFixedWidth(latex, columnWidths = []) {
    const totalWidth = columnWidths.reduce((sum, width) => sum + (width || fallbackCellWidthEm), 0) || fallbackCellWidthEm;
    return `\\makebox[${formatEm(totalWidth)}em][c]{\\ensuremath{${latex || ""}}}`;
}

function wrapLatexColor(latex, colorName = null) {
    if (!colorName) {
        return latex;
    }

    return `\\textcolor{${colorName}}{${latex}}`;
}

function renderRootShellLatex(contentLatex, shellColorName = null, degreeLatex = "") {
    if (!degreeLatex) {
        if (!shellColorName) {
            return `\\pFourRoot{${contentLatex}}`;
        }

        return `\\pFourRootC{${shellColorName}}{${contentLatex}}`;
    }

    if (!shellColorName) {
        return `\\pFourRootDegree{${degreeLatex}}{${contentLatex}}`;
    }

    return `\\pFourRootDegreeC{${shellColorName}}{${degreeLatex}}{${contentLatex}}`;
}

function resolveNodeShellColorName(node, shellColorsEnabled = false, shellColorPolicy = null) {
    if (!shellColorsEnabled) {
        return null;
    }

    return resolveShellColorForNode(node, shellColorPolicy)?.latexColorName || null;
}

function resolveNodeElementColorName(node, shellColorsEnabled = false, shellColorPolicy = null) {
    if (!shellColorsEnabled) {
        return null;
    }

    return resolveElementColorForNode(node, shellColorPolicy)?.latexColorName || null;
}

function resolveCellShellColorName(cell, shellColorsEnabled = false, fallbackKind = "fraction", shellColorPolicy = null) {
    if (!shellColorsEnabled) {
        return null;
    }

    return resolveShellColor(cell?.sourceShellId || null, fallbackKind, shellColorPolicy)?.latexColorName || null;
}

function p4Fraction(widthEm, numeratorLatex, denominatorLatex, barColorName = "black") {
    if (barColorName && barColorName !== "black") {
        return `\\pFourFractionC{${barColorName}}{${formatEm(widthEm)}em}{${numeratorLatex || ""}}{${denominatorLatex || ""}}`;
    }

    return `\\pFourFraction{${formatEm(widthEm)}em}{${numeratorLatex || ""}}{${denominatorLatex || ""}}`;
}

function resolveNodeAxisExtents(node) {
    if (!node?.layout) {
        return null;
    }

    const axisAboveEm = Number(node.layout.axisAboveEm);
    const axisBelowEm = Number(node.layout.axisBelowEm);

    if (Number.isFinite(axisAboveEm) && Number.isFinite(axisBelowEm)) {
        return {
            axisAboveEm: Math.max(0, axisAboveEm),
            axisBelowEm: Math.max(0, axisBelowEm)
        };
    }

    const boxHeightEm = Number(node.layout.boxHeightEm);

    if (!Number.isFinite(boxHeightEm)) {
        return null;
    }

    return {
        axisAboveEm: Math.max(0, boxHeightEm * 0.65),
        axisBelowEm: Math.max(0, boxHeightEm * 0.35)
    };
}

function normalizeAxisExtents(extents = null) {
    const axisAboveEm = Number(extents?.axisAboveEm);
    const axisBelowEm = Number(extents?.axisBelowEm);

    return {
        axisAboveEm: Number.isFinite(axisAboveEm) ? Math.max(0, axisAboveEm) : 0.52,
        axisBelowEm: Number.isFinite(axisBelowEm) ? Math.max(0, axisBelowEm) : 0.28
    };
}

function mergeAxisExtents(current = null, next = null) {
    const resolvedCurrent = normalizeAxisExtents(current);
    const resolvedNext = normalizeAxisExtents(next);

    return {
        axisAboveEm: Math.max(resolvedCurrent.axisAboveEm, resolvedNext.axisAboveEm),
        axisBelowEm: Math.max(resolvedCurrent.axisBelowEm, resolvedNext.axisBelowEm)
    };
}

function buildDelimiterHeightStrut(extents = null) {
    const resolved = normalizeAxisExtents(extents);
    return `\\raisebox{0pt}[${formatEm(resolved.axisAboveEm)}em][${formatEm(resolved.axisBelowEm)}em]{\\rule{0pt}{0pt}}`;
}

function wrapFractionChildOnEdge(latex, node, edge = null) {
    if (!latex || !edge) {
        return latex;
    }

    const extents = resolveNodeAxisExtents(node);

    if (!extents) {
        return latex;
    }

    if ((extents.axisAboveEm || 0) <= 0.7 && (extents.axisBelowEm || 0) <= 0.5) {
        return latex;
    }

    const above = `${formatEm(extents.axisAboveEm)}em`;
    const below = `${formatEm(extents.axisBelowEm)}em`;

    if (edge === "bottom") {
        return `\\pFourBottomAlign{${above}}{${below}}{${latex}}`;
    }

    if (edge === "top") {
        return `\\pFourTopAlign{${above}}{${below}}{${latex}}`;
    }

    return latex;
}

function collectProjectionAtomChildren(atom) {
    if (!atom || typeof atom !== "object") {
        return [];
    }

    if (atom.type === "DIVISION") {
        return [
            ...(Array.isArray(atom.numerator) ? atom.numerator : []),
            ...(Array.isArray(atom.denominator) ? atom.denominator : [])
        ];
    }

    if (atom.type === "MULTIPLICATION") {
        return [
            ...(Array.isArray(atom.content) ? atom.content : []),
            ...(Array.isArray(atom.factor) ? atom.factor : [])
        ];
    }

    if (["GROUP", "FUNCTION", "ROOT", "NEGATION", "POWER"].includes(atom.type)) {
        return Array.isArray(atom.content) ? atom.content : [];
    }

    if (["ADDITION", "SUBTRACTION"].includes(atom.type)) {
        return [
            ...(Array.isArray(atom.content) ? atom.content : []),
            ...(Array.isArray(atom.passive) ? atom.passive : [])
        ];
    }

    return [];
}

function containsCollapsedDivisionDescendant(atom) {
    return collectProjectionAtomChildren(atom).some((child) => {
        if (!child || child.isVisible === false) {
            return false;
        }

        if (child.type === "DIVISION") {
            return true;
        }

        return containsCollapsedDivisionDescendant(child);
    });
}

function collectNestedProjectionAtomIds(atom, nestedIds = new Set()) {
    collectProjectionAtomChildren(atom).forEach((child) => {
        if (!child || typeof child !== "object") {
            return;
        }

        if (typeof child.id === "string" && child.id.length > 0) {
            nestedIds.add(child.id);
        }

        collectNestedProjectionAtomIds(child, nestedIds);
    });

    return nestedIds;
}

function collectCollapsedProjectionAtomsForShell(rootAtom, projectionAtoms = []) {
    if (!rootAtom || rootAtom.type !== "DIVISION") {
        return [];
    }

    const nestedStructuralIds = collectNestedProjectionAtomIds(rootAtom, new Set());
    const relatedShellIds = new Set([rootAtom.id, ...nestedStructuralIds]);

    return projectionAtoms.filter((candidate) => {
        if (!candidate || candidate.isVisible === false || candidate.id === rootAtom.id) {
            return false;
        }

        if (typeof candidate.sourceShellId === "string" && relatedShellIds.has(candidate.sourceShellId)) {
            return true;
        }

        if (typeof candidate.sourceAtomId === "string" && nestedStructuralIds.has(candidate.sourceAtomId)) {
            return true;
        }

        return typeof candidate.id === "string" && nestedStructuralIds.has(candidate.id);
    });
}

function collectProjectionShellIdsWithProjectedChildren(pseudoCells = []) {
    const shellIds = new Set();

    pseudoCells.forEach((cell) => {
        if (typeof cell?.sourceShellId === "string" && cell.sourceShellId.length > 0) {
            shellIds.add(cell.sourceShellId);
        }
    });

    return shellIds;
}

function buildProjectionPseudoCellsById(pseudoCells = []) {
    return new Map(
        pseudoCells
            .filter((cell) => typeof cell?.id === "string" && cell.id.length > 0)
            .map((cell) => [cell.id, cell])
    );
}

function isProjectionPseudoCellDescendantOfCollapsedDivision(cell, collapsedDivisionShellIds = new Set(), pseudoCellsById = new Map()) {
    if (!cell || collapsedDivisionShellIds.size === 0) {
        return false;
    }

    let currentShellId = typeof cell.sourceShellId === "string" ? cell.sourceShellId : null;
    const visitedShellIds = new Set();

    while (currentShellId && !visitedShellIds.has(currentShellId)) {
        if (collapsedDivisionShellIds.has(currentShellId)) {
            return true;
        }

        visitedShellIds.add(currentShellId);
        currentShellId = pseudoCellsById.get(currentShellId)?.sourceShellId || null;
    }

    return false;
}

function filterRenderableProjectionPseudoCells(pseudoCells = []) {
    const shellIdsWithProjectedChildren = collectProjectionShellIdsWithProjectedChildren(pseudoCells);
    const collapsedDivisionShellIds = new Set(
        pseudoCells
            .filter((cell) => cell?.kind === "division" && Array.isArray(cell?.collapsedProjectionAtoms) && cell.collapsedProjectionAtoms.length > 0)
            .map((cell) => cell.id)
            .filter((id) => typeof id === "string" && id.length > 0)
    );
    const pseudoCellsById = buildProjectionPseudoCellsById(pseudoCells);

    return pseudoCells.filter((cell) => {
        if (!cell || cell.text.length === 0) {
            return false;
        }

        if (collapsedDivisionShellIds.has(cell.id)) {
            return true;
        }

        if (isProjectionPseudoCellDescendantOfCollapsedDivision(cell, collapsedDivisionShellIds, pseudoCellsById)) {
            return false;
        }

        if (cell.kind === "division") {
            return false;
        }

        if (shellIdsWithProjectedChildren.has(cell.id)) {
            return false;
        }

        return true;
    });
}

function createProjectionPseudoCell(atom, projectionAtoms = []) {
    if (!atom) {
        return null;
    }

    const collapsedProjectionAtoms = atom.type === "DIVISION"
        ? collectCollapsedProjectionAtomsForShell(atom, projectionAtoms)
        : null;

    return {
        id: atom.id,
        sourceAtomId: atom.sourceAtomId || atom.id || null,
        sourceShellId: atom.sourceShellId || null,
        text: formatCellText(atom),
        renderNode: atom.type === "FRACTION_LINE" ? null : buildRenderNode(atom),
        kind: atom.type === "FRACTION_LINE" ? "fraction_line" : (atom.type || "unknown").toLowerCase(),
        row: atom.row ?? 0,
        absoluteRow: atom.absoluteRow ?? atom.row ?? 0,
        col: atom.col ?? 0,
        colStart: Number.isInteger(atom.colStart) ? atom.colStart : (atom.col ?? 0),
        colEnd: Number.isInteger(atom.colEnd) ? atom.colEnd : (atom.col ?? 0),
        projectionRole: atom.projectionRole || null,
        position: atom.position || null,
        collapsedProjectionAtoms
    };
}

function resolveCellAxisExtents(cell) {
    const axisAboveEm = Number(cell?.renderNode?.layout?.axisAboveEm);
    const axisBelowEm = Number(cell?.renderNode?.layout?.axisBelowEm);

    if (Number.isFinite(axisAboveEm) && Number.isFinite(axisBelowEm)) {
        return {
            axisAboveEm: Math.max(0, axisAboveEm),
            axisBelowEm: Math.max(0, axisBelowEm)
        };
    }

    return {
        axisAboveEm: 0.52,
        axisBelowEm: 0.28
    };
}

function resolveDisplayRowAxisExtents(cells = []) {
    return cells.reduce((current, cell) => {
        const extents = resolveCellAxisExtents(cell);

        return {
            axisAboveEm: Math.max(current.axisAboveEm, extents.axisAboveEm),
            axisBelowEm: Math.max(current.axisBelowEm, extents.axisBelowEm)
        };
    }, {
        axisAboveEm: 0.52,
        axisBelowEm: 0.28
    });
}

function wrapDisplayRowOnFractionEdge(row, edge = "bottom") {
    if (!row?.latex) {
        return "";
    }

    if (row?.requiresEdgeAlignment !== true) {
        return row.latex;
    }

    const above = `${formatEm(row.axisAboveEm || 0.52)}em`;
    const below = `${formatEm(row.axisBelowEm || 0.28)}em`;

    if (edge === "top") {
        return `\\pFourTopAlign{${above}}{${below}}{${row.latex}}`;
    }

    return `\\pFourBottomAlign{${above}}{${below}}{${row.latex}}`;
}

function wrapAxisCenteredLatex(latex, centerOnAxis = false) {
    return latex || "";
}

function padFixedP4Expression(expression, currentWidth, targetWidth, columnWidths = []) {
    const parts = [expression];

    for (let index = currentWidth; index < targetWidth; index += 1) {
        parts.push(p4Cell("", widthForFixedCell(columnWidths, index)));
    }

    return parts.join("");
}

function renderCenteredFractionChild(node, width, columnWidths = [], options = {}) {
    const childWidth = Math.max(1, renderNodeVisualWidth(node));

    if (childWidth >= width) {
        return renderNodeAsFixedP4Width(node, width, columnWidths, options);
    }

    const leadingOffset = Math.max(0, Math.floor((width - childWidth) / 2));
    const childColumnWidths = columnWidths.slice(leadingOffset, leadingOffset + childWidth);
    const childLatex = renderNodeAsFixedP4Width(node, childWidth, childColumnWidths, options);

    return centerLatexInFixedWidth(childLatex, columnWidths);
}

function resolveRenderOptions(options = {}) {
    return {
        suppressOuterGroupShell: options?.suppressOuterGroupShell === true,
        inlineDisplayShells: options?.inlineDisplayShells === true,
        preserveStructuredSpan: options?.preserveStructuredSpan === true,
        shellColorsEnabled: options?.shellColorsEnabled === true,
        shellColorPolicy: options?.shellColorPolicy || null,
        explicitShellExtentRegistry: options?.explicitShellExtentRegistry instanceof Map
            ? options.explicitShellExtentRegistry
            : null,
        powerInverseStyle: options?.powerInverseStyle === "fractional-exponent"
            ? "fractional-exponent"
            : "root"
    };
}

function buildVisiblePowerRenderNode(node = null, options = {}) {
    if (!node || typeof node !== "object") {
        return null;
    }

    const resolvedOptions = resolveRenderOptions(options);
    const shouldRenderInversePower = (
        node.type === "POWER"
        && node.generatedByFamily === "power_base_release"
        && options?.preferInverseRendering === true
    );
    let renderSource = node;

    if (node.type === "POWER" && node.generatedByFamily === "power_base_release") {
        renderSource = shouldRenderInversePower && resolvedOptions.powerInverseStyle === "root"
            ? node
            : {
                ...node,
                generatedByFamily: null
            };
    }

    return buildRenderNode(renderSource);
}

function renderGroupNodeAsFixedP4Width(node, width, columnWidths = [], options = {}) {
    const resolvedOptions = resolveRenderOptions(options);
    const contentWidth = Math.max(1, renderNodeVisualWidth(node?.content));
    const targetWidth = Math.max(contentWidth, width || contentWidth);

    if (resolvedOptions.suppressOuterGroupShell) {
        return renderNodeAsFixedP4Width(
            node?.content,
            targetWidth,
            columnWidths,
            {
                ...resolvedOptions,
                suppressOuterGroupShell: false
            }
        );
    }

    const grouped = "\\left(" + renderNodeAsFixedP4Width(node?.content, contentWidth, columnWidths.slice(0, contentWidth), resolvedOptions) + "\\right)";

    return padFixedP4Expression(grouped, contentWidth, targetWidth, columnWidths);
}

function renderNodeAsFixedP4Width(node, width, columnWidths = [], options = {}) {
    const resolvedOptions = resolveRenderOptions(options);
    const targetWidth = Math.max(1, width || renderNodeVisualWidth(node));

    if (!node) {
        return Array.from({ length: targetWidth }, (_, index) => p4Cell("", widthForFixedCell(columnWidths, index))).join("");
    }

    if (node.type === "group") {
        return renderGroupNodeAsFixedP4Width(node, targetWidth, columnWidths, resolvedOptions);
    }

    if (node.type === "fraction") {
        const fractionWidth = Math.max(1, renderNodeVisualWidth(node));
        return padFixedP4Expression(
            renderFractionNodeToLatex(node, columnWidths.slice(0, fractionWidth), resolvedOptions),
            fractionWidth,
            targetWidth,
            columnWidths
        );
    }

    if (node.type === "sequence") {
        const parts = [];
        let cursor = 0;

        (node.items || []).forEach((item) => {
            const itemWidth = Math.max(1, renderNodeVisualWidth(item));
            parts.push(renderNodeAsFixedP4Width(item, itemWidth, columnWidths.slice(cursor, cursor + itemWidth), resolvedOptions));
            cursor += itemWidth;
        });

        while (cursor < targetWidth) {
            parts.push(p4Cell("", widthForFixedCell(columnWidths, cursor)));
            cursor += 1;
        }

        return parts.join("");
    }

    if (node.type === "negation") {
        const signCellWidth = widthForFixedCell(columnWidths, 0);
        const contentWidth = Math.max(1, renderNodeVisualWidth(node.content));
        const contentLatex = renderNodeAsFixedP4Width(
            node.content,
            contentWidth,
            columnWidths.slice(1, 1 + contentWidth),
            resolvedOptions
        );
        const wrappedContentLatex = needsNegationDelimiter(node.content)
            ? `\\left(${contentLatex}\\right)`
            : contentLatex;
        const parts = [
            p4Cell("-", signCellWidth),
            wrappedContentLatex
        ];

        for (let cursor = 1 + contentWidth; cursor < targetWidth; cursor += 1) {
            parts.push(p4Cell("", widthForFixedCell(columnWidths, cursor)));
        }

        return parts.join("");
    }

    if (node.type === "multiplication" && !node.separator) {
        const leftWidth = Math.max(1, renderNodeVisualWidth(node.left));
        const rightWidth = Math.max(1, renderNodeVisualWidth(node.right));
        const parts = [
            renderNodeAsFixedP4Width(
                node.left,
                leftWidth,
                columnWidths.slice(0, leftWidth),
                resolvedOptions
            ),
            renderNodeAsFixedP4Width(
                node.right,
                rightWidth,
                columnWidths.slice(leftWidth, leftWidth + rightWidth),
                resolvedOptions
            )
        ];

        for (let cursor = leftWidth + rightWidth; cursor < targetWidth; cursor += 1) {
            parts.push(p4Cell("", widthForFixedCell(columnWidths, cursor)));
        }

        return parts.join("");
    }

    const nodeWidth = Math.max(1, renderNodeVisualWidth(node));
    return padFixedP4Expression(
        p4Cell(renderNodeToLatex(node, columnWidths.slice(0, nodeWidth), resolvedOptions), sumFixedCellWidths(columnWidths, 0, nodeWidth)),
        nodeWidth,
        targetWidth,
        columnWidths
    );
}

function renderFractionNodeToLatex(node, columnWidths = [], options = {}) {
    const resolvedOptions = resolveRenderOptions(options);
    const width = Math.max(
        1,
        renderNodeVisualWidth(node?.numerator),
        renderNodeVisualWidth(node?.denominator)
    );
    const fixedColumnWidths = columnWidths.length > 0
        ? columnWidths.slice(0, width)
        : Array.from({ length: width }, () => fallbackCellWidthEm);

    const childOptions = {
        ...resolvedOptions,
        suppressOuterGroupShell: true
    };

    const totalWidthEm = fixedColumnWidths.reduce((sum, value) => sum + (value || 0), 0) || fallbackCellWidthEm;
    return p4Fraction(
        totalWidthEm,
        wrapFractionChildOnEdge(
            renderCenteredFractionChild(node?.numerator, width, fixedColumnWidths, childOptions),
            node?.numerator,
            "bottom"
        ),
        wrapFractionChildOnEdge(
            renderCenteredFractionChild(node?.denominator, width, fixedColumnWidths, childOptions),
            node?.denominator,
            "top"
        )
    );
}

function buildProjectedFractionChildRow(
    childNode = null,
    childBounds = null,
    semanticLayout = null,
    displayLayout = null,
    options = {}
) {
    if (!childNode || !childBounds) {
        return {
            widthEm: 0,
            latex: "",
            displaySlotStart: 0,
            displaySlotEnd: 0
        };
    }

    const { semanticStart, semanticEnd, semanticSpanCount } = childBounds;
    const childWidths = semanticSpanCount > 1
        ? widthsForSpan(semanticLayout, semanticStart, semanticEnd)
        : [columnWidthFor(semanticLayout, semanticStart)];
    const childLatex = renderNodeAsFixedP4Width(
        childNode,
        semanticSpanCount,
        childWidths,
        options
    );
    const syntheticCell = {
        col: semanticStart,
        colStart: semanticStart,
        colEnd: semanticEnd
    };
    const displayBounds = resolveDisplaySlotBounds(
        syntheticCell,
        displayLayout,
        options?.stepIndex ?? 0,
        options
    );

    return {
        widthEm: spanWidth(semanticLayout, semanticStart, semanticEnd),
        latex: childLatex,
        displaySlotStart: displayBounds.displayStartSlot,
        displaySlotEnd: displayBounds.displayEndSlot
    };
}

function renderProjectedFractionShellCellLatex(
    cell,
    semanticLayout = null,
    displayLayout = null,
    options = {},
    shellColorsEnabled = false,
    shellColorPolicy = null
) {
    if (
        cell?.renderNode?.type !== "fraction"
        || !hasProjectedFractionChildBounds(cell)
        || !cellUsesGeneratedFractionProjection(cell)
    ) {
        return null;
    }

    const resolvedOptions = resolveRenderOptions(options);
    const colorResolvedOptions = {
        ...resolvedOptions,
        shellColorsEnabled,
        shellColorPolicy
    };
    const numeratorBounds = resolveProjectedFractionChildBounds(cell, "numerator");
    const denominatorBounds = resolveProjectedFractionChildBounds(cell, "denominator");
    const fractionBounds = resolveProjectedShellContentBounds(cell);
    const fractionSyntheticCell = {
        col: fractionBounds.semanticStart,
        colStart: fractionBounds.semanticStart,
        colEnd: fractionBounds.semanticEnd
    };
    const displayBounds = resolveDisplaySlotBounds(
        fractionSyntheticCell,
        displayLayout,
        options?.stepIndex ?? 0,
        resolvedOptions
    );
    const slotStart = displayBounds.displayStartSlot;
    const slotEnd = displayBounds.displayEndSlot;
    const fractionWidthEm = displayLayout
        ? displaySlotSpanWidth(displayLayout, slotStart, slotEnd)
        : spanWidth(semanticLayout, fractionBounds.semanticStart, fractionBounds.semanticEnd);
    const numeratorRow = buildProjectedFractionChildRow(
        cell.renderNode.numerator,
        numeratorBounds,
        semanticLayout,
        displayLayout,
        colorResolvedOptions
    );
    const denominatorRow = buildProjectedFractionChildRow(
        cell.renderNode.denominator,
        denominatorBounds,
        semanticLayout,
        displayLayout,
        colorResolvedOptions
    );
    const shellColorName = resolveNodeShellColorName(
        cell?.renderNode,
        shellColorsEnabled,
        shellColorPolicy
    );

    return wrapLatexColor(
        p4Fraction(
            fractionWidthEm,
            wrapDisplayRowOnFractionEdge(
                {
                    ...numeratorRow,
                    widthEm: fractionWidthEm,
                    latex: fitDisplayRowToFractionSpan(
                        numeratorRow,
                        slotStart,
                        slotEnd,
                        displayLayout
                    )
                },
                "bottom"
            ),
            wrapDisplayRowOnFractionEdge(
                {
                    ...denominatorRow,
                    widthEm: fractionWidthEm,
                    latex: fitDisplayRowToFractionSpan(
                        denominatorRow,
                        slotStart,
                        slotEnd,
                        displayLayout
                    )
                },
                "top"
            ),
            shellColorName || "black"
        ),
        resolveElementColorForCell(cell, shellColorPolicy)?.latexColorName
    );
}

function renderNodeToLatex(node, columnWidths = [], options = {}) {
    const resolvedOptions = resolveRenderOptions(options);
    const elementColorName = resolveNodeElementColorName(
        node,
        resolvedOptions.shellColorsEnabled,
        resolvedOptions.shellColorPolicy
    );
    const shellColorName = resolveNodeShellColorName(
        node,
        resolvedOptions.shellColorsEnabled,
        resolvedOptions.shellColorPolicy
    );

    if (!node) {
        return "";
    }

    switch (node.type) {
        case "text":
            return wrapLatexColor(
                escapeLatexMathAtom(node.text || ""),
                elementColorName || shellColorName
            );
        case "sequence": {
            let cursor = 0;
            const sequenceLatex = (node.items || []).map((item) => {
                const width = Math.max(1, renderNodeVisualWidth(item));
                const latex = renderNodeToLatex(item, columnWidths.slice(cursor, cursor + width), resolvedOptions);
                cursor += width;
                return latex;
            }).filter(Boolean).join("");
            return wrapLatexColor(sequenceLatex, elementColorName);
        }
        case "group":
            if (resolvedOptions.suppressOuterGroupShell) {
                return renderNodeToLatex(
                    node.content,
                    columnWidths,
                    {
                        ...resolvedOptions,
                        suppressOuterGroupShell: false
                    }
                );
            }

            return wrapLatexColor(
                `\\left(${renderNodeToLatex(node.content, columnWidths, resolvedOptions)}\\right)`,
                elementColorName
            );
        case "function":
            return wrapLatexColor(
                `${latexFunctionName(node.name, node.baseText)}\\left(${renderNodeToLatex(node.argument, columnWidths, resolvedOptions)}\\right)`,
                elementColorName
            );
        case "root":
            return wrapLatexColor(
                renderRootShellLatex(
                    renderNodeToLatex(rootContentNode(node), columnWidths, resolvedOptions),
                    resolveNodeShellColorName(
                        node,
                        resolvedOptions.shellColorsEnabled,
                        resolvedOptions.shellColorPolicy
                    ),
                    latexRootDegree(node.degreeText)
                ),
                elementColorName
            );
        case "power": {
            const baseWidth = Math.max(1, renderNodeVisualWidth(node.base));
            const base = renderNodeToLatex(node.base, columnWidths.slice(0, baseWidth), resolvedOptions);
            const powerBase = needsPowerParens(node.base) ? `\\left(${base}\\right)` : base;
            const shellColorName = resolveNodeShellColorName(
                node,
                resolvedOptions.shellColorsEnabled,
                resolvedOptions.shellColorPolicy
            );
            const exponentLatex = renderPowerExponentLatex(node, resolvedOptions, shellColorName);
            return wrapLatexColor(
                `${powerBase}^{${exponentLatex}}`,
                elementColorName
            );
        }
        case "negation": {
            const contentWidth = Math.max(1, renderNodeVisualWidth(node.content));
            const content = renderNodeToLatex(
                node.content,
                columnWidths.slice(1, 1 + contentWidth),
                resolvedOptions
            );

            if (!content) {
                return wrapLatexColor("-", elementColorName);
            }

            return wrapLatexColor(
                needsNegationDelimiter(node.content)
                ? `-\\left(${content}\\right)`
                : `-${content}`,
                elementColorName
            );
        }
        case "multiplication": {
            const leftWidth = Math.max(1, renderNodeVisualWidth(node.left));
            const left = renderNodeToLatex(node.left, columnWidths.slice(0, leftWidth), resolvedOptions);
            const right = renderNodeToLatex(node.right, columnWidths.slice(leftWidth), resolvedOptions);
            const separator = node.separator ? " \\cdot " : "";
            return wrapLatexColor(`${left}${separator}${right}`, elementColorName);
        }
        case "fraction":
            return wrapLatexColor(renderFractionNodeToLatex(node, columnWidths, resolvedOptions), elementColorName);
        default:
            return wrapLatexColor(escapeLatexMathAtom(node.text || ""), elementColorName);
    }
}

function wrappedPowerBaseLatex(cell, semanticLayout = null) {
    const { semanticStart, semanticEnd, semanticSpanCount } = resolveProjectedShellContentBounds(cell);
    const cellWidths = semanticSpanCount > 1
        ? widthsForSpan(semanticLayout, semanticStart, semanticEnd)
        : [columnWidthFor(semanticLayout, semanticStart)];

    return renderNodeAsFixedP4Width(
        cell?.renderNode?.base,
        semanticSpanCount,
        cellWidths,
        { suppressOuterGroupShell: true }
    );
}

function groupedContentLatex(cell, semanticLayout = null) {
    const { semanticStart, semanticEnd, semanticSpanCount } = resolveProjectedShellContentBounds(cell);
    const cellWidths = semanticSpanCount > 1
        ? widthsForSpan(semanticLayout, semanticStart, semanticEnd)
        : [columnWidthFor(semanticLayout, semanticStart)];

    return renderNodeAsFixedP4Width(
        cell?.renderNode?.content,
        semanticSpanCount,
        cellWidths,
        { suppressOuterGroupShell: true }
    );
}

function functionArgumentLatex(cell, semanticLayout = null) {
    const { semanticStart, semanticEnd, semanticSpanCount } = resolveProjectedShellContentBounds(cell);
    const cellWidths = semanticSpanCount > 1
        ? widthsForSpan(semanticLayout, semanticStart, semanticEnd)
        : [columnWidthFor(semanticLayout, semanticStart)];

    return renderNodeAsFixedP4Width(
        cell?.renderNode?.argument,
        semanticSpanCount,
        cellWidths,
        { suppressOuterGroupShell: true }
    );
}

function matchingExplicitShellRole(projectionRole = null) {
    switch (projectionRole) {
        case "function_left":
            return "function_right";
        case "function_right":
            return "function_left";
        case "group_left":
            return "group_right";
        case "group_right":
            return "group_left";
        default:
            return null;
    }
}

function explicitShellFallbackKind(projectionRole = null) {
    if (String(projectionRole || "").startsWith("function_")) {
        return "function";
    }

    if (String(projectionRole || "").startsWith("group_")) {
        return "group";
    }

    return "group";
}

function resolveExplicitShellPartnerCell(cell, stepCells = []) {
    const partnerRole = matchingExplicitShellRole(cell?.projectionRole);
    if (!partnerRole) {
        return null;
    }

    return stepCells.find((candidate) => (
        candidate !== cell
        && candidate?.projectionRole === partnerRole
        && candidate?.sourceShellId
        && candidate.sourceShellId === cell?.sourceShellId
    )) || null;
}

function cellBelongsToExplicitShell(candidate, shellId = null) {
    if (!candidate || typeof shellId !== "string" || shellId.length === 0) {
        return false;
    }

    if (candidate?.sourceShellId === shellId) {
        return true;
    }

    return Array.isArray(candidate?.visibleAncestorShells)
        && candidate.visibleAncestorShells.some((descriptor) => descriptor?.shellId === shellId);
}

function collectExplicitShellContentCells(cell, stepCells = []) {
    const partnerCell = resolveExplicitShellPartnerCell(cell, stepCells);
    if (!partnerCell) {
        return [];
    }

    const leftCell = String(cell?.projectionRole || "").endsWith("_left") ? cell : partnerCell;
    const rightCell = leftCell === cell ? partnerCell : cell;
    const leftBounds = resolveCellSemanticBounds(leftCell);
    const rightBounds = resolveCellSemanticBounds(rightCell);

    return stepCells.filter((candidate) => {
        if (!candidate || candidate === leftCell || candidate === rightCell) {
            return false;
        }

        if (!cellBelongsToExplicitShell(candidate, cell?.sourceShellId || null)) {
            return false;
        }

        const bounds = resolveCellSemanticBounds(candidate);
        return bounds.semanticStart > leftBounds.semanticEnd && bounds.semanticEnd < rightBounds.semanticStart;
    });
}

function resolveExplicitShellContentExtents(cell, stepCells = [], options = {}) {
    const step = options?.step || null;
    const contentCells = collectExplicitShellContentCells(cell, stepCells);

    return contentCells.reduce((current, candidate) => {
        const candidateExtents = resolvePlacedCellAxisExtents(step, candidate, cell, options);
        return mergeAxisExtents(current, candidateExtents);
    }, null);
}

function explicitShellExtentRegistryKey(cell = null) {
    const shellId = typeof cell?.sourceShellId === "string" && cell.sourceShellId.length > 0
        ? cell.sourceShellId
        : null;

    if (!shellId) {
        return null;
    }

    return `${explicitShellFallbackKind(cell?.projectionRole)}::${shellId}`;
}

function cloneAxisExtents(extents = null) {
    const normalized = normalizeAxisExtents(extents);

    return {
        axisAboveEm: normalized.axisAboveEm,
        axisBelowEm: normalized.axisBelowEm
    };
}

function resolvePersistedExplicitShellExtents(cell, options = {}) {
    const registry = options?.explicitShellExtentRegistry instanceof Map
        ? options.explicitShellExtentRegistry
        : null;
    const registryKey = explicitShellExtentRegistryKey(cell);

    if (!registry || !registryKey) {
        return null;
    }

    const persistedExtents = registry.get(registryKey);
    return persistedExtents ? cloneAxisExtents(persistedExtents) : null;
}

function buildExplicitShellExtentRegistry(steps = [], layout = null) {
    const registry = new Map();

    if (!Array.isArray(steps) || steps.length === 0) {
        return registry;
    }

    steps.forEach((step, stepIndex) => {
        if (!step || !Array.isArray(step.cells)) {
            return;
        }

        const stepBaseY = Number.isFinite(layout?.yByStep?.[stepIndex])
            ? layout.yByStep[stepIndex]
            : 0;
        const stepHeight = Number.isFinite(layout?.heights?.[stepIndex])
            ? layout.heights[stepIndex]
            : 0;

        step.cells
            .filter((cell) => cell?.projectionRole === "function_left" || cell?.projectionRole === "group_left")
            .forEach((cell) => {
                const registryKey = explicitShellExtentRegistryKey(cell);
                if (!registryKey || registry.has(registryKey)) {
                    return;
                }

                const extents = resolveExplicitShellContentExtents(cell, step.cells, {
                    step,
                    stepBaseY,
                    stepHeight
                });

                if (!extents) {
                    return;
                }

                registry.set(registryKey, cloneAxisExtents(extents));
            });
    });

    return registry;
}

function renderExplicitDelimiterSlotLatex(cell, stepCells = [], options = {}, shellColorsEnabled = false, shellColorPolicy = null) {
    const extents = resolvePersistedExplicitShellExtents(cell, options)
        || resolveExplicitShellContentExtents(cell, stepCells, options);
    if (!extents) {
        return null;
    }

    const strut = buildDelimiterHeightStrut(extents);
    const shellColorName = resolveCellShellColorName(
        cell,
        shellColorsEnabled,
        explicitShellFallbackKind(cell?.projectionRole),
        shellColorPolicy
    );

    if (cell?.projectionRole === "function_left" || cell?.projectionRole === "group_left") {
        return wrapLatexColor(`\\left(${strut}\\right.`, shellColorName);
    }

    if (cell?.projectionRole === "function_right" || cell?.projectionRole === "group_right") {
        return wrapLatexColor(`\\left.${strut}\\right)`, shellColorName);
    }

    return null;
}

function syntheticShellCell(renderNode, semanticStart, semanticEnd, sourceCell = null) {
    return {
        renderNode,
        col: semanticEnd,
        colStart: semanticStart,
        colEnd: semanticEnd,
        shellContentColStart: sourceCell?.shellContentColStart ?? null,
        shellContentColEnd: sourceCell?.shellContentColEnd ?? null,
        shellAlignmentColStart: sourceCell?.shellAlignmentColStart ?? null,
        shellAlignmentColEnd: sourceCell?.shellAlignmentColEnd ?? null
    };
}

function resolveDisplaySlotBounds(cell, displayLayout, stepIndex = 0, options = {}) {
    return resolveCellDisplaySlotBounds(
        cell,
        displayLayout,
        {
            minOriginStepIndex: stepIndex,
            shellOptions: options
        }
    );
}

function displaySlotSpanWidth(displayLayout, slotStart = 0, slotEnd = slotStart) {
    let width = 0;

    for (let slotIndex = slotStart; slotIndex <= slotEnd; slotIndex += 1) {
        width += displaySlotWidth(displayLayout, slotIndex);
    }

    return width;
}

function displaySlotSpanCenterX(displayLayout, slotStart = 0, slotEnd = slotStart) {
    const left = displaySlotBoundaryX(displayLayout, slotStart, "left");
    const right = displaySlotBoundaryX(displayLayout, slotEnd, "right");
    return left + ((right - left) / 2);
}

function buildVisibleShellNodes(
    cell,
    y,
    semanticLayout,
    displayLayout,
    shellColorsEnabled = false,
    shellColorPolicy = null,
    centerOnAxis = false
) {
    if (!cell?.renderNode) {
        return [];
    }

    if (cellRepresentsClosedChromeShell(cell)) {
        return [];
    }

    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);
    const { shells } = decomposeVisibleShells(cell.renderNode);

    return shells.flatMap((shell) => {
        const shellCell = syntheticShellCell(shell.node, semanticStart, semanticEnd, cell);

        switch (shell.kind) {
            case "group":
                return buildGroupShellNodes(
                    shellCell,
                    y,
                    semanticLayout,
                    displayLayout,
                    shellColorsEnabled,
                    shellColorPolicy,
                    centerOnAxis
                );
            case "function":
                return buildFunctionShellNodes(
                    shellCell,
                    y,
                    semanticLayout,
                    displayLayout,
                    shellColorsEnabled,
                    shellColorPolicy,
                    centerOnAxis
                );
            case "power":
                return buildWrappedPowerShellNodes(
                    shellCell,
                    y,
                    semanticLayout,
                    displayLayout,
                    shellColorsEnabled,
                    shellColorPolicy,
                    centerOnAxis
                );
            default:
                return [];
        }
    });
}

function buildWrappedPowerShellNodes(
    cell,
    y,
    semanticLayout,
    displayLayout,
    shellColorsEnabled = false,
    shellColorPolicy = null,
    centerOnAxis = false
) {
    if (!isWrappedPowerCell(cell)) {
        return [];
    }

    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);
    const baseLatex = wrappedPowerBaseLatex(cell, semanticLayout);
    const leftWidth = powerLeftWidth(displayLayout, semanticStart);
    const rightWidth = powerRightWidth(displayLayout, semanticEnd);
    const lines = [];
    const shellColorName = resolveNodeShellColorName(cell?.renderNode, shellColorsEnabled, shellColorPolicy);
    const exponentLatex = renderPowerExponentLatex(cell?.renderNode, {
        shellColorsEnabled,
        shellColorPolicy
    }, shellColorName);

    if (leftWidth > 0) {
        const leftLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(`\\left(\\vphantom{${baseLatex}}\\right.`, leftWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((powerLeftBoundaryX(displayLayout, semanticStart, "left") + powerLeftBoundaryX(displayLayout, semanticStart, "right")) / 2)},${formatEm(y)}) {$${leftLatex}$};`
        );
    }

    if (rightWidth > 0) {
        const rightLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(`\\left.\\vphantom{${baseLatex}}\\right)^{${exponentLatex}}`, rightWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((powerRightBoundaryX(displayLayout, semanticEnd, "left") + powerRightBoundaryX(displayLayout, semanticEnd, "right")) / 2)},${formatEm(y)}) {$${rightLatex}$};`
        );
    }

    return lines;
}

function buildGroupShellNodes(
    cell,
    y,
    semanticLayout,
    displayLayout,
    shellColorsEnabled = false,
    shellColorPolicy = null,
    centerOnAxis = false
) {
    if (cell?.renderNode?.type !== "group") {
        return [];
    }

    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);
    const contentLatex = groupedContentLatex(cell, semanticLayout);
    const leftWidth = groupLeftWidth(displayLayout, semanticStart);
    const rightWidth = groupRightWidth(displayLayout, semanticEnd);
    const lines = [];
    const shellColorName = resolveNodeShellColorName(cell?.renderNode, shellColorsEnabled, shellColorPolicy);

    if (leftWidth > 0) {
        const leftLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(`\\left(\\vphantom{${contentLatex}}\\right.`, leftWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((groupLeftBoundaryX(displayLayout, semanticStart, "left") + groupLeftBoundaryX(displayLayout, semanticStart, "right")) / 2)},${formatEm(y)}) {$${leftLatex}$};`
        );
    }

    if (rightWidth > 0) {
        const rightLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(`\\left.\\vphantom{${contentLatex}}\\right)`, rightWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((groupRightBoundaryX(displayLayout, semanticEnd, "left") + groupRightBoundaryX(displayLayout, semanticEnd, "right")) / 2)},${formatEm(y)}) {$${rightLatex}$};`
        );
    }

    return lines;
}

function buildFunctionShellNodes(
    cell,
    y,
    semanticLayout,
    displayLayout,
    shellColorsEnabled = false,
    shellColorPolicy = null,
    centerOnAxis = false
) {
    if (cell?.renderNode?.type !== "function") {
        return [];
    }

    const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);
    const argumentLatex = functionArgumentLatex(cell, semanticLayout);
    const nameWidth = functionNameWidth(displayLayout, semanticStart);
    const leftWidth = functionLeftWidth(displayLayout, semanticStart);
    const rightWidth = functionRightWidth(displayLayout, semanticEnd);
    const functionNameLatex = latexFunctionName(cell?.renderNode?.name, cell?.renderNode?.baseText);
    const lines = [];
    const shellColorName = resolveNodeShellColorName(cell?.renderNode, shellColorsEnabled, shellColorPolicy);

    if (nameWidth > 0) {
        const nameLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(functionNameLatex, nameWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((functionNameBoundaryX(displayLayout, semanticStart, "left") + functionNameBoundaryX(displayLayout, semanticStart, "right")) / 2)},${formatEm(y)}) {$${nameLatex}$};`
        );
    }

    if (leftWidth > 0) {
        const leftLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(`\\left(\\vphantom{${argumentLatex}}\\right.`, leftWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((functionLeftBoundaryX(displayLayout, semanticStart, "left") + functionLeftBoundaryX(displayLayout, semanticStart, "right")) / 2)},${formatEm(y)}) {$${leftLatex}$};`
        );
    }

    if (rightWidth > 0) {
        const rightLatex = wrapAxisCenteredLatex(
            wrapLatexColor(p4Cell(`\\left.\\vphantom{${argumentLatex}}\\right)`, rightWidth), shellColorName),
            centerOnAxis
        );
        lines.push(
            `\\node[anchor=base, inner sep=0pt] at (${formatEm((functionRightBoundaryX(displayLayout, semanticEnd, "left") + functionRightBoundaryX(displayLayout, semanticEnd, "right")) / 2)},${formatEm(y)}) {$${rightLatex}$};`
        );
    }

    return lines;
}

function cellToLatex(cell, semanticLayout = null, displayLayout = null, options = {}, shellColorsEnabled = false, shellColorPolicy = null) {
    const resolvedOptions = resolveRenderOptions(options);
    const colorResolvedOptions = {
        ...resolvedOptions,
        shellColorsEnabled,
        shellColorPolicy
    };
    const { semanticStart, semanticEnd, semanticSpanCount } = resolveCellSemanticBounds(cell);
    const cellWidths = semanticSpanCount > 1
        ? widthsForSpan(semanticLayout, semanticStart, semanticEnd)
        : [columnWidthFor(semanticLayout, semanticStart)];
    const inlineShellWidth = displayLayout ? cellDisplayWidth(cell, displayLayout) : spanWidth(semanticLayout, semanticStart, semanticEnd);

    if (cell?.projectionRole === "power_exponent") {
        const exponentColorName = resolveElementColorForCell(cell, shellColorPolicy)?.latexColorName
            || resolveCellShellColorName(cell, shellColorsEnabled, "power", shellColorPolicy);

        return wrapLatexColor(
            latexPowerExponent(cell?.text || cell?.renderNode?.text || "2"),
            exponentColorName
        );
    }

    if (cell?.projectionRole === "function_name") {
        const functionNode = cell?.sourceShellRenderNode?.type === "function"
            ? cell.sourceShellRenderNode
            : null;
        const functionColorName = resolveElementColorForCell(cell, shellColorPolicy)?.latexColorName
            || resolveCellShellColorName(cell, shellColorsEnabled, "function", shellColorPolicy);

        return wrapLatexColor(
            p4Cell(
                latexFunctionName(
                    functionNode?.name || cell?.text || "f",
                    functionNode?.baseText || ""
                ),
                inlineShellWidth
            ),
            functionColorName
        );
    }

    if (cell?.kind === "fraction_line") {
        const displayBounds = resolveDisplaySlotBounds(
            cell,
            displayLayout,
            options?.stepIndex ?? 0,
            resolvedOptions
        );
        const lineWidthEm = displayLayout
            ? displaySlotSpanWidth(displayLayout, displayBounds.displayStartSlot, displayBounds.displayEndSlot)
            : spanWidth(semanticLayout, semanticStart, semanticEnd);
        const fractionColorName = resolveElementColorForCell(cell, shellColorPolicy)?.latexColorName
            || resolveCellShellColorName(cell, shellColorsEnabled, "fraction", shellColorPolicy);

        return wrapLatexColor(
            latexFractionLine(lineWidthEm),
            fractionColorName
        );
    }

    const explicitDelimiterLatex = renderExplicitDelimiterSlotLatex(
        cell,
        Array.isArray(options?.stepCells) ? options.stepCells : [],
        options,
        shellColorsEnabled,
        shellColorPolicy
    );
    if (explicitDelimiterLatex) {
        return explicitDelimiterLatex;
    }

    if (
        cell?.renderNode?.type === "fraction"
        && (
            (Array.isArray(cell?.collapsedProjectionAtoms) && cell.collapsedProjectionAtoms.length > 0)
            || (Array.isArray(cell?.collapsedProjectionCells) && cell.collapsedProjectionCells.length > 0)
        )
    ) {
        return buildCollapsedFractionCellFormula(
            cell,
            semanticLayout,
            displayLayout,
            resolvedOptions,
            options?.stepIndex ?? 0,
            shellColorsEnabled,
            shellColorPolicy
        ).latex;
    }

    const projectedFractionShellLatex = renderProjectedFractionShellCellLatex(
        cell,
        semanticLayout,
        displayLayout,
        options,
        shellColorsEnabled,
        shellColorPolicy
    );
    if (projectedFractionShellLatex) {
        return projectedFractionShellLatex;
    }

    if (cellRepresentsClosedChromeShell(cell)) {
        return p4Cell(
            renderNodeToLatex(cell.renderNode, cellWidths, colorResolvedOptions),
            inlineShellWidth
        );
    }

    if (resolvedOptions.inlineDisplayShells && cell?.renderNode?.type === "function") {
        return p4Cell(
            `${latexFunctionName(cell?.renderNode?.name, cell?.renderNode?.baseText)}\\left(${functionArgumentLatex(cell, semanticLayout)}\\right)`,
            inlineShellWidth
        );
    }

    if (
        resolvedOptions.inlineDisplayShells
        && cell?.renderNode?.type === "group"
        && !resolvedOptions.suppressOuterGroupShell
    ) {
        return p4Cell(
            `\\left(${groupedContentLatex(cell, semanticLayout)}\\right)`,
            inlineShellWidth
        );
    }

    if (resolvedOptions.inlineDisplayShells && isWrappedPowerCell(cell)) {
        return p4Cell(
            `\\left(${wrappedPowerBaseLatex(cell, semanticLayout)}\\right)^{${renderPowerExponentLatex(cell?.renderNode, colorResolvedOptions)}}`,
            inlineShellWidth
        );
    }

    if (cell?.kind === "visible_power_shell" && cell?.renderNode?.type === "power") {
        return p4Cell(
            renderNodeToLatex(cell.renderNode, [], colorResolvedOptions),
            inlineShellWidth
        );
    }

    if (cell?.renderNode?.type === "root") {
        const projectedRootShellLatex = renderProjectedRootShellCellLatex(
            cell,
            semanticLayout,
            displayLayout,
            options,
            shellColorsEnabled,
            shellColorPolicy
        );
        if (projectedRootShellLatex) {
            return projectedRootShellLatex;
        }

        return wrapLatexColor(
            p4Cell(
                renderRootShellLatex(
                    renderNodeAsFixedP4Width(rootContentNode(cell.renderNode), semanticSpanCount, cellWidths, colorResolvedOptions),
                    resolveNodeShellColorName(cell?.renderNode, shellColorsEnabled, shellColorPolicy),
                    latexRootDegree(cell?.renderNode?.degreeText)
                ),
                rootShellWidth(cell, semanticLayout, displayLayout)
            )
        );
    }

    if (resolvedOptions.inlineDisplayShells && hasVisibleRootCore(cell)) {
        const { coreNode } = decomposeVisibleShells(cell.renderNode, resolvedOptions);

        if (coreNode?.type === "root") {
            return wrapLatexColor(
                p4Cell(
                    renderRootShellLatex(
                        renderNodeAsFixedP4Width(rootContentNode(coreNode), semanticSpanCount, cellWidths, colorResolvedOptions),
                        resolveNodeShellColorName(coreNode, shellColorsEnabled, shellColorPolicy),
                        latexRootDegree(coreNode?.degreeText)
                    ),
                    inlineShellWidth
                )
            );
        }
    }

    if (isWrappedPowerCell(cell) || cell?.renderNode?.type === "group" || cell?.renderNode?.type === "function") {
        const { coreNode } = decomposeVisibleShells(cell.renderNode, resolvedOptions);
        const projectedCoreCell = buildProjectedCoreCell(cell, resolvedOptions);
        const coreBounds = resolveCellSemanticBounds(projectedCoreCell);
        const coreWidths = coreBounds.semanticSpanCount > 1
            ? widthsForSpan(semanticLayout, coreBounds.semanticStart, coreBounds.semanticEnd)
            : [columnWidthFor(semanticLayout, coreBounds.semanticStart)];
        const projectedCoreFractionLatex = renderProjectedFractionShellCellLatex(
            projectedCoreCell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedOptions,
                step: options?.step ?? null,
                stepBaseY: options?.stepBaseY,
                stepHeight: options?.stepHeight,
                stepIndex: options?.stepIndex ?? 0,
                stepCells: options?.stepCells ?? []
            },
            shellColorsEnabled,
            shellColorPolicy
        );

        if (projectedCoreFractionLatex) {
            return projectedCoreFractionLatex;
        }

        if (coreNode?.type === "root") {
            return wrapLatexColor(
                p4Cell(
                    renderRootShellLatex(
                        renderNodeAsFixedP4Width(rootContentNode(coreNode), coreBounds.semanticSpanCount, coreWidths, colorResolvedOptions),
                        resolveNodeShellColorName(coreNode, shellColorsEnabled, shellColorPolicy),
                        latexRootDegree(coreNode?.degreeText)
                    ),
                    rootShellWidth(projectedCoreCell, semanticLayout, displayLayout)
                )
            );
        }

        return renderNodeAsFixedP4Width(coreNode, coreBounds.semanticSpanCount, coreWidths, colorResolvedOptions);
    }

    if (cell?.renderNode?.type === "negation") {
        if (containsNestedInlineShell(cell.renderNode?.content)) {
            return p4Cell(
                renderNodeToLatex(cell.renderNode, [], colorResolvedOptions),
                spanWidth(semanticLayout, semanticStart, semanticEnd)
            );
        }

        return renderNodeAsFixedP4Width(cell.renderNode, semanticSpanCount, cellWidths, colorResolvedOptions);
    }

    if (cell?.renderNode) {
        return renderNodeToLatex(cell.renderNode, cellWidths, colorResolvedOptions);
    }

    return escapeLatexMathAtom(cell?.text || "");
}

function usesInlineDisplayShellCell(cell, options = {}) {
    const resolvedOptions = resolveRenderOptions(options);

    if (!resolvedOptions.inlineDisplayShells) {
        return false;
    }

    return cell?.renderNode?.type === "root"
        || cell?.renderNode?.type === "function"
        || (cell?.renderNode?.type === "group" && !resolvedOptions.suppressOuterGroupShell)
        || isWrappedPowerCell(cell)
        || hasVisibleRootCore(cell);
}

function cellRepresentsClosedChromeShell(cell = null) {
    if (cellRequiresStructuredShellProjection(cell)) {
        return false;
    }

    return renderIdentityMatchesClosedChromeShell(cell);
}

function buildSemanticCoreLatex(node, semanticStart, semanticEnd, semanticLayout = null, options = {}) {
    const semanticSpanCount = Math.max(1, semanticEnd - semanticStart + 1);
    const cellWidths = semanticSpanCount > 1
        ? widthsForSpan(semanticLayout, semanticStart, semanticEnd)
        : [columnWidthFor(semanticLayout, semanticStart)];

    if (!node) {
        return renderNodeAsFixedP4Width(null, semanticSpanCount, cellWidths, options);
    }

    if (node.type === "root") {
        return renderNodeAsFixedP4Width(node, semanticSpanCount, cellWidths, options);
    }

    return renderNodeAsFixedP4Width(node, semanticSpanCount, cellWidths, options);
}

function buildDisplaySlotFragments(cell, semanticLayout = null, displayLayout = null, options = {}, stepIndex = 0, shellColorsEnabled = false, shellColorPolicy = null) {
    const resolvedOptions = resolveRenderOptions(options);
    const colorResolvedOptions = {
        ...resolvedOptions,
        shellColorsEnabled,
        shellColorPolicy
    };
    const bounds = resolveDisplaySlotBounds(cell, displayLayout, stepIndex, resolvedOptions);
    const {
        semanticStart,
        semanticEnd,
        semanticStartSlot,
        semanticEndSlot
    } = bounds;
    const shellModel = decomposeVisibleShells(cell?.renderNode, resolvedOptions);
    const projectedCoreCell = buildProjectedCoreCell(cell, resolvedOptions);
    const coreBounds = resolveCellSemanticBounds(projectedCoreCell);
    const coreDisplayBounds = cellRequiresStructuredShellProjection(cell, resolvedOptions)
        ? resolveDisplaySlotBounds(projectedCoreCell, displayLayout, stepIndex, resolvedOptions)
        : bounds;
    const fragments = [];

    if (!cell?.renderNode) {
        return {
            bounds,
            fragments
        };
    }

    if (cellRepresentsClosedChromeShell(cell)) {
        return {
            bounds,
            fragments
        };
    }

    if (resolvedOptions.preserveStructuredSpan && cell?.renderNode?.type === "power") {
        return {
            bounds,
            fragments
        };
    }

    if (
        cell?.renderNode?.type === "fraction"
        && (
            (Array.isArray(cell?.collapsedProjectionAtoms) && cell.collapsedProjectionAtoms.length > 0)
            || (Array.isArray(cell?.collapsedProjectionCells) && cell.collapsedProjectionCells.length > 0)
        )
    ) {
        const collapsedFraction = buildCollapsedFractionCellFormula(
            cell,
            semanticLayout,
            displayLayout,
            resolvedOptions,
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );

        return {
            bounds,
            fragments: [{
                slotStart: collapsedFraction.slotStart ?? bounds.displayStartSlot,
                slotEnd: collapsedFraction.slotEnd ?? bounds.displayEndSlot,
                widthEm: collapsedFraction.widthEm,
                latex: collapsedFraction.latex
            }]
        };
    }

    shellModel.shells.forEach((shell) => {
        if (shell.kind === "group") {
            const leftSlot = groupLeftSlotIndex(displayLayout, semanticStart);
            const rightSlot = groupRightSlotIndex(displayLayout, semanticEnd);
            const contentLatex = groupedContentLatex(cell, semanticLayout);
            const shellColorName = resolveNodeShellColorName(shell.node, shellColorsEnabled, shellColorPolicy);

            if (Number.isInteger(leftSlot)) {
                fragments.push({
                    slotStart: leftSlot,
                    slotEnd: leftSlot,
                    widthEm: displaySlotWidth(displayLayout, leftSlot),
                    latex: wrapLatexColor(
                        p4Cell(`\\left(\\vphantom{${contentLatex}}\\right.`, displaySlotWidth(displayLayout, leftSlot)),
                        shellColorName
                    )
                });
            }

            if (Number.isInteger(rightSlot)) {
                fragments.push({
                    slotStart: rightSlot,
                    slotEnd: rightSlot,
                    widthEm: displaySlotWidth(displayLayout, rightSlot),
                    latex: wrapLatexColor(
                        p4Cell(`\\left.\\vphantom{${contentLatex}}\\right)`, displaySlotWidth(displayLayout, rightSlot)),
                        shellColorName
                    )
                });
            }

            return;
        }

        if (shell.kind === "function") {
            const nameSlot = functionNameSlotIndex(displayLayout, semanticStart);
            const leftSlot = functionLeftSlotIndex(displayLayout, semanticStart);
            const rightSlot = functionRightSlotIndex(displayLayout, semanticEnd);
            const argumentLatex = functionArgumentLatex(cell, semanticLayout);
            const shellColorName = resolveNodeShellColorName(shell.node, shellColorsEnabled, shellColorPolicy);

            if (Number.isInteger(nameSlot)) {
                fragments.push({
                    slotStart: nameSlot,
                    slotEnd: nameSlot,
                    widthEm: displaySlotWidth(displayLayout, nameSlot),
                    latex: wrapLatexColor(
                        p4Cell(latexFunctionName(shell.node.name, shell.node.baseText), displaySlotWidth(displayLayout, nameSlot)),
                        shellColorName
                    )
                });
            }

            if (Number.isInteger(leftSlot)) {
                fragments.push({
                    slotStart: leftSlot,
                    slotEnd: leftSlot,
                    widthEm: displaySlotWidth(displayLayout, leftSlot),
                    latex: wrapLatexColor(
                        p4Cell(`\\left(\\vphantom{${argumentLatex}}\\right.`, displaySlotWidth(displayLayout, leftSlot)),
                        shellColorName
                    )
                });
            }

            if (Number.isInteger(rightSlot)) {
                fragments.push({
                    slotStart: rightSlot,
                    slotEnd: rightSlot,
                    widthEm: displaySlotWidth(displayLayout, rightSlot),
                    latex: wrapLatexColor(
                        p4Cell(`\\left.\\vphantom{${argumentLatex}}\\right)`, displaySlotWidth(displayLayout, rightSlot)),
                        shellColorName
                    )
                });
            }

            return;
        }

        if (shell.kind === "power" && needsPowerParens(shell.node.base)) {
            const leftSlot = powerLeftSlotIndex(displayLayout, semanticStart);
            const rightSlot = powerRightSlotIndex(displayLayout, semanticEnd);
            const baseLatex = wrappedPowerBaseLatex(cell, semanticLayout);
            const shellColorName = resolveNodeShellColorName(shell.node, shellColorsEnabled, shellColorPolicy);
            const exponentLatex = renderPowerExponentLatex(shell.node, {
                shellColorsEnabled,
                shellColorPolicy
            }, shellColorName);

            if (Number.isInteger(leftSlot)) {
                fragments.push({
                    slotStart: leftSlot,
                    slotEnd: leftSlot,
                    widthEm: displaySlotWidth(displayLayout, leftSlot),
                    latex: wrapLatexColor(
                        p4Cell(`\\left(\\vphantom{${baseLatex}}\\right.`, displaySlotWidth(displayLayout, leftSlot)),
                        shellColorName
                    )
                });
            }

            if (Number.isInteger(rightSlot)) {
                fragments.push({
                    slotStart: rightSlot,
                    slotEnd: rightSlot,
                    widthEm: displaySlotWidth(displayLayout, rightSlot),
                    latex: wrapLatexColor(
                        p4Cell(`\\left.\\vphantom{${baseLatex}}\\right)^{${exponentLatex}}`, displaySlotWidth(displayLayout, rightSlot)),
                        shellColorName
                    )
                });
            }
        }
    });

    if (shellModel.coreNode?.type === "root") {
        const rootSlot = rootLeadSlotIndex(displayLayout, coreBounds.semanticStart);
        const slotStart = Number.isInteger(rootSlot) ? rootSlot : coreDisplayBounds.displayStartSlot;
        const slotEnd = coreDisplayBounds.displayEndSlot ?? slotStart ?? 0;
        const totalWidth = displaySlotSpanWidth(displayLayout, slotStart, slotEnd);
        const semanticSpanCount = Math.max(1, coreBounds.semanticEnd - coreBounds.semanticStart + 1);
        const cellWidths = semanticSpanCount > 1
            ? widthsForSpan(semanticLayout, coreBounds.semanticStart, coreBounds.semanticEnd)
            : [columnWidthFor(semanticLayout, coreBounds.semanticStart)];

        const projectedRootShellLatex = renderProjectedRootShellCellLatex(
            projectedCoreCell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedOptions,
                step: options?.step ?? null,
                stepBaseY: options?.stepBaseY,
                stepHeight: options?.stepHeight,
                stepIndex,
                stepCells: options?.stepCells ?? []
            },
            shellColorsEnabled,
            shellColorPolicy,
            totalWidth
        );

        fragments.push({
            slotStart,
            slotEnd,
            widthEm: totalWidth,
            latex: projectedRootShellLatex || wrapLatexColor(
                p4Cell(
                    renderRootShellLatex(
                        renderNodeAsFixedP4Width(rootContentNode(shellModel.coreNode), semanticSpanCount, cellWidths, colorResolvedOptions),
                        resolveNodeShellColorName(shellModel.coreNode, shellColorsEnabled, shellColorPolicy),
                        latexRootDegree(shellModel.coreNode?.degreeText)
                    ),
                    totalWidth
                )
            )
        });
    } else {
        fragments.push({
            slotStart: coreDisplayBounds.displayStartSlot ?? bounds.displayStartSlot,
            slotEnd: coreDisplayBounds.displayEndSlot ?? bounds.displayEndSlot,
            widthEm: spanWidth(semanticLayout, coreBounds.semanticStart, coreBounds.semanticEnd),
            latex: buildSemanticCoreLatex(
                shellModel.coreNode,
                coreBounds.semanticStart,
                coreBounds.semanticEnd,
                semanticLayout,
                colorResolvedOptions
            )
        });
    }

    return {
        bounds,
        fragments
    };
}

function buildFixedP4Row(cells, colStart, colEnd, semanticLayout = null, displayLayout = null, options = {}) {
    const byStartCol = new Map();
    const parts = [];

    cells.forEach((cell) => {
        const startCol = resolveCellSemanticBounds(cell).semanticStart;
        byStartCol.set(startCol, cell);
    });

    for (let col = colStart; col <= colEnd;) {
        const cell = byStartCol.get(col);

        if (!cell) {
            parts.push(p4Cell("", columnWidthFor(semanticLayout, col)));
            col += 1;
            continue;
        }

        const cellLatex = cellToLatex(cell, semanticLayout, displayLayout, options);

        if (hasCellSpan(cell) || usesInlineDisplayShellCell(cell, options)) {
            parts.push(cellLatex);
            col = cell.colEnd + 1;
            continue;
        }

        parts.push(p4Cell(cellLatex, columnWidthFor(semanticLayout, col)));
        col += 1;
    }

    return parts.join("");
}

function sortRowCells(cells = []) {
    return [...cells].sort((left, right) => {
        if ((left?.row ?? 0) !== (right?.row ?? 0)) {
            return (left?.row ?? 0) - (right?.row ?? 0);
        }

        return resolveCellSemanticBounds(left).semanticStart - resolveCellSemanticBounds(right).semanticStart;
    });
}

function buildStandaloneCellLatex(cell, semanticLayout = null, displayLayout = null, options = {}, shellColorsEnabled = false, shellColorPolicy = null) {
    const resolvedOptions = resolveRenderOptions(options);
    const bounds = resolveCellSemanticBounds(cell);
    const cellLatex = cellToLatex(
        cell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedOptions,
                step: options?.step ?? null,
                stepBaseY: options?.stepBaseY,
                stepHeight: options?.stepHeight,
                stepIndex: options?.stepIndex ?? 0,
                stepCells: options?.stepCells ?? []
            },
            shellColorsEnabled,
            shellColorPolicy
        );
    const isAtomicTextCell = !cell?.renderNode || cell?.renderNode?.type === "text";
    const preservesOwnProjectionWidth = cell?.projectionRole === "function_name"
        || cell?.projectionRole === "power_exponent";
    const explicitDelimiterCell = matchingExplicitShellRole(cell?.projectionRole) !== null;
    const spanWidthEm = spanWidth(semanticLayout, bounds.semanticStart, bounds.semanticEnd);

    if (preservesOwnProjectionWidth) {
        return cellLatex;
    }

    if (explicitDelimiterCell) {
        const displayBounds = resolveDisplaySlotBounds(
            cell,
            displayLayout,
            options?.stepIndex ?? 0,
            resolvedOptions
        );
        const explicitWidthEm = displayLayout
            ? displaySlotSpanWidth(displayLayout, displayBounds.displayStartSlot, displayBounds.displayEndSlot)
            : spanWidthEm;

        return p4Cell(cellLatex, explicitWidthEm);
    }

    if (
        resolvedOptions.preserveStructuredSpan
        && hasCellSpan(cell)
        && !cellRepresentsClosedChromeShell(cell)
        && !usesInlineDisplayShellCell(cell, resolvedOptions)
        && !isAtomicTextCell
    ) {
        return p4Cell(cellLatex, spanWidthEm);
    }

    if (
        hasCellSpan(cell)
        || usesInlineDisplayShellCell(cell, resolvedOptions)
        || !isAtomicTextCell
    ) {
        return cellLatex;
    }

    return p4Cell(
        cellLatex,
        spanWidthEm
    );
}

function buildFractionDisplayRow(cells, semanticLayout = null, displayLayout = null, options = {}, stepIndex = 0, shellColorsEnabled = false, shellColorPolicy = null) {
    if (!cells.length) {
        return {
            slotStart: 0,
            slotEnd: 0,
            displaySlotStart: 0,
            displaySlotEnd: 0,
            widthEm: 0,
            latex: "",
            axisAboveEm: 0.52,
            axisBelowEm: 0.28
        };
    }

    const resolvedOptions = resolveRenderOptions(options);
    const sortedCells = sortRowCells(cells);
    const parts = [];
    let widthEm = 0;
    let cursorCol = null;
    let displaySlotStart = null;
    let displaySlotEnd = null;

    sortedCells.forEach((cell) => {
        const bounds = resolveCellSemanticBounds(cell);

        if (cursorCol !== null && bounds.semanticStart > cursorCol) {
            for (let col = cursorCol; col < bounds.semanticStart; col += 1) {
                const gapWidth = columnWidthFor(semanticLayout, col);
                parts.push(p4Cell("", gapWidth));
                widthEm += gapWidth;
            }
        }
        const { bounds: displayBounds, fragments: cellFragments } = buildDisplaySlotFragments(
            cell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedOptions,
                step: options?.step ?? null,
                stepBaseY: options?.stepBaseY,
                stepHeight: options?.stepHeight,
                stepCells: options?.stepCells ?? []
            },
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );
        const fragmentDisplayStart = cellFragments.length > 0
            ? Math.min(...cellFragments.map((cellFragment) => cellFragment.slotStart))
            : displayBounds.displayStartSlot;
        const fragmentDisplayEnd = cellFragments.length > 0
            ? Math.max(...cellFragments.map((cellFragment) => cellFragment.slotEnd))
            : displayBounds.displayEndSlot;

        displaySlotStart = displaySlotStart === null
            ? fragmentDisplayStart
            : Math.min(displaySlotStart, fragmentDisplayStart);
        displaySlotEnd = displaySlotEnd === null
            ? fragmentDisplayEnd
            : Math.max(displaySlotEnd, fragmentDisplayEnd);

        if (cellFragments.length > 0) {
            const orderedFragments = [...cellFragments].sort((left, right) => left.slotStart - right.slotStart);
            let slotCursor = orderedFragments[0]?.slotStart ?? displayBounds.displayStartSlot;

            orderedFragments.forEach((cellFragment) => {
                for (let slotIndex = slotCursor; slotIndex < cellFragment.slotStart; slotIndex += 1) {
                    const gapWidth = displaySlotWidth(displayLayout, slotIndex);
                    parts.push(p4Cell("", gapWidth));
                    widthEm += gapWidth;
                }

                parts.push(cellFragment.latex);
                widthEm += cellFragment.widthEm ?? displaySlotSpanWidth(displayLayout, cellFragment.slotStart, cellFragment.slotEnd);
                slotCursor = cellFragment.slotEnd + 1;
            });

            const lastFragmentSlotEnd = orderedFragments.at(-1)?.slotEnd ?? displayBounds.displayEndSlot;

            for (let slotIndex = slotCursor; slotIndex <= lastFragmentSlotEnd; slotIndex += 1) {
                const gapWidth = displaySlotWidth(displayLayout, slotIndex);
                parts.push(p4Cell("", gapWidth));
                widthEm += gapWidth;
            }
        } else {
            parts.push(buildStandaloneCellLatex(
                cell,
                semanticLayout,
                displayLayout,
                {
                    ...resolvedOptions,
                    step: options?.step ?? null,
                    stepBaseY: options?.stepBaseY,
                    stepHeight: options?.stepHeight,
                    stepIndex,
                    stepCells: options?.stepCells ?? cells
                },
                shellColorsEnabled,
                shellColorPolicy
            ));
            widthEm += usesInlineDisplayShellCell(cell, resolvedOptions)
                ? cellDisplayWidth(cell, displayLayout)
                : spanWidth(semanticLayout, bounds.semanticStart, bounds.semanticEnd);
        }

        cursorCol = bounds.semanticEnd + 1;
    });

    const firstBounds = resolveCellSemanticBounds(sortedCells[0]);
    const lastBounds = resolveCellSemanticBounds(sortedCells[sortedCells.length - 1]);

    return {
        slotStart: firstBounds.semanticStart,
        slotEnd: lastBounds.semanticEnd,
        displaySlotStart: displaySlotStart ?? firstBounds.semanticStart,
        displaySlotEnd: displaySlotEnd ?? lastBounds.semanticEnd,
        widthEm,
        latex: parts.join(""),
        ...resolveDisplayRowAxisExtents(sortedCells),
        requiresEdgeAlignment: sortedCells.some((cell) => (
            cell?.renderNode?.type === "fraction"
            || cell?.renderNode?.layout?.containsFraction === true
            || (Array.isArray(cell?.collapsedProjectionAtoms) && cell.collapsedProjectionAtoms.length > 0)
            || (Array.isArray(cell?.collapsedProjectionCells) && cell.collapsedProjectionCells.length > 0)
        ))
    };
}

function centerDisplayRowToWidth(row, targetWidthEm = 0) {
    const rowWidthEm = row?.widthEm ?? 0;

    if (!(targetWidthEm > 0)) {
        return row?.latex || "";
    }

    if (Math.abs(rowWidthEm - targetWidthEm) <= 0.001) {
        return row?.latex || "";
    }

    return `\\makebox[${formatEm(targetWidthEm)}em][c]{\\ensuremath{${row?.latex || ""}}}`;
}

function expandDisplayRowToSlotSpan(row, targetSlotStart = 0, targetSlotEnd = targetSlotStart, displayLayout = null) {
    if (!row?.latex) {
        return "";
    }

    if (!displayLayout) {
        return row.latex;
    }

    const rowSlotStart = Number.isInteger(row?.displaySlotStart) ? row.displaySlotStart : targetSlotStart;
    const rowSlotEnd = Number.isInteger(row?.displaySlotEnd) ? row.displaySlotEnd : targetSlotEnd;
    const parts = [];

    for (let slotIndex = targetSlotStart; slotIndex < rowSlotStart; slotIndex += 1) {
        parts.push(p4Cell("", displaySlotWidth(displayLayout, slotIndex)));
    }

    parts.push(row.latex);

    for (let slotIndex = rowSlotEnd + 1; slotIndex <= targetSlotEnd; slotIndex += 1) {
        parts.push(p4Cell("", displaySlotWidth(displayLayout, slotIndex)));
    }

    return parts.join("");
}

function fitDisplayRowToFractionSpan(
    row,
    targetSlotStart = 0,
    targetSlotEnd = targetSlotStart,
    displayLayout = null,
    minimumTargetWidthEm = 0
) {
    if (!row?.latex) {
        return "";
    }

    const slotSpanWidthEm = displayLayout
        ? displaySlotSpanWidth(displayLayout, targetSlotStart, targetSlotEnd)
        : 0;
    const targetWidthEm = Math.max(
        slotSpanWidthEm,
        Number.isFinite(minimumTargetWidthEm) ? minimumTargetWidthEm : 0
    );
    const rowWidthEm = Number(row?.widthEm) || 0;

    if (
        displayLayout
        && row?.requiresEdgeAlignment === true
        && Number.isInteger(row?.displaySlotStart)
        && Number.isInteger(row?.displaySlotEnd)
    ) {
        const expandedLatex = expandDisplayRowToSlotSpan(row, targetSlotStart, targetSlotEnd, displayLayout);
        if (Math.abs(targetWidthEm - slotSpanWidthEm) <= 0.001) {
            return expandedLatex;
        }

        return centerDisplayRowToWidth({
            ...row,
            widthEm: slotSpanWidthEm,
            latex: expandedLatex
        }, targetWidthEm);
    }

    return centerDisplayRowToWidth(row, targetWidthEm);
}

function cellOverlapsSemanticSpan(cell, colStart = 0, colEnd = colStart) {
    const bounds = resolveCellSemanticBounds(cell);
    return bounds.semanticStart <= colEnd && bounds.semanticEnd >= colStart;
}

function collectPowerRenderNodes(node, result = []) {
    if (!node || typeof node !== "object") {
        return result;
    }

    if (node.type === "power") {
        result.push(node);
        collectPowerRenderNodes(node.base, result);
        return result;
    }

    if (node.type === "sequence") {
        (node.items || []).forEach((item) => collectPowerRenderNodes(item, result));
        return result;
    }

    if (node.type === "negation") {
        collectPowerRenderNodes(node.content, result);
        return result;
    }

    if (node.type === "multiplication") {
        collectPowerRenderNodes(node.left, result);
        collectPowerRenderNodes(node.right, result);
        return result;
    }

    if (node.type === "fraction") {
        collectPowerRenderNodes(node.numerator, result);
        collectPowerRenderNodes(node.denominator, result);
        return result;
    }

    if (node.type === "group") {
        collectPowerRenderNodes(node.content, result);
        return result;
    }

    if (node.type === "function") {
        collectPowerRenderNodes(node.argument, result);
    }

    return result;
}

function buildProjectionPreservingFractionChildCells(rawCells = [], renderNode = null, contentRow = 0, exponentRow = null) {
    const contentCells = sortRowCells(rawCells.filter((cell) => cell?.row === contentRow));

    if (!renderNode) {
        return contentCells;
    }

    const powerNodes = collectPowerRenderNodes(renderNode, []);
    const powerByBaseAtomId = new Map();
    powerNodes.forEach((powerNode) => {
        const baseAtomId = powerNode?.base?.sourceAtomId;
        if (typeof baseAtomId === "string" && baseAtomId.length > 0) {
            powerByBaseAtomId.set(baseAtomId, powerNode);
        }
    });

    const exponentByShellId = new Map();
    if (Number.isInteger(exponentRow)) {
        rawCells
            .filter((cell) => cell?.row === exponentRow && cell?.projectionRole === "power_exponent")
            .forEach((cell) => {
                if (typeof cell?.sourceAtomId === "string" && cell.sourceAtomId.length > 0) {
                    exponentByShellId.set(cell.sourceAtomId, cell);
                }
            });
    }

    const currentRenderNodeKeys = renderNodeIdentityKeys(renderNode);
    const cellBelongsToAncestorShell = (cell, shellId) => {
        if (!cell || typeof shellId !== "string" || shellId.length === 0) {
            return false;
        }

        if (cell?.sourceShellId === shellId || cell?.sourceAtomId === shellId) {
            return true;
        }

        return Array.isArray(cell?.visibleAncestorShells)
            && cell.visibleAncestorShells.some((descriptor) => descriptor?.shellId === shellId);
    };
    const resolveNearestNestedFractionAncestor = (cell) => {
        const ancestors = Array.isArray(cell?.visibleAncestorShells) ? cell.visibleAncestorShells : [];

        for (const descriptor of ancestors) {
            const shellId = descriptor?.shellId;
            const shellRenderNode = descriptor?.renderNode;
            const shellIdentityKeys = renderNodeIdentityKeys(shellRenderNode);

            if (
                typeof shellId !== "string"
                || shellId.length === 0
                || !shellRenderNode
                || shellRenderNode?.type !== "fraction"
                || currentRenderNodeKeys.has(shellId)
                || [...shellIdentityKeys].some((identityKey) => currentRenderNodeKeys.has(identityKey))
            ) {
                continue;
            }

            const shellMemberCells = rawCells.filter((memberCell) => cellBelongsToAncestorShell(memberCell, shellId));

            if (
                !shellMemberCells.some((memberCell) => memberCell?.row !== contentRow)
                || !shellMemberCells.some((memberCell) => (
                    memberCell?.kind === "fraction_line"
                    && (memberCell?.sourceShellId === shellId || memberCell?.sourceAtomId === shellId)
                ))
            ) {
                continue;
            }

            return {
                shellId,
                renderNode: shellRenderNode,
                memberCells: shellMemberCells
            };
        }

        return null;
    };
    const collapsedNestedFractions = new Map();

    contentCells.forEach((cell) => {
        const nestedFractionAncestor = resolveNearestNestedFractionAncestor(cell);

        if (!nestedFractionAncestor || collapsedNestedFractions.has(nestedFractionAncestor.shellId)) {
            return;
        }

        const contentRowMembers = sortRowCells(
            contentCells.filter((memberCell) => cellBelongsToAncestorShell(memberCell, nestedFractionAncestor.shellId))
        );

        if (!contentRowMembers.length) {
            return;
        }

        const semanticBounds = nestedFractionAncestor.memberCells.map((memberCell) => resolveCellSemanticBounds(memberCell));
        const semanticStart = semanticBounds.reduce(
            (min, bounds) => Math.min(min, bounds.semanticStart),
            semanticBounds[0]?.semanticStart ?? contentRowMembers[0]?.colStart ?? contentRowMembers[0]?.col ?? 0
        );
        const semanticEnd = semanticBounds.reduce(
            (max, bounds) => Math.max(max, bounds.semanticEnd),
            semanticBounds[0]?.semanticEnd ?? contentRowMembers.at(-1)?.colEnd ?? contentRowMembers.at(-1)?.col ?? semanticStart
        );

        collapsedNestedFractions.set(nestedFractionAncestor.shellId, {
            ...nestedFractionAncestor,
            anchorCellId: contentRowMembers[0]?.id ?? null,
            semanticStart,
            semanticEnd
        });
    });

    return contentCells.flatMap((cell) => {
        const collapsedFraction = [...collapsedNestedFractions.values()].find((descriptor) => (
            cellBelongsToAncestorShell(cell, descriptor.shellId)
        ));

        if (collapsedFraction) {
            if (cell?.id !== collapsedFraction.anchorCellId) {
                return [];
            }

            return [{
                ...cell,
                id: `fraction-inline-shell::${collapsedFraction.shellId}::${cell.id}`,
                col: collapsedFraction.semanticStart,
                colStart: collapsedFraction.semanticStart,
                colEnd: collapsedFraction.semanticEnd,
                renderNode: collapsedFraction.renderNode,
                projectionRole: null,
                sourceAtomId: collapsedFraction.shellId,
                sourceShellId: collapsedFraction.shellId,
                collapsedProjectionCells: collapsedFraction.memberCells
            }];
        }

        const powerNode = powerByBaseAtomId.get(cell?.sourceAtomId);
        const exponentCell = powerNode ? exponentByShellId.get(powerNode?.sourceAtomId) : null;

        if (powerNode && exponentCell) {
            const contentBounds = resolveCellSemanticBounds(cell);
            const exponentBounds = resolveCellSemanticBounds(exponentCell);

            return [{
                ...cell,
                id: `fraction-structured::${powerNode.sourceAtomId}::${cell.id}`,
                col: contentBounds.semanticStart,
                colStart: contentBounds.semanticStart,
                colEnd: Math.max(contentBounds.semanticEnd, exponentBounds.semanticEnd),
                text: `${cell.text}^${powerNode.exponent || "2"}`,
                renderNode: powerNode,
                projectionRole: null,
                sourceAtomId: powerNode.sourceAtomId
            }];
        }

        return [cell];
    });
}

function renderNodeIdentityKeys(renderNode = null) {
    return new Set(
        [
            renderNode?.sourceAtomId,
            renderNode?.sourceShellId,
            renderNode?.shellId
        ].filter((value) => typeof value === "string" && value.length > 0)
    );
}

function cellMatchesStructuredRenderNode(cell, renderNode = null) {
    if (!cell || !renderNode) {
        return false;
    }

    const identityKeys = renderNodeIdentityKeys(renderNode);

    if (identityKeys.size === 0) {
        return false;
    }

    if (
        identityKeys.has(cell?.sourceAtomId)
        || identityKeys.has(cell?.sourceShellId)
    ) {
        return true;
    }

    if (renderNode?.type === "text") {
        return false;
    }

    return (Array.isArray(cell?.visibleAncestorShells) ? cell.visibleAncestorShells : []).some((descriptor) => (
        identityKeys.has(descriptor?.shellId)
    ));
}

function resolveStructuredFractionChildMemberCells(rawCells = [], renderNode = null, contentRow = 0, exponentRow = null) {
    return sortRowCells(rawCells.filter((cell) => {
        if (!cellMatchesStructuredRenderNode(cell, renderNode)) {
            return false;
        }

        if (cell?.row === contentRow) {
            return true;
        }

        if (Number.isInteger(exponentRow) && cell?.row === exponentRow && cell?.projectionRole === "power_exponent") {
            return true;
        }

        return true;
    }));
}

function collectStructuredRenderNodeMemberIds(rawCells = [], renderNode = null, contentRow = 0, exponentRow = null) {
    if (!renderNode) {
        return [];
    }

    if (renderNode?.type === "sequence" && Array.isArray(renderNode.items) && renderNode.items.length > 0) {
        return [...new Set(
            renderNode.items.flatMap((item) => collectStructuredRenderNodeMemberIds(rawCells, item, contentRow, exponentRow))
        )];
    }

    return resolveStructuredFractionChildMemberCells(rawCells, renderNode, contentRow, exponentRow)
        .map((cell) => cell?.id)
        .filter((id) => typeof id === "string" && id.length > 0);
}

function collectStructuredRenderNodeMemberCells(rawCells = [], renderNode = null, contentRow = 0, exponentRow = null) {
    if (!renderNode) {
        return [];
    }

    if (renderNode?.type === "sequence" && Array.isArray(renderNode.items) && renderNode.items.length > 0) {
        const seen = new Set();

        return renderNode.items
            .flatMap((item) => collectStructuredRenderNodeMemberCells(rawCells, item, contentRow, exponentRow))
            .filter((cell) => {
                const id = String(cell?.id || "");
                if (!id || seen.has(id)) {
                    return false;
                }

                seen.add(id);
                return true;
            });
    }

    return resolveStructuredFractionChildMemberCells(rawCells, renderNode, contentRow, exponentRow);
}

function createStructuredFractionChildSyntheticCell(renderNode = null, rawCells = [], contentRow = 0, exponentRow = null) {
    const memberCells = resolveStructuredFractionChildMemberCells(rawCells, renderNode, contentRow, exponentRow);

    if (memberCells.length === 0) {
        return null;
    }

    const semanticBounds = memberCells.map((cell) => resolveCellSemanticBounds(cell));
    const semanticStart = semanticBounds.reduce(
        (min, bounds) => Math.min(min, bounds.semanticStart),
        semanticBounds[0]?.semanticStart ?? 0
    );
    const semanticEnd = semanticBounds.reduce(
        (max, bounds) => Math.max(max, bounds.semanticEnd),
        semanticBounds[0]?.semanticEnd ?? semanticStart
    );
    const anchorCell = memberCells.find((cell) => cell?.row === contentRow) || memberCells[0];

    return {
        ...anchorCell,
        id: `synthetic-fraction-child::${renderNode?.shellId || renderNode?.sourceAtomId || anchorCell?.id || "unknown"}::${contentRow}`,
        row: contentRow,
        col: semanticStart,
        colStart: semanticStart,
        colEnd: semanticEnd,
        text: renderNode?.type === "text" ? (renderNode?.text || anchorCell?.text || "") : (anchorCell?.text || ""),
        renderNode: renderNode || anchorCell?.renderNode || null,
        projectionRole: null,
        sourceAtomId: renderNode?.sourceAtomId || anchorCell?.sourceAtomId || null,
        sourceShellId: renderNode?.shellId || renderNode?.sourceShellId || anchorCell?.sourceShellId || null
    };
}

function buildStructuredFractionChildProjectionCells(rawCells = [], renderNode = null, contentRow = 0, exponentRow = null) {
    if (!renderNode) {
        return buildProjectionPreservingFractionChildCells(rawCells, renderNode, contentRow, exponentRow);
    }

    if (renderNode?.type === "sequence" && Array.isArray(renderNode?.items) && renderNode.items.length > 0) {
        const syntheticCells = renderNode.items
            .map((item) => createStructuredFractionChildSyntheticCell(item, rawCells, contentRow, exponentRow))
            .filter(Boolean);

        if (syntheticCells.length > 0) {
            return sortRowCells(syntheticCells);
        }
    }

    const structuredCell = createStructuredFractionChildSyntheticCell(renderNode, rawCells, contentRow, exponentRow);

    if (structuredCell) {
        return [structuredCell];
    }

    return buildProjectionPreservingFractionChildCells(rawCells, renderNode, contentRow, exponentRow);
}

function buildStructuredFractionChildTopLevelDisplayRow(
    rawCells = [],
    allCells = rawCells,
    renderNode = null,
    contentRow = 0,
    exponentRow = null,
    semanticLayout = null,
    displayLayout = null,
    stepIndex = 0,
    shellColorsEnabled = false,
    shellColorPolicy = null
) {
    const syntheticCells = buildStructuredFractionChildProjectionCells(rawCells, renderNode, contentRow, exponentRow);

    if (!syntheticCells.length) {
        return null;
    }

    const extentCells = collectStructuredRenderNodeMemberCells(
        allCells,
        renderNode,
        contentRow,
        exponentRow
    );

    const resolvedOptions = {
        suppressOuterGroupShell: true,
        preserveStructuredSpan: true,
        inlineDisplayShells: true
    };
    const sortedCells = sortRowCells(syntheticCells);
    const parts = [];
    let widthEm = 0;
    let displaySlotStart = null;
    let displaySlotEnd = null;
    let cursorSlot = null;

    sortedCells.forEach((cell) => {
        const bounds = resolveDisplaySlotBounds(cell, displayLayout, stepIndex, resolvedOptions);

        if (cursorSlot !== null && bounds.displayStartSlot > cursorSlot) {
            for (let slotIndex = cursorSlot; slotIndex < bounds.displayStartSlot; slotIndex += 1) {
                const gapWidth = displaySlotWidth(displayLayout, slotIndex);
                parts.push(p4Cell("", gapWidth));
                widthEm += gapWidth;
            }
        }

        parts.push(buildStandaloneCellLatex(
            cell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedOptions,
                stepIndex,
                stepCells: rawCells
            },
            shellColorsEnabled,
            shellColorPolicy
        ));

        const projectedFragmentWidth = resolveProjectionFragmentDisplayWidth(cell, semanticLayout, displayLayout);
        const cellWidth = projectedFragmentWidth > 0
            ? projectedFragmentWidth
            : (
                (cellRepresentsClosedChromeShell(cell) || usesInlineDisplayShellCell(cell, resolvedOptions))
                    ? cellDisplayWidth(cell, displayLayout)
                    : displaySlotSpanWidth(displayLayout, bounds.displayStartSlot, bounds.displayEndSlot)
            );

        widthEm += cellWidth;
        displaySlotStart = displaySlotStart === null
            ? bounds.displayStartSlot
            : Math.min(displaySlotStart, bounds.displayStartSlot);
        displaySlotEnd = displaySlotEnd === null
            ? bounds.displayEndSlot
            : Math.max(displaySlotEnd, bounds.displayEndSlot);
        cursorSlot = bounds.displayEndSlot + 1;
    });

    return {
        widthEm,
        latex: parts.join(""),
        displaySlotStart,
        displaySlotEnd,
        ...resolveDisplayRowAxisExtents(extentCells.length > 0 ? extentCells : rawCells),
        requiresEdgeAlignment: true
    };
}

function buildCompactDisplayRow(cells, semanticLayout = null, displayLayout = null, options = {}, stepIndex = 0, shellColorsEnabled = false, shellColorPolicy = null) {
    const resolvedOptions = resolveRenderOptions(options);
    const sortedCells = sortRowCells(cells);
    const parts = [];
    let widthEm = 0;
    let displaySlotStart = null;
    let displaySlotEnd = null;

    sortedCells.forEach((cell) => {
        const requiresStandaloneProjectionRender = cell?.projectionRole === "function_name"
            || cell?.projectionRole === "power_exponent"
            || matchingExplicitShellRole(cell?.projectionRole) !== null;
        const bounds = resolveDisplaySlotBounds(cell, displayLayout, stepIndex, resolvedOptions);
        const fragments = requiresStandaloneProjectionRender
            ? []
            : buildDisplaySlotFragments(
                cell,
                semanticLayout,
                displayLayout,
                resolvedOptions,
                stepIndex,
                shellColorsEnabled,
                shellColorPolicy
            ).fragments;

        if (fragments.length > 0) {
            const orderedFragments = [...fragments].sort((left, right) => left.slotStart - right.slotStart);

            orderedFragments.forEach((cellFragment) => {
                parts.push(cellFragment.latex);
                widthEm += cellFragment.widthEm ?? displaySlotSpanWidth(displayLayout, cellFragment.slotStart, cellFragment.slotEnd);
                displaySlotStart = displaySlotStart === null
                    ? cellFragment.slotStart
                    : Math.min(displaySlotStart, cellFragment.slotStart);
                displaySlotEnd = displaySlotEnd === null
                    ? cellFragment.slotEnd
                    : Math.max(displaySlotEnd, cellFragment.slotEnd);
            });

            return;
        }

        const projectedFragmentWidth = resolveProjectionFragmentDisplayWidth(cell, semanticLayout, displayLayout);
        const standaloneWidth = projectedFragmentWidth > 0
            ? projectedFragmentWidth
            : (
                (cellRepresentsClosedChromeShell(cell) || usesInlineDisplayShellCell(cell, resolvedOptions))
                    ? cellDisplayWidth(cell, displayLayout)
                    : displaySlotSpanWidth(displayLayout, bounds.displayStartSlot, bounds.displayEndSlot)
            );

        parts.push(buildStandaloneCellLatex(
            cell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedOptions,
                step: options?.step ?? null,
                stepBaseY: options?.stepBaseY,
                stepHeight: options?.stepHeight,
                stepIndex,
                stepCells: options?.stepCells ?? cells
            },
            shellColorsEnabled,
            shellColorPolicy
        ));
        widthEm += standaloneWidth;
        displaySlotStart = displaySlotStart === null
            ? bounds.displayStartSlot
            : Math.min(displaySlotStart, bounds.displayStartSlot);
        displaySlotEnd = displaySlotEnd === null
            ? bounds.displayEndSlot
            : Math.max(displaySlotEnd, bounds.displayEndSlot);
    });

    return {
        widthEm,
        latex: parts.join(""),
        displaySlotStart,
        displaySlotEnd,
        ...resolveDisplayRowAxisExtents(sortedCells),
        requiresEdgeAlignment: sortedCells.some((cell) => (
            cell?.renderNode?.type === "fraction"
            || cell?.renderNode?.layout?.containsFraction === true
            || (Array.isArray(cell?.collapsedProjectionAtoms) && cell.collapsedProjectionAtoms.length > 0)
            || (Array.isArray(cell?.collapsedProjectionCells) && cell.collapsedProjectionCells.length > 0)
        ))
    };
}

function compactSemanticRowWidth(cells = [], semanticLayout = null) {
    const occupiedCols = new Set();

    (cells || []).forEach((cell) => {
        const { semanticStart, semanticEnd } = resolveCellSemanticBounds(cell);

        for (let col = semanticStart; col <= semanticEnd; col += 1) {
            if (columnWidthFor(semanticLayout, col) > hiddenColumnWidthEm) {
                occupiedCols.add(col);
            }
        }
    });

    return [...occupiedCols]
        .sort((left, right) => left - right)
        .reduce((sum, col) => sum + columnWidthFor(semanticLayout, col), 0);
}

function matchesRenderNodeIdentity(cell, renderNode = null) {
    if (!cell || !renderNode) {
        return false;
    }

    const renderNodeIds = [
        renderNode.sourceAtomId,
        renderNode.sourceShellId,
        renderNode.shellId
    ].filter((value) => typeof value === "string" && value.length > 0);

    if (renderNodeIds.length === 0) {
        return false;
    }

    return renderNodeIds.includes(cell.sourceAtomId) || renderNodeIds.includes(cell.sourceShellId);
}

function buildStructuredFractionChildDisplayRow(
    rawCells = [],
    allCells = rawCells,
    renderNode = null,
    direction = "denominator",
    contentRow = 0,
    exponentRow = null,
    semanticLayout = null,
    displayLayout = null,
    stepIndex = 0,
    shellColorsEnabled = false,
    shellColorPolicy = null
) {
    const renderCompactChildRow = () => {
        const childCells = buildProjectionPreservingFractionChildCells(rawCells, renderNode, contentRow, exponentRow);

        return {
            displayRow: buildCompactDisplayRow(
                childCells,
                semanticLayout,
                displayLayout,
                {
                    suppressOuterGroupShell: true,
                    preserveStructuredSpan: true
                },
                stepIndex,
                shellColorsEnabled,
                shellColorPolicy
            ),
            consumedIds: new Set(
                rawCells
                    .map((cell) => cell?.id)
                    .filter((id) => typeof id === "string" && id.length > 0)
            )
        };
    };

    if (renderNode?.type !== "fraction" && renderNode?.layout?.containsFraction === true) {
        const structuredTopLevelRow = buildStructuredFractionChildTopLevelDisplayRow(
            rawCells,
            allCells,
            renderNode,
            contentRow,
            exponentRow,
            semanticLayout,
            displayLayout,
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );

        if (structuredTopLevelRow) {
            return {
                displayRow: structuredTopLevelRow,
                consumedIds: new Set(
                    rawCells
                        .map((cell) => cell?.id)
                        .filter((id) => typeof id === "string" && id.length > 0)
                )
            };
        }
    }

    if (renderNode?.type === "fraction") {
        const childLineCandidates = rawCells
            .filter((cell) => cell?.kind === "fraction_line" && matchesRenderNodeIdentity(cell, renderNode))
            .sort((left, right) => {
                if (left.row !== right.row) {
                    return direction === "numerator" ? right.row - left.row : left.row - right.row;
                }

                return (left.colStart ?? left.col ?? 0) - (right.colStart ?? right.col ?? 0);
            });
        const childLine = childLineCandidates[0] || null;

        if (childLine) {
            const numeratorRaw = rawCells.filter((cell) => (
                cell.row < childLine.row
                && cellOverlapsSemanticSpan(cell, childLine.colStart ?? childLine.col ?? 0, childLine.colEnd ?? childLine.col ?? 0)
            ));
            const denominatorRaw = rawCells.filter((cell) => (
                cell.row > childLine.row
                && cellOverlapsSemanticSpan(cell, childLine.colStart ?? childLine.col ?? 0, childLine.colEnd ?? childLine.col ?? 0)
            ));
            const hasDeeperFractionLine = [...numeratorRaw, ...denominatorRaw].some((cell) => cell?.kind === "fraction_line");

            if (!hasDeeperFractionLine) {
                const compactNumerator = buildProjectionPreservingFractionChildCells(
                    numeratorRaw,
                    renderNode.numerator,
                    childLine.row - 1,
                    childLine.row - 2
                );
                const compactDenominator = buildProjectionPreservingFractionChildCells(
                    denominatorRaw,
                    renderNode.denominator,
                    childLine.row + 1,
                    childLine.row
                );
                const resolvedOptions = {
                    suppressOuterGroupShell: true,
                    preserveStructuredSpan: true,
                    shellColorsEnabled,
                    shellColorPolicy
                };
                const numeratorWidthEm = Math.max(
                    compactSemanticRowWidth(compactNumerator, semanticLayout),
                    fallbackCellWidthEm
                );
                const denominatorWidthEm = Math.max(
                    compactSemanticRowWidth(compactDenominator, semanticLayout),
                    fallbackCellWidthEm
                );
                const numeratorRow = buildCompactDisplayRow(
                    compactNumerator,
                    semanticLayout,
                    displayLayout,
                    resolvedOptions,
                    stepIndex,
                    shellColorsEnabled,
                    shellColorPolicy
                );
                const denominatorRow = buildCompactDisplayRow(
                    compactDenominator,
                    semanticLayout,
                    displayLayout,
                    resolvedOptions,
                    stepIndex,
                    shellColorsEnabled,
                    shellColorPolicy
                );
                const childBounds = [...compactNumerator, ...compactDenominator].map((cell) => (
                    resolveDisplaySlotBounds(cell, displayLayout, stepIndex, resolvedOptions)
                ));
                const lineBounds = resolveDisplaySlotBounds(childLine, displayLayout, stepIndex, resolvedOptions);
                const compactSlotStart = childBounds.reduce(
                    (minSlot, bounds) => Math.min(minSlot, bounds.displayStartSlot),
                    lineBounds.displayStartSlot
                );
                const compactSlotEnd = childBounds.reduce(
                    (maxSlot, bounds) => Math.max(maxSlot, bounds.displayEndSlot),
                    lineBounds.displayEndSlot
                );
                const compactSlotWidthEm = displayLayout
                    ? displaySlotSpanWidth(displayLayout, compactSlotStart, compactSlotEnd)
                    : 0;
                const compactWidthEm = Math.max(
                    compactSlotWidthEm,
                    numeratorRow?.widthEm || 0,
                    denominatorRow?.widthEm || 0,
                    numeratorWidthEm,
                    denominatorWidthEm,
                    fallbackCellWidthEm
                );

                return {
                    displayRow: {
                        widthEm: compactWidthEm,
                        latex: p4Fraction(
                            compactWidthEm,
                            wrapDisplayRowOnFractionEdge(
                                {
                                    ...numeratorRow,
                                    widthEm: compactWidthEm,
                                    latex: fitDisplayRowToFractionSpan(
                                        numeratorRow,
                                        compactSlotStart,
                                        compactSlotEnd,
                                        displayLayout,
                                        compactWidthEm
                                    )
                                },
                                "bottom"
                            ),
                            wrapDisplayRowOnFractionEdge(
                                {
                                    ...denominatorRow,
                                    widthEm: compactWidthEm,
                                    latex: fitDisplayRowToFractionSpan(
                                        denominatorRow,
                                        compactSlotStart,
                                        compactSlotEnd,
                                        displayLayout,
                                        compactWidthEm
                                    )
                                },
                                "top"
                            )
                        ),
                        ...resolveDisplayRowAxisExtents(rawCells),
                        requiresEdgeAlignment: true
                    },
                    consumedIds: new Set(
                        rawCells
                            .map((cell) => cell?.id)
                            .filter((id) => typeof id === "string" && id.length > 0)
                    )
                };
            }

            const nestedFraction = buildFractionFormulaFromRenderNode(
                {
                    ...childLine,
                    fractionRenderNode: renderNode
                },
                rawCells,
                semanticLayout,
                displayLayout,
                stepIndex,
                shellColorsEnabled,
                shellColorPolicy,
                {
                    tightToContent: true
                }
            );

            return {
                displayRow: {
                    widthEm: nestedFraction.widthEm,
                    latex: nestedFraction.latex,
                    ...resolveDisplayRowAxisExtents(rawCells),
                    requiresEdgeAlignment: true
                },
                consumedIds: nestedFraction.consumedIds
            };
        }
    }

    return renderCompactChildRow();
}

function buildFractionFormulaFromRenderNode(
    line,
    cells,
    semanticLayout = null,
    displayLayout = null,
    stepIndex = 0,
    shellColorsEnabled = false,
    shellColorPolicy = null,
    options = {}
) {
    const colStart = Number.isInteger(line.colStart) ? line.colStart : line.col;
    const colEnd = Number.isInteger(line.colEnd) ? line.colEnd : line.col;
    const tightToContent = options?.tightToContent === true;
    const overlapsFractionSpan = (cell) => (
        cellOverlapsSemanticSpan(cell, colStart, colEnd)
    );
    let numeratorRaw = cells.filter((cell) => (
        cell.row < line.row
        && overlapsFractionSpan(cell)
    ));
    let denominatorRaw = cells.filter((cell) => (
        (
            cell.row > line.row
            || (cell.row === line.row && cell?.projectionRole === "power_exponent")
        )
        && overlapsFractionSpan(cell)
    ));

    if (line?.fractionRenderNode?.numerator?.layout?.containsFraction === true) {
        const structuredNumeratorCells = collectStructuredRenderNodeMemberCells(
            cells,
            line.fractionRenderNode.numerator,
            line.row - 1,
            line.row - 2
        );

        if (structuredNumeratorCells.length > 0) {
            numeratorRaw = structuredNumeratorCells;
        }
    }

    if (line?.fractionRenderNode?.denominator?.layout?.containsFraction === true) {
        const structuredDenominatorCells = collectStructuredRenderNodeMemberCells(
            cells,
            line.fractionRenderNode.denominator,
            line.row + 1,
            line.row
        );

        if (structuredDenominatorCells.length > 0) {
            denominatorRaw = structuredDenominatorCells;
        }
    }
    const numeratorResult = buildStructuredFractionChildDisplayRow(
        numeratorRaw,
        cells,
        line?.fractionRenderNode?.numerator,
        "numerator",
        line.row - 1,
        line.row - 2,
        semanticLayout,
        displayLayout,
        stepIndex,
        shellColorsEnabled,
        shellColorPolicy
    );
    const denominatorResult = buildStructuredFractionChildDisplayRow(
        denominatorRaw,
        cells,
        line?.fractionRenderNode?.denominator,
        "denominator",
        line.row + 1,
        line.row,
        semanticLayout,
        displayLayout,
        stepIndex,
        shellColorsEnabled,
        shellColorPolicy
    );
    const numeratorRow = numeratorResult.displayRow;
    const denominatorRow = denominatorResult.displayRow;
    const lineBounds = resolveDisplaySlotBounds(line, displayLayout, stepIndex);
    const numeratorSlotStart = Number.isInteger(numeratorRow?.displaySlotStart)
        ? numeratorRow.displaySlotStart
        : lineBounds.displayStartSlot;
    const numeratorSlotEnd = Number.isInteger(numeratorRow?.displaySlotEnd)
        ? numeratorRow.displaySlotEnd
        : lineBounds.displayEndSlot;
    const denominatorSlotStart = Number.isInteger(denominatorRow?.displaySlotStart)
        ? denominatorRow.displaySlotStart
        : lineBounds.displayStartSlot;
    const denominatorSlotEnd = Number.isInteger(denominatorRow?.displaySlotEnd)
        ? denominatorRow.displaySlotEnd
        : lineBounds.displayEndSlot;
    const slotStart = tightToContent
        ? Math.min(numeratorSlotStart, denominatorSlotStart)
        : Math.min(lineBounds.displayStartSlot, numeratorSlotStart, denominatorSlotStart);
    const slotEnd = tightToContent
        ? Math.max(numeratorSlotEnd, denominatorSlotEnd)
        : Math.max(lineBounds.displayEndSlot, numeratorSlotEnd, denominatorSlotEnd);
    const fractionSlotWidthEm = displayLayout
        ? displaySlotSpanWidth(displayLayout, slotStart, slotEnd)
        : 0;
    const fractionWidthEm = Math.max(
        fractionSlotWidthEm,
        numeratorRow?.widthEm || 0,
        denominatorRow?.widthEm || 0,
        fallbackCellWidthEm
    );
    const expandedNumeratorRow = {
        ...numeratorRow,
        displaySlotStart: slotStart,
        displaySlotEnd: slotEnd,
        widthEm: fractionWidthEm,
        latex: wrapDisplayRowOnFractionEdge({
            ...numeratorRow,
            widthEm: fractionWidthEm,
            latex: fitDisplayRowToFractionSpan(
                numeratorRow,
                slotStart,
                slotEnd,
                displayLayout,
                fractionWidthEm
            )
        }, "bottom")
    };
    const expandedDenominatorRow = {
        ...denominatorRow,
        displaySlotStart: slotStart,
        displaySlotEnd: slotEnd,
        widthEm: fractionWidthEm,
        latex: wrapDisplayRowOnFractionEdge({
            ...denominatorRow,
            widthEm: fractionWidthEm,
            latex: fitDisplayRowToFractionSpan(
                denominatorRow,
                slotStart,
                slotEnd,
                displayLayout,
                fractionWidthEm
            )
        }, "top")
    };

    return {
        colStart,
        colEnd,
        slotStart,
        slotEnd,
        centerX: displaySlotSpanCenterX(displayLayout, slotStart, slotEnd),
        consumedIds: new Set(
            [
                ...numeratorResult.consumedIds,
                ...denominatorResult.consumedIds,
                line.id
            ].filter((id) => typeof id === "string" && id.length > 0)
        ),
        widthEm: fractionWidthEm,
        latex: p4Fraction(
            fractionWidthEm,
            expandedNumeratorRow.latex,
            expandedDenominatorRow.latex,
            resolveCellShellColorName(line, shellColorsEnabled, "fraction", shellColorPolicy)
        )
    };
}

function buildFractionFormulaFromCells(cells, line, semanticLayout = null, displayLayout = null, stepIndex = 0, shellColorsEnabled = false, shellColorPolicy = null) {
    const colStart = Number.isInteger(line.colStart) ? line.colStart : line.col;
    const colEnd = Number.isInteger(line.colEnd) ? line.colEnd : line.col;

    if (line?.fractionRenderNode) {
        return buildFractionFormulaFromRenderNode(
            line,
            cells,
            semanticLayout,
            displayLayout,
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );
    }

    const numerator = cells.filter((cell) => (
        cell.row === line.row - 1
        && cell.col >= colStart
        && cell.col <= colEnd
        && cell.kind !== "fraction_line"
    ));
    const denominator = cells.filter((cell) => (
        cell.row === line.row + 1
        && cell.col >= colStart
        && cell.col <= colEnd
        && cell.kind !== "fraction_line"
    ));

    const fractionChildOptions = {
        suppressOuterGroupShell: true
    };
    const numeratorRow = buildFractionDisplayRow(numerator, semanticLayout, displayLayout, fractionChildOptions, stepIndex, shellColorsEnabled, shellColorPolicy);
    const denominatorRow = buildFractionDisplayRow(denominator, semanticLayout, displayLayout, fractionChildOptions, stepIndex, shellColorsEnabled, shellColorPolicy);
    const lineBounds = resolveDisplaySlotBounds(line, displayLayout, stepIndex);
    const childBounds = [...numerator, ...denominator].map((cell) => (
        resolveDisplaySlotBounds(cell, displayLayout, stepIndex, fractionChildOptions)
    ));
    const slotStart = childBounds.reduce(
        (minSlot, bounds) => Math.min(minSlot, bounds.displayStartSlot),
        lineBounds.displayStartSlot
    );
    const slotEnd = childBounds.reduce(
        (maxSlot, bounds) => Math.max(maxSlot, bounds.displayEndSlot),
        lineBounds.displayEndSlot
    );
    const fractionSlotWidthEm = displayLayout
        ? displaySlotSpanWidth(displayLayout, slotStart, slotEnd)
        : 0;
    const fractionWidthEm = Math.max(
        fractionSlotWidthEm,
        numeratorRow?.widthEm || 0,
        denominatorRow?.widthEm || 0,
        fallbackCellWidthEm
    );
    const expandedNumeratorRow = {
        ...numeratorRow,
        displaySlotStart: slotStart,
        displaySlotEnd: slotEnd,
        widthEm: fractionWidthEm,
        latex: wrapDisplayRowOnFractionEdge({
            ...numeratorRow,
            widthEm: fractionWidthEm,
            latex: fitDisplayRowToFractionSpan(
                numeratorRow,
                slotStart,
                slotEnd,
                displayLayout,
                fractionWidthEm
            )
        }, "bottom")
    };
    const expandedDenominatorRow = {
        ...denominatorRow,
        displaySlotStart: slotStart,
        displaySlotEnd: slotEnd,
        widthEm: fractionWidthEm,
        latex: wrapDisplayRowOnFractionEdge({
            ...denominatorRow,
            widthEm: fractionWidthEm,
            latex: fitDisplayRowToFractionSpan(
                denominatorRow,
                slotStart,
                slotEnd,
                displayLayout,
                fractionWidthEm
            )
        }, "top")
    };

    return {
        colStart,
        colEnd,
        slotStart,
        slotEnd,
        centerX: displaySlotSpanCenterX(displayLayout, slotStart, slotEnd),
        consumedIds: new Set([...numerator, ...denominator, line].map((cell) => cell.id)),
        widthEm: fractionWidthEm,
        latex: p4Fraction(
            fractionWidthEm,
            expandedNumeratorRow.latex,
            expandedDenominatorRow.latex,
            resolveCellShellColorName(line, shellColorsEnabled, "fraction", shellColorPolicy)
        )
    };
}

function buildCollapsedFractionCellFormula(cell, semanticLayout = null, displayLayout = null, options = {}, stepIndex = 0, shellColorsEnabled = false, shellColorPolicy = null) {
    const projectionCells = Array.isArray(cell?.collapsedProjectionCells)
        ? sortRowCells(cell.collapsedProjectionCells.filter(Boolean))
        : [];

    if (projectionCells.length > 0) {
        const collapsedShellId = cell?.sourceShellId || cell?.sourceAtomId || cell?.id || null;
        const outerLine = projectionCells
            .filter((projectionCell) => (
                projectionCell?.kind === "fraction_line"
                && (
                    projectionCell?.sourceShellId === collapsedShellId
                    || projectionCell?.sourceAtomId === collapsedShellId
                    || projectionCell?.id === collapsedShellId
                )
            ))
            .sort((left, right) => {
                const leftSpan = (left?.colEnd ?? left?.col ?? 0) - (left?.colStart ?? left?.col ?? 0);
                const rightSpan = (right?.colEnd ?? right?.col ?? 0) - (right?.colStart ?? right?.col ?? 0);

                if (leftSpan !== rightSpan) {
                    return rightSpan - leftSpan;
                }

                return (left?.row ?? 0) - (right?.row ?? 0);
            })[0] || null;

        if (outerLine) {
            return buildFractionFormulaFromCells(
                projectionCells,
                outerLine,
                semanticLayout,
                displayLayout,
                stepIndex,
                shellColorsEnabled,
                shellColorPolicy
            );
        }
    }

    const projectionAtoms = Array.isArray(cell?.collapsedProjectionAtoms) ? cell.collapsedProjectionAtoms : [];
    const pseudoCells = filterRenderableProjectionPseudoCells(
        projectionAtoms
        .map((atom) => createProjectionPseudoCell(atom, projectionAtoms))
        .filter((pseudoCell) => pseudoCell && pseudoCell.text.length > 0)
    );
    const outerLine = pseudoCells.find((pseudoCell) => pseudoCell.kind === "fraction_line" && pseudoCell.sourceShellId === cell.id);

    if (!outerLine) {
        return {
            slotStart: 0,
            slotEnd: 0,
            widthEm: spanWidth(semanticLayout, cell.colStart ?? cell.col ?? 0, cell.colEnd ?? cell.col ?? 0),
            latex: renderNodeToLatex(cell.renderNode, [], {
                ...resolveRenderOptions(options),
                shellColorsEnabled,
                shellColorPolicy
            })
        };
    }

    const projectionStepIndex = 0;

    return buildFractionFormulaFromCells(
        pseudoCells,
        outerLine,
        semanticLayout,
        displayLayout,
        projectionStepIndex,
        shellColorsEnabled,
        shellColorPolicy
    );
}

function buildFractionFormula(step, line, semanticLayout = null, displayLayout = null, stepIndex = 0, shellColorsEnabled = false, shellColorPolicy = null) {
    return buildFractionFormulaFromCells(
        step.cells,
        line,
        semanticLayout,
        displayLayout,
        stepIndex,
        shellColorsEnabled,
        shellColorPolicy
    );
}

function resolveStandaloneCellNodeSpec(
    cell,
    semanticLayout = null,
    displayLayout = null,
    options = {},
    stepIndex = 0,
    shellColorsEnabled = false,
    shellColorPolicy = null
) {
    if (
        cell?.renderNode?.type === "fraction"
        && (
            (Array.isArray(cell?.collapsedProjectionAtoms) && cell.collapsedProjectionAtoms.length > 0)
            || (Array.isArray(cell?.collapsedProjectionCells) && cell.collapsedProjectionCells.length > 0)
        )
    ) {
        const collapsedFraction = buildCollapsedFractionCellFormula(
            cell,
            semanticLayout,
            displayLayout,
            options,
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );
        const fallbackBounds = resolveDisplaySlotBounds(cell, displayLayout, stepIndex);
        const slotStart = collapsedFraction.slotStart ?? fallbackBounds.displayStartSlot;
        const slotEnd = collapsedFraction.slotEnd ?? fallbackBounds.displayEndSlot;

        return {
            x: displaySlotSpanCenterX(displayLayout, slotStart, slotEnd),
            latex: collapsedFraction.latex
        };
    }

    if (cellRequiresStructuredShellProjection(cell, options)) {
        const coreBounds = resolveProjectedCoreDisplayBounds(
            cell,
            displayLayout,
            stepIndex,
            options
        );
        const coreSemanticBounds = resolveProjectedShellContentBounds(cell);
        const coreCenterX = displayLayout
            ? displaySlotSpanCenterX(displayLayout, coreBounds.displayStartSlot, coreBounds.displayEndSlot)
            : semanticSpanCenterX(semanticLayout, coreSemanticBounds.semanticStart, coreSemanticBounds.semanticEnd);

        return {
            x: coreCenterX,
            latex: buildStandaloneCellLatex(
                cell,
                semanticLayout,
                displayLayout,
                {
                    ...options,
                    stepIndex,
                    stepCells: options?.stepCells ?? []
                },
                shellColorsEnabled,
                shellColorPolicy
            )
        };
    }

    return {
        x: resolveSingleBlockFractionChildAnchorX(cell, displayLayout, options?.stepCells ?? []) ?? cellAnchorX(cell, displayLayout),
        latex: buildStandaloneCellLatex(
            cell,
            semanticLayout,
            displayLayout,
            {
                ...options,
                stepIndex,
                stepCells: options?.stepCells ?? []
            },
            shellColorsEnabled,
            shellColorPolicy
        )
    };
}

function appendVisiblePowerDescriptor(descriptors, descriptor = null) {
    if (!descriptor?.shellId || descriptor?.shellType !== "POWER" || !descriptor?.node) {
        return;
    }

    descriptors.push(descriptor);
}

function collectVisiblePowerDescriptorsForCell(cell) {
    const descriptors = [];

    if (cell?.sourceShellId && cell?.sourceShellNodeType === "POWER" && cell?.sourceShellNode) {
        appendVisiblePowerDescriptor(descriptors, {
            shellId: cell.sourceShellId,
            shellType: "POWER",
            node: cell.sourceShellNode,
            origin: "source"
        });
    }

    (Array.isArray(cell?.visibleAncestorShells) ? cell.visibleAncestorShells : []).forEach((descriptor) => {
        appendVisiblePowerDescriptor(descriptors, {
            ...descriptor,
            origin: "ancestor"
        });
    });

    return descriptors;
}

function dedupeCellsById(cells = []) {
    const seen = new Set();

    return (cells || []).filter((cell) => {
        const key = String(cell?.id || "");
        if (!key || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function chooseVisiblePowerAnchorCell(cells = []) {
    return (cells || []).find((cell) => cell?.kind === "fraction_line" && cell?.rowKind === "axis")
        || (cells || []).find((cell) => cell?.rowKind === "axis" && cell?.projectionRole !== "power_exponent")
        || (cells || []).find((cell) => cell?.rowKind === "axis")
        || cells[0]
        || null;
}

function buildVisiblePowerShellSpecs(step, options = {}) {
    const groups = new Map();

    (step?.cells || []).forEach((cell) => {
        collectVisiblePowerDescriptorsForCell(cell).forEach((descriptor) => {
            const existing = groups.get(descriptor.shellId) || {
                shellId: descriptor.shellId,
                node: descriptor.node,
                cells: [],
                hasAncestorMembers: false
            };
            existing.cells.push(cell);
            if (descriptor.origin === "ancestor") {
                existing.hasAncestorMembers = true;
            }
            groups.set(descriptor.shellId, existing);
        });
    });

    return [...groups.values()].map((group) => {
        const memberCells = dedupeCellsById(group.cells);
        const hasExplicitExponentProjection = memberCells.some((cell) => cell?.projectionRole === "power_exponent");
        const isDirectPowerFullyNestedInsideVisibleShell = group.hasAncestorMembers !== true
            && memberCells.length > 0
            && memberCells.every((cell) => Array.isArray(cell?.visibleAncestorShells) && cell.visibleAncestorShells.length > 0);

        if (isDirectPowerFullyNestedInsideVisibleShell || hasExplicitExponentProjection) {
            return null;
        }

        const anchorCell = chooseVisiblePowerAnchorCell(memberCells);

        if (!anchorCell) {
            return null;
        }

        const semanticBounds = memberCells.map((cell) => resolveCellSemanticBounds(cell));
        const semanticStart = semanticBounds.reduce(
            (min, bounds) => Math.min(min, bounds.semanticStart),
            semanticBounds[0]?.semanticStart ?? 0
        );
        const semanticEnd = semanticBounds.reduce(
            (max, bounds) => Math.max(max, bounds.semanticEnd),
            semanticBounds[0]?.semanticEnd ?? semanticStart
        );

        return {
            shellId: group.shellId,
            renderNode: buildVisiblePowerRenderNode(group.node, {
                ...options,
                preferInverseRendering: group.hasAncestorMembers === true
            }),
            memberIds: new Set(memberCells.map((cell) => cell.id).filter((id) => typeof id === "string" && id.length > 0)),
            anchorCell,
            semanticStart,
            semanticEnd
        };
    }).filter((spec) => spec?.renderNode && spec.memberIds.size >= 2);
}

function createSyntheticVisiblePowerCell(spec) {
    const anchorCell = spec?.anchorCell || null;

    if (!anchorCell || !spec?.renderNode) {
        return null;
    }

    return {
        ...anchorCell,
        id: `synthetic-visible-power::${spec.shellId}`,
        kind: "visible_power_shell",
        text: anchorCell.text || "",
        sourceAtomId: spec.shellId,
        sourceShellId: spec.shellId,
        col: spec.semanticStart,
        colStart: spec.semanticStart,
        colEnd: spec.semanticEnd,
        renderNode: spec.renderNode,
        projectionRole: null
    };
}

function buildVisibleFractionShellLines(step) {
    return sortRowCells(
        (step?.cells || []).filter((cell) => (
            cell?.kind === "fraction_line"
            && (
                cell?.fractionRenderNode
                || cell?.sourceShellNodeType === "DIVISION"
            )
        ))
    ).sort((left, right) => {
        if ((left?.row ?? 0) !== (right?.row ?? 0)) {
            return (left?.row ?? 0) - (right?.row ?? 0);
        }

        const leftSpan = (left?.colEnd ?? left?.col ?? 0) - (left?.colStart ?? left?.col ?? 0);
        const rightSpan = (right?.colEnd ?? right?.col ?? 0) - (right?.colStart ?? right?.col ?? 0);

        if (leftSpan !== rightSpan) {
            return rightSpan - leftSpan;
        }

        return (left?.colStart ?? left?.col ?? 0) - (right?.colStart ?? right?.col ?? 0);
    });
}

export function buildStepNodes(
    step,
    stepIndex,
    layout,
    semanticLayout,
    displayLayout,
    diagnostic = false,
    shellColorsEnabled = false,
    shellColorPolicy = null,
    renderOptions = {}
) {
    const y = layout.yByStep[stepIndex] || 1;
    const stepHeight = layout.heights[stepIndex] || 1.45;
    const lines = [];
    const consumed = new Set();
    const resolvedRenderOptions = resolveRenderOptions({
        ...renderOptions,
        shellColorsEnabled,
        shellColorPolicy
    });
    const visibleFractionShellLines = buildVisibleFractionShellLines(step);
    const visiblePowerShellSpecs = buildVisiblePowerShellSpecs(step, resolvedRenderOptions);

    visibleFractionShellLines.forEach((line) => {
        if (consumed.has(line.id)) {
            return;
        }

        const fractionFormula = buildFractionFormula(
            step,
            line,
            semanticLayout,
            displayLayout,
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );

        if (!fractionFormula?.latex) {
            return;
        }

        const nodeY = resolveStepCellAnchorY(step, line, y, stepHeight);
        const centerOnAxis = line?.rowKind === "axis";
        lines.push(`\\node[anchor=base, inner sep=0pt] at (${formatEm(fractionFormula.centerX)},${formatEm(nodeY)}) {$${wrapAxisCenteredLatex(fractionFormula.latex, centerOnAxis)}$};`);

        fractionFormula.consumedIds.forEach((id) => {
            if (typeof id === "string" && id.length > 0) {
                consumed.add(id);
            }
        });
    });

    visiblePowerShellSpecs.forEach((spec) => {
        if ([...spec.memberIds].some((id) => consumed.has(id))) {
            return;
        }

        const syntheticCell = createSyntheticVisiblePowerCell(spec);
        if (!syntheticCell) {
            return;
        }

        const nodeY = resolveStepCellAnchorY(step, syntheticCell, y, stepHeight);
        const centerOnAxis = syntheticCell?.rowKind === "axis";
        const nodeSpec = resolveStandaloneCellNodeSpec(
            syntheticCell,
            semanticLayout,
            displayLayout,
            {
                step,
                stepBaseY: y,
                stepHeight,
                stepCells: step.cells,
                ...resolvedRenderOptions
            },
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );

        if (!nodeSpec?.latex) {
            return;
        }

        lines.push(`\\node[anchor=base, inner sep=0pt] at (${formatEm(nodeSpec.x)},${formatEm(nodeY)}) {$${wrapAxisCenteredLatex(nodeSpec.latex, centerOnAxis)}$};`);
        lines.push(...buildVisibleShellNodes(
            syntheticCell,
            nodeY,
            semanticLayout,
            displayLayout,
            shellColorsEnabled,
            shellColorPolicy,
            centerOnAxis
        ));
        spec.memberIds.forEach((id) => consumed.add(id));
    });

    const remainingCells = sortRowCells(step.cells.filter((cell) => !consumed.has(cell.id)));

    remainingCells.forEach((cell) => {
        const nodeY = resolveStepCellAnchorY(step, cell, y, stepHeight);
        const centerOnAxis = cell?.rowKind === "axis";
        const nodeSpec = resolveStandaloneCellNodeSpec(
            cell,
            semanticLayout,
            displayLayout,
            {
                ...resolvedRenderOptions,
                step,
                stepBaseY: y,
                stepHeight,
                stepCells: step.cells
            },
            stepIndex,
            shellColorsEnabled,
            shellColorPolicy
        );
        if (!nodeSpec?.latex) {
            return;
        }
        const standaloneLatex = wrapAxisCenteredLatex(
            nodeSpec.latex,
            centerOnAxis
        );
        lines.push(`\\node[anchor=base, inner sep=0pt] at (${formatEm(nodeSpec.x)},${formatEm(nodeY)}) {$${standaloneLatex}$};`);
        lines.push(...buildVisibleShellNodes(
            cell,
            nodeY,
            semanticLayout,
            displayLayout,
            shellColorsEnabled,
            shellColorPolicy,
            centerOnAxis
        ));
    });

    if (step?.hidden === true) {
        return [
            "\\begin{scope}[opacity=0]",
            ...lines,
            "\\end{scope}"
        ];
    }

    return lines;
}

function buildGridOverlay(layout, displayLayout) {
    const lines = [];
    const bottom = layout.bottom;
    const boundaries = new Set();

    lines.push("\\node[font={\\scriptsize}, text=gray!65, anchor=west] at (0,-0.75) {Spaltengrenzen: blau; Spaltenmitten: grau gepunktet; lokale Bruch-/Span-Achsen: rot};");

    for (let slotIndex = 0; slotIndex < (displayLayout?.slots?.length || 0); slotIndex += 1) {
        if (displaySlotWidth(displayLayout, slotIndex) <= hiddenColumnWidthEm) {
            continue;
        }

        boundaries.add(formatEm(displaySlotBoundaryX(displayLayout, slotIndex, "left")));
        boundaries.add(formatEm(displaySlotBoundaryX(displayLayout, slotIndex, "right")));
    }

    [...boundaries]
        .map(Number)
        .sort((left, right) => left - right)
        .forEach((boundary) => {
            lines.push(`\\draw[blue!22, line width=0.28pt] (${formatEm(boundary)},0.35) -- (${formatEm(boundary)},${formatEm(bottom)});`);
        });

    for (let slotIndex = 0; slotIndex < (displayLayout?.slots?.length || 0); slotIndex += 1) {
        const slot = displayLayout?.slots?.[slotIndex];

        if (displaySlotWidth(displayLayout, slotIndex) <= hiddenColumnWidthEm || !slot) {
            continue;
        }

        const x = displaySlotCenterX(displayLayout, slotIndex);
        lines.push(`\\draw[gray!35, dotted] (${formatEm(x)},0.35) -- (${formatEm(x)},${formatEm(bottom)});`);
        lines.push(`\\node[font={\\ttfamily\\scriptsize}, text=gray!70, anchor=base] at (${formatEm(x)},0) {${slot.label}};`);
    }

    return lines;
}

function buildLatexDocumentSource({
    cleanNodes = [],
    diagnosticNodes = [],
    equation = "",
    targetVariable = "",
    profile = defaultColumnLayoutProfileName,
    profileName = null,
    profileLabel = null,
    shellColorEntries = [],
    numeratorGapEm = 0.14,
    denominatorGapEm = 0.18,
    showDocumentHeader = true,
    includeDiagnosticPage = true
}) {
    const titleEquation = formatHeaderInlineText(equation);
    const titleTarget = formatHeaderInlineText(targetVariable || "auto");
    const titleProfile = escapeLatexText(profileLabel || profileName || (
        typeof profile === "string" ? profile : defaultColumnLayoutProfileName
    ));
    const documentHeader = showDocumentHeader
        ? String.raw`\section*{Spaltentreue LaTeX-Ausgabe}
\noindent Gleichung: ${titleEquation} \hfill Zielvariable: ${titleTarget} \hfill Profil: \texttt{${titleProfile}}

\vspace{8mm}`
        : "";
    const diagnosticPage = includeDiagnosticPage
        ? String.raw`

\newpage
\section*{Spaltentreue LaTeX-Ausgabe mit Spaltengrenzen}
\vspace{6mm}
\begin{center}
\begin{tikzpicture}[x=1em,y=-1em]
${diagnosticNodes.join("\n")}
\end{tikzpicture}
\end{center}`
        : "";

    return String.raw`\documentclass[a4paper,12pt]{article}
\usepackage[margin=18mm]{geometry}
\usepackage{tikz}
\usepackage{amsmath}
\usepackage{xcolor}
\newcommand{\pFourCell}[2]{\makebox[#1em][c]{\ensuremath{#2}}}
\newcommand{\pFourCenterBox}[1]{\begingroup\setbox0=\hbox{$\displaystyle #1$}\dimen0=\ht0\advance\dimen0 by -\dp0\divide\dimen0 by 2\lower\dimen0\box0\endgroup}
\newdimen\pFourFractionRuleThickness
\pFourFractionRuleThickness=0.4pt
\newcommand{\pFourTopAlign}[3]{\raisebox{-#1}[0pt][\dimexpr #1 + #2\relax]{\ensuremath{\displaystyle #3}}}
\newcommand{\pFourBottomAlign}[3]{\raisebox{#2}[\dimexpr #1 + #2\relax][0pt]{\ensuremath{\displaystyle #3}}}
\newcommand{\pFourFractionInner}[2]{\hbox to #1{\hss$\displaystyle #2$\hss}}
\newcommand{\pFourFractionC}[4]{\begingroup\color{#1}\genfrac{}{}{\pFourFractionRuleThickness}{0}{\raisebox{${formatEm(numeratorGapEm)}em}{\pFourFractionInner{#2}{{\color{black}#3}}}}{\raisebox{-${formatEm(denominatorGapEm)}em}{\pFourFractionInner{#2}{{\color{black}#4}}}}\endgroup}
\newcommand{\pFourFraction}[3]{\genfrac{}{}{\pFourFractionRuleThickness}{0}{\raisebox{${formatEm(numeratorGapEm)}em}{\pFourFractionInner{#1}{#2}}}{\raisebox{-${formatEm(denominatorGapEm)}em}{\pFourFractionInner{#1}{#3}}}}
\newcommand{\pFourRootC}[2]{\begingroup\setbox0=\hbox{$\displaystyle #2$}\setbox2=\hbox{$\displaystyle \sqrt{\phantom{\copy0}}$}\dimen0=\wd2\advance\dimen0 by -\wd0\hbox{\rlap{\textcolor{#1}{\copy2}}\kern\dimen0\box0}\endgroup}
\newcommand{\pFourRoot}[1]{\pFourRootC{black}{#1}}
\newcommand{\pFourRootDegreeC}[3]{\begingroup\setbox0=\hbox{$\displaystyle #3$}\setbox2=\hbox{$\displaystyle \sqrt[#2]{\phantom{\copy0}}$}\dimen0=\wd2\advance\dimen0 by -\wd0\hbox{\rlap{\textcolor{#1}{\copy2}}\kern\dimen0\box0}\endgroup}
\newcommand{\pFourRootDegree}[2]{\pFourRootDegreeC{black}{#1}{#2}}
\pagestyle{empty}
\begin{document}
${shellColorEntries.map((entry) => `\\definecolor{${entry.latexColorName}}{HTML}{${entry.latexHex}}`).join("\n")}
${documentHeader}
\begin{center}
\begin{tikzpicture}[x=1em,y=-1em]
${cleanNodes.join("\n")}
\end{tikzpicture}
\end{center}
${diagnosticPage}
\end{document}
`;
}

export function buildLatexDocumentFromNodes({
    equation,
    targetVariable,
    cleanNodes = [],
    diagnosticNodes = [],
    profile = defaultColumnLayoutProfileName,
    profileName = null,
    profileLabel = null,
    shellColorEntries = [],
    numeratorGapEm = 0.14,
    denominatorGapEm = 0.18,
    showDocumentHeader = true,
    includeDiagnosticPage = true
}) {
    return buildLatexDocumentSource({
        cleanNodes,
        diagnosticNodes,
        equation,
        targetVariable,
        profile,
        profileName,
        profileLabel,
        shellColorEntries,
        numeratorGapEm,
        denominatorGapEm,
        showDocumentHeader,
        includeDiagnosticPage
    });
}

export function buildLatexDocument({
    equation,
    targetVariable,
    viewModel,
    profile = defaultColumnLayoutProfileName,
    profileName = null,
    profileLabel = null,
    shellColors = false,
    shellColorPolicy = null,
    powerInverseStyle = "root",
    showDocumentHeader = true,
    includeDiagnosticPage = true
}) {
    const resolvedProfile = profileName || profile;
    const layout = buildStepLayout(viewModel, resolvedProfile);
    const semanticLayout = buildColumnLayout(viewModel, resolvedProfile);
    const displayLayout = buildDisplayColumnLayout(viewModel, resolvedProfile);
    const explicitShellExtentRegistry = buildExplicitShellExtentRegistry(viewModel.steps, layout);
    const { numeratorGapEm, denominatorGapEm } = resolveFractionDisplayGap(resolvedProfile);
    const shellColorEntries = shellColors ? collectShellColorEntriesFromViewModel(viewModel, shellColorPolicy) : [];
    const cleanNodes = viewModel.steps.flatMap((step, index) => buildStepNodes(
        step,
        index,
        layout,
        semanticLayout,
        displayLayout,
        false,
        shellColors,
        shellColorPolicy,
        {
            powerInverseStyle,
            explicitShellExtentRegistry
        }
    ));
    const diagnosticNodes = [
        ...buildGridOverlay(layout, displayLayout),
        ...viewModel.steps.flatMap((step, index) => buildStepNodes(
            step,
            index,
            layout,
            semanticLayout,
            displayLayout,
            true,
            shellColors,
            shellColorPolicy,
            {
                powerInverseStyle,
                explicitShellExtentRegistry
            }
        ))
    ];
    return buildLatexDocumentSource({
        cleanNodes,
        diagnosticNodes,
        equation,
        targetVariable,
        profile,
        profileName,
        profileLabel,
        shellColorEntries,
        numeratorGapEm,
        denominatorGapEm,
        showDocumentHeader,
        includeDiagnosticPage
    });
}
