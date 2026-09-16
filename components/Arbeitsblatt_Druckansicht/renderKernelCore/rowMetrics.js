import { roundEm } from "./shared.js";

export function buildStepRowKinds(rowCount, axisLocalRow) {
    const safeAxisRow = Number.isInteger(axisLocalRow)
        ? Math.min(Math.max(axisLocalRow, 0), Math.max(0, rowCount - 1))
        : 0;

    return Array.from({ length: rowCount }, (_, rowIndex) => {
        if (rowIndex < safeAxisRow) {
            return "above_axis";
        }

        if (rowIndex > safeAxisRow) {
            return "below_axis";
        }

        return "axis";
    });
}

function isVisibleFractionAxisContext(axisContext) {
    return axisContext === "fraction_axis"
        || axisContext === "fraction_power_axis"
        || axisContext === "fraction_root_axis";
}

function getBaseRowMinHeight(rowKind, blockAxisContext = null, blockFractionSpanWidth = null) {
    if (rowKind === "above_axis" && isVisibleFractionAxisContext(blockAxisContext)) {
        return Math.max(0.84, Math.min(0.92, Math.max(1, blockFractionSpanWidth || 1) >= 3 ? 0.9 : 0.88));
    }

    if (rowKind === "below_axis" && isVisibleFractionAxisContext(blockAxisContext)) {
        return Math.max(0.78, Math.min(0.86, Math.max(1, blockFractionSpanWidth || 1) >= 3 ? 0.82 : 0.8));
    }

    if (rowKind === "above_axis") {
        return 0.92;
    }

    if (rowKind === "below_axis") {
        return 0.86;
    }

    return 1.12;
}

function getBaseCellAlign(rowKind) {
    if (rowKind === "below_axis") {
        return "flex-start";
    }

    return "flex-end";
}

function resolveFractionSpanWidthFromBounds(colStart, colEnd, fallbackCol = 0) {
    const safeStart = Number.isInteger(colStart) ? colStart : fallbackCol;
    const safeEnd = Number.isInteger(colEnd) ? colEnd : fallbackCol;
    return Math.max(1, safeEnd - safeStart + 1);
}

function resolveFractionSpanWidth(rowCells = []) {
    const spanWidth = rowCells.reduce((maxWidth, cell) => {
        if (cell?.kind !== "fraction_line") {
            return maxWidth;
        }

        return Math.max(
            maxWidth,
            resolveFractionSpanWidthFromBounds(cell?.colStart, cell?.colEnd, cell?.col ?? 0)
        );
    }, 0);

    return spanWidth > 0 ? spanWidth : null;
}

function resolveFractionAxisSpacing(axisContext, spanWidth = 1) {
    const isWide = Math.max(1, spanWidth) >= 3;

    if (axisContext === "fraction_axis") {
        return {
            lineHeightEm: isWide ? 0.3 : 0.28,
            lineThicknessEm: isWide ? 0.1 : 0.09
        };
    }

    if (axisContext === "fraction_power_axis" || axisContext === "fraction_root_axis") {
        return {
            lineHeightEm: isWide ? 0.33 : 0.31,
            lineThicknessEm: isWide ? 0.1 : 0.09
        };
    }

    return {
        lineHeightEm: isWide ? 0.34 : 0.32,
        lineThicknessEm: isWide ? 0.1 : 0.09
    };
}

function resolveCellAxisGeometry(cell) {
    if (cell?.kind === "fraction_line") {
        const lineMetrics = resolveFractionLineMetrics(cell);
        const lineHeightEm = roundEm(lineMetrics.lineHeightEm || 0.28);
        const lineThicknessEm = roundEm(lineMetrics.lineThicknessEm || 0.09);
        const lineHalfThicknessEm = roundEm(lineThicknessEm / 2);

        return {
            axisAboveEm: roundEm(Math.max(0, lineHeightEm - lineHalfThicknessEm)),
            axisBelowEm: lineHalfThicknessEm,
            boxHeightEm: lineHeightEm
        };
    }

    const layout = cell?.renderNode?.layout || null;
    if (!layout) {
        return {
            axisAboveEm: 0.52,
            axisBelowEm: 0.28,
            boxHeightEm: 0.8
        };
    }

    if (typeof layout.axisAboveEm === "number" && typeof layout.axisBelowEm === "number") {
        return {
            axisAboveEm: roundEm(layout.axisAboveEm),
            axisBelowEm: roundEm(layout.axisBelowEm),
            boxHeightEm: roundEm(
                (typeof layout.boxHeightEm === "number" ? layout.boxHeightEm : (layout.axisAboveEm + layout.axisBelowEm))
            )
        };
    }

    const fallbackHeight = typeof layout.boxHeightEm === "number"
        ? layout.boxHeightEm
        : (layout.axisMinHeightEm || 0.8);

    return {
        axisAboveEm: roundEm(fallbackHeight * 0.65),
        axisBelowEm: roundEm(fallbackHeight * 0.35),
        boxHeightEm: roundEm(fallbackHeight)
    };
}

function resolveCellShift(cell, rowKind) {
    if (rowKind !== "axis") {
        return 0;
    }

    const rowAxisBottomReserveEm = cell?.rowAxisBottomReserveEm;
    if (typeof rowAxisBottomReserveEm !== "number") {
        return 0;
    }

    const geometry = resolveCellAxisGeometry(cell);
    return roundEm(geometry.axisBelowEm - rowAxisBottomReserveEm);
}

function resolveFractionLineMetrics(cell) {
    if (typeof cell?.rowFractionLineHeightEm === "number" && typeof cell?.rowFractionLineThicknessEm === "number") {
        return {
            lineHeightEm: cell.rowFractionLineHeightEm,
            lineThicknessEm: cell.rowFractionLineThicknessEm
        };
    }

    const rowAxisContext = cell?.rowAxisContext || null;
    const spanWidth = Number.isInteger(cell?.rowFractionSpanWidth)
        ? cell.rowFractionSpanWidth
        : resolveFractionSpanWidthFromBounds(cell?.colStart, cell?.colEnd, cell?.col ?? 0);
    const spacing = resolveFractionAxisSpacing(rowAxisContext, spanWidth);

    return {
        lineHeightEm: spacing.lineHeightEm,
        lineThicknessEm: spacing.lineThicknessEm
    };
}

export function buildCellMetrics(cell) {
    const rowKind = cell?.rowKind || "axis";
    const metrics = {
        alignItems: getBaseCellAlign(rowKind),
        alignSelf: rowKind === "below_axis" ? "start" : "end",
        shiftYEm: resolveCellShift(cell, rowKind)
    };

    if (cell?.kind === "fraction_line") {
        const lineMetrics = resolveFractionLineMetrics(cell);

        return {
            ...metrics,
            alignItems: "flex-end",
            alignSelf: "end",
            ...lineMetrics
        };
    }

    return metrics;
}

function resolveAxisBalance(axisTopReserveEm, axisBottomReserveEm) {
    if (typeof axisTopReserveEm !== "number" || typeof axisBottomReserveEm !== "number") {
        return null;
    }

    return roundEm(axisTopReserveEm - axisBottomReserveEm);
}

function resolveAxisContext(rowCells = []) {
    const hasFractionLine = rowCells.some((cell) => cell?.kind === "fraction_line");
    const hasRaisedOverbar = rowCells.some((cell) => cell?.renderNode?.layout?.axisBehavior === "raised_overbar");
    const hasSuperscript = rowCells.some((cell) => cell?.renderNode?.layout?.axisBehavior === "superscript");
    const hasNestedFraction = rowCells.some((cell) => cell?.renderNode?.layout?.containsFraction === true);

    if (hasFractionLine && hasRaisedOverbar) {
        return "fraction_root_axis";
    }

    if (hasFractionLine && hasSuperscript) {
        return "fraction_power_axis";
    }

    if (hasFractionLine) {
        return "fraction_axis";
    }

    if (hasRaisedOverbar && hasNestedFraction) {
        return "root_fraction_axis";
    }

    if (hasRaisedOverbar) {
        return "root_axis";
    }

    if (hasSuperscript && hasNestedFraction) {
        return "power_fraction_axis";
    }

    if (hasSuperscript) {
        return "power_axis";
    }

    return "baseline_axis";
}

function resolveCellRowMinHeight(cell, rowKind, blockAxisContext = null, blockFractionSpanWidth = null) {
    const baseHeight = getBaseRowMinHeight(rowKind, blockAxisContext, blockFractionSpanWidth);

    if (cell?.kind === "fraction_line") {
        const geometry = resolveCellAxisGeometry(cell);
        return roundEm(Math.max(baseHeight, geometry.boxHeightEm));
    }

    const geometry = resolveCellAxisGeometry(cell);
    const layout = cell?.renderNode?.layout || null;

    if (rowKind === "axis") {
        return roundEm(Math.max(baseHeight, geometry.boxHeightEm, layout?.axisMinHeightEm || 0));
    }

    return roundEm(Math.max(baseHeight, geometry.boxHeightEm));
}

function resolveRowAxisReserves(rowCells = []) {
    if (!rowCells.length) {
        return {
            axisTopReserveEm: null,
            axisBottomReserveEm: null
        };
    }

    const reserves = rowCells.reduce((current, cell) => {
        const geometry = resolveCellAxisGeometry(cell);
        return {
            axisTopReserveEm: Math.max(current.axisTopReserveEm, geometry.axisAboveEm),
            axisBottomReserveEm: Math.max(current.axisBottomReserveEm, geometry.axisBelowEm)
        };
    }, {
        axisTopReserveEm: 0,
        axisBottomReserveEm: 0
    });

    return {
        axisTopReserveEm: reserves.axisTopReserveEm > 0 ? roundEm(reserves.axisTopReserveEm) : null,
        axisBottomReserveEm: reserves.axisBottomReserveEm > 0 ? roundEm(reserves.axisBottomReserveEm) : null
    };
}

export function buildStepRowMetrics(cells = [], rowKinds = []) {
    const axisRowIndex = rowKinds.findIndex((rowKind) => rowKind === "axis");
    const axisRowCells = axisRowIndex >= 0 ? cells.filter((cell) => cell?.row === axisRowIndex) : [];
    const blockAxisContext = axisRowIndex >= 0 ? resolveAxisContext(axisRowCells) : null;
    const blockFractionSpanWidth = axisRowIndex >= 0 ? resolveFractionSpanWidth(axisRowCells) : null;

    return rowKinds.map((rowKind, rowIndex) => {
        const rowCells = cells.filter((cell) => cell?.row === rowIndex);
        let minHeightEm = getBaseRowMinHeight(rowKind, blockAxisContext, blockFractionSpanWidth);
        const axisContext = rowKind === "axis" ? resolveAxisContext(rowCells) : null;
        const { axisTopReserveEm, axisBottomReserveEm } = rowKind === "axis"
            ? resolveRowAxisReserves(rowCells)
            : { axisTopReserveEm: null, axisBottomReserveEm: null };
        const axisBalanceEm = rowKind === "axis" ? resolveAxisBalance(axisTopReserveEm, axisBottomReserveEm) : null;
        const fractionSpanWidth = rowKind === "axis" ? resolveFractionSpanWidth(rowCells) : null;
        const rowFractionSpacing = rowKind === "axis" && isVisibleFractionAxisContext(axisContext)
            ? resolveFractionAxisSpacing(axisContext, fractionSpanWidth || 1)
            : null;

        rowCells.forEach((cell) => {
            minHeightEm = Math.max(
                minHeightEm,
                resolveCellRowMinHeight(cell, rowKind, blockAxisContext, blockFractionSpanWidth)
            );
        });

        return {
            kind: rowKind,
            minHeightEm: roundEm(minHeightEm),
            cellCount: rowCells.length,
            hasFractionLine: rowCells.some((cell) => cell?.kind === "fraction_line"),
            hasNestedFraction: rowCells.some((cell) => cell?.renderNode?.layout?.containsFraction === true),
            axisTopReserveEm,
            axisBottomReserveEm,
            axisBalanceEm,
            axisContext,
            fractionSpanWidth,
            rowContentShiftEm: null,
            axisLineShiftEm: rowKind === "axis" ? 0 : null,
            fractionLineHeightEm: rowKind === "axis" ? (rowFractionSpacing?.lineHeightEm ?? null) : null,
            fractionLineThicknessEm: rowKind === "axis" ? (rowFractionSpacing?.lineThicknessEm ?? null) : null,
            axisCompanionShiftEm: null,
            axisShiftEm: rowKind === "axis" ? 0 : null
        };
    });
}
