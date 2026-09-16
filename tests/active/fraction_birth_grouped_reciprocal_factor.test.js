import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function visibleRoots(nodes = []) {
    return nodes.filter((node) => node?.isVisible !== false);
}

const result = await runGenesisRuntime("x*((p-q)/(r+s))=z", {
    targetVariable: "x"
});
const decision = result?.phases?.projection?.theoryRows?.[1]?.strategy;
const finalRow = result?.phases?.projection?.theoryRows?.at(-1);
const oppositeRoots = visibleRoots(finalRow?.right || []);
const multiplication = oppositeRoots.find((node) => node?.type === "MULTIPLICATION");
const reciprocal = visibleRoots(multiplication?.factors || []).find((node) => node?.type === "DIVISION");

assert.equal(decision?.family, "fraction_birth");
assert.equal(
    decision?.inverseMode,
    "reciprocal_factor",
    "Eine einzelne GROUP um eine DIVISION darf deren Bruchnatur fuer P2 nicht verdecken."
);
assert.ok(multiplication, "P3 muss auf der Gegenseite eine MULTIPLICATION erzeugen.");
assert.ok(reciprocal, "Die MULTIPLICATION muss den strukturellen Kehrbruch als eigenen Faktor enthalten.");
assert.equal(reciprocal?.reciprocalOfShellId, decision?.reciprocalDivisionId);

const reciprocalNumeratorRoot = visibleRoots(reciprocal?.numerator || [])[0];
const reciprocalDenominatorRoot = visibleRoots(reciprocal?.denominator || [])[0];
const numeratorExpression = visibleRoots(reciprocalNumeratorRoot?.content || [])[0];
const denominatorExpression = visibleRoots(reciprocalDenominatorRoot?.content || [])[0];

assert.equal(numeratorExpression?.type, "ADDITION");
assert.deepEqual(numeratorExpression?.terms?.map((term) => term?.value), ["r", "s"]);
assert.equal(denominatorExpression?.type, "SUBTRACTION");
assert.equal(denominatorExpression?.minuend?.[0]?.value, "p");
assert.equal(denominatorExpression?.subtrahend?.[0]?.value, "q");

console.log("Ein gruppierter Bruchfaktor wird allgemein als Kehrbruchfaktor uebertragen.");
