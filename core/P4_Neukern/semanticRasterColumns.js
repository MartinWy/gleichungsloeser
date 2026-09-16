import {
    ANCHOR_PLACEMENT_KEY,
    createPlacementKey
} from "./structure.js";

export function dedupeSemanticSequence(semanticIds = []) {
    const seen = new Set();
    const orderedSemanticIds = [];

    semanticIds.forEach((semanticId) => {
        if (typeof semanticId !== "string" || semanticId.length === 0 || seen.has(semanticId)) {
            return;
        }

        seen.add(semanticId);
        orderedSemanticIds.push(semanticId);
    });

    return orderedSemanticIds;
}

export function compareNodePriority(left, right) {
    if (left.firstRowIndex !== right.firstRowIndex) {
        return left.firstRowIndex - right.firstRowIndex;
    }

    if (left.firstSequenceIndex !== right.firstSequenceIndex) {
        return left.firstSequenceIndex - right.firstSequenceIndex;
    }

    return left.semanticId.localeCompare(right.semanticId);
}

export function buildSideOrderDraft(rows = [], side = "left") {
    const nodes = new Map();
    const adjacency = new Map();
    const indegree = new Map();

    function ensureNode(semanticId, rowIndex, sequenceIndex) {
        if (!nodes.has(semanticId)) {
            nodes.set(semanticId, {
                semanticId,
                side,
                firstRowIndex: rowIndex,
                firstSequenceIndex: sequenceIndex
            });
            adjacency.set(semanticId, new Set());
            indegree.set(semanticId, 0);
            return;
        }

        const currentNode = nodes.get(semanticId);

        if (
            rowIndex < currentNode.firstRowIndex
            || (rowIndex === currentNode.firstRowIndex && sequenceIndex < currentNode.firstSequenceIndex)
        ) {
            currentNode.firstRowIndex = rowIndex;
            currentNode.firstSequenceIndex = sequenceIndex;
        }
    }

    function ensureEdge(fromSemanticId, toSemanticId) {
        if (fromSemanticId === toSemanticId) {
            return;
        }

        const currentTargets = adjacency.get(fromSemanticId);

        if (currentTargets.has(toSemanticId)) {
            return;
        }

        currentTargets.add(toSemanticId);
        indegree.set(toSemanticId, (indegree.get(toSemanticId) || 0) + 1);
    }

    rows.forEach((row) => {
        const sequence = dedupeSemanticSequence(
            side === "left" ? row.leftLeafSemanticIds : row.rightLeafSemanticIds
        );

        sequence.forEach((semanticId, sequenceIndex) => {
            ensureNode(semanticId, row.rowIndex, sequenceIndex);
        });

        for (let index = 0; index < sequence.length - 1; index += 1) {
            ensureEdge(sequence[index], sequence[index + 1]);
        }
    });

    const availableSemanticIds = [...nodes.keys()]
        .filter((semanticId) => (indegree.get(semanticId) || 0) === 0)
        .sort((leftSemanticId, rightSemanticId) => (
            compareNodePriority(nodes.get(leftSemanticId), nodes.get(rightSemanticId))
        ));
    const orderedSemanticIds = [];

    while (availableSemanticIds.length > 0) {
        const semanticId = availableSemanticIds.shift();
        orderedSemanticIds.push(semanticId);

        [...(adjacency.get(semanticId) || [])].forEach((targetSemanticId) => {
            const nextIndegree = (indegree.get(targetSemanticId) || 0) - 1;
            indegree.set(targetSemanticId, nextIndegree);

            if (nextIndegree === 0) {
                availableSemanticIds.push(targetSemanticId);
                availableSemanticIds.sort((leftSemanticId, rightSemanticId) => (
                    compareNodePriority(nodes.get(leftSemanticId), nodes.get(rightSemanticId))
                ));
            }
        });
    }

    const unresolvedSemanticIds = [...nodes.keys()]
        .filter((semanticId) => !orderedSemanticIds.includes(semanticId))
        .sort((leftSemanticId, rightSemanticId) => (
            compareNodePriority(nodes.get(leftSemanticId), nodes.get(rightSemanticId))
        ));

    return {
        side,
        orderedSemanticIds: unresolvedSemanticIds.length > 0
            ? [...orderedSemanticIds, ...unresolvedSemanticIds]
            : orderedSemanticIds,
        hasCycle: unresolvedSemanticIds.length > 0,
        unresolvedSemanticIds
    };
}

export function createContentColumnEntry(semanticId, side, sideIndex, globalCol, traceMap = new Map()) {
    const trace = traceMap.get(semanticId) || null;
    const firstOccurrence = trace?.occurrences?.[0] || null;

    return {
        columnId: createPlacementKey(side, semanticId),
        placementKey: createPlacementKey(side, semanticId),
        semanticId,
        side,
        sideIndex,
        globalCol,
        type: firstOccurrence?.type || null,
        value: firstOccurrence?.value || null,
        traceLength: trace?.occurrences?.length || 0
    };
}

export function createAnchorColumn(globalCol) {
    return {
        columnId: ANCHOR_PLACEMENT_KEY,
        placementKey: ANCHOR_PLACEMENT_KEY,
        semanticId: ANCHOR_PLACEMENT_KEY,
        side: "anchor",
        sideIndex: 0,
        globalCol,
        type: "ANCHOR",
        value: "=",
        traceLength: 0
    };
}

export function buildSemanticPlacements(traceMap = new Map(), columns = [], anchorColumn = null, rows = []) {
    const columnByPlacementKey = Object.fromEntries(
        columns.map((column) => [column.placementKey, column])
    );
    const semanticPlacements = Object.fromEntries(
        [...traceMap.keys()].map((semanticId) => [semanticId, []])
    );

    columns.forEach((column) => {
        if (column.side === "anchor") {
            return;
        }

        if (!Array.isArray(semanticPlacements[column.semanticId])) {
            semanticPlacements[column.semanticId] = [];
        }

        semanticPlacements[column.semanticId].push(column.placementKey);
    });

    rows.forEach((row) => {
        row.anchorLeafSemanticIds.forEach((semanticId) => {
            if (!Array.isArray(semanticPlacements[semanticId])) {
                semanticPlacements[semanticId] = [];
            }

            if (!semanticPlacements[semanticId].includes(anchorColumn?.placementKey)) {
                semanticPlacements[semanticId].push(anchorColumn?.placementKey);
            }
        });
    });

    return {
        semanticPlacements,
        columnByPlacementKey
    };
}

export function buildColumnBySemanticId(semanticPlacements = {}, columnByPlacementKey = {}) {
    return Object.fromEntries(
        Object.entries(semanticPlacements)
            .filter(([, placementKeys]) => Array.isArray(placementKeys) && placementKeys.length === 1)
            .map(([semanticId, placementKeys]) => [semanticId, columnByPlacementKey[placementKeys[0]]])
    );
}

export function buildRowsWithColumns(rows = [], columnByPlacementKey = {}, anchorColumn = null) {
    return rows.map((row) => ({
        ...row,
        leafColumns: row.visibleLeafEntries.map((entry) => ({
            semanticId: entry.semanticId,
            placementKey: createPlacementKey(entry.side, entry.semanticId),
            rowId: entry.rowId,
            rowIndex: entry.rowIndex,
            atomIndex: entry.atomIndex,
            atomPath: entry.atomPath,
            side: entry.side,
            globalCol: (
                columnByPlacementKey[createPlacementKey(entry.side, entry.semanticId)]
                || anchorColumn
            ).globalCol
        })),
        anchorGlobalCol: anchorColumn?.globalCol ?? null
    }));
}

export function createSemanticRasterColumnLayout(rows = [], traceMap = new Map()) {
    const leftOrderDraft = buildSideOrderDraft(rows, "left");
    const rightOrderDraft = buildSideOrderDraft(rows, "right");
    const leftColumns = leftOrderDraft.orderedSemanticIds.map((semanticId, sideIndex) => (
        createContentColumnEntry(semanticId, "left", sideIndex, sideIndex, traceMap)
    ));
    const anchorColumn = createAnchorColumn(leftColumns.length);
    const rightColumns = rightOrderDraft.orderedSemanticIds.map((semanticId, sideIndex) => (
        createContentColumnEntry(
            semanticId,
            "right",
            sideIndex,
            leftColumns.length + 1 + sideIndex,
            traceMap
        )
    ));
    const columns = [...leftColumns, anchorColumn, ...rightColumns];
    const {
        semanticPlacements,
        columnByPlacementKey
    } = buildSemanticPlacements(traceMap, columns, anchorColumn, rows);
    const multiPlacementSemanticIds = Object.entries(semanticPlacements)
        .filter(([, placementKeys]) => Array.isArray(placementKeys) && placementKeys.length > 1)
        .map(([semanticId]) => semanticId);

    return {
        rowsWithColumns: buildRowsWithColumns(rows, columnByPlacementKey, anchorColumn),
        columns,
        anchorColumn,
        columnByPlacementKey,
        semanticPlacements,
        columnBySemanticId: buildColumnBySemanticId(semanticPlacements, columnByPlacementKey),
        orderingDiagnostics: {
            left: leftOrderDraft,
            right: rightOrderDraft
        },
        multiPlacementSemanticIds
    };
}
