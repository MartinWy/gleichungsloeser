import {
    analyzeRuntimeEquationSide,
    containsVisibleTargetInCollection,
    containsVisibleTargetNode
} from './targetSelection.js';
import {
    collectSegmentIds,
    createStrategyDecision,
    detectTargetInDenominatorBoundary,
    detectTargetInPowerBoundary,
    getInverseTrigMeta,
    getLogInverseMeta,
    getTrigInverseMeta,
    hasNumericExponent,
    isInverseTrigonometricSourceFunction,
    isLogarithmicSourceFunction,
    isPassiveExpression,
    isTrigonometricSourceFunction,
    resolvePowerExponentInverseName,
    visibleNodes
} from './decisionHelpers.js';

function getSingleVisibleRoot(structure = []) {
    const nodes = visibleNodes(structure);
    return nodes.length === 1 ? nodes[0] : null;
}

function partitionChildren(children = [], targetVariable) {
    const visibleChildren = visibleNodes(children);
    const targetChildren = visibleChildren.filter((node) => containsVisibleTargetNode(node, targetVariable));
    const passiveChildren = visibleChildren.filter((node) => !containsVisibleTargetNode(node, targetVariable));

    return {
        visibleChildren,
        targetChildren,
        passiveChildren,
        targetIndex: visibleChildren.findIndex((node) => containsVisibleTargetNode(node, targetVariable))
    };
}

function resolveSingleBoundDivision(node = null) {
    let current = node;

    while (current?.type === "GROUP") {
        const contentRoots = visibleNodes(current.content || []);
        if (contentRoots.length !== 1) {
            return null;
        }

        [current] = contentRoots;
    }

    return current?.type === "DIVISION" ? current : null;
}

function shellDecision(shell, payload) {
    return createStrategyDecision({
        targetId: shell.id,
        sourceShellId: shell.id,
        sourceType: shell.type,
        ...payload
    });
}

function findGroupReleaseDecision(structure, targetVariable) {
    const group = getSingleVisibleRoot(structure);
    if (group?.type !== "GROUP" || !containsVisibleTargetNode(group, targetVariable)) {
        return null;
    }

    const targetExpressionIds = collectSegmentIds(group.content);
    if (targetExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(group, {
        family: "group_release",
        targetRole: "content",
        targetExpressionIds,
        inverseType: "EXPLICIT_CONTENT",
        action: "RELEASE_GROUP_CONTENT",
        label: "Gruppe freilegen",
        argumentScope: "active_side_only"
    });
}

function createMultiplicationReleaseDecision(multiplicationShell, targetVariable, options = {}) {
    const {
        oppositeSideNodes = [],
        ...decisionOptions
    } = options;
    const {
        targetChildren,
        passiveChildren,
        targetIndex
    } = partitionChildren(multiplicationShell.factors, targetVariable);

    if (
        targetChildren.length !== 1
        || passiveChildren.length === 0
        || !passiveChildren.every((factor) => isPassiveExpression(factor, targetVariable))
    ) {
        return null;
    }

    const reciprocalDivision = passiveChildren.length === 1
        ? resolveSingleBoundDivision(passiveChildren[0])
        : null;
    const reciprocalFactorMode = Boolean(reciprocalDivision);
    const oppositeRoot = getSingleVisibleRoot(oppositeSideNodes);
    const oppositeDivision = !reciprocalFactorMode && oppositeRoot?.type === "DIVISION"
        ? oppositeRoot
        : null;
    const denominatorExtensionMode = Boolean(oppositeDivision);
    const passiveExpressionIds = collectSegmentIds(passiveChildren);
    const inverseMode = reciprocalFactorMode
        ? "reciprocal_factor"
        : (denominatorExtensionMode ? "extend_existing_denominator" : "denominator_division");
    const action = reciprocalFactorMode
        ? "MOVE_PASSIVE_FRACTION_TO_RECIPROCAL_FACTOR"
        : (denominatorExtensionMode
            ? "MOVE_PASSIVE_EXPRESSION_TO_EXISTING_DENOMINATOR"
            : "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");

    return shellDecision(multiplicationShell, {
        family: "fraction_birth",
        targetRole: "factors",
        passiveRole: "factors",
        targetExpressionIds: collectSegmentIds(targetChildren),
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        operatorId: multiplicationShell.operators?.[0]?.id || null,
        operatorIds: collectSegmentIds(multiplicationShell.operators),
        targetFactorIndex: targetIndex,
        inverseType: reciprocalFactorMode ? "MULTIPLICATION" : "DIVISION",
        inverseMode,
        passiveExpressionForm: reciprocalFactorMode ? "DIVISION" : "GENERIC",
        reciprocalDivisionId: reciprocalDivision?.id || null,
        oppositeExpressionForm: denominatorExtensionMode ? "DIVISION" : "GENERIC",
        oppositeDivisionId: oppositeDivision?.id || null,
        action,
        label: decisionOptions.wrappedByNegation
            ? "Negativen Faktorblock in Nenner"
            : (reciprocalFactorMode
                ? "Kehrbruch als Faktor"
                : (denominatorExtensionMode
                    ? "Bestehenden Nenner um Faktor erweitern"
                    : "Ausdruck in Nenner")),
        argumentScope: "whole_opposite_side",
        ...decisionOptions
    });
}

function findNegativeMultiplicationDecision(structure, targetVariable, options = {}) {
    const negationShell = getSingleVisibleRoot(structure);
    if (
        negationShell?.type !== "NEGATION"
        || !containsVisibleTargetNode(negationShell, targetVariable)
    ) {
        return null;
    }

    const multiplicationShell = getSingleVisibleRoot(negationShell.content);
    if (multiplicationShell?.type !== "MULTIPLICATION") {
        return null;
    }

    return createMultiplicationReleaseDecision(multiplicationShell, targetVariable, {
        ...options,
        containerTargetId: negationShell.id,
        wrappedByNegation: true
    });
}

function findNegativeSignReleaseDecision(structure, targetVariable) {
    const negationShell = getSingleVisibleRoot(structure);
    if (
        negationShell?.type !== "NEGATION"
        || !containsVisibleTargetNode(negationShell, targetVariable)
    ) {
        return null;
    }

    const targetExpressionIds = collectSegmentIds(negationShell.content);
    if (targetExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(negationShell, {
        family: "negative_sign_release",
        targetRole: "content",
        targetExpressionIds,
        operatorId: negationShell.operator?.id || null,
        inverseType: "NEGATION",
        action: "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE",
        label: "Vorzeichen umklappen",
        argumentScope: "whole_opposite_side"
    });
}

function findAdditionReleaseDecision(structure, targetVariable) {
    const additionShell = getSingleVisibleRoot(structure);
    if (additionShell?.type !== "ADDITION") {
        return null;
    }

    const {
        targetChildren,
        passiveChildren,
        targetIndex
    } = partitionChildren(additionShell.terms, targetVariable);

    if (
        targetChildren.length !== 1
        || passiveChildren.length === 0
        || !passiveChildren.every((term) => isPassiveExpression(term, targetVariable))
    ) {
        return null;
    }

    const passiveExpressionIds = collectSegmentIds(passiveChildren);
    return shellDecision(additionShell, {
        family: "addition_release",
        targetRole: "terms",
        passiveRole: "terms",
        targetExpressionIds: collectSegmentIds(targetChildren),
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        operatorId: additionShell.operators?.[0]?.id || null,
        operatorIds: collectSegmentIds(additionShell.operators),
        targetTermIndex: targetIndex,
        targetSide: targetIndex === 0 ? "left" : "right",
        inverseType: "SUBTRACTION",
        action: "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION",
        label: "Ausdruck subtrahieren",
        argumentScope: "whole_opposite_side"
    });
}

function findSubtractionReleaseDecision(structure, targetVariable) {
    const subtractionShell = getSingleVisibleRoot(structure);
    if (subtractionShell?.type !== "SUBTRACTION") {
        return null;
    }

    const minuendCarriesTarget = containsVisibleTargetInCollection(subtractionShell.minuend, targetVariable);
    const subtrahendCarriesTarget = containsVisibleTargetInCollection(subtractionShell.subtrahend, targetVariable);
    if (!minuendCarriesTarget || subtrahendCarriesTarget) {
        return null;
    }

    const passiveExpressionIds = collectSegmentIds(subtractionShell.subtrahend);
    if (
        collectSegmentIds(subtractionShell.minuend).length !== 1
        || passiveExpressionIds.length !== 1
        || !subtractionShell.subtrahend.every((node) => isPassiveExpression(node, targetVariable))
    ) {
        return null;
    }

    return shellDecision(subtractionShell, {
        family: "subtraction_release",
        targetRole: "minuend",
        passiveRole: "subtrahend",
        targetExpressionIds: collectSegmentIds(subtractionShell.minuend),
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        operatorId: subtractionShell.operator?.id || null,
        targetSide: "left",
        inverseType: "ADDITION",
        action: "MOVE_PASSIVE_EXPRESSION_TO_ADDITION",
        label: "Ausdruck addieren",
        argumentScope: "whole_opposite_side"
    });
}

function findSubtrahendReleaseDecision(structure, targetVariable) {
    const subtractionShell = getSingleVisibleRoot(structure);
    if (subtractionShell?.type !== "SUBTRACTION") {
        return null;
    }

    const minuendCarriesTarget = containsVisibleTargetInCollection(subtractionShell.minuend, targetVariable);
    const subtrahendCarriesTarget = containsVisibleTargetInCollection(subtractionShell.subtrahend, targetVariable);
    if (minuendCarriesTarget || !subtrahendCarriesTarget) {
        return null;
    }

    const passiveExpressionIds = collectSegmentIds(subtractionShell.minuend);
    if (
        collectSegmentIds(subtractionShell.subtrahend).length !== 1
        || passiveExpressionIds.length !== 1
        || !subtractionShell.minuend.every((node) => isPassiveExpression(node, targetVariable))
    ) {
        return null;
    }

    return shellDecision(subtractionShell, {
        family: "subtrahend_release",
        targetRole: "subtrahend",
        passiveRole: "minuend",
        targetExpressionIds: collectSegmentIds(subtractionShell.subtrahend),
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        operatorId: subtractionShell.operator?.id || null,
        targetSide: "right",
        inverseType: "SUBTRACTION",
        action: "MOVE_MINUEND_TO_SUBTRACTION",
        label: "Minuend subtrahieren",
        argumentScope: "whole_opposite_side"
    });
}

function findSubtractedSumReleaseDecision(structure, targetVariable, equationSide = null) {
    const subtractionShell = getSingleVisibleRoot(structure);
    if (
        subtractionShell?.type !== "SUBTRACTION"
        || containsVisibleTargetNode(subtractionShell, targetVariable)
    ) {
        return null;
    }

    const groupShell = getSingleVisibleRoot(subtractionShell.subtrahend);
    if (groupShell?.type !== "GROUP") {
        return null;
    }

    const additionShell = getSingleVisibleRoot(groupShell.content);
    const summands = visibleNodes(additionShell?.terms);
    const additionOperators = visibleNodes(additionShell?.operators);
    if (
        additionShell?.type !== "ADDITION"
        || summands.length < 2
        || additionOperators.length !== summands.length - 1
        || !additionOperators.every((operator) => operator?.type === "OPERATOR" && operator?.value === "+")
    ) {
        return null;
    }

    const minuendExpressionIds = collectSegmentIds(subtractionShell.minuend);
    const summandExpressionIds = collectSegmentIds(summands);
    if (minuendExpressionIds.length !== 1 || summandExpressionIds.length !== summands.length) {
        return null;
    }

    return shellDecision(subtractionShell, {
        family: "subtracted_sum_release",
        equationSide,
        targetRole: "subtrahend",
        targetExpressionIds: [groupShell.id],
        passiveRole: "minuend",
        passiveExpressionIds: minuendExpressionIds,
        groupId: groupShell.id,
        additionId: additionShell.id,
        summandExpressionIds,
        operatorId: subtractionShell.operator?.id || null,
        operatorIds: [
            subtractionShell.operator?.id,
            ...additionOperators.map((operator) => operator?.id)
        ].filter(Boolean),
        inverseType: "SUBTRACTION",
        action: "DISTRIBUTE_SUBTRACTION_OVER_GROUPED_SUM",
        label: "Negative Summenklammer aufloesen",
        argumentScope: "passive_side_only"
    });
}

function findFractionBirthDecision(structure, targetVariable, options = {}) {
    const multiplicationShell = getSingleVisibleRoot(structure);
    if (multiplicationShell?.type !== "MULTIPLICATION") {
        return null;
    }

    return createMultiplicationReleaseDecision(multiplicationShell, targetVariable, options);
}

function findFractionDenominatorReleaseDecision(structure, targetVariable) {
    const divisionShell = getSingleVisibleRoot(structure);
    if (
        divisionShell?.type !== "DIVISION"
        || containsVisibleTargetInCollection(divisionShell.numerator, targetVariable)
        || !containsVisibleTargetInCollection(divisionShell.denominator, targetVariable)
        || !divisionShell.numerator.every((node) => isPassiveExpression(node, targetVariable))
    ) {
        return null;
    }

    const targetExpressionIds = collectSegmentIds(divisionShell.denominator);
    const passiveExpressionIds = collectSegmentIds(divisionShell.numerator);
    if (targetExpressionIds.length !== 1 || passiveExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(divisionShell, {
        family: "fraction_denominator_release",
        targetRole: "denominator",
        passiveRole: "numerator",
        targetExpressionIds,
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: targetExpressionIds[0],
        operatorId: divisionShell.operator?.id || null,
        inverseType: "MULTIPLICATION",
        action: "MOVE_DENOMINATOR_TARGET_TO_FACTOR",
        label: "Nennerziel zu Faktor",
        argumentScope: "whole_opposite_side"
    });
}

function findFractionCollapseDecision(structure, targetVariable) {
    const divisionShell = getSingleVisibleRoot(structure);
    if (
        divisionShell?.type !== "DIVISION"
        || !containsVisibleTargetInCollection(divisionShell.numerator, targetVariable)
        || containsVisibleTargetInCollection(divisionShell.denominator, targetVariable)
        || !divisionShell.denominator.every((node) => isPassiveExpression(node, targetVariable))
    ) {
        return null;
    }

    const targetExpressionIds = collectSegmentIds(divisionShell.numerator);
    const passiveExpressionIds = collectSegmentIds(divisionShell.denominator);
    if (targetExpressionIds.length !== 1 || passiveExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(divisionShell, {
        family: "fraction_collapse",
        targetRole: "numerator",
        passiveRole: "denominator",
        targetExpressionIds,
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        operatorId: divisionShell.operator?.id || null,
        inverseType: "MULTIPLICATION",
        action: "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR",
        label: "Nennerausdruck zu Faktor",
        argumentScope: "whole_opposite_side"
    });
}

function findFunctionDecision(structure, targetVariable, predicate, getMeta, family) {
    const functionShell = getSingleVisibleRoot(structure);
    if (
        functionShell?.type !== "FUNCTION"
        || !predicate(functionShell.name)
        || !containsVisibleTargetNode(functionShell, targetVariable)
    ) {
        return null;
    }

    const meta = getMeta(functionShell);
    const targetExpressionIds = collectSegmentIds(functionShell.content);
    if (!meta || targetExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(functionShell, {
        family,
        targetRole: "content",
        targetExpressionIds,
        sourceName: functionShell.name,
        ...meta,
        argumentScope: "whole_opposite_side"
    });
}

function findTrigInverseDecision(structure, targetVariable) {
    return findFunctionDecision(
        structure,
        targetVariable,
        isTrigonometricSourceFunction,
        (shell) => {
            const meta = getTrigInverseMeta(shell.name);
            return meta && { ...meta, inverseType: "FUNCTION" };
        },
        "trig_inverse"
    );
}

function findInverseTrigDecision(structure, targetVariable) {
    return findFunctionDecision(
        structure,
        targetVariable,
        isInverseTrigonometricSourceFunction,
        (shell) => {
            const meta = getInverseTrigMeta(shell.name);
            return meta && { ...meta, inverseType: "FUNCTION" };
        },
        "inverse_trig"
    );
}

function findLogInverseDecision(structure, targetVariable) {
    return findFunctionDecision(
        structure,
        targetVariable,
        isLogarithmicSourceFunction,
        (shell) => {
            const meta = getLogInverseMeta(shell.name, shell.baseContent);
            return meta && { ...meta, inverseType: "POWER" };
        },
        "log_inverse"
    );
}

function findPowerExponentReleaseDecision(structure, targetVariable) {
    const powerShell = getSingleVisibleRoot(structure);
    if (
        powerShell?.type !== "POWER"
        || hasNumericExponent(powerShell)
        || !containsVisibleTargetInCollection(powerShell.exponentNodes, targetVariable)
        || containsVisibleTargetInCollection(powerShell.content, targetVariable)
        || !powerShell.content.every((node) => isPassiveExpression(node, targetVariable))
    ) {
        return null;
    }

    const targetExpressionIds = collectSegmentIds(powerShell.exponentNodes);
    const passiveExpressionIds = collectSegmentIds(powerShell.content);
    if (targetExpressionIds.length !== 1 || passiveExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(powerShell, {
        family: "power_exponent_release",
        targetRole: "exponentNodes",
        passiveRole: "content",
        targetExpressionIds,
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        inverseType: "FUNCTION",
        inverseName: resolvePowerExponentInverseName(powerShell.content),
        action: "MOVE_POWER_EXPONENT_TO_BASE_LOG_FUNCTION",
        label: "Exponent logarithmisch freilegen",
        argumentScope: "whole_opposite_side"
    });
}

function findPowerBaseReleaseDecision(structure, targetVariable) {
    const powerShell = getSingleVisibleRoot(structure);
    if (
        powerShell?.type !== "POWER"
        || hasNumericExponent(powerShell)
        || !containsVisibleTargetInCollection(powerShell.content, targetVariable)
        || containsVisibleTargetInCollection(powerShell.exponentNodes, targetVariable)
        || !powerShell.exponentNodes.every((node) => isPassiveExpression(node, targetVariable))
    ) {
        return null;
    }

    const targetExpressionIds = collectSegmentIds(powerShell.content);
    const passiveExpressionIds = collectSegmentIds(powerShell.exponentNodes);
    if (targetExpressionIds.length !== 1 || passiveExpressionIds.length !== 1) {
        return null;
    }

    return shellDecision(powerShell, {
        family: "power_base_release",
        targetRole: "content",
        passiveRole: "exponentNodes",
        targetExpressionIds,
        passiveExpressionId: passiveExpressionIds[0],
        passiveExpressionIds,
        factorId: passiveExpressionIds[0],
        inverseType: "POWER",
        action: "MOVE_POWER_BASE_TO_RECIPROCAL_EXPONENT",
        label: "Potenzbasis freilegen",
        argumentScope: "whole_opposite_side"
    });
}

function findRootPowerDecision(structure, targetVariable) {
    const outerShell = getSingleVisibleRoot(structure);
    if (!outerShell || !["ROOT", "POWER"].includes(outerShell.type)) {
        return null;
    }

    if (
        outerShell.type === "POWER"
        && (!hasNumericExponent(outerShell) || !containsVisibleTargetInCollection(outerShell.content, targetVariable))
    ) {
        return null;
    }

    if (outerShell.type === "ROOT" && !containsVisibleTargetNode(outerShell, targetVariable)) {
        return null;
    }

    const inverseType = outerShell.type === "ROOT" ? "POWER" : "ROOT";
    return shellDecision(outerShell, {
        family: "root_power",
        targetRole: "content",
        targetExpressionIds: collectSegmentIds(outerShell.content),
        inverseType,
        action: outerShell.type === "ROOT" ? "INVERT_TO_POWER" : "INVERT_TO_ROOT",
        label: outerShell.type === "ROOT" ? "Wurzel knacken" : "Potenz knacken",
        inversionDegree: outerShell.type === "ROOT"
            ? (outerShell.degree || 2)
            : (outerShell.exponent || 2),
        argumentScope: "whole_opposite_side"
    });
}

function findNextRuntimeDecision(structure, targetVariable, options = {}) {
    return findGroupReleaseDecision(structure, targetVariable)
        || findNegativeMultiplicationDecision(structure, targetVariable, options)
        || findNegativeSignReleaseDecision(structure, targetVariable)
        || findAdditionReleaseDecision(structure, targetVariable)
        || findSubtractionReleaseDecision(structure, targetVariable)
        || findSubtrahendReleaseDecision(structure, targetVariable)
        || findFractionBirthDecision(structure, targetVariable, options)
        || findFractionDenominatorReleaseDecision(structure, targetVariable)
        || findFractionCollapseDecision(structure, targetVariable)
        || findTrigInverseDecision(structure, targetVariable)
        || findInverseTrigDecision(structure, targetVariable)
        || findLogInverseDecision(structure, targetVariable)
        || findPowerExponentReleaseDecision(structure, targetVariable)
        || findPowerBaseReleaseDecision(structure, targetVariable)
        || findRootPowerDecision(structure, targetVariable)
        || null;
}

function resolveRuntimeActiveBoundary(structure, targetVariable) {
    return detectTargetInDenominatorBoundary(structure, targetVariable)
        || detectTargetInPowerBoundary(structure, targetVariable)
        || analyzeRuntimeEquationSide(structure, targetVariable);
}

export {
    findSubtractedSumReleaseDecision,
    findNextRuntimeDecision,
    resolveRuntimeActiveBoundary
};
