import { PROJECTION_CONTENT_COL_STEP } from "./shellGeometry.js";

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function buildLayoutPlan(projectionRows = [], semanticRaster = null, projectionWriterDiagnostics = {}) {
    let stackedVisualRowCount = 0;
    const rows = projectionRows.map((row) => {
        const stackedRowStart = stackedVisualRowCount;
        const stackedRowEnd = stackedRowStart + Math.max(0, (row.localRowCount || 1) - 1);
        stackedVisualRowCount += Math.max(0, row.localRowCount || 1);
        const anchorAtom = (row.positionedAtoms || []).find((atom) => atom.projectionRole === "anchor" || atom.value === "=");

        return {
            rowId: row.rowId,
            rowIndex: row.rowIndex,
            sourceRowId: row.rowId,
            minRelativeRow: row.minRelativeRow,
            maxRelativeRow: row.maxRelativeRow,
            localRowCount: row.localRowCount,
            axisLocalRow: row.axisLocalRow,
            axisContext: row.axisContext,
            rowKinds: clone(row.rowKinds || []),
            stackedRowStart,
            stackedRowEnd,
            anchorCol: anchorAtom?.col ?? null
        };
    });

    return {
        mode: "p4_neukern_output_contract_v1",
        rowCount: projectionRows.length,
        stackedVisualRowCount,
        columnCount: Array.isArray(semanticRaster?.columns) ? semanticRaster.columns.length : 0,
        anchorContentCol: semanticRaster?.anchorColumn?.globalCol ?? null,
        anchorProjectionCol: (
            Number.isInteger(semanticRaster?.anchorColumn?.globalCol)
                ? (semanticRaster.anchorColumn.globalCol * PROJECTION_CONTENT_COL_STEP)
                    + (projectionWriterDiagnostics?.globalColShift || 0)
                : null
        ),
        contentColStep: PROJECTION_CONTENT_COL_STEP,
        globalColShift: projectionWriterDiagnostics?.globalColShift || 0,
        rows
    };
}

export function buildOutputProfiles() {
    return {
        arbeitsblatt: {
            readsSameProjectionRows: true,
            reconstructsNothing: true
        },
        pdf: {
            readsSameProjectionRows: true,
            reconstructsNothing: true
        },
        film: {
            readsSameProjectionRows: true,
            readsSameTraceIndex: true
        },
        diagnose: {
            readsSameProjectionRows: true,
            readsSameTraceIndex: true
        }
    };
}
