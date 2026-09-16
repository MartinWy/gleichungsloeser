function cloneStructuredValue(value) {
    return JSON.parse(JSON.stringify(value));
}

function isVisibleNode(node) {
    return Boolean(node) && node.isVisible !== false;
}

function stripRedundantVisibleOuterGroups(nodes = []) {
    let normalizedNodes = cloneStructuredValue(Array.isArray(nodes) ? nodes : []);

    while (true) {
        const visibleIndices = normalizedNodes.reduce((indices, node, index) => {
            if (isVisibleNode(node)) {
                indices.push(index);
            }
            return indices;
        }, []);

        if (visibleIndices.length !== 1) {
            return normalizedNodes;
        }

        const visibleIndex = visibleIndices[0];
        const visibleNode = normalizedNodes[visibleIndex];

        if (
            visibleNode?.type !== "GROUP"
            || !Array.isArray(visibleNode.content)
            || visibleNode.content.length === 0
        ) {
            return normalizedNodes;
        }

        normalizedNodes = [
            ...normalizedNodes.slice(0, visibleIndex),
            ...cloneStructuredValue(visibleNode.content),
            ...normalizedNodes.slice(visibleIndex + 1)
        ];
    }
}

function normalizeEquationOuterGroups(structure = []) {
    const normalizedStructure = cloneStructuredValue(Array.isArray(structure) ? structure : []);
    const anchorIndex = normalizedStructure.findIndex(
        (node) => node?.isVisible !== false && node?.value === "="
    );

    if (anchorIndex === -1) {
        return stripRedundantVisibleOuterGroups(normalizedStructure);
    }

    const leftSide = stripRedundantVisibleOuterGroups(normalizedStructure.slice(0, anchorIndex));
    const rightSide = stripRedundantVisibleOuterGroups(normalizedStructure.slice(anchorIndex + 1));

    return [
        ...leftSide,
        normalizedStructure[anchorIndex],
        ...rightSide
    ];
}

export {
    normalizeEquationOuterGroups,
    stripRedundantVisibleOuterGroups
};
