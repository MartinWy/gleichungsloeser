import { collectVisibleLeafPlacements } from './projectionTraversal.js';
import { cloneRuntimeValue } from '../runtimeClone.js';
import { planGlobalCellPlacement } from './planGlobalCellPlacement.js';

const CONTENT_TRACK_SPACING = 4;
const P4_GLOBAL_SEMANTIC_RASTER_VERSION = "p4_global_semantic_raster_v2";
const P4_GLOBAL_CELL_PROFILE_VERSION = "p4_global_cell_profile_v1";

function buildTrackBaseKey(side, nodeId) {
    return `${side}::${nodeId}`;
}

function buildTrackKey(side, nodeId, trackSegmentIndex) {
    return `${buildTrackBaseKey(side, nodeId)}::segment-${trackSegmentIndex}`;
}

function buildSemanticKey(nodeId) {
    return `node:${nodeId}`;
}

function dedupeTrackSequence(trackKeys = []) {
    const unique = [];
    const seen = new Set();

    trackKeys.forEach((trackKey) => {
        if (!trackKey || seen.has(trackKey)) {
            return;
        }

        seen.add(trackKey);
        unique.push(trackKey);
    });

    return unique;
}

function registerTrackKey(orderGraph, trackKey) {
    if (!orderGraph.nodes.has(trackKey)) {
        orderGraph.nodes.add(trackKey);
    }

    if (!orderGraph.appearanceOrder.has(trackKey)) {
        orderGraph.appearanceOrder.set(trackKey, orderGraph.appearanceOrder.size);
    }

    if (!orderGraph.edges.has(trackKey)) {
        orderGraph.edges.set(trackKey, new Set());
    }
}

function createOrderGraph() {
    return {
        nodes: new Set(),
        edges: new Map(),
        appearanceOrder: new Map()
    };
}

function addOrderEdge(orderGraph, beforeTrackKey, afterTrackKey) {
    if (!beforeTrackKey || !afterTrackKey || beforeTrackKey === afterTrackKey) {
        return;
    }

    registerTrackKey(orderGraph, beforeTrackKey);
    registerTrackKey(orderGraph, afterTrackKey);
    orderGraph.edges.get(beforeTrackKey).add(afterTrackKey);
}

function buildSideOrderGraph(rowDrafts, side) {
    const orderGraph = createOrderGraph();

    rowDrafts.forEach((rowDraft) => {
        const sequence = dedupeTrackSequence(
            (rowDraft?.placements?.[side] || []).map((placement) => placement.trackKey)
        );

        sequence.forEach((trackKey) => registerTrackKey(orderGraph, trackKey));

        for (let index = 0; index < sequence.length - 1; index += 1) {
            addOrderEdge(orderGraph, sequence[index], sequence[index + 1]);
        }
    });

    return orderGraph;
}

function resolveTrackOrder(orderGraph, side) {
    const indegree = new Map();

    orderGraph.nodes.forEach((trackKey) => {
        indegree.set(trackKey, 0);
    });

    orderGraph.edges.forEach((targets) => {
        targets.forEach((targetTrackKey) => {
            indegree.set(targetTrackKey, (indegree.get(targetTrackKey) || 0) + 1);
        });
    });

    const resolvedOrder = [];
    const available = [...orderGraph.nodes]
        .filter((trackKey) => (indegree.get(trackKey) || 0) === 0)
        .sort((leftKey, rightKey) => (
            (orderGraph.appearanceOrder.get(leftKey) || 0)
            - (orderGraph.appearanceOrder.get(rightKey) || 0)
        ));

    while (available.length > 0) {
        const nextTrackKey = available.shift();
        resolvedOrder.push(nextTrackKey);

        const targets = [...(orderGraph.edges.get(nextTrackKey) || [])]
            .sort((leftKey, rightKey) => (
                (orderGraph.appearanceOrder.get(leftKey) || 0)
                - (orderGraph.appearanceOrder.get(rightKey) || 0)
            ));

        targets.forEach((targetTrackKey) => {
            const nextIndegree = (indegree.get(targetTrackKey) || 0) - 1;
            indegree.set(targetTrackKey, nextIndegree);

            if (nextIndegree === 0) {
                available.push(targetTrackKey);
                available.sort((leftKey, rightKey) => (
                    (orderGraph.appearanceOrder.get(leftKey) || 0)
                    - (orderGraph.appearanceOrder.get(rightKey) || 0)
                ));
            }
        });
    }

    if (resolvedOrder.length !== orderGraph.nodes.size) {
        throw new Error(
            `[GenesisRuntime:P4] Die globale Spaltenordnung auf der ${side}-Seite ist widerspruechlich.`
        );
    }

    return resolvedOrder;
}

function createTrackRecord(trackKey, side, index) {
    const [, nodeId, segmentToken] = String(trackKey).split("::");
    const trackSegmentIndex = Number.parseInt(
        String(segmentToken || "").replace("segment-", ""),
        10
    );

    return {
        trackId: `${side}-track-${index}`,
        trackKey,
        side,
        nodeId,
        semanticKey: buildSemanticKey(nodeId),
        trackSegmentIndex,
        rawCol: index * CONTENT_TRACK_SPACING
    };
}

function buildSideTracks(trackOrder, side) {
    return trackOrder.map((trackKey, index) => createTrackRecord(trackKey, side, index));
}

function buildTrackLookup(tracksBySide) {
    const trackLookup = new Map();

    ["left", "right"].forEach((side) => {
        (tracksBySide[side] || []).forEach((trackRecord) => {
            trackLookup.set(trackRecord.trackKey, trackRecord);
        });
    });

    return trackLookup;
}

function buildRowPlacementDraft(row, side) {
    return collectVisibleLeafPlacements(row?.[side] || [], {
        side,
        path: [row.rowId, side]
    }).map((placement, index) => ({
        ...placement,
        rowId: row.rowId,
        placementIndex: index,
        semanticKey: buildSemanticKey(placement.nodeId)
    }));
}

function buildRowDraft(row) {
    return {
        rowId: row.rowId,
        placements: {
            left: buildRowPlacementDraft(row, "left"),
            right: buildRowPlacementDraft(row, "right")
        }
    };
}

function assignPlacementTrackSegments(rowDrafts = []) {
    const lastOccurrenceByBaseKey = new Map();

    return rowDrafts.map((rowDraft, rowIndex) => ({
        ...rowDraft,
        placements: Object.fromEntries(["left", "right"].map((side) => [
            side,
            (rowDraft?.placements?.[side] || []).map((placement) => {
                const baseKey = buildTrackBaseKey(side, placement.nodeId);
                const lastOccurrence = lastOccurrenceByBaseKey.get(baseKey) || null;
                const continuesExistingSegment = lastOccurrence
                    && (
                        lastOccurrence.rowIndex === rowIndex
                        || lastOccurrence.rowIndex === rowIndex - 1
                    );
                const trackSegmentIndex = continuesExistingSegment
                    ? lastOccurrence.trackSegmentIndex
                    : ((lastOccurrence?.trackSegmentIndex ?? -1) + 1);

                lastOccurrenceByBaseKey.set(baseKey, {
                    rowIndex,
                    trackSegmentIndex
                });

                return {
                    ...placement,
                    trackSegmentIndex,
                    trackKey: buildTrackKey(side, placement.nodeId, trackSegmentIndex)
                };
            })
        ]))
    }));
}

function attachTrackInformation(placements = [], trackLookup) {
    return placements.map((placement) => {
        const trackRecord = trackLookup.get(placement.trackKey);
        if (!trackRecord) {
            throw new Error(`[GenesisRuntime:P4] Keine Spur fuer ${placement.trackKey} gefunden.`);
        }

        return {
            ...placement,
            trackId: trackRecord.trackId,
            rawCol: trackRecord.rawCol
        };
    });
}

function buildSemanticTraces(rows = []) {
    const traces = new Map();

    rows.forEach((row) => {
        ["left", "right"].forEach((side) => {
            (row?.placements?.[side] || []).forEach((placement) => {
                if (!traces.has(placement.semanticKey)) {
                    traces.set(placement.semanticKey, {
                        semanticKey: placement.semanticKey,
                        nodeId: placement.nodeId,
                        value: placement.value,
                        placements: []
                    });
                }

                traces.get(placement.semanticKey).placements.push({
                    rowId: placement.rowId,
                    side,
                    trackId: placement.trackId,
                    trackKey: placement.trackKey,
                    trackSegmentIndex: placement.trackSegmentIndex,
                    rawCol: placement.rawCol
                });
            });
        });
    });

    return [...traces.values()];
}

function buildLocalizedContentRows(rows = [], placementPlan = null) {
    return rows.map((row) => ({
        rowId: row.rowId,
        placements: Object.fromEntries(["left", "right"].map((side) => [
            side,
            (row?.placements?.[side] || []).map((placement) => {
                const key = `${row.rowId}::${side}::${placement.nodeId}`;
                const rawCol = placementPlan?.localizedContentCols?.get(key);
                const span = placementPlan?.localizedContentSpans?.get(key);
                if (
                    !Number.isFinite(rawCol)
                    || !span
                    || !Number.isFinite(span.rawColStart)
                    || !Number.isFinite(span.rawColEnd)
                ) {
                    throw new Error(`[GenesisRuntime:P4] Im globalen Zellplan fehlt ${key}.`);
                }

                return {
                    ...placement,
                    rawCol,
                    rawColStart: span.rawColStart,
                    rawColEnd: span.rawColEnd
                };
            })
        ]))
    }));
}

function buildLocalizedTracks(tracksBySide, rows = []) {
    const placementByTrackKey = new Map();

    rows.forEach((row) => {
        ["left", "right"].forEach((side) => {
            (row?.placements?.[side] || []).forEach((placement) => {
                const stored = placementByTrackKey.get(placement.trackKey) || null;
                if (stored && stored.rawCol !== placement.rawCol) {
                    throw new Error(
                        `[GenesisRuntime:P4] Die globale Spur ${placement.trackKey} besitzt mehrere Zellzentren: `
                        + `${stored.rowId}@${stored.rawCol} und ${placement.rowId}@${placement.rawCol}.`
                    );
                }
                placementByTrackKey.set(placement.trackKey, placement);
            });
        });
    });

    return Object.fromEntries(["left", "right"].map((side) => [
        side,
        (tracksBySide?.[side] || []).map((track) => {
            const placement = placementByTrackKey.get(track.trackKey) || null;
            if (!placement) {
                throw new Error(`[GenesisRuntime:P4] Der globalen Spur ${track.trackKey} fehlt ihre Endzelle.`);
            }
            return {
                ...track,
                rawCol: placement.rawCol,
                rawColStart: placement.rawColStart,
                rawColEnd: placement.rawColEnd
            };
        })
    ]));
}

function buildShellSlotsByRow(localizedShellBlueprints = []) {
    const slotsByRow = new Map();

    localizedShellBlueprints.forEach((blueprint) => {
        const rowSlots = slotsByRow.get(blueprint.rowId) || { left: [], right: [] };
        (blueprint.slotLayout || []).forEach((slot) => {
            rowSlots[blueprint.side].push({
                rowId: blueprint.rowId,
                side: blueprint.side,
                shellId: blueprint.shellId,
                rowShellKey: blueprint.rowShellKey,
                shellType: blueprint.shellType,
                slotName: slot.slotName,
                role: slot.role,
                value: slot.value ?? null,
                isVisible: slot.isVisible !== false,
                rawCol: Number.isFinite(slot.rawCol) ? slot.rawCol : null,
                rawColStart: slot.rawColStart ?? slot.rawCol,
                rawColEnd: slot.rawColEnd ?? slot.rawCol
            });
        });
        slotsByRow.set(blueprint.rowId, rowSlots);
    });

    return slotsByRow;
}

function collectClaimedColumns(claims = []) {
    const columns = new Set();

    claims.forEach((claim) => {
        const start = claim?.rawColStart ?? claim?.rawCol;
        const end = claim?.rawColEnd ?? claim?.rawCol;
        if (!Number.isInteger(start) || !Number.isInteger(end)) {
            throw new Error("[GenesisRuntime:P4] Das globale Zellprofil akzeptiert nur ganzzahlige Zellgrenzen.");
        }
        for (let rawCol = start; rawCol <= end; rawCol += 1) {
            columns.add(rawCol);
        }
    });

    return columns;
}

function compressColumns(columns = []) {
    const sorted = [...new Set(columns)].sort((left, right) => left - right);
    const ranges = [];

    sorted.forEach((rawCol) => {
        const current = ranges.at(-1);
        if (current && current.rawColEnd + 1 === rawCol) {
            current.rawColEnd = rawCol;
            return;
        }
        ranges.push({ rawColStart: rawCol, rawColEnd: rawCol });
    });

    return ranges;
}

function buildGlobalCellProfile(rows = [], localizedShellBlueprints = []) {
    const shellSlotsByRow = buildShellSlotsByRow(localizedShellBlueprints);
    const rowClaims = rows.map((row) => {
        const shellSlots = shellSlotsByRow.get(row.rowId) || { left: [], right: [] };
        const occupiedRanges = Object.fromEntries(["left", "right"].map((side) => [
            side,
            [
                ...(row?.placements?.[side] || []).map((placement) => ({
                    claimType: "content",
                    nodeId: placement.nodeId,
                    rawCol: placement.rawCol,
                    rawColStart: placement.rawColStart,
                    rawColEnd: placement.rawColEnd
                })),
                ...(shellSlots?.[side] || []).map((slot) => ({
                    claimType: "shell_slot",
                    shellId: slot.shellId,
                    slotName: slot.slotName,
                    role: slot.role,
                    rawCol: slot.rawCol,
                    rawColStart: slot.rawColStart,
                    rawColEnd: slot.rawColEnd
                }))
            ]
        ]));

        return {
            rowId: row.rowId,
            placements: cloneRuntimeValue(row.placements),
            shellSlots: cloneRuntimeValue(shellSlots),
            occupiedRanges
        };
    });

    const globalColumns = Object.fromEntries(["left", "right"].map((side) => {
        const columns = collectClaimedColumns(rowClaims.flatMap((row) => row.occupiedRanges[side]));
        return [side, [...columns].sort((left, right) => left - right)];
    }));

    rowClaims.forEach((row) => {
        row.reservedRanges = Object.fromEntries(["left", "right"].map((side) => {
            const occupiedColumns = collectClaimedColumns(row.occupiedRanges[side]);
            const reservedColumns = globalColumns[side].filter((rawCol) => !occupiedColumns.has(rawCol));
            return [side, compressColumns(reservedColumns)];
        }));
    });

    return {
        contractVersion: P4_GLOBAL_CELL_PROFILE_VERSION,
        columns: globalColumns,
        rows: rowClaims,
        localizedShellBlueprints: cloneRuntimeValue(localizedShellBlueprints)
    };
}

function buildGlobalSemanticRaster(theoryRows = [], shellBlueprints = null) {
    if (!Array.isArray(shellBlueprints)) {
        throw new Error("[GenesisRuntime:P4] Das globale Raster benoetigt den vollstaendigen Shell-Bedarfsplan.");
    }

    const rowDrafts = assignPlacementTrackSegments(theoryRows.map(buildRowDraft));
    const leftTrackOrder = resolveTrackOrder(buildSideOrderGraph(rowDrafts, "left"), "left");
    const rightTrackOrder = resolveTrackOrder(buildSideOrderGraph(rowDrafts, "right"), "right");
    const tracks = {
        left: buildSideTracks(leftTrackOrder, "left"),
        right: buildSideTracks(rightTrackOrder, "right")
    };
    const trackLookup = buildTrackLookup(tracks);

    const initialRows = rowDrafts.map((rowDraft) => ({
        rowId: rowDraft.rowId,
        placements: {
            left: attachTrackInformation(rowDraft.placements.left, trackLookup),
            right: attachTrackInformation(rowDraft.placements.right, trackLookup)
        }
    }));

    const initialRaster = {
        contractVersion: "p4_semantic_track_draft_v1",
        constants: {
            contentTrackSpacing: CONTENT_TRACK_SPACING
        },
        tracks,
        rows: initialRows,
        semanticTraces: buildSemanticTraces(initialRows)
    };
    const placementPlan = planGlobalCellPlacement(theoryRows, initialRaster, shellBlueprints);
    const rows = buildLocalizedContentRows(initialRows, placementPlan);
    const localizedTracks = buildLocalizedTracks(tracks, rows);
    const cellProfile = buildGlobalCellProfile(rows, placementPlan.localizedShellBlueprints);

    return {
        contractVersion: P4_GLOBAL_SEMANTIC_RASTER_VERSION,
        constants: {
            contentTrackSpacing: CONTENT_TRACK_SPACING
        },
        tracks: localizedTracks,
        rows,
        semanticTraces: buildSemanticTraces(rows),
        cellProfile
    };
}

export {
    CONTENT_TRACK_SPACING,
    P4_GLOBAL_CELL_PROFILE_VERSION,
    P4_GLOBAL_SEMANTIC_RASTER_VERSION,
    buildGlobalSemanticRaster
};
