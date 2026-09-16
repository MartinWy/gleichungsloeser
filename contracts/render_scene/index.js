export const RENDER_SCENE_CONTRACT_VERSION = "2026-08-09";

export const RENDER_SCENE_COORDINATE_SPACES = Object.freeze([
    "p4_projection_or_transition_local",
    "worksheet_display_grid",
    "renderer_kernel_local",
    "transition_local"
]);

export const RENDER_SCENE_NODE_TYPES = Object.freeze([
    "atom",
    "anchor",
    "group",
    "function",
    "division",
    "fraction_line",
    "root",
    "power",
    "operator_story",
    "content_story"
]);

export const RENDER_SCENE_REQUIRED_FIELDS = Object.freeze([
    "sceneId",
    "sourceProject",
    "coordinateSpace",
    "atoms",
    "shells",
    "focusIds"
]);

export const RENDER_SCENE_NODE_REQUIRED_FIELDS = Object.freeze([
    "id",
    "type"
]);

export const RENDER_SCENE_TEMPLATE = Object.freeze({
    sceneId: "before_state",
    sourceProject: "6_Gleichungsloeser",
    sourceCommit: "HEAD",
    coordinateSpace: "p4_projection_or_transition_local",
    atoms: [],
    shells: [],
    focusIds: [],
    notes: ""
});

export const RENDER_SCENE_INVARIANTS = Object.freeze([
    "Render-Szenen beschreiben Sichtbarkeit, nicht Algebra.",
    "Eine Render-Szene darf keine zweite Solverwahrheit aufbauen.",
    "Dieselbe semantische Spur behaelt ueber Szenen hinweg ihre stabile Identitaet.",
    "Start- und Endzustand bleiben mathematisch extern entschieden."
]);

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwnField(objectValue, fieldPath = "") {
    return String(fieldPath)
        .split(".")
        .filter(Boolean)
        .every((segment, index, segments) => {
            const parent = segments.slice(0, index).reduce((current, key) => (
                isPlainObject(current) || Array.isArray(current) ? current[key] : undefined
            ), objectValue);

            return parent !== null && parent !== undefined && Object.prototype.hasOwnProperty.call(parent, segment);
        });
}

export function buildRenderSceneManifest() {
    return {
        version: RENDER_SCENE_CONTRACT_VERSION,
        coordinateSpaces: RENDER_SCENE_COORDINATE_SPACES,
        nodeTypes: RENDER_SCENE_NODE_TYPES,
        requiredFields: RENDER_SCENE_REQUIRED_FIELDS,
        nodeRequiredFields: RENDER_SCENE_NODE_REQUIRED_FIELDS,
        invariants: RENDER_SCENE_INVARIANTS,
        template: cloneValue(RENDER_SCENE_TEMPLATE)
    };
}

export function validateRenderSceneNode(node = {}) {
    const errors = [];

    if (!isPlainObject(node)) {
        return {
            valid: false,
            errors: ["Render-Szenenknoten muss ein Objekt sein."]
        };
    }

    RENDER_SCENE_NODE_REQUIRED_FIELDS.forEach((field) => {
        if (!hasOwnField(node, field)) {
            errors.push(`Render-Szenenknoten fehlt Pflichtfeld ${field}.`);
        }
    });

    if (node.type && !RENDER_SCENE_NODE_TYPES.includes(node.type)) {
        errors.push(`Render-Szenenknoten hat ungueltigen Typ ${node.type}.`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function validateRenderScene(scene = {}) {
    const errors = [];

    if (!isPlainObject(scene)) {
        return {
            valid: false,
            errors: ["Render-Szene muss ein Objekt sein."]
        };
    }

    RENDER_SCENE_REQUIRED_FIELDS.forEach((field) => {
        if (!hasOwnField(scene, field)) {
            errors.push(`Render-Szene fehlt Pflichtfeld ${field}.`);
        }
    });

    if (scene.coordinateSpace && !RENDER_SCENE_COORDINATE_SPACES.includes(scene.coordinateSpace)) {
        errors.push(`Render-Szene hat ungueltigen Koordinatenraum ${scene.coordinateSpace}.`);
    }

    if (hasOwnField(scene, "focusIds") && !Array.isArray(scene.focusIds)) {
        errors.push("Render-Szene muss focusIds als Array liefern.");
    }

    if (hasOwnField(scene, "atoms") && !Array.isArray(scene.atoms)) {
        errors.push("Render-Szene muss atoms als Array liefern.");
    }

    if (hasOwnField(scene, "shells") && !Array.isArray(scene.shells)) {
        errors.push("Render-Szene muss shells als Array liefern.");
    }

    const atomNodes = Array.isArray(scene.atoms) ? scene.atoms : [];
    const shellNodes = Array.isArray(scene.shells) ? scene.shells : [];

    atomNodes.forEach((node, index) => {
        const nodeValidation = validateRenderSceneNode(node);
        nodeValidation.errors.forEach((error) => {
            errors.push(`atoms[${index}]: ${error}`);
        });
    });

    shellNodes.forEach((node, index) => {
        const nodeValidation = validateRenderSceneNode(node);
        nodeValidation.errors.forEach((error) => {
            errors.push(`shells[${index}]: ${error}`);
        });
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

export function validateRenderScenes(scenes = []) {
    const errors = [];

    if (!Array.isArray(scenes)) {
        return {
            valid: false,
            errors: ["Render-Szenenfolge muss ein Array sein."]
        };
    }

    scenes.forEach((scene, index) => {
        const sceneValidation = validateRenderScene(scene);
        sceneValidation.errors.forEach((error) => {
            errors.push(`scene[${index}]: ${error}`);
        });
    });

    return {
        valid: errors.length === 0,
        errors
    };
}
