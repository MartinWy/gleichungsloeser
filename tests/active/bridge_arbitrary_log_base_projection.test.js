import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

const equation = "a-1=2*3^(x^2-2)";
const directResult = await GenesisCore.solve(equation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!directResult?.fehler, directResult?.fehler || "Der direkte Solve-State fehlt.");

const directRows = directResult.exportData.outputContract.projectionRows;
const bridgeResult = buildBridgeWorksheetSolveResultFromSolveState(directResult, equation, "x");
const bridgeRows = bridgeResult.exportData.outputContract.projectionRows;
const directLandingIndex = directResult.schritte.findIndex((step) => (
    step?.strategie?.family === "power_exponent_release"
)) + 1;
const directA2Rows = directRows.slice(directLandingIndex);
const bridgeA2Rows = bridgeRows.filter((row) => row?.processSpaceId === "a2");

assert.equal(bridgeA2Rows.length, directA2Rows.length);

function atomsWithRole(row, role) {
    return (row?.projectionAtoms || []).filter((atom) => (
        String(atom?.role || atom?.projectionRole || "").toLowerCase() === role
    ));
}

function oneAtomWithRole(row, role) {
    const atoms = atomsWithRole(row, role);
    assert.equal(atoms.length, 1, `Die Rolle ${role} muss genau einmal vorkommen.`);
    return atoms[0];
}

function atomText(atom) {
    return String(atom?.text ?? atom?.value ?? "");
}

for (const [index, bridgeRow] of bridgeA2Rows.entries()) {
    const directRow = directA2Rows[index];
    const bridgeName = oneAtomWithRole(bridgeRow, "function_name");
    const bridgeBase = oneAtomWithRole(bridgeRow, "function_base");
    const bridgeLeft = (bridgeRow.projectionAtoms || []).find((atom) => (
        ["function_left", "function_left_paren"].includes(
            String(atom?.role || atom?.projectionRole || "").toLowerCase()
        )
    ));
    const bridgeRight = (bridgeRow.projectionAtoms || []).find((atom) => (
        ["function_right", "function_right_paren"].includes(
            String(atom?.role || atom?.projectionRole || "").toLowerCase()
        )
    ));
    const directName = oneAtomWithRole(directRow, "function_name");
    const directBase = oneAtomWithRole(directRow, "function_base");
    const directLeft = (directRow.projectionAtoms || []).find((atom) => (
        ["function_left", "function_left_paren"].includes(
            String(atom?.role || atom?.projectionRole || "").toLowerCase()
        )
    ));
    const directRight = (directRow.projectionAtoms || []).find((atom) => (
        ["function_right", "function_right_paren"].includes(
            String(atom?.role || atom?.projectionRole || "").toLowerCase()
        )
    ));

    assert.equal(atomText(bridgeName), "log", "Die Namenszelle darf nicht den Diagnosekopf log_3 enthalten.");
    assert.equal(atomText(bridgeBase), "3", "Die freie Basis muss als eigene atomare Zelle erhalten bleiben.");
    assert.ok(bridgeLeft && bridgeRight, "Beide Funktionsklammern muessen atomar vorhanden sein.");
    assert.equal(
        (bridgeRow.projectionAtoms || []).some((atom) => atomText(atom).includes("_")),
        false,
        "Kein Projektionsatom darf einen zusammengesetzten Logarithmuskopf enthalten."
    );

    for (const [bridgeAtom, directAtom, label] of [
        [bridgeName, directName, "Funktionsname"],
        [bridgeBase, directBase, "Funktionsbasis"],
        [bridgeLeft, directLeft, "linke Funktionsklammer"],
        [bridgeRight, directRight, "rechte Funktionsklammer"]
    ]) {
        assert.deepEqual(
            [bridgeAtom.colStart, bridgeAtom.col, bridgeAtom.colEnd],
            [directAtom.colStart, directAtom.col, directAtom.colEnd],
            `${label} muss die exakte A2-Zelle der P4-Landing-Geometrie uebernehmen.`
        );
    }
}

const firstContinuation = bridgeA2Rows[1];
const leadingTwo = (firstContinuation.projectionAtoms || []).find((atom) => (
    atomText(atom) === "2" && atom?.role === "content" && atom?.localRow === firstContinuation.axisLocalRow
));
const plus = oneAtomWithRole(firstContinuation, "addition_operator");
const name = oneAtomWithRole(firstContinuation, "function_name");
const base = oneAtomWithRole(firstContinuation, "function_base");
const leftParen = (firstContinuation.projectionAtoms || []).find((atom) => (
    String(atom?.role || atom?.projectionRole || "").toLowerCase() === "function_left_paren"
));

assert.ok(leadingTwo && leftParen);
assert.ok(
    leadingTwo.col < plus.col
        && plus.col < name.col
        && name.col < base.col
        && base.col < leftParen.col,
    "Der neue Additionsterm muss vor der vollstaendigen, in sich geordneten log_3-Funktionshuelle stehen."
);

const structuredEquation = "y=(a+1)^x";
const structuredDirectResult = await GenesisCore.solve(structuredEquation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!structuredDirectResult?.fehler, structuredDirectResult?.fehler || "Der strukturierte Solve-State fehlt.");

const structuredBridgeResult = buildBridgeWorksheetSolveResultFromSolveState(
    structuredDirectResult,
    structuredEquation,
    "x"
);
const structuredLandingRow = structuredBridgeResult.exportData.outputContract.projectionRows.find((row) => (
    row?.processSpaceId === "a2"
));
const structuredFunctionSpan = (structuredLandingRow?.shellSpans || []).find((span) => (
    span?.shellType === "FUNCTION" && span?.collectionRanges?.baseContent
));

assert.ok(structuredLandingRow && structuredFunctionSpan, "Bridge B muss auch einen geschachtelten Basisblock vollstaendig landen.");

const structuredBaseRange = structuredFunctionSpan.collectionRanges.baseContent;
const structuredLeftParen = (structuredLandingRow.projectionAtoms || []).find((atom) => (
    ["function_left", "function_left_paren"].includes(
        String(atom?.role || atom?.projectionRole || "").toLowerCase()
    )
));
const structuredBaseAtoms = (structuredLandingRow.projectionAtoms || []).filter((atom) => {
    const start = atom?.colStart ?? atom?.col;
    const end = atom?.colEnd ?? atom?.col;
    return Number.isInteger(start)
        && Number.isInteger(end)
        && start >= structuredBaseRange.colStart
        && end <= structuredBaseRange.colEnd;
});
const structuredBaseTexts = structuredBaseAtoms.map(atomText);

assert.ok(structuredLeftParen, "Die linke Funktionsklammer muss auch beim geschachtelten Basisblock atomar vorliegen.");
assert.ok(
    structuredBaseRange.colEnd < structuredLeftParen.colStart,
    "Bridge B muss den vollstaendigen geschachtelten Basisblock vor der linken Funktionsklammer erhalten."
);
for (const requiredText of ["(", "a", "+", "1", ")"]) {
    assert.ok(
        structuredBaseTexts.includes(requiredText),
        `Der vollstaendige Basisblock muss das Primitiv ${requiredText} enthalten.`
    );
}

console.log("Bridge B uebernimmt einfache und geschachtelte Logarithmusbasen samt Funktionsklammern atomar aus A2.");
