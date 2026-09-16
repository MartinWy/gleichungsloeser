function explicitStartCol(cell) {
    return Number.isInteger(cell?.colStart) ? cell.colStart : (cell?.col ?? 0);
}

function explicitEndCol(cell) {
    return Number.isInteger(cell?.colEnd) ? cell.colEnd : (cell?.col ?? 0);
}

function explicitSpanCount(cell) {
    return Math.max(1, explicitEndCol(cell) - explicitStartCol(cell) + 1);
}

export function cellExplicitStartCol(cell) {
    return explicitStartCol(cell);
}

export function cellExplicitEndCol(cell) {
    return explicitEndCol(cell);
}

export function cellExplicitSpanCount(cell) {
    return explicitSpanCount(cell);
}

export function cellSemanticSpanCount(cell) {
    return explicitSpanCount(cell);
}

export function cellSemanticStartCol(cell) {
    const explicitStart = explicitStartCol(cell);
    return explicitStart;
}

export function cellSemanticEndCol(cell) {
    const explicitEnd = explicitEndCol(cell);
    return explicitEnd;
}

export function resolveCellSemanticBounds(cell) {
    const explicitStart = explicitStartCol(cell);
    const explicitEnd = explicitEndCol(cell);
    const semanticStart = cellSemanticStartCol(cell);
    const semanticEnd = cellSemanticEndCol(cell);

    return {
        explicitStart,
        explicitEnd,
        explicitSpanCount: explicitSpanCount(cell),
        semanticStart,
        semanticEnd,
        semanticSpanCount: Math.max(1, semanticEnd - semanticStart + 1),
        isInferred: false
    };
}
