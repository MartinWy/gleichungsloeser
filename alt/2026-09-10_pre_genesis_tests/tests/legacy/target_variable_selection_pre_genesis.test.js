// Am 10. September 2026 als historischer Vor-Genesis-Vertrag archiviert.
import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";

const autoTargetResult = await GenesisCore.solve("2a=10");
assert.equal(autoTargetResult.fehler, undefined);
assert.equal(autoTargetResult.targetVariable, "a");
assert.equal(autoTargetResult.exportData.targetVariable, "a");
assert.equal(autoTargetResult.schritte.length, 1, "Eine Gleichung mit genau einer Variablen soll automatisch auf diese Variable zielen.");
assert.equal(autoTargetResult.schritte[0].strategie.family, "fraction_birth");
assert.ok(autoTargetResult.finaleStruktur.some((element) => element.value === "a" && element.visualMode === "EMERGED"));

const multiLetterTargetResult = await GenesisCore.solve("alpha+2=5");
assert.equal(multiLetterTargetResult.fehler, undefined);
assert.equal(multiLetterTargetResult.targetVariable, "alpha");
assert.equal(multiLetterTargetResult.schritte[0].strategie.family, "addition_release");
assert.ok(
  multiLetterTargetResult.finaleStruktur.some((element) => element.value === "alpha" && element.visualMode === "EMERGED"),
  "Auch mehrbuchstabige Variablennamen sollen als Zielvariable funktionieren."
);

const explicitPassiveVariableResult = await GenesisCore.solve("sin(x)/(2a)=5", { targetVariable: "x" });
assert.equal(explicitPassiveVariableResult.fehler, undefined);
assert.equal(explicitPassiveVariableResult.targetVariable, "x");
assert.deepEqual(
  explicitPassiveVariableResult.schritte.map((step) => step.strategie.family),
  ["fraction_collapse", "trig_inverse"],
  "Wenn x explizit Zielvariable ist, muss 2a als passiver Nennerausdruck gelesen werden."
);
assert.ok(explicitPassiveVariableResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));

const rightSideExplicitPassiveVariableResult = await GenesisCore.solve("5=sin(m)/(2a)", { targetVariable: "m" });
assert.equal(rightSideExplicitPassiveVariableResult.fehler, undefined);
assert.equal(rightSideExplicitPassiveVariableResult.targetVariable, "m");
assert.deepEqual(
  rightSideExplicitPassiveVariableResult.schritte.map((step) => step.strategie.family),
  ["fraction_collapse", "trig_inverse"],
  "Auch auf der rechten Gleichungsseite muessen Nicht-Zielvariablen wie a passiv bleiben, wenn nach m geloest wird."
);
assert.ok(rightSideExplicitPassiveVariableResult.finaleStruktur.some((element) => element.value === "m" && element.visualMode === "EMERGED"));
const rightSideFractionRow = rightSideExplicitPassiveVariableResult.exportData.projectionRows[1].positionedAtoms;
const rightSideFractionAnchor = rightSideFractionRow.find((atom) => atom.value === "=");
const rightSideMultiplicationShell = rightSideFractionRow.find((atom) => atom.type === "MULTIPLICATION" && atom.isGenerated === true);
assert.ok(rightSideMultiplicationShell, "Der rechte Bruchfall muss nach dem Nennerabbau eine inverse Multiplikationsschale erzeugen.");
assert.equal(
  rightSideMultiplicationShell.flowDirection,
  "rtl",
  "Wenn rechts geloest wird, muss die links entstehende inverse Multiplikation ihre stabile Kante am Gleichheitsanker halten."
);

const configurableRightSideResult = await GenesisCore.solve("sin(x/2)=5", {
  rightSideFactorPlacement: "prefix"
});
const configurableRightSideShell = configurableRightSideResult.exportData.projectionAtomRegister.find(
  (atom) => atom.type === "MULTIPLICATION" && atom.generatedByFamily === "fraction_collapse"
);
assert.equal(
  configurableRightSideShell?.flowDirection,
  "rtl",
  "Die Rechtsseiten-Policy soll pro Solve-Lauf auf praefixierte Faktorstellung umschaltbar sein."
);
const rightSideMultiplicationAtoms = rightSideFractionRow.filter((atom) => atom.sourceShellId === rightSideMultiplicationShell.id);
const rightSideMultiplicationMaxCol = Math.max(...rightSideMultiplicationAtoms.map((atom) => atom.colEnd ?? atom.col));
const rightSideInverseFunctionRow = rightSideExplicitPassiveVariableResult.exportData.projectionRows[2].positionedAtoms;
const rightSideInverseFunction = rightSideInverseFunctionRow.find((atom) => atom.type === "FUNCTION" && atom.isGenerated === true);
assert.ok(rightSideInverseFunction, "Der rechte Bruchfall muss nach der Sinus-Umkehrung eine inverse Funktion tragen.");
const rightSideInverseFunctionAnchor = rightSideInverseFunctionRow.find((atom) => atom.value === "=");
const rightSideInitialRow = rightSideExplicitPassiveVariableResult.exportData.projectionRows[0].positionedAtoms;
const rightSideInitialFive = rightSideInitialRow.find((atom) => atom.value === "5");
const rightSideMiddleFive = rightSideFractionRow.find((atom) => atom.value === "5" && atom.projectionRole === "product_content");
const rightSideInitialFunction = rightSideInitialRow.find((atom) => atom.type === "FUNCTION" && atom.projectionRole === "numerator");
const rightSideMiddleFunction = rightSideFractionRow.find((atom) => atom.type === "FUNCTION" && atom.visualMode === "EMERGED");
const rightSideFinalVariable = rightSideInverseFunctionRow.find((atom) => atom.value === "m" && atom.visualMode === "EMERGED");

assert.ok(
  rightSideMultiplicationMaxCol < rightSideFractionAnchor.col,
  "Beim rechten Bruchfall darf die nach links erzeugte Multiplikationsschale nicht ueber das Gleichheitszeichen laufen."
);
assert.ok(
  rightSideInverseFunction.colEnd < rightSideInverseFunctionAnchor.col,
  "Auch die nach links erzeugte inverse Funktion muss komplett vor dem Gleichheitsanker enden."
);
assert.equal(
  rightSideInitialFive.col,
  rightSideMiddleFive.col,
  "Die linke Gegenseite soll beim rechten Bruchfall nach dem Nennerabbau auf derselben Spalte bleiben."
);
assert.equal(
  rightSideInitialFunction.col,
  rightSideMiddleFunction.col,
  "Die sichtbare Funktionsspur rechts darf beim Nennerabbau nicht driften."
);
assert.equal(
  rightSideMiddleFunction.col,
  rightSideFinalVariable.col,
  "Nach der trigonometrischen Umkehrung muss die freigelegte Zielvariable dieselbe rechte Spur fortsetzen."
);

const explicitOtherVariableResult = await GenesisCore.solve("x+a=5", { targetVariable: "a" });
assert.equal(explicitOtherVariableResult.fehler, undefined);
assert.equal(explicitOtherVariableResult.targetVariable, "a");
assert.equal(explicitOtherVariableResult.schritte[0].strategie.family, "addition_release");
assert.ok(explicitOtherVariableResult.finaleStruktur.some((element) => element.value === "a" && element.visualMode === "EMERGED"));

const missingTargetResult = await GenesisCore.solve("m+2=5", { targetVariable: "x" });
assert.equal(typeof missingTargetResult.fehler, "string");
assert.match(missingTargetResult.fehler, /kommt in der Gleichung nicht vor/);

const ambiguousResult = await GenesisCore.solve("x+a=5");
assert.equal(typeof ambiguousResult.fehler, "string");
assert.match(ambiguousResult.fehler, /targetVariable/);

const bothSidesTargetResult = await GenesisCore.solve("x+1=x+2", { targetVariable: "x" });
assert.equal(typeof bothSidesTargetResult.fehler, "string");
assert.match(bothSidesTargetResult.fehler, /genau einmal vorkommt/);

const repeatedSameSideTargetResult = await GenesisCore.solve("x+x=2", { targetVariable: "x" });
assert.equal(typeof repeatedSameSideTargetResult.fehler, "string");
assert.match(repeatedSameSideTargetResult.fehler, /genau einmal vorkommt/);

const denominatorTargetResult = await GenesisCore.solve("2/x=5", { targetVariable: "x" });
assert.equal(denominatorTargetResult.fehler, undefined);
assert.equal(denominatorTargetResult.targetVariable, "x");
assert.deepEqual(
  denominatorTargetResult.schritte.map((step) => step.strategie.family),
  ["fraction_denominator_release", "fraction_birth"],
  "Ein Nennerziel soll zuerst aus der sichtbaren Division geloest und danach als Multiplikation weiterbearbeitet werden."
);
assert.ok(denominatorTargetResult.finaleStruktur.some((element) => element.value === "x" && element.visualMode === "EMERGED"));
