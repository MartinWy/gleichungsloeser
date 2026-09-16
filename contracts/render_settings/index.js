export const RENDER_SETTINGS_CONTRACT_VERSION = "2026-08-09";

export const RENDER_SETTINGS_DEFAULTS = Object.freeze({
    fontSize: 30,
    textAbove: 24,
    textBelow: 10,
    charWidth: 17,
    operatorWidth: 14,
    sequenceGap: 10,
    fractionPad: 12,
    fractionGap: 10,
    mainFractionStrokeWidth: 1.6,
    secondaryFractionStrokeWidth: 1.2,
    mainFractionOvershoot: 3,
    secondaryFractionOvershoot: 2,
    rootColumnWidth: 34,
    rootOverbarRowHeight: 18,
    rootDeepPointRowHeight: 18,
    rootEntryStubRatio: 0.42,
    rootNotchRatio: 0.68,
    rootOverbarRightPad: 2,
    groupParenWidth: 14,
    groupSidePad: 2,
    parenHeightWidthRatio: 0.18,
    parenVerticalPad: 4,
    parenCurveFactor: 0.92,
    parenStrokeWidth: 2.4,
    powerGap: 4,
    exponentShiftX: 0,
    exponentScale: 0.62,
    exponentLift: 24,
    canvasMargin: 18,
    strokeWidth: 1.6
});

export const RENDER_SETTING_DEFINITIONS = Object.freeze([
    {
        key: "rootColumnWidth",
        group: "roots",
        label: "Wurzelspalte",
        min: 18,
        max: 56,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.rootColumnWidth,
        description: "Breite der eigenen Spalte links vom Inhalt."
    },
    {
        key: "rootOverbarRowHeight",
        group: "roots",
        label: "Oberstrich-Zeile",
        min: 8,
        max: 32,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.rootOverbarRowHeight,
        description: "Vertikale Reserve oberhalb des Inhalts bis zum Wurzelstrich."
    },
    {
        key: "rootDeepPointRowHeight",
        group: "roots",
        label: "Tiefpunkt-Zeile",
        min: 8,
        max: 36,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.rootDeepPointRowHeight,
        description: "Vertikale Reserve unterhalb des Inhalts bis zum Tiefpunkt."
    },
    {
        key: "rootEntryStubRatio",
        group: "roots",
        label: "Einstiegsstummel",
        min: 0.15,
        max: 0.75,
        step: 0.01,
        defaultValue: RENDER_SETTINGS_DEFAULTS.rootEntryStubRatio,
        description: "Laenge des waagerechten Einstiegssegments relativ zur Wurzelspalte."
    },
    {
        key: "rootNotchRatio",
        group: "roots",
        label: "Position des Tiefpunkts",
        min: 0.3,
        max: 0.95,
        step: 0.01,
        defaultValue: RENDER_SETTINGS_DEFAULTS.rootNotchRatio,
        description: "Horizontale Lage des Tiefpunkts relativ zur Wurzelspalte."
    },
    {
        key: "strokeWidth",
        group: "roots",
        label: "Strichstaerke",
        min: 0.8,
        max: 4.2,
        step: 0.1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.strokeWidth,
        description: "Linienstaerke der Wurzelgeometrie."
    },
    {
        key: "mainFractionStrokeWidth",
        group: "fractions",
        label: "Hauptbruchstrich",
        min: 0.8,
        max: 4.2,
        step: 0.1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.mainFractionStrokeWidth,
        description: "Linienstaerke fuer den aeusseren Bruchstrich einer Struktur."
    },
    {
        key: "secondaryFractionStrokeWidth",
        group: "fractions",
        label: "Nebenbruchstrich",
        min: 0.6,
        max: 3.6,
        step: 0.1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.secondaryFractionStrokeWidth,
        description: "Linienstaerke fuer verschachtelte innere Brueche."
    },
    {
        key: "mainFractionOvershoot",
        group: "fractions",
        label: "Hauptbruch-Ueberstand",
        min: 0,
        max: 12,
        step: 0.5,
        defaultValue: RENDER_SETTINGS_DEFAULTS.mainFractionOvershoot,
        description: "Zusaetzliche Breite links und rechts ueber die inhaltliche Mindestlaenge hinaus."
    },
    {
        key: "secondaryFractionOvershoot",
        group: "fractions",
        label: "Nebenbruch-Ueberstand",
        min: 0,
        max: 12,
        step: 0.5,
        defaultValue: RENDER_SETTINGS_DEFAULTS.secondaryFractionOvershoot,
        description: "Zusaetzliche Breite links und rechts fuer verschachtelte innere Brueche."
    },
    {
        key: "powerGap",
        group: "exponents",
        label: "Abstand zur Basis",
        min: 0,
        max: 20,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.powerGap,
        description: "Horizontaler Abstand zwischen Basis und Exponent."
    },
    {
        key: "exponentShiftX",
        group: "exponents",
        label: "Feinverschiebung X",
        min: -12,
        max: 12,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.exponentShiftX,
        description: "Optische Links/Rechts-Korrektur des Exponenten nach der normalen Platzierung."
    },
    {
        key: "exponentLift",
        group: "exponents",
        label: "Hoehe",
        min: 8,
        max: 42,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.exponentLift,
        description: "Wie weit der Exponent ueber die Grundlinie gehoben wird."
    },
    {
        key: "exponentScale",
        group: "exponents",
        label: "Groesse",
        min: 0.35,
        max: 0.9,
        step: 0.01,
        defaultValue: RENDER_SETTINGS_DEFAULTS.exponentScale,
        description: "Verhaeltnis von Exponentenschrift zu normaler Schrift."
    },
    {
        key: "groupParenWidth",
        group: "parentheses",
        label: "Mindestbreite",
        min: 8,
        max: 28,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.groupParenWidth,
        description: "Die kleinste Breite einer Klammer, auch wenn der Inhalt niedrig ist."
    },
    {
        key: "groupSidePad",
        group: "parentheses",
        label: "Innenabstand",
        min: 0,
        max: 12,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.groupSidePad,
        description: "Horizontaler Abstand zwischen Inhalt und Klammer."
    },
    {
        key: "parenHeightWidthRatio",
        group: "parentheses",
        label: "Breite nach Hoehe",
        min: 0.08,
        max: 0.34,
        step: 0.01,
        defaultValue: RENDER_SETTINGS_DEFAULTS.parenHeightWidthRatio,
        description: "Wie stark die Klammer mit wachsender Hoehe in die Breite geht."
    },
    {
        key: "parenVerticalPad",
        group: "parentheses",
        label: "Oben/Unten-Reserve",
        min: 0,
        max: 16,
        step: 1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.parenVerticalPad,
        description: "Vertikale Luft zwischen Klammer und Inhalt."
    },
    {
        key: "parenCurveFactor",
        group: "parentheses",
        label: "Kruemmung",
        min: 0.45,
        max: 0.98,
        step: 0.01,
        defaultValue: RENDER_SETTINGS_DEFAULTS.parenCurveFactor,
        description: "Wie weit die Klammer in der Mitte nach innen zieht."
    },
    {
        key: "parenStrokeWidth",
        group: "parentheses",
        label: "Strichstaerke",
        min: 1,
        max: 5,
        step: 0.1,
        defaultValue: RENDER_SETTINGS_DEFAULTS.parenStrokeWidth,
        description: "Linienstaerke der Klammersegmente."
    }
]);

export const RENDER_SETTING_GROUPS = Object.freeze([
    { id: "roots", title: "Wurzeln" },
    { id: "fractions", title: "Brueche" },
    { id: "exponents", title: "Exponenten" },
    { id: "parentheses", title: "Klammern" }
]);

export function getRenderSettingDefinitionsByGroup(groupId) {
    return RENDER_SETTING_DEFINITIONS.filter((definition) => definition.group === groupId);
}

export function buildRenderSettingsManifest() {
    return {
        version: RENDER_SETTINGS_CONTRACT_VERSION,
        defaults: RENDER_SETTINGS_DEFAULTS,
        groups: RENDER_SETTING_GROUPS,
        definitions: RENDER_SETTING_DEFINITIONS
    };
}
