const LEAF_NODE_TYPES = new Set([
    "VARIABLE",
    "NUMBER",
    "OPERATOR",
    "ANCHOR"
]);

const SHELL_NODE_TYPES = new Set([
    "GROUP",
    "COLLECTION",
    "FUNCTION",
    "ROOT",
    "POWER",
    "NEGATION",
    "DIVISION",
    "MULTIPLICATION",
    "ADDITION",
    "SUBTRACTION"
]);

function isVisibleRuntimeNode(node) {
    return Boolean(node) && node.isVisible !== false;
}

function isRuntimeLeafNode(node) {
    return Boolean(node) && LEAF_NODE_TYPES.has(node.type);
}

function isRuntimeShellNode(node) {
    return Boolean(node) && SHELL_NODE_TYPES.has(node.type);
}

function walkChildCollection(nodes, visit, context, nodePath, nextShellPath, options = {}) {
    walkVisibleProjectionNodes(nodes, visit, {
        side: context.side || null,
        relativeRow: options.relativeRow ?? context.relativeRow ?? 0,
        collectionRole: options.collectionRole || null,
        projectionRole: options.projectionRole || null,
        regionRole: options.regionRole || context.regionRole || null,
        shellPath: nextShellPath,
        shellTypePath: Array.isArray(context.shellTypePath) ? context.shellTypePath : [],
        path: [...nodePath, options.pathKey || options.collectionRole || "content"]
    });
}

function walkInterleavedCollections(items, visit, context, nodePath, nextShellPath) {
    items.forEach((item, index) => {
        walkChildCollection([item.node], visit, context, nodePath, nextShellPath, {
            relativeRow: context.relativeRow,
            collectionRole: item.collectionRole,
            projectionRole: item.projectionRole,
            pathKey: `${item.pathKey}.${index}`
        });
    });
}

function buildInterleavedNaryItems(children = [], operators = [], childRole, operatorRole, contentProjectionRole = "content") {
    const items = [];

    children.forEach((child, index) => {
        items.push({
            node: child,
            collectionRole: childRole,
            projectionRole: contentProjectionRole,
            pathKey: childRole
        });

        if (operators[index]) {
            items.push({
                node: operators[index],
                collectionRole: "operators",
                projectionRole: operatorRole,
                pathKey: "operators"
            });
        }
    });

    return items;
}

function walkVisibleProjectionNodes(nodes, visit, context = {}) {
    const normalizedNodes = Array.isArray(nodes) ? nodes : [];
    const path = Array.isArray(context.path) ? context.path : ["nodes"];
    const shellPath = Array.isArray(context.shellPath) ? context.shellPath : [];
    const shellTypePath = Array.isArray(context.shellTypePath) ? context.shellTypePath : [];
    const relativeRow = Number.isFinite(context.relativeRow) ? context.relativeRow : 0;
    const collectionRole = typeof context.collectionRole === "string" ? context.collectionRole : null;

    normalizedNodes.forEach((node, index) => {
        if (!isVisibleRuntimeNode(node)) {
            return;
        }

        const nodePath = [...path, String(index)];
        const nodeRelativeRow = relativeRow;
        const nodeContext = {
            side: context.side || null,
            relativeRow: nodeRelativeRow,
            collectionRole,
            projectionRole: context.projectionRole || "content",
            regionRole: context.regionRole || null,
            shellPath,
            shellTypePath,
            parentShellId: shellPath[shellPath.length - 1] || null,
            parentShellType: shellTypePath[shellTypePath.length - 1] || null,
            path: nodePath.join(".")
        };

        visit(node, nodeContext);

        if (!isRuntimeShellNode(node)) {
            return;
        }

        const nextShellPath = [...shellPath, node.id].filter(Boolean);
        const nextShellTypePath = [...shellTypePath, node.type].filter(Boolean);
        const childContext = {
            ...context,
            relativeRow: nodeRelativeRow,
            shellTypePath: nextShellTypePath
        };

        switch (node.type) {
            case "DIVISION":
                walkChildCollection(node.numerator, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow - 1,
                    collectionRole: "numerator",
                    projectionRole: "content",
                    pathKey: "numerator"
                });
                walkChildCollection(node.denominator, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow + 1,
                    collectionRole: "denominator",
                    projectionRole: "content",
                    pathKey: "denominator"
                });
                break;
            case "MULTIPLICATION":
                walkInterleavedCollections(
                    buildInterleavedNaryItems(
                        node.factors,
                        node.operators,
                        "factors",
                        "multiplication_operator",
                        childContext.regionRole || "content"
                    ),
                    visit,
                    childContext,
                    nodePath,
                    nextShellPath
                );
                break;
            case "ADDITION":
                walkInterleavedCollections(
                    buildInterleavedNaryItems(
                        node.terms,
                        node.operators,
                        "terms",
                        "addition_operator",
                        childContext.regionRole || "content"
                    ),
                    visit,
                    childContext,
                    nodePath,
                    nextShellPath
                );
                break;
            case "SUBTRACTION":
                walkInterleavedCollections([
                    {
                        node: node.minuend?.[0],
                        collectionRole: "minuend",
                        projectionRole: childContext.regionRole || "content",
                        pathKey: "minuend"
                    },
                    {
                        node: node.operator,
                        collectionRole: "operator",
                        projectionRole: "subtraction_operator",
                        pathKey: "operator"
                    },
                    {
                        node: node.subtrahend?.[0],
                        collectionRole: "subtrahend",
                        projectionRole: childContext.regionRole || "content",
                        pathKey: "subtrahend"
                    }
                ].filter((item) => item.node), visit, childContext, nodePath, nextShellPath);
                break;
            case "NEGATION":
                walkInterleavedCollections([
                    {
                        node: node.operator,
                        collectionRole: "operator",
                        projectionRole: "negation_sign",
                        pathKey: "operator"
                    },
                    {
                        node: node.content?.[0],
                        collectionRole: "content",
                        projectionRole: childContext.regionRole || "content",
                        pathKey: "content"
                    }
                ].filter((item) => item.node), visit, childContext, nodePath, nextShellPath);
                break;
            case "POWER":
                walkChildCollection(node.content, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow,
                    collectionRole: "content",
                    projectionRole: childContext.regionRole || "content",
                    regionRole: childContext.regionRole || "power_base",
                    pathKey: "content"
                });
                walkChildCollection(node.exponentNodes, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow - 1,
                    collectionRole: "exponentNodes",
                    projectionRole: "power_exponent",
                    regionRole: "power_exponent",
                    pathKey: "exponentNodes"
                });
                break;
            case "FUNCTION":
                walkChildCollection(node.baseContent, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow + 1,
                    collectionRole: "baseContent",
                    projectionRole: childContext.regionRole || "function_base",
                    regionRole: childContext.regionRole || "function_base",
                    pathKey: "baseContent"
                });
                walkChildCollection(node.content, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow,
                    collectionRole: "content",
                    projectionRole: childContext.regionRole || "content",
                    pathKey: "content"
                });
                break;
            case "ROOT":
                walkChildCollection(node.degreeNodes, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow - 1,
                    collectionRole: "degreeNodes",
                    projectionRole: childContext.regionRole || "root_degree",
                    regionRole: childContext.regionRole || "root_degree",
                    pathKey: "degreeNodes"
                });
                walkChildCollection(node.content, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow,
                    collectionRole: "content",
                    projectionRole: childContext.regionRole || "content",
                    pathKey: "content"
                });
                break;
            case "GROUP":
            case "COLLECTION":
                walkChildCollection(node.content, visit, childContext, nodePath, nextShellPath, {
                    relativeRow: nodeRelativeRow,
                    collectionRole: "content",
                    projectionRole: childContext.regionRole || "content",
                    pathKey: "content"
                });
                break;
            default:
                break;
        }
    });
}

function collectVisibleLeafPlacements(nodes, context = {}) {
    const placements = [];

    walkVisibleProjectionNodes(nodes, (node, nodeContext) => {
        if (!isRuntimeLeafNode(node)) {
            return;
        }

        placements.push({
            nodeId: node.id,
            nodeType: node.type,
            value: node.value,
            isImplicit: node.isImplicit === true,
            side: nodeContext.side,
            relativeRow: nodeContext.relativeRow,
            role: nodeContext.projectionRole || "content",
            regionRole: nodeContext.regionRole || null,
            collectionRole: nodeContext.collectionRole,
            shellPath: [...nodeContext.shellPath],
            shellTypePath: [...nodeContext.shellTypePath],
            parentShellId: nodeContext.parentShellId,
            parentShellType: nodeContext.parentShellType,
            path: nodeContext.path
        });
    }, context);

    return placements;
}

function collectVisibleShellStates(nodes, context = {}) {
    const shells = [];

    walkVisibleProjectionNodes(nodes, (node, nodeContext) => {
        if (!isRuntimeShellNode(node)) {
            return;
        }

        shells.push({
            shellId: node.id,
            shellType: node.type,
            side: nodeContext.side,
            relativeRow: nodeContext.relativeRow,
            shellPath: [...nodeContext.shellPath],
            path: nodeContext.path,
            node
        });
    }, context);

    return shells;
}

function collectVisibleLeafIds(nodes, context = {}) {
    return collectVisibleLeafPlacements(nodes, context).map((placement) => placement.nodeId);
}

export {
    collectVisibleLeafIds,
    collectVisibleLeafPlacements,
    collectVisibleShellStates,
    isRuntimeLeafNode,
    isRuntimeShellNode,
    isVisibleRuntimeNode,
    walkVisibleProjectionNodes
};
