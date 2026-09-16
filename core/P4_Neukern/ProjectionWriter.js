import {
    buildProjectionBlockDraft,
    resolveProjectionBlockDraftInputs
} from "./ProjectionBlocks.js";
import {
    buildRowShellLookup
} from "./structure.js";
import {
    PROJECTION_CONTENT_COL_STEP
} from "./shellGeometry.js";
import {
    normalizeProjectionColumns
} from "./projectionRowLayout.js";
import { buildProjectionRowsDraft } from "./projectionRowAssembly.js";

export { PROJECTION_CONTENT_COL_STEP } from "./shellGeometry.js";

export function resolveProjectionWriterDraftInputs(
    theoryRows = [],
    semanticRaster = null,
    shellBlueprintDraft = null,
    projectionBlockDraft = null
) {
    const {
        normalizedTheoryRows,
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft
    } = resolveProjectionBlockDraftInputs(theoryRows, semanticRaster, shellBlueprintDraft);

    return {
        normalizedTheoryRows,
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft,
        projectionBlockDraft: projectionBlockDraft || buildProjectionBlockDraft(
            normalizedTheoryRows,
            resolvedSemanticRaster,
            resolvedShellBlueprintDraft
        )
    };
}

export function createProjectionWriterDraftFromResolvedInputs({
    semanticRaster = null,
    shellBlueprintDraft = null,
    projectionBlockDraft = null
} = {}) {
    const blueprintByRowShellKey = buildRowShellLookup(shellBlueprintDraft?.blueprints || []);
    const blockByRowId = new Map(
        (projectionBlockDraft?.rows || []).map((row) => [row.rowId, row])
    );
    const rows = buildProjectionRowsDraft(
        semanticRaster?.rows || [],
        semanticRaster,
        blueprintByRowShellKey,
        blockByRowId
    );

    return normalizeProjectionColumns(rows);
}

export function buildProjectionWriterDraft(
    theoryRows = [],
    semanticRaster = null,
    shellBlueprintDraft = null,
    projectionBlockDraft = null
) {
    const {
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft,
        projectionBlockDraft: resolvedProjectionBlockDraft
    } = resolveProjectionWriterDraftInputs(
        theoryRows,
        semanticRaster,
        shellBlueprintDraft,
        projectionBlockDraft
    );

    return createProjectionWriterDraftFromResolvedInputs({
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft,
        projectionBlockDraft: resolvedProjectionBlockDraft
    });
}
