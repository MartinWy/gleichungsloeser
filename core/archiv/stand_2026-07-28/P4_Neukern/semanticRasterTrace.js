export function buildTraceMap(rows = []) {
    const traceMap = new Map();

    rows.forEach((row) => {
        row.flattenedAtoms.forEach((entry) => {
            const currentTrace = traceMap.get(entry.semanticId) || {
                semanticId: entry.semanticId,
                occurrences: []
            };

            currentTrace.occurrences.push({
                rowIndex: row.rowIndex,
                rowId: row.rowId,
                atomIndex: entry.atomIndex,
                atomPath: entry.atomPath,
                side: entry.side,
                rootAtomIndex: entry.rootAtomIndex,
                depth: entry.depth,
                parentSemanticId: entry.parentSemanticId,
                parentCollectionKey: entry.parentCollectionKey,
                type: entry.atom?.type || null,
                value: entry.atom?.value || null,
                isVisible: entry.atom?.isVisible !== false,
                projectionVisible: entry.projectionVisible === true
            });

            traceMap.set(entry.semanticId, currentTrace);
        });
    });

    return traceMap;
}

export function buildSharedSemanticIds(traceMap = new Map()) {
    return [...traceMap.values()]
        .filter((trace) => trace.occurrences.length > 1)
        .map((trace) => trace.semanticId);
}

export function buildMixedSideSemanticIds(traceMap = new Map()) {
    return [...traceMap.values()]
        .filter((trace) => {
            const visibleSides = new Set(
                trace.occurrences
                    .filter((occurrence) => occurrence.projectionVisible && occurrence.side !== "anchor")
                    .map((occurrence) => occurrence.side)
            );

            return visibleSides.size > 1;
        })
        .map((trace) => trace.semanticId);
}
