function normalizeRuntimeOptions(options = {}) {
    if (!options || typeof options !== "object") {
        return {};
    }

    return {
        ...options,
        targetVariable: typeof options.targetVariable === "string"
            ? options.targetVariable.trim()
            : options.targetVariable
    };
}

function normalizeGenesisRuntimeRequest(equation, options = {}) {
    if (typeof equation !== "string") {
        throw new Error("[GenesisRuntime] equation muss ein String sein.");
    }

    const normalizedEquation = equation.trim();
    if (normalizedEquation.length === 0) {
        throw new Error("[GenesisRuntime] equation darf nicht leer sein.");
    }

    const normalizedTargetVariable = typeof options?.targetVariable === "string"
        ? options.targetVariable.trim()
        : null;

    return {
        equation: normalizedEquation,
        options: normalizeRuntimeOptions(options),
        targetVariable: normalizedTargetVariable,
        requestedTargetVariable: normalizedTargetVariable
    };
}

export {
    normalizeGenesisRuntimeRequest,
    normalizeRuntimeOptions
};
