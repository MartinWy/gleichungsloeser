import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/latexRendering.js";
import { resolveElementColorForCell } from "../../presentation/shell_colors/index.js";
import {
    buildCanonicalCockpitSolveResult,
    buildCockpitWorksheetViewModel,
    deriveColorTargets,
    deriveRowTargets,
    filterViewModelSteps,
    sanitizeHiddenStepIndexes
} from "../../scripts/cockpit_server.mjs";

const visibleExponentResult = await GenesisCore.solve("2-a=e^(2*x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!visibleExponentResult?.fehler, visibleExponentResult?.fehler || "Der Cockpit-POWER-Beweis braucht einen gueltigen Solve-Lauf.");

const canonicalExponentResult = buildCanonicalCockpitSolveResult(
    visibleExponentResult,
    "2-a=e^(2*x-1)",
    "x"
);
const visibleExponentViewModel = buildCockpitWorksheetViewModel(canonicalExponentResult);
const visibleExponentCells = (visibleExponentViewModel.steps[0]?.cells || [])
    .filter((cell) => cell.row < 1)
    .sort((left, right) => left.col - right.col);
const boundaryPowerSpan = canonicalExponentResult.exportData.projectionRows[0]?.shellSpans.find(
    (shellSpan) => shellSpan.shellType === "POWER"
);

assert.deepEqual(
    visibleExponentCells.map((cell) => cell.text),
    ["2", "*", "x", "-", "1"],
    "Das Cockpit muss alle inneren P4-Zellen des geschlossenen Boundary-Exponenten atomar uebernehmen."
);
assert.ok(boundaryPowerSpan, "Die gemeinsame aeussere Boundary-Spur muss als POWER-Schale erhalten bleiben.");
assert.ok(
    visibleExponentCells.every((cell) => (
        cell.colStart >= boundaryPowerSpan.collectionRanges.exponentNodes.colStart
        && cell.colEnd <= boundaryPowerSpan.collectionRanges.exponentNodes.colEnd
    )),
    "Die atomaren Exponentenzellen muessen innerhalb des einen aeusseren POWER-Bandes liegen."
);
assert.equal(
    canonicalExponentResult?.bridgeMeta?.enabled,
    true,
    "Bei power_exponent_release muss das Cockpit die vertragliche A1-B-A2-Pipeline verwenden."
);

const cockpitLandingAnchor = visibleExponentViewModel.steps[1]?.cells.find((cell) => cell.text === "=");
const cockpitLandingTermCells = (visibleExponentViewModel.steps[1]?.cells || [])
    .filter((cell) => Number.isInteger(cockpitLandingAnchor?.col) && cell.col > cockpitLandingAnchor.col)
    .sort((left, right) => left.col - right.col);

assert.deepEqual(
    cockpitLandingTermCells.map((cell) => cell.text),
    ["2", "*", "x", "-", "1"],
    "Das Cockpit muss den von B heruntergeholten Exponenten vollstaendig anzeigen."
);
assert.deepEqual(
    cockpitLandingTermCells.map((cell) => cell.col),
    [
        cockpitLandingAnchor.col + 2,
        cockpitLandingAnchor.col + 3,
        cockpitLandingAnchor.col + 4,
        cockpitLandingAnchor.col + 5,
        cockpitLandingAnchor.col + 6
    ],
    "Das Cockpit darf die alten POWER-Spalten nicht als Luecke in der Landing-Zeile fortsetzen."
);

const result = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!result?.fehler, result?.fehler || "Der Cockpit-Server-Test braucht einen gueltigen Solve-Lauf.");

const viewModel = buildWorksheetViewModel(result);
const hiddenStepIndexes = sanitizeHiddenStepIndexes([1, 1, -1, 99], viewModel.steps.length);

assert.deepEqual(hiddenStepIndexes, [1], "Versteckte Zeilen muessen dedupliziert und auf gueltige Schrittindizes begrenzt werden.");

const rowTargets = deriveRowTargets(viewModel, hiddenStepIndexes, result?.exportData?.outputContract?.theoryRows || []);
assert.equal(rowTargets.length, viewModel.steps.length, "Jede ViewModel-Zeile muss im Cockpit als eigene Zeile steuerbar sein.");
assert.equal(rowTargets[1].label, "Zeile 2");
assert.equal(rowTargets[1].hidden, true, "Die ausgeblendete Zeile muss im Cockpit-Target als verborgen markiert bleiben.");
assert.deepEqual(
    rowTargets[0].atoms,
    ["a^2+b^2", "=", "c^2"],
    "Die Zeilensteuerung soll jede kanonische Ausdruckswurzel als lesbare Diagnosebeschriftung exportieren."
);

const powerInverseResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "B"
});
assert.ok(!powerInverseResult?.fehler, powerInverseResult?.fehler || "Der Cockpit-Server-Test braucht auch die Potenzbasis-Freilegung.");

const powerInverseViewModel = buildWorksheetViewModel(powerInverseResult);
const rootRowTargets = deriveRowTargets(
    powerInverseViewModel,
    [],
    powerInverseResult?.exportData?.outputContract?.theoryRows || [],
    {
        powerInverseStyle: "root"
    }
);
const fractionalRowTargets = deriveRowTargets(
    powerInverseViewModel,
    [],
    powerInverseResult?.exportData?.outputContract?.theoryRows || [],
    {
        powerInverseStyle: "fractional-exponent"
    }
);

assert.deepEqual(
    rootRowTargets[2].atoms,
    ["sqrt[x]((y) / (a))", "=", "B"],
    "Im Standardmodus muss das Cockpit die inverse Potenz als x-te Wurzel beschriften."
);
assert.deepEqual(
    fractionalRowTargets[2].atoms,
    ["((y) / (a))^(1/x)", "=", "B"],
    "Mit Exponentenbruch-Option muss das Cockpit dieselbe Zeile auch textlich als 1/x-Exponent ausweisen."
);

const filteredViewModel = filterViewModelSteps(viewModel, hiddenStepIndexes);
assert.equal(filteredViewModel.steps.length, viewModel.steps.length, "Ausgeblendete Cockpit-Zeilen muessen in der Render-ViewModel-Folge erhalten bleiben.");
assert.equal(filteredViewModel.steps[1].hidden, true, "Die ausgeblendete Zeile muss im Render-ViewModel als verborgen markiert sein.");
assert.equal(
    filteredViewModel.layout.rows.some((row) => row.stepIndex === 1 && row.hidden === true),
    true,
    "Auch die Layoutzeilen der ausgeblendeten Zeile muessen ihre Platzhalterrolle behalten."
);

const colorTargets = deriveColorTargets(result, filteredViewModel, hiddenStepIndexes);
const targetVariableColorTarget = colorTargets.find((target) => target.previewLabel === "Ziel");
const targetVariableAtomId = result.exportData.outputContract.theoryRows[0].left[0].terms[0].content[0].id;
const targetColorRuleSpec = (targetVariableColorTarget?.selectors || [])
    .map((selector) => `${selector.selectorType}:${selector.selectorValue}=#D97706`)
    .join(";");

assert.ok(targetVariableColorTarget, "Die Zielvariable muss im Cockpit als eigener Farb-Target auftauchen.");
assert.equal(targetVariableColorTarget.stepLabel, "", "Die Zielvariable braucht im Cockpit keine redundante Schrittbeschriftung.");
assert.ok(
    targetVariableColorTarget.selectors.some((selector) => selector.selectorType === "atom" && selector.selectorValue === targetVariableAtomId),
    "Die Ziel-Faerbung muss immer direkt am Zielatom selbst haengen."
);
assert.ok(
    !targetVariableColorTarget.selectors.some((selector) => selector.selectorType === "shell-id"),
    "Der Ziel-Schalter darf keine Umformungsschalen wie Potenz oder Wurzel mitfaerben."
);
assert.ok(
    !colorTargets.some((target) => target.stepIndex === 1),
    "Ausgeblendete Cockpit-Zeilen duerfen keine eigenen Farbtargets mehr liefern."
);

const coloredTargetLatex = buildLatexDocument({
    equation: result.eingabe || "a^2+b^2=c^2",
    targetVariable: result.targetVariable || "a",
    viewModel,
    includeDiagnosticPage: false,
    showDocumentHeader: false,
    shellColors: true,
    shellColorPolicy: {
        fallback: "none",
        ruleSpec: targetColorRuleSpec
    }
});

assert.match(
    coloredTargetLatex,
    /\\textcolor\{[^}]+\}\{a\}/,
    "Die Ziel-Faerbung muss im LaTeX-Export direkt die Zielvariable selbst markieren."
);
assert.doesNotMatch(
    coloredTargetLatex,
    /\\textcolor\{[^}]+\}\{\\scriptstyle 2\}/,
    "Der Ziel-Schalter darf keine Potenzschalen oder Exponenten mitfaerben."
);

const hiddenStepLatex = buildLatexDocument({
    equation: result.eingabe || "a^2+b^2=c^2",
    targetVariable: result.targetVariable || "a",
    viewModel: filteredViewModel,
    includeDiagnosticPage: false,
    showDocumentHeader: false
});

assert.ok(
    hiddenStepLatex.includes("\\begin{scope}[opacity=0]"),
    "Ausgeblendete Cockpit-Zeilen muessen im LaTeX nur unsichtbar werden, statt aus dem Layout zu verschwinden."
);

const nestedTargetResult = await GenesisCore.solve("sin(sqrt(x))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!nestedTargetResult?.fehler, nestedTargetResult?.fehler || "Der Cockpit-Server-Test braucht auch den verschachtelten Ziel-Fall.");

const nestedTargetViewModel = buildWorksheetViewModel(nestedTargetResult);
const nestedTargetColorTarget = deriveColorTargets(nestedTargetResult, nestedTargetViewModel, [])
    .find((target) => target.previewLabel === "Ziel");
const nestedTargetRuleSpec = (nestedTargetColorTarget?.selectors || [])
    .map((selector) => `${selector.selectorType}:${selector.selectorValue}=#B91C1C`)
    .join(";");
const nestedTargetLatex = buildLatexDocument({
    equation: nestedTargetResult.eingabe || "sin(sqrt(x))=3",
    targetVariable: nestedTargetResult.targetVariable || "x",
    viewModel: nestedTargetViewModel,
    includeDiagnosticPage: false,
    showDocumentHeader: false,
    shellColors: true,
    shellColorPolicy: {
        fallback: "none",
        ruleSpec: nestedTargetRuleSpec
    }
});

assert.ok(nestedTargetColorTarget, "Auch verschachtelte Zielvariablen brauchen einen eigenen Ziel-Schalter.");
assert.ok(
    (nestedTargetColorTarget.selectors || []).every((selector) => selector.selectorType === "atom"),
    "Bei verschachtelten Zielvariablen darf der Ziel-Schalter nur das Zielatom selbst markieren."
);
assert.match(
    nestedTargetLatex,
    /\\textcolor\{[^}]+\}\{x\}/,
    "Auch in verschachtelten Faellen muss die Ziel-Faerbung direkt an x haengen."
);
assert.doesNotMatch(
    nestedTargetLatex,
    /\\textcolor\{[^}]+\}\{\\operatorname\{asin\}\}/,
    "Der Ziel-Schalter darf inverse Funktionen nicht als Ziel-Ersatz einfaerben."
);
assert.doesNotMatch(
    nestedTargetLatex,
    /\\textcolor\{[^}]+\}\{\\scriptstyle 2\}/,
    "Der Ziel-Schalter darf auch bei verschachtelten Faellen keine Potenzhuellen mitfaerben."
);

const exponentTargetResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!exponentTargetResult?.fehler, exponentTargetResult?.fehler || "Der Cockpit-Server-Test braucht auch den Exponenten-Zielfall.");

const exponentTargetViewModel = buildWorksheetViewModel(exponentTargetResult);
const exponentTargetColorTarget = deriveColorTargets(exponentTargetResult, exponentTargetViewModel, [])
    .find((target) => target.previewLabel === "Ziel");
const exponentTargetRuleSpec = (exponentTargetColorTarget?.selectors || [])
    .map((selector) => `${selector.selectorType}:${selector.selectorValue}=#2563EB`)
    .join(";");
const exponentTargetPolicy = {
    fallback: "none",
    ruleSpec: exponentTargetRuleSpec
};
const exponentStartCell = exponentTargetViewModel.steps[0]?.cells
    .find((cell) => cell.projectionRole === "power_exponent" && cell.text === "x");
const exponentFollowCell = exponentTargetViewModel.steps[1]?.cells
    .find((cell) => cell.projectionRole === "power_exponent" && cell.text === "x");
const exponentBaseCell = exponentTargetViewModel.steps[0]?.cells
    .find((cell) => cell.text === "B" && cell.sourceShellId === exponentStartCell?.sourceShellId);

assert.ok(exponentTargetColorTarget, "Auch ein Ziel im Potenzexponenten braucht einen eigenen Cockpit-Zielschalter.");
assert.ok(exponentStartCell?.isTarget, "Die erste Exponentenspur muss als Ziel markiert sein.");
assert.ok(exponentFollowCell?.isTarget, "Auch die weitergereichte Exponentenspur muss als Ziel markiert sein.");
assert.ok(
    (exponentTargetColorTarget.selectors || []).some(
        (selector) => selector.selectorType === "atom" && selector.selectorValue === exponentStartCell?.sourceAtomId
    ),
    "Der Zielschalter muss die echte atomare Zielvariable im Exponenten adressieren."
);
assert.deepEqual(
    exponentStartCell?.representedSourceAtomIds,
    [exponentStartCell?.sourceAtomId],
    "Eine atomare Exponentenzelle darf keinen separaten Potenz-Proxy als Zielidentitaet erhalten."
);
assert.equal(
    resolveElementColorForCell(exponentStartCell, exponentTargetPolicy)?.hex,
    "#2563EB",
    "Die erste Exponentenspur muss ueber den Zielschalter direkt einfaerbbar sein."
);
assert.equal(
    resolveElementColorForCell(exponentFollowCell, exponentTargetPolicy)?.hex,
    "#2563EB",
    "Auch die weitergereichte Exponentenspur muss dieselbe Ziel-Farbe bekommen."
);
assert.equal(
    resolveElementColorForCell(exponentBaseCell, exponentTargetPolicy),
    null,
    "Die Potenzbasis darf vom Zielschalter des Exponenten nicht mitgefaerbt werden."
);

console.log("Cockpit-Server-Steuerung erfolgreich geprueft.");
