import { createRowShellKey } from "./structure.js";
import { resolveShellHorizontalLayout } from "./shellGeometry.js";
import { resolveShellSlotDescriptors, resolveShellSlotLocalRow } from "./shellEmission.js";
import { toRelativeRow } from "./verticalLayout.js";

function createSlotAtom(base = {}) {
    const rawColStart = Number.isInteger(base.rawColStart) ? base.rawColStart : base.rawCol;
    const rawColEnd = Number.isInteger(base.rawColEnd) ? base.rawColEnd : base.rawCol;

    return {
        ...base,
        col: Number.isInteger(base.rawCol) ? base.rawCol : rawColStart,
        colStart: rawColStart,
        colEnd: rawColEnd,
        rawCol: Number.isInteger(base.rawCol) ? base.rawCol : rawColStart,
        rawColStart,
        rawColEnd
    };
}

export function createShellContainerProjectionAtom(shellBlock = {}, blueprint = null, blockRow = {}, geometry = null) {
    const rawColStart = geometry?.containerRange?.rawColStart;
    const rawColEnd = geometry?.containerRange?.rawColEnd;

    if (!Number.isInteger(rawColStart) || !Number.isInteger(rawColEnd)) {
        return null;
    }

    const rawCol = Math.floor((rawColStart + rawColEnd) / 2);
    const relativeRow = toRelativeRow(shellBlock.axisLocalRow ?? 0, blockRow.minRelativeRow ?? 0);

    return {
        id: shellBlock.shellId,
        type: shellBlock.shellType,
        value: blueprint?.shellName || null,
        text: blueprint?.shellName || null,
        isVisible: true,
        isGenerated: shellBlock.isGenerated === true,
        rowId: blockRow.rowId,
        rowIndex: blockRow.rowIndex,
        localRow: shellBlock.axisLocalRow ?? 0,
        relativeRow,
        col: rawCol,
        colStart: rawColStart,
        colEnd: rawColEnd,
        rawCol,
        rawColStart,
        rawColEnd,
        side: shellBlock.side,
        sourceAtomId: shellBlock.shellId,
        sourceShellId: shellBlock.parentShellId || null,
        projectionRole: shellBlock.shellRole,
        shellSlotKinds: [...(shellBlock.shellSlotKinds || [])]
    };
}

export function createShellSlotProjectionAtom(shellBlock = {}, blockRow = {}, descriptor = null, slotLayout = null) {
    if (!descriptor || !Number.isInteger(slotLayout?.rawCol)) {
        return null;
    }

    const localRow = resolveShellSlotLocalRow(shellBlock, descriptor.rowMode);
    const relativeRow = toRelativeRow(localRow, blockRow.minRelativeRow ?? 0);

    return createSlotAtom({
        id: `${shellBlock.shellId}::${descriptor.idSuffix}`,
        type: descriptor.type,
        value: descriptor.value,
        text: descriptor.text,
        isVisible: true,
        rowId: blockRow.rowId,
        rowIndex: blockRow.rowIndex,
        localRow,
        relativeRow,
        rawCol: slotLayout.rawCol,
        rawColStart: slotLayout.rawColStart,
        rawColEnd: slotLayout.rawColEnd,
        side: shellBlock.side,
        sourceAtomId: shellBlock.shellId,
        sourceShellId: shellBlock.shellId,
        projectionRole: descriptor.projectionRole
    });
}

export function buildShellProjectionAtoms(
    shellBlock = {},
    semanticRaster = null,
    blueprintByRowShellKey = new Map(),
    blockRow = {}
) {
    const blueprint = blueprintByRowShellKey.get(
        createRowShellKey(blockRow.rowId, shellBlock.shellId)
    ) || null;

    if (!blueprint || blueprint.isVisible === false) {
        return [];
    }

    const geometry = resolveShellHorizontalLayout(
        shellBlock.shellType,
        semanticRaster,
        shellBlock.side,
        blueprint
    );

    if (!geometry) {
        return [];
    }

    const containerAtom = createShellContainerProjectionAtom(shellBlock, blueprint, blockRow, geometry);

    if (!containerAtom) {
        return [];
    }

    const slotAtoms = resolveShellSlotDescriptors(shellBlock.shellType, blueprint)
        .map((descriptor) => createShellSlotProjectionAtom(
            shellBlock,
            blockRow,
            descriptor,
            geometry?.slots?.[descriptor.slotKey] || null
        ))
        .filter(Boolean);

    return [
        containerAtom,
        ...slotAtoms
    ];
}
