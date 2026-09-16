import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";
import { buildWorksheetViewModel } from "../../presentation/adapters/index.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function countAtomicPrimitives(latex = "") {
    return String(latex)
        .split("\n")
        .filter((line) => line.startsWith("\\node[inner sep=0pt") || line.startsWith("\\draw[line width="))
        .length;
}

const equation = "y-2=(a+2)*B^(2x-1)";
const directResult = await GenesisCore.solve(equation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!directResult?.fehler, directResult?.fehler || "Direkter Solve-State fehlt.");

const bridgedResult = buildBridgeWorksheetSolveResultFromSolveState(directResult, equation, "x");
const viewModel = buildWorksheetViewModel(bridgedResult);
const displayModel = buildWorksheetDisplayModel(viewModel);
const finalCells = viewModel.steps.at(-1)?.cells || [];
const latex = buildLatexDocument({
    equation,
    targetVariable: "x",
    viewModel
});

assert.equal(finalCells.filter((cell) => cell.kind === "fraction_line").length, 2);
assert.ok(finalCells.some((cell) => cell.text === "log" && cell.projectionRole === "function_name"));
assert.ok(finalCells.some((cell) => cell.text === "B" && cell.projectionRole === "function_base"));

for (const text of ["y", "a", "+", "1", "2", "x"]) {
    assert.ok(finalCells.some((cell) => cell.text === text), `Die Schlusszeile muss ${text} als eigene Zelle enthalten.`);
}

assert.equal(
    countAtomicPrimitives(latex),
    displayModel.items.length,
    "Auch nach dem realen Bridge-Handoff muss jede Worksheet-Zelle genau ein Exportprimitiv erzeugen."
);
assert.doesNotMatch(latex, /\\frac\{|\\log_\{B\}|\^\{/u);

console.log("Bridge-Worksheet-Endbild bleibt bis zum Export vollstaendig atomar.");
