import assert from "node:assert/strict";
import { process } from "./index.js";

const groupTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      {
        id: "outer-group",
        type: "GROUP",
        isVisible: true,
        content: [
          { id: "x", value: "x", type: "VARIABLE", isVisible: true },
          { id: "plus", value: "+", type: "OPERATOR", isVisible: true },
          { id: "one", value: "1", type: "NUMBER", isVisible: true }
        ]
      },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      {
        id: "outer-group",
        type: "GROUP",
        isVisible: false,
        content: []
      },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "plus", value: "+", type: "OPERATOR", isVisible: true, isBefreit: true },
      { id: "one", value: "1", type: "NUMBER", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: { family: "group_release", action: "RELEASE_GROUP_CONTENT" }
  }
];

const groupResult = process(groupTheoryRows);
const groupFinalRow = groupResult.projectionRows[1].positionedAtoms;
const hiddenOuterGroup = groupFinalRow.find((atom) => atom.id === "outer-group" && atom.isVisible === false);
const emergedGroupVariable = groupFinalRow.find((atom) => atom.id === "x");
const emergedGroupOperator = groupFinalRow.find((atom) => atom.id === "plus");
const emergedGroupPassive = groupFinalRow.find((atom) => atom.id === "one");
const groupAnchorCols = groupResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(groupAnchorCols[0], groupAnchorCols[1], "Auch beim Freilegen einer Aussengruppe muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenOuterGroup.visualMode, "GHOST_HOLE");
assert.equal(emergedGroupVariable.visualMode, "EMERGED");
assert.equal(emergedGroupOperator.visualMode, "EMERGED");
assert.equal(emergedGroupPassive.visualMode, "EMERGED");
assert.equal(groupResult.layoutPlan.visualRowCount, 2);

const additiveTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "x", value: "x", type: "VARIABLE", isVisible: true },
      { id: "plus", value: "+", type: "OPERATOR", isVisible: true },
      { id: "two", value: "2", type: "NUMBER", isVisible: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "plus", value: "+", type: "OPERATOR", isVisible: false },
      { id: "two", value: "2", type: "NUMBER", isVisible: false },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-addition_release-subtraction-from-two",
        type: "SUBTRACTION",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five", value: "5", type: "NUMBER", isVisible: true }],
        passive: [{ id: "two", value: "2", type: "NUMBER", isVisible: true, position: "passive" }]
      }
    ],
    strategy: { family: "addition_release", action: "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION" }
  }
];

const additiveResult = process(additiveTheoryRows);
const additiveFinalRow = additiveResult.projectionRows[1].positionedAtoms;
const hiddenAdditiveOperator = additiveFinalRow.find((atom) => atom.id === "plus" && atom.isVisible === false);
const hiddenAdditivePassive = additiveFinalRow.find((atom) => atom.id === "two" && atom.isVisible === false);
const emergedAdditiveTarget = additiveFinalRow.find((atom) => atom.id === "x");
const subtractionShell = additiveFinalRow.find((atom) => atom.type === "SUBTRACTION");
const additiveContent = additiveFinalRow.find((atom) => atom.sourceShellId === subtractionShell.id && atom.projectionRole === "inverse_content");
const additiveOperator = additiveFinalRow.find((atom) => atom.sourceShellId === subtractionShell.id && atom.projectionRole === "inverse_operator");
const additivePassive = additiveFinalRow.find((atom) => atom.sourceShellId === subtractionShell.id && atom.projectionRole === "inverse_passive");
const additiveAnchorCols = additiveResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(additiveAnchorCols[0], additiveAnchorCols[1], "Auch im Additivfall muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenAdditiveOperator.visualMode, "GHOST_HOLE");
assert.equal(hiddenAdditivePassive.visualMode, "GHOST_HOLE");
assert.equal(emergedAdditiveTarget.visualMode, "EMERGED");
assert.equal(subtractionShell.visualMode, "INVERSE_SHELL");
assert.equal(additiveResult.layoutPlan.visualRowCount, 2);
assert.equal(additiveContent.row, additiveOperator.row);
assert.equal(additiveOperator.row, additivePassive.row);
assert.equal(additiveContent.col + 1, additiveOperator.col);
assert.equal(additiveOperator.col + 1, additivePassive.col);

const subtractionTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "x", value: "x", type: "VARIABLE", isVisible: true },
      { id: "minus", value: "-", type: "OPERATOR", isVisible: true },
      { id: "group", type: "GROUP", isVisible: true, content: [
        { id: "two", value: "2", type: "NUMBER", isVisible: true },
        { id: "plus-in-group", value: "+", type: "OPERATOR", isVisible: true },
        { id: "one", value: "1", type: "NUMBER", isVisible: true }
      ] },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "minus", value: "-", type: "OPERATOR", isVisible: false },
      { id: "group", type: "GROUP", isVisible: false, content: [] },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-subtraction_release-addition-from-group",
        type: "ADDITION",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five", value: "5", type: "NUMBER", isVisible: true }],
        passive: [{ id: "group", type: "GROUP", isVisible: true, position: "passive", content: [] }]
      }
    ],
    strategy: { family: "subtraction_release", action: "MOVE_PASSIVE_EXPRESSION_TO_ADDITION" }
  }
];

const subtractionResult = process(subtractionTheoryRows);
const subtractionFinalRow = subtractionResult.projectionRows[1].positionedAtoms;
const hiddenSubtractionOperator = subtractionFinalRow.find((atom) => atom.id === "minus" && atom.isVisible === false);
const hiddenSubtractionPassive = subtractionFinalRow.find((atom) => atom.id === "group" && atom.isVisible === false);
const additionShell = subtractionFinalRow.find((atom) => atom.type === "ADDITION");
const subtractionInverseOperator = subtractionFinalRow.find((atom) => atom.sourceShellId === additionShell.id && atom.projectionRole === "inverse_operator");
const subtractionInversePassive = subtractionFinalRow.find((atom) => atom.sourceShellId === additionShell.id && atom.projectionRole === "inverse_passive");
const subtractionAnchorCols = subtractionResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(subtractionAnchorCols[0], subtractionAnchorCols[1], "Auch im Subtraktionsfall muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenSubtractionOperator.visualMode, "GHOST_HOLE");
assert.equal(hiddenSubtractionPassive.visualMode, "GHOST_HOLE");
assert.equal(additionShell.visualMode, "INVERSE_SHELL");
assert.equal(subtractionInverseOperator.value, "+");
assert.equal(subtractionInversePassive.type, "GROUP");

const subtrahendTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "two", value: "2", type: "NUMBER", isVisible: true },
      { id: "minus", value: "-", type: "OPERATOR", isVisible: true },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "two", value: "2", type: "NUMBER", isVisible: false },
      { id: "minus", value: "-", type: "OPERATOR", isVisible: false },
      {
        id: "generated-subtrahend_release-negation-from-x",
        type: "NEGATION",
        sign: "-",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }]
      },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-subtrahend_release-subtraction-from-two",
        type: "SUBTRACTION",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five", value: "5", type: "NUMBER", isVisible: true }],
        passive: [{ id: "two", value: "2", type: "NUMBER", isVisible: true, position: "passive" }]
      }
    ],
    strategy: { family: "subtrahend_release", action: "MOVE_MINUEND_TO_SUBTRACTION" }
  }
];

const subtrahendProjection = process(subtrahendTheoryRows);
const subtrahendFinalRow = subtrahendProjection.projectionRows[1].positionedAtoms;
const hiddenSubtrahendMinuend = subtrahendFinalRow.find((atom) => atom.id === "two" && atom.isVisible === false);
const hiddenSubtrahendOperator = subtrahendFinalRow.find((atom) => atom.id === "minus" && atom.isVisible === false);
const projectedActiveNegation = subtrahendFinalRow.find((atom) => atom.id === "generated-subtrahend_release-negation-from-x");
const projectedOppositeSubtraction = subtrahendFinalRow.find((atom) => atom.id === "generated-subtrahend_release-subtraction-from-two");
const projectedActiveNegationSign = subtrahendFinalRow.find((atom) => atom.sourceShellId === projectedActiveNegation.id && atom.projectionRole === "negation_sign");
const projectedActiveNegationContent = subtrahendFinalRow.find((atom) => atom.sourceShellId === projectedActiveNegation.id && atom.projectionRole === "negation_content");
const subtrahendInverseOperator = subtrahendFinalRow.find((atom) => atom.sourceShellId === projectedOppositeSubtraction.id && atom.projectionRole === "inverse_operator");
const subtrahendAnchorCols = subtrahendProjection.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(subtrahendAnchorCols[0], subtrahendAnchorCols[1], "Auch beim aktiven Subtrahenden muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenSubtrahendMinuend.visualMode, "GHOST_HOLE");
assert.equal(hiddenSubtrahendOperator.visualMode, "GHOST_HOLE");
assert.equal(projectedActiveNegation.visualMode, "INVERSE_SHELL");
assert.equal(projectedActiveNegationSign.value, "-");
assert.equal(projectedActiveNegationSign.col, projectedActiveNegation.col);
assert.equal(projectedActiveNegationContent.value, "x");
assert.equal(projectedActiveNegationContent.col, projectedActiveNegation.col + 1);
assert.equal(projectedOppositeSubtraction.visualMode, "INVERSE_SHELL");
assert.equal(subtrahendInverseOperator.value, "-");

const rootTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { type: "ROOT", isVisible: true, content: [] },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { type: "ROOT", isVisible: false, content: [] },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { type: "POWER", isVisible: false, exponent: 2, content: [] }
    ],
    strategy: { family: "root_power", action: "INVERT_TO_POWER" }
  }
];

const rootResult = process(rootTheoryRows);
const rootFinalRow = rootResult.projectionRows[1].positionedAtoms;
const hiddenRoot = rootFinalRow.find((atom) => atom.type === "ROOT" && atom.isVisible === false);
const hiddenPower = rootFinalRow.find((atom) => atom.type === "POWER" && atom.isVisible === false);
const emergedVariable = rootFinalRow.find((atom) => atom.id === "x");
const rootAnchorCols = rootResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

const trigTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "sin-shell", type: "FUNCTION", name: "sin", isVisible: true, content: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }] },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "one", value: "1", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "sin-shell", type: "FUNCTION", name: "sin", isVisible: false, content: [] },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-trig_inverse-function-from-sin-shell",
        type: "FUNCTION",
        name: "asin",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "one", value: "1", type: "NUMBER", isVisible: true }]
      }
    ],
    strategy: { family: "trig_inverse", action: "INVERT_TO_ASIN" }
  }
];

const trigResult = process(trigTheoryRows);
const trigFinalRow = trigResult.projectionRows[1].positionedAtoms;
const hiddenTrigShell = trigFinalRow.find((atom) => atom.id === "sin-shell" && atom.isVisible === false);
const emergedTrigVariable = trigFinalRow.find((atom) => atom.id === "x");
const trigInverseFunction = trigFinalRow.find((atom) => atom.id === "generated-trig_inverse-function-from-sin-shell");
const trigAnchorCols = trigResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(trigAnchorCols[0], trigAnchorCols[1], "Auch im trigonometrischen Umkehrfall muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenTrigShell.visualMode, "GHOST_HOLE");
assert.equal(emergedTrigVariable.visualMode, "EMERGED");
assert.equal(trigInverseFunction.visualMode, "INVERSE_SHELL");

const inverseTrigTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "asin-shell", type: "FUNCTION", name: "asin", isVisible: true, content: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }] },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "one", value: "1", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "asin-shell", type: "FUNCTION", name: "asin", isVisible: false, content: [] },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-inverse_trig-function-from-asin-shell",
        type: "FUNCTION",
        name: "sin",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "one", value: "1", type: "NUMBER", isVisible: true }]
      }
    ],
    strategy: { family: "inverse_trig", action: "INVERT_TO_SIN" }
  }
];

const inverseTrigProjectionResult = process(inverseTrigTheoryRows);
const inverseTrigFinalRow = inverseTrigProjectionResult.projectionRows[1].positionedAtoms;
const hiddenInverseTrigShell = inverseTrigFinalRow.find((atom) => atom.id === "asin-shell" && atom.isVisible === false);
const emergedInverseTrigVariable = inverseTrigFinalRow.find((atom) => atom.id === "x");
const directTrigFunction = inverseTrigFinalRow.find((atom) => atom.id === "generated-inverse_trig-function-from-asin-shell");
const inverseTrigAnchorCols = inverseTrigProjectionResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(inverseTrigAnchorCols[0], inverseTrigAnchorCols[1], "Auch in der trigonometrischen Gegenrichtung muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenInverseTrigShell.visualMode, "GHOST_HOLE");
assert.equal(emergedInverseTrigVariable.visualMode, "EMERGED");
assert.equal(directTrigFunction.visualMode, "INVERSE_SHELL");

assert.equal(rootResult.layoutPlan.mode, "two_pass_preflight");
assert.equal(rootResult.layoutPlan.rowCount, 2);
assert.equal(rootResult.projectionRows.length, 2);
assert.equal(rootAnchorCols[0], rootAnchorCols[1], "Der Gleichheitsanker muss in beiden Zeilen dieselbe Spalte behalten.");
assert.equal(hiddenRoot.visualMode, "GHOST_HOLE");
assert.equal(hiddenPower.visualMode, "GHOST_HOLE");
assert.equal(emergedVariable.visualMode, "EMERGED");

const negationTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "neg-shell", type: "NEGATION", sign: "-", isVisible: true, content: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }] },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "neg-shell", type: "NEGATION", sign: "-", isVisible: false, content: [] },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-negative_sign_release-negation-from-neg-shell",
        type: "NEGATION",
        sign: "-",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five", value: "5", type: "NUMBER", isVisible: true }]
      }
    ],
    strategy: { family: "negative_sign_release", action: "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE" }
  }
];

const negationResult = process(negationTheoryRows);
const negationInitialRow = negationResult.projectionRows[0].positionedAtoms;
const negationFinalRow = negationResult.projectionRows[1].positionedAtoms;
const initialFive = negationInitialRow.find((atom) => atom.id === "five");
const hiddenNegationShell = negationFinalRow.find((atom) => atom.id === "neg-shell" && atom.isVisible === false);
const emergedNegationVariable = negationFinalRow.find((atom) => atom.id === "x");
const inverseNegationShell = negationFinalRow.find((atom) => atom.id === "generated-negative_sign_release-negation-from-neg-shell");
const inverseNegationSign = negationFinalRow.find((atom) => atom.sourceShellId === inverseNegationShell.id && atom.projectionRole === "negation_sign");
const inverseNegationContent = negationFinalRow.find((atom) => atom.sourceShellId === inverseNegationShell.id && atom.projectionRole === "negation_content");
const negationAnchorCols = negationResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(negationAnchorCols[0], negationAnchorCols[1], "Auch im Negationsfall muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenNegationShell.visualMode, "GHOST_HOLE");
assert.equal(emergedNegationVariable.visualMode, "EMERGED");
assert.equal(inverseNegationShell.visualMode, "INVERSE_SHELL");
assert.equal(inverseNegationShell.colStart, inverseNegationShell.col, "Die Negationsschale muss auf ihrer reservierten Vorzeichen-Spalte beginnen.");
assert.equal(inverseNegationShell.colEnd, inverseNegationShell.col + 1, "Auch eine einfache Negation muss eine eigene Zusatzspalte fuer das Minuszeichen reservieren.");
assert.equal(inverseNegationSign.value, "-", "Die projizierte Negation soll ihr Vorzeichen als eigene Kindzelle ausweisen.");
assert.equal(inverseNegationSign.col, inverseNegationShell.col);
assert.equal(inverseNegationContent.value, "5");
assert.equal(inverseNegationContent.col, inverseNegationShell.col + 1);
assert.equal(initialFive.col, inverseNegationShell.col, "Die Gegenseiten-Negation darf auf der bisherigen Inhalts-Spalte beginnen und ihren Zusatzplatz erst nach rechts aufspannen.");

const fractionBirthTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "two", value: "2", type: "NUMBER", isVisible: true },
      { id: "mult", value: "*", type: "OPERATOR", isVisible: true },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "ten", value: "10", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      { id: "two", value: "2", type: "NUMBER", isVisible: false },
      { id: "mult", value: "*", type: "OPERATOR", isVisible: false },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-fraction_birth-division-from-two",
        type: "DIVISION",
        isVisible: true,
        isGenerated: true,
        numerator: [{ id: "ten", value: "10", type: "NUMBER", isVisible: true }],
        denominator: [{ id: "two", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }]
      }
    ],
    strategy: { family: "fraction_birth", action: "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR" }
  }
];

const fractionBirthResult = process(fractionBirthTheoryRows);
const fractionBirthFinalRow = fractionBirthResult.projectionRows[1].positionedAtoms;
const hiddenFactor = fractionBirthFinalRow.find((atom) => atom.id === "two" && atom.isVisible === false);
const hiddenOperator = fractionBirthFinalRow.find((atom) => atom.id === "mult" && atom.isVisible === false);
const emergedTarget = fractionBirthFinalRow.find((atom) => atom.id === "x");
const divisionShell = fractionBirthFinalRow.find((atom) => atom.type === "DIVISION");
const fractionBirthNumerator = fractionBirthFinalRow.find((atom) => atom.sourceShellId === divisionShell.id && atom.projectionRole === "numerator");
const fractionBirthLine = fractionBirthFinalRow.find((atom) => atom.sourceShellId === divisionShell.id && atom.projectionRole === "fraction_line");
const fractionBirthDenominator = fractionBirthFinalRow.find((atom) => atom.sourceShellId === divisionShell.id && atom.projectionRole === "denominator");
const fractionBirthAnchorCols = fractionBirthResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(fractionBirthAnchorCols[0], fractionBirthAnchorCols[1], "Auch im Multiplikationsfall muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenFactor.visualMode, "GHOST_HOLE");
assert.equal(hiddenOperator.visualMode, "GHOST_HOLE");
assert.equal(emergedTarget.visualMode, "EMERGED");
assert.equal(divisionShell.visualMode, "INVERSE_SHELL");
assert.notEqual(divisionShell.col, undefined);
assert.equal(fractionBirthResult.layoutPlan.visualRowCount, 4);
assert.equal(fractionBirthNumerator.col, fractionBirthLine.col);
assert.equal(fractionBirthLine.col, fractionBirthDenominator.col);
assert.equal(fractionBirthNumerator.row + 1, fractionBirthLine.row);
assert.equal(fractionBirthLine.row + 1, fractionBirthDenominator.row);

const leftAnchoredFractionBirthTheoryRows = [
  {
    rowId: "theory-left-anchored-0",
    atoms: [
      { id: "left-a", value: "a", type: "VARIABLE", isVisible: true },
      { id: "left-eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "left-rhs", value: "r", type: "VARIABLE", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-left-anchored-1",
    atoms: [
      {
        id: "generated-left-division",
        type: "DIVISION",
        isVisible: true,
        isGenerated: true,
        numerator: [{ id: "left-a", value: "a", type: "VARIABLE", isVisible: true }],
        denominator: [
          {
            id: "left-cos",
            type: "FUNCTION",
            name: "cos",
            isVisible: true,
            content: [{ id: "left-beta", value: "beta", type: "VARIABLE", isVisible: true }]
          }
        ]
      },
      { id: "left-eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "left-rhs", value: "r", type: "VARIABLE", isVisible: true }
    ],
    strategy: { family: "fraction_birth", action: "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR" }
  }
];

const leftAnchoredFractionBirthResult = process(leftAnchoredFractionBirthTheoryRows);
const leftAnchoredInitialRow = leftAnchoredFractionBirthResult.projectionRows[0].positionedAtoms;
const leftAnchoredFinalRow = leftAnchoredFractionBirthResult.projectionRows[1].positionedAtoms;
const leftAnchoredInitialA = leftAnchoredInitialRow.find((atom) => atom.id === "left-a");
const leftAnchoredDivisionShell = leftAnchoredFinalRow.find((atom) => atom.id === "generated-left-division");
const leftAnchoredDivisionNumerator = leftAnchoredFinalRow.find((atom) => (
  atom.sourceShellId === leftAnchoredDivisionShell.id && atom.projectionRole === "numerator"
));

assert.ok(leftAnchoredInitialA && leftAnchoredDivisionShell && leftAnchoredDivisionNumerator);
assert.equal(
  leftAnchoredDivisionNumerator.col,
  leftAnchoredInitialA.col,
  "Eine links erzeugte Bruchschale muss die bestehende Zaehlerspur auf derselben Spalte halten."
);

const fractionCollapseTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      {
        id: "div-shell",
        type: "DIVISION",
        isVisible: true,
        numerator: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }],
        denominator: [{ id: "two", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }]
      },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      { id: "five", value: "5", type: "NUMBER", isVisible: true }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      {
        id: "div-shell",
        type: "DIVISION",
        isVisible: false,
        numerator: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }],
        denominator: [{ id: "two", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }]
      },
      { id: "x", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-fraction_collapse-multiplication-from-two",
        type: "MULTIPLICATION",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five", value: "5", type: "NUMBER", isVisible: true }],
        factor: [{ id: "two", value: "2", type: "NUMBER", isVisible: true, position: "factor" }]
      }
    ],
    strategy: { family: "fraction_collapse", action: "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR" }
  }
];

const fractionCollapseResult = process(fractionCollapseTheoryRows);
const fractionCollapseInitialRow = fractionCollapseResult.projectionRows[0].positionedAtoms;
const fractionCollapseInitialDivision = fractionCollapseInitialRow.find((atom) => atom.id === "div-shell" && atom.type === "DIVISION");
const fractionCollapseInitialNumerator = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivision.id && atom.projectionRole === "numerator");
const fractionCollapseInitialLine = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivision.id && atom.projectionRole === "fraction_line");
const fractionCollapseInitialDenominator = fractionCollapseInitialRow.find((atom) => atom.sourceShellId === fractionCollapseInitialDivision.id && atom.projectionRole === "denominator");
const fractionCollapseFinalRow = fractionCollapseResult.projectionRows[1].positionedAtoms;
const hiddenDivision = fractionCollapseFinalRow.find((atom) => atom.id === "div-shell" && atom.isVisible === false);
const emergedNumerator = fractionCollapseFinalRow.find((atom) => atom.id === "x");
const multiplicationShell = fractionCollapseFinalRow.find((atom) => atom.type === "MULTIPLICATION");
const fractionCollapseAnchorCols = fractionCollapseResult.projectionRows.map((row) => row.positionedAtoms.find((atom) => atom.value === "=").col);

assert.equal(fractionCollapseAnchorCols[0], fractionCollapseAnchorCols[1], "Auch im Bruch-Abbau muss der Gleichheitsanker stabil bleiben.");
assert.equal(hiddenDivision.visualMode, "GHOST_HOLE");
assert.equal(emergedNumerator.visualMode, "EMERGED");
assert.equal(multiplicationShell.visualMode, "INVERSE_SHELL");
assert.notEqual(multiplicationShell.col, undefined);
assert.equal(fractionCollapseResult.layoutPlan.visualRowCount, 3);
assert.equal(fractionCollapseInitialNumerator.col, fractionCollapseInitialLine.col);
assert.equal(fractionCollapseInitialLine.col, fractionCollapseInitialDenominator.col);
assert.equal(fractionCollapseInitialNumerator.row + 1, fractionCollapseInitialLine.row);
assert.equal(fractionCollapseInitialLine.row + 1, fractionCollapseInitialDenominator.row);

const rightFractionCollapseTheoryRows = [
  {
    rowId: "theory-0",
    atoms: [
      { id: "five", value: "5", type: "NUMBER", isVisible: true },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "div-shell-right",
        type: "DIVISION",
        isVisible: true,
        numerator: [{ id: "x-right", value: "x", type: "VARIABLE", isVisible: true }],
        denominator: [{ id: "two-right", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }]
      }
    ],
    strategy: null
  },
  {
    rowId: "theory-1",
    atoms: [
      {
        id: "generated-fraction_collapse-multiplication-from-two-right",
        type: "MULTIPLICATION",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five", value: "5", type: "NUMBER", isVisible: true }],
        factor: [{ id: "two-right", value: "2", type: "NUMBER", isVisible: true, position: "factor" }]
      },
      { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "div-shell-right",
        type: "DIVISION",
        isVisible: false,
        numerator: [{ id: "x-right", value: "x", type: "VARIABLE", isVisible: true }],
        denominator: [{ id: "two-right", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }]
      },
      { id: "x-right", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true }
    ],
    strategy: { family: "fraction_collapse", action: "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR" }
  }
];

const rightFractionCollapseResult = process(rightFractionCollapseTheoryRows);
const rightFractionCollapseInitialRow = rightFractionCollapseResult.projectionRows[0].positionedAtoms;
const rightFractionCollapseFinalRow = rightFractionCollapseResult.projectionRows[1].positionedAtoms;
const rightFractionCollapseInitialNumerator = rightFractionCollapseInitialRow.find(
  (atom) => atom.sourceAtomId === "x-right" && atom.projectionRole === "numerator"
);
const rightFractionCollapseAnchor = rightFractionCollapseFinalRow.find((atom) => atom.value === "=");
const rightFractionCollapseShell = rightFractionCollapseFinalRow.find((atom) => atom.id === "generated-fraction_collapse-multiplication-from-two-right");
const rightFractionCollapseShellAtoms = rightFractionCollapseFinalRow.filter(
  (atom) => atom.sourceShellId === rightFractionCollapseShell.id
);
const rightFractionCollapseShellMaxCol = Math.max(
  ...rightFractionCollapseShellAtoms.map((atom) => atom.colEnd ?? atom.col)
);
const rightFractionCollapseEmerged = rightFractionCollapseFinalRow.find((atom) => atom.id === "x-right");

assert.ok(rightFractionCollapseAnchor, "Auch rechts muss der Gleichheitsanker sichtbar bleiben.");
assert.ok(rightFractionCollapseShell, "Auch rechts muss die inverse Multiplikationsschale sichtbar entstehen.");
assert.equal(rightFractionCollapseShell.visualMode, "INVERSE_SHELL");
assert.equal(rightFractionCollapseEmerged.visualMode, "EMERGED");
assert.equal(
  rightFractionCollapseInitialNumerator.col,
  rightFractionCollapseEmerged.col,
  "Auch rechts muss der freigelegte Zaehler exakt auf seiner bisherigen Spalte wieder auftauchen."
);
assert.ok(
  rightFractionCollapseShellMaxCol < rightFractionCollapseAnchor.col,
  "Eine links erzeugte inverse Multiplikationsschale darf den Gleichheitsanker nicht ueberdecken."
);

const rightPrefixedTheoryRows = [
  {
    rowId: "theory-0-prefix-right",
    atoms: [
      { id: "x-prefix", value: "x", type: "VARIABLE", isVisible: true },
      { id: "eq-prefix", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "asin-shell-prefix",
        type: "FUNCTION",
        name: "asin",
        isVisible: true,
        isGenerated: true,
        content: [{ id: "five-prefix", value: "5", type: "NUMBER", isVisible: true }]
      }
    ],
    strategy: { family: "trig_inverse", action: "INVERT_TO_ASIN" }
  },
  {
    rowId: "theory-1-prefix-right",
    atoms: [
      { id: "x-prefix", value: "x", type: "VARIABLE", isVisible: true, isBefreit: true },
      { id: "eq-prefix", value: "=", type: "ANCHOR", isVisible: true },
      {
        id: "generated-fraction_collapse-multiplication-from-two-prefix",
        type: "MULTIPLICATION",
        isVisible: true,
        isGenerated: true,
        flowDirection: "rtl",
        content: [
          {
            id: "asin-shell-prefix",
            type: "FUNCTION",
            name: "asin",
            isVisible: true,
            isGenerated: true,
            content: [{ id: "five-prefix", value: "5", type: "NUMBER", isVisible: true }]
          }
        ],
        factor: [{ id: "two-prefix", value: "2", type: "NUMBER", isVisible: true, position: "factor" }]
      }
    ],
    strategy: { family: "fraction_collapse", action: "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR" }
  }
];

const rightPrefixedResult = process(rightPrefixedTheoryRows);
const rightPrefixedInitialRow = rightPrefixedResult.projectionRows[0].positionedAtoms;
const rightPrefixedFinalRow = rightPrefixedResult.projectionRows[1].positionedAtoms;
const rightPrefixedInitialFunction = rightPrefixedInitialRow.find((atom) => atom.id === "asin-shell-prefix");
const rightPrefixedShell = rightPrefixedFinalRow.find((atom) => atom.id === "generated-fraction_collapse-multiplication-from-two-prefix");
const rightPrefixedContent = rightPrefixedFinalRow.find((atom) => atom.id === "generated-fraction_collapse-multiplication-from-two-prefix::content::asin-shell-prefix");
const rightPrefixedOperator = rightPrefixedFinalRow.find((atom) => atom.id === "generated-fraction_collapse-multiplication-from-two-prefix::operator");
const rightPrefixedFactor = rightPrefixedFinalRow.find((atom) => atom.id === "generated-fraction_collapse-multiplication-from-two-prefix::factor::two-prefix");

assert.ok(rightPrefixedInitialFunction && rightPrefixedShell && rightPrefixedContent && rightPrefixedOperator && rightPrefixedFactor);
assert.equal(
  rightPrefixedInitialFunction.col,
  rightPrefixedContent.col,
  "Auch bei rechts praefixierter Faktorstellung muss der bisherige Inhalt auf seiner Spalte bleiben."
);
assert.ok(
  rightPrefixedFactor.col < rightPrefixedOperator.col && rightPrefixedOperator.col < rightPrefixedContent.col,
  "Die generelle Reservelogik muss rechts auch praefixierte Faktoren vor dem vorhandenen Inhalt unterbringen koennen."
);

console.log("✅ P4 Validierung erfolgreich.");
