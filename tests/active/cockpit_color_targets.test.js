import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { resolveElementColorForCell } from "../../presentation/shell_colors/index.js";
import { deriveColorTargets } from "../../scripts/cockpit_server.mjs";

function findTarget(targets, family) {
    return targets.find((target) => target.family === family) || null;
}

function hasSelector(target, selectorType, selectorValue) {
    return (target?.selectors || []).some((selector) => (
        selector.selectorType === selectorType && selector.selectorValue === selectorValue
    ));
}

const theoryChildCollections = [
    "content",
    "baseContent",
    "degreeNodes",
    "exponentNodes",
    "numerator",
    "denominator",
    "factors",
    "operators",
    "terms",
    "minuend",
    "subtrahend"
];

function findTheoryNode(nodes, predicate) {
    const stack = Array.isArray(nodes) ? [...nodes] : [];

    while (stack.length > 0) {
        const node = stack.shift();
        if (!node) {
            continue;
        }

        if (predicate(node)) {
            return node;
        }

        theoryChildCollections.forEach((key) => {
            if (Array.isArray(node[key])) {
                stack.unshift(...node[key]);
            }
        });

        if (node.operator && typeof node.operator === "object") {
            stack.unshift(node.operator);
        }
    }

    return null;
}

const result = await GenesisCore.solve(
    "a^2+b^2-2*a*b*cos(gamma)=c^2",
    {
        runtimeEngine: "genesis_runtime",
        targetVariable: "gamma"
    }
);
assert.ok(!result.fehler, result.fehler);

const viewModel = buildWorksheetViewModel(result);
const targets = deriveColorTargets(result, viewModel, []);
assert.deepEqual(
    targets.map((target) => target.family),
    ["target_variable", "subtrahend_release", "subtracted_sum_release", "fraction_birth", "trig_inverse"],
    "Das Cockpit darf nur die vier tatsaechlichen Core-Schritte und das Zielatom anbieten."
);

const targetVariableTarget = findTarget(targets, "target_variable");
const gammaId = result.exportData.outputContract.theoryRows[0].left[0]
    .subtrahend[0].factors[3].content[0].id;
assert.deepEqual(targetVariableTarget.selectors, [{ selectorType: "atom", selectorValue: gammaId }]);

const sourceAddition = result.exportData.outputContract.theoryRows[0].left[0].minuend[0];
const generatedSubtraction = result.exportData.outputContract.theoryRows[1].right.find((node) => (
    node.type === "SUBTRACTION" && node.generatedByFamily === "subtrahend_release"
));
const bindingGroup = generatedSubtraction?.subtrahend?.[0];
const subtrahendTarget = findTarget(targets, "subtrahend_release");

assert.equal(subtrahendTarget?.previewLabel, "+(a^2+b^2) -> -(a^2+b^2)");
assert.ok(hasSelector(subtrahendTarget, "shell-id", sourceAddition.id));
assert.ok(hasSelector(subtrahendTarget, "atom", sourceAddition.terms[0].content[0].id));
assert.ok(hasSelector(subtrahendTarget, "atom", sourceAddition.operators[0].id));
assert.ok(hasSelector(subtrahendTarget, "shell-id", bindingGroup.id));

const distributedTarget = findTarget(targets, "subtracted_sum_release");
assert.equal(distributedTarget?.previewLabel, "Negative Summenklammer aufloesen");
assert.ok(hasSelector(distributedTarget, "shell-id", bindingGroup.id));

const fractionTarget = findTarget(targets, "fraction_birth");
const generatedDivision = result.exportData.outputContract.theoryRows[3].right.find((node) => (
    node.type === "DIVISION" && node.generatedByFamily === "fraction_birth"
));
const denominatorShell = generatedDivision?.denominator?.[0];
assert.equal(fractionTarget?.previewLabel, "-2*a*b -> Nenner");
assert.ok(hasSelector(fractionTarget, "shell-id", denominatorShell.id));

const trigTarget = findTarget(targets, "trig_inverse");
const sourceCosId = result.exportData.outputContract.theoryRows[0].left[0].subtrahend[0].factors[3].id;
const generatedAcosId = result.exportData.outputContract.theoryRows[4].right.find((node) => (
    node.type === "FUNCTION" && node.name === "acos" && node.generatedByFamily === "trig_inverse"
))?.id;
assert.equal(trigTarget?.previewLabel, "cos( ) -> acos( )");
assert.ok(hasSelector(trigTarget, "atom", sourceCosId));
assert.ok(hasSelector(trigTarget, "atom", generatedAcosId));
assert.ok(
    !hasSelector(trigTarget, "shell-id", sourceCosId),
    "Die Farbe der cos-Huelle darf nicht ueber sourceShellId auf gamma uebergreifen."
);
assert.ok(
    !hasSelector(trigTarget, "shell-id", generatedAcosId),
    "Auch die acos-Huelle muss ohne breiten Argument-Selektor adressiert werden."
);

const trigPolicy = {
    fallback: "none",
    ruleSpec: trigTarget.selectors
        .map((selector) => `${selector.selectorType}:${selector.selectorValue}=#D97706`)
        .join(";")
};
const gammaCells = viewModel.steps.flatMap((step) => step.cells).filter((cell) => (
    cell.sourceAtomId === gammaId
));
const functionChromeCells = viewModel.steps.flatMap((step) => step.cells).filter((cell) => (
    [sourceCosId, generatedAcosId].includes(cell.sourceAtomId)
));
assert.ok(gammaCells.length > 0 && functionChromeCells.length > 0);
gammaCells.forEach((cell) => {
    assert.equal(
        resolveElementColorForCell(cell, trigPolicy),
        null,
        "Das Zielatom gamma darf die Farbe der Funktionsumkehr nicht erben."
    );
});
functionChromeCells.forEach((cell) => {
    assert.equal(
        resolveElementColorForCell(cell, trigPolicy)?.hex,
        "#D97706",
        "Funktionsname und Funktionsklammern muessen die Farbe der Funktionsumkehr erhalten."
    );
});

const pythagorasResult = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});
const pythagorasTargets = deriveColorTargets(
    pythagorasResult,
    buildWorksheetViewModel(pythagorasResult),
    []
);
const pythagorasAddition = findTarget(pythagorasTargets, "addition_release");
const sourceBId = pythagorasResult.exportData.outputContract.theoryRows[0].left[0].terms[1].content[0].id;
assert.equal(pythagorasAddition?.previewLabel, "+b^2 -> -b^2");
assert.ok(hasSelector(pythagorasAddition, "atom", sourceBId));

const pythagorasRootPower = findTarget(pythagorasTargets, "root_power");
const sourcePower = pythagorasResult.exportData.outputContract.theoryRows[0].left[0].terms[0];
const generatedRoot = findTheoryNode(
    pythagorasResult.exportData.outputContract.theoryRows[2].right,
    (node) => (
        node.type === "ROOT"
        && node.generatedByFamily === "root_power"
        && node.originTargetId === sourcePower.id
    )
);
assert.ok(generatedRoot, "Die von root_power erzeugte Wurzelschale muss auffindbar sein.");
assert.ok(hasSelector(pythagorasRootPower, "shell-id", sourcePower.id));
assert.ok(
    hasSelector(pythagorasRootPower, "shell-id", generatedRoot.id),
    "Das Farbziel der Schalenumkehr muss die erzeugte Wurzelschale enthalten."
);

const rootPowerPolicy = {
    fallback: "none",
    ruleSpec: pythagorasRootPower.selectors
        .map((selector) => `${selector.selectorType}:${selector.selectorValue}=#D97706`)
        .join(";")
};
const pythagorasViewModel = buildWorksheetViewModel(pythagorasResult);
const rootHookCell = pythagorasViewModel.steps[2].cells.find((cell) => cell.projectionRole === "root_hook");
const rootOverbarCell = pythagorasViewModel.steps[2].cells.find((cell) => cell.projectionRole === "root_overbar");
assert.equal(resolveElementColorForCell(rootHookCell, rootPowerPolicy)?.hex, "#D97706");
assert.equal(resolveElementColorForCell(rootOverbarCell, rootPowerPolicy)?.hex, "#D97706");

const sineLawResult = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "beta"
});
assert.ok(!sineLawResult.fehler, sineLawResult.fehler);

const sineLawTargets = deriveColorTargets(
    sineLawResult,
    buildWorksheetViewModel(sineLawResult),
    []
);
const reciprocalFactorTarget = findTarget(sineLawTargets, "fraction_birth");
const sineLawRows = sineLawResult.exportData.outputContract.theoryRows;
const sourceDivision = sineLawRows[0].left[0];
const sourceNumerator = sourceDivision.numerator[0];
const sourceDivisionOperator = sourceDivision.operator;
const sourceDenominator = sourceDivision.denominator[0];
const sourceDenominatorArgument = sourceDenominator.content[0];
const reciprocalDivision = findTheoryNode(sineLawRows[2].right, (node) => (
    node.type === "DIVISION"
    && node.generatedByFamily === "fraction_birth"
    && node.reciprocalOfShellId === sourceDivision.id
));

assert.ok(reciprocalDivision, "Der erzeugte Kehrbruch muss in der Ergebniszeile auffindbar sein.");
assert.equal(reciprocalFactorTarget?.targetKind, "reciprocal_factor");
assert.equal(
    reciprocalFactorTarget?.previewLabel,
    "(a) / (sin(alpha)) -> (sin(alpha)) / (a)",
    "Das Farbziel muss den ganzen Bruch vor und nach der Kehrbruchbildung bezeichnen."
);
[
    ["shell-id", sourceDivision.id],
    ["atom", sourceNumerator.id],
    ["atom", sourceDivisionOperator.id],
    ["shell-id", sourceDenominator.id],
    ["atom", sourceDenominatorArgument.id],
    ["shell-id", reciprocalDivision.id],
    ["atom", reciprocalDivision.operator.id]
].forEach(([selectorType, selectorValue]) => {
    assert.ok(
        hasSelector(reciprocalFactorTarget, selectorType, selectorValue),
        `Das ganze Kehrbruch-Farbziel muss ${selectorType}:${selectorValue} enthalten.`
    );
});

console.log("Cockpit-Farbziele erfolgreich geprueft.");
