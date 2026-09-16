export function resolveRowKind(relativeRow = 0, axisRelativeRow = 0) {
    if (relativeRow < axisRelativeRow) {
        return "above_axis";
    }

    if (relativeRow > axisRelativeRow) {
        return "below_axis";
    }

    return "axis";
}

export function buildRowKinds(minRelativeRow = 0, maxRelativeRow = 0, axisRelativeRow = 0) {
    const rowKinds = [];

    for (let relativeRow = minRelativeRow; relativeRow <= maxRelativeRow; relativeRow += 1) {
        rowKinds.push(resolveRowKind(relativeRow, axisRelativeRow));
    }

    return rowKinds;
}

export function resolveAxisContext(shellStates = []) {
    return (shellStates || []).some((shellState) => shellState?.shellRole === "fraction")
        ? "fraction_axis"
        : "baseline_axis";
}
