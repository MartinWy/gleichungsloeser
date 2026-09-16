export const THEORY_CHILD_COLLECTION_KEYS = Object.freeze([
    "content",
    "baseContent",
    "degreeNodes",
    "exponentNodes",
    "numerator",
    "denominator",
    "factors",
    "operators",
    "terms",
    "minuend",
    "subtrahend"
]);

export const THEORY_CHILD_NODE_KEYS = Object.freeze([
    "operator",
    "anchor"
]);

function visibleNodes(nodes = []) {
    return (Array.isArray(nodes) ? nodes : []).filter((node) => node && node.isVisible !== false);
}

function formatCollection(nodes = []) {
    return visibleNodes(nodes)
        .map((node) => formatTheoryNodeLabel(node))
        .filter(Boolean)
        .join("");
}

function formatInterleaved(children = [], operators = [], fallbackOperator = "") {
    const visibleChildren = visibleNodes(children);
    const visibleOperators = visibleNodes(operators);

    return visibleChildren.map((child, index) => {
        const childLabel = formatTheoryNodeLabel(child);
        if (index === 0) {
            return childLabel;
        }

        const operatorLabel = formatTheoryNodeLabel(visibleOperators[index - 1]) || fallbackOperator;
        return `${operatorLabel}${childLabel}`;
    }).join("");
}

function formatPower(node) {
    const baseNodes = visibleNodes(node.content || []);
    const exponentNodes = visibleNodes(node.exponentNodes || []);
    const baseLabel = formatCollection(baseNodes);
    const exponentLabel = exponentNodes.length === 1 && exponentNodes[0]?.type === "DIVISION"
        ? `${formatCollection(exponentNodes[0].numerator || [])}/${formatCollection(exponentNodes[0].denominator || [])}`
        : (formatCollection(exponentNodes) || String(node.exponent ?? "").trim());

    if (!baseLabel || !exponentLabel) {
        return "";
    }

    if (node.generatedByFamily === "power_base_release") {
        const reciprocalExponent = exponentNodes[0];
        const degreeLabel = reciprocalExponent?.type === "DIVISION"
            ? formatCollection(reciprocalExponent.denominator || [])
            : "";

        if (degreeLabel) {
            return `sqrt[${degreeLabel}](${baseLabel})`;
        }
    }

    const wrappedExponent = /^[A-Za-z0-9]+$/.test(exponentLabel)
        ? exponentLabel
        : `(${exponentLabel})`;
    const wrappedBase = baseNodes.length === 1
        && ["ADDITION", "SUBTRACTION", "DIVISION"].includes(baseNodes[0]?.type)
        ? `(${baseLabel})`
        : baseLabel;
    return `${wrappedBase}^${wrappedExponent}`;
}

function formatNegation(node) {
    const contentNodes = visibleNodes(node.content || []);
    const contentLabel = formatCollection(contentNodes);
    if (!contentLabel) {
        return "";
    }

    const requiresBinding = contentNodes.length > 1
        || ["ADDITION", "SUBTRACTION"].includes(contentNodes[0]?.type);
    return requiresBinding ? `-(${contentLabel})` : `-${contentLabel}`;
}

export function formatTheoryNodeLabel(node) {
    if (!node || node.isVisible === false) {
        return "";
    }

    if (Array.isArray(node)) {
        return formatCollection(node);
    }

    switch (node.type) {
        case "NUMBER":
        case "VARIABLE":
        case "ANCHOR":
        case "OPERATOR":
            return String(node.value || "");
        case "GROUP": {
            const contentLabel = formatCollection(node.content || []);
            return contentLabel ? `(${contentLabel})` : "";
        }
        case "COLLECTION":
            return formatCollection(node.content || []);
        case "FUNCTION": {
            const name = String(node.name || "").trim();
            const argument = formatCollection(node.content || []);
            const base = formatCollection(node.baseContent || []);
            if (!name || !argument) {
                return "";
            }
            return `${name}${base ? `_${base}` : ""}(${argument})`;
        }
        case "ROOT": {
            const content = formatCollection(node.content || []);
            const degree = formatCollection(node.degreeNodes || []) || String(node.degree || "").trim();
            if (!content) {
                return "";
            }
            return degree && degree !== "2" ? `sqrt[${degree}](${content})` : `sqrt(${content})`;
        }
        case "POWER":
            return formatPower(node);
        case "NEGATION":
            return formatNegation(node);
        case "ADDITION":
            return formatInterleaved(node.terms || [], node.operators || [], "+");
        case "SUBTRACTION": {
            const minuend = formatCollection(node.minuend || []);
            const subtrahend = formatCollection(node.subtrahend || []);
            const operator = formatTheoryNodeLabel(node.operator) || "-";
            return minuend && subtrahend ? `${minuend}${operator}${subtrahend}` : "";
        }
        case "MULTIPLICATION":
            return formatInterleaved(node.factors || [], node.operators || [], "*");
        case "DIVISION": {
            const numerator = formatCollection(node.numerator || []);
            const denominator = formatCollection(node.denominator || []);
            return numerator && denominator ? `(${numerator}) / (${denominator})` : "";
        }
        default:
            return typeof node.value === "string" ? node.value : "";
    }
}
