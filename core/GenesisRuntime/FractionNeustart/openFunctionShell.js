function openFunctionShellToContentAtom(shell, {
    rowKey,
    shellId
}) {
    const contentSlot = (shell.slots || []).find((slot) => slot.role === "content");

    if (!contentSlot) {
        throw new Error("Die geschlossene Funktionsschale besitzt keinen Inhalts-Slot.");
    }

    return {
        shellId,
        rowKey,
        shellState: "OPENED",
        shellType: "ATOM_SHELL",
        sourceShellId: shell.shellId,
        bandStart: contentSlot.col,
        bandEnd: contentSlot.col,
        bandWidth: 1,
        intrinsicWidth: 1,
        intrinsicHeight: 1,
        placedStart: contentSlot.col,
        placedEnd: contentSlot.col,
        rowStart: contentSlot.row,
        rowEnd: contentSlot.row,
        slots: [
            {
                slotId: `${shellId}::slot::0`,
                shellId,
                rowKey,
                role: "content",
                value: contentSlot.value,
                col: contentSlot.col,
                row: contentSlot.row
            }
        ]
    };
}

export {
    openFunctionShellToContentAtom
};
