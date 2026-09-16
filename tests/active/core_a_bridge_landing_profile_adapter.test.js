import assert from "node:assert/strict";

import * as coreA from "../../core_a/index.js";
import * as bridgeB from "../../bridge_b/index.js";
import { BRIDGE_STATE_CONTRACT_VERSION } from "../../contracts/bridge_state/index.js";

function assertStrictlyIncreasing(values = []) {
    for (let index = 1; index < values.length; index += 1) {
        assert.ok(
            values[index] > values[index - 1],
            `Slotfolge muss streng steigen, bekam ${values.join(", ")}.`
        );
    }
}

function assertConsecutive(values = []) {
    for (let index = 1; index < values.length; index += 1) {
        assert.equal(
            values[index],
            values[index - 1] + 1,
            `Bridge-Termslots muessen lueckenlos auf der Normalachse liegen, bekam ${values.join(", ")}.`
        );
    }
}

const leftSolveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve("y=a*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

const leftBoundaryState = coreA.buildBridgeBoundaryStateFromSolveState(leftSolveState);
const leftLandingProfile = coreA.buildBridgeLandingProfileFromSolveState(leftSolveState);
const leftLandingState = bridgeB.buildBridgeLandingState(leftBoundaryState, leftLandingProfile);

assert.equal(leftLandingProfile.variant, "left");
assert.equal(leftLandingProfile.preview_equation, "log_B(y/a) = 2x-1");
assert.equal(leftLandingProfile.equals_anchor_x, leftBoundaryState.anchors.equals.x);
assert.equal(leftLandingProfile.term_side, "right");
assert.equal(leftLandingProfile.carry_through_side, "left");
assert.equal(leftLandingProfile.stories.operator_target.text, "log_B");
assert.equal(leftLandingProfile.stories.content_target.text, "2x-1");
assert.equal(leftLandingProfile.source_trace.derivation_mode, "isolated_a2_probe");
assert.equal(leftLandingProfile.source_exponent_track_count, 1);
assert.equal(leftLandingProfile.term_slots.length, 5);
assertStrictlyIncreasing(leftLandingProfile.term_slots.map((slot) => slot.x));
assertConsecutive(leftLandingProfile.term_slots.map((slot) => slot.x));
assert.deepEqual(leftLandingState.layout.term_slots, leftLandingProfile.term_slots.map((slot) => slot.x));

const rightSolveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve("B^(2x-1)=y/a", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

const rightBoundaryState = coreA.buildBridgeBoundaryStateFromSolveState(rightSolveState);
const rightLandingProfile = coreA.buildBridgeLandingProfileFromSolveState(rightSolveState);
const rightLandingState = bridgeB.buildBridgeLandingState(rightBoundaryState, rightLandingProfile);

assert.equal(rightLandingProfile.variant, "right");
assert.equal(rightLandingProfile.preview_equation, "2x-1 = log_B(y/a)");
assert.equal(rightLandingProfile.equals_anchor_x, rightBoundaryState.anchors.equals.x);
assert.equal(rightLandingProfile.term_side, "left");
assert.equal(rightLandingProfile.carry_through_side, "right");
assert.equal(rightLandingProfile.stories.operator_target.text, "log_B");
assert.equal(rightLandingProfile.stories.content_target.text, "2x-1");
assert.equal(rightLandingProfile.source_trace.derivation_mode, "isolated_a2_probe");
assert.equal(rightLandingProfile.term_slots.length, 5);
assertStrictlyIncreasing(rightLandingProfile.term_slots.map((slot) => slot.x));
assertConsecutive(rightLandingProfile.term_slots.map((slot) => slot.x));
assert.deepEqual(rightLandingState.layout.term_slots, rightLandingProfile.term_slots.map((slot) => slot.x));

const groupedSolveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve("y-2=(a+2)*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

const groupedBoundaryState = coreA.buildBridgeBoundaryStateFromSolveState(groupedSolveState);
const groupedLandingProfile = coreA.buildBridgeLandingProfileFromSolveState(groupedSolveState);

assert.equal(groupedLandingProfile.preview_equation, "log_B((y-2)/(a+2)) = 2x-1");
assert.equal(groupedLandingProfile.equals_anchor_x, groupedBoundaryState.anchors.equals.x);
assert.equal(groupedLandingProfile.term_slots.length, 5);
assertStrictlyIncreasing(groupedLandingProfile.term_slots.map((slot) => slot.x));
assertConsecutive(groupedLandingProfile.term_slots.map((slot) => slot.x));
assert.ok(
    groupedLandingProfile.carry_through_zone.x < groupedLandingProfile.equals_anchor_x,
    "Die Carry-Through-Zone muss links vom Gleichheitsanker bleiben."
);
assert.ok(
    groupedLandingProfile.carry_through_zone.width > 0,
    "Die Carry-Through-Zone muss eine positive Breite haben."
);
assert.ok(
    groupedLandingProfile.term_zone.x > groupedLandingProfile.equals_anchor_x,
    "Die Zielterm-Zone muss rechts vom Gleichheitsanker beginnen."
);

const naturalSolveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve("(2*a-1)=e^(2*x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

const naturalBoundaryState = coreA.buildBridgeBoundaryStateFromSolveState(naturalSolveState);
const naturalLandingProfile = coreA.buildBridgeLandingProfileFromSolveState(naturalSolveState);
const naturalLandingState = bridgeB.buildBridgeLandingState(naturalBoundaryState, naturalLandingProfile);

assert.equal(naturalLandingProfile.preview_equation, "ln((2*a-1)) = 2*x-1");
assert.equal(naturalLandingProfile.stories.operator_target.text, "ln");
assert.equal(naturalLandingProfile.stories.content_target.text, "2*x-1");
assert.equal(naturalLandingState.equation_text, "ln((2*a-1)) = 2*x-1");
assert.equal(naturalLandingProfile.term_slots.length, 5);
assertStrictlyIncreasing(naturalLandingProfile.term_slots.map((slot) => slot.x));
assertConsecutive(naturalLandingProfile.term_slots.map((slot) => slot.x));
assert.deepEqual(naturalLandingState.layout.term_slots, naturalLandingProfile.term_slots.map((slot) => slot.x));

assert.throws(
    () => coreA.buildBridgeLandingProfileFromSolveState({
        eingabe: "x/2=5",
        targetVariable: "x",
        schritte: [],
        exportData: {
            theoryRows: [],
            projectionRows: [],
            layoutPlan: {}
        }
    }),
    /power_exponent_release/
);

const landingManifest = coreA.buildCoreABridgeLandingProfileAdapterManifest();
assert.equal(landingManifest.adapterType, "solve_state_to_landing_profile");
assert.equal(landingManifest.bridgeStateContractVersion, BRIDGE_STATE_CONTRACT_VERSION);
assert.equal(landingManifest.bridgeState.version, BRIDGE_STATE_CONTRACT_VERSION);
assert.ok(landingManifest.invariants.some((line) => line.includes("isolierten A2-Probelauf")));

console.log("core_a Bridge-Landing-Profile-Adapter erfolgreich geprueft.");
