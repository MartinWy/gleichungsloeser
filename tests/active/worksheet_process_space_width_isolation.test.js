import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

function itemCenterX(item, displayLayout) {
    const left = displayLayout.starts[item.displayStartSlot];
    const right = displayLayout.starts[item.displayEndSlot]
        + displayLayout.slots[item.displayEndSlot].width;

    return (left + right) / 2;
}

function findDisplayItem(displayModel, predicate, message) {
    const item = displayModel.items.find((candidate) => predicate(candidate.cell));
    assert.ok(item, message);
    return item;
}

function assertCoordinateEqual(actual, expected, message) {
    assert.ok(
        Math.abs(actual - expected) < 1e-9,
        `${message} (${actual} !== ${expected})`
    );
}

function isolateProcessSpace(viewModel, processSpaceId) {
    const steps = viewModel.steps.filter((step) => step.processSpaceId === processSpaceId);
    const stepIndices = new Set(
        viewModel.steps
            .map((step, stepIndex) => ({ step, stepIndex }))
            .filter(({ step }) => step.processSpaceId === processSpaceId)
            .map(({ stepIndex }) => stepIndex)
    );

    return {
        ...viewModel,
        steps,
        layout: {
            ...viewModel.layout,
            cells: viewModel.layout.cells.filter((cell) => stepIndices.has(cell.stepIndex))
        }
    };
}

const equation = "a-1=2*e^(2*x-1)";
const solveState = await GenesisCore.solve(equation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!solveState?.fehler, solveState?.fehler || "Der A1-Lauf muss gueltig sein.");

const bridgedResult = buildBridgeWorksheetSolveResultFromSolveState(solveState, equation, "x");
const boundaryRowCount = bridgedResult.bridgeMeta.boundaryRowCount;
const projectionRows = bridgedResult.exportData.outputContract.projectionRows;

assert.deepEqual(
    projectionRows.map((row) => row.processSpaceId),
    projectionRows.map((_, index) => index < boundaryRowCount ? "a1" : "a2"),
    "Der Handoff muss die A1-Zeilen und die von B gesetzte A2-Landung explizit trennen."
);

const viewModel = buildWorksheetViewModel(bridgedResult);

viewModel.steps.forEach((step, stepIndex) => {
    const expectedSpace = stepIndex < boundaryRowCount ? "a1" : "a2";
    assert.equal(step.processSpaceId, expectedSpace);
    step.cells.forEach((cell) => {
        assert.equal(
            cell.processSpaceId,
            expectedSpace,
            "Das ViewModel muss den gelieferten Prozessraum unveraendert an jede Zelle weiterreichen."
        );
    });
});

const fullDisplayModel = buildWorksheetDisplayModel(viewModel, "standard");
const isolatedA1DisplayModel = buildWorksheetDisplayModel(isolateProcessSpace(viewModel, "a1"), "standard");
const isolatedA2DisplayModel = buildWorksheetDisplayModel(isolateProcessSpace(viewModel, "a2"), "standard");

const a1FactorPredicate = (cell) => (
    cell.stepIndex === 0
    && cell.rowKind === "axis"
    && cell.side === "right"
    && cell.text === "2"
    && cell.projectionRole === "content"
);
const a1OperatorPredicate = (cell) => (
    cell.stepIndex === 0
    && cell.rowKind === "axis"
    && cell.side === "right"
    && cell.projectionRole === "product_operator"
);
const landingStepIndex = boundaryRowCount;
const landingFactorPredicate = (cell) => (
    cell.stepIndex === landingStepIndex
    && cell.rowKind === "axis"
    && cell.side === "right"
    && cell.text === "2"
);
const landingOperatorPredicate = (cell) => (
    cell.stepIndex === landingStepIndex
    && cell.rowKind === "axis"
    && cell.side === "right"
    && cell.projectionRole === "product_operator"
);

const fullA1Factor = findDisplayItem(fullDisplayModel, a1FactorPredicate, "A1-Faktor 2 fehlt.");
const fullA1Operator = findDisplayItem(fullDisplayModel, a1OperatorPredicate, "A1-Multiplikationsoperator fehlt.");
const isolatedA1Factor = findDisplayItem(isolatedA1DisplayModel, a1FactorPredicate, "Isolierter A1-Faktor fehlt.");
const isolatedA1Operator = findDisplayItem(isolatedA1DisplayModel, a1OperatorPredicate, "Isolierter A1-Operator fehlt.");

assertCoordinateEqual(
    itemCenterX(fullA1Operator, fullDisplayModel.displayLayout)
        - itemCenterX(fullA1Factor, fullDisplayModel.displayLayout),
    itemCenterX(isolatedA1Operator, isolatedA1DisplayModel.displayLayout)
        - itemCenterX(isolatedA1Factor, isolatedA1DisplayModel.displayLayout),
    "B/A2 darf den Abstand zweier A1-Zellen nicht rueckwirkend verbreitern."
);

const fullLandingFactor = findDisplayItem(fullDisplayModel, landingFactorPredicate, "B-Landing-Faktor fehlt.");
const fullLandingOperator = findDisplayItem(fullDisplayModel, landingOperatorPredicate, "B-Landing-Operator fehlt.");
const isolatedLandingFactor = findDisplayItem(isolatedA2DisplayModel, landingFactorPredicate, "Isolierter Landing-Faktor fehlt.");
const isolatedLandingOperator = findDisplayItem(isolatedA2DisplayModel, landingOperatorPredicate, "Isolierter Landing-Operator fehlt.");

assertCoordinateEqual(
    itemCenterX(fullLandingOperator, fullDisplayModel.displayLayout)
        - itemCenterX(fullLandingFactor, fullDisplayModel.displayLayout),
    itemCenterX(isolatedLandingOperator, isolatedA2DisplayModel.displayLayout)
        - itemCenterX(isolatedLandingFactor, isolatedA2DisplayModel.displayLayout),
    "A1 darf die kompakte B-Landung und den A2-Raum nicht verbreitern."
);

const anchorCenters = viewModel.steps.map((step, stepIndex) => {
    const anchor = findDisplayItem(
        fullDisplayModel,
        (cell) => cell.stepIndex === stepIndex && cell.projectionRole === "anchor",
        `Gleichheitsanker in Schritt ${stepIndex + 1} fehlt.`
    );
    return itemCenterX(anchor, fullDisplayModel.displayLayout);
});

anchorCenters.slice(1).forEach((center) => {
    assertCoordinateEqual(center, anchorCenters[0], "Getrennte Prozessraeume muessen am Gleichheitsanker ausgerichtet bleiben.");
});

console.log("A1- und A2-Breitenprofile bleiben am Bridge-Wechsel beidseitig isoliert.");
