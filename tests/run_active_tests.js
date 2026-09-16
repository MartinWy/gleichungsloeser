import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coreValidationTests = [
  "../core/P1_Eingabe/Validierung.test.js",
  "../core/P2_Strategie_Analyse/Validierung.test.js",
  "../core/P3_Umformung/Validierung.test.js",
  "../core/P3_Umformung/id_invarianz.test.js",
  "../core/P4_Projektion/Validierung.test.js"
].map((relativePath) => path.resolve(__dirname, relativePath));

const activeTestDirectory = path.resolve(__dirname, "active");
const activeTests = readdirSync(activeTestDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".test.js"))
  .map((entry) => path.resolve(activeTestDirectory, entry.name))
  .sort((left, right) => left.localeCompare(right));

const tests = [...coreValidationTests, ...activeTests];

let failures = 0;

for (const testPath of tests) {
  const label = path.relative(process.cwd(), testPath);
  console.log(`\n▶ Aktiver Test: ${label}`);
  const result = spawnSync(process.execPath, [testPath], { stdio: "inherit" });
  if (result.status !== 0) {
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\n❌ ${failures} aktive Tests fehlgeschlagen.`);
  process.exit(1);
}

console.log(`\n✅ Alle ${tests.length} aktiven Tests bestanden.`);
