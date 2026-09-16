export const ANCHOR_PLACEMENT_KEY = "__anchor__";

function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

export function createPlacementKey(side = "", semanticId = "") {
    if (side === "anchor") {
        return ANCHOR_PLACEMENT_KEY;
    }

    return `${side}::${semanticId}`;
}

export function resolveSemanticColumn(semanticRaster = {}, side = "", semanticId = "") {
    if (!isNonEmptyString(semanticId)) {
        return null;
    }

    const placementKey = createPlacementKey(side, semanticId);

    return semanticRaster?.columnByPlacementKey?.[placementKey]
        || semanticRaster?.columnBySemanticId?.[semanticId]
        || null;
}
