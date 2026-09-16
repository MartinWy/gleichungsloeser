import {
    containsVisibleTargetInCollection,
    containsVisibleTargetNode
} from './targetSelection.js';

function visibleNodes(structure = []) {
    return (structure || []).filter((node) => node && node.isVisible !== false);
}

function collectSegmentIds(collection = []) {
    return (collection || []).filter(Boolean).map((node) => node.id).filter(Boolean);
}

function isNonEmptySegment(collection) {
    return Array.isArray(collection) && collection.length > 0;
}

function isPassiveExpression(node, targetVariable) {
    if (!node || node.isVisible === false) {
        return false;
    }

    if (["ANCHOR", "OPERATOR"].includes(node.type)) {
        return false;
    }

    return !containsVisibleTargetNode(node, targetVariable);
}

function isMultiplicativeCarrier(node) {
    return Boolean(
        node
        && node.isVisible !== false
        && !["ANCHOR", "OPERATOR"].includes(node.type)
    );
}

function isMultiplicationChain(structure = []) {
    const nodes = visibleNodes(structure);

    if (nodes.length < 3 || nodes.length % 2 === 0) {
        return false;
    }

    return nodes.every((node, index) => {
        if (index % 2 === 1) {
            return node?.type === "OPERATOR" && node.value === "*";
        }

        return isMultiplicativeCarrier(node);
    });
}

function splitMultiplicationChain(structure = []) {
    const nodes = visibleNodes(structure);

    if (!isMultiplicationChain(nodes)) {
        return null;
    }

    return {
        factors: nodes.filter((_, index) => index % 2 === 0),
        operators: nodes.filter((_, index) => index % 2 === 1)
    };
}

function isTrigonometricSourceFunction(name) {
    return ["sin", "cos", "tan"].includes(name);
}

function getTrigInverseMeta(name) {
    return {
        sin: { inverseName: "asin", action: "INVERT_TO_ASIN", label: "Sinus invertieren" },
        cos: { inverseName: "acos", action: "INVERT_TO_ACOS", label: "Kosinus invertieren" },
        tan: { inverseName: "atan", action: "INVERT_TO_ATAN", label: "Tangens invertieren" }
    }[name] || null;
}

function isInverseTrigonometricSourceFunction(name) {
    return ["asin", "acos", "atan"].includes(name);
}

function getInverseTrigMeta(name) {
    return {
        asin: { inverseName: "sin", action: "INVERT_TO_SIN", label: "Arkussinus invertieren" },
        acos: { inverseName: "cos", action: "INVERT_TO_COS", label: "Arkuskosinus invertieren" },
        atan: { inverseName: "tan", action: "INVERT_TO_TAN", label: "Arkustangens invertieren" }
    }[name] || null;
}

function isLogarithmicSourceFunction(name) {
    return ["log", "ln", "lg"].includes(name);
}

function getLogInverseMeta(name, baseContent = []) {
    if (Array.isArray(baseContent) && baseContent.length > 0) {
        return {
            inverseBaseText: null,
            action: "INVERT_TO_POWER_WITH_EXPLICIT_BASE",
            label: "Logarithmus invertieren"
        };
    }

    return {
        log: {
            inverseBaseText: "10",
            action: "INVERT_TO_POWER_BASE_10",
            label: "Zehnerlogarithmus invertieren"
        },
        ln: {
            inverseBaseText: "e",
            action: "INVERT_TO_POWER_BASE_E",
            label: "Natuerlichen Logarithmus invertieren"
        },
        lg: {
            inverseBaseText: "2",
            action: "INVERT_TO_POWER_BASE_2",
            label: "Zweierlogarithmus invertieren"
        }
    }[name] || null;
}

function extractSimpleBaseTextFromNodes(baseNodes = []) {
    const visibleBaseNodes = (Array.isArray(baseNodes) ? baseNodes : [])
        .filter((node) => node && node.isVisible !== false);

    if (visibleBaseNodes.length !== 1) {
        return "";
    }

    const [baseNode] = visibleBaseNodes;

    if (baseNode?.type === "NUMBER" || baseNode?.type === "VARIABLE") {
        return String(baseNode?.value || "").trim();
    }

    return "";
}

function resolvePowerExponentInverseName(baseNodes = []) {
    const simpleBaseText = extractSimpleBaseTextFromNodes(baseNodes);

    if (simpleBaseText === "e") {
        return "ln";
    }

    if (simpleBaseText === "2") {
        return "lg";
    }

    return "log";
}

function createStrategyDecision(payload) {
    return {
        typ: "STRATEGY_DECISION",
        ...payload
    };
}

function detectTargetInDenominatorBoundary(structure, targetVariable) {
    const divisionShell = (structure || []).find((node) =>
        node?.type === "DIVISION"
        && node.isVisible !== false
        && !containsVisibleTargetInCollection(node.numerator, targetVariable)
        && containsVisibleTargetInCollection(node.denominator, targetVariable)
    );

    if (!divisionShell) {
        return null;
    }

    return {
        code: "TARGET_IN_DENOMINATOR",
        message: `Die Zielvariable "${targetVariable}" liegt im Nenner einer sichtbaren DIVISION-Schale. Diese Richtung ist noch nicht aktiviert.`
    };
}

function hasNumericExponent(node) {
    return typeof node?.exponent === "number" && Number.isFinite(node.exponent);
}

function detectTargetInPowerBoundary(structure, targetVariable) {
    const exponentTargetPower = (structure || []).find((node) =>
        node?.type === "POWER"
        && node.isVisible !== false
        && containsVisibleTargetInCollection(node.exponentNodes, targetVariable)
    );

    if (exponentTargetPower) {
        return {
            code: "TARGET_IN_POWER_EXPONENT",
            message: `Die Zielvariable "${targetVariable}" liegt im Exponenten einer sichtbaren POWER-Schale. Diese logarithmische Richtung ist noch nicht aktiviert.`
        };
    }

    const symbolicBasePower = (structure || []).find((node) =>
        node?.type === "POWER"
        && node.isVisible !== false
        && !hasNumericExponent(node)
        && containsVisibleTargetInCollection(node.content, targetVariable)
    );

    if (symbolicBasePower) {
        return {
            code: "TARGET_IN_SYMBOLIC_POWER_BASE",
            message: `Die Zielvariable "${targetVariable}" liegt in der Basis einer sichtbaren POWER-Schale mit nichtnumerischem Exponenten. Diese Richtung ist noch nicht aktiviert.`
        };
    }

    return null;
}

export {
    collectSegmentIds,
    createStrategyDecision,
    detectTargetInDenominatorBoundary,
    detectTargetInPowerBoundary,
    getLogInverseMeta,
    hasNumericExponent,
    getInverseTrigMeta,
    getTrigInverseMeta,
    isInverseTrigonometricSourceFunction,
    isLogarithmicSourceFunction,
    isMultiplicationChain,
    isMultiplicativeCarrier,
    isNonEmptySegment,
    isPassiveExpression,
    isTrigonometricSourceFunction,
    resolvePowerExponentInverseName,
    splitMultiplicationChain,
    visibleNodes
};
