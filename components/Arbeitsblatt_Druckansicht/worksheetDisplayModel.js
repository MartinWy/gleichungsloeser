import {
    buildDisplayColumnLayout,
    resolveCellDisplaySlotBounds
} from "./columnLayoutCore/displayColumnLayout.js";
import { defaultColumnLayoutProfile, resolveColumnLayoutProfile } from "./columnLayoutCore/columnLayoutProfile.js";
import { buildProcessSpaceDisplayLayout } from "./columnLayoutCore/processSpaceLayout.js";

function slotGridStartLine(slotIndex = 0) {
    return slotIndex + 1;
}

function slotGridEndLine(slotIndex = 0) {
    return slotIndex + 2;
}

function slotTrack(width = 0) {
    return width > 0 ? `minmax(${width}em, max-content)` : "0";
}

function cellBelongsToShell(cell, shellId = null) {
    if (!cell || typeof shellId !== "string" || shellId.length === 0) {
        return false;
    }

    if (cell.sourceShellId === shellId || cell.sourceAtomId === shellId) {
        return true;
    }

    return Array.isArray(cell.visibleAncestorShells)
        && cell.visibleAncestorShells.some((descriptor) => descriptor?.shellId === shellId);
}

function expandFractionLineDisplayBounds(items = []) {
    return items;
}

export function buildWorksheetDisplayModel(viewModel, profile = defaultColumnLayoutProfile) {
    const resolvedProfile = resolveColumnLayoutProfile(profile);
    const processSpaceProjection = buildProcessSpaceDisplayLayout(viewModel, resolvedProfile);
    const displayLayout = processSpaceProjection?.displayLayout
        || buildDisplayColumnLayout(viewModel, resolvedProfile);
    const baseItems = (viewModel?.layout?.cells || []).map((cell) => {
        const slotBounds = processSpaceProjection?.boundsByCell.get(cell)
            || resolveCellDisplaySlotBounds(
                cell,
                displayLayout,
                {
                    minOriginStepIndex: Number.isInteger(cell?.stepIndex) ? cell.stepIndex : 0
                }
            );

        return {
            cell,
            ...slotBounds,
            gridColumnStartLine: slotGridStartLine(slotBounds.displayStartSlot),
            gridColumnEndLine: slotGridEndLine(slotBounds.displayEndSlot),
            semanticColumnStartLine: slotGridStartLine(slotBounds.semanticStartSlot ?? 0),
            semanticColumnEndLine: slotGridEndLine(slotBounds.semanticEndSlot ?? slotBounds.semanticStartSlot ?? 0)
        };
    });
    const items = expandFractionLineDisplayBounds(baseItems);

    return {
        displayLayout,
        processScoped: processSpaceProjection !== null,
        items,
        gridTemplateColumns: (displayLayout?.slots || []).map((slot) => slotTrack(slot?.width || 0)).join(" ") || "minmax(1em, max-content)"
    };
}
