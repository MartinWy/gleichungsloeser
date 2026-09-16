import { RENDER_SCENE_CONTRACT_VERSION } from "../../contracts/render_scene/index.js";
import {
    buildRendererKernelScenePlan,
    buildRendererKernelSceneSequencePlan
} from "../export/render_scene/index.js";

const ROOT_STRUCTURAL_ROLES = new Set([
    "root",
    "root_hook",
    "root_overbar"
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

function collectRootContentAtomTracks(scenePlan = {}, rootTrack = {}, shellBounds = null) {
    return (scenePlan?.atomTracks || []).filter((track) => {
        if (ROOT_STRUCTURAL_ROLES.has(track.projectionRole)) {
            return false;
        }

        if (track.shellTrackId === rootTrack.id) {
            return true;
        }

        if (track.nodeType === "anchor") {
            return false;
        }

        return isSpanInside(shellBounds, {
            minAbsoluteRow: track.absoluteRow,
            maxAbsoluteRow: track.absoluteRow,
            minColumn: track.colStart,
            maxColumn: track.colEnd
        });
    });
}

function collectNestedShellTracks(scenePlan = {}, rootTrack = {}, shellBounds = null) {
    return (scenePlan?.shellTracks || []).filter((track) => {
        if (track.id === rootTrack.id) {
            return false;
        }

        return isSpanInside(shellBounds, track);
    });
}

function buildRootTrackGeometry(rootTrack = {}, scenePlan = {}) {
    const members = Array.isArray(rootTrack?.members) ? rootTrack.members : [];
    const rootShellMembers = members.filter((member) => member.projectionRole === "root");
    const hookMembers = members.filter((member) => member.projectionRole === "root_hook");
    const overbarMembers = members.filter((member) => member.projectionRole === "root_overbar");
    const frameBounds = buildBoundsFromMembers(members);
    const shellBounds = buildBoundsFromMembers(rootShellMembers) || frameBounds;
    const hookBounds = buildBoundsFromMembers(hookMembers);
    const overbarBounds = buildBoundsFromMembers(overbarMembers);
    const contentAtomTracks = collectRootContentAtomTracks(scenePlan, rootTrack, frameBounds);
    const nestedShellTracks = collectNestedShellTracks(scenePlan, rootTrack, frameBounds);
    const contentAtomBounds = buildCandidateBoundsFromAtomTracks(contentAtomTracks);
    const contentBounds = buildBoundsFromTracks([
        ...(contentAtomBounds ? [contentAtomBounds] : []),
        ...nestedShellTracks
    ]) || shellBounds;
    const focusAtomIds = contentAtomTracks.filter((track) => track.isFocus).map((track) => track.id);
    const focusShellIds = nestedShellTracks.filter((track) => track.hasFocusMember).map((track) => track.id);
    const axisRow = rootShellMembers.find((member) => Number.isInteger(member.absoluteRow))?.absoluteRow
        ?? shellBounds?.maxAbsoluteRow
        ?? null;
    const topRows = [
        overbarBounds?.minAbsoluteRow,
        frameBounds?.minAbsoluteRow,
        shellBounds?.minAbsoluteRow,
        contentBounds?.minAbsoluteRow
    ].filter(Number.isInteger);
    const bottomRows = [
        frameBounds?.maxAbsoluteRow,
        shellBounds?.maxAbsoluteRow,
        contentBounds?.maxAbsoluteRow
    ].filter(Number.isInteger);

    return {
        id: `${scenePlan.sceneId}::root-geometry::${rootTrack.id}`,
        shellTrackId: rootTrack.id,
        memberNodeIds: rootTrack.memberNodeIds || [],
        structuralNodeIds: members
            .filter((member) => ROOT_STRUCTURAL_ROLES.has(member.projectionRole))
            .map((member) => member.id),
        contentNodeIds: contentAtomTracks.map((track) => track.id),
        childShellTrackIds: nestedShellTracks.map((track) => track.id),
        frameBounds,
        shellBounds,
        hookBounds,
        overbarBounds,
        contentBounds,
        axisAbsoluteRow: axisRow,
        overbarAbsoluteRow: overbarBounds?.minAbsoluteRow ?? null,
        hookColumn: hookBounds?.minColumn ?? shellBounds?.minColumn ?? null,
        contentColumnStart: contentBounds?.minColumn ?? shellBounds?.minColumn ?? null,
        contentColumnEnd: contentBounds?.maxColumn ?? shellBounds?.maxColumn ?? null,
        focusIds: [...new Set([...focusAtomIds, ...focusShellIds])],
        verticalProfile: {
            topRow: topRows.length > 0 ? Math.min(...topRows) : null,
            axisRow,
            bottomRow: bottomRows.length > 0 ? Math.max(...bottomRows) : null
        },
        geometryPolicy: {
            source: "renderer_kernel_root_geometry_v1",
            derivedFrom: "renderer_kernel_scene_plan_v1"
        }
    };
}

function sortRootTracks(left = {}, right = {}) {
    const leftRow = left?.shellBounds?.minAbsoluteRow ?? Number.MAX_SAFE_INTEGER;
    const rightRow = right?.shellBounds?.minAbsoluteRow ?? Number.MAX_SAFE_INTEGER;

    if (leftRow !== rightRow) {
        return leftRow - rightRow;
    }

    const leftCol = left?.shellBounds?.minColumn ?? Number.MAX_SAFE_INTEGER;
    const rightCol = right?.shellBounds?.minColumn ?? Number.MAX_SAFE_INTEGER;

    if (leftCol !== rightCol) {
        return leftCol - rightCol;
    }

    return String(left?.shellTrackId || "").localeCompare(String(right?.shellTrackId || ""));
}

export function buildRootGeometryPlanFromScenePlan(scenePlan = {}) {
    const rootTracks = (scenePlan?.shellTracks || [])
        .filter((track) => track.kind === "root")
        .map((track) => buildRootTrackGeometry(track, scenePlan))
        .sort(sortRootTracks);

    return {
        sceneId: scenePlan.sceneId,
        coordinateSpace: scenePlan.coordinateSpace,
        sourceProject: scenePlan.sourceProject || null,
        sourceCommit: scenePlan.sourceCommit || null,
        rowMeta: scenePlan.rowMeta || null,
        rootTracks,
        counts: {
            rootTracks: rootTracks.length
        },
        geometryPolicy: {
            contractVersion: RENDER_SCENE_CONTRACT_VERSION,
            source: "renderer_kernel_root_geometry_v1",
            derivedFrom: "renderer_kernel_scene_plan_v1"
        }
    };
}

export function buildRootGeometryPlan(scene = {}, options = {}) {
    return buildRootGeometryPlanFromScenePlan(
        buildRendererKernelScenePlan(scene, options)
    );
}

export function buildRootGeometrySequencePlan(scenes = [], options = {}) {
    const sequencePlan = Array.isArray(scenes?.scenes)
        ? scenes
        : buildRendererKernelSceneSequencePlan(scenes, options);
    const geometryScenes = (sequencePlan?.scenes || []).map((scenePlan) => buildRootGeometryPlanFromScenePlan(scenePlan));

    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        sceneCount: geometryScenes.length,
        scenes: geometryScenes
    };
}

export function buildRootGeometryManifest() {
    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        adapterType: "renderer_kernel_root_geometry_v1",
        sceneGranularity: "one_root_geometry_plan_per_scene",
        invariants: [
            "Die Root-Geometrie liest nur den generischen Szenenplan.",
            "Die Root-Geometrie fuehrt keine Solverumformung aus.",
            "Hook, Oberstrich und Inhaltsbereich werden getrennt beschrieben.",
            "Verschachtelte Shells innerhalb der Wurzel bleiben als Kindspuren sichtbar."
        ]
    };
}

export * from "./projection.js";
