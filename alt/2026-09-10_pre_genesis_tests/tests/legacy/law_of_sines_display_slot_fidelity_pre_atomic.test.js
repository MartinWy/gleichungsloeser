// Am 10. September 2026 als vorkanonischer Display-Test archiviert.
import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "alpha",
    runtimeEngine: "genesis_runtime"
});

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach alpha darf nicht fehlschlagen.");

const viewModel = buildWorksheetViewModel(result);
const displayModel = buildWorksheetDisplayModel(viewModel);
const startStep = viewModel.steps[0];
const transportStep = viewModel.steps[1];

function resolveDisplaySnapshot(cell) {
    const item = displayModel.items.find((candidate) => candidate.cell.id === cell?.id);

    return {
        colStart: cell?.colStart,
        colEnd: cell?.colEnd,
        displayStartSlot: item?.displayStartSlot,
        displayEndSlot: item?.displayEndSlot,
        gridStart: item?.gridColumnStartLine,
        gridEnd: item?.gridColumnEndLine
    };
}

function findCell(step, predicate) {
    return step?.cells.find(predicate);
}

const startLeftA = findCell(
    startStep,
    (cell) => cell.text === "a" && cell.projectionRole === "closed_visible_shell" && cell.colStart === 2 && cell.colEnd === 5
);
const transportLeftA = findCell(
    transportStep,
    (cell) => cell.text === "a" && cell.projectionRole === "closed_visible_shell" && cell.colStart === 2 && cell.colEnd === 5
);

const startRightFractionLine = findCell(
    startStep,
    (cell) => cell.kind === "fraction_line" && cell.sourceShellId === "shell-division-o-g9dfgr-0002"
);
const transportRightFractionLine = findCell(
    transportStep,
    (cell) => cell.kind === "fraction_line" && cell.sourceShellId === "shell-division-o-g9dfgr-0002"
);

const startRightNumerator = findCell(
    startStep,
    (cell) => cell.text === "b" && cell.projectionRole === "closed_visible_shell" && cell.colStart === 17 && cell.colEnd === 20
);
const transportRightNumerator = findCell(
    transportStep,
    (cell) => cell.text === "b" && cell.projectionRole === "closed_visible_shell" && cell.colStart === 17 && cell.colEnd === 20
);

const startRightSin = findCell(
    startStep,
    (cell) => cell.text === "sin" && cell.projectionRole === "function_name" && cell.sourceShellId === "shell-function-o-g9dfgr-0002"
);
const transportRightSin = findCell(
    transportStep,
    (cell) => cell.text === "sin" && cell.projectionRole === "function_name" && cell.sourceShellId === "shell-function-o-g9dfgr-0002"
);

const startRightBeta = findCell(
    startStep,
    (cell) => cell.text === "beta" && cell.projectionRole === "content" && cell.sourceShellId === "shell-function-o-g9dfgr-0002"
);
const transportRightBeta = findCell(
    transportStep,
    (cell) => cell.text === "beta" && cell.projectionRole === "content" && cell.sourceShellId === "shell-function-o-g9dfgr-0002"
);

assert.ok(startLeftA && transportLeftA, "Die linke Zaehler-Schale a muss in Start und Transport sichtbar sein.");
assert.ok(startRightFractionLine && transportRightFractionLine, "Der rechte Bruchstrich muss in Start und Transport sichtbar sein.");
assert.ok(startRightNumerator && transportRightNumerator, "Die rechte Zaehler-Schale b muss in Start und Transport sichtbar sein.");
assert.ok(startRightSin && transportRightSin, "Die passive sin(beta)-Schale muss in Start und Transport sichtbar bleiben.");
assert.ok(startRightBeta && transportRightBeta, "Auch beta muss in Start und Transport sichtbar bleiben.");

assert.deepEqual(
    resolveDisplaySnapshot(transportLeftA),
    resolveDisplaySnapshot(startLeftA),
    "Die linke Zaehler-Schale a darf zwischen Start und Nennerabbau weder ihre Kernspalte noch ihren sichtbaren Slot verlieren."
);
assert.deepEqual(
    resolveDisplaySnapshot(transportRightFractionLine),
    resolveDisplaySnapshot(startRightFractionLine),
    "Der rechte Bruchstrich darf zwischen Start und Nennerabbau nicht neu verankert werden."
);
assert.deepEqual(
    resolveDisplaySnapshot(transportRightNumerator),
    resolveDisplaySnapshot(startRightNumerator),
    "Die rechte Zaehler-Schale b muss zwischen Start und Nennerabbau auf exakt derselben sichtbaren Spur bleiben."
);
assert.deepEqual(
    resolveDisplaySnapshot(transportRightSin),
    resolveDisplaySnapshot(startRightSin),
    "Die passive Funktionsschale sin(beta) darf beim Transport keine neue linke Slotgrenze erhalten."
);
assert.deepEqual(
    resolveDisplaySnapshot(transportRightBeta),
    resolveDisplaySnapshot(startRightBeta),
    "Auch das innere Ziel-unabhaengige Atom beta darf beim Transport nicht auf eine neue sichtbare Spur rutschen."
);

console.log("Sinussatz-Positionsvertrag fuer sichtbare Slots erfolgreich geprueft.");
