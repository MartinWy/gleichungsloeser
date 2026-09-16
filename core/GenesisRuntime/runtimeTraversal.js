const RUNTIME_NESTED_COLLECTION_KEYS = Object.freeze([
    "content",
    "baseContent",
    "degreeNodes",
    "exponentNodes",
    "numerator",
    "denominator",
    "factors",
    "operators",
    "terms",
    "minuend",
    "subtrahend",
    // Uebergangslesbarkeit fuer bereits erzeugte P3-Zustaende.
    // P1 darf diese drei Rollen nicht liefern.
    "factor",
    "passive",
]);

function walkRuntimeNodes(nodes, visit, context = { parentId: null, containerKey: null, path: ["nodes"] }) {
    (nodes || []).forEach((node, index) => {
        if (!node) {
            return;
        }

        const nodePath = [...(context.path || ["nodes"]), String(index)];
        visit(node, {
            parentId: context.parentId || null,
            containerKey: context.containerKey || null,
            index,
            path: nodePath.join(".")
        });

        RUNTIME_NESTED_COLLECTION_KEYS.forEach((key) => {
            if (!Array.isArray(node[key])) {
                return;
            }

            walkRuntimeNodes(node[key], visit, {
                parentId: node.id || context.parentId || null,
                containerKey: key,
                path: [...nodePath, key]
            });
        });
    });
}

export {
    RUNTIME_NESTED_COLLECTION_KEYS,
    walkRuntimeNodes
};
