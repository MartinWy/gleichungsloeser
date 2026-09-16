import assert from "node:assert/strict";

import {
  BOUNDARY_STATE_TEMPLATE,
  LANDING_PROFILE_TEMPLATE,
  BRIDGE_STEP_OPERATION,
  buildBridgeLandingState,
  buildBridgeTransitionManifest,
  validateBridgeStepInput
} from "../../bridge_b/index.js";

const leftBoundaryState = structuredClone(BOUNDARY_STATE_TEMPLATE);
const leftLandingProfile = structuredClone(LANDING_PROFILE_TEMPLATE);

const leftValidation = validateBridgeStepInput(leftBoundaryState, leftLandingProfile);
assert.equal(leftValidation.variant, "left");

const leftLandingState = buildBridgeLandingState(leftBoundaryState, leftLandingProfile);
assert.equal(leftLandingState.equation_text, "log_B(y/a) = 2x-1");
assert.equal(leftLandingState.anchors.equals.x, 310);
assert.deepEqual(leftLandingState.layout.term_slots, [466, 514, 570, 616, 664]);
assert.equal(leftLandingState.layout.source_exponent_track_count, 1);
assert.equal(leftLandingState.layout.target_term_track_count, 5);
assert.equal(leftLandingState.stories.operator.source, "B");
assert.equal(leftLandingState.stories.operator.target, "log_B");
assert.equal(leftLandingState.stories.content.source, "2x-1");
assert.equal(leftLandingState.step_meta.operation_type, BRIDGE_STEP_OPERATION);
assert.equal(leftLandingState.step_meta.no_second_jump, true);

const rightBoundaryState = structuredClone(BOUNDARY_STATE_TEMPLATE);
rightBoundaryState.variant = "right";
rightBoundaryState.equation_text = "B^(2x-1) = y/a";
rightBoundaryState.power_shell.side = "left";
rightBoundaryState.carry_through.side = "right";

const rightLandingProfile = structuredClone(LANDING_PROFILE_TEMPLATE);
rightLandingProfile.variant = "right";
rightLandingProfile.preview_equation = "2x-1 = log_B(y/a)";
rightLandingProfile.term_side = "left";
rightLandingProfile.carry_through_side = "right";
rightLandingProfile.term_zone = { x: 54, width: 220 };
rightLandingProfile.term_slots = [
  { role: "content_1", x: 72 },
  { role: "content_2", x: 118 },
  { role: "content_3", x: 166 },
  { role: "content_4", x: 210 },
  { role: "content_5", x: 258 }
];
rightLandingProfile.carry_through_zone = { x: 418, width: 236 };

const rightLandingState = buildBridgeLandingState(rightBoundaryState, rightLandingProfile);
assert.equal(rightLandingState.equation_text, "2x-1 = log_B(y/a)");
assert.deepEqual(rightLandingState.layout.term_slots, [72, 118, 166, 210, 258]);
assert.equal(rightLandingState.stories.carry_through.side, "right");

assert.throws(
  () => buildBridgeLandingState(
    leftBoundaryState,
    {
      ...leftLandingProfile,
      equals_anchor_x: 311
    }
  ),
  /Gleichheitsanker/,
  "Ein abweichender Gleichheitsanker muss den Bridge-Schritt stoppen."
);

assert.throws(
  () => buildBridgeLandingState(
    leftBoundaryState,
    {
      ...leftLandingProfile,
      no_second_jump: false
    }
  ),
  /no_second_jump/,
  "Wenn A2 keinen sprungfreien Start garantiert, darf B keinen landing_state bauen."
);

assert.throws(
  () => buildBridgeLandingState(
    leftBoundaryState,
    {
      ...leftLandingProfile,
      term_slots: leftLandingProfile.term_slots.slice(0, 2)
    }
  ),
  /einen Landing-Slot je P4-Zelle/,
  "B darf die eine geschlossene Exponentenspur nicht auf zu wenige atomare Landing-Slots abbilden."
);

assert.throws(
  () => buildBridgeLandingState(
    {
      ...leftBoundaryState,
      power_shell: {
        ...leftBoundaryState.power_shell,
        side: "left"
      }
    },
    leftLandingProfile
  ),
  /Potenzschale rechts/,
  "In der linken Variante muss die Exponentenschale vor dem Wechsel rechts liegen."
);

const transitionManifest = buildBridgeTransitionManifest();
assert.equal(transitionManifest.operation, "power_shell_break");
assert.ok(transitionManifest.invariants.some((line) => line.includes("Gleichheitszeichen")));

console.log("✅ Bridge-B-Transition-Step erfolgreich geprueft.");
