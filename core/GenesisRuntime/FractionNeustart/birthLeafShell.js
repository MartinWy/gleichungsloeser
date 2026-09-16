import {
    getIntrinsicHeight,
    getIntrinsicWidth
} from "./shellDefinitions.js";

function rightBiasedCenterOffset(bandWidth, shellWidth) {
    return Math.ceil((bandWidth - shellWidth) / 2);
}

function birthLeafShell(definition, {
    bandStart,
    bandWidth = getIntrinsicWidth(definition),
    rowStart = 0,
    rowKey,
    shellId = null
}) {
    const intrinsicWidth = getIntrinsicWidth(definition);
    const intrinsicHeight = getIntrinsicHeight(definition);
    const offset = rightBiasedCenterOffset(bandWidth, intrinsicWidth);
    const placedStart = bandStart + offset;
    const ownShellId = shellId || definition.id;

    return {
        shellId: ownShellId,
        rowKey,
        shellState: "BORN",
        shellType: definition.shellType,
        sourceDefinitionId: definition.id,
        bandStart,
        bandEnd: bandStart + bandWidth - 1,
        bandWidth,
        intrinsicWidth,
        intrinsicHeight,
        placedStart,
        placedEnd: placedStart + intrinsicWidth - 1,
        rowStart,
        rowEnd: rowStart + intrinsicHeight - 1,
        slots: (definition?.slots || []).map((slot, index) => ({
            slotId: `${ownShellId}::slot::${index}`,
            shellId: ownShellId,
            rowKey,
            role: slot.role,
            value: slot.value,
            col: placedStart + slot.offset,
            row: rowStart + (slot.rowOffset || 0)
        }))
    };
}

export {
    birthLeafShell
};
