import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

function axisDistanceFromBottom(cell) {
  if (cell?.kind === "fraction_line") {
    return Math.round(((((cell.cellMetrics?.lineThicknessEm || 0) / 2) - (cell.cellMetrics?.shiftYEm || 0)) * 100)) / 100;
  }

  return Math.round((((cell.renderNode?.layout?.axisBelowEm || 0) - (cell.cellMetrics?.shiftYEm || 0)) * 100)) / 100;
}

const additionResult = await GenesisCore.solve("2*x+3=5", { targetVariable: "x" });
assert.equal(additionResult.fehler, undefined);

const additionViewModel = buildWorksheetViewModel(additionResult);
assert.equal(additionViewModel.steps.length, additionResult.exportData.projectionRows.length);
assert.equal(additionViewModel.diagnostics.steps.length, additionViewModel.steps.length);
assert.equal(
  additionViewModel.layout.rowCount,
  additionResult.exportData.layoutPlan.stackedVisualRowCount,
  "Die Arbeitsblattansicht soll die gestapelte Blockhoehe aus dem produktiven Projektionskern uebernehmen."
);
assert.ok(additionViewModel.columnCount >= 9, "Die Druckansicht soll die globale Spaltenbreite aus der Projektion uebernehmen.");

const additionStep = additionViewModel.steps[1];
assert.deepEqual(
  additionStep.cells.map((cell) => cell.text),
  ["2", "*", "x", "=", "5", "-", "3"],
  "Lineare Inversionsschalen sollen als einzelne Druckatome statt als doppelte Container+Kinder erscheinen."
);

const additionPositions = new Set(additionStep.cells.map((cell) => `${cell.row}:${cell.col}`));
assert.equal(
  additionPositions.size,
  additionStep.cells.length,
  "Die Druckansicht darf keine zwei sichtbaren Renderzellen auf dieselbe Grid-Position legen."
);

const additionFinalStep = additionViewModel.steps[2];
assert.deepEqual(
  additionFinalStep.rowKinds,
  ["above_axis", "axis", "below_axis"],
  "Ein Abschlussbruch soll im Renderkern als dreiteiliger Block mit Achsenzeile beschrieben werden."
);
assert.deepEqual(
  additionFinalStep.rowMetrics,
  [
    {
      kind: "above_axis",
      minHeightEm: 0.9,
      cellCount: 3,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: null,
      axisBottomReserveEm: null,
      axisBalanceEm: null,
      axisContext: null,
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: null,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: null
    },
    {
      kind: "axis",
      minHeightEm: 1.12,
      cellCount: 3,
      hasFractionLine: true,
      hasNestedFraction: false,
      axisTopReserveEm: 0.52,
      axisBottomReserveEm: 0.32,
      axisBalanceEm: 0.2,
      axisContext: "fraction_axis",
      fractionSpanWidth: 3,
      rowContentShiftEm: null,
      axisLineShiftEm: 0,
      fractionLineHeightEm: 0.3,
      fractionLineThicknessEm: 0.1,
      axisCompanionShiftEm: null,
      axisShiftEm: 0
    },
    {
      kind: "below_axis",
      minHeightEm: 0.82,
      cellCount: 1,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: null,
      axisBottomReserveEm: null,
      axisBalanceEm: null,
      axisContext: null,
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: null,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: null
    }
  ],
  "Die Arbeitsblattansicht soll fuer sichtbare Bruchbloecke explizite Teilzeilen-Metriken mitfuehren."
);
const additionFinalFive = additionFinalStep.cells.find((cell) => cell.text === "5");
const additionFinalThree = additionFinalStep.cells.find((cell) => cell.text === "3");
const additionFinalFractionLine = additionFinalStep.cells.find((cell) => cell.kind === "fraction_line");
const additionFinalDenominator = additionFinalStep.cells.find((cell) => cell.text === "2");
const additionFinalTarget = additionFinalStep.cells.find((cell) => cell.text === "x");
assert.equal(additionFinalFive.col, 6, "Die 5 muss im Bruchzaehler dieselbe Spalte behalten wie in der Zeile darueber.");
assert.equal(additionFinalThree.col, 8, "Auch die passive 3 darf im Bruchzaehler nicht horizontal driften.");
assert.equal(additionFinalFractionLine.colStart, 6, "Die Arbeitsblattansicht muss den Bruchstrich an der linken Zaehlerkante ansetzen.");
assert.equal(additionFinalFractionLine.colEnd, 8, "Die Arbeitsblattansicht muss die volle Breite des zusammengesetzten Zaehlerausdrucks abbilden.");
assert.equal(additionFinalFractionLine.rowKind, "axis", "Der Bruchstrich muss im Renderkern explizit auf der Achsenzeile liegen.");
assert.deepEqual(additionFinalTarget.cellMetrics, {
  alignItems: "flex-end",
  alignSelf: "end",
  shiftYEm: -0.04
});
assert.deepEqual(additionFinalFractionLine.cellMetrics, {
  alignItems: "flex-end",
  alignSelf: "end",
  shiftYEm: -0.27,
  lineHeightEm: 0.3,
  lineThicknessEm: 0.1
});
assert.deepEqual(additionFinalFive.cellMetrics, {
  alignItems: "flex-end",
  alignSelf: "end",
  shiftYEm: 0
});
assert.deepEqual(additionFinalDenominator.cellMetrics, {
  alignItems: "flex-start",
  alignSelf: "start",
  shiftYEm: 0
});
assert.equal(
  axisDistanceFromBottom(additionFinalTarget),
  axisDistanceFromBottom(additionFinalFractionLine),
  "Zielvariable und Bruchstrich muessen auf derselben Achse enden."
);
assert.deepEqual(
  additionViewModel.diagnostics.steps[2].rowKinds,
  ["above_axis", "axis", "below_axis"],
  "Die Diagnosespur soll dieselben Teilzeilenrollen wie der sichtbare Projektionsblock tragen."
);
assert.equal(additionViewModel.diagnostics.steps[2].axisLocalRow, 1);
assert.equal(additionViewModel.diagnostics.steps[2].stackRowStart, 2);
assert.equal(additionViewModel.diagnostics.steps[2].stackRowEnd, 4);
assert.ok(
  additionViewModel.diagnostics.steps[2].cells.some((cell) => cell.text === "---" && cell.projectionRole === "fraction_line"),
  "Die Diagnosespur soll sichtbare Bruchachsen als eigene Zelle ausweisen."
);
assert.ok(
  additionViewModel.diagnostics.steps[2].cells.some((cell) => cell.text === "---" && typeof cell.id === "string" && typeof cell.sourceShellId === "string" && cell.absoluteRow === 3 && cell.stackedRow === 3 && cell.rowAxisContext === "fraction_axis" && cell.rowAxisBottomReserveEm === 0.32 && cell.rowFractionSpanWidth === 3 && cell.blockFractionSpanWidth === 3 && cell.shiftYEm === -0.27 && cell.lineHeightEm === 0.3),
  "Die Diagnosespur soll die Zellmetriken des Bruchstrichs sichtbar machen."
);
assert.ok(
  additionViewModel.diagnostics.steps[2].cells.some((cell) => cell.text === "x" && cell.rowAxisContext === "fraction_axis" && cell.axisBelowEm === 0.28 && cell.rowAxisBottomReserveEm === 0.32 && cell.shiftYEm === -0.04),
  "Die Diagnosespur soll die aus der gemeinsamen Unterreserve abgeleitete Zielachsenlage fuer x sichtbar machen."
);
assert.ok(
  additionViewModel.diagnostics.steps[2].cells.some((cell) => cell.text === "5" && cell.blockAxisContext === "fraction_axis" && cell.blockFractionSpanWidth === 3 && cell.shiftYEm === 0),
  "Die Diagnosespur soll fuer den Zaehler keine zusaetzliche Naeherungs-Korrektur mehr melden."
);
assert.ok(
  additionViewModel.diagnostics.steps[2].cells.some((cell) => cell.text === "2" && cell.blockAxisContext === "fraction_axis" && cell.blockFractionSpanWidth === 3 && cell.shiftYEm === 0),
  "Die Diagnosespur soll fuer den Nenner keine zusaetzliche Naeherungs-Korrektur mehr melden."
);

const additionRuntimeResult = await GenesisCore.solve("2*x+3=5", {
  runtimeEngine: "genesis_runtime",
  targetVariable: "x"
});
assert.equal(additionRuntimeResult.fehler, undefined);
const additionRuntimeViewModel = buildWorksheetViewModel(additionRuntimeResult);
assert.ok(
  additionRuntimeViewModel.steps[2].shellSpans.some((shell) => shell.shellType === "DIVISION" && shell.axisLocalRow === 1),
  "Wenn der Runtime-Pfad explizite Shell-Spannen liefert, muss die Arbeitsblattansicht sie bis zum sichtbaren Schritt durchreichen."
);

const groupedPassiveResult = await GenesisCore.solve("sin(x)/(2a)=5", { targetVariable: "x" });
assert.equal(groupedPassiveResult.fehler, undefined);

const groupedPassiveViewModel = buildWorksheetViewModel(groupedPassiveResult);
assert.equal(groupedPassiveViewModel.steps.length, groupedPassiveResult.exportData.projectionRows.length);
assert.equal(
  groupedPassiveViewModel.layout.rowCount,
  groupedPassiveResult.exportData.layoutPlan.stackedVisualRowCount,
  "Auch bei Bruchketten muss die Druckansicht die gestapelten Projektionsbloecke ohne Zeilenueberlagerung abbilden."
);
assert.ok(
  groupedPassiveViewModel.steps[0].cells.some((cell) => cell.kind === "fraction_line"),
  "Vertikale Bruchdarstellung muss als eigene Druckzelle erhalten bleiben."
);

const globalLayoutPositions = new Set(groupedPassiveViewModel.layout.cells.map((cell) => `${cell.row}:${cell.col}`));
assert.equal(
  globalLayoutPositions.size,
  groupedPassiveViewModel.layout.cells.length,
  "Auch im global gestapelten Arbeitsblattlayout duerfen keine zwei sichtbaren Druckzellen dieselbe Grid-Position teilen."
);
assert.ok(
  groupedPassiveViewModel.layout.rows.some((row) => row.kind === "above_axis"),
  "Das globale Arbeitsblattlayout soll sichtbare Oberzeilen von Bruchbloecken explizit markieren."
);
assert.ok(
  groupedPassiveViewModel.layout.rows.some((row) => row.kind === "below_axis"),
  "Das globale Arbeitsblattlayout soll sichtbare Unterzeilen von Bruchbloecken explizit markieren."
);
assert.ok(
  groupedPassiveViewModel.layout.rows.some(
    (row) =>
      row.kind === "axis" &&
      row.hasFractionLine === true &&
      row.minHeightEm >= 1.12 &&
      typeof row.axisTopReserveEm === "number" &&
      typeof row.axisBottomReserveEm === "number"
  ),
  "Globale Arbeitsblattzeilen mit sichtbarem Bruchstrich sollen eine explizit vergroesserte Achsenhoehe tragen."
);
assert.ok(
  groupedPassiveViewModel.layout.rows.some((row) => row.kind === "axis" && typeof row.axisTopReserveEm === "number" && typeof row.axisBottomReserveEm === "number"),
  "Die globale Arbeitsblattspur soll fuer Achsenzeilen explizite Ober-/Unterreserven aus dem Renderkern mittragen."
);
assert.ok(
  groupedPassiveViewModel.layout.rows.some((row) => row.kind === "axis" && typeof row.axisBalanceEm === "number"),
  "Die globale Arbeitsblattspur soll fuer Achsenzeilen auch eine explizite Teilzeilenbalance tragen."
);
assert.ok(
  groupedPassiveViewModel.layout.rows.some((row) => row.kind === "axis" && row.axisShiftEm === 0),
  "Die globale Arbeitsblattspur soll fuer Achsenzeilen auch einen expliziten Teilzeilenversatz tragen."
);

const trigStep = groupedPassiveViewModel.steps[2];
assert.ok(
  trigStep.cells.some((cell) => cell.text === "x" && cell.isTarget && cell.isEmerged),
  "Die freigelegte Zielvariable soll in der Druckansicht als Zielspur erhalten bleiben."
);
const trigFunctionNameCell = trigStep.cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "asin");
const trigFunctionLeftCell = trigStep.cells.find((cell) => cell.projectionRole === "function_left");
const trigFunctionRightCell = trigStep.cells.find((cell) => cell.projectionRole === "function_right");
const trigFunctionProductContentCell = trigStep.cells.find((cell) => cell.projectionRole === "product_content" && cell.text === "5");
const trigFunctionProductFactorCell = trigStep.cells.find((cell) => cell.projectionRole === "product_factor" && cell.renderNode?.type === "group");
assert.ok(trigFunctionNameCell && trigFunctionLeftCell && trigFunctionRightCell, "Die Gegenseite soll in der Druckansicht als explizite inverse Funktion mit Name und Klammern erhalten bleiben.");
assert.ok(trigFunctionProductContentCell && trigFunctionProductFactorCell, "Das Funktionsargument soll in der Druckansicht seine Produktstruktur aus Inhalt und Gruppenfaktor behalten.");
assert.equal(
  trigFunctionNameCell.renderNode?.functionName,
  "asin",
  "Der explizite Funktionsname soll seine Shell-Identitaet bis in den Renderknoten tragen."
);
const trigRuntimeBetaResult = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
  targetVariable: "beta",
  runtimeEngine: "genesis_runtime"
});
assert.equal(trigRuntimeBetaResult.fehler, undefined);
const trigRuntimeBetaViewModel = buildWorksheetViewModel(trigRuntimeBetaResult);
const trigRuntimeBetaFinalStep = trigRuntimeBetaViewModel.steps.at(-1);
assert.equal(
  trigRuntimeBetaFinalStep.cells.filter((cell) => cell.kind === "division").length,
  0,
  "Ein sichtbarer Bruch im finalen asin(...) darf im Runtime-Pfad nicht wieder zu einer einzelnen DIVISION-Zelle zusammenschnueren."
);
assert.ok(
  trigRuntimeBetaFinalStep.cells.some((cell) => cell.kind === "fraction_line"),
  "Der finale asin(...)-Ausdruck soll seinen sichtbaren Bruchstrich explizit behalten."
);
assert.deepEqual(
  trigRuntimeBetaFinalStep.cells
    .filter((cell) => ["b", "a"].includes(cell.text))
    .map((cell) => cell.text),
  ["b", "a"],
  "Auch im finalen asin(...)-Ausdruck muessen Zaehler und Nenner als echte weitergereichte Projektionsatome sichtbar bleiben."
);
assert.ok(
  trigRuntimeBetaFinalStep.cells.some((cell) => cell.projectionRole === "function_name" && cell.text === "sin"),
  "Eine passive innere sin(alpha)-Schale soll im finalen asin(...)-Ausdruck ueber sichtbare Primitive bestehen bleiben."
);
assert.ok(
  trigRuntimeBetaFinalStep.cells.some((cell) => cell.text === "alpha"),
  "Der Inhalt einer passiven sin(alpha)-Schale bleibt auch im finalen Ausdruck als sichtbares Atom erhalten."
);

const explicitCosineLawResult = await GenesisCore.solve("a^2+b^2-2ab*cos(gamma)=c^2", { targetVariable: "gamma" });
assert.equal(explicitCosineLawResult.fehler, undefined);

const explicitCosineLawViewModel = buildWorksheetViewModel(explicitCosineLawResult);
const explicitCosineLawRuntimeResult = await GenesisCore.solve("a^2+b^2-2ab*cos(gamma)=c^2", {
  targetVariable: "gamma",
  runtimeEngine: "genesis_runtime"
});
assert.equal(explicitCosineLawRuntimeResult.fehler, undefined);
const explicitCosineLawRuntimeViewModel = buildWorksheetViewModel(explicitCosineLawRuntimeResult);
assert.deepEqual(
  explicitCosineLawRuntimeViewModel.steps[0].cells
    .filter((cell) => cell.text === "*")
    .map((cell) => cell.id)
    .sort(),
  explicitCosineLawRuntimeResult.exportData.outputContract.projectionRows[0].projectionAtoms
    .filter((atom) => atom.value === "*")
    .map((atom) => atom.projectionAtomId)
    .sort(),
  "Im atomaren Referenzmodus muss jedes vom Core sichtbar gelieferte Multiplikationsprimitiv erhalten bleiben."
);
assert.deepEqual(
  explicitCosineLawRuntimeViewModel.steps[2].cells
    .filter((cell) => cell.text === "*")
    .map((cell) => cell.id)
    .sort(),
  explicitCosineLawRuntimeResult.exportData.outputContract.projectionRows[2].projectionAtoms
    .filter((atom) => atom.value === "*")
    .map((atom) => atom.projectionAtomId)
    .sort(),
  "Auch nach der Freilegung darf der Renderer ein vom Core geliefertes Multiplikationsprimitiv nicht unterdruecken."
);
const explicitCosineFinalStep = explicitCosineLawViewModel.steps.at(-1);
const explicitCosineFinalDivisionCells = explicitCosineFinalStep.cells.filter((cell) => cell.kind === "division");
const explicitCosineFinalFractionLine = explicitCosineFinalStep.cells.find((cell) => cell.kind === "fraction_line");
const explicitCosineLooseNumeratorAtoms = explicitCosineFinalStep.cells.filter((cell) => ["c^2", "a^2", "b^2"].includes(cell.text));
const explicitCosineRuntimeFinalDivisionCells = explicitCosineLawRuntimeViewModel.steps.at(-1).cells.filter((cell) => cell.kind === "division");
assert.equal(
  explicitCosineFinalDivisionCells.length,
  0,
  "Auch im finalen acos(...) darf die Druckansicht keinen sichtbaren Bruch wieder zu einer zusammengeschnuerten DIVISION-Zelle einklappen."
);
assert.equal(
  explicitCosineRuntimeFinalDivisionCells.length,
  0,
  "Auch der Runtime-Pfad darf im finalen acos(...) keinen eingeklappten DIVISION-Block mehr liefern."
);
assert.ok(
  explicitCosineFinalFractionLine,
  "Der finale Cosinussatz-Ausdruck in acos(...) muss weiterhin als echter Bruchstrich sichtbar bleiben."
);
assert.deepEqual(
  explicitCosineLooseNumeratorAtoms.map((cell) => cell.text),
  ["c^2", "a^2", "b^2"],
  "Der finale Bruch im acos(...) soll aus echten weitergereichten Zaehleratomen bestehen statt aus einem lokal rekonstruierten Gesamtblock."
);
assert.equal(
  trigFunctionLeftCell.col,
  trigFunctionNameCell.col + 1,
  "Die linke Funktionsklammer soll direkt rechts neben dem expliziten Funktionsnamen stehen."
);
assert.equal(
  trigFunctionProductFactorCell.renderNode?.type,
  "group",
  "Geschachtelte Teilgruppen wie (2a) muessen im Renderkern als eigene Gruppe erhalten bleiben."
);
assert.equal(
  trigFunctionRightCell.col,
  trigFunctionProductFactorCell.colEnd + 1,
  "Die rechte Funktionsklammer soll direkt nach dem expliziten Argumentblock stehen."
);
assert.ok(
  groupedPassiveViewModel.diagnostics.steps[2].cells.some((cell) => cell.text === "asin" && cell.projectionRole === "function_name" && cell.axisBehavior === "baseline"),
  "Die Diagnosespur soll die explizite Funktionsnamenspur mit ihrer Renderachse mitfuehren."
);

const fractionCollapseResult = await GenesisCore.solve("x/2=5", { targetVariable: "x" });
assert.equal(fractionCollapseResult.fehler, undefined);

const fractionCollapseViewModel = buildWorksheetViewModel(fractionCollapseResult);
const productContentCell = fractionCollapseViewModel.steps[1].cells.find((cell) => cell.projectionRole === "product_content" && cell.text === "5");
const productOperatorCell = fractionCollapseViewModel.steps[1].cells.find((cell) => cell.projectionRole === "product_operator" && cell.text === "*");
const productFactorCell = fractionCollapseViewModel.steps[1].cells.find((cell) => cell.projectionRole === "product_factor" && cell.text === "2");
assert.ok(productContentCell, "Der Folgeausdruck nach fraction_collapse soll seinen linken Faktor positionstreu behalten.");
assert.ok(productOperatorCell, "Eine reine Zahl-mal-Zahl-Multiplikation soll mit sichtbarem Malpunkt statt mit Leer-Juxtaposition gesetzt werden.");
assert.ok(productFactorCell, "Der Folgeausdruck nach fraction_collapse soll den verschobenen Nenner als eigene Faktor-Spalte tragen.");
assert.equal(productContentCell.col + 1, productOperatorCell.col);
assert.equal(productOperatorCell.col + 1, productFactorCell.col);

const fractionCollapseRuntimeResult = await GenesisCore.solve("x/2=5", {
  targetVariable: "x",
  runtimeEngine: "genesis_runtime"
});
assert.equal(fractionCollapseRuntimeResult.fehler, undefined);
const fractionCollapseRuntimeViewModel = buildWorksheetViewModel(fractionCollapseRuntimeResult);
const runtimeProductOperatorCell = fractionCollapseRuntimeViewModel.steps[1].cells.find((cell) => cell.projectionRole === "product_operator" && cell.text === "*");
assert.ok(
  runtimeProductOperatorCell,
  "Im Runtime-Pfad muss der sichtbare Malpunkt aus der expliziten Multiplikationsschale kommen, nicht aus rohen Inhalts-Operatoren."
);

const lawOfSinesResult = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", { targetVariable: "a" });
assert.equal(lawOfSinesResult.fehler, undefined);

const lawOfSinesViewModel = buildWorksheetViewModel(lawOfSinesResult);
const lawOfSinesStep = lawOfSinesViewModel.steps[1];
const lawOfSinesAnchor = lawOfSinesStep.cells.find((cell) => cell.text === "=");
const lawOfSinesLeftVariable = lawOfSinesStep.cells.find((cell) => cell.text === "a");
const lawOfSinesRightFactorName = lawOfSinesStep.cells.find((cell) => cell.projectionRole === "function_name" && cell.colStart > 8);
const lawOfSinesFractionLine = lawOfSinesStep.cells.find((cell) => cell.kind === "fraction_line");
const lawOfSinesNumerator = lawOfSinesStep.cells.find((cell) => cell.text === "b");
const lawOfSinesDenominator = lawOfSinesStep.cells.find((cell) => cell.projectionRole === "function_right" && cell.colStart < 9);

assert.ok(lawOfSinesAnchor, "Der Folge-Schritt des Sinussatzes muss den Gleichheitsanker sichtbar halten.");
assert.ok(lawOfSinesLeftVariable, "Die linke Zielvariable muss im Folge-Schritt sichtbar bleiben.");
assert.ok(lawOfSinesRightFactorName, "Der mitverschobene Faktor sin(alpha) muss im Folge-Schritt als explizite Funktionsspur sichtbar bleiben.");
assert.ok(lawOfSinesFractionLine, "Der rechte Bruch muss im Folge-Schritt als sichtbare Bruchachse erhalten bleiben.");
assert.ok(lawOfSinesNumerator, "Der rechte Zaehler muss im Folge-Schritt sichtbar bleiben.");
assert.ok(lawOfSinesDenominator, "Der rechte Nenner muss im Folge-Schritt bis zur expliziten Abschlussklammer sichtbar bleiben.");
assert.equal(lawOfSinesStep.axisLocalRow, 1);
assert.equal(lawOfSinesAnchor.rowKind, "axis");
assert.equal(lawOfSinesLeftVariable.rowKind, "axis");
assert.equal(lawOfSinesRightFactorName.rowKind, "axis");
assert.equal(lawOfSinesFractionLine.rowKind, "axis");
assert.equal(lawOfSinesNumerator.rowKind, "above_axis");
assert.equal(lawOfSinesDenominator.rowKind, "below_axis");
assert.equal(lawOfSinesAnchor.row, lawOfSinesFractionLine.row, "Der Gleichheitsanker muss auf derselben Teilzeile wie der Bruchstrich liegen.");
assert.equal(lawOfSinesLeftVariable.row, lawOfSinesFractionLine.row, "Auch die linke Zielvariable muss auf der Bruchachse sitzen.");
assert.equal(lawOfSinesRightFactorName.row, lawOfSinesFractionLine.row, "Die explizite Namensspur des mitverschobenen Faktors muss auf derselben Achsenzeile wie der Bruchstrich sitzen.");
assert.equal(lawOfSinesAnchor.rowAxisContext, "fraction_axis");
assert.equal(lawOfSinesLeftVariable.rowAxisContext, "fraction_axis");
assert.equal(lawOfSinesRightFactorName.rowAxisContext, "fraction_axis");
assert.equal(
  axisDistanceFromBottom(lawOfSinesAnchor),
  axisDistanceFromBottom(lawOfSinesFractionLine),
  "Im Sinussatz muessen Gleichheitsanker und Bruchstrich auf derselben Achse enden."
);
assert.equal(
  axisDistanceFromBottom(lawOfSinesLeftVariable),
  axisDistanceFromBottom(lawOfSinesFractionLine),
  "Auch die linke Zielvariable muss auf dieselbe Bruchachse ausgerichtet werden."
);
assert.equal(
  axisDistanceFromBottom(lawOfSinesRightFactorName),
  axisDistanceFromBottom(lawOfSinesFractionLine),
  "Auch die explizite Namensspur des mitverschobenen Faktors muss dieselbe Bruchachse teilen."
);

const lawOfSinesAlphaResult = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", { targetVariable: "alpha" });
assert.equal(lawOfSinesAlphaResult.fehler, undefined);

const lawOfSinesAlphaViewModel = buildWorksheetViewModel(lawOfSinesAlphaResult);
const lawOfSinesAlphaStep = lawOfSinesAlphaViewModel.steps[1];
const lawOfSinesAlphaRightFractionLine = lawOfSinesAlphaStep.cells.find(
  (cell) => cell.kind === "fraction_line" && cell.colStart > lawOfSinesAlphaStep.cells.find((entry) => entry.text === "=")?.col
);
const lawOfSinesAlphaRightFractionEnd = lawOfSinesAlphaRightFractionLine?.colEnd ?? -Infinity;
const lawOfSinesAlphaProductOperator = lawOfSinesAlphaStep.cells.find(
  (cell) => cell.projectionRole === "product_operator" && cell.text === "*"
);
const lawOfSinesAlphaFunctionName = lawOfSinesAlphaStep.cells.find(
  (cell) => cell.projectionRole === "function_name" && cell.text === "sin" && cell.colStart > lawOfSinesAlphaRightFractionEnd
);
const lawOfSinesAlphaFunctionLeft = lawOfSinesAlphaStep.cells.find(
  (cell) => cell.projectionRole === "function_left" && cell.colStart > lawOfSinesAlphaRightFractionEnd
);
const lawOfSinesAlphaVariable = lawOfSinesAlphaStep.cells.find(
  (cell) => cell.text === "alpha" && cell.colStart > lawOfSinesAlphaRightFractionEnd
);
const lawOfSinesAlphaFunctionRight = lawOfSinesAlphaStep.cells.find(
  (cell) => cell.projectionRole === "function_right" && cell.colStart > lawOfSinesAlphaRightFractionEnd
);

assert.ok(lawOfSinesAlphaRightFractionLine, "Beim Alpha-Sinussatz muss der uebernommene rechte Bruch sichtbar bleiben.");
assert.ok(lawOfSinesAlphaFunctionName, "Der verschobene Faktor sin(alpha) muss als eigene sichtbare Funktionsspur erscheinen.");
assert.ok(lawOfSinesAlphaFunctionLeft, "Die linke Klammer des verschobenen Faktors muss sichtbar bleiben.");
assert.ok(lawOfSinesAlphaVariable, "Das Ziel alpha muss im freigelegten Faktor sichtbar bleiben.");
assert.ok(lawOfSinesAlphaFunctionRight, "Die rechte Klammer des verschobenen Faktors muss sichtbar bleiben.");
assert.ok(
  lawOfSinesAlphaRightFractionLine.colEnd < lawOfSinesAlphaFunctionName.col,
  "Der verschobene Faktor muss rechts hinter dem bestehenden Bruch eine eigene sichtbare Funktionsspur erhalten."
);
assert.ok(
  lawOfSinesAlphaFunctionName.col < lawOfSinesAlphaFunctionLeft.col
    && lawOfSinesAlphaFunctionLeft.col < lawOfSinesAlphaVariable.col
    && lawOfSinesAlphaVariable.col < lawOfSinesAlphaFunctionRight.col,
  "Der verschobene Faktor sin(alpha) darf seine eigenen Shell-Spalten nicht mehr mit Bruch oder Operator teilen."
);
if (lawOfSinesAlphaProductOperator) {
  assert.ok(
    lawOfSinesAlphaRightFractionLine.colEnd < lawOfSinesAlphaProductOperator.col
      && lawOfSinesAlphaProductOperator.col < lawOfSinesAlphaFunctionName.col,
    "Wenn die Ansicht einen expliziten Malpunkt zeigt, muss auch dieser eine eigene Spalte zwischen Bruch und Faktor erhalten."
  );
}

const cosineRatioToBetaResult = await GenesisCore.solve("cos(beta)/b=cos(alpha)/a", { targetVariable: "beta" });
assert.equal(cosineRatioToBetaResult.fehler, undefined);

const cosineRatioToBetaViewModel = buildWorksheetViewModel(cosineRatioToBetaResult);
const cosineRatioToBetaFinalStep = cosineRatioToBetaViewModel.steps.at(-1);
const cosineRatioToBetaFinalFunctionName = cosineRatioToBetaFinalStep.cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "acos");
const cosineRatioToBetaFinalFunctionLeft = cosineRatioToBetaFinalStep.cells.find(
  (cell) => cell.projectionRole === "function_left" && cell.sourceShellId === cosineRatioToBetaFinalFunctionName?.sourceShellId
);
const cosineRatioToBetaFinalFractionLine = cosineRatioToBetaFinalStep.cells.find((cell) => cell.projectionRole === "fraction_line");
const cosineRatioToBetaFinalFactor = cosineRatioToBetaFinalStep.cells.find((cell) => cell.projectionRole === "product_factor" && cell.text === "b");
const cosineRatioToBetaFinalFunctionRight = cosineRatioToBetaFinalStep.cells.find(
  (cell) => cell.projectionRole === "function_right" && cell.colStart > (cosineRatioToBetaFinalFactor?.colEnd ?? -1)
);
const cosineRatioToBetaFinalDenominator = cosineRatioToBetaFinalStep.cells.find((cell) => cell.projectionRole === "denominator" && cell.text === "a");
assert.ok(cosineRatioToBetaFinalFunctionName && cosineRatioToBetaFinalFunctionLeft && cosineRatioToBetaFinalFractionLine && cosineRatioToBetaFinalFactor && cosineRatioToBetaFinalFunctionRight, "Beim Kosinus-Verhaeltnis muss die Schlusszeile eine sichtbare acos-Schale aus expliziten Teilspuren tragen.");
assert.equal(
  cosineRatioToBetaFinalFunctionLeft.col,
  cosineRatioToBetaFinalFunctionName.col + 1,
  "Auch im beta-Fall soll die linke acos-Klammer direkt an den expliziten Funktionsnamen anschliessen."
);
assert.equal(
  cosineRatioToBetaFinalFactor.col,
  cosineRatioToBetaFinalFractionLine.colEnd + 1,
  "Beim beta-Fall soll im acos-Argument weiterhin links der vorhandene Bruch und direkt danach rechts der Faktor stehen."
);
assert.equal(
  cosineRatioToBetaFinalFunctionRight.col,
  cosineRatioToBetaFinalFactor.col + 1,
  "Beim beta-Fall soll die rechte acos-Klammer direkt hinter dem mitmultiplizierten Faktor stehen bleiben."
);
assert.equal(
  cosineRatioToBetaFinalDenominator?.col,
  cosineRatioToBetaFinalFractionLine.colStart + 1,
  "Beim beta-Fall soll der Nenner weiterhin unter dem inneren Bruchkern stehen."
);

const cosineRatioToAlphaResult = await GenesisCore.solve("cos(beta)/b=cos(alpha)/a", { targetVariable: "alpha" });
assert.equal(cosineRatioToAlphaResult.fehler, undefined);

const cosineRatioToAlphaViewModel = buildWorksheetViewModel(cosineRatioToAlphaResult);
const cosineRatioToAlphaFinalStep = cosineRatioToAlphaViewModel.steps.at(-1);
const cosineRatioToAlphaFinalFunctionName = cosineRatioToAlphaFinalStep.cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "acos");
const cosineRatioToAlphaFinalFunctionLeft = cosineRatioToAlphaFinalStep.cells.find(
  (cell) => cell.projectionRole === "function_left" && cell.sourceShellId === cosineRatioToAlphaFinalFunctionName?.sourceShellId
);
const cosineRatioToAlphaFinalFactor = cosineRatioToAlphaFinalStep.cells.find((cell) => cell.projectionRole === "product_factor" && cell.text === "a");
const cosineRatioToAlphaFinalFractionLine = cosineRatioToAlphaFinalStep.cells.find((cell) => cell.projectionRole === "fraction_line");
const cosineRatioToAlphaFinalFunctionRight = cosineRatioToAlphaFinalStep.cells.find(
  (cell) => cell.projectionRole === "function_right" && cell.colStart > (cosineRatioToAlphaFinalFractionLine?.colEnd ?? -1)
);
const cosineRatioToAlphaFinalDenominator = cosineRatioToAlphaFinalStep.cells.find((cell) => cell.projectionRole === "denominator" && cell.text === "b");
assert.ok(cosineRatioToAlphaFinalFunctionName && cosineRatioToAlphaFinalFunctionLeft && cosineRatioToAlphaFinalFactor && cosineRatioToAlphaFinalFractionLine && cosineRatioToAlphaFinalFunctionRight, "Auch gespiegelt muss die Schlusszeile eine explizite acos-Schale tragen.");
assert.equal(
  cosineRatioToAlphaFinalFunctionLeft.col,
  cosineRatioToAlphaFinalFunctionName.col + 1,
  "Auch gespiegelt soll die linke acos-Klammer direkt an den Funktionsnamen anschliessen."
);
assert.equal(
  cosineRatioToAlphaFinalFactor.col,
  cosineRatioToAlphaFinalFunctionLeft.col + 1,
  "Auch gespiegelt soll der mitmultiplizierte Faktor links vor dem Bruch stehen bleiben."
);
assert.equal(
  cosineRatioToAlphaFinalFractionLine.colStart,
  cosineRatioToAlphaFinalFactor.col + 1,
  "Auch gespiegelt soll rechts im acos-Argument weiterhin direkt der vorhandene Bruch beginnen."
);
assert.equal(
  cosineRatioToAlphaFinalFunctionRight.col,
  cosineRatioToAlphaFinalFractionLine.colEnd + 1,
  "Auch gespiegelt soll die rechte acos-Klammer direkt hinter dem inneren Bruch stehen."
);
assert.equal(
  cosineRatioToAlphaFinalDenominator?.col,
  cosineRatioToAlphaFinalFractionLine.colStart + 1,
  "Auch gespiegelt soll der Nenner unter dem inneren Bruchkern stehen bleiben."
);

const rootPowerResult = await GenesisCore.solve("2*sqrt(x+3)=5", { targetVariable: "x" });
assert.equal(rootPowerResult.fehler, undefined);

const rootPowerViewModel = buildWorksheetViewModel(rootPowerResult);
const rootStartCell = rootPowerViewModel.steps[0].cells.find((cell) => cell.renderNode?.type === "root");
assert.ok(rootStartCell, "Die Startzeile soll eine sichtbare Wurzelschale als strukturellen Renderknoten tragen.");

const powerStepCell = rootPowerViewModel.steps[2].cells.find((cell) => cell.renderNode?.type === "power");
assert.ok(powerStepCell, "Nach root_power soll die Potenzschale in der Druckansicht strukturell statt als Slash-Text vorliegen.");
assert.equal(
  powerStepCell.renderNode.base?.type,
  "fraction",
  "Die Potenzbasis soll die verschachtelte Geteilt-Schale als echten Bruchknoten erhalten."
);
assert.equal(powerStepCell.renderNode.exponent, "2");
assert.ok(
  rootPowerViewModel.steps[2].rowMetrics[0].minHeightEm > 1.12,
  "Eine Potenz ueber einer Bruchbasis soll ihre Achsenzeile gegenueber einer flachen Standardzeile erhoehen."
);
assert.deepEqual(powerStepCell.cellMetrics, {
  alignItems: "flex-end",
  alignSelf: "end",
  shiftYEm: 0
});
assert.equal(rootPowerViewModel.steps[1].rowMetrics[1].axisContext, "fraction_root_axis");
assert.equal(rootPowerViewModel.steps[1].rowMetrics[1].axisCompanionShiftEm, null);
assert.ok(
  rootPowerViewModel.diagnostics.steps[1].cells.some((cell) => cell.text === "=" && cell.rowAxisContext === "fraction_root_axis" && cell.rowAxisBottomReserveEm === 0.36 && cell.shiftYEm === -0.04),
  "Auch in einer fraction_root_axis soll die Diagnosespur die direkt aus der Achsenreserve abgeleitete Lage fuer '=' sichtbar machen."
);

const nestedRootFractionResult = await GenesisCore.solve("sqrt(x/(2+1))=3", { targetVariable: "x" });
assert.equal(nestedRootFractionResult.fehler, undefined);

const nestedRootFractionViewModel = buildWorksheetViewModel(nestedRootFractionResult);
const nestedRootCell = nestedRootFractionViewModel.steps[0].cells.find((cell) => cell.renderNode?.type === "root");
assert.ok(nestedRootCell, "Auch eine Wurzel ueber einem geschachtelten Bruch soll als struktureller Wurzelknoten vorliegen.");
assert.equal(nestedRootCell.renderNode.content?.type, "fraction");
assert.equal(nestedRootCell.renderNode.content?.denominator?.type, "group");
assert.equal(nestedRootCell.renderNode.layout.containsFraction, true);
assert.equal(nestedRootCell.renderNode.layout.axisBehavior, "raised_overbar");
assert.ok(
  nestedRootFractionViewModel.steps[0].rowMetrics[0].minHeightEm > 1.12,
  "Eine Wurzel ueber einem geschachtelten Bruch soll schon in der Ausgangszeile erhoehte Achsenhoehe anfordern."
);
assert.ok(
  nestedRootFractionViewModel.diagnostics.steps[0].cells.some((cell) => cell.text.startsWith("sqrt(") && cell.containsFraction === true && cell.shiftYEm === 0),
  "Die Diagnosespur soll verschachtelte Wurzeln mit Bruchinhalt ohne spaete Achsenkorrektur sichtbar machen."
);
assert.ok(
  nestedRootFractionViewModel.diagnostics.steps[0].cells.some((cell) => cell.text.startsWith("sqrt(") && cell.axisMinHeightEm === 1.2 && cell.aboveAxisMinHeightEm === 1.03 && cell.belowAxisMinHeightEm === 0.88),
  "Die Diagnosespur soll die Boxhuelle einer Wurzel ueber einem Bruch explizit mitfuehren."
);
assert.ok(
  nestedRootFractionViewModel.diagnostics.steps[0].cells.some((cell) => cell.text.startsWith("sqrt(") && cell.axisTopReserveEm === 0.24 && cell.axisBottomReserveEm === 0.14),
  "Die Diagnosespur soll zusaetzlich die Achsenreserven eines Bruch-Wurzel-Blocks mitfuehren."
);
assert.ok(
  nestedRootFractionViewModel.diagnostics.steps[0].cells.some((cell) => cell.text.startsWith("sqrt(") && cell.axisBalanceEm === 0.1),
  "Die Diagnosespur soll die Achsenbalance eines Bruch-Wurzel-Blocks mitfuehren."
);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[0].rowMetrics[0].axisTopReserveEm, 1.22);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[0].rowMetrics[0].axisBottomReserveEm, 1.16);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[0].rowMetrics[0].axisBalanceEm, 0.06);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[0].rowMetrics[0].axisContext, "root_fraction_axis");
assert.equal(nestedRootFractionViewModel.diagnostics.steps[0].rowMetrics[0].axisShiftEm, 0);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[1].rowMetrics[1].axisContext, "fraction_power_axis");
assert.equal(nestedRootFractionViewModel.diagnostics.steps[1].rowMetrics[1].axisCompanionShiftEm, null);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[1].axisLocalRow, 1);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[1].axisAbsoluteRow, 2);
assert.equal(nestedRootFractionViewModel.diagnostics.steps[1].axisStackedRow, 2);
assert.ok(
  nestedRootFractionViewModel.diagnostics.steps[1].cells.some((cell) => cell.text === "=" && cell.rowAxisContext === "fraction_power_axis" && cell.rowAxisBottomReserveEm === 0.32 && cell.shiftYEm === 0),
  "Auch in einer fraction_power_axis soll die Diagnosespur die direkt aus der Achsenreserve abgeleitete Lage fuer '=' sichtbar machen."
);
