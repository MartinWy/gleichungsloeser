function resolveProjectionEngine(options = {}) {
    const requestedEngine = typeof options?.engine === "string" ? options.engine.trim().toLowerCase() : "";

    if (requestedEngine === "neukern_adapter") {
        return "neukern_adapter";
    }

    return "classic";
}

export {
    resolveProjectionEngine
};
