import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";
import { buildWorksheetViewModel } from "../../presentation/adapters/index.js";
import { buildStepLayout } from "../../scripts/export_projection_pdf_core/stepLayout.js";
import { buildColumnLayout } from "../../presentation/column_layout/index.js";
import { buildDisplayColumnLayout } from "../../components/Arbeitsblatt_Druckansicht/columnLayoutCore/displayColumnLayout.js";
import { buildStepNodes } from "../../scripts/export_projection_pdf_core/latexRendering.js";

const equation = "y-2=(a+2)*B^(2x-1)";
const directResult = await GenesisCore.solve(equation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!directResult?.fehler, directResult?.fehler || "Direkter Solve-State fehlt.");

const bridgedResult = buildBridgeWorksheetSolveResultFromSolveState(
    directResult,
    equation,
    "x"
);
const viewModel = buildWorksheetViewModel(bridgedResult);
const profile = "standard";
const layout = buildStepLayout(viewModel, profile);
const semanticLayout = buildColumnLayout(viewModel, profile);
const displayLayout = buildDisplayColumnLayout(viewModel, semanticLayout, profile);
const finalStepNodes = buildStepNodes(
    viewModel.steps[4],
    4,
    layout,
    semanticLayout,
    displayLayout,
    false,
    false,
    null,
    {
        powerInverseStyle: "root"
    }
);

assert.equal(
    finalStepNodes.some((line) => line.includes("\\log")),
    true,
    "Die Schlusszeile muss den Logarithmuskopf weiterhin als eigenen Zellknoten tragen."
);
assert.equal(
    finalStepNodes.some((line) => line.includes("{B}")),
    true,
    "Die Logarithmusbasis B muss als getrennte, von P4 gelieferte Funktionsbasiszelle erhalten bleiben."
);
assert.equal(
    finalStepNodes.some((line) => line.includes("\\pFourFraction{")),
    false,
    "Explizit projizierte Bridge-Schlusszeilen duerfen nicht mehr zu einem lokalen Gesamtbruch rekonstruiert werden."
);
assert.equal(
    finalStepNodes.filter((line) => line.includes("\\vcenter{\\hrule")).length,
    2,
    "Die Schlusszeile muss inneren und aeusseren Bruchstrich als zwei getrennte Shell-Knoten exportieren."
);
assert.ok(
    finalStepNodes.some((line) => line.includes("{y}")),
    "Der innere Zaehler muss als eigene Zelle sichtbar bleiben."
);
assert.ok(
    finalStepNodes.some((line) => line.includes("{a}")),
    "Der innere Nenner muss als eigene Zelle sichtbar bleiben."
);
assert.ok(
    finalStepNodes.some((line) => line.includes("{+}") || line.includes("\\{+\\}")),
    "Die Addition +1 muss als eigener Zellknoten bestehen bleiben."
);
assert.ok(
    finalStepNodes.some((line) => line.includes("{1}")),
    "Die Eins im Schlusszaehler muss als eigene Zelle bestehen bleiben."
);
assert.ok(
    finalStepNodes.some((line) => line.includes("{2}")),
    "Der Schlussnenner 2 muss als eigene Zelle unter dem aeusseren Bruchstrich stehen bleiben."
);
assert.ok(
    finalStepNodes.some((line) => line.includes("{x}")),
    "Die Zielvariable x muss in der Schlusszeile als eigene Zelle erhalten bleiben."
);

console.log("Bridge-Worksheet-Final-Render erfolgreich geprueft.");
