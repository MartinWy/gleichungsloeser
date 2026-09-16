import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { normalizeSolveOptions } from "../../core/solveOptions.js";

const result = await GenesisCore.solve(
    "a/sin(alpha)=b/sin(beta)",
    normalizeSolveOptions({
        targetVariable: "alpha",
        runtimeEngine: "genesis_runtime"
    })
);

assert.ok(!result?.fehler, result?.fehler || "Der Kehrbruch-Pfad darf beim Sinussatz nicht fehlschlagen.");

assert.deepEqual(
    result.schritte.map((step) => step?.strategie?.family),
    ["fraction_denominator_release", "fraction_birth", "trig_inverse"],
    "Der Sinussatz soll weiter ueber Nennerfreigabe, Kehrbruch-Faktor und trigonometrische Umkehr laufen."
);

const reciprocalStep = result.schritte[1]?.strategie || {};
assert.equal(reciprocalStep.inverseMode, "reciprocal_factor");
assert.equal(reciprocalStep.action, "MOVE_PASSIVE_FRACTION_TO_RECIPROCAL_FACTOR");
assert.equal(reciprocalStep.label, "Kehrbruch als Faktor");

const atomRegister = Array.isArray(result?.exportData?.atomRegister) ? result.exportData.atomRegister : [];
const reciprocalMultiplicationShell = atomRegister.find((node) => (
    node?.type === "MULTIPLICATION"
    && node?.generatedByFamily === "fraction_birth"
    && node?.generatedByAction === "MOVE_PASSIVE_FRACTION_TO_RECIPROCAL_FACTOR"
));

assert.ok(reciprocalMultiplicationShell, "Der Kehrbruch-Schritt muss als neue Multiplikationsschale materialisiert werden.");
assert.equal(
    reciprocalMultiplicationShell.flowDirection,
    undefined,
    "Eine visuelle Flussrichtung ist keine intrinsische Eigenschaft der MULTIPLICATION-Schale."
);
assert.equal(reciprocalMultiplicationShell.operators?.length, 1);
assert.equal(reciprocalMultiplicationShell.operators?.[0]?.value, "*");

const reciprocalDivisionShell = Array.isArray(reciprocalMultiplicationShell.factors)
    ? reciprocalMultiplicationShell.factors.find((factor) => factor?.type === "DIVISION")
    : null;

assert.ok(reciprocalDivisionShell, "Die Multiplikationsschale braucht den Kehrbruch als eigenen Faktor.");
assert.equal(reciprocalDivisionShell.type, "DIVISION");
assert.equal(reciprocalDivisionShell.generatedByFamily, "fraction_birth");
assert.ok(reciprocalDivisionShell.reciprocalOfShellId, "Der Kehrbruch muss seinen Ursprungsbruch referenzieren.");

const reciprocalNumerator = Array.isArray(reciprocalDivisionShell.numerator)
    ? reciprocalDivisionShell.numerator[0]
    : null;
const reciprocalDenominator = Array.isArray(reciprocalDivisionShell.denominator)
    ? reciprocalDivisionShell.denominator[0]
    : null;

assert.equal(reciprocalNumerator?.type, "FUNCTION");
assert.equal(reciprocalNumerator?.name, "sin");
assert.equal(reciprocalNumerator?.content?.[0]?.value, "beta");
assert.equal(reciprocalDenominator?.value, "b");

const finalShell = atomRegister.find((node) => (
    node?.type === "FUNCTION"
    && node?.generatedByFamily === "trig_inverse"
    && node?.name === "asin"
));

assert.ok(finalShell, "Die abschliessende Umkehrfunktion muss weiter erzeugt werden.");
assert.equal(finalShell.content?.[0]?.generatedByFamily, "fraction_birth");

console.log("Kehrbruch-Faktor-Vertrag erfolgreich geprueft.");
