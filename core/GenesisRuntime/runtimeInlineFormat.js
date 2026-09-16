import { buildFunctionHead } from "./logarithmNotation.js";

function serializeRuntimeLeaf(node = null) {
    if (!node) {
        return "";
    }

    if (node.type === "OPERATOR") {
        if (node.value === "*" && node.isImplicit) {
            return "";
        }

        return String(node.value || "");
    }

    return String(node.value || "");
}

function serializeRuntimeCollection(nodes = []) {
    return (Array.isArray(nodes) ? nodes : [])
        .map((node) => serializeRuntimeNode(node))
        .join("");
}

function serializeInterleaved(children = [], operators = []) {
    return (Array.isArray(children) ? children : []).map((child, index) => (
        `${serializeRuntimeNode(child)}${operators[index] ? serializeRuntimeNode(operators[index]) : ""}`
    )).join("");
}

function divisionPartNeedsGrouping(nodes = [], part = "numerator") {
    const collection = Array.isArray(nodes) ? nodes.filter(Boolean) : [];

    if (collection.length !== 1) {
        return collection.length > 1;
    }

    const root = collection[0];

    if (root?.type === "GROUP") {
        return false;
    }

    if (part === "numerator") {
        return ["ADDITION", "SUBTRACTION", "DIVISION"].includes(root?.type);
    }

    return ["ADDITION", "SUBTRACTION", "MULTIPLICATION", "DIVISION", "NEGATION"].includes(root?.type);
}

function serializeDivisionPart(nodes = [], part = "numerator") {
    const text = serializeRuntimeCollection(nodes);
    return divisionPartNeedsGrouping(nodes, part) ? `(${text})` : text;
}

function serializeRuntimeNode(node = null) {
    if (!node || typeof node !== "object") {
        return "";
    }

    switch (node.type) {
        case "NUMBER":
        case "VARIABLE":
        case "ANCHOR":
        case "OPERATOR":
            return serializeRuntimeLeaf(node);
        case "GROUP":
            return `(${serializeRuntimeCollection(node.content || [])})`;
        case "COLLECTION":
            return `${serializeRuntimeCollection(node.content || [])}`;
        case "FUNCTION": {
            const baseText = serializeRuntimeCollection(node.baseContent || []);
            const head = buildFunctionHead(node.name || "f", baseText);
            return `${head}(${serializeRuntimeCollection(node.content || [])})`;
        }
        case "ROOT": {
            const degree = String(node.degree ?? "").trim();
            const degreeText = degree && degree !== "2" ? `[${degree}]` : "";
            return `sqrt${degreeText}(${serializeRuntimeCollection(node.content || [])})`;
        }
        case "POWER": {
            const exponentText = Array.isArray(node.exponentNodes) && node.exponentNodes.length > 0
                ? serializeRuntimeCollection(node.exponentNodes)
                : String(node.exponent ?? "2");
            return `${serializeRuntimeCollection(node.content || [])}^(${exponentText})`;
        }
        case "NEGATION":
            return `${serializeRuntimeLeaf(node.operator)}${serializeRuntimeCollection(node.content || [])}`;
        case "DIVISION":
            return `${serializeDivisionPart(node.numerator || [], "numerator")}/${serializeDivisionPart(node.denominator || [], "denominator")}`;
        case "MULTIPLICATION":
            return serializeInterleaved(node.factors, node.operators);
        case "ADDITION":
            return serializeInterleaved(node.terms, node.operators);
        case "SUBTRACTION":
            return `${serializeRuntimeCollection(node.minuend || [])}${serializeRuntimeLeaf(node.operator)}${serializeRuntimeCollection(node.subtrahend || [])}`;
        default:
            return "";
    }
}

export {
    serializeRuntimeCollection,
    serializeRuntimeNode
};
