import { buildRenderSettingsManifest } from "../../contracts/render_settings/index.js";
import { buildRenderSceneManifest } from "../../contracts/render_scene/index.js";
import { DESIGNER_DIAGNOSTIC_PREVIEWS } from "../diagnostics/index.js";
import { EXPONENT_CONTROL_DEFINITIONS } from "../exponent_controls/index.js";
import { FRACTION_CONTROL_DEFINITIONS } from "../fraction_controls/index.js";
import { PARENTHESIS_CONTROL_DEFINITIONS } from "../parenthesis_controls/index.js";
import { ROOT_CONTROL_DEFINITIONS } from "../root_controls/index.js";
import { DESIGNER_COCKPIT_ENTRY } from "../ui/index.js";

export function buildDesignerCockpitManifest() {
    return {
        entry: DESIGNER_COCKPIT_ENTRY,
        renderScene: buildRenderSceneManifest(),
        renderSettings: buildRenderSettingsManifest(),
        controls: {
            roots: ROOT_CONTROL_DEFINITIONS,
            fractions: FRACTION_CONTROL_DEFINITIONS,
            exponents: EXPONENT_CONTROL_DEFINITIONS,
            parentheses: PARENTHESIS_CONTROL_DEFINITIONS
        },
        diagnostics: DESIGNER_DIAGNOSTIC_PREVIEWS
    };
}
