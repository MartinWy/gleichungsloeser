import {
    createAdditionShell,
    createAtom,
    createDivisionShell,
    createMultiplicationShell,
    createNegationShell,
    createSubtractionShell
} from './runtimeNodeFactory.js';

const TERM_CARRIER_TYPES = new Set([
    "NUMBER",
    "VARIABLE",
    "ROOT",
    "POWER",
    "FUNCTION",
    "GROUP",
    "DIVISION",
    "MULTIPLICATION",
    "ADDITION",
    "SUBTRACTION",
    "NEGATION"
]);

function isTermCarrier(node) {
    return Boolean(node && node.isVisible !== false && TERM_CARRIER_TYPES.has(node.type));
}

function isOperator(node, values = []) {
    return Boolean(
        node
        && node.type === "OPERATOR"
        && node.isVisible !== false
        && values.includes(node.value)
    );
}

function inputError(message) {
    return new Error(`[GenesisRuntime:P1] ${message}`);
}

function insertImplicitMultiplication(nodes, idFactory) {
    const result = [];

    nodes.forEach((node, index) => {
        result.push(node);

        const nextNode = nodes[index + 1];
        if (isTermCarrier(node) && isTermCarrier(nextNode)) {
            result.push(createAtom(idFactory, "OPERATOR", "*", { isImplicit: true }));
        }
    });

    return result;
}

function collectUnaryNegationContent(nodes = [], startIndex = 0, previousOperator = null) {
    if (isOperator(previousOperator, ["*", "/"])) {
        return {
            content: nodes.slice(startIndex, startIndex + 1),
            nextIndex: startIndex + 1
        };
    }

    const content = [];
    let index = startIndex;

    while (index < nodes.length) {
        const node = nodes[index];
        const isAdditiveBoundary = isOperator(node, ["+", "-"]);

        if (node?.type === "ANCHOR" || isAdditiveBoundary) {
            break;
        }

        content.push(node);
        index += 1;
    }

    return {
        content,
        nextIndex: index
    };
}

function collapseNegationStructure(nodes, idFactory) {
    const result = [];

    for (let index = 0; index < nodes.length; index += 1) {
        const current = nodes[index];
        const previous = result[result.length - 1] || null;
        const next = nodes[index + 1] || null;
        const atSegmentStart = !previous
            || previous.type === "ANCHOR"
            || previous.type === "OPERATOR";

        if (isOperator(current, ["-"]) && atSegmentStart) {
            if (!isTermCarrier(next)) {
                throw inputError("Der unitaeren Negation fehlt ein Operand.");
            }

            const { content, nextIndex } = collectUnaryNegationContent(nodes, index + 1, previous);
            const normalizedContent = normalizeExpression(content, idFactory);
            result.push(createNegationShell(idFactory, current, [normalizedContent]));
            index = nextIndex - 1;
            continue;
        }

        result.push(current);
    }

    return result;
}

function appendMultiplication(idFactory, current, operator, factor) {
    if (current.type === "MULTIPLICATION") {
        return createMultiplicationShell(
            idFactory,
            [...current.factors, factor],
            [...current.operators, operator]
        );
    }

    return createMultiplicationShell(idFactory, [current, factor], [operator]);
}

function collapseMultiplicativeStructure(nodes, idFactory) {
    if (!isTermCarrier(nodes[0])) {
        throw inputError("Einer Multiplikation oder Division fehlt ein Operand.");
    }

    let currentExpression = nodes[0];

    for (let index = 1; index < nodes.length; index += 2) {
        const operator = nodes[index];
        const nextNode = nodes[index + 1];

        if (!isOperator(operator, ["*", "/"]) || !isTermCarrier(nextNode)) {
            throw inputError("Einer Multiplikation oder Division fehlt ein Operand.");
        }

        currentExpression = operator.value === "*"
            ? appendMultiplication(idFactory, currentExpression, operator, nextNode)
            : createDivisionShell(idFactory, [currentExpression], operator, [nextNode]);
    }

    return currentExpression;
}

function appendAddition(idFactory, current, operator, term) {
    if (current.type === "ADDITION") {
        return createAdditionShell(
            idFactory,
            [...current.terms, term],
            [...current.operators, operator]
        );
    }

    return createAdditionShell(idFactory, [current, term], [operator]);
}

function collapseAdditiveStructure(nodes, idFactory) {
    const segments = [];
    const operators = [];
    let currentSegment = [];

    for (const node of nodes) {
        if (isOperator(node, ["+", "-"])) {
            if (currentSegment.length === 0) {
                throw inputError("Einer Addition oder Subtraktion fehlt ein Operand.");
            }

            segments.push(currentSegment);
            operators.push(node);
            currentSegment = [];
            continue;
        }

        currentSegment.push(node);
    }

    if (currentSegment.length === 0) {
        throw inputError("Einer Addition oder Subtraktion fehlt ein Operand.");
    }
    segments.push(currentSegment);

    let currentExpression = collapseMultiplicativeStructure(segments[0], idFactory);

    operators.forEach((operator, index) => {
        const nextExpression = collapseMultiplicativeStructure(segments[index + 1], idFactory);
        currentExpression = operator.value === "+"
            ? appendAddition(idFactory, currentExpression, operator, nextExpression)
            : createSubtractionShell(idFactory, [currentExpression], operator, [nextExpression]);
    });

    return currentExpression;
}

function normalizeExpression(nodes, idFactory) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
        throw inputError("Ein Ausdruck darf nicht leer sein.");
    }

    const implicitMultiplication = insertImplicitMultiplication(nodes, idFactory);
    const negationCollapsed = collapseNegationStructure(implicitMultiplication, idFactory);
    return collapseAdditiveStructure(negationCollapsed, idFactory);
}

function normalizeFlatStructure(nodes, idFactory) {
    const anchorIndexes = nodes
        .map((node, index) => node?.type === "ANCHOR" ? index : -1)
        .filter((index) => index >= 0);

    if (anchorIndexes.length === 0) {
        return [normalizeExpression(nodes, idFactory)];
    }

    if (anchorIndexes.length !== 1) {
        throw inputError("Die Gleichung muss genau einen Gleichheitsanker besitzen.");
    }

    const anchorIndex = anchorIndexes[0];
    const leftNodes = nodes.slice(0, anchorIndex);
    const rightNodes = nodes.slice(anchorIndex + 1);

    if (leftNodes.length === 0) {
        throw inputError("Die linke Gleichungsseite darf nicht leer sein.");
    }
    if (rightNodes.length === 0) {
        throw inputError("Die rechte Gleichungsseite darf nicht leer sein.");
    }

    return [
        normalizeExpression(leftNodes, idFactory),
        nodes[anchorIndex],
        normalizeExpression(rightNodes, idFactory)
    ];
}

export {
    collapseNegationStructure,
    insertImplicitMultiplication,
    isTermCarrier,
    normalizeFlatStructure
};
