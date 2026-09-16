import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const scriptPath = path.resolve(projectRoot, "projects/complex_exponent_transition/inspect_real_bridge_handoff.mjs");

function assertStrictlyIncreasing(values = []) {
    for (let index = 1; index < values.length; index += 1) {
        assert.ok(
            values[index] > values[index - 1],
            `Slotfolge muss streng steigen, bekam ${values.join(", ")}.`
        );
    }
}

const leftResult = spawnSync(
    process.execPath,
    [scriptPath, "y=a*B^(2x-1)", "--target", "x", "--json"],
    { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(leftResult.status, 0, leftResult.stderr || leftResult.stdout);
const leftJson = JSON.parse(leftResult.stdout);
assert.equal(leftJson.boundary_state.equation_text, "y/a = B^(2x-1)");
assert.equal(leftJson.landing_profile.preview_equation, "log_B(y/a) = 2x-1");
assert.equal(leftJson.landing_profile.source_trace.derivation_mode, "isolated_a2_probe");
assert.equal(leftJson.landing_state.layout.term_slots.length, 5);
assertStrictlyIncreasing(leftJson.landing_state.layout.term_slots);
assert.deepEqual(
    leftJson.landing_state.layout.term_slots,
    leftJson.landing_profile.term_slots.map((slot) => slot.x)
);

const rightResult = spawnSync(
    process.execPath,
    [scriptPath, "B^(2x-1)=y/a", "--target", "x", "--json"],
    { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(rightResult.status, 0, rightResult.stderr || rightResult.stdout);
const rightJson = JSON.parse(rightResult.stdout);
assert.equal(rightJson.boundary_state.equation_text, "B^(2x-1) = y/a");
assert.equal(rightJson.landing_profile.preview_equation, "2x-1 = log_B(y/a)");
assert.equal(rightJson.landing_profile.source_trace.derivation_mode, "isolated_a2_probe");
assert.equal(rightJson.landing_state.layout.term_slots.length, 5);
assertStrictlyIncreasing(rightJson.landing_state.layout.term_slots);
assert.deepEqual(
    rightJson.landing_state.layout.term_slots,
    rightJson.landing_profile.term_slots.map((slot) => slot.x)
);

const groupedResult = spawnSync(
    process.execPath,
    [scriptPath, "y-2=(a+2)*B^(2x-1)", "--target", "x", "--json"],
    { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(groupedResult.status, 0, groupedResult.stderr || groupedResult.stdout);
const groupedJson = JSON.parse(groupedResult.stdout);
assert.equal(groupedJson.landing_profile.equals_anchor_x, groupedJson.boundary_state.anchors.equals.x);
assert.equal(groupedJson.landing_profile.source_trace.derivation_mode, "isolated_a2_probe");
assert.equal(groupedJson.landing_state.layout.term_slots.length, 5);
assertStrictlyIncreasing(groupedJson.landing_state.layout.term_slots);
assert.deepEqual(
    groupedJson.landing_state.layout.term_slots,
    groupedJson.landing_profile.term_slots.map((slot) => slot.x)
);

const naturalResult = spawnSync(
    process.execPath,
    [scriptPath, "(2*a-1)=e^(2*x-1)", "--target", "x", "--json"],
    { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(naturalResult.status, 0, naturalResult.stderr || naturalResult.stdout);
const naturalJson = JSON.parse(naturalResult.stdout);
assert.equal(naturalJson.boundary_state.equation_text, "(2*a-1) = e^(2*x-1)");
assert.equal(naturalJson.landing_profile.preview_equation, "ln((2*a-1)) = 2*x-1");
assert.equal(naturalJson.landing_state.equation_text, "ln((2*a-1)) = 2*x-1");
assert.equal(naturalJson.landing_profile.stories.operator_target.text, "ln");
assert.equal(naturalJson.landing_state.layout.term_slots.length, 5);
assertStrictlyIncreasing(naturalJson.landing_state.layout.term_slots);
assert.deepEqual(
    naturalJson.landing_state.layout.term_slots,
    naturalJson.landing_profile.term_slots.map((slot) => slot.x)
);

console.log("Reale Bridge-Handoff-CLI erfolgreich geprueft.");
