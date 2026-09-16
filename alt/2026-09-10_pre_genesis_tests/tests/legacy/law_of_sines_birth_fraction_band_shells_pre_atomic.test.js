// Am 10. September 2026 als vorkanonischer Bruchband-Test archiviert.
import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "alpha"
});

assert.ok(!result?.fehler, result?.fehler || "Der einfache Sinussatz nach alpha darf nicht fehlschlagen.");

const startStep = buildWorksheetViewModel(result).steps[0];
assert.ok(startStep, "Der Startschritt des Sinussatzes muss im Arbeitsblatt vorliegen.");

const leftFractionLine = startStep.cells.find((cell) => (
    cell.projectionRole === "fraction_line"
    && cell.sourceShellId === "shell-division-o-g9dfgr-0001"
));
const rightFractionLine = startStep.cells.find((cell) => (
    cell.projectionRole === "fraction_line"
    && cell.sourceShellId === "shell-division-o-g9dfgr-0002"
));

const leftNumeratorShell = startStep.cells.find((cell) => (
    cell.projectionRole === "closed_visible_shell"
    && cell.kind === "collection"
    && cell.text === "a"
    && cell.sourceShellId === "shell-division-o-g9dfgr-0001::numerator::closed-collection"
));
const rightNumeratorShell = startStep.cells.find((cell) => (
    cell.projectionRole === "closed_visible_shell"
    && cell.kind === "collection"
    && cell.text === "b"
    && cell.sourceShellId === "shell-division-o-g9dfgr-0002::numerator::closed-collection"
));

assert.ok(leftFractionLine, "Der linke Startbruch muss einen sichtbaren Bruchstrich haben.");
assert.ok(rightFractionLine, "Der rechte Startbruch muss einen sichtbaren Bruchstrich haben.");
assert.ok(leftNumeratorShell, "Der linke Zaehler muss als geschlossene Bruch-Teilschale sichtbar bleiben.");
assert.ok(rightNumeratorShell, "Der rechte Zaehler muss als geschlossene Bruch-Teilschale sichtbar bleiben.");

assert.equal(
    leftNumeratorShell.colStart,
    leftFractionLine.colStart,
    "Die linke Zaehler-Schale muss mit der linken Kante des geborenen Bruchbands beginnen."
);
assert.equal(
    leftNumeratorShell.colEnd,
    leftFractionLine.colEnd,
    "Die linke Zaehler-Schale muss bis zur rechten Kante des geborenen Bruchbands reichen."
);
assert.equal(
    rightNumeratorShell.colStart,
    rightFractionLine.colStart,
    "Auch rechts muss die Zaehler-Schale exakt das geborene Bruchband uebernehmen."
);
assert.equal(
    rightNumeratorShell.colEnd,
    rightFractionLine.colEnd,
    "Das gilt auch fuer die rechte Kante des rechten Bruchbands."
);

assert.equal(
    startStep.cells.some((cell) => cell.text === "a" && cell.kind === "variable" && cell.sourceShellId === "shell-division-o-g9dfgr-0001"),
    false,
    "Wenn der Zaehler als geschlossene Teilschale sichtbar ist, darf daneben kein zweites loses Atom a im selben Bruch entstehen."
);
assert.equal(
    startStep.cells.some((cell) => cell.text === "b" && cell.kind === "variable" && cell.sourceShellId === "shell-division-o-g9dfgr-0002"),
    false,
    "Dasselbe gilt fuer den rechten Zaehler b."
);

assert.equal(
    startStep.cells.some((cell) => cell.projectionRole === "closed_visible_shell" && /^sin\(/.test(cell.text || "")),
    false,
    "Eine sichtbare Funktionsschale wie sin(alpha) darf im Startbruch nicht als zweite Gesamtzelle um die Primitive herum erscheinen."
);

console.log("Sinussatz-Geburtsbruch: Zaehler bleiben als bandgebundene Teilschalen, Nennerfunktionen als Primitive sichtbar.");
