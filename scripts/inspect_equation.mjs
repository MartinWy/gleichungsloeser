import GenesisCore from "../core/index.js";
import { normalizeSolveOptions } from "../core/solveOptions.js";
import { buildWorksheetViewModel } from "../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { normalizeEquationInput, normalizeTargetVariableInput } from "../components/Arbeitsblatt_Druckansicht/inputAdapter.js";

function printUsage() {
    console.error("Verwendung: node scripts/inspect_equation.mjs \"2*x+3=5\" [--target x] [--runtime-engine genesis_runtime] [--right-side-factor-placement suffix|prefix] [--raw] [--json]");
}

function parseArgs(argv) {
    const args = [...argv];
    let equation = null;
    let targetVariable = null;
    let runtimeEngine = null;
    let rightSideFactorPlacement = null;
    let rawMode = false;
    let jsonMode = false;

    while (args.length > 0) {
        const token = args.shift();

        if (!token) {
            continue;
        }

        if (token === "--target") {
            targetVariable = args.shift() || null;
            continue;
        }

        if (token === "--raw") {
            rawMode = true;
            continue;
        }

        if (token === "--runtime-engine") {
            runtimeEngine = args.shift() || null;
            continue;
        }

        if (token === "--right-side-factor-placement") {
            rightSideFactorPlacement = args.shift() || null;
            continue;
        }

        if (token === "--json") {
            jsonMode = true;
            continue;
        }

        if (!equation) {
            equation = token;
        }
    }

    return { equation, targetVariable, runtimeEngine, rightSideFactorPlacement, rawMode, jsonMode };
}

function formatMetric(metric, index) {
    const flags = [];

    if (typeof metric.axisTopReserveEm === "number" && typeof metric.axisBottomReserveEm === "number") {
        flags.push(`Achsenreserve=${metric.axisTopReserveEm}/${metric.axisBottomReserveEm}em`);
    }

    if (typeof metric.axisBalanceEm === "number") {
        flags.push(`Achsenbalance=${metric.axisBalanceEm}em`);
    }

    if (typeof metric.axisShiftEm === "number") {
        flags.push(`Achsenversatz=${metric.axisShiftEm}em`);
    }

    if (typeof metric.axisContext === "string" && metric.axisContext.length > 0) {
        flags.push(`Achsenkontext=${metric.axisContext}`);
    }

    if (typeof metric.axisCompanionShiftEm === "number") {
        flags.push(`Achsenbegleiter=${metric.axisCompanionShiftEm}em`);
    }

    if (typeof metric.rowContentShiftEm === "number") {
        flags.push(`Zeileninhalt=${metric.rowContentShiftEm}em`);
    }

    if (typeof metric.axisLineShiftEm === "number") {
        flags.push(`Linienversatz=${metric.axisLineShiftEm}em`);
    }

    if (typeof metric.fractionSpanWidth === "number") {
        flags.push(`Bruchspanne=${metric.fractionSpanWidth}`);
    }

    if (metric.hasFractionLine) {
        flags.push("Bruchstrich");
    }

    if (metric.hasNestedFraction) {
        flags.push("verschachtelter Bruch");
    }

    return `  Teilzeile ${index}: ${metric.kind}, min=${metric.minHeightEm}em, Zellen=${metric.cellCount}${flags.length > 0 ? `, ${flags.join(", ")}` : ""}`;
}

function formatCell(cell) {
    const parts = [
        `text=${cell.text}`,
        `id=${cell.id}`,
        `row=${cell.row}`,
        `absolute=${cell.absoluteRow}`,
        `stacked=${cell.stackedRow}`,
        `col=${cell.col}`,
        `rowKind=${cell.rowKind}`
    ];

    if (cell.projectionRole) {
        parts.push(`role=${cell.projectionRole}`);
    }

    if (cell.sourceShellId) {
        parts.push(`shell=${cell.sourceShellId}`);
    }

    if (cell.axisBehavior) {
        parts.push(`axis=${cell.axisBehavior}`);
    }

    if (typeof cell.axisMinHeightEm === "number") {
        parts.push(`boxAxis=${cell.axisMinHeightEm}em`);
    }

    if (typeof cell.axisAboveEm === "number" && typeof cell.axisBelowEm === "number") {
        parts.push(`boxExtent=${cell.axisAboveEm}/${cell.axisBelowEm}em`);
    }

    if (typeof cell.boxHeightEm === "number") {
        parts.push(`boxHeight=${cell.boxHeightEm}em`);
    }

    if (typeof cell.axisTopReserveEm === "number" && typeof cell.axisBottomReserveEm === "number") {
        parts.push(`boxReserve=${cell.axisTopReserveEm}/${cell.axisBottomReserveEm}em`);
    }

    if (typeof cell.axisBalanceEm === "number") {
        parts.push(`boxBalance=${cell.axisBalanceEm}em`);
    }

    if (typeof cell.rowAxisBalanceEm === "number") {
        parts.push(`rowBalance=${cell.rowAxisBalanceEm}em`);
    }

    if (typeof cell.rowAxisShiftEm === "number") {
        parts.push(`rowShift=${cell.rowAxisShiftEm}em`);
    }

    if (typeof cell.rowAxisCompanionShiftEm === "number") {
        parts.push(`rowCompanion=${cell.rowAxisCompanionShiftEm}em`);
    }

    if (typeof cell.rowContentShiftEm === "number") {
        parts.push(`rowContent=${cell.rowContentShiftEm}em`);
    }

    if (typeof cell.rowAxisLineShiftEm === "number") {
        parts.push(`rowLine=${cell.rowAxisLineShiftEm}em`);
    }

    if (typeof cell.rowAxisContext === "string" && cell.rowAxisContext.length > 0) {
        parts.push(`rowContext=${cell.rowAxisContext}`);
    }

    if (typeof cell.blockAxisContext === "string" && cell.blockAxisContext.length > 0) {
        parts.push(`blockContext=${cell.blockAxisContext}`);
    }

    if (typeof cell.rowFractionSpanWidth === "number") {
        parts.push(`rowSpan=${cell.rowFractionSpanWidth}`);
    }

    if (typeof cell.blockFractionSpanWidth === "number") {
        parts.push(`blockSpan=${cell.blockFractionSpanWidth}`);
    }

    if (typeof cell.shiftYEm === "number") {
        parts.push(`shift=${cell.shiftYEm}em`);
    }

    if (typeof cell.lineHeightEm === "number") {
        parts.push(`lineHeight=${cell.lineHeightEm}em`);
    }

    if (typeof cell.lineThicknessEm === "number") {
        parts.push(`lineThickness=${cell.lineThicknessEm}em`);
    }

    if (cell.isTarget) {
        parts.push("Zielspur");
    }

    return `    - ${parts.join(", ")}`;
}

async function main() {
    const { equation, targetVariable, runtimeEngine, rightSideFactorPlacement, rawMode, jsonMode } = parseArgs(process.argv.slice(2));

    if (!equation) {
        printUsage();
        process.exit(1);
    }

    const normalizedEquationInput = rawMode
        ? { original: equation, normalized: equation, changed: false }
        : normalizeEquationInput(equation);
    const normalizedTargetVariable = rawMode
        ? targetVariable
        : normalizeTargetVariableInput(targetVariable);

    const options = normalizeSolveOptions({
        targetVariable: normalizedTargetVariable,
        runtimeEngine
    });
    if (typeof rightSideFactorPlacement === "string" && rightSideFactorPlacement.trim().length > 0) {
        options.rightSideFactorPlacement = rightSideFactorPlacement.trim().toLowerCase();
    }
    const result = await GenesisCore.solve(normalizedEquationInput.normalized, options);

    if (result?.fehler) {
        console.error(`Kernfehler: ${result.fehler}`);
        process.exit(1);
    }

    const viewModel = buildWorksheetViewModel(result);

    if (jsonMode) {
        console.log(JSON.stringify({
            input: equation,
            normalized: rawMode ? null : (normalizedEquationInput.changed ? normalizedEquationInput.normalized : null),
            rawMode,
            targetVariable: result.targetVariable || null,
            runtimeEngine: options.runtimeEngine || null,
            stepCount: viewModel.steps.length,
            diagnostics: viewModel.diagnostics
        }, null, 2));
        return;
    }

    console.log(`Eingabe: ${equation}`);
    if (rawMode) {
        console.log("Normalisierung: deaktiviert");
    } else if (normalizedEquationInput.changed) {
        console.log(`Normalisiert: ${normalizedEquationInput.normalized}`);
    }
    console.log(`Zielvariable: ${result.targetVariable || "keine"}`);
    if (options.runtimeEngine) {
        console.log(`Runtime: ${options.runtimeEngine}`);
    }
    console.log(`Schritte: ${viewModel.steps.length}`);

    viewModel.diagnostics.steps.forEach((step) => {
        console.log(`\nSchritt ${step.stepIndex}: ${step.label}${step.family ? ` (${step.family})` : ""}`);
        console.log(
            `  Block: local axis=${step.axisLocalRow}, stack=${step.stackRowStart}-${step.stackRowEnd}, absolute=${step.absoluteRowStart}-${step.absoluteRowEnd}, axisAbsolute=${step.axisAbsoluteRow}, axisStacked=${step.axisStackedRow}`
        );
        console.log(`  Zeilenrollen: ${step.rowKinds.join(" | ")}`);
        step.rowMetrics.forEach((metric, index) => {
            console.log(formatMetric(metric, index));
        });
        step.cells.forEach((cell) => {
            console.log(formatCell(cell));
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
