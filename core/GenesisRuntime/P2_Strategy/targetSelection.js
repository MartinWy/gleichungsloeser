import { RUNTIME_NESTED_COLLECTION_KEYS } from '../runtimeTraversal.js';
import { splitRuntimeEquationSides } from './equationSides.js';

function walkVisibleRuntimeNodes(nodes, visit) {
    (Array.isArray(nodes) ? nodes : []).forEach((node) => {
        if (!node || node.isVisible === false) {
            return;
        }

        visit(node);

        RUNTIME_NESTED_COLLECTION_KEYS
            .map((key) => node[key])
            .filter(Array.isArray)
            .forEach((collection) => walkVisibleRuntimeNodes(collection, visit));
    });
}

function collectRuntimeVariableNames(structure) {
    const variableNames = new Set();

    walkVisibleRuntimeNodes(structure, (node) => {
        if (node?.type === "VARIABLE" && typeof node.value === "string" && node.value.length > 0) {
            variableNames.add(node.value);
        }
    });

    return [...variableNames];
}

function countRuntimeVariableOccurrences(structure, variableName) {
    let occurrenceCount = 0;

    if (!variableName) {
        return occurrenceCount;
    }

    walkVisibleRuntimeNodes(structure, (node) => {
        if (node?.type === "VARIABLE" && node.value === variableName) {
            occurrenceCount += 1;
        }
    });

    return occurrenceCount;
}

function validateRuntimeTargetOccurrence(structure, targetVariable) {
    const occurrenceCount = countRuntimeVariableOccurrences(structure, targetVariable);

    if (occurrenceCount === 1) {
        return;
    }

    if (occurrenceCount === 0) {
        throw new Error(`Die Zielvariable "${targetVariable}" kommt in der Gleichung nicht vor.`);
    }

    throw new Error(
        `Die Zielvariable "${targetVariable}" kommt ${occurrenceCount} Mal in der Gleichung vor. `
        + "Der aktive GenesisRuntime-Kern verarbeitet nur Gleichungen, in denen die Zielvariable genau einmal vorkommt."
    );
}

function containsVisibleTargetNode(node, targetVariable) {
    if (!node || node.isVisible === false) {
        return false;
    }

    if (node.type === "VARIABLE") {
        return node.value === targetVariable;
    }

    return RUNTIME_NESTED_COLLECTION_KEYS
        .map((key) => node[key])
        .filter(Array.isArray)
        .some((collection) => collection.some((entry) => containsVisibleTargetNode(entry, targetVariable)));
}

function containsVisibleTargetInCollection(collection, targetVariable) {
    return Array.isArray(collection) && collection.some((node) => containsVisibleTargetNode(node, targetVariable));
}

function resolveRuntimeTargetVariable(structure, requestedTargetVariable = null) {
    const variableNames = collectRuntimeVariableNames(structure);

    if (requestedTargetVariable) {
        if (!variableNames.includes(requestedTargetVariable)) {
            throw new Error(`Die Zielvariable "${requestedTargetVariable}" kommt in der Gleichung nicht vor.`);
        }

        return requestedTargetVariable;
    }

    if (variableNames.length <= 1) {
        return variableNames[0] || null;
    }

    throw new Error(`Mehrere Variablen gefunden (${variableNames.join(", ")}). Bitte targetVariable angeben.`);
}

function analyzeRuntimeEquationSide(structure, targetVariable) {
    const { left, right, anchorIndex } = splitRuntimeEquationSides(structure);
    const leftHasTarget = targetVariable ? containsVisibleTargetInCollection(left, targetVariable) : false;
    const rightHasTarget = targetVariable ? containsVisibleTargetInCollection(right, targetVariable) : false;

    if (anchorIndex === -1) {
        return {
            side: leftHasTarget ? "left" : null,
            state: leftHasTarget ? "left" : "none",
            leftHasTarget,
            rightHasTarget
        };
    }

    if (leftHasTarget === rightHasTarget) {
        return {
            side: null,
            state: leftHasTarget ? "both" : "none",
            leftHasTarget,
            rightHasTarget
        };
    }

    return {
        side: leftHasTarget ? "left" : "right",
        state: leftHasTarget ? "left" : "right",
        leftHasTarget,
        rightHasTarget
    };
}

export {
    analyzeRuntimeEquationSide,
    collectRuntimeVariableNames,
    containsVisibleTargetInCollection,
    containsVisibleTargetNode,
    countRuntimeVariableOccurrences,
    resolveRuntimeTargetVariable,
    validateRuntimeTargetOccurrence
};
