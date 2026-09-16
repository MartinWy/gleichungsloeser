import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";
import { buildGeneratedMultiplicationShell } from "../../core/GenesisRuntime/P3_Transformation/generatedShells.js";

function findFractionBirthProduct(result, side) {
    const row = result.phases.projection.theoryRows.find((theoryRow) => (
        theoryRow?.strategy?.family === "fraction_birth"
    ));
    const sideNodes = side === "left" ? row?.left : row?.right;

    return (sideNodes || []).find((node) => (
        node?.isVisible !== false
        && node?.type === "MULTIPLICATION"
        && node?.generatedByFamily === "fraction_birth"
    )) || null;
}

function assertReciprocalFactor(node, message) {
    assert.equal(node?.type, "DIVISION", message);
    assert.ok(node?.reciprocalOfShellId, `${message} Der Ursprungsbruch muss referenziert bleiben.`);
}

function assertProjectedFactorOrder(result, side, product, expectedOrder) {
    const theoryRow = result.phases.projection.theoryRows.find((row) => (
        row?.strategy?.family === "fraction_birth"
    ));
    const projectionRow = result.phases.projection.projectionRows.find((row) => (
        row?.rowId === theoryRow?.rowId
    ));
    const existingFactor = product.factors.find((factor) => factor?.value === "a");
    const reciprocalFactor = product.factors.find((factor) => factor?.type === "DIVISION");
    const operator = product.operators?.[0];
    const existingCell = projectionRow?.projectionAtoms.find((atom) => (
        atom?.side === side && atom?.sourceNodeId === existingFactor?.id
    ));
    const operatorCell = projectionRow?.projectionAtoms.find((atom) => (
        atom?.side === side && atom?.sourceNodeId === operator?.id
    ));
    const reciprocalSpan = projectionRow?.shellSpans.find((shell) => (
        shell?.side === side && shell?.shellId === reciprocalFactor?.id
    ));

    assert.ok(existingCell, `P4 muss den vorhandenen Ausdruck a auf ${side} ausgeben.`);
    assert.ok(operatorCell, `P4 muss den Multiplikationsoperator auf ${side} ausgeben.`);
    assert.ok(reciprocalSpan, `P4 muss den Kehrbruch als geschlossene Schale auf ${side} ausgeben.`);

    if (expectedOrder === "new_then_existing") {
        assert.ok(
            reciprocalSpan.colEnd < operatorCell.colStart
                && operatorCell.colEnd < existingCell.colStart,
            "P4 muss links dieselbe Reihenfolge Kehrbruch * Altinhalt in Zellen abbilden."
        );
    } else {
        assert.ok(
            existingCell.colEnd < operatorCell.colStart
                && operatorCell.colEnd < reciprocalSpan.colStart,
            "P4 muss rechts dieselbe Reihenfolge Altinhalt * Kehrbruch in Zellen abbilden."
        );
    }

    const stableExistingCells = result.phases.projection.projectionRows
        .flatMap((row) => row.projectionAtoms)
        .filter((atom) => atom?.sourceNodeId === existingFactor?.id && atom?.side === side);

    assert.ok(stableExistingCells.length >= 3, "Der vorhandene Ausdruck a muss ueber mehrere Zeilen sichtbar bleiben.");
    assert.equal(
        new Set(stableExistingCells.map((atom) => `${atom.colStart}:${atom.col}:${atom.colEnd}`)).size,
        1,
        "Der vorhandene gleichheitsnahe Ausdruck darf fuer den neuen Aussenfaktor seine Zelle nicht wechseln."
    );
}

assert.throws(
    () => buildGeneratedMultiplicationShell(
        [{ id: "existing", type: "VARIABLE", value: "a", isVisible: true }],
        [{ id: "new", type: "VARIABLE", value: "b", isVisible: true }],
        {
            family: "contract_probe",
            targetId: "target",
            inverseType: "MULTIPLICATION",
            sourceType: "DIVISION",
            action: "ADD_FACTOR"
        }
    ),
    /generatedSide left oder right/,
    "Der zentrale P3-Erzeuger darf ohne explizite Zielseite keine Faktorenfolge raten."
);

const productOnLeft = await runGenesisRuntime(
    "a/cos(alpha)=b/cos(beta)",
    { targetVariable: "alpha" }
);
const leftProduct = findFractionBirthProduct(productOnLeft, "left");

assert.ok(leftProduct, "Der Kehrbruch-Schritt muss links eine sichtbare Multiplikation erzeugen.");
assert.equal(leftProduct.factors?.length, 2);
assertReciprocalFactor(
    leftProduct.factors?.[0],
    "Ein links neu hinzukommender Faktor muss am aeusseren linken Rand stehen."
);
assert.equal(
    leftProduct.factors?.[1]?.value,
    "a",
    "Der vorhandene linke Ausdruck muss gleichheitsnah hinter dem neuen Faktor bleiben."
);
assertProjectedFactorOrder(productOnLeft, "left", leftProduct, "new_then_existing");

const productOnRight = await runGenesisRuntime(
    "b/cos(beta)=a/cos(alpha)",
    { targetVariable: "alpha" }
);
const rightProduct = findFractionBirthProduct(productOnRight, "right");

assert.ok(rightProduct, "Der gespiegelte Kehrbruch-Schritt muss rechts eine sichtbare Multiplikation erzeugen.");
assert.equal(rightProduct.factors?.length, 2);
assert.equal(
    rightProduct.factors?.[0]?.value,
    "a",
    "Der vorhandene rechte Ausdruck muss gleichheitsnah vor dem neuen Faktor bleiben."
);
assertReciprocalFactor(
    rightProduct.factors?.[1],
    "Ein rechts neu hinzukommender Faktor muss am aeusseren rechten Rand stehen."
);
assertProjectedFactorOrder(productOnRight, "right", rightProduct, "existing_then_new");

console.log("P3-Multiplikation: neue Faktoren wachsen auf beiden Gleichungsseiten nach aussen.");
