import {
    RENDER_SCENE_CONTRACT_VERSION,
    buildRenderSceneManifest
} from "../../contracts/render_scene/index.js";

export const BRIDGE_DOCUMENT_REFERENCES = Object.freeze([
    {
        id: "bridge-readme",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/README.md",
        role: "project_overview"
    },
    {
        id: "bridge-architecture",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/ARCHITECTURE.md",
        role: "module_split"
    },
    {
        id: "bridge-contract",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/CONTRACT.md",
        role: "transition_contract"
    },
    {
        id: "bridge-io-contract",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/B_IO_CONTRACT.md",
        role: "local_io_contract"
    },
    {
        id: "bridge-a1-b-a2-sketch",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/A1_B_A2_CONTRACT_SKETCH.md",
        role: "system_boundary_sketch"
    }
]);

export const BRIDGE_SNAPSHOT_REFERENCES = Object.freeze([
    {
        id: "before-state",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/snapshots/example_before_state.json",
        role: "before_state"
    },
    {
        id: "after-state",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/snapshots/example_after_state.json",
        role: "after_state"
    }
]);

export const BRIDGE_PROTOTYPE_REFERENCES = Object.freeze([
    {
        id: "paper-demo",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/prototypes/paper-transition-demo.html",
        role: "paper_transition_preview"
    },
    {
        id: "film-demo",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/prototypes/real_transition_demo.html",
        role: "film_transition_preview"
    },
    {
        id: "bridge-demo",
        relativePathFromRepoRoot: "projects/complex_exponent_transition/prototypes/bridge-transition-demo.html",
        role: "bridge_transition_preview"
    }
]);

export const BRIDGE_SCENE_MODULES = Object.freeze([
    "scene_ingest",
    "identity_map",
    "transition_planner",
    "scene_renderer"
]);

export function buildBridgeSceneManifest() {
    return {
        renderSceneContractVersion: RENDER_SCENE_CONTRACT_VERSION,
        renderScene: buildRenderSceneManifest(),
        documents: BRIDGE_DOCUMENT_REFERENCES,
        snapshots: BRIDGE_SNAPSHOT_REFERENCES,
        prototypes: BRIDGE_PROTOTYPE_REFERENCES,
        modules: BRIDGE_SCENE_MODULES
    };
}
