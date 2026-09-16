import assert from "node:assert/strict";

import { formatTheoryNodeLabel } from "../../cockpit_user/adapters/theory_labels/index.js";

const powerA = {
    id: "power-a",
    type: "POWER",
    content: [{ id: "a", type: "VARIABLE", value: "a" }],
    exponentNodes: [{ id: "two-a", type: "NUMBER", value: "2" }]
};
const powerB = {
    id: "power-b",
    type: "POWER",
    content: [{ id: "b", type: "VARIABLE", value: "b" }],
    exponentNodes: [{ id: "two-b", type: "NUMBER", value: "2" }]
};
const addition = {
    id: "sum",
    type: "ADDITION",
    terms: [powerA, powerB],
    operators: [{ id: "plus", type: "OPERATOR", value: "+" }]
};
const groupedAddition = {
    id: "group-sum",
    type: "GROUP",
    content: [addition]
};
const subtraction = {
    id: "difference",
    type: "SUBTRACTION",
    minuend: [{
        id: "power-c",
        type: "POWER",
        content: [{ id: "c", type: "VARIABLE", value: "c" }],
        exponentNodes: [{ id: "two-c", type: "NUMBER", value: "2" }]
    }],
    operator: { id: "minus", type: "OPERATOR", value: "-" },
    subtrahend: [groupedAddition]
};

assert.equal(formatTheoryNodeLabel(addition), "a^2+b^2");
assert.equal(formatTheoryNodeLabel(subtraction), "c^2-(a^2+b^2)");

const product = {
    id: "product",
    type: "MULTIPLICATION",
    factors: [
        { id: "two", type: "NUMBER", value: "2" },
        { id: "a-factor", type: "VARIABLE", value: "a" },
        { id: "cos", type: "FUNCTION", name: "cos", content: [{ id: "gamma", type: "VARIABLE", value: "gamma" }] }
    ],
    operators: [
        { id: "times-1", type: "OPERATOR", value: "*" },
        { id: "times-2", type: "OPERATOR", value: "*" }
    ]
};

assert.equal(formatTheoryNodeLabel(product), "2*a*cos(gamma)");
assert.equal(
    formatTheoryNodeLabel({
        id: "fraction",
        type: "DIVISION",
        numerator: [{ id: "y", type: "VARIABLE", value: "y" }],
        denominator: [{ id: "a-denominator", type: "VARIABLE", value: "a" }]
    }),
    "(y) / (a)"
);

assert.equal(
    formatTheoryNodeLabel({
        id: "fractional-power",
        type: "POWER",
        content: [{
            id: "power-base-fraction",
            type: "DIVISION",
            numerator: [{ id: "y-base", type: "VARIABLE", value: "y" }],
            denominator: [{ id: "a-base", type: "VARIABLE", value: "a" }]
        }],
        exponentNodes: [{
            id: "reciprocal-exponent",
            type: "DIVISION",
            numerator: [{ id: "one", type: "NUMBER", value: "1" }],
            denominator: [{ id: "x", type: "VARIABLE", value: "x" }]
        }]
    }),
    "((y) / (a))^(1/x)"
);

const unsupportedShell = { id: "future", type: "FUTURE_SHELL", content: [powerA] };
assert.equal(
    formatTheoryNodeLabel(unsupportedShell),
    "",
    "Eine unbekannte Schale darf nicht heuristisch aus ihren Kindern rekonstruiert werden."
);

console.log("Cockpit-Theorie-Label-Adapter erfolgreich geprueft.");
