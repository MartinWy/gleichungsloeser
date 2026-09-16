import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const scriptPath = path.resolve(projectRoot, "projects/complex_exponent_transition/export_real_bridge_demo_payload.mjs");
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gleichungsloeser-bridge-demo-"));
const outputPath = path.join(tmpDir, "real_bridge_payload.json");

const result = spawnSync(
    process.execPath,
    [scriptPath, "y=a*B^(2x-1)", "--target", "x", "--output", outputPath],
    { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(result.status, 0, result.stderr || result.stdout);
assert.ok(fs.existsSync(outputPath), "Der Demo-Payload-Export muss eine echte JSON-Datei schreiben.");

const payload = JSON.parse(fs.readFileSync(outputPath, "utf8"));

assert.equal(payload.boundary_state.equation_text, "y/a = B^(2x-1)");
assert.equal(payload.landing_profile.preview_equation, "log_B(y/a) = 2x-1");
assert.equal(payload.landing_state.equation_text, "log_B(y/a) = 2x-1");
assert.equal(payload.before_state.equation, "y/a = B^(2x-1)");
assert.equal(payload.after_state.equation, "log_B(y/a) = 2x-1");
assert.ok(payload.before_state.atoms.some((atom) => atom.zone === "exponent"));
assert.ok(payload.after_state.atoms.some((atom) => atom.zone === "focus_term"));

console.log("Realer Bridge-Demo-Payload-Export erfolgreich geprueft.");
