import {
    BOUNDARY_STATE_REQUIRED_FIELDS,
    BRIDGE_INPUT_KEYS,
    LANDING_PROFILE_REQUIRED_FIELDS,
    createBoundaryStateTemplate,
    createLandingProfileTemplate
} from "../../contracts/bridge_state/index.js";

export const BRIDGE_INPUT_CONTRACT = Object.freeze({
    acceptedKeys: BRIDGE_INPUT_KEYS,
    requiredFields: {
        boundaryState: BOUNDARY_STATE_REQUIRED_FIELDS,
        landingProfile: LANDING_PROFILE_REQUIRED_FIELDS
    }
});

export function buildBridgeInputManifest() {
    return {
        contract: BRIDGE_INPUT_CONTRACT,
        templates: {
            boundaryState: createBoundaryStateTemplate(),
            landingProfile: createLandingProfileTemplate()
        }
    };
}
