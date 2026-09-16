import { collectChildCollections, resolveShellRole } from "./structure.js";
import {
    createRelativeBounds,
    mergeRelativeBounds
} from "./verticalLayout.js";

export function collectCollectionBounds(collection = [], axisRelativeRow = 0, context = {}, shellStates = []) {
    return (collection || []).reduce((bounds, atom) => {
        return mergeRelativeBounds(bounds, collectAtomBounds(atom, axisRelativeRow, context, shellStates));
    }, null);
}

export function collectAtomBounds(atom, axisRelativeRow = 0, context = {}, shellStates = []) {
    if (!atom || atom.isVisible === false) {
        return null;
    }

    const shellId = typeof atom?.id === "string" && atom.id.length > 0
        ? atom.id
        : null;
    const childCollections = collectChildCollections(atom);

    if (childCollections.length === 0) {
        return createRelativeBounds(axisRelativeRow);
    }

    let bounds = createRelativeBounds(axisRelativeRow);

    childCollections.forEach((childCollection) => {
        const childBounds = collectCollectionBounds(
            childCollection.entries,
            axisRelativeRow + childCollection.rowShift,
            {
                ...context,
                depth: (context.depth || 0) + 1,
                parentShellId: shellId,
                parentCollectionKey: childCollection.key
            },
            shellStates
        );
        bounds = mergeRelativeBounds(bounds, childBounds);
    });

    if (shellId) {
        shellStates.push({
            shellId,
            shellType: atom.type || "UNKNOWN",
            shellRole: resolveShellRole(atom),
            rowId: context.rowId,
            rowIndex: context.rowIndex,
            side: context.side,
            rootAtomIndex: context.rootAtomIndex,
            parentShellId: context.parentShellId || null,
            parentCollectionKey: context.parentCollectionKey || null,
            depth: context.depth || 0,
            axisRelativeRow,
            minRelativeRow: bounds.minRelativeRow,
            maxRelativeRow: bounds.maxRelativeRow,
            isGenerated: atom?.isGenerated === true
        });
    }

    return bounds;
}

export function collectRowShellStatesAndBounds(row = {}) {
    const shellStates = [];
    let bounds = null;

    (row.atoms || []).forEach((entry) => {
        bounds = mergeRelativeBounds(bounds, collectAtomBounds(entry.atom, 0, {
            rowId: row.rowId,
            rowIndex: row.rowIndex,
            side: entry.side,
            rootAtomIndex: entry.atomIndex,
            parentShellId: null,
            parentCollectionKey: null,
            depth: 0
        }, shellStates));
    });

    return {
        shellStates,
        bounds
    };
}
