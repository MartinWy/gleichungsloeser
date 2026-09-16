import { RENDER_SCENE_CONTRACT_VERSION } from "../../contracts/render_scene/index.js";
import {
    buildRendererKernelScenePlan,
    buildRendererKernelSceneSequencePlan
} from "../export/render_scene/index.js";

const GROUP_STRUCTURAL_ROLES = new Set([
    "group",
    "group_left",
    "group_right"
]);

function isSpanInside(parent = {}, child = {}) {
    if (!Number.isInteger(parent?.minColumn) || !Number.isInteger(parent?.maxColumn)) {
        return false;
    }

    if (!Number.isInteger(child?.minColumn) || !Number.isInteger(child?.maxColumn)) {
        return false;
    }

    const rowFloor = Number.isInteger(parent?.minAbsoluteRow)
        ? parent.minAbsoluteRow
        : Number.MIN_SAFE_INTEGER;
    const rowCeiling = Number.isInteger(parent?.maxAbsoluteRow)
        ? parent.maxAbsoluteRow
        : Number.MAX_SAFE_INTEGER;
    const childRowFloor = Number.isInteger(child?.minAbsoluteRow)
        ? child.minAbsoluteRow
        : Number.MIN_SAFE_INTEGER;
    const childRowCeiling = Number.isInteger(child?.maxAbsoluteRow)
        ? child.maxAbsoluteRow
        : Number.MAX_SAFE_INTEGER;

    return (
        child.minColumn >= parent.minColumn &&
        child.maxColumn <= parent.maxColumn &&
        childRowFloor >= rowFloor &&
        childRowCeiling <= rowCeiling
    );
}

function buildBoundsFromMembers(members = []) {
    const rows = members
        .flatMap((member) => [member?.absoluteRow])
        .filter(Number.isInteger);
    const colStarts = members
        .flatMap((member) => [member?.colStart])
        .filter(Number.isInteger);
    const colEnds = members
        .flatMap((member) => [member?.colEnd])
        .filter(Number.isInteger);

    if (rows.length === 0 && colStarts.length === 0 && colEnds.length === 0) {
        return null;
    }

    return {
        minAbsoluteRow: rows.length > 0 ? Math.min(...rows) : null,
        maxAbsoluteRow: rows.length > 0 ? Math.max(...rows) : null,
        minColumn: colStarts.length > 0 ? Math.min(...colStarts) : null,
        maxColumn: colEnds.length > 0 ? Math.max(...colEnds) : null
    };
}

function buildBoundsFromTracks(tracks = []) {
    const rows = tracks
        .flatMap((track) => [track?.minAbsoluteRow, track?.maxAbsoluteRow])
        .filter(Number.isInteger);
    const colStarts = tracks
        .flatMap((track) => [track?.minColumn])
        .filter(Number.isInteger);
    const colEnds = tracks
        .flatMap((track) => [track?.maxColumn])
        .filter(Number.isInteger);

    if (rows.length === 0 && colStarts.length === 0 && colEnds.length === 0) {
        return null;
    }

    return {
        minAbsoluteRow: rows.length > 0 ? Math.min(...rows) : null,
        maxAbsoluteRow: rows.length > 0 ? Math.max(...rows) : null,
        minColumn: colStarts.length > 0 ? Math.min(...colStarts) : null,
        maxColumn: colEnds.length > 0 ? Math.max(...colEnds) : null
    };
}

function buildCandidateBoundsFromAtomTracks(atomTracks = []) {
    return buildBoundsFromMembers(atomTracks.map((track) => ({
        absoluteRow: track.absoluteRow,
        colStart: track.colStart,
        colEnd: track.colEnd
    })));
}

function collectGroupContentAtomTracks(scenePlan = {}, groupTrack = {}, frameBounds = null) {
    return (scenePlan?.atomTracks || []).filter((track) => {
        if (GROUP_STRUCTURAL_ROLES.has(track.projectionRole)) {
            return false;
        }

        if (track.shellTrackId === groupTrack.id) {
            return true;
        }

        if (track.nodeType === "anchor") {
            return false;
        }

        return isSpanInside(frameBounds, {
            minAbsoluteRow: track.absoluteRow,
            maxAbsoluteRow: track.absoluteRow,
            minColumn: track.colStart,
            maxColumn: track.colEnd
        });
    });
}

function collectNestedShellTracks(scenePlan = {}, groupTrack = {}, frameBounds = null) {
    return (scenePlan?.shellTracks || []).filter((track) => {
        if (track.id === groupTrack.id) {
            return false;
        }

        return isSpanInside(frameBounds, track);
    });
}

function buildGroupTrackGeometry(groupTrack = {}, scenePlan = {}) {
    const members = Array.isArray(groupTrack?.members) ? groupTrack.members : [];
    const groupMembers = members.filter((member) => member.projectionRole === "group");
    const leftParenMembers = members.filter((member) => member.projectionRole === "group_left");
    const rightParenMembers = members.filter((member) => member.projectionRole === "group_right");
    const frameBounds = buildBoundsFromMembers(members);
    const shellBounds = buildBoundsFromMembers(groupMembers) || frameBounds;
    const leftParenBounds = buildBoundsFromMembers(leftParenMembers);
    const rightParenBounds = buildBoundsFromMembers(rightParenMembers);
    const contentAtomTracks = collectGroupContentAtomTracks(scenePlan, groupTrack, frameBounds);
    const nestedShellTracks = collectNestedShellTracks(scenePlan, groupTrack, frameBounds);
    const contentAtomBounds = buildCandidateBoundsFromAtomTracks(contentAtomTracks);
    const contentBounds = buildBoundsFromTracks([
        ...(contentAtomBounds ? [contentAtomBounds] : []),
        ...nestedShellTracks
    ]) || shellBounds;
    const focusAtomIds = contentAtomTracks.filter((track) => track.isFocus).map((track) => track.id);
    const focusShellIds = nestedShellTracks.filter((track) => track.hasFocusMember).map((track) => track.id);
    const axisRow = groupMembers.find((member) => Number.isInteger(member.absoluteRow))?.absoluteRow
        ?? shellBounds?.minAbsoluteRow
        ?? frameBounds?.minAbsoluteRow
        ?? null;
    const topRows = [
        frameBounds?.minAbsoluteRow,
        leftParenBounds?.minAbsoluteRow,
        rightParenBounds?.minAbsoluteRow,
        contentBounds?.minAbsoluteRow
    ].filter(Number.isInteger);
    const bottomRows = [
        frameBounds?.maxAbsoluteRow,
        leftParenBounds?.maxAbsoluteRow,
        rightParenBounds?.maxAbsoluteRow,
        contentBounds?.maxAbsoluteRow
    ].filter(Number.isInteger);
    const topRow = topRows.length > 0 ? Math.min(...topRows) : null;
    const bottomRow = bottomRows.length > 0 ? Math.max(...bottomRows) : null;

    return {
        id: `${scenePlan.sceneId}::group-geometry::${groupTrack.id}`,
        shellTrackId: groupTrack.id,
        memberNodeIds: groupTrack.memberNodeIds || [],
        structuralNodeIds: members
            .filter((member) => GROUP_STRUCTURAL_ROLES.has(member.projectionRole))
            .map((member) => member.id),
        contentNodeIds: contentAtomTracks.map((track) => track.id),
        childShellTrackIds: nestedShellTracks.map((track) => track.id),
        frameBounds,
        shellBounds,
        leftParenBounds,
        rightParenBounds,
        contentBounds,
        axisAbsoluteRow: axisRow,
        contentColumnStart: contentBounds?.minColumn ?? shellBounds?.minColumn ?? null,
        contentColumnEnd: contentBounds?.maxColumn ?? shellBounds?.maxColumn ?? null,
        focusIds: [...new Set([...focusAtomIds, ...focusShellIds])],
        verticalProfile: {
            topRow,
            centerRow: topRow !== null && bottomRow !== null ? (topRow + bottomRow) / 2 : axisRow,
            axisRow,
            bottomRow
        },
        geometryPolicy: {
            source: "renderer_kernel_group_geometry_v1",
            derivedFrom: "renderer_kernel_scene_plan_v1"
        }
    };
}

function sortGroupTracks(left = {}, right = {}) {
    const leftRow = left?.frameBounds?.minAbsoluteRow ?? Number.MAX_SAFE_INTEGER;
    const rightRow = right?.frameBounds?.minAbsoluteRow ?? Number.MAX_SAFE_INTEGER;

    if (leftRow !== rightRow) {
        return leftRow - rightRow;
    }

    const leftCol = left?.frameBounds?.minColumn ?? Number.MAX_SAFE_INTEGER;
    const rightCol = right?.frameBounds?.minColumn ?? Number.MAX_SAFE_INTEGER;

    if (leftCol !== rightCol) {
        return leftCol - rightCol;
    }

    return String(left?.shellTrackId || "").localeCompare(String(right?.shellTrackId || ""));
}

export function buildGroupGeometryPlanFromScenePlan(scenePlan = {}) {
    const groupTracks = (scenePlan?.shellTracks || [])
        .filter((track) => track.kind === "group")
        .map((track) => buildGroupTrackGeometry(track, scenePlan))
        .sort(sortGroupTracks);

    return {
        sceneId: scenePlan.sceneId,
        coordinateSpace: scenePlan.coordinateSpace,
        sourceProject: scenePlan.sourceProject || null,
        sourceCommit: scenePlan.sourceCommit || null,
        rowMeta: scenePlan.rowMeta || null,
        groupTracks,
        counts: {
            groupTracks: groupTracks.length
        },
        geometryPolicy: {
            contractVersion: RENDER_SCENE_CONTRACT_VERSION,
            source: "renderer_kernel_group_geometry_v1",
            derivedFrom: "renderer_kernel_scene_plan_v1"
        }
    };
}

export function buildGroupGeometryPlan(scene = {}, options = {}) {
    return buildGroupGeometryPlanFromScenePlan(
        buildRendererKernelScenePlan(scene, options)
    );
}

export function buildGroupGeometrySequencePlan(scenes = [], options = {}) {
    const sequencePlan = Array.isArray(scenes?.scenes)
        ? scenes
        : buildRendererKernelSceneSequencePlan(scenes, options);
    const geometryScenes = (sequencePlan?.scenes || []).map((scenePlan) => buildGroupGeometryPlanFromScenePlan(scenePlan));

    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        sceneCount: geometryScenes.length,
        scenes: geometryScenes
    };
}

export function buildGroupGeometryManifest() {
    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        adapterType: "renderer_kernel_group_geometry_v1",
        sceneGranularity: "one_group_geometry_plan_per_scene",
        invariants: [
            "Die Group-Geometrie liest nur den generischen Szenenplan.",
            "Die Group-Geometrie fuehrt keine Solverumformung aus.",
            "Linke Klammer, rechte Klammer und Inhaltsbereich werden getrennt beschrieben.",
            "Verschachtelte Shells innerhalb der Klammer bleiben als Kindspuren sichtbar."
        ]
    };
}

export * from "./projection.js";
