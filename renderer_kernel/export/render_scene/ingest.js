import {
    RENDER_SCENE_CONTRACT_VERSION,
    validateRenderScene,
    validateRenderScenes
} from "../../../contracts/render_scene/index.js";

const SHELL_NODE_TYPES = new Set([
    "group",
    "function",
    "division",
    "fraction_line",
    "root",
    "power"
]);

function sortNodesByScenePosition(left = {}, right = {}) {
    const leftRow = left?.position?.absoluteRow ?? Number.MAX_SAFE_INTEGER;
    const rightRow = right?.position?.absoluteRow ?? Number.MAX_SAFE_INTEGER;

    if (leftRow !== rightRow) {
        return leftRow - rightRow;
    }

    const leftCol = left?.position?.colStart ?? left?.position?.col ?? Number.MAX_SAFE_INTEGER;
    const rightCol = right?.position?.colStart ?? right?.position?.col ?? Number.MAX_SAFE_INTEGER;

    if (leftCol !== rightCol) {
        return leftCol - rightCol;
    }

    return String(left?.id || "").localeCompare(String(right?.id || ""));
}

function buildRowBuckets(nodes = []) {
    const buckets = new Map();

    nodes.forEach((node) => {
        const absoluteRow = Number.isInteger(node?.position?.absoluteRow)
            ? node.position.absoluteRow
            : Number.isInteger(node?.position?.localRow)
                ? node.position.localRow
                : 0;

        if (!buckets.has(absoluteRow)) {
            buckets.set(absoluteRow, []);
        }

        buckets.get(absoluteRow).push(node);
    });

    return [...buckets.entries()]
        .sort((left, right) => left[0] - right[0])
        .map(([absoluteRow, rowNodes]) => ({
            absoluteRow,
            nodes: [...rowNodes].sort(sortNodesByScenePosition),
            minColumn: rowNodes.reduce((currentMin, node) => {
                const col = node?.position?.colStart ?? node?.position?.col;
                return Number.isInteger(col) ? Math.min(currentMin, col) : currentMin;
            }, Number.MAX_SAFE_INTEGER),
            maxColumn: rowNodes.reduce((currentMax, node) => {
                const col = node?.position?.colEnd ?? node?.position?.col;
                return Number.isInteger(col) ? Math.max(currentMax, col) : currentMax;
            }, Number.MIN_SAFE_INTEGER)
        }))
        .map((bucket) => ({
            ...bucket,
            rowRoles: [...new Set(
                (bucket.nodes || [])
                    .map((node) => node?.position?.rowRole)
                    .filter((rowRole) => typeof rowRole === "string" && rowRole.length > 0)
            )],
            minColumn: bucket.minColumn === Number.MAX_SAFE_INTEGER ? null : bucket.minColumn,
            maxColumn: bucket.maxColumn === Number.MIN_SAFE_INTEGER ? null : bucket.maxColumn
        }));
}

function classifySceneNodes(nodes = []) {
    const orderedNodes = [...nodes].sort(sortNodesByScenePosition);

    return {
        all: orderedNodes,
        atoms: orderedNodes.filter((node) => node.type === "atom"),
        anchors: orderedNodes.filter((node) => node.type === "anchor"),
        shells: orderedNodes.filter((node) => SHELL_NODE_TYPES.has(node.type)),
        roots: orderedNodes.filter((node) => node.type === "root"),
        powers: orderedNodes.filter((node) => node.type === "power"),
        functions: orderedNodes.filter((node) => node.type === "function"),
        fractions: orderedNodes.filter((node) => node.type === "division" || node.type === "fraction_line"),
        groups: orderedNodes.filter((node) => node.type === "group")
    };
}

function buildRendererKernelSceneRows(sceneNodes = []) {
    return buildRowBuckets(sceneNodes);
}

export function buildRendererKernelSceneInput(scene = {}, options = {}) {
    const validation = validateRenderScene(scene);
    if (!validation.valid) {
        throw new Error(`Ungueltige render_scene-Eingabe: ${validation.errors.join(" | ")}`);
    }

    const includeInvisible = options.includeInvisible === true;
    const rawNodes = Array.isArray(scene?.atoms) ? scene.atoms : [];
    const visibleNodes = includeInvisible
        ? rawNodes
        : rawNodes.filter((node) => node?.isVisible !== false);
    const classifiedNodes = classifySceneNodes(visibleNodes);
    const rows = buildRendererKernelSceneRows(classifiedNodes.all);

    return {
        sceneId: scene.sceneId,
        coordinateSpace: scene.coordinateSpace,
        sourceProject: scene.sourceProject || null,
        sourceCommit: scene.sourceCommit || null,
        focusIds: Array.isArray(scene.focusIds) ? [...scene.focusIds] : [],
        bounds: scene.bounds || null,
        notes: scene.notes || "",
        rowMeta: scene.rowMeta || null,
        layout: scene.layout || null,
        counts: {
            all: classifiedNodes.all.length,
            atoms: classifiedNodes.atoms.length,
            anchors: classifiedNodes.anchors.length,
            shells: classifiedNodes.shells.length,
            rows: rows.length
        },
        nodes: classifiedNodes,
        rows,
        ingestPolicy: {
            includeInvisible,
            sortOrder: "absoluteRow_then_column",
            contractVersion: RENDER_SCENE_CONTRACT_VERSION
        }
    };
}

export function buildRendererKernelSceneSequenceInput(scenes = [], options = {}) {
    const validation = validateRenderScenes(scenes);
    if (!validation.valid) {
        throw new Error(`Ungueltige render_scene-Sequenz: ${validation.errors.join(" | ")}`);
    }

    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        sceneCount: scenes.length,
        scenes: scenes.map((scene) => buildRendererKernelSceneInput(scene, options))
    };
}

export function buildRendererKernelSceneIngestManifest() {
    return {
        contractVersion: RENDER_SCENE_CONTRACT_VERSION,
        adapterType: "render_scene_to_renderer_kernel_input",
        sceneGranularity: "one_ingest_result_per_scene",
        invariants: [
            "Der Ingest liest nur vorhandene Szenenknoten.",
            "Der Ingest berechnet keine neue mathematische Struktur.",
            "Der Ingest sortiert nur nach vorhandenen Reihen- und Spaltenwerten.",
            "Unsichtbare Knoten bleiben standardmaessig draussen, koennen aber bewusst mitgenommen werden."
        ]
    };
}
