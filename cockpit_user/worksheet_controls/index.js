import {
    WORKSHEET_CONTROL_DEFINITIONS,
    WORKSHEET_POWER_INVERSE_STYLES,
    WORKSHEET_RUNTIME_ENGINES
} from "../../contracts/worksheet_profile/index.js";

export const USER_WORKSHEET_CONTROL_DEFINITIONS = Object.freeze(
    WORKSHEET_CONTROL_DEFINITIONS.filter((definition) => definition.group === "worksheet")
);

export const USER_WORKSHEET_CONTROL_OPTIONS = Object.freeze({
    runtimeEngines: WORKSHEET_RUNTIME_ENGINES,
    powerInverseStyles: WORKSHEET_POWER_INVERSE_STYLES
});
