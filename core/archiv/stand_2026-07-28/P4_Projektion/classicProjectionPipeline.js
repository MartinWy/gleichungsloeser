import { projectToGrid } from './Regelwerk.js';
import { Projektor } from './LochLogik.js';
import { generateGlobalLayout } from './PreFlightEngine.js';
import {
    getRowBounds,
    resolveAxisAbsoluteRow
} from './projectionRowUtils.js';

function processClassicProjection(normalizedTheoryRows = []) {
    const layoutPlan = generateGlobalLayout(normalizedTheoryRows);
    const projectionRows = normalizedTheoryRows.map((row, index) => {
        const markedAtoms = Projektor.berechneGrid(row.atoms);
        const rawPositionedAtoms = projectToGrid(markedAtoms, layoutPlan, index);
        const { minRow, maxRow } = getRowBounds(rawPositionedAtoms);
        const axisAbsoluteRow = resolveAxisAbsoluteRow(rawPositionedAtoms, minRow);
        const localRowCount = Math.max(1, maxRow - minRow + 1);
        const positionedAtoms = rawPositionedAtoms.map((atom) => ({
            ...atom,
            absoluteRow: atom.row,
            localRow: atom.row - minRow
        }));

        return {
            rowId: `projection-${index}`,
            sourceRowId: row.rowId,
            strategy: row.strategy,
            absoluteRowStart: minRow,
            absoluteRowEnd: maxRow,
            axisAbsoluteRow,
            axisLocalRow: axisAbsoluteRow - minRow,
            localRowCount,
            positionedAtoms
        };
    });

    let stackedCursor = 0;
    projectionRows.forEach((row) => {
        row.stackRowStart = stackedCursor;
        row.stackRowEnd = stackedCursor + row.localRowCount - 1;
        row.axisStackedRow = row.stackRowStart + row.axisLocalRow;
        row.positionedAtoms = row.positionedAtoms.map((atom) => ({
            ...atom,
            stackedRow: row.stackRowStart + atom.localRow
        }));
        stackedCursor += row.localRowCount;
    });

    const visualRowCount = projectionRows.reduce((max, row) => {
        const rowMax = row.positionedAtoms.reduce((rowLimit, atom) => Math.max(rowLimit, atom.row ?? 0), 0);
        return Math.max(max, rowMax);
    }, 0) + 1;

    return {
        layoutPlan: {
            ...layoutPlan,
            visualRowCount,
            stackedVisualRowCount: stackedCursor
        },
        projectionRows
    };
}

export {
    processClassicProjection
};
