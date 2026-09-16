export const BRIDGE_STATE_CONTRACT_VERSION = "2026-09-09";

export const BRIDGE_SUPPORTED_VARIANTS = Object.freeze(["left", "right"]);
export const BRIDGE_OPERATION_TYPES = Object.freeze(["power_shell_break"]);

export const BRIDGE_INPUT_KEYS = Object.freeze([
    "boundary_state",
    "landing_profile"
]);

export const BRIDGE_OUTPUT_KEYS = Object.freeze([
    "landing_state"
]);

export const BOUNDARY_STATE_REQUIRED_FIELDS = Object.freeze([
    "variant",
    "target_symbol",
    "anchors.equals",
    "power_shell.side",
    "power_shell.base",
    "power_shell.content",
    "power_shell.content.functional_track_count",
    "power_shell.content.ordered_cells",
    "carry_through",
    "identity_map"
]);

export const LANDING_PROFILE_REQUIRED_FIELDS = Object.freeze([
    "system_id",
    "variant",
    "equals_anchor_x",
    "term_side",
    "term_zone",
    "term_slots",
    "source_exponent_track_count",
    "carry_through_side",
    "carry_through_zone",
    "no_second_jump"
]);

export const LANDING_STATE_REQUIRED_FIELDS = Object.freeze([
    "variant",
    "anchors.equals",
    "stories.operator",
    "stories.content",
    "layout.term_zone_x",
    "layout.term_slots",
    "step_meta.operation_type"
]);

export const BOUNDARY_STATE_TEMPLATE = Object.freeze({
    equation_text: "y/a = B^(2x-1)",
    variant: "left",
    target_symbol: "x",
    anchors: {
        equals: {
            x: 310
        }
    },
    power_shell: {
        shell_id: "power_1",
        side: "right",
        base: {
            id: "base_B",
            text: "B",
            role: "operator_source"
        },
        content: {
            id: "exp_content_1",
            text: "2x-1",
            contains_target: true,
            functional_track_count: 1,
            ordered_cells: [
                { id: "exp_1", text: "2", role: "content" },
                { id: "exp_2", text: "*", role: "content" },
                { id: "exp_3", text: "x", role: "target" },
                { id: "exp_4", text: "-", role: "content" },
                { id: "exp_5", text: "1", role: "content" }
            ]
        }
    },
    carry_through: {
        side: "left",
        text: "y/a",
        group_id: "carry_group_1"
    },
    identity_map: {
        operator_story: ["base_B", "log_B"],
        content_story: ["exp_content_1", "rhs_content_1"]
    }
});

export const LANDING_PROFILE_TEMPLATE = Object.freeze({
    system_id: "A2",
    variant: "left",
    preview_equation: "log_B(y/a) = 2x-1",
    equals_anchor_x: 310,
    term_side: "right",
    carry_through_side: "left",
    carry_through_zone: {
        x: 40,
        width: 236
    },
    term_zone: {
        x: 436,
        width: 220
    },
    term_slots: [
        { role: "content_1", x: 466 },
        { role: "content_2", x: 514 },
        { role: "content_3", x: 570 },
        { role: "content_4", x: 616 },
        { role: "content_5", x: 664 }
    ],
    source_exponent_track_count: 1,
    stories: {
        operator_target: {
            text: "log_B",
            side: "left"
        },
        content_target: {
            text: "2x-1",
            side: "right"
        }
    },
    no_second_jump: true
});

export const LANDING_STATE_TEMPLATE = Object.freeze({
    equation_text: "log_B(y/a) = 2x-1",
    variant: "left",
    anchors: {
        equals: {
            x: 310
        }
    },
    stories: {
        operator: {
            source: "B",
            target: "log_B",
            color_role: "blue"
        },
        content: {
            source: "2x-1",
            target: "2x-1",
            color_role: "orange"
        }
    },
    layout: {
        term_zone_x: 436,
        term_slots: [466, 514, 570, 616, 664],
        source_exponent_track_count: 1,
        target_term_track_count: 5
    },
    step_meta: {
        operation_type: "power_shell_break",
        display_text: "log_B"
    }
});

export const BRIDGE_STATE_INVARIANTS = Object.freeze([
    "B fuehrt genau einen Grenzschritt aus.",
    "B entfernt keine Vorstufe von A1.",
    "B fuehrt keine Folgeschritte von A2 aus.",
    "Das Gleichheitszeichen bleibt auf seinem festen Anker.",
    "Der komplexe Exponent ist an der Boundary genau eine geschlossene funktionale Spur.",
    "B faltet diese eine Spur genau einmal in einen Landing-Slot je sichtbarem Atom auf.",
    "landing_state ist bereits die echte Startlage von A2.",
    "Alte Reservespalten duerfen nicht mechanisch weitergetragen werden."
]);

export const BRIDGE_VARIANT_RULES = Object.freeze({
    left: Object.freeze({
        boundaryEquation: "y/a = B^(2x-1)",
        landingEquation: "log_B(y/a) = 2x-1",
        carryThroughSide: "left",
        termSide: "right"
    }),
    right: Object.freeze({
        boundaryEquation: "B^(2x-1) = y/a",
        landingEquation: "2x-1 = log_B(y/a)",
        carryThroughSide: "right",
        termSide: "left"
    })
});

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

export function createBoundaryStateTemplate(overrides = {}) {
    return {
        ...cloneValue(BOUNDARY_STATE_TEMPLATE),
        ...cloneValue(overrides)
    };
}

export function createLandingProfileTemplate(overrides = {}) {
    return {
        ...cloneValue(LANDING_PROFILE_TEMPLATE),
        ...cloneValue(overrides)
    };
}

export function createLandingStateTemplate(overrides = {}) {
    return {
        ...cloneValue(LANDING_STATE_TEMPLATE),
        ...cloneValue(overrides)
    };
}

export function buildBridgeStateContractManifest() {
    return {
        version: BRIDGE_STATE_CONTRACT_VERSION,
        supportedVariants: BRIDGE_SUPPORTED_VARIANTS,
        operationTypes: BRIDGE_OPERATION_TYPES,
        io: {
            inputs: BRIDGE_INPUT_KEYS,
            outputs: BRIDGE_OUTPUT_KEYS
        },
        requiredFields: {
            boundaryState: BOUNDARY_STATE_REQUIRED_FIELDS,
            landingProfile: LANDING_PROFILE_REQUIRED_FIELDS,
            landingState: LANDING_STATE_REQUIRED_FIELDS
        },
        invariants: BRIDGE_STATE_INVARIANTS,
        variants: BRIDGE_VARIANT_RULES,
        templates: {
            boundaryState: cloneValue(BOUNDARY_STATE_TEMPLATE),
            landingProfile: cloneValue(LANDING_PROFILE_TEMPLATE),
            landingState: cloneValue(LANDING_STATE_TEMPLATE)
        }
    };
}
