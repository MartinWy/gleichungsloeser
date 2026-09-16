import { cloneRuntimeValue } from '../runtimeClone.js';
import { applyShellFamilyTransformation } from './applyShellFamilies.js';

const P3_TRANSFORMATION_CONTRACT_VERSION = "p3_transformation_v2";

async function runTransformationPhase({ inputPhase, strategyPhase }) {
    const structure = cloneRuntimeValue(inputPhase?.structure || []);
    const nextDecision = strategyPhase?.nextDecision || null;

    if (!nextDecision) {
        return {
            phaseId: "P3_Transformation",
            contractVersion: P3_TRANSFORMATION_CONTRACT_VERSION,
            appliedDecision: null,
            initialStructure: structure,
            nextStructure: structure,
            history: []
        };
    }

    const shellFamilyResult = applyShellFamilyTransformation(
        structure,
        nextDecision,
        strategyPhase?.equationSideAnalysis || null
    );

    if (!shellFamilyResult) {
        throw new Error(
            `[GenesisRuntime] P3_Transformation ist fuer die Familie "${nextDecision.family}" noch nicht implementiert.`
        );
    }

    return {
        phaseId: "P3_Transformation",
        contractVersion: P3_TRANSFORMATION_CONTRACT_VERSION,
        appliedDecision: nextDecision,
        initialStructure: structure,
        nextStructure: shellFamilyResult.nextStructure,
        history: [
            {
                strategy: cloneRuntimeValue(nextDecision),
                structure: cloneRuntimeValue(shellFamilyResult.nextStructure)
            }
        ]
    };
}

export {
    P3_TRANSFORMATION_CONTRACT_VERSION,
    runTransformationPhase
};
