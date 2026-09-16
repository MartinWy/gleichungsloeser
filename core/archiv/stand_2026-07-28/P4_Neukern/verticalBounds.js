export function createRelativeBounds(relativeRow = 0) {
    return {
        minRelativeRow: relativeRow,
        maxRelativeRow: relativeRow
    };
}

export function mergeRelativeBounds(target, candidate) {
    if (!candidate) {
        return target;
    }

    if (!target) {
        return {
            minRelativeRow: candidate.minRelativeRow,
            maxRelativeRow: candidate.maxRelativeRow
        };
    }

    return {
        minRelativeRow: Math.min(target.minRelativeRow, candidate.minRelativeRow),
        maxRelativeRow: Math.max(target.maxRelativeRow, candidate.maxRelativeRow)
    };
}

export function toLocalRow(relativeRow = 0, minRelativeRow = 0) {
    return relativeRow - minRelativeRow;
}

export function toRelativeRow(localRow = 0, minRelativeRow = 0) {
    return minRelativeRow + localRow;
}
