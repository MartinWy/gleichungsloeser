function normalizeBaseText(baseText = "") {
    return String(baseText || "").trim();
}

function resolveSpecialLogarithmName(baseText = "") {
    const normalizedBaseText = normalizeBaseText(baseText);

    if (normalizedBaseText === "e") {
        return "ln";
    }

    if (normalizedBaseText === "2") {
        return "lg";
    }

    if (normalizedBaseText === "10") {
        return "log";
    }

    return null;
}

function buildFunctionHead(name = "", baseText = "") {
    const normalizedName = String(name || "f").trim() || "f";
    const normalizedBaseText = normalizeBaseText(baseText);

    if (normalizedName === "ln" || normalizedName === "lg") {
        return normalizedName;
    }

    if (normalizedName === "log") {
        const specialName = resolveSpecialLogarithmName(normalizedBaseText);

        if (specialName) {
            return specialName;
        }

        return normalizedBaseText ? `log_${normalizedBaseText}` : "log";
    }

    return normalizedBaseText ? `${normalizedName}_${normalizedBaseText}` : normalizedName;
}

function shouldRenderVisibleFunctionBase(name = "", baseText = "") {
    const normalizedName = String(name || "f").trim() || "f";
    const normalizedBaseText = normalizeBaseText(baseText);

    if (!normalizedBaseText) {
        return false;
    }

    if (normalizedName === "ln" || normalizedName === "lg") {
        return false;
    }

    if (normalizedName === "log" && normalizedBaseText === "10") {
        return false;
    }

    return true;
}

function extractSimpleBaseTextFromNodes(baseNodes = []) {
    const visibleNodes = (Array.isArray(baseNodes) ? baseNodes : [])
        .filter((node) => node && node.isVisible !== false);

    if (visibleNodes.length !== 1) {
        return "";
    }

    const [node] = visibleNodes;

    if (node?.type === "NUMBER" || node?.type === "VARIABLE") {
        return normalizeBaseText(node?.value || "");
    }

    return "";
}

function resolvePowerExponentInverseName(baseNodes = []) {
    const simpleBaseText = extractSimpleBaseTextFromNodes(baseNodes);
    return resolveSpecialLogarithmName(simpleBaseText) || "log";
}

function buildBasedLogText(baseText = "") {
    return buildFunctionHead("log", baseText);
}

export {
    buildBasedLogText,
    buildFunctionHead,
    extractSimpleBaseTextFromNodes,
    resolvePowerExponentInverseName,
    resolveSpecialLogarithmName,
    shouldRenderVisibleFunctionBase
};
