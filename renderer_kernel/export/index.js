import {
    RENDER_SCENE_CONTRACT_VERSION,
    buildRenderSceneManifest
} from "../../contracts/render_scene/index.js";
import {
    buildRendererKernelSceneIngestManifest
} from "./render_scene/index.js";

export {
    buildRendererKernelSceneIngestManifest,
    buildRendererKernelSceneInput,
    buildRendererKernelSceneSequenceInput
} from "./render_scene/index.js";

export const RENDERER_KERNEL_ENTRY = Object.freeze({
    targetFacadePath: "renderer_kernel/index.js",
    presentationFacadePath: "presentation/render_kernel/index.js"
});

export const RENDERER_KERNEL_EXPORT_GROUPS = Object.freeze({
    atoms: ["buildRenderNode", "formatCellText"],
    rows: ["buildCellMetrics", "buildStepRowKinds", "buildStepRowMetrics"],
    shells: ["decomposeVisibleShells", "needsPowerParens"],
    metrics: ["createLayout", "createSequenceNode", "createTextNode", "roundEm"],
    renderScene: [
        "buildRendererKernelSceneIngestManifest",
        "buildRendererKernelSceneInput",
        "buildRendererKernelSceneSequenceInput"
    ]
});

export const RENDERER_KERNEL_SCENE_PROFILE = Object.freeze({
    coordinateSpace: "renderer_kernel_local",
    acceptedNodeTypes: ["atom", "anchor", "group", "function", "division", "fraction_line", "root", "power"]
});

export const RENDERER_KERNEL_INVARIANTS = Object.freeze([
    "Der Renderkern konsumiert Szenen und baut keine Solverstrategie.",
    "Der Renderkern darf keine zweite mathematische Wahrheit erzeugen.",
    "Die Export-Fassade bleibt lesend gegenueber dem produktiven Ausgabepfad.",
    "Der Render-Scene-Ingest ergaenzt keine Scene-, Root- oder Group-Geometrie."
]);

export function buildRendererKernelManifest() {
    return {
        entry: RENDERER_KERNEL_ENTRY,
        exportGroups: RENDERER_KERNEL_EXPORT_GROUPS,
        renderSceneContractVersion: RENDER_SCENE_CONTRACT_VERSION,
        renderScene: buildRenderSceneManifest(),
        sceneProfile: RENDERER_KERNEL_SCENE_PROFILE,
        sceneIngest: buildRendererKernelSceneIngestManifest(),
        invariants: RENDERER_KERNEL_INVARIANTS
    };
}
