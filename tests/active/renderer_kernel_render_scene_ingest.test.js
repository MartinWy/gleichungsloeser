import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import {
    buildRenderScenesFromSolveState
} from "../../core_a/index.js";
import {
    buildRendererKernelSceneIngestManifest,
    buildRendererKernelSceneInput,
    buildRendererKernelSceneSequenceInput
} from "../../renderer_kernel/index.js";

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!pythagorasResult?.fehler, pythagorasResult?.fehler || "Der renderer_kernel-Ingest braucht einen gueltigen Kernlauf.");

const pythagorasScenes = buildRenderScenesFromSolveState(pythagorasResult, {
    sourceCommit: "renderer-kernel-ingest-test"
});
const firstInput = buildRendererKernelSceneInput(pythagorasScenes[0]);

assert.equal(firstInput.sceneId, "projection-0");
assert.equal(firstInput.coordinateSpace, "p4_projection_or_transition_local");
assert.ok(firstInput.nodes.anchors.some((node) => node.text === "="));
assert.ok(firstInput.nodes.powers.length >= 1, "Potenzschalen sollen im Ingest getrennt adressierbar bleiben.");
assert.equal(firstInput.rows.length, 2, "Die erste Pythagoras-Szene soll weiterhin ihre zwei sichtbaren Zeilen behalten.");
assert.equal(firstInput.rows[0].absoluteRow, 0);
assert.equal(firstInput.rows[1].absoluteRow, 1);
assert.equal(firstInput.rows[0].rowRoles[0], "above_axis");
assert.equal(firstInput.rows[1].rowRoles[0], "axis");
assert.equal(firstInput.ingestPolicy.includeInvisible, false);

const sequenceInput = buildRendererKernelSceneSequenceInput(pythagorasScenes);
assert.equal(sequenceInput.sceneCount, pythagorasScenes.length);
assert.equal(sequenceInput.contractVersion, "2026-08-09");
assert.ok(
    sequenceInput.scenes[2].nodes.roots.length >= 1,
    "Auch spaetere Szenen mit Wurzel muessen im Ingest als Root-Knoten ankommen."
);

const nestedResult = await GenesisCore.solve("sin(sqrt(x))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedResult?.fehler, nestedResult?.fehler || "Auch der verschachtelte Szenen-Ingest braucht einen gueltigen Kernlauf.");

const nestedScene = buildRenderScenesFromSolveState(nestedResult, {
    sourceCommit: "renderer-kernel-ingest-nested"
})[0];
const nestedInput = buildRendererKernelSceneInput(nestedScene);

assert.ok(nestedInput.nodes.functions.some((node) => node.text === "sin"));
assert.ok(nestedInput.nodes.roots.length >= 2, "Wurzelhaken und Oberstrich sollen als Root-Spuren beim Ingest erhalten bleiben.");
assert.ok(nestedInput.focusIds.length >= 1);
assert.ok(
    nestedInput.rows.some((row) => row.rowRoles.includes("axis")),
    "Der Ingest soll explizite Teilzeilenrollen aus der Render-Szene nicht verlieren."
);

const hiddenInput = buildRendererKernelSceneInput({
    sceneId: "hidden-demo",
    sourceProject: "6_Gleichungsloeser",
    coordinateSpace: "p4_projection_or_transition_local",
    atoms: [
        {
            id: "visible-1",
            type: "atom",
            text: "x",
            isVisible: true,
            position: { absoluteRow: 0, colStart: 0, colEnd: 0 }
        },
        {
            id: "hidden-1",
            type: "atom",
            text: "ghost",
            isVisible: false,
            position: { absoluteRow: 0, colStart: 1, colEnd: 1 }
        }
    ],
    shells: [],
    focusIds: []
}, {
    includeInvisible: false
});

assert.equal(hiddenInput.counts.all, 1, "Unsichtbare Knoten sollen standardmaessig aus dem Ingest herausfallen.");

const hiddenInclusiveInput = buildRendererKernelSceneInput({
    sceneId: "hidden-demo",
    sourceProject: "6_Gleichungsloeser",
    coordinateSpace: "p4_projection_or_transition_local",
    atoms: [
        {
            id: "visible-1",
            type: "atom",
            text: "x",
            isVisible: true,
            position: { absoluteRow: 0, colStart: 0, colEnd: 0 }
        },
        {
            id: "hidden-1",
            type: "atom",
            text: "ghost",
            isVisible: false,
            position: { absoluteRow: 0, colStart: 1, colEnd: 1 }
        }
    ],
    shells: [],
    focusIds: []
}, {
    includeInvisible: true
});

assert.equal(hiddenInclusiveInput.counts.all, 2, "Bei Bedarf sollen unsichtbare Knoten bewusst mitgenommen werden koennen.");

const ingestManifest = buildRendererKernelSceneIngestManifest();
assert.equal(ingestManifest.adapterType, "render_scene_to_renderer_kernel_input");
assert.ok(ingestManifest.invariants.some((line) => line.includes("keine neue mathematische Struktur")));

console.log("renderer_kernel Render-Scene-Ingest erfolgreich geprueft.");
