import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";
import { buildBridgeWorksheetSolveResultFromSolveState } from "../../projects/complex_exponent_transition/real_bridge_handoff/index.js";

function itemCenterX(item, displayLayout) {
    const startIndex = item.displayStartSlot;
    const endIndex = item.displayEndSlot;
    const left = displayLayout.starts[startIndex];
    const right = displayLayout.starts[endIndex] + displayLayout.slots[endIndex].width;

    return (left + right) / 2;
}

function assertStableAtomicIdentitiesWithinProcess(result, label) {
    const viewModel = buildWorksheetViewModel(result);
    const displayModel = buildWorksheetDisplayModel(viewModel, "standard");
    const histories = new Map();

    displayModel.items
        .filter((item) => String(item?.cell?.sourceAtomId || "").startsWith("atom-"))
        .forEach((item) => {
            const key = `${item.cell.sourceAtomId}::${item.cell.side}`;
            const history = histories.get(key) || [];
            history.push(itemCenterX(item, displayModel.displayLayout));
            histories.set(key, history);
        });

    let comparedHistories = 0;
    histories.forEach((centers, key) => {
        if (centers.length < 2) {
            return;
        }

        comparedHistories += 1;
        centers.slice(1).forEach((center) => {
            assert.equal(
                center,
                centers[0],
                `${label}: Die atomare Identitaet ${key} darf innerhalb ihres Prozessraums physisch nicht driften.`
            );
        });
    });

    assert.ok(comparedHistories > 0, `${label}: Der Beweis braucht wiederholte atomare Identitaeten.`);
}

for (const targetVariable of ["a", "b", "alpha", "beta"]) {
    const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
        runtimeEngine: "genesis_runtime",
        targetVariable
    });

    assert.ok(!result?.fehler, result?.fehler || `Der Lauf nach ${targetVariable} muss gueltig sein.`);
    assertStableAtomicIdentitiesWithinProcess(result, `Ziel ${targetVariable}`);
}

const bridgeEquation = "a-2=c*2^(x-1)";
const bridgeCoreResult = await GenesisCore.solve(bridgeEquation, {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
const bridgeResult = buildBridgeWorksheetSolveResultFromSolveState(
    bridgeCoreResult,
    bridgeEquation,
    "x"
);
const bridgeViewModel = buildWorksheetViewModel(bridgeResult);
const bridgeDisplayModel = buildWorksheetDisplayModel(bridgeViewModel, "standard");
const landingStepIndex = bridgeResult.bridgeMeta.boundaryRowCount;
const targetItems = bridgeDisplayModel.items.filter((item) => item?.cell?.text === "x");
const boundaryTarget = targetItems.find((item) => item.cell.stepIndex === landingStepIndex - 1);
const landingTarget = targetItems.find((item) => item.cell.stepIndex === landingStepIndex);
const continuationTarget = targetItems.find((item) => item.cell.stepIndex === landingStepIndex + 1);

assert.ok(boundaryTarget && landingTarget && continuationTarget);
assert.notEqual(
    itemCenterX(boundaryTarget, bridgeDisplayModel.displayLayout),
    itemCenterX(landingTarget, bridgeDisplayModel.displayLayout),
    "Bridge B muss die alte POWER-Spur verlassen und genau eine neue lokale Termlage beginnen."
);
assert.equal(
    itemCenterX(landingTarget, bridgeDisplayModel.displayLayout),
    itemCenterX(continuationTarget, bridgeDisplayModel.displayLayout),
    "A2 muss die von Bridge B gesetzte physische Termlage ohne zweiten Sprung uebernehmen."
);

console.log("Atomidentitaeten bleiben innerhalb eines Prozessraums physisch positionstreu.");
