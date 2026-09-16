function markNodesHidden(nodes = [], formerRole = null) {
    nodes.forEach((node) => {
        node.isVisible = false;
        if (formerRole) {
            node.formerRole = formerRole;
        }
    });
}

function markNodesEmerged(nodes = []) {
    nodes.forEach((node) => {
        node.isBefreit = true;
        node.isVisible = true;
    });
}

function collectVisibleNodes(nodes = []) {
    return (nodes || []).filter((node) => node?.isVisible !== false);
}

export {
    collectVisibleNodes,
    markNodesEmerged,
    markNodesHidden
};
