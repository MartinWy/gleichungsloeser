import { cloneRuntimeValue } from '../runtimeClone.js';
import { collectVisibleNodes, markNodesEmerged, markNodesHidden } from './transformationMarkers.js';
import {
    buildGeneratedAdditiveShell,
    buildGeneratedBasedLogFunctionShell,
    buildGeneratedCollectionShell,
    buildGeneratedDivisionShell,
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
    collectVisibleLeafIdsFromNodes
} from './generatedShells.js';
import {
    createEquationRewriteContext,
    rebuildRuntimeEquation,
    resolveOppositeEquationSide
} from './rewriteEquation.js';

function findNodeById(nodes, nodeId) {
    return (nodes || []).find((node) => node?.id === nodeId) || null;
}

function releaseVisibleSegment(segment = []) {
    const releasedSegment = cloneRuntimeValue(
        (segment || []).filter((node) => node?.isVisible !== false)
    );

    markNodesEmerged(releasedSegment);
    return releasedSegment;
}

function appendReleasedSequence(activeSide = [], hiddenNode, releasedContent = []) {
    return [
        ...activeSide,
        hiddenNode,
        ...releasedContent
    ];
}

function buildReleasedSideWithReplacement(activeSide = [], targetId, releasedContent = []) {
    return (activeSide || []).reduce((result, node) => {
        if (node?.id === targetId) {
            return appendReleasedSequence(result, node, releasedContent);
        }

        result.push(node);
        return result;
    }, []);
}

function findVisibleOperatorContext(activeSide = [], operatorId = null) {
    const visibleActiveSide = collectVisibleNodes(activeSide);
    const visibleOperatorIndex = visibleActiveSide.findIndex((node) => node?.id === operatorId);
    const originalOperatorIndex = activeSide.findIndex((node) => node?.id === operatorId && node?.isVisible !== false);

    return {
        visibleActiveSide,
        visibleOperatorIndex,
        originalOperatorIndex
    };
}

function buildHiddenOppositeSideWithGeneratedShell(oppositeSide = [], generatedShell) {
    const visibleOppositeNodes = collectVisibleNodes(oppositeSide);
    markNodesHidden(visibleOppositeNodes);

    return [...oppositeSide, generatedShell];
}

function buildFractionBirthOppositeShell(oppositeSide = [], passiveSnapshot = [], decision, options = {}) {
    const reciprocalDivision = passiveSnapshot.length === 1
        ? resolveSingleBoundDivision(passiveSnapshot[0])
        : null;
    const reciprocalFactorMode = decision?.inverseMode === "reciprocal_factor"
        && reciprocalDivision?.id === decision?.reciprocalDivisionId;

    if (reciprocalFactorMode) {
        const reciprocalDivisionShell = buildGeneratedReciprocalDivisionShell(
            reciprocalDivision,
            decision,
            {
                fractionColumnMode: options.fractionColumnMode,
                sharedDenominatorAnchorLeafIds: options.sharedDenominatorAnchorLeafIds
            }
        );

        return buildGeneratedMultiplicationShell(
            oppositeSide,
            [reciprocalDivisionShell],
            decision,
            {
                ...options,
                label: "Mit Kehrbruch multiplizieren"
            }
        );
    }

    return buildGeneratedDivisionShell(oppositeSide, passiveSnapshot, decision, options);
}

function resolveSingleBoundDivision(node = null) {
    let current = node;

    while (current?.type === "GROUP") {
        const contentRoots = collectVisibleNodes(current.content || []);
        if (contentRoots.length !== 1) {
            return null;
        }

        [current] = contentRoots;
    }

    return current?.type === "DIVISION" ? current : null;
}

function buildPassiveFactorTransportSnapshot(passiveNodes = [], decision, options = {}) {
    const visiblePassiveNodes = cloneRuntimeValue(
        (passiveNodes || []).filter((node) => node?.isVisible !== false)
    );

    if (visiblePassiveNodes.length <= 1) {
        return visiblePassiveNodes;
    }

    return [
        buildGeneratedMultiplicationShell(
            [visiblePassiveNodes[0]],
            visiblePassiveNodes.slice(1),
            decision,
            {
                id: options.id || buildGeneratedIdForPassiveProduct(decision, options),
                originId: options.originId || `${buildOriginPart(decision)}-passive-factor-block`,
                originSourceType: options.originSourceType || "MULTIPLICATION",
                label: options.label || "Passiven Faktorblock als Produkt erhalten",
                factorOrderMode: "preserve_input_order"
            }
        )
    ];
}

function buildGeneratedIdForPassiveProduct(decision, options = {}) {
    const origin = options.originId || `${buildOriginPart(decision)}-passive-factor-block`;
    return `generated-${decision.family}-multiplication-from-${String(origin).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function hasRuntimeChildCollections(node) {
    if (!node || typeof node !== "object") {
        return false;
    }

    return [
        "content",
        "baseContent",
        "degreeNodes",
        "exponentNodes",
        "numerator",
        "denominator",
        "factors",
        "operators",
        "terms",
        "minuend",
        "subtrahend",
        "factor",
        "passive"
    ].some((key) => Array.isArray(node[key]));
}

function buildClosedTransportSegment(nodes = [], decision, options = {}) {
    const visibleNodes = cloneRuntimeValue(
        (nodes || []).filter((node) => node?.isVisible !== false)
    );

    if (visibleNodes.length === 0) {
        return [];
    }

    if (visibleNodes.length === 1) {
        return visibleNodes;
    }

    return [
        buildGeneratedCollectionShell(
            visibleNodes,
            decision,
            {
                originId: options.originId,
                originSourceType: options.originSourceType,
                label: options.label,
                transportSourceShellId: options.transportSourceShellId || null,
                transportLeafIds: collectVisibleLeafIdsFromNodes(visibleNodes)
            }
        )
    ];
}

function applyGroupReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const groupShell = findNodeById(context.activeSide, decision.targetId);

    if (!groupShell || groupShell.type !== "GROUP") {
        throw new Error(`[GenesisRuntime:P3] group_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const releasedContent = releaseVisibleSegment(groupShell.content || []);
    markNodesHidden([groupShell], "group_shell");
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedContent);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, context.oppositeSide),
        activeSide,
        oppositeSide: context.oppositeSide
    };
}

function applyNegativeSignReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const negationShell = findNodeById(context.activeSide, decision.targetId);

    if (!negationShell || negationShell.type !== "NEGATION") {
        throw new Error(`[GenesisRuntime:P3] negative_sign_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const releasedContent = releaseVisibleSegment(negationShell.content || []);
    markNodesHidden([negationShell], "negation_shell");

    const generatedNegation = buildGeneratedNegationShell(context.oppositeSide, decision);
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedContent);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedNegation);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyFunctionInverseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const functionShell = findNodeById(context.activeSide, decision.targetId);

    if (!functionShell || functionShell.type !== "FUNCTION") {
        throw new Error(`[GenesisRuntime:P3] ${decision.family} konnte ${decision.targetId} nicht verifizieren.`);
    }

    const releasedContent = releaseVisibleSegment(functionShell.content || []);
    markNodesHidden([functionShell], "function_shell");

    const generatedFunction = buildGeneratedFunctionShell(context.oppositeSide, decision);
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedContent);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedFunction);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function createGeneratedLogBaseNodes(decision, functionShell) {
    const explicitBase = Array.isArray(functionShell?.baseContent)
        ? functionShell.baseContent.filter((node) => node?.isVisible !== false)
        : [];

    if (explicitBase.length > 0) {
        return explicitBase;
    }

    const baseText = String(decision?.inverseBaseText || "").trim();
    if (baseText.length === 0) {
        return [];
    }

    return [{
        id: `${decision.targetId || "generated-log-base"}::base::0`,
        type: /^\d+(?:\.\d+)?$/.test(baseText) ? "NUMBER" : "VARIABLE",
        value: baseText,
        isVisible: true
    }];
}

function applyLogInverseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const functionShell = findNodeById(context.activeSide, decision.targetId);

    if (!functionShell || functionShell.type !== "FUNCTION") {
        throw new Error(`[GenesisRuntime:P3] log_inverse konnte ${decision.targetId} nicht verifizieren.`);
    }

    const releasedContent = releaseVisibleSegment(functionShell.content || []);
    const generatedBaseNodes = createGeneratedLogBaseNodes(decision, functionShell);
    if (releasedContent.length === 0 || generatedBaseNodes.length === 0) {
        throw new Error("[GenesisRuntime:P3] log_inverse fand keine gueltigen Inhalte.");
    }

    markNodesHidden([functionShell], "function_shell");

    const generatedPower = buildGeneratedLogInversePowerShell(
        context.oppositeSide,
        generatedBaseNodes,
        decision
    );
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedContent);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedPower);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyRootPowerTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const outerShell = findNodeById(context.activeSide, decision.targetId);

    if (!outerShell || !["ROOT", "POWER"].includes(outerShell.type)) {
        throw new Error(`[GenesisRuntime:P3] root_power konnte ${decision.targetId} nicht verifizieren.`);
    }

    const releasedContent = releaseVisibleSegment(outerShell.content || []);
    markNodesHidden([outerShell], outerShell.type === "ROOT" ? "root_shell" : "power_shell");

    const generatedShell = buildGeneratedRootPowerShell(context.oppositeSide, decision);
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedContent);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedShell);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyPowerExponentReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const powerShell = findNodeById(context.activeSide, decision.targetId);

    if (!powerShell || powerShell.type !== "POWER") {
        throw new Error(`[GenesisRuntime:P3] power_exponent_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const baseNodes = Array.isArray(powerShell.content) ? powerShell.content : [];
    const releasedExponent = releaseVisibleSegment(powerShell.exponentNodes || []);
    if (baseNodes.length === 0 || releasedExponent.length === 0) {
        throw new Error("[GenesisRuntime:P3] power_exponent_release fand keine gueltigen Inhalte.");
    }

    markNodesHidden([powerShell], "power_shell");

    const generatedDivision = buildGeneratedBasedLogFunctionShell(context.oppositeSide, baseNodes, decision);
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedExponent);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedDivision);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyPowerBaseReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const powerShell = findNodeById(context.activeSide, decision.targetId);

    if (!powerShell || powerShell.type !== "POWER") {
        throw new Error(`[GenesisRuntime:P3] power_base_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const releasedBase = releaseVisibleSegment(powerShell.content || []);
    const exponentValue = powerShell.exponent;
    const exponentNodes = releaseVisibleSegment(powerShell.exponentNodes || []);
    if (releasedBase.length === 0 || exponentNodes.length === 0 || !exponentValue) {
        throw new Error("[GenesisRuntime:P3] power_base_release fand keine gueltigen Inhalte.");
    }

    markNodesHidden([powerShell], "power_shell");

    const generatedPower = buildGeneratedReciprocalPowerShell(
        context.oppositeSide,
        exponentValue,
        exponentNodes,
        decision
    );
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedBase);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedPower);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyAdditiveReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const sourceShell = findNodeById(context.activeSide, decision.targetId);
    if (!sourceShell || !["ADDITION", "SUBTRACTION"].includes(sourceShell.type)) {
        throw new Error(`[GenesisRuntime:P3] ${decision.family} konnte ${decision.targetId} nicht verifizieren.`);
    }

    const targetIds = decision.targetExpressionIds || [];
    const sourceTarget = sourceShell.type === "ADDITION"
        ? sourceShell.terms.filter((node) => targetIds.includes(node?.id))
        : sourceShell.minuend;
    const sourcePassive = sourceShell.type === "ADDITION"
        ? sourceShell.terms.filter((node) => !targetIds.includes(node?.id))
        : sourceShell.subtrahend;
    const targetSegment = releaseVisibleSegment(sourceTarget);
    const passiveSnapshot = buildPassiveAdditionSnapshot(sourcePassive, sourceShell, decision);

    if (targetSegment.length !== 1 || passiveSnapshot.length !== 1) {
        throw new Error(`[GenesisRuntime:P3] ${decision.family} fand keine eindeutigen Schalenrollen.`);
    }

    markNodesHidden([sourceShell], `${sourceShell.type.toLowerCase()}_shell`);

    const boundPassiveSnapshot = bindCompositeSubtrahend(
        passiveSnapshot,
        decision,
        sourceShell.type
    );
    const generatedShell = buildGeneratedAdditiveShell(context.oppositeSide, boundPassiveSnapshot, decision, {
        generatedSide: resolveOppositeEquationSide(context.equationSide)
    });
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedShell);
    const activeSide = buildReleasedSideWithReplacement(
        context.activeSide,
        decision.targetId,
        targetSegment
    );

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function bindCompositeSubtrahend(passiveSnapshot = [], decision, sourceType = null) {
    return ["ADDITION", "SUBTRACTION"].includes(passiveSnapshot[0]?.type)
        ? [buildGeneratedGroupShell(passiveSnapshot, decision, {
            originId: `${decision.targetId}-subtrahend-group`,
            originSourceType: sourceType || decision.sourceType,
            label: "Additiven Subtrahenden binden"
        })]
        : passiveSnapshot;
}

function buildPassiveAdditionSnapshot(sourcePassive, sourceShell, decision) {
    const passiveRoots = cloneRuntimeValue(sourcePassive || []);
    if (passiveRoots.length <= 1) {
        return passiveRoots;
    }

    return [{
        id: `generated-${decision.family}-addition-from-${decision.targetId}-passive`,
        type: "ADDITION",
        isVisible: true,
        isGenerated: true,
        terms: passiveRoots,
        operators: passiveRoots.slice(1).map((_, index) => (
            buildGeneratedOperator(decision, "+", "passive-addition", index, sourceShell.id)
        )),
        originTargetId: decision.targetId,
        originTargetExpressionIds: decision.targetExpressionIds,
        originSourceType: sourceShell.type,
        generatedByFamily: decision.family,
        generatedByAction: decision.action
    }];
}

function applySubtrahendReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const subtractionShell = findNodeById(context.activeSide, decision.targetId);
    if (!subtractionShell || subtractionShell.type !== "SUBTRACTION") {
        throw new Error(`[GenesisRuntime:P3] subtrahend_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const passiveSnapshot = cloneVisibleExpressionSnapshot(subtractionShell.minuend || []);
    const targetSnapshot = releaseVisibleSegment(subtractionShell.subtrahend || []);
    if (passiveSnapshot.length !== 1 || targetSnapshot.length !== 1) {
        throw new Error("[GenesisRuntime:P3] subtrahend_release fand keine eindeutigen Schalenrollen.");
    }

    markNodesHidden([subtractionShell], "subtraction_shell");

    const generatedActiveNegation = buildGeneratedNegationShell(targetSnapshot, decision, {
        contentNodes: targetSnapshot,
        originId: decision.targetId,
        label: "Negation freilegen"
    });
    const boundPassiveSnapshot = bindCompositeSubtrahend(
        passiveSnapshot,
        decision,
        subtractionShell.type
    );
    const generatedOppositeSubtraction = buildGeneratedAdditiveShell(
        context.oppositeSide,
        boundPassiveSnapshot,
        decision,
        {
            generatedSide: resolveOppositeEquationSide(context.equationSide)
        }
    );
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(
        context.oppositeSide,
        generatedOppositeSubtraction
    );
    const activeSide = buildReleasedSideWithReplacement(
        context.activeSide,
        decision.targetId,
        [generatedActiveNegation]
    );

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function buildDistributedSubtractionShell({
    minuendNodes,
    summandNodes,
    firstOperator,
    decision
}) {
    let currentMinuend = cloneVisibleExpressionSnapshot(minuendNodes);

    summandNodes.forEach((summand, index) => {
        const operator = index === 0
            ? cloneRuntimeValue(firstOperator)
            : buildGeneratedOperator(
                decision,
                "-",
                "distributed-subtraction",
                index,
                decision.additionId
            );

        currentMinuend = [{
            id: buildGeneratedIdFromParts(
                decision.family,
                `SUBTRACTION-${index}`,
                decision.targetId
            ),
            type: "SUBTRACTION",
            isVisible: true,
            label: decision.label,
            minuend: currentMinuend,
            operator,
            subtrahend: cloneVisibleExpressionSnapshot([summand]),
            isGenerated: true,
            originTargetId: decision.targetId,
            originTargetExpressionIds: decision.targetExpressionIds,
            originSourceType: decision.sourceType,
            generatedByFamily: decision.family,
            generatedByAction: decision.action,
            argumentScope: decision.argumentScope
        }];
    });

    return currentMinuend[0] || null;
}

function applySubtractedSumReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const subtractionShell = findNodeById(context.activeSide, decision.targetId);

    if (!subtractionShell || subtractionShell.type !== "SUBTRACTION") {
        throw new Error(`[GenesisRuntime:P3] subtracted_sum_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const groupShell = findNodeById(subtractionShell.subtrahend, decision.groupId);
    const additionShell = findNodeById(groupShell?.content, decision.additionId);
    const visibleSummands = collectVisibleNodes(additionShell?.terms || []);
    const visibleOperators = collectVisibleNodes(additionShell?.operators || []);
    const visibleMinuend = collectVisibleNodes(subtractionShell.minuend || []);

    if (
        groupShell?.type !== "GROUP"
        || additionShell?.type !== "ADDITION"
        || visibleMinuend.length !== 1
        || visibleSummands.length < 2
        || visibleOperators.length !== visibleSummands.length - 1
        || !visibleOperators.every((operator) => operator?.value === "+")
        || visibleSummands.map((node) => node.id).join("|") !== (decision.summandExpressionIds || []).join("|")
    ) {
        throw new Error("[GenesisRuntime:P3] subtracted_sum_release erhielt keine eindeutige gruppierte Summe.");
    }

    const firstOperator = releaseVisibleSegment([subtractionShell.operator])[0];
    const distributedShell = buildDistributedSubtractionShell({
        minuendNodes: visibleMinuend,
        summandNodes: visibleSummands,
        firstOperator,
        decision
    });

    if (!distributedShell) {
        throw new Error("[GenesisRuntime:P3] subtracted_sum_release konnte keine Folgestruktur bilden.");
    }

    markNodesHidden([subtractionShell], "subtracted_sum_shell");
    const activeSide = buildReleasedSideWithReplacement(
        context.activeSide,
        decision.targetId,
        [distributedShell]
    );

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, context.oppositeSide),
        activeSide,
        oppositeSide: context.oppositeSide
    };
}

function applyMultiplicationShellFractionBirth(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const multiplicationShell = findNodeById(context.activeSide, decision.targetId);

    if (!multiplicationShell || multiplicationShell.type !== "MULTIPLICATION") {
        throw new Error(`[GenesisRuntime:P3] fraction_birth konnte ${decision.targetId} nicht als MULTIPLICATION lesen.`);
    }

    const targetIds = decision.targetExpressionIds || [];
    const targetFactors = (multiplicationShell.factors || []).filter((node) => targetIds.includes(node?.id));
    const passiveFactors = (multiplicationShell.factors || []).filter((node) => !targetIds.includes(node?.id));
    const releasedTarget = releaseVisibleSegment(targetFactors);
    const passiveSnapshot = buildPassiveFactorTransportSnapshot(
        passiveFactors,
        decision,
        {
            transportSourceShellId: multiplicationShell.id
        }
    );

    if (releasedTarget.length !== 1 || passiveSnapshot.length !== 1) {
        throw new Error("[GenesisRuntime:P3] fraction_birth fand in der Multiplikationsschale keine gueltigen Inhalte.");
    }

    markNodesHidden([multiplicationShell], "multiplication_shell");

    const generatedOppositeShell = buildFractionBirthOppositeShell(
        context.oppositeSide,
        passiveSnapshot,
        decision,
        { generatedSide: resolveOppositeEquationSide(context.equationSide) }
    );
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.targetId, releasedTarget);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedOppositeShell);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyWrappedNegationFractionBirth(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const negationShell = findNodeById(context.activeSide, decision.containerTargetId);

    if (!negationShell || negationShell.type !== "NEGATION") {
        throw new Error(`[GenesisRuntime:P3] fraction_birth konnte ${decision.containerTargetId} nicht als NEGATION lesen.`);
    }

    const multiplicationShell = findNodeById(negationShell.content, decision.targetId);
    if (!multiplicationShell || multiplicationShell.type !== "MULTIPLICATION") {
        throw new Error(`[GenesisRuntime:P3] fraction_birth konnte ${decision.targetId} nicht als MULTIPLICATION in der NEGATION lesen.`);
    }

    const targetIds = decision.targetExpressionIds || [];
    const targetSnapshot = multiplicationShell.factors.filter((node) => targetIds.includes(node?.id));
    const passiveNodes = multiplicationShell.factors.filter((node) => !targetIds.includes(node?.id));
    const releasedTarget = releaseVisibleSegment(targetSnapshot);

    if (passiveNodes.length === 0 || releasedTarget.length !== 1) {
        throw new Error("[GenesisRuntime:P3] fraction_birth fand in der negativen Huelle keine gueltigen Inhalte.");
    }

    markNodesHidden([negationShell], "negation_shell");

    const passiveSnapshot = buildPassiveFactorTransportSnapshot(
        passiveNodes,
        decision,
        {
            transportSourceShellId: negationShell.id
        }
    );

    const negativePassiveShell = buildGeneratedNegationShell(passiveSnapshot, decision, {
        contentNodes: passiveSnapshot,
        originId: `${buildOriginPart(decision)}-negative-factor-block`,
        originSourceType: "MULTIPLICATION",
        label: "Negativen Faktorblock teilen"
    });
    const generatedOppositeShell = buildFractionBirthOppositeShell(
        context.oppositeSide,
        [negativePassiveShell],
        decision,
        { generatedSide: resolveOppositeEquationSide(context.equationSide) }
    );
    const activeSide = buildReleasedSideWithReplacement(context.activeSide, decision.containerTargetId, releasedTarget);
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedOppositeShell);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyFractionBirthTransformation(structure, decision, sideAnalysis) {
    if (decision?.wrappedByNegation === true && decision?.containerTargetId) {
        return applyWrappedNegationFractionBirth(structure, decision, sideAnalysis);
    }

    return applyMultiplicationShellFractionBirth(structure, decision, sideAnalysis);
}

function applyFractionDenominatorReleaseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const divisionShell = findNodeById(context.activeSide, decision.targetId);

    if (!divisionShell || divisionShell.type !== "DIVISION") {
        throw new Error(`[GenesisRuntime:P3] fraction_denominator_release konnte ${decision.targetId} nicht verifizieren.`);
    }

    const factorSnapshot = cloneRuntimeValue(divisionShell.denominator || []);
    const transportedNumeratorNodes = releaseVisibleSegment(
        divisionShell.numerator || []
    );

    if (factorSnapshot.length === 0 || transportedNumeratorNodes.length === 0) {
        throw new Error("[GenesisRuntime:P3] fraction_denominator_release fand keine gueltigen Sammlungen.");
    }

    markNodesHidden([divisionShell], "division_shell");

    const generatedMultiplication = buildGeneratedMultiplicationShell(
        context.oppositeSide,
        factorSnapshot,
        decision,
        { generatedSide: resolveOppositeEquationSide(context.equationSide) }
    );
    const activeSide = buildReleasedSideWithReplacement(
        context.activeSide,
        decision.targetId,
        transportedNumeratorNodes
    );
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedMultiplication);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyFractionCollapseTransformation(structure, decision, sideAnalysis) {
    const clonedStructure = cloneRuntimeValue(structure);
    const context = createEquationRewriteContext(clonedStructure, decision, sideAnalysis);
    const divisionShell = findNodeById(context.activeSide, decision.targetId);

    if (!divisionShell || divisionShell.type !== "DIVISION") {
        throw new Error(`[GenesisRuntime:P3] fraction_collapse konnte ${decision.targetId} nicht verifizieren.`);
    }

    const passiveSnapshot = cloneRuntimeValue(divisionShell.denominator || []);
    const visibleNumeratorNodes = releaseVisibleSegment(
        divisionShell.numerator || []
    );

    if (passiveSnapshot.length === 0 || visibleNumeratorNodes.length === 0) {
        throw new Error("[GenesisRuntime:P3] fraction_collapse fand keine gueltigen Sammlungen.");
    }

    const transportedNumeratorNodes = buildClosedTransportSegment(visibleNumeratorNodes, decision, {
        originId: `${buildOriginPart(decision)}-transported-numerator`,
        originSourceType: "DIVISION",
        label: "Zaehler unveraendert weiterreichen",
        transportSourceShellId: divisionShell.id
    });

    markNodesHidden([divisionShell], "division_shell");

    const generatedMultiplication = buildGeneratedMultiplicationShell(
        context.oppositeSide,
        passiveSnapshot,
        decision,
        { generatedSide: resolveOppositeEquationSide(context.equationSide) }
    );
    const activeSide = buildReleasedSideWithReplacement(
        context.activeSide,
        decision.targetId,
        transportedNumeratorNodes
    );
    const oppositeSide = buildHiddenOppositeSideWithGeneratedShell(context.oppositeSide, generatedMultiplication);

    return {
        nextStructure: rebuildRuntimeEquation(context, activeSide, oppositeSide),
        activeSide,
        oppositeSide
    };
}

function applyShellFamilyTransformation(structure, decision, sideAnalysis) {
    switch (decision?.family) {
        case "group_release":
            return applyGroupReleaseTransformation(structure, decision, sideAnalysis);
        case "negative_sign_release":
            return applyNegativeSignReleaseTransformation(structure, decision, sideAnalysis);
        case "addition_release":
        case "subtraction_release":
            return applyAdditiveReleaseTransformation(structure, decision, sideAnalysis);
        case "subtrahend_release":
            return applySubtrahendReleaseTransformation(structure, decision, sideAnalysis);
        case "subtracted_sum_release":
            return applySubtractedSumReleaseTransformation(structure, decision, sideAnalysis);
        case "trig_inverse":
        case "inverse_trig":
            return applyFunctionInverseTransformation(structure, decision, sideAnalysis);
        case "log_inverse":
            return applyLogInverseTransformation(structure, decision, sideAnalysis);
        case "power_exponent_release":
            return applyPowerExponentReleaseTransformation(structure, decision, sideAnalysis);
        case "power_base_release":
            return applyPowerBaseReleaseTransformation(structure, decision, sideAnalysis);
        case "root_power":
            return applyRootPowerTransformation(structure, decision, sideAnalysis);
        case "fraction_birth":
            return applyFractionBirthTransformation(structure, decision, sideAnalysis);
        case "fraction_denominator_release":
            return applyFractionDenominatorReleaseTransformation(structure, decision, sideAnalysis);
        case "fraction_collapse":
            return applyFractionCollapseTransformation(structure, decision, sideAnalysis);
        default:
            return null;
    }
}

export {
    applyShellFamilyTransformation
};
