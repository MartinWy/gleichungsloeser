import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function extractFirstPage(latex = "") {
    return String(latex || "").split("\\newpage")[0] || "";
}

function extractNodeLatex(firstPage = "") {
    return [...firstPage.matchAll(/\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => match[3]);
}

const result = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!result?.fehler, result?.fehler || "Der Exponentialfall nach x darf nicht fehlschlagen.");

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

assert.match(
    firstPage,
    /\\log_\{B\}/,
    "Der Exponentenabbau muss den Logarithmuskopf als Basis-Logarithmus mit Tiefstellung exportieren."
);

assert.ok(
    extractNodeLatex(firstPage).every((latex) => !latex.includes("\\pFourBottomAlign")),
    "Nach dem Wechsel auf log_B(...) darf kein aeusserer Logarithmusbruch mit Bottom-Align-Huelle mehr als Formelknoten entstehen."
);

assert.ok(
    !firstPage.includes("\\pFourCell{1.62}{log}\\pFourCell{0.38}{(}\\pFourCell{1.02}{B}\\pFourCell{0.38}{)}"),
    "Die alte Nennerdarstellung log(B) darf nach dem Exponentenabbau nicht mehr separat ausgegeben werden."
);

assert.equal(
    extractNodeLatex(firstPage)
        .filter((latex) => latex.includes("\\pFourFraction{")).length,
    0,
    "Sichtbare Bruchschritte fuer y=a*B^x duerfen nicht als gebuendelte Gesamt-Shells exportiert werden."
);

assert.equal(
    extractNodeLatex(firstPage).filter((latex) => latex.includes("\\vcenter{\\hrule")).length,
    2,
    "Zwischenbruch und Schlussbruch muessen als eigene Bruchstrich-Knoten sichtbar bleiben."
);

console.log("LaTeX-Logarithmusbasis fuer den Exponentenabbau erfolgreich geprueft.");
