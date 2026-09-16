import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

const result = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "alpha"
});

const birthRow = result.phases.projection.projectionRows[0];
const transportRow = result.phases.projection.projectionRows[1];

assert.ok(birthRow, "Die Geburtszeile des Sinussatzes muss existieren.");
assert.ok(transportRow, "Die Transportzeile nach dem Nennerabbau muss existieren.");

const birthFraction = birthRow.shellSpans.find((shell) => (
    shell.side === "left" && shell.shellType === "DIVISION"
));
const transportedSingletonCollection = transportRow.shellSpans.find((shell) => (
    shell.side === "left"
    && shell.shellType === "COLLECTION"
    && shell.contentLeafIds?.length === 1
));

assert.ok(
    birthFraction,
    "In der Geburtszeile muss links ein sichtbarer Bruch existieren."
);
assert.equal(
    transportedSingletonCollection,
    undefined,
    "Ein einzelnes freigelegtes Atom darf nicht fuer Geometriezwecke in eine COLLECTION gehuellt werden."
);

const birthA = birthRow.projectionAtoms.find((atom) => (
    atom.side === "left" && atom.value === "a"
));
const transportA = transportRow.projectionAtoms.find((atom) => (
    atom.side === "left" && atom.value === "a"
));

assert.ok(birthA, "Das Atom a muss in der Geburtszeile sichtbar sein.");
assert.ok(transportA, "Das Atom a muss in der Transportzeile sichtbar sein.");

assert.equal(
    transportA.col,
    birthA.col,
    "Das Atom a muss auf derselben inneren Spur bleiben, wenn nur der Nenner entfernt wird."
);
assert.equal(
    transportA.sourceNodeId,
    birthA.sourceNodeId,
    "Der Einzelblatt-Transport muss die semantische Atom-ID unveraendert erhalten."
);

console.log("Sinussatz: Einzelzaehler bleibt ohne kuenstliche COLLECTION auf seiner P4-Geburtsspur.");
