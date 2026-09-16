const digitAtomWidths = Object.freeze({
    "0": 0.88,
    "1": 0.88,
    "2": 0.88,
    "3": 0.88,
    "4": 0.88,
    "5": 0.88,
    "6": 0.88,
    "7": 0.88,
    "8": 0.88,
    "9": 0.88
});

const lowercaseVariableWidths = Object.freeze({
    a: 0.9,
    b: 0.9,
    c: 0.9,
    d: 0.9,
    e: 0.9,
    f: 0.9,
    g: 0.9,
    h: 0.9,
    i: 0.9,
    j: 0.9,
    k: 0.9,
    l: 0.9,
    m: 0.9,
    n: 0.9,
    o: 0.9,
    p: 0.9,
    q: 0.9,
    r: 0.9,
    s: 0.9,
    t: 0.9,
    u: 0.9,
    v: 0.9,
    w: 0.9,
    x: 0.9,
    y: 0.9,
    z: 0.9
});

const uppercaseVariableWidths = Object.freeze({
    A: 1.02,
    B: 1.02,
    C: 1.02,
    D: 1.02,
    E: 1.02,
    F: 1.02,
    G: 1.02,
    H: 1.02,
    I: 1.02,
    J: 1.02,
    K: 1.02,
    L: 1.02,
    M: 1.02,
    N: 1.02,
    O: 1.02,
    P: 1.02,
    Q: 1.02,
    R: 1.02,
    S: 1.02,
    T: 1.02,
    U: 1.02,
    V: 1.02,
    W: 1.02,
    X: 1.02,
    Y: 1.02,
    Z: 1.02
});

const operatorAtomWidths = Object.freeze({
    "+": 0.78,
    "-": 0.78,
    "−": 0.78,
    "=": 0.94,
    "*": 0.58,
    "·": 0.58,
    "×": 0.58,
    "/": 0.56,
    ":": 0.34
});

const bracketAtomWidths = Object.freeze({
    "(": 0.38,
    ")": 0.38,
    "[": 0.42,
    "]": 0.42,
    "{": 0.48,
    "}": 0.48
});

const punctuationAtomWidths = Object.freeze({
    ",": 0.28,
    ".": 0.28,
    ";": 0.3
});

export const atomWidthCatalogGroups = Object.freeze({
    digits: digitAtomWidths,
    lowercaseVariables: lowercaseVariableWidths,
    uppercaseVariables: uppercaseVariableWidths,
    operators: operatorAtomWidths,
    brackets: bracketAtomWidths,
    punctuation: punctuationAtomWidths
});

export const defaultAtomWidthCatalog = Object.freeze({
    ...digitAtomWidths,
    ...lowercaseVariableWidths,
    ...uppercaseVariableWidths,
    ...operatorAtomWidths,
    ...bracketAtomWidths,
    ...punctuationAtomWidths
});

export function cloneAtomWidthCatalog() {
    return { ...defaultAtomWidthCatalog };
}

export function getDefaultAtomWidth(atom) {
    return defaultAtomWidthCatalog[atom] ?? null;
}

export function listAtomWidthEntries() {
    return Object.entries(defaultAtomWidthCatalog)
        .sort(([left], [right]) => left.localeCompare(right));
}
