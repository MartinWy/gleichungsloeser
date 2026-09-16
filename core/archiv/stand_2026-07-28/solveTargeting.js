import { NESTED_COLLECTION_KEYS, walkAtoms } from './atomTraversal.js';

function splitEquationSides(struktur) {
    const anchorIdx = struktur.findIndex((atom) => atom.value === '=');
    if (anchorIdx === -1) {
        return {
            anchorIdx: -1,
            left: struktur,
            right: [],
            anchor: null
        };
    }

    return {
        anchorIdx,
        left: struktur.slice(0, anchorIdx),
        right: struktur.slice(anchorIdx + 1),
        anchor: struktur[anchorIdx]
    };
}

function collectVariableNames(struktur) {
    const variableNames = new Set();

    walkAtoms(struktur, (atom) => {
        if (atom?.type === "VARIABLE" && typeof atom.value === "string" && atom.value.length > 0) {
            variableNames.add(atom.value);
        }
    });

    return [...variableNames];
}

function countVariableOccurrences(struktur, variableName) {
    let count = 0;

    if (!variableName) {
        return count;
    }

    walkAtoms(struktur, (atom) => {
        if (atom?.type === "VARIABLE" && atom.value === variableName) {
            count++;
        }
    });

    return count;
}

function validateCoreTargetOccurrence(struktur, targetVariable) {
    const occurrenceCount = countVariableOccurrences(struktur, targetVariable);

    if (occurrenceCount === 1) {
        return;
    }

    if (occurrenceCount === 0) {
        throw new Error(`Die Zielvariable "${targetVariable}" kommt in der Gleichung nicht vor.`);
    }

    throw new Error(
        `Die Zielvariable "${targetVariable}" kommt ${occurrenceCount} Mal in der Gleichung vor. `
        + "Der aktive Kern verarbeitet nur Gleichungen, in denen die Zielvariable genau einmal vorkommt."
    );
}

function enthaeltSichtbareZielvariable(element, targetVariable) {
    if (!element || element.isVisible === false) {
        return false;
    }

    if (element.type === "VARIABLE") {
        return element.value === targetVariable;
    }

    return NESTED_COLLECTION_KEYS
        .map((key) => element[key])
        .filter(Array.isArray)
        .some((collection) => collection.some((entry) => enthaeltSichtbareZielvariable(entry, targetVariable)));
}

function enthaeltSichtbareZielvariableInCollection(collection, targetVariable) {
    return Array.isArray(collection) && collection.some((element) => enthaeltSichtbareZielvariable(element, targetVariable));
}

function resolveTargetVariable(struktur, solveOptions = {}) {
    const requestedTargetVariable = typeof solveOptions.targetVariable === "string" && solveOptions.targetVariable.length > 0
        ? solveOptions.targetVariable
        : null;
    const variableNames = collectVariableNames(struktur);

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

function analyzeEquationSide(struktur, targetVariable) {
    const { left, right, anchorIdx } = splitEquationSides(struktur);
    const leftHasTarget = targetVariable ? enthaeltSichtbareZielvariableInCollection(left, targetVariable) : false;
    const rightHasTarget = targetVariable ? enthaeltSichtbareZielvariableInCollection(right, targetVariable) : false;

    if (anchorIdx === -1) {
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
    analyzeEquationSide,
    collectVariableNames,
    countVariableOccurrences,
    enthaeltSichtbareZielvariable,
    enthaeltSichtbareZielvariableInCollection,
    resolveTargetVariable,
    splitEquationSides,
    validateCoreTargetOccurrence
};
