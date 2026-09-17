import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

function atomRole(atom = {}) {
    return atom?.role || atom?.projectionRole || null;
}

function atomSourceId(atom = {}) {
    return atom?.sourceAtomId || atom?.sourceNodeId || atom?.sourceShellId || null;
}

function atomKey(atom = {}) {
    return `${atomRole(atom)}::${atomSourceId(atom)}`;
}

function atomColumns(atom = {}) {
    return {
        col: atom?.col ?? null,
        colStart: atom?.colStart ?? atom?.col ?? null,
        colEnd: atom?.colEnd ?? atom?.col ?? null
    };
}

async function assertIdentityBasedBridge(equation, carrySide) {
    const solveState = await GenesisCore.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: "x"
    });

    assert.ok(!solveState?.fehler, solveState?.fehler || `Core-Lauf fuer ${equation} muss gueltig sein.`);

    const worksheet = buildBridgeWorksheetSolveResultFromSolveState(
        solveState,
        equation,
        "x"
    );
    const rows = worksheet.exportData.outputContract.projectionRows;
    const landingIndex = worksheet.bridgeMeta.boundaryRowCount;
    const boundaryRow = rows[landingIndex - 1];
    const landingRow = rows[landingIndex];
    const boundaryCarryAtoms = (boundaryRow.projectionAtoms || []).filter((atom) => (
        atom?.side === carrySide && atom?.isVisible !== false
    ));
    const landingAtomsByKey = new Map(
        (landingRow.projectionAtoms || []).map((atom) => [atomKey(atom), atom])
    );

    assert.ok(boundaryCarryAtoms.length > 0, "Die Boundary muss eine sichtbare Durchreicheseite besitzen.");

    for (const boundaryAtom of boundaryCarryAtoms) {
        const landingAtom = landingAtomsByKey.get(atomKey(boundaryAtom));
        assert.ok(
            landingAtom,
            `Bridge B muss die Durchreichzelle ${atomKey(boundaryAtom)} ueber ihre Identitaet binden.`
        );
        assert.deepEqual(
            atomColumns(landingAtom),
            atomColumns(boundaryAtom),
            `Bridge B darf die Durchreichzelle ${atomKey(boundaryAtom)} horizontal nicht verschieben.`
        );
    }

    const boundaryFractionLine = boundaryCarryAtoms.find((atom) => atomRole(atom) === "fraction_line");
    const landingFractionLine = landingAtomsByKey.get(atomKey(boundaryFractionLine));
    const landingFunctionName = (landingRow.projectionAtoms || []).find((atom) => (
        atom?.side === carrySide && atomRole(atom) === "function_name"
    ));
    const landingFunctionLeft = (landingRow.projectionAtoms || []).find((atom) => (
        atom?.side === carrySide
        && ["function_left", "function_left_paren"].includes(atomRole(atom))
    ));
    const landingFunctionRight = (landingRow.projectionAtoms || []).find((atom) => (
        atom?.side === carrySide
        && ["function_right", "function_right_paren"].includes(atomRole(atom))
    ));
    const landingFunctionSpan = (landingRow.shellSpans || []).find((span) => (
        span?.side === carrySide
        && span?.shellType === "FUNCTION"
        && span?.shellId === landingFunctionName?.sourceShellId
    ));

    assert.ok(
        landingFractionLine && landingFunctionName && landingFunctionLeft
            && landingFunctionRight && landingFunctionSpan,
        "Die B-Landung muss Bruch und vollstaendige inverse Funktionshuelle enthalten."
    );
    assert.equal(
        landingFunctionLeft.colEnd,
        landingFractionLine.colStart - 1,
        "Die linke Funktionsklammer braucht ihre eigene Zelle direkt vor der unveraenderten Bruchschale."
    );
    assert.equal(
        landingFunctionRight.colStart,
        landingFractionLine.colEnd + 1,
        "Die rechte Funktionsklammer braucht ihre eigene Zelle direkt hinter der unveraenderten Bruchschale."
    );
    assert.ok(
        landingFunctionName.colEnd < landingFunctionLeft.colStart,
        "Der Funktionsname muss in einer eigenen Zelle vor der linken Klammer liegen."
    );
    assert.equal(
        landingFunctionSpan.collectionRanges?.content?.colStart,
        landingFractionLine.colStart,
        "Der Argumentbereich der FUNCTION-Schale muss am unveraenderten Bruch beginnen."
    );
    assert.equal(
        landingFunctionSpan.collectionRanges?.content?.colEnd,
        landingFractionLine.colEnd,
        "Die FUNCTION-Schale muss exakt den unveraenderten Bruch als Argumentbereich referenzieren."
    );
}

await assertIdentityBasedBridge(
    "(a-2)/(b+4)=d*e^(x^2+5)",
    "left"
);

await assertIdentityBasedBridge(
    "d*e^(x^2+5)=(a-2)/(b+4)",
    "right"
);

console.log("Bridge B bindet mehrzeilige Nennererweiterungen identitaetsbasiert statt ueber nackte Spalten.");
