import assert from "node:assert/strict";

import * as bridgeB from "../../bridge_b/index.js";
import {
    BRIDGE_STATE_CONTRACT_VERSION,
    buildBridgeStateContractManifest
} from "../../contracts/bridge_state/index.js";

assert.equal(bridgeB.BRIDGE_STATE_CONTRACT_VERSION, BRIDGE_STATE_CONTRACT_VERSION);
assert.deepEqual(bridgeB.BRIDGE_SUPPORTED_VARIANTS, ["left", "right"]);
assert.ok(bridgeB.BRIDGE_OPERATION_TYPES.includes("power_shell_break"));

const stateManifest = buildBridgeStateContractManifest();
assert.equal(stateManifest.version, BRIDGE_STATE_CONTRACT_VERSION);
assert.ok(stateManifest.requiredFields.boundaryState.includes("power_shell.base"));
assert.ok(stateManifest.requiredFields.landingProfile.includes("term_slots"));
assert.ok(stateManifest.requiredFields.landingState.includes("layout.term_slots"));

const inputManifest = bridgeB.buildBridgeInputManifest();
assert.ok(inputManifest.contract.acceptedKeys.includes("boundary_state"));
assert.equal(inputManifest.templates.boundaryState.power_shell.base.text, "B");

const outputManifest = bridgeB.buildBridgeOutputManifest();
assert.ok(outputManifest.contract.providedKeys.includes("landing_state"));
assert.equal(outputManifest.templates.landingState.step_meta.operation_type, "power_shell_break");

const sceneManifest = bridgeB.buildBridgeSceneManifest();
assert.ok(sceneManifest.documents.some((entry) => entry.relativePathFromRepoRoot.endsWith("B_IO_CONTRACT.md")));
assert.ok(sceneManifest.snapshots.some((entry) => entry.role === "before_state"));
assert.ok(sceneManifest.prototypes.some((entry) => entry.role === "paper_transition_preview"));
assert.equal(sceneManifest.renderSceneContractVersion, "2026-08-09");
assert.ok(sceneManifest.renderScene.nodeTypes.includes("power"));

const layoutManifest = bridgeB.buildBridgeLayoutManifest();
assert.ok(layoutManifest.invariants.some((line) => line.includes("Gleichheitszeichen")));
assert.ok(layoutManifest.phases.some((phase) => phase.id === "rewrite-operator-story"));
assert.equal(layoutManifest.variants.left.landingEquation, "log_B(y/a) = 2x-1");

console.log("bridge_b Ziel-Fassade erfolgreich geprueft.");
