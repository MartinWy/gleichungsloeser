import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { resolveCellSemanticBounds } from "../../components/Arbeitsblatt_Druckansicht/cellSemanticBounds.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";

const cases = [
    ["sin(sqrt((x+3)/(2+1)))=5", "x"],
    ["a^2+b^2=c^2", "a"],
    ["y=a*B^(2x-1)", "x"]
];

for (const [equation, targetVariable] of cases) {
    const result = await GenesisCore.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable
    });
    assert.ok(!result?.fehler, result?.fehler || `${equation} darf nicht fehlschlagen.`);

    const viewModel = buildWorksheetViewModel(result);
    const displayModel = buildWorksheetDisplayModel(viewModel);
    const worksheetCells = viewModel.layout.cells;

    assert.equal(
        displayModel.items.length,
        worksheetCells.length,
        `Das DisplayModel muss fuer ${equation} genau ein Item je Worksheet-Zelle liefern.`
    );
    assert.deepEqual(
        displayModel.items.map((item) => item.cell.id).sort(),
        worksheetCells.map((cell) => cell.id).sort(),
        `Das DisplayModel darf fuer ${equation} keine Zelle ersetzen, entfernen oder erfinden.`
    );

    displayModel.items.forEach((item) => {
        const bounds = resolveCellSemanticBounds(item.cell);

        assert.equal(bounds.isInferred, false, `Zelle ${item.cell.id} braucht explizite P4-Grenzen.`);
        assert.equal(item.displayStartSlot, item.semanticStartSlot, `Zelle ${item.cell.id} darf keinen erfundenen Vorslot belegen.`);
        assert.equal(item.displayEndSlot, item.semanticEndSlot, `Zelle ${item.cell.id} darf keinen erfundenen Nachslot belegen.`);
    });

    assert.match(displayModel.gridTemplateColumns, /minmax\(/, "Das DisplayModel muss ein physisches Spaltenprofil liefern.");
}

const nestedResult = await GenesisCore.solve("sin(sqrt((x+3)/(2+1)))=5", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
const nestedViewModel = buildWorksheetViewModel(nestedResult);
const nestedDisplayModel = buildWorksheetDisplayModel(nestedViewModel);
const nestedStartStep = nestedViewModel.steps[0];
const rootHook = nestedStartStep.cells.find((cell) => cell.projectionRole === "root_hook");
const rootOverbar = nestedStartStep.cells.find((cell) => cell.projectionRole === "root_overbar");

assert.ok(rootHook && rootOverbar, "Die verschachtelte Wurzel muss als zwei explizite P4-Schalenprimitive ankommen.");
assert.equal(
    nestedStartStep.cells.some((cell) => cell.projectionRole === "root" || cell.kind === "root"),
    false,
    "Zwischen Worksheet und Display darf keine gebuendelte Ersatzwurzel entstehen."
);
assert.ok(
    nestedDisplayModel.items.some((item) => item.cell.id === rootHook.id)
        && nestedDisplayModel.items.some((item) => item.cell.id === rootOverbar.id),
    "Hook und Ueberstrich muessen je ein eigenes Display-Item erhalten."
);

console.log("Atomare Worksheet-Display-Abbildung erfolgreich geprueft.");
