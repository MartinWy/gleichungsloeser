import { buildRenderSceneManifest } from "../../contracts/render_scene/index.js";
import { buildWorksheetProfileManifest } from "../../contracts/worksheet_profile/index.js";
import { USER_COLOR_CONTROL_DEFINITIONS, USER_COLOR_INVARIANTS, USER_COLOR_PALETTE } from "../color_controls/index.js";
import { USER_EXPORT_CONTROL_DEFINITIONS, USER_EXPORT_INVARIANTS } from "../export_controls/index.js";
import { USER_COCKPIT_ENTRY } from "../ui/index.js";
import { USER_VISIBILITY_CONTROL_DEFINITIONS, USER_VISIBILITY_INVARIANTS } from "../visibility_controls/index.js";
import { USER_WORKSHEET_CONTROL_DEFINITIONS, USER_WORKSHEET_CONTROL_OPTIONS } from "../worksheet_controls/index.js";

export function buildUserCockpitManifest() {
    return {
        entry: USER_COCKPIT_ENTRY,
        renderScene: buildRenderSceneManifest(),
        worksheetProfile: buildWorksheetProfileManifest(),
        controls: {
            worksheet: USER_WORKSHEET_CONTROL_DEFINITIONS,
            visibility: USER_VISIBILITY_CONTROL_DEFINITIONS,
            colors: USER_COLOR_CONTROL_DEFINITIONS,
            export: USER_EXPORT_CONTROL_DEFINITIONS
        },
        options: USER_WORKSHEET_CONTROL_OPTIONS,
        palette: USER_COLOR_PALETTE,
        invariants: [
            ...USER_VISIBILITY_INVARIANTS,
            ...USER_COLOR_INVARIANTS,
            ...USER_EXPORT_INVARIANTS
        ]
    };
}
