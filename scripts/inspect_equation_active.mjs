import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inspectScript = path.resolve(__dirname, "inspect_equation.mjs");

const incomingArgs = process.argv.slice(2);
const resolvedArgs = [...incomingArgs];

if (!resolvedArgs.includes("--runtime-engine")) {
    resolvedArgs.push("--runtime-engine", "genesis_runtime");
}

const result = spawnSync(process.execPath, [inspectScript, ...resolvedArgs], {
    stdio: "inherit"
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
