import {
    createProjectionWriterDraftFromResolvedInputs,
    resolveProjectionWriterDraftInputs
} from "./ProjectionWriter.js";
import {
    buildAtomRegister,
    buildProjectionAtomRegister,
    buildTraceIndex
} from "./outputContractTrace.js";
import {
    buildLayoutPlan,
    buildOutputProfiles
} from "./outputContractLayout.js";

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function resolveOutputContractDraftInputs(
    theoryRows = [],
    semanticRaster = null,
    shellBlueprintDraft = null,
    projectionBlockDraft = null,
    projectionWriterDraft = null
) {
    const {
        normalizedTheoryRows,
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft,
        projectionBlockDraft: resolvedProjectionBlockDraft
    } = resolveProjectionWriterDraftInputs(
        theoryRows,
        semanticRaster,
        shellBlueprintDraft,
        projectionBlockDraft
    );

    return {
        normalizedTheoryRows,
        semanticRaster: resolvedSemanticRaster,
        shellBlueprintDraft: resolvedShellBlueprintDraft,
        projectionBlockDraft: resolvedProjectionBlockDraft,
        projectionWriterDraft: projectionWriterDraft || createProjectionWriterDraftFromResolvedInputs({
            semanticRaster: resolvedSemanticRaster,
            shellBlueprintDraft: resolvedShellBlueprintDraft,
            projectionBlockDraft: resolvedProjectionBlockDraft
        })
    };
}

export function createOutputContractDraftFromResolvedInputs({
    normalizedTheoryRows = [],
    semanticRaster: resolvedSemanticRaster = null,
    shellBlueprintDraft: resolvedShellBlueprintDraft = null,
    projectionBlockDraft: resolvedProjectionBlockDraft = null,
    projectionWriterDraft: resolvedProjectionWriterDraft = null
} = {}) {
    return {
        version: "p4_neukern_output_contract_v1",
        source: "P4_Neukern",
        theoryRows: clone(normalizedTheoryRows),
        projectionRows: clone(resolvedProjectionWriterDraft.rows),
        atomRegister: buildAtomRegister(normalizedTheoryRows),
        projectionAtomRegister: buildProjectionAtomRegister(resolvedProjectionWriterDraft.rows),
        traceIndex: buildTraceIndex(normalizedTheoryRows, resolvedProjectionWriterDraft.rows),
        layoutPlan: buildLayoutPlan(
            resolvedProjectionWriterDraft.rows,
            resolvedSemanticRaster,
            { globalColShift: resolvedProjectionWriterDraft.globalColShift }
        ),
        semanticColumns: clone(resolvedSemanticRaster.columns || []),
        shellBlueprints: clone(resolvedShellBlueprintDraft.blueprints || []),
        projectionBlocks: clone(resolvedProjectionBlockDraft.rows || []),
        outputProfiles: buildOutputProfiles(),
        diagnostics: {
            mixedSideSemanticIds: clone(resolvedSemanticRaster.mixedSideSemanticIds || []),
            multiPlacementSemanticIds: clone(resolvedSemanticRaster.multiPlacementSemanticIds || []),
            orderingDiagnostics: clone(resolvedSemanticRaster.orderingDiagnostics || {}),
            projectionWriterDiagnostics: {
                globalColShift: resolvedProjectionWriterDraft.globalColShift
            }
        }
    };
}

export function buildOutputContractDraft(
    theoryRows = [],
    semanticRaster = null,
    shellBlueprintDraft = null,
    projectionBlockDraft = null,
    projectionWriterDraft = null
) {
    return createOutputContractDraftFromResolvedInputs(
        resolveOutputContractDraftInputs(
            theoryRows,
            semanticRaster,
            shellBlueprintDraft,
            projectionBlockDraft,
            projectionWriterDraft
        )
    );
}
