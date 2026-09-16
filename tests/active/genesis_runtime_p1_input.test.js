import assert from "node:assert/strict";

import {
    P1_INPUT_CONTRACT_VERSION,
    parseInputStructure
} from "../../core/GenesisRuntime/P1_Input/index.js";
import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";

function splitCanonicalEquation(structure = []) {
    assert.equal(structure.length, 3, "P1 muss genau Ausdruck, Anker, Ausdruck liefern.");
    assert.equal(structure[1]?.type, "ANCHOR");
    assert.equal(structure[1]?.value, "=");

    return {
        left: structure[0],
        anchor: structure[1],
        right: structure[2]
    };
}

function collectNodes(value, bucket = []) {
    if (Array.isArray(value)) {
        value.forEach((entry) => collectNodes(entry, bucket));
        return bucket;
    }

    if (!value || typeof value !== "object") {
        return bucket;
    }

    if (typeof value.type === "string") {
        bucket.push(value);
    }

    Object.values(value).forEach((entry) => collectNodes(entry, bucket));
    return bucket;
}

function assertStableOperator(operator, expectedValue, expectedImplicit = false) {
    assert.equal(operator?.type, "OPERATOR");
    assert.equal(operator?.value, expectedValue);
    assert.equal(typeof operator?.id, "string");
    assert.ok(operator.id.length > 0);
    assert.equal(Boolean(operator?.isImplicit), expectedImplicit);
}

const simplestEquation = parseInputStructure("x=5");
assert.equal(simplestEquation.contractVersion, P1_INPUT_CONTRACT_VERSION);
{
    const { left, right } = splitCanonicalEquation(simplestEquation.structure);
    assert.equal(left.type, "VARIABLE");
    assert.equal(right.type, "NUMBER");
}

const implicitLinear = parseInputStructure("2x=10");
{
    const { left, right } = splitCanonicalEquation(implicitLinear.structure);
    assert.equal(left.type, "MULTIPLICATION");
    assert.deepEqual(left.factors.map((factor) => factor.value), ["2", "x"]);
    assert.equal(left.operators.length, 1);
    assertStableOperator(left.operators[0], "*", true);
    assert.equal(right.value, "10");
}

const targetIndependentProduct = parseInputStructure("a*b*x=c");
{
    const { left } = splitCanonicalEquation(targetIndependentProduct.structure);
    assert.equal(left.type, "MULTIPLICATION");
    assert.deepEqual(left.factors.map((factor) => factor.value), ["a", "b", "x"]);
    assert.deepEqual(left.operators.map((operator) => operator.value), ["*", "*"]);
    for (const forbiddenField of ["target", "passive", "factor", "flowDirection"]) {
        assert.equal(Object.hasOwn(left, forbiddenField), false);
    }
}

const addition = parseInputStructure("x+2=5");
{
    const { left } = splitCanonicalEquation(addition.structure);
    assert.equal(left.type, "ADDITION");
    assert.deepEqual(left.terms.map((term) => term.value), ["x", "2"]);
    assertStableOperator(left.operators[0], "+");
}

const subtraction = parseInputStructure("2-x=5");
{
    const { left } = splitCanonicalEquation(subtraction.structure);
    assert.equal(left.type, "SUBTRACTION");
    assert.equal(left.minuend[0].value, "2");
    assert.equal(left.subtrahend[0].value, "x");
    assertStableOperator(left.operator, "-");
}

const precedence = parseInputStructure("2*x+3=7");
{
    const { left } = splitCanonicalEquation(precedence.structure);
    assert.equal(left.type, "ADDITION");
    assert.equal(left.terms[0].type, "MULTIPLICATION");
    assert.deepEqual(left.terms[0].factors.map((factor) => factor.value), ["2", "x"]);
    assert.equal(left.terms[1].value, "3");
}

const additiveAssociativity = parseInputStructure("a-b+c=d");
{
    const { left } = splitCanonicalEquation(additiveAssociativity.structure);
    assert.equal(left.type, "ADDITION");
    assert.equal(left.terms[0].type, "SUBTRACTION");
    assert.equal(left.terms[1].value, "c");
}

const bareTrigArgument = parseInputStructure("cosgamma=1");
{
    const { left } = splitCanonicalEquation(bareTrigArgument.structure);
    assert.equal(left.type, "FUNCTION");
    assert.equal(left.name, "cos");
    assert.equal(left.content[0].value, "gamma");
}

const groupedNegation = parseInputStructure("-(x+1)=5");
{
    const { left } = splitCanonicalEquation(groupedNegation.structure);
    assert.equal(left.type, "NEGATION");
    assertStableOperator(left.operator, "-");
    assert.equal(left.content[0].type, "GROUP");
    assert.equal(left.content[0].content[0].type, "ADDITION");
}

const productNegation = parseInputStructure("-2*x=5");
{
    const { left } = splitCanonicalEquation(productNegation.structure);
    assert.equal(left.type, "NEGATION");
    assert.equal(left.content[0].type, "MULTIPLICATION");
}

const groupedDivision = parseInputStructure("sin(x)/(2*3)=5");
{
    const { left } = splitCanonicalEquation(groupedDivision.structure);
    assert.equal(left.type, "DIVISION");
    assert.equal(left.numerator[0].type, "FUNCTION");
    assert.equal(left.denominator[0].type, "GROUP");
    assert.equal(left.denominator[0].content[0].type, "MULTIPLICATION");
    assertStableOperator(left.operator, "/");
}

const squareRoot = parseInputStructure("sqrt(x)=5");
{
    const { left } = splitCanonicalEquation(squareRoot.structure);
    assert.equal(left.type, "ROOT");
    assert.equal(left.degree, 2);
    assert.equal(left.content[0].value, "x");
}

const productThenDivision = parseInputStructure("a*b/c=d");
{
    const { left } = splitCanonicalEquation(productThenDivision.structure);
    assert.equal(left.type, "DIVISION");
    assert.equal(left.numerator[0].type, "MULTIPLICATION");
    assert.equal(left.denominator[0].value, "c");
}

const divisionThenProduct = parseInputStructure("a/b*c=d");
{
    const { left } = splitCanonicalEquation(divisionThenProduct.structure);
    assert.equal(left.type, "MULTIPLICATION");
    assert.equal(left.factors[0].type, "DIVISION");
    assert.equal(left.factors[1].value, "c");
}

const powerExpression = parseInputStructure("x^2=9");
{
    const { left } = splitCanonicalEquation(powerExpression.structure);
    assert.equal(left.type, "POWER");
    assert.equal(left.exponent, 2);
    assert.equal(left.content[0].value, "x");
    assert.equal(left.exponentNodes[0].value, "2");
}

const symbolicPowerExpression = parseInputStructure("B^x=9");
{
    const { left } = splitCanonicalEquation(symbolicPowerExpression.structure);
    assert.equal(left.type, "POWER");
    assert.equal(left.exponent, "x");
    assert.equal(left.content[0].value, "B");
    assert.equal(left.exponentNodes[0].value, "x");
}

const compoundPowerExpression = parseInputStructure("B^(2*x-1)=9");
{
    const { left } = splitCanonicalEquation(compoundPowerExpression.structure);
    assert.equal(left.type, "POWER");
    assert.equal(left.exponentNodes[0].type, "SUBTRACTION");
    assert.equal(left.exponentNodes[0].minuend[0].type, "MULTIPLICATION");
}

for (const functionName of ["log", "ln", "lg"]) {
    const parsed = parseInputStructure(`${functionName}(x+1)=1`);
    const { left } = splitCanonicalEquation(parsed.structure);
    assert.equal(left.type, "FUNCTION");
    assert.equal(left.name, functionName);
    assert.equal(left.content[0].type, "ADDITION");
}

const deterministicA = parseInputStructure("x + (2+1)=5");
const deterministicB = parseInputStructure("x+(2+1)=5");
assert.deepEqual(deterministicA.structure, deterministicB.structure);

const phaseForX = await runInputPhase({
    request: {
        equation: " a*b*x=c ",
        requestedTarget: "x"
    }
});
const phaseForA = await runInputPhase({
    request: {
        equation: " a*b*x=c ",
        requestedTarget: "a"
    }
});
assert.equal(phaseForX.phaseId, "P1_Input");
assert.equal(phaseForX.contractVersion, P1_INPUT_CONTRACT_VERSION);
assert.equal(phaseForX.normalizedEquation, "a*b*x=c");
assert.deepEqual(phaseForX.structure, phaseForA.structure);
assert.equal(collectNodes(phaseForX.structure).some((node) => node.type === "COLLECTION"), false);

assert.throws(() => parseInputStructure("x+1"), /Gleichheitsanker/);
assert.throws(() => parseInputStructure("x=1=2"), /genau einen Gleichheitsanker/);
assert.throws(() => parseInputStructure("=1"), /linke Gleichungsseite/);
assert.throws(() => parseInputStructure("x="), /rechte Gleichungsseite/);
assert.throws(() => parseInputStructure("x+=1"), /Operand/);
assert.throws(() => parseInputStructure("()=1"), /leere Gruppe/);
assert.throws(() => parseInputStructure("x@2=1"), /Unbekanntes Zeichen/);
assert.throws(() => parseInputStructure("foo(x)=1"), /Unbekannte Funktion/);
assert.throws(() => parseInputStructure("x^=1"), /Exponent/);

console.log("GenesisRuntime-P1-Vertrag erfolgreich geprueft.");
