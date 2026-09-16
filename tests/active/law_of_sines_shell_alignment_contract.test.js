import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { normalizeSolveOptions } from "../../core/solveOptions.js";

const result = await GenesisCore.solve(
    "a/sin(alpha)=b/sin(beta)",
    normalizeSolveOptions({
        targetVariable: "alpha",
        runtimeEngine: "genesis_runtime"
    })
);

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach alpha darf nicht fehlschlagen.");

const projectionRows = result?.exportData?.outputContract?.projectionRows || [];
const startRowShells = projectionRows[0]?.shellSpans || [];
const reciprocalBirthRowShells = projectionRows[2]?.shellSpans || [];
const finalRowShells = projectionRows.at(-1)?.shellSpans || [];

const startRightSinShell = startRowShells.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "right"
    && shellSpan?.parentShellId
));
const finalOuterInverseShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === null
));
const reciprocalBirthMultiplicationShell = reciprocalBirthRowShells.find((shellSpan) => (
    shellSpan?.shellType === "MULTIPLICATION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === null
));
const finalMultiplicationShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "MULTIPLICATION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === finalOuterInverseShell?.shellId
));
const reciprocalBirthFractionShell = reciprocalBirthRowShells.find((shellSpan) => (
    shellSpan?.shellType === "DIVISION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === reciprocalBirthMultiplicationShell?.shellId
));
const finalReciprocalFractionShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "DIVISION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === finalMultiplicationShell?.shellId
));
const reciprocalBirthPassiveSinShell = reciprocalBirthRowShells.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === reciprocalBirthFractionShell?.shellId
));
const finalPassiveSinShell = finalRowShells.find((shellSpan) => (
    shellSpan?.shellType === "FUNCTION"
    && shellSpan?.side === "left"
    && shellSpan?.parentShellId === finalReciprocalFractionShell?.shellId
));

assert.ok(startRightSinShell, "Die geschlossene rechte sin(beta)-Schale muss im Startschritt als ShellSpan exportiert werden.");
assert.equal(
    startRightSinShell.transportMode,
    "closed_visible_block",
    "Eine geschlossene sichtbare Schale muss ihren Transportmodus explizit exportieren."
);
assert.equal(
    startRightSinShell.alignmentColStart,
    startRightSinShell.colStart,
    "Eine passive geschlossene Funktionsschale muss ihre sichtbare Huelle als Transportband mitnehmen."
);
assert.equal(
    startRightSinShell.alignmentColEnd,
    startRightSinShell.colEnd,
    "Auch die rechte Kante des Transportbands einer passiven Funktionsschale muss zur sichtbaren Huelle gehoeren."
);

assert.ok(finalOuterInverseShell, "Die inverse Funktion asin(...) muss im letzten Schritt als eigene aeussere Shell vorhanden sein.");
assert.ok(reciprocalBirthMultiplicationShell, "Der Kehrbruch-Schritt muss zuerst als eigene Multiplikationsschale geboren werden.");
assert.ok(finalMultiplicationShell, "Die unter asin(...) geklammerte Multiplikationsschale muss im letzten Schritt erhalten bleiben.");
assert.ok(reciprocalBirthFractionShell, "Der Kehrbruch selbst muss in seiner Geburtszeile als eigene Bruchschale vorliegen.");
assert.ok(finalReciprocalFractionShell, "Der Kehrbruch muss auch unter asin(...) als eigene Bruchschale erhalten bleiben.");
assert.ok(reciprocalBirthPassiveSinShell, "Die passive sin(beta)-Schale muss im Kehrbruch als geschlossene Zaehler-Schale vorliegen.");
assert.ok(finalPassiveSinShell, "Die passive sin(beta)-Schale muss auch im letzten Schritt als geschlossene Zaehler-Schale erhalten bleiben.");
assert.ok(
    Array.isArray(finalReciprocalFractionShell.contentLeafIds) && finalReciprocalFractionShell.contentLeafIds.length > 0,
    "Ein geschlossener sichtbarer Kehrbruch muss auch im Endschritt seine Inhaltsatome weiter ausweisen."
);
assert.ok(
    Array.isArray(finalReciprocalFractionShell.collectionLeafIds?.denominator)
        && finalReciprocalFractionShell.collectionLeafIds.denominator.length > 0,
    "Auch die Nennerkollektion des geschlossenen Kehrbruchs muss atomar rueckverfolgbar bleiben."
);

assert.equal(
    finalOuterInverseShell.alignmentColStart,
    finalMultiplicationShell.alignmentColStart,
    "Die inverse Huelle darf ihre Ausrichtungsachse nicht von Funktionsname oder Klammern ableiten, sondern muss das innere Produktband uebernehmen."
);
assert.equal(
    finalOuterInverseShell.alignmentColEnd,
    finalMultiplicationShell.alignmentColEnd,
    "Auch das rechte Ende des Ausrichtungsbands von asin(...) muss exakt vom inneren Produktband geerbt werden."
);
assert.equal(
    reciprocalBirthFractionShell.colStart,
    finalReciprocalFractionShell.colStart,
    "Ein geborener Kehrbruch darf beim Uebergang unter die inverse Funktion nicht neu links verankert werden."
);
assert.equal(
    reciprocalBirthFractionShell.colEnd,
    finalReciprocalFractionShell.colEnd,
    "Ein geborener Kehrbruch darf beim Uebergang unter die inverse Funktion auch rechts nicht verbreitert werden."
);
assert.equal(
    reciprocalBirthFractionShell.alignmentColStart,
    finalReciprocalFractionShell.alignmentColStart,
    "Auch die innere Achse des Kehrbruchs darf unter asin(...) nicht neu berechnet werden."
);
assert.equal(
    reciprocalBirthFractionShell.alignmentColEnd,
    finalReciprocalFractionShell.alignmentColEnd,
    "Das gilt ebenso fuer die rechte Achsengrenze des Kehrbruchs."
);
const reciprocalBirthNumerator = reciprocalBirthRowShells.length > 0
    ? projectionRows[2].projectionAtoms.find((atom) => (
        atom.side === "left" && atom.kind === "content" && atom.value === "a"
    ))
    : null;
const finalTransportedNumerator = projectionRows.at(-1).projectionAtoms.find((atom) => (
    atom.side === "left"
    && atom.kind === "content"
    && atom.sourceNodeId === reciprocalBirthNumerator?.sourceNodeId
));
const singletonNumeratorCollections = [
    ...reciprocalBirthRowShells,
    ...finalRowShells
].filter((shellSpan) => (
    shellSpan?.shellType === "COLLECTION"
    && shellSpan?.side === "left"
    && shellSpan?.contentLeafIds?.length === 1
    && shellSpan.contentLeafIds[0] === reciprocalBirthNumerator?.sourceNodeId
));

assert.ok(reciprocalBirthNumerator, "Der atomare Zaehler a muss in der Kehrbruch-Geburtszeile sichtbar sein.");
assert.ok(finalTransportedNumerator, "Der atomare Zaehler a muss auch unter asin(...) sichtbar bleiben.");
assert.equal(
    finalTransportedNumerator.col,
    reciprocalBirthNumerator.col,
    "Der atomare Zaehler muss unter der spaeteren Aussenschale seine P4-Geburtsspur behalten."
);
assert.equal(
    singletonNumeratorCollections.length,
    0,
    "P4 darf fuer den atomaren Zaehler keine kuenstliche COLLECTION verlangen."
);
assert.equal(
    reciprocalBirthPassiveSinShell.colStart,
    finalPassiveSinShell.colStart,
    "Die passive sin(beta)-Schale muss vom Kehrbruch-Schritt bis zum Endschritt dieselbe linke Bandgrenze behalten."
);
assert.equal(
    reciprocalBirthPassiveSinShell.colEnd,
    finalPassiveSinShell.colEnd,
    "Die passive sin(beta)-Schale muss vom Kehrbruch-Schritt bis zum Endschritt auch dieselbe rechte Bandgrenze behalten."
);

console.log("Sinussatz-Shell-Ausrichtungsvertrag erfolgreich geprueft.");
