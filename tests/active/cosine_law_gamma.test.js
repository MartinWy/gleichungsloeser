import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";

const result = await GenesisCore.solve(
    "a^2+b^2-2*a*b*cos(gamma)=c^2",
    {
        runtimeEngine: "genesis_runtime",
        targetVariable: "gamma"
    }
);

assert.ok(!result.fehler, result.fehler);
assert.equal(result.targetVariable, "gamma");
assert.deepEqual(
    result.schritte.map((step) => step.strategie.family),
    ["subtrahend_release", "subtracted_sum_release", "fraction_birth", "trig_inverse"],
    "Der Kosinussatz muss die negative Summenklammer in einem eigenen allgemeinen Prozessschritt aufloesen."
);

const rows = result.exportData.outputContract.projectionRows;
assert.equal(rows.length, 5);

const firstResultRowAtoms = rows[1].projectionAtoms;
const rightC = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.value === "c");
const rightMinus = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.role === "subtraction_operator");
const rightGroupLeft = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.role === "group_left_paren");
const rightA = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.value === "a");
const rightPlus = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.value === "+");
const rightB = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.value === "b");
const rightGroupRight = firstResultRowAtoms.find((atom) => atom.side === "right" && atom.role === "group_right_paren");

assert.ok(rightC && rightMinus && rightGroupLeft && rightA && rightPlus && rightB && rightGroupRight);
assert.ok(
    rightC.col < rightMinus.col
        && rightMinus.col < rightGroupLeft.col
        && rightGroupLeft.col < rightA.col
        && rightA.col < rightPlus.col
        && rightPlus.col < rightB.col
        && rightB.col < rightGroupRight.col,
    "Die erste Folgezeile muss c^2-(a^2+b^2) atomar und mit ihrer bindenden Gruppe projizieren."
);

const distributedResultRowAtoms = rows[2].projectionAtoms;
const distributedRightValues = distributedResultRowAtoms
    .filter((atom) => (
        atom.side === "right"
        && atom.localRow === rows[2].axisLocalRow
        && atom.isVisible !== false
    ))
    .sort((left, right) => left.col - right.col)
    .map((atom) => atom.value)
    .filter((value) => value != null);
assert.deepEqual(
    distributedRightValues,
    ["c", "-", "a", "-", "b"],
    "Die zusaetzliche Theoriezeile muss c^2-a^2-b^2 ohne bindende Additionsklammer tragen."
);
assert.equal(
    distributedResultRowAtoms.some((atom) => (
        atom.side === "right"
        && ["group_left_paren", "group_right_paren"].includes(atom.role)
    )),
    false,
    "Nach subtracted_sum_release darf die aufgeloeste Summenklammer nicht sichtbar bleiben."
);

const gammaAtoms = rows.map((row) => (
    row.projectionAtoms.find((atom) => atom.kind === "content" && atom.value === "gamma")
));
assert.ok(gammaAtoms.every(Boolean), "gamma muss in jeder Core-Zeile als eigenes Atom vorhanden sein.");
assert.ok(gammaAtoms.every((atom) => atom.sourceNodeId === gammaAtoms[0].sourceNodeId));
assert.ok(gammaAtoms.every((atom) => atom.col === gammaAtoms[0].col), "gamma muss seine funktionale Spur behalten.");

const startAtoms = rows[0].projectionAtoms;
assert.ok(startAtoms.some((atom) => atom.role === "function_name" && atom.value === "cos"));
assert.ok(startAtoms.some((atom) => atom.role === "function_left_paren" && atom.value === "("));
assert.ok(startAtoms.some((atom) => atom.role === "function_right_paren" && atom.value === ")"));
assert.equal(
    startAtoms.some((atom) => atom.value === "cos(gamma)"),
    false,
    "Die Funktionsschale darf nicht als gebuendelte Renderer-Zelle exportiert werden."
);

const finalAtoms = rows.at(-1).projectionAtoms;
assert.ok(finalAtoms.some((atom) => atom.role === "function_name" && atom.value === "acos"));
assert.ok(finalAtoms.some((atom) => atom.role === "fraction_line"));
assert.equal(finalAtoms.some((atom) => atom.kind === "shell_container"), false);

console.log("Genesis-Kosinussatz fuer gamma erfolgreich geprueft.");
