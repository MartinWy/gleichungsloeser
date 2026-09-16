import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeRoot = path.resolve(__dirname, "../../core/GenesisRuntime");

function collectFiles(rootDir) {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    return entries.flatMap((entry) => {
        const absolutePath = path.join(rootDir, entry.name);
        if (entry.isDirectory()) {
            return collectFiles(absolutePath);
        }

        return [absolutePath];
    });
}

const runtimeFiles = collectFiles(runtimeRoot);
const runtimeJavaScriptFiles = runtimeFiles.filter((filePath) => filePath.endsWith(".js"));

assert.ok(runtimeJavaScriptFiles.length >= 6, "GenesisRuntime sollte bereits echte JavaScript-Module besitzen.");

for (const filePath of runtimeJavaScriptFiles) {
    const source = fs.readFileSync(filePath, "utf8");

    assert.doesNotMatch(source, /core\/archiv\//, "GenesisRuntime darf das Archiv nicht importieren.");
    assert.doesNotMatch(source, /\.\.\/P1_Eingabe\//, "GenesisRuntime darf nicht von alten P1-Pfaden abhaengen.");
    assert.doesNotMatch(source, /\.\.\/P2_Strategie_Analyse\//, "GenesisRuntime darf nicht von alten P2-Pfaden abhaengen.");
    assert.doesNotMatch(source, /\.\.\/P3_Umformung\//, "GenesisRuntime darf nicht von alten P3-Pfaden abhaengen.");
    assert.doesNotMatch(source, /\.\.\/P4_Projektion\//, "GenesisRuntime darf nicht von alten P4-Pfaden abhaengen.");
    assert.doesNotMatch(source, /\.\.\/P4_Neukern\//, "GenesisRuntime darf nicht vom bisherigen Neukern-Pfad abhaengen.");
}

const runtimeResult = await runGenesisRuntime("x=5");
assert.equal(runtimeResult.phases.projection.phaseId, "P4_Projection");
assert.equal(runtimeResult.phases.projection.theoryRows.length, 1);
assert.equal(runtimeResult.phases.projection.projectionRows.length, 1);

console.log("GenesisRuntime-Isolation erfolgreich geprueft.");
