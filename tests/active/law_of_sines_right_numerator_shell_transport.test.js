import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

const result = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "b"
});

const birthRow = result.phases.projection.projectionRows[0];
const transportRow = result.phases.projection.projectionRows[1];

assert.ok(birthRow, "Die Geburtszeile des Sinussatzes muss existieren.");
assert.ok(transportRow, "Die Transportzeile nach dem Nennerabbau muss existieren.");

const birthFraction = birthRow.shellSpans.find((shell) => (
    shell.side === "right" && shell.shellType === "DIVISION"
));
const transportedSingletonCollection = transportRow.shellSpans.find((shell) => (
    shell.side === "right"
    && shell.shellType === "COLLECTION"
    && shell.contentLeafIds?.length === 1
));

assert.ok(
    birthFraction,
    "In der Geburtszeile muss rechts ein sichtbarer Bruch existieren."
);
assert.equal(
    transportedSingletonCollection,
    undefined,
    "Ein einzelnes freigelegtes Atom darf auch rechts keine Geometrie-COLLECTION erzeugen."
);

const birthB = birthRow.projectionAtoms.find((atom) => (
    atom.side === "right" && atom.value === "b"
));
const transportB = transportRow.projectionAtoms.find((atom) => (
    atom.side === "right" && atom.value === "b"
));

assert.ok(birthB, "Das Atom b muss in der Geburtszeile sichtbar sein.");
assert.ok(transportB, "Das Atom b muss in der Transportzeile sichtbar sein.");

assert.equal(
    transportB.col,
    birthB.col,
    "Das Atom b muss auf derselben inneren Spur bleiben, wenn nur der Nenner entfernt wird."
);
assert.equal(
    transportB.sourceNodeId,
    birthB.sourceNodeId,
    "Der rechte Einzelblatt-Transport muss die semantische Atom-ID unveraendert erhalten."
);

console.log("Sinussatz: rechter Einzelzaehler bleibt ohne kuenstliche COLLECTION auf seiner P4-Geburtsspur.");
