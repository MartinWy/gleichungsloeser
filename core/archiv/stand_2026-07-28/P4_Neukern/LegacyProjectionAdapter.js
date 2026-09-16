import { buildP4NeukernDraft } from "./pipeline.js";

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function resolveProjectionColumnCount(projectionRows = []) {
    const maxCol = projectionRows.reduce((currentMax, row) => {
        return (row.positionedAtoms || []).reduce((rowMax, atom) => {
            const colEnd = Number.isInteger(atom.colEnd) ? atom.colEnd : (atom.col ?? -1);
            return Math.max(rowMax, colEnd);
        }, currentMax);
    }, -1);

    return Math.max(0, maxCol + 1);
}

export function buildLegacyProjectionResultFromOutputContract(outputContract = {}) {
    const theoryRows = Array.isArray(outputContract?.theoryRows) ? outputContract.theoryRows : [];
    const projectionRows = Array.isArray(outputContract?.projectionRows) ? outputContract.projectionRows : [];
    const layoutRows = Array.isArray(outputContract?.layoutPlan?.rows) ? outputContract.layoutPlan.rows : [];
    const theoryRowById = new Map(theoryRows.map((row) => [row.rowId, row]));

    const legacyProjectionRows = projectionRows.map((row, index) => {
        const layoutRow = layoutRows[index] || {};
        const stackRowStart = layoutRow.stackedRowStart ?? 0;
        const stackRowEnd = layoutRow.stackedRowEnd ?? (stackRowStart + Math.max(0, (row.localRowCount || 1) - 1));
        const axisLocalRow = row.axisLocalRow ?? 0;
        const axisAbsoluteRow = stackRowStart + axisLocalRow;

        return {
            rowId: `projection-${index}`,
            sourceRowId: row.rowId,
            strategy: clone(theoryRowById.get(row.rowId)?.strategy || null),
            absoluteRowStart: stackRowStart,
            absoluteRowEnd: stackRowEnd,
            axisAbsoluteRow,
            axisLocalRow,
            localRowCount: row.localRowCount || 1,
            stackRowStart,
            stackRowEnd,
            axisStackedRow: axisAbsoluteRow,
            positionedAtoms: (row.positionedAtoms || []).map((atom) => ({
                ...clone(atom),
                row: stackRowStart + (atom.localRow || 0),
                absoluteRow: stackRowStart + (atom.localRow || 0),
                stackedRow: stackRowStart + (atom.localRow || 0)
            }))
        };
    });

    return {
        layoutPlan: {
            mode: "p4_neukern_legacy_adapter_v1",
            source: "P4_Neukern",
            rowCount: outputContract?.layoutPlan?.rowCount ?? legacyProjectionRows.length,
            visualRowCount: outputContract?.layoutPlan?.stackedVisualRowCount ?? 0,
            stackedVisualRowCount: outputContract?.layoutPlan?.stackedVisualRowCount ?? 0,
            anchorColumn: outputContract?.layoutPlan?.anchorProjectionCol ?? null,
            columnCount: resolveProjectionColumnCount(legacyProjectionRows),
            semanticColumnCount: outputContract?.layoutPlan?.columnCount ?? null,
            contentColStep: outputContract?.layoutPlan?.contentColStep ?? null,
            globalColShift: outputContract?.layoutPlan?.globalColShift ?? 0,
            rows: clone(layoutRows)
        },
        projectionRows: legacyProjectionRows,
        outputContract: clone(outputContract)
    };
}

export function process(theoryRows = []) {
    const draft = buildP4NeukernDraft(theoryRows);
    return buildLegacyProjectionResultFromOutputContract(draft.outputContract);
}
