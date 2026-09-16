import {
    getAtomVisualWidth,
    getCollectionVisualWidth,
    getLeadingVisualReserveWidth,
    isExpandableMultiplicationShell,
    isGeneratedAdditiveShell,
    isVisibleFunctionShell,
    isVisibleNegationShell,
    needsVisibleMultiplicationSeparator
} from "./VisualWidth.js";
import { buildRowSemanticFootprint } from "./SemanticFootprint.js";

function getAtoms(row) {
    if (Array.isArray(row)) {
        return row;
    }

    if (row && Array.isArray(row.atoms)) {
        return row.atoms;
    }

    return [];
}

function getRowId(row, index) {
    if (row && typeof row.rowId === "string" && row.rowId.length > 0) {
        return row.rowId;
    }

    return `theory-${index}`;
}

function resolveAnchorIndex(atoms) {
    const anchorIndex = atoms.findIndex((atom) => atom && atom.value === "=");
    return anchorIndex === -1 ? 0 : anchorIndex;
}

function getRightLeadingReserveWidth(atom) {
    return getLeadingVisualReserveWidth(atom);
}

function computeLocalStartCols(atoms) {
    const anchorIndex = resolveAnchorIndex(atoms);
    const startCols = new Array(atoms.length).fill(0);

    let leftCursor = 0;
    for (let index = anchorIndex - 1; index >= 0; index -= 1) {
        const width = getAtomVisualWidth(atoms[index]);
        leftCursor -= width;
        startCols[index] = leftCursor;
    }

    if (anchorIndex >= 0 && anchorIndex < atoms.length) {
        startCols[anchorIndex] = 0;
    }

    let rightCursor = 1;
    for (let index = anchorIndex + 1; index < atoms.length; index += 1) {
        startCols[index] = rightCursor;
        rightCursor += getAtomVisualWidth(atoms[index]);
    }

    return startCols;
}

function resolveGeneratedSourceCollection(atom) {
    if (atom?.type === "DIVISION" && Array.isArray(atom?.numerator)) {
        return atom.numerator;
    }

    if (Array.isArray(atom?.content)) {
        return atom.content;
    }

    return [];
}

function preservesEquationFacingEdge(atom, side) {
    return side === "right"
        && isVisibleFunctionShell(atom)
        && atom?.isGenerated !== true;
}

function getImmediateBoundaryAtom(collection = [], side) {
    const visibleAtoms = (collection || []).filter((atom) => atom && atom.isVisible !== false);
    if (visibleAtoms.length === 0) {
        return null;
    }

    return side === "right" ? visibleAtoms[visibleAtoms.length - 1] : visibleAtoms[0];
}

function collectImmediateBoundaryIdsFromCollection(collection = [], side) {
    const boundaryAtom = getImmediateBoundaryAtom(collection, side);
    if (typeof boundaryAtom?.id === "string" && boundaryAtom.id.length > 0) {
        return [boundaryAtom.id];
    }

    return [];
}

function collectDeepBoundaryIdsFromAtom(atom, side) {
    if (!atom || atom.isVisible === false) {
        return [];
    }

    if (atom.isGenerated === true) {
        const nextBoundaryAtom = getImmediateBoundaryAtom(resolveGeneratedSourceCollection(atom), side);
        const nestedIds = collectDeepBoundaryIdsFromAtom(nextBoundaryAtom, side);
        if (nestedIds.length > 0) {
            return nestedIds;
        }
    }

    if (typeof atom.id === "string" && atom.id.length > 0) {
        return [atom.id];
    }

    return [];
}

function collectDeepBoundaryIdsFromCollection(collection = [], side) {
    return collectDeepBoundaryIdsFromAtom(getImmediateBoundaryAtom(collection, side), side);
}

function collectReserveCarrierIdsFromCollection(collection = [], side) {
    const boundaryAtom = getImmediateBoundaryAtom(collection, side);
    if (!boundaryAtom) {
        return [];
    }

    if (typeof boundaryAtom.id === "string" && boundaryAtom.id.length > 0) {
        return [boundaryAtom.id];
    }

    return collectDeepBoundaryIdsFromAtom(boundaryAtom, side);
}

function getTrackReserveWidths(atom) {
    if (!atom || atom.isVisible === false || atom.isGenerated !== true) {
        return { leading: 0, trailing: 0 };
    }

    if (atom?.type === "DIVISION") {
        const numerator = Array.isArray(atom.numerator) ? atom.numerator : [];
        const numeratorWidth = getCollectionVisualWidth(numerator);
        const divisionWidth = getAtomVisualWidth(atom);
        const leading = Math.max(0, Math.floor((divisionWidth - numeratorWidth) / 2));
        const trailing = Math.max(0, divisionWidth - numeratorWidth - leading);

        return { leading, trailing };
    }

    if (isVisibleFunctionShell(atom)) {
        return { leading: 2, trailing: 1 };
    }

    if (isVisibleNegationShell(atom)) {
        return { leading: 1, trailing: 0 };
    }

    if (isExpandableMultiplicationShell(atom)) {
        const factor = Array.isArray(atom.factor) ? atom.factor : [];
        const factorWidth = getCollectionVisualWidth(factor);
        const separatorWidth = needsVisibleMultiplicationSeparator(atom) ? 1 : 0;
        const affixWidth = factorWidth + separatorWidth;

        return atom.flowDirection === "rtl"
            ? { leading: affixWidth, trailing: 0 }
            : { leading: 0, trailing: affixWidth };
    }

    if (isGeneratedAdditiveShell(atom)) {
        const passiveWidth = getCollectionVisualWidth(Array.isArray(atom.passive) ? atom.passive : []);
        return { leading: 0, trailing: passiveWidth > 0 ? passiveWidth + 1 : 0 };
    }

    return { leading: 0, trailing: 0 };
}

function collectTopLevelSourceIds(collection = []) {
    return collection
        .map((atom) => atom?.id)
        .filter((id) => typeof id === "string" && id.length > 0);
}

function collectCurrentTrackSourceIds(atom) {
    if (!atom) {
        return [];
    }

    if (atom.isGenerated === true) {
        const sourceIds = collectTopLevelSourceIds(resolveGeneratedSourceCollection(atom));
        if (sourceIds.length > 0) {
            return sourceIds;
        }
    }

    if (typeof atom.id === "string" && atom.id.length > 0) {
        return [atom.id];
    }

    return [];
}

function atomContainsAnySourceId(atom, sourceIds = []) {
    if (!atom || sourceIds.length === 0) {
        return false;
    }

    if (typeof atom.id === "string" && sourceIds.includes(atom.id)) {
        return true;
    }

    return ["content", "numerator", "denominator", "factor", "passive"].some((key) => {
        if (!Array.isArray(atom?.[key])) {
            return false;
        }

        return atom[key].some((entry) => atomContainsAnySourceId(entry, sourceIds));
    });
}

function canReuseHiddenPredecessorTrack(atom, previousAtom) {
    if (!atom || atom.isVisible === false || !previousAtom || previousAtom.isVisible !== false) {
        return false;
    }

    const sourceIds = collectCurrentTrackSourceIds(atom);
    if (sourceIds.length === 0) {
        return false;
    }

    return atomContainsAnySourceId(previousAtom, sourceIds);
}

function collectLeadingReserveTargetIdsFromCollection(collection = []) {
    const firstVisibleAtom = (collection || []).find((atom) => atom && atom.isVisible !== false);
    if (!firstVisibleAtom) {
        return [];
    }

    return collectLeadingReserveTargetIds(firstVisibleAtom);
}

function collectLeadingReserveTargetIds(atom) {
    if (!atom) {
        return [];
    }

    if (atom.isGenerated === true) {
        return collectLeadingReserveTargetIdsFromCollection(resolveGeneratedSourceCollection(atom));
    }

    const ids = [];
    if (typeof atom.id === "string" && atom.id.length > 0) {
        ids.push(atom.id);
    }

    return ids;
}

function collectFutureAnchorSideReserves(theoryRows = []) {
    const snapshots = new Array(theoryRows.length).fill(null);
    const leftFutureReserves = new Map();
    const rightFutureReserves = new Map();

    for (let rowIndex = theoryRows.length - 1; rowIndex >= 0; rowIndex -= 1) {
        snapshots[rowIndex] = {
            left: new Map(leftFutureReserves),
            right: new Map(rightFutureReserves)
        };

        const atoms = getAtoms(theoryRows[rowIndex]);
        const anchorIndex = resolveAnchorIndex(atoms);

        atoms.forEach((atom, index) => {
            if (!atom || atom.isVisible === false || index === anchorIndex) {
                return;
            }

            const sourceCollection = resolveGeneratedSourceCollection(atom);
            const { leading, trailing } = getTrackReserveWidths(atom);
            const inheritedLeading = typeof atom.id === "string" ? (rightFutureReserves.get(atom.id) || 0) : 0;
            const inheritedTrailing = typeof atom.id === "string" ? (leftFutureReserves.get(atom.id) || 0) : 0;
            const effectiveLeading = Math.max(leading, inheritedLeading);
            const effectiveTrailing = Math.max(trailing, inheritedTrailing);

            if (index < anchorIndex && effectiveTrailing > 0) {
                collectReserveCarrierIdsFromCollection(sourceCollection, "right").forEach((id) => {
                    leftFutureReserves.set(id, Math.max(leftFutureReserves.get(id) || 0, effectiveTrailing));
                });
            }

            if (index > anchorIndex && effectiveLeading > 0 && !preservesEquationFacingEdge(atom, "right")) {
                collectReserveCarrierIdsFromCollection(sourceCollection, "left").forEach((id) => {
                    rightFutureReserves.set(id, Math.max(rightFutureReserves.get(id) || 0, effectiveLeading));
                });
            }
        });
    }

    return snapshots;
}

function resolveEntryEdge(entry, side) {
    if (!entry) {
        return null;
    }

    return side === "left" ? entry.endCol : entry.startCol;
}

function adjustInheritedEdgeForLeadingReserve(atom, side, edge) {
    if (!Number.isInteger(edge)) {
        return edge;
    }

    if (preservesEquationFacingEdge(atom, side)) {
        return edge;
    }

    const { leading, trailing } = getTrackReserveWidths(atom);
    if (side === "right" && leading > 0) {
        return edge - leading;
    }

    if (side === "left" && trailing > 0) {
        return edge + trailing;
    }

    if (side !== "right") {
        return edge;
    }

    const reserveWidth = getRightLeadingReserveWidth(atom);
    if (!(reserveWidth > 0) || atom?.isGenerated !== true) {
        return edge;
    }

    return edge - reserveWidth;
}

function resolveImmediateSourceBounds(atom, previousFootprint) {
    if (!atom || !previousFootprint) {
        return null;
    }

    const sourceIds = (resolveGeneratedSourceCollection(atom) || [])
        .map((entry) => entry?.id)
        .filter((id) => typeof id === "string" && id.length > 0);

    if (sourceIds.length === 0) {
        return null;
    }

    const sourceEntries = sourceIds
        .map((id) => previousFootprint.entries.get(id))
        .filter(Boolean);

    if (sourceEntries.length === 0) {
        return null;
    }

    return {
        startCol: Math.min(...sourceEntries.map((entry) => entry.startCol)),
        endCol: Math.max(...sourceEntries.map((entry) => entry.endCol))
    };
}

function resolveGeneratedDivisionPreservedEdge(atom, side, previousFootprint) {
    if (atom?.type !== "DIVISION" || atom?.isGenerated !== true || !previousFootprint || side === "anchor") {
        return null;
    }

    const numerator = Array.isArray(atom?.numerator) ? atom.numerator : [];
    const sourceIds = numerator
        .map((entry) => entry?.id)
        .filter((id) => typeof id === "string" && id.length > 0);

    if (sourceIds.length === 0) {
        return null;
    }

    const sourceEntries = sourceIds
        .map((id) => previousFootprint.entries.get(id))
        .filter(Boolean);

    if (sourceEntries.length === 0) {
        return null;
    }

    const numeratorWidth = getCollectionVisualWidth(numerator);
    const divisionWidth = getAtomVisualWidth(atom);
    const numeratorLeftInset = Math.max(0, Math.floor((divisionWidth - numeratorWidth) / 2));
    const numeratorRightInset = Math.max(0, divisionWidth - numeratorWidth - numeratorLeftInset);
    const sourceStart = Math.min(...sourceEntries.map((entry) => entry.startCol));
    const sourceEnd = Math.max(...sourceEntries.map((entry) => entry.endCol));

    return side === "left"
        ? sourceEnd + numeratorRightInset
        : sourceStart - numeratorLeftInset;
}

function resolveInheritedEdge(atom, side, previousFootprint) {
    if (!atom || !previousFootprint || side === "anchor") {
        return null;
    }

    const preservedDivisionEdge = resolveGeneratedDivisionPreservedEdge(atom, side, previousFootprint);
    if (Number.isInteger(preservedDivisionEdge)) {
        return preservedDivisionEdge;
    }

    const immediateSourceBounds = resolveImmediateSourceBounds(atom, previousFootprint);
    if (atom.isGenerated === true && immediateSourceBounds) {
        const { leading, trailing } = getTrackReserveWidths(atom);
        if (preservesEquationFacingEdge(atom, side)) {
            return immediateSourceBounds.startCol;
        }
        if (side === "right" && isVisibleNegationShell(atom)) {
            return immediateSourceBounds.startCol;
        }
        return side === "left"
            ? immediateSourceBounds.endCol + trailing
            : immediateSourceBounds.startCol - leading;
    }

    if (atom.isGenerated === true) {
        const sourceIds = collectTopLevelSourceIds(resolveGeneratedSourceCollection(atom));
        const sourceEdges = sourceIds
            .map((id) => resolveEntryEdge(previousFootprint.entries.get(id), side))
            .filter((value) => Number.isInteger(value));

        if (sourceEdges.length > 0) {
            const inheritedEdge = side === "left"
                ? Math.max(...sourceEdges)
                : Math.min(...sourceEdges);
            return adjustInheritedEdgeForLeadingReserve(atom, side, inheritedEdge);
        }
    }

    if (typeof atom.id === "string" && previousFootprint.entries.has(atom.id)) {
        return adjustInheritedEdgeForLeadingReserve(
            atom,
            side,
            resolveEntryEdge(previousFootprint.entries.get(atom.id), side)
        );
    }

    return null;
}

function inheritsFutureRightLeadingReserve(atom) {
    return atom?.isGenerated === true
        && ["FUNCTION", "GROUP", "ROOT", "POWER"].includes(atom?.type);
}

function resolveFutureAnchorSideReserve(atom, side, futureReserves) {
    if (!futureReserves || !atom || atom?.isVisible === false) {
        return 0;
    }

    const reserveMap = side === "left" ? futureReserves.left : futureReserves.right;
    if (!reserveMap) {
        return 0;
    }

    if (typeof atom.id === "string" && atom.id.length > 0) {
        const directReserve = reserveMap.get(atom.id) || 0;
        if (directReserve > 0) {
            return directReserve;
        }
    }

    if (side === "left") {
        return 0;
    }

    const sourceCollection = resolveGeneratedSourceCollection(atom);
    if (atom?.isGenerated !== true) {
        const boundaryIds = collectDeepBoundaryIdsFromCollection(sourceCollection, side === "left" ? "right" : "left");
        const boundaryReserve = Math.max(0, ...boundaryIds.map((id) => reserveMap.get(id) || 0));
        if (boundaryReserve > 0) {
            return boundaryReserve;
        }
    }

    if (typeof atom.id !== "string" || atom.id.length === 0) {
        if (!inheritsFutureRightLeadingReserve(atom)) {
            return 0;
        }

        return Math.max(
            0,
            ...collectLeadingReserveTargetIdsFromCollection(resolveGeneratedSourceCollection(atom)).map((id) => reserveMap.get(id) || 0)
        );
    }

    const directReserve = reserveMap.get(atom.id) || 0;
    if (directReserve > 0 || !inheritsFutureRightLeadingReserve(atom)) {
        return directReserve;
    }

    return Math.max(
        0,
        ...collectLeadingReserveTargetIdsFromCollection(resolveGeneratedSourceCollection(atom)).map((id) => reserveMap.get(id) || 0)
    );
}

function preservesImmediateSourceFacingEdge(atom, side, previousFootprint) {
    if (atom?.isGenerated !== true || !previousFootprint || side === "anchor") {
        return false;
    }

    const immediateSourceBounds = resolveImmediateSourceBounds(atom, previousFootprint);
    if (!immediateSourceBounds) {
        return false;
    }

    const shellEdge = resolveInheritedEdge(atom, side, previousFootprint);
    if (!Number.isInteger(shellEdge)) {
        return false;
    }

    return side === "left"
        ? shellEdge === immediateSourceBounds.endCol
        : shellEdge === immediateSourceBounds.startCol;
}

function shouldApplyFutureReserveAtCurrentShell(atom, side, previousFootprint) {
    if (atom?.isGenerated !== true || !previousFootprint || side === "anchor") {
        return true;
    }

    return !preservesImmediateSourceFacingEdge(atom, side, previousFootprint);
}

function computePackedStartCols(atoms, previousFootprint, futureReserves = null) {
    const anchorIndex = resolveAnchorIndex(atoms);
    const fallbackStartCols = computeLocalStartCols(atoms);
    const widths = atoms.map((atom) => getAtomVisualWidth(atom));
    const startCols = new Array(atoms.length).fill(0);

    if (anchorIndex >= 0 && anchorIndex < atoms.length) {
        startCols[anchorIndex] = 0;
    }

    let maxAllowedEnd = -1;
    for (let index = anchorIndex - 1; index >= 0; index -= 1) {
        const width = widths[index];
        const fallbackEnd = fallbackStartCols[index] + width - 1;
        const inheritedEnd = resolveInheritedEdge(atoms[index], "left", previousFootprint);
        const reserveShift = shouldApplyFutureReserveAtCurrentShell(atoms[index], "left", previousFootprint)
            ? resolveFutureAnchorSideReserve(atoms[index], "left", futureReserves)
            : 0;
        const preferredEnd = (Number.isInteger(inheritedEnd) ? inheritedEnd : fallbackEnd) - reserveShift;
        const endCol = Math.min(maxAllowedEnd, preferredEnd);
        const startCol = endCol - width + 1;

        startCols[index] = startCol;
        maxAllowedEnd = startCol - 1;
    }

    let minAllowedStart = 1;
    for (let index = anchorIndex + 1; index < atoms.length; index += 1) {
        const width = widths[index];
        const previousAtom = atoms[index - 1] || null;
        const inheritedStart = resolveInheritedEdge(atoms[index], "right", previousFootprint);
        const reserveShift = shouldApplyFutureReserveAtCurrentShell(atoms[index], "right", previousFootprint)
            ? resolveFutureAnchorSideReserve(atoms[index], "right", futureReserves)
            : 0;
        const preferredStartBase = Number.isInteger(inheritedStart) ? inheritedStart : fallbackStartCols[index];
        const preferredStart = preferredStartBase + reserveShift;
        const startCol = canReuseHiddenPredecessorTrack(atoms[index], previousAtom)
            ? preferredStart
            : Math.max(minAllowedStart, preferredStart);

        startCols[index] = startCol;
        minAllowedStart = startCol + width;
    }

    return startCols;
}

export function planSemanticTracks(theoryRows = []) {
    const rowLayouts = [];
    let previousFootprint = null;
    const futureReserveSnapshots = collectFutureAnchorSideReserves(theoryRows);

    theoryRows.forEach((row, index) => {
        const atoms = getAtoms(row);
        const startCols = computePackedStartCols(atoms, previousFootprint, futureReserveSnapshots[index]);
        const footprint = buildRowSemanticFootprint(atoms, startCols);

        rowLayouts.push({
            rowId: getRowId(row, index),
            anchorIndex: resolveAnchorIndex(atoms),
            atomCount: atoms.length,
            startCols,
            minCol: footprint.minCol,
            maxCol: footprint.maxCol
        });

        previousFootprint = footprint;
    });

    const globalMinCol = rowLayouts.reduce((min, row) => Math.min(min, row.minCol), 0);
    const globalMaxCol = rowLayouts.reduce((max, row) => Math.max(max, row.maxCol), 0);
    const anchorColumn = -globalMinCol;
    const columnCount = globalMaxCol + anchorColumn + 1;

    return {
        anchorColumn,
        columnCount,
        leftSpan: anchorColumn,
        rightSpan: Math.max(0, columnCount - anchorColumn - 1),
        rows: rowLayouts.map((row) => ({
            ...row,
            startCols: row.startCols.map((startCol) => startCol + anchorColumn),
            minCol: row.minCol + anchorColumn,
            maxCol: row.maxCol + anchorColumn
        }))
    };
}
