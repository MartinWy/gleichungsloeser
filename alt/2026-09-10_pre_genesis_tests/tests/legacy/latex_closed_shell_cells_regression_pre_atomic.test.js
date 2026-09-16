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
    targetVariable: "alpha"
});

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach alpha darf nicht fehlschlagen.");

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

const nodes = extractNodes(firstPage);
const standaloneAsinNameNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{\\operatorname\{asin\}\}$/.test(node.latex));
const standaloneAsinDelimiterNodes = nodes.filter((node) => (
    node.y > 15
    && (node.latex.includes("\\left(") || node.latex.includes("\\right)"))
));
const wholePassiveSinNodes = nodes.filter((node) => node.latex.includes("\\sin\\left(\\beta\\right)"));
const standalonePassiveSinNameNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{\\sin\}$/.test(node.latex));
const wholeAsinNode = nodes.find((node) => node.latex.includes("\\operatorname{asin}\\left(") && node.latex.includes("\\pFourFraction{"));
const structuredFractionLineNodes = nodes.filter((node) => node.latex.includes("\\hrule width"));
const finalStructuredFractionLineNodes = structuredFractionLineNodes.filter((node) => node.y > 15);
const standaloneBetaNodes = nodes.filter((node) => /^\\pFourCell\{[^}]+\}\{\\beta\}$/.test(node.latex));

assert.equal(
    wholePassiveSinNodes.length,
    0,
    "Passive sin(beta)-Schalen duerfen im PDF nicht mehr als zusammengesetzte Gesamtzelle auftauchen, sondern nur noch ueber ihre Primitive."
);

assert.ok(
    standalonePassiveSinNameNodes.length >= 4,
    "Die passive sin(beta)-Schale muss im PDF stattdessen mehrfach ueber sichtbare sin-Primitive belegt bleiben."
);

assert.ok(
    standaloneBetaNodes.length >= 4,
    "Auch beta muss im PDF als sichtbares Argument seiner weitergereichten Funktionsschale auftauchen."
);

assert.equal(
    wholeAsinNode,
    undefined,
    "Eine aeussere Funktionsschale um einen strukturierten Bruchkern darf nicht als ein einziger Gesamtblock zentriert werden."
);

assert.ok(
    standaloneAsinNameNodes.length >= 1,
    "Eine strukturierte asin(...)-Schale muss ihren Funktionsnamen separat an der Shellkante setzen koennen."
);

assert.ok(
    standaloneAsinDelimiterNodes.length >= 2,
    "Eine strukturierte asin(...)-Schale muss ihre Klammern separat um den Bruchkern legen koennen."
);

assert.ok(
    structuredFractionLineNodes.length >= 6,
    "Der verschachtelte Bruchkern fuer a/(b/sin(beta)) muss ueber die letzten Schritte hinweg als explizite Bruchgeometrie sichtbar bleiben."
);

assert.ok(
    finalStructuredFractionLineNodes.length >= 2,
    "In der Finalzeile muessen fuer den verschachtelten Kern zwei explizite Bruchlinien sichtbar bleiben."
);

assert.ok(
    Math.abs(finalStructuredFractionLineNodes.at(-1).x - finalStructuredFractionLineNodes.at(-2).x) < 0.001,
    "Die expliziten Bruchlinien des verschachtelten Kerns muessen in der Finalzeile dieselbe X-Achse teilen."
);

console.log("Passive sin(beta)-Schalen bleiben im PDF als sichtbare Primitive erhalten, strukturierte asin(...)-Huellen bleiben offen.");
