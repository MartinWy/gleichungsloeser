function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const LEGACY_PROJECTION_ADAPTER_VERSION = "genesis_runtime_legacy_projection_v1";

function buildTheoryRowLookup(theoryRows = []) {
    return new Map((theoryRows || []).map((row) => [row.rowId, row]));
}

function mapProjectionRole(role) {
    switch (role) {
        case "equation_anchor":
            return "anchor";
        case "multiplication_operator":
            return "product_operator";
        case "addition_operator":
        case "subtraction_operator":
            return "inverse_operator";
        case "function_left_paren":
            return "function_left";
        case "function_right_paren":
            return "function_right";
        case "group_left_paren":
            return "group_left";
        case "group_right_paren":
            return "group_right";
        default:
            return role || null;
    }
}

function validateProjectionAtom(atom, rowId) {
    if (
        !atom
        || typeof atom.projectionAtomId !== "string"
        || typeof atom.kind !== "string"
        || typeof atom.role !== "string"
        || !Number.isInteger(atom.localRow)
        || !Number.isFinite(atom.colStart ?? atom.col)
        || !Number.isFinite(atom.colEnd ?? atom.col)
        || atom.displayForm !== "atomic"
    ) {
        throw new Error(`[GenesisRuntime:LegacyProjectionAdapter] Ungueltiges P4-Atom in ${rowId}.`);
    }

    if (atom.kind === "content") {
        const hasParentId = typeof atom.parentShellId === "string";
        const hasParentType = typeof atom.parentShellType === "string";
        if (hasParentId !== hasParentType) {
            throw new Error(
                `[GenesisRuntime:LegacyProjectionAdapter] Unvollstaendige Elternbindung fuer ${atom.projectionAtomId}.`
            );
        }
    }
}

function buildLegacyAtom(atom, rowMeta) {
    validateProjectionAtom(atom, rowMeta.rowId);

    const localRow = atom.localRow;
    const sourceShellId = atom.kind === "shell_slot"
        ? (atom.shellId || atom.sourceNodeId || null)
        : (atom.parentShellId || null);
    const parentType = atom.kind === "shell_slot"
        ? (atom.shellType || atom.sourceNodeType || null)
        : (atom.parentShellType || null);

    const projectionRole = atom.kind === "content" && atom.regionRole
        ? atom.regionRole
        : mapProjectionRole(atom.role);

    return {
        id: atom.projectionAtomId,
        value: atom.value,
        type: atom.sourceNodeType || atom.shellType || null,
        isVisible: atom.isVisible !== false,
        isTarget: atom.isTarget === true,
        isImplicit: atom.isImplicit === true,
        displayForm: atom.displayForm,
        row: rowMeta.stackedRowStart + localRow,
        absoluteRow: rowMeta.stackedRowStart + localRow,
        stackedRow: rowMeta.stackedRowStart + localRow,
        localRow,
        rowSpanStart: Number.isInteger(atom.rowSpanStart) ? atom.rowSpanStart : localRow,
        rowSpanEnd: Number.isInteger(atom.rowSpanEnd) ? atom.rowSpanEnd : localRow,
        col: atom.col ?? null,
        colStart: atom.colStart ?? atom.col,
        colEnd: atom.colEnd ?? atom.col,
        rowRole: atom.rowRole || rowMeta.rowRoles[localRow] || null,
        projectionRole,
        p4Role: atom.role,
        regionRole: atom.regionRole || null,
        sourceAtomId: atom.sourceNodeId || null,
        sourceShellId,
        parentType,
        shellType: atom.shellType || parentType,
        position: atom.collectionRole || null,
        collectionRole: atom.collectionRole || null,
        shellPath: Array.isArray(atom.shellPath) ? clone(atom.shellPath) : [],
        visualMode: "ATOMIC"
    };
}

function sortLegacyPositionedAtoms(positionedAtoms = []) {
    return [...positionedAtoms].sort((leftAtom, rightAtom) => {
        if (leftAtom.row !== rightAtom.row) {
            return leftAtom.row - rightAtom.row;
        }

        if (leftAtom.colStart !== rightAtom.colStart) {
            return leftAtom.colStart - rightAtom.colStart;
        }

        return String(leftAtom.id).localeCompare(String(rightAtom.id));
    });
}

function buildLayoutRows(projectionRows = []) {
    const rows = [];
    let nextStackRowStart = 0;

    (projectionRows || []).forEach((row) => {
        if (!Number.isInteger(row?.localRowCount) || !Number.isInteger(row?.axisLocalRow)) {
            throw new Error(
                `[GenesisRuntime:LegacyProjectionAdapter] Der Projektionszeile ${row?.rowId || "UNKNOWN"} fehlen Blockreihen.`
            );
        }

        const stackRowStart = nextStackRowStart;
        const stackRowEnd = stackRowStart + row.localRowCount - 1;
        const axisAbsoluteRow = stackRowStart + row.axisLocalRow;

        rows.push({
            rowId: row.rowId,
            stackedRowStart: stackRowStart,
            stackedRowEnd: stackRowEnd,
            absoluteRowStart: stackRowStart,
            absoluteRowEnd: stackRowEnd,
            axisLocalRow: row.axisLocalRow,
            axisAbsoluteRow,
            axisStackedRow: axisAbsoluteRow,
            rowRoles: clone(row.rowRoles || []),
            rowKinds: clone(row.rowKinds || row.rowRoles || [])
        });

        nextStackRowStart = stackRowEnd + 1;
    });

    return rows;
}

function resolveProjectionColumnCount(projectionRows = []) {
    const maxCol = (projectionRows || []).reduce((currentMax, row) => {
        return (row.positionedAtoms || []).reduce((rowMax, atom) => {
            const colEnd = Number.isFinite(atom.colEnd) ? atom.colEnd : (atom.col ?? -1);
            return Math.max(rowMax, colEnd);
        }, currentMax);
    }, -1);

    return Math.max(0, maxCol + 1);
}

function buildLegacyProjectionResultFromOutputContract(outputContract = {}) {
    if (outputContract?.contractVersion !== "p4_output_contract_v1") {
        throw new Error("[GenesisRuntime:LegacyProjectionAdapter] Erwartet wird p4_output_contract_v1.");
    }

    const theoryRows = Array.isArray(outputContract.theoryRows) ? outputContract.theoryRows : [];
    const projectionRows = Array.isArray(outputContract.projectionRows) ? outputContract.projectionRows : [];
    const theoryRowById = buildTheoryRowLookup(theoryRows);
    const layoutRows = buildLayoutRows(projectionRows);
    const legacyProjectionRows = projectionRows.map((row, index) => {
        const rowMeta = layoutRows[index];
        const theoryRow = theoryRowById.get(row.rowId) || null;
        const positionedAtoms = sortLegacyPositionedAtoms(
            (row.projectionAtoms || []).map((atom) => buildLegacyAtom(atom, rowMeta))
        );
        const shellSpans = (row.shellSpans || []).map((shellSpan) => ({
            ...clone(shellSpan),
            absoluteRowTop: rowMeta.stackedRowStart + shellSpan.localTopRow,
            absoluteRowBottom: rowMeta.stackedRowStart + shellSpan.localBottomRow,
            axisAbsoluteRow: rowMeta.stackedRowStart + shellSpan.axisLocalRow,
            stackedRowTop: rowMeta.stackedRowStart + shellSpan.localTopRow,
            stackedRowBottom: rowMeta.stackedRowStart + shellSpan.localBottomRow,
            axisStackedRow: rowMeta.stackedRowStart + shellSpan.axisLocalRow
        }));

        return {
            contractVersion: LEGACY_PROJECTION_ADAPTER_VERSION,
            rowId: `projection-${index}`,
            sourceRowId: row.rowId,
            strategy: clone(theoryRow?.strategy || null),
            absoluteRowStart: rowMeta.absoluteRowStart,
            absoluteRowEnd: rowMeta.absoluteRowEnd,
            axisAbsoluteRow: rowMeta.axisAbsoluteRow,
            axisLocalRow: rowMeta.axisLocalRow,
            localRowCount: row.localRowCount,
            rowRoles: clone(rowMeta.rowRoles),
            rowKinds: clone(rowMeta.rowKinds),
            stackRowStart: rowMeta.stackedRowStart,
            stackRowEnd: rowMeta.stackedRowEnd,
            axisStackedRow: rowMeta.axisStackedRow,
            shellSpans,
            positionedAtoms
        };
    });

    return {
        contractVersion: LEGACY_PROJECTION_ADAPTER_VERSION,
        layoutPlan: {
            mode: "genesis_runtime_legacy_adapter_v1",
            source: "GenesisRuntime",
            rowCount: legacyProjectionRows.length,
            visualRowCount: layoutRows.length === 0
                ? 0
                : layoutRows[layoutRows.length - 1].stackedRowEnd + 1,
            stackedVisualRowCount: layoutRows.length === 0
                ? 0
                : layoutRows[layoutRows.length - 1].stackedRowEnd + 1,
            anchorColumn: outputContract?.semanticRaster?.anchorCol ?? outputContract?.layoutPlan?.anchorCol ?? null,
            columnCount: resolveProjectionColumnCount(legacyProjectionRows),
            rows: clone(layoutRows)
        },
        projectionRows: legacyProjectionRows,
        outputContract: clone(outputContract)
    };
}

export {
    LEGACY_PROJECTION_ADAPTER_VERSION,
    buildLegacyProjectionResultFromOutputContract
};
