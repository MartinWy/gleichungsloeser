import {
    buildShellBlueprintDraft,
    resolveShellBlueprintDraftInputs
} from "./ShellBlueprints.js";
import { buildRowShellLookup } from "./structure.js";
import { buildProjectionBlockRows } from "./projectionBlockAssembly.js";

export function buildProjectionBlockDraft(theoryRows = [], semanticRaster = null, shellBlueprintDraft = null) {
    const {
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft
    } = resolveProjectionBlockDraftInputs(theoryRows, semanticRaster, shellBlueprintDraft);
    const blueprintByRowShellKey = buildRowShellLookup(resolvedShellBlueprintDraft?.blueprints || []);

    return {
        rows: buildProjectionBlockRows(resolvedSemanticRaster.rows, blueprintByRowShellKey)
    };
}

export function resolveProjectionBlockDraftInputs(
    theoryRows = [],
    semanticRaster = null,
    shellBlueprintDraft = null
) {
    const {
        normalizedTheoryRows,
        semanticRaster: resolvedSemanticRaster
    } = resolveShellBlueprintDraftInputs(theoryRows, semanticRaster);

    return {
        normalizedTheoryRows,
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: shellBlueprintDraft || buildShellBlueprintDraft(
            normalizedTheoryRows,
            resolvedSemanticRaster
        )
    };
}
