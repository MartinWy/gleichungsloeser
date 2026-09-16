import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";
import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import { runProjectionPhase } from "../../core/GenesisRuntime/P4_Projection/runProjectionPhase.js";

function findProjectionAtom(row, predicate) {
    return (row?.projectionAtoms || []).find(predicate) || null;
}

const trigResult = await runGenesisRuntime("sin(x)=1", {
    targetVariable: "x"
});
const trigProjection = trigResult.phases.projection;
assert.equal(trigProjection.phaseId, "P4_Projection");
assert.equal(trigProjection.theoryRows.length, 2);
assert.equal(trigProjection.projectionRows.length, 2);

const trigRow0 = trigProjection.projectionRows[0];
const trigRow1 = trigProjection.projectionRows[1];
const trigRow0X = findProjectionAtom(trigRow0, (atom) => atom.role === "content" && atom.value === "x");
const trigRow1X = findProjectionAtom(trigRow1, (atom) => atom.role === "content" && atom.value === "x");
const trigRow0Anchor = findProjectionAtom(trigRow0, (atom) => atom.role === "equation_anchor");
const trigRow1Anchor = findProjectionAtom(trigRow1, (atom) => atom.role === "equation_anchor");
const trigRow0FunctionName = findProjectionAtom(trigRow0, (atom) => atom.role === "function_name");
const trigRow1InverseFunctionName = findProjectionAtom(
    trigRow1,
    (atom) => atom.role === "function_name" && atom.value === "asin"
);
const trigRow1InverseFunctionLeft = findProjectionAtom(
    trigRow1,
    (atom) => atom.role === "function_left_paren"
);
const trigRow1InverseFunctionRight = findProjectionAtom(
    trigRow1,
    (atom) => atom.role === "function_right_paren"
);

assert.ok(trigRow0X);
assert.ok(trigRow1X);
assert.equal(trigRow0X.col, trigRow1X.col, "Dasselbe x muss dieselbe globale Spalte behalten.");
assert.ok(trigRow0Anchor);
assert.ok(trigRow1Anchor);
assert.equal(trigRow0Anchor.col, trigRow1Anchor.col, "Das Gleichheitszeichen muss zeilenuebergreifend dieselbe Spalte behalten.");
assert.equal(trigRow0FunctionName?.value, "sin");
assert.ok(trigRow1InverseFunctionName, "Auch eine inverse Funktion ueber einfachem Inhalt muss als sichtbare Primitive exportiert werden.");
assert.ok(trigRow1InverseFunctionLeft);
assert.ok(trigRow1InverseFunctionRight);
assert.equal(
    trigRow1.projectionAtoms.filter((atom) => atom.kind === "shell_container").length,
    0,
    "Der Projektionsvertrag darf auch fuer einfache inverse Funktionen keine geschlossenen Funktionscontainer exportieren."
);

const lawOfSinesBetaProjectionResult = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "beta"
});
const lawOfSinesBetaFinalRow = lawOfSinesBetaProjectionResult.phases.projection.projectionRows.at(-1);
const passiveInnerFunctionName = findProjectionAtom(
    lawOfSinesBetaFinalRow,
    (atom) => atom.role === "function_name" && atom.value === "sin" && atom.sourceNodeId?.startsWith("shell-function")
);
const passiveInnerAlpha = findProjectionAtom(
    lawOfSinesBetaFinalRow,
    (atom) => atom.role === "content" && atom.value === "alpha"
);
const passiveInnerFunctionLeft = findProjectionAtom(
    lawOfSinesBetaFinalRow,
    (atom) => atom.role === "function_left_paren" && atom.sourceNodeId?.startsWith("shell-function")
);
const passiveInnerFunctionRight = findProjectionAtom(
    lawOfSinesBetaFinalRow,
    (atom) => atom.role === "function_right_paren" && atom.sourceNodeId?.startsWith("shell-function")
);
const explicitInverseAsinName = findProjectionAtom(
    lawOfSinesBetaFinalRow,
    (atom) => atom.role === "function_name" && atom.value === "asin"
);

assert.ok(passiveInnerFunctionName, "Auch eine passive innere sin(...)-Schale muss als sichtbare Primitive exportiert werden.");
assert.ok(passiveInnerFunctionLeft);
assert.ok(passiveInnerFunctionRight);
assert.ok(passiveInnerAlpha, "Der Inhalt einer passiven inneren sin(...)-Schale bleibt auch im geschlossenen algebraischen Zustand ein sichtbares Atom.");
assert.ok(explicitInverseAsinName, "Eine inverse Huelle um einen strukturierten Bruchkern muss ihr Funktions-Chrome explizit fuehren.");
assert.equal(
    lawOfSinesBetaFinalRow.projectionAtoms.filter((atom) => atom.kind === "shell_container").length,
    0,
    "Auch passive Funktionsschalen duerfen im Projektionsvertrag nicht mehr als Containerblock austreten."
);

const rootResult = await runGenesisRuntime("sqrt(x)=5", {
    targetVariable: "x"
});
const rootProjection = rootResult.phases.projection;
const rootFinalRow = rootProjection.projectionRows[1];
const rootExponent = findProjectionAtom(rootFinalRow, (atom) => atom.role === "power_exponent");
const rootFive = findProjectionAtom(rootFinalRow, (atom) => atom.role === "content" && atom.value === "5");

assert.ok(rootExponent);
assert.ok(rootFive);
assert.ok(rootExponent.localRow < rootFive.localRow, "Der Exponent muss oberhalb des Basisinhalts liegen.");

const divisionContractResult = await runGenesisRuntime("x/2=5", {
    targetVariable: "x"
});
const divisionContractRow = divisionContractResult.phases.projection.projectionRows[0];
const divisionContractBlock = divisionContractResult.phases.projection.projectionBlocks[0];
const divisionFractionLine = findProjectionAtom(divisionContractRow, (atom) => atom.role === "fraction_line");
const divisionShellSpan = (divisionContractRow.shellSpans || []).find((shell) => shell.shellType === "DIVISION");
const divisionShellBlock = (divisionContractBlock.shellBlocks || []).find((shell) => shell.shellType === "DIVISION");

assert.deepEqual(
    divisionContractRow.rowRoles,
    ["above_axis", "axis", "below_axis"],
    "Ein sichtbarer Bruch muss seine lokalen Teilzeilen explizit benennen."
);
assert.deepEqual(
    divisionContractBlock.rowRoles,
    ["above_axis", "axis", "below_axis"],
    "Der Projektionsblock muss dieselbe Teilzeilenstruktur bereits upstream tragen."
);
assert.ok(divisionFractionLine);
assert.equal(
    divisionFractionLine.rowRole,
    "axis",
    "Der Bruchstrich muss auf der expliziten Achsenzeile liegen."
);
assert.ok(divisionShellSpan);
assert.equal(divisionShellSpan.localTopRow, 0);
assert.equal(divisionShellSpan.axisLocalRow, 1);
assert.equal(divisionShellSpan.localBottomRow, 2);
assert.equal(
    divisionShellSpan.colStart,
    divisionFractionLine.colStart,
    "Die Shell-Spanne des Bruchs muss denselben linken Rand wie der Bruchstrich melden."
);
assert.equal(
    divisionShellSpan.colEnd,
    divisionFractionLine.colEnd,
    "Die Shell-Spanne des Bruchs muss denselben rechten Rand wie der Bruchstrich melden."
);
assert.ok(divisionShellBlock);
assert.equal(divisionShellBlock.localTopRow, 0);
assert.equal(divisionShellBlock.axisLocalRow, 1);
assert.equal(divisionShellBlock.localBottomRow, 2);
assert.equal(
    divisionShellBlock.geometryBirthRowId,
    divisionContractRow.rowId,
    "Eine sichtbare Eingabe-DIVISION muss ihren Geburtszeitpunkt im Exportvertrag tragen."
);
assert.equal(
    divisionShellBlock.alignmentColStart,
    divisionShellBlock.contentColStart,
    "Beim einfachen Eingabebruch muss das Ausrichtungsband denselben linken Start wie der Inhaltskern melden."
);
assert.equal(
    divisionShellBlock.alignmentColEnd,
    divisionShellBlock.contentColEnd,
    "Beim einfachen Eingabebruch muss das Ausrichtungsband denselben rechten Abschluss wie der Inhaltskern melden."
);
assert.equal(
    divisionShellBlock.slotLocalRows?.fraction_line,
    1,
    "Der Blockvertrag soll den Bruchstrich auch als Slot auf der Achsenzeile fuehren."
);

const exponentialProjectionResult = await runGenesisRuntime("y=a*B^x", {
    targetVariable: "x"
});
const exponentialStartRow = exponentialProjectionResult.phases.projection.projectionRows[0];
const exponentialSecondRow = exponentialProjectionResult.phases.projection.projectionRows[1];
const exponentialFinalRow = exponentialProjectionResult.phases.projection.projectionRows[2];
const startPowerExponent = findProjectionAtom(
    exponentialStartRow,
    (atom) => atom.kind === "content" && atom.role === "power_exponent" && atom.value === "x"
);
const startPowerBase = findProjectionAtom(
    exponentialStartRow,
    (atom) => atom.role === "content" && atom.value === "B"
);
const secondPowerExponent = findProjectionAtom(
    exponentialSecondRow,
    (atom) => atom.kind === "content" && atom.role === "power_exponent" && atom.value === "x"
);
const secondPowerBase = findProjectionAtom(
    exponentialSecondRow,
    (atom) => atom.role === "content" && atom.value === "B"
);
const releasedExponentTarget = findProjectionAtom(
    exponentialFinalRow,
    (atom) => atom.role === "content" && atom.value === "x"
);

assert.ok(startPowerExponent, "Die Startzeile muss den Exponenten als eigene atomare Zelle erhalten.");
assert.equal(startPowerExponent.isTarget, true, "P4 muss die bereits von P2 gewaehlte Zielvariable am atomaren Blatt markieren.");
assert.ok(startPowerBase, "Die Startzeile muss die Potenzbasis weiterhin als eigenen Inhaltsanker tragen.");
assert.ok(secondPowerExponent, "Eine unbewegte Potenz muss die atomare Exponentenzelle auch in der Folgezeile weiterreichen.");
assert.ok(secondPowerBase, "Eine unbewegte Potenz muss die Potenzbasis auch in der Folgezeile an derselben Stelle weiterreichen.");
assert.equal(
    secondPowerExponent.col,
    startPowerExponent.col,
    "Eine unbewegte Exponentenzelle muss beim Weiterreichen ihre Spalte behalten."
);
assert.equal(
    secondPowerBase.col,
    startPowerBase.col,
    "Eine unbewegte Potenzbasis darf ihre Spalte beim Weiterreichen nicht verlieren."
);
assert.ok(releasedExponentTarget, "Der freigelegte Exponent muss in der Endzeile als sichtbarer Inhalt auftauchen.");
assert.equal(
    releasedExponentTarget.col,
    startPowerExponent.col,
    "Ein freigelegter Exponent muss die Spalte seines urspruenglichen Potenzslots behalten."
);

const complexExponentProjectionResult = await runGenesisRuntime("y=a*B^(2x-1)", {
    targetVariable: "x"
});
const complexExponentStartRow = complexExponentProjectionResult.phases.projection.projectionRows[0];
const complexImplicitProduct = findProjectionAtom(
    complexExponentStartRow,
    (atom) => atom.role === "multiplication_operator" && atom.regionRole === "power_exponent"
);

assert.ok(complexImplicitProduct, "Der komplexe Exponent muss seinen Multiplikationsoperator als eigene P4-Zelle liefern.");
assert.equal(
    complexImplicitProduct.isImplicit,
    true,
    "P4 muss das P1-Merkmal eines impliziten Operators ohne Rueckblick in den Theoriebaum mitgeben."
);

const additionProjectionResult = await runGenesisRuntime("x+2=5", {
    targetVariable: "x"
});
const additionFinalRow = additionProjectionResult.phases.projection.projectionRows[1];
const subtractionOperator = findProjectionAtom(additionFinalRow, (atom) => atom.role === "subtraction_operator");
const subtractionFive = findProjectionAtom(additionFinalRow, (atom) => atom.role === "content" && atom.value === "5");
const subtractionTwo = findProjectionAtom(additionFinalRow, (atom) => atom.role === "content" && atom.value === "2");

assert.ok(subtractionOperator);
assert.ok(subtractionFive);
assert.ok(subtractionTwo);
assert.ok(subtractionFive.col < subtractionOperator.col && subtractionOperator.col < subtractionTwo.col);

const cosineProjectionResult = await runGenesisRuntime("a^2+b^2-2ab*cos(gamma)=c^2", {
    targetVariable: "gamma"
});
const cosineSecondRow = cosineProjectionResult.phases.projection.projectionRows[1];
const cosineInitialRow = cosineProjectionResult.phases.projection.projectionRows[0];
const cosineRightC = findProjectionAtom(cosineSecondRow, (atom) => atom.side === "right" && atom.role === "content" && atom.value === "c");
const cosineRightA = findProjectionAtom(cosineSecondRow, (atom) => atom.side === "right" && atom.role === "content" && atom.value === "a");
const cosineRightSubtraction = findProjectionAtom(cosineSecondRow, (atom) => atom.side === "right" && atom.role === "subtraction_operator");
const cosineFinalRow = cosineProjectionResult.phases.projection.projectionRows.at(-1);
const cosineInitialGamma = findProjectionAtom(cosineInitialRow, (atom) => atom.side === "left" && atom.role === "content" && atom.value === "gamma");
const cosineFinalGamma = findProjectionAtom(cosineFinalRow, (atom) => atom.side === "left" && atom.role === "content" && atom.value === "gamma");
const cosineInitialRightC = findProjectionAtom(cosineInitialRow, (atom) => atom.side === "right" && atom.role === "content" && atom.value === "c");
const cosineFinalRightC = findProjectionAtom(cosineFinalRow, (atom) => atom.side === "right" && atom.role === "content" && atom.value === "c");
const cosineFinalAcosName = findProjectionAtom(cosineFinalRow, (atom) => atom.side === "right" && atom.role === "function_name" && atom.value === "acos");
const cosineFinalAcosLeft = findProjectionAtom(cosineFinalRow, (atom) => atom.side === "right" && atom.role === "function_left_paren");
const cosineFinalRightFractionLine = findProjectionAtom(cosineFinalRow, (atom) => atom.side === "right" && atom.role === "fraction_line");
const cosineLayoutPlan = cosineProjectionResult.phases.projection.outputContract.layoutPlan;

assert.ok(cosineRightC);
assert.ok(cosineRightA);
assert.ok(cosineRightSubtraction);
assert.ok(
    cosineRightC.col < cosineRightSubtraction.col && cosineRightSubtraction.col < cosineRightA.col,
    "Im Kosinussatz muss das erzeugte Minus rechts zwischen c^2 und a^2 stehen und darf keinen Operand ueberdecken."
);
assert.ok(cosineInitialGamma);
assert.ok(cosineFinalGamma);
assert.equal(
    cosineInitialGamma.col,
    cosineFinalGamma.col,
    "Die Zielvariable gamma muss auch ueber den inversen Trigonometrie-Schritt hinweg ihre Spalte behalten."
);
assert.ok(cosineInitialRightC);
assert.ok(cosineFinalRightC);
assert.equal(
    cosineInitialRightC.col,
    cosineFinalRightC.col,
    "Bereits stehender rechter Inhalt darf bei spaeterem Aufbau von acos(...) nicht nachtraeglich verschoben werden."
);
assert.ok(cosineFinalAcosName);
assert.ok(cosineFinalAcosLeft);
assert.ok(cosineFinalRightFractionLine);
assert.ok(
    cosineFinalAcosName.col < cosineFinalAcosLeft.col
        && cosineFinalAcosLeft.col < cosineFinalRightFractionLine.colStart,
    "Die inverse Funktionshuelle muss links vor dem bestehenden rechten Bruchinhalt in reservierten Huelle-Spalten entstehen."
);
assert.ok(
    cosineLayoutPlan?.rightBands?.hullBoundsRaw?.minRawCol < cosineLayoutPlan?.rightBands?.contentBoundsRaw?.minRawCol,
    "Der Output-Contract muss auf der rechten Seite explizit zeigen, dass das Huelleband weiter links beginnt als das reine Inhaltsband."
);

const cosineFractionRow = cosineProjectionResult.phases.projection.projectionRows[3];
const cosineFractionLine = findProjectionAtom(
    cosineFractionRow,
    (atom) => atom.side === "right" && atom.role === "fraction_line"
);
const cosineFractionNegationSign = findProjectionAtom(
    cosineFractionRow,
    (atom) => atom.side === "right" && atom.role === "negation_sign"
);
const cosineFractionNumeratorCols = cosineFractionRow.projectionAtoms
    .filter((atom) => atom.side === "right" && atom.kind === "content" && atom.localRow < cosineFractionLine.localRow)
    .map((atom) => atom.col);
const cosineFractionDenominatorCols = cosineFractionRow.projectionAtoms
    .filter((atom) => atom.side === "right" && atom.kind === "content" && atom.localRow > cosineFractionLine.localRow)
    .map((atom) => atom.col);
const cosineFractionDenominatorOperandCols = cosineFractionRow.projectionAtoms
    .filter((atom) => atom.side === "right" && atom.role === "content" && atom.localRow > cosineFractionLine.localRow)
    .map((atom) => atom.col);
const cosineDivisionSpan = cosineFractionRow.shellSpans.find((shell) => (
    shell.side === "right" && shell.shellType === "DIVISION"
));
const cosineNumeratorRange = cosineDivisionSpan?.collectionRanges?.numerator;
const cosineDenominatorRange = cosineDivisionSpan?.collectionRanges?.denominator;
const cosineNumeratorAlignmentRange = cosineDivisionSpan?.collectionAlignmentRanges?.numerator;
const cosineDenominatorAlignmentRange = cosineDivisionSpan?.collectionAlignmentRanges?.denominator;

assert.ok(cosineDivisionSpan && cosineNumeratorRange && cosineDenominatorRange);
assert.deepEqual(
    [cosineNumeratorAlignmentRange?.colStart, cosineNumeratorAlignmentRange?.colEnd],
    [cosineDenominatorAlignmentRange?.colStart, cosineDenominatorAlignmentRange?.colEnd],
    "Zaehler und Nenner muessen dasselbe explizite funktionale Ausrichtungsband besitzen."
);
assert.deepEqual(
    [cosineFractionLine.colStart, cosineFractionLine.colEnd],
    [cosineNumeratorAlignmentRange.colStart, cosineNumeratorAlignmentRange.colEnd],
    "Der Bruchstrich muss exakt dem gemeinsamen Ausrichtungsband entsprechen."
);
assert.ok(
    Math.abs(
        ((cosineDenominatorRange.colStart + cosineDenominatorRange.colEnd) / 2)
        - ((cosineNumeratorRange.colStart + cosineNumeratorRange.colEnd) / 2)
    ) <= 0.5,
    "Bei verschiedener Breitenparitaet darf die diskrete Kindbelegung hoechstens eine halbe Rastereinheit von der gemeinsamen Achse abweichen."
);
assert.ok(cosineFractionNegationSign);
assert.ok(cosineFractionLine);
assert.ok(
    cosineFractionNegationSign.col < Math.min(...cosineFractionDenominatorOperandCols),
    "Ein negatives Nenner-Vorzeichen muss als Praefix links vor der ersten geteilten Inhalts-Spalte stehen."
);
assert.ok(
    cosineFractionLine.colStart <= cosineFractionNegationSign.col,
    "Der vollstaendige negative Nenner muss innerhalb der funktionalen Bruchspanne liegen."
);

const groupedAdditionProjectionResult = await runGenesisRuntime("(x+1)=5", {
    targetVariable: "x"
});
assert.equal(groupedAdditionProjectionResult.phases.projection.theoryRows.length, 3);
const groupedAdditionIntermediateRow = groupedAdditionProjectionResult.phases.projection.projectionRows[1];
const groupedAdditionFinalRow = groupedAdditionProjectionResult.phases.projection.projectionRows[2];
const groupedIntermediateX = findProjectionAtom(groupedAdditionIntermediateRow, (atom) => atom.role === "content" && atom.value === "x");
const groupedFinalX = findProjectionAtom(groupedAdditionFinalRow, (atom) => atom.role === "content" && atom.value === "x");
const groupedFinalSubtraction = findProjectionAtom(groupedAdditionFinalRow, (atom) => atom.role === "subtraction_operator");

assert.ok(groupedIntermediateX);
assert.ok(groupedFinalX);
assert.ok(groupedFinalSubtraction);
assert.equal(groupedIntermediateX.col, groupedFinalX.col, "Die Zielvariable muss ueber die Mehrschrittkette ihre Spur behalten.");

const denominatorReleaseProjectionResult = await runGenesisRuntime("2/x=5", {
    targetVariable: "x"
});
assert.equal(denominatorReleaseProjectionResult.phases.projection.theoryRows.length, 3);
const denominatorIntermediateRow = denominatorReleaseProjectionResult.phases.projection.projectionRows[1];
const denominatorFinalRow = denominatorReleaseProjectionResult.phases.projection.projectionRows[2];
const multiplicationOperator = findProjectionAtom(denominatorIntermediateRow, (atom) => atom.role === "multiplication_operator");
const multiplicationFive = findProjectionAtom(denominatorIntermediateRow, (atom) => atom.role === "content" && atom.value === "5");
const multiplicationX = findProjectionAtom(denominatorIntermediateRow, (atom) => atom.role === "content" && atom.value === "x");
const denominatorFinalX = findProjectionAtom(denominatorFinalRow, (atom) => atom.role === "content" && atom.value === "x");
const denominatorFinalDivisionLine = findProjectionAtom(denominatorFinalRow, (atom) => atom.role === "fraction_line");

assert.ok(multiplicationOperator);
assert.ok(multiplicationFive);
assert.ok(multiplicationX);
assert.ok(multiplicationFive.col < multiplicationOperator.col && multiplicationOperator.col < multiplicationX.col);
assert.ok(denominatorFinalX);
assert.ok(denominatorFinalDivisionLine);

const sineLawProjectionResult = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "beta"
});
assert.equal(sineLawProjectionResult.phases.projection.theoryRows.length, 4);
const sineLawIntermediateRow = sineLawProjectionResult.phases.projection.projectionRows[1];
const sineLawLeftFactor = findProjectionAtom(
    sineLawIntermediateRow,
    (atom) => atom.side === "left" && atom.role === "function_name" && atom.value === "sin" && atom.sourceNodeId?.includes("0002")
);
const sineLawOperator = findProjectionAtom(
    sineLawIntermediateRow,
    (atom) => atom.side === "left" && atom.role === "multiplication_operator"
);
const sineLawFractionLine = findProjectionAtom(
    sineLawIntermediateRow,
    (atom) => atom.side === "left" && atom.role === "fraction_line"
);
const sineLawNumerator = findProjectionAtom(
    sineLawIntermediateRow,
    (atom) => atom.side === "left" && atom.role === "content" && atom.value === "a"
);

assert.ok(sineLawLeftFactor);
assert.ok(sineLawOperator);
assert.ok(sineLawFractionLine);
assert.ok(sineLawNumerator);
assert.ok(
    sineLawLeftFactor.col < sineLawOperator.col && sineLawOperator.col < sineLawFractionLine.colStart,
    "Beim Sinussatz muss der von rechts kommende Faktor links vor dem bestehenden Bruch angebaut werden."
);
assert.ok(
    sineLawOperator.col < sineLawNumerator.col,
    "Der Multiplikationsoperator muss links vor dem uebernommenen Zaehler liegen."
);

const sineLawAlphaProjectionResult = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "alpha"
});
assert.equal(sineLawAlphaProjectionResult.phases.projection.theoryRows.length, 4);
const sineLawAlphaInitialRow = sineLawAlphaProjectionResult.phases.projection.projectionRows[0];
const sineLawAlphaIntermediateRow = sineLawAlphaProjectionResult.phases.projection.projectionRows[1];
const sineLawAlphaDivisionRow = sineLawAlphaProjectionResult.phases.projection.projectionRows[2];
const sineLawAlphaFinalRow = sineLawAlphaProjectionResult.phases.projection.projectionRows[3];
const sineLawAlphaInitialLeftFraction = findProjectionAtom(
    sineLawAlphaInitialRow,
    (atom) => atom.side === "left" && atom.role === "fraction_line"
);
const sineLawAlphaRightFraction = findProjectionAtom(
    sineLawAlphaIntermediateRow,
    (atom) => atom.side === "right" && atom.role === "fraction_line"
);
const sineLawAlphaRightOperator = findProjectionAtom(
    sineLawAlphaIntermediateRow,
    (atom) => atom.side === "right" && atom.role === "multiplication_operator"
);
const sineLawAlphaRightFactor = findProjectionAtom(
    sineLawAlphaIntermediateRow,
    (atom) => atom.side === "right" && atom.role === "function_name" && atom.value === "sin" && atom.sourceNodeId?.includes("0001")
);
const sineLawAlphaReciprocalFraction = findProjectionAtom(
    sineLawAlphaDivisionRow,
    (atom) => atom.side === "left"
        && atom.role === "fraction_line"
        && atom.sourceNodeId?.includes("reciprocal_division")
);
const sineLawAlphaReciprocalNumerator = findProjectionAtom(
    sineLawAlphaDivisionRow,
    (atom) => atom.side === "left" && atom.role === "function_name" && atom.value === "sin"
);
const sineLawAlphaReciprocalDenominator = findProjectionAtom(
    sineLawAlphaDivisionRow,
    (atom) => atom.side === "left" && atom.role === "content" && atom.value === "b"
);
const sineLawAlphaFinalReciprocalFraction = findProjectionAtom(
    sineLawAlphaFinalRow,
    (atom) => atom.side === "left"
        && atom.role === "fraction_line"
        && atom.sourceNodeId === sineLawAlphaReciprocalFraction?.sourceNodeId
);
const sineLawAlphaInitialLeftFractionShell = (sineLawAlphaInitialRow.shellSpans || []).find(
    (shell) => shell.shellId === sineLawAlphaInitialLeftFraction?.sourceNodeId
);
const sineLawAlphaInitialRightFractionShell = (sineLawAlphaInitialRow.shellSpans || []).find(
    (shell) => shell.shellId === sineLawAlphaRightFraction?.sourceNodeId
);
const sineLawAlphaInitialRightFunctionShell = (sineLawAlphaInitialRow.shellSpans || []).find(
    (shell) => shell.shellId === "shell-function-o-g9dfgr-0002"
);
const sineLawAlphaInitialLeftNumerator = findProjectionAtom(
    sineLawAlphaInitialRow,
    (atom) => atom.side === "left" && atom.role === "content" && atom.value === "a"
);
const sineLawAlphaInitialLeftDenominatorTarget = findProjectionAtom(
    sineLawAlphaInitialRow,
    (atom) => atom.side === "left" && atom.role === "content" && atom.value === "alpha"
);
const sineLawAlphaInitialLeftFunctionName = findProjectionAtom(
    sineLawAlphaInitialRow,
    (atom) => atom.side === "left" && atom.role === "function_name" && atom.value === "sin"
);
const sineLawAlphaInitialLeftFunctionLeft = findProjectionAtom(
    sineLawAlphaInitialRow,
    (atom) => atom.side === "left" && atom.role === "function_left_paren" && atom.value === "("
);
const sineLawAlphaInitialLeftFunctionRight = findProjectionAtom(
    sineLawAlphaInitialRow,
    (atom) => atom.side === "left" && atom.role === "function_right_paren" && atom.value === ")"
);
const sineLawAlphaInitialLeftFunctionShell = (sineLawAlphaInitialRow.shellSpans || []).find(
    (shell) => shell.shellId === "shell-function-o-g9dfgr-0001"
);
const sineLawAlphaReciprocalFractionShell = (sineLawAlphaDivisionRow.shellSpans || []).find(
    (shell) => shell.shellId === sineLawAlphaReciprocalFraction?.sourceNodeId
);
const sineLawAlphaFinalReciprocalFractionShell = (sineLawAlphaFinalRow.shellSpans || []).find(
    (shell) => shell.shellId === sineLawAlphaFinalReciprocalFraction?.sourceNodeId
);
const sineLawAlphaFinalNestedFunctionShell = (sineLawAlphaFinalRow.shellSpans || []).find(
    (shell) => shell.shellId === "shell-function-o-g9dfgr-0002"
);

assert.ok(sineLawAlphaInitialLeftFraction);
assert.ok(sineLawAlphaInitialLeftNumerator);
assert.ok(sineLawAlphaInitialLeftDenominatorTarget);
assert.ok(sineLawAlphaInitialLeftFunctionName);
assert.ok(sineLawAlphaInitialLeftFunctionLeft);
assert.ok(sineLawAlphaInitialLeftFunctionRight);
assert.ok(sineLawAlphaInitialLeftFunctionShell);
assert.ok(sineLawAlphaRightFraction);
assert.ok(sineLawAlphaRightOperator);
assert.ok(sineLawAlphaRightFactor);
assert.ok(
    sineLawAlphaRightFraction.colEnd < sineLawAlphaRightOperator.col
        && sineLawAlphaRightOperator.col < sineLawAlphaRightFactor.col,
    "Beim Alpha-Sinussatz muss der rechte Multiplikationsfaktor hinter dem bestehenden Bruch eine eigene reservierte Spalte erhalten."
);
assert.ok(sineLawAlphaReciprocalFraction);
assert.ok(sineLawAlphaReciprocalNumerator);
assert.ok(sineLawAlphaReciprocalDenominator);
assert.ok(sineLawAlphaFinalReciprocalFraction);
assert.ok(sineLawAlphaInitialLeftFractionShell);
assert.ok(sineLawAlphaInitialRightFractionShell);
assert.ok(sineLawAlphaInitialRightFunctionShell);
assert.ok(sineLawAlphaReciprocalFractionShell);
assert.ok(sineLawAlphaFinalReciprocalFractionShell);
assert.ok(sineLawAlphaFinalNestedFunctionShell);
const sineLawAlphaInitialLeftFunctionAxis = (
    sineLawAlphaInitialLeftFunctionShell.alignmentColStart
    + sineLawAlphaInitialLeftFunctionShell.alignmentColEnd
) / 2;
assert.equal(
    sineLawAlphaInitialLeftNumerator.col,
    Math.ceil(sineLawAlphaInitialLeftFunctionAxis),
    "Bei einer Mittelachse zwischen zwei Rasterzellen muss der Zaehler deterministisch die rechte Mittelzelle verwenden."
);
assert.notEqual(
    sineLawAlphaInitialLeftDenominatorTarget.localRow,
    sineLawAlphaInitialLeftNumerator.localRow,
    "Zaehler und innerer Nennerinhalt bleiben auch bei derselben funktionalen Spalte durch ihre Teilzeilen getrennt."
);
assert.ok(
    sineLawAlphaInitialLeftFunctionName.col < sineLawAlphaInitialLeftFunctionLeft.col
        && sineLawAlphaInitialLeftFunctionLeft.col < sineLawAlphaInitialLeftDenominatorTarget.col
        && sineLawAlphaInitialLeftDenominatorTarget.col < sineLawAlphaInitialLeftFunctionRight.col,
    "Die Funktionshuelle muss den geteilten Nennerinhalt nur umschliessen und darf keine neue zentrale Inhalts-Spur erzwingen."
);
assert.ok(
    sineLawAlphaReciprocalNumerator.localRow < sineLawAlphaReciprocalFraction.localRow
        && sineLawAlphaReciprocalFraction.localRow < sineLawAlphaReciprocalDenominator.localRow,
    "Der neue Kehrwertbruch muss Zaehler, Bruchachse und Nenner in dieser Reihenfolge anordnen."
);
assert.equal(
    sineLawAlphaDivisionRow.projectionAtoms.filter((atom) => atom.side === "left" && atom.role === "fraction_line").length,
    1,
    "Der neue Kehrwert ist genau eine semantische Bruchschale und darf keine alte Bruchgeometrie mitschleppen."
);

const sineLawAlphaLegacyExportResult = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "alpha"
});
const sineLawAlphaLegacyInitialRow = sineLawAlphaLegacyExportResult.exportData.projectionRows[0]?.positionedAtoms || [];
const sineLawAlphaLegacyFinalRow = sineLawAlphaLegacyExportResult.exportData.projectionRows.at(-1)?.positionedAtoms || [];
const sineLawAlphaLegacyExplicitStartFunctionContainer = sineLawAlphaLegacyInitialRow.find((atom) => (
    atom?.projectionRole === "function"
    && atom?.sourceAtomId === "shell-function-o-g9dfgr-0001"
));
const sineLawAlphaLegacyPassiveStartFunctionContainer = sineLawAlphaLegacyInitialRow.find((atom) => (
    atom?.projectionRole === "function"
    && atom?.sourceAtomId === "shell-function-o-g9dfgr-0002"
));
const sineLawAlphaLegacyFinalInverseFunctionContainer = sineLawAlphaLegacyFinalRow.find((atom) => (
    atom?.projectionRole === "function"
    && atom?.sourceAtomId === "generated-trig_inverse-function-from-shell-function-o-g9dfgr-0001"
));
const sineLawAlphaLegacyFinalInverseFunctionName = sineLawAlphaLegacyFinalRow.find((atom) => (
    atom?.projectionRole === "function_name"
    && atom?.value === "asin"
));

assert.equal(
    sineLawAlphaLegacyExplicitStartFunctionContainer,
    undefined,
    "Der Legacy-Export darf fuer eine explizit projizierte sin(alpha)-Schale keinen zweiten geschlossenen Funktionscontainer erfinden."
);
assert.equal(
    sineLawAlphaLegacyPassiveStartFunctionContainer,
    undefined,
    "Auch passive Funktionsschalen duerfen im Legacy-Export nicht als geschlossener Gesamtcontainer auftauchen."
);
assert.equal(
    sineLawAlphaLegacyFinalInverseFunctionContainer,
    undefined,
    "Auch die explizit aufgebaute inverse Funktionshuelle darf im Legacy-Export nicht zusaetzlich als geschlossener Container auftauchen."
);
assert.ok(
    sineLawAlphaLegacyFinalInverseFunctionName,
    "Der Legacy-Export muss die inverse Funktionshuelle stattdessen ueber Name und Klammern explizit tragen."
);
assert.ok(
    sineLawAlphaLegacyInitialRow.some((atom) => atom?.projectionRole === "function_name" && atom?.value === "sin" && atom?.sourceShellId === "shell-function-o-g9dfgr-0002"),
    "Die passive sin(beta)-Schale muss im Legacy-Export stattdessen explizit ueber ihren Funktionsnamen sichtbar bleiben."
);
assert.ok(
    sineLawAlphaLegacyInitialRow.some((atom) => (
        (atom?.projectionRole === "content" || atom?.projectionRole === "function_argument")
        && atom?.value === "beta"
        && atom?.sourceShellId === "shell-function-o-g9dfgr-0002"
    )),
    "Auch beta muss im Legacy-Export als sichtbares Argument seiner weitergereichten Funktionsschale erhalten bleiben."
);
assert.equal(
    sineLawAlphaFinalReciprocalFraction.colStart,
    sineLawAlphaReciprocalFraction.colStart,
    "Der neue Kehrwertbruch muss seine linke Kernkante in die Folgezeile durchreichen."
);
assert.equal(
    sineLawAlphaFinalReciprocalFraction.colEnd,
    sineLawAlphaReciprocalFraction.colEnd,
    "Der neue Kehrwertbruch muss seine rechte Kernkante in die Folgezeile durchreichen."
);
assert.equal(
    sineLawAlphaFinalReciprocalFractionShell.geometryBirthRowId,
    sineLawAlphaReciprocalFractionShell.geometryBirthRowId,
    "Dieselbe neue Bruchschale muss ihren Geburtszeitpunkt in der Folgezeile behalten."
);
assert.equal(
    sineLawAlphaFinalReciprocalFractionShell.alignmentColStart,
    sineLawAlphaReciprocalFractionShell.alignmentColStart,
    "Das Ausrichtungsband der neuen Bruchschale muss in der Folgezeile stabil bleiben."
);
assert.equal(
    sineLawAlphaFinalReciprocalFractionShell.alignmentColEnd,
    sineLawAlphaReciprocalFractionShell.alignmentColEnd,
    "Auch die rechte Kante ihres Ausrichtungsbands muss stabil bleiben."
);
assert.equal(
    sineLawAlphaFinalNestedFunctionShell.alignmentColStart,
    sineLawAlphaFinalNestedFunctionShell.colStart,
    "Eine weitergereichte passive Funktionsschale muss ihre sichtbare Huelle als Transportband behalten."
);
assert.equal(
    sineLawAlphaFinalNestedFunctionShell.alignmentColEnd,
    sineLawAlphaFinalNestedFunctionShell.colEnd,
    "Auch die rechte Kante des Transportbands der passiven Funktionsschale muss die sichtbare Huelle tragen."
);
assert.equal(
    sineLawAlphaInitialRightFunctionShell.colEnd - sineLawAlphaInitialRightFunctionShell.colStart,
    sineLawAlphaFinalNestedFunctionShell.colEnd - sineLawAlphaFinalNestedFunctionShell.colStart,
    "Wenn eine geschlossene Funktionsschale die Seite wechselt, muss ihre Huellenbreite erhalten bleiben."
);

const divisionInputPhase = await runInputPhase({
    request: {
        equation: "2/3=1"
    }
});
const divisionProjection = await runProjectionPhase({
    request: {
        equation: "2/3=1",
        requestedTargetVariable: null
    },
    inputPhase: divisionInputPhase,
    transformationPhase: {
        phaseId: "P3_Transformation",
        appliedDecision: null,
        initialStructure: divisionInputPhase.structure,
        nextStructure: divisionInputPhase.structure,
        history: []
    }
});
const divisionRow = divisionProjection.projectionRows[0];
const numerator = findProjectionAtom(divisionRow, (atom) => atom.role === "content" && atom.value === "2");
const denominator = findProjectionAtom(divisionRow, (atom) => atom.role === "content" && atom.value === "3");
const fractionLine = findProjectionAtom(divisionRow, (atom) => atom.role === "fraction_line");
const divisionAnchor = findProjectionAtom(divisionRow, (atom) => atom.role === "equation_anchor");

assert.ok(numerator);
assert.ok(denominator);
assert.ok(fractionLine);
assert.ok(divisionAnchor);
assert.ok(numerator.localRow < fractionLine.localRow, "Der Zaehler muss oberhalb des Bruchstrichs liegen.");
assert.ok(denominator.localRow > fractionLine.localRow, "Der Nenner muss unterhalb des Bruchstrichs liegen.");
assert.equal(fractionLine.localRow, divisionAnchor.localRow, "Bruchachse und Gleichheitszeichen muessen auf derselben Blockzeile liegen.");
assert.ok(fractionLine.colStart <= numerator.col && numerator.col <= fractionLine.colEnd);
assert.ok(fractionLine.colStart <= denominator.col && denominator.col <= fractionLine.colEnd);

console.log("GenesisRuntime-P4-Projektion erfolgreich geprueft.");
