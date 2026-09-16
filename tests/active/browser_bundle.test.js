import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const buildScript = path.resolve(projectRoot, "scripts/build_browser_bundle.mjs");
const bundlePath = path.resolve(projectRoot, "browser/app.bundle.js");
const rootIndexPath = path.resolve(projectRoot, "index.html");
const componentIndexPath = path.resolve(projectRoot, "components/Arbeitsblatt_Druckansicht/index.html");

const buildResult = spawnSync(process.execPath, [buildScript], {
  cwd: projectRoot,
  encoding: "utf8"
});

assert.equal(buildResult.status, 0, buildResult.stderr || buildResult.stdout);
assert.ok(fs.existsSync(bundlePath), "Das Browser-Bundle muss erzeugt werden.");

const syntaxCheck = spawnSync(process.execPath, ["--check", bundlePath], {
  cwd: projectRoot,
  encoding: "utf8"
});

assert.equal(syntaxCheck.status, 0, syntaxCheck.stderr || syntaxCheck.stdout);

const bundleSource = fs.readFileSync(bundlePath, "utf8");
assert.match(bundleSource, /__require\("components\/Arbeitsblatt_Druckansicht\/logic\.js"\)/);
assert.doesNotMatch(bundleSource, /^\s*import\s/m, "Das Browser-Bundle darf keine ES-Importe mehr enthalten.");
assert.doesNotMatch(bundleSource, /^\s*export\s/m, "Das Browser-Bundle darf keine ES-Exporte mehr enthalten.");
assert.doesNotMatch(bundleSource, /[ \t]+$/m, "Das generierte Browser-Bundle darf keine nachlaufenden Leerzeichen enthalten.");

const rootIndexSource = fs.readFileSync(rootIndexPath, "utf8");
assert.match(rootIndexSource, /<script type="module" src="\.\/cockpit\.js(?:\?[^"]+)?"><\/script>/);

const componentIndexSource = fs.readFileSync(componentIndexPath, "utf8");
assert.match(componentIndexSource, /<script src="\.\.\/\.\.\/browser\/app\.bundle\.js(?:\?[^"]+)?"><\/script>/);
assert.doesNotMatch(componentIndexSource, /type="module"/);
