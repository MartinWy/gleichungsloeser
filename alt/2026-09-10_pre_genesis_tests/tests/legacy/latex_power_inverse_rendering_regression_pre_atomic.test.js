import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/latexRendering.js";

function extractFirstPicture(latex = "") {
    const source = String(latex || "");
    const start = source.indexOf("\\begin{tikzpicture}");
    const end = source.indexOf("\\end{tikzpicture}");

    if (start < 0 || end < 0 || end <= start) {
        return source;
    }

    return source.slice(start, end);
}

const result = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "B"
});

assert.ok(!result?.fehler, result?.fehler || "GenesisRuntime darf fuer y=a*B^x nach B keinen Fehler liefern.");

const viewModel = buildWorksheetViewModel(result);

const defaultPicture = extractFirstPicture(buildLatexDocument({
    equation: result.eingabe || "y=a*B^x",
    targetVariable: result.targetVariable || "B",
    viewModel,
    showDocumentHeader: false,
    includeDiagnosticPage: false
}));

assert.match(
    defaultPicture,
    /B\^\{\\scriptstyle x\}/,
    "Auch nach dem Teilen durch a muss die sichtbare Potenz weiterhin als B^x gerendert werden."
);
assert.match(
    defaultPicture,
    /\\pFourRootDegree\{x\}\{/,
    "Die inverse Darstellung der Potenzbasis muss standardmaessig als x-te Wurzel erscheinen."
);
assert.doesNotMatch(
    defaultPicture,
    /1\/x/,
    "Im Standardmodus soll die inverse Potenz nicht als Bruch im Exponenten erscheinen."
);

const exponentPicture = extractFirstPicture(buildLatexDocument({
    equation: result.eingabe || "y=a*B^x",
    targetVariable: result.targetVariable || "B",
    viewModel,
    showDocumentHeader: false,
    includeDiagnosticPage: false,
    powerInverseStyle: "fractional-exponent"
}));

assert.match(
    exponentPicture,
    /B\^\{\\scriptstyle x\}/,
    "Auch mit Exponentenbruch-Option muss die unangetastete Potenz B^x korrekt stehen bleiben."
);
assert.match(
    exponentPicture,
    /1\/x/,
    "Wenn die Exponentenbruch-Option aktiv ist, muss die inverse Potenz als 1/x im Exponenten erscheinen."
);

console.log("LaTeX-Potenzdarstellung fuer sichtbare Potenzen und inverse Potenzen erfolgreich geprueft.");

const solveToAResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!solveToAResult?.fehler, solveToAResult?.fehler || "GenesisRuntime darf fuer y=a*B^x nach a keinen Fehler liefern.");

const solveToAViewModel = buildWorksheetViewModel(solveToAResult);
const solveToAPicture = extractFirstPicture(buildLatexDocument({
    equation: solveToAResult.eingabe || "y=a*B^x",
    targetVariable: solveToAResult.targetVariable || "a",
    viewModel: solveToAViewModel,
    showDocumentHeader: false,
    includeDiagnosticPage: false
}));

assert.match(
    solveToAPicture,
    /\\pFourFraction\{[^}]+\}.*\{\\pFourCell\{1\.92\}\{B\^\{\\scriptstyle x\}\}\}/s,
    "Beim Aufloesen nach a muss B^x als ganzer Nenner im Bruch erscheinen."
);
assert.equal(
    (solveToAPicture.match(/B\^\{\\scriptstyle x\}/g) || []).length,
    2,
    "B^x darf nach dem Teilen durch B^x nicht doppelt gerendert werden."
);

console.log("LaTeX-Potenzdarstellung in Nennern erfolgreich geprueft.");
