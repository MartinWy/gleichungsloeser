function birthFractionShell({
    shellId,
    rowKey,
    numeratorShell,
    denominatorShell
}) {
    const bandStart = Math.min(numeratorShell.bandStart, denominatorShell.bandStart);
    const bandEnd = Math.max(numeratorShell.bandEnd, denominatorShell.bandEnd);

    return {
        shellId,
        rowKey,
        shellState: "BORN",
        shellType: "DIVISION",
        bandStart,
        bandEnd,
        bandWidth: bandEnd - bandStart + 1,
        intrinsicWidth: bandEnd - bandStart + 1,
        intrinsicHeight: denominatorShell.rowEnd - numeratorShell.rowStart + 1,
        placedStart: bandStart,
        placedEnd: bandEnd,
        rowStart: numeratorShell.rowStart,
        rowEnd: denominatorShell.rowEnd,
        line: {
            primitiveId: `${shellId}::fraction_line`,
            role: "fraction_line",
            rowKey,
            colStart: bandStart,
            colEnd: bandEnd,
            row: numeratorShell.rowEnd + 1
        },
        numeratorShell,
        denominatorShell
    };
}

export {
    birthFractionShell
};
