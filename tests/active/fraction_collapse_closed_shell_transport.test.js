import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function findProjectionAtom(row, predicate) {
    return (row?.projectionAtoms || []).find(predicate) || null;
}

const runtimeResult = await runGenesisRuntime("A=(g*h)/2", {
    targetVariable: "g"
});

assert.equal(runtimeResult.phases.projection.theoryRows.length, 4);
assert.deepEqual(
    runtimeResult.phases.projection.theoryRows.slice(1).map((row) => row.strategy?.family),
    ["fraction_collapse", "group_release", "fraction_birth"],
    "Ein einzelner geschlossener Zaehler darf nach dem Bruchkollaps nicht in einer neuen Sammelschalte stecken bleiben, sondern muss als Schale weiterreichen und dann regulär geöffnet werden."
);

const projectionRows = runtimeResult.phases.projection.projectionRows;
const row0 = projectionRows[0];
const row1 = projectionRows[1];
const row2 = projectionRows[2];
const row3 = projectionRows[3];

const row0A = findProjectionAtom(row0, (atom) => atom.side === "left" && atom.value === "A");
const row1A = findProjectionAtom(row1, (atom) => atom.side === "left" && atom.value === "A");
const row2A = findProjectionAtom(row2, (atom) => atom.side === "left" && atom.value === "A");
const row0G = findProjectionAtom(row0, (atom) => atom.side === "right" && atom.value === "g");
const row1G = findProjectionAtom(row1, (atom) => atom.side === "right" && atom.value === "g");
const row2G = findProjectionAtom(row2, (atom) => atom.side === "right" && atom.value === "g");
const row3G = findProjectionAtom(row3, (atom) => atom.side === "right" && atom.value === "g");

assert.ok(row0A && row1A && row2A);
assert.equal(row0A.col, row1A.col);
assert.equal(row1A.col, row2A.col);

assert.ok(row0G && row1G && row2G && row3G);
assert.equal(row0G.col, row1G.col);
assert.equal(row1G.col, row2G.col);
assert.equal(row2G.col, row3G.col);

assert.ok(
    row1.projectionAtoms.some((atom) => atom.role === "group_left_paren")
        && row1.projectionAtoms.some((atom) => atom.role === "group_right_paren"),
    "Direkt nach dem Bruchkollaps muss die uebernommene Zaehler-Schale noch geschlossen sichtbar bleiben."
);

assert.ok(
    !row2.projectionAtoms.some((atom) => atom.role === "group_left_paren" || atom.role === "group_right_paren"),
    "Nach dem regulaeren group_release darf die Schutzgruppe nicht weiter sichtbar bleiben."
);

const legacyResult = await GenesisCore.solve("A=(g*h)/2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "g"
});

assert.equal(legacyResult.fehler, undefined);
assert.deepEqual(
    legacyResult.schritte.map((step) => step.strategie.family),
    ["fraction_collapse", "group_release", "fraction_birth"]
);

console.log("✅ Fraction collapse closed-shell transport erfolgreich geprueft.");
