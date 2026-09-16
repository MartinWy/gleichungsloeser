import {
    isExpandableMultiplicationShell,
    isGeneratedAdditiveShell,
    isVisibleInlineSpanShell
} from "./VisualWidth.js";

function getAtoms(row) {
    if (Array.isArray(row)) {
        return row;
    }

    if (row && Array.isArray(row.atoms)) {
        return row.atoms;
    }

    return [];
}

function createBounds() {
    return {
        minRow: 0,
        maxRow: 0
    };
}

function mergeBounds(target, candidate) {
    target.minRow = Math.min(target.minRow, candidate.minRow);
    target.maxRow = Math.max(target.maxRow, candidate.maxRow);
    return target;
}

function shiftBounds(bounds, delta) {
    return {
        minRow: bounds.minRow + delta,
        maxRow: bounds.maxRow + delta
    };
}

function getCollectionVerticalBounds(collection = []) {
    return (collection || []).reduce((bounds, atom) => {
        return mergeBounds(bounds, getAtomVerticalBounds(atom));
    }, createBounds());
}

function getAtomVerticalBounds(atom) {
    if (!atom || atom.isVisible === false) {
        return createBounds();
    }

    if (atom.type === "DIVISION") {
        const bounds = createBounds();
        const numeratorBounds = shiftBounds(
            getCollectionVerticalBounds(Array.isArray(atom.numerator) ? atom.numerator : []),
            -1
        );
        const denominatorBounds = shiftBounds(
            getCollectionVerticalBounds(Array.isArray(atom.denominator) ? atom.denominator : []),
            1
        );

        mergeBounds(bounds, numeratorBounds);
        mergeBounds(bounds, denominatorBounds);
        return bounds;
    }

    if (isVisibleInlineSpanShell(atom)) {
        return getCollectionVerticalBounds(Array.isArray(atom.content) ? atom.content : []);
    }

    if (isExpandableMultiplicationShell(atom)) {
        const bounds = createBounds();
        mergeBounds(bounds, getCollectionVerticalBounds(Array.isArray(atom.content) ? atom.content : []));
        mergeBounds(bounds, getCollectionVerticalBounds(Array.isArray(atom.factor) ? atom.factor : []));
        return bounds;
    }

    if (isGeneratedAdditiveShell(atom)) {
        const bounds = createBounds();
        mergeBounds(bounds, getCollectionVerticalBounds(Array.isArray(atom.content) ? atom.content : []));
        mergeBounds(bounds, getCollectionVerticalBounds(Array.isArray(atom.passive) ? atom.passive : []));
        return bounds;
    }

    return createBounds();
}

function collectVisibleDivisionEntriesFromCollection(
    collection = [],
    relativeAxisRow = 0,
    nestedInsideInlineShell = false,
    entries = []
) {
    (collection || []).forEach((atom) => {
        collectVisibleDivisionEntriesFromAtom(atom, relativeAxisRow, nestedInsideInlineShell, entries);
    });

    return entries;
}

function collectVisibleDivisionEntriesFromAtom(
    atom,
    relativeAxisRow = 0,
    nestedInsideInlineShell = false,
    entries = []
) {
    if (!atom || atom.isVisible === false) {
        return entries;
    }

    if (atom.type === "DIVISION") {
        if (typeof atom.id === "string" && atom.id.length > 0) {
            entries.push({
                id: atom.id,
                axisOffset: relativeAxisRow,
                nestedInsideInlineShell
            });
        }

        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.numerator) ? atom.numerator : [],
            relativeAxisRow - 1,
            nestedInsideInlineShell,
            entries
        );
        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.denominator) ? atom.denominator : [],
            relativeAxisRow + 1,
            nestedInsideInlineShell,
            entries
        );
        return entries;
    }

    if (isVisibleInlineSpanShell(atom)) {
        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.content) ? atom.content : [],
            relativeAxisRow,
            true,
            entries
        );
        return entries;
    }

    if (isExpandableMultiplicationShell(atom)) {
        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.content) ? atom.content : [],
            relativeAxisRow,
            nestedInsideInlineShell,
            entries
        );
        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.factor) ? atom.factor : [],
            relativeAxisRow,
            nestedInsideInlineShell,
            entries
        );
        return entries;
    }

    if (isGeneratedAdditiveShell(atom)) {
        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.content) ? atom.content : [],
            relativeAxisRow,
            nestedInsideInlineShell,
            entries
        );
        collectVisibleDivisionEntriesFromCollection(
            Array.isArray(atom.passive) ? atom.passive : [],
            relativeAxisRow,
            nestedInsideInlineShell,
            entries
        );
    }

    return entries;
}

function resolveInheritedBaselineRow(divisionEntries = [], previousVisibleDivisionAxes = new Map()) {
    const candidates = divisionEntries
        .filter((entry) => entry.nestedInsideInlineShell && previousVisibleDivisionAxes.has(entry.id))
        .map((entry) => previousVisibleDivisionAxes.get(entry.id) - entry.axisOffset)
        .filter((value) => Number.isInteger(value));

    if (candidates.length === 0) {
        return null;
    }

    return Math.min(...candidates);
}

export function planVerticalTracks(theoryRows = []) {
    const rows = [];
    const previousVisibleDivisionAxes = new Map();

    theoryRows.forEach((row, rowIndex) => {
        const atoms = getAtoms(row);
        const verticalBounds = getCollectionVerticalBounds(atoms);
        const topReserve = Math.max(0, -verticalBounds.minRow);
        const defaultBaselineRow = rowIndex + topReserve;
        const divisionEntries = collectVisibleDivisionEntriesFromCollection(atoms);
        const inheritedBaselineRow = resolveInheritedBaselineRow(divisionEntries, previousVisibleDivisionAxes);
        const baselineRow = Number.isInteger(inheritedBaselineRow)
            ? inheritedBaselineRow
            : defaultBaselineRow;

        rows.push({
            baselineRow,
            minRow: baselineRow + verticalBounds.minRow,
            maxRow: baselineRow + verticalBounds.maxRow
        });

        previousVisibleDivisionAxes.clear();
        divisionEntries.forEach((entry) => {
            previousVisibleDivisionAxes.set(entry.id, baselineRow + entry.axisOffset);
        });
    });

    return { rows };
}

