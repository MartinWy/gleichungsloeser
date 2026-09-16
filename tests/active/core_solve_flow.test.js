import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";

const cases = [
    {
        equation: "(x+1)=5",
        targetVariable: "x",
        families: ["group_release", "addition_release"]
    },
    {
        equation: "sqrt(x)=5",
        targetVariable: "x",
        families: ["root_power"]
    },
    {
        equation: "2/x=5",
        targetVariable: "x",
        families: ["fraction_denominator_release", "fraction_birth"]
    },
    {
        equation: "sin(x)=1",
        targetVariable: "x",
        families: ["trig_inverse"]
    },
    {
        equation: "y=a*B^x",
        targetVariable: "x",
        families: ["fraction_birth", "power_exponent_release"]
    }
];

for (const testCase of cases) {
    const result = await GenesisCore.solve(testCase.equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: testCase.targetVariable
    });

    assert.ok(!result.fehler, `${testCase.equation}: ${result.fehler || "Genesis-Lauf fehlgeschlagen"}`);
    assert.equal(result.targetVariable, testCase.targetVariable);
    assert.deepEqual(
        result.schritte.map((step) => step.strategie.family),
        testCase.families,
        `${testCase.equation}: Jede Zeile muss genau aus dem vorgesehenen Prozessschritt entstehen.`
    );

    const nativeRows = result.exportData?.outputContract?.projectionRows || [];
    const adapterRows = result.exportData?.projectionRows || [];
    assert.equal(nativeRows.length, testCase.families.length + 1);
    assert.equal(adapterRows.length, nativeRows.length, "Der Adapter darf keine Core-Zeile erfinden oder verschlucken.");

    const anchorCols = nativeRows.map((row) => (
        row.projectionAtoms.find((atom) => atom.role === "equation_anchor")?.col
    ));
    assert.ok(anchorCols.every((col) => Number.isInteger(col)));
    assert.ok(anchorCols.every((col) => col === anchorCols[0]), "Der Gleichheitsanker muss im gesamten Lauf stabil bleiben.");

    for (const row of nativeRows) {
        assert.equal(
            row.projectionAtoms.some((atom) => atom.kind === "shell_container"),
            false,
            "P4 darf keine geschlossene Schale als Renderer-Ersatzzelle exportieren."
        );
        assert.ok(row.projectionAtoms.length > 0);
        assert.ok(row.projectionAtoms.every((atom) => (
            Number.isInteger(atom.localRow)
            && Number.isInteger(atom.colStart)
            && Number.isInteger(atom.colEnd)
        )), "Jede vom Core gelieferte Zelle braucht eine vollstaendige atomare Geometrie.");
    }
}

console.log("Genesis-Core-Solve-Flow erfolgreich geprueft.");
