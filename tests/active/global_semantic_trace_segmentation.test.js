import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function findPlacement(row, side, predicate, message) {
    const placement = (row?.placements?.[side] || []).find(predicate);
    assert.ok(placement, message);
    return placement;
}

function findBlueprint(projection, predicate, message) {
    const blueprint = (
        projection?.semanticRaster?.cellProfile?.localizedShellBlueprints
        || []
    ).find(predicate);
    assert.ok(blueprint, message);
    return blueprint;
}

const result = await runGenesisRuntime(
    "(a-2)/(b+4)=d*e^(x^2+5)",
    { targetVariable: "b" }
);
const projection = result.phases.projection;
const rasterRows = projection.semanticRaster.rows;
const birthRow = rasterRows[0];
const finalRow = rasterRows.at(-1);
const initialFour = findPlacement(
    birthRow,
    "left",
    (placement) => placement.value === "4",
    "Im anfaenglichen Nenner muss die 4 vorhanden sein."
);
const movedFour = findPlacement(
    finalRow,
    "left",
    (placement) => placement.nodeId === initialFour.nodeId,
    "Die algebraisch bewegte 4 muss ihre semantische Identitaet behalten."
);

assert.equal(
    initialFour.semanticKey,
    movedFour.semanticKey,
    "Ein algebraischer Umzug darf die semantische Identitaet nicht ersetzen."
);
assert.notEqual(
    initialFour.trackKey,
    movedFour.trackKey,
    "Nach Verlassen und Wiedereintritt auf derselben Seite muss eine neue Platzierungsspur beginnen."
);

const rightFourPlacements = rasterRows.slice(1, 4).map((row) => findPlacement(
    row,
    "right",
    (placement) => placement.nodeId === initialFour.nodeId,
    `${row.rowId} muss die transportierte 4 auf der rechten Seite enthalten.`
));
assert.equal(
    new Set(rightFourPlacements.map((placement) => placement.trackKey)).size,
    1,
    "Ein ununterbrochener Aufenthalt auf derselben Seite muss genau eine Spur behalten."
);

const initialB = findPlacement(
    birthRow,
    "left",
    (placement) => placement.value === "b",
    "Im anfaenglichen Nenner muss b vorhanden sein."
);
const initialPlus = findPlacement(
    birthRow,
    "left",
    (placement) => placement.value === "+",
    "Im anfaenglichen Nenner muss der Additionsoperator vorhanden sein."
);

assert.equal(
    initialPlus.rawCol - initialB.rawCol,
    4,
    "b und + muessen im Nenner benachbarte Inhaltszellen belegen."
);
assert.equal(
    initialFour.rawCol - initialPlus.rawCol,
    4,
    "Die spaetere Umzugslage der 4 darf zwischen + und 4 in Zeile 1 keine Zellen reservieren."
);

const initialDivision = findBlueprint(
    projection,
    (blueprint) => (
        blueprint.rowId === birthRow.rowId
        && blueprint.side === "left"
        && blueprint.shellType === "DIVISION"
    ),
    "Zeile 1 braucht den funktionalen DIVISION-Blueprint."
);
const numeratorRange = initialDivision.collectionRanges?.numerator;
const denominatorRange = initialDivision.collectionRanges?.denominator;

assert.ok(numeratorRange && denominatorRange, "Zaehler und Nenner brauchen tatsaechliche Belegungsbereiche.");
assert.equal(
    denominatorRange.rawColEnd - denominatorRange.rawColStart,
    numeratorRange.rawColEnd - numeratorRange.rawColStart,
    "Die gleich langen Bloecke (a-2) und (b+4) muessen gleich breite tatsaechliche Belegungen besitzen."
);
assert.deepEqual(
    initialDivision.collectionAlignmentRanges?.numerator,
    initialDivision.collectionAlignmentRanges?.denominator,
    "Das gemeinsame Bruchband bleibt als getrennte Ausrichtungsgeometrie erhalten."
);

console.log("Semantische Identitaet und ununterbrochene Platzierungsspuren bleiben logisch getrennt.");
