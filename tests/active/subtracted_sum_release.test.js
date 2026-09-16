import assert from "node:assert/strict";

import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import { runStrategyPhase } from "../../core/GenesisRuntime/P2_Strategy/runStrategyPhase.js";
import { runTransformationPhase } from "../../core/GenesisRuntime/P3_Transformation/runTransformationPhase.js";

const request = {
    equation: "x=c-(a+b+d)",
    requestedTargetVariable: "x"
};
const inputPhase = await runInputPhase({ request });
const strategyPhase = await runStrategyPhase({ request, inputPhase });

assert.equal(strategyPhase.nextDecision?.family, "subtracted_sum_release");
assert.equal(strategyPhase.nextDecision?.equationSide, "right");
assert.equal(strategyPhase.nextDecision?.action, "DISTRIBUTE_SUBTRACTION_OVER_GROUPED_SUM");
assert.deepEqual(strategyPhase.nextDecision?.summandExpressionIds?.length, 3);

const originalRight = strategyPhase.equationSides.right.find((node) => node?.isVisible !== false);
const originalAddition = originalRight.subtrahend[0].content[0];
const originalTermIds = originalAddition.terms.map((node) => node.id);
const transformation = await runTransformationPhase({ inputPhase, strategyPhase });
const anchorIndex = transformation.nextStructure.findIndex((node) => node?.type === "ANCHOR");
const visibleLeft = transformation.nextStructure
    .slice(0, anchorIndex)
    .filter((node) => node?.isVisible !== false);
const visibleRight = transformation.nextStructure
    .slice(anchorIndex + 1)
    .filter((node) => node?.isVisible !== false);

assert.equal(visibleLeft.length, 1);
assert.equal(visibleLeft[0].value, "x", "Die Zielseite muss unveraendert bleiben.");
assert.equal(visibleRight.length, 1);

const outerSubtraction = visibleRight[0];
assert.equal(outerSubtraction.type, "SUBTRACTION");
assert.equal(outerSubtraction.subtrahend[0].id, originalTermIds[2]);
assert.equal(outerSubtraction.minuend[0].type, "SUBTRACTION");
assert.equal(outerSubtraction.minuend[0].subtrahend[0].id, originalTermIds[1]);
assert.equal(outerSubtraction.minuend[0].minuend[0].type, "SUBTRACTION");
assert.equal(outerSubtraction.minuend[0].minuend[0].subtrahend[0].id, originalTermIds[0]);
assert.equal(outerSubtraction.minuend[0].minuend[0].minuend[0].value, "c");

const visibleTypes = JSON.stringify(visibleRight);
assert.doesNotMatch(visibleTypes, /"type":"GROUP"/);
assert.doesNotMatch(visibleTypes, /"type":"ADDITION"/);

console.log("subtracted_sum_release verteilt ein aeusseres Minus allgemein ueber eine gruppierte Summe.");
