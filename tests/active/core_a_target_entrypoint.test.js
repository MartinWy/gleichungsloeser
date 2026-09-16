import assert from "node:assert/strict";

import * as coreA from "../../core_a/index.js";
import GenesisCore from "../../core/index.js";
import { BRIDGE_STATE_CONTRACT_VERSION } from "../../contracts/bridge_state/index.js";
import {
    SOLVE_STATE_CONTRACT_VERSION,
    buildSolveStateManifest
} from "../../contracts/solve_state/index.js";
import {
    PROJECTION_STATE_CONTRACT_VERSION,
    buildProjectionStateManifest
} from "../../contracts/projection_state/index.js";

assert.equal(coreA.ACTIVE_CORE_A_RUNTIME, GenesisCore);
assert.equal(coreA.CORE_A_ENTRY.relativePathFromRepoRoot, "core/index.js");
assert.equal(coreA.CORE_A_ENTRY.solveMethod, "solve");
assert.equal(coreA.SOLVE_STATE_CONTRACT_VERSION, SOLVE_STATE_CONTRACT_VERSION);
assert.equal(coreA.PROJECTION_STATE_CONTRACT_VERSION, PROJECTION_STATE_CONTRACT_VERSION);
assert.equal(typeof coreA.buildRenderScenesFromSolveState, "function");
assert.equal(typeof coreA.buildCoreARenderSceneAdapterManifest, "function");
assert.equal(typeof coreA.buildBridgeBoundaryStateFromSolveState, "function");
assert.equal(typeof coreA.buildCoreABridgeBoundaryAdapterManifest, "function");
assert.equal(typeof coreA.buildBridgeLandingProfileFromSolveState, "function");
assert.equal(typeof coreA.buildCoreABridgeLandingProfileAdapterManifest, "function");

const solveManifest = buildSolveStateManifest();
assert.ok(solveManifest.requiredFields.includes("exportData"));
assert.ok(solveManifest.exportRequiredFields.includes("projectionRows"));

const projectionManifest = buildProjectionStateManifest();
assert.ok(projectionManifest.layoutRequiredFields.includes("anchorColumn"));
assert.ok(projectionManifest.invariants.some((line) => line.includes("Positionstreue")));

const coreManifest = coreA.buildCoreAManifest();
assert.equal(coreManifest.entry, coreA.CORE_A_ENTRY);
assert.equal(coreManifest.contracts.solveState.version, SOLVE_STATE_CONTRACT_VERSION);
assert.equal(coreManifest.contracts.projectionState.version, PROJECTION_STATE_CONTRACT_VERSION);
assert.equal(coreManifest.contracts.bridgeState.version, BRIDGE_STATE_CONTRACT_VERSION);
assert.equal(coreManifest.contracts.renderScene.version, "2026-08-09");
assert.equal(coreManifest.migrationRule, "copy_or_clean_rebuild_only");

console.log("core_a Ziel-Fassade erfolgreich geprueft.");
