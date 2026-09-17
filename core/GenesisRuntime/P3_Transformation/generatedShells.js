import { cloneRuntimeValue } from '../runtimeClone.js';
import { serializeRuntimeCollection } from '../runtimeInlineFormat.js';
import { shouldRenderVisibleFunctionBase } from '../logarithmNotation.js';
import { RUNTIME_NESTED_COLLECTION_KEYS } from '../runtimeTraversal.js';

function sanitizeIdPart(value) {
    return String(value || "missing-origin").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildOriginPart(decision) {
    if (Array.isArray(decision.passiveExpressionIds) && decision.passiveExpressionIds.length > 0) {
        return decision.passiveExpressionIds.join("__");
    }

    return decision.passiveExpressionId || decision.factorId || decision.targetId || "missing-origin";
}

function buildGeneratedIdFromParts(family, inverseType, origin) {
    const familyPart = sanitizeIdPart(family || "unknown-family");
    const inversePart = sanitizeIdPart((inverseType || "shell").toLowerCase());
    const originPart = sanitizeIdPart(origin || "missing-origin");

    return `generated-${familyPart}-${inversePart}-from-${originPart}`;
}

function buildGeneratedId(decision) {
    return buildGeneratedIdFromParts(
        decision.family || "unknown-family",
        decision.inverseType || "shell",
        buildOriginPart(decision)
    );
}

function buildGeneratedOperator(decision, value, role, index = 0, origin = null) {
    return {
        id: buildGeneratedIdFromParts(
            decision.family,
            `${role}-operator-${index}`,
            origin || decision.sourceShellId || decision.targetId
        ),
        type: "OPERATOR",
        value,
        isVisible: true,
        isGenerated: true,
        originTargetId: decision.targetId,
        originSourceType: decision.sourceType,
        generatedByFamily: decision.family,
        generatedByAction: decision.action
    };
}

function cloneVisibleExpressionSnapshot(nodes = []) {
    return cloneRuntimeValue((nodes || []).filter((node) => node?.isVisible !== false));
}

function collectVisibleLeafIdsFromNodes(nodes = []) {
    const leafIds = [];

    function walk(collection = []) {
        (collection || []).forEach((node) => {
            if (!node || node.isVisible === false) {
                return;
            }

            const childCollections = RUNTIME_NESTED_COLLECTION_KEYS
                .map((key) => node[key])
                .filter(Array.isArray);

            if (childCollections.length === 0) {
                if (typeof node.id === "string" && node.id.length > 0) {
                    leafIds.push(node.id);
                }
                return;
            }

            childCollections.forEach((childCollection) => walk(childCollection));
        });
    }

    walk(nodes);
    return [...new Set(leafIds)];
}

function buildGenerationMetadata(decision, overrides = {}) {
    return {
        isGenerated: true,
        originTargetId: decision.targetId,
        originTargetExpressionIds: decision.targetExpressionIds || [decision.targetId],
        originSourceType: overrides.originSourceType || decision.sourceType,
        generatedByFamily: decision.family,
        generatedByAction: decision.action,
        argumentScope: decision.argumentScope || "whole_opposite_side"
    };
}

function buildGeneratedGroupShell(nodes, decision, options = {}) {
    const content = cloneVisibleExpressionSnapshot(
        Array.isArray(options.contentNodes) ? options.contentNodes : nodes
    );
    const originId = options.originId || decision.targetId;

    return {
        id: options.id || buildGeneratedIdFromParts(decision.family, "GROUP", originId),
        type: "GROUP",
        isVisible: true,
        label: options.label || decision.label || "Ausdruck binden",
        content,
        ...buildGenerationMetadata(decision, options)
    };
}

function shouldWrapGeneratedNegationContent(nodes = []) {
    const visibleNodes = visibleExpressionRoots(nodes);
    if (visibleNodes.length !== 1) {
        return visibleNodes.length > 1;
    }

    return ["ADDITION", "SUBTRACTION"].includes(visibleNodes[0]?.type);
}

function visibleExpressionRoots(nodes = []) {
    return (nodes || []).filter((node) => (
        node
        && node.isVisible !== false
        && !["ANCHOR", "OPERATOR"].includes(node.type)
    ));
}

function buildGeneratedNegationShell(oppositeNodes, decision, options = {}) {
    const rawContentNodes = Array.isArray(options.contentNodes)
        ? options.contentNodes
        : oppositeNodes;
    const originId = options.originId || decision.targetId;
    const normalizedContent = shouldWrapGeneratedNegationContent(rawContentNodes)
        ? [buildGeneratedGroupShell(rawContentNodes, decision, {
            originId: `${originId}-group`,
            originSourceType: options.originSourceType || decision.sourceType,
            label: options.groupLabel || "Negierten Ausdruck binden"
        })]
        : cloneVisibleExpressionSnapshot(rawContentNodes);

    return {
        id: options.id || buildGeneratedIdFromParts(decision.family, options.inverseType || "NEGATION", originId),
        type: "NEGATION",
        isVisible: true,
        label: options.label || decision.label,
        operator: buildGeneratedOperator(decision, "-", "negation", 0, originId),
        content: normalizedContent,
        ...buildGenerationMetadata(decision, options),
        transportSourceShellId: options.transportSourceShellId || null,
        transportLeafIds: Array.isArray(options.transportLeafIds)
            ? [...new Set(options.transportLeafIds)]
            : []
    };
}

function buildGeneratedCollectionShell(nodes, decision, options = {}) {
    return {
        id: options.id || buildGeneratedIdFromParts(decision.family, "COLLECTION", options.originId || decision.targetId),
        type: "COLLECTION",
        isVisible: true,
        label: options.label || decision.label || "Sammlung durchreichen",
        content: cloneVisibleExpressionSnapshot(nodes),
        ...buildGenerationMetadata(decision, options),
        transportSourceShellId: options.transportSourceShellId || null,
        transportLeafIds: Array.isArray(options.transportLeafIds)
            ? [...new Set(options.transportLeafIds)]
            : []
    };
}

function buildGeneratedFunctionShell(oppositeNodes, decision) {
    return {
        id: buildGeneratedIdFromParts(decision.family, "FUNCTION", decision.targetId),
        type: "FUNCTION",
        name: decision.inverseName,
        isVisible: true,
        label: decision.label,
        content: cloneVisibleExpressionSnapshot(oppositeNodes),
        ...buildGenerationMetadata(decision),
        originSourceName: decision.sourceName,
        inverseName: decision.inverseName
    };
}

function buildGeneratedNumberAtom(decision, value, role, index = 0) {
    return {
        id: buildGeneratedIdFromParts(decision.family, `${role}-number-${index}`, decision.targetId),
        type: "NUMBER",
        value: String(value),
        isVisible: true,
        isGenerated: true,
        originTargetId: decision.targetId,
        generatedByFamily: decision.family,
        generatedByAction: decision.action
    };
}

function buildGeneratedRootPowerShell(oppositeNodes, decision) {
    const baseShell = {
        id: buildGeneratedId(decision),
        type: decision.inverseType,
        isVisible: true,
        content: cloneVisibleExpressionSnapshot(oppositeNodes),
        ...buildGenerationMetadata(decision)
    };
    const degree = decision.inversionDegree || 2;

    if (decision.inverseType === "POWER") {
        return {
            ...baseShell,
            exponent: degree,
            exponentNodes: [buildGeneratedNumberAtom(decision, degree, "power-exponent")],
            label: "Quadrieren"
        };
    }

    return {
        ...baseShell,
        degree,
        label: "Wurzel ziehen"
    };
}

function buildGeneratedDivisionShell(oppositeNodes, passiveExpressionSnapshot, decision) {
    const passiveExpressionId = decision.passiveExpressionId || decision.factorId;
    const passiveExpressionIds = decision.passiveExpressionIds || [passiveExpressionId];

    return {
        id: buildGeneratedId(decision),
        type: "DIVISION",
        isVisible: true,
        label: "Durch Ausdruck teilen",
        numerator: cloneVisibleExpressionSnapshot(oppositeNodes),
        operator: buildGeneratedOperator(decision, "/", "division"),
        denominator: cloneVisibleExpressionSnapshot(passiveExpressionSnapshot),
        ...buildGenerationMetadata(decision),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId
    };
}

function buildExtendedDenominatorMultiplicationShell(
    sourceDivisionNode,
    passiveExpressionSnapshot,
    decision,
    options = {}
) {
    const existingDenominatorRoots = cloneVisibleExpressionSnapshot(sourceDivisionNode?.denominator);
    const passiveRoots = cloneVisibleExpressionSnapshot(passiveExpressionSnapshot);
    const generatedSide = options.generatedSide;

    if (!["left", "right"].includes(generatedSide)) {
        throw new Error(
            "[GenesisRuntime:P3] Eine Nennererweiterung braucht generatedSide left oder right."
        );
    }

    if (existingDenominatorRoots.length !== 1 || passiveRoots.length !== 1) {
        throw new Error(
            "[GenesisRuntime:P3] Eine Nennererweiterung braucht genau eine alte Nennerwurzel und einen neuen Faktor."
        );
    }

    const existingDenominatorRoot = existingDenominatorRoots[0];
    const extendsExistingProduct = existingDenominatorRoot.type === "MULTIPLICATION";
    const existingFactors = extendsExistingProduct
        ? cloneVisibleExpressionSnapshot(existingDenominatorRoot.factors)
        : existingDenominatorRoots;
    const existingOperators = extendsExistingProduct
        ? cloneVisibleExpressionSnapshot(existingDenominatorRoot.operators)
        : [];

    if (
        existingFactors.length === 0
        || existingOperators.length !== Math.max(0, existingFactors.length - 1)
    ) {
        throw new Error(
            "[GenesisRuntime:P3] Der vorhandene Nenner besitzt keine kanonische Faktorenfolge."
        );
    }

    const newOperator = buildGeneratedOperator(
        decision,
        "*",
        "denominator-extension",
        0,
        sourceDivisionNode.id
    );
    const factors = generatedSide === "left"
        ? [...passiveRoots, ...existingFactors]
        : [...existingFactors, ...passiveRoots];
    const operators = generatedSide === "left"
        ? [newOperator, ...existingOperators]
        : [...existingOperators, newOperator];

    return {
        id: buildGeneratedIdFromParts(
            decision.family,
            "DENOMINATOR_MULTIPLICATION",
            sourceDivisionNode.id
        ),
        type: "MULTIPLICATION",
        isVisible: true,
        label: "Bestehenden Nenner um Faktor erweitern",
        factors,
        operators,
        ...buildGenerationMetadata(decision, { originSourceType: "DIVISION" }),
        extendedFromDenominatorId: existingDenominatorRoot.id,
        extendedFromMultiplicationId: extendsExistingProduct ? existingDenominatorRoot.id : null,
        originPassiveExpressionId: decision.passiveExpressionId || decision.factorId || null,
        originPassiveExpressionIds: decision.passiveExpressionIds || [],
        originFactorId: decision.passiveExpressionId || decision.factorId || null
    };
}

function buildGeneratedDenominatorExtensionShell(
    sourceDivisionNode,
    passiveExpressionSnapshot,
    decision,
    options = {}
) {
    if (sourceDivisionNode?.type !== "DIVISION") {
        throw new Error(
            "[GenesisRuntime:P3] Die Nennererweiterung braucht die von P2 bezeichnete DIVISION."
        );
    }

    const numeratorRoots = cloneVisibleExpressionSnapshot(sourceDivisionNode.numerator);
    if (numeratorRoots.length !== 1) {
        throw new Error(
            "[GenesisRuntime:P3] Die Nennererweiterung braucht genau eine vorhandene Zaehlerwurzel."
        );
    }

    const denominatorProduct = buildExtendedDenominatorMultiplicationShell(
        sourceDivisionNode,
        passiveExpressionSnapshot,
        decision,
        options
    );
    const passiveExpressionId = decision.passiveExpressionId || decision.factorId || null;

    return {
        id: buildGeneratedId(decision),
        type: "DIVISION",
        isVisible: true,
        label: "Bestehenden Nenner erweitern",
        numerator: numeratorRoots,
        operator: cloneRuntimeValue(sourceDivisionNode.operator),
        denominator: [denominatorProduct],
        ...buildGenerationMetadata(decision, { originSourceType: "DIVISION" }),
        extendedFromDivisionId: sourceDivisionNode.id,
        denominatorExtensionProductId: denominatorProduct.id,
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: decision.passiveExpressionIds || (passiveExpressionId ? [passiveExpressionId] : []),
        originFactorId: passiveExpressionId
    };
}

function buildGeneratedReciprocalDivisionShell(sourceDivisionNode, decision) {
    const passiveExpressionId = decision.passiveExpressionId || decision.factorId || sourceDivisionNode?.id || null;
    const passiveExpressionIds = decision.passiveExpressionIds || (passiveExpressionId ? [passiveExpressionId] : []);

    return {
        id: buildGeneratedIdFromParts(
            decision.family,
            "RECIPROCAL_DIVISION",
            sourceDivisionNode?.id || buildOriginPart(decision)
        ),
        type: "DIVISION",
        isVisible: true,
        label: "Kehrbruch bilden",
        numerator: cloneVisibleExpressionSnapshot(sourceDivisionNode?.denominator),
        operator: buildGeneratedOperator(decision, "/", "reciprocal-division"),
        denominator: cloneVisibleExpressionSnapshot(sourceDivisionNode?.numerator),
        ...buildGenerationMetadata(decision, { originSourceType: sourceDivisionNode?.type }),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId,
        reciprocalOfShellId: sourceDivisionNode?.id || null
    };
}

function buildGeneratedBasedLogFunctionShell(oppositeNodes, baseNodes, decision) {
    const functionName = decision.inverseName || "log";
    const baseText = serializeRuntimeCollection(baseNodes);
    const visibleBaseContent = shouldRenderVisibleFunctionBase(functionName, baseText)
        ? cloneVisibleExpressionSnapshot(baseNodes)
        : [];

    return {
        id: buildGeneratedId(decision),
        type: "FUNCTION",
        name: functionName,
        isVisible: true,
        label: decision.label || "Exponent logarithmisch freilegen",
        content: cloneVisibleExpressionSnapshot(oppositeNodes),
        baseContent: visibleBaseContent,
        ...buildGenerationMetadata(decision),
        originPassiveExpressionId: decision.passiveExpressionId || decision.factorId || null,
        originPassiveExpressionIds: decision.passiveExpressionIds || [],
        originFactorId: decision.passiveExpressionId || decision.factorId || null,
        functionBaseAnchorLeafIds: collectVisibleLeafIdsFromNodes(baseNodes)
    };
}

function buildGeneratedLogInversePowerShell(oppositeNodes, baseNodes, decision) {
    const exponentNodes = cloneVisibleExpressionSnapshot(oppositeNodes);

    return {
        id: buildGeneratedIdFromParts(decision.family, "POWER", decision.targetId),
        type: "POWER",
        isVisible: true,
        label: decision.label || "Logarithmus invertieren",
        content: cloneVisibleExpressionSnapshot(baseNodes),
        exponent: serializeRuntimeCollection(exponentNodes),
        exponentNodes,
        ...buildGenerationMetadata(decision),
        originSourceName: decision.sourceName
    };
}

function buildReciprocalExponentValue(exponentValue) {
    const normalized = String(exponentValue || "").trim();
    if (normalized.length === 0) {
        return "1/1";
    }

    return /^[a-zA-Z0-9]+$/.test(normalized)
        ? `1/${normalized}`
        : `1/(${normalized})`;
}

function buildGeneratedReciprocalPowerShell(oppositeNodes, exponentValue, exponentNodes, decision) {
    const reciprocalExponent = {
        id: buildGeneratedIdFromParts(decision.family, "DIVISION", `${decision.targetId}-reciprocal-exponent`),
        type: "DIVISION",
        isVisible: true,
        numerator: [buildGeneratedNumberAtom(decision, 1, "reciprocal-numerator")],
        operator: buildGeneratedOperator(decision, "/", "reciprocal-exponent"),
        denominator: cloneVisibleExpressionSnapshot(exponentNodes),
        ...buildGenerationMetadata(decision)
    };

    return {
        id: buildGeneratedId(decision),
        type: "POWER",
        isVisible: true,
        label: decision.label || "Potenzbasis freilegen",
        content: cloneVisibleExpressionSnapshot(oppositeNodes),
        exponent: buildReciprocalExponentValue(exponentValue),
        exponentNodes: [reciprocalExponent],
        ...buildGenerationMetadata(decision),
        originPassiveExpressionId: decision.passiveExpressionId || decision.factorId || null,
        originPassiveExpressionIds: decision.passiveExpressionIds || [],
        originFactorId: decision.passiveExpressionId || decision.factorId || null
    };
}

function buildGeneratedMultiplicationShell(oppositeNodes, passiveExpressionSnapshot, decision, options = {}) {
    const oppositeRoots = cloneVisibleExpressionSnapshot(oppositeNodes);
    const passiveRoots = cloneVisibleExpressionSnapshot(passiveExpressionSnapshot);
    let factors;

    if (options.factorOrderMode === "preserve_input_order") {
        factors = [...oppositeRoots, ...passiveRoots];
    } else if (options.generatedSide === "left") {
        factors = [...passiveRoots, ...oppositeRoots];
    } else if (options.generatedSide === "right") {
        factors = [...oppositeRoots, ...passiveRoots];
    } else {
        throw new Error(
            "[GenesisRuntime:P3] Eine Gleichungsseiten-Multiplikation braucht generatedSide left oder right."
        );
    }
    const passiveExpressionId = decision.passiveExpressionId || decision.factorId;
    const passiveExpressionIds = decision.passiveExpressionIds || [passiveExpressionId];

    return {
        id: options.id || buildGeneratedId(decision),
        type: "MULTIPLICATION",
        isVisible: true,
        label: options.label || decision.label || "Mit Ausdruck multiplizieren",
        factors,
        operators: factors.slice(1).map((_, index) => (
            buildGeneratedOperator(decision, "*", "multiplication", index, options.originId)
        )),
        ...buildGenerationMetadata(decision, options),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId
    };
}

function buildGeneratedAdditiveShell(oppositeNodes, passiveExpressionSnapshot, decision, options = {}) {
    const oppositeRoots = cloneVisibleExpressionSnapshot(oppositeNodes);
    const passiveRoots = cloneVisibleExpressionSnapshot(passiveExpressionSnapshot);
    const passiveExpressionId = decision.passiveExpressionId || decision.factorId;
    const passiveExpressionIds = decision.passiveExpressionIds || [passiveExpressionId];
    const common = {
        id: buildGeneratedId(decision),
        type: decision.inverseType,
        isVisible: true,
        label: decision.inverseType === "SUBTRACTION" ? "Ausdruck subtrahieren" : "Ausdruck addieren",
        ...buildGenerationMetadata(decision, options),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId
    };

    if (decision.inverseType === "SUBTRACTION") {
        return {
            ...common,
            minuend: oppositeRoots,
            operator: buildGeneratedOperator(decision, "-", "subtraction"),
            subtrahend: passiveRoots
        };
    }

    const terms = options.generatedSide === "left"
        ? [...passiveRoots, ...oppositeRoots]
        : [...oppositeRoots, ...passiveRoots];

    return {
        ...common,
        terms,
        operators: terms.slice(1).map((_, index) => (
            buildGeneratedOperator(decision, "+", "addition", index)
        ))
    };
}

export {
    buildGeneratedAdditiveShell,
    buildGeneratedCollectionShell,
    buildGeneratedDenominatorExtensionShell,
    buildGeneratedDivisionShell,
    buildGeneratedBasedLogFunctionShell,
    buildGeneratedFunctionShell,
    buildGeneratedGroupShell,
    buildGeneratedIdFromParts,
    buildGeneratedLogInversePowerShell,
    buildGeneratedMultiplicationShell,
    buildGeneratedNegationShell,
    buildGeneratedOperator,
    buildGeneratedReciprocalDivisionShell,
    buildGeneratedReciprocalPowerShell,
    buildGeneratedRootPowerShell,
    buildOriginPart,
    cloneVisibleExpressionSnapshot,
    collectVisibleLeafIdsFromNodes,
    shouldWrapGeneratedNegationContent
};
