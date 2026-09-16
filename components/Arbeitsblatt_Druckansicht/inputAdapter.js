const FUNCTION_COMMANDS = new Map([
    ["sin", "sin"],
    ["cos", "cos"],
    ["tan", "tan"],
    ["asin", "asin"],
    ["acos", "acos"],
    ["atan", "atan"],
    ["log", "log"],
    ["ln", "ln"],
    ["lg", "lg"],
    ["arcsin", "asin"],
    ["arccos", "acos"],
    ["arctan", "atan"]
]);

const SYMBOL_COMMANDS = new Map([
    ["alpha", "alpha"],
    ["beta", "beta"],
    ["gamma", "gamma"],
    ["delta", "delta"],
    ["zeta", "zeta"],
    ["eta", "eta"],
    ["epsilon", "epsilon"],
    ["theta", "theta"],
    ["iota", "iota"],
    ["kappa", "kappa"],
    ["lambda", "lambda"],
    ["mu", "mu"],
    ["nu", "nu"],
    ["xi", "xi"],
    ["omicron", "omicron"],
    ["pi", "pi"],
    ["rho", "rho"],
    ["sigma", "sigma"],
    ["tau", "tau"],
    ["upsilon", "upsilon"],
    ["phi", "phi"],
    ["chi", "chi"],
    ["psi", "psi"],
    ["omega", "omega"]
]);

const UNICODE_SYMBOLS = new Map([
    ["α", "alpha"],
    ["Α", "alpha"],
    ["β", "beta"],
    ["Β", "beta"],
    ["γ", "gamma"],
    ["Γ", "gamma"],
    ["δ", "delta"],
    ["Δ", "delta"],
    ["ε", "epsilon"],
    ["ϵ", "epsilon"],
    ["Ε", "epsilon"],
    ["ζ", "zeta"],
    ["Ζ", "zeta"],
    ["η", "eta"],
    ["Η", "eta"],
    ["θ", "theta"],
    ["ϑ", "theta"],
    ["Θ", "theta"],
    ["ι", "iota"],
    ["Ι", "iota"],
    ["κ", "kappa"],
    ["ϰ", "kappa"],
    ["Κ", "kappa"],
    ["λ", "lambda"],
    ["Λ", "lambda"],
    ["μ", "mu"],
    ["Μ", "mu"],
    ["ν", "nu"],
    ["Ν", "nu"],
    ["ξ", "xi"],
    ["Ξ", "xi"],
    ["ο", "omicron"],
    ["Ο", "omicron"],
    ["π", "pi"],
    ["ϖ", "pi"],
    ["Π", "pi"],
    ["ρ", "rho"],
    ["ϱ", "rho"],
    ["Ρ", "rho"],
    ["σ", "sigma"],
    ["ς", "sigma"],
    ["Σ", "sigma"],
    ["τ", "tau"],
    ["Τ", "tau"],
    ["υ", "upsilon"],
    ["Υ", "upsilon"],
    ["φ", "phi"],
    ["ϕ", "phi"],
    ["Φ", "phi"],
    ["χ", "chi"],
    ["Χ", "chi"],
    ["ψ", "psi"],
    ["Ψ", "psi"],
    ["ω", "omega"],
    ["Ω", "omega"]
]);

const OPERATOR_COMMANDS = new Map([
    ["cdot", "*"],
    ["times", "*"],
    ["div", "/"]
]);

function skipWhitespace(source, startIndex) {
    let index = startIndex;

    while (index < source.length && /\s/.test(source[index])) {
        index += 1;
    }

    return index;
}

function readBalanced(source, startIndex, openChar, closeChar) {
    if (source[startIndex] !== openChar) {
        return null;
    }

    let depth = 1;
    let index = startIndex + 1;

    while (index < source.length) {
        const char = source[index];

        if (char === openChar) {
            depth += 1;
        } else if (char === closeChar) {
            depth -= 1;
            if (depth === 0) {
                return {
                    content: source.slice(startIndex + 1, index),
                    endIndex: index + 1
                };
            }
        }

        index += 1;
    }

    return null;
}

function readSimpleOperand(source, startIndex) {
    let index = startIndex;

    if (index >= source.length) {
        return null;
    }

    if (source[index] === "{") {
        return readBalanced(source, index, "{", "}");
    }

    if (source[index] === "(") {
        return readBalanced(source, index, "(", ")");
    }

    if (source[index] === "\\") {
        const commandMatch = source.slice(index).match(/^\\([a-zA-Z]+)/);
        if (commandMatch) {
            return {
                content: source.slice(index, index + commandMatch[0].length),
                endIndex: index + commandMatch[0].length
            };
        }
    }

    const tokenMatch = source.slice(index).match(/^[a-zA-Z0-9]+/);
    if (tokenMatch) {
        return {
            content: tokenMatch[0],
            endIndex: index + tokenMatch[0].length
        };
    }

    return {
        content: source[index],
        endIndex: index + 1
    };
}

function normalizeUnicodeOperators(input) {
    return input
        .replace(/[−–—]/g, "-")
        .replace(/[·⋅×]/g, "*")
        .replace(/÷/g, "/");
}

function normalizeUnicodeSymbols(input) {
    return Array.from(String(input || ""))
        .map((char) => UNICODE_SYMBOLS.get(char) || char)
        .join("");
}

function isFullyWrappedGroup(expression) {
    if (typeof expression !== "string" || expression.length < 2) {
        return false;
    }

    if (expression[0] !== "(" || expression[expression.length - 1] !== ")") {
        return false;
    }

    let depth = 0;

    for (let index = 0; index < expression.length; index += 1) {
        const char = expression[index];

        if (char === "(") {
            depth += 1;
        } else if (char === ")") {
            depth -= 1;
            if (depth === 0 && index < expression.length - 1) {
                return false;
            }
        }

        if (depth < 0) {
            return false;
        }
    }

    return depth === 0;
}

function hasTopLevelOperator(expression, operators) {
    let depth = 0;

    for (let index = 0; index < expression.length; index += 1) {
        const char = expression[index];

        if (char === "(") {
            depth += 1;
            continue;
        }

        if (char === ")") {
            depth -= 1;
            continue;
        }

        if (depth === 0 && operators.has(char)) {
            if (char === "-" && index === 0) {
                continue;
            }

            return true;
        }
    }

    return false;
}

function isSimpleScalar(expression) {
    return /^-?\d+(?:\.\d+)?$/.test(expression) || /^[A-Za-z_]+$/.test(expression);
}

function isSimpleFunctionOrRoot(expression) {
    const match = expression.match(/^(sqrt|sin|cos|tan|asin|acos|atan|log|ln|lg)\((.*)\)$/);
    return Boolean(match) && isFullyWrappedGroup(expression.slice(expression.indexOf("(")));
}

function formatFractionOperand(expression, role) {
    const normalizedExpression = typeof expression === "string" ? expression.trim() : "";

    if (normalizedExpression.length === 0) {
        return normalizedExpression;
    }

    if (isFullyWrappedGroup(normalizedExpression)) {
        return normalizedExpression;
    }

    if (role === "numerator") {
        return hasTopLevelOperator(normalizedExpression, new Set(["+", "-", "="]))
            ? `(${normalizedExpression})`
            : normalizedExpression;
    }

    if (isSimpleScalar(normalizedExpression) || isSimpleFunctionOrRoot(normalizedExpression)) {
        return normalizedExpression;
    }

    return `(${normalizedExpression})`;
}

function normalizeMathSource(source) {
    let result = "";
    let index = 0;

    while (index < source.length) {
        const char = source[index];

        if (char === "\\") {
            const commandMatch = source.slice(index).match(/^\\([a-zA-Z]+)/);
            if (!commandMatch) {
                result += "\\";
                index += 1;
                continue;
            }

            const command = commandMatch[1];
            index += commandMatch[0].length;
            index = skipWhitespace(source, index);

            if (command === "left" || command === "right") {
                continue;
            }

            if (OPERATOR_COMMANDS.has(command)) {
                result += OPERATOR_COMMANDS.get(command);
                continue;
            }

            if (SYMBOL_COMMANDS.has(command)) {
                result += SYMBOL_COMMANDS.get(command);
                continue;
            }

            if (command === "sqrt") {
                const operand = readSimpleOperand(source, index);
                if (!operand) {
                    result += "sqrt";
                    continue;
                }

                result += `sqrt(${normalizeMathSource(operand.content)})`;
                index = operand.endIndex;
                continue;
            }

            if (command === "frac") {
                const numerator = readSimpleOperand(source, index);
                if (!numerator) {
                    result += "frac";
                    continue;
                }

                index = skipWhitespace(source, numerator.endIndex);
                const denominator = readSimpleOperand(source, index);
                if (!denominator) {
                    result += formatFractionOperand(normalizeMathSource(numerator.content), "numerator");
                    index = numerator.endIndex;
                    continue;
                }

                result += `${formatFractionOperand(normalizeMathSource(numerator.content), "numerator")}/${formatFractionOperand(normalizeMathSource(denominator.content), "denominator")}`;
                index = denominator.endIndex;
                continue;
            }

            if (FUNCTION_COMMANDS.has(command)) {
                const operand = readSimpleOperand(source, index);
                if (!operand) {
                    result += FUNCTION_COMMANDS.get(command);
                    continue;
                }

                const normalizedName = FUNCTION_COMMANDS.get(command);
                result += `${normalizedName}(${normalizeMathSource(operand.content)})`;
                index = operand.endIndex;
                continue;
            }

            result += command;
            continue;
        }

        if (char === "{") {
            const group = readBalanced(source, index, "{", "}");
            if (group) {
                result += `(${normalizeMathSource(group.content)})`;
                index = group.endIndex;
                continue;
            }
        }

        result += char;
        index += 1;
    }

    return result;
}

function normalizeLatexExponentSyntax(source) {
    return source
        .replace(/\^\((\d+)\)/g, "^$1")
        .replace(/\^\{(\d+)\}/g, "^$1");
}

function normalizeGroupingWhitespace(source) {
    return source
        .replace(/\s+/g, " ")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .trim();
}

export function normalizeEquationInput(value) {
    if (typeof value !== "string") {
        return {
            original: "",
            normalized: "",
            changed: false
        };
    }

    const original = value.trim();
    const unicodeNormalized = normalizeUnicodeSymbols(normalizeUnicodeOperators(original));
    const latexNormalized = normalizeMathSource(unicodeNormalized);
    const exponentNormalized = normalizeLatexExponentSyntax(latexNormalized);
    const normalized = normalizeGroupingWhitespace(exponentNormalized);

    return {
        original,
        normalized,
        changed: normalized !== original
    };
}

export function normalizeTargetVariableInput(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const normalized = normalizeMathSource(normalizeUnicodeSymbols(normalizeUnicodeOperators(trimmed)))
        .replace(/[(){}\s]/g, "");

    return normalized.length > 0 ? normalized : null;
}
