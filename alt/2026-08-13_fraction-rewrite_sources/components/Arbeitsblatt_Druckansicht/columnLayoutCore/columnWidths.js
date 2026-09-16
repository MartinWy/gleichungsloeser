import {
    defaultColumnLayoutProfile,
    resolveHorizontalLayoutScale,
    resolveColumnLayoutProfile
} from "./columnLayoutProfile.js";
import {
    buildNodeColumnWidths,
    resolveAtomicTextWidthEm
} from "./columnWidthAtoms.js";
import { resolveSemanticBoundaryGapEm } from "./spacingProfile.js";
import {
    cellSemanticEndCol,
    cellSemanticSpanCount,
    cellSemanticStartCol
} from "./cellSemanticBounds.js";

const hiddenColumnWidthEm = 0;

function createWidthSlots(count = 0) {
    return Array.from({ length: Math.max(0, count) }, () => hiddenColumnWidthEm);
}

function fitWidthsToTargetCount(rawWidths = [], spanCount = 1) {
    const targetCount = Math.max(1, spanCount || rawWidths.length || 1);

    if (rawWidths.length === 0) {
        return createWidthSlots(targetCount);
    }

    if (rawWidths.length === targetCount) {
        return [...rawWidths];
    }

    if (rawWidths.length < targetCount) {
        return [
            ...rawWidths,
            ...createWidthSlots(targetCount - rawWidths.length)
        ];
    }

    const buckets = createWidthSlots(targetCount);

    rawWidths.forEach((width, index) => {
        const bucket = Math.min(targetCount - 1, Math.floor((index * targetCount) / rawWidths.length));
        buckets[bucket] += width;
    });

    return buckets;
}

function buildCellColumnWidths(cell, profile = defaultColumnLayoutProfile) {
    const spanCount = cellSemanticSpanCount(cell);
    const groupSuppression = cell?.projectionRole === "numerator" || cell?.projectionRole === "denominator";

    if (!cell) {
        return createWidthSlots(spanCount);
    }

    if (cell.kind === "fraction_line") {
        return createWidthSlots(spanCount);
    }

    if (cell?.projectionRole === "closed_visible_shell" && cell?.renderNode) {
        const rawWidths = buildNodeColumnWidths(
            cell.renderNode,
            null,
            profile,
            {
                ...(groupSuppression ? { suppressOuterGroupShell: true } : {}),
                externalizeVisibleShells: false
            }
        );

        return fitWidthsToTargetCount(rawWidths, spanCount);
    }

    if (cell.renderNode) {
        return buildNodeColumnWidths(
            cell.renderNode,
            spanCount,
            profile,
            {
                ...(groupSuppression ? { suppressOuterGroupShell: true } : {}),
                externalizeVisibleShells: true
            }
        );
    }

    return fitWidthsToTargetCount(
        [resolveAtomicTextWidthEm(cell.text, cell.kind, profile)],
        spanCount
    );
}

function mergeRowCellWidths(rowWidths, startCol, cellWidths) {
    cellWidths.forEach((width, offset) => {
        const col = startCol + offset;

        if (!Number.isInteger(col) || col < 0 || col >= rowWidths.length) {
            return;
        }

        rowWidths[col] = Math.max(rowWidths[col] || hiddenColumnWidthEm, width || hiddenColumnWidthEm);
    });
}

function applyRowBoundaryGaps(rowWidths, rowCells, profile = defaultColumnLayoutProfile) {
    const orderedCells = rowCells
        .slice()
        .sort((left, right) => {
            const leftStart = cellSemanticStartCol(left);
            const rightStart = cellSemanticStartCol(right);

            if (leftStart !== rightStart) {
                return leftStart - rightStart;
            }

            return cellSemanticEndCol(left) - cellSemanticEndCol(right);
        });

    for (let index = 0; index < orderedCells.length - 1; index += 1) {
        const leftCell = orderedCells[index];
        const rightCell = orderedCells[index + 1];
        const leftBoundaryCol = cellSemanticEndCol(leftCell);
        const rightBoundaryCol = cellSemanticStartCol(rightCell);

        if (rightBoundaryCol !== leftBoundaryCol + 1) {
            continue;
        }

        const gap = resolveSemanticBoundaryGapEm(leftCell, rightCell, profile);

        if (!(gap > 0)) {
            continue;
        }

        rowWidths[leftBoundaryCol] += gap / 2;
        rowWidths[rightBoundaryCol] += gap / 2;
    }
}

export function buildColumnLayout(viewModel, profile = defaultColumnLayoutProfile) {
    const resolvedProfile = resolveColumnLayoutProfile(profile);
    const widths = Array.from({ length: viewModel.columnCount }, () => hiddenColumnWidthEm);

    viewModel.steps.forEach((step) => {
        const cellsByRow = new Map();

        step.cells.forEach((cell) => {
            const rowIndex = Number.isInteger(cell?.row) ? cell.row : 0;
            const currentCells = cellsByRow.get(rowIndex) || [];
            currentCells.push(cell);
            cellsByRow.set(rowIndex, currentCells);
        });

        cellsByRow.forEach((rowCells) => {
            const rowWidths = Array.from({ length: viewModel.columnCount }, () => hiddenColumnWidthEm);

            rowCells.forEach((cell) => {
                mergeRowCellWidths(
                    rowWidths,
                    cellSemanticStartCol(cell),
                    buildCellColumnWidths(cell, resolvedProfile)
                );
            });

            applyRowBoundaryGaps(rowWidths, rowCells, resolvedProfile);

            rowWidths.forEach((width, col) => {
                widths[col] = Math.max(widths[col] || hiddenColumnWidthEm, width || hiddenColumnWidthEm);
            });
        });
    });

    const horizontalScale = resolveHorizontalLayoutScale(resolvedProfile);
    const scaledWidths = horizontalScale === 1
        ? widths
        : widths.map((width) => (width || hiddenColumnWidthEm) * horizontalScale);
    const starts = [];
    let cursor = 0;

    scaledWidths.forEach((width, index) => {
        starts[index] = cursor;
        cursor += width;
    });

    return {
        widths: scaledWidths,
        starts,
        totalWidth: cursor
    };
}
