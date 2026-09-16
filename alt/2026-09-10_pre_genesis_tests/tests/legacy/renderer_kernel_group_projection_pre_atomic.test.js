import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildRenderScenesFromSolveState } from "../../core_a/index.js";
import {
    DEFAULT_GROUP_PROJECTION_PROFILE,
    GROUP_PROJECTION_TUNING_FIELDS,
    buildGroupGeometryPlan,
    buildGroupProjectionManifest,
    buildGroupProjectionProfile,
    buildGroupProjectionSpec,
    buildGroupProjectionSpecs
} from "../../renderer_kernel/index.js";

const groupedPowerResult = await GenesisCore.solve("sin((x+1)^2)=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!groupedPowerResult?.fehler, groupedPowerResult?.fehler || "Die Group-Projektion braucht einen gueltigen Kernlauf.");

const groupedPowerScene = buildRenderScenesFromSolveState(groupedPowerResult, {
    sourceCommit: "renderer-kernel-group-projection-power"
})[0];
const groupedPowerPlan = buildGroupGeometryPlan(groupedPowerScene);
const groupedPowerProjection = buildGroupProjectionSpec({
    groupTrack: groupedPowerPlan.groupTracks[0],
    sceneLayout: groupedPowerScene.bounds,
    sceneNodes: groupedPowerScene.atoms
});

assert.equal(
    groupedPowerProjection.viewport.widthPx,
    (groupedPowerScene.bounds.maxColumn - groupedPowerScene.bounds.minColumn + 1) * DEFAULT_GROUP_PROJECTION_PROFILE.cellWidthPx
);
assert.equal(groupedPowerProjection.paths.length, 2);
assert.match(groupedPowerProjection.leftPath.d, /^M /);
assert.match(groupedPowerProjection.rightPath.d, /^M /);
assert.ok(
    groupedPowerProjection.leftPath.anchorPoints.centerY === groupedPowerProjection.rightPath.anchorPoints.centerY,
    "Beide Klammern muessen dieselbe Mittelachse haben."
);
assert.ok(
    groupedPowerProjection.leftPath.anchorPoints.centerY >
    groupedPowerProjection.contentRect.y,
    "Die Mittelachse soll innerhalb der realen Inhaltszone liegen."
);

const groupedFractionResult = await GenesisCore.solve("sqrt((x+1)/(2-a))=5", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!groupedFractionResult?.fehler, groupedFractionResult?.fehler || "Auch die Bruch-Klammerprojektion braucht einen gueltigen Kernlauf.");

const groupedFractionScene = buildRenderScenesFromSolveState(groupedFractionResult, {
    sourceCommit: "renderer-kernel-group-projection-fraction"
})[0];
const groupedFractionPlan = buildGroupGeometryPlan(groupedFractionScene);
const groupedFractionProjections = buildGroupProjectionSpecs({
    groupTracks: groupedFractionPlan.groupTracks,
    sceneLayout: groupedFractionScene.bounds,
    sceneNodes: groupedFractionScene.atoms
});

assert.equal(groupedFractionProjections.length, 2);
assert.ok(
    groupedFractionProjections[0].leftPath.anchorPoints.bottomY - groupedFractionProjections[0].leftPath.anchorPoints.topY >
    DEFAULT_GROUP_PROJECTION_PROFILE.cellHeightPx,
    "Eine obere Bruchklammer muss sichtbar ueber mehr als eine Standardzeile reichen."
);
assert.ok(
    groupedFractionProjections[1].leftPath.strokeWidth >= DEFAULT_GROUP_PROJECTION_PROFILE.minStrokeWidthPx,
    "Auch die untere Klammer muss eine explizite Strichstaerke liefern."
);
assert.ok(
    groupedFractionProjections[0].leftPath.anchorPoints.topY < groupedFractionProjections[0].contentRect.y,
    "Die obere Klammer muss oberhalb des eingeschlossenen Inhalts anfangen."
);
assert.ok(
    groupedFractionProjections[1].leftPath.anchorPoints.bottomY >
    groupedFractionProjections[1].contentRect.y + groupedFractionProjections[1].contentRect.height,
    "Die untere Klammer muss unterhalb des eingeschlossenen Inhalts enden."
);

const overriddenProfile = buildGroupProjectionProfile({
    parenTopPaddingPx: 10,
    waistFactor: 0.55
});
assert.equal(overriddenProfile.parenTopPaddingPx, 10);
assert.equal(overriddenProfile.waistFactor, 0.55);
assert.equal(overriddenProfile.parenBottomPaddingPx, DEFAULT_GROUP_PROJECTION_PROFILE.parenBottomPaddingPx);

const manifest = buildGroupProjectionManifest();
assert.equal(manifest.adapterType, "renderer_kernel_group_projection_v1");
assert.ok(GROUP_PROJECTION_TUNING_FIELDS.length >= 8);
assert.ok(manifest.adjustableKeys.includes("parenTopPaddingPx"));
assert.ok(
    manifest.invariants.some((line) => line.includes("Mittelachse")),
    "Das Manifest soll die Mittelachse der Klammern explizit festhalten."
);

console.log("renderer_kernel Group-Projektion erfolgreich geprueft.");
