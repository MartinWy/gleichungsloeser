import assert from "node:assert/strict";
import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function extractFirstPage(latex = "") {
    return String(latex || "").split("\\newpage")[0] || "";
}

function extractNodeLines(firstPage = "") {
    return [...firstPage.matchAll(/\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => ({
            x: Number.parseFloat(match[1]),
            y: Number.parseFloat(match[2]),
            latex: match[3]
        }));
}

const result = await GenesisCore.solve(
    "a^2+b^2-2ab*cos(gamma)=c^2",
    {
        targetVariable: "gamma",
        runtimeEngine: "genesis_runtime"
    }
);

assert.ok(!result?.fehler, result?.fehler || "Der Genesis-Lauf fuer den Kosinussatz nach gamma darf nicht fehlschlagen.");

const viewModel = buildWorksheetViewModel(result);
const firstPage = extractFirstPage(buildLatexDocument({
    equation: result.eingabe,
    targetVariable: result.targetVariable,
    viewModel,
    profile: "standard",
    profileLabel: "standard",
    shellColors: false,
    shellColorPolicy: null
}));

const nodeLines = extractNodeLines(firstPage);
const fractionNodes = nodeLines.filter((node) => node.latex.includes("\\pFourFraction{"));

assert.ok(
    fractionNodes.length >= 2,
    "Der Kosinussatz nach gamma muss im Preview mindestens den freien Zwischenbruch und den finalen acos-Bruch enthalten."
);

fractionNodes.forEach((fractionNode) => {
    const conflictingStandaloneNodes = nodeLines.filter((node) => (
        node !== fractionNode
        && Math.abs(node.y - fractionNode.y) < 0.001
        && !node.latex.includes("\\pFourFraction{")
        && /\\pFourCell\{[0-9.]+\}\{(?:c|a|b|\\scriptstyle 2)\}/.test(node.latex)
    ));

    assert.equal(
        conflictingStandaloneNodes.length,
        0,
        "Ein kompakter Bruch darf seine Zaehler-Rohzellen in derselben Preview-Zeile nicht noch einmal separat exportieren."
    );
});
