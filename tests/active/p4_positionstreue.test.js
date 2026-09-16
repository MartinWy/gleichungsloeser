import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";
import { process as projectTheoryRows } from "../../core/P4_Projektion/index.js";

function getAnchorColumns(projectionRows) {
  return projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=")?.col ?? null);
}

function getVisibleProjectionColumns(traceEntry) {
  return Array.from(
    new Set(
      (traceEntry?.projection || [])
        .filter((entry) => entry.isVisible !== false && Number.isInteger(entry.col))
        .map((entry) => entry.col)
    )
  );
}

const topologyRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "x-base", value: "x", type: "VARIABLE", isVisible: true },
      { id: "eq-base", value: "=", type: "ANCHOR", isVisible: true },
      { id: "hundred-base", value: "100", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "x-followup", value: "x", type: "VARIABLE", isVisible: true },
      { id: "eq-followup", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "division-monster",
        type: "DIVISION",
        isVisible: true,
        numerator: [{ id: "hundred-followup", value: "100", type: "NUMBER", isVisible: true }],
        denominator: [
          { id: "two-followup", value: "2", type: "NUMBER", isVisible: true, position: "denominator" },
          { id: "times-followup", value: "*", type: "OPERATOR", isVisible: true, position: "denominator" },
          { id: "group-followup", type: "GROUP", isVisible: true, position: "denominator", content: [] }
        ]
      }
    ],
    strategy: null
  }
];

const topologyProjection = projectTheoryRows(topologyRows);
const topologyAnchorCols = getAnchorColumns(topologyProjection.projectionRows);
const topologyFinalProjectionRow = topologyProjection.projectionRows[1];
const topologyFinalRow = topologyFinalProjectionRow.positionedAtoms;
const topologyDivisionShell = topologyFinalRow.find((atom) => atom.id === "division-monster");
const topologyNumerator = topologyFinalRow.find((atom) => atom.sourceShellId === "division-monster" && atom.projectionRole === "numerator");
const topologyLine = topologyFinalRow.find((atom) => atom.sourceShellId === "division-monster" && atom.projectionRole === "fraction_line");
const topologyDenominatorParts = topologyFinalRow
  .filter((atom) => atom.sourceShellId === "division-monster" && atom.projectionRole === "denominator")
  .sort((left, right) => left.col - right.col);
const topologyFollowupX = topologyFinalRow.find((atom) => atom.id === "x-followup");
const topologyFollowupAnchor = topologyFinalRow.find((atom) => atom.id === "eq-followup");

assert.equal(topologyAnchorCols[0], topologyAnchorCols[1], "Auch bei einer vertikal aufgefaecherten Folgezeile muss der Gleichheitsanker stabil bleiben.");
assert.equal(topologyProjection.layoutPlan.visualRowCount, 4, "Die vertikale Bruchprojektion soll die Zusatzzeilen im Layout mitzaehlen.");
assert.equal(topologyProjection.layoutPlan.stackedVisualRowCount, 4, "Die erste gestapelte Projektion soll dieselbe sichtbare Blockhoehe melden.");
assert.equal(topologyFinalProjectionRow.localRowCount, 3, "Ein sichtbarer Bruch muss als dreizeiliger Projektionsblock exportiert werden.");
assert.equal(topologyFinalProjectionRow.axisLocalRow, 1, "Die Bruchachse eines sichtbaren Bruchs muss die mittlere lokale Teilzeile bilden.");
assert.equal(topologyNumerator.col, topologyDivisionShell.col, "Der Zaehler muss auf der Shell-Spalte verankert bleiben.");
assert.equal(topologyLine.col, topologyDivisionShell.col, "Der Bruchstrich muss auf der Shell-Spalte verankert bleiben.");
assert.equal(topologyFollowupX.row, topologyLine.row, "Freistehende Gleichungsteile muessen bei sichtbarem Bruch auf der Hoehe des Bruchstrichs liegen.");
assert.equal(topologyFollowupAnchor.row, topologyLine.row, "Auch der Gleichheitsanker muss bei sichtbarem Bruch auf der Achszeile sitzen.");
assert.equal(topologyFollowupX.localRow, topologyFinalProjectionRow.axisLocalRow, "Die Zielspur muss lokal auf der exportierten Bruchachse liegen.");
assert.equal(topologyFollowupAnchor.localRow, topologyFinalProjectionRow.axisLocalRow, "Auch der Gleichheitsanker muss lokal auf der exportierten Bruchachse liegen.");
assert.deepEqual(
  topologyDenominatorParts.map((atom) => atom.col),
  [topologyDivisionShell.col - 1, topologyDivisionShell.col, topologyDivisionShell.col + 1],
  "Ein mehrteiliger Nenner muss symmetrisch um die Bruchspalte zentriert bleiben."
);

const fractionBirthResult = await GenesisCore.solve("2*x=10");
const fractionBirthAnchorCols = getAnchorColumns(fractionBirthResult.exportData.projectionRows);
const fractionBirthStrategy = fractionBirthResult.schritte[0].strategie;
const fractionBirthDivisionId = `generated-fraction_birth-division-from-${fractionBirthStrategy.passiveExpressionIds.join("__")}`;
const fractionBirthProjectionRow = fractionBirthResult.exportData.projectionRows[1].positionedAtoms;
const fractionBirthNumerator = fractionBirthProjectionRow.find((atom) => atom.sourceShellId === fractionBirthDivisionId && atom.projectionRole === "numerator");
const fractionBirthLine = fractionBirthProjectionRow.find((atom) => atom.sourceShellId === fractionBirthDivisionId && atom.projectionRole === "fraction_line");
const fractionBirthDenominator = fractionBirthProjectionRow.find((atom) => atom.sourceShellId === fractionBirthDivisionId && atom.projectionRole === "denominator");
const fractionBirthTargetTrace = fractionBirthResult.exportData.traceIndex[fractionBirthStrategy.targetId];

assert.equal(fractionBirthAnchorCols[0], fractionBirthAnchorCols[1], "Auch bei Bruchgeburt muss der Gleichheitsanker ueber beide Zeilen stabil bleiben.");
assert.equal(fractionBirthNumerator.col, fractionBirthLine.col, "Zaehler und Bruchstrich muessen dieselbe globale Spalte teilen.");
assert.equal(fractionBirthLine.col, fractionBirthDenominator.col, "Bruchstrich und Nenner muessen dieselbe globale Spalte teilen.");
assert.deepEqual(
  getVisibleProjectionColumns(fractionBirthTargetTrace),
  [2],
  "Die unveraenderte Zielvariable darf bei der Bruchgeburt horizontal nicht driften."
);

const fractionCollapseResult = await GenesisCore.solve("x/2=5");
const fractionCollapseAnchorCols = getAnchorColumns(fractionCollapseResult.exportData.projectionRows);
const fractionCollapseInitialRow = fractionCollapseResult.exportData.projectionRows[0].positionedAtoms;
const fractionCollapseInitialDivisionId = fractionCollapseResult.exportData.theoryRows[0].atoms[0].id;
const fractionCollapseInitialNumerator = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivisionId && atom.projectionRole === "numerator");
const fractionCollapseInitialLine = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivisionId && atom.projectionRole === "fraction_line");
const fractionCollapseInitialDenominator = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivisionId && atom.projectionRole === "denominator");
const fractionCollapseTargetId = fractionCollapseResult.schritte[0].strategie.targetExpressionIds[0];
const fractionCollapseTargetTrace = fractionCollapseResult.exportData.traceIndex[fractionCollapseTargetId];
const fractionCollapseInitialAnchor = fractionCollapseInitialRow.find((atom) => atom.value === "=");
const fractionCollapseInitialOpposite = fractionCollapseInitialRow.find((atom) => atom.value === "5");

assert.equal(fractionCollapseAnchorCols[0], fractionCollapseAnchorCols[1], "Auch beim Nennerabbau muss der Gleichheitsanker ueber beide Zeilen stabil bleiben.");
assert.equal(fractionCollapseInitialNumerator.col, fractionCollapseInitialLine.col, "Der sichtbare Startbruch muss bereits korrekt vertikal ausgerichtet sein.");
assert.equal(fractionCollapseInitialLine.col, fractionCollapseInitialDenominator.col, "Auch der Nenner des Startbruchs muss auf derselben Bruchspalte sitzen.");
assert.equal(fractionCollapseInitialAnchor.row, fractionCollapseInitialLine.row, "Beim sichtbaren Startbruch muss der Gleichheitsanker auf der Bruchachse liegen.");
assert.equal(fractionCollapseInitialOpposite.row, fractionCollapseInitialLine.row, "Auch die Gegenseite eines sichtbaren Startbruchs muss auf der Bruchachse liegen.");
assert.deepEqual(
  getVisibleProjectionColumns(fractionCollapseTargetTrace),
  [1],
  "Die unveraenderte Zielvariable darf beim Nennerabbau horizontal nicht driften."
);

const compoundFractionBirthResult = await GenesisCore.solve("2*x+3=5", { targetVariable: "x" });
const compoundFractionBirthRows = compoundFractionBirthResult.exportData.projectionRows;
const compoundFractionBirthAnchorCols = getAnchorColumns(compoundFractionBirthRows);
const compoundInitialRow = compoundFractionBirthResult.exportData.theoryRows[0].atoms;
const compoundOppositeFiveId = compoundInitialRow[6].id;
const compoundPassiveThreeId = compoundInitialRow[4].id;
const compoundOppositeFiveTrace = compoundFractionBirthResult.exportData.traceIndex[compoundOppositeFiveId];
const compoundOppositeThreeTrace = compoundFractionBirthResult.exportData.traceIndex[compoundPassiveThreeId];
const compoundFinalRow = compoundFractionBirthRows[2].positionedAtoms;
const compoundDivisionId = `generated-fraction_birth-division-from-${compoundFractionBirthResult.schritte[1].strategie.passiveExpressionIds.join("__")}`;
const compoundFractionLine = compoundFinalRow.find(
  (atom) => atom.sourceShellId === compoundDivisionId && atom.projectionRole === "fraction_line"
);
const compoundDenominator = compoundFinalRow.find(
  (atom) => atom.sourceShellId === compoundDivisionId && atom.projectionRole === "denominator"
);
const compoundFinalTarget = compoundFinalRow.find((atom) => atom.value === "x");
const compoundFinalAnchor = compoundFinalRow.find((atom) => atom.value === "=");

assert.equal(compoundFractionBirthAnchorCols[0], compoundFractionBirthAnchorCols[1], "Auch ueber den vorbereitenden Additionsschritt muss der Gleichheitsanker stabil bleiben.");
assert.equal(compoundFractionBirthAnchorCols[1], compoundFractionBirthAnchorCols[2], "Auch beim zusammengesetzten Zaehler darf der Gleichheitsanker nicht driften.");
assert.deepEqual(
  getVisibleProjectionColumns(compoundOppositeFiveTrace),
  [6],
  "Die 5 der Gegenseite muss auch nach der Bruchgeburt in derselben globalen Spalte bleiben."
);
assert.deepEqual(
  compoundOppositeThreeTrace.projection
    .filter((entry) => entry.isVisible !== false && entry.rowId !== "projection-0")
    .map((entry) => entry.col),
  [8, 8],
  "Nach dem Seitenwechsel muss der passive Gegenausdruck im zusammengesetzten Zaehler spaltenstabil bleiben."
);
assert.equal(compoundFractionLine.colStart, 6, "Der Bruchstrich muss beim zusammengesetzten Zaehler an der linken Gegenkante beginnen.");
assert.equal(compoundFractionLine.colEnd, 8, "Der Bruchstrich muss die volle Breite des zusammengesetzten Zaehlerausdrucks tragen.");
assert.equal(compoundDenominator.col, 7, "Der Nenner muss unter einem zusammengesetzten Zaehler mittig ausgerichtet bleiben.");
assert.equal(compoundFinalTarget.row, compoundFractionLine.row, "Wenn links nur noch die Zielvariable steht, muss sie auf der Achse des Abschlussbruchs sitzen.");
assert.equal(compoundFinalAnchor.row, compoundFractionLine.row, "Auch der Gleichheitsanker muss im Abschlussbruch auf der Bruchachse sitzen.");

const rootSpanResult = await GenesisCore.solve("2*sqrt(x+3)=5", { targetVariable: "x" });
const rootSpanStartRow = rootSpanResult.exportData.projectionRows[0].positionedAtoms;
const rootSpanAfterRootRow = rootSpanResult.exportData.projectionRows[2].positionedAtoms;
const rootSpanStartRoot = rootSpanStartRow.find((atom) => atom.type === "ROOT" && atom.isVisible !== false);
const rootSpanX = rootSpanAfterRootRow.find((atom) => atom.value === "x" && atom.isVisible !== false);
const rootSpanPlus = rootSpanAfterRootRow.find((atom) => atom.value === "+" && atom.isVisible !== false);
const rootSpanThree = rootSpanAfterRootRow.find((atom) => atom.value === "3" && atom.isVisible !== false);

assert.equal(rootSpanStartRoot.colStart, rootSpanX.col, "Die sichtbare Wurzel muss links auf der spaeteren x-Spalte beginnen.");
assert.equal(rootSpanStartRoot.colEnd, rootSpanThree.col, "Die sichtbare Wurzel muss rechts auf der spaeteren 3-Spalte enden.");
assert.deepEqual(
  [rootSpanX.col, rootSpanPlus.col, rootSpanThree.col],
  [rootSpanStartRoot.colStart, rootSpanStartRoot.colStart + 1, rootSpanStartRoot.colEnd],
  "Die befreiten Wurzelkinder muessen die P4-Spalten der vorherigen Wurzelschale fortsetzen."
);

const complexGroupSpanResult = await GenesisCore.solve("2*sqrt((x+3)/(2+1))=5", { targetVariable: "x" });
const complexGroupBeforeCollapseRow = complexGroupSpanResult.exportData.projectionRows[2].positionedAtoms;
const complexGroupAfterCollapseRow = complexGroupSpanResult.exportData.projectionRows[3].positionedAtoms;
const complexVisibleGroup = complexGroupBeforeCollapseRow.find((atom) => atom.type === "GROUP" && atom.projectionRole === "numerator" && atom.isVisible !== false);
const complexGroupX = complexGroupAfterCollapseRow.find((atom) => atom.value === "x" && atom.isVisible !== false);
const complexGroupPlus = complexGroupAfterCollapseRow.find((atom) => atom.value === "+" && atom.isVisible !== false);
const complexGroupThree = complexGroupAfterCollapseRow.find((atom) => atom.value === "3" && atom.isVisible !== false);

assert.equal(complexVisibleGroup.colStart, complexGroupX.col, "Die geschuetzte Zaehlergruppe muss links auf der spaeteren x-Spalte beginnen.");
assert.equal(complexVisibleGroup.colEnd, complexGroupThree.col, "Die geschuetzte Zaehlergruppe muss rechts auf der spaeteren 3-Spalte enden.");
assert.deepEqual(
  [complexGroupX.col, complexGroupPlus.col, complexGroupThree.col],
  [complexVisibleGroup.colStart, complexVisibleGroup.colStart + 1, complexVisibleGroup.colEnd],
  "Die direkt freigelegten Zaehleratome muessen die P4-Spalten der vorherigen Zaehlerspur fortsetzen."
);
