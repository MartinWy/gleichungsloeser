import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function extractFirstPage(latex = "") {
    return String(latex || "").split("\\newpage")[0] || "";
}

function extractNodes(firstPage = "") {
    return [...firstPage.matchAll(/\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => ({
            x: Number.parseFloat(match[1]),
            y: Number.parseFloat(match[2]),
            latex: match[3]
        }));
}

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "beta"
});

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach beta darf nicht fehlschlagen.");

const viewModel = buildWorksheetViewModel(result);
const penultimateStep = viewModel.steps.at(-2);
const finalStep = viewModel.steps.at(-1);
const firstPage = extractFirstPage(buildLatexDocument({
    equation: result.eingabe,
    targetVariable: result.targetVariable,
    viewModel,
    profile: "standard",
    profileLabel: "standard",
    shellColors: false,
    shellColorPolicy: null
}));

const nodes = extractNodes(firstPage);
const penultimateFractionLine = penultimateStep?.cells.find((cell) => cell.kind === "fraction_line");
const finalAsinNameCell = finalStep?.cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "asin");
const finalWholeAsinShell = finalStep?.cells.find((cell) => cell.kind === "function" && cell.text.startsWith("asin("));
const standaloneAsinNameNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{\\operatorname\{asin\}\}$/.test(node.latex));
const wholeAsinNode = nodes.find((node) => node.latex.includes("\\operatorname{asin}\\left("));
const closedSinAlphaNodes = nodes.filter((node) => node.latex.includes("\\sin\\left(\\alpha\\right)"));
const standalonePassiveSinNameNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{\\sin\}$/.test(node.latex));
const fractionLineNodes = nodes.filter((node) => node.latex.includes("\\hrule width"));
const standaloneBNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{b\}$/.test(node.latex));
const standaloneANodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{a\}$/.test(node.latex));
const standaloneAlphaNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{\\alpha\}$/.test(node.latex));

assert.ok(
    penultimateFractionLine,
    "Vor der trigonometrischen Umkehrung muss der rechte Ausdruck als sichtbarer verschachtelter Bruch mit explizitem Bruchstrich bestehen bleiben."
);

assert.ok(
    finalAsinNameCell,
    "Nach der trigonometrischen Umkehrung muss die inverse Funktionshuelle im Arbeitsblatt explizit mit Name und Klammern weitergereicht werden."
);

assert.equal(
    finalWholeAsinShell,
    undefined,
    "Eine inverse Huelle um einen strukturierten Bruchkern darf nicht als einzelne geschlossene asin(...)-Gesamtschale weitergereicht werden."
);

assert.ok(
    standaloneAsinNameNodes.length >= 1,
    "Der PDF-Renderer muss den Funktionsnamen asin fuer strukturierte inverse Huelle separat setzen koennen."
);

assert.equal(
    wholeAsinNode,
    undefined,
    "Der PDF-Renderer darf eine strukturierte inverse Huelle nicht wieder zu einem einzigen asin(...)-Knoten zusammenschieben."
);

assert.equal(
    closedSinAlphaNodes.length,
    0,
    "Die passive innere sin(alpha)-Schale darf im PDF nicht als zusammengesetzte Gesamtzelle auftauchen."
);

assert.ok(
    standalonePassiveSinNameNodes.length >= 4,
    "Die passive innere sin(alpha)-Schale muss im PDF stattdessen ueber sichtbare Primitive belegt bleiben."
);

assert.ok(
    fractionLineNodes.length >= 4,
    "Die verschachtelten Brueche muessen im PDF mit expliziten Bruchstrich-Knoten bestehen bleiben."
);

assert.ok(
    standaloneBNodes.length >= 1,
    "b muss im verschachtelten Bruchpfad als weitergereichtes Zaehleratom sichtbar bleiben."
);

assert.ok(
    standaloneANodes.length >= 1,
    "a muss im verschachtelten Bruchpfad als weitergereichtes Nenneratom sichtbar bleiben."
);

assert.ok(
    standaloneAlphaNodes.length >= 4,
    "alpha muss im PDF als sichtbares Argument seiner weitergereichten passiven Funktionsschale auftauchen."
);

console.log("Strukturierte inverse Huellen bleiben offen, passive innere sin(alpha)-Schalen bleiben im PDF als sichtbare Primitive erhalten.");
