import { splitRuntimeEquationSides } from './equationSides.js';
import {
    analyzeRuntimeEquationSide,
    collectRuntimeVariableNames,
    resolveRuntimeTargetVariable,
    validateRuntimeTargetOccurrence
} from './targetSelection.js';
import {
    findNextRuntimeDecision,
    findSubtractedSumReleaseDecision
} from './findNextDecision.js';

const P2_STRATEGY_CONTRACT_VERSION = "p2_strategy_v1";

function isIsolatedRuntimeTarget(activeSideNodes, targetVariable) {
    const visibleNodes = (Array.isArray(activeSideNodes) ? activeSideNodes : [])
        .filter((node) => node && node.isVisible !== false);

    return visibleNodes.length === 1
        && visibleNodes[0].type === "VARIABLE"
        && visibleNodes[0].value === targetVariable;
}

async function runStrategyPhase({ request, inputPhase }) {
    const structure = inputPhase?.structure || [];
    const variableNames = collectRuntimeVariableNames(structure);
    const targetVariable = resolveRuntimeTargetVariable(
        structure,
        request?.requestedTargetVariable || null
    );

    if (targetVariable) {
        validateRuntimeTargetOccurrence(structure, targetVariable);
    }

    const equationSideAnalysis = analyzeRuntimeEquationSide(structure, targetVariable);
    if (targetVariable && equationSideAnalysis.state === "both") {
        throw new Error(
            `Die Zielvariable "${targetVariable}" steht auf beiden Gleichungsseiten. `
            + "Der aktive GenesisRuntime-Kern verarbeitet nur Gleichungen, in denen die Zielvariable genau einmal vorkommt."
        );
    }

    const equationSides = splitRuntimeEquationSides(structure);
    const activeSideNodes = equationSideAnalysis.side === "right"
        ? equationSides.right
        : equationSides.left;
    const oppositeSideNodes = equationSideAnalysis.side === "right"
        ? equationSides.left
        : equationSides.right;
    const oppositeEquationSide = equationSideAnalysis.side === "right" ? "left" : "right";
    const passiveNormalizationDecision = equationSideAnalysis.side
        ? findSubtractedSumReleaseDecision(oppositeSideNodes, targetVariable, oppositeEquationSide)
        : null;
    const nextDecision = equationSideAnalysis.side
        ? passiveNormalizationDecision || findNextRuntimeDecision(activeSideNodes, targetVariable)
        : null;

    if (
        targetVariable
        && equationSideAnalysis.side
        && !nextDecision
        && !isIsolatedRuntimeTarget(activeSideNodes, targetVariable)
    ) {
        const rootType = activeSideNodes.find((node) => node && node.isVisible !== false)?.type || "UNKNOWN";
        throw new Error(
            `[GenesisRuntime:P2] UNSUPPORTED_STRATEGY_SITUATION: `
            + `Die Zielvariable "${targetVariable}" ist unter ${rootType} noch nicht isoliert, `
            + "aber keine Strategie-Fallregel passt."
        );
    }

    return {
        phaseId: "P2_Strategy",
        contractVersion: P2_STRATEGY_CONTRACT_VERSION,
        variableNames,
        targetVariable,
        equationSideAnalysis,
        equationSides,
        activeSideNodes,
        oppositeSideNodes,
        nextDecision
    };
}

export {
    P2_STRATEGY_CONTRACT_VERSION,
    isIsolatedRuntimeTarget,
    runStrategyPhase
};
