import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function collectPrimitiveCommands(latex = "") {
    return String(latex)
        .split("\n")
        .filter((line) => line.startsWith("\\node[inner sep=0pt") || line.startsWith("\\draw[line width="));
}

async function buildAtomicFixture(equation, targetVariable) {
    const result = await GenesisCore.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable
    });

    assert.ok(!result?.fehler, result?.fehler || `${equation} muss einen gueltigen Genesis-Lauf liefern.`);

    const viewModel = buildWorksheetViewModel(result);
    const displayModel = buildWorksheetDisplayModel(viewModel);
    const latex = buildLatexDocument({
        equation: result.eingabe,
        targetVariable: result.targetVariable,
        viewModel,
        shellColors: false,
        shellColorPolicy: null
    });

    assert.equal(
        collectPrimitiveCommands(latex).length,
        displayModel.items.length,
        `${equation}: Jede Worksheet-Zelle muss genau ein LaTeX-/TikZ-Primitiv erzeugen.`
    );

    return { viewModel, displayModel, latex };
}

const powerFixture = await buildAtomicFixture("2-a=e^(2*x-1)", "x");
const exponentCells = powerFixture.viewModel.steps[0].cells
    .filter((cell) => (
        cell.rowKind === "above_axis"
        && cell.visibleAncestorShells?.some((shell) => shell?.shellType === "POWER")
    ))
    .sort((left, right) => left.colStart - right.colStart);

assert.deepEqual(
    exponentCells.map((cell) => cell.text),
    ["2", "*", "x", "-", "1"],
    "Der komplexe Exponent muss als Folge atomarer Zellen beim Renderer ankommen."
);
assert.doesNotMatch(
    powerFixture.latex,
    /\^\{/u,
    "Der atomare Renderer darf aus den Exponentenzellen keine neue LaTeX-Potenz bauen."
);

const fractionFixture = await buildAtomicFixture("a/b=c", "a");
const fractionLineCells = fractionFixture.displayModel.items.filter((item) => item.cell?.kind === "fraction_line");
assert.ok(fractionLineCells.length > 0, "Der Bruchbeweis braucht mindestens eine explizite Bruchstrichzelle.");
assert.doesNotMatch(
    fractionFixture.latex,
    /\\frac\{/u,
    "Der atomare Renderer darf Bruchzellen nicht zu einer neuen LaTeX-Bruchformel buendeln."
);

const centeredFractionFixture = await buildAtomicFixture(
    "a/sin(alpha)=b/sin(beta)",
    "a"
);
const transportedBItem = centeredFractionFixture.displayModel.items.find((item) => (
    item.cell?.stepIndex === 1
    && item.cell?.text === "b"
    && item.cell?.rowKind === "above_axis"
));
const transportedFractionLineItem = centeredFractionFixture.displayModel.items.find((item) => (
    item.cell?.stepIndex === 1
    && item.cell?.kind === "fraction_line"
    && item.cell?.sourceShellId === transportedBItem?.cell?.sourceShellId
));

assert.ok(transportedBItem && transportedFractionLineItem, "Der Sinussatz braucht den transportierten atomaren Zaehler und seinen Bruchstrich.");
assert.deepEqual(
    [transportedBItem.displayStartSlot, transportedBItem.displayEndSlot],
    [transportedFractionLineItem.displayStartSlot, transportedFractionLineItem.displayEndSlot],
    "Der Renderer muss fuer b exakt die vom Core gelieferte Bruchband-Zelle verwenden."
);

const rootFixture = await buildAtomicFixture("a^2+b^2=c^2", "a");
const rootHookCells = rootFixture.displayModel.items.filter((item) => item.cell?.projectionRole === "root_hook");
const rootOverbarCells = rootFixture.displayModel.items.filter((item) => item.cell?.projectionRole === "root_overbar");

assert.equal(rootHookCells.length, 1, "Der Wurzelbeweis braucht genau eine atomare Hook-Zelle.");
assert.equal(rootOverbarCells.length, 1, "Der Wurzelbeweis braucht genau eine atomare Overbar-Zelle.");
assert.doesNotMatch(
    rootFixture.latex,
    /\\sqrt/u,
    "Der atomare Renderer darf Hook und Overbar nicht zu einer neuen LaTeX-Wurzel buendeln."
);

console.log("Atomare LaTeX-Abbildung fuer Exponent, Bruch und Wurzel erfolgreich geprueft.");
