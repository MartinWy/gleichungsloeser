export function needsPowerParens(node) {
    return Boolean(node && !(
        node.type === "text"
        && ["number", "variable", "anchor"].includes(node.kind)
    ));
}

function resolveShellOptions(options = {}) {
    return {
        suppressOuterGroupShell: options?.suppressOuterGroupShell === true,
        includeRootShell: options?.includeRootShell === true
    };
}

export function decomposeVisibleShells(node, options = {}) {
    const resolvedOptions = resolveShellOptions(options);

    if (!node) {
        return {
            coreNode: null,
            shells: []
        };
    }

    if (node.type === "group") {
        if (resolvedOptions.suppressOuterGroupShell) {
            return decomposeVisibleShells(
                node.content,
                {
                    ...resolvedOptions,
                    suppressOuterGroupShell: false
                }
            );
        }

        const inner = decomposeVisibleShells(node.content, resolvedOptions);

        return {
            coreNode: inner.coreNode,
            shells: [{ kind: "group", node }, ...inner.shells]
        };
    }

    if (node.type === "function") {
        const inner = decomposeVisibleShells(
            node.argument,
            {
                ...resolvedOptions,
                suppressOuterGroupShell: true
            }
        );

        return {
            coreNode: inner.coreNode,
            shells: [{ kind: "function", node }, ...inner.shells]
        };
    }

    if (node.type === "power" && needsPowerParens(node.base)) {
        const inner = decomposeVisibleShells(
            node.base,
            {
                ...resolvedOptions,
                suppressOuterGroupShell: true
            }
        );

        return {
            coreNode: inner.coreNode,
            shells: [{ kind: "power", node }, ...inner.shells]
        };
    }

    if (node.type === "root" && resolvedOptions.includeRootShell) {
        return {
            coreNode: node,
            shells: [{ kind: "root", node }]
        };
    }

    return {
        coreNode: node,
        shells: []
    };
}
