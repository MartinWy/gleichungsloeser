import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { normalizeSolveOptions } from "../../core/solveOptions.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const result = await GenesisCore.solve(
    "a/sin(alpha)=b/sin(beta)",
    normalizeSolveOptions({
        targetVariable: "alpha",
        runtimeEngine: "genesis_runtime"
    })
);

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach alpha darf nicht fehlschlagen.");

const projectionRows = result?.exportData?.outputContract?.projectionRows || [];
const startRowShells = projectionRows[0]?.shellSpans || [];
const finalRowShells = projectionRows.at(-1)?.shellSpans || [];
const viewModel = buildWorksheetViewModel(result);
const startStep = viewModel.steps[0];
const finalStep = viewModel.steps.at(-1);

const startRightSinShell = startRowShells.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "right"
    && shellSpan?.parentShellId
));
const finalOuterInverseShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === null
));
const finalOuterFractionShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "DIVISION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === finalOuterInverseShell?.shellId
));
const finalInnerFractionShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "DIVISION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === finalOuterFractionShell?.shellId
));

assert.ok(startRightSinShell, "Die geschlossene rechte sin(beta)-Schale muss im Startschritt als ShellSpan exportiert werden.");
assert.equal(
    startRightSinShell.transportMode,
    "closed_visible_block",
    "Eine geschlossene sichtbare Schale muss ihren Transportmodus explizit exportieren."
);
assert.equal(
    startRightSinShell.alignmentColStart,
    startRightSinShell.colStart,
    "Eine passive geschlossene Funktionsschale muss ihre sichtbare Huelle als Transportband mitnehmen."
);
assert.equal(
    startRightSinShell.alignmentColEnd,
    startRightSinShell.colEnd,
    "Auch die rechte Kante des Transportbands einer passiven Funktionsschale muss zur sichtbaren Huelle gehoeren."
);

assert.ok(finalOuterInverseShell, "Die inverse Funktion asin(...) muss im letzten Schritt als eigene aeussere Shell vorhanden sein.");
assert.ok(finalOuterFractionShell, "Der aeussere Bruch unter asin(...) muss im letzten Schritt als eigene Bruchschale erhalten bleiben.");
assert.ok(finalInnerFractionShell, "Der innere Bruch b/sin(beta) muss im letzten Schritt als eigene innere Bruchschale erhalten bleiben.");
assert.ok(
    Array.isArray(finalInnerFractionShell.contentLeafIds) && finalInnerFractionShell.contentLeafIds.length > 0,
    "Ein geschlossener sichtbarer Block muss auch im Endschritt seine inneren Inhaltsatome weiter ausweisen."
);
assert.ok(
    Array.isArray(finalInnerFractionShell.collectionLeafIds?.denominator)
        && finalInnerFractionShell.collectionLeafIds.denominator.length > 0,
    "Auch die innere Nennerkollektion eines geschlossenen sichtbaren Bruchs muss atomar rueckverfolgbar bleiben."
);

assert.equal(
    finalOuterInverseShell.alignmentColStart,
    finalOuterFractionShell.alignmentColStart,
    "Die inverse Huelle darf ihre Ausrichtungsachse nicht von den Klammern oder vom Funktionsnamen ableiten."
);
assert.equal(
    finalOuterInverseShell.alignmentColEnd,
    finalOuterFractionShell.alignmentColEnd,
    "Auch das rechte Ende des Ausrichtungsbands von asin(...) muss exakt vom inneren Bruch geerbt werden."
);
assert.equal(
    finalOuterFractionShell.alignmentColStart,
    finalInnerFractionShell.alignmentColStart,
    "Ein aeusserer Bruch mit geschlossenem inneren Nennerbruch muss dieselbe vertikale Ausrichtungsachse weiterreichen."
);
assert.equal(
    finalOuterFractionShell.alignmentColEnd,
    finalInnerFractionShell.alignmentColEnd,
    "Die weitergereichte Ausrichtungsachse des verschachtelten Bruchs darf sich nicht verbreitern."
);

const finalA = finalStep?.cells.find((cell) => cell.text === "a" && cell.row === 0);
const finalSinName = finalStep?.cells.find((cell) => cell.text === "sin" && cell.projectionRole === "function_name" && cell.sourceShellId === "shell-function-o-g9dfgr-0002");
const finalBeta = finalStep?.cells.find((cell) => cell.text === "beta" && cell.sourceShellId === "shell-function-o-g9dfgr-0002");
const finalB = finalStep?.cells.find((cell) => cell.text === "b" && cell.row === 2);
const startSinName = startStep?.cells.find((cell) => cell.text === "sin" && cell.projectionRole === "function_name" && cell.sourceShellId === "shell-function-o-g9dfgr-0002");
const startBeta = startStep?.cells.find((cell) => cell.text === "beta" && cell.sourceShellId === "shell-function-o-g9dfgr-0002");
const startLeftA = startStep?.cells.find((cell) => cell.text === "a" && cell.sourceShellId === "shell-division-o-g9dfgr-0001");
const startRightFractionLine = startStep?.cells.find((cell) => cell.projectionRole === "fraction_line" && cell.colStart === startRightSinShell?.colStart);
const finalOuterFractionLine = finalStep?.cells.find((cell) => cell.projectionRole === "fraction_line" && cell.row === 1);
const finalInnerFractionLine = finalStep?.cells.find((cell) => cell.projectionRole === "fraction_line" && cell.row === 3);
const finalInnerFractionAxis = Number.isFinite(finalInnerFractionShell?.alignmentColStart)
    && Number.isFinite(finalInnerFractionShell?.alignmentColEnd)
    ? (finalInnerFractionShell.alignmentColStart + finalInnerFractionShell.alignmentColEnd) / 2
    : null;

assert.ok(finalA && finalSinName && finalBeta && finalB, "Im letzten Schritt muessen a, b und die Primitive der passiven sin(beta)-Schale sichtbar bleiben.");
assert.ok(startLeftA && startSinName && startBeta && startRightFractionLine, "Auch im Startschritt muessen Zaehler, Nennerfunktion, ihr Inhalt und ihr Bruchstrich sichtbar bleiben.");
assert.ok(finalOuterFractionLine && finalInnerFractionLine, "Im letzten Schritt muessen aeusserer und innerer Bruchstrich getrennt sichtbar bleiben.");
assert.equal(
    startRightFractionLine.rowSpanStart,
    startRightFractionLine.row,
    "Ein sichtbarer Start-Bruchstrich darf nicht die ganze Schalenhoehe spannen, sondern nur seine Achsenzeile."
);
assert.equal(
    startRightFractionLine.rowSpanEnd,
    startRightFractionLine.row,
    "Der sichtbare Start-Bruchstrich muss auch am Zeilenende auf seine eigene Achsenzeile begrenzt bleiben."
);
assert.equal(
    startLeftA.rowSpanStart,
    startLeftA.row,
    "Ein explizit projiziertes Zaehleratom darf keine fremden Teilzeilen der umgebenden Schale erben."
);
assert.equal(
    startLeftA.rowSpanEnd,
    startLeftA.row,
    "Auch am Zeilenende muss ein explizit projiziertes Zaehleratom auf seiner eigenen Teilzeile bleiben."
);
assert.equal(
    finalA.colStart,
    finalInnerFractionAxis,
    "Der Zaehler des aeusseren Bruchs muss auf der weitergereichten Bruchachse des geschlossenen Nennerblocks sitzen."
);
assert.equal(
    finalB.colStart,
    finalInnerFractionAxis,
    "Der Zaehler des inneren Bruchs muss ebenfalls auf derselben weitergereichten Bruchachse sitzen."
);
assert.ok(
    startBeta.row > startRightFractionLine.row,
    "Der Nennerinhalt beta darf schon im Startbruch nicht auf die Achsenzeile des Bruchs rutschen."
);
assert.ok(
    finalBeta.row > finalInnerFractionLine.row && finalInnerFractionLine.row > finalOuterFractionLine.row,
    "Im verschachtelten Endbruch muss der innere Nennerinhalt unter seinem eigenen Bruchstrich bleiben."
);

console.log("Sinussatz-Shell-Ausrichtungsvertrag erfolgreich geprueft.");
