import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import * as coreA from "../../core_a/index.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

const equation = "(2*a-1)=e^(2*x-1)";
const solveResult = await GenesisCore.solve(equation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!solveResult?.fehler, solveResult?.fehler || "Der Solve-State fuer den exklusiven B-Schritt fehlt.");

const bridgeResult = buildBridgeWorksheetSolveResultFromSolveState(solveResult, equation, "x");
const boundaryState = coreA.buildBridgeBoundaryStateFromSolveState(solveResult);
const projectionRows = bridgeResult?.exportData?.outputContract?.projectionRows || [];

assert.ok(projectionRows.length >= 2, "Die Bridge-Ansicht braucht Boundary- und Landing-Zeile.");

const boundaryRow = projectionRows[0];
const bridgeRow = projectionRows[1];
const continuationRow = projectionRows[2];
const finalRow = projectionRows[3];
const visibleText = (atom) => atom?.text ?? atom?.value ?? null;
const boundaryAnchorCol = (boundaryRow?.projectionAtoms || []).find((atom) => visibleText(atom) === "=")?.col ?? null;
const bridgeAnchorCol = (bridgeRow?.projectionAtoms || []).find((atom) => visibleText(atom) === "=")?.col ?? null;
const continuationAnchorCol = (continuationRow?.projectionAtoms || []).find((atom) => visibleText(atom) === "=")?.col ?? null;

const boundaryLeftAtoms = (boundaryRow?.projectionAtoms || []).filter((atom) => (
    ["2", "a", "-", "1"].includes(visibleText(atom))
    && Number.isInteger(boundaryAnchorCol)
    && atom?.col < boundaryAnchorCol
));
const boundarySourceIds = new Set(boundaryLeftAtoms.map((atom) => atom?.sourceAtomId).filter(Boolean));

const bridgeLeftAtoms = (bridgeRow?.projectionAtoms || []).filter((atom) => (
    boundarySourceIds.has(atom?.sourceAtomId)
    && Number.isInteger(bridgeAnchorCol)
    && atom?.col < bridgeAnchorCol
));
const continuationLeftAtoms = (continuationRow?.projectionAtoms || []).filter((atom) => (
    boundarySourceIds.has(atom?.sourceAtomId)
    && Number.isInteger(continuationAnchorCol)
    && atom?.col < continuationAnchorCol
));

assert.equal(boundaryLeftAtoms.length, 4, "Die Boundary-Zeile muss den linken Ausdruck als vier sichtbare Atomspuren tragen.");
assert.equal(bridgeLeftAtoms.length, 4, "Auch die Landing-Zeile muss dieselben vier linken Atomspuren sichtbar halten.");
assert.equal(continuationLeftAtoms.length, 4, "Auch die erste A2-Folgezeile muss dieselben vier linken Atomspuren sichtbar halten.");

for (const boundaryCell of boundaryLeftAtoms) {
    const carriedCell = bridgeLeftAtoms.find((cell) => cell.sourceAtomId === boundaryCell.sourceAtomId);
    assert.ok(
        carriedCell,
        `Das Atom ${visibleText(boundaryCell)} muss im exklusiven B-Schritt weitergereicht werden.`
    );
    assert.equal(
        carriedCell.col,
        boundaryCell.col,
        `Das Atom ${visibleText(boundaryCell)} darf beim exklusiven B-Schritt seine Spalte nicht verlieren.`
    );

    const continuedCell = continuationLeftAtoms.find((cell) => cell.sourceAtomId === boundaryCell.sourceAtomId);
    assert.ok(
        continuedCell,
        `Das Atom ${visibleText(boundaryCell)} muss auch in der ersten A2-Folgezeile weitergereicht werden.`
    );
    assert.equal(
        continuedCell.col,
        boundaryCell.col,
        `Das Atom ${visibleText(boundaryCell)} darf auch nach dem B-Handoff seine Spalte nicht verlieren.`
    );
}

const functionNameCell = (bridgeRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "function_name"
    && cell?.text === "ln"
));

assert.ok(functionNameCell, "Der B-Schritt muss links den Funktionskopf ln sichtbar setzen.");

const duplicateFunctionContainer = (bridgeRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "function"
    && cell?.text === "ln"
));
const duplicateContinuationFunctionContainer = (continuationRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "function"
    && cell?.text === "ln"
));

assert.equal(
    duplicateFunctionContainer,
    undefined,
    "Die exklusive B-Zeile darf keinen zweiten sichtbaren Sammelcontainer fuer ln mehr tragen."
);
assert.equal(
    duplicateContinuationFunctionContainer,
    undefined,
    "Auch die erste A2-Folgezeile darf keinen zweiten sichtbaren Sammelcontainer fuer ln mehr tragen."
);

const leftMostBoundaryCol = Math.min(...boundaryLeftAtoms.map((cell) => cell.col));
assert.ok(
    functionNameCell.col < leftMostBoundaryCol,
    "Der Funktionskopf ln muss links vor den unveraenderten Altinhalt gesetzt werden."
);

const boundaryExponentCells = (boundaryRow?.projectionAtoms || []).filter((cell) => (
    cell?.regionRole === "power_exponent"
    || cell?.role === "power_exponent"
));
const boundaryBaseCell = (boundaryRow?.projectionAtoms || []).find((cell) => visibleText(cell) === "e");

assert.equal(
    boundaryState.power_shell.content.functional_track_count,
    1,
    "Die Boundary muss den gesamten komplexen Exponenten als genau eine aeussere funktionale Spur transportieren."
);
assert.deepEqual(
    boundaryState.power_shell.content.ordered_cells.map((cell) => cell.text),
    ["2", "*", "x", "-", "1"],
    "Innerhalb der einen Boundary-Spur muessen alle gelieferten P4-Zellen geordnet erhalten bleiben."
);
assert.equal(boundaryExponentCells.length, 5, "Die innere P4-Geometrie der geschlossenen Exponentenspur darf keine Zelle verlieren.");
assert.ok(
    boundaryBaseCell,
    "Die Boundary-Zeile muss die Basis der Potenz sichtbar weiterreichen."
);

const bridgeRightDot = (bridgeRow?.projectionAtoms || []).find((cell) => (
    visibleText(cell) === "*"
    && cell?.col > bridgeAnchorCol
));

assert.ok(
    bridgeRightDot,
    "Die exklusive B-Zeile muss den expliziten Multiplikationspunkt des freigelegten Zielterms weiterreichen."
);

const bridgeTermCells = (bridgeRow?.projectionAtoms || [])
    .filter((cell) => Number.isInteger(bridgeAnchorCol) && cell?.col > bridgeAnchorCol)
    .sort((left, right) => left.col - right.col);
const bridgeTermColumns = bridgeTermCells.map((cell) => cell.col);
const bridgeTermTexts = bridgeTermCells.map(visibleText);

assert.deepEqual(
    bridgeTermTexts,
    ["2", "*", "x", "-", "1"],
    "B muss den geoeffneten Exponenten vollstaendig und in seiner echten Reihenfolge auf die Normalachse setzen."
);
assert.deepEqual(
    bridgeTermColumns,
    [bridgeAnchorCol + 2, bridgeAnchorCol + 3, bridgeAnchorCol + 4, bridgeAnchorCol + 5, bridgeAnchorCol + 6],
    "B muss fuer den geoeffneten Exponenten kompakte neue Termslots ohne alte POWER-Luecke vergeben."
);
assert.equal(
    bridgeTermColumns.at(-1) - bridgeTermColumns[0] + 1,
    bridgeTermColumns.length,
    "Die alten POWER-Spalten duerfen im neuen B-Termband weder Luecken noch reservierte Abstandshalter hinterlassen."
);

const continuationPlusCell = (continuationRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "addition_operator"
    && visibleText(cell) === "+"
));
const continuationLeadingOneCell = (continuationRow?.projectionAtoms || []).find((cell) => (
    visibleText(cell) === "1"
    && cell?.col === 0
));
const continuationLnCell = (continuationRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "function_name"
    && visibleText(cell) === "ln"
));

assert.ok(
    continuationPlusCell,
    "Die erste A2-Folgezeile muss den umgestellten Additionsterm mit sichtbarem Plus projizieren."
);
assert.ok(
    continuationLnCell,
    "Die erste A2-Folgezeile darf den Logarithmuskopf nicht verlieren."
);
assert.ok(
    continuationLeadingOneCell,
    "Die erste A2-Folgezeile muss die umgestellte 1 links vor dem bestehenden Inhalt sichtbar halten."
);
assert.ok(
    continuationPlusCell.col < continuationLnCell.col,
    "Beim Rechts-nach-links-Transport muss der neue Additionsterm links vor dem bestehenden ln angebaut werden."
);
assert.ok(
    continuationLeadingOneCell.col < continuationPlusCell.col,
    "Die umgestellte 1 muss ihre neue Fuehrungsposition vor dem Plus behalten."
);

const bridgePersistentTermCells = bridgeTermCells.filter((cell) => ["2", "*", "x"].includes(visibleText(cell)));
const continuationRightCells = (continuationRow?.projectionAtoms || [])
    .filter((cell) => Number.isInteger(continuationAnchorCol) && cell?.col > continuationAnchorCol);

for (const bridgeCell of bridgePersistentTermCells) {
    const continuedCell = continuationRightCells.find((cell) => (
        cell?.sourceAtomId === bridgeCell?.sourceAtomId
        && visibleText(cell) === visibleText(bridgeCell)
    ));

    assert.ok(continuedCell, `A2 muss die von B gesetzte Spur ${visibleText(bridgeCell)} uebernehmen.`);
    assert.equal(
        continuedCell.col,
        bridgeCell.col,
        `A2 darf die von B gesetzte Spur ${visibleText(bridgeCell)} nicht ein zweites Mal verschieben.`
    );
}

const finalFractionLine = (finalRow?.projectionAtoms || []).find((cell) => cell?.role === "fraction_line");
const finalDivision = (finalRow?.shellSpans || []).find((shell) => shell?.shellType === "DIVISION");
const finalLnCell = (finalRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "function_name"
    && visibleText(cell) === "ln"
));
const finalPlusCell = (finalRow?.projectionAtoms || []).find((cell) => (
    cell?.role === "addition_operator"
    && visibleText(cell) === "+"
));
const finalDenominatorCell = (finalRow?.projectionAtoms || []).find((cell) => (
    visibleText(cell) === "2"
    && cell?.localRow === 2
));

assert.ok(
    finalFractionLine,
    "Die letzte A2-Zeile muss den geborenen Bruchstrich explizit weiterreichen."
);
assert.ok(
    finalDivision?.collectionAlignmentRanges?.numerator
        && finalDivision?.collectionAlignmentRanges?.denominator,
    "Bridge B muss die getrennten Bruch-Ausrichtungsbaender bis A2 weiterreichen."
);
assert.deepEqual(
    [
        finalDivision.collectionAlignmentRanges.numerator.colStart,
        finalDivision.collectionAlignmentRanges.numerator.colEnd
    ],
    [finalFractionLine.colStart, finalFractionLine.colEnd],
    "Das Zaehler-Ausrichtungsband muss auch nach Bridge B exakt dem Bruchstrich entsprechen."
);
assert.deepEqual(
    [
        finalDivision.collectionAlignmentRanges.denominator.colStart,
        finalDivision.collectionAlignmentRanges.denominator.colEnd
    ],
    [finalFractionLine.colStart, finalFractionLine.colEnd],
    "Das Nenner-Ausrichtungsband muss auch nach Bridge B exakt dem Bruchstrich entsprechen."
);
assert.ok(
    finalLnCell,
    "Auch in der Schlusszeile muss der Logarithmuskopf sichtbar bleiben."
);
assert.ok(
    finalPlusCell,
    "Auch in der Schlusszeile darf das fuehrende Plus nicht verschwinden."
);
assert.ok(
    finalDenominatorCell,
    "Die Schlusszeile muss den Nenner 2 unter dem Bruchstrich explizit tragen."
);

const bridgeTargetCell = bridgeTermCells.find((cell) => visibleText(cell) === "x");
const finalTargetCell = (finalRow?.projectionAtoms || []).find((cell) => visibleText(cell) === "x");

assert.equal(
    finalTargetCell?.col,
    bridgeTargetCell?.col,
    "Die Zielvariable muss bis zur letzten A2-Zeile in der von B gesetzten Termspur bleiben."
);

const boundaryAnchor = (boundaryRow?.projectionAtoms || []).find((atom) => visibleText(atom) === "=");
const bridgeAnchor = (bridgeRow?.projectionAtoms || []).find((atom) => visibleText(atom) === "=");

assert.ok(boundaryAnchor && bridgeAnchor, "Boundary- und Bridge-Zeile muessen einen sichtbaren Gleichheitsanker tragen.");
assert.equal(bridgeAnchor.col, boundaryAnchor.col, "Der Gleichheitsanker darf im exklusiven B-Schritt seine Spalte nicht verlieren.");

console.log("Bridge-B-Positionsvertrag erfolgreich geprueft.");
