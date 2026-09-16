import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { normalizeSolveOptions } from "../../core/solveOptions.js";

function isIntegerOrNull(value) {
    return value === null || Number.isInteger(value);
}

function fractionWidth(shellSpan = null) {
    if (!shellSpan) {
        return null;
    }

    return shellSpan.colEnd - shellSpan.colStart;
}

const result = await GenesisCore.solve(
    "a/sin(alpha)=b/sin(beta)",
    normalizeSolveOptions({
        targetVariable: "alpha",
        runtimeEngine: "genesis_runtime"
    })
);

assert.ok(!result?.fehler, result?.fehler || "Der Startbruch-Vertrag darf fuer den Sinussatz nicht fehlschlagen.");

const startRow = result?.exportData?.outputContract?.projectionRows?.[0];
const secondRow = result?.exportData?.outputContract?.projectionRows?.[1];
assert.ok(startRow, "Der Vertragstest braucht die erste Projektionszeile.");
assert.ok(secondRow, "Der Vertragstest braucht auch die direkte Folgezeile.");

const leftDivision = startRow.shellSpans.find((shellSpan) => (
    shellSpan?.shellType === "DIVISION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === null
));
const rightDivision = startRow.shellSpans.find((shellSpan) => (
    shellSpan?.shellType === "DIVISION"
    && shellSpan?.side === "right"
    && shellSpan?.parentShellId === null
));
const leftFunction = startRow.shellSpans.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === leftDivision?.shellId
));
const rightFunction = startRow.shellSpans.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "right"
    && shellSpan?.parentShellId === rightDivision?.shellId
));

assert.ok(leftDivision && rightDivision && leftFunction && rightFunction, "Beide Startbrueche und ihre Funktionsnenner muessen explizit vorhanden sein.");

const startAtoms = startRow.projectionAtoms.filter((atom) => atom.side !== "anchor");
assert.ok(
    startAtoms.every((atom) => (
        isIntegerOrNull(atom.rawCol)
        && isIntegerOrNull(atom.rawColStart)
        && isIntegerOrNull(atom.rawColEnd)
        && isIntegerOrNull(atom.col)
        && isIntegerOrNull(atom.colStart)
        && isIntegerOrNull(atom.colEnd)
    )),
    "Bei der Bruchgeburt duerfen keine Halbschritt-Spalten mehr entstehen."
);

assert.equal(
    fractionWidth(leftDivision),
    fractionWidth(rightDivision),
    "Linker und rechter Startbruch muessen dieselbe Bruchbreite besitzen."
);
assert.equal(
    leftDivision.colStart,
    leftFunction.colStart,
    "Der linke Bruchstrich muss exakt das Band des breiteren linken Nennerblocks uebernehmen."
);
assert.equal(
    leftDivision.colEnd,
    leftFunction.colEnd,
    "Auch die rechte Grenze des linken Bruchbands muss aus dem Nennerblock stammen."
);
assert.equal(
    rightDivision.colStart,
    rightFunction.colStart,
    "Der rechte Bruchstrich muss exakt das Band des breiteren rechten Nennerblocks uebernehmen."
);
assert.equal(
    rightDivision.colEnd,
    rightFunction.colEnd,
    "Auch die rechte Grenze des rechten Bruchbands muss aus dem Nennerblock stammen."
);

const leftNumerator = startRow.projectionAtoms.find((atom) => atom.side === "left" && atom.value === "a" && atom.localRow === 0);
const leftDenominatorContent = startRow.projectionAtoms.find((atom) => atom.side === "left" && atom.value === "alpha" && atom.localRow === 2);
const rightNumerator = startRow.projectionAtoms.find((atom) => atom.side === "right" && atom.value === "b" && atom.localRow === 0);
const rightDenominatorContent = startRow.projectionAtoms.find((atom) => atom.side === "right" && atom.value === "beta" && atom.localRow === 2);

assert.ok(leftNumerator && leftDenominatorContent && rightNumerator && rightDenominatorContent, "Zaehler und Nennerinhalte muessen im Startbruch sichtbar bleiben.");
assert.equal(
    leftNumerator.colStart,
    leftDenominatorContent.colStart,
    "Im linken Startbruch muss der Zaehler auf derselben Vertikalen landen wie der innere Nennerinhalt."
);
assert.equal(
    rightNumerator.colStart,
    rightDenominatorContent.colStart,
    "Im rechten Startbruch muss derselbe Vertikalvertrag gelten."
);

const transportedLeftCollection = secondRow.shellSpans.find((shellSpan) => (
    shellSpan?.shellType === "COLLECTION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === null
));
const transportedLeftAtom = secondRow.projectionAtoms.find((atom) => (
    atom?.side === "left"
    && atom?.value === "a"
    && atom?.kind === "content"
));

assert.ok(
    transportedLeftCollection,
    "Nach dem Nennerabbau muss der fruehere Zaehler links als geschlossene Transportschale bestehen bleiben."
);
assert.ok(transportedLeftAtom, "Die Folgezeile braucht weiterhin das sichtbare Zaehleratom.");
assert.equal(
    transportedLeftCollection.colStart,
    leftDivision.colStart,
    "Die Transportschale des Zaehlerbands muss dieselbe linke Bruchkante wie die Bruchgeburt behalten."
);
assert.equal(
    transportedLeftCollection.colEnd,
    leftDivision.colEnd,
    "Die Transportschale des Zaehlerbands muss dieselbe rechte Bruchkante wie die Bruchgeburt behalten."
);
assert.equal(
    transportedLeftAtom.colStart,
    leftNumerator.colStart,
    "Das weitergereichte Zaehleratom darf seine Vertikalspur beim Nennerabbau nicht verlieren."
);

console.log("Bruchgeburt-Vertrag erfolgreich geprueft.");
