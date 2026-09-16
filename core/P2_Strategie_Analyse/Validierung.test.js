import assert from "node:assert/strict";
import { Atomisierer } from "../P1_Eingabe/Regelwerk.js";
import { PfadFinder } from "./PfadFinder.js";
import { Umformer } from "../P3_Umformung/Regelwerk.js";

const groupedAddition = Atomisierer.process("(x+1)=5");
const groupedAdditionDecision = PfadFinder.findeNaechsteAktion(groupedAddition.slice(0, 1));
assert.equal(groupedAdditionDecision.family, "group_release");
assert.equal(groupedAdditionDecision.sourceType, "GROUP");
assert.equal(groupedAdditionDecision.inverseType, "EXPLICIT_CONTENT");
assert.equal(groupedAdditionDecision.action, "RELEASE_GROUP_CONTENT");
assert.equal(groupedAdditionDecision.label, "Gruppe freilegen");
assert.equal(groupedAdditionDecision.argumentScope, "active_side_only");
assert.ok(groupedAdditionDecision.targetExpressionIds.length >= 1);

const groupedMultiplication = Atomisierer.process("(2*x)=10");
const groupedMultiplicationDecision = PfadFinder.findeNaechsteAktion(groupedMultiplication.slice(0, 1));
assert.equal(groupedMultiplicationDecision.family, "group_release", "Die geschuetzte Aussengruppe muss vor innerer Multiplikation freigelegt werden.");

const groupedDivision = Atomisierer.process("(x/2)=5");
const groupedDivisionDecision = PfadFinder.findeNaechsteAktion(groupedDivision.slice(0, 1));
assert.equal(groupedDivisionDecision.family, "group_release", "Die geschuetzte Aussengruppe muss vor innerer Division freigelegt werden.");

const nestedGroup = Atomisierer.process("((x))=5");
const nestedGroupDecision = PfadFinder.findeNaechsteAktion(nestedGroup.slice(0, 1));
assert.equal(nestedGroupDecision.family, "group_release");

const negativeSimple = Atomisierer.process("-x=5");
const negativeSimpleDecision = PfadFinder.findeNaechsteAktion(negativeSimple.slice(0, 1));
assert.equal(negativeSimpleDecision.family, "negative_sign_release");
assert.equal(negativeSimpleDecision.sourceType, "NEGATION");
assert.equal(negativeSimpleDecision.inverseType, "NEGATION");
assert.equal(negativeSimpleDecision.action, "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE");
assert.equal(negativeSimpleDecision.label, "Vorzeichen umklappen");
assert.equal(negativeSimpleDecision.argumentScope, "whole_opposite_side");

const negativeRight = Atomisierer.process("5=-x");
const negativeRightDecision = PfadFinder.findeNaechsteAktion(negativeRight.slice(2));
assert.equal(negativeRightDecision.family, "negative_sign_release");

const negativeFunction = Atomisierer.process("-sin(x)=5");
const negativeFunctionDecision = PfadFinder.findeNaechsteAktion(negativeFunction.slice(0, 1));
assert.equal(negativeFunctionDecision.family, "negative_sign_release");

const passiveNegative = Atomisierer.process("-2=5");
assert.equal(PfadFinder.findeNaechsteAktion(passiveNegative.slice(0, 1)), null);

const additionSimple = Atomisierer.process("x+2=5");
const additionSimpleDecision = PfadFinder.findeNaechsteAktion(additionSimple.slice(0, 3));
assert.equal(additionSimpleDecision.family, "addition_release");
assert.equal(additionSimpleDecision.sourceType, "ADDITION");
assert.equal(additionSimpleDecision.inverseType, "SUBTRACTION");
assert.equal(additionSimpleDecision.action, "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION");
assert.equal(additionSimpleDecision.label, "Ausdruck subtrahieren");
assert.equal(additionSimpleDecision.targetSide, "left");
assert.deepEqual(additionSimpleDecision.passiveExpressionIds.length, 1);

const additionCommutative = Atomisierer.process("2+x=5");
const additionCommutativeDecision = PfadFinder.findeNaechsteAktion(additionCommutative.slice(0, 3));
assert.equal(additionCommutativeDecision.family, "addition_release");
assert.equal(additionCommutativeDecision.targetSide, "right");

const additionOuter = Atomisierer.process("2*x+3=5");
const additionOuterDecision = PfadFinder.findeNaechsteAktion(additionOuter.slice(0, 5));
assert.equal(additionOuterDecision.family, "addition_release", "Die aeussere Addition muss vor der inneren Multiplikation greifen.");
assert.equal(additionOuterDecision.action, "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION");

const subtractionSimple = Atomisierer.process("x-2=5");
const subtractionSimpleDecision = PfadFinder.findeNaechsteAktion(subtractionSimple.slice(0, 3));
assert.equal(subtractionSimpleDecision.family, "subtraction_release");
assert.equal(subtractionSimpleDecision.sourceType, "SUBTRACTION");
assert.equal(subtractionSimpleDecision.inverseType, "ADDITION");
assert.equal(subtractionSimpleDecision.action, "MOVE_PASSIVE_EXPRESSION_TO_ADDITION");
assert.equal(subtractionSimpleDecision.label, "Ausdruck addieren");
assert.equal(subtractionSimpleDecision.targetSide, "left");

const subtractionGrouped = Atomisierer.process("x-(2+1)=5");
const subtractionGroupedDecision = PfadFinder.findeNaechsteAktion(subtractionGrouped.slice(0, 3));
assert.equal(subtractionGroupedDecision.family, "subtraction_release");
assert.ok(subtractionGroupedDecision.passiveExpressionIds.length >= 1);

const reverseSubtraction = Atomisierer.process("2-x=5");
const reverseSubtractionDecision = PfadFinder.findeNaechsteAktion(reverseSubtraction.slice(0, 3));
assert.equal(reverseSubtractionDecision.family, "subtrahend_release");
assert.equal(reverseSubtractionDecision.sourceType, "SUBTRACTION");
assert.equal(reverseSubtractionDecision.inverseType, "SUBTRACTION");
assert.equal(reverseSubtractionDecision.action, "MOVE_MINUEND_TO_SUBTRACTION");
assert.equal(reverseSubtractionDecision.label, "Minuend subtrahieren");
assert.equal(reverseSubtractionDecision.targetSide, "right");

const reverseSubtractionGrouped = Atomisierer.process("(2+1)-x=5");
const reverseSubtractionGroupedDecision = PfadFinder.findeNaechsteAktion(reverseSubtractionGrouped.slice(0, 3));
assert.equal(reverseSubtractionGroupedDecision.family, "subtrahend_release");
assert.ok(reverseSubtractionGroupedDecision.passiveExpressionIds.length >= 1);

const cosineLawInitial = Atomisierer.process("a^2+b^2-2*a*b*cos(gamma)=c^2");
const cosineLawFirstDecision = PfadFinder.findeNaechsteAktion(cosineLawInitial.slice(0, -2), { targetVariable: "gamma" });
const cosineLawAfterFirst = Umformer.invertiere(cosineLawInitial, {
    ...cosineLawFirstDecision,
    targetVariable: "gamma",
    equationSide: "left"
});
const cosineLawSecondDecision = PfadFinder.findeNaechsteAktion(
    cosineLawAfterFirst.slice(0, cosineLawAfterFirst.findIndex((element) => element.value === "=")),
    { targetVariable: "gamma" }
);
assert.equal(
    cosineLawSecondDecision.family,
    "subtrahend_release",
    "Nach dem ersten Wegnehmen von a^2 muss das sichtbare b^2 als zweiter passiver Additionsterm erkannt werden."
);
const cosineLawAfterSecond = Umformer.invertiere(cosineLawAfterFirst, {
    ...cosineLawSecondDecision,
    targetVariable: "gamma",
    equationSide: "left"
});
const cosineLawThirdDecision = PfadFinder.findeNaechsteAktion(
    cosineLawAfterSecond.slice(0, cosineLawAfterSecond.findIndex((element) => element.value === "=")),
    { targetVariable: "gamma" }
);
assert.equal(
    cosineLawThirdDecision.family,
    "fraction_birth",
    "Eine sichtbare Negationsschale vor einer Produktkette muss direkt als gemeinsamer Divisionsblock behandelt werden."
);
assert.equal(cosineLawThirdDecision.wrappedByNegation, true);

const fractionBirthImplicit = Atomisierer.process("2x=10");
const fractionBirthImplicitDecision = PfadFinder.findeNaechsteAktion(fractionBirthImplicit.slice(0, 3));
assert.equal(fractionBirthImplicitDecision.family, "fraction_birth");
assert.equal(fractionBirthImplicitDecision.sourceType, "MULTIPLICATION");
assert.equal(fractionBirthImplicitDecision.inverseType, "DIVISION");
assert.equal(fractionBirthImplicitDecision.action, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");
assert.equal(fractionBirthImplicitDecision.label, "Ausdruck in Nenner");
assert.ok(fractionBirthImplicitDecision.passiveExpressionId);
assert.equal(fractionBirthImplicitDecision.passiveExpressionId, fractionBirthImplicitDecision.factorId);
assert.ok(fractionBirthImplicitDecision.operatorId);
assert.ok(fractionBirthImplicitDecision.targetId);

const fractionBirthExplicit = Atomisierer.process("x*2=10");
const fractionBirthExplicitDecision = PfadFinder.findeNaechsteAktion(fractionBirthExplicit.slice(0, 3));
assert.equal(fractionBirthExplicitDecision.family, "fraction_birth");
assert.equal(fractionBirthExplicitDecision.action, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");

const fractionBirthGrouped = Atomisierer.process("(2+1)x=10");
const fractionBirthGroupedDecision = PfadFinder.findeNaechsteAktion(fractionBirthGrouped.slice(0, 3));
assert.equal(fractionBirthGroupedDecision.family, "fraction_birth");
assert.equal(fractionBirthGroupedDecision.action, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");
assert.ok(fractionBirthGroupedDecision.passiveExpressionId);

const fractionBirthFunction = Atomisierer.process("2sin(x)=10");
const fractionBirthFunctionDecision = PfadFinder.findeNaechsteAktion(fractionBirthFunction.slice(0, 3));
assert.equal(fractionBirthFunctionDecision.family, "fraction_birth");

const explicitFunction = Atomisierer.process("2*sin(x)=10");
const explicitFunctionDecision = PfadFinder.findeNaechsteAktion(explicitFunction.slice(0, 3));
assert.equal(explicitFunctionDecision.family, "fraction_birth");

const factorChainDecisionStruktur = Atomisierer.process("2*a*b*cos(gamma)=10");
const factorChainDecision = PfadFinder.findeNaechsteAktion(factorChainDecisionStruktur.slice(0, -2), { targetVariable: "gamma" });
assert.equal(factorChainDecision.family, "fraction_birth");
assert.equal(
    factorChainDecision.passiveExpressionIds.length,
    3,
    "Eine passive Faktorfolge wie 2ab muss als gemeinsamer Nennerausdruck erkannt werden."
);
assert.equal(
    factorChainDecision.operatorIds.length,
    3,
    "Auch die verbindenden Multiplikationsoperatoren muessen fuer die gemeinsame Faktorfolge erhalten bleiben."
);

const fractionCollapseNumber = Atomisierer.process("x/2=5");
const fractionCollapseNumberDecision = PfadFinder.findeNaechsteAktion(fractionCollapseNumber.slice(0, 1));
assert.equal(fractionCollapseNumberDecision.family, "fraction_collapse");
assert.equal(fractionCollapseNumberDecision.sourceType, "DIVISION");
assert.equal(fractionCollapseNumberDecision.inverseType, "MULTIPLICATION");
assert.equal(fractionCollapseNumberDecision.action, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
assert.equal(fractionCollapseNumberDecision.label, "Nennerausdruck zu Faktor");
assert.ok(fractionCollapseNumberDecision.passiveExpressionId);
assert.equal(fractionCollapseNumberDecision.passiveExpressionId, fractionCollapseNumberDecision.factorId);
assert.ok(fractionCollapseNumberDecision.targetId);

const fractionCollapseGrouped = Atomisierer.process("x/(2+1)=5");
const fractionCollapseGroupedDecision = PfadFinder.findeNaechsteAktion(fractionCollapseGrouped.slice(0, 1));
assert.equal(fractionCollapseGroupedDecision.family, "fraction_collapse");
assert.equal(fractionCollapseGroupedDecision.action, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
assert.ok(fractionCollapseGroupedDecision.passiveExpressionId);

const fractionCollapseFunction = Atomisierer.process("sin(x)/2=5");
const fractionCollapseFunctionDecision = PfadFinder.findeNaechsteAktion(fractionCollapseFunction.slice(0, 1));
assert.equal(fractionCollapseFunctionDecision.family, "fraction_collapse");

const fractionCollapseFunctionGrouped = Atomisierer.process("sin(x)/(2*3)=5");
const fractionCollapseFunctionGroupedDecision = PfadFinder.findeNaechsteAktion(fractionCollapseFunctionGrouped.slice(0, 1));
assert.equal(fractionCollapseFunctionGroupedDecision.family, "fraction_collapse");

const sinDecisionStruktur = Atomisierer.process("sin(x)=1");
const sinDecision = PfadFinder.findeNaechsteAktion(sinDecisionStruktur.slice(0, 1));
assert.equal(sinDecision.family, "trig_inverse");
assert.equal(sinDecision.sourceType, "FUNCTION");
assert.equal(sinDecision.sourceName, "sin");
assert.equal(sinDecision.inverseType, "FUNCTION");
assert.equal(sinDecision.inverseName, "asin");
assert.equal(sinDecision.action, "INVERT_TO_ASIN");

const cosDecisionStruktur = Atomisierer.process("cos(x)=1");
const cosDecision = PfadFinder.findeNaechsteAktion(cosDecisionStruktur.slice(0, 1));
assert.equal(cosDecision.family, "trig_inverse");
assert.equal(cosDecision.inverseName, "acos");
assert.equal(cosDecision.action, "INVERT_TO_ACOS");

const tanDecisionStruktur = Atomisierer.process("tan(x)=2");
const tanDecision = PfadFinder.findeNaechsteAktion(tanDecisionStruktur.slice(0, 1));
assert.equal(tanDecision.family, "trig_inverse");
assert.equal(tanDecision.inverseName, "atan");
assert.equal(tanDecision.action, "INVERT_TO_ATAN");

const inverseSinDecisionStruktur = Atomisierer.process("asin(x)=1");
const inverseSinDecision = PfadFinder.findeNaechsteAktion(inverseSinDecisionStruktur.slice(0, 1));
assert.equal(inverseSinDecision.family, "inverse_trig");
assert.equal(inverseSinDecision.sourceName, "asin");
assert.equal(inverseSinDecision.inverseName, "sin");
assert.equal(inverseSinDecision.action, "INVERT_TO_SIN");

const inverseCosDecisionStruktur = Atomisierer.process("acos(x)=1");
const inverseCosDecision = PfadFinder.findeNaechsteAktion(inverseCosDecisionStruktur.slice(0, 1));
assert.equal(inverseCosDecision.family, "inverse_trig");
assert.equal(inverseCosDecision.inverseName, "cos");
assert.equal(inverseCosDecision.action, "INVERT_TO_COS");

const inverseTanDecisionStruktur = Atomisierer.process("atan(x)=2");
const inverseTanDecision = PfadFinder.findeNaechsteAktion(inverseTanDecisionStruktur.slice(0, 1));
assert.equal(inverseTanDecision.family, "inverse_trig");
assert.equal(inverseTanDecision.inverseName, "tan");
assert.equal(inverseTanDecision.action, "INVERT_TO_TAN");

const passiveTrig = Atomisierer.process("sin(3)=1");
assert.equal(PfadFinder.findeNaechsteAktion(passiveTrig.slice(0, 1)), null);

const passiveInverseTrig = Atomisierer.process("asin(3)=1");
assert.equal(PfadFinder.findeNaechsteAktion(passiveInverseTrig.slice(0, 1)), null);

const rootStruktur = Atomisierer.process("sqrt(x)=5");
const rootDecision = PfadFinder.findeNaechsteAktion(rootStruktur.slice(0, 1));
assert.equal(rootDecision.family, "root_power");
assert.equal(rootDecision.sourceType, "ROOT");
assert.equal(rootDecision.inverseType, "POWER");
assert.equal(rootDecision.action, "INVERT_TO_POWER");
assert.equal(rootDecision.label, "Wurzel knacken");
assert.equal(rootDecision.inversionDegree, 2);
assert.equal(rootDecision.argumentScope, "whole_opposite_side");
assert.ok(rootDecision.targetId);

const powerStruktur = Atomisierer.process("x^2=9");
const powerDecision = PfadFinder.findeNaechsteAktion(powerStruktur.slice(0, 1));
assert.equal(powerDecision.family, "root_power");
assert.equal(powerDecision.sourceType, "POWER");
assert.equal(powerDecision.inverseType, "ROOT");
assert.equal(powerDecision.action, "INVERT_TO_ROOT");
assert.equal(powerDecision.label, "Potenz knacken");
assert.equal(powerDecision.inversionDegree, 2);
assert.equal(powerDecision.argumentScope, "whole_opposite_side");
assert.ok(powerDecision.targetId);

const groupedRootStruktur = Atomisierer.process("sqrt(x+1)=5");
const groupedDecision = PfadFinder.findeNaechsteAktion(groupedRootStruktur.slice(0, 1));
assert.equal(groupedDecision.family, "root_power");
assert.equal(groupedDecision.sourceType, "ROOT");

const constantRoot = Atomisierer.process("sqrt(9)=5");
assert.equal(PfadFinder.findeNaechsteAktion(constantRoot.slice(0, 1)), null);

const constantMultiplication = Atomisierer.process("2*3=10");
assert.equal(PfadFinder.findeNaechsteAktion(constantMultiplication.slice(0, 3)), null);

const constantDivision = Atomisierer.process("9/3=5");
assert.equal(PfadFinder.findeNaechsteAktion(constantDivision.slice(0, 1)), null);

powerStruktur[0].isVisible = false;
assert.equal(PfadFinder.findeNaechsteAktion(powerStruktur.slice(0, 1)), null);

console.log("✅ P2 Validierung erfolgreich.");
