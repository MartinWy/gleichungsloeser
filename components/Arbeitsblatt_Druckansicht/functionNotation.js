function normalizeFunctionName(name = "f") {
    const normalized = String(name || "").trim();
    return normalized.length > 0 ? normalized : "f";
}

function normalizeFunctionBaseText(baseText = "") {
    return String(baseText || "").replace(/\s+/g, " ").trim();
}

function resolveFunctionNotation(name = "f", baseText = "") {
    const normalizedName = normalizeFunctionName(name);
    const normalizedBaseText = normalizeFunctionBaseText(baseText);
    const loweredName = normalizedName.toLowerCase();
    const loweredBase = normalizedBaseText.toLowerCase();

    if (loweredName === "ln") {
        return {
            displayHead: "ln",
            renderLabel: "ln",
            renderBaseArgument: false,
            latexVariant: "ln",
            normalizedBaseText: ""
        };
    }

    if (loweredName === "lg") {
        return {
            displayHead: "lg",
            renderLabel: "lg",
            renderBaseArgument: false,
            latexVariant: "lg",
            normalizedBaseText: ""
        };
    }

    if (loweredName !== "log") {
        return {
            displayHead: normalizedBaseText.length > 0
                ? `${normalizedName}_${normalizedBaseText}`
                : normalizedName,
            renderLabel: normalizedName,
            renderBaseArgument: normalizedBaseText.length > 0,
            latexVariant: "generic",
            normalizedBaseText
        };
    }

    if (normalizedBaseText === "2") {
        return {
            displayHead: "lg",
            renderLabel: "lg",
            renderBaseArgument: false,
            latexVariant: "lg",
            normalizedBaseText
        };
    }

    if (loweredBase === "e") {
        return {
            displayHead: "ln",
            renderLabel: "ln",
            renderBaseArgument: false,
            latexVariant: "ln",
            normalizedBaseText
        };
    }

    if (normalizedBaseText === "10" || normalizedBaseText.length === 0) {
        return {
            displayHead: "log",
            renderLabel: "log",
            renderBaseArgument: false,
            latexVariant: "log",
            normalizedBaseText
        };
    }

    return {
        displayHead: `log_${normalizedBaseText}`,
        renderLabel: "log",
        renderBaseArgument: true,
        latexVariant: "log_with_base",
        normalizedBaseText
    };
}

export {
    normalizeFunctionBaseText,
    normalizeFunctionName,
    resolveFunctionNotation
};
