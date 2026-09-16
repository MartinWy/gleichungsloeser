import assert from "node:assert/strict";
import { normalizeEquationInput, normalizeTargetVariableInput } from "../../components/Arbeitsblatt_Druckansicht/inputAdapter.js";

const sqrtInput = normalizeEquationInput("\\sqrt{x+3}=5");
assert.equal(sqrtInput.original, "\\sqrt{x+3}=5");
assert.equal(sqrtInput.normalized, "sqrt(x+3)=5");
assert.equal(sqrtInput.changed, true);

const trigInput = normalizeEquationInput("\\arcsin{y}=5");
assert.equal(trigInput.normalized, "asin(y)=5");

const logInput = normalizeEquationInput("\\log{(2x-1)}=5");
assert.equal(logInput.normalized, "log((2x-1))=5");

const lnInput = normalizeEquationInput("\\ln{x}=5");
assert.equal(lnInput.normalized, "ln(x)=5");

const lgInput = normalizeEquationInput("\\lg{x}=5");
assert.equal(lgInput.normalized, "lg(x)=5");

const fractionInput = normalizeEquationInput("\\frac{x}{2}=5");
assert.equal(fractionInput.normalized, "x/2=5");

const unicodeInput = normalizeEquationInput("2·x−3=5");
assert.equal(unicodeInput.normalized, "2*x-3=5");

const unicodeGreekInput = normalizeEquationInput("γ+1=2");
assert.equal(unicodeGreekInput.normalized, "gamma+1=2");

const latexGreekInput = normalizeEquationInput("\\gamma+1=2");
assert.equal(latexGreekInput.normalized, "gamma+1=2");

const nestedRootFractionInput = normalizeEquationInput("\\sqrt{\\frac{x}{2}}=3");
assert.equal(nestedRootFractionInput.normalized, "sqrt(x/2)=3");

const trigFractionInput = normalizeEquationInput("\\frac{\\sin(x)}{2}=5");
assert.equal(trigFractionInput.normalized, "sin(x)/2=5");

const latexExponentInput = normalizeEquationInput("y=a*B^{x}");
assert.equal(latexExponentInput.normalized, "y=a*B^(x)");

assert.equal(normalizeTargetVariableInput("\\alpha"), "alpha");
assert.equal(normalizeTargetVariableInput("γ"), "gamma");
assert.equal(normalizeTargetVariableInput(" x "), "x");
assert.deepEqual(normalizeEquationInput(null), {
  original: "",
  normalized: "",
  changed: false
});
assert.equal(normalizeTargetVariableInput(null), null);

console.log("Input-Adapter-Normalisierung erfolgreich geprueft.");
