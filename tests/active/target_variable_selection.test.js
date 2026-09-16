import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";

async function solve(equation, options = {}) {
    return GenesisCore.solve(equation, {
        ...options,
        runtimeEngine: "genesis_runtime"
    });
}

const autoTargetResult = await solve("2*a=10");
assert.ok(!autoTargetResult.fehler);
assert.equal(autoTargetResult.targetVariable, "a");
assert.deepEqual(autoTargetResult.schritte.map((step) => step.strategie.family), ["fraction_birth"]);

const multiLetterTargetResult = await solve("alpha+2=5");
assert.ok(!multiLetterTargetResult.fehler);
assert.equal(multiLetterTargetResult.targetVariable, "alpha");
assert.deepEqual(multiLetterTargetResult.schritte.map((step) => step.strategie.family), ["addition_release"]);

for (const testCase of [
    { equation: "sin(x)/(2*a)=5", targetVariable: "x" },
    { equation: "5=sin(m)/(2*a)", targetVariable: "m" }
]) {
    const result = await solve(testCase.equation, { targetVariable: testCase.targetVariable });
    assert.ok(!result.fehler, result.fehler);
    assert.equal(result.targetVariable, testCase.targetVariable);
    assert.deepEqual(
        result.schritte.map((step) => step.strategie.family),
        ["fraction_collapse", "trig_inverse"]
    );

    const targetAtoms = result.exportData.outputContract.projectionRows.map((row) => (
        row.projectionAtoms.find((atom) => atom.value === testCase.targetVariable && atom.kind === "content")
    ));
    assert.ok(targetAtoms.every(Boolean), "Die Zielvariable muss in jeder Core-Zeile als Atom sichtbar bleiben.");
    assert.ok(targetAtoms.every((atom) => atom.sourceNodeId === targetAtoms[0].sourceNodeId));
    assert.ok(targetAtoms.every((atom) => atom.col === targetAtoms[0].col), "Die Zielvariable darf ihre Spur nicht wechseln.");
}

const explicitTargetResult = await solve("x+a=7", { targetVariable: "a" });
assert.ok(!explicitTargetResult.fehler);
assert.equal(explicitTargetResult.targetVariable, "a");
assert.deepEqual(explicitTargetResult.schritte.map((step) => step.strategie.family), ["addition_release"]);

const missingTargetResult = await solve("x+1=5", { targetVariable: "z" });
assert.match(missingTargetResult.fehler || "", /nicht vor/);

const ambiguousTargetResult = await solve("x+a=7");
assert.match(ambiguousTargetResult.fehler || "", /targetVariable/);

const bothSidesResult = await solve("x+1=x+2", { targetVariable: "x" });
assert.match(bothSidesResult.fehler || "", /2 Mal|genau einmal/);

const repeatedSameSideResult = await solve("x+x=5", { targetVariable: "x" });
assert.match(repeatedSameSideResult.fehler || "", /2 Mal|genau einmal/);

console.log("Genesis-Zielvariablenwahl erfolgreich geprueft.");
