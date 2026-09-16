export const WORKSHEET_PROFILE_CONTRACT_VERSION = "2026-08-09";

export const WORKSHEET_RUNTIME_ENGINES = Object.freeze([
    "genesis_runtime"
]);

export const WORKSHEET_POWER_INVERSE_STYLES = Object.freeze([
    "root",
    "fractional-exponent"
]);

export const WORKSHEET_COLOR_PALETTE = Object.freeze([
    Object.freeze({ key: "none", label: "Keine Farbe", value: "" }),
    Object.freeze({ key: "red", label: "Rot", value: "#B91C1C" }),
    Object.freeze({ key: "blue", label: "Blau", value: "#1D4ED8" }),
    Object.freeze({ key: "green", label: "Gruen", value: "#15803D" }),
    Object.freeze({ key: "orange", label: "Orange", value: "#D97706" }),
    Object.freeze({ key: "yellow", label: "Gelb", value: "#CA8A04" }),
    Object.freeze({ key: "black", label: "Schwarz", value: "#000000" })
]);

export const WORKSHEET_CONTROL_GROUPS = Object.freeze([
    { id: "worksheet", title: "Aufgabe" },
    { id: "visibility", title: "Zeilen" },
    { id: "colors", title: "Farben" },
    { id: "export", title: "Export" }
]);

export const WORKSHEET_PROFILE_DEFAULTS = Object.freeze({
    runtimeEngine: "genesis_runtime",
    powerInverseStyle: "root",
    hiddenStepIndexes: [],
    componentColors: {}
});

export const WORKSHEET_CONTROL_DEFINITIONS = Object.freeze([
    {
        key: "equation",
        group: "worksheet",
        controlType: "text",
        label: "Gleichung",
        required: true
    },
    {
        key: "targetVariable",
        group: "worksheet",
        controlType: "text",
        label: "Zielvariable",
        required: false
    },
    {
        key: "powerInverseStyle",
        group: "worksheet",
        controlType: "select",
        label: "Inverse Potenz",
        options: WORKSHEET_POWER_INVERSE_STYLES
    },
    {
        key: "hiddenStepIndexes",
        group: "visibility",
        controlType: "step-visibility",
        label: "Zeilen ausblenden"
    },
    {
        key: "componentColors",
        group: "colors",
        controlType: "color-targets",
        label: "Farben"
    },
    {
        key: "previewImage",
        group: "export",
        controlType: "preview-image",
        label: "Vorschau"
    },
    {
        key: "pdfLink",
        group: "export",
        controlType: "pdf-link",
        label: "PDF"
    }
]);

export const WORKSHEET_PROFILE_INVARIANTS = Object.freeze([
    "Das User-Cockpit baut keine zweite Solverlogik.",
    "Ausgeblendete Zeilen bleiben im Layout als Platzhalter erhalten.",
    "Farbziele duerfen die Zielvariable atomar markieren, aber keine Schalen mitfaerben.",
    "Das User-Cockpit nutzt denselben Renderpfad wie Vorschau, Arbeitsblatt und PDF."
]);

export function buildWorksheetProfileManifest() {
    return {
        version: WORKSHEET_PROFILE_CONTRACT_VERSION,
        runtimeEngines: WORKSHEET_RUNTIME_ENGINES,
        powerInverseStyles: WORKSHEET_POWER_INVERSE_STYLES,
        defaults: WORKSHEET_PROFILE_DEFAULTS,
        controlGroups: WORKSHEET_CONTROL_GROUPS,
        controls: WORKSHEET_CONTROL_DEFINITIONS,
        colorPalette: WORKSHEET_COLOR_PALETTE,
        invariants: WORKSHEET_PROFILE_INVARIANTS
    };
}
