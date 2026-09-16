import assert from "node:assert/strict";

import * as presentationRenderKernel from "../../presentation/render_kernel/index.js";
import * as rendererKernel from "../../renderer_kernel/index.js";

for (const exportName of [
    "buildRenderNode",
    "formatCellText",
    "buildCellMetrics",
    "buildStepRowKinds",
    "buildStepRowMetrics",
    "decomposeVisibleShells",
    "needsPowerParens",
    "roundEm",
    "buildRendererKernelManifest",
    "buildRendererKernelSceneInput",
    "buildRendererKernelSceneSequenceInput"
]) {
    assert.equal(typeof rendererKernel[exportName], "function", `${exportName} muss ueber die Ziel-Fassade erreichbar sein.`);
}

for (const forbiddenExportName of [
    "buildRendererKernelScenePlan",
    "buildRootGeometryPlan",
    "buildRootProjectionSpec",
    "buildGroupGeometryPlan",
    "buildGroupProjectionSpec"
]) {
    assert.equal(
        rendererKernel[forbiddenExportName],
        undefined,
        `${forbiddenExportName} darf nach der Archivierung der rekonstruktiven Prototypen nicht aktiv exportiert werden.`
    );
}

assert.equal(presentationRenderKernel.buildRenderNode, rendererKernel.buildRenderNode);
assert.equal(presentationRenderKernel.buildRendererKernelSceneInput, rendererKernel.buildRendererKernelSceneInput);

const manifest = rendererKernel.buildRendererKernelManifest();
assert.equal(manifest.renderSceneContractVersion, "2026-08-09");
assert.equal(manifest.entry.targetFacadePath, "renderer_kernel/index.js");
assert.equal(manifest.sceneIngest.adapterType, "render_scene_to_renderer_kernel_input");
assert.ok(manifest.exportGroups.renderScene.includes("buildRendererKernelSceneInput"));
assert.equal(manifest.scenePlan, undefined);
assert.equal(manifest.rootGeometry, undefined);
assert.equal(manifest.groupGeometry, undefined);

console.log("renderer_kernel Ziel-Fassade endet sauber am atomaren Render-Scene-Ingest.");
