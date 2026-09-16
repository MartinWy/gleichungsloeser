import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const exponentResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
const exponentViewModel = buildWorksheetViewModel(exponentResult);

for (const stepIndex of [0, 1]) {
    const targetCell = exponentViewModel.steps[stepIndex].cells.find((cell) => (
        cell.text === "x" && cell.projectionRole === "power_exponent"
    ));
    assert.ok(targetCell);
    assert.equal(targetCell.isTarget, true);
    assert.deepEqual(targetCell.representedSourceAtomIds, [targetCell.sourceAtomId]);
}

const exponentBase = exponentViewModel.steps[0].cells.find((cell) => cell.text === "B");
assert.equal(exponentBase?.isTarget, false, "Die Basis darf nicht zum Proxy fuer das Exponentenziel werden.");

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});
const pythagorasViewModel = buildWorksheetViewModel(pythagorasResult);
const initialA = pythagorasViewModel.steps[0].cells.find((cell) => cell.text === "a");
assert.ok(initialA);
assert.equal(initialA.isTarget, true);
assert.deepEqual(initialA.representedSourceAtomIds, [initialA.sourceAtomId]);

console.log("Worksheet-Atomzielidentitaet erfolgreich geprueft.");
