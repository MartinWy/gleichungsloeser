import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "alpha",
    runtimeEngine: "genesis_runtime"
});

const step = buildWorksheetViewModel(result).steps[0];
const fractionLines = (step?.cells || []).filter((cell) => cell?.kind === "fraction_line");

assert.ok(fractionLines.length >= 2, "Die Startzeile des Sinussatzes braucht zwei sichtbare Bruchstriche.");

for (const line of fractionLines) {
    assert.equal(
        line.fractionRenderNode,
        null,
        "Ein Bruchstrich darf keinen kompletten Bruch als zweiten Rendernode mittragen."
    );
    assert.equal(
        line.sourceShellNodeType,
        "DIVISION",
        "Der Bruchstrich bleibt an seine Division-Schale gebunden."
    );
}

console.log("Bruchstriche tragen keinen kompletten Bruch-Rendernode mehr.");
