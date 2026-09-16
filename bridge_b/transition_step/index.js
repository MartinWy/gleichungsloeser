import {
    BRIDGE_OPERATION_TYPES,
    BRIDGE_SUPPORTED_VARIANTS,
    BRIDGE_VARIANT_RULES,
    BOUNDARY_STATE_REQUIRED_FIELDS,
    LANDING_PROFILE_REQUIRED_FIELDS
} from "../../contracts/bridge_state/index.js";
import { buildBasedLogText } from "../../core/GenesisRuntime/logarithmNotation.js";

export const BRIDGE_STEP_OPERATION = BRIDGE_OPERATION_TYPES[0];

export const BRIDGE_STEP_INVARIANTS = Object.freeze([
    "B liest genau einen Grenzzustand und genau ein landing_profile.",
    "B erzeugt genau eine erste Startlage des Folgesystems.",
    "Das Gleichheitszeichen bleibt auf demselben Anker.",
    "Der Exponenteninhalt kommt als genau eine geschlossene funktionale Spur an.",
    "B faltet diese Spur genau einmal in einen normalen Slot je sichtbarem Atom auf.",
    "Der Exponenteninhalt bleibt als Inhaltsgeschichte identisch.",
    "Nach der Landung darf kein zweiter Positionssprung noetig sein."
]);

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

function readPath(source, path) {
    return String(path || "")
        .split(".")
        .filter(Boolean)
        .reduce((current, key) => (current == null ? undefined : current[key]), source);
}

function assertRequiredFields(source, requiredFields = [], label = "Objekt") {
    (requiredFields || []).forEach((path) => {
        const value = readPath(source, path);
        if (value === undefined || value === null || value === "") {
            throw new Error(`${label} fehlt Pflichtfeld ${path}.`);
        }
    });
}

function normalizeVariant(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return BRIDGE_SUPPORTED_VARIANTS.includes(normalized) ? normalized : null;
}

function resolveVariantRule(variant) {
    const normalizedVariant = normalizeVariant(variant);
    if (!normalizedVariant) {
        throw new Error(`Unbekannte Bridge-Variante "${variant}".`);
    }
    return BRIDGE_VARIANT_RULES[normalizedVariant];
}

function resolveOperatorTargetText(boundaryState, landingProfile) {
    const configured = String(landingProfile?.stories?.operator_target?.text || "").trim();
    if (configured) {
        return configured;
    }

    const baseText = String(boundaryState?.power_shell?.base?.text || "").trim();
    if (!baseText) {
        throw new Error("boundary_state.power_shell.base.text fehlt.");
    }

    return buildBasedLogText(baseText);
}

function resolveContentTargetText(boundaryState, landingProfile) {
    const configured = String(landingProfile?.stories?.content_target?.text || "").trim();
    if (configured) {
        return configured;
    }

    const contentText = String(boundaryState?.power_shell?.content?.text || "").trim();
    if (!contentText) {
        throw new Error("boundary_state.power_shell.content.text fehlt.");
    }

    return contentText;
}

function buildLandingEquationText(variant, operatorText, carryThroughText, contentText) {
    if (variant === "left") {
        return `${operatorText}(${carryThroughText}) = ${contentText}`;
    }

    return `${contentText} = ${operatorText}(${carryThroughText})`;
}

function collectSlotXs(termSlots = []) {
    return (Array.isArray(termSlots) ? termSlots : []).map((slot) => slot?.x);
}

export function validateBridgeStepInput(boundaryState, landingProfile) {
    assertRequiredFields(boundaryState, BOUNDARY_STATE_REQUIRED_FIELDS, "boundary_state");
    assertRequiredFields(landingProfile, LANDING_PROFILE_REQUIRED_FIELDS, "landing_profile");

    const variant = normalizeVariant(boundaryState.variant);
    const landingVariant = normalizeVariant(landingProfile.variant);

    if (!variant) {
        throw new Error(`boundary_state.variant "${boundaryState?.variant}" wird nicht unterstuetzt.`);
    }

    if (!landingVariant) {
        throw new Error(`landing_profile.variant "${landingProfile?.variant}" wird nicht unterstuetzt.`);
    }

    if (variant !== landingVariant) {
        throw new Error("boundary_state und landing_profile muessen dieselbe Variante tragen.");
    }

    const variantRule = resolveVariantRule(variant);
    const equalsAnchorX = boundaryState?.anchors?.equals?.x;
    const landingEqualsAnchorX = landingProfile?.equals_anchor_x;

    if (equalsAnchorX !== landingEqualsAnchorX) {
        throw new Error("Der Gleichheitsanker von boundary_state und landing_profile muss identisch sein.");
    }

    if (String(boundaryState?.carry_through?.side || "").trim().toLowerCase() !== variantRule.carryThroughSide) {
        throw new Error("boundary_state.carry_through.side verletzt die Variantenregel.");
    }

    if (String(landingProfile?.carry_through_side || "").trim().toLowerCase() !== variantRule.carryThroughSide) {
        throw new Error("landing_profile.carry_through_side verletzt die Variantenregel.");
    }

    if (String(landingProfile?.term_side || "").trim().toLowerCase() !== variantRule.termSide) {
        throw new Error("landing_profile.term_side verletzt die Variantenregel.");
    }

    if (variant === "left" && String(boundaryState?.power_shell?.side || "").trim().toLowerCase() !== "right") {
        throw new Error("In der linken Variante muss die relevante Potenzschale rechts stehen.");
    }

    if (variant === "right" && String(boundaryState?.power_shell?.side || "").trim().toLowerCase() !== "left") {
        throw new Error("In der rechten Variante muss die relevante Potenzschale links stehen.");
    }

    if (landingProfile?.no_second_jump !== true) {
        throw new Error("landing_profile.no_second_jump muss true sein.");
    }

    const slotXs = collectSlotXs(landingProfile?.term_slots);
    if (slotXs.some((value) => !Number.isFinite(value))) {
        throw new Error("landing_profile.term_slots muessen echte x-Positionen enthalten.");
    }

    const sourceTrackCount = boundaryState?.power_shell?.content?.functional_track_count;
    const requestedSourceTrackCount = landingProfile?.source_exponent_track_count;
    const orderedCells = Array.isArray(boundaryState?.power_shell?.content?.ordered_cells)
        ? boundaryState.power_shell.content.ordered_cells
        : [];

    if (sourceTrackCount !== 1 || requestedSourceTrackCount !== 1) {
        throw new Error("Bridge B erwartet vor dem Oeffnen genau eine geschlossene Exponentenspur.");
    }

    if (orderedCells.length === 0) {
        throw new Error("boundary_state.power_shell.content.ordered_cells darf fuer Bridge B nicht leer sein.");
    }

    if (orderedCells.length !== slotXs.length) {
        throw new Error(
            `Bridge B muss die eine Exponentenspur in genau einen Landing-Slot je P4-Zelle auffalten: ${orderedCells.length} Zellen, ${slotXs.length} Slots.`
        );
    }

    const orderedCellTexts = orderedCells.map((cell) => String(cell?.text || ""));
    const landingCellTexts = (landingProfile?.term_slots || []).map((slot) => (
        typeof slot?.source_text === "string" ? slot.source_text : null
    ));

    if (
        landingCellTexts.every((text) => text !== null)
        && orderedCellTexts.some((text, index) => text !== landingCellTexts[index])
    ) {
        throw new Error(
            `Bridge B erhielt verschiedene Zellfolgen: Boundary ${orderedCellTexts.join(" ")}, Landing ${landingCellTexts.join(" ")}.`
        );
    }

    return {
        variant,
        variantRule
    };
}

export function buildBridgeLandingState(boundaryState, landingProfile) {
    const { variant } = validateBridgeStepInput(boundaryState, landingProfile);
    const operatorText = resolveOperatorTargetText(boundaryState, landingProfile);
    const carryThroughText = String(boundaryState?.carry_through?.text || "").trim();
    const contentSourceText = String(boundaryState?.power_shell?.content?.text || "").trim();
    const contentTargetText = resolveContentTargetText(boundaryState, landingProfile);

    if (!carryThroughText) {
        throw new Error("boundary_state.carry_through.text fehlt.");
    }

    if (!contentSourceText) {
        throw new Error("boundary_state.power_shell.content.text fehlt.");
    }

    return {
        equation_text: buildLandingEquationText(variant, operatorText, carryThroughText, contentTargetText),
        variant,
        target_symbol: String(boundaryState?.target_symbol || "").trim() || null,
        anchors: {
            equals: {
                x: landingProfile.equals_anchor_x
            }
        },
        stories: {
            operator: {
                source: String(boundaryState?.power_shell?.base?.text || "").trim(),
                target: operatorText,
                color_role: "blue",
                source_id: boundaryState?.power_shell?.base?.id || null,
                target_ids: cloneValue(boundaryState?.identity_map?.operator_story || [])
            },
            content: {
                source: contentSourceText,
                target: contentTargetText,
                color_role: "orange",
                source_id: boundaryState?.power_shell?.content?.id || null,
                target_ids: cloneValue(boundaryState?.identity_map?.content_story || []),
                ordered_cells: cloneValue(boundaryState?.power_shell?.content?.ordered_cells || [])
            },
            carry_through: {
                source: carryThroughText,
                side: String(landingProfile?.carry_through_side || "").trim().toLowerCase(),
                group_id: boundaryState?.carry_through?.group_id || null
            }
        },
        layout: {
            equals_anchor_x: landingProfile.equals_anchor_x,
            carry_through_zone_x: landingProfile?.carry_through_zone?.x ?? null,
            carry_through_zone_width: landingProfile?.carry_through_zone?.width ?? null,
            term_zone_x: landingProfile?.term_zone?.x ?? null,
            term_zone_width: landingProfile?.term_zone?.width ?? null,
            term_slots: collectSlotXs(landingProfile?.term_slots),
            term_slot_roles: cloneValue((landingProfile?.term_slots || []).map((slot) => slot?.role || null)),
            term_cell_bindings: cloneValue(landingProfile?.term_slots || []),
            source_exponent_track_count: 1,
            target_term_track_count: collectSlotXs(landingProfile?.term_slots).length
        },
        step_meta: {
            operation_type: BRIDGE_STEP_OPERATION,
            display_text: operatorText,
            no_second_jump: true
        }
    };
}

export function buildBridgeTransitionManifest() {
    return {
        operation: BRIDGE_STEP_OPERATION,
        supportedVariants: BRIDGE_SUPPORTED_VARIANTS,
        invariants: BRIDGE_STEP_INVARIANTS
    };
}
