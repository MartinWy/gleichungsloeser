import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildRenderScenesFromSolveState } from "../../core_a/index.js";
import {
    buildRendererKernelScenePlan,
    buildRootGeometryManifest,
    buildRootGeometryPlan,
    buildRootGeometryPlanFromScenePlan
} from "../../renderer_kernel/index.js";

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!pythagorasResult?.fehler, pythagorasResult?.fehler || "Der Root-Geometrieplan braucht einen gueltigen Kernlauf.");

const pythagorasRootScene = buildRenderScenesFromSolveState(pythagorasResult, {
    sourceCommit: "renderer-kernel-root-geometry-test"
})[2];
const pythagorasRootPlan = buildRootGeometryPlan(pythagorasRootScene);
const pythagorasRootTrack = pythagorasRootPlan.rootTracks[0];

assert.equal(pythagorasRootPlan.rootTracks.length, 1);
assert.equal(pythagorasRootTrack.overbarAbsoluteRow, 4);
assert.equal(pythagorasRootTrack.axisAbsoluteRow, 5);
assert.equal(
    pythagorasRootTrack.contentBounds.minAbsoluteRow,
    4,
    "Der Inhaltsraum der Wurzel muss Potenzen innerhalb der Wurzel hoehenwirksam mitnehmen."
);
assert.ok(
    pythagorasRootTrack.childShellTrackIds.some((id) => id.includes("shell-power")),
    "Potenzen innerhalb der Wurzel sollen als Kindspuren der Root-Geometrie sichtbar bleiben."
);

const nestedResult = await GenesisCore.solve("sin(sqrt(x))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedResult?.fehler, nestedResult?.fehler || "Auch die verschachtelte Root-Geometrie braucht einen gueltigen Kernlauf.");

const nestedScene = buildRenderScenesFromSolveState(nestedResult, {
    sourceCommit: "renderer-kernel-root-geometry-nested"
})[0];
const nestedScenePlan = buildRendererKernelScenePlan(nestedScene);
const nestedRootPlan = buildRootGeometryPlanFromScenePlan(nestedScenePlan);
const nestedRootTrack = nestedRootPlan.rootTracks[0];

assert.equal(nestedRootTrack.hookColumn, 4);
assert.equal(nestedRootTrack.contentColumnStart, 6);
assert.deepEqual(
    nestedRootTrack.focusIds,
    ["r0::content::content::atom-variable-e-1n26vmj-0001::0"],
    "Die Fokusspur der Zielvariable soll in der Root-Geometrie erhalten bleiben."
);

const manifest = buildRootGeometryManifest();
assert.equal(manifest.adapterType, "renderer_kernel_root_geometry_v1");
assert.ok(
    manifest.invariants.some((line) => line.includes("Kindspuren")),
    "Das Manifest soll verschachtelte Shells innerhalb der Wurzel als eigene Kindspuren festhalten."
);

console.log("renderer_kernel Root-Geometrie erfolgreich geprueft.");
