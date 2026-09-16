/**
 * ALGEBRA CORE - PHASE P1: ATOMISIERER
 * Aktiver Zwischenstand: kanonisiert implizite Multiplikation,
 * additive Top-Level-Huellen und erkennt erste Funktions-, Gruppen- und DIVISION-Schalen.
 */
export class Atomisierer {
    static get FUNCTION_NAMES() {
        return ["asin", "acos", "atan", "sin", "cos", "tan"];
    }

    static get SYMBOL_VARIABLE_NAMES() {
        return new Set([
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
    }

    static process(input) {
        const prepared = input.replace(/\s+/g, "");
        const context = this.createParseContext(prepared);
        return this.parseRecursive(prepared, context);
    }

    static createParseContext(source) {
        return {
            source,
            namespace: this.createNamespace(source),
            counters: Object.create(null)
        };
    }

    static createNamespace(source) {
        return `${source.length.toString(36)}-${this.hashSource(source)}`;
    }

    static hashSource(source) {
        let hash = 2166136261;

        for (let i = 0; i < source.length; i += 1) {
            hash ^= source.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        return (hash >>> 0).toString(36);
    }

    static nextSequence(context, bucket, kind) {
        const key = `${bucket}:${kind}`;
        const next = (context.counters[key] || 0) + 1;
        context.counters[key] = next;
        return String(next).padStart(4, "0");
    }

    static parseRecursive(str, context) {
        if (!str) {
            return [];
        }

        const result = [];
        let i = 0;

        while (i < str.length) {
            if (str.startsWith("sqrt(", i)) {
                const openPos = i + 4;
                const end = this.findMatchingBracket(str, openPos);

                if (end !== -1) {
                    result.push({
                        id: this.createShellId("root", context),
                        type: "ROOT",
                        isVisible: true,
                        content: this.parseRecursive(str.substring(openPos + 1, end), context)
                    });
                    i = end + 1;
                    continue;
                }
            }

            const char = str[i];

            if (/[0-9]/.test(char)) {
                let end = i + 1;
                while (end < str.length && /[0-9]/.test(str[end])) {
                    end += 1;
                }

                result.push(this.createAtom("NUMBER", str.substring(i, end), context));
                i = end;
                continue;
            }

            if (/[a-zA-Z]/.test(char)) {
                let end = i + 1;
                while (end < str.length && /[a-zA-Z]/.test(str[end])) {
                    end += 1;
                }

                const identifier = str.substring(i, end);

                if (str[end] === "(") {
                    const closePos = this.findMatchingBracket(str, end);
                    if (closePos !== -1 && this.isFunctionName(identifier)) {
                        result.push({
                            id: this.createShellId("function", context),
                            type: "FUNCTION",
                            name: identifier,
                            isVisible: true,
                            content: this.parseRecursive(str.substring(end + 1, closePos), context)
                        });
                        i = closePos + 1;
                        continue;
                    }

                    const suffixFunctionName = this.findTrailingFunctionName(identifier);

                    if (suffixFunctionName) {
                        const prefixIdentifier = identifier.slice(0, identifier.length - suffixFunctionName.length);
                        result.push(...this.expandAlphabeticIdentifier(prefixIdentifier, context));

                        if (closePos !== -1) {
                            result.push(this.createFunctionShell(
                                suffixFunctionName,
                                str.substring(end + 1, closePos),
                                context
                            ));
                            i = closePos + 1;
                            continue;
                        }
                    }
                }

                if (str[end] === "^") {
                    let exponentEnd = end + 1;
                    while (exponentEnd < str.length && /[0-9]/.test(str[exponentEnd])) {
                        exponentEnd += 1;
                    }

                    const exponentValue = str.substring(end + 1, exponentEnd);
                    if (exponentValue) {
                        const expandedIdentifier = this.expandAlphabeticIdentifier(identifier, context);

                        if (expandedIdentifier.length <= 1) {
                            result.push(this.createPowerShell(
                                expandedIdentifier.length === 1 ? expandedIdentifier : this.parseRecursive(identifier, context),
                                parseInt(exponentValue, 10),
                                context
                            ));
                        } else {
                            result.push(...expandedIdentifier.slice(0, -1));
                            result.push(this.createPowerShell(
                                [expandedIdentifier[expandedIdentifier.length - 1]],
                                parseInt(exponentValue, 10),
                                context
                            ));
                        }
                        i = exponentEnd;
                        continue;
                    }
                }

                result.push(...this.expandAlphabeticIdentifier(identifier, context));
                i = end;
                continue;
            }

            if (char === "(") {
                const closePos = this.findMatchingBracket(str, i);
                if (closePos !== -1) {
                    result.push({
                        id: this.createShellId("group", context),
                        type: "GROUP",
                        isVisible: true,
                        content: this.parseRecursive(str.substring(i + 1, closePos), context)
                    });
                    i = closePos + 1;
                    continue;
                }
            }

            result.push(this.createAtom(char === "=" ? "ANCHOR" : "OPERATOR", char, context));
            i += 1;
        }

        return this.normalizeFlatStructure(result, context);
    }

    static normalizeFlatStructure(atoms, context) {
        const withImplicitMultiplication = this.insertImplicitMultiplication(atoms, context);
        const withNegationShells = this.collapseNegationStructure(withImplicitMultiplication, context);
        return this.collapseDivisionStructure(withNegationShells, context);
    }

    static insertImplicitMultiplication(atoms, context) {
        const normalizedAtoms = atoms.map((atom) => this.normalizeNested(atom, context));
        const result = [];

        normalizedAtoms.forEach((atom, index) => {
            result.push(atom);

            const nextAtom = normalizedAtoms[index + 1];
            if (nextAtom && this.isImplicitMultiplicationBoundary(atom, nextAtom)) {
                result.push({
                    id: this.createAtomId("operator", context),
                    value: "*",
                    type: "OPERATOR",
                    isVisible: true,
                    isImplicit: true
                });
            }
        });

        return result;
    }

    static collapseNegationStructure(atoms, context) {
        const normalizedAtoms = atoms.map((atom) => this.normalizeNested(atom, context));
        const result = [];

        for (let index = 0; index < normalizedAtoms.length; index += 1) {
            const atom = normalizedAtoms[index];
            const previousAtom = result[result.length - 1] || null;
            const nextAtom = normalizedAtoms[index + 1] || null;

            if (this.isUnaryNegationBoundary(previousAtom, atom, nextAtom)) {
                result.push({
                    id: this.createShellId("negation", context),
                    type: "NEGATION",
                    isVisible: true,
                    sign: "-",
                    content: [nextAtom]
                });
                index += 1;
                continue;
            }

            result.push(atom);
        }

        return result;
    }

    static collapseDivisionStructure(atoms, context) {
        const normalizedAtoms = atoms.map((atom) => this.normalizeNested(atom, context));
        const result = [];
        let currentSegment = [];

        const flushSegment = () => {
            if (currentSegment.length === 0) {
                return;
            }

            result.push(...this.collapseDivisionSegment(currentSegment, context));
            currentSegment = [];
        };

        normalizedAtoms.forEach((atom) => {
            if (atom.type === "ANCHOR") {
                flushSegment();
                result.push(atom);
                return;
            }

            currentSegment.push(atom);
        });

        flushSegment();
        return result;
    }

    static collapseDivisionSegment(segment, context) {
        const result = [];
        let currentTerm = [];

        const flushTerm = () => {
            if (currentTerm.length === 0) {
                return;
            }

            result.push(...this.collapseMultiplicativeDivisionChain(currentTerm, context));
            currentTerm = [];
        };

        segment.forEach((atom) => {
            const isTopLevelAdditiveOperator = atom?.type === "OPERATOR" && ["+", "-"].includes(atom.value);

            if (isTopLevelAdditiveOperator) {
                flushTerm();
                result.push(atom);
                return;
            }

            currentTerm.push(atom);
        });

        flushTerm();
        return result;
    }

    static collapseMultiplicativeDivisionChain(segment, context) {
        if (!this.isMultiplicativeDivisionChain(segment)) {
            return segment;
        }

        let currentExpression = [segment[0]];

        for (let index = 1; index < segment.length; index += 2) {
            const operator = segment[index];
            const nextTerm = segment[index + 1];

            if (!operator || !nextTerm) {
                return segment;
            }

            if (operator.value === "*") {
                currentExpression = [
                    ...currentExpression,
                    operator,
                    nextTerm
                ];
                continue;
            }

            currentExpression = [{
                id: this.createShellId("division", context),
                type: "DIVISION",
                isVisible: true,
                numerator: currentExpression,
                denominator: [
                    {
                        ...nextTerm,
                        position: "denominator"
                    }
                ]
            }];
        }

        return currentExpression;
    }

    static isMultiplicativeDivisionChain(segment = []) {
        if (segment.length < 3 || segment.length % 2 === 0) {
            return false;
        }

        return segment.every((atom, index) => {
            if (index % 2 === 1) {
                return atom?.type === "OPERATOR" && ["*", "/"].includes(atom.value);
            }

            return this.isDivisionBoundary(atom, atom);
        });
    }

    static normalizeNested(atom, context) {
        if (!atom) {
            return atom;
        }

        const normalized = { ...atom };
        ["content", "numerator", "denominator", "factor", "passive"].forEach((key) => {
            if (Array.isArray(atom[key])) {
                normalized[key] = this.normalizeFlatStructure(atom[key], context);
            }
        });

        return normalized;
    }

    static isFunctionName(identifier = "") {
        return this.FUNCTION_NAMES.includes(identifier);
    }

    static isSymbolVariableName(identifier = "") {
        return this.SYMBOL_VARIABLE_NAMES.has(identifier);
    }

    static createFunctionShell(name, argumentSource, context) {
        return {
            id: this.createShellId("function", context),
            type: "FUNCTION",
            name,
            isVisible: true,
            content: this.parseRecursive(argumentSource, context)
        };
    }

    static createPowerShell(content, exponent, context) {
        return {
            id: this.createShellId("power", context),
            type: "POWER",
            exponent,
            isVisible: true,
            content
        };
    }

    static findTrailingFunctionName(identifier = "") {
        return this.FUNCTION_NAMES
            .filter((name) => identifier.endsWith(name) && identifier.length > name.length)
            .sort((left, right) => right.length - left.length)[0] || null;
    }

    static findEmbeddedFunction(identifier = "") {
        let bestMatch = null;

        for (let index = 0; index < identifier.length; index += 1) {
            const match = this.FUNCTION_NAMES
                .filter((name) => (
                    identifier.startsWith(name, index)
                    && identifier.length > index + name.length
                ))
                .sort((left, right) => right.length - left.length)[0] || null;

            if (!match) {
                continue;
            }

            bestMatch = {
                index,
                name: match
            };
            break;
        }

        return bestMatch;
    }

    static findLeadingSymbolVariable(identifier = "") {
        return [...this.SYMBOL_VARIABLE_NAMES]
            .filter((name) => identifier.startsWith(name) && identifier.length > name.length)
            .sort((left, right) => right.length - left.length)[0] || null;
    }

    static expandAlphabeticIdentifier(identifier, context) {
        if (!identifier) {
            return [];
        }

        if (this.isSymbolVariableName(identifier)) {
            return [this.createAtom("VARIABLE", identifier, context)];
        }

        const embeddedFunction = this.findEmbeddedFunction(identifier);
        if (embeddedFunction) {
            const prefix = identifier.slice(0, embeddedFunction.index);
            const suffix = identifier.slice(embeddedFunction.index + embeddedFunction.name.length);

            return [
                ...this.expandAlphabeticIdentifier(prefix, context),
                this.createFunctionShell(embeddedFunction.name, suffix, context)
            ];
        }

        const leadingSymbol = this.findLeadingSymbolVariable(identifier);
        if (leadingSymbol) {
            return [
                this.createAtom("VARIABLE", leadingSymbol, context),
                ...this.expandAlphabeticIdentifier(identifier.slice(leadingSymbol.length), context)
            ];
        }

        return Array.from(identifier).map((letter) => this.createAtom("VARIABLE", letter, context));
    }

    static isImplicitMultiplicationBoundary(left, right) {
        return this.isTermCarrier(left) && this.isTermCarrier(right);
    }

    static isDivisionBoundary(left, right) {
        return this.isTermCarrier(left) && this.isTermCarrier(right);
    }

    static isTermCarrier(atom) {
        if (!atom || atom.isVisible === false) {
            return false;
        }

        return ["NUMBER", "VARIABLE", "ROOT", "POWER", "FUNCTION", "GROUP", "DIVISION", "NEGATION"].includes(atom.type);
    }

    static isUnaryNegationBoundary(previousAtom, atom, nextAtom) {
        if (!atom || atom.type !== "OPERATOR" || atom.value !== "-" || atom.isVisible === false) {
            return false;
        }

        const atSegmentStart = !previousAtom || ["OPERATOR", "ANCHOR"].includes(previousAtom.type);
        return atSegmentStart && this.isTermCarrier(nextAtom);
    }

    static createAtom(type, value, context) {
        return {
            id: this.createAtomId(type.toLowerCase(), context),
            value,
            type,
            isVisible: true
        };
    }

    static createAtomId(kind, context) {
        return `atom-${kind}-${context.namespace}-${this.nextSequence(context, "atom", kind)}`;
    }

    static createShellId(kind, context) {
        return `shell-${kind}-${context.namespace}-${this.nextSequence(context, "shell", kind)}`;
    }

    static findMatchingBracket(str, openPos) {
        let closePos = openPos;
        let counter = 1;

        while (counter > 0) {
            const char = str[++closePos];
            if (!char) {
                return -1;
            }
            if (char === "(") {
                counter += 1;
            } else if (char === ")") {
                counter -= 1;
            }
        }

        return closePos;
    }
}
