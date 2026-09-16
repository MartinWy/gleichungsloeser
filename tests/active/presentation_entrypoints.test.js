import assert from "node:assert/strict";

import * as presentation from "../../presentation/index.js";
import * as adapters from "../../presentation/adapters/index.js";
import * as columnLayout from "../../presentation/column_layout/index.js";
import * as renderKernel from "../../presentation/render_kernel/index.js";
import * as latexPdf from "../../presentation/media/latex_pdf/index.js";
import * as spursatz from "../../presentation/spursatz/index.js";
import * as shellColors from "../../presentation/shell_colors/index.js";

assert.equal(typeof presentation.adapters.normalizeEquationInput, "function");
assert.equal(typeof presentation.adapters.buildWorksheetViewModel, "function");
assert.equal(typeof presentation.adapters.buildWorksheetDisplayModel, "function");

assert.equal(typeof adapters.normalizeEquationInput, "function");
assert.equal(typeof adapters.normalizeTargetVariable, "function");
assert.equal(typeof adapters.buildWorksheetViewModel, "function");
assert.equal(typeof adapters.buildWorksheetDisplayModel, "function");

assert.equal(typeof columnLayout.buildDisplayColumnLayout, "function");
assert.equal(typeof columnLayout.getColumnLayoutProfile, "function");
assert.equal(typeof columnLayout.resolveIntraTextGapEm, "function");
assert.equal(typeof columnLayout.resolveInlineNodeGapEm, "function");
assert.equal(typeof columnLayout.resolveSemanticBoundaryGapEm, "function");

assert.equal(typeof renderKernel.buildRenderNode, "function");
assert.equal(typeof renderKernel.buildStepRowMetrics, "function");

assert.equal(typeof latexPdf.buildLatexDocument, "function");
assert.equal(typeof presentation.shellColors.resolveShellColor, "function");
assert.equal(typeof presentation.shellColors.collectShellColorEntriesFromViewModel, "function");
assert.equal(typeof shellColors.normalizeShellColorPolicy, "function");
assert.equal(typeof shellColors.resolveShellColorForNode, "function");
assert.equal(typeof presentation.spursatz.loadSpurSatzSnapshotFromFile, "function");
assert.equal(typeof spursatz.validateSpurSatzSnapshot, "function");
assert.equal(typeof spursatz.buildSpurSatzMaterial, "function");
assert.equal(typeof spursatz.buildAtomPrimitive, "function");
assert.equal(typeof spursatz.buildDelimiterPrimitive, "function");
assert.equal(typeof spursatz.buildRulePrimitive, "function");
assert.equal(typeof spursatz.buildFunctionPrimitive, "function");
assert.equal(typeof spursatz.buildRadicalPrimitive, "function");
assert.equal(typeof spursatz.buildFractionPrimitive, "function");
assert.equal(typeof spursatz.placePrimitive, "function");

console.log("Praesentations-Einstiegspunkte erfolgreich geprueft.");
