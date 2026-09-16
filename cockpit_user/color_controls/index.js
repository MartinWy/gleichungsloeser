import { WORKSHEET_COLOR_PALETTE } from "../../contracts/worksheet_profile/index.js";

export const USER_COLOR_CONTROL_DEFINITIONS = Object.freeze([
    {
        key: "componentColors",
        controlType: "color-targets",
        label: "Farben",
        targetKinds: ["row-operation", "target-variable", "carry-through-story"]
    }
]);

export const USER_COLOR_INVARIANTS = Object.freeze([
    "Farben sind aufgabenbezogen und nicht globale Renderer-Geometrie.",
    "Die Zielvariable darf als eigenes atomares Ziel gefaerbt werden.",
    "Operatoren und Umkehrfunktionen faerben ihr Argument nicht automatisch mit."
]);

export { WORKSHEET_COLOR_PALETTE as USER_COLOR_PALETTE };
