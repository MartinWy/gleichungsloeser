import { cloneRuntimeValue } from '../runtimeClone.js';
import { walkRuntimeNodes } from '../runtimeTraversal.js';

const LEFT_TO_ANCHOR_GAP = 2;
const ANCHOR_TO_RIGHT_GAP = 2;
const P4_OUTPUT_CONTRACT_VERSION = "p4_output_contract_v1";

function collectBoundsForAtoms(atoms = []) {
    if (!Array.isArray(atoms) || atoms.length === 0) {
        return {
            hasAtoms: false,
            minRawCol: 0,
            maxRawCol: -1
        };
    }

    return {
        hasAtoms: true,
        minRawCol: Math.min(...atoms.map((atom) => atom.rawColStart ?? atom.rawCol ?? 0)),
        maxRawCol: Math.max(...atoms.map((atom) => atom.rawColEnd ?? atom.rawCol ?? 0))
    };
}

function collectSideBands(writtenRows = [], side) {
    const sideAtoms = (writtenRows || [])
        .flatMap((row) => row.projectionAtoms || [])
        .filter((atom) => atom.side === side);
    const contentAtoms = sideAtoms.filter((atom) => atom.kind === "content");
    const hullAtoms = sideAtoms.filter((atom) => atom.kind === "shell_slot");
    const reservationAtoms = [...contentAtoms, ...hullAtoms];

    return {
        allBoundsRaw: collectBoundsForAtoms(sideAtoms),
        contentBoundsRaw: collectBoundsForAtoms(contentAtoms),
        hullBoundsRaw: collectBoundsForAtoms(hullAtoms),
        reservationBoundsRaw: collectBoundsForAtoms(reservationAtoms)
    };
}

function normalizeBounds(bounds = null, shift = 0) {
    if (!bounds || bounds.hasAtoms !== true) {
        return {
            hasAtoms: false,
            minCol: null,
            maxCol: null
        };
    }

    return {
        hasAtoms: true,
        minCol: bounds.minRawCol + shift,
        maxCol: bounds.maxRawCol + shift
    };
}

function resolveSideLayout(writtenRows = []) {
    const leftBands = collectSideBands(writtenRows, "left");
    const rightBands = collectSideBands(writtenRows, "right");
    const leftBounds = leftBands.reservationBoundsRaw.hasAtoms
        ? leftBands.reservationBoundsRaw
        : leftBands.allBoundsRaw;
    const rightBounds = rightBands.reservationBoundsRaw.hasAtoms
        ? rightBands.reservationBoundsRaw
        : rightBands.allBoundsRaw;
    const leftShift = leftBounds.hasAtoms ? (0 - leftBounds.minRawCol) : 0;
    const leftWidth = leftBounds.hasAtoms ? ((leftBounds.maxRawCol - leftBounds.minRawCol) + 1) : 0;
    const anchorCol = leftWidth + LEFT_TO_ANCHOR_GAP;
    const rightShift = rightBounds.hasAtoms
        ? ((anchorCol + ANCHOR_TO_RIGHT_GAP) - rightBounds.minRawCol)
        : (anchorCol + ANCHOR_TO_RIGHT_GAP);

    return {
        leftShift,
        rightShift,
        anchorCol,
        leftBounds,
        rightBounds,
        leftBands,
        rightBands
    };
}

function normalizeProjectionAtom(atom, sideLayout) {
    if (atom.side === "anchor") {
        return {
            ...atom,
            col: sideLayout.anchorCol,
            colStart: sideLayout.anchorCol,
            colEnd: sideLayout.anchorCol
        };
    }

    const sideShift = atom.side === "left" ? sideLayout.leftShift : sideLayout.rightShift;
    const rawColStart = atom.rawColStart ?? atom.rawCol ?? 0;
    const rawColEnd = atom.rawColEnd ?? atom.rawCol ?? rawColStart;
    const col = Number.isFinite(atom.rawCol) ? (atom.rawCol + sideShift) : null;

    return {
        ...atom,
        col,
        colStart: rawColStart + sideShift,
        colEnd: rawColEnd + sideShift
    };
}

function buildRowShellKey(rowId, shellId) {
    return `${rowId}::${shellId}`;
}

function normalizeProjectionBlocks(projectionBlocks = [], shellBlueprints = []) {
    const blueprintByRowShellKey = new Map(
        (shellBlueprints || []).map((blueprint) => [
            buildRowShellKey(blueprint.rowId, blueprint.shellId),
            blueprint
        ])
    );

    return (projectionBlocks || []).map((rowBlock) => ({
        ...cloneRuntimeValue(rowBlock),
        rowRoles: Array.isArray(rowBlock?.rowRoles)
            ? cloneRuntimeValue(rowBlock.rowRoles)
            : cloneRuntimeValue(rowBlock?.rowKinds || []),
        rowKinds: Array.isArray(rowBlock?.rowKinds)
            ? cloneRuntimeValue(rowBlock.rowKinds)
            : cloneRuntimeValue(rowBlock?.rowRoles || []),
        shellBlocks: (rowBlock?.shellBlocks || []).map((shellBlock) => {
            const blueprint = blueprintByRowShellKey.get(
                buildRowShellKey(rowBlock?.rowId, shellBlock?.shellId)
            ) || null;

            return {
                ...cloneRuntimeValue(shellBlock),
                colStart: blueprint?.containerRange?.colStart ?? null,
                colEnd: blueprint?.containerRange?.colEnd ?? null,
                contentColStart: blueprint?.contentRange?.colStart ?? null,
                contentColEnd: blueprint?.contentRange?.colEnd ?? null,
                contentRowStart: Number.isInteger(shellBlock?.localTopRow) ? shellBlock.localTopRow : null,
                contentRowEnd: Number.isInteger(shellBlock?.localBottomRow) ? shellBlock.localBottomRow : null,
                axisRow: Number.isInteger(shellBlock?.axisLocalRow) ? shellBlock.axisLocalRow : null,
                alignmentColStart: blueprint?.alignmentRange?.colStart ?? null,
                alignmentColEnd: blueprint?.alignmentRange?.colEnd ?? null,
                geometryBirthRowId: blueprint?.geometryBirthRowId ?? null,
                transportMode: "closed_visible_block",
                collectionRanges: cloneRuntimeValue(blueprint?.collectionRanges || {}),
                collectionAlignmentRanges: cloneRuntimeValue(blueprint?.collectionAlignmentRanges || {}),
                collectionLeafIds: cloneRuntimeValue(blueprint?.collectionLeafIds || {}),
                contentLeafIds: cloneRuntimeValue(blueprint?.contentLeafIds || []),
                slotKinds: Array.isArray(blueprint?.slotLayout)
                    ? blueprint.slotLayout.map((slot) => slot.slotName)
                    : []
            };
        })
    }));
}

function normalizeProjectionRows(writtenRows = [], sideLayout, normalizedProjectionBlocks = []) {
    const blockByRowId = new Map((normalizedProjectionBlocks || []).map((block) => [block.rowId, block]));

    return (writtenRows || []).map((row) => {
        const block = blockByRowId.get(row?.rowId) || null;
        const rowRoles = Array.isArray(block?.rowRoles) ? block.rowRoles : [];
        const projectionAtoms = (row.projectionAtoms || []).map((atom) => {
            const normalizedAtom = normalizeProjectionAtom(atom, sideLayout);
            const localRow = normalizedAtom?.localRow ?? 0;

            return {
                ...normalizedAtom,
                rowRole: rowRoles[localRow] || null
            };
        });
        const totalCols = projectionAtoms.length === 0
            ? sideLayout.anchorCol + 1
            : (Math.max(...projectionAtoms.map((atom) => atom.colEnd ?? atom.col ?? 0)) + 1);

        return {
            ...row,
            rowRoles: cloneRuntimeValue(rowRoles),
            rowKinds: cloneRuntimeValue(Array.isArray(block?.rowKinds) ? block.rowKinds : rowRoles),
            shellSpans: cloneRuntimeValue(block?.shellBlocks || []),
            totalCols,
            projectionAtoms
        };
    });
}

function normalizeRangeForSide(range, sideLayout, side) {
    if (!range) {
        return null;
    }

    const sideShift = side === "left" ? sideLayout.leftShift : sideLayout.rightShift;
    return {
        ...range,
        colStart: range.rawColStart + sideShift,
        colEnd: range.rawColEnd + sideShift
    };
}

function normalizeShellBlueprints(shellBlueprints = [], sideLayout) {
    return (shellBlueprints || []).map((blueprint) => ({
        ...cloneRuntimeValue(blueprint),
        transportMode: "closed_visible_block",
        contentRange: normalizeRangeForSide(blueprint.contentRange, sideLayout, blueprint.side),
        alignmentRange: normalizeRangeForSide(blueprint.alignmentRange, sideLayout, blueprint.side),
        containerRange: normalizeRangeForSide(blueprint.containerRange, sideLayout, blueprint.side),
        collectionRanges: Object.fromEntries(
            Object.entries(blueprint.collectionRanges || {}).map(([key, range]) => [
                key,
                normalizeRangeForSide(range, sideLayout, blueprint.side)
            ])
        ),
        collectionAlignmentRanges: Object.fromEntries(
            Object.entries(blueprint.collectionAlignmentRanges || {}).map(([key, range]) => [
                key,
                normalizeRangeForSide(range, sideLayout, blueprint.side)
            ])
        ),
        collectionLeafIds: cloneRuntimeValue(blueprint.collectionLeafIds || {}),
        contentLeafIds: cloneRuntimeValue(blueprint.contentLeafIds || []),
        slotLayout: (blueprint.slotLayout || []).map((slot) => {
            const sideShift = blueprint.side === "left" ? sideLayout.leftShift : sideLayout.rightShift;
            return {
                ...cloneRuntimeValue(slot),
                col: Number.isFinite(slot.rawCol) ? (slot.rawCol + sideShift) : null,
                colStart: (slot.rawColStart ?? slot.rawCol ?? 0) + sideShift,
                colEnd: (slot.rawColEnd ?? slot.rawCol ?? 0) + sideShift
            };
        })
    }));
}

function buildAtomRegister(theoryRows = []) {
    const atomRegister = [];

    (theoryRows || []).forEach((row) => {
        walkRuntimeNodes(row.atoms || [], (node, context) => {
            atomRegister.push({
                rowId: row.rowId,
                nodeId: node.id || null,
                type: node.type || null,
                value: node.value ?? null,
                isVisible: node.isVisible !== false,
                path: context.path
            });
        });
    });

    return atomRegister;
}

function buildTraceIndex(semanticRaster = null, projectionRows = []) {
    const traceIndex = new Map();

    (semanticRaster?.semanticTraces || []).forEach((trace) => {
        traceIndex.set(trace.semanticKey, {
            semanticKey: trace.semanticKey,
            nodeId: trace.nodeId,
            value: trace.value,
            theoryPlacements: cloneRuntimeValue(trace.placements || []),
            projectionPlacements: []
        });
    });

    (projectionRows || []).forEach((row) => {
        (row.projectionAtoms || []).forEach((atom) => {
            if (!atom.semanticKey) {
                return;
            }

            if (!traceIndex.has(atom.semanticKey)) {
                traceIndex.set(atom.semanticKey, {
                    semanticKey: atom.semanticKey,
                    nodeId: atom.sourceNodeId || null,
                    value: atom.value ?? null,
                    theoryPlacements: [],
                    projectionPlacements: []
                });
            }

            traceIndex.get(atom.semanticKey).projectionPlacements.push({
                rowId: row.rowId,
                projectionAtomId: atom.projectionAtomId,
                col: atom.col,
                localRow: atom.localRow
            });
        });
    });

    return [...traceIndex.values()];
}

function normalizeTrackLayout(tracks = [], sideLayout, side) {
    const sideShift = side === "left" ? sideLayout.leftShift : sideLayout.rightShift;

    return (tracks || []).map((track) => ({
        ...cloneRuntimeValue(track),
        col: track.rawCol + sideShift
    }));
}

function normalizeProfileCell(cell, sideLayout, side) {
    const sideShift = side === "left" ? sideLayout.leftShift : sideLayout.rightShift;
    return {
        ...cloneRuntimeValue(cell),
        col: Number.isFinite(cell?.rawCol) ? cell.rawCol + sideShift : null,
        colStart: (cell?.rawColStart ?? cell?.rawCol ?? 0) + sideShift,
        colEnd: (cell?.rawColEnd ?? cell?.rawCol ?? 0) + sideShift
    };
}

function normalizeGlobalCellProfile(cellProfile = null, sideLayout) {
    if (!cellProfile) {
        return null;
    }

    return {
        contractVersion: cellProfile.contractVersion || null,
        columns: Object.fromEntries(["left", "right"].map((side) => {
            const sideShift = side === "left" ? sideLayout.leftShift : sideLayout.rightShift;
            return [side, (cellProfile?.columns?.[side] || []).map((rawCol) => rawCol + sideShift)];
        })),
        rows: (cellProfile.rows || []).map((row) => ({
            rowId: row.rowId,
            placements: Object.fromEntries(["left", "right"].map((side) => [
                side,
                (row?.placements?.[side] || []).map((cell) => normalizeProfileCell(cell, sideLayout, side))
            ])),
            shellSlots: Object.fromEntries(["left", "right"].map((side) => [
                side,
                (row?.shellSlots?.[side] || []).map((cell) => normalizeProfileCell(cell, sideLayout, side))
            ])),
            occupiedRanges: Object.fromEntries(["left", "right"].map((side) => [
                side,
                (row?.occupiedRanges?.[side] || []).map((cell) => normalizeProfileCell(cell, sideLayout, side))
            ])),
            reservedRanges: Object.fromEntries(["left", "right"].map((side) => [
                side,
                (row?.reservedRanges?.[side] || []).map((cell) => normalizeProfileCell(cell, sideLayout, side))
            ]))
        }))
    };
}

function buildOutputContract({
    request,
    targetVariable,
    theoryRows,
    semanticRaster,
    shellBlueprints,
    projectionBlocks,
    writtenRows
}) {
    const sideLayout = resolveSideLayout(writtenRows);
    const normalizedShellBlueprints = normalizeShellBlueprints(shellBlueprints, sideLayout);
    const normalizedProjectionBlocks = normalizeProjectionBlocks(projectionBlocks, normalizedShellBlueprints);
    const projectionRows = normalizeProjectionRows(writtenRows, sideLayout, normalizedProjectionBlocks);

    return {
        contractVersion: P4_OUTPUT_CONTRACT_VERSION,
        equation: request?.equation || null,
        targetVariable: targetVariable || request?.requestedTargetVariable || null,
        theoryRows: cloneRuntimeValue(theoryRows || []),
        semanticRaster: {
            contractVersion: semanticRaster?.contractVersion || null,
            constants: cloneRuntimeValue(semanticRaster?.constants || {}),
            tracks: {
                left: normalizeTrackLayout(semanticRaster?.tracks?.left || [], sideLayout, "left"),
                right: normalizeTrackLayout(semanticRaster?.tracks?.right || [], sideLayout, "right")
            },
            cellProfile: normalizeGlobalCellProfile(semanticRaster?.cellProfile, sideLayout),
            anchorCol: sideLayout.anchorCol
        },
        shellBlueprints: normalizedShellBlueprints,
        projectionBlocks: normalizedProjectionBlocks,
        projectionRows,
        atomRegister: buildAtomRegister(theoryRows),
        traceIndex: buildTraceIndex(semanticRaster, projectionRows),
        layoutPlan: {
            anchorCol: sideLayout.anchorCol,
            leftShift: sideLayout.leftShift,
            rightShift: sideLayout.rightShift,
            leftBounds: cloneRuntimeValue(sideLayout.leftBounds),
            rightBounds: cloneRuntimeValue(sideLayout.rightBounds),
            leftBands: {
                allBoundsRaw: cloneRuntimeValue(sideLayout.leftBands?.allBoundsRaw || null),
                contentBoundsRaw: cloneRuntimeValue(sideLayout.leftBands?.contentBoundsRaw || null),
                hullBoundsRaw: cloneRuntimeValue(sideLayout.leftBands?.hullBoundsRaw || null),
                reservationBoundsRaw: cloneRuntimeValue(sideLayout.leftBands?.reservationBoundsRaw || null),
                allBounds: normalizeBounds(sideLayout.leftBands?.allBoundsRaw, sideLayout.leftShift),
                contentBounds: normalizeBounds(sideLayout.leftBands?.contentBoundsRaw, sideLayout.leftShift),
                hullBounds: normalizeBounds(sideLayout.leftBands?.hullBoundsRaw, sideLayout.leftShift),
                reservationBounds: normalizeBounds(sideLayout.leftBands?.reservationBoundsRaw, sideLayout.leftShift)
            },
            rightBands: {
                allBoundsRaw: cloneRuntimeValue(sideLayout.rightBands?.allBoundsRaw || null),
                contentBoundsRaw: cloneRuntimeValue(sideLayout.rightBands?.contentBoundsRaw || null),
                hullBoundsRaw: cloneRuntimeValue(sideLayout.rightBands?.hullBoundsRaw || null),
                reservationBoundsRaw: cloneRuntimeValue(sideLayout.rightBands?.reservationBoundsRaw || null),
                allBounds: normalizeBounds(sideLayout.rightBands?.allBoundsRaw, sideLayout.rightShift),
                contentBounds: normalizeBounds(sideLayout.rightBands?.contentBoundsRaw, sideLayout.rightShift),
                hullBounds: normalizeBounds(sideLayout.rightBands?.hullBoundsRaw, sideLayout.rightShift),
                reservationBounds: normalizeBounds(sideLayout.rightBands?.reservationBoundsRaw, sideLayout.rightShift)
            }
        }
    };
}

export {
    P4_OUTPUT_CONTRACT_VERSION,
    buildOutputContract
};
