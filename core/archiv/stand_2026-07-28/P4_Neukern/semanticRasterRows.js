import { collectChildCollections } from "./structure.js";

export function resolveAnchorIndex(atoms = []) {
    const anchorIndex = atoms.findIndex((atom) => atom?.value === "=");
    return anchorIndex === -1 ? 0 : anchorIndex;
}

export function resolveSemanticId(atom, rowIndex, atomIndex) {
    if (typeof atom?.id === "string" && atom.id.length > 0) {
        return atom.id;
    }

    return `anonymous-${rowIndex}-${atomIndex}`;
}

export function isLeafAtom(atom) {
    return collectChildCollections(atom).length === 0;
}

export function isVisibleLeafEntry(entry) {
    return Boolean(entry) && entry.projectionVisible === true && isLeafAtom(entry.atom);
}

export function createSemanticEntry(atom, context = {}) {
    const semanticId = resolveSemanticId(atom, context.rowIndex, context.atomIndex);
    const projectionVisible = context.projectionVisible !== false && atom?.isVisible !== false;

    return {
        semanticId,
        rowId: context.rowId,
        rowIndex: context.rowIndex,
        atomIndex: context.atomIndex,
        atomPath: context.atomPath,
        side: context.side,
        rootAtomIndex: context.rootAtomIndex,
        depth: context.depth,
        parentSemanticId: context.parentSemanticId,
        parentCollectionKey: context.parentCollectionKey,
        projectionVisible,
        atom
    };
}

export function flattenAtomEntries(atom, context = {}) {
    const semanticEntry = createSemanticEntry(atom, context);
    const flattenedEntries = [semanticEntry];
    const childCollections = collectChildCollections(atom);

    childCollections.forEach((collection) => {
        collection.entries.forEach((childAtom, childIndex) => {
            flattenedEntries.push(
                ...flattenAtomEntries(childAtom, {
                    ...context,
                    atomIndex: context.atomIndex,
                    atomPath: [...context.atomPath, collection.key, childIndex],
                    depth: context.depth + 1,
                    parentSemanticId: semanticEntry.semanticId,
                    parentCollectionKey: collection.key,
                    projectionVisible: semanticEntry.projectionVisible
                })
            );
        });
    });

    return flattenedEntries;
}

export function createRowRasterEntry(row = {}, rowIndex = 0) {
    const atoms = Array.isArray(row?.atoms) ? row.atoms : [];
    const anchorIndex = resolveAnchorIndex(atoms);
    const topLevelAtoms = atoms.map((atom, atomIndex) => ({
        semanticId: resolveSemanticId(atom, rowIndex, atomIndex),
        atomIndex,
        side: atomIndex < anchorIndex ? "left" : (atomIndex > anchorIndex ? "right" : "anchor"),
        atom
    }));
    const flattenedAtoms = topLevelAtoms.flatMap((entry) => (
        flattenAtomEntries(entry.atom, {
            rowId: row.rowId,
            rowIndex,
            atomIndex: entry.atomIndex,
            atomPath: [entry.atomIndex],
            side: entry.side,
            rootAtomIndex: entry.atomIndex,
            depth: 0,
            parentSemanticId: null,
            parentCollectionKey: null,
            projectionVisible: true
        })
    ));
    const visibleLeafEntries = flattenedAtoms.filter((entry) => isVisibleLeafEntry(entry));
    const leftLeafEntries = visibleLeafEntries.filter((entry) => entry.side === "left");
    const anchorLeafEntries = visibleLeafEntries.filter((entry) => entry.side === "anchor");
    const rightLeafEntries = visibleLeafEntries.filter((entry) => entry.side === "right");

    return {
        rowId: row.rowId,
        rowIndex,
        strategy: row.strategy || null,
        anchorIndex,
        leftAtoms: atoms.slice(0, anchorIndex),
        anchorAtom: atoms[anchorIndex] || null,
        rightAtoms: atoms.slice(anchorIndex + 1),
        atoms: topLevelAtoms,
        flattenedAtoms,
        visibleLeafEntries,
        leftLeafEntries,
        anchorLeafEntries,
        rightLeafEntries,
        leftLeafSemanticIds: leftLeafEntries.map((entry) => entry.semanticId),
        anchorLeafSemanticIds: anchorLeafEntries.map((entry) => entry.semanticId),
        rightLeafSemanticIds: rightLeafEntries.map((entry) => entry.semanticId)
    };
}
