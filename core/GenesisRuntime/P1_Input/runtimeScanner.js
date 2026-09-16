import {
    createAtom,
    createFunctionShell,
    createGroupShell,
    createPowerShell,
    createRootShell
} from './runtimeNodeFactory.js';
import {
    expandIdentifier,
    findTrailingFunctionName,
    isFunctionName
} from './runtimeIdentifiers.js';
import {
    findMatchingBracket,
    readDigits,
    readExponentSuffix,
    readLetters
} from './runtimeSource.js';
import { normalizeFlatStructure } from './runtimePasses.js';

function applyExponentToNodes(nodes, source, startIndex, idFactory) {
    const exponentSuffix = readExponentSuffix(source, startIndex);

    if (!exponentSuffix) {
        if (source[startIndex] === "^") {
            throw new Error("[GenesisRuntime:P1] Einer Potenz fehlt der Exponent.");
        }

        return {
            nodes,
            nextIndex: startIndex
        };
    }

    const exponentValue = /^\d+$/.test(exponentSuffix.source)
        ? Number.parseInt(exponentSuffix.source, 10)
        : formatExponentSource(exponentSuffix.source, exponentSuffix.isGrouped);
    const exponentNodes = parseSourceInternal(exponentSuffix.source, idFactory);

    if (nodes.length <= 1) {
        return {
            nodes: [createPowerShell(idFactory, nodes, exponentValue, exponentNodes)],
            nextIndex: exponentSuffix.nextIndex
        };
    }

    return {
        nodes: [
            ...nodes.slice(0, -1),
            createPowerShell(idFactory, [nodes[nodes.length - 1]], exponentValue, exponentNodes)
        ],
        nextIndex: exponentSuffix.nextIndex
    };
}

function formatExponentSource(source, isGrouped = false) {
    if (!isGrouped) {
        return source;
    }

    return /^[a-zA-Z0-9]+$/.test(source)
        ? source
        : `(${source})`;
}

function parseSourceInternal(source, idFactory) {
    const parser = createRuntimeSourceParser(idFactory);
    return parser.parseSource(source);
}

function createRuntimeSourceParser(idFactory) {
    function parseSource(source) {
        if (!source) {
            return [];
        }

        const nodes = [];
        let index = 0;

        while (index < source.length) {
            if (source.startsWith("sqrt(", index)) {
                const openPos = index + 4;
                const closePos = findMatchingBracket(source, openPos);

                if (closePos === -1) {
                    throw new Error(`[GenesisRuntime:P1] Unbalancierte Wurzelklammer in "${source}".`);
                }

                if (closePos === openPos + 1) {
                    throw new Error("[GenesisRuntime:P1] Eine Wurzel darf keinen leeren Radikanden besitzen.");
                }

                const rootShell = createRootShell(idFactory, parseSource(source.slice(openPos + 1, closePos)));
                const withExponent = applyExponentToNodes([rootShell], source, closePos + 1, idFactory);
                nodes.push(...withExponent.nodes);
                index = withExponent.nextIndex;
                continue;
            }

            const currentChar = source[index];

            if (/[0-9]/.test(currentChar)) {
                const digits = readDigits(source, index);
                const numberAtom = createAtom(idFactory, "NUMBER", digits.value);
                const withExponent = applyExponentToNodes([numberAtom], source, digits.nextIndex, idFactory);
                nodes.push(...withExponent.nodes);
                index = withExponent.nextIndex;
                continue;
            }

            if (/[a-zA-Z]/.test(currentChar)) {
                const identifier = readLetters(source, index);

                if (source[identifier.nextIndex] === "(") {
                    const closePos = findMatchingBracket(source, identifier.nextIndex);

                    if (closePos === -1) {
                        throw new Error(`[GenesisRuntime:P1] Unbalancierte Klammer nach "${identifier.value}".`);
                    }

                    if (isFunctionName(identifier.value)) {
                        if (closePos === identifier.nextIndex + 1) {
                            throw new Error(`[GenesisRuntime:P1] Die Funktion "${identifier.value}" darf kein leeres Argument besitzen.`);
                        }

                        const functionShell = createFunctionShell(
                            idFactory,
                            identifier.value,
                            parseSource(source.slice(identifier.nextIndex + 1, closePos))
                        );
                        const withExponent = applyExponentToNodes([functionShell], source, closePos + 1, idFactory);
                        nodes.push(...withExponent.nodes);
                        index = withExponent.nextIndex;
                        continue;
                    }

                    const trailingFunctionName = findTrailingFunctionName(identifier.value);
                    if (trailingFunctionName) {
                        const prefix = identifier.value.slice(0, identifier.value.length - trailingFunctionName.length);
                        if (closePos === identifier.nextIndex + 1) {
                            throw new Error(`[GenesisRuntime:P1] Die Funktion "${trailingFunctionName}" darf kein leeres Argument besitzen.`);
                        }
                        const functionShell = createFunctionShell(
                            idFactory,
                            trailingFunctionName,
                            parseSource(source.slice(identifier.nextIndex + 1, closePos))
                        );
                        const withExponent = applyExponentToNodes([functionShell], source, closePos + 1, idFactory);
                        nodes.push(
                            ...expandIdentifier(prefix, { parseSource, idFactory }),
                            ...withExponent.nodes
                        );
                        index = withExponent.nextIndex;
                        continue;
                    }

                    if (identifier.value.length > 1) {
                        throw new Error(`[GenesisRuntime:P1] Unbekannte Funktion "${identifier.value}".`);
                    }
                }

                const expandedIdentifier = expandIdentifier(identifier.value, { parseSource, idFactory });
                const withExponent = applyExponentToNodes(expandedIdentifier, source, identifier.nextIndex, idFactory);
                nodes.push(...withExponent.nodes);
                index = withExponent.nextIndex;
                continue;
            }

            if (currentChar === "(") {
                const closePos = findMatchingBracket(source, index);

                if (closePos === -1) {
                    throw new Error(`[GenesisRuntime:P1] Unbalancierte Gruppe in "${source}".`);
                }

                if (closePos === index + 1) {
                    throw new Error("[GenesisRuntime:P1] Eine leere Gruppe ist nicht zulaessig.");
                }

                const groupShell = createGroupShell(idFactory, parseSource(source.slice(index + 1, closePos)));
                const withExponent = applyExponentToNodes([groupShell], source, closePos + 1, idFactory);
                nodes.push(...withExponent.nodes);
                index = withExponent.nextIndex;
                continue;
            }

            if (currentChar === "=") {
                nodes.push(createAtom(idFactory, "ANCHOR", currentChar));
                index += 1;
                continue;
            }

            if (["+", "-", "*", "/"].includes(currentChar)) {
                nodes.push(createAtom(idFactory, "OPERATOR", currentChar));
                index += 1;
                continue;
            }

            throw new Error(`[GenesisRuntime:P1] Unbekanntes Zeichen "${currentChar}" in "${source}".`);
        }

        return normalizeFlatStructure(nodes, idFactory);
    }

    return {
        parseSource
    };
}

export {
    createRuntimeSourceParser
};
