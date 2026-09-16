function createAtom(idFactory, type, value, extra = {}) {
    return {
        id: idFactory.createAtomId(type.toLowerCase()),
        value,
        type,
        isVisible: true,
        ...extra
    };
}

function createGroupShell(idFactory, content) {
    return {
        id: idFactory.createShellId("group"),
        type: "GROUP",
        isVisible: true,
        content
    };
}

function createRootShell(idFactory, content) {
    return {
        id: idFactory.createShellId("root"),
        type: "ROOT",
        isVisible: true,
        degree: 2,
        content
    };
}

function createFunctionShell(idFactory, name, content) {
    return {
        id: idFactory.createShellId("function"),
        type: "FUNCTION",
        name,
        isVisible: true,
        content
    };
}

function createPowerShell(idFactory, content, exponent, exponentNodes) {
    return {
        id: idFactory.createShellId("power"),
        type: "POWER",
        exponent,
        isVisible: true,
        content,
        exponentNodes
    };
}

function createNegationShell(idFactory, operator, content) {
    return {
        id: idFactory.createShellId("negation"),
        type: "NEGATION",
        isVisible: true,
        operator,
        content
    };
}

function createDivisionShell(idFactory, numerator, operator, denominator) {
    return {
        id: idFactory.createShellId("division"),
        type: "DIVISION",
        isVisible: true,
        numerator,
        operator,
        denominator
    };
}

function createMultiplicationShell(idFactory, factors, operators) {
    return {
        id: idFactory.createShellId("multiplication"),
        type: "MULTIPLICATION",
        isVisible: true,
        factors,
        operators
    };
}

function createAdditionShell(idFactory, terms, operators) {
    return {
        id: idFactory.createShellId("addition"),
        type: "ADDITION",
        isVisible: true,
        terms,
        operators
    };
}

function createSubtractionShell(idFactory, minuend, operator, subtrahend) {
    return {
        id: idFactory.createShellId("subtraction"),
        type: "SUBTRACTION",
        isVisible: true,
        minuend,
        operator,
        subtrahend
    };
}

export {
    createAtom,
    createAdditionShell,
    createDivisionShell,
    createFunctionShell,
    createGroupShell,
    createMultiplicationShell,
    createNegationShell,
    createPowerShell,
    createRootShell,
    createSubtractionShell
};
