function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function getRowBounds(positionedAtoms) {
    const rows = (positionedAtoms || [])
        .map((atom) => atom?.row)
        .filter((row) => Number.isInteger(row));

    if (rows.length === 0) {
        return {
            minRow: 0,
            maxRow: 0
        };
    }

    return {
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows)
    };
}

function resolveAxisAbsoluteRow(positionedAtoms, fallbackRow = 0) {
    const fractionLine = (positionedAtoms || []).find(
        (atom) => atom?.projectionRole === "fraction_line" && atom.isVisible !== false && Number.isInteger(atom.row)
    );

    if (fractionLine) {
        return fractionLine.row;
    }

    const anchor = (positionedAtoms || []).find(
        (atom) => atom?.value === "=" && atom.isVisible !== false && Number.isInteger(atom.row)
    );

    if (anchor) {
        return anchor.row;
    }

    return fallbackRow;
}

function normalizeProjectionRows(theoryRows = []) {
    return theoryRows.map((row, index) => ({
        rowId: row.rowId || `theory-${index}`,
        atoms: clone(row.atoms || []),
        strategy: row.strategy || null
    }));
}

export {
    clone,
    getRowBounds,
    normalizeProjectionRows,
    resolveAxisAbsoluteRow
};
