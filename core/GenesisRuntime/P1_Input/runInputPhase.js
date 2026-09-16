import { parseInputStructure } from './parseInputStructure.js';

async function runInputPhase({ request }) {
    const parsedInput = parseInputStructure(request.equation);

    return {
        phaseId: "P1_Input",
        contractVersion: parsedInput.contractVersion,
        normalizedEquation: parsedInput.normalizedEquation,
        namespace: parsedInput.namespace,
        structure: parsedInput.structure
    };
}

export {
    runInputPhase
};
