import { normalizeTheoryRowsForNeukern } from "./contracts.js";
import { createRowRasterEntry } from "./semanticRasterRows.js";
import {
    buildTraceMap,
    buildSharedSemanticIds,
    buildMixedSideSemanticIds
} from "./semanticRasterTrace.js";
import { createSemanticRasterColumnLayout } from "./semanticRasterColumns.js";

export function resolveGlobalSemanticRasterDraftInputs(theoryRows = []) {
    return {
        normalizedTheoryRows: normalizeTheoryRowsForNeukern(theoryRows)
    };
}

export function createGlobalSemanticRasterDraftFromResolvedInputs({
    normalizedTheoryRows = []
} = {}) {
    const rows = normalizedTheoryRows.map((row, rowIndex) => createRowRasterEntry(row, rowIndex));
    const traceMap = buildTraceMap(rows);
    const {
        rowsWithColumns,
        columns,
        anchorColumn,
        columnByPlacementKey,
        semanticPlacements,
        columnBySemanticId,
        orderingDiagnostics,
        multiPlacementSemanticIds
    } = createSemanticRasterColumnLayout(rows, traceMap);

    return {
        rows: rowsWithColumns,
        columns,
        columnByPlacementKey,
        columnBySemanticId,
        semanticPlacements,
        anchorColumn,
        traces: [...traceMap.values()],
        orderingDiagnostics,
        sharedSemanticIds: buildSharedSemanticIds(traceMap),
        mixedSideSemanticIds: buildMixedSideSemanticIds(traceMap),
        multiPlacementSemanticIds
    };
}

export function buildGlobalSemanticRasterDraft(theoryRows = []) {
    return createGlobalSemanticRasterDraftFromResolvedInputs(
        resolveGlobalSemanticRasterDraftInputs(theoryRows)
    );
}
