import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";

function getAnchorColumns(projectionRows) {
  return projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=")?.col ?? null);
}

function assertAllEqual(values, message) {
  assert.ok(values.length > 0, "Die Vergleichsliste darf nicht leer sein.");
  values.forEach((value) => {
    assert.equal(value, values[0], message);
  });
}

function findById(atoms, id) {
  return atoms.find((atom) => atom.id === id);
}

function findVisibleBySourceAtomId(atoms, sourceAtomId) {
  return atoms.find((atom) => atom.sourceAtomId === sourceAtomId && atom.isVisible !== false);
}

const birthThenTrigResult = await GenesisCore.solve("2*sin(x)=10");
const birthThenTrigFamilies = birthThenTrigResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(
  birthThenTrigFamilies,
  ["fraction_birth", "trig_inverse"],
  "Die Mehrschrittkette 2*sin(x)=10 soll zuerst die Bruchgeburt und danach die trigonometrische Umkehrung ausfuehren."
);

const birthThenTrigRows = birthThenTrigResult.exportData.projectionRows;
const birthThenTrigAnchorCols = getAnchorColumns(birthThenTrigRows);
assertAllEqual(
  birthThenTrigAnchorCols,
  "Auch ueber die Kette fraction_birth -> trig_inverse muss der Gleichheitsanker auf derselben Spalte bleiben."
);
assert.equal(birthThenTrigResult.exportData.layoutPlan.rowCount, 3);
assert.equal(birthThenTrigResult.exportData.layoutPlan.visualRowCount, 4);

const birthStep = birthThenTrigResult.schritte[0].strategie;
const trigStepAfterBirth = birthThenTrigResult.schritte[1].strategie;
const birthInitialRow = birthThenTrigRows[0].positionedAtoms;
const birthMiddleRow = birthThenTrigRows[1].positionedAtoms;
const birthFinalRow = birthThenTrigRows[2].positionedAtoms;
const birthDivisionId = `generated-fraction_birth-division-from-${birthStep.passiveExpressionIds.join("__")}`;
const birthInverseTrigId = `generated-trig_inverse-function-from-${trigStepAfterBirth.targetId}`;
const birthTargetSourceId = trigStepAfterBirth.targetExpressionIds[0];

const birthInitialTargetProjection = findVisibleBySourceAtomId(birthInitialRow, birthTargetSourceId);
const birthMiddleTargetProjection = findVisibleBySourceAtomId(birthMiddleRow, birthTargetSourceId);
const birthFinalTargetVariable = findVisibleBySourceAtomId(birthFinalRow, birthTargetSourceId);
assertAllEqual(
  [birthInitialTargetProjection.col, birthMiddleTargetProjection.col, birthFinalTargetVariable.col],
  "Die aktive Zielvariable darf ueber die Kette fraction_birth -> trig_inverse ihre sichtbare Inhalts-Spur nicht verlieren."
);

const birthInitialOpposite = birthInitialRow.find((atom) => atom.value === "10");
const birthMiddleDivisionShell = findById(birthMiddleRow, birthDivisionId);
const birthMiddleFractionLine = birthMiddleRow.find((atom) => atom.sourceShellId === birthDivisionId && atom.projectionRole === "fraction_line");
const birthMiddleNumerator = findVisibleBySourceAtomId(birthMiddleRow, birthInitialOpposite.sourceAtomId);
const birthMiddleDenominator = birthMiddleRow.find((atom) => atom.sourceShellId === birthDivisionId && atom.projectionRole === "denominator");
const birthFinalInverseShell = findById(birthFinalRow, birthInverseTrigId);
const birthFinalNumerator = findVisibleBySourceAtomId(birthFinalRow, birthInitialOpposite.sourceAtomId);
assert.ok(birthMiddleDivisionShell && birthMiddleFractionLine && birthMiddleNumerator && birthMiddleDenominator && birthFinalInverseShell && birthFinalNumerator);
assertAllEqual(
  [
    birthInitialOpposite.col,
    birthMiddleNumerator.col,
    birthFinalNumerator.col
  ],
  "Der freie Gegenwert darf beim Eintritt in den Bruchkern und dessen spaeterer Inversschale seine Inhaltsspur nicht verlieren."
);

const collapseThenTrigResult = await GenesisCore.solve("sin(x)/2=5");
const collapseThenTrigFamilies = collapseThenTrigResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(
  collapseThenTrigFamilies,
  ["fraction_collapse", "trig_inverse"],
  "Die Mehrschrittkette sin(x)/2=5 soll zuerst den Nennerabbau und danach die trigonometrische Umkehrung ausfuehren."
);

const collapseThenTrigRows = collapseThenTrigResult.exportData.projectionRows;
const collapseThenTrigAnchorCols = getAnchorColumns(collapseThenTrigRows);
assertAllEqual(
  collapseThenTrigAnchorCols,
  "Auch ueber die Kette fraction_collapse -> trig_inverse muss der Gleichheitsanker auf derselben Spalte bleiben."
);
assert.equal(collapseThenTrigResult.exportData.layoutPlan.rowCount, 3);
assert.equal(collapseThenTrigResult.exportData.layoutPlan.visualRowCount, 3);

const collapseStep = collapseThenTrigResult.schritte[0].strategie;
const trigStepAfterCollapse = collapseThenTrigResult.schritte[1].strategie;
const collapseInitialRow = collapseThenTrigRows[0].positionedAtoms;
const collapseMiddleRow = collapseThenTrigRows[1].positionedAtoms;
const collapseFinalRow = collapseThenTrigRows[2].positionedAtoms;
const collapseTargetSourceId = trigStepAfterCollapse.targetExpressionIds[0];
const collapseInitialTargetProjection = findVisibleBySourceAtomId(collapseInitialRow, collapseTargetSourceId);
const collapseMiddleTargetProjection = findVisibleBySourceAtomId(collapseMiddleRow, collapseTargetSourceId);
const collapseFinalTargetVariable = findVisibleBySourceAtomId(collapseFinalRow, collapseTargetSourceId);
assertAllEqual(
  [collapseInitialTargetProjection.col, collapseMiddleTargetProjection.col, collapseFinalTargetVariable.col],
  "Auch beim Nennerabbau darf die aktive Zielvariable ueber den trigonometrischen Folge-Schritt ihre sichtbare Inhalts-Spur nicht verlieren."
);

const collapseInitialDivision = findById(collapseInitialRow, collapseStep.targetId);
const collapseInitialFractionLine = collapseInitialRow.find(
  (atom) => atom.sourceShellId === collapseStep.targetId && atom.projectionRole === "fraction_line"
);
const collapseInitialDenominator = collapseInitialRow.find(
  (atom) => atom.sourceShellId === collapseStep.targetId && atom.projectionRole === "denominator"
);
const collapseInitialOpposite = collapseInitialRow.find((atom) => atom.value === "5");
const collapseMultiplicationId = `generated-fraction_collapse-multiplication-from-${collapseStep.passiveExpressionIds.join("__")}`;
const collapseMiddleMultiplicationShell = findById(collapseMiddleRow, collapseMultiplicationId);
const collapseMiddleProductContent = findVisibleBySourceAtomId(collapseMiddleRow, collapseInitialOpposite.sourceAtomId);
const collapseInverseTrigId = `generated-trig_inverse-function-from-${trigStepAfterCollapse.targetId}`;
const collapseFinalInverseShell = findById(collapseFinalRow, collapseInverseTrigId);
const collapseFinalProductContent = findVisibleBySourceAtomId(collapseFinalRow, collapseInitialOpposite.sourceAtomId);
assert.ok(collapseInitialDivision && collapseInitialFractionLine && collapseInitialDenominator && collapseMiddleMultiplicationShell && collapseMiddleProductContent && collapseFinalInverseShell && collapseFinalProductContent);
assertAllEqual(
  [
    collapseInitialOpposite.col,
    collapseMiddleProductContent.col,
    collapseFinalProductContent.col
  ],
  "Auch beim Nennerabbau muss der freie Gegenausdruck beim Eintritt in den Produktkern seine Inhaltsspur behalten."
);
assert.ok(
  collapseInitialFractionLine.colStart <= collapseInitialDenominator.col
    && collapseInitialDenominator.col <= collapseInitialFractionLine.colEnd,
  "Der sichtbare Nenner muss bereits in der Startdivision innerhalb der expliziten Bruchspanne liegen."
);

const groupedCollapseThenTrigResult = await GenesisCore.solve("sin(x)/(2*3)=5");
const groupedCollapseThenTrigFamilies = groupedCollapseThenTrigResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(
  groupedCollapseThenTrigFamilies,
  ["fraction_collapse", "trig_inverse"],
  "Auch ein gruppierter Nenner unter einer Funktionsschale soll die Kette fraction_collapse -> trig_inverse ausfuehren."
);

const groupedCollapseThenTrigRows = groupedCollapseThenTrigResult.exportData.projectionRows;
const groupedCollapseThenTrigAnchorCols = getAnchorColumns(groupedCollapseThenTrigRows);
assertAllEqual(
  groupedCollapseThenTrigAnchorCols,
  "Auch beim gruppierten Nenner muss der Gleichheitsanker ueber die Mehrschritt-Kette stabil bleiben."
);
assert.equal(groupedCollapseThenTrigResult.exportData.layoutPlan.rowCount, 3);
assert.equal(groupedCollapseThenTrigResult.exportData.layoutPlan.visualRowCount, 3);

const groupedCollapseStep = groupedCollapseThenTrigResult.schritte[0].strategie;
const groupedTrigStep = groupedCollapseThenTrigResult.schritte[1].strategie;
const groupedCollapseInitialRow = groupedCollapseThenTrigRows[0].positionedAtoms;
const groupedCollapseMiddleRow = groupedCollapseThenTrigRows[1].positionedAtoms;
const groupedCollapseFinalRow = groupedCollapseThenTrigRows[2].positionedAtoms;
const groupedCollapseTargetSourceId = groupedTrigStep.targetExpressionIds[0];
const groupedCollapseInitialFunction = findVisibleBySourceAtomId(groupedCollapseInitialRow, groupedCollapseTargetSourceId);
const groupedCollapseMiddleFunction = findVisibleBySourceAtomId(groupedCollapseMiddleRow, groupedCollapseTargetSourceId);
const groupedCollapseFinalVariable = findVisibleBySourceAtomId(groupedCollapseFinalRow, groupedCollapseTargetSourceId);
assertAllEqual(
  [groupedCollapseInitialFunction.col, groupedCollapseMiddleFunction.col, groupedCollapseFinalVariable.col],
  "Die aktive Zielvariable darf auch mit gruppiertem Nenner ueber die Folgefamilie ihre sichtbare Inhalts-Spur nicht verlieren."
);

const groupedCollapseInitialDivision = findById(groupedCollapseInitialRow, groupedCollapseStep.targetId);
const groupedCollapseInitialLine = groupedCollapseInitialRow.find(
  (atom) => atom.sourceShellId === groupedCollapseStep.targetId && atom.projectionRole === "fraction_line"
);
const groupedCollapseInitialDenominator = groupedCollapseInitialRow.find(
  (atom) => atom.sourceShellId === groupedCollapseStep.targetId && atom.projectionRole === "denominator"
);
assert.equal(groupedCollapseInitialDenominator.type, "GROUP");
assert.ok(
  groupedCollapseInitialLine.colStart <= groupedCollapseInitialDenominator.colStart
    && groupedCollapseInitialDenominator.colEnd <= groupedCollapseInitialLine.colEnd,
  "Auch ein gruppierter Nenner muss in der expliziten Start-Bruchspanne liegen."
);

const groupedCollapseInitialOpposite = groupedCollapseInitialRow.find((atom) => atom.value === "5");
const groupedCollapseMultiplicationId = `generated-fraction_collapse-multiplication-from-${groupedCollapseStep.passiveExpressionIds.join("__")}`;
const groupedCollapseMiddleMultiplication = findById(groupedCollapseMiddleRow, groupedCollapseMultiplicationId);
const groupedCollapseMiddleProductContent = findVisibleBySourceAtomId(groupedCollapseMiddleRow, groupedCollapseInitialOpposite.sourceAtomId);
const groupedCollapseInverseTrigId = `generated-trig_inverse-function-from-${groupedTrigStep.targetId}`;
const groupedCollapseFinalInverse = findById(groupedCollapseFinalRow, groupedCollapseInverseTrigId);
const groupedCollapseFinalProductContent = findVisibleBySourceAtomId(groupedCollapseFinalRow, groupedCollapseInitialOpposite.sourceAtomId);
assert.ok(groupedCollapseInitialDivision && groupedCollapseInitialLine && groupedCollapseMiddleMultiplication && groupedCollapseMiddleProductContent && groupedCollapseFinalInverse && groupedCollapseFinalProductContent);
assertAllEqual(
  [
    groupedCollapseInitialOpposite.col,
    groupedCollapseMiddleProductContent.col,
    groupedCollapseFinalProductContent.col
  ],
  "Auch mit gruppiertem Nenner muss der freie Gegenausdruck beim Eintritt in den Produktkern seine Inhaltsspur behalten."
);

const groupedCollapseDenominatorId = groupedCollapseStep.passiveExpressionId;
const groupedCollapseDenominatorTrace = groupedCollapseThenTrigResult.exportData.traceIndex[groupedCollapseDenominatorId];
assert.ok(groupedCollapseDenominatorTrace, "Der gruppierte Nenner muss im Trace-Index erhalten bleiben.");
assert.ok(
  groupedCollapseDenominatorTrace.theory.some((entry) => entry.containerKey === "denominator"),
  "Der gruppierte Nenner muss in der Theoriespur als Nenner lesbar bleiben."
);
assert.ok(
  groupedCollapseDenominatorTrace.theory.some((entry) => entry.containerKey === "factor"),
  "Der gruppierte Nenner muss in der Theoriespur spaeter als Faktor lesbar bleiben."
);
assert.ok(
  groupedCollapseDenominatorTrace.projection.some((entry) => entry.projectionRole === "denominator"),
  "Der gruppierte Nenner muss auch in der Projektion als Nenner referenzierbar bleiben."
);

const ungroupedAreaResult = await GenesisCore.solve("A=g*h/2", { targetVariable: "g" });
assert.deepEqual(
  ungroupedAreaResult.schritte.map((step) => step.strategie.family),
  ["fraction_collapse", "fraction_birth"],
  "Auch eine ungruppierte Kette wie A=g*h/2 soll erst den Nenner abbauen und dann den verbleibenden Faktor in den Nenner verschieben."
);

const ungroupedAreaRows = ungroupedAreaResult.exportData.projectionRows;
const ungroupedAreaAnchorCols = getAnchorColumns(ungroupedAreaRows);
assertAllEqual(
  ungroupedAreaAnchorCols,
  "Auch bei A=g*h/2 muss der Gleichheitsanker ueber beide Folgeschritte stabil bleiben."
);

const ungroupedAreaCollapseStep = ungroupedAreaResult.schritte[0].strategie;
const ungroupedAreaBirthStep = ungroupedAreaResult.schritte[1].strategie;
const ungroupedAreaInitialRow = ungroupedAreaRows[0].positionedAtoms;
const ungroupedAreaMiddleRow = ungroupedAreaRows[1].positionedAtoms;
const ungroupedAreaFinalRow = ungroupedAreaRows[2].positionedAtoms;
const ungroupedAreaInitialG = findVisibleBySourceAtomId(ungroupedAreaInitialRow, ungroupedAreaBirthStep.targetId);
const ungroupedAreaMiddleG = findVisibleBySourceAtomId(ungroupedAreaMiddleRow, ungroupedAreaBirthStep.targetId);
const ungroupedAreaFinalG = findVisibleBySourceAtomId(ungroupedAreaFinalRow, ungroupedAreaBirthStep.targetId);
assertAllEqual(
  [ungroupedAreaInitialG.col, ungroupedAreaMiddleG.col, ungroupedAreaFinalG.col],
  "Die Zielvariable g darf bei A=g*h/2 ueber Nennerabbau und anschliessende Bruchgeburt nicht horizontal driften."
);

const ungroupedAreaInitialOperator = findVisibleBySourceAtomId(ungroupedAreaInitialRow, ungroupedAreaCollapseStep.targetExpressionIds[1]);
const ungroupedAreaMiddleOperator = findVisibleBySourceAtomId(ungroupedAreaMiddleRow, ungroupedAreaCollapseStep.targetExpressionIds[1]);
const ungroupedAreaInitialH = findVisibleBySourceAtomId(ungroupedAreaInitialRow, ungroupedAreaCollapseStep.targetExpressionIds[2]);
const ungroupedAreaMiddleH = findVisibleBySourceAtomId(ungroupedAreaMiddleRow, ungroupedAreaCollapseStep.targetExpressionIds[2]);
assertAllEqual(
  [ungroupedAreaInitialOperator.col, ungroupedAreaMiddleOperator.col],
  "Auch der freigelegte Multiplikationsoperator muss bei A=g*h/2 exakt auf seiner bisherigen Zaehlerspur erscheinen."
);
assertAllEqual(
  [ungroupedAreaInitialH.col, ungroupedAreaMiddleH.col],
  "Auch der freigelegte Faktor h muss bei A=g*h/2 exakt auf seiner bisherigen Zaehlerspur erscheinen."
);

const mirroredFractionCollapseResult = await GenesisCore.solve("a/cos(alpha)=b/cos(beta)", { targetVariable: "b" });
assert.deepEqual(
  mirroredFractionCollapseResult.schritte.map((step) => step.strategie.family),
  ["fraction_collapse"],
  "Auch rechts muss ein Bruchziel wie b/cos(beta) als einfacher Nennerabbau erkannt werden."
);

const mirroredFractionRows = mirroredFractionCollapseResult.exportData.projectionRows;
const mirroredFractionAnchorCols = getAnchorColumns(mirroredFractionRows);
assertAllEqual(
  mirroredFractionAnchorCols,
  "Auch bei der rechten Bruchauflosung muss der Gleichheitsanker stabil bleiben."
);

const mirroredFractionStep = mirroredFractionCollapseResult.schritte[0].strategie;
const mirroredFractionInitialRow = mirroredFractionRows[0].positionedAtoms;
const mirroredFractionFinalRow = mirroredFractionRows[1].positionedAtoms;
const mirroredFractionInitialB = findVisibleBySourceAtomId(mirroredFractionInitialRow, mirroredFractionStep.targetExpressionIds[0]);
const mirroredFractionFinalB = findVisibleBySourceAtomId(mirroredFractionFinalRow, mirroredFractionStep.targetExpressionIds[0]);
assertAllEqual(
  [mirroredFractionInitialB.col, mirroredFractionFinalB.col],
  "Bei a/cos(alpha)=b/cos(beta) muss der freigelegte rechte Zaehler auf derselben Spalte bleiben."
);

const cosineRatioAlphaResult = await GenesisCore.solve("cos(beta)/b=cos(alpha)/a", { targetVariable: "alpha" });
assert.deepEqual(
  cosineRatioAlphaResult.schritte.map((step) => step.strategie.family),
  ["fraction_collapse", "trig_inverse"],
  "Auch gespiegelt soll cos(beta)/b=cos(alpha)/a zuerst den Nenner abbauen und danach mit acos invertieren."
);

const cosineRatioAlphaRows = cosineRatioAlphaResult.exportData.projectionRows;
const cosineRatioAlphaAnchorCols = getAnchorColumns(cosineRatioAlphaRows);
assertAllEqual(
  cosineRatioAlphaAnchorCols,
  "Auch bei cos(beta)/b=cos(alpha)/a muss der Gleichheitsanker ueber alle Schritte stabil bleiben."
);

const cosineRatioAlphaSourceId = cosineRatioAlphaResult.exportData.theoryRows[0].atoms[2].numerator[0].content[0].id;
const cosineRatioInitialAlpha = findVisibleBySourceAtomId(cosineRatioAlphaRows[0].positionedAtoms, cosineRatioAlphaSourceId);
const cosineRatioMiddleAlpha = findVisibleBySourceAtomId(cosineRatioAlphaRows[1].positionedAtoms, cosineRatioAlphaSourceId);
const cosineRatioFinalAlpha = findVisibleBySourceAtomId(cosineRatioAlphaRows[2].positionedAtoms, cosineRatioAlphaSourceId);
assertAllEqual(
  [cosineRatioInitialAlpha.col, cosineRatioMiddleAlpha.col, cosineRatioFinalAlpha.col],
  "Die aktive Zielspur alpha darf bei cos(beta)/b=cos(alpha)/a auch in der finalen acos-Zeile nicht horizontal driften."
);

const groupedBirthThenTrigResult = await GenesisCore.solve("2*(sin(x))=10");
const groupedBirthThenTrigFamilies = groupedBirthThenTrigResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(
  groupedBirthThenTrigFamilies,
  ["fraction_birth", "group_release", "trig_inverse"],
  "Die Kette 2*(sin(x))=10 soll Bruchgeburt, Gruppenfreilegung und danach die trigonometrische Umkehrung ausfuehren."
);

const groupedBirthThenTrigRows = groupedBirthThenTrigResult.exportData.projectionRows;
const groupedBirthThenTrigAnchorCols = getAnchorColumns(groupedBirthThenTrigRows);
assertAllEqual(
  groupedBirthThenTrigAnchorCols,
  "Auch ueber die Kette fraction_birth -> group_release -> trig_inverse muss der Gleichheitsanker stabil bleiben."
);
assert.equal(groupedBirthThenTrigResult.exportData.layoutPlan.rowCount, 4);
assert.equal(groupedBirthThenTrigResult.exportData.layoutPlan.visualRowCount, 5);

const groupedBirthStep = groupedBirthThenTrigResult.schritte[0].strategie;
const groupedReleaseStep = groupedBirthThenTrigResult.schritte[1].strategie;
const groupedTrigAfterReleaseStep = groupedBirthThenTrigResult.schritte[2].strategie;
const groupedBirthInitialRow = groupedBirthThenTrigRows[0].positionedAtoms;
const groupedBirthMiddleRow = groupedBirthThenTrigRows[1].positionedAtoms;
const groupedReleaseRow = groupedBirthThenTrigRows[2].positionedAtoms;
const groupedBirthFinalRow = groupedBirthThenTrigRows[3].positionedAtoms;
const groupedBirthTargetSourceId = groupedTrigAfterReleaseStep.targetExpressionIds[0];

const groupedBirthInitialGroup = findVisibleBySourceAtomId(groupedBirthInitialRow, groupedBirthStep.targetId);
const groupedBirthMiddleGroup = findVisibleBySourceAtomId(groupedBirthMiddleRow, groupedBirthStep.targetId);
const groupedReleaseVisibleArgument = findVisibleBySourceAtomId(groupedReleaseRow, groupedBirthTargetSourceId);
const groupedBirthFinalVariable = findVisibleBySourceAtomId(groupedBirthFinalRow, groupedBirthTargetSourceId);
assert.equal(
  groupedReleaseVisibleArgument.col,
  groupedBirthFinalVariable.col,
  "Sobald die Zielvariable nach der Gruppenfreilegung explizit sichtbar ist, muss sie auch im finalen trigonometrischen Schritt auf derselben Inhalts-Spur bleiben."
);
assert.ok(
  groupedBirthInitialGroup.colStart <= groupedBirthFinalVariable.col && groupedBirthFinalVariable.col <= groupedBirthInitialGroup.colEnd,
  "Solange die Zielvariable noch in der sichtbaren Aussengruppe steckt, muss ihre spaetere Inhalts-Spur bereits innerhalb dieser Gruppenspur liegen."
);
assert.ok(
  groupedBirthMiddleGroup.colStart <= groupedBirthFinalVariable.col && groupedBirthFinalVariable.col <= groupedBirthMiddleGroup.colEnd,
  "Auch der Zwischenzustand der sichtbaren Aussengruppe muss die spaetere Inhalts-Spur der Zielvariable bereits abdecken."
);

const groupedBirthInitialOpposite = groupedBirthInitialRow.find((atom) => atom.value === "10");
const groupedBirthDivisionId = `generated-fraction_birth-division-from-${groupedBirthStep.passiveExpressionIds.join("__")}`;
const groupedBirthMiddleDivision = findById(groupedBirthMiddleRow, groupedBirthDivisionId);
const groupedBirthMiddleLine = groupedBirthMiddleRow.find(
  (atom) => atom.sourceShellId === groupedBirthDivisionId && atom.projectionRole === "fraction_line"
);
const groupedBirthMiddleDenominator = groupedBirthMiddleRow.find(
  (atom) => atom.sourceShellId === groupedBirthDivisionId && atom.projectionRole === "denominator"
);
const groupedBirthMiddleNumerator = findVisibleBySourceAtomId(groupedBirthMiddleRow, groupedBirthInitialOpposite.sourceAtomId);
const groupedReleaseDivision = findById(groupedReleaseRow, groupedBirthDivisionId);
const groupedReleaseLine = groupedReleaseRow.find(
  (atom) => atom.sourceShellId === groupedBirthDivisionId && atom.projectionRole === "fraction_line"
);
const groupedReleaseDenominator = groupedReleaseRow.find(
  (atom) => atom.sourceShellId === groupedBirthDivisionId && atom.projectionRole === "denominator"
);
const groupedReleaseNumerator = findVisibleBySourceAtomId(groupedReleaseRow, groupedBirthInitialOpposite.sourceAtomId);
const groupedBirthInverseTrigId = `generated-trig_inverse-function-from-${groupedTrigAfterReleaseStep.targetId}`;
const groupedBirthFinalInverse = findById(groupedBirthFinalRow, groupedBirthInverseTrigId);
const groupedBirthFinalNumerator = findVisibleBySourceAtomId(groupedBirthFinalRow, groupedBirthInitialOpposite.sourceAtomId);
assert.ok(
  groupedBirthMiddleDivision
  && groupedBirthMiddleLine
  && groupedBirthMiddleDenominator
  && groupedBirthMiddleNumerator
  && groupedReleaseDivision
  && groupedReleaseLine
  && groupedReleaseDenominator
  && groupedReleaseNumerator
  && groupedBirthFinalInverse
  && groupedBirthFinalNumerator
);
assertAllEqual(
  [
    groupedBirthInitialOpposite.col,
    groupedBirthMiddleNumerator.col,
    groupedReleaseNumerator.col,
    groupedBirthFinalNumerator.col
  ],
  "Auch ueber Bruchgeburt, Gruppenfreilegung und Inversschale muss der freie Gegenausdruck seine Inhaltsspur behalten."
);

const groupedReleaseGroupTrace = groupedBirthThenTrigResult.exportData.traceIndex[groupedReleaseStep.targetId];
assert.ok(groupedReleaseGroupTrace, "Die freigelegte Aussengruppe muss im Trace-Index erhalten bleiben.");
assert.ok(
  groupedReleaseGroupTrace.projection.some((entry) => entry.isVisible === true),
  "Die Aussengruppe muss in der Projektion zuerst sichtbar lesbar sein."
);
assert.ok(
  groupedReleaseGroupTrace.projection.some((entry) => entry.visualMode === "GHOST_HOLE"),
  "Die Aussengruppe muss nach der Freilegung als GHOST_HOLE weiterverfolgbar bleiben."
);

const denominatorReleaseThenBirthResult = await GenesisCore.solve("sin(alpha)/a=sin(beta)/b", { targetVariable: "a" });
const denominatorReleaseThenBirthFamilies = denominatorReleaseThenBirthResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(
  denominatorReleaseThenBirthFamilies,
  ["fraction_denominator_release", "fraction_birth"],
  "Der invertierte Sinussatz soll zuerst den Nenner der Zielseite freilegen und danach den Gegenausdruck als neuen Nenner aufbauen."
);

const denominatorReleaseThenBirthRows = denominatorReleaseThenBirthResult.exportData.projectionRows;
const denominatorReleaseThenBirthAnchorCols = getAnchorColumns(denominatorReleaseThenBirthRows);
assertAllEqual(
  denominatorReleaseThenBirthAnchorCols,
  "Auch ueber die Kette fraction_denominator_release -> fraction_birth muss der Gleichheitsanker auf derselben Spalte bleiben."
);

const denominatorReleaseStep = denominatorReleaseThenBirthResult.schritte[0].strategie;
const denominatorBirthStep = denominatorReleaseThenBirthResult.schritte[1].strategie;
const denominatorReleaseProjectionRow = denominatorReleaseThenBirthRows[1].positionedAtoms;
const denominatorBirthProjectionRow = denominatorReleaseThenBirthRows[2].positionedAtoms;
const denominatorTrackId = denominatorBirthStep.targetExpressionIds[0];
const denominatorReleasedFactor = findVisibleBySourceAtomId(denominatorReleaseProjectionRow, denominatorTrackId);
const denominatorFinalVariable = findVisibleBySourceAtomId(denominatorBirthProjectionRow, denominatorTrackId);
assert.ok(
  denominatorReleasedFactor,
  "Nach fraction_denominator_release muss die freigelegte Zielvariable als sichtbarer Faktor auf der Gegenseite lesbar bleiben."
);
assert.ok(
  denominatorFinalVariable,
  "Nach der nachfolgenden Bruchgeburt muss die Zielvariable weiterhin als sichtbare Zielspur lesbar bleiben."
);
assert.equal(
  denominatorReleasedFactor.col,
  denominatorFinalVariable.col,
  "Die Zielvariable darf ueber die Kette fraction_denominator_release -> fraction_birth ihre rechte Faktor-Spur nicht wieder verlieren."
);

const denominatorGhostMultiplicationId = `generated-fraction_denominator_release-multiplication-from-${denominatorReleaseStep.passiveExpressionIds.join("__")}`;
const denominatorBirthGhostMultiplication = findById(denominatorBirthProjectionRow, denominatorGhostMultiplicationId);
assert.ok(
  denominatorBirthGhostMultiplication?.isVisible === false,
  "Die vorherige Faktorhuelle muss nach der Bruchgeburt als unsichtbare Spur erhalten bleiben."
);
assert.ok(
  denominatorBirthGhostMultiplication?.col < denominatorFinalVariable.col,
  "Die unsichtbare Altspur der Faktorhuelle muss links vor der freigelegten Zielvariable liegen, damit deren fruehere Spalte erhalten bleibt."
);

const groupedRootThenCollapseResult = await GenesisCore.solve("sqrt(x/(2+1))=3");
const groupedRootThenCollapseFamilies = groupedRootThenCollapseResult.schritte.map((step) => step.strategie.family);
assert.deepEqual(
  groupedRootThenCollapseFamilies,
  ["root_power", "fraction_collapse"],
  "Die Kette sqrt(x/(2+1))=3 soll zuerst die Wurzel abbauen und danach den gruppierten Nenner kollabieren."
);

const groupedRootThenCollapseRows = groupedRootThenCollapseResult.exportData.projectionRows;
const groupedRootThenCollapseAnchorCols = getAnchorColumns(groupedRootThenCollapseRows);
assertAllEqual(
  groupedRootThenCollapseAnchorCols,
  "Auch ueber die Kette root_power -> fraction_collapse muss der Gleichheitsanker auf derselben Spalte bleiben."
);
assert.equal(groupedRootThenCollapseResult.exportData.layoutPlan.rowCount, 3);
assert.equal(groupedRootThenCollapseResult.exportData.layoutPlan.visualRowCount, 4);
assert.equal(groupedRootThenCollapseResult.exportData.layoutPlan.stackedVisualRowCount, 5);

const groupedRootStep = groupedRootThenCollapseResult.schritte[0].strategie;
const groupedRootCollapseStep = groupedRootThenCollapseResult.schritte[1].strategie;
const groupedRootInitialRow = groupedRootThenCollapseRows[0].positionedAtoms;
const groupedRootMiddleRow = groupedRootThenCollapseRows[1].positionedAtoms;
const groupedRootFinalRow = groupedRootThenCollapseRows[2].positionedAtoms;

const groupedRootInitialShell = findVisibleBySourceAtomId(groupedRootInitialRow, groupedRootStep.targetId);
const groupedRootMiddleNumerator = findVisibleBySourceAtomId(groupedRootMiddleRow, groupedRootCollapseStep.targetExpressionIds[0]);
const groupedRootFinalVariable = findVisibleBySourceAtomId(groupedRootFinalRow, groupedRootCollapseStep.targetExpressionIds[0]);
assert.equal(
  groupedRootMiddleNumerator.col,
  groupedRootFinalVariable.col,
  "Sobald die Zielvariable nach dem Wurzelabbau explizit sichtbar ist, muss sie auch nach dem gruppierten Nennerabbau auf derselben Inhalts-Spur bleiben."
);
assert.ok(
  groupedRootInitialShell.colStart <= groupedRootFinalVariable.col && groupedRootFinalVariable.col <= groupedRootInitialShell.colEnd,
  "Solange die Zielvariable noch in der sichtbaren Wurzelschale steckt, muss ihre spaetere Inhalts-Spur bereits innerhalb der Wurzelspur liegen."
);

const groupedRootMiddleDivision = findById(groupedRootMiddleRow, groupedRootCollapseStep.targetId);
const groupedRootMiddleLine = groupedRootMiddleRow.find(
  (atom) => atom.sourceShellId === groupedRootCollapseStep.targetId && atom.projectionRole === "fraction_line"
);
const groupedRootMiddleDenominator = groupedRootMiddleRow.find(
  (atom) => atom.sourceShellId === groupedRootCollapseStep.targetId && atom.projectionRole === "denominator"
);
const groupedRootMiddleAnchor = groupedRootMiddleRow.find((atom) => atom.value === "=");
const groupedRootFinalMultiplicationId = `generated-fraction_collapse-multiplication-from-${groupedRootCollapseStep.passiveExpressionIds.join("__")}`;
const groupedRootFinalMultiplication = findById(groupedRootFinalRow, groupedRootFinalMultiplicationId);
const groupedRootInitialOpposite = groupedRootInitialRow.find((atom) => atom.value === "3");
assert.equal(groupedRootMiddleDenominator.type, "GROUP");
assert.equal(groupedRootThenCollapseRows[1].axisLocalRow, 1, "Der sichtbare Zwischenbruch muss die Achse auf seiner mittleren Teilzeile tragen.");
assert.equal(groupedRootMiddleAnchor.row, groupedRootMiddleLine.row, "Beim Zwischenbruch nach root_power muss der Gleichheitsanker auf der Bruchachse liegen.");
assert.equal(groupedRootMiddleDivision.col, groupedRootMiddleLine.col);
assert.equal(groupedRootMiddleDenominator.colStart, groupedRootMiddleLine.col - 1);
assert.equal(groupedRootMiddleDenominator.colEnd, groupedRootMiddleLine.col + 1);
assertAllEqual(
  [
    groupedRootInitialOpposite.col,
    groupedRootFinalMultiplication.col
  ],
  "Die Gegenseite darf auch ueber root_power -> fraction_collapse nicht horizontal driften."
);

const groupedRootDenominatorTrace = groupedRootThenCollapseResult.exportData.traceIndex[groupedRootCollapseStep.passiveExpressionId];
assert.ok(groupedRootDenominatorTrace, "Der gruppierte Nenner muss im Trace-Index des Wurzelfalls erhalten bleiben.");
assert.ok(
  groupedRootDenominatorTrace.theory.some((entry) => entry.containerKey === "denominator"),
  "Der gruppierte Nenner muss im Wurzelfall in der Theoriespur zuerst als Nenner lesbar bleiben."
);
assert.ok(
  groupedRootDenominatorTrace.theory.some((entry) => entry.containerKey === "factor"),
  "Der gruppierte Nenner muss im Wurzelfall spaeter als Faktor lesbar bleiben."
);
assert.ok(
  groupedRootDenominatorTrace.projection.some((entry) => entry.projectionRole === "denominator"),
  "Der gruppierte Nenner muss im Wurzelfall auch in der Projektion als Nenner erhalten bleiben."
);
