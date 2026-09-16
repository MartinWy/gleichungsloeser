import {
    PROJECTION_STATE_CONTRACT_VERSION,
    buildProjectionStateManifest
} from "../../../contracts/projection_state/index.js";
import {
    RENDER_SCENE_CONTRACT_VERSION,
    buildRenderSceneManifest
} from "../../../contracts/render_scene/index.js";

const SHELL_FRAGMENT_ROLES = new Set([
    "function",
    "function_name",
    "function_left",
    "function_right",
    "root",
    "root_hook",
    "root_overbar",
    "power",
    "power_exponent",
    "inverse_shell",
    "inverse_operator",
    "fraction_line"
]);

function normalizeTextValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function mapSceneNodeType(atom = {}) {
    const projectionRole = String(atom?.projectionRole || "").trim();
    const shellType = String(atom?.shellType || atom?.type || "").trim().toUpperCase();

    if (projectionRole === "anchor" || shellType === "ANCHOR") {
        return "anchor";
    }

    if (projectionRole === "fraction_line") {
        return "fraction_line";
    }

    if (shellType === "ROOT") {
        return "root";
    }

    if (shellType === "POWER") {
        return "power";
    }

    if (shellType === "FUNCTION") {
        return "function";
    }

    if (shellType === "DIVISION") {
        return "division";
    }

    if (shellType === "GROUP" || shellType === "SUBTRACTION" || shellType === "ADDITION" || shellType === "NEGATION" || shellType === "MULTIPLICATION") {
        return "group";
    }

    return "atom";
}

function isShellLikeNode(atom = {}) {
    const projectionRole = String(atom?.projectionRole || "").trim();
    const shellType = String(atom?.shellType || "").trim();

    return Boolean(shellType) || SHELL_FRAGMENT_ROLES.has(projectionRole);
}

function buildSceneNodeFromProjectionAtom(atom = {}, row = {}, rowIndex = 0) {
    const localRow = atom.localRow ?? row.axisLocalRow ?? 0;
    const rowRoles = Array.isArray(row?.rowRoles) ? row.rowRoles : (Array.isArray(row?.rowKinds) ? row.rowKinds : []);
    const absoluteRow = Number.isInteger(atom.absoluteRow)
        ? atom.absoluteRow
        : Number.isInteger(row.absoluteRowStart)
            ? row.absoluteRowStart + localRow
            : row.axisAbsoluteRow ?? null;
    const stackedRow = Number.isInteger(atom.stackedRow)
        ? atom.stackedRow
        : Number.isInteger(row.stackRowStart)
            ? row.stackRowStart + localRow
            : row.axisStackedRow ?? null;

    return {
        id: atom.id,
        type: mapSceneNodeType(atom),
        text: normalizeTextValue(atom.value),
        isVisible: atom.isVisible !== false,
        isTarget: atom.isTarget === true,
        sourceAtomId: atom.sourceAtomId || null,
        sourceShellId: atom.sourceShellId || null,
        projectionRole: atom.projectionRole || null,
        shellType: atom.shellType || null,
        functionName: atom.functionName || null,
        visualMode: atom.visualMode || null,
        position: {
            rowIndex,
            localRow,
            rowRole: atom.rowRole || rowRoles[localRow] || null,
            absoluteRow,
            stackedRow,
            col: atom.col ?? null,
            colStart: atom.colStart ?? atom.col ?? null,
            colEnd: atom.colEnd ?? atom.col ?? null
        }
    };
}

function buildSceneBounds(nodes = []) {
    const rowValues = [];
    const colValues = [];

    nodes.forEach((node) => {
        const { absoluteRow, colStart, colEnd } = node.position || {};

        if (Number.isInteger(absoluteRow)) {
            rowValues.push(absoluteRow);
        }

        if (Number.isInteger(colStart)) {
            colValues.push(colStart);
        }

        if (Number.isInteger(colEnd)) {
            colValues.push(colEnd);
        }
    });

    return {
        minAbsoluteRow: rowValues.length > 0 ? Math.min(...rowValues) : null,
        maxAbsoluteRow: rowValues.length > 0 ? Math.max(...rowValues) : null,
        minColumn: colValues.length > 0 ? Math.min(...colValues) : null,
        maxColumn: colValues.length > 0 ? Math.max(...colValues) : null
    };
}

function buildFocusIds(nodes = []) {
    return nodes
        .filter((node) => node.isTarget === true)
        .map((node) => node.id);
}

export function buildRenderSceneFromProjectionRow(
    projectionRow = {},
    layoutPlan = {},
    options = {}
) {
    const rowIndex = Number.isInteger(options.rowIndex) ? options.rowIndex : 0;
    const sourceProject = options.sourceProject || "6_Gleichungsloeser";
    const sourceCommit = options.sourceCommit || "HEAD";
    const targetVariable = options.targetVariable || "";
    const notes = options.notes || "";
    const positionedAtoms = Array.isArray(projectionRow?.positionedAtoms) ? projectionRow.positionedAtoms : [];
    const nodes = positionedAtoms.map((atom) => buildSceneNodeFromProjectionAtom(atom, projectionRow, rowIndex));
    const shells = nodes.filter((node, index) => isShellLikeNode(positionedAtoms[index]));

    return {
        sceneId: projectionRow?.rowId || `projection-${rowIndex}`,
        sourceProject,
        sourceCommit,
        coordinateSpace: "p4_projection_or_transition_local",
        atoms: nodes,
        shells,
        focusIds: buildFocusIds(nodes, targetVariable),
        notes,
        sceneKind: "projection_row",
        rowMeta: {
            rowIndex,
            sourceRowId: projectionRow?.sourceRowId || null,
            absoluteRowStart: projectionRow?.absoluteRowStart ?? null,
            absoluteRowEnd: projectionRow?.absoluteRowEnd ?? null,
            axisAbsoluteRow: projectionRow?.axisAbsoluteRow ?? null,
            axisLocalRow: projectionRow?.axisLocalRow ?? null,
            localRowCount: projectionRow?.localRowCount ?? null,
            rowRoles: Array.isArray(projectionRow?.rowRoles)
                ? [...projectionRow.rowRoles]
                : (Array.isArray(projectionRow?.rowKinds) ? [...projectionRow.rowKinds] : []),
            rowKinds: Array.isArray(projectionRow?.rowKinds)
                ? [...projectionRow.rowKinds]
                : (Array.isArray(projectionRow?.rowRoles) ? [...projectionRow.rowRoles] : []),
            stackRowStart: projectionRow?.stackRowStart ?? null,
            stackRowEnd: projectionRow?.stackRowEnd ?? null,
            axisStackedRow: projectionRow?.axisStackedRow ?? null,
            shellSpans: Array.isArray(projectionRow?.shellSpans)
                ? projectionRow.shellSpans.map((shellSpan) => ({ ...shellSpan }))
                : []
        },
        layout: {
            anchorColumn: layoutPlan?.anchorColumn ?? null,
            columnCount: layoutPlan?.columnCount ?? null,
            rowCount: layoutPlan?.rowCount ?? null,
            visualRowCount: layoutPlan?.visualRowCount ?? null,
            stackedVisualRowCount: layoutPlan?.stackedVisualRowCount ?? null
        },
        bounds: buildSceneBounds(nodes)
    };
}

export function buildRenderScenesFromProjectionState(projectionState = {}, options = {}) {
    const projectionRows = Array.isArray(projectionState?.projectionRows) ? projectionState.projectionRows : [];
    const layoutPlan = projectionState?.layoutPlan || {};

    return projectionRows.map((projectionRow, rowIndex) => (
        buildRenderSceneFromProjectionRow(projectionRow, layoutPlan, {
            ...options,
            rowIndex
        })
    ));
}

export function buildRenderScenesFromSolveState(solveState = {}, options = {}) {
    const projectionState = solveState?.exportData || {};

    return buildRenderScenesFromProjectionState(projectionState, {
        sourceProject: "6_Gleichungsloeser",
        sourceCommit: options.sourceCommit || "HEAD",
        targetVariable: options.targetVariable || solveState?.targetVariable || projectionState?.targetVariable || "",
        notes: options.notes || ""
    });
}

export function buildCoreARenderSceneAdapterManifest() {
    return {
        projectionStateVersion: PROJECTION_STATE_CONTRACT_VERSION,
        renderSceneContractVersion: RENDER_SCENE_CONTRACT_VERSION,
        projectionState: buildProjectionStateManifest(),
        renderScene: buildRenderSceneManifest(),
        adapterType: "projection_state_to_render_scene",
        sceneGranularity: "one_scene_per_projection_row",
        invariants: [
            "Der Adapter liest nur vorhandene Kernprojektion.",
            "Der Adapter erzeugt keine neue Solverlogik.",
            "Der Adapter berechnet keine neuen Spalten.",
            "Der Adapter gibt pro Projektionszeile genau eine Szene aus."
        ]
    };
}
