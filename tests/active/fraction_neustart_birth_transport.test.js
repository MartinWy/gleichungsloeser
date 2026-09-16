import assert from "node:assert/strict";

import { buildLawOfSinesAlphaRows } from "../../core/GenesisRuntime/FractionNeustart/index.js";

const scene = buildLawOfSinesAlphaRows();
const birthRow = scene.rows[0];
const transportRow = scene.rows[1];
const nestedRow = scene.rows[2];
const wrapperRow = scene.rows[3];

assert.equal(scene.sceneId, "law_of_sines_alpha_birth_transport");
assert.ok(birthRow && transportRow && nestedRow && wrapperRow, "Der neue Bruchpfad braucht Geburt, Transport, Doppelbruch und Huelle.");

const leftBirth = birthRow.left.fraction;
const rightBirth = birthRow.right.fraction;

assert.equal(leftBirth.bandStart, 2);
assert.equal(leftBirth.bandEnd, 5);
assert.equal(leftBirth.line.colStart, 2);
assert.equal(leftBirth.line.colEnd, 5);

assert.equal(rightBirth.bandStart, 11);
assert.equal(rightBirth.bandEnd, 14);
assert.equal(rightBirth.line.colStart, 11);
assert.equal(rightBirth.line.colEnd, 14);

assert.equal(
    leftBirth.numeratorShell.bandStart,
    leftBirth.bandStart,
    "Die linke Zaehler-Schale muss schon bei der Geburt das volle Bruchband tragen."
);
assert.equal(
    leftBirth.numeratorShell.bandEnd,
    leftBirth.bandEnd,
    "Auch die rechte Kante der linken Zaehler-Schale muss aus der Bruchgeburt stammen."
);
assert.equal(
    leftBirth.numeratorShell.slots[0].col,
    4,
    "Das Atom a wird innerhalb des Viererbands rechtszentriert in der Mittellage gesetzt."
);

assert.deepEqual(
    leftBirth.denominatorShell.slots.map((slot) => slot.col),
    [2, 3, 4, 5],
    "Die geschlossene Nenner-Schale sin(alpha) belegt vier feste Slots."
);
assert.deepEqual(
    rightBirth.denominatorShell.slots.map((slot) => slot.col),
    [11, 12, 13, 14],
    "Dasselbe gilt rechts fuer sin(beta)."
);

const leftTransport = transportRow.left.shell;
const rightTransportFraction = transportRow.right.fraction;
const rightTransportFactor = transportRow.right.factorShell;

assert.equal(
    leftTransport.bandStart,
    leftBirth.bandStart,
    "Nach dem Nennerabbau bleibt die linke Zaehler-Schale auf derselben linken Kante."
);
assert.equal(
    leftTransport.bandEnd,
    leftBirth.bandEnd,
    "Nach dem Nennerabbau bleibt auch die rechte Kante der Zaehler-Schale erhalten."
);
assert.equal(
    leftTransport.slots[0].col,
    leftBirth.numeratorShell.slots[0].col,
    "Das Atom a behaelt beim Transport seine innere Spur."
);

assert.equal(
    rightTransportFraction.bandStart,
    rightBirth.bandStart,
    "Der rechte geschlossene Bruch behaelt beim Transport seine linke Kante."
);
assert.equal(
    rightTransportFraction.bandEnd,
    rightBirth.bandEnd,
    "Der rechte geschlossene Bruch behaelt beim Transport auch seine rechte Kante."
);
assert.equal(
    transportRow.right.multiplicationDotCol,
    15,
    "Der Malpunkt bekommt einen eigenen Slot direkt rechts neben dem geschlossenen Bruch."
);
assert.deepEqual(
    rightTransportFactor.slots.map((slot) => slot.col),
    [16, 17, 18, 19],
    "sin(alpha) bleibt auch als Faktor eine geschlossene Vierer-Schale."
);

const nestedFraction = nestedRow.left.fraction;
assert.equal(
    nestedFraction.line.colStart,
    nestedFraction.placedStart,
    "Der Hauptbruchstrich des Doppelbruchs beginnt exakt am Bruchband."
);
assert.equal(
    nestedFraction.line.colEnd,
    nestedFraction.placedEnd,
    "Der Hauptbruchstrich des Doppelbruchs endet exakt am Bruchband."
);
assert.equal(
    nestedFraction.denominatorShell.shellType,
    "DIVISION",
    "Der Nenner des Doppelbruchs bleibt selbst wieder eine geschlossene Bruch-Schale."
);
assert.equal(
    nestedFraction.denominatorShell.line.colStart,
    nestedFraction.placedStart,
    "Der Nebenbruch uebernimmt dieselbe Bandbreite wie seine geborene Vierer-Schale."
);
assert.equal(
    nestedFraction.denominatorShell.line.colEnd,
    nestedFraction.placedEnd,
    "Auch die rechte Kante des Nebenbruchs bleibt im geschlossenen Transport erhalten."
);

const asinWrapper = wrapperRow.left.wrapper;
assert.equal(
    asinWrapper.contentShell.shellType,
    "DIVISION",
    "Die asin-Huelle kapselt den Doppelbruch als geschlossene Inhaltsschale."
);
assert.equal(
    asinWrapper.contentShell.line.colStart,
    asinWrapper.contentShell.placedStart,
    "Auch innerhalb der asin-Huelle bleibt der Hauptbruch an seine eigene Bruchband-Breite gebunden."
);
assert.equal(
    asinWrapper.parenLeft.rowStart,
    0,
    "Die linke Klammer der Huelle spannt die gesamte Hoehe der gekapselten Bruchschale."
);
assert.equal(
    asinWrapper.parenLeft.rowEnd,
    wrapperRow.totalRows - 1,
    "Die Huelle endet erst auf der untersten Zeile des Doppelbruchs."
);

console.log("Fraction Neustart: Geburt, Transport und Doppelbruch erfolgreich geprueft.");
