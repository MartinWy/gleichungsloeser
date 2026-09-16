import {
    BRIDGE_STATE_CONTRACT_VERSION,
    buildBridgeStateContractManifest
} from "../../contracts/bridge_state/index.js";
import {
    PROJECTION_STATE_CONTRACT_VERSION,
    buildProjectionStateManifest
} from "../../contracts/projection_state/index.js";
import {
    buildBridgeBoundaryStateFromSolveState,
    buildCoreABridgeBoundaryAdapterManifest
} from "./bridge_boundary/index.js";
import {
    buildBridgeA2ProbeFromSolveState,
    buildBridgeLandingProfileFromSolveState,
    buildCoreABridgeLandingProfileAdapterManifest
} from "./bridge_landing_profile/index.js";
import {
    RENDER_SCENE_CONTRACT_VERSION,
    buildRenderSceneManifest
} from "../../contracts/render_scene/index.js";
import {
    SOLVE_STATE_CONTRACT_VERSION,
    buildSolveStateManifest
} from "../../contracts/solve_state/index.js";
export {
    buildCoreARenderSceneAdapterManifest,
    buildRenderSceneFromProjectionRow,
    buildRenderScenesFromProjectionState,
    buildRenderScenesFromSolveState
} from "./render_scene/index.js";
export {
    buildBridgeBoundaryStateFromSolveState,
    buildCoreABridgeBoundaryAdapterManifest
} from "./bridge_boundary/index.js";
export {
    buildBridgeA2ProbeFromSolveState,
    buildBridgeLandingProfileFromSolveState,
    buildCoreABridgeLandingProfileAdapterManifest
} from "./bridge_landing_profile/index.js";

export const CORE_A_ENTRY = Object.freeze({
    relativePathFromRepoRoot: "core/index.js",
    exportType: "default",
    exportName: "GenesisCore",
    solveMethod: "solve"
});

export function buildCoreAManifest() {
    return {
        entry: CORE_A_ENTRY,
        contracts: {
            solveStateVersion: SOLVE_STATE_CONTRACT_VERSION,
            projectionStateVersion: PROJECTION_STATE_CONTRACT_VERSION,
            bridgeStateVersion: BRIDGE_STATE_CONTRACT_VERSION,
            renderSceneVersion: RENDER_SCENE_CONTRACT_VERSION,
            solveState: buildSolveStateManifest(),
            projectionState: buildProjectionStateManifest(),
            bridgeState: buildBridgeStateContractManifest(),
            renderScene: buildRenderSceneManifest()
        },
        migrationRule: "copy_or_clean_rebuild_only"
    };
}
