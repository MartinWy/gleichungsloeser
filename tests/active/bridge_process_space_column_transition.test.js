import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import * as coreA from "../../core_a/index.js";
import * as bridgeB from "../../bridge_b/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

async function assertColumnTransition(equation) {
    const solveState = await GenesisCore.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: "x"
    });

    assert.ok(!solveState?.fehler, solveState?.fehler || `Core-Lauf fuer ${equation} muss gueltig sein.`);

    const boundaryState = coreA.buildBridgeBoundaryStateFromSolveState(solveState);
    const landingProfile = coreA.buildBridgeLandingProfileFromSolveState(solveState);
    const landingState = bridgeB.buildBridgeLandingState(boundaryState, landingProfile);
    const worksheet = buildBridgeWorksheetSolveResultFromSolveState(solveState, equation, "x");
    const rows = worksheet.exportData.outputContract.projectionRows;
    const boundaryRowCount = worksheet.bridgeMeta.boundaryRowCount;
    const boundaryRow = rows[boundaryRowCount - 1];
    const landingRow = rows[boundaryRowCount];
    const orderedBoundaryCells = boundaryState.power_shell.content.ordered_cells;
    const landingSlots = landingProfile.term_slots;

    assert.equal(
        boundaryState.power_shell.content.functional_track_count,
        1,
        "A1 muss den komplexen Exponenten bis zur Boundary als genau eine aeussere funktionale Spur behandeln."
    );
    assert.ok(
        rows.slice(0, boundaryRowCount).every((row) => row.processSpaceId === "a1"),
        "Alle Zeilen bis einschliesslich Boundary muessen ausschliesslich dem A1-Spaltenraum gehoeren."
    );
    assert.ok(
        rows.slice(boundaryRowCount).every((row) => row.processSpaceId === "a2"),
        "B-Landing und alle Folgezeilen muessen ausschliesslich dem neuen A2-Spaltenraum gehoeren."
    );

    const boundarySourceIds = orderedBoundaryCells.map((cell) => cell.source_atom_id);
    const boundaryColumns = orderedBoundaryCells.map((cell) => cell.boundary_col);

    assert.equal(new Set(boundarySourceIds).size, orderedBoundaryCells.length);
    assert.ok(boundaryColumns.every(Number.isInteger));
    assert.deepEqual(
        orderedBoundaryCells.map((cell) => cell.text),
        landingSlots.map((slot) => slot.source_text),
        "B muss die geordnete Innenzellfolge der einen A1-Exponentenspur unveraendert lesen."
    );
    assert.deepEqual(
        boundarySourceIds,
        landingSlots.map((slot) => slot.source_atom_id),
        "B muss jede neue Landing-Spalte aus genau ihrer gelieferten A1-Innenzelle ableiten."
    );

    const landingColumns = landingSlots.map((slot) => slot.x);
    assert.ok(landingColumns.every(Number.isInteger));
    assert.deepEqual(
        landingColumns,
        Array.from(
            { length: landingColumns.length },
            (_, index) => landingColumns[0] + index
        ),
        "B muss die eine Exponentenspur in eine kompakte Folge neuer A2-Termspalten auffalten."
    );
    assert.notDeepEqual(
        landingColumns,
        boundaryColumns,
        "B darf die alten schaleninternen A1-Spalten nicht als normale A2-Termspalten fortschreiben."
    );

    const boundaryProjectionColumns = orderedBoundaryCells.map((cell) => {
        const projectionCell = boundaryRow.projectionAtoms.find((atom) => (
            atom.sourceAtomId === cell.source_atom_id
            && atom.col === cell.boundary_col
        ));
        assert.ok(projectionCell, `A1-Innenzelle ${cell.text} fehlt an ihrer gelieferten Boundary-Spalte.`);
        return projectionCell.col;
    });
    assert.deepEqual(boundaryProjectionColumns, boundaryColumns);

    const landingProjectionColumns = landingSlots.map((slot) => {
        const projectionCell = landingRow.projectionAtoms.find((atom) => (
            atom.sourceAtomId === slot.source_atom_id
            && atom.col === slot.x
        ));
        assert.ok(projectionCell, `B-Landezelle ${slot.source_text} fehlt an ihrer neu vergebenen A2-Spalte.`);
        return projectionCell.col;
    });
    assert.deepEqual(landingProjectionColumns, landingColumns);

    const a1CellKeys = boundaryColumns.map((col) => `${boundaryRow.processSpaceId}:${col}`);
    const a2CellKeys = landingColumns.map((col) => `${landingRow.processSpaceId}:${col}`);
    assert.ok(
        a1CellKeys.every((key) => !a2CellKeys.includes(key)),
        "Keine A2-Termzelle darf bereits als funktionale A1-Zelle vorreserviert sein."
    );
    assert.equal(landingState.layout.source_exponent_track_count, 1);
    assert.equal(landingState.layout.target_term_track_count, orderedBoundaryCells.length);
    assert.equal(landingState.step_meta.no_second_jump, true);
}

await assertColumnTransition("a-1=2*e^(2*x-1)");
await assertColumnTransition("2*e^(2*x-1)=a-1");

console.log("A1-Exponentenspur und B-Neuvergabe der A2-Termspalten sind getrennt und eindeutig.");
