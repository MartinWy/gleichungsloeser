import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildRenderScenesFromSolveState } from "../../core_a/index.js";
import {
    DEFAULT_ROOT_PROJECTION_PROFILE,
    ROOT_PROJECTION_TUNING_FIELDS,
    buildRootGeometryPlan,
    buildRootProjectionProfile,
    buildRootProjectionManifest,
    buildRootProjectionSpec,
    buildRootProjectionSpecs
} from "../../renderer_kernel/index.js";

const nestedResult = await GenesisCore.solve("sin(sqrt(x))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedResult?.fehler, nestedResult?.fehler || "Die Root-Projektion braucht einen gueltigen Kernlauf.");

const nestedScene = buildRenderScenesFromSolveState(nestedResult, {
    sourceCommit: "renderer-kernel-root-projection-test"
})[0];
const nestedRootPlan = buildRootGeometryPlan(nestedScene);
const nestedProjection = buildRootProjectionSpec({
    rootTrack: nestedRootPlan.rootTracks[0],
    sceneLayout: nestedScene.bounds,
    sceneNodes: nestedScene.atoms
});

assert.equal(
    nestedProjection.viewport.widthPx,
    (nestedScene.bounds.maxColumn - nestedScene.bounds.minColumn + 1) * DEFAULT_ROOT_PROJECTION_PROFILE.cellWidthPx
);
assert.equal(
    nestedProjection.viewport.heightPx,
    (nestedScene.bounds.maxAbsoluteRow - nestedScene.bounds.minAbsoluteRow + 1) * DEFAULT_ROOT_PROJECTION_PROFILE.cellHeightPx
);
assert.equal(nestedProjection.contentRect.x, 242);
assert.equal(nestedProjection.contentRect.y, 48);
assert.equal(nestedProjection.contentRect.width, 36);
assert.equal(nestedProjection.contentRect.height, 32);
assert.equal(nestedProjection.focusRects.length, 1);
assert.equal(nestedProjection.focusRects[0].x, 243);
assert.match(nestedProjection.path.d, /^M /);
assert.ok(
    nestedProjection.path.d.includes("L"),
    "Die Root-Projektion muss aus einer echten Linienfolge bestehen."
);

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!pythagorasResult?.fehler, pythagorasResult?.fehler || "Auch die Potenz-Wurzel-Projektion braucht einen gueltigen Kernlauf.");

const pythagorasScene = buildRenderScenesFromSolveState(pythagorasResult, {
    sourceCommit: "renderer-kernel-root-projection-pythagoras"
})[2];
const pythagorasRootPlan = buildRootGeometryPlan(pythagorasScene);
const pythagorasProjections = buildRootProjectionSpecs({
    rootTracks: pythagorasRootPlan.rootTracks,
    sceneLayout: pythagorasScene.bounds,
    sceneNodes: pythagorasScene.atoms
});

assert.equal(pythagorasProjections.length, 1);
assert.equal(
    pythagorasProjections[0].contentRect.y,
    4,
    "Der Projektionsinhalt muss die Potenzhoehe innerhalb der Wurzel mitnehmen."
);
assert.ok(
    pythagorasProjections[0].path.strokeWidth >= DEFAULT_ROOT_PROJECTION_PROFILE.minStrokeWidthPx,
    "Die neue Wurzelzeichnung muss eine explizite Strichstaerke liefern."
);

const nestedRootResult = await GenesisCore.solve("sqrt(sqrt(x))=5", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedRootResult?.fehler, nestedRootResult?.fehler || "Auch verschachtelte Wurzeln brauchen eine stabile Projektion.");

const nestedRootScene = buildRenderScenesFromSolveState(nestedRootResult, {
    sourceCommit: "renderer-kernel-root-projection-nested-root"
})[0];
const nestedRootsPlan = buildRootGeometryPlan(nestedRootScene);
const nestedRootProjections = buildRootProjectionSpecs({
    rootTracks: nestedRootsPlan.rootTracks,
    sceneLayout: nestedRootScene.bounds,
    sceneNodes: nestedRootScene.atoms
});

assert.equal(nestedRootProjections.length, 2);
assert.ok(
    nestedRootProjections[0].contentRect.width > nestedRootProjections[1].contentRect.width,
    "Die aeussere Wurzel muss fuer die innere Wurzel mehr Inhaltsraum tragen als die innere fuer x allein."
);

const overriddenProfile = buildRootProjectionProfile({
    overbarTopInsetPx: 11,
    riseYFactor: 0.22
});
assert.equal(overriddenProfile.overbarTopInsetPx, 11);
assert.equal(overriddenProfile.riseYFactor, 0.22);
assert.equal(overriddenProfile.tipFactor, DEFAULT_ROOT_PROJECTION_PROFILE.tipFactor);

const manifest = buildRootProjectionManifest();
assert.equal(manifest.adapterType, "renderer_kernel_root_projection_v1");
assert.ok(ROOT_PROJECTION_TUNING_FIELDS.length >= 10);
assert.ok(manifest.adjustableKeys.includes("overbarTopInsetPx"));
assert.ok(
    manifest.invariants.some((line) => line.includes("sichtbare Zeichnungsstufe")),
    "Das Manifest soll festhalten, dass hier die erste sichtbare Wurzelzeichnung entsteht."
);

console.log("renderer_kernel Root-Projektion erfolgreich geprueft.");
