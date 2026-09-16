import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildRealBridgeHandoffPayload } from "./real_bridge_handoff/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

function printUsage() {
    console.error(
        "Verwendung: node projects/complex_exponent_transition/inspect_real_bridge_handoff.mjs " +
        "\"<equation>\" [--target x] [--json] [--output /pfad/datei.json]"
    );
}

function parseArgs(argv = []) {
    const args = [...argv];
    let equation = null;
    let targetVariable = "x";
    let outputPath = null;
    let asJson = false;

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

        if (token === "--json") {
            asJson = true;
            continue;
        }

        if (!equation) {
            equation = token;
        }
    }

    return {
        equation,
        targetVariable,
        outputPath,
        asJson
    };
}

function buildSummary(payload = {}) {
    const boundaryState = payload?.boundary_state || {};
    const landingProfile = payload?.landing_profile || {};
    const landingState = payload?.landing_state || {};

    return [
        `Eingabe: ${payload?.equation || ""}`,
        `Ziel: ${payload?.target_variable || ""}`,
        "",
        "boundary_state",
        `  Variante: ${boundaryState?.variant || ""}`,
        `  Gleichung: ${boundaryState?.equation_text || ""}`,
        `  Gleichheitsanker: ${boundaryState?.anchors?.equals?.x ?? ""}`,
        `  Potenzseite: ${boundaryState?.power_shell?.side || ""}`,
        `  Basis: ${boundaryState?.power_shell?.base?.text || ""}`,
        `  Inhalt: ${boundaryState?.power_shell?.content?.text || ""}`,
        `  Durchgereicht: ${boundaryState?.carry_through?.text || ""}`,
        "",
        "landing_profile",
        `  Vorschau: ${landingProfile?.preview_equation || ""}`,
        `  Gleichheitsanker: ${landingProfile?.equals_anchor_x ?? ""}`,
        `  Termseite: ${landingProfile?.term_side || ""}`,
        `  Durchreichseite: ${landingProfile?.carry_through_side || ""}`,
        `  Termslots: ${(landingProfile?.term_slots || []).map((slot) => slot.x).join(", ")}`,
        "",
        "landing_state",
        `  Gleichung: ${landingState?.equation_text || ""}`,
        `  Operator-Story: ${landingState?.stories?.operator?.source || ""} -> ${landingState?.stories?.operator?.target || ""}`,
        `  Content-Story: ${landingState?.stories?.content?.source || ""} -> ${landingState?.stories?.content?.target || ""}`,
        `  Layout-Slots: ${(landingState?.layout?.term_slots || []).join(", ")}`
    ].join("\n");
}

async function main() {
    const {
        equation,
        targetVariable,
        outputPath,
        asJson
    } = parseArgs(process.argv.slice(2));

    if (!equation) {
        printUsage();
        process.exit(1);
    }

    const handoffPayload = await buildRealBridgeHandoffPayload(equation, targetVariable);
    const payload = {
        project_root: projectRoot,
        ...handoffPayload
    };

    if (outputPath) {
        const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
        fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
        fs.writeFileSync(resolvedOutputPath, JSON.stringify(payload, null, 2));
    }

    if (asJson || outputPath) {
        console.log(JSON.stringify(payload, null, 2));
        return;
    }

    console.log(buildSummary(payload));
}

await main();
