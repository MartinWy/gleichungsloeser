// Am 10. September 2026 als historischer Vor-Genesis-Vertrag archiviert.
import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";

const negativeResult = await GenesisCore.solve("-x=5");
assert.equal(negativeResult.schritte.length, 1, "Die isolierte Negationsschale soll genau einen Schritt erzeugen.");
assert.equal(negativeResult.schritte[0].strategie.family, "negative_sign_release");
assert.ok(negativeResult.finaleStruktur.some((element) => element.type === "NEGATION" && element.visualMode === "INVERSE_SHELL"));
assert.ok(negativeResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightNegativeResult = await GenesisCore.solve("5=-x");
assert.equal(rightNegativeResult.schritte.length, 1, "Auch rechts soll die Negationsschale genau einen Schritt erzeugen.");
assert.equal(rightNegativeResult.schritte[0].strategie.family, "negative_sign_release");
assert.equal(rightNegativeResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightNegativeResult.finaleStruktur.some((element) => element.type === "NEGATION" && element.visualMode === "INVERSE_SHELL"));
assert.ok(rightNegativeResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const negativeGroupedResult = await GenesisCore.solve("-(x+1)=5");
assert.equal(negativeGroupedResult.schritte.length, 3, "Negation vor einer geschuetzten Gruppe muss zuerst die Vorzeichenschale, dann die Gruppe und dann die Addition abbauen.");
assert.equal(negativeGroupedResult.schritte[0].strategie.family, "negative_sign_release");
assert.equal(negativeGroupedResult.schritte[1].strategie.family, "group_release");
assert.equal(negativeGroupedResult.schritte[2].strategie.family, "addition_release");

const negativeTrigResult = await GenesisCore.solve("-sin(x)=5");
assert.equal(negativeTrigResult.schritte.length, 2, "Nach dem Vorzeichenabbau muss die trigonometrische Familie weiterarbeiten.");
assert.equal(negativeTrigResult.schritte[0].strategie.family, "negative_sign_release");
assert.equal(negativeTrigResult.schritte[1].strategie.family, "trig_inverse");

const groupedAdditionResult = await GenesisCore.solve("(x+1)=5");
assert.equal(groupedAdditionResult.schritte.length, 1, "Eine redundante Aussengruppe darf keinen zusaetzlichen Loeseschritt erzeugen.");
assert.equal(groupedAdditionResult.schritte[0].strategie.family, "addition_release");
const groupedAdditionReleaseRow = groupedAdditionResult.exportData.projectionRows[1].positionedAtoms;
assert.ok(groupedAdditionReleaseRow.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(!groupedAdditionReleaseRow.some((element) => element.type === "GROUP"), "Redundante Aussengruppen sollen gar nicht erst im Projektionspfad erscheinen.");
const groupedAdditionAnchorCols = groupedAdditionResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(groupedAdditionAnchorCols[0], groupedAdditionAnchorCols[1]);
const groupedAdditionVariableId = groupedAdditionResult.exportData.theoryRows[0].atoms[0].id;
const groupedAdditionFinalTheoryRow = groupedAdditionResult.exportData.theoryRows[1].atoms;
assert.equal(groupedAdditionFinalTheoryRow.find((atom) => atom.id === groupedAdditionVariableId)?.isVisible, true, "Nach dem Additionsabbau muss die Zielvariable sichtbar bleiben.");
assert.equal(groupedAdditionFinalTheoryRow.find((atom) => atom.value === "+")?.isVisible, false, "Der Plus-Operator der geloesten Addition muss in der Theoriezeile verschwinden.");
assert.equal(groupedAdditionFinalTheoryRow.find((atom) => atom.value === "1")?.isVisible, false, "Der passive Summand muss in der Theoriezeile auf die Gegenseite gewandert sein.");
const groupedAdditionTrace = groupedAdditionResult.exportData.traceIndex[groupedAdditionVariableId];
assert.ok(groupedAdditionTrace.theory.every((entry) => entry.containerKey === null));
assert.ok(groupedAdditionTrace.projection.some((entry) => entry.visualMode === "EMERGED"));

const groupedMultiplicationResult = await GenesisCore.solve("(2*x)=10");
assert.equal(groupedMultiplicationResult.schritte.length, 1, "Eine redundante Aussengruppe vor einer Multiplikation darf keinen Extrschritt erzeugen.");
assert.equal(groupedMultiplicationResult.schritte[0].strategie.family, "fraction_birth");

const groupedDivisionResult = await GenesisCore.solve("(x/2)=5");
assert.equal(groupedDivisionResult.schritte.length, 1, "Eine redundante Aussengruppe vor einer Division darf keinen Extrschritt erzeugen.");
assert.equal(groupedDivisionResult.schritte[0].strategie.family, "fraction_collapse");

const nestedGroupResult = await GenesisCore.solve("((x))=5");
assert.equal(nestedGroupResult.schritte.length, 0, "Verschachtelte redundante Aussengruppen sollen schon in P1 verschwinden.");
assert.ok(nestedGroupResult.finaleStruktur.some((element) => element.value === "x"));

const additionResult = await GenesisCore.solve("2*x+3=5");
assert.equal(additionResult.schritte.length, 2, "Die aeussere Addition muss zuerst greifen und danach darf die innere Multiplikation weiterarbeiten.");
assert.equal(additionResult.schritte[0].strategie.family, "addition_release");
assert.equal(additionResult.schritte[0].strategie.sourceType, "ADDITION");
assert.equal(additionResult.schritte[0].strategie.inverseType, "SUBTRACTION");
assert.equal(additionResult.schritte[0].strategie.action, "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION");
assert.equal(additionResult.schritte[1].strategie.family, "fraction_birth");
assert.ok(additionResult.finaleStruktur.some((element) => element.value === "+" && element.visualMode === "GHOST_HOLE"));
assert.ok(additionResult.finaleStruktur.some((element) => element.value === "3" && element.visualMode === "GHOST_HOLE"));
assert.ok(additionResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
const additionAnchorCols = additionResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(additionAnchorCols[0], additionAnchorCols[1], "Auch in der additiven Richtung muss der Gleichheitsanker stabil bleiben.");
assert.equal(additionAnchorCols[1], additionAnchorCols[2], "Auch nach dem Folge-Schritt muss der Gleichheitsanker stabil bleiben.");
const subtractionShellId = `generated-addition_release-subtraction-from-${additionResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const subtractionShell = additionResult.exportData.atomRegister.find((atom) => atom.id === subtractionShellId);
assert.ok(subtractionShell, "Die inverse SUBTRACTION-Schale muss im Exportregister auftauchen.");
assert.equal(subtractionShell.generatedByFamily, "addition_release");
assert.equal(subtractionShell.generatedByAction, "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION");
assert.deepEqual(subtractionShell.originPassiveExpressionIds, additionResult.schritte[0].strategie.passiveExpressionIds);
const additionProjectionRow = additionResult.exportData.projectionRows[1].positionedAtoms;
const additionProjectedContent = additionProjectionRow.find((atom) => atom.sourceShellId === subtractionShellId && atom.projectionRole === "inverse_content");
const additionProjectedOperator = additionProjectionRow.find((atom) => atom.sourceShellId === subtractionShellId && atom.projectionRole === "inverse_operator");
const additionProjectedPassive = additionProjectionRow.find((atom) => atom.sourceShellId === subtractionShellId && atom.projectionRole === "inverse_passive");
assert.equal(additionProjectedOperator.value, "-");
assert.equal(additionProjectedContent.col + 1, additionProjectedOperator.col);
assert.equal(additionProjectedOperator.col + 1, additionProjectedPassive.col);

const commutativeAdditionResult = await GenesisCore.solve("2+x=5");
assert.equal(commutativeAdditionResult.schritte.length, 1, "Auch die kommutative Addition soll genau einen Schritt erzeugen.");
assert.equal(commutativeAdditionResult.schritte[0].strategie.family, "addition_release");
assert.equal(commutativeAdditionResult.schritte[0].strategie.targetSide, "right");

const subtractionResult = await GenesisCore.solve("x-(2+1)=5");
assert.equal(subtractionResult.schritte.length, 1, "Die aeussere Subtraktion soll genau einen Schritt erzeugen.");
assert.equal(subtractionResult.schritte[0].strategie.family, "subtraction_release");
assert.equal(subtractionResult.schritte[0].strategie.sourceType, "SUBTRACTION");
assert.equal(subtractionResult.schritte[0].strategie.inverseType, "ADDITION");
assert.equal(subtractionResult.schritte[0].strategie.action, "MOVE_PASSIVE_EXPRESSION_TO_ADDITION");
assert.ok(subtractionResult.finaleStruktur.some((element) => element.value === "-" && element.visualMode === "GHOST_HOLE"));
assert.ok(subtractionResult.finaleStruktur.some((element) => element.type === "GROUP" && element.visualMode === "GHOST_HOLE"));
assert.ok(subtractionResult.finaleStruktur.some((element) => element.type === "ADDITION" && element.visualMode === "INVERSE_SHELL"));
const subtractionAnchorCols = subtractionResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(subtractionAnchorCols[0], subtractionAnchorCols[1], "Auch in der Subtraktionsrichtung muss der Gleichheitsanker stabil bleiben.");
const additionShellId = `generated-subtraction_release-addition-from-${subtractionResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const additionShell = subtractionResult.exportData.atomRegister.find((atom) => atom.id === additionShellId);
assert.ok(additionShell, "Die inverse ADDITION-Schale muss im Exportregister auftauchen.");
assert.equal(additionShell.generatedByFamily, "subtraction_release");
assert.equal(additionShell.passive[0].type, "GROUP");

const subtrahendResult = await GenesisCore.solve("2-x=5");
assert.equal(subtrahendResult.schritte.length, 2, "Die Gegenrichtung 2-x=5 braucht zuerst die Subtrahend-Familie und danach die Vorzeichen-Familie.");
assert.equal(subtrahendResult.schritte[0].strategie.family, "subtrahend_release");
assert.equal(subtrahendResult.schritte[0].strategie.sourceType, "SUBTRACTION");
assert.equal(subtrahendResult.schritte[0].strategie.inverseType, "SUBTRACTION");
assert.equal(subtrahendResult.schritte[0].strategie.action, "MOVE_MINUEND_TO_SUBTRACTION");
assert.equal(subtrahendResult.schritte[1].strategie.family, "negative_sign_release");
assert.ok(subtrahendResult.exportData.projectionRows[1].positionedAtoms.some((element) => element.id === `generated-subtrahend_release-negation-from-${subtrahendResult.schritte[0].strategie.targetId}` && element.visualMode === "INVERSE_SHELL"));
assert.ok(subtrahendResult.exportData.projectionRows[1].positionedAtoms.some((element) => element.id === `generated-subtrahend_release-subtraction-from-${subtrahendResult.schritte[0].strategie.passiveExpressionIds.join("__")}` && element.visualMode === "INVERSE_SHELL"));
const subtrahendAnchorCols = subtrahendResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(subtrahendAnchorCols[0], subtrahendAnchorCols[1], "Auch beim aktiven Subtrahenden muss der Gleichheitsanker nach dem ersten Schritt stabil bleiben.");
assert.equal(subtrahendAnchorCols[1], subtrahendAnchorCols[2], "Auch nach dem Vorzeichen-Schritt muss der Gleichheitsanker stabil bleiben.");
const subtrahendNegationShellId = `generated-negative_sign_release-negation-from-generated-subtrahend_release-negation-from-${subtrahendResult.schritte[0].strategie.targetId}`;
const subtrahendFinalNegation = subtrahendResult.exportData.projectionRows[2].positionedAtoms.find((atom) => atom.id === subtrahendNegationShellId);
const subtrahendIntermediateSubtractionShellId = `generated-subtrahend_release-subtraction-from-${subtrahendResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const subtrahendIntermediateSubtraction = subtrahendResult.exportData.projectionRows[1].positionedAtoms.find((atom) => atom.id === subtrahendIntermediateSubtractionShellId);
const subtrahendInitialFive = subtrahendResult.exportData.projectionRows[0].positionedAtoms.find((atom) => atom.value === "5" && atom.isVisible !== false);
const subtrahendIntermediateFive = subtrahendResult.exportData.projectionRows[1].positionedAtoms.find((atom) => atom.value === "5" && atom.isVisible !== false);
assert.ok(subtrahendFinalNegation, "Nach dem Vorzeichenwechsel muss die inverse Negationsschale als eigener Projektionsbaustein sichtbar bleiben.");
assert.ok(subtrahendIntermediateSubtraction, "Der Zwischenschritt muss die erzeugte Subtraktionsschale als eigenen Projektionsbaustein behalten.");
assert.ok(subtrahendInitialFive, "Die Ausgangszeile muss die rechte 5 als sichtbaren Projektionsbaustein enthalten.");
assert.ok(subtrahendIntermediateFive, "Der Zwischenschritt muss die rechte 5 weiterhin als sichtbaren Projektionsbaustein enthalten.");
assert.ok(
    Number.isInteger(subtrahendFinalNegation.colStart)
    && Number.isInteger(subtrahendFinalNegation.colEnd)
    && subtrahendFinalNegation.colEnd > subtrahendFinalNegation.colStart,
    "Die inverse Negationsschale muss eine reservierte Spannbreite fuer Vorzeichen und Inhalt erhalten."
);
assert.equal(
    subtrahendInitialFive.col,
    subtrahendIntermediateFive.col,
    "Auch die urspruengliche 5 muss schon in der Startzeile an der kuenftigen rechten Blockspur stehen."
);
assert.equal(
    subtrahendIntermediateSubtraction.col,
    subtrahendFinalNegation.col + 1,
    "Beim Vorzeichenwechsel auf der rechten Seite muss die kuenftige Minus-Spalte schon im vorherigen Subtraktionsblock reserviert sein."
);

const rightSubtrahendResult = await GenesisCore.solve("5=2-x");
assert.equal(rightSubtrahendResult.schritte.length, 2, "Auch rechts soll der aktive Subtrahend zwei Schritte brauchen.");
assert.equal(rightSubtrahendResult.schritte[0].strategie.family, "subtrahend_release");
assert.equal(rightSubtrahendResult.schritte[0].strategie.equationSide, "right");
assert.equal(rightSubtrahendResult.schritte[1].strategie.family, "negative_sign_release");

const rootResult = await GenesisCore.solve("sqrt(x)=5");
assert.equal(rootResult.schritte.length, 1, "Die Wurzelgleichung sollte genau einen Schritt erzeugen.");
assert.equal(rootResult.schritte[0].strategie.family, "root_power");
assert.equal(rootResult.schritte[0].strategie.sourceType, "ROOT");
assert.equal(rootResult.schritte[0].strategie.inverseType, "POWER");
assert.equal(rootResult.schritte[0].strategie.action, "INVERT_TO_POWER");
assert.equal(rootResult.schritte[0].strategie.inversionDegree, 2);
assert.equal(rootResult.schritte[0].strategie.argumentScope, "whole_opposite_side");
assert.ok(rootResult.finaleStruktur.some((element) => element.type === "ROOT" && element.visualMode === "GHOST_HOLE"));
assert.ok(rootResult.finaleStruktur.some((element) => element.type === "POWER" && element.exponent === 2));
assert.ok(rootResult.finaleStruktur.some((element) => element.visualMode === "EMERGED"));
assert.ok(rootResult.exportData, "Der Solve-Lauf muss Exportdaten liefern.");
assert.equal(rootResult.exportData.eingabe, "sqrt(x)=5");
assert.equal(rootResult.exportData.theoryRows.length, 2, "Initialzeile plus Zielzeile muessen im Export enthalten sein.");
assert.equal(rootResult.exportData.projectionRows.length, 2, "Der Zwei-Durchlauf muss beide Zeilen projizieren.");
assert.equal(rootResult.exportData.layoutPlan.mode, "two_pass_preflight");
assert.equal(rootResult.exportData.layoutPlan.rowCount, 2);
const rootAnchorCols = rootResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(rootAnchorCols[0], rootAnchorCols[1], "Der Gleichheitsanker muss spaltenstabil bleiben.");
const rootInverseShellId = `generated-root_power-power-from-${rootResult.schritte[0].strategie.targetId}`;
const rootInverseShell = rootResult.exportData.atomRegister.find((atom) => atom.id === rootInverseShellId);
assert.ok(rootInverseShell, "Die inverse Potenzschale muss im Exportregister auftauchen.");
assert.equal(rootInverseShell.generatedByFamily, "root_power");
assert.equal(rootInverseShell.generatedByAction, "INVERT_TO_POWER");
assert.equal(rootInverseShell.originTargetId, rootResult.schritte[0].strategie.targetId);

const groupedRootResult = await GenesisCore.solve("sqrt(x+1)=5");
assert.equal(groupedRootResult.schritte.length, 2, "Nach dem Wurzel-Schritt darf die freigelegte additive Huelle weiterbearbeitet werden.");
assert.equal(groupedRootResult.schritte[0].strategie.family, "root_power");
assert.equal(groupedRootResult.schritte[1].strategie.family, "addition_release");
const groupedRootProjectionAfterRoot = groupedRootResult.exportData.projectionRows[1].positionedAtoms;
assert.ok(groupedRootProjectionAfterRoot.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(groupedRootProjectionAfterRoot.some((element) => element.value === "+" && element.visualMode === "EMERGED"));
assert.ok(groupedRootProjectionAfterRoot.some((element) => element.value === "1" && element.visualMode === "EMERGED"));

const groupedRootFractionResult = await GenesisCore.solve("sqrt(x/(2+1))=3");
assert.equal(groupedRootFractionResult.schritte.length, 2, "Eine Wurzel ueber einem gruppierten Nenner soll Wurzelabbau und danach Nennerabbau ausfuehren.");
assert.equal(groupedRootFractionResult.schritte[0].strategie.family, "root_power");
assert.equal(groupedRootFractionResult.schritte[1].strategie.family, "fraction_collapse");
const groupedRootFractionFamilies = groupedRootFractionResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(groupedRootFractionFamilies, ["root_power", "fraction_collapse"]);
const groupedRootFractionProjectionAfterRoot = groupedRootFractionResult.exportData.projectionRows[1];
assert.equal(groupedRootFractionProjectionAfterRoot.axisLocalRow, 1, "Der sichtbare Bruch nach root_power muss die Achse in der mittleren Teilzeile tragen.");
assert.equal(groupedRootFractionProjectionAfterRoot.localRowCount, 3, "Der sichtbare Bruch nach root_power muss als dreizeiliger Projektionsblock erscheinen.");
const groupedRootFractionAfterRootAtoms = groupedRootFractionProjectionAfterRoot.positionedAtoms;
const groupedRootFractionLine = groupedRootFractionAfterRootAtoms.find((element) => element.projectionRole === "fraction_line");
const groupedRootFractionNumerator = groupedRootFractionAfterRootAtoms.find((element) => element.projectionRole === "numerator");
const groupedRootFractionDenominator = groupedRootFractionAfterRootAtoms.find((element) => element.projectionRole === "denominator");
const groupedRootFractionAnchor = groupedRootFractionAfterRootAtoms.find((element) => element.value === "=");
assert.equal(groupedRootFractionNumerator.col, groupedRootFractionLine.col);
assert.equal(groupedRootFractionDenominator.colStart, groupedRootFractionLine.col - 1);
assert.equal(groupedRootFractionDenominator.colEnd, groupedRootFractionLine.col + 1);
assert.equal(groupedRootFractionAnchor.row, groupedRootFractionLine.row, "Auch beim gruppierten Wurzelbruch muss der Gleichheitsanker auf der Bruchachse liegen.");
assert.equal(groupedRootFractionDenominator.type, "GROUP");

const groupedNegativePowerResult = await GenesisCore.solve("(-x)^2+b=c", { targetVariable: "x", runtimeEngine: "genesis_runtime" });
assert.deepEqual(
  groupedNegativePowerResult.schritte.map((step) => step.strategie.family),
  ["addition_release", "root_power", "group_release", "negative_sign_release"],
  "(-x)^2+b=c muss erst den Summanden loesen, dann die Potenz invertieren, danach die Schutzgruppe freigeben und erst zuletzt das Vorzeichen kippen."
);
const groupedNegativePowerRows = groupedNegativePowerResult.exportData.projectionRows;
const groupedNegativePowerFinalRow = groupedNegativePowerRows.at(-1).positionedAtoms;
const groupedNegativePowerPreviousRow = groupedNegativePowerRows.at(-2).positionedAtoms;
const groupedNegativePowerFinalX = groupedNegativePowerFinalRow.find((atom) => atom.value === "x" && atom.visualMode === "EMERGED");
const groupedNegativePowerPreviousX = groupedNegativePowerPreviousRow.find((atom) => atom.value === "x");
const groupedNegativePowerFinalNegation = groupedNegativePowerFinalRow.find((atom) => atom.projectionRole === "negation_sign");
const groupedNegativePowerFinalRootHook = groupedNegativePowerFinalRow.find((atom) => atom.projectionRole === "root_hook");
const groupedNegativePowerFinalRootBar = groupedNegativePowerFinalRow.find((atom) => atom.projectionRole === "root_overbar");
const groupedNegativePowerFinalMinuend = groupedNegativePowerFinalRow.find((atom) => atom.value === "c");
const groupedNegativePowerFinalSubtraction = groupedNegativePowerFinalRow.find((atom) => atom.projectionRole === "inverse_operator");
const groupedNegativePowerFinalSubtrahend = groupedNegativePowerFinalRow.find((atom) => atom.value === "b");
assert.ok(groupedNegativePowerFinalX, "Die Zielvariable muss nach dem letzten Vorzeichenschritt sichtbar emergieren.");
assert.ok(groupedNegativePowerPreviousX, "Auch im vorletzten Schritt muss die freigelegte Zielvariable noch an ihrer Kernspur stehen.");
assert.equal(
  groupedNegativePowerFinalX.col,
  groupedNegativePowerPreviousX.col,
  "Beim letzten Vorzeichenschritt darf die Zielvariable ihre Spalte nicht verlieren."
);
assert.ok(groupedNegativePowerFinalNegation, "Die inverse Negationsschale muss in der Finalzeile sichtbar bleiben.");
assert.ok(groupedNegativePowerFinalRootHook, "Die inverse Wurzelschale muss in der Finalzeile sichtbar bleiben.");
assert.ok(groupedNegativePowerFinalRootBar, "Der Oberstrich der inversen Wurzelschale muss auch in der Finalzeile vorhanden sein.");
assert.equal(
  groupedNegativePowerFinalNegation.col + 1,
  groupedNegativePowerFinalRootHook.col,
  "Beim letzten Vorzeichenschritt muss das inverse Minus direkt vor dem Wurzelhaken stehen."
);
assert.equal(
  groupedNegativePowerFinalRootBar.colStart,
  groupedNegativePowerFinalRootHook.col,
  "Der Wurzeloberstrich muss an derselben Startspalte beginnen wie der Wurzelhaken."
);
assert.equal(groupedNegativePowerFinalMinuend.col, 18);
assert.equal(groupedNegativePowerFinalSubtraction.col, 20);
assert.equal(groupedNegativePowerFinalSubtrahend.col, 22);
assert.equal(
  groupedNegativePowerFinalMinuend.col + 2,
  groupedNegativePowerFinalSubtraction.col,
  "Die additive Gegenseite unter der Wurzel muss als feste c-b-Struktur exportiert werden."
);
assert.equal(
  groupedNegativePowerFinalSubtraction.col + 2,
  groupedNegativePowerFinalSubtrahend.col,
  "Die additive Gegenseite unter der Wurzel muss ihre innere Spaltenordnung bis in die Finalzeile behalten."
);

const exponentialFactorResult = await GenesisCore.solve("y=a*B^x", { targetVariable: "a" });
assert.equal(exponentialFactorResult.fehler, undefined);
assert.deepEqual(
    exponentialFactorResult.schritte.map((step) => step.strategie.family),
    ["fraction_birth"],
    "Ein einfacher Exponentialfaktor muss fuer die Zielvariable ausserhalb des Exponenten wie ein normaler passiver Faktor abgebaut werden."
);

const exponentialExponentResult = await GenesisCore.solve("y=a*B^x", { targetVariable: "x" });
assert.equal(exponentialExponentResult.fehler, undefined);
assert.deepEqual(
    exponentialExponentResult.schritte.map((step) => step.strategie.family),
    ["fraction_birth"],
    "Liegt die Zielvariable im Exponenten, muss der passive Faktor davor trotzdem zuerst sauber in den Nenner wandern."
);

const fractionBirthImplicitResult = await GenesisCore.solve("2x=10");
assert.equal(fractionBirthImplicitResult.schritte.length, 1, "Die implizite Multiplikation soll genau einen Schritt erzeugen.");
assert.equal(fractionBirthImplicitResult.schritte[0].strategie.family, "fraction_birth");
assert.equal(fractionBirthImplicitResult.schritte[0].strategie.sourceType, "MULTIPLICATION");
assert.equal(fractionBirthImplicitResult.schritte[0].strategie.inverseType, "DIVISION");
assert.equal(fractionBirthImplicitResult.schritte[0].strategie.action, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");
assert.ok(fractionBirthImplicitResult.schritte[0].strategie.passiveExpressionId);
assert.equal(fractionBirthImplicitResult.schritte[0].strategie.passiveExpressionId, fractionBirthImplicitResult.schritte[0].strategie.factorId);
assert.ok(fractionBirthImplicitResult.finaleStruktur.some((element) => element.value === "2" && element.visualMode === "GHOST_HOLE"));
assert.ok(fractionBirthImplicitResult.finaleStruktur.some((element) => element.value === "*" && element.visualMode === "GHOST_HOLE"));
assert.ok(fractionBirthImplicitResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(fractionBirthImplicitResult.finaleStruktur.some((element) => element.type === "DIVISION" && element.visualMode === "INVERSE_SHELL"));
const fractionBirthImplicitAnchorCols = fractionBirthImplicitResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(fractionBirthImplicitAnchorCols[0], fractionBirthImplicitAnchorCols[1], "Auch bei impliziter Multiplikation muss der Gleichheitsanker stabil bleiben.");
const fractionBirthDivisionId = `generated-fraction_birth-division-from-${fractionBirthImplicitResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const fractionBirthDivisionShell = fractionBirthImplicitResult.exportData.atomRegister.find((atom) => atom.id === fractionBirthDivisionId);
assert.ok(fractionBirthDivisionShell, "Die inverse DIVISION-Schale muss im Exportregister auftauchen.");
assert.equal(fractionBirthDivisionShell.generatedByFamily, "fraction_birth");
assert.equal(fractionBirthDivisionShell.generatedByAction, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");
assert.equal(fractionBirthDivisionShell.originPassiveExpressionId, fractionBirthImplicitResult.schritte[0].strategie.passiveExpressionId);
const fractionBirthNumerator = fractionBirthImplicitResult.finaleStruktur.find((atom) => atom.sourceShellId === fractionBirthDivisionId && atom.projectionRole === "numerator");
const fractionBirthLine = fractionBirthImplicitResult.finaleStruktur.find((atom) => atom.sourceShellId === fractionBirthDivisionId && atom.projectionRole === "fraction_line");
const fractionBirthDenominator = fractionBirthImplicitResult.finaleStruktur.find((atom) => atom.sourceShellId === fractionBirthDivisionId && atom.projectionRole === "denominator");
assert.equal(fractionBirthImplicitResult.exportData.layoutPlan.visualRowCount, 4);
assert.equal(fractionBirthNumerator.col, fractionBirthLine.col);
assert.equal(fractionBirthLine.col, fractionBirthDenominator.col);

const fractionBirthExplicitResult = await GenesisCore.solve("x*2=10");
assert.equal(fractionBirthExplicitResult.schritte.length, 1, "Auch die explizite Multiplikation soll genau einen Schritt erzeugen.");
assert.equal(fractionBirthExplicitResult.schritte[0].strategie.family, "fraction_birth");
assert.ok(fractionBirthExplicitResult.finaleStruktur.some((element) => element.type === "DIVISION"));

const groupedFractionBirthResult = await GenesisCore.solve("(2+1)x=10");
assert.equal(groupedFractionBirthResult.schritte.length, 1, "Auch ein gruppierter passiver Ausdruck soll als genau ein Schritt gelesen werden.");
assert.equal(groupedFractionBirthResult.schritte[0].strategie.family, "fraction_birth");
assert.equal(groupedFractionBirthResult.schritte[0].strategie.action, "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR");
assert.ok(groupedFractionBirthResult.finaleStruktur.some((element) => element.type === "GROUP" && element.visualMode === "GHOST_HOLE"));
const groupedFractionBirthDivisionId = `generated-fraction_birth-division-from-${groupedFractionBirthResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const groupedFractionBirthDivisionShell = groupedFractionBirthResult.exportData.atomRegister.find((atom) => atom.id === groupedFractionBirthDivisionId);
assert.equal(groupedFractionBirthDivisionShell.denominator[0].type, "GROUP");
assert.equal(groupedFractionBirthDivisionShell.originPassiveExpressionId, groupedFractionBirthResult.schritte[0].strategie.passiveExpressionId);

const fractionBirthFunctionResult = await GenesisCore.solve("2sin(x)=10");
assert.equal(fractionBirthFunctionResult.schritte.length, 2, "Nach der Multiplikation vor einer Funktionsschale muss die trigonometrische Umkehrung weiterarbeiten.");
assert.equal(fractionBirthFunctionResult.schritte[0].strategie.family, "fraction_birth");
assert.equal(fractionBirthFunctionResult.schritte[1].strategie.family, "trig_inverse");
assert.ok(fractionBirthFunctionResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "sin" && element.visualMode === "GHOST_HOLE"));
assert.ok(fractionBirthFunctionResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(fractionBirthFunctionResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "asin" && element.visualMode === "INVERSE_SHELL"));
assert.ok(fractionBirthFunctionResult.exportData.atomRegister.some((atom) => atom.type === "DIVISION" && atom.generatedByFamily === "fraction_birth"));

const explicitFunctionMultiplicationResult = await GenesisCore.solve("2*sin(x)=10");
assert.equal(explicitFunctionMultiplicationResult.schritte.length, 2, "Explizite und implizite Funktionsmultiplikation sollen dieselbe Familienkette aktivieren.");
assert.equal(explicitFunctionMultiplicationResult.schritte[0].strategie.family, "fraction_birth");
assert.equal(explicitFunctionMultiplicationResult.schritte[1].strategie.family, "trig_inverse");
assert.ok(explicitFunctionMultiplicationResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "asin" && element.visualMode === "INVERSE_SHELL"));

const fractionCollapseSimpleResult = await GenesisCore.solve("x/2=5");
assert.equal(fractionCollapseSimpleResult.schritte.length, 1, "Der Nennerabbau soll genau einen Schritt erzeugen.");
assert.equal(fractionCollapseSimpleResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(fractionCollapseSimpleResult.schritte[0].strategie.sourceType, "DIVISION");
assert.equal(fractionCollapseSimpleResult.schritte[0].strategie.inverseType, "MULTIPLICATION");
assert.equal(fractionCollapseSimpleResult.schritte[0].strategie.action, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
assert.ok(fractionCollapseSimpleResult.schritte[0].strategie.passiveExpressionId);
assert.equal(fractionCollapseSimpleResult.schritte[0].strategie.passiveExpressionId, fractionCollapseSimpleResult.schritte[0].strategie.factorId);
assert.ok(fractionCollapseSimpleResult.finaleStruktur.some((element) => element.type === "DIVISION" && element.visualMode === "GHOST_HOLE"));
assert.ok(fractionCollapseSimpleResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(fractionCollapseSimpleResult.finaleStruktur.some((element) => element.type === "MULTIPLICATION" && element.visualMode === "INVERSE_SHELL"));
const fractionCollapseAnchorCols = fractionCollapseSimpleResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(fractionCollapseAnchorCols[0], fractionCollapseAnchorCols[1], "Auch beim Nennerabbau muss der Gleichheitsanker stabil bleiben.");
const fractionCollapseMultiplicationId = `generated-fraction_collapse-multiplication-from-${fractionCollapseSimpleResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const fractionCollapseMultiplicationShell = fractionCollapseSimpleResult.exportData.atomRegister.find((atom) => atom.id === fractionCollapseMultiplicationId);
assert.ok(fractionCollapseMultiplicationShell, "Die inverse MULTIPLICATION-Schale muss im Exportregister auftauchen.");
assert.equal(fractionCollapseMultiplicationShell.generatedByFamily, "fraction_collapse");
assert.equal(fractionCollapseMultiplicationShell.generatedByAction, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
assert.equal(fractionCollapseMultiplicationShell.originPassiveExpressionId, fractionCollapseSimpleResult.schritte[0].strategie.passiveExpressionId);
assert.equal(fractionCollapseMultiplicationShell.factor[0].id, fractionCollapseSimpleResult.schritte[0].strategie.passiveExpressionId);
const fractionCollapseInitialRow = fractionCollapseSimpleResult.exportData.projectionRows[0].positionedAtoms;
const fractionCollapseInitialDivisionId = fractionCollapseSimpleResult.exportData.theoryRows[0].atoms[0].id;
const fractionCollapseInitialNumerator = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivisionId && atom.projectionRole === "numerator");
const fractionCollapseInitialLine = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivisionId && atom.projectionRole === "fraction_line");
const fractionCollapseInitialDenominator = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivisionId && atom.projectionRole === "denominator");
assert.equal(fractionCollapseSimpleResult.exportData.layoutPlan.visualRowCount, 3);
assert.equal(fractionCollapseInitialNumerator.col, fractionCollapseInitialLine.col);
assert.equal(fractionCollapseInitialLine.col, fractionCollapseInitialDenominator.col);

const groupedFractionCollapseResult = await GenesisCore.solve("x/(2+1)=5");
assert.equal(groupedFractionCollapseResult.schritte.length, 1, "Auch ein gruppierter Nennerausdruck soll als genau ein Schritt gelesen werden.");
assert.equal(groupedFractionCollapseResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(groupedFractionCollapseResult.schritte[0].strategie.action, "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR");
const groupedFractionCollapseMultiplicationId = `generated-fraction_collapse-multiplication-from-${groupedFractionCollapseResult.schritte[0].strategie.passiveExpressionIds.join("__")}`;
const groupedFractionCollapseMultiplicationShell = groupedFractionCollapseResult.exportData.atomRegister.find((atom) => atom.id === groupedFractionCollapseMultiplicationId);
assert.equal(groupedFractionCollapseMultiplicationShell.factor[0].type, "GROUP");
assert.equal(groupedFractionCollapseMultiplicationShell.originPassiveExpressionId, groupedFractionCollapseResult.schritte[0].strategie.passiveExpressionId);
const groupedFractionCollapseInitialRow = groupedFractionCollapseResult.exportData.projectionRows[0].positionedAtoms;
const groupedFractionCollapseInitialDivisionId = groupedFractionCollapseResult.exportData.theoryRows[0].atoms[0].id;
const groupedFractionCollapseInitialDenominator = groupedFractionCollapseInitialRow.find((atom) => atom.sourceShellId === groupedFractionCollapseInitialDivisionId && atom.projectionRole === "denominator");
assert.equal(groupedFractionCollapseInitialDenominator.type, "GROUP");
const groupedFractionCollapseGroupId = groupedFractionCollapseResult.exportData.theoryRows[0].atoms[0].denominator[0].id;
const groupedFractionCollapseInnerIds = groupedFractionCollapseResult.exportData.theoryRows[0].atoms[0].denominator[0].content.map((atom) => atom.id);
assert.ok(groupedFractionCollapseResult.exportData.atomRegister.some((atom) => atom.id === groupedFractionCollapseGroupId));
groupedFractionCollapseInnerIds.forEach((id) => {
    assert.ok(groupedFractionCollapseResult.exportData.atomRegister.some((atom) => atom.id === id));
});
assert.ok(groupedFractionCollapseResult.exportData.projectionAtomRegister.some((atom) => atom.id === `${groupedFractionCollapseInitialDivisionId}::fraction-line`));
assert.ok(groupedFractionCollapseResult.exportData.projectionAtomRegister.some((atom) => atom.id === `${groupedFractionCollapseInitialDivisionId}::denominator::${groupedFractionCollapseGroupId}`));
const groupedFractionCollapseTrace = groupedFractionCollapseResult.exportData.traceIndex[groupedFractionCollapseGroupId];
assert.ok(groupedFractionCollapseTrace);
assert.ok(groupedFractionCollapseTrace.theory.some((entry) => entry.containerKey === "denominator"));
assert.ok(groupedFractionCollapseTrace.projection.some((entry) => entry.projectionRole === "denominator"));

const fractionCollapseFunctionResult = await GenesisCore.solve("sin(x)/2=5");
assert.equal(fractionCollapseFunctionResult.schritte.length, 2, "Nach dem Nennerabbau unter einer Funktionsschale muss die trigonometrische Umkehrung weiterarbeiten.");
assert.equal(fractionCollapseFunctionResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(fractionCollapseFunctionResult.schritte[1].strategie.family, "trig_inverse");
assert.ok(fractionCollapseFunctionResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "sin" && element.visualMode === "GHOST_HOLE"));
assert.ok(fractionCollapseFunctionResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(fractionCollapseFunctionResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "asin" && element.visualMode === "INVERSE_SHELL"));
assert.ok(fractionCollapseFunctionResult.exportData.atomRegister.some((atom) => atom.type === "MULTIPLICATION" && atom.generatedByFamily === "fraction_collapse"));

const groupedFunctionFractionCollapseResult = await GenesisCore.solve("sin(x)/(2*3)=5");
assert.equal(groupedFunctionFractionCollapseResult.schritte.length, 2, "Auch ein gruppierter Nennerausdruck unter einer Funktion soll dieselbe Familienkette erzeugen.");
assert.equal(groupedFunctionFractionCollapseResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(groupedFunctionFractionCollapseResult.schritte[1].strategie.family, "trig_inverse");
assert.ok(groupedFunctionFractionCollapseResult.exportData.atomRegister.some((atom) => atom.type === "MULTIPLICATION" && atom.factor[0].type === "GROUP"));

const functionArgumentFractionResult = await GenesisCore.solve("sin(x/2)=5");
assert.deepEqual(
    functionArgumentFractionResult.schritte.map((schritt) => schritt.strategie.family),
    ["trig_inverse", "fraction_collapse"],
    "Ein Bruch im Funktionsargument muss zuerst trigonometrisch umgekehrt und danach durch Nennerabbau freigelegt werden."
);
const functionArgumentFractionFinalRow = functionArgumentFractionResult.exportData.projectionRows[2].positionedAtoms;
const functionArgumentFractionShellId = `generated-fraction_collapse-multiplication-from-${functionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds.join("__")}`;
const functionArgumentFractionContent = functionArgumentFractionFinalRow.find((atom) => atom.id === `${functionArgumentFractionShellId}::content::generated-trig_inverse-function-from-${functionArgumentFractionResult.schritte[0].strategie.targetId}`);
const functionArgumentFractionOperator = functionArgumentFractionFinalRow.find((atom) => atom.id === `${functionArgumentFractionShellId}::operator`);
const functionArgumentFractionFactor = functionArgumentFractionFinalRow.find((atom) => atom.id === `${functionArgumentFractionShellId}::factor::${functionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds[0]}`);
assert.ok(functionArgumentFractionContent && functionArgumentFractionOperator && functionArgumentFractionFactor);
assert.ok(
    functionArgumentFractionContent.col < functionArgumentFractionOperator.col
    && functionArgumentFractionOperator.col < functionArgumentFractionFactor.col,
    "Beim Bruch im linken Funktionsargument muss der neue Faktor rechts an die bestehende asin-Schale angehaengt werden."
);

const mirroredFunctionArgumentFractionResult = await GenesisCore.solve("5=sin(x/2)");
assert.deepEqual(
    mirroredFunctionArgumentFractionResult.schritte.map((schritt) => schritt.strategie.family),
    ["trig_inverse", "fraction_collapse"],
    "Auch gespiegelt muss ein Bruch im Funktionsargument zuerst trigonometrisch umgekehrt und danach als Faktor freigelegt werden."
);
const mirroredFunctionArgumentFractionFinalRow = mirroredFunctionArgumentFractionResult.exportData.projectionRows[2].positionedAtoms;
const mirroredFunctionArgumentFractionShellId = `generated-fraction_collapse-multiplication-from-${mirroredFunctionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds.join("__")}`;
const mirroredFunctionArgumentFractionFactor = mirroredFunctionArgumentFractionFinalRow.find((atom) => atom.id === `${mirroredFunctionArgumentFractionShellId}::factor::${mirroredFunctionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds[0]}`);
const mirroredFunctionArgumentFractionOperator = mirroredFunctionArgumentFractionFinalRow.find((atom) => atom.id === `${mirroredFunctionArgumentFractionShellId}::operator`);
const mirroredFunctionArgumentFractionContent = mirroredFunctionArgumentFractionFinalRow.find((atom) => atom.id === `${mirroredFunctionArgumentFractionShellId}::content::generated-trig_inverse-function-from-${mirroredFunctionArgumentFractionResult.schritte[0].strategie.targetId}`);
assert.ok(mirroredFunctionArgumentFractionFactor && mirroredFunctionArgumentFractionOperator && mirroredFunctionArgumentFractionContent);
assert.ok(
    mirroredFunctionArgumentFractionFactor.col < mirroredFunctionArgumentFractionOperator.col
    && mirroredFunctionArgumentFractionOperator.col < mirroredFunctionArgumentFractionContent.col,
    "Beim gespiegelten Bruch im rechten Funktionsargument muss der neue Faktor links vor die bestehende asin-Schale gesetzt werden."
);

const prefixedFunctionArgumentFractionResult = await GenesisCore.solve("sin(x/2)=5", {
    rightSideFactorPlacement: "prefix"
});
const prefixedFunctionArgumentFractionInverseRow = prefixedFunctionArgumentFractionResult.exportData.projectionRows[1].positionedAtoms;
const prefixedFunctionArgumentFractionFinalRow = prefixedFunctionArgumentFractionResult.exportData.projectionRows[2].positionedAtoms;
const prefixedFunctionArgumentFractionShellId = `generated-fraction_collapse-multiplication-from-${prefixedFunctionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds.join("__")}`;
const prefixedFunctionArgumentSource = prefixedFunctionArgumentFractionInverseRow.find((atom) => atom.id === `generated-trig_inverse-function-from-${prefixedFunctionArgumentFractionResult.schritte[0].strategie.targetId}`);
const prefixedFunctionArgumentFactor = prefixedFunctionArgumentFractionFinalRow.find((atom) => atom.id === `${prefixedFunctionArgumentFractionShellId}::factor::${prefixedFunctionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds[0]}`);
const prefixedFunctionArgumentOperator = prefixedFunctionArgumentFractionFinalRow.find((atom) => atom.id === `${prefixedFunctionArgumentFractionShellId}::operator`);
const prefixedFunctionArgumentContent = prefixedFunctionArgumentFractionFinalRow.find((atom) => atom.id === `${prefixedFunctionArgumentFractionShellId}::content::generated-trig_inverse-function-from-${prefixedFunctionArgumentFractionResult.schritte[0].strategie.targetId}`);
assert.ok(prefixedFunctionArgumentSource && prefixedFunctionArgumentFactor && prefixedFunctionArgumentOperator && prefixedFunctionArgumentContent);
assert.equal(
    prefixedFunctionArgumentSource.col,
    prefixedFunctionArgumentContent.col,
    "Wenn rechts praefixiert wird, muss die bestehende asin-Spur trotzdem auf derselben Inhalts-Spalte bleiben."
);
assert.ok(
    prefixedFunctionArgumentFactor.col < prefixedFunctionArgumentOperator.col
    && prefixedFunctionArgumentOperator.col < prefixedFunctionArgumentContent.col,
    "Mit praefixierter Rechtsseiten-Policy muss der neue Faktor links vor der rechten asin-Schale erscheinen."
);

const mirroredPrefixedFunctionArgumentFractionResult = await GenesisCore.solve("5=sin(x/2)", {
    rightSideFactorPlacement: "suffix"
});
const mirroredPrefixedFunctionArgumentFinalRow = mirroredPrefixedFunctionArgumentFractionResult.exportData.projectionRows[2].positionedAtoms;
const mirroredPrefixedFunctionArgumentShellId = `generated-fraction_collapse-multiplication-from-${mirroredPrefixedFunctionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds.join("__")}`;
const mirroredPrefixedFunctionArgumentFactor = mirroredPrefixedFunctionArgumentFinalRow.find((atom) => atom.id === `${mirroredPrefixedFunctionArgumentShellId}::factor::${mirroredPrefixedFunctionArgumentFractionResult.schritte[1].strategie.passiveExpressionIds[0]}`);
const mirroredPrefixedFunctionArgumentContent = mirroredPrefixedFunctionArgumentFinalRow.find((atom) => atom.id === `${mirroredPrefixedFunctionArgumentShellId}::content::generated-trig_inverse-function-from-${mirroredPrefixedFunctionArgumentFractionResult.schritte[0].strategie.targetId}`);
assert.ok(mirroredPrefixedFunctionArgumentFactor && mirroredPrefixedFunctionArgumentContent);
assert.ok(
    mirroredPrefixedFunctionArgumentFactor.col < mirroredPrefixedFunctionArgumentContent.col,
    "Links entstehende Faktoren muessen auch dann links bleiben, wenn rechts die alternative Policy aktiv waere."
);

const denominatorTargetTrigResult = await GenesisCore.solve("1/sin(x)=5");
assert.deepEqual(
    denominatorTargetTrigResult.schritte.map((schritt) => schritt.strategie.family),
    ["fraction_denominator_release", "fraction_birth", "trig_inverse"],
    "Ein Ziel im Funktionsnenner muss ueber Nennerfreigabe, Bruchgeburt und trigonometrische Umkehrung laufen."
);
const denominatorTargetTrigInverseId = `generated-trig_inverse-function-from-${denominatorTargetTrigResult.schritte[2].strategie.targetId}`;
const denominatorTargetTrigInverseShell = denominatorTargetTrigResult.finaleStruktur.find((element) => element.id === denominatorTargetTrigInverseId);
assert.ok(denominatorTargetTrigInverseShell, "Die inverse trigonometrische Schale muss auch nach dem Nennerzielpfad erzeugt werden.");
assert.equal(denominatorTargetTrigInverseShell.content.length, 1, "Die inverse trigonometrische Schale darf nur den aktuell sichtbaren Gegenausdruck einwickeln.");
assert.equal(denominatorTargetTrigInverseShell.content[0].type, "DIVISION");
assert.equal(denominatorTargetTrigInverseShell.content[0].numerator.length, 1, "Im Zaehler darf nach dem Nennerzielpfad keine historische Geisterspur stehen bleiben.");
assert.equal(denominatorTargetTrigInverseShell.content[0].numerator[0].value, "1");
assert.equal(denominatorTargetTrigInverseShell.content[0].denominator.length, 1);
assert.equal(denominatorTargetTrigInverseShell.content[0].denominator[0].value, "5");

const trigInverseResult = await GenesisCore.solve("sin(x)=1");
assert.equal(trigInverseResult.schritte.length, 1, "Die aktive trigonometrische Umkehrung soll genau einen Schritt erzeugen.");
assert.equal(trigInverseResult.schritte[0].strategie.family, "trig_inverse");
assert.equal(trigInverseResult.schritte[0].strategie.sourceName, "sin");
assert.equal(trigInverseResult.schritte[0].strategie.inverseName, "asin");
assert.ok(trigInverseResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "sin" && element.visualMode === "GHOST_HOLE"));
assert.ok(trigInverseResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(trigInverseResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "asin" && element.visualMode === "INVERSE_SHELL"));
const trigInverseAnchorCols = trigInverseResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(trigInverseAnchorCols[0], trigInverseAnchorCols[1], "Auch im trigonometrischen Umkehrfall muss der Gleichheitsanker stabil bleiben.");
const trigInverseShellId = `generated-trig_inverse-function-from-${trigInverseResult.schritte[0].strategie.targetId}`;
const trigInverseShell = trigInverseResult.exportData.atomRegister.find((atom) => atom.id === trigInverseShellId);
assert.ok(trigInverseShell, "Die inverse trigonometrische Funktion muss im Exportregister auftauchen.");
assert.equal(trigInverseShell.generatedByFamily, "trig_inverse");
assert.equal(trigInverseShell.generatedByAction, "INVERT_TO_ASIN");
assert.equal(trigInverseShell.originSourceName, "sin");
assert.equal(trigInverseShell.inverseName, "asin");

const groupedTrigInverseResult = await GenesisCore.solve("sin(x+1)=2");
assert.equal(groupedTrigInverseResult.schritte.length, 2, "Nach der trigonometrischen Umkehrung muss die additive Freilegung weiterarbeiten koennen.");
assert.equal(groupedTrigInverseResult.schritte[0].strategie.family, "trig_inverse");
assert.equal(groupedTrigInverseResult.schritte[1].strategie.family, "addition_release");

const cosInverseResult = await GenesisCore.solve("cos(x)=1");
assert.equal(cosInverseResult.schritte.length, 1);
assert.equal(cosInverseResult.schritte[0].strategie.family, "trig_inverse");
assert.equal(cosInverseResult.schritte[0].strategie.inverseName, "acos");
assert.ok(cosInverseResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "acos"));

const tanInverseResult = await GenesisCore.solve("tan(x)=2");
assert.equal(tanInverseResult.schritte.length, 1);
assert.equal(tanInverseResult.schritte[0].strategie.family, "trig_inverse");
assert.equal(tanInverseResult.schritte[0].strategie.inverseName, "atan");
assert.ok(tanInverseResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "atan"));

const inverseTrigResult = await GenesisCore.solve("asin(x)=1");
assert.equal(inverseTrigResult.schritte.length, 1, "Die inverse trigonometrische Gegenrichtung soll jetzt genau einen Schritt erzeugen.");
assert.equal(inverseTrigResult.schritte[0].strategie.family, "inverse_trig");
assert.equal(inverseTrigResult.schritte[0].strategie.sourceName, "asin");
assert.equal(inverseTrigResult.schritte[0].strategie.inverseName, "sin");
assert.ok(inverseTrigResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "asin" && element.visualMode === "GHOST_HOLE"));
assert.ok(inverseTrigResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
assert.ok(inverseTrigResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "sin" && element.visualMode === "INVERSE_SHELL"));
const inverseTrigShellId = `generated-inverse_trig-function-from-${inverseTrigResult.schritte[0].strategie.targetId}`;
const inverseTrigShell = inverseTrigResult.exportData.atomRegister.find((atom) => atom.id === inverseTrigShellId);
assert.ok(inverseTrigShell);
assert.equal(inverseTrigShell.generatedByFamily, "inverse_trig");
assert.equal(inverseTrigShell.generatedByAction, "INVERT_TO_SIN");
assert.equal(inverseTrigShell.originSourceName, "asin");
assert.equal(inverseTrigShell.inverseName, "sin");

const groupedInverseTrigResult = await GenesisCore.solve("asin(x+1)=2");
assert.equal(groupedInverseTrigResult.schritte.length, 2, "Nach der inversen trigonometrischen Umkehrung muss die additive Freilegung weiterarbeiten koennen.");
assert.equal(groupedInverseTrigResult.schritte[0].strategie.family, "inverse_trig");
assert.equal(groupedInverseTrigResult.schritte[1].strategie.family, "addition_release");

const acosResult = await GenesisCore.solve("acos(x)=1");
assert.equal(acosResult.schritte.length, 1);
assert.equal(acosResult.schritte[0].strategie.family, "inverse_trig");
assert.equal(acosResult.schritte[0].strategie.inverseName, "cos");
assert.ok(acosResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "cos"));

const atanResult = await GenesisCore.solve("atan(x)=2");
assert.equal(atanResult.schritte.length, 1);
assert.equal(atanResult.schritte[0].strategie.family, "inverse_trig");
assert.equal(atanResult.schritte[0].strategie.inverseName, "tan");
assert.ok(atanResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "tan"));

const powerResult = await GenesisCore.solve("x^2=9");
assert.equal(powerResult.schritte.length, 1, "Die Potenzgleichung sollte genau einen Schritt erzeugen.");
assert.equal(powerResult.schritte[0].strategie.family, "root_power");
assert.equal(powerResult.schritte[0].strategie.sourceType, "POWER");
assert.equal(powerResult.schritte[0].strategie.inverseType, "ROOT");
assert.equal(powerResult.schritte[0].strategie.action, "INVERT_TO_ROOT");
assert.equal(powerResult.schritte[0].strategie.inversionDegree, 2);
assert.equal(powerResult.schritte[0].strategie.argumentScope, "whole_opposite_side");
assert.ok(powerResult.finaleStruktur.some((element) => element.type === "POWER" && element.visualMode === "GHOST_HOLE"));
assert.ok(powerResult.finaleStruktur.some((element) => element.type === "ROOT" && Array.isArray(element.content)));
assert.ok(powerResult.finaleStruktur.some((element) => element.visualMode === "EMERGED"));
const powerAnchorCols = powerResult.exportData.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);
assert.equal(powerAnchorCols[0], powerAnchorCols[1], "Auch im Potenzfall muss der Gleichheitsanker spaltenstabil bleiben.");
assert.equal(powerResult.exportData.exportProfiles.film.usesSameAtomIds, true);
assert.equal(powerResult.exportData.exportProfiles.arbeitsblatt.usesSameAtomIds, true);
const powerInverseShellId = `generated-root_power-root-from-${powerResult.schritte[0].strategie.targetId}`;
const powerInverseShell = powerResult.exportData.atomRegister.find((atom) => atom.id === powerInverseShellId);
assert.ok(powerInverseShell, "Die inverse Wurzelschale muss im Exportregister auftauchen.");
assert.equal(powerInverseShell.generatedByFamily, "root_power");
assert.equal(powerInverseShell.generatedByAction, "INVERT_TO_ROOT");
assert.equal(powerInverseShell.originTargetId, powerResult.schritte[0].strategie.targetId);
assert.equal(powerInverseShell.degree, 2);

const deterministicExportA = await GenesisCore.solve("x + 2 = 5");
const deterministicExportB = await GenesisCore.solve("x+2=5");
assert.deepEqual(
    deterministicExportA.exportData.theoryRows[0].atoms.map((atom) => atom.id),
    deterministicExportB.exportData.theoryRows[0].atoms.map((atom) => atom.id),
    "Dieselbe normalisierte Eingabe muss denselben initialen Export-ID-Satz liefern."
);

const deterministicExportDifferent = await GenesisCore.solve("x+3=5");
assert.notEqual(
    deterministicExportA.exportData.theoryRows[0].atoms[0].id,
    deterministicExportDifferent.exportData.theoryRows[0].atoms[0].id,
    "Unterschiedliche Eingaben sollen in getrennten ID-Namespaces exportiert werden."
);

const rightGroupedAdditionResult = await GenesisCore.solve("5=(x+1)");
assert.equal(rightGroupedAdditionResult.schritte.length, 1, "Auch rechts darf eine redundante Aussengruppe keinen Zusatzschritt erzeugen.");
assert.equal(rightGroupedAdditionResult.schritte[0].strategie.family, "addition_release");
assert.equal(rightGroupedAdditionResult.schritte[0].strategie.equationSide, "right");

const rightAdditionResult = await GenesisCore.solve("5=x+2");
assert.equal(rightAdditionResult.schritte.length, 1, "Auch rechts soll die additive Freigabe genau einen Schritt erzeugen.");
assert.equal(rightAdditionResult.schritte[0].strategie.family, "addition_release");
assert.equal(rightAdditionResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightAdditionResult.finaleStruktur.some((element) => element.type === "SUBTRACTION" && element.visualMode === "INVERSE_SHELL"));
assert.ok(rightAdditionResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightFractionBirthResult = await GenesisCore.solve("10=2x");
assert.equal(rightFractionBirthResult.schritte.length, 1, "Auch rechts muss Multiplikation als Bruchgeburt gelesen werden.");
assert.equal(rightFractionBirthResult.schritte[0].strategie.family, "fraction_birth");
assert.equal(rightFractionBirthResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightFractionBirthResult.finaleStruktur.some((element) => element.type === "DIVISION" && element.visualMode === "INVERSE_SHELL"));
assert.ok(rightFractionBirthResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightFractionCollapseResult = await GenesisCore.solve("5=x/2");
assert.equal(rightFractionCollapseResult.schritte.length, 1, "Auch rechts muss der Nennerabbau genau einen Schritt erzeugen.");
assert.equal(rightFractionCollapseResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(rightFractionCollapseResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightFractionCollapseResult.finaleStruktur.some((element) => element.type === "MULTIPLICATION" && element.visualMode === "INVERSE_SHELL"));
assert.ok(rightFractionCollapseResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightTrigResult = await GenesisCore.solve("1=sin(x)");
assert.equal(rightTrigResult.schritte.length, 1, "Auch rechts muss die trigonometrische Umkehrung greifen.");
assert.equal(rightTrigResult.schritte[0].strategie.family, "trig_inverse");
assert.equal(rightTrigResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightTrigResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "asin" && element.visualMode === "INVERSE_SHELL"));
assert.ok(rightTrigResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightDenominatorTargetTrigResult = await GenesisCore.solve("5=1/sin(x)");
assert.deepEqual(
    rightDenominatorTargetTrigResult.schritte.map((schritt) => schritt.strategie.family),
    ["fraction_denominator_release", "fraction_birth", "trig_inverse"],
    "Auch rechts muss der Funktionsnennerpfad dieselbe Familienkette ausfuehren."
);
const rightDenominatorTargetTrigInverseId = `generated-trig_inverse-function-from-${rightDenominatorTargetTrigResult.schritte[2].strategie.targetId}`;
const rightDenominatorTargetTrigInverseShell = rightDenominatorTargetTrigResult.finaleStruktur.find((element) => element.id === rightDenominatorTargetTrigInverseId);
assert.ok(rightDenominatorTargetTrigInverseShell);
assert.equal(rightDenominatorTargetTrigInverseShell.content.length, 1);
assert.equal(rightDenominatorTargetTrigInverseShell.content[0].type, "DIVISION");
assert.equal(rightDenominatorTargetTrigInverseShell.content[0].numerator.length, 1, "Auch rechts darf der inverse Funktionsargument-Snapshot keine versteckten Alt-Schalen mitziehen.");
assert.equal(rightDenominatorTargetTrigInverseShell.content[0].numerator[0].value, "1");
assert.equal(rightDenominatorTargetTrigInverseShell.content[0].denominator.length, 1);
assert.equal(rightDenominatorTargetTrigInverseShell.content[0].denominator[0].value, "5");

const rightInverseTrigResult = await GenesisCore.solve("1=asin(x)");
assert.equal(rightInverseTrigResult.schritte.length, 1, "Auch rechts muss die inverse trigonometrische Gegenrichtung greifen.");
assert.equal(rightInverseTrigResult.schritte[0].strategie.family, "inverse_trig");
assert.equal(rightInverseTrigResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightInverseTrigResult.finaleStruktur.some((element) => element.type === "FUNCTION" && element.name === "sin" && element.visualMode === "INVERSE_SHELL"));

const rightRootResult = await GenesisCore.solve("5=sqrt(x)");
assert.equal(rightRootResult.schritte.length, 1, "Auch rechts muss die Wurzelfamilie greifen.");
assert.equal(rightRootResult.schritte[0].strategie.family, "root_power");
assert.equal(rightRootResult.schritte[0].strategie.equationSide, "right");
assert.equal(rightRootResult.schritte[0].strategie.argumentScope, "whole_opposite_side");
assert.ok(rightRootResult.finaleStruktur.some((element) => element.type === "POWER" && element.visualMode === "INVERSE_SHELL"));
assert.ok(rightRootResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightPowerResult = await GenesisCore.solve("9=x^2");
assert.equal(rightPowerResult.schritte.length, 1, "Auch rechts muss die Potenzfamilie greifen.");
assert.equal(rightPowerResult.schritte[0].strategie.family, "root_power");
assert.equal(rightPowerResult.schritte[0].strategie.equationSide, "right");
assert.ok(rightPowerResult.finaleStruktur.some((element) => element.type === "ROOT" && element.visualMode === "INVERSE_SHELL"));

const linearResult = await GenesisCore.solve("x=5");
assert.equal(linearResult.schritte.length, 0, "Ohne zustaendige Familie darf kein Schritt entstehen.");
assert.equal(linearResult.exportData.theoryRows.length, 1);
assert.equal(linearResult.exportData.projectionRows.length, 1);

console.log("✅ Aktiver Core-Solve-Flow erfolgreich.");
