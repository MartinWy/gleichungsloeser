export const PROJECTION_STATE_CONTRACT_VERSION = "2026-08-09";

export const PROJECTION_STATE_REQUIRED_FIELDS = Object.freeze([
    "projectionRows",
    "layoutPlan",
    "projectionAtomRegister",
    "traceIndex"
]);

export const PROJECTION_ROW_REQUIRED_FIELDS = Object.freeze([
    "rowId",
    "positionedAtoms"
]);

export const LAYOUT_PLAN_REQUIRED_FIELDS = Object.freeze([
    "mode",
    "anchorColumn",
    "columnCount",
    "rowCount"
]);

export const PROJECTION_STATE_TEMPLATE = Object.freeze({
    projectionRows: [
        {
            rowId: "projection-0",
            positionedAtoms: []
        }
    ],
    layoutPlan: {
        mode: "two_pass_preflight",
        anchorColumn: 2,
        columnCount: 4,
        rowCount: 2
    },
    projectionAtomRegister: [],
    traceIndex: {}
});

export const PROJECTION_STATE_INVARIANTS = Object.freeze([
    "Positionstreue ist Teil des Kernexports und kein spaeter UI-Schritt.",
    "Das Gleichheitszeichen bleibt als Anker ueber die Zeilen lesbar.",
    "Projektionsdaten muessen ohne Neuloesen konsumierbar sein."
]);

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

export function buildProjectionStateManifest() {
    return {
        version: PROJECTION_STATE_CONTRACT_VERSION,
        requiredFields: PROJECTION_STATE_REQUIRED_FIELDS,
        rowRequiredFields: PROJECTION_ROW_REQUIRED_FIELDS,
        layoutRequiredFields: LAYOUT_PLAN_REQUIRED_FIELDS,
        invariants: PROJECTION_STATE_INVARIANTS,
        template: cloneValue(PROJECTION_STATE_TEMPLATE)
    };
}
