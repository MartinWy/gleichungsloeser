export function sortProjectionAtoms(left, right) {
    if ((left.localRow || 0) !== (right.localRow || 0)) {
        return (left.localRow || 0) - (right.localRow || 0);
    }

    if ((left.colStart || left.col || 0) !== (right.colStart || right.col || 0)) {
        return (left.colStart || left.col || 0) - (right.colStart || right.col || 0);
    }

    return String(left.id || "").localeCompare(String(right.id || ""));
}

export function normalizeProjectionColumns(rows = []) {
    let globalMinCol = 0;

    rows.forEach((row) => {
        (row.positionedAtoms || []).forEach((atom) => {
            const atomMinCol = Math.min(
                Number.isInteger(atom.rawColStart) ? atom.rawColStart : (atom.rawCol || 0),
                Number.isInteger(atom.rawCol) ? atom.rawCol : (atom.rawColStart || 0)
            );
            globalMinCol = Math.min(globalMinCol, atomMinCol);
        });
    });

    const globalColShift = globalMinCol < 0 ? -globalMinCol : 0;

    return {
        globalColShift,
        rows: rows.map((row) => ({
            ...row,
            positionedAtoms: (row.positionedAtoms || []).map((atom) => ({
                ...atom,
                col: (atom.rawCol ?? atom.col ?? 0) + globalColShift,
                colStart: (atom.rawColStart ?? atom.colStart ?? atom.col ?? 0) + globalColShift,
                colEnd: (atom.rawColEnd ?? atom.colEnd ?? atom.col ?? 0) + globalColShift
            }))
        }))
    };
}
