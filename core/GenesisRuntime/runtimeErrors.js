function createPhaseNotImplementedError(phaseId, detail) {
    const suffix = typeof detail === "string" && detail.length > 0
        ? ` ${detail}`
        : "";
    return new Error(`[GenesisRuntime] ${phaseId} ist noch nicht implementiert.${suffix}`);
}

export {
    createPhaseNotImplementedError
};
