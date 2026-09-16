import assert from "node:assert/strict";

import {
    collectShellColorEntriesFromViewModel,
    normalizeShellColorPolicy,
    resolveElementColorForCell,
    resolveElementColorForNode,
    resolveShellColor,
    resolveShellColorForNode
} from "../../presentation/shell_colors/index.js";

const defaultPolicy = normalizeShellColorPolicy();
assert.equal(defaultPolicy.fallback, "palette");
assert.equal(defaultPolicy.defaultHex, null);

const focusedPolicy = normalizeShellColorPolicy({
    includeKinds: ["root", "power"],
    defaultHex: "D97706",
    fallback: "none"
});

assert.deepEqual(focusedPolicy.includeKinds, ["root", "power"]);
assert.equal(focusedPolicy.defaultHex, "#D97706");
assert.equal(focusedPolicy.fallback, "none");

const rootColor = resolveShellColor("shell-root-1", "root", focusedPolicy);
assert.equal(rootColor?.hex, "#D97706");
assert.equal(rootColor?.latexHex, "D97706");

const functionColor = resolveShellColor("shell-function-1", "function", focusedPolicy);
assert.equal(functionColor, null);

const powerNodeColor = resolveShellColorForNode(
    { shellId: "shell-power-1", shellType: "power" },
    focusedPolicy
);
assert.equal(powerNodeColor?.hex, "#D97706");

const inheritedPowerContentShellRuleColor = resolveShellColorForNode(
    {
        type: "text",
        kind: "variable",
        sourceAtomId: "atom-a",
        sourceShellId: "shell-power-1",
        parentType: "POWER",
        projectionRole: "content"
    },
    {
        fallback: "none",
        ruleSpec: "shell-id:shell-power-1=#2563EB"
    }
);
assert.equal(
    inheritedPowerContentShellRuleColor,
    null,
    "Inhalt einer Potenz darf explizite shell-id-Regeln seiner Ursprungsschale nicht mehr erben."
);

const inheritedPowerExponentShellRuleColor = resolveShellColorForNode(
    {
        type: "text",
        kind: "number",
        sourceAtomId: "atom-explicit-power",
        sourceShellId: "shell-power-1",
        parentType: "POWER",
        projectionRole: "power_exponent"
    },
    {
        fallback: "none",
        ruleSpec: "shell-id:shell-power-1=#2563EB"
    }
);
assert.equal(
    inheritedPowerExponentShellRuleColor?.hex,
    "#2563EB",
    "Nur echte Potenzhuellen wie der Exponent duerfen explizite shell-id-Regeln ihrer Ursprungsschale erben."
);

const inheritedPowerContentKindColor = resolveShellColorForNode(
    {
        type: "text",
        kind: "variable",
        sourceAtomId: "atom-a",
        sourceShellId: "shell-power-2",
        parentType: "POWER",
        projectionRole: "content"
    },
    focusedPolicy
);
assert.equal(
    inheritedPowerContentKindColor,
    null,
    "Allgemeine Power-Schalenfarben duerfen nicht mehr auf den Potenzinhalt durchschlagen."
);

const inheritedPowerExponentKindColor = resolveShellColorForNode(
    {
        type: "text",
        kind: "number",
        sourceAtomId: "atom-exp",
        sourceShellId: "shell-power-2",
        parentType: "POWER",
        projectionRole: "power_exponent"
    },
    focusedPolicy
);
assert.equal(
    inheritedPowerExponentKindColor?.hex,
    "#D97706",
    "Der sichtbare Exponent bleibt als Potenzhuelle weiterhin faerbbar."
);

const representedExponentElementColor = resolveElementColorForNode(
    {
        type: "text",
        kind: "variable",
        text: "x",
        sourceAtomId: "shell-power-proxy",
        representedSourceAtomIds: ["atom-x"]
    },
    {
        fallback: "none",
        ruleSpec: "atom:atom-x=#DC2626"
    }
);
assert.equal(
    representedExponentElementColor?.hex,
    "#DC2626",
    "Auch wenn eine sichtbare Spur nur ueber eine Proxy-Schale kommt, muss eine atomare Regel auf die repraesentierte Zielvariable greifen."
);

const representedExponentCellColor = resolveElementColorForCell(
    {
        text: "x",
        sourceAtomId: "shell-power-proxy",
        representedSourceAtomIds: ["atom-x"],
        projectionRole: "power_exponent",
        kind: "number"
    },
    {
        fallback: "none",
        ruleSpec: "atom:atom-x=#DC2626"
    }
);
assert.equal(
    representedExponentCellColor?.hex,
    "#DC2626",
    "Dieselbe atomare Regel muss auch auf Cockpit-/Worksheet-Zellen mit Proxy-Ursprung greifen."
);

const inheritedFunctionArgumentColor = resolveShellColorForNode(
    {
        type: "text",
        kind: "number",
        sourceAtomId: "atom-arg",
        sourceShellId: "shell-function-1",
        parentType: "FUNCTION",
        projectionRole: "function_argument"
    },
    {
        fallback: "none",
        ruleSpec: "shell-id:shell-function-1=#1D4ED8"
    }
);
assert.equal(
    inheritedFunctionArgumentColor,
    null,
    "Funktionsargumente duerfen die Farbe ihrer Operationshuelle nicht mehr erben."
);

const inheritedFunctionChromeColor = resolveShellColorForNode(
    {
        type: "text",
        kind: "variable",
        sourceAtomId: "atom-sin",
        sourceShellId: "shell-function-1",
        parentType: "FUNCTION",
        projectionRole: "function_name",
        functionName: "sin"
    },
    {
        fallback: "none",
        ruleSpec: "shell-id:shell-function-1=#1D4ED8"
    }
);
assert.equal(
    inheritedFunctionChromeColor?.hex,
    "#1D4ED8",
    "Der Funktionsname selbst bleibt als sichtbare Operationshuelle farblich adressierbar."
);

const viewModel = {
    steps: [
        {
            cells: [
                {
                    id: "c-root",
                    kind: "atom",
                    renderNode: {
                        type: "root",
                        shellId: "shell-root-1",
                        shellType: "root",
                        content: null
                    }
                },
                {
                    id: "c-frac",
                    kind: "fraction_line",
                    sourceShellId: "shell-fraction-1"
                }
            ]
        }
    ]
};

const focusedEntries = collectShellColorEntriesFromViewModel(viewModel, focusedPolicy);
assert.deepEqual(
    focusedEntries.map((entry) => entry.shellId),
    ["shell-root-1"],
    "Die Policy soll nur die explizit zugelassenen Schalentypen sammeln."
);

const paletteEntries = collectShellColorEntriesFromViewModel(viewModel);
assert.deepEqual(
    paletteEntries.map((entry) => entry.shellId).sort(),
    ["shell-fraction-1", "shell-root-1"],
    "Ohne Filter sollen sowohl Wurzel- als auch Bruchschalen gesammelt werden."
);

console.log("Schalenfarben-Regeln erfolgreich geprueft.");
