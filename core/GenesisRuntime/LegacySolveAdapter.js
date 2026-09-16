import { buildExport } from '../solveProjectionOutput.js';
import { clone } from '../clone.js';
import { buildLegacyProjectionResultFromOutputContract } from './LegacyProjectionAdapter.js';

function buildLegacySolveResultFromGenesisRuntime(runtimeResult = {}) {
    const request = runtimeResult?.request || {};
    const projectionPhase = runtimeResult?.phases?.projection || {};
    const outputContract = projectionPhase.outputContract || {};
    const theoryRows = Array.isArray(outputContract.theoryRows)
        ? outputContract.theoryRows
        : (Array.isArray(projectionPhase.theoryRows) ? projectionPhase.theoryRows : []);
    const legacyProjection = buildLegacyProjectionResultFromOutputContract({
        ...outputContract,
        theoryRows
    });
    const theoryRowById = new Map(theoryRows.map((row) => [row.rowId, row]));
    const projectedSteps = legacyProjection.projectionRows.slice(1).map((row) => ({
        strategie: clone(theoryRowById.get(row.sourceRowId)?.strategy || null),
        struktur: clone(row.positionedAtoms || [])
    }));
    const finaleStruktur = legacyProjection.projectionRows.length > 0
        ? clone(legacyProjection.projectionRows[legacyProjection.projectionRows.length - 1].positionedAtoms || [])
        : [];
    const targetVariable = outputContract?.targetVariable || request?.requestedTargetVariable || null;
    const exportData = buildExport(
        request?.equation || null,
        targetVariable,
        theoryRows,
        legacyProjection.projectionRows,
        legacyProjection.layoutPlan
    );

    exportData.outputContract = clone(outputContract);

    return {
        eingabe: request?.equation || null,
        targetVariable,
        finaleStruktur,
        schritte: projectedSteps,
        exportData
    };
}

export {
    buildLegacySolveResultFromGenesisRuntime
};
