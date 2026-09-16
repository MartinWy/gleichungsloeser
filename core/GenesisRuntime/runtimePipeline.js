import { normalizeGenesisRuntimeRequest } from './runtimeRequest.js';
import { cloneRuntimeValue } from './runtimeClone.js';
import { runInputPhase } from './P1_Input/runInputPhase.js';
import { runStrategyPhase } from './P2_Strategy/runStrategyPhase.js';
import { runTransformationPhase } from './P3_Transformation/runTransformationPhase.js';
import { runProjectionPhase } from './P4_Projection/runProjectionPhase.js';

const DEFAULT_RUNTIME_STEP_LIMIT = 10;

function cloneHistoryEntries(history = []) {
    return (Array.isArray(history) ? history : []).map((entry) => ({
        ...entry,
        structure: cloneRuntimeValue(entry?.structure || [])
    }));
}

function buildRuntimeEnvelope({
    request,
    inputPhase,
    strategyPhase,
    transformationPhase,
    projectionPhase
}) {
    return {
        request,
        phases: {
            input: inputPhase,
            strategy: strategyPhase,
            transformation: transformationPhase,
            projection: projectionPhase
        }
    };
}

async function runGenesisRuntime(equation, options = {}) {
    const request = normalizeGenesisRuntimeRequest(equation, options);
    const inputPhase = await runInputPhase({ request });
    const transformationHistory = [];
    const initialStructure = cloneRuntimeValue(inputPhase.structure || []);
    let currentStructure = cloneRuntimeValue(initialStructure);
    let strategyPhase = await runStrategyPhase({
        request,
        inputPhase: {
            structure: currentStructure
        }
    });
    let appliedDecision = null;

    for (let stepIndex = 0; stepIndex < DEFAULT_RUNTIME_STEP_LIMIT; stepIndex += 1) {
        if (!strategyPhase?.nextDecision) {
            break;
        }

        const transformationStep = await runTransformationPhase({
            request,
            inputPhase: {
                structure: currentStructure
            },
            strategyPhase
        });

        currentStructure = cloneRuntimeValue(transformationStep.nextStructure || currentStructure);
        appliedDecision = transformationStep.appliedDecision || appliedDecision;
        transformationHistory.push(
            ...cloneHistoryEntries(transformationStep.history)
        );

        strategyPhase = await runStrategyPhase({
            request,
            inputPhase: {
                structure: currentStructure
            }
        });

        if (!strategyPhase?.nextDecision) {
            break;
        }

        if (stepIndex === DEFAULT_RUNTIME_STEP_LIMIT - 1) {
            throw new Error(
                `[GenesisRuntime] Das Schrittlimit von ${DEFAULT_RUNTIME_STEP_LIMIT} wurde erreicht, bevor die Theorie stabil wurde.`
            );
        }
    }

    const transformationPhase = {
        phaseId: "P3_Transformation",
        appliedDecision,
        initialStructure: cloneRuntimeValue(initialStructure),
        nextStructure: cloneRuntimeValue(currentStructure),
        history: transformationHistory
    };
    const projectionPhase = await runProjectionPhase({
        request,
        inputPhase,
        strategyPhase,
        transformationPhase
    });

    return buildRuntimeEnvelope({
        request,
        inputPhase,
        strategyPhase,
        transformationPhase,
        projectionPhase
    });
}

export {
    buildRuntimeEnvelope,
    runGenesisRuntime
};
