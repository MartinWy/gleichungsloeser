import { normalizeTheoryRowsForNeukern } from "./contracts.js";
import { buildGlobalSemanticRasterDraft } from "./GlobalSemanticRaster.js";
import { createShellBlueprintDraftFromResolvedInputs } from "./shellBlueprintAssembly.js";

export function resolveShellBlueprintDraftInputs(theoryRows = [], semanticRaster = null) {
    const normalizedTheoryRows = normalizeTheoryRowsForNeukern(theoryRows);

    return {
        normalizedTheoryRows,
        semanticRaster: semanticRaster || buildGlobalSemanticRasterDraft(normalizedTheoryRows)
    };
}

export function buildShellBlueprintDraft(theoryRows = [], semanticRaster = null) {
    const {
        semanticRaster: resolvedSemanticRaster
    } = resolveShellBlueprintDraftInputs(theoryRows, semanticRaster);

    return createShellBlueprintDraftFromResolvedInputs({
        semanticRaster: resolvedSemanticRaster
    });
}
