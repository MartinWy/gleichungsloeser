import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildRenderScenesFromSolveState } from "../../core_a/index.js";
import {
    buildGroupGeometryManifest,
    buildGroupGeometryPlan,
    buildGroupGeometryPlanFromScenePlan,
    buildRendererKernelScenePlan
} from "../../renderer_kernel/index.js";

const groupedFractionResult = await GenesisCore.solve("sqrt((x+1)/(2-a))=5", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!groupedFractionResult?.fehler, groupedFractionResult?.fehler || "Der Group-Geometrieplan braucht einen gueltigen Kernlauf.");

const groupedFractionScene = buildRenderScenesFromSolveState(groupedFractionResult, {
    sourceCommit: "renderer-kernel-group-geometry-fraction"
})[0];
const groupedFractionPlan = buildGroupGeometryPlan(groupedFractionScene);

assert.equal(groupedFractionPlan.groupTracks.length, 2);
assert.equal(
    groupedFractionPlan.groupTracks[0].frameBounds.maxAbsoluteRow,
    1,
    "Die obere Klammer muss als eigene Spur bis zur Bruchachse reichen."
);
assert.equal(
    groupedFractionPlan.groupTracks[1].frameBounds.minAbsoluteRow,
    1,
    "Die untere Klammer muss denselben Bruchanker nach oben erben."
);
assert.ok(
    groupedFractionPlan.groupTracks.every((track) => track.structuralNodeIds.length >= 3),
    "Jede Gruppenspur soll linke Klammer, rechte Klammer und Gruppenschale getrennt tragen."
);

const nestedGroupResult = await GenesisCore.solve("((x/2)+1)=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedGroupResult?.fehler, nestedGroupResult?.fehler || "Auch verschachtelte Klammern brauchen einen gueltigen Kernlauf.");

const nestedGroupScene = buildRenderScenesFromSolveState(nestedGroupResult, {
    sourceCommit: "renderer-kernel-group-geometry-nested-group"
})[0];
const nestedGroupPlan = buildGroupGeometryPlan(nestedGroupScene);

assert.ok(
    nestedGroupPlan.groupTracks.some((track) => track.childShellTrackIds.length > 0),
    "Verschachtelte Klammern sollen als Kindspuren in der aeusseren Group-Geometrie erhalten bleiben."
);

const groupedPowerResult = await GenesisCore.solve("sin((x+1)^2)=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!groupedPowerResult?.fehler, groupedPowerResult?.fehler || "Auch die Potenz-Klammer braucht einen gueltigen Kernlauf.");

const groupedPowerScene = buildRenderScenesFromSolveState(groupedPowerResult, {
    sourceCommit: "renderer-kernel-group-geometry-power"
})[0];
const groupedPowerScenePlan = buildRendererKernelScenePlan(groupedPowerScene);
const groupedPowerPlan = buildGroupGeometryPlanFromScenePlan(groupedPowerScenePlan);
const groupedPowerTrack = groupedPowerPlan.groupTracks[0];

assert.equal(groupedPowerTrack.frameBounds.minAbsoluteRow, 1);
assert.equal(groupedPowerTrack.frameBounds.maxAbsoluteRow, 1);
assert.ok(
    groupedPowerTrack.focusIds.some((id) => id.includes("atom-variable")),
    "Die Fokusspur der Zielvariable soll in der Group-Geometrie erhalten bleiben."
);
assert.equal(groupedPowerTrack.contentBounds.maxColumn, 14);

const manifest = buildGroupGeometryManifest();
assert.equal(manifest.adapterType, "renderer_kernel_group_geometry_v1");
assert.ok(
    manifest.invariants.some((line) => line.toLowerCase().includes("linke klammer")),
    "Das Manifest soll die Trennung von linker Klammer, rechter Klammer und Inhalt benennen."
);

console.log("renderer_kernel Group-Geometrie erfolgreich geprueft.");
