import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import {
    buildCoreARenderSceneAdapterManifest,
    buildRenderSceneFromProjectionRow,
    buildRenderScenesFromProjectionState,
    buildRenderScenesFromSolveState
} from "../../core_a/index.js";
import { validateRenderScenes } from "../../contracts/render_scene/index.js";

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!pythagorasResult?.fehler, pythagorasResult?.fehler || "Der Render-Scene-Adapter braucht einen gueltigen Kernlauf.");

const pythagorasScenes = buildRenderScenesFromSolveState(pythagorasResult, {
    sourceCommit: "test-core-a-scene"
});
const pythagorasValidation = validateRenderScenes(pythagorasScenes);

assert.equal(
    pythagorasScenes.length,
    pythagorasResult.exportData.projectionRows.length,
    "Jede Kern-Projektionszeile soll genau eine Render-Szene ergeben."
);
assert.equal(
    pythagorasValidation.valid,
    true,
    `Die vom Kern-Adapter erzeugten Szenen muessen den render_scene-Vertrag erfuellen: ${pythagorasValidation.errors.join(" | ")}`
);
assert.equal(pythagorasScenes[0].sceneId, "projection-0");
assert.equal(pythagorasScenes[0].coordinateSpace, "p4_projection_or_transition_local");
assert.equal(pythagorasScenes[0].layout.anchorColumn, pythagorasResult.exportData.layoutPlan.anchorColumn);
assert.deepEqual(
    pythagorasScenes[0].rowMeta.rowRoles,
    ["above_axis", "axis"],
    "Die Render-Szene soll die expliziten Teilzeilenrollen des Projektionsblocks mittragen."
);
assert.ok(
    pythagorasScenes[0].atoms.some((node) => node.type === "anchor" && node.text === "="),
    "Die Render-Szene muss das Gleichheitszeichen als expliziten Ankerknoten tragen."
);
assert.ok(
    pythagorasScenes[0].shells.some((node) => node.type === "power"),
    "Auch sichtbare Potenzschalen muessen als Shell-Knoten im Szenenraum auftauchen."
);
assert.ok(
    pythagorasScenes.some((scene) => scene.focusIds.length > 0),
    "Die Zielvariable soll als Fokusspur in mindestens einer Szene markiert werden."
);
assert.ok(
    pythagorasScenes[2].rowMeta.shellSpans.some((shell) => shell.shellType === "ROOT"),
    "Die Render-Szene soll explizite Schalen-Spannen des Kerns im Metablock erhalten."
);

const pythagorasProjectionScenes = buildRenderScenesFromProjectionState(pythagorasResult.exportData, {
    targetVariable: "a",
    sourceCommit: "projection-only"
});
const pythagorasFinalProjectedMaxColumn = Math.max(
    ...pythagorasResult.exportData.projectionRows[2].positionedAtoms.map((atom) => atom.colEnd ?? atom.col)
);
assert.equal(
    pythagorasProjectionScenes[2].bounds.maxColumn,
    pythagorasFinalProjectedMaxColumn,
    "Die Spaltenbreite einer Szene soll direkt aus der vorhandenen Projektionslage ableitbar bleiben."
);
const pythagorasTargetSceneNode = pythagorasProjectionScenes[2].atoms.find((node) => node.text === "a");
assert.equal(pythagorasTargetSceneNode?.isTarget, true, "Die explizite Core-Zielmarkierung muss am Szenenknoten erhalten bleiben.");
assert.ok(
    pythagorasProjectionScenes[2].focusIds.includes(pythagorasTargetSceneNode.id),
    "Die Fokusliste muss die explizit markierte Zielzelle enthalten."
);
assert.ok(
    pythagorasProjectionScenes[2].focusIds.every((focusId) => (
        pythagorasProjectionScenes[2].atoms.find((node) => node.id === focusId)?.isTarget === true
    )),
    "Core-A darf Fokus-IDs nur aus expliziten Zielmarkierungen und niemals aus Textgleichheit bilden."
);

const nestedResult = await GenesisCore.solve("sin(sqrt(x))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!nestedResult?.fehler, nestedResult?.fehler || "Auch der verschachtelte Szenen-Adapter braucht einen gueltigen Kernlauf.");

const nestedScene = buildRenderSceneFromProjectionRow(
    nestedResult.exportData.projectionRows[0],
    nestedResult.exportData.layoutPlan,
    {
        rowIndex: 0,
        sourceCommit: "nested-test",
        targetVariable: "x"
    }
);

assert.ok(
    nestedScene.shells.some((node) => node.type === "function" && node.text === "sin"),
    "Funktionsschalen sollen im Szenenraum als eigene Shell-Spur erscheinen."
);
assert.ok(
    nestedScene.shells.some((node) => node.type === "root"),
    "Auch Wurzelschalen sollen im Szenenraum als eigene Shell-Spur erscheinen."
);
assert.ok(
    nestedScene.atoms.some((node) => node.position?.rowRole === "axis"),
    "Auch die einzelnen Szenenknoten sollen ihre explizite Teilzeilenrolle mitfuehren."
);
assert.ok(
    nestedScene.focusIds.some((id) => id.includes("atom-variable")),
    "Die Zielvariable x soll als Fokusspur der Szene erhalten bleiben."
);

const adapterManifest = buildCoreARenderSceneAdapterManifest();
assert.equal(adapterManifest.projectionStateVersion, "2026-08-09");
assert.equal(adapterManifest.renderSceneContractVersion, "2026-08-09");
assert.equal(adapterManifest.sceneGranularity, "one_scene_per_projection_row");
assert.ok(
    adapterManifest.invariants.some((line) => line.includes("keine neuen Spalten")),
    "Der Adaptervertrag soll explizit festhalten, dass keine neue Spaltenlogik erfunden wird."
);

console.log("core_a Render-Scene-Adapter erfolgreich geprueft.");
