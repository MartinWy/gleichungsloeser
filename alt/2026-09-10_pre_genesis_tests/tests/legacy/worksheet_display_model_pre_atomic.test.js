// Am 10. September 2026 als vorkanonischer Display-Test archiviert.
import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { resolveCellSemanticBounds } from "../../components/Arbeitsblatt_Druckansicht/cellSemanticBounds.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";

const result = await GenesisCore.solve("sin(sqrt((x+3)/(2+1)))=5", { targetVariable: "x" });
assert.equal(result.fehler, undefined);

const viewModel = buildWorksheetViewModel(result);
const displayModel = buildWorksheetDisplayModel(viewModel);
const startFunctionName = viewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "sin");
const startFunctionLeft = viewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_left");
const startFunctionArgument = viewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_argument" && cell.renderNode?.type === "root");
const startFunctionRight = viewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_right");
const inverseRoot = viewModel.steps[1].cells.find((cell) => cell.renderNode?.type === "root");
const startEquals = viewModel.layout.cells.find((cell) => cell.stepIndex === 0 && cell.text === "=");
const startFunctionNameItem = displayModel.items.find((item) => item.cell.id === startFunctionName?.id && item.cell.stepIndex === 0);
const startFunctionLeftItem = displayModel.items.find((item) => item.cell.id === startFunctionLeft?.id && item.cell.stepIndex === 0);
const startFunctionArgumentItem = displayModel.items.find((item) => item.cell.id === startFunctionArgument?.id && item.cell.stepIndex === 0);
const startFunctionRightItem = displayModel.items.find((item) => item.cell.id === startFunctionRight?.id && item.cell.stepIndex === 0);
const inverseRootItem = displayModel.items.find((item) => item.cell.id === inverseRoot?.id && item.cell.stepIndex === 1);
const startEqualsItem = displayModel.items.find((item) => item.cell.id === startEquals?.id);
const startBounds = resolveCellSemanticBounds(startFunctionArgument);

assert.ok(startFunctionName && startFunctionLeft && startFunctionArgument && startFunctionRight, "Der Browser-Fall muss die sichtbare Funktion bereits in Namens-, Klammer- und Argumentspur zerlegen.");
assert.ok(inverseRoot, "Der Browser-Fall muss nach der Umkehrung eine sichtbare Wurzel tragen.");
assert.ok(startFunctionNameItem && startFunctionLeftItem && startFunctionArgumentItem && startFunctionRightItem && inverseRootItem && startEqualsItem, "Das Display-Modell muss die sichtbaren Browser-Zellen mit Slot-Grenzen anreichern.");
assert.deepEqual(
  { start: startBounds.semanticStart, end: startBounds.semanticEnd, inferred: startBounds.isInferred },
  { start: 3, end: 5, inferred: false },
  "Die sichtbare Wurzel im Funktionsargument soll ihre explizite Inhalts-Spanne direkt aus P4 uebernehmen, ohne spaetere Slot-Rekonstruktion."
);
assert.equal(
  startFunctionNameItem.gridColumnStartLine,
  startFunctionNameItem.semanticColumnStartLine,
  "Der explizite Funktionsname soll ohne nachtraegliche Rekonstruktion genau auf seiner eigenen P4-Spalte liegen."
);
assert.equal(
  startFunctionLeftItem.gridColumnStartLine,
  startFunctionLeftItem.semanticColumnStartLine,
  "Auch die linke Funktionsklammer soll direkt auf ihrer eigenen P4-Spalte liegen."
);
assert.equal(
  startFunctionRightItem.gridColumnEndLine,
  startEqualsItem.gridColumnStartLine,
  "Die explizite rechte Funktionsklammer soll exakt bis an die Gleichheits-Spalte reichen, aber nicht in sie hineinragen."
);
assert.ok(
  inverseRootItem.gridColumnStartLine < inverseRootItem.semanticColumnStartLine,
  "Auch die sichtbare Wurzel nach der Umkehrung muss links vor ihrer Inhalts-Spur einen eigenen Vorslot belegen."
);
assert.match(
  displayModel.gridTemplateColumns,
  /minmax\(1\.62em, max-content\)/,
  "Das Browser-Grid soll die expliziten Display-Slot-Breiten in die CSS-Spaltendefinition uebernehmen."
);

const cosineLawResult = await GenesisCore.solve("a^2+b^2-2abcosgamma=c^2", { targetVariable: "gamma" });
assert.equal(cosineLawResult.fehler, undefined);

const cosineLawViewModel = buildWorksheetViewModel(cosineLawResult);
const cosineLawDisplayModel = buildWorksheetDisplayModel(cosineLawViewModel);
const cosineFractionStep = cosineLawViewModel.steps[3];
const cosineFinalStep = cosineLawViewModel.steps[4];
const cosineLeftNumerator = cosineFractionStep.cells.find((cell) => cell.text === "c^2");
const cosineRightNumerator = cosineFractionStep.cells.find((cell) => cell.text === "b^2");
const cosineFinalFunctionName = cosineFinalStep.cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "acos");
const cosineFinalFunctionLeft = cosineFinalStep.cells.find((cell) => cell.projectionRole === "function_left");
const cosineFinalDivision = cosineFinalStep.cells.find((cell) => cell.projectionRole === "fraction_line");
const cosineFinalFunctionRight = cosineFinalStep.cells.find((cell) => cell.projectionRole === "function_right");
const cosineFinalDivisionBounds = resolveCellSemanticBounds(cosineFinalDivision);
const cosineLeftNumeratorItem = cosineLawDisplayModel.items.find(
  (item) => item.cell.id === cosineLeftNumerator?.id && item.cell.stepIndex === 3
);
const cosineRightNumeratorItem = cosineLawDisplayModel.items.find(
  (item) => item.cell.id === cosineRightNumerator?.id && item.cell.stepIndex === 3
);
const cosineFinalFunctionNameItem = cosineLawDisplayModel.items.find((item) => item.cell.id === cosineFinalFunctionName?.id && item.cell.stepIndex === 4);
const cosineFinalFunctionLeftItem = cosineLawDisplayModel.items.find((item) => item.cell.id === cosineFinalFunctionLeft?.id && item.cell.stepIndex === 4);
const cosineFinalDivisionItem = cosineLawDisplayModel.items.find((item) => item.cell.id === cosineFinalDivision?.id && item.cell.stepIndex === 4);
const cosineFinalFunctionRightItem = cosineLawDisplayModel.items.find((item) => item.cell.id === cosineFinalFunctionRight?.id && item.cell.stepIndex === 4);

assert.ok(
  cosineLeftNumeratorItem && cosineRightNumeratorItem && cosineFinalFunctionNameItem && cosineFinalFunctionLeftItem && cosineFinalDivisionItem && cosineFinalFunctionRightItem,
  "Der Kosinussatz-Fall muss im Browser-Display-Modell sowohl freie Zaehleratome als auch die finale acos-Struktur mit expliziter Bruchspur sichtbar machen."
);
assert.deepEqual(
  { start: cosineFinalDivisionBounds.semanticStart, end: cosineFinalDivisionBounds.semanticEnd, inferred: cosineFinalDivisionBounds.isInferred },
  { start: 19, end: 23, inferred: false },
  "Auch der finale Bruchstrich in acos(...) muss seine volle semantische Spanne bereits explizit aus P4 mitbringen, statt spaeter auf eine Einzelspalte zusammengedrueckt zu werden."
);
assert.equal(
  cosineLeftNumeratorItem.gridColumnStartLine,
  cosineLeftNumeratorItem.semanticColumnStartLine,
  "Ein freies Zaehleratom wie c^2 darf links keine spaeteren acos-Slots derselben Grenzspalte mehr mitschleppen."
);
assert.equal(
  cosineRightNumeratorItem.gridColumnEndLine,
  cosineRightNumeratorItem.semanticColumnEndLine,
  "Auch das rechte freie Zaehleratom b^2 darf rechts keine spaeteren acos-Slots derselben Grenzspalte mehr beanspruchen."
);
assert.equal(
  cosineFinalFunctionNameItem.gridColumnStartLine,
  cosineFinalFunctionNameItem.semanticColumnStartLine,
  "Der explizite acos-Name soll bereits auf seiner eigenen P4-Spalte liegen."
);
assert.equal(
  cosineFinalFunctionLeftItem.gridColumnStartLine,
  cosineFinalFunctionLeftItem.semanticColumnStartLine,
  "Auch die linke acos-Klammer soll bereits direkt auf ihrer expliziten P4-Spalte liegen."
);
assert.equal(
  cosineFinalDivisionItem.gridColumnStartLine,
  cosineFinalDivisionItem.semanticColumnStartLine,
  "Der finale Bruchstrich in acos(...) soll ohne nachtraegliche Slot-Rekonstruktion direkt auf seiner P4-Spalte liegen."
);
assert.equal(
  cosineFinalDivisionItem.gridColumnEndLine,
  cosineFinalDivisionItem.semanticColumnEndLine,
  "Auch die rechte Grenze des finalen Bruchstrichs soll im Browser-Display-Modell direkt aus P4 kommen."
);
assert.equal(
  cosineFinalFunctionRightItem.gridColumnStartLine,
  cosineFinalFunctionRightItem.semanticColumnStartLine,
  "Die rechte acos-Klammer soll ebenfalls ohne nachtraegliche Verschiebung direkt auf ihrer P4-Spalte liegen."
);

const explicitSpanCases = [
  ["a/sin(alpha)=b/sin(beta)", "a"],
  ["sin(alpha)/a=sin(beta)/b", "a"],
  ["cos(beta)/b=cos(alpha)/a", "alpha"]
];

for (const [equation, targetVariable] of explicitSpanCases) {
  const caseResult = await GenesisCore.solve(equation, { targetVariable });
  assert.equal(caseResult.fehler, undefined);

  const caseViewModel = buildWorksheetViewModel(caseResult);
  const inferredCells = caseViewModel.steps
    .flatMap((step) => step.cells)
    .filter((cell) => cell.renderNode)
    .map((cell) => ({
      cell,
      bounds: resolveCellSemanticBounds(cell)
    }))
    .filter(({ bounds }) => bounds.isInferred === true)
    .map(({ cell, bounds }) => ({
      text: cell.text,
      type: cell.renderNode?.type || null,
      semanticStart: bounds.semanticStart,
      semanticEnd: bounds.semanticEnd,
      explicitStart: bounds.explicitStart,
      explicitEnd: bounds.explicitEnd
    }));

  assert.deepEqual(
    inferredCells,
    [],
    `Im Fall ${equation} soll jede sichtbare Renderstruktur ihre semantische Spanne bereits explizit aus P4 mitbringen.`
  );
}

const dividedByFractionResult = await GenesisCore.solve("a/cos(alpha)=b/cos(beta)", { targetVariable: "alpha" });
assert.equal(dividedByFractionResult.fehler, undefined);

const dividedByFractionViewModel = buildWorksheetViewModel(dividedByFractionResult);
const dividedByFractionBirthStep = dividedByFractionViewModel.steps[2];
const dividedByFractionInverseStep = dividedByFractionViewModel.steps[3];
const dividedByFractionBirthCollapsed = dividedByFractionBirthStep.cells.find((cell) => cell.projectionRole === "fraction_line");
const dividedByFractionInverseCollapsed = dividedByFractionInverseStep.cells.find((cell) => cell.projectionRole === "fraction_line");
const dividedByFractionBirthOffAxisCells = dividedByFractionBirthStep.cells.filter((cell) => cell.row !== dividedByFractionBirthStep.axisLocalRow);
const dividedByFractionInverseOffAxisCells = dividedByFractionInverseStep.cells.filter((cell) => cell.row !== dividedByFractionInverseStep.axisLocalRow);

assert.ok(
  dividedByFractionBirthCollapsed && dividedByFractionInverseCollapsed,
  "Auch beim Teilen durch einen Bruch muss der eingeklappte Aussenbruch in den spaeteren Schritten als explizite sichtbare Bruchspur vorliegen."
);
assert.ok(
  dividedByFractionBirthOffAxisCells.every((cell) =>
    cell.colStart >= dividedByFractionBirthCollapsed.colStart
      && cell.colEnd <= dividedByFractionBirthCollapsed.colEnd
  ),
  "Nach dem Einklappen eines Aussenbruchs duerfen Unterzeilenreste des inneren cos(beta)-Bruchs nur noch innerhalb der expliziten Aussenbruch-Spannweite sichtbar bleiben."
);
assert.ok(
  dividedByFractionInverseOffAxisCells.every((cell) =>
    cell.colStart >= dividedByFractionInverseCollapsed.colStart
      && cell.colEnd <= dividedByFractionInverseCollapsed.colEnd
  ),
  "Auch in der finalen acos-Zeile duerfen keine separaten Reste des inneren cos(beta)-Bruchs seitlich aus der expliziten Aussenbruch-Spannweite herauslecken."
);

console.log("Browser-Display-Modell erfolgreich geprueft.");
