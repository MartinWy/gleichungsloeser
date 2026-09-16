import {
    getIntrinsicHeight,
    getIntrinsicWidth
} from "./shellDefinitions.js";

function rightBiasedCenterOffset(bandWidth, shellWidth) {
    return Math.ceil((bandWidth - shellWidth) / 2);
}

function createPlacedLeafShell(definition, { bandStart, bandWidth, rowStart, rowKey, shellId = null }) {
    const intrinsicWidth = getIntrinsicWidth(definition);
    const intrinsicHeight = getIntrinsicHeight(definition);
    const offset = rightBiasedCenterOffset(bandWidth, intrinsicWidth);
    const placedStart = bandStart + offset;

    return {
        shellId: shellId || definition.id,
        rowKey,
        shellType: definition.shellType,
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
            slotId: `${shellId || definition.id}::slot::${index}`,
            shellId: shellId || definition.id,
            rowKey,
            role: slot.role,
            value: slot.value,
            col: placedStart + slot.offset,
            row: rowStart + (slot.rowOffset || 0)
        }))
    };
}

function createPlacedFractionShell(definition, { bandStart, bandWidth, rowStart, rowKey, shellId = null }) {
    const intrinsicWidth = getIntrinsicWidth(definition);
    const numeratorHeight = getIntrinsicHeight(definition.numeratorDefinition);
    const offset = rightBiasedCenterOffset(bandWidth, intrinsicWidth);
    const placedStart = bandStart + offset;
    const ownShellId = shellId || definition.id;

    const numeratorShell = placeShellInBand(definition.numeratorDefinition, {
        bandStart: placedStart,
        bandWidth: intrinsicWidth,
        rowStart,
        rowKey,
        shellId: `${ownShellId}::numerator`
    });

    const lineRow = rowStart + numeratorHeight;
    const denominatorShell = placeShellInBand(definition.denominatorDefinition, {
        bandStart: placedStart,
        bandWidth: intrinsicWidth,
        rowStart: lineRow + 1,
        rowKey,
        shellId: `${ownShellId}::denominator`
    });

    return {
        shellId: ownShellId,
        rowKey,
        shellType: "DIVISION",
        bandStart,
        bandEnd: bandStart + bandWidth - 1,
        bandWidth,
        intrinsicWidth,
        intrinsicHeight: getIntrinsicHeight(definition),
        placedStart,
        placedEnd: placedStart + intrinsicWidth - 1,
        rowStart,
        rowEnd: denominatorShell.rowEnd,
        line: {
            primitiveId: `${ownShellId}::fraction_line`,
            role: "fraction_line",
            rowKey,
            colStart: placedStart,
            colEnd: placedStart + intrinsicWidth - 1,
            row: lineRow
        },
        numeratorShell,
        denominatorShell
    };
}

function createPlacedWrapperFunctionShell(definition, { bandStart, bandWidth, rowStart, rowKey, shellId = null }) {
    const intrinsicWidth = getIntrinsicWidth(definition);
    const intrinsicHeight = getIntrinsicHeight(definition);
    const contentWidth = getIntrinsicWidth(definition.contentDefinition);
    const offset = rightBiasedCenterOffset(bandWidth, intrinsicWidth);
    const placedStart = bandStart + offset;
    const ownShellId = shellId || definition.id;
    const contentBandStart = placedStart + 2;

    const contentShell = placeShellInBand(definition.contentDefinition, {
        bandStart: contentBandStart,
        bandWidth: contentWidth,
        rowStart,
        rowKey,
        shellId: `${ownShellId}::content`
    });

    return {
        shellId: ownShellId,
        rowKey,
        shellType: "FUNCTION_WRAPPER",
        name: definition.name,
        bandStart,
        bandEnd: bandStart + bandWidth - 1,
        bandWidth,
        intrinsicWidth,
        intrinsicHeight,
        placedStart,
        placedEnd: placedStart + intrinsicWidth - 1,
        rowStart,
        rowEnd: rowStart + intrinsicHeight - 1,
        nameSlot: {
            shellId: ownShellId,
            role: "function_name",
            value: definition.name,
            col: placedStart,
            row: rowStart + Math.floor(intrinsicHeight / 2)
        },
        parenLeft: {
            shellId: ownShellId,
            role: "paren_left",
            value: "(",
            col: placedStart + 1,
            rowStart,
            rowEnd: rowStart + intrinsicHeight - 1
        },
        parenRight: {
            shellId: ownShellId,
            role: "paren_right",
            value: ")",
            col: placedStart + intrinsicWidth - 1,
            rowStart,
            rowEnd: rowStart + intrinsicHeight - 1
        },
        contentShell
    };
}

function placeShellInBand(definition, placement) {
    if (!definition?.shellType) {
        throw new Error("placeShellInBand erwartet eine gueltige Schalendefinition.");
    }

    if (definition.shellType === "ATOM_SHELL" || definition.shellType === "FUNCTION_LEAF") {
        return createPlacedLeafShell(definition, placement);
    }

    if (definition.shellType === "DIVISION") {
        return createPlacedFractionShell(definition, placement);
    }

    if (definition.shellType === "FUNCTION_WRAPPER") {
        return createPlacedWrapperFunctionShell(definition, placement);
    }

    throw new Error(`Unbekannter Shell-Typ: ${definition.shellType}`);
}

export {
    placeShellInBand
};
