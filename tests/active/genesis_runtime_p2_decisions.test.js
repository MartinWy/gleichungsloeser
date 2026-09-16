import assert from "node:assert/strict";

import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import { runStrategyPhase } from "../../core/GenesisRuntime/P2_Strategy/runStrategyPhase.js";
import { runTransformationPhase } from "../../core/GenesisRuntime/P3_Transformation/runTransformationPhase.js";

async function getDecision(equation, targetVariable = null) {
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

    return strategyPhase.nextDecision;
}

const groupedAdditionDecision = await getDecision("(x+1)=5");
assert.equal(groupedAdditionDecision.family, "group_release");
assert.equal(groupedAdditionDecision.action, "RELEASE_GROUP_CONTENT");
assert.equal(groupedAdditionDecision.targetRole, "content");

const negativeSimpleDecision = await getDecision("-x=5");
assert.equal(negativeSimpleDecision.family, "negative_sign_release");
assert.equal(negativeSimpleDecision.action, "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE");

const additionDecision = await getDecision("x+2=5");
assert.equal(additionDecision.family, "addition_release");
assert.equal(additionDecision.targetSide, "left");
assert.equal(additionDecision.targetRole, "terms");
assert.equal(additionDecision.passiveRole, "terms");

const commutativeAdditionDecision = await getDecision("2+x=5");
assert.equal(commutativeAdditionDecision.family, "addition_release");
assert.equal(commutativeAdditionDecision.targetSide, "right");

const subtractionDecision = await getDecision("x-(2+1)=5");
assert.equal(subtractionDecision.family, "subtraction_release");
assert.equal(subtractionDecision.targetRole, "minuend");
assert.equal(subtractionDecision.passiveRole, "subtrahend");

const subtrahendDecision = await getDecision("2-x=5");
assert.equal(subtrahendDecision.family, "subtrahend_release");
assert.equal(subtrahendDecision.targetSide, "right");
assert.equal(subtrahendDecision.targetRole, "subtrahend");
assert.equal(subtrahendDecision.passiveRole, "minuend");

const fractionBirthDecision = await getDecision("2abcos(gamma)=10", "gamma");
assert.equal(fractionBirthDecision.family, "fraction_birth");
assert.equal(fractionBirthDecision.passiveExpressionIds.length, 3);
assert.equal(fractionBirthDecision.operatorIds.length, 3);
assert.equal(fractionBirthDecision.targetRole, "factors");
assert.equal(fractionBirthDecision.passiveRole, "factors");

const negativeGroupedFactorDecision = await getDecision("-(2*a*b*cos(gamma))=10", "gamma");
assert.equal(negativeGroupedFactorDecision.family, "negative_sign_release");

const fractionCollapseDecision = await getDecision("sin(x)/(2*3)=5");
assert.equal(fractionCollapseDecision.family, "fraction_collapse");
assert.equal(fractionCollapseDecision.action, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
assert.equal(fractionCollapseDecision.targetRole, "numerator");
assert.equal(fractionCollapseDecision.passiveRole, "denominator");

const denominatorReleaseDecision = await getDecision("2/x=5");
assert.equal(denominatorReleaseDecision.family, "fraction_denominator_release");
assert.equal(denominatorReleaseDecision.action, "MOVE_DENOMINATOR_TARGET_TO_FACTOR");
assert.equal(denominatorReleaseDecision.targetRole, "denominator");
assert.equal(denominatorReleaseDecision.passiveRole, "numerator");

const denominatorInputPhase = await runInputPhase({
    request: {
        equation: "2/x=5"
    }
});
const denominatorStrategyPhase = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: denominatorInputPhase
});
const denominatorTransformation = await runTransformationPhase({
    inputPhase: denominatorInputPhase,
    strategyPhase: denominatorStrategyPhase
});
const denominatorFollowStrategy = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: {
        structure: denominatorTransformation.nextStructure
    }
});

assert.equal(denominatorFollowStrategy.nextDecision?.family, "fraction_birth");
assert.equal(denominatorFollowStrategy.nextDecision?.targetRole, "factors");
assert.equal(denominatorFollowStrategy.nextDecision?.targetFactorIndex, 1);

const trigInverseDecision = await getDecision("cos(x)=1");
assert.equal(trigInverseDecision.family, "trig_inverse");
assert.equal(trigInverseDecision.inverseName, "acos");
assert.equal(trigInverseDecision.targetRole, "content");

const inverseTrigDecision = await getDecision("asin(x)=1");
assert.equal(inverseTrigDecision.family, "inverse_trig");
assert.equal(inverseTrigDecision.inverseName, "sin");

const logInverseDecision = await getDecision("log(x)=1");
assert.equal(logInverseDecision.family, "log_inverse");
assert.equal(logInverseDecision.inverseType, "POWER");
assert.equal(logInverseDecision.inverseBaseText, "10");

const lnInverseDecision = await getDecision("ln(x)=1");
assert.equal(lnInverseDecision.family, "log_inverse");
assert.equal(lnInverseDecision.inverseBaseText, "e");

const lgInverseDecision = await getDecision("lg(x)=1");
assert.equal(lgInverseDecision.family, "log_inverse");
assert.equal(lgInverseDecision.inverseBaseText, "2");

const rootDecision = await getDecision("sqrt(x)=5");
assert.equal(rootDecision.family, "root_power");
assert.equal(rootDecision.inverseType, "POWER");

const powerDecision = await getDecision("x^2=9");
assert.equal(powerDecision.family, "root_power");
assert.equal(powerDecision.inverseType, "ROOT");

const exponentialFactorDecision = await getDecision("y=a*B^x", "a");
assert.equal(exponentialFactorDecision.family, "fraction_birth");

const exponentTargetDecision = await getDecision("y=a*B^x", "x");
assert.equal(exponentTargetDecision.family, "fraction_birth");

const exponentInputPhase = await runInputPhase({
    request: {
        equation: "y=a*B^x"
    }
});
const exponentStrategyPhase = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: exponentInputPhase
});
const exponentTransformation = await runTransformationPhase({
    inputPhase: exponentInputPhase,
    strategyPhase: exponentStrategyPhase
});
const exponentFollowStrategy = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: {
        structure: exponentTransformation.nextStructure
    }
});
assert.equal(exponentFollowStrategy.nextDecision?.family, "power_exponent_release");
assert.equal(exponentFollowStrategy.nextDecision?.inverseName, "log");
assert.equal(exponentFollowStrategy.nextDecision?.targetRole, "exponentNodes");

const naturalExponentDecision = await getDecision("y=e^x", "x");
assert.equal(naturalExponentDecision.family, "power_exponent_release");
assert.equal(naturalExponentDecision.inverseName, "ln");

const baseTargetDecision = await getDecision("B^x=9", "B");
assert.equal(baseTargetDecision.family, "power_base_release");
assert.equal(baseTargetDecision.targetRole, "content");
assert.equal(baseTargetDecision.passiveRole, "exponentNodes");

const passiveDecision = await getDecision("2*3=10");
assert.equal(passiveDecision, null);

console.log("GenesisRuntime-P2-Entscheidungen erfolgreich geprueft.");
