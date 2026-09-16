import {
    BRIDGE_STATE_CONTRACT_VERSION,
    buildBridgeStateContractManifest
} from "../../../contracts/bridge_state/index.js";
import {
    SOLVE_STATE_CONTRACT_VERSION,
    SOLVE_STATE_REQUIRED_FIELDS,
    buildSolveStateManifest
} from "../../../contracts/solve_state/index.js";
import { serializeRuntimeCollection } from "../../../core/GenesisRuntime/runtimeInlineFormat.js";

function assertRequiredSolveStateFields(solveState = {}) {
    SOLVE_STATE_REQUIRED_FIELDS.forEach((field) => {
        if (!(field in solveState)) {
            throw new Error(`solve_state.${field} fehlt.`);
        }
    });
}

function isVisibleNode(node = null) {
    return Boolean(node) && node.isVisible !== false;
}

function filterVisibleNodes(nodes = []) {
    return (Array.isArray(nodes) ? nodes : []).filter((node) => isVisibleNode(node));
}

function serializeCollection(nodes = []) {
    return serializeRuntimeCollection(filterVisibleNodes(nodes));
}

function nodeContainsTarget(node = null, targetSymbol = "") {
    if (!node || typeof node !== "object") {
        return false;
    }

    if (node.type === "VARIABLE" && String(node.value || "") === targetSymbol) {
        return true;
    }

    const collectionKeys = [
        "content",
        "exponentNodes",
        "numerator",
        "denominator",
        "baseContent",
        "degreeNodes",
        "factors",
        "operators",
        "terms",
        "minuend",
        "subtrahend",
        "factor",
        "passive"
    ];

    return collectionKeys.some((key) => {
        const value = node[key];

        if (Array.isArray(value)) {
            return value.some((entry) => nodeContainsTarget(entry, targetSymbol));
        }

        return value && typeof value === "object"
            ? nodeContainsTarget(value, targetSymbol)
            : false;
    });
}

function collectFootprintIds(node = null, bucket = new Set()) {
    if (!node || typeof node !== "object" || node.isVisible === false) {
        return bucket;
    }

    if (node.id) {
        bucket.add(node.id);
    }

    [
        "content",
        "exponentNodes",
        "numerator",
        "denominator",
        "baseContent",
        "degreeNodes",
        "factors",
        "operators",
        "terms",
        "minuend",
        "subtrahend"
    ].forEach((key) => {
        const value = node[key];

        if (Array.isArray(value)) {
            value.forEach((entry) => collectFootprintIds(entry, bucket));
        } else if (value && typeof value === "object") {
            collectFootprintIds(value, bucket);
        }
    });

    return bucket;
}

function collectTargetAtomIds(node = null, targetSymbol = "", bucket = new Set()) {
    if (!node || typeof node !== "object" || node.isVisible === false) {
        return bucket;
    }

    if (node.type === "VARIABLE" && String(node.value || "") === targetSymbol && node.id) {
        bucket.add(node.id);
    }

    [
        "content",
        "exponentNodes",
        "numerator",
        "denominator",
        "baseContent",
        "degreeNodes",
        "factors",
        "operators",
        "terms",
        "minuend",
        "subtrahend"
    ].forEach((key) => {
        const value = node[key];

        if (Array.isArray(value)) {
            value.forEach((entry) => collectTargetAtomIds(entry, targetSymbol, bucket));
        } else if (value && typeof value === "object") {
            collectTargetAtomIds(value, targetSymbol, bucket);
        }
    });

    return bucket;
}

function buildOrderedCellsFromProjection(exponentNodes = [], projectionRow = {}, targetSymbol = "") {
    const footprintIds = new Set();
    const targetAtomIds = new Set();

    filterVisibleNodes(exponentNodes).forEach((node) => {
        collectFootprintIds(node, footprintIds);
        collectTargetAtomIds(node, targetSymbol, targetAtomIds);
    });

    return (Array.isArray(projectionRow?.positionedAtoms) ? projectionRow.positionedAtoms : [])
        .filter((cell) => {
            const text = cell?.text ?? cell?.value;
            const belongsToExponent = footprintIds.has(cell?.sourceAtomId)
                || footprintIds.has(cell?.sourceShellId);

            return belongsToExponent
                && cell?.isVisible !== false
                && text != null
                && String(text).trim() !== ""
                && Number.isInteger(cell?.col);
        })
        .slice()
        .sort((left, right) => (
            (left.colStart ?? left.col) - (right.colStart ?? right.col)
            || (left.localRow ?? 0) - (right.localRow ?? 0)
            || String(left.id || "").localeCompare(String(right.id || ""))
        ))
        .map((cell) => ({
            id: cell.id || null,
            source_atom_id: cell.sourceAtomId || null,
            source_shell_id: cell.sourceShellId || null,
            text: String(cell.text ?? cell.value),
            role: targetAtomIds.has(cell.sourceAtomId) ? "target" : "content",
            projection_role: cell.projectionRole || null,
            boundary_local_row: cell.localRow,
            boundary_col: cell.col
        }));
}

function findPowerExponentStepIndex(solveState = {}) {
    const steps = Array.isArray(solveState?.schritte) ? solveState.schritte : [];
    const matches = [];

    steps.forEach((step, index) => {
        const family = step?.strategie?.family || step?.family || null;

        if (family === "power_exponent_release") {
            matches.push(index);
        }
    });

    if (matches.length === 0) {
        throw new Error("solve_state enthaelt keinen power_exponent_release und hat damit keine Bridge-Grenze.");
    }

    if (matches.length > 1) {
        throw new Error("solve_state enthaelt mehrere power_exponent_release-Schritte. Bridge A1 erwartet genau eine Grenzstelle.");
    }

    return matches[0];
}

function resolveBoundaryTheoryRow(solveState = {}, powerStepIndex = 0) {
    const theoryRows = Array.isArray(solveState?.exportData?.theoryRows) ? solveState.exportData.theoryRows : [];
    const boundaryRow = theoryRows[powerStepIndex];

    if (!boundaryRow) {
        throw new Error("Die Grenzzeile vor power_exponent_release fehlt im solve_state.");
    }

    return boundaryRow;
}

function resolveBoundaryProjectionRow(solveState = {}, boundaryRow = {}) {
    const projectionRows = Array.isArray(solveState?.exportData?.projectionRows) ? solveState.exportData.projectionRows : [];
    const projectionRow = projectionRows.find((row) => row?.sourceRowId === boundaryRow?.rowId);

    if (!projectionRow) {
        throw new Error(`Die Projektionszeile fuer die Grenzzeile ${boundaryRow?.rowId || "?"} fehlt.`);
    }

    return projectionRow;
}

function resolveVisibleSide(nodes = []) {
    return filterVisibleNodes(nodes);
}

function resolveVisiblePowerShell(boundaryRow = {}) {
    const leftVisible = resolveVisibleSide(boundaryRow.left);
    const rightVisible = resolveVisibleSide(boundaryRow.right);
    const leftPower = leftVisible.find((node) => node?.type === "POWER");
    const rightPower = rightVisible.find((node) => node?.type === "POWER");

    if (leftPower && rightPower) {
        throw new Error("Die Grenzzeile enthaelt sichtbare Potenzschalen auf beiden Seiten. Bridge A1 erwartet genau eine relevante Exponentenschale.");
    }

    if (leftPower) {
        return {
            variant: "right",
            powerSide: "left",
            carrySide: "right",
            powerShell: leftPower,
            carryNodes: rightVisible,
            leftVisible,
            rightVisible
        };
    }

    if (rightPower) {
        return {
            variant: "left",
            powerSide: "right",
            carrySide: "left",
            powerShell: rightPower,
            carryNodes: leftVisible,
            leftVisible,
            rightVisible
        };
    }

    throw new Error("Die Grenzzeile enthaelt keine sichtbare Potenzschale fuer den Bridge-Uebergang.");
}

function resolveAnchorColumn(projectionRow = {}, solveState = {}) {
    const anchorPlacement = (Array.isArray(projectionRow?.positionedAtoms) ? projectionRow.positionedAtoms : [])
        .find((atom) => atom?.projectionRole === "anchor" && Number.isInteger(atom?.col));

    if (Number.isInteger(anchorPlacement?.col)) {
        return anchorPlacement.col;
    }

    if (Number.isInteger(solveState?.exportData?.layoutPlan?.anchorColumn)) {
        return solveState.exportData.layoutPlan.anchorColumn;
    }

    throw new Error("Die Grenzzeile liefert keine verifizierbare Gleichheitsposition.");
}

function buildCarryGroupId(carryNodes = [], boundaryRow = {}, carrySide = "") {
    if (carryNodes.length === 1 && carryNodes[0]?.id) {
        return carryNodes[0].id;
    }

    return `bridge-carry-${boundaryRow?.rowId || "row"}-${carrySide || "side"}`;
}

function buildPowerContentId(powerShell = {}) {
    return `bridge-power-content-${powerShell?.id || "shell"}`;
}

function buildBridgeOperatorTargetId(powerShell = {}) {
    return `bridge-log-base-${powerShell?.id || "shell"}`;
}

function buildBridgeContentTargetId(powerShell = {}) {
    return `bridge-flat-content-${powerShell?.id || "shell"}`;
}

export function buildBridgeBoundaryStateFromSolveState(solveState = {}) {
    assertRequiredSolveStateFields(solveState);

    const powerStepIndex = findPowerExponentStepIndex(solveState);
    const boundaryRow = resolveBoundaryTheoryRow(solveState, powerStepIndex);
    const projectionRow = resolveBoundaryProjectionRow(solveState, boundaryRow);
    const {
        variant,
        powerSide,
        carrySide,
        powerShell,
        carryNodes,
        leftVisible,
        rightVisible
    } = resolveVisiblePowerShell(boundaryRow);
    const targetSymbol = String(solveState?.targetVariable || "").trim();
    const baseNodes = filterVisibleNodes(powerShell?.content || []);
    const exponentNodes = filterVisibleNodes(powerShell?.exponentNodes || []);
    const baseText = serializeCollection(baseNodes);
    const exponentText = serializeCollection(exponentNodes);
    const carryText = serializeCollection(carryNodes);
    const leftText = serializeCollection(leftVisible);
    const rightText = serializeCollection(rightVisible);

    if (!targetSymbol) {
        throw new Error("solve_state.targetVariable fehlt fuer den Bridge-Export.");
    }

    if (!baseText) {
        throw new Error("Die Potenzbasis der Grenzzeile ist leer.");
    }

    if (!exponentText) {
        throw new Error("Der Potenzinhalt der Grenzzeile ist leer.");
    }

    if (!carryText) {
        throw new Error("Der durchgereichte Gegenausdruck der Grenzzeile ist leer.");
    }

    if (!exponentNodes.some((node) => nodeContainsTarget(node, targetSymbol))) {
        throw new Error(`Die Exponentenschale der Grenzzeile enthaelt die Zielgroesse "${targetSymbol}" nicht.`);
    }

    const baseId = baseNodes.length === 1 && baseNodes[0]?.id
        ? baseNodes[0].id
        : `bridge-power-base-${powerShell?.id || "shell"}`;

    return {
        equation_text: `${leftText} = ${rightText}`,
        variant,
        target_symbol: targetSymbol,
        anchors: {
            equals: {
                x: resolveAnchorColumn(projectionRow, solveState)
            }
        },
        power_shell: {
            shell_id: powerShell.id || null,
            side: powerSide,
            base: {
                id: baseId,
                text: baseText,
                role: "operator_source"
            },
            content: {
                id: buildPowerContentId(powerShell),
                text: exponentText,
                contains_target: true,
                functional_track_count: 1,
                ordered_cells: buildOrderedCellsFromProjection(exponentNodes, projectionRow, targetSymbol)
            }
        },
        carry_through: {
            side: carrySide,
            text: carryText,
            group_id: buildCarryGroupId(carryNodes, boundaryRow, carrySide)
        },
        identity_map: {
            operator_story: [
                baseId,
                buildBridgeOperatorTargetId(powerShell)
            ],
            content_story: [
                buildPowerContentId(powerShell),
                buildBridgeContentTargetId(powerShell)
            ]
        },
        source_trace: {
            boundary_row_id: boundaryRow?.rowId || null,
            projection_row_id: projectionRow?.rowId || null,
            trigger_step_index: powerStepIndex,
            trigger_family: "power_exponent_release",
            boundary_strategy_family: boundaryRow?.strategy?.family || null
        }
    };
}

export function buildCoreABridgeBoundaryAdapterManifest() {
    return {
        solveStateVersion: SOLVE_STATE_CONTRACT_VERSION,
        bridgeStateContractVersion: BRIDGE_STATE_CONTRACT_VERSION,
        solveState: buildSolveStateManifest(),
        bridgeState: buildBridgeStateContractManifest(),
        adapterType: "solve_state_to_boundary_state",
        bridgeBoundaryFamily: "power_exponent_release",
        invariants: [
            "Der Adapter liest nur solve_state und schreibt nichts in den Kern zurueck.",
            "Der Adapter exportiert genau die Zeile direkt vor power_exponent_release.",
            "Der Adapter traegt nur reale Anker und reale Schalen aus dem Kernvertrag weiter.",
            "Der komplexe Exponent bleibt im boundary_state genau eine geschlossene funktionale Spur.",
            "Der Adapter berechnet keine neue Folgegeometrie von A2."
        ]
    };
}
