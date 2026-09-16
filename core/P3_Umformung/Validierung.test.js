import assert from "node:assert/strict";
import { Atomisierer } from "../P1_Eingabe/Regelwerk.js";
import { PfadFinder } from "../P2_Strategie_Analyse/PfadFinder.js";
import { Umformer } from "./Regelwerk.js";

const redundantGroupedAdditionStruktur = Atomisierer.process("(x+1)=5");
const redundantGroupedAdditionEntscheidung = PfadFinder.findeNaechsteAktion(redundantGroupedAdditionStruktur.slice(0, 3));
const redundantGroupedAdditionResult = Umformer.invertiere(redundantGroupedAdditionStruktur, redundantGroupedAdditionEntscheidung);
const visibleAdditionVariable = redundantGroupedAdditionResult.find((element) => element.value === "x" && element.isVisible !== false);
const hiddenAdditionOperatorSimple = redundantGroupedAdditionResult.find((element) => element.id === redundantGroupedAdditionEntscheidung.operatorId);
const hiddenAdditionPassiveSimple = redundantGroupedAdditionResult.find((element) => element.id === redundantGroupedAdditionEntscheidung.passiveExpressionId);
const simpleSubtractionShell = redundantGroupedAdditionResult.find((element) => element.type === "SUBTRACTION" && element.isGenerated === true);

assert.ok(visibleAdditionVariable, "Redundante Aussengruppen duerfen vor der P3-Umformung schon verschwunden sein, die Zielvariable bleibt direkt sichtbar.");
assert.ok(hiddenAdditionOperatorSimple && hiddenAdditionOperatorSimple.isVisible === false, "Der additive Operator muss in P3 als Spur ausgeblendet werden.");
assert.ok(hiddenAdditionPassiveSimple && hiddenAdditionPassiveSimple.isVisible === false, "Der passive Summand muss in P3 auf die Gegenseite wandern.");
assert.ok(simpleSubtractionShell, "Die inverse Subtraktionsschale muss auch nach dem Entfernen redundanter Aussengruppen entstehen.");

const negationStruktur = Atomisierer.process("-x=5");
const negationEntscheidung = PfadFinder.findeNaechsteAktion(negationStruktur.slice(0, 1));
const negationResult = Umformer.invertiere(negationStruktur, negationEntscheidung);
const hiddenNegation = negationResult.find((element) => element.id === negationEntscheidung.targetId);
const emergedNegationVariable = negationResult.find((element) => element.value === "x" && element.isBefreit === true);
const generatedNegation = negationResult.find((element) => element.type === "NEGATION" && element.isGenerated === true);
const expectedNegationId = `generated-negative_sign_release-negation-from-${negationEntscheidung.targetId}`;

assert.ok(hiddenNegation && hiddenNegation.isVisible === false, "Die Negationsschale muss als Spur unsichtbar werden.");
assert.equal(hiddenNegation.formerRole, "negation_shell");
assert.ok(emergedNegationVariable, "Der aktive Ausdruck unter der Negationsschale muss freigelegt werden.");
assert.ok(generatedNegation, "Auf der Gegenseite muss eine inverse Negationsschale entstehen.");
assert.equal(generatedNegation.id, expectedNegationId);
assert.equal(generatedNegation.generatedByFamily, "negative_sign_release");
assert.equal(generatedNegation.generatedByAction, "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE");
assert.equal(generatedNegation.content[0].value, "5");

const rightNegationStruktur = Atomisierer.process("5=-x");
const rightNegationEntscheidung = { ...PfadFinder.findeNaechsteAktion(rightNegationStruktur.slice(2)), equationSide: "right" };
const rightNegationResult = Umformer.invertiere(rightNegationStruktur, rightNegationEntscheidung);
const rightGeneratedNegation = rightNegationResult.find((element) => element.type === "NEGATION" && element.isGenerated === true);
const rightEmergedVariable = rightNegationResult.find((element) => element.value === "x" && element.isBefreit === true);

assert.ok(rightGeneratedNegation, "Auch rechts muss die inverse Negationsschale auf der Gegenseite entstehen.");
assert.ok(rightEmergedVariable, "Auch rechts muss der aktive Ausdruck freigelegt werden.");
assert.equal(rightGeneratedNegation.content[0].value, "5");

const additionStruktur = Atomisierer.process("2*x+3=5");
const additionEntscheidung = PfadFinder.findeNaechsteAktion(additionStruktur.slice(0, 5));
const additionResult = Umformer.invertiere(additionStruktur, additionEntscheidung);
const hiddenAdditionOperator = additionResult.find((element) => element.id === additionEntscheidung.operatorId);
const hiddenAdditionPassive = additionResult.find((element) => element.id === additionEntscheidung.passiveExpressionId);
const emergedAdditionTarget = additionResult.find((element) => element.value === "x" && element.isBefreit === true);
const subtractionShell = additionResult.find((element) => element.type === "SUBTRACTION");
const expectedSubtractionId = `generated-addition_release-subtraction-from-${additionEntscheidung.passiveExpressionIds.join("__")}`;

assert.ok(hiddenAdditionOperator && hiddenAdditionOperator.isVisible === false, "Der additive Quelloperator muss als Spur unsichtbar werden.");
assert.ok(hiddenAdditionPassive && hiddenAdditionPassive.isVisible === false, "Der passive Summand muss als Spur unsichtbar werden.");
assert.ok(emergedAdditionTarget, "Der aktive Ausdruck muss freigelegt werden.");
assert.ok(subtractionShell, "Die inverse SUBTRACTION-Schale muss entstehen.");
assert.equal(subtractionShell.id, expectedSubtractionId);
assert.equal(subtractionShell.generatedByFamily, "addition_release");
assert.equal(subtractionShell.generatedByAction, "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION");
assert.deepEqual(subtractionShell.originPassiveExpressionIds, additionEntscheidung.passiveExpressionIds);
assert.equal(subtractionShell.passive[0].value, "3");
assert.equal(subtractionShell.content[0].value, "5");

const subtractionStruktur = Atomisierer.process("x-(2+1)=5");
const subtractionEntscheidung = PfadFinder.findeNaechsteAktion(subtractionStruktur.slice(0, 3));
const subtractionResult = Umformer.invertiere(subtractionStruktur, subtractionEntscheidung);
const hiddenSubtractionOperator = subtractionResult.find((element) => element.id === subtractionEntscheidung.operatorId);
const hiddenSubtractionPassive = subtractionResult.find((element) => element.id === subtractionEntscheidung.passiveExpressionId);
const emergedSubtractionTarget = subtractionResult.find((element) => element.value === "x" && element.isBefreit === true);
const additionShell = subtractionResult.find((element) => element.type === "ADDITION");
const expectedAdditionId = `generated-subtraction_release-addition-from-${subtractionEntscheidung.passiveExpressionIds.join("__")}`;

assert.ok(hiddenSubtractionOperator && hiddenSubtractionOperator.isVisible === false, "Der Subtraktionsoperator muss als Spur unsichtbar werden.");
assert.ok(hiddenSubtractionPassive && hiddenSubtractionPassive.isVisible === false, "Der passive Subtrahend muss als Spur unsichtbar werden.");
assert.ok(emergedSubtractionTarget, "Der aktive Ausdruck muss freigelegt werden.");
assert.ok(additionShell, "Die inverse ADDITION-Schale muss entstehen.");
assert.equal(additionShell.id, expectedAdditionId);
assert.equal(additionShell.generatedByFamily, "subtraction_release");
assert.equal(additionShell.generatedByAction, "MOVE_PASSIVE_EXPRESSION_TO_ADDITION");
assert.deepEqual(additionShell.originPassiveExpressionIds, subtractionEntscheidung.passiveExpressionIds);
assert.equal(additionShell.passive[0].type, "GROUP");

const subtrahendStruktur = Atomisierer.process("2-x=5");
const subtrahendEntscheidung = PfadFinder.findeNaechsteAktion(subtrahendStruktur.slice(0, 3));
const subtrahendResult = Umformer.invertiere(subtrahendStruktur, subtrahendEntscheidung);
const hiddenSubtrahendPassive = subtrahendResult.find((element) => element.id === subtrahendEntscheidung.passiveExpressionId);
const hiddenSubtrahendOperator = subtrahendResult.find((element) => element.id === subtrahendEntscheidung.operatorId);
const generatedActiveNegation = subtrahendResult.find((element) => element.type === "NEGATION" && element.isGenerated === true);
const generatedOppositeSubtraction = subtrahendResult.find((element) => element.type === "SUBTRACTION" && element.isGenerated === true);
const expectedSubtrahendNegationId = `generated-subtrahend_release-negation-from-${subtrahendEntscheidung.targetId}`;
const expectedSubtrahendShellId = `generated-subtrahend_release-subtraction-from-${subtrahendEntscheidung.passiveExpressionIds.join("__")}`;

assert.ok(hiddenSubtrahendPassive && hiddenSubtrahendPassive.isVisible === false, "Der passive Minuend muss als Spur unsichtbar werden.");
assert.ok(hiddenSubtrahendOperator && hiddenSubtrahendOperator.isVisible === false, "Der aeussere Subtraktionsoperator muss als Spur unsichtbar werden.");
assert.ok(generatedActiveNegation, "Auf der aktiven Seite muss eine neue sichtbare Negationsschale entstehen.");
assert.ok(generatedOppositeSubtraction, "Auf der Gegenseite muss eine inverse SUBTRACTION entstehen.");
assert.equal(generatedActiveNegation.id, expectedSubtrahendNegationId);
assert.equal(generatedActiveNegation.generatedByFamily, "subtrahend_release");
assert.equal(generatedActiveNegation.content[0].value, "x");
assert.equal(generatedActiveNegation.content[0].id, subtrahendEntscheidung.targetId);
assert.equal(generatedOppositeSubtraction.id, expectedSubtrahendShellId);
assert.equal(generatedOppositeSubtraction.generatedByAction, "MOVE_MINUEND_TO_SUBTRACTION");
assert.equal(generatedOppositeSubtraction.passive[0].value, "2");
assert.equal(generatedOppositeSubtraction.content[0].value, "5");

const trigStruktur = Atomisierer.process("sin(x)=1");
const trigEntscheidung = PfadFinder.findeNaechsteAktion(trigStruktur.slice(0, 1));
const trigResult = Umformer.invertiere(trigStruktur, trigEntscheidung);
const hiddenTrigShell = trigResult.find((element) => element.id === trigEntscheidung.targetId);
const emergedTrigVariable = trigResult.find((element) => element.value === "x" && element.isBefreit === true);
const trigInverseShell = trigResult.find((element) => element.type === "FUNCTION" && element.name === "asin" && element.isGenerated === true);
const expectedTrigInverseId = `generated-trig_inverse-function-from-${trigEntscheidung.targetId}`;

assert.ok(hiddenTrigShell && hiddenTrigShell.isVisible === false, "Die trigonometrische Quellfunktion muss als Spur unsichtbar werden.");
assert.equal(hiddenTrigShell.formerRole, "function_shell");
assert.ok(emergedTrigVariable, "Das freigelegte Funktionsargument muss sichtbar bleiben.");
assert.ok(trigInverseShell, "Die inverse trigonometrische Funktion muss auf der Gegenseite entstehen.");
assert.equal(trigInverseShell.id, expectedTrigInverseId);
assert.equal(trigInverseShell.originTargetId, trigEntscheidung.targetId);
assert.equal(trigInverseShell.originSourceType, "FUNCTION");
assert.equal(trigInverseShell.originSourceName, "sin");
assert.equal(trigInverseShell.inverseName, "asin");
assert.equal(trigInverseShell.generatedByFamily, "trig_inverse");
assert.equal(trigInverseShell.generatedByAction, "INVERT_TO_ASIN");
assert.equal(trigInverseShell.content[0].value, "1");

const inverseTrigStruktur = Atomisierer.process("asin(x)=1");
const inverseTrigEntscheidung = PfadFinder.findeNaechsteAktion(inverseTrigStruktur.slice(0, 1));
const inverseTrigResult = Umformer.invertiere(inverseTrigStruktur, inverseTrigEntscheidung);
const hiddenInverseTrigShell = inverseTrigResult.find((element) => element.id === inverseTrigEntscheidung.targetId);
const emergedInverseTrigVariable = inverseTrigResult.find((element) => element.value === "x" && element.isBefreit === true);
const directTrigShell = inverseTrigResult.find((element) => element.type === "FUNCTION" && element.name === "sin" && element.isGenerated === true);
const expectedDirectTrigId = `generated-inverse_trig-function-from-${inverseTrigEntscheidung.targetId}`;

assert.ok(hiddenInverseTrigShell && hiddenInverseTrigShell.isVisible === false, "Die inverse trigonometrische Quellfunktion muss als Spur unsichtbar werden.");
assert.equal(hiddenInverseTrigShell.formerRole, "function_shell");
assert.ok(emergedInverseTrigVariable, "Das freigelegte inverse trigonometrische Argument muss sichtbar bleiben.");
assert.ok(directTrigShell, "Die direkte trigonometrische Funktion muss auf der Gegenseite entstehen.");
assert.equal(directTrigShell.id, expectedDirectTrigId);
assert.equal(directTrigShell.originTargetId, inverseTrigEntscheidung.targetId);
assert.equal(directTrigShell.originSourceType, "FUNCTION");
assert.equal(directTrigShell.originSourceName, "asin");
assert.equal(directTrigShell.inverseName, "sin");
assert.equal(directTrigShell.generatedByFamily, "inverse_trig");
assert.equal(directTrigShell.generatedByAction, "INVERT_TO_SIN");
assert.equal(directTrigShell.content[0].value, "1");

const rootStruktur = Atomisierer.process("sqrt(x)=5");
const rootEntscheidung = PfadFinder.findeNaechsteAktion(rootStruktur.slice(0, 1));
const rootResult = Umformer.invertiere(rootStruktur, rootEntscheidung);
const expectedInverseShellId = `generated-root_power-power-from-${rootEntscheidung.targetId}`;

const hiddenRoot = rootResult.find((element) => element.type === "ROOT" && element.isVisible === false);
const emergedVariable = rootResult.find((element) => element.isBefreit === true && element.value === "x");
const inverseShell = rootResult.find((element) => element.type === "POWER");

assert.ok(hiddenRoot, "Die urspruengliche Wurzel muss unsichtbar werden.");
assert.ok(emergedVariable, "Die Zielvariable muss als befreit markiert sein.");
assert.ok(inverseShell, "Die inverse Potenzschale muss entstehen.");
assert.equal(inverseShell.id, expectedInverseShellId);
assert.equal(inverseShell.exponent, rootEntscheidung.inversionDegree);
assert.equal(inverseShell.content[0].value, "5");
assert.equal(inverseShell.originTargetId, rootEntscheidung.targetId);
assert.equal(inverseShell.originSourceType, "ROOT");
assert.equal(inverseShell.generatedByFamily, "root_power");
assert.equal(inverseShell.generatedByAction, "INVERT_TO_POWER");
assert.equal(inverseShell.argumentScope, "whole_opposite_side");
assert.equal(inverseShell.isGenerated, true);
assert.equal(rootStruktur[0].isVisible, true, "Die Eingabestruktur darf nicht direkt mutiert werden.");

const rightRootStruktur = Atomisierer.process("5=sqrt(x)");
const rightRootEntscheidung = { ...PfadFinder.findeNaechsteAktion(rightRootStruktur.slice(2)), equationSide: "right" };
const rightRootResult = Umformer.invertiere(rightRootStruktur, rightRootEntscheidung);
const rightRootGeneratedPower = rightRootResult.find((element) => element.type === "POWER" && element.isGenerated === true);
const rightRootHiddenShell = rightRootResult.find((element) => element.id === rightRootEntscheidung.targetId);
const rightRootEmergedVariable = rightRootResult.find((element) => element.value === "x" && element.isBefreit === true);

assert.ok(rightRootGeneratedPower, "Auch bei rechter Zielseite muss die inverse Potenzschale auf der Gegenseite entstehen.");
assert.ok(rightRootHiddenShell && rightRootHiddenShell.isVisible === false, "Auch rechts muss die Quellschale als Spur unsichtbar werden.");
assert.ok(rightRootEmergedVariable, "Auch rechts muss die Zielvariable freigelegt werden.");
assert.equal(rightRootGeneratedPower.content[0].value, "5");


const fractionBirthStruktur = Atomisierer.process("2x=10");
const fractionBirthEntscheidung = PfadFinder.findeNaechsteAktion(fractionBirthStruktur.slice(0, 3));
const fractionBirthResult = Umformer.invertiere(fractionBirthStruktur, fractionBirthEntscheidung);
const hiddenPassiveExpression = fractionBirthResult.find((element) => element.id === fractionBirthEntscheidung.passiveExpressionId);
const hiddenOperator = fractionBirthResult.find((element) => element.id === fractionBirthEntscheidung.operatorId);
const emergedTarget = fractionBirthResult.find((element) => element.id === fractionBirthEntscheidung.targetId);
const divisionShell = fractionBirthResult.find((element) => element.type === "DIVISION");
const expectedDivisionId = `generated-fraction_birth-division-from-${fractionBirthEntscheidung.passiveExpressionIds.join("__")}`;

assert.ok(hiddenPassiveExpression && hiddenPassiveExpression.isVisible === false, "Der passive Quellausdruck muss als Spur unsichtbar werden.");
assert.ok(hiddenOperator && hiddenOperator.isVisible === false, "Der Multiplikationsoperator muss als Spur unsichtbar werden.");
assert.ok(emergedTarget && emergedTarget.isBefreit === true, "Der Zielausdruck muss als freigelegt markiert werden.");
assert.ok(divisionShell, "Die inverse DIVISION-Schale muss entstehen.");
assert.equal(divisionShell.id, expectedDivisionId);
assert.equal(divisionShell.generatedByFamily, "fraction_birth");
assert.equal(divisionShell.generatedByAction, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");
assert.equal(divisionShell.originPassiveExpressionId, fractionBirthEntscheidung.passiveExpressionId);
assert.equal(divisionShell.originFactorId, fractionBirthEntscheidung.passiveExpressionId);
assert.equal(divisionShell.originTargetId, fractionBirthEntscheidung.targetId);
assert.equal(divisionShell.denominator[0].value, "2");
assert.equal(divisionShell.numerator[0].value, "10");

const negativeFractionBirthStruktur = Atomisierer.process("-2*a*b*cos(gamma)=10");
const negativeFractionBirthEntscheidung = PfadFinder.findeNaechsteAktion(negativeFractionBirthStruktur.slice(0, 1), { targetVariable: "gamma" });
const negativeFractionBirthResult = Umformer.invertiere(negativeFractionBirthStruktur, negativeFractionBirthEntscheidung);
const hiddenNegativeContainer = negativeFractionBirthResult.find((element) => element.id === negativeFractionBirthEntscheidung.containerTargetId);
const emergedNegativeTarget = negativeFractionBirthResult.find((element) => element.id === negativeFractionBirthEntscheidung.targetId && element.isBefreit === true);
const negativeDivisionShell = negativeFractionBirthResult.find((element) => element.type === "DIVISION" && element.isGenerated === true);

assert.ok(hiddenNegativeContainer && hiddenNegativeContainer.isVisible === false, "Eine negative Produktkette muss als Quelle unsichtbar werden.");
assert.ok(emergedNegativeTarget, "Der Zielterm innerhalb der negativen Produktkette muss freigelegt werden.");
assert.ok(negativeDivisionShell, "Aus einer negativen Produktkette muss eine Division entstehen.");
assert.equal(negativeDivisionShell.denominator[0]?.type, "NEGATION");
assert.deepEqual(
    negativeDivisionShell.denominator[0]?.content?.map((element) => element.value || element.type),
    ["2", "a", "b"],
    "Der Nenner muss den gesamten negativen Faktorblock -2ab tragen."
);

const fractionCollapseStruktur = Atomisierer.process("x/2=5");
const fractionCollapseEntscheidung = PfadFinder.findeNaechsteAktion(fractionCollapseStruktur.slice(0, 1));
const fractionCollapseResult = Umformer.invertiere(fractionCollapseStruktur, fractionCollapseEntscheidung);
const hiddenDivision = fractionCollapseResult.find((element) => element.id === fractionCollapseEntscheidung.targetId);
const emergedNumerator = fractionCollapseResult.find((element) => element.value === "x" && element.isBefreit === true);
const multiplicationShell = fractionCollapseResult.find((element) => element.type === "MULTIPLICATION");
const expectedMultiplicationId = `generated-fraction_collapse-multiplication-from-${fractionCollapseEntscheidung.passiveExpressionIds.join("__")}`;

assert.ok(hiddenDivision && hiddenDivision.isVisible === false, "Die Ausgangs-DIVISION muss als Spur unsichtbar werden.");
assert.ok(emergedNumerator, "Der Zaehler muss als freigelegt markiert werden.");
assert.ok(multiplicationShell, "Die inverse MULTIPLICATION-Schale muss entstehen.");
assert.equal(multiplicationShell.id, expectedMultiplicationId);
assert.equal(multiplicationShell.generatedByFamily, "fraction_collapse");
assert.equal(multiplicationShell.generatedByAction, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
assert.equal(multiplicationShell.originPassiveExpressionId, fractionCollapseEntscheidung.passiveExpressionId);
assert.equal(multiplicationShell.originFactorId, fractionCollapseEntscheidung.passiveExpressionId);
assert.equal(multiplicationShell.originTargetId, fractionCollapseEntscheidung.targetId);
assert.equal(multiplicationShell.factor[0].value, "2");
assert.equal(multiplicationShell.content[0].value, "5");
assert.equal(multiplicationShell.flowDirection, "ltr", "Standardmaessig soll ein neuer Faktor auf der rechten Seite hinter dem vorhandenen Inhalt entstehen.");

const prefixedFractionCollapseResult = Umformer.invertiere(
    fractionCollapseStruktur,
    {
        ...fractionCollapseEntscheidung,
        equationSide: "left",
        oppositeEquationSide: "right"
    },
    { rightSideFactorPlacement: "prefix" }
);
const prefixedMultiplicationShell = prefixedFractionCollapseResult.find((element) => element.type === "MULTIPLICATION");
assert.equal(prefixedMultiplicationShell?.flowDirection, "rtl", "Die Rechtsseiten-Policy muss denselben Nenner optional auch vor den rechten Gegenausdruck setzen koennen.");

const groupedFractionCollapseStruktur = Atomisierer.process("(x+3)/(2+1)=5");
const groupedFractionCollapseEntscheidung = PfadFinder.findeNaechsteAktion(groupedFractionCollapseStruktur.slice(0, 1));
const groupedFractionCollapseResult = Umformer.invertiere(groupedFractionCollapseStruktur, groupedFractionCollapseEntscheidung);
const groupedHiddenDivision = groupedFractionCollapseResult.find((element) => element.id === groupedFractionCollapseEntscheidung.targetId);
const groupedReleasedVariable = groupedFractionCollapseResult.find((element) => element.value === "x" && element.isBefreit === true);
const groupedReleasedOperator = groupedFractionCollapseResult.find((element) => element.value === "+" && element.isBefreit === true);
const groupedReleasedPassive = groupedFractionCollapseResult.find((element) => element.value === "3" && element.isBefreit === true);
const groupedReleasedWrapper = groupedFractionCollapseResult.find((element) => element.id === groupedFractionCollapseEntscheidung.targetExpressionIds[0] && element.isVisible !== false);
const groupedMultiplicationShell = groupedFractionCollapseResult.find((element) => element.type === "MULTIPLICATION");

assert.ok(groupedHiddenDivision && groupedHiddenDivision.isVisible === false, "Auch die gruppierte Ausgangs-DIVISION muss als Spur unsichtbar werden.");
assert.ok(groupedReleasedVariable, "Ein gruppierter Zaehler soll nach fraction_collapse seine Zielvariable direkt freilegen.");
assert.ok(groupedReleasedOperator, "Ein gruppierter Zaehler soll seine inneren Operatoren direkt freilegen.");
assert.ok(groupedReleasedPassive, "Ein gruppierter Zaehler soll auch seine restlichen Atome direkt freilegen.");
assert.equal(groupedReleasedWrapper, undefined, "Die reine Schutzgruppe des Zaehlers darf nach fraction_collapse nicht als sichtbare Huelle stehen bleiben.");
assert.ok(groupedMultiplicationShell, "Auch beim gruppierten Nenner muss die inverse MULTIPLICATION-Schale entstehen.");
assert.equal(groupedMultiplicationShell.factor[0].type, "GROUP", "Der Nenner soll rechts als Faktorgruppe erhalten bleiben, wenn er eine Summe ist.");

const denominatorTargetStruktur = Atomisierer.process("2/x=5");
const denominatorTargetEntscheidung = PfadFinder.findeNaechsteAktion(denominatorTargetStruktur.slice(0, 1));
const denominatorTargetResult = Umformer.invertiere(denominatorTargetStruktur, denominatorTargetEntscheidung);
const hiddenDenominatorDivision = denominatorTargetResult.find((element) => element.id === denominatorTargetEntscheidung.targetId);
const releasedDenominatorNumerator = denominatorTargetResult.find((element) => element.value === "2" && element.isBefreit === true);
const denominatorMultiplicationShell = denominatorTargetResult.find((element) => element.type === "MULTIPLICATION" && element.isGenerated === true);
const expectedDenominatorMultiplicationId = `generated-fraction_denominator_release-multiplication-from-${denominatorTargetEntscheidung.passiveExpressionIds.join("__")}`;
const denominatorAnchorIndex = denominatorTargetResult.findIndex((element) => element.value === "=");
const denominatorFollowDecision = PfadFinder.findeNaechsteAktion(denominatorTargetResult.slice(denominatorAnchorIndex + 1));

assert.ok(hiddenDenominatorDivision && hiddenDenominatorDivision.isVisible === false, "Beim Nennerziel muss die Quell-DIVISION als Spur unsichtbar werden.");
assert.ok(releasedDenominatorNumerator, "Beim Nennerziel muss der passive Zaehler freigelegt werden.");
assert.ok(denominatorMultiplicationShell, "Beim Nennerziel muss auf der Gegenseite eine aktive MULTIPLICATION entstehen.");
assert.equal(denominatorMultiplicationShell.id, expectedDenominatorMultiplicationId);
assert.equal(denominatorMultiplicationShell.generatedByFamily, "fraction_denominator_release");
assert.equal(denominatorMultiplicationShell.generatedByAction, "MOVE_DENOMINATOR_TARGET_TO_FACTOR");
assert.equal(denominatorMultiplicationShell.factor[0].value, "x");
assert.equal(denominatorMultiplicationShell.content[0].value, "5");
assert.equal(denominatorFollowDecision?.family, "fraction_birth", "Die entstehende Multiplikationsschale muss direkt wieder als aktive Bruchgeburt lesbar sein.");
assert.equal(denominatorFollowDecision?.targetCollectionKey, "factor");

const mirroredFractionCollapseStruktur = Atomisierer.process("5=x/2");
const mirroredFractionCollapseEntscheidung = PfadFinder.findeNaechsteAktion(mirroredFractionCollapseStruktur.slice(2));
const mirroredFractionCollapseResult = Umformer.invertiere(
    mirroredFractionCollapseStruktur,
    {
        ...mirroredFractionCollapseEntscheidung,
        equationSide: "right",
        oppositeEquationSide: "left"
    },
    { rightSideFactorPlacement: "suffix" }
);
const mirroredMultiplicationShell = mirroredFractionCollapseResult.find((element) => element.type === "MULTIPLICATION");
assert.equal(mirroredMultiplicationShell?.flowDirection, "rtl", "Links entstehende Faktoren bleiben von der Rechtsseiten-Policy unberuehrt.");

console.log("✅ P3 Validierung erfolgreich.");
