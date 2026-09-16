function createSlotDescriptor(slotKey, idSuffix, type, value, projectionRole, rowMode = "axis") {
    return {
        slotKey,
        idSuffix,
        type,
        value,
        text: value,
        projectionRole,
        rowMode
    };
}

const DIVISION_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("fraction_line", "fraction-line", "FRACTION_LINE", "---", "fraction_line"))
]);

const GROUP_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("group_left", "group-left", "GROUP_LEFT", "(", "group_left")),
    Object.freeze(createSlotDescriptor("group_right", "group-right", "GROUP_RIGHT", ")", "group_right"))
]);

const ROOT_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("root_hook", "root-hook", "ROOT_HOOK", "sqrt", "root_hook", "top")),
    Object.freeze(createSlotDescriptor("root_bar", "root-bar", "ROOT_BAR", "___", "root_bar", "top"))
]);

const POWER_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("power_exponent", "power-exponent", "POWER_EXPONENT", "^", "power_exponent", "top"))
]);

const NEGATION_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("negation_sign", "negation-sign", "NEGATION_SIGN", "-", "negation_sign"))
]);

const PRODUCT_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("inline_operator", "product-separator", "PRODUCT_SEPARATOR", "*", "product_operator"))
]);

const ADDITION_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("inline_operator", "inverse-operator", "INVERSE_OPERATOR", "+", "inverse_operator"))
]);

const SUBTRACTION_SLOT_DESCRIPTORS = Object.freeze([
    Object.freeze(createSlotDescriptor("inline_operator", "inverse-operator", "INVERSE_OPERATOR", "-", "inverse_operator"))
]);

function resolveFunctionSlotDescriptors(blueprint = null) {
    const functionName = blueprint?.shellName || "f";

    return [
        createSlotDescriptor("function_name", "function-name", "FUNCTION_NAME", functionName, "function_name"),
        createSlotDescriptor("function_left", "function-left", "FUNCTION_LEFT", "(", "function_left"),
        createSlotDescriptor("function_right", "function-right", "FUNCTION_RIGHT", ")", "function_right")
    ];
}

export function resolveShellSlotDescriptors(shellType = "", blueprint = null) {
    switch (shellType) {
        case "DIVISION":
            return DIVISION_SLOT_DESCRIPTORS;
        case "FUNCTION":
            return resolveFunctionSlotDescriptors(blueprint);
        case "GROUP":
            return GROUP_SLOT_DESCRIPTORS;
        case "ROOT":
            return ROOT_SLOT_DESCRIPTORS;
        case "POWER":
            return POWER_SLOT_DESCRIPTORS;
        case "NEGATION":
            return NEGATION_SLOT_DESCRIPTORS;
        case "MULTIPLICATION":
            return PRODUCT_SLOT_DESCRIPTORS;
        case "ADDITION":
            return ADDITION_SLOT_DESCRIPTORS;
        case "SUBTRACTION":
            return SUBTRACTION_SLOT_DESCRIPTORS;
        default:
            return [];
    }
}

export function resolveShellSlotLocalRow(shellBlock = {}, rowMode = "axis") {
    if (rowMode === "top") {
        return shellBlock.localTopRow ?? shellBlock.axisLocalRow ?? 0;
    }

    return shellBlock.axisLocalRow ?? 0;
}
