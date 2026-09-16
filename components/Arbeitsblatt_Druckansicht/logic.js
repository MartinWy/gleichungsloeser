import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel, normalizeTargetVariable } from "./viewModel.js";
import { normalizeEquationInput } from "./inputAdapter.js";
import { buildWorksheetDisplayModel } from "./worksheetDisplayModel.js";
import { buildDelimiterStretchMetrics, buildRootStretchMetrics } from "./renderStretchMetrics.js";
import { resolveFunctionNotation } from "./functionNotation.js";
import {
    collectColorControlTargetsFromViewModel,
    parseColorRuleSpec,
    resolveElementColorForCell,
    resolveElementColorForNode,
    resolveShellColor,
    resolveShellColorForNode,
    serializeColorRuleSpec
} from "../../presentation/shell_colors/index.js";

const elements = typeof document !== "undefined"
    ? {
        form: document.getElementById("solveForm"),
        equationInput: document.getElementById("equationInput"),
        targetVariableInput: document.getElementById("targetVariableInput"),
        printButton: document.getElementById("printButton"),
        colorPanel: document.getElementById("colorPanel"),
        colorRulesList: document.getElementById("colorRulesList"),
        clearColorsButton: document.getElementById("clearColorsButton"),
        status: document.getElementById("status"),
        results: document.getElementById("results"),
        printSummary: document.getElementById("printSummary"),
        diagnostics: document.getElementById("diagnostics")
    }
    : null;

let currentVisualOptions = {
    shellColorsEnabled: false,
    shellColorPolicy: null,
    colorRuleSpec: ""
};

const PRODUCTIVE_RUNTIME_OPTIONS = Object.freeze({
    runtimeEngine: "genesis_runtime"
});

let currentViewModel = null;
let selectedColorRuleKey = null;

const shellKindLabels = Object.freeze({
    root: "Wurzel",
    power: "Potenz",
    group: "Klammer",
    fraction: "Bruchstrich",
    negation: "Vorzeichen",
    function: "Funktion"
});

function buildColorRuleKey(selectorType, selectorValue) {
    return `${String(selectorType || "").trim().toLowerCase()}:${String(selectorValue || "").trim()}`;
}

function parseColorRuleMap(ruleSpec = "") {
    const rules = parseColorRuleSpec(ruleSpec);
    const map = new Map();

    rules.forEach((rule) => {
        map.set(buildColorRuleKey(rule.selectorType, rule.selectorValue), rule);
    });

    return map;
}

function upsertColorRuleSpec(ruleSpec, selectorType, selectorValue, hex) {
    const nextRules = parseColorRuleSpec(ruleSpec).filter((rule) => (
        buildColorRuleKey(rule.selectorType, rule.selectorValue) !== buildColorRuleKey(selectorType, selectorValue)
    ));

    if (typeof hex === "string" && hex.trim().length > 0) {
        nextRules.push({
            selectorType: String(selectorType || "").trim().toLowerCase(),
            selectorValue: String(selectorValue || "").trim(),
            hex: hex.trim()
        });
    }

    return serializeColorRuleSpec(nextRules);
}

function buildVisualColorPolicy(colorRuleSpec = "") {
    if (typeof colorRuleSpec !== "string" || colorRuleSpec.trim().length === 0) {
        return null;
    }

    return {
        ruleSpec: colorRuleSpec,
        fallback: "none"
    };
}

function applyColorRuleSpec(colorRuleSpec = "") {
    currentVisualOptions = {
        ...currentVisualOptions,
        colorRuleSpec,
        shellColorsEnabled: typeof colorRuleSpec === "string" && colorRuleSpec.trim().length > 0,
        shellColorPolicy: buildVisualColorPolicy(colorRuleSpec)
    };
}

function describeColorRuleTarget(selectorType, selectorValue) {
    if (selectorType === "function") {
        return {
            title: selectorValue,
            meta: "Funktion"
        };
    }

    return {
        title: shellKindLabels[selectorType === "shell" ? selectorValue : selectorType] || selectorValue,
        meta: selectorType === "shell" ? "Schale" : selectorType
    };
}

function setStatus(message, isError = false) {
    if (!elements) {
        return;
    }

    elements.status.textContent = message;
    elements.status.classList.toggle("is-error", isError);
}

function createEmptyState(message) {
    const node = document.createElement("div");
    node.className = "empty-state";
    node.textContent = message;
    return node;
}

function createTextList(items = []) {
    const list = document.createElement("ul");
    list.className = "diagnostics-list";

    items.forEach((item) => {
        const entry = document.createElement("li");
        entry.textContent = item;
        list.appendChild(entry);
    });

    return list;
}

function formatAxisReserve(metric) {
    if (typeof metric?.axisTopReserveEm !== "number" || typeof metric?.axisBottomReserveEm !== "number") {
        return null;
    }

    return `Achsenreserve ${metric.axisTopReserveEm}/${metric.axisBottomReserveEm}em`;
}

function formatAxisBalance(metric) {
    if (typeof metric?.axisBalanceEm !== "number") {
        return null;
    }

    return `Achsenbalance ${metric.axisBalanceEm}em`;
}

function formatAxisShift(metric) {
    if (typeof metric?.axisShiftEm !== "number") {
        return null;
    }

    return `Achsenversatz ${metric.axisShiftEm}em`;
}

function formatAxisContext(metric) {
    if (typeof metric?.axisContext !== "string" || metric.axisContext.length === 0) {
        return null;
    }

    return `Achsenkontext ${metric.axisContext}`;
}

function createDiagnosticsPanel(viewModel) {
    if (!viewModel?.diagnostics) {
        return createEmptyState("Keine Diagnosedaten verfuegbar.");
    }

    const shell = document.createElement("section");
    shell.className = "diagnostics-panel";

    const intro = document.createElement("p");
    intro.className = "diagnostics-intro";
    intro.textContent = "Diese Spur zeigt, wie Projektionsblock, Teilzeilen und sichtbare Zellen im aktuellen Arbeitsblatt gelesen werden.";
    shell.appendChild(intro);

    viewModel.diagnostics.steps.forEach((step) => {
        const details = document.createElement("details");
        details.className = "diagnostics-step";

        const summary = document.createElement("summary");
        const rowKinds = step.rowKinds.join(" | ");
        const blockSpan = [
            `local axis ${step.axisLocalRow}`,
            `stack ${step.stackRowStart}-${step.stackRowEnd}`,
            `absolute ${step.absoluteRowStart}-${step.absoluteRowEnd}`
        ].join(", ");
        summary.textContent = `Schritt ${step.stepIndex}: ${step.label}${step.family ? ` (${step.family})` : ""} — ${rowKinds} — ${blockSpan}`;
        details.appendChild(summary);

        const metricsTitle = document.createElement("p");
        metricsTitle.className = "diagnostics-subtitle";
        metricsTitle.textContent = "Teilzeilen";
        details.appendChild(metricsTitle);

        details.appendChild(
            createTextList(
                step.rowMetrics.map((metric, index) => {
                    const flags = [];
                    if (metric.hasFractionLine) {
                        flags.push("Bruchstrich");
                    }
                    if (metric.hasNestedFraction) {
                        flags.push("verschachtelter Bruch");
                    }
                    const axisReserve = formatAxisReserve(metric);
                    if (axisReserve) {
                        flags.unshift(axisReserve);
                    }
                    const axisBalance = formatAxisBalance(metric);
                    if (axisBalance) {
                        flags.splice(axisReserve ? 1 : 0, 0, axisBalance);
                    }
                    const axisShift = formatAxisShift(metric);
                    if (axisShift) {
                        flags.push(axisShift);
                    }
                    const axisContext = formatAxisContext(metric);
                    if (axisContext) {
                        flags.push(axisContext);
                    }
                    if (typeof metric.axisCompanionShiftEm === "number") {
                        flags.push(`Achsenbegleiter ${metric.axisCompanionShiftEm}em`);
                    }
                    if (typeof metric.rowContentShiftEm === "number") {
                        flags.push(`Zeileninhalt ${metric.rowContentShiftEm}em`);
                    }
                    if (typeof metric.axisLineShiftEm === "number") {
                        flags.push(`Linienversatz ${metric.axisLineShiftEm}em`);
                    }
                    if (typeof metric.fractionSpanWidth === "number") {
                        flags.push(`Bruchspanne ${metric.fractionSpanWidth}`);
                    }

                    return `${index}: ${metric.kind}, min=${metric.minHeightEm}em, Zellen=${metric.cellCount}${flags.length > 0 ? `, ${flags.join(", ")}` : ""}`;
                })
            )
        );

        const cellsTitle = document.createElement("p");
        cellsTitle.className = "diagnostics-subtitle";
        cellsTitle.textContent = "Sichtbare Zellen";
        details.appendChild(cellsTitle);

        details.appendChild(
            createTextList(
                step.cells.map((cell) => {
                    const parts = [
                        `${cell.text}`,
                        `id ${cell.id}`,
                        `row ${cell.row}`,
                        `absolute ${cell.absoluteRow}`,
                        `stacked ${cell.stackedRow}`,
                        `col ${cell.col}`,
                        cell.rowKind
                    ];

                    if (cell.projectionRole) {
                        parts.push(cell.projectionRole);
                    }

                    if (cell.sourceShellId) {
                        parts.push(`shell ${cell.sourceShellId}`);
                    }

                    if (cell.axisBehavior) {
                        parts.push(cell.axisBehavior);
                    }

                    if (typeof cell.axisTopReserveEm === "number" && typeof cell.axisBottomReserveEm === "number") {
                        parts.push(`Achsenreserve ${cell.axisTopReserveEm}/${cell.axisBottomReserveEm}em`);
                    }

                    if (typeof cell.axisBalanceEm === "number") {
                        parts.push(`Achsenbalance ${cell.axisBalanceEm}em`);
                    }

                    if (typeof cell.rowAxisBalanceEm === "number") {
                        parts.push(`Teilzeilenbalance ${cell.rowAxisBalanceEm}em`);
                    }

                    if (typeof cell.rowAxisShiftEm === "number") {
                        parts.push(`Teilzeilenversatz ${cell.rowAxisShiftEm}em`);
                    }

                    if (typeof cell.rowAxisCompanionShiftEm === "number") {
                        parts.push(`Achsenbegleiter ${cell.rowAxisCompanionShiftEm}em`);
                    }

                    if (typeof cell.rowContentShiftEm === "number") {
                        parts.push(`Zeileninhalt ${cell.rowContentShiftEm}em`);
                    }

                    if (typeof cell.rowAxisLineShiftEm === "number") {
                        parts.push(`Linienversatz ${cell.rowAxisLineShiftEm}em`);
                    }

                    if (cell.rowAxisContext) {
                        parts.push(`Teilzeilenkontext ${cell.rowAxisContext}`);
                    }

                    if (cell.blockAxisContext) {
                        parts.push(`Blockkontext ${cell.blockAxisContext}`);
                    }

                    if (typeof cell.rowFractionSpanWidth === "number") {
                        parts.push(`Teilzeilenspanne ${cell.rowFractionSpanWidth}`);
                    }

                    if (typeof cell.blockFractionSpanWidth === "number") {
                        parts.push(`Blockspanne ${cell.blockFractionSpanWidth}`);
                    }

                    if (cell.isTarget) {
                        parts.push("Zielspur");
                    }

                    if (cell.containsFraction) {
                        parts.push("enthaelt Bruch");
                    }

                    return parts.join(" | ");
                })
            )
        );

        shell.appendChild(details);
    });

    return shell;
}

function readStateFromUrl() {
    if (typeof window === "undefined") {
        return null;
    }

    const url = new URL(window.location.href);
    const equation = url.searchParams.get("equation");
    const targetVariable = url.searchParams.get("targetVariable");
    const colorRules = url.searchParams.get("colorRules");

    return {
        equation: typeof equation === "string" && equation.length > 0 ? equation : null,
        targetVariable: typeof targetVariable === "string" && targetVariable.length > 0 ? targetVariable : null,
        colorRules: typeof colorRules === "string" && colorRules.trim().length > 0
            ? colorRules.trim()
            : ""
    };
}

function writeStateToUrl(equation, targetVariable, colorRules = "") {
    if (typeof window === "undefined") {
        return;
    }

    const url = new URL(window.location.href);
    if (equation) {
        url.searchParams.set("equation", equation);
    } else {
        url.searchParams.delete("equation");
    }

    if (targetVariable) {
        url.searchParams.set("targetVariable", targetVariable);
    } else {
        url.searchParams.delete("targetVariable");
    }

    if (typeof colorRules === "string" && colorRules.trim().length > 0) {
        url.searchParams.set("colorRules", colorRules.trim());
    } else {
        url.searchParams.delete("colorRules");
    }

    window.history.replaceState(null, "", url);
}

function appendNode(parent, child) {
    if (child) {
        parent.appendChild(child);
    }
}

function applyShellIdentityAttributes(element, node) {
    if (!element || !node) {
        return;
    }

    const shellType = node.shellType || node.type || null;

    if (typeof node.shellId === "string" && node.shellId.length > 0) {
        element.dataset.shellId = node.shellId;
    }

    if (typeof shellType === "string" && shellType.length > 0) {
        element.dataset.shellType = shellType.toLowerCase();
    }

    const functionName = typeof node.functionName === "string" && node.functionName.trim().length > 0
        ? node.functionName
        : node.name;

    if (typeof functionName === "string" && functionName.trim().length > 0) {
        element.dataset.functionName = functionName.trim().toLowerCase();
    }
}

function applyShellColorAttributes(element, shellColor) {
    if (!element || !shellColor) {
        return;
    }

    if (shellColor.shellId) {
        element.dataset.shellId = shellColor.shellId;
    }
    if (shellColor.targetKey) {
        element.dataset.colorTarget = shellColor.targetKey;
    }
    element.dataset.shellColorKey = shellColor.key;
    element.style.setProperty("--shell-color", shellColor.hex);
}

function applyDirectColorAttributes(element, colorEntry) {
    if (!element || !colorEntry) {
        return;
    }

    if (colorEntry.targetKey) {
        element.dataset.colorTarget = colorEntry.targetKey;
    }

    element.dataset.shellColorKey = colorEntry.key || "custom";
    element.style.color = colorEntry.hex;
}

function applyNodeShellColor(element, node, options = currentVisualOptions) {
    if (!options?.shellColorsEnabled) {
        return null;
    }

    const shellColor = resolveShellColorForNode(node, options?.shellColorPolicy || null);
    if (!shellColor) {
        return null;
    }

    applyShellColorAttributes(element, shellColor);
    return shellColor;
}

function renderCurrentViewModel() {
    if (!currentViewModel) {
        return;
    }

    renderViewModel(currentViewModel);
}

function renderColorPanel(viewModel) {
    if (!elements?.colorPanel || !elements?.colorRulesList) {
        return;
    }

    const targets = collectColorControlTargetsFromViewModel(viewModel);
    const items = [
        ...targets.shellKinds
            .filter((kind) => kind !== "function")
            .map((kind) => ({
                selectorType: "shell",
                selectorValue: kind
            })),
        ...targets.functionNames.map((name) => ({
            selectorType: "function",
            selectorValue: name
        }))
    ];

    if (items.length === 0) {
        elements.colorPanel.hidden = true;
        elements.colorRulesList.innerHTML = "";
        return;
    }

    const activeRules = parseColorRuleMap(currentVisualOptions.colorRuleSpec || "");
    elements.colorPanel.hidden = false;
    elements.colorRulesList.innerHTML = "";

    items.forEach((item) => {
        const ruleKey = buildColorRuleKey(item.selectorType, item.selectorValue);
        const activeRule = activeRules.get(ruleKey) || null;
        const { title, meta } = describeColorRuleTarget(item.selectorType, item.selectorValue);

        const row = document.createElement("div");
        row.className = "color-rule";
        row.dataset.ruleKey = ruleKey;
        if (selectedColorRuleKey === ruleKey) {
            row.classList.add("is-selected");
        }

        const input = document.createElement("input");
        input.type = "color";
        input.className = "color-rule__input";
        input.dataset.selectorType = item.selectorType;
        input.dataset.selectorValue = item.selectorValue;
        input.value = activeRule?.hex || "#D97706";

        const label = document.createElement("div");
        label.className = "color-rule__label";

        const titleNode = document.createElement("span");
        titleNode.className = "color-rule__title";
        titleNode.textContent = title;

        const metaNode = document.createElement("span");
        metaNode.className = "color-rule__meta";
        metaNode.textContent = meta;

        label.appendChild(titleNode);
        label.appendChild(metaNode);

        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "secondary-button color-rule__reset";
        reset.dataset.selectorType = item.selectorType;
        reset.dataset.selectorValue = item.selectorValue;
        reset.textContent = "Zurueck";

        row.appendChild(input);
        row.appendChild(label);
        row.appendChild(reset);
        elements.colorRulesList.appendChild(row);
    });
}

function applyCellMetrics(element, cell) {
    if (!element || !cell?.cellMetrics) {
        return;
    }

    const metrics = cell.cellMetrics;

    if (typeof metrics.alignItems === "string" && metrics.alignItems.length > 0) {
        element.style.alignItems = metrics.alignItems;
    }

    if (typeof metrics.alignSelf === "string" && metrics.alignSelf.length > 0) {
        element.style.alignSelf = metrics.alignSelf;
    }

    if (typeof metrics.shiftYEm === "number") {
        element.style.setProperty("--cell-shift-y", `${metrics.shiftYEm}em`);
    }

    const cellAxisMinHeightEm = typeof cell?.renderNode?.layout?.boxHeightEm === "number"
        ? cell.renderNode.layout.boxHeightEm
        : cell?.renderNode?.layout?.axisMinHeightEm;

    if (typeof cellAxisMinHeightEm === "number") {
        element.style.setProperty("--cell-axis-min-height", `${cellAxisMinHeightEm}em`);
    }

    if (typeof cell?.renderNode?.layout?.axisTopReserveEm === "number") {
        element.style.setProperty("--cell-axis-top-reserve", `${cell.renderNode.layout.axisTopReserveEm}em`);
    }

    if (typeof cell?.renderNode?.layout?.axisBottomReserveEm === "number") {
        element.style.setProperty("--cell-axis-bottom-reserve", `${cell.renderNode.layout.axisBottomReserveEm}em`);
    }

    if (typeof cell?.renderNode?.layout?.axisBalanceEm === "number") {
        element.style.setProperty("--cell-axis-balance", `${cell.renderNode.layout.axisBalanceEm}em`);
    }

    if (typeof cell?.rowMinHeightEm === "number") {
        element.style.setProperty("--row-min-height", `${cell.rowMinHeightEm}em`);
    }

    if (typeof cell?.rowAxisTopReserveEm === "number") {
        element.style.setProperty("--row-axis-top-reserve", `${cell.rowAxisTopReserveEm}em`);
    }

    if (typeof cell?.rowAxisBottomReserveEm === "number") {
        element.style.setProperty("--row-axis-bottom-reserve", `${cell.rowAxisBottomReserveEm}em`);
    }

    if (typeof cell?.rowAxisBalanceEm === "number") {
        element.style.setProperty("--row-axis-balance", `${cell.rowAxisBalanceEm}em`);
    }

    if (typeof cell?.rowAxisShiftEm === "number") {
        element.style.setProperty("--row-axis-shift", `${cell.rowAxisShiftEm}em`);
    }

    if (Number.isInteger(cell?.rowFractionSpanWidth)) {
        element.dataset.rowFractionSpanWidth = String(cell.rowFractionSpanWidth);
    }

    if (Number.isInteger(cell?.blockFractionSpanWidth)) {
        element.dataset.blockFractionSpanWidth = String(cell.blockFractionSpanWidth);
    }

    if (typeof cell?.blockAxisContext === "string" && cell.blockAxisContext.length > 0) {
        element.dataset.blockAxisContext = cell.blockAxisContext;
    }

    if (typeof cell?.rowAxisContext === "string" && cell.rowAxisContext.length > 0) {
        element.dataset.rowAxisContext = cell.rowAxisContext;
    }

    if (typeof metrics.lineHeightEm === "number") {
        element.style.setProperty("--fraction-line-height", `${metrics.lineHeightEm}em`);
    }

    if (typeof metrics.lineThicknessEm === "number") {
        element.style.setProperty("--fraction-line-thickness", `${metrics.lineThicknessEm}em`);
    }
}

function applyMathLayoutAttributes(element, node) {
    if (!element || !node?.layout) {
        return;
    }

    element.dataset.boxRole = node.layout.boxRole || "";
    element.dataset.axisBehavior = node.layout.axisBehavior || "";
    element.dataset.nestingDepth = String(node.layout.nestingDepth ?? 0);
    element.dataset.ownFractionDepth = String(node.layout.fractionDepth ?? 0);
    element.dataset.fractionDepth = String(node.layout.maxFractionDepth ?? 0);
    element.dataset.maxFractionDepth = String(node.layout.maxFractionDepth ?? 0);
    element.dataset.boxRows = String(node.layout.blockRows ?? 0);

    element.style.setProperty("--render-nesting-depth", String(node.layout.nestingDepth ?? 0));
    element.style.setProperty("--render-own-fraction-depth", String(node.layout.fractionDepth ?? 0));
    element.style.setProperty("--render-max-fraction-depth", String(node.layout.maxFractionDepth ?? 0));

    if (typeof node.layout.scale === "number") {
        element.style.setProperty("--render-box-scale", String(node.layout.scale));
    }

    if (typeof node.layout.rowGapEm === "number") {
        element.style.setProperty("--render-row-gap", `${node.layout.rowGapEm}em`);
    }

    if (typeof node.layout.marginInlineEm === "number") {
        element.style.setProperty("--render-margin-inline", `${node.layout.marginInlineEm}em`);
    }

    if (typeof node.layout.barThicknessEm === "number") {
        element.style.setProperty("--render-bar-thickness", `${node.layout.barThicknessEm}em`);
    }

    if (typeof node.layout.exponentLiftEm === "number") {
        element.style.setProperty("--render-exponent-lift", `${node.layout.exponentLiftEm}em`);
    }

    if (typeof node.layout.exponentGapEm === "number") {
        element.style.setProperty("--render-exponent-gap", `${node.layout.exponentGapEm}em`);
    }

    if (typeof node.layout.rootPadTopEm === "number") {
        element.style.setProperty("--render-root-pad-top", `${node.layout.rootPadTopEm}em`);
    }

    if (typeof node.layout.rootPadLeftEm === "number") {
        element.style.setProperty("--render-root-pad-left", `${node.layout.rootPadLeftEm}em`);
    }

    if (typeof node.layout.rootSignScale === "number") {
        element.style.setProperty("--render-root-sign-scale", String(node.layout.rootSignScale));
    }

    if (typeof node.layout.rootMinHeightEm === "number") {
        element.style.setProperty("--render-root-min-height", `${node.layout.rootMinHeightEm}em`);
    }

    if (typeof node.layout.axisMinHeightEm === "number") {
        element.style.setProperty("--render-axis-min-height", `${node.layout.axisMinHeightEm}em`);
    }

    if (typeof node.layout.axisTopReserveEm === "number") {
        element.style.setProperty("--render-axis-top-reserve", `${node.layout.axisTopReserveEm}em`);
    }

    if (typeof node.layout.axisBottomReserveEm === "number") {
        element.style.setProperty("--render-axis-bottom-reserve", `${node.layout.axisBottomReserveEm}em`);
    }

    if (typeof node.layout.axisBalanceEm === "number") {
        element.style.setProperty("--render-axis-balance", `${node.layout.axisBalanceEm}em`);
    }

    if (typeof node.layout.separatorOpacity === "number") {
        element.style.setProperty("--render-separator-opacity", String(node.layout.separatorOpacity));
    }

    if (node.layout.containsFraction === true) {
        element.dataset.containsFraction = "true";
    }

    if (node.layout.separatorVisible === true) {
        element.dataset.separatorVisible = "true";
    }
}

function applyDelimiterStretchAttributes(element, contentNode) {
    if (!element || !contentNode) {
        return;
    }

    const stretchMetrics = buildDelimiterStretchMetrics(contentNode);
    element.style.setProperty("--render-delimiter-content-height", `${stretchMetrics.boxHeightEm}em`);
    element.style.setProperty("--render-delimiter-target-height", `${stretchMetrics.targetHeightEm}em`);
    element.style.setProperty("--render-delimiter-scale-y", String(stretchMetrics.scaleY));
    element.style.setProperty("--render-delimiter-origin-offset", `${stretchMetrics.originOffsetEm}em`);
}

function hasRenderableNodeContent(node) {
    if (!node) {
        return false;
    }

    if (node.type === "sequence") {
        return (node.items || []).some((item) => hasRenderableNodeContent(item));
    }

    return true;
}

function applyRootStretchAttributes(element, contentNode, shellNode) {
    if (!element) {
        return;
    }

    const metricsNode = hasRenderableNodeContent(contentNode) ? contentNode : shellNode;
    if (!metricsNode) {
        return;
    }

    const stretchMetrics = buildRootStretchMetrics(metricsNode, shellNode);
    element.style.setProperty("--render-root-content-height", `${stretchMetrics.boxHeightEm}em`);
    element.style.setProperty("--render-root-target-height", `${stretchMetrics.targetHeightEm}em`);
    element.style.setProperty("--render-root-stretch-y", String(stretchMetrics.scaleY));
    element.style.setProperty("--render-root-origin-offset", `${stretchMetrics.originOffsetEm}em`);
    element.style.setProperty("--render-root-extra-width", `${stretchMetrics.extraWidthEm}em`);
}

function createDelimitedNode(contentNode, className, layoutNode = contentNode) {
    const shellNode = arguments[3] || layoutNode;
    const options = arguments[4] || currentVisualOptions;
    const wrapper = document.createElement("span");
    wrapper.className = className;
    applyMathLayoutAttributes(wrapper, layoutNode);
    applyNodeShellColor(wrapper, shellNode, options);
    applyDelimiterStretchAttributes(wrapper, contentNode);

    const left = document.createElement("span");
    left.className = "math-delimiter math-shell-chrome";
    left.textContent = "(";
    applyShellIdentityAttributes(left, shellNode);
    applyNodeShellColor(left, shellNode, options);

    const content = document.createElement("span");
    content.className = `${className}__content`;
    appendNode(content, createRenderableMathNode(contentNode, options));

    const right = document.createElement("span");
    right.className = "math-delimiter math-shell-chrome";
    right.textContent = ")";
    applyShellIdentityAttributes(right, shellNode);
    applyNodeShellColor(right, shellNode, options);

    wrapper.appendChild(left);
    wrapper.appendChild(content);
    wrapper.appendChild(right);
    return wrapper;
}

function needsPowerBaseDelimiter(node) {
    return ["sequence", "fraction", "negation"].includes(node?.type);
}

function isInlineNegativeSequenceItem(node) {
    if (!node) {
        return true;
    }

    if (node.type === "text") {
        if (node.kind !== "operator") {
            return true;
        }

        return !["+", "-", "="].includes(node.text || "");
    }

    if (node.type === "sequence") {
        return (node.items || []).every((item) => isInlineNegativeSequenceItem(item));
    }

    if (node.type === "fraction") {
        return true;
    }

    if (node.type === "negation") {
        return false;
    }

    return ["group", "function", "root", "power", "multiplication"].includes(node.type);
}

function needsNegationDelimiter(node) {
    if (!node) {
        return false;
    }

    if (node.type === "fraction") {
        return false;
    }

    if (node.type === "sequence") {
        return !isInlineNegativeSequenceItem(node);
    }

    return node.type === "negation";
}

function createRenderableMathNode(node, options = currentVisualOptions) {
    if (!node) {
        return null;
    }

    if (node.type === "text") {
        const textNode = document.createElement("span");
        textNode.className = `math-text math-text--${node.kind || "text"}`;
        textNode.textContent = node.text || "";
        applyMathLayoutAttributes(textNode, node);
        if (node.shellType || node.shellId || node.functionName) {
            applyShellIdentityAttributes(textNode, node);
            applyNodeShellColor(textNode, node, options);
        }
        applyDirectColorAttributes(
            textNode,
            resolveElementColorForNode(node, options?.shellColorPolicy || null)
        );
        return textNode;
    }

    if (node.type === "sequence") {
        const sequence = document.createElement("span");
        sequence.className = "math-sequence";
        applyMathLayoutAttributes(sequence, node);
        node.items.forEach((item) => appendNode(sequence, createRenderableMathNode(item, options)));
        return sequence;
    }

    if (node.type === "group") {
        return createDelimitedNode(node.content, "math-group", node, node, options);
    }

    if (node.type === "function") {
        const wrapper = document.createElement("span");
        wrapper.className = "math-function";
        applyMathLayoutAttributes(wrapper, node);
        applyNodeShellColor(wrapper, node, options);
        const functionNotation = resolveFunctionNotation(node.name || "f", node.baseText || "");

        const name = document.createElement("span");
        name.className = "math-function__name math-shell-chrome";
        applyShellIdentityAttributes(name, node);
        applyNodeShellColor(name, node, options);
        name.appendChild(document.createTextNode(functionNotation.renderLabel || "f"));

        if (functionNotation.renderBaseArgument && node.baseArgument) {
            const base = document.createElement("span");
            base.className = "math-function__base math-shell-chrome";
            applyShellIdentityAttributes(base, node);
            applyNodeShellColor(base, node, options);
            appendNode(base, createRenderableMathNode(node.baseArgument, options));
            name.appendChild(base);
        }

        wrapper.appendChild(name);
        wrapper.appendChild(createDelimitedNode(node.argument, "math-function__argument", node, node, options));
        return wrapper;
    }

    if (node.type === "root") {
        const wrapper = document.createElement("span");
        wrapper.className = "math-root";
        if (node.chromeOnly === true) {
            wrapper.dataset.chromeOnly = "true";
        }
        applyMathLayoutAttributes(wrapper, node);
        applyNodeShellColor(wrapper, node, options);
        applyRootStretchAttributes(wrapper, node.stretchContent || node.shellContent || node.content, node);

        const sign = document.createElement("span");
        sign.className = "math-root__sign math-shell-chrome";
        applyShellIdentityAttributes(sign, node);
        applyNodeShellColor(sign, node, options);

        if (node.degreeText) {
            const degree = document.createElement("span");
            degree.className = "math-root__degree math-shell-chrome";
            degree.textContent = node.degreeText;
            applyShellIdentityAttributes(degree, node);
            applyNodeShellColor(degree, node, options);
            sign.appendChild(degree);
        }

        const content = document.createElement("span");
        content.className = "math-root__content";
        applyShellIdentityAttributes(content, node);
        if (node.chromeOnly !== true) {
            appendNode(content, createRenderableMathNode(node.content, options));
        }

        wrapper.appendChild(sign);
        wrapper.appendChild(content);
        return wrapper;
    }

    if (node.type === "power") {
        const wrapper = document.createElement("span");
        wrapper.className = "math-power";
        applyMathLayoutAttributes(wrapper, node);
        applyNodeShellColor(wrapper, node, options);

        const base = document.createElement("span");
        base.className = "math-power__base";
        appendNode(
            base,
            needsPowerBaseDelimiter(node.base)
                ? createDelimitedNode(node.base, "math-power__base-group", node.base, node, options)
                : createRenderableMathNode(node.base, options)
        );

        const exponent = document.createElement("span");
        exponent.className = "math-power__exponent math-shell-chrome";
        applyShellIdentityAttributes(exponent, node);
        applyNodeShellColor(exponent, node, options);
        if (node.exponentNode) {
            appendNode(exponent, createRenderableMathNode(node.exponentNode, options));
        } else {
            exponent.textContent = node.exponent || "";
        }

        wrapper.appendChild(base);
        wrapper.appendChild(exponent);
        return wrapper;
    }

    if (node.type === "multiplication") {
        const wrapper = document.createElement("span");
        wrapper.className = "math-multiplication";
        applyMathLayoutAttributes(wrapper, node);

        appendNode(wrapper, createRenderableMathNode(node.left, options));

        if (typeof node.separator === "string" && node.separator.length > 0) {
            const separator = document.createElement("span");
            separator.className = "math-multiplication__separator";
            separator.textContent = node.separator;
            wrapper.appendChild(separator);
        }

        appendNode(wrapper, createRenderableMathNode(node.right, options));
        return wrapper;
    }

    if (node.type === "negation") {
        const wrapper = document.createElement("span");
        wrapper.className = "math-negation";
        applyMathLayoutAttributes(wrapper, node);
        applyNodeShellColor(wrapper, node, options);

        const sign = document.createElement("span");
        sign.className = "math-negation__sign math-shell-chrome";
        sign.textContent = "-";
        applyShellIdentityAttributes(sign, node);
        applyNodeShellColor(sign, node, options);

        const content = document.createElement("span");
        content.className = "math-negation__content";
        appendNode(
            content,
            needsNegationDelimiter(node.content)
                ? createDelimitedNode(node.content, "math-negation__group", node.content, node, options)
                : createRenderableMathNode(node.content, options)
        );

        wrapper.appendChild(sign);
        wrapper.appendChild(content);
        return wrapper;
    }

    if (node.type === "fraction") {
        const wrapper = document.createElement("span");
        wrapper.className = "math-fraction";
        applyMathLayoutAttributes(wrapper, node);
        applyNodeShellColor(wrapper, node, options);

        const numerator = document.createElement("span");
        numerator.className = "math-fraction__numerator";
        appendNode(numerator, createRenderableMathNode(node.numerator, options));

        const bar = document.createElement("span");
        bar.className = "math-fraction__bar math-shell-chrome";
        applyShellIdentityAttributes(bar, node);
        applyNodeShellColor(bar, node, options);

        const denominator = document.createElement("span");
        denominator.className = "math-fraction__denominator";
        appendNode(denominator, createRenderableMathNode(node.denominator, options));

        wrapper.appendChild(numerator);
        wrapper.appendChild(bar);
        wrapper.appendChild(denominator);
        return wrapper;
    }

    return null;
}

function createAtomicPowerDelimiter(projectionRole = "power_left") {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    const path = document.createElementNS(svgNamespace, "path");
    const isLeft = projectionRole === "power_left";

    svg.classList.add("math-atomic-power-delimiter");
    svg.setAttribute("viewBox", "0 0 12 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    path.setAttribute(
        "d",
        isLeft
            ? "M 10 1 C 3 20, 3 80, 10 99"
            : "M 2 1 C 9 20, 9 80, 2 99"
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.2");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(path);
    return svg;
}

function createRenderableCell(cell, displayItem = null) {
    const rowStart = Number.isInteger(cell?.rowSpanStart) ? cell.rowSpanStart : cell.row;
    const rowEnd = Number.isInteger(cell?.rowSpanEnd) ? cell.rowSpanEnd : cell.row;
    const gridRowValue = rowEnd > rowStart
        ? `${rowStart + 1} / ${rowEnd + 2}`
        : String((Number.isInteger(cell?.row) ? cell.row : rowStart) + 1);

    if (cell.kind === "fraction_line") {
        const line = document.createElement("div");
        line.className = "worksheet-fraction-line";
        line.dataset.shellType = "fraction";
        if (cell.sourceShellId) {
            line.dataset.shellId = cell.sourceShellId;
        }
        if (cell.rowKind) {
            line.classList.add(`is-${cell.rowKind}`);
        }
        if (cell.projectionRole) {
            line.classList.add(`role-${cell.projectionRole}`);
        }
        if (displayItem) {
            line.style.gridColumn = `${displayItem.gridColumnStartLine} / ${displayItem.gridColumnEndLine}`;
        } else {
            const colStart = Number.isInteger(cell.colStart) ? cell.colStart : cell.col;
            const colEnd = Number.isInteger(cell.colEnd) ? cell.colEnd : cell.col;
            line.style.gridColumn = `${colStart + 1} / ${colEnd + 2}`;
        }
        line.style.gridRow = gridRowValue;
        applyCellMetrics(line, cell);
        if (currentVisualOptions.shellColorsEnabled) {
            const shellColor = resolveShellColor(
                cell.sourceShellId || null,
                "fraction",
                currentVisualOptions.shellColorPolicy || null
            );

            if (shellColor) {
                applyDirectColorAttributes(line, shellColor);
            } else {
                applyDirectColorAttributes(
                    line,
                    resolveElementColorForCell(cell, currentVisualOptions.shellColorPolicy || null)
                );
            }
        }
        return line;
    }

    if (!cell.text) {
        return null;
    }

    const node = document.createElement("div");
    node.className = "worksheet-atom";
    if (cell.rowKind) {
        node.classList.add(`is-${cell.rowKind}`);
    }
    if (cell.projectionRole) {
        node.classList.add(`role-${cell.projectionRole}`);
    }
    const isAtomicPowerDelimiter = cell.projectionRole === "power_left" || cell.projectionRole === "power_right";
    const renderedMathNode = isAtomicPowerDelimiter
        ? createAtomicPowerDelimiter(cell.projectionRole)
        : createRenderableMathNode(cell.renderNode, currentVisualOptions);

    if (renderedMathNode) {
        node.appendChild(renderedMathNode);
        if (isAtomicPowerDelimiter) {
            applyDirectColorAttributes(
                node,
                resolveElementColorForCell(cell, currentVisualOptions.shellColorPolicy || null)
            );
        }
    } else {
        node.textContent = cell.text;
        applyDirectColorAttributes(
            node,
            resolveElementColorForCell(cell, currentVisualOptions.shellColorPolicy || null)
        );
    }

    if (displayItem) {
        node.style.gridColumn = `${displayItem.gridColumnStartLine} / ${displayItem.gridColumnEndLine}`;
    } else {
        node.style.gridColumn = String(cell.col + 1);
    }
    node.style.gridRow = gridRowValue;
    applyCellMetrics(node, cell);
    return node;
}

function createWorksheetSheet(viewModel) {
    const sheet = document.createElement("article");
    sheet.className = "worksheet-sheet";

    const grid = document.createElement("div");
    grid.className = "worksheet-grid";
    const displayModel = buildWorksheetDisplayModel(viewModel);

    grid.style.gridTemplateColumns = displayModel.gridTemplateColumns;
    const rowSizes = Array.isArray(viewModel.layout?.rows) && viewModel.layout.rows.length > 0
        ? viewModel.layout.rows.map((row) => {
            const minHeightEm = typeof row.minHeightEm === "number"
                ? row.minHeightEm
                : (row.kind === "above_axis" ? 0.92 : row.kind === "below_axis" ? 0.86 : 1.12);

            return `minmax(${minHeightEm}em, auto)`;
        })
        : [`minmax(1.12em, auto)`];
    grid.style.gridTemplateRows = rowSizes.join(" ");

    displayModel.items.forEach((item) => {
        const node = createRenderableCell(item.cell, item);
        if (node) {
            grid.appendChild(node);
        }
    });

    sheet.appendChild(grid);
    return sheet;
}

function renderViewModel(viewModel) {
    elements.results.innerHTML = "";
    elements.printSummary.hidden = true;
    elements.printSummary.innerHTML = "";
    if (elements.diagnostics) {
        elements.diagnostics.innerHTML = "";
    }

    if (viewModel.steps.length === 0) {
        elements.results.appendChild(createEmptyState("Der Kern hat keine Projektionszeilen geliefert."));
        return;
    }

    renderColorPanel(viewModel);
    elements.results.appendChild(createWorksheetSheet(viewModel));
    if (elements.diagnostics) {
        elements.diagnostics.hidden = false;
        elements.diagnostics.appendChild(createDiagnosticsPanel(viewModel));
    }
}

function renderResult(result) {
    currentViewModel = buildWorksheetViewModel(result);
    renderViewModel(currentViewModel);
}

function focusColorRule(selectorType, selectorValue, openPicker = false) {
    if (!elements?.colorRulesList) {
        return;
    }

    selectedColorRuleKey = buildColorRuleKey(selectorType, selectorValue);
    renderColorPanel(currentViewModel);

    if (!openPicker) {
        return;
    }

    const input = elements.colorRulesList.querySelector(
        `.color-rule__input[data-selector-type="${selectorType}"][data-selector-value="${selectorValue}"]`
    );

    if (input) {
        input.click();
    }
}

function updateColorRule(selectorType, selectorValue, hex = "") {
    applyColorRuleSpec(
        upsertColorRuleSpec(currentVisualOptions.colorRuleSpec || "", selectorType, selectorValue, hex)
    );

    writeStateToUrl(
        elements?.equationInput?.value?.trim() || "",
        normalizeTargetVariable(elements?.targetVariableInput?.value || ""),
        currentVisualOptions.colorRuleSpec || ""
    );

    renderCurrentViewModel();
}

function resolveClickedColorTarget(target) {
    const clickable = target?.closest?.("[data-shell-type], [data-function-name]");

    if (!clickable) {
        return null;
    }

    const functionName = clickable.dataset.functionName;
    if (typeof functionName === "string" && functionName.length > 0) {
        return {
            selectorType: "function",
            selectorValue: functionName
        };
    }

    const shellType = clickable.dataset.shellType;
    if (typeof shellType === "string" && shellType.length > 0) {
        return {
            selectorType: "shell",
            selectorValue: shellType
        };
    }

    return null;
}

async function solveCurrentEquation() {
    const rawEquation = elements.equationInput.value.trim();
    const targetVariable = normalizeTargetVariable(elements.targetVariableInput.value);

    if (!rawEquation) {
        elements.printSummary.hidden = true;
        elements.results.innerHTML = "";
        if (elements.diagnostics) {
            elements.diagnostics.innerHTML = "";
            elements.diagnostics.hidden = true;
        }
        elements.results.appendChild(createEmptyState("Bitte zuerst eine Gleichung eingeben."));
        setStatus("Es fehlt eine Gleichung.", true);
        return;
    }

    const equationInput = normalizeEquationInput(rawEquation);
    const equation = equationInput.normalized;

    setStatus("Kern wird ausgefuehrt...");
    writeStateToUrl(rawEquation, targetVariable, currentVisualOptions.colorRuleSpec || "");

    const options = targetVariable
        ? { ...PRODUCTIVE_RUNTIME_OPTIONS, targetVariable }
        : { ...PRODUCTIVE_RUNTIME_OPTIONS };
    const result = await GenesisCore.solve(equation, options);

    if (result?.fehler) {
        elements.printSummary.hidden = true;
        elements.results.innerHTML = "";
        if (elements.diagnostics) {
            elements.diagnostics.innerHTML = "";
            elements.diagnostics.hidden = true;
        }
        elements.results.appendChild(createEmptyState(result.fehler));
        setStatus("Der Kern hat einen Fehler zurueckgegeben.", true);
        return;
    }

    renderResult(result);

    const summaryParts = ["Bereit."];
    if (result.targetVariable) {
        summaryParts.push(`Zielvariable: ${result.targetVariable}.`);
    }
    if (equationInput.changed) {
        summaryParts.push(`Eingabe normalisiert zu: ${equation}.`);
    }

    const summary = summaryParts.join(" ");
    setStatus(summary);
}

function attachEvents() {
    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await solveCurrentEquation();
    });

    if (elements.printButton) {
        elements.printButton.addEventListener("click", () => {
            window.print();
        });
    }

    elements.results.addEventListener("click", (event) => {
        const target = resolveClickedColorTarget(event.target);

        if (!target) {
            return;
        }

        focusColorRule(target.selectorType, target.selectorValue, true);
    });

    if (elements.colorRulesList) {
        elements.colorRulesList.addEventListener("input", (event) => {
            const input = event.target.closest(".color-rule__input");

            if (!input) {
                return;
            }

            updateColorRule(
                input.dataset.selectorType || "",
                input.dataset.selectorValue || "",
                input.value || ""
            );
            focusColorRule(input.dataset.selectorType || "", input.dataset.selectorValue || "", false);
        });

        elements.colorRulesList.addEventListener("click", (event) => {
            const resetButton = event.target.closest(".color-rule__reset");
            const colorInput = event.target.closest(".color-rule__input");
            const colorRule = event.target.closest(".color-rule");

            if (resetButton) {
                updateColorRule(
                    resetButton.dataset.selectorType || "",
                    resetButton.dataset.selectorValue || "",
                    ""
                );
                focusColorRule(resetButton.dataset.selectorType || "", resetButton.dataset.selectorValue || "", false);
                return;
            }

            if (colorInput) {
                focusColorRule(colorInput.dataset.selectorType || "", colorInput.dataset.selectorValue || "", false);
                return;
            }

            if (colorRule?.dataset?.ruleKey) {
                selectedColorRuleKey = colorRule.dataset.ruleKey;
                renderColorPanel(currentViewModel);
            }
        });
    }

    if (elements.clearColorsButton) {
        elements.clearColorsButton.addEventListener("click", () => {
            selectedColorRuleKey = null;
            applyColorRuleSpec("");
            writeStateToUrl(
                elements?.equationInput?.value?.trim() || "",
                normalizeTargetVariable(elements?.targetVariableInput?.value || ""),
                ""
            );
            renderCurrentViewModel();
        });
    }
}

function shouldAutoSolveOnInit(urlState = null) {
    if (typeof document === "undefined") {
        return true;
    }

    const mode = String(document.body?.dataset?.initMode || "always").trim().toLowerCase();
    if (mode === "manual") {
        return false;
    }

    if (mode === "url") {
        return Boolean(
            urlState?.equation
            || urlState?.targetVariable
            || (typeof urlState?.colorRules === "string" && urlState.colorRules.length > 0)
        );
    }

    return true;
}

function renderIdleState() {
    if (!elements) {
        return;
    }

    elements.printSummary.hidden = true;
    elements.printSummary.innerHTML = "";
    elements.results.innerHTML = "";
    elements.results.appendChild(createEmptyState("Noch keine Gleichung gesetzt. Rechts eingeben und Start / Go druecken."));

    if (elements.diagnostics) {
        elements.diagnostics.innerHTML = "";
        elements.diagnostics.hidden = true;
    }

    setStatus("Bereit. Gib rechts eine Gleichung ein und starte den Lauf.");
}

async function init() {
    if (!elements) {
        return;
    }

    const urlState = readStateFromUrl();
    if (urlState?.equation) {
        elements.equationInput.value = urlState.equation;
    }
    if (typeof urlState?.targetVariable === "string") {
        elements.targetVariableInput.value = urlState.targetVariable;
    }
    applyColorRuleSpec(urlState?.colorRules || "");

    attachEvents();

    if (shouldAutoSolveOnInit(urlState)) {
        await solveCurrentEquation();
        return;
    }

    renderIdleState();
}

if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
        init().catch((error) => {
            console.error(error);
            setStatus("Die Druckansicht konnte nicht initialisiert werden.", true);
        });
    });
}
