// Am 10. September 2026 als historischer Cockpit-Mischtest archiviert.
import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";
import { deriveColorTargets } from "../../scripts/cockpit_server.mjs";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { resolveShellColorForNode } from "../../presentation/shell_colors/index.js";

function findTarget(colorTargets = [], family) {
  return (colorTargets || []).find((target) => target?.family === family) || null;
}

const gammaResult = await GenesisCore.solve("a^2+b^2-2abcosgamma=c^2", { targetVariable: "gamma" });
assert.equal(gammaResult.fehler, undefined);

const gammaTargets = deriveColorTargets(gammaResult);
const gammaRuntimeResult = await GenesisCore.solve("a^2+b^2-2abcosgamma=c^2", {
  targetVariable: "gamma",
  runtimeEngine: "genesis_runtime"
});
assert.equal(gammaRuntimeResult.fehler, undefined);

const gammaRuntimeTargets = deriveColorTargets(gammaRuntimeResult);

assert.deepEqual(
  gammaTargets.map((target) => target.family),
  ["addition_release", "subtrahend_release", "fraction_birth", "trig_inverse"],
  "Im Cockpit soll jeder produktive Umformungsschritt als eigenes Faerbe-Ziel angeboten werden."
);

const trigTarget = findTarget(gammaTargets, "trig_inverse");
assert.ok(trigTarget, "Die trigonometrische Umkehr muss als eigenes Cockpit-Ziel auftauchen.");
assert.equal(
  trigTarget.previewLabel,
  "cos( ) -> acos( )",
  "Die Cockpit-Beschriftung soll bei der trigonometrischen Umkehr beide Seiten direkt benennen."
);
assert.ok(
  trigTarget.selectors.some((selector) => selector.selectorType === "shell-id" && selector.selectorValue === "shell-function-n-180ph2x-0001"),
  "Die Quellfunktion cos(gamma) muss im Cockpit mit der Umkehrfarbe mitgefaerbt werden koennen."
);
assert.ok(
  trigTarget.selectors.some((selector) => selector.selectorType === "shell-id" && selector.selectorValue === "generated-trig_inverse-function-from-shell-function-n-180ph2x-0001"),
  "Die Gegenseite acos(...) muss im Cockpit mit derselben Umkehrfarbe mitgefaerbt werden koennen."
);

const fractionTarget = findTarget(gammaTargets, "fraction_birth");
assert.ok(fractionTarget, "Auch der Faktor-zu-Nenner-Schritt muss im Cockpit faerbbar sein.");
assert.ok(
  fractionTarget.selectors.some((selector) => selector.selectorType === "shell-id" && selector.selectorValue === "generated-subtrahend_release-negation-from-atom-number-n-180ph2x-0001"),
  "Beim Nenner-Schritt soll auch der negative Ausgangsblock links als zusammengehoeriges Cockpit-Ziel ansprechbar bleiben."
);

const runtimeAdditionTarget = findTarget(gammaRuntimeTargets, "addition_release");
const runtimeSubtrahendTarget = findTarget(gammaRuntimeTargets, "subtrahend_release");
const runtimeFractionTarget = findTarget(gammaRuntimeTargets, "fraction_birth");
const runtimeSourceLeft = gammaRuntimeResult.exportData.outputContract.theoryRows[0].left;
const runtimePlusOperatorId = runtimeSourceLeft.find(
  (node) => node?.type === "OPERATOR" && node?.value === "+"
)?.id;
const runtimeMinusOperatorId = runtimeSourceLeft.find(
  (node) => node?.type === "OPERATOR" && node?.value === "-"
)?.id;
const runtimeFractionDenominatorShellId = gammaRuntimeResult.exportData.outputContract.theoryRows[3].right.find(
  (node) => node?.type === "DIVISION" && node?.generatedByFamily === "fraction_birth"
)?.denominator?.[0]?.id;

assert.ok(runtimeAdditionTarget, "Im Genesis-Runtime muss der erste additive Schritt als eigenes Farbzielt auftauchen.");
assert.equal(
  runtimeAdditionTarget.previewLabel,
  "+a^2 -> -a^2",
  "Der erste additive Schritt muss den implizit positiven Term selbst benennen."
);
assert.ok(
  runtimePlusOperatorId,
  "Der Runtime-Testfall braucht den sichtbaren Plus-Operator der Ausgangszeile."
);
assert.ok(
  !runtimeAdditionTarget.selectors.some(
    (selector) => selector.selectorType === "atom" && selector.selectorValue === runtimePlusOperatorId
  ),
  "Das sichtbare Plus gehoert zu b^2 und darf deshalb nicht mit a^2 eingefaerbt werden."
);

assert.ok(runtimeSubtrahendTarget, "Im Genesis-Runtime muss auch der zweite additive Schritt als eigenes Farbzielt auftauchen.");
assert.equal(
  runtimeSubtrahendTarget.previewLabel,
  "+b^2 -> -b^2",
  "Der zweite additive Schritt muss den positiven Ursprungsterm samt Zielvorzeichen korrekt benennen."
);
assert.ok(
  runtimeSubtrahendTarget.selectors.some(
    (selector) => selector.selectorType === "atom" && selector.selectorValue === runtimePlusOperatorId
  ),
  "Beim Verschieben von b^2 muss das sichtbare Plus mit zum Term gehoeren."
);
assert.ok(
  !runtimeSubtrahendTarget.selectors.some(
    (selector) => selector.selectorType === "atom" && selector.selectorValue === runtimeMinusOperatorId
  ),
  "Das Minus vor 2abcos(gamma) gehoert nicht zu b^2 und darf deshalb nicht denselben Farbverbund bekommen."
);

assert.ok(runtimeFractionTarget, "Im Genesis-Runtime muss auch der Nenner-Schritt als eigenes Farbzielt auftauchen.");
assert.equal(
  runtimeFractionTarget.previewLabel,
  "-2ab -> Nenner",
  "Beim Teilen durch einen negativen Faktorblock muss das Vorzeichen als Teil des Nenner-Terms benannt werden."
);
assert.ok(
  runtimeFractionDenominatorShellId,
  "Der Runtime-Testfall braucht die erzeugte Nenner-Schale des Bruches."
);
assert.ok(
  runtimeFractionTarget.selectors.some(
    (selector) => selector.selectorType === "shell-id" && selector.selectorValue === runtimeFractionDenominatorShellId
  ),
  "Die erzeugte Nenner-Schale selbst muss Teil des Farbverbunds sein, damit auch das Minus rechts mitgefaerbt wird."
);

const trigPolicy = {
  fallback: "none",
  ruleSpec: trigTarget.selectors.map((selector) => `${selector.selectorType}:${selector.selectorValue}=#D97706`).join(";")
};
const gammaViewModel = buildWorksheetViewModel(gammaResult);
const gammaRuntimeViewModel = buildWorksheetViewModel(gammaRuntimeResult);
const nestedCosCell = (gammaViewModel.steps[2]?.cells || []).find(
  (cell) => cell.projectionRole === "function_name" && cell.text === "cos"
);
const nestedCosNode = nestedCosCell?.renderNode || null;
const runtimeFractionPolicy = {
  fallback: "none",
  ruleSpec: runtimeFractionTarget.selectors.map((selector) => `${selector.selectorType}:${selector.selectorValue}=#15803D`).join(";")
};
const runtimeDenominatorMinusCell = gammaRuntimeViewModel.steps
  .flatMap((step) => step?.cells || [])
  .find((cell) => cell.projectionRole === "negation_sign" && cell.text === "-");
const runtimeDenominatorMinusNode = runtimeDenominatorMinusCell?.renderNode || null;

assert.ok(nestedCosNode, "Das verschachtelte cos(gamma) im negativen Faktorblock muss als explizite Funktionsnamenspur vorliegen.");
assert.equal(
  resolveShellColorForNode(nestedCosNode, trigPolicy)?.hex,
  "#D97706",
  "Auch eine in eine neue Schale eingebettete explizite cos-Spur muss die trigonometrische Cockpit-Farbe vom Ursprung erben."
);
assert.ok(runtimeDenominatorMinusNode, "Die sichtbare Minus-Spur im Nenner muss im Runtime-ViewModel explizit greifbar bleiben.");
assert.equal(
  resolveShellColorForNode(runtimeDenominatorMinusNode, runtimeFractionPolicy)?.hex,
  "#15803D",
  "Wenn ein negativer Faktorblock in den Nenner wandert, muss die rechte Minus-Spur dieselbe Cockpit-Farbe wie der Rest des Faktors erben."
);

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
  targetVariable: "a",
  runtimeEngine: "genesis_runtime"
});
assert.equal(pythagorasResult.fehler, undefined);

const pythagorasTargets = deriveColorTargets(pythagorasResult);
const pythagorasAdditionTarget = findTarget(pythagorasTargets, "addition_release");
const pythagorasVariableBId = pythagorasResult.exportData.outputContract.theoryRows[0].left[2]?.content?.[0]?.id;

assert.ok(
  pythagorasAdditionTarget,
  "Beim Verschieben von +b^2 muss auch im einfacheren Potenzfall ein additives Farbziel entstehen."
);
assert.equal(
  pythagorasAdditionTarget.previewLabel,
  "+b^2 -> -b^2",
  "Das Cockpit soll den verschobenen Potenzterm im Pythagoras-Fall direkt benennen."
);
assert.ok(
  pythagorasVariableBId,
  "Der Pythagoras-Testfall braucht die atomare Variable b innerhalb der Potenzschale."
);
assert.ok(
  pythagorasAdditionTarget.selectors.some(
    (selector) => selector.selectorType === "atom" && selector.selectorValue === pythagorasVariableBId
  ),
  "Wenn ein Potenzterm verschoben wird, muss das Cockpit auch die innere Basisvariable b selbst mit in den Farbverbund aufnehmen."
);

console.log("✅ Cockpit-Farbziele erfolgreich geprueft.");
