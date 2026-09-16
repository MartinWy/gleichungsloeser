import {
    buildLeafColumnLookup,
    collectVisibleLeafProjectionAtoms
} from "./leafProjectionAtoms.js";
import {
    sortProjectionAtoms
} from "./projectionRowLayout.js";
import { buildShellProjectionAtoms } from "./shellProjectionAtoms.js";

export function createDefaultBlockRow(semanticRow = {}) {
    return {
        rowId: semanticRow.rowId,
        rowIndex: semanticRow.rowIndex,
        minRelativeRow: 0,
        axisLocalRow: 0,
        localRowCount: 1,
        rowKinds: ["axis"],
        shellBlocks: []
    };
}

export function createLeafTraversalContext(entry = {}) {
    return {
        atomPath: [entry.atomIndex],
        relativeRow: 0,
        side: entry.side,
        projectionVisible: true,
        collectionPath: [],
        shellTypePath: [],
        immediateCollectionKey: null,
        immediateShellType: null,
        parentShellId: null,
        useCollectionIndex: false
    };
}

export function buildProjectionRowDraft(
    semanticRow = {},
    semanticRaster = null,
    blueprintByRowShellKey = new Map(),
    blockRow = null
) {
    const resolvedBlockRow = blockRow || createDefaultBlockRow(semanticRow);
    const leafColumnLookup = buildLeafColumnLookup(semanticRow);
    const positionedAtoms = [];

    (semanticRow.atoms || []).forEach((entry) => {
        collectVisibleLeafProjectionAtoms(
            [entry.atom],
            createLeafTraversalContext(entry),
            leafColumnLookup,
            resolvedBlockRow,
            positionedAtoms
        );
    });

    (resolvedBlockRow.shellBlocks || []).forEach((shellBlock) => {
        positionedAtoms.push(
            ...buildShellProjectionAtoms(
                shellBlock,
                semanticRaster,
                blueprintByRowShellKey,
                resolvedBlockRow
            )
        );
    });

    return {
        rowId: semanticRow.rowId,
        rowIndex: semanticRow.rowIndex,
        strategy: semanticRow.strategy || null,
        minRelativeRow: resolvedBlockRow.minRelativeRow,
        maxRelativeRow: resolvedBlockRow.maxRelativeRow,
        localRowCount: resolvedBlockRow.localRowCount,
        axisLocalRow: resolvedBlockRow.axisLocalRow,
        axisContext: resolvedBlockRow.axisContext,
        rowKinds: [...(resolvedBlockRow.rowKinds || [])],
        positionedAtoms: positionedAtoms.sort(sortProjectionAtoms)
    };
}

export function buildProjectionRowsDraft(
    semanticRows = [],
    semanticRaster = null,
    blueprintByRowShellKey = new Map(),
    blockByRowId = new Map()
) {
    return semanticRows.map((semanticRow) => buildProjectionRowDraft(
        semanticRow,
        semanticRaster,
        blueprintByRowShellKey,
        blockByRowId.get(semanticRow.rowId) || createDefaultBlockRow(semanticRow)
    ));
}
