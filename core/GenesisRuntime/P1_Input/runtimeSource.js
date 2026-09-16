const SOURCE_REPLACEMENTS = Object.freeze([
    [/\s+/g, ""],
    [/·|∙|⋅/g, "*"],
    [/−|–|—/g, "-"],
    [/÷/g, "/"],
    [/γ/g, "gamma"],
    [/β/g, "beta"],
    [/α/g, "alpha"]
]);

function normalizeRuntimeSource(source) {
    if (typeof source !== "string") {
        throw new Error("[GenesisRuntime:P1] source muss ein String sein.");
    }

    const normalized = SOURCE_REPLACEMENTS.reduce(
        (current, [pattern, replacement]) => current.replace(pattern, replacement),
        source
    );

    if (normalized.length === 0) {
        throw new Error("[GenesisRuntime:P1] source darf nicht leer sein.");
    }

    return normalized;
}

function findMatchingBracket(source, openPos) {
    let closePos = openPos;
    let depth = 1;

    while (depth > 0) {
        const current = source[++closePos];
        if (!current) {
            return -1;
        }

        if (current === "(") {
            depth += 1;
        } else if (current === ")") {
            depth -= 1;
        }
    }

    return closePos;
}

function readDigits(source, startIndex) {
    let endIndex = startIndex;

    while (endIndex < source.length && /[0-9]/.test(source[endIndex])) {
        endIndex += 1;
    }

    return {
        value: source.slice(startIndex, endIndex),
        nextIndex: endIndex
    };
}

function readLetters(source, startIndex) {
    let endIndex = startIndex;

    while (endIndex < source.length && /[a-zA-Z]/.test(source[endIndex])) {
        endIndex += 1;
    }

    return {
        value: source.slice(startIndex, endIndex),
        nextIndex: endIndex
    };
}

function readExponentOperand(source, startIndex) {
    if (startIndex >= source.length) {
        return null;
    }

    if (source.startsWith("sqrt(", startIndex)) {
        const closePos = findMatchingBracket(source, startIndex + 4);
        if (closePos !== -1) {
            return {
                source: source.slice(startIndex, closePos + 1),
                nextIndex: closePos + 1,
                isGrouped: false
            };
        }
    }

    const currentChar = source[startIndex];

    if (currentChar === "-") {
        const nestedOperand = readExponentOperand(source, startIndex + 1);
        if (!nestedOperand) {
            return null;
        }

        return {
            source: source.slice(startIndex, nestedOperand.nextIndex),
            nextIndex: nestedOperand.nextIndex,
            isGrouped: false
        };
    }

    if (currentChar === "(") {
        const closePos = findMatchingBracket(source, startIndex);
        if (closePos !== -1) {
            return {
                source: source.slice(startIndex + 1, closePos),
                nextIndex: closePos + 1,
                isGrouped: true
            };
        }
    }

    if (/[0-9]/.test(currentChar)) {
        const digits = readDigits(source, startIndex);
        if (!digits.value) {
            return null;
        }

        return {
            source: digits.value,
            nextIndex: digits.nextIndex,
            isGrouped: false
        };
    }

    if (/[a-zA-Z]/.test(currentChar)) {
        const identifier = readLetters(source, startIndex);
        if (source[identifier.nextIndex] === "(") {
            const closePos = findMatchingBracket(source, identifier.nextIndex);
            if (closePos !== -1) {
                return {
                    source: source.slice(startIndex, closePos + 1),
                    nextIndex: closePos + 1,
                    isGrouped: false
                };
            }
        }

        return {
            source: identifier.value,
            nextIndex: identifier.nextIndex,
            isGrouped: false
        };
    }

    return null;
}

function readExponentSuffix(source, startIndex) {
    if (source[startIndex] !== "^") {
        return null;
    }

    return readExponentOperand(source, startIndex + 1);
}

export {
    findMatchingBracket,
    normalizeRuntimeSource,
    readDigits,
    readExponentSuffix,
    readLetters
};
