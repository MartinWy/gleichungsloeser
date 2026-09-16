import assert from "node:assert/strict";

import { resolveFunctionNotation } from "../../components/Arbeitsblatt_Druckansicht/functionNotation.js";

const cases = [
    ["ln", "B", { displayHead: "ln", renderLabel: "ln", renderBaseArgument: false, latexVariant: "ln", normalizedBaseText: "" }],
    ["lg", "10", { displayHead: "lg", renderLabel: "lg", renderBaseArgument: false, latexVariant: "lg", normalizedBaseText: "" }],
    ["log", "2", { displayHead: "lg", renderLabel: "lg", renderBaseArgument: false, latexVariant: "lg", normalizedBaseText: "2" }],
    ["log", "e", { displayHead: "ln", renderLabel: "ln", renderBaseArgument: false, latexVariant: "ln", normalizedBaseText: "e" }],
    ["log", "10", { displayHead: "log", renderLabel: "log", renderBaseArgument: false, latexVariant: "log", normalizedBaseText: "10" }],
    ["log", "", { displayHead: "log", renderLabel: "log", renderBaseArgument: false, latexVariant: "log", normalizedBaseText: "" }],
    ["log", "B", { displayHead: "log_B", renderLabel: "log", renderBaseArgument: true, latexVariant: "log_with_base", normalizedBaseText: "B" }],
    ["f", "a + 2", { displayHead: "f_a + 2", renderLabel: "f", renderBaseArgument: true, latexVariant: "generic", normalizedBaseText: "a + 2" }]
];

for (const [name, baseText, expected] of cases) {
    assert.deepEqual(resolveFunctionNotation(name, baseText), expected);
}

console.log("Isolierte Function-Notation fuer ln, lg, log und freie Basen erfolgreich geprueft.");
