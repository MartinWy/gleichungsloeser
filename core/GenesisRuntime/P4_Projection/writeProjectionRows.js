const P4_WRITTEN_PROJECTION_ROWS_VERSION = "p4_written_projection_rows_v1";

function createProjectionAtomId(rowId, kind, role, sourceId, index = 0) {
    return `${rowId}::${kind}::${role}::${sourceId}::${index}`;
}

function buildContentKey(side, nodeId) {
    return `${side}::${nodeId}`;
}

function buildSlotKey(rowId, shellId, slotName) {
    return `${rowId}::${shellId}::${slotName}`;
}

function emitContentAtoms(
    rowId,
    rowRaster,
    rowBlock,
    localizedContentCols = null,
    localizedContentSpans = null,
    targetVariable = null
) {
    const projectionAtoms = [];

    ["left", "right"].forEach((side) => {
        (rowRaster?.placements?.[side] || []).forEach((placement, index) => {
            const role = placement.role || "content";
            const contentKey = buildContentKey(side, placement.nodeId);
            const localRow = rowBlock?.contentLocalRows?.[contentKey];
            const localizedKey = `${rowId}::${side}::${placement.nodeId}`;
            const localizedRawCol = localizedContentCols instanceof Map
                ? localizedContentCols.get(localizedKey)
                : null;
            const localizedSpan = localizedContentSpans instanceof Map
                ? localizedContentSpans.get(localizedKey)
                : null;

            if (!Number.isInteger(localRow)) {
                throw new Error(`[GenesisRuntime:P4] Fuer ${rowId}::${contentKey} fehlt die funktionale Teilzeile.`);
            }
            if (!Number.isFinite(localizedRawCol)) {
                throw new Error(`[GenesisRuntime:P4] Fuer ${localizedKey} fehlt die lokalisierte Inhaltsspalte.`);
            }
            if (
                !localizedSpan
                || !Number.isFinite(localizedSpan.rawColStart)
                || !Number.isFinite(localizedSpan.rawColEnd)
            ) {
                throw new Error(`[GenesisRuntime:P4] Fuer ${localizedKey} fehlt die lokalisierte Zellspanne.`);
            }

            const resolvedRawCol = localizedRawCol;

            projectionAtoms.push({
                projectionAtomId: createProjectionAtomId(rowId, "content", role, placement.nodeId, index),
                rowId,
                side,
                kind: "content",
                role,
                displayForm: "atomic",
                sourceNodeId: placement.nodeId,
                sourceNodeType: placement.nodeType,
                semanticKey: placement.semanticKey,
                value: placement.value,
                isImplicit: placement.isImplicit === true,
                isTarget: placement.nodeType === "VARIABLE" && placement.value === targetVariable,
                collectionRole: placement.collectionRole || null,
                regionRole: placement.regionRole || null,
                shellPath: Array.isArray(placement.shellPath) ? [...placement.shellPath] : [],
                parentShellId: placement.parentShellId || null,
                parentShellType: placement.parentShellType || null,
                rawCol: resolvedRawCol,
                rawColStart: localizedSpan.rawColStart,
                rawColEnd: localizedSpan.rawColEnd,
                localRow
            });
        });
    });

    return projectionAtoms;
}

function emitShellAtoms(rowId, rowBlueprints, rowBlock) {
    const projectionAtoms = [];

    rowBlueprints.forEach((blueprint, blueprintIndex) => {
        (blueprint?.slotLayout || []).forEach((slot, slotIndex) => {
            const slotKey = buildSlotKey(rowId, blueprint.shellId, slot.slotName);
            const localRow = rowBlock?.slotLocalRows?.[slotKey];
            const localRowSpan = rowBlock?.slotLocalRowSpans?.[slotKey] || null;
            const sourceId = `${blueprint.shellId}:${slot.slotName}`;

            if (!Number.isInteger(localRow)) {
                throw new Error(`[GenesisRuntime:P4] Fuer Shell-Slot ${slotKey} fehlt die funktionale Teilzeile.`);
            }

            projectionAtoms.push({
                projectionAtomId: createProjectionAtomId(
                    rowId,
                    "shell",
                    slot.role,
                    sourceId,
                    blueprintIndex + slotIndex
                ),
                rowId,
                side: blueprint.side,
                kind: "shell_slot",
                role: slot.role,
                displayForm: "atomic",
                slotName: slot.slotName,
                shellType: blueprint.shellType,
                shellId: blueprint.shellId,
                rowShellKey: blueprint.rowShellKey,
                sourceNodeId: blueprint.shellId,
                sourceNodeType: blueprint.shellType,
                value: slot.value ?? null,
                isVisible: slot.isVisible !== false,
                isTarget: false,
                rawCol: Number.isFinite(slot.rawCol) ? slot.rawCol : null,
                rawColStart: Number.isFinite(slot.rawColStart)
                    ? slot.rawColStart
                    : slot.rawCol,
                rawColEnd: Number.isFinite(slot.rawColEnd)
                    ? slot.rawColEnd
                    : slot.rawCol,
                localRow,
                rowSpanStart: Number.isInteger(localRowSpan?.rowSpanStart)
                    ? localRowSpan.rowSpanStart
                    : localRow,
                rowSpanEnd: Number.isInteger(localRowSpan?.rowSpanEnd)
                    ? localRowSpan.rowSpanEnd
                    : localRow
            });
        });
    });

    return projectionAtoms;
}

function emitAnchorAtom(row, rowBlock) {
    if (!row?.anchor) {
        return [];
    }

    if (!Number.isInteger(rowBlock?.axisLocalRow)) {
        throw new Error(`[GenesisRuntime:P4] Fuer den Anker der Zeile ${row.rowId} fehlt die Achsenzeile.`);
    }

    return [{
        projectionAtomId: createProjectionAtomId(row.rowId, "anchor", "equation_anchor", row.anchor.id || "anchor", 0),
        rowId: row.rowId,
        side: "anchor",
        kind: "anchor",
        role: "equation_anchor",
        displayForm: "atomic",
        sourceNodeId: row.anchor.id || null,
        sourceNodeType: row.anchor.type || "ANCHOR",
        semanticKey: row.anchor.id ? `node:${row.anchor.id}` : null,
        value: row.anchor.value || "=",
        isTarget: false,
        rawCol: 0,
        rawColStart: 0,
        rawColEnd: 0,
        localRow: rowBlock.axisLocalRow
    }];
}

function sortProjectionAtoms(projectionAtoms = []) {
    return [...projectionAtoms].sort((leftAtom, rightAtom) => {
        if (leftAtom.localRow !== rightAtom.localRow) {
            return leftAtom.localRow - rightAtom.localRow;
        }

        const sideOrder = {
            left: 0,
            anchor: 1,
            right: 2
        };
        if ((sideOrder[leftAtom.side] || 0) !== (sideOrder[rightAtom.side] || 0)) {
            return (sideOrder[leftAtom.side] || 0) - (sideOrder[rightAtom.side] || 0);
        }

        const leftCol = Number.isFinite(leftAtom.rawColStart) ? leftAtom.rawColStart : leftAtom.rawCol;
        const rightCol = Number.isFinite(rightAtom.rawColStart) ? rightAtom.rawColStart : rightAtom.rawCol;
        return (leftCol || 0) - (rightCol || 0);
    });
}

function writeProjectionRows(
    theoryRows = [],
    semanticRaster = null,
    localGeometry = null,
    projectionBlocks = [],
    targetVariable = null
) {
    const shellBlueprints = localGeometry?.localizedShellBlueprints;
    const localizedContentCols = localGeometry?.localizedContentCols;
    const localizedContentSpans = localGeometry?.localizedContentSpans;
    if (
        !Array.isArray(shellBlueprints)
        || !(localizedContentCols instanceof Map)
        || !(localizedContentSpans instanceof Map)
    ) {
        throw new Error("[GenesisRuntime:P4] Der Writer benoetigt die vollstaendige lokale Geometrie.");
    }

    const rasterByRowId = new Map((semanticRaster?.rows || []).map((row) => [row.rowId, row]));
    const blockByRowId = new Map((projectionBlocks || []).map((row) => [row.rowId, row]));
    const blueprintsByRowId = new Map();

    (shellBlueprints || []).forEach((blueprint) => {
        const rowBlueprints = blueprintsByRowId.get(blueprint.rowId) || [];
        rowBlueprints.push(blueprint);
        blueprintsByRowId.set(blueprint.rowId, rowBlueprints);
    });

    return theoryRows.map((row) => {
        const rowRaster = rasterByRowId.get(row.rowId) || null;
        const rowBlock = blockByRowId.get(row.rowId) || null;
        const rowBlueprints = blueprintsByRowId.get(row.rowId) || [];
        if (!rowRaster || !rowBlock) {
            throw new Error(`[GenesisRuntime:P4] Dem Writer fehlen Raster oder Block fuer ${row.rowId}.`);
        }
        const projectionAtoms = sortProjectionAtoms([
            ...emitContentAtoms(
                row.rowId,
                rowRaster,
                rowBlock,
                localizedContentCols,
                localizedContentSpans,
                targetVariable
            ),
            ...emitShellAtoms(row.rowId, rowBlueprints, rowBlock),
            ...emitAnchorAtom(row, rowBlock)
        ]);

        return {
            contractVersion: P4_WRITTEN_PROJECTION_ROWS_VERSION,
            rowId: row.rowId,
            stepIndex: row.stepIndex,
            axisLocalRow: rowBlock?.axisLocalRow ?? 0,
            localRowCount: rowBlock?.localRowCount ?? 1,
            projectionAtoms
        };
    });
}

export {
    P4_WRITTEN_PROJECTION_ROWS_VERSION,
    writeProjectionRows
};
