import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../presentation/adapters/index.js";
import {
    buildColumnLayout,
    buildDisplayColumnLayout,
    cloneColumnLayoutProfile,
    defaultColumnLayoutProfileName,
    getColumnLayoutProfile,
    getDefaultAtomWidth,
    listAtomWidthEntries,
    listColumnLayoutProfiles,
    resolveAtomicTextWidthEm,
    resolveHorizontalLayoutScale,
    withHorizontalLayoutScale
} from "../../presentation/column_layout/index.js";

assert.equal(defaultColumnLayoutProfileName, "standard");
assert.deepEqual(listColumnLayoutProfiles(), ["standard", "kompakt", "lesefreundlich"]);
assert.ok(listAtomWidthEntries().length >= 70);
assert.equal(getDefaultAtomWidth("5"), 0.88);
assert.equal(getDefaultAtomWidth("+"), 0.78);
assert.equal(resolveHorizontalLayoutScale(getColumnLayoutProfile("standard")), 1);

const result = await GenesisCore.solve("2*x=5", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!result?.fehler, result?.fehler || "Der Layoutbeweis braucht einen gueltigen Solve-Lauf.");

const viewModel = buildWorksheetViewModel(result);
const defaultLayout = buildColumnLayout(viewModel);
const defaultDisplayLayout = buildDisplayColumnLayout(viewModel);
const tripleProfile = withHorizontalLayoutScale("standard", 3);
const tripleLayout = buildColumnLayout(viewModel, tripleProfile);
const tripleDisplayLayout = buildDisplayColumnLayout(viewModel, tripleProfile);
const widenedProfile = cloneColumnLayoutProfile();
const fiveColumn = viewModel.steps[0].cells.find((cell) => cell.text === "5")?.col;

assert.ok(Number.isInteger(fiveColumn));
widenedProfile.atomMinWidthEm.explicit["5"] = 1.28;
assert.equal(resolveAtomicTextWidthEm("5", "number", widenedProfile), 1.28);
assert.ok(buildColumnLayout(viewModel, widenedProfile).widths[fiveColumn] > defaultLayout.widths[fiveColumn]);
assert.ok(Math.abs(tripleLayout.totalWidth - defaultLayout.totalWidth * 3) < 1e-9);
assert.ok(Math.abs(tripleDisplayLayout.totalWidth - defaultDisplayLayout.totalWidth * 3) < 1e-9);

assert.equal(defaultDisplayLayout.slots.length, viewModel.columnCount);
assert.ok(
    defaultDisplayLayout.slots.every((slot, index) => slot.kind === "semantic" && slot.semanticCol === index),
    "Der physische Layoutkern darf im atomaren Pfad keine zusaetzlichen funktionalen Slots erfinden."
);
assert.deepEqual(
    defaultDisplayLayout.semanticToSlotIndex,
    Array.from({ length: viewModel.columnCount }, (_unused, index) => index)
);

const rootResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});
const rootViewModel = buildWorksheetViewModel(rootResult);
const rootFinalCells = rootViewModel.steps.at(-1)?.cells || [];
const rootDisplayLayout = buildDisplayColumnLayout(rootViewModel);

assert.equal(rootFinalCells.filter((cell) => cell.projectionRole === "root_hook").length, 1);
assert.equal(rootFinalCells.filter((cell) => cell.projectionRole === "root_overbar").length, 1);
assert.equal(rootDisplayLayout.slots.length, rootViewModel.columnCount);

console.log("Atomarer physischer Column-Layout-Vertrag erfolgreich geprueft.");
