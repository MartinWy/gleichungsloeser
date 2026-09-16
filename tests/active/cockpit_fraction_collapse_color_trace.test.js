import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";
import { deriveColorTargets } from "../../scripts/cockpit_server.mjs";

function findTarget(colorTargets = [], family) {
  return (colorTargets || []).find((target) => target?.family === family) || null;
}

const collapseFractionResult = await GenesisCore.solve("x/(a/b)=c", {
  targetVariable: "x",
  runtimeEngine: "genesis_runtime"
});
assert.equal(collapseFractionResult.fehler, undefined);

const collapseFractionTargets = deriveColorTargets(collapseFractionResult);
const collapseFractionTarget = findTarget(collapseFractionTargets, "fraction_collapse");
const collapseSourceOuterDivision = collapseFractionResult.exportData.outputContract.theoryRows[0].left[0];
const collapseSourceGroup = collapseSourceOuterDivision?.denominator?.[0] || null;
const collapseSourceInnerDivision = collapseSourceGroup?.content?.[0] || null;
const collapseGeneratedMultiplication = collapseFractionResult.exportData.outputContract.theoryRows[1].right.find(
  (node) => node?.type === "MULTIPLICATION" && node?.generatedByFamily === "fraction_collapse"
);
const collapseSourceAId = collapseSourceInnerDivision?.numerator?.[0]?.id || null;
const collapseSourceBId = collapseSourceInnerDivision?.denominator?.[0]?.id || null;

assert.ok(
  collapseFractionTarget,
  "Auch beim Abbau eines verschachtelten Nennerbruchs muss der Schritt als eigenes Cockpit-Farbziel auftauchen."
);
assert.equal(
  collapseFractionTarget.previewLabel,
  "/((a) / (b)) -> *((a) / (b))",
  "Beim Bruchabbau soll die Cockpit-Beschriftung die identische passive Schale vor und nach dem Umbau benennen."
);
assert.ok(collapseSourceGroup?.id, "Der Testfall braucht die Quellgruppe des passiven Nennerausdrucks.");
assert.ok(collapseSourceInnerDivision?.id, "Der Testfall braucht die innere Divisionsschale des passiven Nennerausdrucks.");
assert.ok(collapseGeneratedMultiplication?.id, "Der Testfall braucht die erzeugte Multiplikationsschale des Bruchabbaus.");
assert.ok(collapseSourceAId && collapseSourceBId, "Der Testfall braucht beide inneren Atome des verschachtelten Nennerbruchs.");

assert.ok(
  collapseFractionTarget.selectors.some(
    (selector) => selector.selectorType === "shell-id" && selector.selectorValue === collapseSourceGroup.id
  ),
  "Die aeussere Nennergruppe muss Teil derselben Farbspur bleiben."
);
assert.ok(
  collapseFractionTarget.selectors.some(
    (selector) => selector.selectorType === "shell-id" && selector.selectorValue === collapseSourceInnerDivision.id
  ),
  "Auch die innere Bruchschale selbst muss im Farbverbund erhalten bleiben."
);
assert.ok(
  collapseFractionTarget.selectors.some(
    (selector) => selector.selectorType === "shell-id" && selector.selectorValue === collapseGeneratedMultiplication.id
  ),
  "Die Gegenseite muss dieselbe passive Struktur als neue Multiplikationsschale wieder sichtbar einfaerben koennen."
);
assert.ok(
  collapseFractionTarget.selectors.some(
    (selector) => selector.selectorType === "atom" && selector.selectorValue === collapseSourceAId
  ),
  "Die innere Zaehler-Variable des passiven Bruchs darf ihre Farbspur beim Umbau nicht verlieren."
);
assert.ok(
  collapseFractionTarget.selectors.some(
    (selector) => selector.selectorType === "atom" && selector.selectorValue === collapseSourceBId
  ),
  "Die innere Nenner-Variable des passiven Bruchs darf ihre Farbspur beim Umbau nicht verlieren."
);

console.log("✅ Fraction-collapse-Farbspur erfolgreich geprueft.");
