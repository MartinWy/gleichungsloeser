import {
    createAtom,
    createFunctionShell
} from './runtimeNodeFactory.js';

const FUNCTION_NAMES = Object.freeze(["asin", "acos", "atan", "sin", "cos", "tan", "log", "ln", "lg"]);
const SYMBOL_VARIABLE_NAMES = Object.freeze([
    "alpha",
    "beta",
    "gamma",
    "delta",
    "epsilon",
    "zeta",
    "eta",
    "theta",
    "iota",
    "kappa",
    "lambda",
    "mu",
    "nu",
    "xi",
    "omicron",
    "pi",
    "rho",
    "sigma",
    "tau",
    "upsilon",
    "phi",
    "chi",
    "psi",
    "omega"
]);

const SYMBOL_VARIABLE_NAME_SET = new Set(SYMBOL_VARIABLE_NAMES);

function isFunctionName(identifier = "") {
    return FUNCTION_NAMES.includes(identifier);
}

function isSymbolVariableName(identifier = "") {
    return SYMBOL_VARIABLE_NAME_SET.has(identifier);
}

function findLeadingSymbolVariable(identifier = "") {
    return SYMBOL_VARIABLE_NAMES
        .filter((name) => identifier.startsWith(name) && identifier.length > name.length)
        .sort((left, right) => right.length - left.length)[0] || null;
}

function findTrailingFunctionName(identifier = "") {
    return FUNCTION_NAMES
        .filter((name) => identifier.endsWith(name) && identifier.length > name.length)
        .sort((left, right) => right.length - left.length)[0] || null;
}

function findEmbeddedFunction(identifier = "") {
    for (let index = 0; index < identifier.length; index += 1) {
        const matchedFunction = FUNCTION_NAMES
            .filter((name) => identifier.startsWith(name, index) && identifier.length > index + name.length)
            .sort((left, right) => right.length - left.length)[0] || null;

        if (matchedFunction) {
            return {
                index,
                name: matchedFunction
            };
        }
    }

    return null;
}

function expandIdentifier(identifier, { parseSource, idFactory }) {
    if (!identifier) {
        return [];
    }

    if (isSymbolVariableName(identifier)) {
        return [createAtom(idFactory, "VARIABLE", identifier)];
    }

    const embeddedFunction = findEmbeddedFunction(identifier);
    if (embeddedFunction) {
        const prefix = identifier.slice(0, embeddedFunction.index);
        const suffix = identifier.slice(embeddedFunction.index + embeddedFunction.name.length);

        return [
            ...expandIdentifier(prefix, { parseSource, idFactory }),
            createFunctionShell(idFactory, embeddedFunction.name, parseSource(suffix))
        ];
    }

    const leadingSymbol = findLeadingSymbolVariable(identifier);
    if (leadingSymbol) {
        return [
            createAtom(idFactory, "VARIABLE", leadingSymbol),
            ...expandIdentifier(identifier.slice(leadingSymbol.length), { parseSource, idFactory })
        ];
    }

    return Array.from(identifier).map((letter) => createAtom(idFactory, "VARIABLE", letter));
}

export {
    expandIdentifier,
    findTrailingFunctionName,
    isFunctionName,
    isSymbolVariableName
};
