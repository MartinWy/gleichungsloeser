import {
    getAtomVisualWidth,
    getCollectionVisualWidth,
    isExpandableMultiplicationShell,
    isGeneratedAdditiveShell,
    isVisibleFunctionShell,
    isVisibleInlineSpanShell,
    isVisibleNegationShell,
    needsVisibleMultiplicationSeparator
} from "./VisualWidth.js";

function createBounds() {
    return {
        minCol: Infinity,
        maxCol: -Infinity
    };
}

function updateBounds(bounds, startCol, endCol) {
    bounds.minCol = Math.min(bounds.minCol, startCol);
    bounds.maxCol = Math.max(bounds.maxCol, endCol);
}

function registerEntry(entries, atom, startCol, endCol) {
    if (typeof atom?.id !== "string" || atom.id.length === 0) {
        return;
    }

    const existingEntry = entries.get(atom.id);
    if (existingEntry) {
        existingEntry.startCol = Math.min(existingEntry.startCol, startCol);
        existingEntry.endCol = Math.max(existingEntry.endCol, endCol);
        return;
    }

    entries.set(atom.id, {
        id: atom.id,
        startCol,
        endCol
    });
}

function placeCollection(collection = [], startCol, state) {
    let cursor = startCol;

    collection.forEach((atom) => {
        placeAtom(atom, cursor, state);
        cursor += getAtomVisualWidth(atom);
    });
}

function getInlineShellContentStartCol(atom, startCol) {
    if (isVisibleFunctionShell(atom)) {
        return startCol + 2;
    }

    if (isVisibleNegationShell(atom)) {
        return startCol + 1;
    }

    return startCol;
}

function placeDivision(atom, startCol, state) {
    const width = getAtomVisualWidth(atom);
    const endCol = startCol + width - 1;

    registerEntry(state.entries, atom, startCol, endCol);
    updateBounds(state.bounds, startCol, endCol);

    if (atom?.isVisible === false) {
        return;
    }

    const numerator = Array.isArray(atom?.numerator) ? atom.numerator : [];
    const denominator = Array.isArray(atom?.denominator) ? atom.denominator : [];
    const numeratorWidth = getCollectionVisualWidth(numerator);
    const denominatorWidth = getCollectionVisualWidth(denominator);
    const numeratorStartCol = startCol + Math.floor((width - numeratorWidth) / 2);
    const denominatorStartCol = startCol + Math.floor((width - denominatorWidth) / 2);

    placeCollection(numerator, numeratorStartCol, state);
    placeCollection(denominator, denominatorStartCol, state);
}

function placeInlineSpanShell(atom, startCol, state) {
    const width = getAtomVisualWidth(atom);
    const endCol = startCol + width - 1;

    registerEntry(state.entries, atom, startCol, endCol);
    updateBounds(state.bounds, startCol, endCol);

    if (atom?.isVisible === false) {
        return;
    }

    const content = Array.isArray(atom?.content) ? atom.content : [];
    const contentStartCol = getInlineShellContentStartCol(atom, startCol);
    placeCollection(content, contentStartCol, state);
}

function placeMultiplicationShell(atom, startCol, state) {
    const width = getAtomVisualWidth(atom);
    const endCol = startCol + width - 1;

    registerEntry(state.entries, atom, startCol, endCol);
    updateBounds(state.bounds, startCol, endCol);

    if (atom?.isVisible === false) {
        return;
    }

    const content = Array.isArray(atom?.content) ? atom.content : [];
    const factor = Array.isArray(atom?.factor) ? atom.factor : [];
    const reverseFlow = atom?.flowDirection === "rtl";
    const contentWidth = getCollectionVisualWidth(content);
    const factorWidth = getCollectionVisualWidth(factor);

    let contentStartCol = startCol;
    let operatorCol = startCol + contentWidth;
    let factorStartCol = operatorCol;

    if (reverseFlow) {
        factorStartCol = startCol;
        operatorCol = startCol + factorWidth;
        contentStartCol = operatorCol;
    }

    if (needsVisibleMultiplicationSeparator(atom)) {
        if (reverseFlow) {
            contentStartCol += 1;
        } else {
            factorStartCol += 1;
        }
    }

    placeCollection(reverseFlow ? factor : content, reverseFlow ? factorStartCol : contentStartCol, state);
    placeCollection(reverseFlow ? content : factor, reverseFlow ? contentStartCol : factorStartCol, state);
}

function placeGeneratedAdditiveShell(atom, startCol, state) {
    const width = getAtomVisualWidth(atom);
    const endCol = startCol + width - 1;

    registerEntry(state.entries, atom, startCol, endCol);
    updateBounds(state.bounds, startCol, endCol);

    if (atom?.isVisible === false) {
        return;
    }

    const content = Array.isArray(atom?.content) ? atom.content : [];
    const passive = Array.isArray(atom?.passive) ? atom.passive : [];
    const contentWidth = getCollectionVisualWidth(content);

    placeCollection(content, startCol, state);
    placeCollection(passive, startCol + contentWidth + 1, state);
}

function placeAtom(atom, startCol, state) {
    if (!atom) {
        return;
    }

    if (atom.type === "DIVISION") {
        placeDivision(atom, startCol, state);
        return;
    }

    if (isVisibleInlineSpanShell(atom)) {
        placeInlineSpanShell(atom, startCol, state);
        return;
    }

    if (isExpandableMultiplicationShell(atom)) {
        placeMultiplicationShell(atom, startCol, state);
        return;
    }

    if (isGeneratedAdditiveShell(atom)) {
        placeGeneratedAdditiveShell(atom, startCol, state);
        return;
    }

    const width = getAtomVisualWidth(atom);
    const endCol = startCol + width - 1;
    registerEntry(state.entries, atom, startCol, endCol);
    updateBounds(state.bounds, startCol, endCol);
}

export function buildRowSemanticFootprint(atoms = [], startCols = []) {
    const state = {
        entries: new Map(),
        bounds: createBounds()
    };

    atoms.forEach((atom, index) => {
        placeAtom(atom, startCols[index] ?? 0, state);
    });

    const hasEntries = state.bounds.minCol !== Infinity && state.bounds.maxCol !== -Infinity;

    return {
        entries: state.entries,
        minCol: hasEntries ? state.bounds.minCol : 0,
        maxCol: hasEntries ? state.bounds.maxCol : 0
    };
}
