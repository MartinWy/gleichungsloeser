import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";
import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import { runStrategyPhase } from "../../core/GenesisRuntime/P2_Strategy/runStrategyPhase.js";
import {
    P3_TRANSFORMATION_CONTRACT_VERSION,
    runTransformationPhase
} from "../../core/GenesisRuntime/P3_Transformation/runTransformationPhase.js";

function visibleSideRoots(structure) {
    const anchorIndex = structure.findIndex((node) => node?.type === "ANCHOR");
    return {
        left: structure.slice(0, anchorIndex).filter((node) => node?.isVisible !== false),
        right: structure.slice(anchorIndex + 1).filter((node) => node?.isVisible !== false)
    };
}

function assertCanonicalVisibleEquation(structure) {
    const roots = visibleSideRoots(structure);
    assert.equal(roots.left.length, 1, "P3 muss links genau eine sichtbare Wurzel liefern.");
    assert.equal(roots.right.length, 1, "P3 muss rechts genau eine sichtbare Wurzel liefern.");
}

async function transformEquation(equation, targetVariable = null) {
    const inputPhase = await runInputPhase({
        request: {
            equation
        }
    });
    const strategyPhase = await runStrategyPhase({
        request: {
            requestedTargetVariable: targetVariable
        },
        inputPhase
    });

    return runTransformationPhase({
        inputPhase,
        strategyPhase
    });
}

const groupRelease = await transformEquation("(x+1)=5");
assert.equal(groupRelease.contractVersion, P3_TRANSFORMATION_CONTRACT_VERSION);
assertCanonicalVisibleEquation(groupRelease.nextStructure);
const hiddenGroup = groupRelease.nextStructure.find((node) => node.type === "GROUP" && node.isVisible === false);
const releasedAddition = groupRelease.nextStructure.find((node) => node.type === "ADDITION" && node.isBefreit === true);
assert.ok(hiddenGroup);
assert.ok(releasedAddition);
assert.equal(releasedAddition.terms[0].value, "x");
assert.equal(groupRelease.appliedDecision.family, "group_release");

const negativeRelease = await transformEquation("-x=5");
assertCanonicalVisibleEquation(negativeRelease.nextStructure);
const hiddenNegation = negativeRelease.nextStructure.find((node) => node.type === "NEGATION" && node.isVisible === false);
const emergedNegativeVariable = negativeRelease.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedNegation = negativeRelease.nextStructure.find((node) => node.type === "NEGATION" && node.isGenerated === true);
assert.ok(hiddenNegation);
assert.ok(emergedNegativeVariable);
assert.ok(generatedNegation);
assert.equal(generatedNegation.content[0].value, "5");
assert.equal(generatedNegation.operator.type, "OPERATOR");
assert.equal(generatedNegation.operator.value, "-");

const additionRelease = await transformEquation("x+2=5");
assertCanonicalVisibleEquation(additionRelease.nextStructure);
const hiddenAdditionShell = additionRelease.nextStructure.find((node) => node.type === "ADDITION" && node.isVisible === false);
const releasedAdditionTarget = additionRelease.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedSubtraction = additionRelease.nextStructure.find((node) => node.type === "SUBTRACTION" && node.isGenerated === true);
assert.ok(hiddenAdditionShell);
assert.ok(releasedAdditionTarget);
assert.ok(generatedSubtraction);
assert.equal(generatedSubtraction.subtrahend[0].value, "2");
assert.equal(generatedSubtraction.minuend[0].value, "5");
assert.equal(generatedSubtraction.operator.value, "-");

const subtrahendRelease = await transformEquation("2-x=5");
assertCanonicalVisibleEquation(subtrahendRelease.nextStructure);
const hiddenSubtractionShell = subtrahendRelease.nextStructure.find((node) => node.type === "SUBTRACTION" && node.isVisible === false);
const generatedActiveNegation = subtrahendRelease.nextStructure.find((node) => node.type === "NEGATION" && node.isGenerated === true);
const generatedOppositeSubtraction = subtrahendRelease.nextStructure.find((node) => node.type === "SUBTRACTION" && node.isGenerated === true);
assert.ok(hiddenSubtractionShell);
assert.ok(generatedActiveNegation);
assert.ok(generatedOppositeSubtraction);
assert.equal(generatedActiveNegation.content[0].value, "x");
assert.equal(generatedOppositeSubtraction.subtrahend[0].value, "2");
assert.equal(generatedOppositeSubtraction.minuend[0].value, "5");

const additiveSubtrahendRelease = await transformEquation(
    "a^2+b^2-2*a*b*cos(gamma)=c^2",
    "gamma"
);
const additiveOppositeSubtraction = additiveSubtrahendRelease.nextStructure.find((node) => (
    node.type === "SUBTRACTION" && node.isGenerated === true
));
assert.ok(additiveOppositeSubtraction);
assert.equal(
    additiveOppositeSubtraction.subtrahend?.[0]?.type,
    "GROUP",
    "Ein als Ganzes verschobener additiver Minuend muss in der neuen Subtrahendrolle gebunden bleiben."
);
assert.equal(additiveOppositeSubtraction.subtrahend?.[0]?.content?.[0]?.type, "ADDITION");

const trigInverse = await transformEquation("sin(x)=1");
const hiddenTrigFunction = trigInverse.nextStructure.find((node) => node.type === "FUNCTION" && node.name === "sin" && node.isVisible === false);
const emergedTrigArgument = trigInverse.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedAsin = trigInverse.nextStructure.find((node) => node.type === "FUNCTION" && node.name === "asin" && node.isGenerated === true);
assert.ok(hiddenTrigFunction);
assert.ok(emergedTrigArgument);
assert.ok(generatedAsin);

const inverseTrig = await transformEquation("asin(x)=1");
const hiddenInverseTrigFunction = inverseTrig.nextStructure.find((node) => node.type === "FUNCTION" && node.name === "asin" && node.isVisible === false);
const generatedSin = inverseTrig.nextStructure.find((node) => node.type === "FUNCTION" && node.name === "sin" && node.isGenerated === true);
assert.ok(hiddenInverseTrigFunction);
assert.ok(generatedSin);

const logInverse = await transformEquation("log(x)=1");
const hiddenLogFunction = logInverse.nextStructure.find((node) => node.type === "FUNCTION" && node.name === "log" && node.isVisible === false);
const emergedLogArgument = logInverse.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedLogPower = logInverse.nextStructure.find((node) => node.type === "POWER" && node.isGenerated === true);
assert.ok(hiddenLogFunction);
assert.ok(emergedLogArgument);
assert.ok(generatedLogPower);
assert.equal(generatedLogPower.content[0].value, "10");
assert.equal(generatedLogPower.exponentNodes[0].value, "1");

const rootPower = await transformEquation("sqrt(x)=5");
const hiddenRoot = rootPower.nextStructure.find((node) => node.type === "ROOT" && node.isVisible === false);
const emergedRootVariable = rootPower.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedPower = rootPower.nextStructure.find((node) => node.type === "POWER" && node.isGenerated === true);
assert.ok(hiddenRoot);
assert.ok(emergedRootVariable);
assert.ok(generatedPower);
assert.equal(generatedPower.exponent, 2);
assert.equal(generatedPower.exponentNodes[0].value, "2");

const powerExponentRelease = await transformEquation("B^x=9", "x");
const hiddenExponentPower = powerExponentRelease.nextStructure.find((node) => node.type === "POWER" && node.isVisible === false);
const releasedExponentVariable = powerExponentRelease.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedBasedLogFunction = powerExponentRelease.nextStructure.find((node) => node.type === "FUNCTION" && node.isGenerated === true);
assert.ok(hiddenExponentPower);
assert.ok(releasedExponentVariable);
assert.ok(generatedBasedLogFunction);
assert.equal(generatedBasedLogFunction.name, "log");
assert.equal(generatedBasedLogFunction.content[0].value, "9");
assert.equal(generatedBasedLogFunction.baseContent[0].value, "B");

const powerBaseRelease = await transformEquation("B^x=9", "B");
const hiddenBasePower = powerBaseRelease.nextStructure.find((node) => node.type === "POWER" && node.isVisible === false);
const releasedBaseVariable = powerBaseRelease.nextStructure.find((node) => node.value === "B" && node.isBefreit === true);
const generatedReciprocalPower = powerBaseRelease.nextStructure.find((node) => node.type === "POWER" && node.isGenerated === true);
assert.ok(hiddenBasePower);
assert.ok(releasedBaseVariable);
assert.ok(generatedReciprocalPower);
assert.equal(generatedReciprocalPower.exponent, "1/x");
assert.equal(generatedReciprocalPower.exponentNodes[0].type, "DIVISION");

const fractionBirth = await transformEquation("2*x=10");
assertCanonicalVisibleEquation(fractionBirth.nextStructure);
const hiddenMultiplicationShell = fractionBirth.nextStructure.find((node) => node.type === "MULTIPLICATION" && node.isVisible === false);
const releasedFactorTarget = fractionBirth.nextStructure.find((node) => node.value === "x" && node.isBefreit === true);
const generatedDivision = fractionBirth.nextStructure.find((node) => node.type === "DIVISION" && node.isGenerated === true);
assert.ok(hiddenMultiplicationShell);
assert.ok(releasedFactorTarget);
assert.ok(generatedDivision);
assert.equal(generatedDivision.denominator[0].value, "2");
assert.equal(generatedDivision.numerator[0].value, "10");
assert.equal(generatedDivision.operator.value, "/");

const fractionCollapse = await transformEquation("x/2=5");
const hiddenDivision = fractionCollapse.nextStructure.find((node) => node.type === "DIVISION" && node.isVisible === false);
const releasedNumerator = fractionCollapse.nextStructure.find(
    (node) => node.value === "x" && node.isBefreit === true
);
const generatedMultiplication = fractionCollapse.nextStructure.find((node) => node.type === "MULTIPLICATION" && node.isGenerated === true);
assert.ok(hiddenDivision);
assert.ok(releasedNumerator);
assert.ok(generatedMultiplication);
assert.deepEqual(generatedMultiplication.factors.map((factor) => factor.value), ["5", "2"]);
assert.equal(generatedMultiplication.operators[0].value, "*");

const denominatorRelease = await transformEquation("2/x=5");
const hiddenDenominatorDivision = denominatorRelease.nextStructure.find((node) => node.type === "DIVISION" && node.isVisible === false);
const transportedDenominatorNumerator = denominatorRelease.nextStructure.find((node) => node.value === "2" && node.isBefreit === true);
const generatedDenominatorMultiplication = denominatorRelease.nextStructure.find((node) => node.type === "MULTIPLICATION" && node.isGenerated === true);
assert.ok(hiddenDenominatorDivision);
assert.ok(transportedDenominatorNumerator);
assert.ok(generatedDenominatorMultiplication);
assert.equal(
    transportedDenominatorNumerator.value,
    "2",
    "Beim Nennerabbau muss der unberuehrte Zaehler unveraendert weitergereicht werden."
);
assert.deepEqual(generatedDenominatorMultiplication.factors.map((factor) => factor.value), ["5", "x"]);
assert.equal(generatedDenominatorMultiplication.operators[0].value, "*");

const passiveEquation = await transformEquation("x=5");
assert.equal(passiveEquation.appliedDecision, null);
assert.equal(passiveEquation.history.length, 0);

const negativePowerRuntime = await runGenesisRuntime("-x^2+b=c", {
    targetVariable: "x"
});
const negativePowerNegationStep = negativePowerRuntime.phases.transformation.history.find(
    (step) => step.strategy?.family === "negative_sign_release"
);
assert.ok(negativePowerNegationStep);
const negativePowerGeneratedNegation = negativePowerNegationStep.structure.find(
    (node) => node.type === "NEGATION" && node.isGenerated === true
);
assert.ok(negativePowerGeneratedNegation);
assert.equal(
    negativePowerGeneratedNegation.content?.[0]?.type,
    "GROUP",
    "Eine erzeugte Negation ueber einem additiven Ausdruck muss im Kern eine gebundene Gruppenschale tragen."
);
assert.equal(
    negativePowerGeneratedNegation.content?.[0]?.content?.[0]?.type,
    "SUBTRACTION",
    "Innerhalb der gebundenen Negationsgruppe muss die additive Ursprungsschale erhalten bleiben."
);

const groupedNegativePowerRuntime = await runGenesisRuntime("(-x)^2+b=c", {
    targetVariable: "x"
});
const groupedNegativeFinalStep = groupedNegativePowerRuntime.phases.transformation.history.find(
    (step) => step.strategy?.family === "negative_sign_release"
);
assert.ok(groupedNegativeFinalStep);
const groupedNegativeGeneratedNegation = groupedNegativeFinalStep.structure.find(
    (node) => node.type === "NEGATION" && node.isGenerated === true
);
assert.ok(groupedNegativeGeneratedNegation);
assert.equal(
    groupedNegativeGeneratedNegation.content?.[0]?.type,
    "ROOT",
    "Bei (-x)^2 muss nach dem Wurzelziehen erst die freigelegte Negationsschale ueber der Wurzel erhalten bleiben."
);
assert.equal(
    groupedNegativeGeneratedNegation.content?.[0]?.content?.[0]?.type,
    "SUBTRACTION",
    "Die unter der Wurzel erzeugte Gegenseite muss auch im gruppierten Negationsfall als additive Ursprungsschale erhalten bleiben."
);

console.log("GenesisRuntime-P3-Schalen erfolgreich geprueft.");
