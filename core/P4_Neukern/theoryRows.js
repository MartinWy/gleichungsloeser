export function normalizeTheoryRow(row = {}, index = 0) {
    return {
        rowId: typeof row?.rowId === "string" && row.rowId.length > 0
            ? row.rowId
            : `theory-${index}`,
        atoms: Array.isArray(row?.atoms) ? row.atoms : [],
        strategy: row?.strategy || null
    };
}

export function normalizeTheoryRowsForNeukern(theoryRows = []) {
    return (Array.isArray(theoryRows) ? theoryRows : []).map((row, index) => normalizeTheoryRow(row, index));
}
