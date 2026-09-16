import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildRenderScenesFromSolveState } from "../../core_a/index.js";
import {
    buildRendererKernelScenePlan,
    buildRendererKernelScenePlanFromInput,
    buildRendererKernelScenePlanManifest,
    buildRendererKernelSceneSequenceInput,
    buildRendererKernelSceneSequencePlan
} from "../../renderer_kernel/index.js";

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!pythagorasResult?.fehler, pythagorasResult?.fehler || "Der Szenenplan braucht einen gueltigen Kernlauf.");

const pythagorasScenes = buildRenderScenesFromSolveState(pythagorasResult, {
    sourceCommit: "renderer-kernel-plan-test"
});
const firstPlan = buildRendererKernelScenePlan(pythagorasScenes[0]);

assert.equal(firstPlan.sceneId, "projection-0");
assert.equal(firstPlan.anchorPlan.primaryColumn, 13);
assert.deepEqual(
    firstPlan.rowBands.map((band) => band.rowKind),
    ["above_axis", "axis"],
    "Die erste Pythagoras-Szene soll ihre Oberzeile und Achsenzeile als getrennte Arbeitsbaender behalten."
);
assert.ok(firstPlan.atomTracks.some((track) => track.text === "="));
assert.ok(firstPlan.atomTracks.some((track) => track.text === "a" && track.isFocus));
assert.equal(
    firstPlan.shellTracks.filter((track) => track.kind === "power").length,
    3,
    "Die drei Potenzen der Startszene sollen als drei getrennte Shell-Tracks im Plan auftauchen."
);

const sequenceInput = buildRendererKernelSceneSequenceInput(pythagorasScenes);
const sequencePlan = buildRendererKernelSceneSequencePlan(sequenceInput);
assert.equal(sequencePlan.sceneCount, 3);
assert.ok(sequencePlan.sharedAnchorColumns.includes(13));
assert.ok(
    sequencePlan.scenes[2].shellTracks.some((track) => track.kind === "root"),
    "Auch die spaetere Wurzelszene muss im Sequenzplan als Root-Track auftauchen."
);

const nestedResult = await GenesisCore.solve("sin(sqrt(x))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedResult?.fehler, nestedResult?.fehler || "Auch der verschachtelte Szenenplan braucht einen gueltigen Kernlauf.");

const nestedScene = buildRenderScenesFromSolveState(nestedResult, {
    sourceCommit: "renderer-kernel-plan-nested"
})[0];
const nestedPlan = buildRendererKernelScenePlan(nestedScene);
const nestedFunctionTrack = nestedPlan.shellTracks.find((track) => track.kind === "function");
const nestedRootTrack = nestedPlan.shellTracks.find((track) => track.kind === "root");

assert.ok(
    nestedFunctionTrack?.functionName === "sin",
    "Funktionsschalen sollen im Plan ihre eigene Shell-Geschichte behalten."
);
assert.ok(
    nestedRootTrack?.memberTexts.includes("sqrt"),
    "Die Wurzel soll im Plan als eigener Shell-Track mit sichtbarem Haken ankommen."
);
assert.ok(
    !nestedFunctionTrack?.projectionRoles.includes("root"),
    "Eine Funktionsspur darf keine Wurzelspur verschlucken."
);
assert.ok(
    nestedRootTrack?.projectionRoles.includes("root_content"),
    "Die Wurzelspur soll ihren eigenen Inhaltsknoten behalten."
);

const nestedInputPlan = buildRendererKernelScenePlanFromInput(sequenceInput.scenes[0]);
assert.equal(nestedInputPlan.sceneId, sequenceInput.scenes[0].sceneId);

const planManifest = buildRendererKernelScenePlanManifest();
assert.equal(planManifest.adapterType, "renderer_kernel_scene_plan_v1");
assert.ok(planManifest.invariants.some((line) => line.includes("keine Shell-Geometrie")));

console.log("renderer_kernel Szenenplan erfolgreich geprueft.");
