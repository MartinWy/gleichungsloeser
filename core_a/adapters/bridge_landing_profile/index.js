import {
    BRIDGE_STATE_CONTRACT_VERSION,
    buildBridgeStateContractManifest
} from "../../../contracts/bridge_state/index.js";
import {
    SOLVE_STATE_CONTRACT_VERSION,
    SOLVE_STATE_REQUIRED_FIELDS,
    buildSolveStateManifest
} from "../../../contracts/solve_state/index.js";
import { buildFunctionHead } from "../../../core/GenesisRuntime/logarithmNotation.js";
import { cloneRuntimeValue } from "../../../core/GenesisRuntime/runtimeClone.js";
import { serializeRuntimeCollection, serializeRuntimeNode } from "../../../core/GenesisRuntime/runtimeInlineFormat.js";
import { splitRuntimeEquationSides } from "../../../core/GenesisRuntime/P2_Strategy/equationSides.js";
import {
    analyzeRuntimeEquationSide,
    resolveRuntimeTargetVariable,
    validateRuntimeTargetOccurrence
} from "../../../core/GenesisRuntime/P2_Strategy/targetSelection.js";
import { findNextRuntimeDecision } from "../../../core/GenesisRuntime/P2_Strategy/findNextDecision.js";
import { applyShellFamilyTransformation } from "../../../core/GenesisRuntime/P3_Transformation/applyShellFamilies.js";
import { buildTheoryRowsFromRuntime } from "../../../core/GenesisRuntime/P4_Projection/buildTheoryRows.js";
import { runProjectionPhaseSync } from "../../../core/GenesisRuntime/P4_Projection/runProjectionPhase.js";
import { buildLegacyProjectionResultFromOutputContract } from "../../../core/GenesisRuntime/LegacyProjectionAdapter.js";

const DEFAULT_A2_PROBE_STEP_LIMIT = 10;
const LOG_FUNCTION_NAMES = new Set(["log", "ln", "lg"]);

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

function serializeNode(node = null) {
    return serializeRuntimeNode(node);
}

function serializeCollection(nodes = []) {
    return serializeRuntimeCollection(filterVisibleNodes(nodes));
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
        throw new Error("solve_state enthaelt keinen power_exponent_release und hat damit kein Bridge-Landing.");
    }

    if (matches.length > 1) {
        throw new Error("solve_state enthaelt mehrere power_exponent_release-Schritte. Bridge A2 erwartet genau eine Landestelle.");
    }

    return matches[0];
}

function resolveLandingTheoryRow(solveState = {}, powerStepIndex = 0) {
    const theoryRows = Array.isArray(solveState?.exportData?.theoryRows) ? solveState.exportData.theoryRows : [];
    const landingRow = theoryRows[powerStepIndex + 1];

    if (!landingRow) {
        throw new Error("Die Landenzeile nach power_exponent_release fehlt im solve_state.");
    }

    return landingRow;
}

function resolveAnchorColumn(projectionRow = {}, solveState = {}) {
    const projectionAtoms = Array.isArray(projectionRow?.projectionAtoms)
        ? projectionRow.projectionAtoms
        : (Array.isArray(projectionRow?.positionedAtoms) ? projectionRow.positionedAtoms : []);
    const anchorPlacement = projectionAtoms.find((atom) => {
        const role = String(atom?.role || atom?.projectionRole || "").trim().toLowerCase();
        return (role === "anchor" || role === "equation_anchor") && Number.isInteger(atom?.col);
    });

    if (Number.isInteger(anchorPlacement?.col)) {
        return anchorPlacement.col;
    }

    if (Number.isInteger(solveState?.exportData?.layoutPlan?.anchorProjectionCol)) {
        return solveState.exportData.layoutPlan.anchorProjectionCol;
    }

    if (Number.isInteger(solveState?.exportData?.layoutPlan?.anchorColumn)) {
        return solveState.exportData.layoutPlan.anchorColumn;
    }

    throw new Error("Die Landenzeile liefert keine verifizierbare Gleichheitsposition.");
}

function collectVisibleSideNodes(sideNodes = []) {
    return filterVisibleNodes(sideNodes);
}

function resolveLandingShape(landingRow = {}) {
    const leftVisible = collectVisibleSideNodes(landingRow.left);
    const rightVisible = collectVisibleSideNodes(landingRow.right);
    const leftFunction = leftVisible.find((node) => (
        node?.type === "FUNCTION" && LOG_FUNCTION_NAMES.has(String(node?.name || ""))
    ));
    const rightFunction = rightVisible.find((node) => (
        node?.type === "FUNCTION" && LOG_FUNCTION_NAMES.has(String(node?.name || ""))
    ));

    if (leftFunction && rightFunction) {
        throw new Error("Die Landenzeile enthaelt sichtbare Logarithmus-Schalen auf beiden Seiten. Bridge A2 erwartet genau eine Zielschale.");
    }

    if (leftFunction) {
        return {
            variant: "left",
            carryThroughSide: "left",
            termSide: "right",
            functionShell: leftFunction,
            carrySideNodes: leftVisible,
            termSideNodes: rightVisible
        };
    }

    if (rightFunction) {
        return {
            variant: "right",
            carryThroughSide: "right",
            termSide: "left",
            functionShell: rightFunction,
            carrySideNodes: rightVisible,
            termSideNodes: leftVisible
        };
    }

    throw new Error("Die Landenzeile enthaelt keine sichtbare Logarithmus-Schale fuer den Bridge-Anschluss.");
}

function buildProjectionLookup(positionedAtoms = []) {
    const bySourceAtomId = new Map();
    const bySourceShellId = new Map();

    (Array.isArray(positionedAtoms) ? positionedAtoms : []).forEach((atom) => {
        const sourceAtomId = atom?.sourceAtomId || null;
        const sourceShellId = atom?.sourceShellId || null;

        if (sourceAtomId) {
            const existing = bySourceAtomId.get(sourceAtomId) || [];
            existing.push(atom);
            bySourceAtomId.set(sourceAtomId, existing);
        }

        if (sourceShellId) {
            const existing = bySourceShellId.get(sourceShellId) || [];
            existing.push(atom);
            bySourceShellId.set(sourceShellId, existing);
        }
    });

    return { bySourceAtomId, bySourceShellId };
}

function collectFunctionZone(functionShell = {}, projectionLookup = {}) {
    const placements = [
        ...((projectionLookup?.bySourceAtomId?.get(functionShell?.id) || [])),
        ...((projectionLookup?.bySourceShellId?.get(functionShell?.id) || []))
    ].filter((atom) => Number.isInteger(atom?.colStart) && Number.isInteger(atom?.colEnd));

    if (placements.length === 0) {
        throw new Error(`Die Logarithmus-Schale ${functionShell?.id || "?"} besitzt keine Projektionsspur.`);
    }

    const starts = placements.map((atom) => atom.colStart);
    const ends = placements.map((atom) => atom.colEnd);
    const x = Math.min(...starts);
    const width = (Math.max(...ends) - x) + 1;

    return { x, width };
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
        "subtrahend",
        "factor",
        "passive"
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

function collectTermCellPlacements(termSideNodes = [], positionedAtoms = []) {
    const footprintIds = new Set();

    (Array.isArray(termSideNodes) ? termSideNodes : [])
        .forEach((node) => collectFootprintIds(node, footprintIds));

    return (Array.isArray(positionedAtoms) ? positionedAtoms : [])
        .filter((cell) => {
            const text = cell?.text ?? cell?.value;
            const belongsToTerm = footprintIds.has(cell?.sourceAtomId)
                || footprintIds.has(cell?.sourceShellId);

            return belongsToTerm
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
        .map((cell, index) => ({
            role: `content_cell_${index + 1}`,
            x: cell.col,
            colStart: Number.isInteger(cell?.colStart) ? cell.colStart : cell.col,
            colEnd: Number.isInteger(cell?.colEnd) ? cell.colEnd : cell.col,
            source_cell_id: cell.id || null,
            source_atom_id: cell.sourceAtomId || null,
            source_shell_id: cell.sourceShellId || null,
            source_text: String(cell.text ?? cell.value),
            source_local_row: cell.localRow
        }));
}

function buildZoneFromSlots(slots = []) {
    if (!Array.isArray(slots) || slots.length === 0) {
        throw new Error("Die Landenzeile liefert keine echten Zielslots fuer den freigelegten Term.");
    }

    const starts = slots.map((slot) => slot.colStart);
    const ends = slots.map((slot) => slot.colEnd);
    const x = Math.min(...starts);
    const width = (Math.max(...ends) - x) + 1;

    return { x, width };
}

function shiftZone(zone = {}, delta = 0) {
    return {
        ...zone,
        x: (zone?.x || 0) + delta
    };
}

function buildCompactLandingTermSlots(slots = [], anchorCol = null, termSide = null) {
    const orderedSlots = (Array.isArray(slots) ? slots : [])
        .slice()
        .sort((left, right) => left.x - right.x);

    if (!Number.isInteger(anchorCol)) {
        throw new Error("Kompakte Bridge-Termslots brauchen einen ganzzahligen Gleichheitsanker.");
    }

    if (!["left", "right"].includes(termSide)) {
        throw new Error("Kompakte Bridge-Termslots brauchen eine eindeutige Termseite.");
    }

    if (orderedSlots.length === 0) {
        throw new Error("Die Landenzeile liefert keine Zieltermspuren fuer kompakte Bridge-Slots.");
    }

    const firstCol = termSide === "right"
        ? anchorCol + 2
        : anchorCol - orderedSlots.length - 1;

    return orderedSlots.map((slot, index) => {
        const col = firstCol + index;

        return {
            ...slot,
            x: col,
            colStart: col,
            colEnd: col
        };
    });
}

function buildPreviewEquation(landingRow = {}) {
    const leftText = serializeCollection(landingRow?.left || []);
    const rightText = serializeCollection(landingRow?.right || []);
    return `${leftText} = ${rightText}`;
}

function runA2ProbeStrategyPhase(structure = [], requestedTargetVariable = null) {
    const targetVariable = resolveRuntimeTargetVariable(structure, requestedTargetVariable);

    if (targetVariable) {
        validateRuntimeTargetOccurrence(structure, targetVariable);
    }

    const equationSideAnalysis = analyzeRuntimeEquationSide(structure, targetVariable);

    if (targetVariable && equationSideAnalysis.state === "both") {
        throw new Error(
            `Die Zielvariable "${targetVariable}" steht im A2-Probelauf auf beiden Gleichungsseiten.`
        );
    }

    const equationSides = splitRuntimeEquationSides(structure);
    const activeSideNodes = equationSideAnalysis.side === "right"
        ? equationSides.right
        : equationSides.left;
    const nextDecision = equationSideAnalysis.side
        ? findNextRuntimeDecision(activeSideNodes, targetVariable)
        : null;

    return {
        targetVariable,
        equationSideAnalysis,
        nextDecision
    };
}

function buildA2ProbeProjection(landingRow = {}, solveState = {}) {
    const initialStructure = cloneRuntimeValue(landingRow?.atoms || []);

    if (!Array.isArray(initialStructure) || initialStructure.length === 0) {
        throw new Error("Die Landenzeile liefert keine probe-faehige Startstruktur fuer A2.");
    }

    const requestedTargetVariable = typeof solveState?.targetVariable === "string"
        ? solveState.targetVariable
        : null;
    let currentStructure = cloneRuntimeValue(initialStructure);
    let strategyPhase = runA2ProbeStrategyPhase(currentStructure, requestedTargetVariable);
    const history = [];
    let appliedDecision = null;

    for (let stepIndex = 0; stepIndex < DEFAULT_A2_PROBE_STEP_LIMIT; stepIndex += 1) {
        if (!strategyPhase?.nextDecision) {
            break;
        }

        const shellFamilyResult = applyShellFamilyTransformation(
            currentStructure,
            strategyPhase.nextDecision,
            strategyPhase.equationSideAnalysis
        );

        if (!shellFamilyResult) {
            throw new Error(
                `[A2-Probe] Die Familie "${strategyPhase?.nextDecision?.family || "?"}" ist nicht projektierbar.`
            );
        }

        currentStructure = cloneRuntimeValue(shellFamilyResult.nextStructure || currentStructure);
        appliedDecision = cloneRuntimeValue(strategyPhase.nextDecision);
        history.push({
            strategy: cloneRuntimeValue(strategyPhase.nextDecision),
            structure: cloneRuntimeValue(currentStructure)
        });

        strategyPhase = runA2ProbeStrategyPhase(
            currentStructure,
            strategyPhase.targetVariable || requestedTargetVariable
        );

        if (!strategyPhase?.nextDecision) {
            break;
        }

        if (stepIndex === DEFAULT_A2_PROBE_STEP_LIMIT - 1) {
            throw new Error(
                `[A2-Probe] Das Schrittlimit von ${DEFAULT_A2_PROBE_STEP_LIMIT} wurde erreicht, bevor die A2-Planung stabil wurde.`
            );
        }
    }

    const projectionPhase = runProjectionPhaseSync({
        request: {
            equation: solveState?.eingabe || "",
            targetVariable: strategyPhase?.targetVariable || requestedTargetVariable || null,
            runtimeEngine: "genesis_runtime"
        },
        inputPhase: {
            structure: cloneRuntimeValue(initialStructure)
        },
        strategyPhase: {
            targetVariable: strategyPhase?.targetVariable || requestedTargetVariable || null
        },
        transformationPhase: {
            phaseId: "P3_Transformation",
            appliedDecision,
            initialStructure: cloneRuntimeValue(initialStructure),
            nextStructure: cloneRuntimeValue(currentStructure),
            history
        }
    });
    const theoryRows = Array.isArray(projectionPhase?.theoryRows) ? projectionPhase.theoryRows : [];
    const nativeOutputContract = projectionPhase?.outputContract || null;
    const projectionResult = buildLegacyProjectionResultFromOutputContract(nativeOutputContract);
    const nativeProjectionRows = Array.isArray(nativeOutputContract?.projectionRows)
        ? structuredClone(nativeOutputContract.projectionRows)
        : [];
    const probeLandingRow = theoryRows[0] || null;
    const probeProjectionRow = projectionResult?.projectionRows?.[0] || null;

    if (!probeLandingRow || !probeProjectionRow) {
        throw new Error("Der A2-Probelauf konnte keine erste Projektionszeile erzeugen.");
    }

    return {
        theoryRows,
        nativeOutputContract,
        nativeProjectionRows,
        projectionRows: projectionResult.projectionRows,
        layoutPlan: projectionResult.layoutPlan,
        landingRow: probeLandingRow,
        projectionRow: probeProjectionRow
    };
}

export function buildBridgeA2ProbeFromSolveState(solveState = {}) {
    assertRequiredSolveStateFields(solveState);

    const powerStepIndex = findPowerExponentStepIndex(solveState);
    const landingRow = resolveLandingTheoryRow(solveState, powerStepIndex);
    const a2Probe = buildA2ProbeProjection(landingRow, solveState);
    const probeAnchorX = resolveAnchorColumn(a2Probe.projectionRow, {
        exportData: {
            layoutPlan: a2Probe.layoutPlan || {}
        }
    });
    const boundaryAnchorX = resolveAnchorColumn({}, solveState);

    return {
        powerStepIndex,
        landingRow,
        probeLandingRow: a2Probe.landingRow,
        projectionRow: a2Probe.projectionRow,
        theoryRows: a2Probe.theoryRows,
        nativeOutputContract: a2Probe.nativeOutputContract,
        nativeProjectionRows: a2Probe.nativeProjectionRows,
        projectionRows: a2Probe.projectionRows,
        layoutPlan: a2Probe.layoutPlan,
        probeAnchorX,
        boundaryAnchorX,
        anchorDelta: boundaryAnchorX - probeAnchorX
    };
}

export function buildBridgeLandingProfileFromSolveState(solveState = {}) {
    assertRequiredSolveStateFields(solveState);

    const a2Probe = buildBridgeA2ProbeFromSolveState(solveState);
    const {
        powerStepIndex,
        landingRow,
        probeAnchorX,
        boundaryAnchorX,
        anchorDelta
    } = a2Probe;
    const probeLandingRow = a2Probe.landingRow;
    const projectionRow = a2Probe.projectionRow;
    const {
        variant,
        carryThroughSide,
        termSide,
        functionShell,
        termSideNodes
    } = resolveLandingShape(probeLandingRow);
    const projectionLookup = buildProjectionLookup(projectionRow?.positionedAtoms || []);
    const termSlotsWithCoverage = collectTermCellPlacements(
        termSideNodes,
        projectionRow?.positionedAtoms || []
    );
    const carryThroughZone = collectFunctionZone(functionShell, projectionLookup);
    const compactTermSlotsWithCoverage = buildCompactLandingTermSlots(
        termSlotsWithCoverage,
        boundaryAnchorX,
        termSide
    );
    const compactTermZone = buildZoneFromSlots(compactTermSlotsWithCoverage);
    const shiftedCarryThroughZone = shiftZone(carryThroughZone, anchorDelta);
    const baseText = serializeCollection(functionShell?.baseContent || []);
    const operatorTargetText = buildFunctionHead(functionShell?.name || "log", baseText);
    const termText = serializeCollection(termSideNodes);

    if (!operatorTargetText) {
        throw new Error("Die Landenzeile liefert keinen verifizierbaren Logarithmuskopf.");
    }

    if (!termText) {
        throw new Error("Die Landenzeile liefert keinen sichtbaren Zielterm.");
    }

    return {
        system_id: "A2",
        variant,
        preview_equation: buildPreviewEquation(probeLandingRow),
        equals_anchor_x: boundaryAnchorX,
        term_side: termSide,
        carry_through_side: carryThroughSide,
        carry_through_zone: shiftedCarryThroughZone,
        term_zone: compactTermZone,
        term_slots: compactTermSlotsWithCoverage.map((slot) => ({
            role: slot.role,
            x: slot.x,
            source_cell_id: slot.source_cell_id,
            source_atom_id: slot.source_atom_id,
            source_shell_id: slot.source_shell_id,
            source_text: slot.source_text,
            source_local_row: slot.source_local_row
        })),
        source_exponent_track_count: 1,
        stories: {
            operator_target: {
                text: operatorTargetText,
                side: carryThroughSide
            },
            content_target: {
                text: termText,
                side: termSide
            }
        },
        no_second_jump: true,
        source_trace: {
            landing_row_id: landingRow?.rowId || null,
            probe_row_id: probeLandingRow?.rowId || null,
            projection_row_id: projectionRow?.rowId || null,
            probe_anchor_x: probeAnchorX,
            boundary_anchor_x: boundaryAnchorX,
            trigger_step_index: powerStepIndex,
            trigger_family: "power_exponent_release",
            derivation_mode: "isolated_a2_probe",
            term_slot_policy: "compact_normal_axis"
        }
    };
}

export function buildCoreABridgeLandingProfileAdapterManifest() {
    return {
        solveStateVersion: SOLVE_STATE_CONTRACT_VERSION,
        bridgeStateContractVersion: BRIDGE_STATE_CONTRACT_VERSION,
        solveState: buildSolveStateManifest(),
        bridgeState: buildBridgeStateContractManifest(),
        adapterType: "solve_state_to_landing_profile",
        bridgeBoundaryFamily: "power_exponent_release",
        invariants: [
            "Der Adapter startet einen isolierten A2-Probelauf ab der realen Landing-Struktur.",
            "Der Adapter erratet keine neue Log-Geometrie ausserhalb des A2-Probelaufs.",
            "Die eine geschlossene Boundary-Exponentenspur wird erst im Landing-Profil atomar aufgefaltet.",
            "term_slots bewahren die echte Spurreihenfolge der ersten A2-Probezeile und landen kompakt auf der normalen Achse.",
            "Alte POWER-Spalten werden nicht in den A2-Termraum uebernommen.",
            "no_second_jump ist eine explizite Anschlussgarantie fuer B."
        ]
    };
}
