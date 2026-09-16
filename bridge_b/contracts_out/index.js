import {
    BRIDGE_OUTPUT_KEYS,
    LANDING_STATE_REQUIRED_FIELDS,
    createLandingStateTemplate
} from "../../contracts/bridge_state/index.js";

export const BRIDGE_OUTPUT_CONTRACT = Object.freeze({
    providedKeys: BRIDGE_OUTPUT_KEYS,
    requiredFields: {
        landingState: LANDING_STATE_REQUIRED_FIELDS
    }
});

export function buildBridgeOutputManifest() {
    return {
        contract: BRIDGE_OUTPUT_CONTRACT,
        templates: {
            landingState: createLandingStateTemplate()
        }
    };
}
