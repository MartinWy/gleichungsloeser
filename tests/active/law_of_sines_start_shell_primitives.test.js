import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "alpha"
});

assert.ok(!result?.fehler, result?.fehler || "Der einfache Sinussatz nach alpha darf nicht fehlschlagen.");

const viewModel = buildWorksheetViewModel(result);
const startStep = viewModel.steps[0];
const releaseStep = viewModel.steps[1];

assert.ok(startStep && releaseStep, "Die ersten beiden Schritte des Sinussatzes muessen im Arbeitsblatt vorliegen.");

for (const [label, step] of [["start", startStep], ["release", releaseStep]]) {
    assert.equal(
        step.cells.some((cell) => cell.projectionRole === "closed_visible_shell" && /^sin\(/.test(cell.text || "")),
        false,
        `Im ${label}-Schritt darf keine passive sin(...)-Schale als zusammengesetzte Gesamtzelle gerendert werden.`
    );
}

const startLeftSin = startStep.cells.filter((cell) => cell.sourceShellId === "shell-function-o-g9dfgr-0001");
const startRightSin = startStep.cells.filter((cell) => cell.sourceShellId === "shell-function-o-g9dfgr-0002");
const releaseFactorSin = releaseStep.cells.filter((cell) => cell.sourceShellId === "shell-function-o-g9dfgr-0001");
const releaseDenominatorSin = releaseStep.cells.filter((cell) => cell.sourceShellId === "shell-function-o-g9dfgr-0002");

function assertFunctionPrimitiveTrack(cells, expectedRow, messagePrefix) {
    const functionName = cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "sin");
    const leftParen = cells.find((cell) => cell.projectionRole === "function_left" && cell.text === "(");
    const argument = cells.find((cell) => cell.text === "alpha" || cell.text === "beta");
    const rightParen = cells.find((cell) => cell.projectionRole === "function_right" && cell.text === ")");

    assert.ok(functionName, `${messagePrefix}: Funktionsname sin fehlt.`);
    assert.ok(leftParen, `${messagePrefix}: linke Klammer fehlt.`);
    assert.ok(argument, `${messagePrefix}: Argument fehlt.`);
    assert.ok(rightParen, `${messagePrefix}: rechte Klammer fehlt.`);

    assert.equal(functionName.row, expectedRow, `${messagePrefix}: Funktionsname muss auf der erwarteten Teilzeile bleiben.`);
    assert.equal(leftParen.row, expectedRow, `${messagePrefix}: linke Klammer muss auf der erwarteten Teilzeile bleiben.`);
    assert.equal(argument.row, expectedRow, `${messagePrefix}: Argument muss auf der erwarteten Teilzeile bleiben.`);
    assert.equal(rightParen.row, expectedRow, `${messagePrefix}: rechte Klammer muss auf der erwarteten Teilzeile bleiben.`);
}

assertFunctionPrimitiveTrack(startLeftSin, 2, "Start links");
assertFunctionPrimitiveTrack(startRightSin, 2, "Start rechts");
assertFunctionPrimitiveTrack(releaseFactorSin, 1, "Release Faktor");
assertFunctionPrimitiveTrack(releaseDenominatorSin, 2, "Release Nenner");

console.log("Sinussatz-Startschalen bleiben als Primitive sichtbar.");
