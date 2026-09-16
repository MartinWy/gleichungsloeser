function createAtomShellDefinition({ id, value }) {
    return {
        id,
        shellType: "ATOM_SHELL",
        intrinsicWidth: 1,
        intrinsicHeight: 1,
        slots: [
            {
                role: "content",
                value,
                offset: 0,
                rowOffset: 0
            }
        ]
    };
}

function createClosedFunctionShellDefinition({ id, name, argumentValue }) {
    return {
        id,
        shellType: "FUNCTION_LEAF",
        intrinsicWidth: 4,
        intrinsicHeight: 1,
        slots: [
            {
                role: "function_name",
                value: name,
                offset: 0,
                rowOffset: 0
            },
            {
                role: "paren_left",
                value: "(",
                offset: 1,
                rowOffset: 0
            },
            {
                role: "content",
                value: argumentValue,
                offset: 2,
                rowOffset: 0
            },
            {
                role: "paren_right",
                value: ")",
                offset: 3,
                rowOffset: 0
            }
        ]
    };
}

function createClosedFractionShellDefinition({ id, numeratorDefinition, denominatorDefinition }) {
    const numeratorWidth = getIntrinsicWidth(numeratorDefinition);
    const denominatorWidth = getIntrinsicWidth(denominatorDefinition);
    const numeratorHeight = getIntrinsicHeight(numeratorDefinition);
    const denominatorHeight = getIntrinsicHeight(denominatorDefinition);

    return {
        id,
        shellType: "DIVISION",
        intrinsicWidth: Math.max(numeratorWidth, denominatorWidth),
        intrinsicHeight: numeratorHeight + 1 + denominatorHeight,
        numeratorDefinition,
        denominatorDefinition
    };
}

function createWrapperFunctionShellDefinition({ id, name, contentDefinition }) {
    return {
        id,
        shellType: "FUNCTION_WRAPPER",
        intrinsicWidth: 3 + getIntrinsicWidth(contentDefinition),
        intrinsicHeight: getIntrinsicHeight(contentDefinition),
        name,
        contentDefinition
    };
}

function getIntrinsicWidth(definition) {
    return Number.isInteger(definition?.intrinsicWidth) ? definition.intrinsicWidth : 0;
}

function getIntrinsicHeight(definition) {
    return Number.isInteger(definition?.intrinsicHeight) ? definition.intrinsicHeight : 0;
}

export {
    createAtomShellDefinition,
    createClosedFunctionShellDefinition,
    createClosedFractionShellDefinition,
    createWrapperFunctionShellDefinition,
    getIntrinsicWidth,
    getIntrinsicHeight
};
