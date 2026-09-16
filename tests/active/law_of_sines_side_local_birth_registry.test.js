import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

const result = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "alpha"
});

const birthRow = result.phases.projection.projectionRows[0];
const transportRow = result.phases.projection.projectionRows[1];

assert.ok(birthRow, "Die Geburtszeile des Sinussatzes muss existieren.");
assert.ok(transportRow, "Die Transportzeile des rechten Bruchs muss existieren.");

const birthRightFraction = birthRow.shellSpans.find((shell) => (
    shell.side === "right" && shell.shellType === "DIVISION"
));
const transportRightFraction = transportRow.shellSpans.find((shell) => (
    shell.side === "right" && shell.shellType === "DIVISION"
));

assert.ok(
    birthRightFraction,
    "Rechts muss in der Geburtszeile ein sichtbarer Bruch existieren."
);
assert.ok(
    transportRightFraction,
    "Rechts muss beim Nennerabbau derselbe Bruch als geschlossene Schale weiterleben."
);

assert.equal(
    transportRightFraction.colStart,
    birthRightFraction.colStart,
    "Die rechte Bruchschale darf ihre linke Geburtskante nicht von der linken Seite erben."
);
assert.equal(
    transportRightFraction.colEnd,
    birthRightFraction.colEnd,
    "Auch die rechte Bruchbreite muss beim Transport unveraendert bleiben."
);

const birthBeta = birthRow.projectionAtoms.find((atom) => (
    atom.side === "right" && atom.value === "beta"
));
const transportBeta = transportRow.projectionAtoms.find((atom) => (
    atom.side === "right" && atom.value === "beta"
));
const transportAlpha = transportRow.projectionAtoms.find((atom) => (
    atom.side === "right" && atom.value === "alpha"
));

assert.ok(birthBeta, "Das Atom beta muss in der Geburtszeile sichtbar sein.");
assert.ok(transportBeta, "Das Atom beta muss in der rechten Bruchschale erhalten bleiben.");
assert.ok(transportAlpha, "Das Atom alpha muss rechts als neuer Faktor sichtbar sein.");

assert.equal(
    transportBeta.col,
    birthBeta.col,
    "Beta darf beim Transport des rechten Bruchs keine linke Fremdgeometrie uebernehmen."
);
assert.ok(
    transportAlpha.col > transportRightFraction.colEnd,
    "Der neue Faktor sin(alpha) muss rechts neben dem transportierten Bruch beginnen."
);

console.log("Sinussatz: linke und rechte Geburtsgeometrie bleiben in P4 seitengetrennt.");
