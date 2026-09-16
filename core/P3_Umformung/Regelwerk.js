import { resolveGeneratedMultiplicationFlowDirection } from "./Konfiguration.js";
import { normalizeEquationOuterGroups } from "../shared/redundantOuterGroups.js";

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function sanitizeIdPart(value) {
    return String(value || "missing-origin").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildOriginPart(entscheidung) {
    if (Array.isArray(entscheidung.passiveExpressionIds) && entscheidung.passiveExpressionIds.length > 0) {
        return entscheidung.passiveExpressionIds.join("__");
    }

    return entscheidung.passiveExpressionId || entscheidung.factorId || entscheidung.targetId || "missing-origin";
}

function buildGeneratedIdFromParts(family, inverseType, origin) {
    const familyPart = sanitizeIdPart(family || "unknown-family");
    const inversePart = sanitizeIdPart((inverseType || "shell").toLowerCase());
    const originPart = sanitizeIdPart(origin || "missing-origin");

    return `generated-${familyPart}-${inversePart}-from-${originPart}`;
}

function buildGeneratedId(entscheidung) {
    return buildGeneratedIdFromParts(
        entscheidung.family || "unknown-family",
        entscheidung.inverseType || "shell",
        buildOriginPart(entscheidung)
    );
}

function resolveEquationSide(entscheidung) {
    return entscheidung?.equationSide === "right" ? "right" : "left";
}

function getEquationContext(clonedStruktur, entscheidung) {
    const gleichIndex = clonedStruktur.findIndex((element) => element.value === "=");
    if (gleichIndex === -1) {
        return null;
    }

    const links = clonedStruktur.slice(0, gleichIndex);
    const rechts = clonedStruktur.slice(gleichIndex + 1);
    const equationSide = resolveEquationSide(entscheidung);

    return {
        equationSide,
        anchor: clonedStruktur[gleichIndex],
        activeSide: equationSide === "right" ? rechts : links,
        oppositeSide: equationSide === "right" ? links : rechts
    };
}

function rebuildEquation(context, activeSide, oppositeSide) {
    if (context.equationSide === "right") {
        return [...oppositeSide, context.anchor, ...activeSide];
    }

    return [...activeSide, context.anchor, ...oppositeSide];
}

function appendReleasedSequence(neueActiveSide, hiddenElement, releasedContent, equationSide) {
    neueActiveSide.push(hiddenElement, ...releasedContent);
}

function cloneVisibleExpressionSnapshot(segment = []) {
    return clone((segment || []).filter((element) => element?.isVisible !== false));
}

function buildGeneratedFunctionShell(oppositeSide, entscheidung) {
    return {
        id: buildGeneratedId(entscheidung),
        type: "FUNCTION",
        name: entscheidung.inverseName,
        isVisible: true,
        isGenerated: true,
        label: entscheidung.label,
        content: cloneVisibleExpressionSnapshot(oppositeSide),
        originTargetId: entscheidung.targetId,
        originTargetExpressionIds: entscheidung.targetExpressionIds || [entscheidung.targetId],
        originSourceType: entscheidung.sourceType,
        originSourceName: entscheidung.sourceName,
        inverseName: entscheidung.inverseName,
        generatedByFamily: entscheidung.family,
        generatedByAction: entscheidung.action,
        argumentScope: entscheidung.argumentScope || "whole_opposite_side"
    };
}


function buildNegationShell(contentSnapshot, entscheidung, options = {}) {
    const originId = options.originId || entscheidung.targetId || buildOriginPart(entscheidung);
    return {
        id: options.id || buildGeneratedIdFromParts(entscheidung.family, options.inverseType || "NEGATION", originId),
        type: "NEGATION",
        sign: "-",
        isVisible: true,
        isGenerated: true,
        label: options.label || entscheidung.label,
        content: cloneVisibleExpressionSnapshot(contentSnapshot),
        originTargetId: entscheidung.targetId,
        originTargetExpressionIds: entscheidung.targetExpressionIds || [entscheidung.targetId],
        originSourceType: options.originSourceType || entscheidung.sourceType,
        generatedByFamily: entscheidung.family,
        generatedByAction: entscheidung.action,
        argumentScope: entscheidung.argumentScope || "whole_opposite_side"
    };
}

function buildRootPowerShell(targetSchale, oppositeSide, entscheidung) {
    const inverseId = buildGeneratedId(entscheidung);
    const baseShell = {
        id: inverseId,
        type: entscheidung.inverseType,
        isVisible: true,
        isGenerated: true,
        originTargetId: entscheidung.targetId,
        originTargetExpressionIds: entscheidung.targetExpressionIds || [entscheidung.targetId],
        originSourceType: entscheidung.sourceType,
        generatedByFamily: entscheidung.family,
        generatedByAction: entscheidung.action,
        argumentScope: entscheidung.argumentScope || "whole_opposite_side",
        content: cloneVisibleExpressionSnapshot(oppositeSide)
    };

    if (entscheidung.inverseType === "POWER") {
        return {
            ...baseShell,
            exponent: entscheidung.inversionDegree || targetSchale.degree || 2,
            label: "Quadrieren"
        };
    }

    return {
        ...baseShell,
        degree: entscheidung.inversionDegree || targetSchale.exponent || 2,
        label: "Wurzel ziehen"
    };
}

function buildDivisionShell(oppositeSide, passiveExpressionSnapshot, entscheidung) {
    const passiveExpressionId = entscheidung.passiveExpressionId || entscheidung.factorId;
    const passiveExpressionIds = entscheidung.passiveExpressionIds || [passiveExpressionId];

    return {
        id: buildGeneratedId(entscheidung),
        type: "DIVISION",
        isVisible: true,
        isGenerated: true,
        label: "Durch Ausdruck teilen",
        numerator: cloneVisibleExpressionSnapshot(oppositeSide),
        denominator: clone(passiveExpressionSnapshot).map((element) => ({
            ...element,
            isVisible: true,
            position: "denominator"
        })),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId,
        originTargetId: entscheidung.targetId,
        originTargetExpressionIds: entscheidung.targetExpressionIds || [entscheidung.targetId],
        originSourceType: entscheidung.sourceType,
        generatedByFamily: entscheidung.family,
        generatedByAction: entscheidung.action,
        argumentScope: entscheidung.argumentScope || "whole_opposite_side"
    };
}

function buildMultiplicationShell(oppositeSide, passiveExpressionSnapshot, entscheidung, options = {}) {
    const passiveExpressionId = entscheidung.passiveExpressionId || entscheidung.factorId;
    const passiveExpressionIds = entscheidung.passiveExpressionIds || [passiveExpressionId];

    return {
        id: buildGeneratedId(entscheidung),
        type: "MULTIPLICATION",
        isVisible: true,
        isGenerated: true,
        label: "Mit Nennerausdruck multiplizieren",
        content: cloneVisibleExpressionSnapshot(oppositeSide),
        factor: clone(passiveExpressionSnapshot).map((element) => ({
            ...element,
            isVisible: true,
            position: "factor"
        })),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId,
        originTargetId: entscheidung.targetId,
        originTargetExpressionIds: entscheidung.targetExpressionIds || [entscheidung.targetId],
        originSourceType: entscheidung.sourceType,
        generatedByFamily: entscheidung.family,
        generatedByAction: entscheidung.action,
        argumentScope: entscheidung.argumentScope || "whole_opposite_side",
        flowDirection: resolveGeneratedMultiplicationFlowDirection(entscheidung, options)
    };
}

function buildAdditiveShell(oppositeSide, passiveExpressionSnapshot, entscheidung) {
    const passiveExpressionId = entscheidung.passiveExpressionId || entscheidung.factorId;
    const passiveExpressionIds = entscheidung.passiveExpressionIds || [passiveExpressionId];
    const inverseType = entscheidung.inverseType;
    const label = inverseType === "SUBTRACTION" ? "Ausdruck subtrahieren" : "Ausdruck addieren";

    return {
        id: buildGeneratedId(entscheidung),
        type: inverseType,
        isVisible: true,
        isGenerated: true,
        label,
        content: cloneVisibleExpressionSnapshot(oppositeSide),
        passive: clone(passiveExpressionSnapshot).map((element) => ({
            ...element,
            isVisible: true,
            position: "passive"
        })),
        originPassiveExpressionId: passiveExpressionId,
        originPassiveExpressionIds: passiveExpressionIds,
        originFactorId: passiveExpressionId,
        originTargetId: entscheidung.targetId,
        originTargetExpressionIds: entscheidung.targetExpressionIds || [entscheidung.targetId],
        originSourceType: entscheidung.sourceType,
        generatedByFamily: entscheidung.family,
        generatedByAction: entscheidung.action,
        argumentScope: entscheidung.argumentScope || "whole_opposite_side"
    };
}

function markSegmentAsEmerged(segment) {
    segment.forEach((element) => {
        element.isBefreit = true;
    });
}

function collectVisibleActiveSide(activeSide = []) {
    return (activeSide || []).filter((element) => element?.isVisible !== false);
}

function findVisibleOperatorContext(activeSide = [], operatorId = null) {
    const visibleActiveSide = collectVisibleActiveSide(activeSide);
    const visibleOperatorIndex = visibleActiveSide.findIndex((element) => element.id === operatorId);
    const originalOperatorIndex = activeSide.findIndex((element) => element.id === operatorId && element?.isVisible !== false);

    return {
        visibleActiveSide,
        visibleOperatorIndex,
        originalOperatorIndex
    };
}

function hideSegment(segment, formerRole) {
    segment.forEach((element) => {
        element.isVisible = false;
        element.formerRole = formerRole;
    });
}

function releaseVisibleSegment(segment = []) {
    let releasedSegment = clone(segment);

    while (
        releasedSegment.length === 1
        && releasedSegment[0]?.type === "GROUP"
        && Array.isArray(releasedSegment[0]?.content)
        && releasedSegment[0].content.length > 0
    ) {
        releasedSegment = clone(releasedSegment[0].content);
    }

    return releasedSegment.map((element) => ({
        ...clone(element),
        isBefreit: true
    }));
}

function transformGroupRelease(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const targetIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.type === "GROUP"
        && element.isVisible !== false
    );

    if (targetIndex === -1) {
        return clonedStruktur;
    }

    const targetGroup = context.activeSide[targetIndex];
    const releasedContent = (targetGroup.content || []).map((element) => ({
        ...clone(element),
        isBefreit: true
    }));

    if (releasedContent.length === 0) {
        return clonedStruktur;
    }

    targetGroup.isVisible = false;
    targetGroup.formerRole = "group_shell";

    const neueActiveSide = [];
    context.activeSide.forEach((element, index) => {
        if (index === targetIndex) {
            appendReleasedSequence(neueActiveSide, element, releasedContent, context.equationSide);
            return;
        }

        neueActiveSide.push(element);
    });

    return rebuildEquation(context, neueActiveSide, context.oppositeSide);
}


function transformNegativeSignRelease(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const targetIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.type === "NEGATION"
        && element.isVisible !== false
    );

    if (targetIndex === -1) {
        return clonedStruktur;
    }

    const targetSchale = context.activeSide[targetIndex];
    const befreiterInhalt = (targetSchale.content || []).map((element) => ({
        ...clone(element),
        isBefreit: true
    }));

    if (befreiterInhalt.length === 0) {
        return clonedStruktur;
    }

    targetSchale.isVisible = false;
    targetSchale.formerRole = "negation_shell";

    const negationShell = buildNegationShell(context.oppositeSide, entscheidung);
    const neueActiveSide = [];

    context.activeSide.forEach((element, index) => {
        if (index === targetIndex) {
            appendReleasedSequence(neueActiveSide, element, befreiterInhalt, context.equationSide);
            return;
        }

        neueActiveSide.push(element);
    });

    return rebuildEquation(context, neueActiveSide, [negationShell]);
}

function transformSubtrahendRelease(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const {
        visibleActiveSide,
        visibleOperatorIndex,
        originalOperatorIndex
    } = findVisibleOperatorContext(context.activeSide, entscheidung.operatorId);

    if (visibleOperatorIndex === -1 || originalOperatorIndex === -1) {
        return clonedStruktur;
    }

    const leftSegment = visibleActiveSide.slice(0, visibleOperatorIndex);
    const rightSegment = visibleActiveSide.slice(visibleOperatorIndex + 1);
    if (leftSegment.length === 0 || rightSegment.length === 0) {
        return clonedStruktur;
    }

    const passiveSnapshot = clone(leftSegment);
    const targetSnapshot = clone(rightSegment);

    hideSegment(leftSegment, "passive_expression");
    context.activeSide[originalOperatorIndex].isVisible = false;
    context.activeSide[originalOperatorIndex].formerRole = "additive_operator";

    const negationShell = buildNegationShell(targetSnapshot, entscheidung, {
        originId: entscheidung.targetId,
        label: "Negation freilegen"
    });
    const subtractionShell = buildAdditiveShell(context.oppositeSide, passiveSnapshot, entscheidung);
    const neueActiveSide = [
        ...context.activeSide.slice(0, originalOperatorIndex + 1),
        negationShell
    ];

    return rebuildEquation(context, neueActiveSide, [subtractionShell]);
}

function transformFunctionInverse(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const targetIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.isVisible !== false
    );

    if (targetIndex === -1) {
        return clonedStruktur;
    }

    const targetSchale = context.activeSide[targetIndex];
    if (targetSchale.type !== "FUNCTION" || targetSchale.name !== entscheidung.sourceName) {
        return clonedStruktur;
    }

    const befreiterInhalt = (targetSchale.content || []).map((element) => ({
        ...clone(element),
        isBefreit: true
    }));

    targetSchale.isVisible = false;
    targetSchale.formerRole = "function_shell";

    const inverseSchale = buildGeneratedFunctionShell(context.oppositeSide, entscheidung);
    const neueActiveSide = [];

    context.activeSide.forEach((element, index) => {
        if (index === targetIndex) {
            appendReleasedSequence(neueActiveSide, element, befreiterInhalt, context.equationSide);
            return;
        }

        neueActiveSide.push(element);
    });

    return rebuildEquation(context, neueActiveSide, [inverseSchale]);
}

function transformRootPower(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const targetIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.isVisible !== false
    );

    if (targetIndex === -1) {
        return clonedStruktur;
    }

    const targetSchale = context.activeSide[targetIndex];
    if (targetSchale.type !== entscheidung.sourceType) {
        return clonedStruktur;
    }

    const befreiterInhalt = (targetSchale.content || []).map((element) => ({
        ...clone(element),
        isBefreit: true
    }));

    targetSchale.isVisible = false;

    const neueSchaleOpposite = buildRootPowerShell(targetSchale, context.oppositeSide, entscheidung);
    const neueActiveSide = [];

    context.activeSide.forEach((element, index) => {
        if (index === targetIndex) {
            appendReleasedSequence(neueActiveSide, element, befreiterInhalt, context.equationSide);
            return;
        }

        neueActiveSide.push(element);
    });

    return rebuildEquation(context, neueActiveSide, [neueSchaleOpposite]);
}

function transformAdditiveRelease(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const {
        visibleActiveSide,
        visibleOperatorIndex,
        originalOperatorIndex
    } = findVisibleOperatorContext(context.activeSide, entscheidung.operatorId);

    if (visibleOperatorIndex === -1 || originalOperatorIndex === -1) {
        return clonedStruktur;
    }

    const leftSegment = visibleActiveSide.slice(0, visibleOperatorIndex);
    const rightSegment = visibleActiveSide.slice(visibleOperatorIndex + 1);
    const targetSegment = entscheidung.targetSide === "right" ? rightSegment : leftSegment;
    const passiveSegment = entscheidung.targetSide === "right" ? leftSegment : rightSegment;
    if (targetSegment.length === 0 || passiveSegment.length === 0) {
        return clonedStruktur;
    }

    const passiveSnapshot = clone(passiveSegment);
    hideSegment(passiveSegment, "passive_expression");
    context.activeSide[originalOperatorIndex].isVisible = false;
    context.activeSide[originalOperatorIndex].formerRole = "additive_operator";
    markSegmentAsEmerged(targetSegment);

    const additiveShell = buildAdditiveShell(context.oppositeSide, passiveSnapshot, entscheidung);
    return rebuildEquation(context, context.activeSide, [additiveShell]);
}

function transformFractionBirth(clonedStruktur, entscheidung) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    if (entscheidung.wrappedByNegation === true && entscheidung.containerTargetId) {
        const negationShellIndex = context.activeSide.findIndex((element) =>
            element.id === entscheidung.containerTargetId
            && element.isVisible !== false
            && element.type === "NEGATION"
        );

        if (negationShellIndex !== -1) {
            const negationShell = context.activeSide[negationShellIndex];
            const negationContent = Array.isArray(negationShell.content) ? negationShell.content : [];
            const passiveExpressionIds = entscheidung.passiveExpressionIds || [entscheidung.passiveExpressionId || entscheidung.factorId];
            const passiveSnapshot = negationContent
                .filter((element) => passiveExpressionIds.includes(element?.id))
                .map((element) => clone(element));
            const targetSnapshot = negationContent.filter((element) => element?.id === entscheidung.targetId);
            const releasedTarget = releaseVisibleSegment(targetSnapshot);

            if (passiveSnapshot.length === 0 || releasedTarget.length === 0) {
                return clonedStruktur;
            }

            negationShell.isVisible = false;
            negationShell.formerRole = "negation_shell";

            const negativePassiveShell = buildNegationShell(passiveSnapshot, entscheidung, {
                originId: `${buildOriginPart(entscheidung)}-negative-factor-block`,
                originSourceType: "MULTIPLICATION",
                label: "Negativen Faktorblock teilen"
            });
            const divisionShell = buildDivisionShell(context.oppositeSide, [negativePassiveShell], entscheidung);
            const neueActiveSide = [];

            context.activeSide.forEach((element, index) => {
                if (index === negationShellIndex) {
                    appendReleasedSequence(neueActiveSide, element, releasedTarget, context.equationSide);
                    return;
                }

                neueActiveSide.push(element);
            });

            return rebuildEquation(context, neueActiveSide, [divisionShell]);
        }
    }

    const targetShellIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.isVisible !== false
        && element.type === "MULTIPLICATION"
    );

    if (targetShellIndex !== -1) {
        const targetShell = context.activeSide[targetShellIndex];
        const passiveCollectionKey = entscheidung.passiveCollectionKey === "content" ? "content" : "factor";
        const targetCollectionKey = entscheidung.targetCollectionKey === "factor" ? "factor" : "content";
        const passiveCollection = Array.isArray(targetShell[passiveCollectionKey]) ? targetShell[passiveCollectionKey] : [];
        const targetCollection = Array.isArray(targetShell[targetCollectionKey]) ? targetShell[targetCollectionKey] : [];
        const passiveExpressionIds = entscheidung.passiveExpressionIds || [entscheidung.passiveExpressionId || entscheidung.factorId];
        const passiveSnapshot = passiveCollection.filter((element) => passiveExpressionIds.includes(element.id));
        const releasedTarget = releaseVisibleSegment(targetCollection);

        if (passiveSnapshot.length === 0 || releasedTarget.length === 0) {
            return clonedStruktur;
        }

        targetShell.isVisible = false;
        targetShell.formerRole = "multiplication_shell";

        const divisionShell = buildDivisionShell(context.oppositeSide, passiveSnapshot, entscheidung);
        const neueActiveSide = [];

        context.activeSide.forEach((element, index) => {
            if (index === targetShellIndex) {
                appendReleasedSequence(neueActiveSide, element, releasedTarget, context.equationSide);
                return;
            }

            neueActiveSide.push(element);
        });

        return rebuildEquation(context, neueActiveSide, [divisionShell]);
    }

    const passiveExpressionId = entscheidung.passiveExpressionId || entscheidung.factorId;
    const passiveExpressionIds = entscheidung.passiveExpressionIds || [passiveExpressionId];
    const operatorIds = entscheidung.operatorIds || (entscheidung.operatorId ? [entscheidung.operatorId] : []);
    const passiveExpressionIndices = context.activeSide
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => passiveExpressionIds.includes(element?.id) && element.isVisible !== false)
        .map(({ index }) => index);
    const operatorIndices = context.activeSide
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => operatorIds.includes(element?.id) && element.isVisible !== false)
        .map(({ index }) => index);
    const targetIndex = context.activeSide.findIndex((element) => element.id === entscheidung.targetId && element.isVisible !== false);

    if (targetIndex === -1 || passiveExpressionIndices.length === 0) {
        return clonedStruktur;
    }

    const passiveSnapshot = passiveExpressionIndices.map((index) => clone(context.activeSide[index]));

    passiveExpressionIndices.forEach((index) => {
        context.activeSide[index].isVisible = false;
        context.activeSide[index].formerRole = "passive_expression";
    });

    operatorIndices.forEach((index) => {
        const operator = context.activeSide[index];
        if (operator?.value === "*") {
            operator.isVisible = false;
            operator.formerRole = "multiplication_operator";
        }
    });

    (entscheidung.targetExpressionIds || [entscheidung.targetId]).forEach((targetId) => {
        const target = context.activeSide.find((element) => element.id === targetId && element.isVisible !== false);
        if (target) {
            target.isBefreit = true;
        }
    });

    const divisionShell = buildDivisionShell(context.oppositeSide, passiveSnapshot, entscheidung);
    return rebuildEquation(context, context.activeSide, [divisionShell]);
}

function transformFractionDenominatorRelease(clonedStruktur, entscheidung, options = {}) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const targetIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.isVisible !== false
    );

    if (targetIndex === -1) {
        return clonedStruktur;
    }

    const targetSchale = context.activeSide[targetIndex];
    if (targetSchale.type !== "DIVISION") {
        return clonedStruktur;
    }

    const denominator = Array.isArray(targetSchale.denominator) ? targetSchale.denominator : [];
    const passiveExpressionIds = entscheidung.passiveExpressionIds || [entscheidung.passiveExpressionId || entscheidung.factorId];
    const factorSnapshot = denominator.filter((element) => passiveExpressionIds.includes(element.id));
    const releasedNumerator = releaseVisibleSegment(targetSchale.numerator || []);

    if (factorSnapshot.length === 0 || releasedNumerator.length === 0) {
        return clonedStruktur;
    }

    targetSchale.isVisible = false;
    targetSchale.formerRole = "division_shell";

    const multiplicationShell = buildMultiplicationShell(context.oppositeSide, factorSnapshot, entscheidung, options);
    const neueActiveSide = [];

    context.activeSide.forEach((element, index) => {
        if (index === targetIndex) {
            appendReleasedSequence(neueActiveSide, element, releasedNumerator, context.equationSide);
            return;
        }

        neueActiveSide.push(element);
    });

    return rebuildEquation(context, neueActiveSide, [multiplicationShell]);
}

function transformFractionCollapse(clonedStruktur, entscheidung, options = {}) {
    const context = getEquationContext(clonedStruktur, entscheidung);
    if (!context) {
        return clonedStruktur;
    }

    const targetIndex = context.activeSide.findIndex((element) =>
        element.id === entscheidung.targetId
        && element.isVisible !== false
    );

    if (targetIndex === -1) {
        return clonedStruktur;
    }

    const targetSchale = context.activeSide[targetIndex];
    if (targetSchale.type !== entscheidung.sourceType) {
        return clonedStruktur;
    }

    const denominator = Array.isArray(targetSchale.denominator) ? targetSchale.denominator : [];
    const passiveExpressionIds = entscheidung.passiveExpressionIds || [entscheidung.passiveExpressionId || entscheidung.factorId];
    const passiveSnapshot = denominator.filter((element) => passiveExpressionIds.includes(element.id));
    if (passiveSnapshot.length === 0) {
        return clonedStruktur;
    }

    const befreiterZaehler = releaseVisibleSegment(targetSchale.numerator || []);

    targetSchale.isVisible = false;
    targetSchale.formerRole = "division_shell";

    const multiplicationShell = buildMultiplicationShell(context.oppositeSide, passiveSnapshot, entscheidung, options);
    const neueActiveSide = [];

    context.activeSide.forEach((element, index) => {
        if (index === targetIndex) {
            appendReleasedSequence(neueActiveSide, element, befreiterZaehler, context.equationSide);
            return;
        }

        neueActiveSide.push(element);
    });

    return rebuildEquation(context, neueActiveSide, [multiplicationShell]);
}

export class Umformer {
    static invertiere(struktur, entscheidung, options = {}) {
        const clonedStruktur = (
            entscheidung?.family === "group_release"
                ? clone(struktur)
                : normalizeEquationOuterGroups(clone(struktur))
        );

        if (!entscheidung || !entscheidung.family) {
            return clonedStruktur;
        }

        if (entscheidung.family === "group_release" && entscheidung.targetId) {
            return transformGroupRelease(clonedStruktur, entscheidung);
        }

        if (entscheidung.family === "negative_sign_release" && entscheidung.targetId) {
            return transformNegativeSignRelease(clonedStruktur, entscheidung);
        }

        if (entscheidung.family === "addition_release" || entscheidung.family === "subtraction_release") {
            return transformAdditiveRelease(clonedStruktur, entscheidung);
        }

        if (entscheidung.family === "subtrahend_release") {
            return transformSubtrahendRelease(clonedStruktur, entscheidung);
        }

        if ((entscheidung.family === "trig_inverse" || entscheidung.family === "inverse_trig") && entscheidung.targetId) {
            return transformFunctionInverse(clonedStruktur, entscheidung);
        }

        if (entscheidung.family === "root_power" && entscheidung.targetId) {
            return transformRootPower(clonedStruktur, entscheidung);
        }

        if (
            entscheidung.family === "fraction_birth"
            && entscheidung.targetId
            && (entscheidung.passiveExpressionId || entscheidung.factorId)
        ) {
            return transformFractionBirth(clonedStruktur, entscheidung);
        }

        if (
            entscheidung.family === "fraction_denominator_release"
            && entscheidung.targetId
            && (entscheidung.passiveExpressionId || entscheidung.factorId)
        ) {
            return transformFractionDenominatorRelease(clonedStruktur, entscheidung, options);
        }

        if (
            entscheidung.family === "fraction_collapse"
            && entscheidung.targetId
            && (entscheidung.passiveExpressionId || entscheidung.factorId)
        ) {
            return transformFractionCollapse(clonedStruktur, entscheidung, options);
        }

        return clonedStruktur;
    }
}
