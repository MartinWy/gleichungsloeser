import assert from "node:assert/strict";

import {
  buildTheoryRow,
  buildTheoryRowsFromRuntime
} from "../../core/GenesisRuntime/P4_Projection/buildTheoryRows.js";

function variable(id, value) {
  return { id, type: "VARIABLE", value, isVisible: true };
}

function number(id, value) {
  return { id, type: "NUMBER", value, isVisible: true };
}

function anchor(id = "eq") {
  return { id, type: "ANCHOR", value: "=", isVisible: true };
}

const initialStructure = [
  variable("x", "x"),
  anchor(),
  number("five", "5")
];
const nextStructure = [
  variable("x", "x"),
  anchor(),
  {
    id: "sum",
    type: "ADDITION",
    isVisible: true,
    terms: [number("five", "5"), number("two", "2")],
    operators: [{ id: "plus", type: "OPERATOR", value: "+", isVisible: true }]
  }
];
const strategy = {
  typ: "STRATEGY_DECISION",
  family: "addition_release",
  targetId: "x"
};

const rows = buildTheoryRowsFromRuntime({
  inputPhase: { structure: initialStructure },
  transformationPhase: {
    initialStructure,
    history: [{ structure: nextStructure, strategy }]
  }
});

assert.equal(rows.length, 2);
assert.deepEqual(
  rows.map(({ rowId, stepIndex, source }) => ({ rowId, stepIndex, source })),
  [
    { rowId: "r0", stepIndex: 0, source: "initial" },
    { rowId: "r1", stepIndex: 1, source: "transformation" }
  ]
);
assert.equal(rows[0].strategy, null);
assert.deepEqual(rows[1].strategy, strategy);
assert.notEqual(rows[1].strategy, strategy);

assert.equal(rows[0].anchor.id, "eq");
assert.deepEqual(rows[0].left.map((node) => node.id), ["x"]);
assert.deepEqual(rows[0].right.map((node) => node.id), ["five"]);
assert.equal(rows[0].left[0], rows[0].atoms[0]);
assert.equal(rows[0].anchor, rows[0].atoms[1]);
assert.equal(rows[0].right[0], rows[0].atoms[2]);

initialStructure[0].value = "mutated-input";
nextStructure[2].terms[0].value = "mutated-history";
strategy.family = "mutated-strategy";

assert.equal(rows[0].atoms[0].value, "x");
assert.equal(rows[1].atoms[2].terms[0].value, "5");
assert.equal(rows[1].strategy.family, "addition_release");

const forbiddenGeometryFields = [
  "col",
  "colStart",
  "colEnd",
  "localRow",
  "shellSpans",
  "positionedAtoms"
];

rows.forEach((row) => {
  forbiddenGeometryFields.forEach((field) => {
    assert.equal(
      Object.prototype.hasOwnProperty.call(row, field),
      false,
      `Theoriezeilenaufbau darf ${field} nicht erzeugen.`
    );
  });
});

const directRow = buildTheoryRow([variable("a", "a"), anchor("eq-2"), number("one", "1")], 3, "transformation", strategy);
assert.equal(directRow.rowId, "r3");
assert.equal(directRow.stepIndex, 3);
assert.equal(directRow.anchor.id, "eq-2");

console.log("GenesisRuntime-P4-Theoriezeilenaufbau erfolgreich geprueft.");
