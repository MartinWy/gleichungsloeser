import { createRuntimeIdFactory } from './idFactory.js';
import { createRuntimeSourceParser } from './runtimeScanner.js';
import { normalizeRuntimeSource } from './runtimeSource.js';

const P1_INPUT_CONTRACT_VERSION = "p1_input_v1";

function validateEquationEnvelope(normalizedEquation) {
    const anchorCount = Array.from(normalizedEquation)
        .filter((character) => character === "=")
        .length;

    if (anchorCount === 0) {
        throw new Error("[GenesisRuntime:P1] Der Gleichung fehlt der Gleichheitsanker.");
    }

    if (anchorCount !== 1) {
        throw new Error("[GenesisRuntime:P1] Die Gleichung muss genau einen Gleichheitsanker besitzen.");
    }

    const anchorIndex = normalizedEquation.indexOf("=");
    if (anchorIndex === 0) {
        throw new Error("[GenesisRuntime:P1] Die linke Gleichungsseite darf nicht leer sein.");
    }

    if (anchorIndex === normalizedEquation.length - 1) {
        throw new Error("[GenesisRuntime:P1] Die rechte Gleichungsseite darf nicht leer sein.");
    }
}

function parseInputStructure(equation) {
    const normalizedEquation = normalizeRuntimeSource(equation);
    validateEquationEnvelope(normalizedEquation);
    const idFactory = createRuntimeIdFactory(normalizedEquation);
    const parser = createRuntimeSourceParser(idFactory);
    const structure = parser.parseSource(normalizedEquation);

    if (
        structure.length !== 3
        || structure[1]?.type !== "ANCHOR"
        || structure[1]?.value !== "="
    ) {
        throw new Error("[GenesisRuntime:P1] Die Ausgabe besitzt nicht genau eine Ausdruckswurzel je Gleichungsseite.");
    }

    return {
        contractVersion: P1_INPUT_CONTRACT_VERSION,
        normalizedEquation,
        namespace: idFactory.namespace,
        structure
    };
}

export {
    P1_INPUT_CONTRACT_VERSION,
    parseInputStructure
};
