import assert from "node:assert/strict";

import {
    RENDER_SCENE_CONTRACT_VERSION,
    buildRenderSceneManifest,
    validateRenderScene,
    validateRenderSceneNode,
    validateRenderScenes
} from "../../contracts/render_scene/index.js";

const manifest = buildRenderSceneManifest();

assert.equal(manifest.version, RENDER_SCENE_CONTRACT_VERSION);
assert.ok(manifest.coordinateSpaces.includes("p4_projection_or_transition_local"));
assert.ok(manifest.nodeTypes.includes("root"));
assert.ok(manifest.nodeTypes.includes("power"));
assert.ok(manifest.requiredFields.includes("focusIds"));
assert.equal(manifest.template.coordinateSpace, "p4_projection_or_transition_local");
assert.ok(manifest.invariants.some((line) => line.includes("keine zweite Solverwahrheit")));

const validNode = validateRenderSceneNode({
    id: "node-1",
    type: "atom"
});
assert.equal(validNode.valid, true);

const validScene = validateRenderScene({
    sceneId: "projection-0",
    sourceProject: "6_Gleichungsloeser",
    coordinateSpace: "p4_projection_or_transition_local",
    atoms: [{ id: "node-1", type: "atom" }],
    shells: [{ id: "shell-1", type: "root" }],
    focusIds: ["node-1"]
});
assert.equal(validScene.valid, true);

const invalidScene = validateRenderScene({
    sceneId: "broken-scene",
    sourceProject: "6_Gleichungsloeser",
    coordinateSpace: "unsupported_space",
    atoms: [{ id: "node-1", type: "unsupported" }],
    shells: [],
    focusIds: "wrong"
});
assert.equal(invalidScene.valid, false);
assert.ok(invalidScene.errors.some((error) => error.includes("ungueltigen Koordinatenraum")));
assert.ok(invalidScene.errors.some((error) => error.includes("focusIds als Array")));

const validScenes = validateRenderScenes([
    {
        sceneId: "projection-0",
        sourceProject: "6_Gleichungsloeser",
        coordinateSpace: "p4_projection_or_transition_local",
        atoms: [{ id: "node-1", type: "atom" }],
        shells: [],
        focusIds: []
    }
]);
assert.equal(validScenes.valid, true);

console.log("render_scene Vertrag erfolgreich geprueft.");
