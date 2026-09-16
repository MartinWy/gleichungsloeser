import { buildTheoryRowsFromRuntime } from './buildTheoryRows.js';
import { buildGlobalSemanticRaster } from './buildGlobalSemanticRaster.js';
import { buildShellBlueprints } from './buildShellBlueprints.js';
import { buildProjectionBlocks } from './buildProjectionBlocks.js';
import { refineSemanticRaster } from './refineSemanticRaster.js';
import { localizeProjectionGeometry } from './localizeProjectionGeometry.js';
import { writeProjectionRows } from './writeProjectionRows.js';
import { buildOutputContract } from './buildOutputContract.js';

function runProjectionPhaseSync({ request, inputPhase, strategyPhase, transformationPhase }) {
    const theoryRows = buildTheoryRowsFromRuntime({
        inputPhase,
        transformationPhase
    });
    const shellBlueprints = buildShellBlueprints(theoryRows);
    const initialSemanticRaster = buildGlobalSemanticRaster(theoryRows, shellBlueprints);
    const semanticRaster = refineSemanticRaster(theoryRows, initialSemanticRaster);
    const localGeometry = localizeProjectionGeometry(theoryRows, semanticRaster, shellBlueprints);
    const projectionBlocks = buildProjectionBlocks(theoryRows, localGeometry);
    const writtenRows = writeProjectionRows(
        theoryRows,
        semanticRaster,
        localGeometry,
        projectionBlocks,
        strategyPhase?.targetVariable || null
    );
    const outputContract = buildOutputContract({
        request,
        targetVariable: strategyPhase?.targetVariable || null,
        theoryRows,
        semanticRaster,
        shellBlueprints: localGeometry.localizedShellBlueprints,
        projectionBlocks,
        writtenRows
    });

    return {
        phaseId: "P4_Projection",
        theoryRows,
        semanticRaster,
        shellBlueprints: outputContract.shellBlueprints,
        projectionBlocks: outputContract.projectionBlocks,
        projectionRows: outputContract.projectionRows,
        outputContract
    };
}

async function runProjectionPhase({ request, inputPhase, strategyPhase, transformationPhase }) {
    return runProjectionPhaseSync({
        request,
        inputPhase,
        strategyPhase,
        transformationPhase
    });
}

export {
    runProjectionPhase,
    runProjectionPhaseSync
};
