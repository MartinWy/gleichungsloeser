import { toLocalRow } from "./verticalBounds.js";
import { buildRowKinds } from "./verticalSemantics.js";

export function createBlockFrame(
    minRelativeRow = 0,
    maxRelativeRow = 0,
    axisRelativeRow = 0,
    axisContext = "baseline_axis"
) {
    return {
        minRelativeRow,
        maxRelativeRow,
        localRowCount: (maxRelativeRow - minRelativeRow) + 1,
        axisRelativeRow,
        axisLocalRow: toLocalRow(axisRelativeRow, minRelativeRow),
        axisContext,
        rowKinds: buildRowKinds(minRelativeRow, maxRelativeRow, axisRelativeRow)
    };
}
