import assert from "node:assert/strict";

import * as coreA from "../../core_a/index.js";
import { BRIDGE_STATE_CONTRACT_VERSION } from "../../contracts/bridge_state/index.js";

function resolveAnchorColumnForSourceRow(solveState = {}, sourceRowId = "") {
    const projectionRow = (solveState?.exportData?.projectionRows || []).find((row) => row?.sourceRowId === sourceRowId);
    return projectionRow?.positionedAtoms?.find((atom) => atom?.projectionRole === "anchor")?.col ?? null;
}

const leftSolveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve("y=a*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

const leftBoundaryState = coreA.buildBridgeBoundaryStateFromSolveState(leftSolveState);

assert.equal(leftBoundaryState.variant, "left");
assert.equal(leftBoundaryState.equation_text, "y/a = B^(2x-1)");
assert.equal(leftBoundaryState.target_symbol, "x");
assert.equal(leftBoundaryState.power_shell.side, "right");
assert.equal(leftBoundaryState.power_shell.base.text, "B");
assert.equal(leftBoundaryState.power_shell.content.text, "2x-1");
assert.equal(leftBoundaryState.power_shell.content.functional_track_count, 1);
assert.deepEqual(
    leftBoundaryState.power_shell.content.ordered_cells.map((entry) => entry.text),
    ["2", "*", "x", "-", "1"]
);
assert.equal(leftBoundaryState.carry_through.side, "left");
assert.equal(leftBoundaryState.carry_through.text, "y/a");
assert.equal(
    leftBoundaryState.anchors.equals.x,
    resolveAnchorColumnForSourceRow(leftSolveState, leftBoundaryState.source_trace.boundary_row_id)
);

const rightSolveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve("B^(2x-1)=y/a", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

const rightBoundaryState = coreA.buildBridgeBoundaryStateFromSolveState(rightSolveState);

assert.equal(rightBoundaryState.variant, "right");
assert.equal(rightBoundaryState.equation_text, "B^(2x-1) = y/a");
assert.equal(rightBoundaryState.power_shell.side, "left");
assert.equal(rightBoundaryState.power_shell.base.text, "B");
assert.equal(rightBoundaryState.power_shell.content.text, "2x-1");
assert.equal(rightBoundaryState.power_shell.content.functional_track_count, 1);
assert.equal(rightBoundaryState.carry_through.side, "right");
assert.equal(rightBoundaryState.carry_through.text, "y/a");
assert.equal(
    rightBoundaryState.anchors.equals.x,
    resolveAnchorColumnForSourceRow(rightSolveState, rightBoundaryState.source_trace.boundary_row_id)
);

assert.throws(
    () => coreA.buildBridgeBoundaryStateFromSolveState({
        eingabe: "x/2=5",
        targetVariable: "x",
        schritte: [],
        exportData: {
            theoryRows: [],
            projectionRows: [],
            layoutPlan: {}
        }
    }),
    /power_exponent_release/
);

const boundaryManifest = coreA.buildCoreABridgeBoundaryAdapterManifest();
assert.equal(boundaryManifest.adapterType, "solve_state_to_boundary_state");
assert.equal(boundaryManifest.bridgeStateContractVersion, BRIDGE_STATE_CONTRACT_VERSION);
assert.equal(boundaryManifest.bridgeState.version, BRIDGE_STATE_CONTRACT_VERSION);
assert.ok(boundaryManifest.invariants.some((line) => line.includes("direkt vor power_exponent_release")));

console.log("core_a Bridge-Boundary-Adapter erfolgreich geprueft.");
