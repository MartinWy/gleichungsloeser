import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import * as coreA from "../../core_a/index.js";
import * as bridgeB from "../../bridge_b/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

function visibleText(cell = {}) {
    return cell.text ?? cell.value ?? null;
}

async function buildBridgeCase(equation) {
    const solveState = await GenesisCore.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: "x"
    });

    assert.ok(!solveState?.fehler, solveState?.fehler || `Core-Lauf fuer ${equation} muss gueltig sein.`);

    const boundaryState = coreA.buildBridgeBoundaryStateFromSolveState(solveState);
    const landingProfile = coreA.buildBridgeLandingProfileFromSolveState(solveState);
    const landingState = bridgeB.buildBridgeLandingState(boundaryState, landingProfile);
    const worksheet = buildBridgeWorksheetSolveResultFromSolveState(solveState, equation, "x");

    return { solveState, boundaryState, landingProfile, landingState, worksheet };
}

const simple = await buildBridgeCase("a-2=c*2^(2*x-1)");

assert.equal(simple.boundaryState.power_shell.content.functional_track_count, 1);
assert.deepEqual(
    simple.boundaryState.power_shell.content.ordered_cells.map((cell) => cell.text),
    ["2", "*", "x", "-", "1"],
    "Die eine geschlossene Boundary-Spur muss ihre fuenf inneren P4-Zellen vollstaendig kennen."
);
assert.deepEqual(
    simple.landingProfile.term_slots.map((slot) => slot.source_text),
    ["2", "*", "x", "-", "1"],
    "Beim B-Uebergang muss jede gelieferte P4-Zelle genau einen normalen Landing-Slot erhalten."
);
assert.equal(simple.landingState.layout.source_exponent_track_count, 1);
assert.equal(simple.landingState.layout.target_term_track_count, 5);
assert.equal(simple.boundaryState.equation_text, "(a-2)/c = 2^(2*x-1)");
assert.equal(simple.landingState.equation_text, "lg((a-2)/c) = 2*x-1");

const simpleRows = simple.worksheet.exportData.outputContract.projectionRows;
const simpleFinalRow = simpleRows.at(-1);
const simpleFractionLines = simpleFinalRow.projectionAtoms
    .filter((cell) => cell.role === "fraction_line")
    .sort((left, right) => left.localRow - right.localRow);

assert.equal(simpleFractionLines.length, 2, "Die Schlusszeile muss inneren und aeusseren Bruch getrennt tragen.");
assert.ok(
    simpleFractionLines[0].localRow < simpleFractionLines[1].localRow,
    "Der innere Bruch muss vollstaendig oberhalb des aeusseren Bruchstrichs liegen."
);
assert.ok(
    simpleFractionLines[1].colStart <= simpleFractionLines[0].colStart
        && simpleFractionLines[1].colEnd >= simpleFractionLines[0].colEnd,
    "Der aeussere Bruchstrich muss den vollstaendigen verschachtelten Zaehler umschliessen."
);
assert.ok(
    simpleFractionLines[1].colEnd > simpleFractionLines[1].colStart,
    "Bridge B darf den aeusseren Bruchstrich nicht auf eine einzelne Nachbarzelle zusammenschieben."
);

const nestedLanding = await buildBridgeCase("a-2=c*2^(x^2-1)");
const nestedLandingRows = nestedLanding.worksheet.exportData.outputContract.projectionRows;
const nestedLandingRow = nestedLandingRows[nestedLanding.worksheet.bridgeMeta.boundaryRowCount];
const nestedLandingAnchor = nestedLandingRow.projectionAtoms.find((cell) => cell.role === "equation_anchor");
const nestedLandingFractionLines = nestedLandingRow.projectionAtoms.filter((cell) => (
    cell.role === "fraction_line"
    && cell.colEnd < nestedLandingAnchor.col
));

assert.equal(
    nestedLandingFractionLines.length,
    1,
    "Die exklusive B-Landing-Zeile muss den durchgereichten Bruchstrich genau einmal enthalten."
);

const nestedLandingFractionLine = nestedLandingFractionLines[0];
const nestedNumeratorAtoms = nestedLandingRow.projectionAtoms.filter((cell) => (
    cell.localRow === nestedLandingFractionLine.localRow - 1
    && cell.colStart >= nestedLandingFractionLine.colStart
    && cell.colEnd <= nestedLandingFractionLine.colEnd
));
const nestedDenominator = nestedLandingRow.projectionAtoms.find((cell) => (
    visibleText(cell) === "c"
    && cell.localRow === nestedLandingFractionLine.localRow + 1
    && cell.col >= nestedLandingFractionLine.colStart
    && cell.col <= nestedLandingFractionLine.colEnd
));

assert.deepEqual(
    nestedNumeratorAtoms.map(visibleText),
    ["a", "-", "2"],
    "Zaehler und Bruchstrich muessen im selben zeilenlokalen Landing-Raster stehen."
);
assert.ok(
    nestedDenominator,
    "Der Nenner muss unter demselben durchgereichten Bruchstrich stehen."
);

const nestedDivisionSpan = (nestedLandingRow.shellSpans || []).find((span) => (
    span.shellType === "DIVISION"
    && span.shellId === nestedLandingFractionLine.sourceShellId
));
const nestedFunctionName = nestedLandingRow.projectionAtoms.find((cell) => cell.role === "function_name");
const nestedFunctionLeft = nestedLandingRow.projectionAtoms.find((cell) => cell.role === "function_left_paren");
const nestedFunctionRight = nestedLandingRow.projectionAtoms.find((cell) => cell.role === "function_right_paren");
const nestedFunctionSpan = (nestedLandingRow.shellSpans || []).find((span) => (
    span.shellType === "FUNCTION"
    && span.shellId === nestedFunctionName?.sourceShellId
));

assert.ok(nestedDivisionSpan, "Der durchgereichte Bruchstrich muss seine DIVISION-Shell behalten.");
assert.equal(nestedDivisionSpan.localTopRow, nestedNumeratorAtoms[0].localRow);
assert.equal(nestedDivisionSpan.axisLocalRow, nestedLandingFractionLine.localRow);
assert.equal(nestedDivisionSpan.localBottomRow, nestedDenominator.localRow);
assert.ok(
    nestedFunctionName && nestedFunctionLeft && nestedFunctionRight && nestedFunctionSpan,
    "Die inverse Funktion muss mit ihrer echten P4-Shell und beiden Klammern ankommen."
);
assert.equal(nestedFunctionLeft.sourceShellId, nestedFunctionSpan.shellId);
assert.equal(nestedFunctionRight.sourceShellId, nestedFunctionSpan.shellId);
assert.ok(
    nestedFunctionSpan.localTopRow <= nestedNumeratorAtoms[0].localRow
        && nestedFunctionSpan.localBottomRow >= nestedDenominator.localRow,
    "Die Funktionsklammer muss die vollstaendige Bruchgeometrie von Zaehler bis Nenner umfassen."
);
assert.ok(
    nestedLandingRow.projectionAtoms.every((cell) => (
        cell.localRow >= 0 && cell.localRow < nestedLandingRow.localRowCount
    )),
    "Landing-Atome und shellSpans muessen dasselbe zeilenlokale Raster verwenden."
);

const squared = await buildBridgeCase("a-2=c*2^(2*x^2-1)");

assert.equal(squared.boundaryState.power_shell.content.functional_track_count, 1);
assert.deepEqual(
    squared.boundaryState.power_shell.content.ordered_cells.map((cell) => cell.text),
    ["2", "*", "x", "2", "-", "1"],
    "Auch mit innerem x^2 muss der geschlossene Exponent alle P4-Zellen geordnet tragen."
);
assert.equal(squared.landingProfile.term_slots.length, 6);
assert.equal(squared.landingState.layout.target_term_track_count, 6);
assert.equal(
    squared.solveState.schritte.filter((step) => step.strategie.family === "power_exponent_release").length,
    1,
    "Das Quadrieren von x darf keinen zweiten Bridge-B-Schritt ausloesen."
);
assert.ok(
    squared.solveState.schritte.some((step) => step.strategie.family === "root_power"),
    "Nach der einmaligen B-Landung muss A2 die innere Potenz regulaer weiterverarbeiten."
);

const squaredRows = squared.worksheet.exportData.outputContract.projectionRows;
const squaredLandingRow = squaredRows[squared.worksheet.bridgeMeta.boundaryRowCount];
const squaredAnchor = squaredLandingRow.projectionAtoms.find((cell) => cell.role === "equation_anchor");
const landedX = squaredLandingRow.projectionAtoms.find((cell) => (
    visibleText(cell) === "x" && cell.col > squaredAnchor.col
));
const landedInnerExponent = squaredLandingRow.projectionAtoms.find((cell) => (
    visibleText(cell) === "2"
    && cell.regionRole === "power_exponent"
    && cell.col > squaredAnchor.col
));
const landedTermOne = squaredLandingRow.projectionAtoms.find((cell) => (
    visibleText(cell) === "1"
    && cell.side === landedX?.side
    && cell.localRow === landedX?.localRow
));
const landedFirstTermAtom = squaredLandingRow.projectionAtoms
    .filter((cell) => (
        cell.side === landedX?.side
        && cell.localRow === landedX?.localRow
        && cell.kind === "content"
    ))
    .sort((left, right) => left.col - right.col)[0];
const landedPowerSpan = (squaredLandingRow.shellSpans || []).find((span) => (
    span.shellType === "POWER"
    && span.side === landedX?.side
    && span.contentLeafIds?.includes(landedX?.sourceAtomId)
));
const landedTermSpan = (squaredLandingRow.shellSpans || []).find((span) => (
    span.shellType === "SUBTRACTION"
    && span.side === landedX?.side
    && span.contentLeafIds?.includes(landedX?.sourceAtomId)
    && span.contentLeafIds?.includes(landedTermOne?.sourceAtomId)
));

assert.ok(landedX && landedInnerExponent, "Die Landing-Zeile muss Basis x und inneren Exponenten 2 getrennt erhalten.");
assert.ok(
    landedInnerExponent.localRow < landedX.localRow,
    "Die funktionale Geometrie muss den inneren Exponenten oberhalb seiner Basis x liefern."
);
assert.ok(landedPowerSpan, "Die innere POWER-Schale muss im kompakten Landing-Raster erhalten bleiben.");
assert.equal(landedPowerSpan.colStart, landedX.col);
assert.equal(landedPowerSpan.colEnd, landedInnerExponent.col);
assert.equal(landedPowerSpan.collectionRanges?.content?.colStart, landedX.col);
assert.equal(landedPowerSpan.collectionRanges?.exponentNodes?.colEnd, landedInnerExponent.col);
assert.ok(landedTermSpan && landedTermOne, "Die aeussere Exponenten-SUBTRACTION muss ihre atomaren Landing-Grenzen kennen.");
assert.equal(
    landedTermSpan.colStart,
    landedFirstTermAtom.col,
    "Der Landing-ShellSpan darf nicht die alte Boundary-Spalte vor dem ersten term_slot behalten."
);
assert.equal(
    landedTermSpan.colEnd,
    landedTermOne.col,
    "Der Landing-ShellSpan muss an der letzten wirklich gelandeten Termzelle enden."
);
assert.equal(
    landedTermSpan.rowId,
    squaredLandingRow.rowId,
    "Landing-Atome und Landing-ShellSpans muessen dieselbe Zeilenidentitaet tragen."
);
assert.equal(
    squared.worksheet.bridgeMeta.triggerFamily,
    "power_exponent_release",
    "Das Worksheet darf genau den dokumentierten Grenzschritt spleissen."
);

console.log("Bridge-B-Regression fuer verschachtelte Brueche und erneut quadriertes x erfolgreich geprueft.");
