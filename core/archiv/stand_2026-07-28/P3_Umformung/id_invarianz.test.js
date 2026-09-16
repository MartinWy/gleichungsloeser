import assert from "node:assert/strict";
import { Atomisierer } from "../P1_Eingabe/Regelwerk.js";
import { PfadFinder } from "../P2_Strategie_Analyse/PfadFinder.js";
import { Umformer } from "./Regelwerk.js";

const groupInitial = Atomisierer.process("(x+1)=5");
const groupDecision = PfadFinder.findeNaechsteAktion(groupInitial.slice(0, 1));
const originalInnerVariableId = groupInitial[0].content[0].id;
const groupResult = Umformer.invertiere(groupInitial, groupDecision);
const releasedVariable = groupResult.find((element) => element.value === "x" && element.isBefreit === true);

assert.ok(releasedVariable, "Der Gruppeninhalt muss nach der Freilegung vorhanden sein.");
assert.equal(releasedVariable.id, originalInnerVariableId, "Die freigelegte Variable muss ihre urspruengliche ID behalten.");

const negationInitial = Atomisierer.process("-x=5");
const negationDecision = PfadFinder.findeNaechsteAktion(negationInitial.slice(0, 1));
const originalNegationVariableId = negationInitial[0].content[0].id;
const negationResult = Umformer.invertiere(negationInitial, negationDecision);
const emergedNegationVariable = negationResult.find((element) => element.isBefreit === true && element.value === "x");
const negationShell = negationResult.find((element) => element.type === "NEGATION" && element.isGenerated === true);

assert.ok(emergedNegationVariable, "Der freigelegte Ausdruck unter der Negationsschale muss vorhanden sein.");
assert.equal(emergedNegationVariable.id, originalNegationVariableId, "Der freigelegte Ausdruck unter der Negationsschale muss seine ID behalten.");
assert.ok(negationShell, "Die inverse Negationsschale muss eine stabile generierte ID erhalten.");
assert.equal(negationShell.originTargetId, negationDecision.targetId);

const subtrahendInitial = Atomisierer.process("2-x=5");
const subtrahendDecision = PfadFinder.findeNaechsteAktion(subtrahendInitial.slice(0, 3));
const originalSubtrahendVariableId = subtrahendInitial[2].id;
const subtrahendResult = Umformer.invertiere(subtrahendInitial, subtrahendDecision);
const generatedSubtrahendNegation = subtrahendResult.find((element) => element.type === "NEGATION" && element.isGenerated === true);
const generatedSubtrahendShell = subtrahendResult.find((element) => element.type === "SUBTRACTION" && element.isGenerated === true);

assert.ok(generatedSubtrahendNegation, "Die neue Negationsschale muss entstehen.");
assert.equal(generatedSubtrahendNegation.content[0].id, originalSubtrahendVariableId, "Die Zielvariable muss in der erzeugten Negationsschale dieselbe ID behalten.");
assert.ok(generatedSubtrahendShell, "Die inverse SUBTRACTION muss entstehen.");
assert.equal(generatedSubtrahendShell.originPassiveExpressionId, subtrahendDecision.passiveExpressionId);
assert.deepEqual(generatedSubtrahendShell.originPassiveExpressionIds, subtrahendDecision.passiveExpressionIds);

const additionInitial = Atomisierer.process("x+2=5");
const additionDecision = PfadFinder.findeNaechsteAktion(additionInitial.slice(0, 3));
const originalPassiveAddId = additionInitial[2].id;
const additionResult = Umformer.invertiere(additionInitial, additionDecision);
const subtractionShell = additionResult.find((element) => element.type === "SUBTRACTION");

assert.ok(subtractionShell, "Die inverse SUBTRACTION-Schale muss vorhanden sein.");
assert.equal(subtractionShell.passive[0].id, originalPassiveAddId, "Der Summand muss seine ID in der inversen Rolle behalten.");
assert.equal(subtractionShell.originPassiveExpressionId, originalPassiveAddId, "Die Herkunft des Summanden muss erhalten bleiben.");

const subtractionInitial = Atomisierer.process("x-(2+1)=5");
const subtractionDecision = PfadFinder.findeNaechsteAktion(subtractionInitial.slice(0, 3));
const originalPassiveSubId = subtractionInitial[2].id;
const subtractionResult = Umformer.invertiere(subtractionInitial, subtractionDecision);
const additionShell = subtractionResult.find((element) => element.type === "ADDITION");

assert.ok(additionShell, "Die inverse ADDITION-Schale muss vorhanden sein.");
assert.equal(additionShell.passive[0].id, originalPassiveSubId, "Der Subtrahend muss seine ID in der inversen Rolle behalten.");
assert.equal(additionShell.originPassiveExpressionId, originalPassiveSubId, "Die Herkunft des Subtrahenden muss erhalten bleiben.");

const trigInitial = Atomisierer.process("sin(x)=1");
const trigDecision = PfadFinder.findeNaechsteAktion(trigInitial.slice(0, 1));
const originalTrigVariableId = trigInitial[0].content[0].id;
const trigResult = Umformer.invertiere(trigInitial, trigDecision);
const emergedTrigVariable = trigResult.find((element) => element.isBefreit === true && element.value === "x");
const trigInverseShell = trigResult.find((element) => element.type === "FUNCTION" && element.name === "asin" && element.isGenerated === true);

assert.ok(emergedTrigVariable, "Das freigelegte trigonometrische Argument muss vorhanden sein.");
assert.equal(emergedTrigVariable.id, originalTrigVariableId, "Das trigonometrische Argument muss seine ID behalten.");
assert.ok(trigInverseShell, "Die inverse trigonometrische Funktion muss eine stabile generierte ID erhalten.");
assert.equal(trigInverseShell.originTargetId, trigDecision.targetId);

const inverseTrigInitial = Atomisierer.process("asin(x)=1");
const inverseTrigDecision = PfadFinder.findeNaechsteAktion(inverseTrigInitial.slice(0, 1));
const originalInverseTrigVariableId = inverseTrigInitial[0].content[0].id;
const inverseTrigResult = Umformer.invertiere(inverseTrigInitial, inverseTrigDecision);
const emergedInverseTrigVariable = inverseTrigResult.find((element) => element.isBefreit === true && element.value === "x");
const directTrigShell = inverseTrigResult.find((element) => element.type === "FUNCTION" && element.name === "sin" && element.isGenerated === true);

assert.ok(emergedInverseTrigVariable, "Das freigelegte inverse trigonometrische Argument muss vorhanden sein.");
assert.equal(emergedInverseTrigVariable.id, originalInverseTrigVariableId, "Das inverse trigonometrische Argument muss seine ID behalten.");
assert.ok(directTrigShell, "Die direkte trigonometrische Funktion muss eine stabile generierte ID erhalten.");
assert.equal(directTrigShell.originTargetId, inverseTrigDecision.targetId);

const initial = Atomisierer.process("sqrt(x)=5");
const entscheidung = PfadFinder.findeNaechsteAktion(initial.slice(0, 1));
const originalVariableId = initial[0].content[0].id;
const expectedInverseShellId = `generated-root_power-power-from-${entscheidung.targetId}`;
const result = Umformer.invertiere(initial, entscheidung);
const emergedVariable = result.find((element) => element.isBefreit === true && element.value === "x");
const inverseShell = result.find((element) => element.id === expectedInverseShellId);

assert.ok(emergedVariable, "Die befreite Variable muss vorhanden sein.");
assert.equal(emergedVariable.id, originalVariableId, "Die Variable muss ihre ID behalten.");
assert.ok(inverseShell, "Die inverse Schale muss eine stabile generierte ID erhalten.");
assert.equal(inverseShell.originTargetId, entscheidung.targetId);

const fractionBirthInitial = Atomisierer.process("(2+1)x=10");
const fractionBirthDecision = PfadFinder.findeNaechsteAktion(fractionBirthInitial.slice(0, 3));
const originalPassiveExpressionId = fractionBirthInitial[0].id;
const fractionBirthResult = Umformer.invertiere(fractionBirthInitial, fractionBirthDecision);
const divisionShell = fractionBirthResult.find((element) => element.type === "DIVISION");

assert.ok(divisionShell, "Die inverse DIVISION-Schale muss vorhanden sein.");
assert.equal(divisionShell.denominator[0].id, originalPassiveExpressionId, "Der passive Ausdruck muss seine ID in der Nennerrolle behalten.");
assert.equal(divisionShell.originPassiveExpressionId, originalPassiveExpressionId, "Die Herkunft des passiven Ausdrucks muss erhalten bleiben.");
assert.equal(divisionShell.originFactorId, originalPassiveExpressionId, "Der Kompatibilitaetsalias muss dieselbe Herkunft tragen.");

const fractionCollapseInitial = Atomisierer.process("x/(2+1)=5");
const fractionCollapseDecision = PfadFinder.findeNaechsteAktion(fractionCollapseInitial.slice(0, 1));
const originalDenominatorExpressionId = fractionCollapseInitial[0].denominator[0].id;
const fractionCollapseResult = Umformer.invertiere(fractionCollapseInitial, fractionCollapseDecision);
const multiplicationShell = fractionCollapseResult.find((element) => element.type === "MULTIPLICATION");

assert.ok(multiplicationShell, "Die inverse MULTIPLICATION-Schale muss vorhanden sein.");
assert.equal(multiplicationShell.factor[0].id, originalDenominatorExpressionId, "Der Nennerausdruck muss seine ID in der Faktorrolle behalten.");
assert.equal(multiplicationShell.originPassiveExpressionId, originalDenominatorExpressionId, "Die Herkunft des Nennerausdrucks muss erhalten bleiben.");
assert.equal(multiplicationShell.originFactorId, originalDenominatorExpressionId, "Der Kompatibilitaetsalias muss dieselbe Herkunft tragen.");

console.log("✅ P3 ID-Invarianz erfolgreich.");
