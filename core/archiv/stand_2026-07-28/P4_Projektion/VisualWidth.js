export function isGeneratedAdditiveShell(atom) {
    return ["ADDITION", "SUBTRACTION"].includes(atom?.type) && atom?.isGenerated === true;
}

export function isVisibleRootShell(atom) {
    return atom?.type === "ROOT" && atom?.isVisible !== false;
}

export function isVisibleGroupShell(atom) {
    return atom?.type === "GROUP" && atom?.isVisible !== false;
}

export function isVisibleFunctionShell(atom) {
    return atom?.type === "FUNCTION" && atom?.isVisible !== false && Array.isArray(atom?.content);
}

export function isVisiblePowerShell(atom) {
    return atom?.type === "POWER" && atom?.isVisible !== false && Array.isArray(atom?.content);
}

export function isVisibleNegationShell(atom) {
    return atom?.type === "NEGATION" && atom?.isVisible !== false && Array.isArray(atom?.content);
}

export function isVisibleInlineSpanShell(atom) {
    return isVisibleRootShell(atom)
        || isVisibleGroupShell(atom)
        || isVisibleFunctionShell(atom)
        || isVisiblePowerShell(atom)
        || isVisibleNegationShell(atom);
}

export function isExpandableMultiplicationShell(atom) {
    return atom?.type === "MULTIPLICATION"
        && Array.isArray(atom.content)
        && Array.isArray(atom.factor);
}

export function needsVisibleMultiplicationSeparator(atom) {
    const factor = Array.isArray(atom?.factor) ? atom.factor.filter((item) => item?.isVisible !== false) : [];
    return factor[0]?.type === "NUMBER";
}

export function getLeadingVisualReserveWidth(atom) {
    if (!atom || atom.isVisible === false) {
        return 0;
    }

    if (isExpandableMultiplicationShell(atom) && atom.flowDirection === "rtl") {
        const factorWidth = getCollectionVisualWidth(Array.isArray(atom.factor) ? atom.factor : []);
        const separatorWidth = needsVisibleMultiplicationSeparator(atom) ? 1 : 0;
        return factorWidth + separatorWidth;
    }

    return 0;
}

export function getCollectionVisualWidth(collection = []) {
    return collection.reduce((sum, atom) => sum + getAtomVisualWidth(atom), 0);
}

export function getAtomVisualWidth(atom) {
    if (!atom || atom.isVisible === false) {
        return 1;
    }

    if (atom.type === "DIVISION") {
        const numeratorWidth = getCollectionVisualWidth(Array.isArray(atom.numerator) ? atom.numerator : []);
        const denominatorWidth = getCollectionVisualWidth(Array.isArray(atom.denominator) ? atom.denominator : []);
        return Math.max(1, numeratorWidth, denominatorWidth);
    }

    if (isVisibleInlineSpanShell(atom)) {
        const contentWidth = getCollectionVisualWidth(Array.isArray(atom.content) ? atom.content : []);

        if (isVisibleFunctionShell(atom)) {
            return Math.max(3, contentWidth + 3);
        }

        if (isVisibleNegationShell(atom)) {
            return Math.max(2, 1 + contentWidth);
        }

        return Math.max(1, contentWidth);
    }

    if (isExpandableMultiplicationShell(atom)) {
        const contentWidth = getCollectionVisualWidth(Array.isArray(atom.content) ? atom.content : []);
        const factorWidth = getCollectionVisualWidth(Array.isArray(atom.factor) ? atom.factor : []);
        const separatorWidth = needsVisibleMultiplicationSeparator(atom) ? 1 : 0;
        return Math.max(1, contentWidth + separatorWidth + factorWidth);
    }

    if (isGeneratedAdditiveShell(atom)) {
        const contentWidth = getCollectionVisualWidth(Array.isArray(atom.content) ? atom.content : []);
        const passiveWidth = getCollectionVisualWidth(Array.isArray(atom.passive) ? atom.passive : []);
        return Math.max(1, contentWidth + 1 + passiveWidth);
    }

    return 1;
}

export function getAtomAnchorOffset(atom) {
    if (atom?.type === "DIVISION" && atom?.isVisible !== false) {
        const width = getAtomVisualWidth(atom);
        return Math.floor((width - 1) / 2);
    }

    return 0;
}
