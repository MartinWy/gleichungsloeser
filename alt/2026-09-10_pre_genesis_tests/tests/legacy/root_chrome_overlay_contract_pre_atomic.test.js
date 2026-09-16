// Am 10. September 2026 als vorkanonischer Root-Chrome-Test archiviert.
import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";

const result = await GenesisCore.solve("a^2+b^2-2*a*b*cos(gamma)=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "c"
});

assert.ok(!result?.fehler, result?.fehler || "GenesisRuntime darf fuer den Cosinussatz nach c keinen Fehler liefern.");

const viewModel = buildWorksheetViewModel(result);
assert.equal(viewModel.steps.length, 2, "Nach c braucht der Cosinussatz genau den Potenz-zu-Wurzel-Schritt.");

const startStep = viewModel.steps[0];
const finalStep = viewModel.steps[1];

const rootCell = finalStep.cells.find((cell) => cell.kind === "root");
assert.ok(rootCell, "Die Schlusszeile muss genau eine sichtbare Wurzelhuelle tragen.");
assert.equal(
    rootCell.renderNode?.chromeOnly,
    true,
    "Die sichtbare Wurzelhuelle darf in der Arbeitsblattansicht nur noch Chrome tragen, nicht ihren Inhalt als lokalen Kompaktblock."
);

const startAnchor = startStep.cells.find((cell) => cell.text === "=" && cell.rowKind === "axis");
const finalAnchor = finalStep.cells.find((cell) => cell.text === "=" && cell.rowKind === "axis");
assert.ok(startAnchor && finalAnchor, "Beide Zeilen muessen den Gleichheitsanker tragen.");
assert.equal(finalAnchor.col, startAnchor.col, "Der Gleichheitsanker muss beim Root-Schritt stabil bleiben.");

for (const expectedText of ["a^2", "b^2", "+", "-", "2", "a", "b", "cos(gamma)"]) {
    assert.ok(
        finalStep.cells.some((cell) => cell.text === expectedText && cell.rowKind === "axis"),
        `Unter der Wurzel muss ${expectedText} als eigene projizierte Atomspur sichtbar bleiben.`
    );
}

assert.ok(
    finalStep.cells.some((cell) => cell.text === "c" && cell.rowKind === "axis"),
    "Die Zielvariable c muss rechts vom Gleichheitsanker sichtbar bleiben."
);

console.log("✅ Root-Chrome-Overlay-Vertrag erfolgreich geprueft.");
