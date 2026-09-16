function shiftSlots(slots, {
    shellId,
    rowKey,
    colDelta,
    rowDelta
}) {
    return (slots || []).map((slot, index) => ({
        ...slot,
        slotId: `${shellId}::slot::${index}`,
        shellId,
        rowKey,
        col: slot.col + colDelta,
        row: slot.row + rowDelta
    }));
}

function shiftShell(shell, {
    shellId,
    rowKey,
    colDelta,
    rowDelta
}) {
    if (shell.shellType === "DIVISION") {
        const numeratorShell = shiftShell(shell.numeratorShell, {
            shellId: `${shellId}::numerator`,
            rowKey,
            colDelta,
            rowDelta
        });
        const denominatorShell = shiftShell(shell.denominatorShell, {
            shellId: `${shellId}::denominator`,
            rowKey,
            colDelta,
            rowDelta
        });

        return {
            ...shell,
            shellId,
            rowKey,
            shellState: "TRANSPORTED",
            bandStart: shell.bandStart + colDelta,
            bandEnd: shell.bandEnd + colDelta,
            placedStart: shell.placedStart + colDelta,
            placedEnd: shell.placedEnd + colDelta,
            rowStart: shell.rowStart + rowDelta,
            rowEnd: shell.rowEnd + rowDelta,
            line: {
                ...shell.line,
                primitiveId: `${shellId}::fraction_line`,
                rowKey,
                colStart: shell.line.colStart + colDelta,
                colEnd: shell.line.colEnd + colDelta,
                row: shell.line.row + rowDelta
            },
            numeratorShell,
            denominatorShell
        };
    }

    if (shell.shellType === "FUNCTION_WRAPPER") {
        const contentShell = shiftShell(shell.contentShell, {
            shellId: `${shellId}::content`,
            rowKey,
            colDelta,
            rowDelta
        });

        return {
            ...shell,
            shellId,
            rowKey,
            shellState: "TRANSPORTED",
            bandStart: shell.bandStart + colDelta,
            bandEnd: shell.bandEnd + colDelta,
            placedStart: shell.placedStart + colDelta,
            placedEnd: shell.placedEnd + colDelta,
            rowStart: shell.rowStart + rowDelta,
            rowEnd: shell.rowEnd + rowDelta,
            nameSlot: {
                ...shell.nameSlot,
                shellId,
                col: shell.nameSlot.col + colDelta,
                row: shell.nameSlot.row + rowDelta
            },
            parenLeft: {
                ...shell.parenLeft,
                shellId,
                col: shell.parenLeft.col + colDelta,
                rowStart: shell.parenLeft.rowStart + rowDelta,
                rowEnd: shell.parenLeft.rowEnd + rowDelta
            },
            parenRight: {
                ...shell.parenRight,
                shellId,
                col: shell.parenRight.col + colDelta,
                rowStart: shell.parenRight.rowStart + rowDelta,
                rowEnd: shell.parenRight.rowEnd + rowDelta
            },
            contentShell
        };
    }

    return {
        ...shell,
        shellId,
        rowKey,
        shellState: "TRANSPORTED",
        bandStart: shell.bandStart + colDelta,
        bandEnd: shell.bandEnd + colDelta,
        placedStart: shell.placedStart + colDelta,
        placedEnd: shell.placedEnd + colDelta,
        rowStart: shell.rowStart + rowDelta,
        rowEnd: shell.rowEnd + rowDelta,
        slots: shiftSlots(shell.slots, {
            shellId,
            rowKey,
            colDelta,
            rowDelta
        })
    };
}

function transportShell(shell, {
    bandStart = shell.bandStart,
    rowStart = shell.rowStart,
    rowKey,
    shellId
}) {
    return shiftShell(shell, {
        shellId,
        rowKey,
        colDelta: bandStart - shell.bandStart,
        rowDelta: rowStart - shell.rowStart
    });
}

export {
    transportShell
};
