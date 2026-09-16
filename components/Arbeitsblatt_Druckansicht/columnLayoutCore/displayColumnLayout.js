import { buildColumnLayout } from "./columnWidths.js";
import { buildColumnTopology, listAfterBoundarySlots, listBeforeBoundarySlots } from "./columnTopology.js";
import { resolveAtomicTextWidthEm } from "./columnWidthAtoms.js";
import { cellSemanticEndCol, cellSemanticStartCol, resolveCellSemanticBounds } from "./cellSemanticBounds.js";
import {
    defaultColumnLayoutProfile,
    resolveColumnLayoutProfile,
    resolveHorizontalLayoutScale
} from "./columnLayoutProfile.js";
import { estimateDelimiterExtraWidthEm } from "./delimiterWidthModel.js";
import { decomposeVisibleShells } from "../displayShellModel.js";
import { resolveSemanticBoundaryGapEm } from "./spacingProfile.js";

function slotStart(starts = [], index = 0) {
    return starts[index] ?? 0;
}

function slotWidth(slots = [], index = 0) {
    return slots[index]?.width ?? 0;
}

function maxAtomicWidth(values = [], kind = "text", profile = defaultColumnLayoutProfile) {
    return Math.max(
        0,
        ...values.map((value) => resolveAtomicTextWidthEm(value, kind, profile))
    );
}

function shellGlyphWidth(text, profile = defaultColumnLayoutProfile) {
    return resolveAtomicTextWidthEm(text, "text", profile);
}

function stretchedDelimiterBonus(requirement, profile = defaultColumnLayoutProfile) {
    return estimateDelimiterExtraWidthEm(requirement?.delimiterContentHeightEm || 0, profile);
}

function resolveDisplaySlotPadding(requirement, profile = defaultColumnLayoutProfile) {
    const shellPadding = profile?.shellPaddingEm || {};

    switch (requirement?.kind) {
        case "group_left":
            return Math.max(0, shellPadding.groupLeft || 0);
        case "group_right":
            return Math.max(0, shellPadding.groupRight || 0);
        case "function_left":
            return Math.max(0, shellPadding.functionLeftPrefix || 0);
        case "function_right":
            return Math.max(0, shellPadding.functionRight || 0);
        default:
            return 0;
    }
}

function resolveDisplaySlotWidth(requirement, profile = defaultColumnLayoutProfile) {
    const displaySlots = profile?.displaySlotEm || {};
    const horizontalScale = resolveHorizontalLayoutScale(profile);
    let baseWidth = 0;

    switch (requirement?.kind) {
        case "root_lead":
            baseWidth = Math.max(0, displaySlots.rootLead || 0);
            break;
        case "group_left":
            baseWidth = Math.max(
                0,
                displaySlots.groupLeft || 0,
                shellGlyphWidth("(", profile) + stretchedDelimiterBonus(requirement, profile)
            );
            break;
        case "group_right":
            baseWidth = Math.max(
                0,
                displaySlots.groupRight || 0,
                shellGlyphWidth(")", profile) + stretchedDelimiterBonus(requirement, profile)
            );
            break;
        case "function_name":
            baseWidth = maxAtomicWidth(
                requirement?.functionHeadTexts || requirement?.functionNames || ["f"],
                "text",
                profile
            );
            break;
        case "function_left":
            baseWidth = Math.max(
                0,
                displaySlots.functionLeft ?? displaySlots.groupLeft ?? 0,
                shellGlyphWidth("(", profile) + stretchedDelimiterBonus(requirement, profile)
            );
            break;
        case "function_right":
            baseWidth = Math.max(
                0,
                displaySlots.functionRight ?? displaySlots.groupRight ?? 0,
                shellGlyphWidth(")", profile) + stretchedDelimiterBonus(requirement, profile)
            );
            break;
        case "power_left":
            baseWidth = Math.max(
                0,
                displaySlots.powerWrapLeft ?? displaySlots.groupLeft ?? 0,
                shellGlyphWidth("(", profile) + stretchedDelimiterBonus(requirement, profile)
            );
            break;
        case "power_right":
            baseWidth = Math.max(
                0,
                Math.max(
                    displaySlots.powerWrapRightBase ?? displaySlots.groupRight ?? 0,
                    shellGlyphWidth(")", profile) + stretchedDelimiterBonus(requirement, profile)
                )
                + maxAtomicWidth(requirement?.exponents || ["2"], "number", profile)
                + (displaySlots.powerExponentOffset || 0)
            );
            break;
        default:
            baseWidth = 0;
            break;
    }

    return (baseWidth + resolveDisplaySlotPadding(requirement, profile)) * horizontalScale;
}

function registerDisplaySlotIndex(indexMap, slot, slotIndex) {
    if (slot?.kind === "semantic") {
        return;
    }

    const semanticCol = Number.isInteger(slot?.semanticBeforeCol)
        ? slot.semanticBeforeCol
        : slot?.semanticAfterCol;

    if (!Number.isInteger(semanticCol)) {
        return;
    }

    indexMap[slot.kind] = indexMap[slot.kind] || {};
    indexMap[slot.kind][semanticCol] = slotIndex;
}

function isBoundaryDisplaySlot(slot, semanticCol = 0, side = "before", minOriginStepIndex = 0, allowedKinds = null) {
    if (!slot || slot.kind === "semantic" || !(slot.width > 0)) {
        return false;
    }

    if (allowedKinds instanceof Set) {
        if (allowedKinds.size === 0) {
            return false;
        }

        if (!allowedKinds.has(slot.kind)) {
            return false;
        }
    }

    const boundaryCol = side === "before" ? slot.semanticBeforeCol : slot.semanticAfterCol;
    return boundaryCol === semanticCol && (slot.originStepIndex ?? 0) >= minOriginStepIndex;
}

function collectBoundarySlotIndices(displayLayout, semanticCol = 0, side = "before", minOriginStepIndex = 0, allowedKinds = null) {
    return (displayLayout?.slots || [])
        .map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => isBoundaryDisplaySlot(slot, semanticCol, side, minOriginStepIndex, allowedKinds))
        .map(({ index }) => index);
}

function defaultCellShellOptions(cell, shellOptions = {}) {
    const hasExplicitSuppressOuterGroupShell = typeof shellOptions?.suppressOuterGroupShell === "boolean";
    const hasExplicitIncludeRootShell = typeof shellOptions?.includeRootShell === "boolean";

    return {
        suppressOuterGroupShell: hasExplicitSuppressOuterGroupShell
            ? shellOptions.suppressOuterGroupShell
            : (cell?.projectionRole === "numerator" || cell?.projectionRole === "denominator"),
        includeRootShell: hasExplicitIncludeRootShell ? shellOptions.includeRootShell : true
    };
}

function isClosedProjectedShellCell(cell) {
    if (!cell || cell.kind === "fraction_line") {
        return false;
    }

    if (cell.projectionRole === "closed_visible_shell") {
        return true;
    }

    if (!cell.renderNode || typeof cell.kind !== "string") {
        return false;
    }

    return [
        "function",
        "group",
        "collection",
        "root",
        "power",
        "negation",
        "multiplication",
        "division",
        "addition",
        "subtraction"
    ].includes(cell.kind);
}

function collectCellDisplaySlotKinds(cell, side = "before", shellOptions = {}) {
    if (!cell?.renderNode) {
        return new Set();
    }

    const { shells } = decomposeVisibleShells(
        cell.renderNode,
        defaultCellShellOptions(cell, shellOptions)
    );
    const kinds = new Set();

    shells.forEach((shell) => {
        if (shell.kind === "root") {
            if (side === "before") {
                kinds.add("root_lead");
            }
            return;
        }

        if (shell.kind === "group") {
            kinds.add(side === "before" ? "group_left" : "group_right");
            return;
        }

        if (shell.kind === "function") {
            if (side === "before") {
                kinds.add("function_name");
                kinds.add("function_left");
            } else {
                kinds.add("function_right");
            }
            return;
        }

        if (shell.kind === "power") {
            kinds.add(side === "before" ? "power_left" : "power_right");
        }
    });

    return kinds;
}

function createDisplaySlot(requirement, width, side, semanticCol) {
    const labelByKind = {
        boundary_gap: `bg${semanticCol}`,
        root_lead: `r${semanticCol}`,
        group_left: `gl${semanticCol}`,
        group_right: `gr${semanticCol}`,
        function_name: `fn${semanticCol}`,
        function_left: `fl${semanticCol}`,
        function_right: `fr${semanticCol}`,
        power_left: `pl${semanticCol}`,
        power_right: `pr${semanticCol}`
    };

    return {
        id: `${requirement.kind}-${semanticCol}`,
        ...requirement,
        width,
        label: labelByKind[requirement.kind] || `${requirement.kind}-${semanticCol}`,
        ...(side === "before"
            ? { semanticBeforeCol: semanticCol }
            : { semanticAfterCol: semanticCol })
    };
}

function isVisibleBlockBoundaryCell(cell) {
    if (!cell) {
        return false;
    }

    return !["anchor", "operator"].includes(cell.kind || "");
}

function representsVisibleFractionBoundary(cell) {
    return cell?.kind === "fraction_line";
}

function resolveImplicitBlockDisplayGap(profile = defaultColumnLayoutProfile) {
    const rolePairConfig = profile?.semanticBoundaryGapEm?.byRolePair || {};
    const configuredBoundaryGap = Math.max(
        0,
        Number(rolePairConfig["product_content|product_factor"]) || 0,
        Number(rolePairConfig["product_factor|product_content"]) || 0
    );
    const implicitMultiplicationGap = Math.max(0, Number(profile?.shellPaddingEm?.implicitMultiplicationGap) || 0);
    const ghostOperatorGap = resolveAtomicTextWidthEm("·", "operator", profile);

    return Math.max(configuredBoundaryGap, implicitMultiplicationGap, ghostOperatorGap);
}

function resolveDisplayBoundaryGapWidth(leftCell, rightCell, profile = defaultColumnLayoutProfile) {
    const semanticGap = resolveSemanticBoundaryGapEm(leftCell, rightCell, profile);
    const implicitBlockDisplayGap = resolveImplicitBlockDisplayGap(profile);
    const needsFractionEdgeGap = (
        isVisibleBlockBoundaryCell(leftCell)
        && isVisibleBlockBoundaryCell(rightCell)
        && (
            representsVisibleFractionBoundary(leftCell)
            || representsVisibleFractionBoundary(rightCell)
        )
    );

    return Math.max(
        semanticGap,
        needsFractionEdgeGap ? implicitBlockDisplayGap : 0
    );
}

function collectDisplayBoundaryGapRequirements(viewModel, profile = defaultColumnLayoutProfile) {
    const gapBySemanticCol = new Map();

    (viewModel?.steps || []).forEach((step, stepIndex) => {
        const cellsByRow = new Map();

        (step?.cells || []).forEach((cell) => {
            const rowIndex = Number.isInteger(cell?.row) ? cell.row : 0;
            const rowCells = cellsByRow.get(rowIndex) || [];

            rowCells.push(cell);
            cellsByRow.set(rowIndex, rowCells);
        });

        cellsByRow.forEach((rowCells) => {
            const orderedCells = rowCells
                .slice()
                .sort((left, right) => {
                    const leftStart = cellSemanticStartCol(left);
                    const rightStart = cellSemanticStartCol(right);

                    if (leftStart !== rightStart) {
                        return leftStart - rightStart;
                    }

                    return cellSemanticEndCol(left) - cellSemanticEndCol(right);
                });

            for (let index = 0; index < orderedCells.length - 1; index += 1) {
                const leftCell = orderedCells[index];
                const rightCell = orderedCells[index + 1];
                const leftBoundaryCol = cellSemanticEndCol(leftCell);
                const rightBoundaryCol = cellSemanticStartCol(rightCell);

                if (rightBoundaryCol !== leftBoundaryCol + 1) {
                    continue;
                }

                const gapWidth = resolveDisplayBoundaryGapWidth(leftCell, rightCell, profile);

                if (!(gapWidth > 0)) {
                    continue;
                }

                const current = gapBySemanticCol.get(rightBoundaryCol);

                if (!current || gapWidth > current.width || stepIndex > current.originStepIndex) {
                    gapBySemanticCol.set(rightBoundaryCol, {
                        width: Math.max(gapWidth, current?.width || 0),
                        originStepIndex: Math.max(stepIndex, current?.originStepIndex ?? 0)
                    });
                }
            }
        });
    });

    return gapBySemanticCol;
}

export function buildDisplayColumnLayout(viewModel, profile = defaultColumnLayoutProfile) {
    const resolvedProfile = resolveColumnLayoutProfile(profile);
    const semanticLayout = buildColumnLayout(viewModel, resolvedProfile);
    const topology = buildColumnTopology(viewModel);
    const boundaryGapRequirements = collectDisplayBoundaryGapRequirements(viewModel, resolvedProfile);
    const slots = [];
    const semanticToSlotIndex = Array.from({ length: Math.max(0, viewModel?.columnCount || 0) }, () => null);
    const slotIndexByKindAndSemanticCol = {};

    for (let col = 0; col < (viewModel?.columnCount || 0); col += 1) {
        const boundaryGapRequirement = boundaryGapRequirements.get(col);

        if (boundaryGapRequirement?.width > 0) {
            const slotIndex = slots.length;
            const slot = createDisplaySlot(
                {
                    kind: "boundary_gap",
                    originStepIndex: boundaryGapRequirement.originStepIndex
                },
                boundaryGapRequirement.width,
                "before",
                col
            );

            slots.push(slot);
            registerDisplaySlotIndex(slotIndexByKindAndSemanticCol, slot, slotIndex);
        }

        listBeforeBoundarySlots(topology, col).forEach((requirement) => {
            const width = resolveDisplaySlotWidth(requirement, resolvedProfile);

            if (!(width > 0)) {
                return;
            }

            const slotIndex = slots.length;
            const slot = createDisplaySlot(requirement, width, "before", col);

            slots.push(slot);
            registerDisplaySlotIndex(slotIndexByKindAndSemanticCol, slot, slotIndex);
        });

        semanticToSlotIndex[col] = slots.length;
        slots.push({
            id: `semantic-${col}`,
            kind: "semantic",
            semanticCol: col,
            label: String(col),
            width: semanticLayout.widths[col] ?? 0
        });

        listAfterBoundarySlots(topology, col).forEach((requirement) => {
            const width = resolveDisplaySlotWidth(requirement, resolvedProfile);

            if (!(width > 0)) {
                return;
            }

            const slotIndex = slots.length;
            const slot = createDisplaySlot(requirement, width, "after", col);

            slots.push(slot);
            registerDisplaySlotIndex(slotIndexByKindAndSemanticCol, slot, slotIndex);
        });
    }

    const starts = [];
    let cursor = 0;

    slots.forEach((slot, index) => {
        starts[index] = cursor;
        cursor += slot.width || 0;
    });

    return {
        profile: resolvedProfile,
        topology,
        semanticLayout,
        slots,
        starts,
        totalWidth: cursor,
        semanticToSlotIndex,
        slotIndexByKindAndSemanticCol,
        rootLeadSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.root_lead || {}) },
        groupLeftSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.group_left || {}) },
        groupRightSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.group_right || {}) },
        functionNameSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.function_name || {}) },
        functionLeftSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.function_left || {}) },
        functionRightSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.function_right || {}) },
        powerLeftSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.power_left || {}) },
        powerRightSlotIndexBySemanticCol: { ...(slotIndexByKindAndSemanticCol.power_right || {}) }
    };
}

export function displaySlotStart(displayLayout, slotIndex = 0) {
    return slotStart(displayLayout?.starts || [], slotIndex);
}

export function displaySlotWidth(displayLayout, slotIndex = 0) {
    return slotWidth(displayLayout?.slots || [], slotIndex);
}

export function displaySlotBoundaryX(displayLayout, slotIndex = 0, side = "left") {
    const start = displaySlotStart(displayLayout, slotIndex);
    return side === "right" ? start + displaySlotWidth(displayLayout, slotIndex) : start;
}

export function displaySlotCenterX(displayLayout, slotIndex = 0) {
    return displaySlotStart(displayLayout, slotIndex) + (displaySlotWidth(displayLayout, slotIndex) / 2);
}

export function semanticColumnSlotIndex(displayLayout, semanticCol = 0) {
    return displayLayout?.semanticToSlotIndex?.[semanticCol] ?? null;
}

export function semanticColumnStart(displayLayout, semanticCol = 0) {
    const slotIndex = semanticColumnSlotIndex(displayLayout, semanticCol);
    return slotIndex === null ? 0 : displaySlotStart(displayLayout, slotIndex);
}

export function semanticColumnWidth(displayLayout, semanticCol = 0) {
    const slotIndex = semanticColumnSlotIndex(displayLayout, semanticCol);
    return slotIndex === null ? 0 : displaySlotWidth(displayLayout, slotIndex);
}

export function semanticColumnBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    const start = semanticColumnStart(displayLayout, semanticCol);
    return side === "right" ? start + semanticColumnWidth(displayLayout, semanticCol) : start;
}

export function semanticColumnCenterX(displayLayout, semanticCol = 0) {
    return semanticColumnStart(displayLayout, semanticCol) + (semanticColumnWidth(displayLayout, semanticCol) / 2);
}

export function semanticSpanWidth(displayLayout, colStart = 0, colEnd = colStart) {
    let width = 0;

    for (let col = colStart; col <= colEnd; col += 1) {
        width += semanticColumnWidth(displayLayout, col);
    }

    return width;
}

export function semanticSpanCenterX(displayLayout, colStart = 0, colEnd = colStart) {
    return semanticColumnBoundaryX(displayLayout, colStart, "left") + (semanticSpanWidth(displayLayout, colStart, colEnd) / 2);
}

export function resolveCellDisplaySlotBounds(
    cell,
    displayLayout,
    {
        minOriginStepIndex = 0,
        shellOptions = {}
    } = {}
) {
    const bounds = resolveCellSemanticBounds(cell);
    const semanticStartSlot = semanticColumnSlotIndex(displayLayout, bounds.semanticStart);
    const semanticEndSlot = semanticColumnSlotIndex(displayLayout, bounds.semanticEnd);

    if (cell?.kind === "fraction_line" || isClosedProjectedShellCell(cell)) {
        return {
            ...bounds,
            semanticStartSlot,
            semanticEndSlot,
            displayStartSlot: semanticStartSlot ?? 0,
            displayEndSlot: semanticEndSlot ?? semanticStartSlot ?? 0
        };
    }

    const beforeSlotKinds = collectCellDisplaySlotKinds(cell, "before", shellOptions);
    const afterSlotKinds = collectCellDisplaySlotKinds(cell, "after", shellOptions);
    const beforeSlots = collectBoundarySlotIndices(
        displayLayout,
        bounds.semanticStart,
        "before",
        minOriginStepIndex,
        beforeSlotKinds
    );
    const afterSlots = collectBoundarySlotIndices(
        displayLayout,
        bounds.semanticEnd,
        "after",
        minOriginStepIndex,
        afterSlotKinds
    );

    return {
        ...bounds,
        semanticStartSlot,
        semanticEndSlot,
        displayStartSlot: beforeSlots[0] ?? semanticStartSlot ?? 0,
        displayEndSlot: afterSlots[afterSlots.length - 1] ?? semanticEndSlot ?? semanticStartSlot ?? 0
    };
}

export function shellSlotIndex(displayLayout, kind, semanticCol = 0) {
    const index = displayLayout?.slotIndexByKindAndSemanticCol?.[kind]?.[semanticCol];
    return Number.isInteger(index) ? index : null;
}

export function shellSlotWidth(displayLayout, kind, semanticCol = 0) {
    const slotIndex = shellSlotIndex(displayLayout, kind, semanticCol);
    return slotIndex === null ? 0 : displaySlotWidth(displayLayout, slotIndex);
}

export function shellSlotBoundaryX(displayLayout, kind, semanticCol = 0, side = "left") {
    const slotIndex = shellSlotIndex(displayLayout, kind, semanticCol);

    if (slotIndex === null) {
        return semanticColumnBoundaryX(displayLayout, semanticCol, side);
    }

    return displaySlotBoundaryX(displayLayout, slotIndex, side);
}

export function rootLeadSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "root_lead", semanticCol);
}

export function rootLeadWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "root_lead", semanticCol);
}

export function rootLeadBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "root_lead", semanticCol, side);
}

export function groupLeftSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "group_left", semanticCol);
}

export function groupLeftWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "group_left", semanticCol);
}

export function groupLeftBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "group_left", semanticCol, side);
}

export function groupRightSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "group_right", semanticCol);
}

export function groupRightWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "group_right", semanticCol);
}

export function groupRightBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "group_right", semanticCol, side);
}

export function functionNameSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "function_name", semanticCol);
}

export function functionNameWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "function_name", semanticCol);
}

export function functionNameBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "function_name", semanticCol, side);
}

export function functionLeftSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "function_left", semanticCol);
}

export function functionLeftWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "function_left", semanticCol);
}

export function functionLeftBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "function_left", semanticCol, side);
}

export function functionRightSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "function_right", semanticCol);
}

export function functionRightWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "function_right", semanticCol);
}

export function functionRightBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "function_right", semanticCol, side);
}

export function powerLeftSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "power_left", semanticCol);
}

export function powerLeftWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "power_left", semanticCol);
}

export function powerLeftBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "power_left", semanticCol, side);
}

export function powerRightSlotIndex(displayLayout, semanticCol = 0) {
    return shellSlotIndex(displayLayout, "power_right", semanticCol);
}

export function powerRightWidth(displayLayout, semanticCol = 0) {
    return shellSlotWidth(displayLayout, "power_right", semanticCol);
}

export function powerRightBoundaryX(displayLayout, semanticCol = 0, side = "left") {
    return shellSlotBoundaryX(displayLayout, "power_right", semanticCol, side);
}
