import { resolveSemanticColumn } from "./structurePlacement.js";

function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

export function createRowShellKey(rowId = "", shellId = "") {
    return `${rowId}::${shellId}`;
}

export function buildRowShellLookup(blueprints = []) {
    return new Map(
        (blueprints || []).map((blueprint) => [
            createRowShellKey(blueprint?.rowId, blueprint?.shellId),
            blueprint
        ])
    );
}

export function resolveBoundarySemanticIds(semanticIds = []) {
    const filteredSemanticIds = (semanticIds || []).filter(isNonEmptyString);

    return {
        leftBoundarySemanticId: filteredSemanticIds[0] || null,
        rightBoundarySemanticId: filteredSemanticIds[filteredSemanticIds.length - 1] || null
    };
}

export function findBlueprintCollection(blueprint = null, key = "") {
    return (blueprint?.collections || []).find((collection) => collection.key === key) || null;
}

export function resolveSemanticBoundaryColumns(
    semanticRaster = {},
    side = "",
    leftBoundarySemanticId = "",
    rightBoundarySemanticId = ""
) {
    const leftColumn = resolveSemanticColumn(semanticRaster, side, leftBoundarySemanticId);
    const rightColumn = resolveSemanticColumn(semanticRaster, side, rightBoundarySemanticId);

    if (!leftColumn || !rightColumn) {
        return null;
    }

    return {
        leftColumn,
        rightColumn
    };
}

export function resolveBlueprintBoundaryColumns(semanticRaster = {}, side = "", blueprint = null) {
    if (!blueprint) {
        return null;
    }

    return resolveSemanticBoundaryColumns(
        semanticRaster,
        side,
        blueprint.leftBoundarySemanticId,
        blueprint.rightBoundarySemanticId
    );
}

export function resolveCollectionBoundaryColumns(semanticRaster = {}, side = "", blueprint = null, key = "") {
    const collectionBlueprint = findBlueprintCollection(blueprint, key);

    if (!collectionBlueprint) {
        return null;
    }

    return resolveSemanticBoundaryColumns(
        semanticRaster,
        side,
        collectionBlueprint.leftBoundarySemanticId,
        collectionBlueprint.rightBoundarySemanticId
    );
}
