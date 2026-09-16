import { createProjectionDraft } from "./contracts.js";
import {
    createOutputContractDraftFromResolvedInputs,
    resolveOutputContractDraftInputs
} from "./OutputContract.js";

export function buildP4NeukernDraft(theoryRows = []) {
    const {
        normalizedTheoryRows,
        semanticRaster,
        shellBlueprintDraft,
        projectionBlockDraft,
        projectionWriterDraft
    } = resolveOutputContractDraftInputs(theoryRows);
    const draft = createProjectionDraft(normalizedTheoryRows);
    const outputContract = createOutputContractDraftFromResolvedInputs({
        normalizedTheoryRows,
        semanticRaster,
        shellBlueprintDraft,
        projectionBlockDraft,
        projectionWriterDraft
    });

    return {
        ...draft,
        semanticRaster,
        shellBlueprints: shellBlueprintDraft.blueprints,
        projectionBlocks: projectionBlockDraft.rows,
        projectionRows: projectionWriterDraft.rows,
        projectionWriterDiagnostics: {
            globalColShift: projectionWriterDraft.globalColShift
        },
        outputContract
    };
}
