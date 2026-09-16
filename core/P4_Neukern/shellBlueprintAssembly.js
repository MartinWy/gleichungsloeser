import {
    collectChildCollections,
    isShellAtom,
    resolveBoundarySemanticIds,
    resolveShellRole,
    SHELL_SLOT_KIND_BY_TYPE
} from "./structure.js";
import { buildCollectionBlueprints } from "./shellBlueprintCollections.js";

export function createShellBlueprint(atom, context = {}) {
    const collectionBlueprints = buildCollectionBlueprints(collectChildCollections(atom));
    const visibleLeafSemanticIds = collectionBlueprints.flatMap(
        (collection) => collection.visibleLeafSemanticIds
    );
    const shellBoundaries = resolveBoundarySemanticIds(visibleLeafSemanticIds);

    return {
        blueprintId: `${context.rowId}::${context.shellId}`,
        shellId: context.shellId,
        rowId: context.rowId,
        rowIndex: context.rowIndex,
        rootAtomIndex: context.rootAtomIndex,
        side: context.side,
        depth: context.depth,
        parentShellId: context.parentShellId,
        parentCollectionKey: context.parentCollectionKey,
        shellType: atom?.type || "UNKNOWN",
        shellRole: resolveShellRole(atom),
        shellName: atom?.name || null,
        isVisible: atom?.isVisible !== false,
        isGenerated: atom?.isGenerated === true,
        shellSlotKinds: SHELL_SLOT_KIND_BY_TYPE[atom?.type] || [],
        collections: collectionBlueprints,
        visibleLeafSemanticIds,
        ...shellBoundaries
    };
}

export function walkShellBlueprints(collection = [], context = {}, target = []) {
    collection.forEach((atom) => {
        if (!atom || !isShellAtom(atom)) {
            return;
        }

        const shellId = typeof atom.id === "string" && atom.id.length > 0
            ? atom.id
            : `${context.rowId}::shell-${target.length}`;
        const blueprint = createShellBlueprint(atom, {
            ...context,
            shellId
        });

        target.push(blueprint);

        collectChildCollections(atom).forEach((childCollection) => {
            walkShellBlueprints(childCollection.entries, {
                ...context,
                depth: context.depth + 1,
                parentShellId: shellId,
                parentCollectionKey: childCollection.key
            }, target);
        });
    });
}

export function createShellBlueprintTraversalContext(row = {}, entry = {}) {
    return {
        rowId: row.rowId,
        rowIndex: row.rowIndex,
        rootAtomIndex: entry.atomIndex,
        side: entry.side,
        depth: 0,
        parentShellId: null,
        parentCollectionKey: null
    };
}

export function createShellBlueprintDraftFromResolvedInputs({
    semanticRaster = null
} = {}) {
    const blueprints = [];

    (semanticRaster?.rows || []).forEach((row) => {
        row.atoms.forEach((entry) => {
            walkShellBlueprints(
                [entry.atom],
                createShellBlueprintTraversalContext(row, entry),
                blueprints
            );
        });
    });

    return {
        rows: (semanticRaster?.rows || []).map((row) => ({
            rowId: row.rowId,
            rowIndex: row.rowIndex,
            shellIds: blueprints
                .filter((blueprint) => blueprint.rowIndex === row.rowIndex)
                .map((blueprint) => blueprint.shellId)
        })),
        blueprints
    };
}
