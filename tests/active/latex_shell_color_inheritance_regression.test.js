import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function extractFirstPage(latex = "") {
    return String(latex || "").split("\\newpage")[0] || "";
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
const firstPowerShellId = viewModel.steps[0]?.cells.find((cell) => cell.text === "2" && cell.projectionRole === "power_exponent")?.sourceShellId;

assert.ok(firstPowerShellId, "Die Startzeile muss die erste Potenzschale explizit im ViewModel tragen.");

const firstPage = extractFirstPage(buildLatexDocument({
    equation: result.eingabe,
    targetVariable: result.targetVariable,
    viewModel,
    profile: "standard",
    profileLabel: "standard",
    shellColors: true,
    shellColorPolicy: {
        fallback: "none",
        ruleSpec: `shell-id:${firstPowerShellId}=#2563EB`
    }
}));

assert.match(
    firstPage,
    /\\textcolor\{[^}]+\}\{2\}/,
    "Wenn eine Potenzschale gefaerbt wird, muss ihre atomare Exponentenzelle dieselbe Schalenfarbe erhalten."
);

assert.match(
    firstPage,
    /\\textcolor\{[^}]+\}\{a\}/,
    "Eine explizite shell-id-Regel muss auch die zur selben Potenzschale gehoerende Basiszelle faerben."
);

console.log("LaTeX-Schalenfarben fuer Potenzhuellen erfolgreich geprueft.");
