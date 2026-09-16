import {
    collectChildCollections,
    isShellAtom,
    resolveBoundarySemanticIds
} from "./structure.js";

export function collectVisibleLeafSemanticIds(collection = []) {
    const semanticIds = [];

    collection.forEach((atom) => {
        if (!atom || atom.isVisible === false) {
            return;
        }

        if (isShellAtom(atom)) {
            collectChildCollections(atom).forEach((childCollection) => {
                semanticIds.push(...collectVisibleLeafSemanticIds(childCollection.entries));
            });
            return;
        }

        if (typeof atom.id === "string" && atom.id.length > 0) {
            semanticIds.push(atom.id);
        }
    });

    return semanticIds;
}

export function collectVisibleDescendantSemanticIds(collection = []) {
    const semanticIds = [];

    collection.forEach((atom) => {
        if (!atom || atom.isVisible === false) {
            return;
        }

        if (typeof atom.id === "string" && atom.id.length > 0) {
            semanticIds.push(atom.id);
        }

        collectChildCollections(atom).forEach((childCollection) => {
            semanticIds.push(...collectVisibleDescendantSemanticIds(childCollection.entries));
        });
    });

    return semanticIds;
}

export function collectVisibleDescendantShellIds(collection = []) {
    const shellIds = [];

    collection.forEach((atom) => {
        if (!atom || atom.isVisible === false || !isShellAtom(atom)) {
            return;
        }

        if (typeof atom.id === "string" && atom.id.length > 0) {
            shellIds.push(atom.id);
        }

        collectChildCollections(atom).forEach((childCollection) => {
            shellIds.push(...collectVisibleDescendantShellIds(childCollection.entries));
        });
    });

    return shellIds;
}

export function buildCollectionBlueprint(collection = {}) {
    const directChildIds = (collection.entries || [])
        .map((entry) => entry?.id)
        .filter((id) => typeof id === "string" && id.length > 0);
    const visibleLeafSemanticIds = collectVisibleLeafSemanticIds(collection.entries);
    const collectionBoundaries = resolveBoundarySemanticIds(visibleLeafSemanticIds);

    return {
        key: collection.key,
        directChildIds,
        visibleDescendantSemanticIds: collectVisibleDescendantSemanticIds(collection.entries),
        visibleLeafSemanticIds,
        visibleDescendantShellIds: collectVisibleDescendantShellIds(collection.entries),
        ...collectionBoundaries
    };
}

export function buildCollectionBlueprints(childCollections = []) {
    return (childCollections || []).map((collection) => buildCollectionBlueprint(collection));
}
