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
        projectionEngine: typeof options.projectionEngine === "string"
            ? options.projectionEngine.trim().toLowerCase()
            : options.projectionEngine,
        rightSideFactorPlacement: typeof options.rightSideFactorPlacement === "string"
            ? options.rightSideFactorPlacement.trim().toLowerCase()
            : options.rightSideFactorPlacement
    };
}

export {
    normalizeSolveOptions
};
