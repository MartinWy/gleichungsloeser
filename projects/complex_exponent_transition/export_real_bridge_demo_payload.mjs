import fs from "node:fs";
import path from "node:path";

import { buildRealBridgeHandoffPayload } from "./real_bridge_handoff/index.js";

function printUsage() {
    console.error(
        "Verwendung: node projects/complex_exponent_transition/export_real_bridge_demo_payload.mjs " +
        "\"<equation>\" [--target x] [--output snapshots/datei.json]"
    );
}

function parseArgs(argv = []) {
    const args = [...argv];
    let equation = null;
    let targetVariable = "x";
    let outputPath = null;

    while (args.length > 0) {
        const token = args.shift();

        if (!token) {
            continue;
        }

        if (token === "--target") {
            targetVariable = args.shift() || "x";
            continue;
        }

        if (token === "--output") {
            outputPath = args.shift() || null;
            continue;
        }

        if (!equation) {
            equation = token;
        }
    }

    return {
        equation,
        targetVariable,
        outputPath
    };
}

const {
    equation,
    targetVariable,
    outputPath
} = parseArgs(process.argv.slice(2));

if (!equation || !outputPath) {
    printUsage();
    process.exit(1);
}

const payload = await buildRealBridgeHandoffPayload(equation, targetVariable);
const resolvedOutputPath = path.resolve(process.cwd(), outputPath);

fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
fs.writeFileSync(resolvedOutputPath, JSON.stringify(payload, null, 2));

console.log(`Bridge-Demo-Payload geschrieben: ${resolvedOutputPath}`);
