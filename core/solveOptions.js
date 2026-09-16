const supportedRuntimeEngines = new Set([
    "genesis_runtime"
]);

function normalizeSolveOptions(options) {
    if (typeof options === "string") {
        return {
            targetVariable: options.trim()
        };
    }

    if (!options || typeof options !== "object") {
        return {};
    }

    return {
        ...options,
        targetVariable: typeof options.targetVariable === "string"
            ? options.targetVariable.trim()
            : options.targetVariable,
        runtimeEngine: typeof options.runtimeEngine === "string"
            ? options.runtimeEngine.trim().toLowerCase()
            : options.runtimeEngine,
        projectionEngine: typeof options.projectionEngine === "string"
            ? options.projectionEngine.trim().toLowerCase()
            : options.projectionEngine,
        rightSideFactorPlacement: typeof options.rightSideFactorPlacement === "string"
            ? options.rightSideFactorPlacement.trim().toLowerCase()
            : options.rightSideFactorPlacement
    };
}

function validateRuntimeEngineOption(runtimeEngine) {
    if (!runtimeEngine) {
        return;
    }

    if (!supportedRuntimeEngines.has(runtimeEngine)) {
        throw new Error(
            `Unbekannte runtimeEngine "${runtimeEngine}". `
            + `Erlaubt: ${Array.from(supportedRuntimeEngines).join(", ")}.`
        );
    }
}

function validateSolveOptions(solveOptions = {}) {
    validateRuntimeEngineOption(solveOptions.runtimeEngine);
}

export {
    normalizeSolveOptions,
    validateSolveOptions
};
