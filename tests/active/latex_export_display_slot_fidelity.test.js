import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function extractNodes(latex = "") {
    return [...String(latex).matchAll(/\\node\[inner sep=0pt, outer sep=0pt, anchor=center\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => ({
            x: Number(match[1]),
            y: Number(match[2]),
            latex: match[3]
        }));
}

function extractHorizontalLines(latex = "") {
    return [...String(latex).matchAll(/\\draw\[line width=([0-9.]+)pt, color=([a-zA-Z]+)\] \(([^,]+),([^)]+)\) -- \(([^,]+),([^)]+)\);/g)]
        .map((match) => ({
            widthPt: Number(match[1]),
            color: match[2],
            startX: Number(match[3]),
            startY: Number(match[4]),
            endX: Number(match[5]),
            endY: Number(match[6])
        }));
}

function approximatelyEqual(left, right, message) {
    assert.ok(
        Math.abs(left - right) < 0.0001,
        `${message}: ${left} !== ${right}`
    );
}

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach a darf nicht fehlschlagen.");

const viewModel = buildWorksheetViewModel(result);
const latex = buildLatexDocument({
    equation: result.eingabe,
    targetVariable: result.targetVariable,
    viewModel,
    profile: "standard",
    profileLabel: "standard",
    shellColors: false,
    shellColorPolicy: null
});

const nodes = extractNodes(latex);
const lines = extractHorizontalLines(latex);

const aNodes = nodes.filter((node) => node.latex === "a").sort((left, right) => Math.abs(left.y) - Math.abs(right.y));
const bNodes = nodes.filter((node) => node.latex === "b").sort((left, right) => Math.abs(left.y) - Math.abs(right.y));
const topRightFraction = lines.find((line) => line.startY === -1.86 && line.startX > 4);
const transportedRightFraction = lines.find((line) => line.startY === -6.73 && line.startX > 4);

assert.equal(aNodes.length, 2, "Im Export muessen genau zwei sichtbare a-Knoten vorkommen: Geburt und transportierte Zaehler-Schale.");
assert.equal(bNodes.length, 2, "Im Export muessen genau zwei sichtbare b-Knoten vorkommen: Geburt und transportierte rechte Zaehler-Schale.");
assert.ok(topRightFraction, "Der rechte Bruchstrich des Startschritts muss im Export sichtbar bleiben.");
assert.ok(transportedRightFraction, "Der rechte Bruchstrich des Transportschritts muss im Export sichtbar bleiben.");

approximatelyEqual(
    aNodes[0].x,
    aNodes[1].x,
    "Die sichtbare Zaehler-Schale a darf im PDF-Export ihre X-Position zwischen Geburt und Nennerabbau nicht verlieren"
);
approximatelyEqual(
    bNodes[0].x,
    bNodes[1].x,
    "Die sichtbare Zaehler-Schale b darf im PDF-Export ihre X-Position zwischen Geburt und Nennerabbau nicht verlieren"
);
approximatelyEqual(
    topRightFraction.startX,
    transportedRightFraction.startX,
    "Der rechte Bruchstrich darf im PDF-Export beim Nennerabbau keinen neuen linken Startpunkt erhalten"
);
approximatelyEqual(
    topRightFraction.endX,
    transportedRightFraction.endX,
    "Der rechte Bruchstrich darf im PDF-Export beim Nennerabbau keinen neuen rechten Endpunkt erhalten"
);

const powerResult = await GenesisCore.solve("2-a=e^(2*x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!powerResult?.fehler, powerResult?.fehler || "Der POWER-Renderbeweis braucht einen gueltigen Solve-Lauf.");

const powerViewModel = buildWorksheetViewModel(powerResult);
const powerExponentCells = powerViewModel.steps[0]?.cells
    .filter((cell) => (
        cell.rowKind === "above_axis"
        && Array.isArray(cell.visibleAncestorShells)
        && cell.visibleAncestorShells.some((shell) => shell?.shellType === "POWER")
    ))
    .sort((left, right) => left.colStart - right.colStart);
const powerLatex = buildLatexDocument({
    equation: powerResult.eingabe,
    targetVariable: powerResult.targetVariable,
    viewModel: powerViewModel,
    shellColors: false,
    shellColorPolicy: null
});
const powerNodes = extractNodes(powerLatex);
const firstPowerRowY = Math.max(...powerNodes.map((node) => node.y));
const firstPowerRowNodes = powerNodes
    .filter((node) => node.y === firstPowerRowY)
    .sort((left, right) => left.x - right.x);

assert.deepEqual(
    powerExponentCells.map((cell) => cell.text),
    ["2", "*", "x", "-", "1"],
    "Der komplexe Exponent muss vor dem Export bereits in seine einzelnen P4-Zellen zerlegt sein."
);
assert.deepEqual(
    firstPowerRowNodes.map((node) => node.latex),
    ["2", "\\cdot{}", "x", "-", "1"],
    "Der PDF-Renderer muss jede gelieferte Exponentenzelle als eigenes sichtbares Primitiv setzen."
);
assert.ok(
    powerNodes.some((node) => node.latex === "e"),
    "Die Potenzbasis muss als getrenntes sichtbares Primitiv erhalten bleiben."
);

console.log("LaTeX-Export nutzt die Display-Slots fuer Sinussatz-Transport und POWER-Exponent.");
