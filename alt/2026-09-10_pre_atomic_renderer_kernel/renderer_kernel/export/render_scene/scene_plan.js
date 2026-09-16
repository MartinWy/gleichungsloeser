import { RENDER_SCENE_CONTRACT_VERSION } from "../../../contracts/render_scene/index.js";
import {
    buildRendererKernelSceneInput,
    buildRendererKernelSceneSequenceInput
} from "./ingest.js";

const SHELL_TRACK_NODE_TYPES = new Set([
    "group",
    "function",
    "division",
    "fraction_line",
    "root",
    "power"
]);

function sortByColumn(left = {}, right = {}) {
    const leftCol = left?.colStart ?? left?.col ?? Number.MAX_SAFE_INTEGER;
    const rightCol = right?.colStart ?? right?.col ?? Number.MAX_SAFE_INTEGER;

    if (leftCol !== rightCol) {
        return leftCol - rightCol;
    }

    return String(left?.id || "").localeCompare(String(right?.id || ""));
}

function resolveRowKind(absoluteRow, axisAbsoluteRow = null) {
    if (!Number.isInteger(axisAbsoluteRow)) {
        return "row";
    }

    if (absoluteRow < axisAbsoluteRow) {
        return "above_axis";
    }

    if (absoluteRow > axisAbsoluteRow) {
        return "below_axis";
    }

    return "axis";
}

function resolveExplicitRowKind(sceneInput = {}, row = {}) {
    const explicitRowRoles = Array.isArray(row?.rowRoles)
        ? row.rowRoles
        : [];

    if (explicitRowRoles.length === 1) {
        return explicitRowRoles[0];
    }

    if (explicitRowRoles.length > 1) {
        const preferredKinds = ["above_axis", "axis", "below_axis"];
        const preferredMatch = preferredKinds.find((kind) => explicitRowRoles.includes(kind));
        if (preferredMatch) {
            return preferredMatch;
        }

        return explicitRowRoles[0];
    }

    const absoluteRow = row?.absoluteRow ?? null;
    const absoluteRowStart = sceneInput?.rowMeta?.absoluteRowStart;
    const rowRoles = Array.isArray(sceneInput?.rowMeta?.rowRoles)
        ? sceneInput.rowMeta.rowRoles
        : (Array.isArray(sceneInput?.rowMeta?.rowKinds) ? sceneInput.rowMeta.rowKinds : []);

    if (Number.isInteger(absoluteRow) && Number.isInteger(absoluteRowStart)) {
        const localRow = absoluteRow - absoluteRowStart;
        if (localRow >= 0 && localRow < rowRoles.length) {
            return rowRoles[localRow];
        }
    }

    return resolveRowKind(absoluteRow, sceneInput?.rowMeta?.axisAbsoluteRow ?? null);
}

function buildShellLeaderIdSet(sceneInput = {}) {
    return new Set(
        (sceneInput?.nodes?.shells || [])
            .filter((node) => typeof node?.id === "string" && node.id.length > 0)
            .filter((node) => node.id === node.sourceAtomId)
            .map((node) => node.id)
    );
}

function resolveShellTrackId(node = {}, shellLeaderIds = new Set()) {
    if (shellLeaderIds.has(node.sourceAtomId)) {
        return node.sourceAtomId;
    }

    if (shellLeaderIds.has(node.sourceShellId)) {
        return node.sourceShellId;
    }

    if (shellLeaderIds.has(node.id)) {
        return node.id;
    }

    return node.sourceShellId || node.sourceAtomId || node.id;
}

function resolveAttachedShellTrackId(node = {}, shellLeaderIds = new Set()) {
    if (shellLeaderIds.has(node.sourceShellId)) {
        return node.sourceShellId;
    }

    if (shellLeaderIds.has(node.sourceAtomId)) {
        return node.sourceAtomId;
    }

    return null;
}

function buildAnchorPlan(sceneInput = {}) {
    const anchors = (sceneInput?.nodes?.anchors || [])
        .map((node) => ({
            id: node.id,
            text: node.text,
            col: node?.position?.colStart ?? node?.position?.col ?? null,
            absoluteRow: node?.position?.absoluteRow ?? null
        }))
        .sort(sortByColumn);

    return {
        ids: anchors.map((anchor) => anchor.id),
        columns: [...new Set(anchors.map((anchor) => anchor.col).filter(Number.isInteger))],
        primaryColumn: anchors.find((anchor) => Number.isInteger(anchor.col))?.col ?? sceneInput?.layout?.anchorColumn ?? null,
        nodes: anchors
    };
}

function buildRowBands(sceneInput = {}) {
    const axisAbsoluteRow = sceneInput?.rowMeta?.axisAbsoluteRow ?? null;
    const focusIdSet = new Set(sceneInput?.focusIds || []);
    const shellLeaderIds = buildShellLeaderIdSet(sceneInput);

    return (sceneInput?.rows || []).map((row, rowIndex) => {
        const nodes = [...(row.nodes || [])].sort(sortByColumn);
        const anchorColumns = nodes
            .filter((node) => node.type === "anchor")
            .map((node) => node?.position?.colStart ?? node?.position?.col)
            .filter(Number.isInteger);

        return {
            id: `${sceneInput.sceneId}::row-band::${row.absoluteRow}`,
            rowIndex,
            absoluteRow: row.absoluteRow,
            rowKind: resolveExplicitRowKind(sceneInput, row),
            localRowOffset: Number.isInteger(sceneInput?.rowMeta?.absoluteRowStart)
                ? row.absoluteRow - sceneInput.rowMeta.absoluteRowStart
                : rowIndex,
            minColumn: row.minColumn,
            maxColumn: row.maxColumn,
            spanWidth: Number.isInteger(row.minColumn) && Number.isInteger(row.maxColumn)
                ? (row.maxColumn - row.minColumn + 1)
                : null,
            nodeIds: nodes.map((node) => node.id),
            shellTrackIds: [...new Set(
                nodes
                    .filter((node) => SHELL_TRACK_NODE_TYPES.has(node.type))
                    .map((node) => resolveShellTrackId(node, shellLeaderIds))
            )],
            focusNodeIds: nodes.filter((node) => focusIdSet.has(node.id)).map((node) => node.id),
            anchorColumns
        };
    });
}

function buildAtomTracks(sceneInput = {}) {
    const focusIdSet = new Set(sceneInput?.focusIds || []);
    const shellLeaderIds = buildShellLeaderIdSet(sceneInput);

    return (sceneInput?.nodes?.all || [])
        .filter((node) => typeof node.text === "string" && node.text.length > 0)
        .map((node, order) => ({
            id: node.id,
            order,
            text: node.text,
            nodeType: node.type,
            projectionRole: node.projectionRole || null,
            shellTrackId: SHELL_TRACK_NODE_TYPES.has(node.type)
                ? resolveShellTrackId(node, shellLeaderIds)
                : resolveAttachedShellTrackId(node, shellLeaderIds),
            sourceAtomId: node.sourceAtomId || null,
            sourceShellId: node.sourceShellId || null,
            functionName: node.functionName || null,
            visualMode: node.visualMode || null,
            absoluteRow: node?.position?.absoluteRow ?? null,
            localRow: node?.position?.localRow ?? null,
            stackedRow: node?.position?.stackedRow ?? null,
            colStart: node?.position?.colStart ?? node?.position?.col ?? null,
            colEnd: node?.position?.colEnd ?? node?.position?.col ?? null,
            isFocus: focusIdSet.has(node.id)
        }));
}

function buildShellTracks(sceneInput = {}) {
    const grouped = new Map();
    const focusIdSet = new Set(sceneInput?.focusIds || []);
    const axisAbsoluteRow = sceneInput?.rowMeta?.axisAbsoluteRow ?? null;
    const shellLeaderIds = buildShellLeaderIdSet(sceneInput);

    (sceneInput?.nodes?.shells || []).forEach((node) => {
        const trackId = resolveShellTrackId(node, shellLeaderIds);
        if (!grouped.has(trackId)) {
            grouped.set(trackId, []);
        }
        grouped.get(trackId).push(node);
    });

    return [...grouped.entries()]
        .map(([trackId, members]) => {
            const orderedMembers = [...members].sort((left, right) => {
                const leftRow = left?.position?.absoluteRow ?? Number.MAX_SAFE_INTEGER;
                const rightRow = right?.position?.absoluteRow ?? Number.MAX_SAFE_INTEGER;

                if (leftRow !== rightRow) {
                    return leftRow - rightRow;
                }

                return sortByColumn(left?.position, right?.position);
            });
            const leader = orderedMembers.find((node) => node.type !== "fraction_line") || orderedMembers[0];
            const absoluteRows = orderedMembers
                .map((node) => node?.position?.absoluteRow)
                .filter(Number.isInteger);
            const colStarts = orderedMembers
                .map((node) => node?.position?.colStart ?? node?.position?.col)
                .filter(Number.isInteger);
            const colEnds = orderedMembers
                .map((node) => node?.position?.colEnd ?? node?.position?.col)
                .filter(Number.isInteger);

            return {
                id: trackId,
                kind: leader?.type || "group",
                sourceAtomIds: [...new Set(orderedMembers.map((node) => node.sourceAtomId).filter(Boolean))],
                sourceShellIds: [...new Set(orderedMembers.map((node) => node.sourceShellId).filter(Boolean))],
                memberNodeIds: orderedMembers.map((node) => node.id),
                memberTexts: orderedMembers.map((node) => node.text).filter(Boolean),
                members: orderedMembers.map((node) => ({
                    id: node.id,
                    type: node.type,
                    text: node.text || "",
                projectionRole: node.projectionRole || null,
                sourceAtomId: node.sourceAtomId || null,
                sourceShellId: node.sourceShellId || null,
                rowRole: node?.position?.rowRole || null,
                absoluteRow: node?.position?.absoluteRow ?? null,
                localRow: node?.position?.localRow ?? null,
                stackedRow: node?.position?.stackedRow ?? null,
                    colStart: node?.position?.colStart ?? node?.position?.col ?? null,
                    colEnd: node?.position?.colEnd ?? node?.position?.col ?? null
                })),
                projectionRoles: [...new Set(orderedMembers.map((node) => node.projectionRole).filter(Boolean))],
                functionName: leader?.functionName || orderedMembers.find((node) => node.functionName)?.functionName || null,
                visualModes: [...new Set(orderedMembers.map((node) => node.visualMode).filter(Boolean))],
                rowKinds: [...new Set(
                    orderedMembers
                        .map((node) => node?.position?.rowRole)
                        .filter((rowRole) => typeof rowRole === "string" && rowRole.length > 0)
                )],
                minAbsoluteRow: absoluteRows.length > 0 ? Math.min(...absoluteRows) : null,
                maxAbsoluteRow: absoluteRows.length > 0 ? Math.max(...absoluteRows) : null,
                minColumn: colStarts.length > 0 ? Math.min(...colStarts) : null,
                maxColumn: colEnds.length > 0 ? Math.max(...colEnds) : null,
                memberCount: orderedMembers.length,
                hasFocusMember: orderedMembers.some((node) => focusIdSet.has(node.id))
            };
        })
        .map((track) => ({
            ...track,
            rowKinds: track.rowKinds.length > 0
                ? track.rowKinds
                : [...new Set((track.members || []).map((member) => resolveRowKind(member.absoluteRow, axisAbsoluteRow)))]
        }))
        .sort(sortByColumn);
}

function buildLayoutEnvelope(sceneInput = {}, rowBands = []) {
    return {
        anchorColumn: sceneInput?.layout?.anchorColumn ?? null,
        columnCount: sceneInput?.layout?.columnCount ?? null,
        rowCount: sceneInput?.layout?.rowCount ?? null,
        visualRowCount: sceneInput?.layout?.visualRowCount ?? null,
        stackedVisualRowCount: sceneInput?.layout?.stackedVisualRowCount ?? null,
        minAbsoluteRow: rowBands.length > 0 ? Math.min(...rowBands.map((row) => row.absoluteRow)) : sceneInput?.bounds?.minAbsoluteRow ?? null,
        maxAbsoluteRow: rowBands.length > 0 ? Math.max(...rowBands.map((row) => row.absoluteRow)) : sceneInput?.bounds?.maxAbsoluteRow ?? null,
        minColumn: sceneInput?.bounds?.minColumn ?? null,
        maxColumn: sceneInput?.bounds?.maxColumn ?? null
    };
}

export function buildRendererKernelScenePlanFromInput(sceneInput = {}) {
    const anchorPlan = buildAnchorPlan(sceneInput);
    const rowBands = buildRowBands(sceneInput);
    const atomTracks = buildAtomTracks(sceneInput);
    const shellTracks = buildShellTracks(sceneInput);

    return {
        sceneId: sceneInput.sceneId,
        coordinateSpace: sceneInput.coordinateSpace,
        sourceProject: sceneInput.sourceProject || null,
        sourceCommit: sceneInput.sourceCommit || null,
        focusIds: Array.isArray(sceneInput.focusIds) ? [...sceneInput.focusIds] : [],
        notes: sceneInput.notes || "",
        rowMeta: sceneInput.rowMeta || null,
        anchorPlan,
        rowBands,
        atomTracks,
        shellTracks,
        layoutEnvelope: buildLayoutEnvelope(sceneInput, rowBands),
        counts: {
            rowBands: rowBands.length,
            atomTracks: atomTracks.length,
            shellTracks: shellTracks.length
        },
        planningPolicy: {
            contractVersion: RENDER_SCENE_CONTRACT_VERSION,
            source: "renderer_kernel_scene_plan_v1",
            derivedFrom: "render_scene_ingest_v1"
        }
    };
}

export function buildRendererKernelScenePlan(scene = {}, options = {}) {
    return buildRendererKernelScenePlanFromInput(
        buildRendererKernelSceneInput(scene, options)
    );
}

export function buildRendererKernelSceneSequencePlan(scenes = [], options = {}) {
    const sequenceInput = Array.isArray(scenes?.scenes)
        ? scenes
        : buildRendererKernelSceneSequenceInput(scenes, options);

    const scenePlans = (sequenceInput?.scenes || []).map((sceneInput) => buildRendererKernelScenePlanFromInput(sceneInput));

    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        sceneCount: scenePlans.length,
        sharedAnchorColumns: [...new Set(
            scenePlans.flatMap((plan) => plan.anchorPlan.columns).filter(Number.isInteger)
        )].sort((left, right) => left - right),
        scenes: scenePlans
    };
}

export function buildRendererKernelScenePlanManifest() {
    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        adapterType: "renderer_kernel_scene_plan_v1",
        sceneGranularity: "one_plan_per_scene",
        invariants: [
            "Der Szenenplan leitet nur Arbeitsstruktur aus dem Ingest ab.",
            "Der Szenenplan berechnet noch keine Shell-Geometrie.",
            "Zeilenbaender, Shell-Tracks und Atom-Tracks bleiben getrennt."
        ]
    };
}
