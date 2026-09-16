export const SOLVE_STATE_CONTRACT_VERSION = "2026-08-09";

export const SOLVE_STATE_REQUIRED_FIELDS = Object.freeze([
    "eingabe",
    "targetVariable",
    "schritte",
    "exportData"
]);

export const SOLVE_STATE_EXPORT_REQUIRED_FIELDS = Object.freeze([
    "atomRegister",
    "projectionAtomRegister",
    "traceIndex",
    "theoryRows",
    "projectionRows",
    "layoutPlan"
]);

export const SOLVE_STATE_RUNTIME_ENGINES = Object.freeze([
    "genesis_runtime",
    "legacy"
]);

export const SOLVE_STATE_SUCCESS_TEMPLATE = Object.freeze({
    eingabe: "a^2+b^2=c^2",
    targetVariable: "a",
    finaleStruktur: [],
    schritte: [],
    exportData: {
        eingabe: "a^2+b^2=c^2",
        atomRegister: [],
        projectionAtomRegister: [],
        traceIndex: {},
        theoryRows: [],
        projectionRows: [],
        layoutPlan: {
            mode: "two_pass_preflight",
            anchorColumn: 0,
            columnCount: 0,
            rowCount: 0
        }
    }
});

export const SOLVE_STATE_ERROR_TEMPLATE = Object.freeze({
    fehler: "Die Zielvariable kommt nicht vor."
});

export const SOLVE_STATE_INVARIANTS = Object.freeze([
    "Der Kern bleibt die einzige mathematische Wahrheit.",
    "Solve-Exporte muessen Theorie, Projektion und Layout gemeinsam liefern.",
    "Stabile IDs bleiben ueber Diagnose, Arbeitsblatt und weitere Verbraucher erhalten.",
    "Spaetere Oberflaechen duerfen diese Kernwahrheit nur gewichten, nicht ersetzen."
]);

function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
}

export function buildSolveStateManifest() {
    return {
        version: SOLVE_STATE_CONTRACT_VERSION,
        runtimeEngines: SOLVE_STATE_RUNTIME_ENGINES,
        requiredFields: SOLVE_STATE_REQUIRED_FIELDS,
        exportRequiredFields: SOLVE_STATE_EXPORT_REQUIRED_FIELDS,
        invariants: SOLVE_STATE_INVARIANTS,
        templates: {
            success: cloneValue(SOLVE_STATE_SUCCESS_TEMPLATE),
            error: cloneValue(SOLVE_STATE_ERROR_TEMPLATE)
        }
    };
}
