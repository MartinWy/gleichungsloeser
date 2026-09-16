import assert from "node:assert/strict";
import { Atomisierer } from "./Regelwerk.js";


function collectIds(structure) {
    const ids = [];

    const visit = (atom) => {
        if (!atom) {
            return;
        }

        if (atom.id) {
            ids.push(atom.id);
        }

        ["content", "numerator", "denominator", "factor", "passive"].forEach((key) => {
            if (Array.isArray(atom[key])) {
                atom[key].forEach(visit);
            }
        });
    };

    structure.forEach(visit);
    return ids;
}

const implicitLinear = Atomisierer.process("2x=10");
assert.equal(implicitLinear[0].value, "2");
assert.equal(implicitLinear[1].value, "*");
assert.equal(implicitLinear[1].isImplicit, true);
assert.equal(implicitLinear[2].value, "x");
assert.equal(implicitLinear[3].value, "=");
assert.equal(implicitLinear[4].value, "10");

const explicitLinear = Atomisierer.process("2*x=10");
const explicitOperators = explicitLinear.filter((atom) => atom.value === "*");
assert.equal(explicitOperators.length, 1);
assert.equal(explicitOperators[0].isImplicit, undefined);

const implicitFunction = Atomisierer.process("2sin(x)=10");
const functionOperator = implicitFunction.find((atom) => atom.value === "*" && atom.isImplicit === true);
const functionShell = implicitFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(functionOperator, "Implizite Multiplikation vor einer Funktion muss kanonisiert werden.");
assert.ok(functionShell, "Funktionsschalen muessen erkannt werden.");
assert.equal(functionShell.name, "sin");
assert.equal(functionShell.content[0].value, "x");

const explicitFunction = Atomisierer.process("2*sin(x)=10");
const explicitFunctionOperators = explicitFunction.filter((atom) => atom.value === "*");
const explicitFunctionShell = explicitFunction.find((atom) => atom.type === "FUNCTION");
assert.equal(explicitFunctionOperators.length, 1);
assert.equal(explicitFunctionOperators[0].isImplicit, undefined);
assert.ok(explicitFunctionShell);
assert.equal(explicitFunctionShell.name, "sin");

const implicitFactorChain = Atomisierer.process("2ab=10");
assert.equal(implicitFactorChain[0].value, "2");
assert.equal(implicitFactorChain[1].value, "*");
assert.equal(implicitFactorChain[2].value, "a");
assert.equal(implicitFactorChain[3].value, "*");
assert.equal(implicitFactorChain[4].value, "b");

const bareTrigArgument = Atomisierer.process("cosgamma=1");
const bareTrigShell = bareTrigArgument.find((atom) => atom.type === "FUNCTION");
assert.ok(bareTrigShell, "Trigonometrische Funktionen ohne Klammern muessen mit nacktem Argument lesbar sein.");
assert.equal(bareTrigShell.name, "cos");
assert.equal(bareTrigShell.content[0].value, "gamma");

const prefixedTrigFunction = Atomisierer.process("abcos(gamma)=1");
const prefixedTrigFunctionShell = prefixedTrigFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(prefixedTrigFunctionShell, "Auch praefixierte Produkte vor einer Funktionsschale muessen lesbar bleiben.");
assert.equal(prefixedTrigFunctionShell.name, "cos");
assert.equal(prefixedTrigFunctionShell.content[0].value, "gamma");

const inverseTrigFunction = Atomisierer.process("asin(x)=1");
const inverseTrigShell = inverseTrigFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(inverseTrigShell);
assert.equal(inverseTrigShell.name, "asin");
assert.equal(inverseTrigShell.content[0].value, "x");

const cosFunction = Atomisierer.process("cos(x)=1");
const cosShell = cosFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(cosShell);
assert.equal(cosShell.name, "cos");

const tanFunction = Atomisierer.process("tan(x)=2");
const tanShell = tanFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(tanShell);
assert.equal(tanShell.name, "tan");

const acosFunction = Atomisierer.process("acos(x)=1");
const acosShell = acosFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(acosShell);
assert.equal(acosShell.name, "acos");

const atanFunction = Atomisierer.process("atan(x)=2");
const atanShell = atanFunction.find((atom) => atom.type === "FUNCTION");
assert.ok(atanShell);
assert.equal(atanShell.name, "atan");

const groupedTerm = Atomisierer.process("2(x+1)=10");
assert.equal(groupedTerm[1].value, "*");
assert.equal(groupedTerm[1].isImplicit, true);
assert.equal(groupedTerm[2].type, "GROUP");

const additiveSimple = Atomisierer.process("x+2=5");
assert.equal(additiveSimple[0].value, "x");
assert.equal(additiveSimple[1].value, "+");
assert.equal(additiveSimple[2].value, "2");

const additiveGrouped = Atomisierer.process("x+(2+1)=5");
assert.equal(additiveGrouped[0].value, "x");
assert.equal(additiveGrouped[1].value, "+");
assert.equal(additiveGrouped[2].type, "GROUP");

const additiveOuterMultiplication = Atomisierer.process("2*x+3=5");
assert.equal(additiveOuterMultiplication[0].value, "2");
assert.equal(additiveOuterMultiplication[1].value, "*");
assert.equal(additiveOuterMultiplication[2].value, "x");
assert.equal(additiveOuterMultiplication[3].value, "+");
assert.equal(additiveOuterMultiplication[4].value, "3");

const subtractionGrouped = Atomisierer.process("x-(2+1)=5");
assert.equal(subtractionGrouped[0].value, "x");
assert.equal(subtractionGrouped[1].value, "-");
assert.equal(subtractionGrouped[2].type, "GROUP");

const negativeSimple = Atomisierer.process("-x=5");
assert.equal(negativeSimple[0].type, "NEGATION");
assert.equal(negativeSimple[0].content[0].value, "x");
assert.equal(negativeSimple[1].value, "=");

const negativeRight = Atomisierer.process("5=-x");
assert.equal(negativeRight[2].type, "NEGATION");
assert.equal(negativeRight[2].content[0].value, "x");

const negativeGrouped = Atomisierer.process("-(x+1)=5");
assert.equal(negativeGrouped[0].type, "NEGATION");
assert.equal(negativeGrouped[0].content[0].type, "GROUP");

const negativeFunction = Atomisierer.process("-sin(x)=5");
assert.equal(negativeFunction[0].type, "NEGATION");
assert.equal(negativeFunction[0].content[0].type, "FUNCTION");
assert.equal(negativeFunction[0].content[0].name, "sin");

const divisionWithNumberExpression = Atomisierer.process("x/2=5");
assert.equal(divisionWithNumberExpression[0].type, "DIVISION");
assert.equal(divisionWithNumberExpression[0].numerator[0].value, "x");
assert.equal(divisionWithNumberExpression[0].denominator[0].value, "2");
assert.equal(divisionWithNumberExpression[0].denominator[0].position, "denominator");
assert.equal(divisionWithNumberExpression[1].value, "=");
assert.equal(divisionWithNumberExpression[2].value, "5");

const groupedDivision = Atomisierer.process("x/(2+1)=5");
assert.equal(groupedDivision[0].type, "DIVISION");
assert.equal(groupedDivision[0].numerator[0].value, "x");
assert.equal(groupedDivision[0].denominator[0].type, "GROUP");
assert.equal(groupedDivision[0].denominator[0].content[0].value, "2");
assert.equal(groupedDivision[0].denominator[0].content[1].value, "+");
assert.equal(groupedDivision[0].denominator[0].content[2].value, "1");

const functionDivision = Atomisierer.process("sin(x)/2=5");
assert.equal(functionDivision[0].type, "DIVISION");
assert.equal(functionDivision[0].numerator[0].type, "FUNCTION");
assert.equal(functionDivision[0].numerator[0].name, "sin");
assert.equal(functionDivision[0].denominator[0].value, "2");

const groupedFunctionDivision = Atomisierer.process("sin(x)/(2*3)=5");
assert.equal(groupedFunctionDivision[0].type, "DIVISION");
assert.equal(groupedFunctionDivision[0].numerator[0].type, "FUNCTION");
assert.equal(groupedFunctionDivision[0].denominator[0].type, "GROUP");
assert.equal(groupedFunctionDivision[0].denominator[0].content[0].value, "2");
assert.equal(groupedFunctionDivision[0].denominator[0].content[1].value, "*");
assert.equal(groupedFunctionDivision[0].denominator[0].content[2].value, "3");

const chainedDivision = Atomisierer.process("A=g*h/2");
assert.equal(chainedDivision[0].value, "A");
assert.equal(chainedDivision[1].value, "=");
assert.equal(chainedDivision[2].type, "DIVISION");
assert.equal(chainedDivision[2].numerator[0].value, "g");
assert.equal(chainedDivision[2].numerator[1].value, "*");
assert.equal(chainedDivision[2].numerator[2].value, "h");
assert.equal(chainedDivision[2].denominator[0].value, "2");

const deterministicGroupedA = Atomisierer.process("x + (2+1)=5");
const deterministicGroupedB = Atomisierer.process("x+(2+1)=5");
assert.deepEqual(
    collectIds(deterministicGroupedA),
    collectIds(deterministicGroupedB),
    "Dieselbe normalisierte Eingabe muss dieselben initialen IDs erzeugen."
);

const deterministicDifferent = Atomisierer.process("x+(2+2)=5");
assert.notEqual(
    deterministicGroupedA[0].id,
    deterministicDifferent[0].id,
    "Unterschiedliche Eingaben sollen nicht dieselbe ID-Namespace teilen."
);

console.log("✅ P1 Validierung erfolgreich.");
