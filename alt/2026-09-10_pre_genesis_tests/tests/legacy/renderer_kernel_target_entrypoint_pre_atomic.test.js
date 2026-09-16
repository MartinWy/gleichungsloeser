import assert from "node:assert/strict";

import * as presentationRenderKernel from "../../presentation/render_kernel/index.js";
import * as rendererKernel from "../../renderer_kernel/index.js";

assert.equal(typeof rendererKernel.buildRenderNode, "function");
assert.equal(typeof rendererKernel.formatCellText, "function");
assert.equal(typeof rendererKernel.buildCellMetrics, "function");
assert.equal(typeof rendererKernel.buildStepRowKinds, "function");
assert.equal(typeof rendererKernel.buildStepRowMetrics, "function");
assert.equal(typeof rendererKernel.decomposeVisibleShells, "function");
assert.equal(typeof rendererKernel.needsPowerParens, "function");
assert.equal(typeof rendererKernel.roundEm, "function");
assert.equal(typeof rendererKernel.buildRendererKernelManifest, "function");
assert.equal(typeof rendererKernel.buildRendererKernelSceneInput, "function");
assert.equal(typeof rendererKernel.buildRendererKernelSceneSequenceInput, "function");
assert.equal(typeof rendererKernel.buildRendererKernelScenePlan, "function");
assert.equal(typeof rendererKernel.buildRendererKernelSceneSequencePlan, "function");
assert.equal(typeof rendererKernel.buildRootGeometryPlan, "function");
assert.equal(typeof rendererKernel.buildRootGeometryPlanFromScenePlan, "function");
assert.equal(typeof rendererKernel.buildRootGeometrySequencePlan, "function");
assert.equal(typeof rendererKernel.buildRootProjectionProfile, "function");
assert.equal(typeof rendererKernel.buildRootProjectionSpec, "function");
assert.equal(typeof rendererKernel.buildRootProjectionSpecs, "function");
assert.equal(typeof rendererKernel.buildGroupGeometryPlan, "function");
assert.equal(typeof rendererKernel.buildGroupGeometryPlanFromScenePlan, "function");
assert.equal(typeof rendererKernel.buildGroupGeometrySequencePlan, "function");
assert.equal(typeof rendererKernel.buildGroupProjectionProfile, "function");
assert.equal(typeof rendererKernel.buildGroupProjectionSpec, "function");
assert.equal(typeof rendererKernel.buildGroupProjectionSpecs, "function");

assert.equal(
    presentationRenderKernel.buildRenderNode,
    rendererKernel.buildRenderNode,
    "Der Presentation-Einstieg soll bereits auf den neuen renderer_kernel zeigen."
);

assert.equal(
    presentationRenderKernel.decomposeVisibleShells,
    rendererKernel.decomposeVisibleShells,
    "Shell-Helfer sollen aus derselben Ziel-Fassade kommen."
);

const manifest = rendererKernel.buildRendererKernelManifest();
assert.equal(manifest.renderSceneContractVersion, "2026-08-09");
assert.equal(manifest.entry.targetFacadePath, "renderer_kernel/index.js");
assert.ok(manifest.sceneProfile.acceptedNodeTypes.includes("root"));
assert.ok(manifest.exportGroups.shells.includes("decomposeVisibleShells"));
assert.ok(manifest.exportGroups.roots.includes("buildRootGeometryPlan"));
assert.ok(manifest.exportGroups.roots.includes("buildRootProjectionProfile"));
assert.ok(manifest.exportGroups.roots.includes("buildRootProjectionSpec"));
assert.ok(manifest.exportGroups.groups.includes("buildGroupGeometryPlan"));
assert.ok(manifest.exportGroups.groups.includes("buildGroupProjectionProfile"));
assert.ok(manifest.exportGroups.groups.includes("buildGroupProjectionSpec"));
assert.ok(manifest.renderScene.nodeTypes.includes("power"));
assert.equal(manifest.sceneIngest.adapterType, "render_scene_to_renderer_kernel_input");
assert.equal(manifest.scenePlan.adapterType, "renderer_kernel_scene_plan_v1");
assert.equal(manifest.rootGeometry.adapterType, "renderer_kernel_root_geometry_v1");
assert.equal(manifest.rootProjection.adapterType, "renderer_kernel_root_projection_v1");
assert.ok(manifest.rootProjection.adjustableKeys.includes("riseYFactor"));
assert.equal(manifest.groupGeometry.adapterType, "renderer_kernel_group_geometry_v1");
assert.equal(manifest.groupProjection.adapterType, "renderer_kernel_group_projection_v1");
assert.ok(manifest.groupProjection.adjustableKeys.includes("parenTopPaddingPx"));

console.log("renderer_kernel Ziel-Fassade erfolgreich geprueft.");
