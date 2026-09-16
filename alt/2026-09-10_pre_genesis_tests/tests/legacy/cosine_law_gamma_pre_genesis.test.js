// Am 10. September 2026 als historischer Vor-Genesis-Vertrag archiviert.
import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

function findFirstByType(elements = [], type) {
  return (elements || []).find((element) => element?.type === type) || null;
}

function findGeneratedFunction(elements = [], name) {
  return (elements || []).find((element) => (
    element?.type === "FUNCTION"
    && element?.isGenerated === true
    && element?.name === name
    && element?.isVisible !== false
  )) || null;
}

const result = await GenesisCore.solve("a^2+b^2-2abcosgamma=c^2", { targetVariable: "gamma" });

assert.equal(result.fehler, undefined);
assert.equal(result.targetVariable, "gamma");
assert.deepEqual(
  result.schritte.map((step) => step.strategie.family),
  ["addition_release", "subtrahend_release", "fraction_birth", "trig_inverse"],
  "Beim Kosinussatz mit nacktem cosgamma muessen die passiven Additionsterme nacheinander abgebaut, dann der gesamte negative Faktorblock -2ab gemeinsam dividiert und erst danach cos invertiert werden."
);

const finalInverseFunction = findGeneratedFunction(result.finaleStruktur, "acos");
assert.ok(finalInverseFunction);

const finalDivision = findFirstByType(finalInverseFunction.content, "DIVISION");
assert.ok(finalDivision, "Vor der acos-Schale muss eine gemeinsame Division durch den passiven Faktorblock stehen.");
assert.equal(finalDivision.denominator[0]?.type, "NEGATION");
assert.deepEqual(
  finalDivision.denominator[0]?.content?.map((element) => element.value || element.type),
  ["2", "a", "b"],
  "Der Nenner muss den ganzen negativen Faktorblock -2ab enthalten und nicht nur einzelne Teilfaktoren."
);

const factorReleaseRow = result.exportData.projectionRows[2]?.positionedAtoms || [];
const negativeFactorShell = factorReleaseRow.find((element) => (
  element?.type === "NEGATION"
  && element?.isGenerated === true
  && element?.isVisible !== false
));
const negativeFactorSign = factorReleaseRow.find((element) => (
  element?.sourceShellId === negativeFactorShell?.id
  && element?.projectionRole === "negation_sign"
));
const negativeFactorContent = factorReleaseRow
  .filter((element) => element?.sourceShellId === negativeFactorShell?.id && element?.projectionRole === "negation_content")
  .sort((left, right) => (left.col || 0) - (right.col || 0));
const cosineFactor = negativeFactorContent.find((element) => element?.type === "FUNCTION" && element?.name === "cos");

assert.ok(negativeFactorShell, "Der aktive negative Faktorblock muss in der Projektion als semantische Negationsschale erhalten bleiben.");
assert.equal(negativeFactorSign?.value, "-", "Das Minus des aktiven Faktorblocks muss als eigene Projektionszelle auftauchen.");
assert.deepEqual(
  negativeFactorContent.map((element) => element.col),
  [5, 6, 7, 8, 9, 10, 11],
  "Innerhalb des negativen Faktorblocks muessen 2, Multiplikationspunkte, a, b und cos(gamma) ihre eigenen Spalten behalten."
);
assert.equal(cosineFactor?.col, 11, "Die Ziel-Funktionsschale cos(gamma) muss am rechten Ende des aktiven Faktorblocks auf ihrer eigenen Spalte stehen bleiben.");

const viewModel = buildWorksheetViewModel(result);
const factorReleaseCells = viewModel.steps[2]?.cells || [];
const renderedLeftCells = factorReleaseCells
  .filter((cell) => (cell.col || 0) >= 4 && (cell.col || 0) <= 11)
  .sort((left, right) => (left.col || 0) - (right.col || 0))
  .map((cell) => cell.text);

assert.ok(
  !factorReleaseCells.some((cell) => cell.id === negativeFactorShell.id),
  "In der Produktansicht darf die Negations-Elternschale den linken Faktorblock nicht mehr als eine einzige Zelle verdecken."
);
assert.deepEqual(
  renderedLeftCells,
  ["-", "2", "*", "a", "*", "b", "*", "cos(gamma)"],
  "Die sichtbare Arbeitsblattansicht muss den aktiven negativen Faktorblock wieder als echte Spaltenfolge statt als zusammengezogene Huelle zeigen."
);

console.log("✅ Kosinussatz-Gammafall erfolgreich.");
