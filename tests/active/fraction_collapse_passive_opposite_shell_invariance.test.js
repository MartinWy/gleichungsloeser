import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function findShell(row, predicate) {
    return (row?.shellSpans || []).find(predicate) || null;
}

function findAtom(row, predicate) {
    return (row?.projectionAtoms || []).find(predicate) || null;
}

const result = await runGenesisRuntime("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "a"
});

const birthRow = result.phases.projection.projectionRows[0];
const transportRow = result.phases.projection.projectionRows[1];

assert.ok(birthRow, "Die Geburtszeile des Nennerabbaus muss existieren.");
assert.ok(transportRow, "Die Transportzeile des Nennerabbaus muss existieren.");

const birthPassiveFraction = findShell(
    birthRow,
    (shell) => shell.side === "right" && shell.shellType === "DIVISION" && shell.parentShellId === null
);
const transportPassiveFraction = findShell(
    transportRow,
    (shell) => shell.side === "right" && shell.shellType === "DIVISION" && shell.shellId === birthPassiveFraction?.shellId
);
const birthPassiveFunction = findShell(
    birthRow,
    (shell) => shell.side === "right" && shell.shellType === "FUNCTION" && shell.parentShellId === birthPassiveFraction?.shellId
);
const transportPassiveFunction = findShell(
    transportRow,
    (shell) => shell.side === "right" && shell.shellType === "FUNCTION" && shell.shellId === birthPassiveFunction?.shellId
);
const generatedOppositeMultiplication = findShell(
    transportRow,
    (shell) => shell.side === "right" && shell.shellType === "MULTIPLICATION" && shell.parentShellId === null
);
const generatedFactorFunction = findShell(
    transportRow,
    (shell) => (
        shell.side === "right"
        && shell.shellType === "FUNCTION"
        && shell.parentShellId === generatedOppositeMultiplication?.shellId
    )
);

assert.ok(
    birthPassiveFraction,
    "Vor dem Nennerabbau muss rechts eine passive sichtbare Bruchschale existieren."
);
assert.ok(
    transportPassiveFraction,
    "Nach dem Nennerabbau muss dieselbe passive Bruchschale weiterexistieren."
);
assert.ok(
    birthPassiveFunction,
    "Die passive innere Funktionsschale sin(beta) muss in der Geburtszeile sichtbar sein."
);
assert.ok(
    transportPassiveFunction,
    "Die passive innere Funktionsschale sin(beta) muss auch in der Transportzeile weiterexistieren."
);
assert.ok(
    generatedOppositeMultiplication,
    "Die Gegenseite darf nur durch eine aeussere Multiplikationsschale erweitert werden."
);
assert.ok(generatedFactorFunction, "Die aeussere Multiplikation muss den neu angehaengten Faktor als eigene Schale fuehren.");

assert.equal(
    transportPassiveFraction.colStart,
    birthPassiveFraction.colStart,
    "Die passive Gegenseiten-Bruchschale darf beim Nennerabbau ihre linke Bandgrenze nicht verlieren."
);
assert.equal(
    transportPassiveFraction.colEnd,
    birthPassiveFraction.colEnd,
    "Die passive Gegenseiten-Bruchschale darf beim Nennerabbau auch rechts nicht verschoben werden."
);
assert.equal(
    transportPassiveFraction.alignmentColStart,
    birthPassiveFraction.alignmentColStart,
    "Auch die innere Ausrichtungsachse der passiven Bruchschale muss unveraendert bleiben."
);
assert.equal(
    transportPassiveFraction.alignmentColEnd,
    birthPassiveFraction.alignmentColEnd,
    "Das gilt ebenso fuer die rechte Ausrichtungsgrenze der passiven Bruchschale."
);

assert.equal(
    transportPassiveFunction.colStart,
    birthPassiveFunction.colStart,
    "Die passive Funktionsschale im Nenner darf beim Transport nicht neu links verankert werden."
);
assert.equal(
    transportPassiveFunction.colEnd,
    birthPassiveFunction.colEnd,
    "Die passive Funktionsschale im Nenner darf beim Transport auch rechts nicht verbreitert werden."
);
assert.equal(
    transportPassiveFunction.alignmentColStart,
    birthPassiveFunction.alignmentColStart,
    "Auch die innere Spur der passiven Funktionsschale muss unveraendert bleiben."
);
assert.equal(
    transportPassiveFunction.alignmentColEnd,
    birthPassiveFunction.alignmentColEnd,
    "Die passive Funktionsschale darf auch ihre rechte Spur nicht verlieren."
);

assert.equal(
    generatedOppositeMultiplication.collectionRanges?.factors?.colStart,
    birthPassiveFraction.colStart,
    "Die kanonische Faktorenfolge muss am unveraenderten passiven Bruch beginnen."
);
assert.equal(
    generatedOppositeMultiplication.collectionRanges?.factors?.colEnd,
    generatedFactorFunction.colEnd,
    "Die kanonische Faktorenfolge muss mit dem neu angehaengten Faktor enden."
);
assert.ok(
    generatedOppositeMultiplication.collectionRanges?.operators?.colStart > birthPassiveFraction.colEnd
        && generatedOppositeMultiplication.collectionRanges?.operators?.colEnd < generatedFactorFunction.colStart,
    "Der explizite Operatorslot muss zwischen bestehendem Bruch und neuem Faktor liegen."
);

const birthB = findAtom(
    birthRow,
    (atom) => atom.side === "right" && atom.value === "b"
);
const transportB = findAtom(
    transportRow,
    (atom) => atom.side === "right" && atom.value === "b"
);
const birthSin = findAtom(
    birthRow,
    (atom) => atom.side === "right" && atom.value === "sin"
);
const transportSin = findAtom(
    transportRow,
    (atom) => (
        atom.side === "right"
        && atom.value === "sin"
        && atom.sourceNodeId === birthSin?.sourceNodeId
    )
);
const birthBeta = findAtom(
    birthRow,
    (atom) => atom.side === "right" && atom.value === "beta"
);
const transportBeta = findAtom(
    transportRow,
    (atom) => (
        atom.side === "right"
        && atom.value === "beta"
        && atom.sourceNodeId === birthBeta?.sourceNodeId
    )
);

assert.ok(birthB && transportB, "Das passive Atom b muss in Geburts- und Transportzeile sichtbar sein.");
assert.ok(birthSin && transportSin, "Das passive Atom sin muss in Geburts- und Transportzeile sichtbar sein.");
assert.ok(birthBeta && transportBeta, "Das passive Atom beta muss in Geburts- und Transportzeile sichtbar sein.");

assert.equal(
    transportB.col,
    birthB.col,
    "Auch das passive Atom b darf beim Nennerabbau nicht horizontal driften."
);
assert.equal(
    transportSin.col,
    birthSin.col,
    "Das passive Atom sin darf beim Nennerabbau nicht horizontal driften."
);
assert.equal(
    transportBeta.col,
    birthBeta.col,
    "Das passive Atom beta darf beim Nennerabbau nicht horizontal driften."
);

console.log("Fraction collapse: passive Gegenseiten-Schalen bleiben als Band unveraendert.");
