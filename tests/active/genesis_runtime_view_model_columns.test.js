import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const result = await GenesisCore.solve("a^2+b^2-2ab*cos(gamma)=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "gamma"
});

assert.ok(!result?.fehler, result?.fehler || "GenesisRuntime darf fuer den Cosinussatz keinen Fehler liefern.");

const viewModel = buildWorksheetViewModel(result);

assert.equal(
    viewModel.steps.length,
    result.exportData.outputContract.projectionRows.length,
    "Das Worksheet-ViewModel muss jede P4-Projektionszeile genau einmal uebernehmen und darf keine fuenfte Fachzeile erfinden."
);
result.exportData.outputContract.projectionRows.forEach((projectionRow, rowIndex) => {
    assert.deepEqual(
        viewModel.steps[rowIndex].cells.map((cell) => cell.id).sort(),
        projectionRow.projectionAtoms
            .filter((atom) => atom.isVisible !== false)
            .map((atom) => atom.projectionAtomId)
            .sort(),
        `Worksheet-Schritt ${rowIndex} muss genau die von P4 sichtbar gelieferten Projektionszellen enthalten.`
    );
});

const startStep = viewModel.steps[0];
const secondStep = viewModel.steps[1];

const startPowerBaseA = startStep.cells.find((cell) => (
    cell.text === "a"
    && cell.sourceShellId?.startsWith("shell-power-")
));
assert.ok(startPowerBaseA, "Die Startzeile muss die Potenzbasis a in ihrer linken Ursprungsspalte tragen.");
assert.equal(
    startPowerBaseA.sourceShellId?.startsWith("shell-power-"),
    true,
    "Die Potenzbasis a muss ihre Ursprungsschale aus der nativen Projektion in das Worksheet-ViewModel mitnehmen."
);
assert.equal(
    startPowerBaseA.renderNode?.sourceShellId,
    startPowerBaseA.sourceShellId,
    "Die Potenzbasis a muss dieselbe Ursprungsschale auch im Renderknoten behalten."
);
assert.equal(
    startPowerBaseA.renderNode?.shellType,
    "POWER",
    "Die Potenzbasis a muss fuer Farbe und Darstellung weiterhin als Teil einer Potenz kenntlich bleiben."
);

const startProjectionB = result.exportData.outputContract.projectionRows[0].projectionAtoms.find((atom) => (
    atom.value === "b"
    && atom.collectionRole === "factors"
));
assert.ok(startProjectionB, "P4 muss das passive b im unveraenderten Faktor 2ab atomar liefern.");
const startB = startStep.cells.find((cell) => cell.sourceAtomId === startProjectionB.sourceNodeId);
assert.ok(startB, "Die Startzeile muss genau das von P4 gelieferte Faktor-b tragen.");
assert.equal(
    startB.col,
    startProjectionB.col,
    "Das Worksheet-ViewModel muss die von P4 gesetzte Spalte unveraendert uebernehmen."
);

const secondStepSameB = secondStep.cells.find((cell) => cell.sourceAtomId === startB.sourceAtomId && cell.rowKind === "axis");
assert.ok(secondStepSameB, "Die Folgezeile muss dasselbe b weiterhin sichtbar tragen.");
assert.equal(secondStepSameB.col, startB.col, "Unveraenderte linke Atome duerfen ihre Spalte nicht verlieren.");

const startGamma = startStep.cells.find((cell) => cell.text === "gamma" && cell.rowKind === "axis");
assert.ok(startGamma, "Die Startzeile muss gamma sichtbar tragen.");

const secondGamma = secondStep.cells.find((cell) => cell.sourceAtomId === startGamma.sourceAtomId && cell.rowKind === "axis");
assert.ok(secondGamma, "Die Folgezeile muss gamma weiterhin sichtbar tragen.");
assert.equal(secondGamma.col, startGamma.col, "Auch gamma muss in derselben Spalte stehen bleiben.");

const startAnchor = startStep.cells.find((cell) => cell.text === "=" && cell.rowKind === "axis");
const secondAnchor = secondStep.cells.find((cell) => cell.text === "=" && cell.rowKind === "axis");

assert.ok(startAnchor && secondAnchor, "Beide Zeilen muessen den Gleichungsanker tragen.");
assert.equal(secondAnchor.col, startAnchor.col, "Der Gleichungsanker muss spaltenstabil bleiben.");

const powerReleaseResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!powerReleaseResult?.fehler, powerReleaseResult?.fehler || "GenesisRuntime darf fuer y=a*B^x nach x keinen Fehler liefern.");

const powerReleaseViewModel = buildWorksheetViewModel(powerReleaseResult);
const powerStartStep = powerReleaseViewModel.steps[0];
const powerFollowStep = powerReleaseViewModel.steps[1];
const powerFinalStep = powerReleaseViewModel.steps[2];
const releasedExponent = powerStartStep.cells.find((cell) => cell.projectionRole === "power_exponent" && cell.text === "x");
const carriedExponent = powerFollowStep.cells.find((cell) => cell.projectionRole === "power_exponent" && cell.text === "x");
const finalReleasedX = powerFinalStep.cells.find((cell) => cell.text === "x" && cell.rowKind === "axis");

assert.ok(releasedExponent, "Die Startzeile muss den Exponenten x als eigene Slot-Spur tragen.");
assert.ok(carriedExponent, "Auch die Folgezeile muss den weitergereichten Exponenten x als eigene Slot-Spur tragen.");
assert.equal(
    releasedExponent.isTarget,
    true,
    "Ein Exponentenslot, der genau die Zielvariable repraesentiert, muss schon vor dem Freilegen als Zielspur markiert sein."
);
assert.equal(
    carriedExponent.isTarget,
    true,
    "Auch in weitergereichten Potenzzeilen muss derselbe Exponentenslot als Zielspur erkennbar bleiben."
);
assert.equal(
    powerStartStep.cells.filter((cell) => cell.projectionRole === "power").length,
    0,
    "Die native Runtime-Ansicht darf Potenzen nicht doppelt als Container plus Exponent sichtbar machen."
);
assert.equal(
    powerFollowStep.cells.filter((cell) => cell.projectionRole === "power").length,
    0,
    "Auch nach dem Teilen durch a darf die Potenz nicht als zweite sichtbare Container-Zelle stehen bleiben."
);
assert.equal(
    powerFinalStep.cells.filter((cell) => cell.projectionRole === "function").length,
    0,
    "Die freigelegte Logarithmuszeile darf keinen zusaetzlichen Funktionscontainer neben Name und Klammern zeigen."
);
assert.ok(
    powerFinalStep.cells.some((cell) => cell.projectionRole === "function_name" && cell.text === "log"),
    "Die freigelegte Logarithmuszeile muss den Funktionsnamen explizit sichtbar halten."
);
assert.ok(
    powerFinalStep.cells.some((cell) => cell.projectionRole === "function_left" && cell.text === "("),
    "Die freigelegte Logarithmuszeile muss die linke Klammer explizit sichtbar halten."
);
assert.ok(
    powerFinalStep.cells.some((cell) => cell.projectionRole === "function_right" && cell.text === ")"),
    "Die freigelegte Logarithmuszeile muss die rechte Klammer explizit sichtbar halten."
);
assert.ok(finalReleasedX, "Die Zielvariable x muss in der Schlusszeile sichtbar bleiben.");
assert.equal(
    finalReleasedX.col,
    releasedExponent.col,
    "Nach dem Freilegen aus der Potenz soll x seine Exponenten-Spalte behalten."
);

const complexExponentResult = await GenesisCore.solve("y=a*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!complexExponentResult?.fehler, complexExponentResult?.fehler || "GenesisRuntime darf auch fuer komplexe Exponenten nach x keinen Fehler liefern.");

const complexExponentViewModel = buildWorksheetViewModel(complexExponentResult);
assert.equal(complexExponentViewModel.steps.length, 5, "Der komplexe Exponent braucht Faktorabbau, Log-Schritt, +1 und Division durch 2.");

const complexLogStep = complexExponentViewModel.steps[2];
const complexAdditionStep = complexExponentViewModel.steps[3];
const complexFractionStep = complexExponentViewModel.steps[4];
const complexReleasedX = complexAdditionStep.cells.find((cell) => cell.text === "x" && cell.rowKind === "axis");
const complexLogName = complexAdditionStep.cells.find((cell) => (
    cell.projectionRole === "function_name"
    && cell.text === "log"
));
const complexFunctionRight = complexAdditionStep.cells.find((cell) => cell.projectionRole === "function_right" && cell.text === ")");
const complexAddedOne = complexAdditionStep.cells.find((cell) => (
    cell.text === "1"
    && cell.rowKind === "axis"
    && cell.sourceShellNodeType === "ADDITION"
));
const complexAddedPlus = complexAdditionStep.cells.find((cell) => (
    cell.text === "+"
    && cell.rowKind === "axis"
    && cell.projectionRole === "inverse_operator"
));
const complexInnerDenominator = complexAdditionStep.cells.find((cell) => (
    cell.text === "a"
    && cell.rowKind === "below_axis"
));
const complexOuterFractionOne = complexFractionStep.cells.find((cell) => (
    cell.text === "1"
    && cell.rowKind === "above_axis"
    && cell.sourceShellNodeType === "ADDITION"
));
const complexOuterFractionPlus = complexFractionStep.cells.find((cell) => (
    cell.text === "+"
    && cell.rowKind === "above_axis"
    && cell.projectionRole === "inverse_operator"
));
const complexOuterLogName = complexFractionStep.cells.find((cell) => (
    cell.projectionRole === "function_name"
    && cell.text === "log"
    && cell.rowKind === "above_axis"
));
const complexOuterDenominator = complexFractionStep.cells.find((cell) => (
    cell.text === "2"
    && cell.rowKind === "below_axis"
));
const complexOuterFractionLine = complexFractionStep.cells.find((cell) => (
    cell.kind === "fraction_line"
    && cell.rowKind === "axis"
));

assert.ok(
    complexLogStep.cells.some((cell) => cell.projectionRole === "function_name" && cell.text === "log"),
    "Die Logarithmus-Zeile des komplexen Exponenten muss den Funktionsnamen sichtbar tragen."
);
assert.ok(
    complexLogStep.cells.some((cell) => cell.projectionRole === "product_operator" && cell.text === "*"),
    "Explizite Malpunkte muessen im B-Pfad bis zum Renderer als eigene Projektionsspur erhalten bleiben."
);
assert.ok(complexReleasedX, "Nach dem Additionsschritt muss x rechts weiter sichtbar bleiben.");
assert.ok(complexFunctionRight && complexAddedOne && complexAddedPlus && complexLogName && complexInnerDenominator, "Der Additionsschritt braucht Log-Kopf, 1 + und den inneren Nenner.");
assert.ok(
    complexAddedOne.col < complexAddedPlus.col && complexAddedPlus.col < complexLogName.col,
    "Wenn ein Additionsterm von rechts nach links wandert, muss er links vorne andocken: 1 + log_B(y/a)."
);
assert.ok(
    complexInnerDenominator.col > complexLogName.col,
    "Der innere Nenner a des geschlossenen Bruchs muss weiterhin innerhalb der Log-Schale rechts vom Log-Kopf bleiben."
);
assert.ok(complexOuterFractionOne && complexOuterFractionPlus && complexOuterLogName && complexOuterDenominator, "Die Schlusszeile braucht den Zaehlerblock mit 1 + log(...) und die neue Division durch 2.");
assert.ok(
    complexOuterFractionOne.col < complexOuterFractionPlus.col && complexOuterFractionPlus.col < complexOuterLogName.col,
    "Auch im Schlussbruch muss der von rechts kommende Additionsterm links vor dem bestehenden Log-Term stehen bleiben."
);
assert.ok(complexOuterFractionLine, "Die Schlusszeile braucht den aeusseren Bruchstrich als eigene Achsenzelle.");
assert.ok(
    complexOuterDenominator.colStart >= complexOuterFractionLine.colStart
        && complexOuterDenominator.colEnd <= complexOuterFractionLine.colEnd,
    "Wenn die 2 zum Nenner des aeusseren Bruchs wird, muss sie vollstaendig innerhalb der neuen Nenner-Spur liegen."
);

const leftFractionBirthResult = await GenesisCore.solve("A=(g*h)/2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "h"
});
assert.ok(!leftFractionBirthResult?.fehler, leftFractionBirthResult?.fehler || "GenesisRuntime darf fuer A=(g*h)/2 nach h keinen Fehler liefern.");

const leftFractionBirthViewModel = buildWorksheetViewModel(leftFractionBirthResult);
assert.equal(
    leftFractionBirthViewModel.steps.length,
    leftFractionBirthResult.exportData.outputContract.projectionRows.length,
    "Auch die getrennten Schritte fraction_collapse, group_release und fraction_birth muessen eins zu eins aus P4 uebernommen werden."
);

const leftFractionStartStep = leftFractionBirthViewModel.steps[0];
const leftFractionMiddleStep = leftFractionBirthViewModel.steps[1];
const leftFractionFinalStep = leftFractionBirthViewModel.steps.at(-1);
const leftFractionStartA = leftFractionStartStep.cells.find((cell) => cell.text === "A" && cell.rowKind === "axis");
const leftFractionMiddleA = leftFractionMiddleStep.cells.find((cell) => cell.text === "A" && cell.rowKind === "axis");
const leftFractionFinalA = leftFractionFinalStep.cells.find((cell) => cell.text === "A" && cell.rowKind === "above_axis");
const leftFractionMiddleTwo = leftFractionMiddleStep.cells.find((cell) => cell.text === "2" && cell.rowKind === "axis");
const leftFractionFinalTwo = leftFractionFinalStep.cells.find((cell) => cell.text === "2" && cell.rowKind === "above_axis");
const leftFractionStartAnchor = leftFractionStartStep.cells.find((cell) => cell.text === "=" && cell.rowKind === "axis");
const leftFractionFinalAnchor = leftFractionFinalStep.cells.find((cell) => cell.text === "=" && cell.rowKind === "axis");
const leftFractionFinalLine = leftFractionFinalStep.cells.find((cell) => cell.kind === "fraction_line");

assert.ok(leftFractionStartA && leftFractionMiddleA && leftFractionFinalA, "Die linke Spur muss A in allen Schritten sichtbar halten.");
assert.equal(
    leftFractionMiddleA.col,
    leftFractionStartA.col,
    "A darf beim Zusammenziehen des rechten Bruchs zur linken Multiplikation seine Spalte nicht verlieren."
);
assert.equal(
    leftFractionFinalA.col,
    leftFractionMiddleA.col,
    "Auch beim anschliessenden Bruchaufbau links muss A exakt auf derselben Spalte bleiben."
);
assert.ok(leftFractionMiddleTwo && leftFractionFinalTwo, "Der uebernommene Faktor 2 muss vor und nach der Bruchgeburt sichtbar bleiben.");
assert.equal(
    leftFractionFinalTwo.col,
    leftFractionMiddleTwo.col,
    "Der eingefuehrte Faktor 2 muss auch innerhalb des neuen Zaehlers dieselbe Spalte behalten."
);
assert.ok(leftFractionStartAnchor && leftFractionFinalAnchor, "Der Gleichheitsanker muss im linken Bruchaufbau sichtbar bleiben.");
assert.equal(
    leftFractionFinalAnchor.col,
    leftFractionStartAnchor.col,
    "Auch beim linken Bruchaufbau darf der Gleichheitsanker horizontal nicht driften."
);
assert.ok(leftFractionFinalLine, "Die Schlusszeile muss den Bruchstrich als eigene Shell-Spur tragen.");
assert.ok(
    leftFractionFinalLine.colStart <= leftFractionFinalTwo.col && leftFractionFinalLine.colEnd >= leftFractionFinalA.col,
    "Der Bruchstrich darf ueber den Zaehler spannen, ohne die stabilen Atomspalten neu zu definieren."
);

const rootTargetResult = await GenesisCore.solve("a^2+b^2-2ab*cos(gamma)=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "c"
});
assert.ok(!rootTargetResult?.fehler, rootTargetResult?.fehler || "GenesisRuntime darf fuer den Cosinussatz nach c keinen Fehler liefern.");

const rootTargetViewModel = buildWorksheetViewModel(rootTargetResult);
const rootStartStep = rootTargetViewModel.steps[0];
const rootFollowStep = rootTargetViewModel.steps[1];

assert.ok(
    rootTargetViewModel.steps.every((step) => step.projectionMode === "native_atomic"),
    "Das ViewModel muss den nativen atomaren Zeilenmodus fuer nachfolgende Verbraucher erhalten."
);

assert.equal(
    rootStartStep.cells.filter((cell) => cell.projectionRole === "function").length,
    0,
    "Funktionsschalen duerfen in der nativen Runtime-Ansicht nicht doppelt als Slot-Spuren und Containerzellen sichtbar sein."
);
assert.equal(
    rootStartStep.cells.filter((cell) => cell.projectionRole === "power").length,
    0,
    "Potenzschalen duerfen in der nativen Runtime-Ansicht nicht doppelt als Slot-Spuren und Containerzellen sichtbar sein."
);
assert.equal(
    rootFollowStep.cells.filter((cell) => cell.projectionRole === "root_hook").length,
    1,
    "Die Wurzel muss den von P4 gelieferten Hook als eigene atomare Zelle behalten."
);
assert.equal(
    rootFollowStep.cells.filter((cell) => cell.projectionRole === "root_overbar").length,
    1,
    "Die Wurzel muss den von P4 gelieferten Ueberstrich als eigene atomare Zelle behalten."
);
assert.equal(
    rootFollowStep.cells.filter((cell) => cell.projectionRole === "root").length,
    0,
    "Das ViewModel darf aus Hook und Ueberstrich keine neue gebuendelte Wurzelzelle erzeugen."
);

const pythagorasRootResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});
assert.ok(!pythagorasRootResult?.fehler, pythagorasRootResult?.fehler || "GenesisRuntime darf fuer a^2+b^2=c^2 nach a keinen Fehler liefern.");

const pythagorasRootViewModel = buildWorksheetViewModel(pythagorasRootResult);
const pythagorasRootStep = pythagorasRootViewModel.steps.at(-1);
const pythagorasRootProjectionRow = pythagorasRootResult.exportData.outputContract.projectionRows.at(-1);
const pythagorasRootHook = pythagorasRootStep.cells.find((cell) => cell.projectionRole === "root_hook");
const pythagorasRootOverbar = pythagorasRootStep.cells.find((cell) => cell.projectionRole === "root_overbar");
const projectedRootHook = pythagorasRootProjectionRow.projectionAtoms.find((atom) => atom.role === "root_hook");
const projectedRootOverbar = pythagorasRootProjectionRow.projectionAtoms.find((atom) => atom.role === "root_overbar");

assert.ok(pythagorasRootHook && pythagorasRootOverbar, "Die Schlusszeile nach a muss beide atomaren Wurzelprimitive tragen.");
assert.deepEqual(
    [pythagorasRootHook.colStart, pythagorasRootHook.colEnd],
    [projectedRootHook.colStart, projectedRootHook.colEnd],
    "Der Wurzelhaken muss seine P4-Spalte unveraendert behalten."
);
assert.deepEqual(
    [pythagorasRootOverbar.colStart, pythagorasRootOverbar.colEnd],
    [projectedRootOverbar.colStart, projectedRootOverbar.colEnd],
    "Der Wurzelueberstrich muss seine P4-Spanne unveraendert behalten."
);
assert.ok(
    pythagorasRootStep.cells.some((cell) => cell.text === "c" && cell.rowKind === "axis"),
    "Der Radikand muss sein sichtbares c als echtes weitergereichtes Atom behalten."
);
assert.ok(
    pythagorasRootStep.cells.some((cell) => cell.text === "b" && cell.rowKind === "axis"),
    "Der Radikand muss sein sichtbares b als echtes weitergereichtes Atom behalten."
);

const nestedShellResult = await GenesisCore.solve("sin(sqrt((x+3)/(2+1)))=5", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!nestedShellResult?.fehler, nestedShellResult?.fehler || "GenesisRuntime darf fuer die verschachtelte sin-sqrt-Gleichung keinen Fehler liefern.");

const nestedShellViewModel = buildWorksheetViewModel(nestedShellResult);
const nestedStartStep = nestedShellViewModel.steps[0];

assert.equal(
    nestedStartStep.cells.filter((cell) => cell.projectionRole === "function").length,
    0,
    "Auch verschachtelte Funktionen duerfen nicht doppelt als Container neben ihren expliziten Slots erscheinen."
);
assert.equal(
    nestedStartStep.cells.filter((cell) => cell.projectionRole === "group").length,
    0,
    "Auch verschachtelte Gruppen duerfen nicht doppelt als Container neben ihren Klammer-Slots erscheinen."
);
assert.equal(
    nestedStartStep.cells.filter((cell) => cell.projectionRole === "root_hook").length,
    1,
    "Auch in verschachtelten Ausdruecken muss der P4-Wurzelhaken atomar erhalten bleiben."
);
assert.equal(
    nestedStartStep.cells.filter((cell) => cell.projectionRole === "root_overbar").length,
    1,
    "Auch in verschachtelten Ausdruecken muss der P4-Wurzelueberstrich atomar erhalten bleiben."
);
assert.equal(
    nestedStartStep.cells.filter((cell) => cell.projectionRole === "root").length,
    0,
    "Das ViewModel darf auch verschachtelte Wurzelprimitive nicht zu einer Ersatz-Root-Zelle buendeln."
);

console.log("GenesisRuntime-ViewModel-Spaltentreue erfolgreich geprueft.");
