import { collectChildCollections } from "./structure.js";
import { toProjectionContentCol } from "./shellGeometry.js";
import { toLocalRow } from "./verticalLayout.js";

export function createAtomPathKey(atomPath = []) {
    return atomPath.join(".");
}

export function resolveLeafProjectionRole(context = {}) {
    if (context.side === "anchor") {
        return "anchor";
    }

    if ((context.collectionPath || []).includes("numerator")) {
        return "numerator";
    }

    if ((context.collectionPath || []).includes("denominator")) {
        return "denominator";
    }

    if (context.immediateCollectionKey === "factor") {
        return "product_factor";
    }

    if (context.immediateCollectionKey === "passive") {
        return "inverse_passive";
    }

    if (context.immediateCollectionKey === "content" && context.immediateShellType === "MULTIPLICATION") {
        return "product_content";
    }

    if (
        context.immediateCollectionKey === "content"
        && ["ADDITION", "SUBTRACTION"].includes(context.immediateShellType)
    ) {
        return "inverse_content";
    }

    if (context.immediateCollectionKey === "content" && context.immediateShellType === "NEGATION") {
        return "negation_content";
    }

    return "content";
}

export function buildLeafColumnLookup(row = {}) {
    const lookup = new Map();

    (row.leafColumns || []).forEach((leafColumn) => {
        lookup.set(createAtomPathKey(leafColumn.atomPath), leafColumn);
    });

    return lookup;
}

export function createLeafProjectionAtom(atom, leafColumn, context, blockRow) {
    const rawCol = toProjectionContentCol(leafColumn.globalCol);
    const localRow = toLocalRow(context.relativeRow, blockRow.minRelativeRow);

    return {
        id: `${blockRow.rowId}::leaf::${createAtomPathKey(context.atomPath)}`,
        type: atom?.type || "UNKNOWN",
        value: atom?.value || null,
        text: atom?.value || null,
        isVisible: true,
        rowId: blockRow.rowId,
        rowIndex: blockRow.rowIndex,
        localRow,
        relativeRow: context.relativeRow,
        col: rawCol,
        colStart: rawCol,
        colEnd: rawCol,
        rawCol,
        rawColStart: rawCol,
        rawColEnd: rawCol,
        side: context.side,
        sourceAtomId: leafColumn.semanticId,
        sourceShellId: context.parentShellId || null,
        projectionRole: resolveLeafProjectionRole(context),
        placementKey: leafColumn.placementKey,
        globalContentCol: leafColumn.globalCol,
        collectionPath: [...context.collectionPath],
        shellTypePath: [...context.shellTypePath],
        atomPath: [...context.atomPath]
    };
}

export function collectVisibleLeafProjectionAtoms(
    collection = [],
    context = {},
    leafColumnLookup = new Map(),
    blockRow = {},
    target = []
) {
    collection.forEach((atom, childIndex) => {
        if (!atom || atom.isVisible === false || context.projectionVisible === false) {
            return;
        }

        const atomPath = context.useCollectionIndex === false
            ? [...context.atomPath]
            : [...context.atomPath, childIndex];
        const childCollections = collectChildCollections(atom);

        if (childCollections.length === 0) {
            const leafColumn = leafColumnLookup.get(createAtomPathKey(atomPath));

            if (!leafColumn) {
                return;
            }

            target.push(createLeafProjectionAtom(atom, leafColumn, {
                ...context,
                atomPath
            }, blockRow));
            return;
        }

        childCollections.forEach((childCollection) => {
            collectVisibleLeafProjectionAtoms(childCollection.entries, {
                ...context,
                atomPath: [...atomPath, childCollection.key],
                relativeRow: context.relativeRow + childCollection.rowShift,
                parentShellId: typeof atom.id === "string" && atom.id.length > 0
                    ? atom.id
                    : context.parentShellId,
                collectionPath: [...context.collectionPath, childCollection.key],
                shellTypePath: [...context.shellTypePath, atom.type || "UNKNOWN"],
                immediateCollectionKey: childCollection.key,
                immediateShellType: atom.type || "UNKNOWN",
                useCollectionIndex: true
            }, leafColumnLookup, blockRow, target);
        });
    });

    return target;
}
