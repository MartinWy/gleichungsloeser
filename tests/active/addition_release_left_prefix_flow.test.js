import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

const result = await runGenesisRuntime("5=x-1", {
    targetVariable: "x"
});

const releaseRow = result.phases.projection.projectionRows[1];

assert.ok(releaseRow, "Die Folgezeile nach subtraction_release muss existieren.");

const leftAtoms = releaseRow.projectionAtoms
    .filter((atom) => atom.side === "left" && atom.value)
    .map((atom) => ({ value: atom.value, col: atom.col }));

const oneAtom = leftAtoms.find((atom) => atom.value === "1");
const fiveAtom = leftAtoms.find((atom) => atom.value === "5");
const plusAtom = leftAtoms.find((atom) => atom.value === "+");

assert.ok(oneAtom, "Links muss der inverse Additionsterm 1 sichtbar sein.");
assert.ok(fiveAtom, "Links muss der Altinhalt 5 sichtbar bleiben.");
assert.ok(plusAtom, "Links muss der Additionsoperator sichtbar sein.");
assert.ok(
    oneAtom.col < plusAtom.col && plusAtom.col < fiveAtom.col,
    "Beim Uebergang von rechts nach links muss der neue Additionsterm vorne andocken: 1 + 5."
);

console.log("Additionsrichtung: rechts geloeste Terme werden links vorne angebaut.");
