import { createRowShellKey } from "./structure.js";
import {
    createBlockFrame,
    resolveAxisContext,
    toLocalRow
} from "./verticalLayout.js";
import { collectRowShellStatesAndBounds } from "./projectionBlockBounds.js";

export function buildShellBlock(shellState = {}, minRelativeRow = 0, blueprintByRowShellKey = new Map()) {
    const blueprint = blueprintByRowShellKey.get(
        createRowShellKey(shellState.rowId, shellState.shellId)
    ) || null;

    return {
        ...shellState,
        localTopRow: toLocalRow(shellState.minRelativeRow, minRelativeRow),
        localBottomRow: toLocalRow(shellState.maxRelativeRow, minRelativeRow),
        axisLocalRow: toLocalRow(shellState.axisRelativeRow, minRelativeRow),
        leftBoundarySemanticId: blueprint?.leftBoundarySemanticId || null,
        rightBoundarySemanticId: blueprint?.rightBoundarySemanticId || null,
        shellSlotKinds: blueprint?.shellSlotKinds || []
    };
}

export function buildProjectionBlockRow(row = {}, blueprintByRowShellKey = new Map()) {
    const {
        shellStates,
        bounds
    } = collectRowShellStatesAndBounds(row);
    const minRelativeRow = bounds?.minRelativeRow ?? 0;
    const maxRelativeRow = bounds?.maxRelativeRow ?? 0;
    const axisRelativeRow = 0;
    const blockFrame = createBlockFrame(
        minRelativeRow,
        maxRelativeRow,
        axisRelativeRow,
        resolveAxisContext(shellStates)
    );

    return {
        rowId: row.rowId,
        rowIndex: row.rowIndex,
        ...blockFrame,
        shellBlocks: shellStates
            .sort((left, right) => left.depth - right.depth)
            .map((shellState) => buildShellBlock(
                shellState,
                minRelativeRow,
                blueprintByRowShellKey
            ))
    };
}

export function buildProjectionBlockRows(rows = [], blueprintByRowShellKey = new Map()) {
    return (rows || []).map((row) => buildProjectionBlockRow(row, blueprintByRowShellKey));
}
