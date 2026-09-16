export const CHILD_COLLECTION_KEYS = Object.freeze([
    "numerator",
    "denominator",
    "content",
    "factor",
    "passive"
]);

export const SHELL_SLOT_KIND_BY_TYPE = Object.freeze({
    DIVISION: ["fraction_line"],
    FUNCTION: ["function_name", "function_left", "function_right"],
    GROUP: ["group_left", "group_right"],
    ROOT: ["root_hook", "root_bar"],
    POWER: ["power_exponent"],
    NEGATION: ["negation_sign"],
    MULTIPLICATION: ["product_separator"],
    ADDITION: ["inverse_operator"],
    SUBTRACTION: ["inverse_operator"]
});

export function resolveShellRole(atom) {
    switch (atom?.type) {
        case "DIVISION":
            return "fraction";
        case "FUNCTION":
            return "function";
        case "GROUP":
            return "group";
        case "ROOT":
            return "root";
        case "POWER":
            return "power";
        case "NEGATION":
            return "negation";
        case "MULTIPLICATION":
            return "product";
        case "ADDITION":
        case "SUBTRACTION":
            return "additive_inverse";
        default:
            return "shell";
    }
}

export function collectChildCollections(atom) {
    if (atom?.type === "DIVISION") {
        return [
            { key: "numerator", entries: Array.isArray(atom?.numerator) ? atom.numerator : [], rowShift: -1 },
            { key: "denominator", entries: Array.isArray(atom?.denominator) ? atom.denominator : [], rowShift: 1 }
        ];
    }

    if (["FUNCTION", "GROUP", "ROOT", "POWER", "NEGATION"].includes(atom?.type)) {
        return [
            { key: "content", entries: Array.isArray(atom?.content) ? atom.content : [], rowShift: 0 }
        ];
    }

    if (atom?.type === "MULTIPLICATION") {
        return [
            { key: "content", entries: Array.isArray(atom?.content) ? atom.content : [], rowShift: 0 },
            { key: "factor", entries: Array.isArray(atom?.factor) ? atom.factor : [], rowShift: 0 }
        ];
    }

    if (["ADDITION", "SUBTRACTION"].includes(atom?.type)) {
        return [
            { key: "content", entries: Array.isArray(atom?.content) ? atom.content : [], rowShift: 0 },
            { key: "passive", entries: Array.isArray(atom?.passive) ? atom.passive : [], rowShift: 0 }
        ];
    }

    return CHILD_COLLECTION_KEYS.filter((key) => Array.isArray(atom?.[key]))
        .map((key) => ({
            key,
            entries: atom[key],
            rowShift: 0
        }));
}

export function isShellAtom(atom) {
    if (!atom || typeof atom !== "object") {
        return false;
    }

    if (Object.prototype.hasOwnProperty.call(SHELL_SLOT_KIND_BY_TYPE, atom.type)) {
        return true;
    }

    return collectChildCollections(atom).length > 0;
}
