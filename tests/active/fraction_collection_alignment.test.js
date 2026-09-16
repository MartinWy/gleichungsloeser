import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function findDivision(row, side) {
    return row.shellSpans.find((shell) => (
        shell.side === side
        && shell.shellType === "DIVISION"
    ));
}

function findFractionLine(row, division) {
    return row.projectionAtoms.find((atom) => (
        atom.kind === "shell_slot"
        && atom.role === "fraction_line"
        && atom.shellId === division.shellId
    ));
}

function assertCommonAlignmentBand(row, division) {
    const numeratorBand = division.collectionAlignmentRanges?.numerator;
    const denominatorBand = division.collectionAlignmentRanges?.denominator;
    const fractionLine = findFractionLine(row, division);

    assert.ok(numeratorBand, "Der Zaehler braucht ein explizites Ausrichtungsband.");
    assert.ok(denominatorBand, "Der Nenner braucht ein explizites Ausrichtungsband.");
    assert.deepEqual(
        [numeratorBand.colStart, numeratorBand.colEnd],
        [denominatorBand.colStart, denominatorBand.colEnd],
        "Zaehler und Nenner muessen dasselbe Bruchband erhalten."
    );
    assert.deepEqual(
        [fractionLine.colStart, fractionLine.colEnd],
        [numeratorBand.colStart, numeratorBand.colEnd],
        "Der Bruchstrich muss exakt das gemeinsame Ausrichtungsband belegen."
    );
}

function assertAtomicCellOnBandCenter(atom, alignmentBand, message) {
    const expectedCenterCol = Math.round(
        (alignmentBand.colStart + alignmentBand.colEnd) / 2
    );

    assert.deepEqual(
        [atom.colStart, atom.col, atom.colEnd],
        [alignmentBand.colStart, expectedCenterCol, alignmentBand.colEnd],
        message
    );
}

const longDenominatorResult = await runGenesisRuntime(
    "a/sin(alpha)=b/sin(beta)",
    { targetVariable: "a" }
);
const longDenominatorBirthRow = longDenominatorResult.phases.projection.projectionRows[0];

for (const [side, value] of [["left", "a"], ["right", "b"]]) {
    const division = findDivision(longDenominatorBirthRow, side);
    const singletonNumerator = longDenominatorBirthRow.projectionAtoms.find((atom) => (
        atom.side === side
        && atom.kind === "content"
        && atom.value === value
        && atom.parentShellId === division?.shellId
    ));

    assert.ok(division, `Der ${side}-Bruch muss vorhanden sein.`);
    assert.ok(singletonNumerator, `Der atomare Zaehler ${value} muss vorhanden sein.`);
    assertCommonAlignmentBand(longDenominatorBirthRow, division);
    assert.ok(
        division.collectionRanges.denominator.colEnd
            - division.collectionRanges.denominator.colStart
            > division.collectionRanges.numerator.colEnd
                - division.collectionRanges.numerator.colStart,
        "Der Testfall muss tatsaechlich einen breiteren Nenner besitzen."
    );
    assertAtomicCellOnBandCenter(
        singletonNumerator,
        division.collectionAlignmentRanges.numerator,
        "Ein kuerzerer atomarer Zaehler muss genau eine mittige Zelle mit den Bruchbandgrenzen erhalten."
    );
}

const transportedRightDivision = findDivision(
    longDenominatorResult.phases.projection.projectionRows[1],
    "right"
);
const transportedB = longDenominatorResult.phases.projection.projectionRows[1].projectionAtoms.find((atom) => (
    atom.side === "right"
    && atom.kind === "content"
    && atom.value === "b"
    && atom.parentShellId === transportedRightDivision?.shellId
));
assert.ok(transportedRightDivision && transportedB, "Der unveraenderte rechte Bruch muss transportiert werden.");
assertAtomicCellOnBandCenter(
    transportedB,
    transportedRightDivision.collectionAlignmentRanges.numerator,
    "Die bei der Bruchgeburt festgelegte mittige Atomzelle muss mit dem Bruch transportiert werden."
);

const longNumeratorResult = await runGenesisRuntime(
    "(p+q)/r=s",
    { targetVariable: "s" }
);
const longNumeratorBirthRow = longNumeratorResult.phases.projection.projectionRows[0];
const longNumeratorDivision = findDivision(longNumeratorBirthRow, "left");
const singletonDenominator = longNumeratorBirthRow.projectionAtoms.find((atom) => (
    atom.side === "left"
    && atom.kind === "content"
    && atom.value === "r"
    && atom.parentShellId === longNumeratorDivision?.shellId
));

assert.ok(longNumeratorDivision, "Der Bruch mit breiterem Zaehler muss vorhanden sein.");
assert.ok(singletonDenominator, "Der atomare Nenner muss vorhanden sein.");
assertCommonAlignmentBand(longNumeratorBirthRow, longNumeratorDivision);
assert.ok(
    longNumeratorDivision.collectionRanges.numerator.colEnd
        - longNumeratorDivision.collectionRanges.numerator.colStart
        > longNumeratorDivision.collectionRanges.denominator.colEnd
            - longNumeratorDivision.collectionRanges.denominator.colStart,
    "Der zweite Testfall muss tatsaechlich einen breiteren Zaehler besitzen."
);
assertAtomicCellOnBandCenter(
    singletonDenominator,
    longNumeratorDivision.collectionAlignmentRanges.denominator,
    "Ein kuerzerer atomarer Nenner muss genau eine mittige Zelle mit den Bruchbandgrenzen erhalten."
);

console.log("Allgemeiner Bruchband- und Kindzentrierungsvertrag erfolgreich geprueft.");
