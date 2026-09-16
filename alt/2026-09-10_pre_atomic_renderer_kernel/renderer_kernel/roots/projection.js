export const DEFAULT_ROOT_PROJECTION_PROFILE = Object.freeze({
    cellWidthPx: 40,
    cellHeightPx: 44,
    overbarTopInsetPx: 8,
    overbarEndInsetPx: 6,
    barStartFactor: 0.86,
    entryFactor: 0.12,
    notchFactor: 0.32,
    tipFactor: 0.54,
    leadYFactor: -0.06,
    tipYFactor: -0.02,
    riseYFactor: 0.14,
    riseColumnFactor: 0.1,
    minStrokeWidthPx: 2.8,
    maxStrokeWidthPx: 5.2,
    strokeHeightDivisor: 18,
    contentInsetLeftPx: 2,
    contentInsetRightPx: 2,
    contentInsetTopPx: 4,
    contentInsetBottomPx: 8,
    focusInsetLeftPx: 3,
    focusInsetRightPx: 3,
    focusInsetTopPx: 5,
    focusInsetBottomPx: 5
});

export const ROOT_PROJECTION_TUNING_FIELDS = Object.freeze([
    Object.freeze({ key: "overbarTopInsetPx", label: "Oberstrich oben", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "overbarEndInsetPx", label: "Oberstrich rechts", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "barStartFactor", label: "Balkenstart", min: 0.55, max: 1.2, step: 0.01 }),
    Object.freeze({ key: "entryFactor", label: "Einstieg links", min: 0, max: 0.5, step: 0.01 }),
    Object.freeze({ key: "notchFactor", label: "Knick links", min: 0.1, max: 0.7, step: 0.01 }),
    Object.freeze({ key: "tipFactor", label: "Tiefpunkt x", min: 0.2, max: 0.9, step: 0.01 }),
    Object.freeze({ key: "leadYFactor", label: "Einstieg y", min: -0.4, max: 0.2, step: 0.01 }),
    Object.freeze({ key: "tipYFactor", label: "Tiefpunkt y", min: -0.2, max: 0.4, step: 0.01 }),
    Object.freeze({ key: "riseYFactor", label: "Anstieg y", min: 0, max: 0.5, step: 0.01 }),
    Object.freeze({ key: "riseColumnFactor", label: "Anstieg rechts", min: 0, max: 0.45, step: 0.01 }),
    Object.freeze({ key: "minStrokeWidthPx", label: "Strich min", min: 1, max: 8, step: 0.1 }),
    Object.freeze({ key: "maxStrokeWidthPx", label: "Strich max", min: 1, max: 10, step: 0.1 }),
    Object.freeze({ key: "strokeHeightDivisor", label: "Strich Dynamik", min: 6, max: 40, step: 1 }),
    Object.freeze({ key: "contentInsetTopPx", label: "Inhalt oben", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "contentInsetBottomPx", label: "Inhalt unten", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "focusInsetTopPx", label: "Fokus oben", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "focusInsetBottomPx", label: "Fokus unten", min: 0, max: 20, step: 1 })
]);

export function buildRootProjectionProfile(profile = {}) {
    return {
        ...DEFAULT_ROOT_PROJECTION_PROFILE,
        ...(profile || {})
    };
}

function resolveSceneLayout(sceneLayout = {}, rootTrack = {}) {
    const frameBounds = rootTrack?.frameBounds || rootTrack?.shellBounds || null;
    const verticalProfile = rootTrack?.verticalProfile || {};

    return {
        minColumn: Number.isInteger(sceneLayout?.minColumn)
            ? sceneLayout.minColumn
            : frameBounds?.minColumn ?? 0,
        maxColumn: Number.isInteger(sceneLayout?.maxColumn)
            ? sceneLayout.maxColumn
            : frameBounds?.maxColumn ?? 0,
        minAbsoluteRow: Number.isInteger(sceneLayout?.minAbsoluteRow)
            ? sceneLayout.minAbsoluteRow
            : verticalProfile?.topRow ?? frameBounds?.minAbsoluteRow ?? 0,
        maxAbsoluteRow: Number.isInteger(sceneLayout?.maxAbsoluteRow)
            ? sceneLayout.maxAbsoluteRow
            : verticalProfile?.bottomRow ?? frameBounds?.maxAbsoluteRow ?? 0
    };
}

function buildViewport(sceneLayout = {}, profile = {}) {
    const safeMinColumn = Number.isInteger(sceneLayout?.minColumn) ? sceneLayout.minColumn : 0;
    const safeMaxColumn = Number.isInteger(sceneLayout?.maxColumn) ? sceneLayout.maxColumn : safeMinColumn;
    const safeMinRow = Number.isInteger(sceneLayout?.minAbsoluteRow) ? sceneLayout.minAbsoluteRow : 0;
    const safeMaxRow = Number.isInteger(sceneLayout?.maxAbsoluteRow) ? sceneLayout.maxAbsoluteRow : safeMinRow;

    return {
        minColumn: safeMinColumn,
        maxColumn: safeMaxColumn,
        minAbsoluteRow: safeMinRow,
        maxAbsoluteRow: safeMaxRow,
        cellWidthPx: profile.cellWidthPx,
        cellHeightPx: profile.cellHeightPx,
        widthPx: (safeMaxColumn - safeMinColumn + 1) * profile.cellWidthPx,
        heightPx: (safeMaxRow - safeMinRow + 1) * profile.cellHeightPx
    };
}

function colLeftPx(viewport = {}, column) {
    return (column - viewport.minColumn) * viewport.cellWidthPx;
}

function colRightPx(viewport = {}, column) {
    return (column - viewport.minColumn + 1) * viewport.cellWidthPx;
}

function rowTopPx(viewport = {}, absoluteRow) {
    return (absoluteRow - viewport.minAbsoluteRow) * viewport.cellHeightPx;
}

function rowBottomPx(viewport = {}, absoluteRow) {
    return (absoluteRow - viewport.minAbsoluteRow + 1) * viewport.cellHeightPx;
}

function buildRectFromBounds(bounds = null, viewport = {}, profile = {}, kind = "content") {
    if (!bounds) {
        return null;
    }

    const insetLeft = kind === "focus" ? profile.focusInsetLeftPx : profile.contentInsetLeftPx;
    const insetRight = kind === "focus" ? profile.focusInsetRightPx : profile.contentInsetRightPx;
    const insetTop = kind === "focus" ? profile.focusInsetTopPx : profile.contentInsetTopPx;
    const insetBottom = kind === "focus" ? profile.focusInsetBottomPx : profile.contentInsetBottomPx;

    return {
        x: colLeftPx(viewport, bounds.minColumn) + insetLeft,
        y: rowTopPx(viewport, bounds.minAbsoluteRow) + insetTop,
        width: Math.max(
            0,
            colRightPx(viewport, bounds.maxColumn) -
            colLeftPx(viewport, bounds.minColumn) -
            insetLeft -
            insetRight
        ),
        height: Math.max(
            0,
            rowBottomPx(viewport, bounds.maxAbsoluteRow) -
            rowTopPx(viewport, bounds.minAbsoluteRow) -
            insetTop -
            insetBottom
        )
    };
}

function buildFocusBounds(node = {}) {
    if (!Number.isInteger(node?.position?.absoluteRow)) {
        return null;
    }

    const minColumn = node?.position?.colStart ?? node?.position?.col;
    const maxColumn = node?.position?.colEnd ?? node?.position?.col;

    if (!Number.isInteger(minColumn) || !Number.isInteger(maxColumn)) {
        return null;
    }

    return {
        minAbsoluteRow: node.position.absoluteRow,
        maxAbsoluteRow: node.position.absoluteRow,
        minColumn,
        maxColumn
    };
}

function buildFocusRects(rootTrack = {}, sceneNodes = [], viewport = {}, profile = {}) {
    const focusIds = new Set(rootTrack?.focusIds || []);

    return (Array.isArray(sceneNodes) ? sceneNodes : [])
        .filter((node) => focusIds.has(node.id))
        .map((node) => ({
            id: node.id,
            bounds: buildFocusBounds(node)
        }))
        .filter((entry) => entry.bounds)
        .map((entry) => ({
            id: entry.id,
            ...buildRectFromBounds(entry.bounds, viewport, profile, "focus")
        }));
}

function buildRootPath(rootTrack = {}, viewport = {}, profile = {}) {
    const hookColumn = rootTrack?.hookColumn ?? rootTrack?.shellBounds?.minColumn;
    const topRow = rootTrack?.overbarAbsoluteRow ?? rootTrack?.verticalProfile?.topRow;
    const bottomRow = rootTrack?.verticalProfile?.bottomRow ?? rootTrack?.axisAbsoluteRow;
    const overbarStartColumn = rootTrack?.overbarBounds?.minColumn ?? rootTrack?.shellBounds?.minColumn ?? hookColumn;
    const overbarEndColumn = rootTrack?.overbarBounds?.maxColumn ?? rootTrack?.contentColumnEnd ?? hookColumn;

    if (
        !Number.isInteger(hookColumn) ||
        !Number.isInteger(topRow) ||
        !Number.isInteger(bottomRow) ||
        !Number.isInteger(overbarStartColumn) ||
        !Number.isInteger(overbarEndColumn)
    ) {
        return null;
    }

    const topY = rowTopPx(viewport, topRow) + profile.overbarTopInsetPx;
    const bottomY = rowBottomPx(viewport, bottomRow) - 6;
    const middleY = (topY + bottomY) / 2;
    const hookLeft = colLeftPx(viewport, hookColumn);
    const hookRight = colRightPx(viewport, hookColumn);
    const barStartX = colLeftPx(viewport, overbarStartColumn) + viewport.cellWidthPx * profile.barStartFactor;
    const barEndX = colRightPx(viewport, overbarEndColumn) - profile.overbarEndInsetPx;
    const entryX = hookLeft + viewport.cellWidthPx * profile.entryFactor;
    const notchX = hookLeft + viewport.cellWidthPx * profile.notchFactor;
    const tipX = hookLeft + viewport.cellWidthPx * profile.tipFactor;
    const riseX = Math.max(
        hookRight - viewport.cellWidthPx * profile.riseColumnFactor,
        barStartX - viewport.cellWidthPx * 0.2
    );
    const leadY = middleY + viewport.cellHeightPx * profile.leadYFactor;
    const tipY = bottomY + viewport.cellHeightPx * profile.tipYFactor;
    const riseY = topY + viewport.cellHeightPx * profile.riseYFactor;
    const strokeWidth = Math.max(
        profile.minStrokeWidthPx,
        Math.min(
            profile.maxStrokeWidthPx,
            (bottomY - topY) / profile.strokeHeightDivisor
        )
    );

    return {
        d: [
            `M ${entryX} ${leadY}`,
            `L ${notchX} ${leadY}`,
            `L ${tipX} ${tipY}`,
            `L ${riseX} ${riseY}`,
            `L ${barStartX} ${topY}`,
            `L ${barEndX} ${topY}`
        ].join(" "),
        strokeWidth,
        anchorPoints: {
            entryX,
            notchX,
            tipX,
            riseX,
            barStartX,
            barEndX,
            topY,
            bottomY,
            middleY
        }
    };
}

export function buildRootProjectionSpec({
    rootTrack = {},
    sceneLayout = {},
    sceneNodes = [],
    profile = {}
} = {}) {
    if (!rootTrack || typeof rootTrack !== "object") {
        throw new Error("Root-Projektion erwartet einen Root-Track.");
    }

    const resolvedProfile = buildRootProjectionProfile(profile);
    const resolvedSceneLayout = resolveSceneLayout(sceneLayout, rootTrack);
    const viewport = buildViewport(resolvedSceneLayout, resolvedProfile);
    const contentRect = buildRectFromBounds(rootTrack.contentBounds, viewport, resolvedProfile, "content");
    const focusRects = buildFocusRects(rootTrack, sceneNodes, viewport, resolvedProfile);
    const path = buildRootPath(rootTrack, viewport, resolvedProfile);

    return {
        rootTrackId: rootTrack.id || null,
        shellTrackId: rootTrack.shellTrackId || null,
        viewport,
        contentRect,
        focusRects,
        path,
        profile: resolvedProfile
    };
}

export function buildRootProjectionSpecs({
    rootTracks = [],
    sceneLayout = {},
    sceneNodes = [],
    profile = {}
} = {}) {
    return (Array.isArray(rootTracks) ? rootTracks : [])
        .map((rootTrack) => buildRootProjectionSpec({
            rootTrack,
            sceneLayout,
            sceneNodes,
            profile
        }));
}

export function buildRootProjectionManifest() {
    return {
        adapterType: "renderer_kernel_root_projection_v1",
        sceneGranularity: "one_projection_spec_per_root_track",
        adjustableKeys: ROOT_PROJECTION_TUNING_FIELDS.map((field) => field.key),
        invariants: [
            "Die Root-Projektion liest nur Root-Geometrie plus vorhandene Szenenlage.",
            "Die Root-Projektion erfindet keine neue mathematische Struktur.",
            "Die Root-Projektion zeichnet aus Hook, Oberstrich und Inhaltsbounds.",
            "Dies ist die erste sichtbare Zeichnungsstufe nach der Root-Geometrie."
        ]
    };
}
