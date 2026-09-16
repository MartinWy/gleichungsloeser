export const DEFAULT_GROUP_PROJECTION_PROFILE = Object.freeze({
    cellWidthPx: 40,
    cellHeightPx: 44,
    parenTopPaddingPx: 6,
    parenBottomPaddingPx: 6,
    parenHorizontalInsetPx: 9,
    shoulderFactor: 0.24,
    waistFactor: 0.42,
    waistHeightFactor: 0.2,
    minStrokeWidthPx: 2.2,
    maxStrokeWidthPx: 4.8,
    strokeHeightDivisor: 26,
    contentInsetLeftPx: 2,
    contentInsetRightPx: 2,
    contentInsetTopPx: 2,
    contentInsetBottomPx: 2,
    focusInsetLeftPx: 3,
    focusInsetRightPx: 3,
    focusInsetTopPx: 4,
    focusInsetBottomPx: 4
});

export const GROUP_PROJECTION_TUNING_FIELDS = Object.freeze([
    Object.freeze({ key: "parenTopPaddingPx", label: "Klammer oben", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "parenBottomPaddingPx", label: "Klammer unten", min: 0, max: 20, step: 1 }),
    Object.freeze({ key: "parenHorizontalInsetPx", label: "Klammer innen", min: 0, max: 18, step: 1 }),
    Object.freeze({ key: "shoulderFactor", label: "Schulter", min: 0.05, max: 0.45, step: 0.01 }),
    Object.freeze({ key: "waistFactor", label: "Bauch", min: 0.1, max: 0.8, step: 0.01 }),
    Object.freeze({ key: "waistHeightFactor", label: "Mitte y", min: 0.05, max: 0.35, step: 0.01 }),
    Object.freeze({ key: "minStrokeWidthPx", label: "Strich min", min: 1, max: 8, step: 0.1 }),
    Object.freeze({ key: "maxStrokeWidthPx", label: "Strich max", min: 1, max: 10, step: 0.1 }),
    Object.freeze({ key: "strokeHeightDivisor", label: "Strich Dynamik", min: 6, max: 40, step: 1 }),
    Object.freeze({ key: "contentInsetTopPx", label: "Inhalt oben", min: 0, max: 16, step: 1 }),
    Object.freeze({ key: "contentInsetBottomPx", label: "Inhalt unten", min: 0, max: 16, step: 1 })
]);

export function buildGroupProjectionProfile(profile = {}) {
    return {
        ...DEFAULT_GROUP_PROJECTION_PROFILE,
        ...(profile || {})
    };
}

function resolveSceneLayout(sceneLayout = {}, groupTrack = {}) {
    const frameBounds = groupTrack?.frameBounds || groupTrack?.shellBounds || null;
    const verticalProfile = groupTrack?.verticalProfile || {};

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

function buildRawRectFromBounds(bounds = null, viewport = {}) {
    if (!bounds) {
        return null;
    }

    return {
        x: colLeftPx(viewport, bounds.minColumn),
        y: rowTopPx(viewport, bounds.minAbsoluteRow),
        width: Math.max(0, colRightPx(viewport, bounds.maxColumn) - colLeftPx(viewport, bounds.minColumn)),
        height: Math.max(0, rowBottomPx(viewport, bounds.maxAbsoluteRow) - rowTopPx(viewport, bounds.minAbsoluteRow))
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

function buildFocusRects(groupTrack = {}, sceneNodes = [], viewport = {}, profile = {}) {
    const focusIds = new Set(groupTrack?.focusIds || []);

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

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function buildParenPath({
    side = "left",
    parenBounds = null,
    contentBounds = null,
    frameBounds = null,
    viewport = {},
    profile = {}
} = {}) {
    const bounds = parenBounds || frameBounds;
    const coverageBounds = contentBounds || frameBounds;

    if (!bounds || !coverageBounds) {
        return null;
    }

    const topRow = Math.min(
        bounds.minAbsoluteRow ?? coverageBounds.minAbsoluteRow ?? 0,
        coverageBounds.minAbsoluteRow ?? bounds.minAbsoluteRow ?? 0
    );
    const bottomRow = Math.max(
        bounds.maxAbsoluteRow ?? coverageBounds.maxAbsoluteRow ?? 0,
        coverageBounds.maxAbsoluteRow ?? bounds.maxAbsoluteRow ?? 0
    );
    const topY = rowTopPx(viewport, topRow) - profile.parenTopPaddingPx;
    const bottomY = rowBottomPx(viewport, bottomRow) + profile.parenBottomPaddingPx;
    const centerY = (topY + bottomY) / 2;
    const height = Math.max(1, bottomY - topY);
    const shoulderY = topY + height * profile.shoulderFactor;
    const bottomShoulderY = bottomY - height * profile.shoulderFactor;
    const waistYDelta = height * profile.waistHeightFactor;
    const strokeWidth = Math.max(
        profile.minStrokeWidthPx,
        Math.min(
            profile.maxStrokeWidthPx,
            height / profile.strokeHeightDivisor
        )
    );

    if (side === "left") {
        const rawLeftX = colLeftPx(viewport, bounds.minColumn);
        const rawRightX = colRightPx(viewport, bounds.maxColumn);
        const outerX = rawLeftX + profile.parenHorizontalInsetPx;
        const maxInnerX = rawRightX - profile.parenHorizontalInsetPx;
        const desiredInnerX = outerX + viewport.cellWidthPx * profile.waistFactor;
        const innerX = clamp(desiredInnerX, outerX + 2, maxInnerX);

        return {
            side,
            d: [
                `M ${outerX} ${topY}`,
                `C ${outerX} ${shoulderY} ${innerX} ${centerY - waistYDelta} ${innerX} ${centerY}`,
                `C ${innerX} ${centerY + waistYDelta} ${outerX} ${bottomShoulderY} ${outerX} ${bottomY}`
            ].join(" "),
            strokeWidth,
            anchorPoints: {
                outerX,
                innerX,
                topY,
                centerY,
                bottomY
            }
        };
    }

    const rawLeftX = colLeftPx(viewport, bounds.minColumn);
    const rawRightX = colRightPx(viewport, bounds.maxColumn);
    const outerX = rawRightX - profile.parenHorizontalInsetPx;
    const minInnerX = rawLeftX + profile.parenHorizontalInsetPx;
    const desiredInnerX = outerX - viewport.cellWidthPx * profile.waistFactor;
    const innerX = clamp(desiredInnerX, minInnerX, outerX - 2);

    return {
        side,
        d: [
            `M ${outerX} ${topY}`,
            `C ${outerX} ${shoulderY} ${innerX} ${centerY - waistYDelta} ${innerX} ${centerY}`,
            `C ${innerX} ${centerY + waistYDelta} ${outerX} ${bottomShoulderY} ${outerX} ${bottomY}`
        ].join(" "),
        strokeWidth,
        anchorPoints: {
            outerX,
            innerX,
            topY,
            centerY,
            bottomY
        }
    };
}

export function buildGroupProjectionSpec({
    groupTrack = {},
    sceneLayout = {},
    sceneNodes = [],
    profile = {}
} = {}) {
    if (!groupTrack || typeof groupTrack !== "object") {
        throw new Error("Group-Projektion erwartet einen Group-Track.");
    }

    const resolvedProfile = buildGroupProjectionProfile(profile);
    const resolvedSceneLayout = resolveSceneLayout(sceneLayout, groupTrack);
    const viewport = buildViewport(resolvedSceneLayout, resolvedProfile);
    const contentRect = buildRectFromBounds(groupTrack.contentBounds, viewport, resolvedProfile, "content");
    const focusRects = buildFocusRects(groupTrack, sceneNodes, viewport, resolvedProfile);
    const leftParenRect = buildRawRectFromBounds(groupTrack.leftParenBounds, viewport);
    const rightParenRect = buildRawRectFromBounds(groupTrack.rightParenBounds, viewport);
    const frameRect = buildRawRectFromBounds(groupTrack.frameBounds, viewport);
    const leftPath = buildParenPath({
        side: "left",
        parenBounds: groupTrack.leftParenBounds,
        contentBounds: groupTrack.contentBounds,
        frameBounds: groupTrack.frameBounds,
        viewport,
        profile: resolvedProfile
    });
    const rightPath = buildParenPath({
        side: "right",
        parenBounds: groupTrack.rightParenBounds,
        contentBounds: groupTrack.contentBounds,
        frameBounds: groupTrack.frameBounds,
        viewport,
        profile: resolvedProfile
    });

    return {
        groupTrackId: groupTrack.id || null,
        shellTrackId: groupTrack.shellTrackId || null,
        viewport,
        frameRect,
        contentRect,
        leftParenRect,
        rightParenRect,
        focusRects,
        leftPath,
        rightPath,
        paths: [leftPath, rightPath].filter(Boolean),
        profile: resolvedProfile
    };
}

export function buildGroupProjectionSpecs({
    groupTracks = [],
    sceneLayout = {},
    sceneNodes = [],
    profile = {}
} = {}) {
    return (Array.isArray(groupTracks) ? groupTracks : [])
        .map((groupTrack) => buildGroupProjectionSpec({
            groupTrack,
            sceneLayout,
            sceneNodes,
            profile
        }));
}

export function buildGroupProjectionManifest() {
    return {
        adapterType: "renderer_kernel_group_projection_v1",
        sceneGranularity: "one_projection_spec_per_group_track",
        adjustableKeys: GROUP_PROJECTION_TUNING_FIELDS.map((field) => field.key),
        invariants: [
            "Die Group-Projektion liest nur Group-Geometrie plus vorhandene Szenenlage.",
            "Die Group-Projektion erfindet keine neue mathematische Struktur.",
            "Die Mittelachse der Klammern folgt der Mitte des eingeschlossenen Inhalts.",
            "Dies ist die erste sichtbare Zeichnungsstufe nach der Group-Geometrie."
        ]
    };
}
