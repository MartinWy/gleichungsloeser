import {
    resolveBlueprintBoundaryColumns,
    resolveCollectionBoundaryColumns
} from "./structure.js";

export const PROJECTION_CONTENT_COL_STEP = 4;

export function toProjectionContentCol(globalCol = 0) {
    return globalCol * PROJECTION_CONTENT_COL_STEP;
}

export function toProjectionBoundaryRange(boundaryColumns = null) {
    const leftGlobalCol = boundaryColumns?.leftColumn?.globalCol;
    const rightGlobalCol = boundaryColumns?.rightColumn?.globalCol;

    if (!Number.isInteger(leftGlobalCol) || !Number.isInteger(rightGlobalCol)) {
        return null;
    }

    return {
        rawColStart: toProjectionContentCol(leftGlobalCol),
        rawColEnd: toProjectionContentCol(rightGlobalCol)
    };
}

export function resolveProjectionBoundaryRange(semanticRaster, side, blueprint = null) {
    return toProjectionBoundaryRange(
        resolveBlueprintBoundaryColumns(semanticRaster, side, blueprint)
    );
}

export function resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint = null, key = "") {
    return toProjectionBoundaryRange(
        resolveCollectionBoundaryColumns(semanticRaster, side, blueprint, key)
    );
}
