const shellColorPalette = Object.freeze([
    Object.freeze({ key: "teal", hex: "#0F766E" }),
    Object.freeze({ key: "rust", hex: "#B45309" }),
    Object.freeze({ key: "berry", hex: "#BE185D" }),
    Object.freeze({ key: "indigo", hex: "#4338CA" }),
    Object.freeze({ key: "forest", hex: "#3F6212" }),
    Object.freeze({ key: "crimson", hex: "#B91C1C" }),
    Object.freeze({ key: "cobalt", hex: "#1D4ED8" }),
    Object.freeze({ key: "gold", hex: "#A16207" })
]);

const namedColorPalette = Object.freeze({
    orange: "#D97706",
    amber: "#D97706",
    teal: "#0F766E",
    red: "#B91C1C",
    crimson: "#B91C1C",
    blue: "#1D4ED8",
    cobalt: "#1D4ED8",
    indigo: "#4338CA",
    green: "#3F6212",
    forest: "#3F6212",
    pink: "#BE185D",
    berry: "#BE185D",
    purple: "#7C3AED",
    gold: "#A16207",
    gray: "#6B7280",
    grey: "#6B7280",
    black: "#000000",
    white: "#FFFFFF"
});

function stableHash(value = "") {
    let hash = 5381;

    for (const char of String(value)) {
        hash = ((hash << 5) + hash) + char.charCodeAt(0);
        hash |= 0;
    }

    return Math.abs(hash);
}

function toLatexColorName(shellId) {
    return `pFourShell${stableHash(shellId).toString(36)}`;
}

function normalizeHexColor(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    const namedColor = namedColorPalette[trimmed.toLowerCase()] || null;

    if (namedColor) {
        return namedColor;
    }

    if (/^#?[0-9a-f]{3}$/i.test(trimmed)) {
        const compact = trimmed.replace(/^#/, "").toUpperCase();
        return `#${compact.split("").map((char) => char + char).join("")}`;
    }

    if (!/^#?[0-9a-f]{6}$/i.test(trimmed)) {
        return null;
    }

    return `#${trimmed.replace(/^#/, "").toUpperCase()}`;
}

function normalizeRuleSelector(selectorType, selectorValue) {
    const type = String(selectorType || "").trim().toLowerCase();
    const value = String(selectorValue || "").trim();

    if (!type || !value) {
        return null;
    }

    switch (type) {
        case "shell":
        case "function":
        case "role":
        case "cell-kind":
        case "node-kind":
            return value.toLowerCase();
        default:
            return value;
    }
}

function canonicalRuleSelectorType(selectorType) {
    const normalized = String(selectorType || "").trim().toLowerCase();

    switch (normalized) {
        case "kind":
        case "shell":
        case "shell-kind":
            return "shell";
        case "function":
        case "function-name":
            return "function";
        case "shell-id":
        case "shellid":
            return "shell-id";
        case "atom":
        case "atom-id":
        case "source-atom":
            return "atom";
        case "text":
            return "text";
        case "role":
        case "projection-role":
            return "role";
        case "cell-kind":
        case "cell":
            return "cell-kind";
        case "node-kind":
        case "atom-kind":
            return "node-kind";
        default:
            return normalized;
    }
}

function buildRuleTargetKey(rule) {
    return `rule:${rule.selectorType}:${rule.normalizedSelectorValue}:${rule.hex}`;
}

function buildRuleColorEntry(rule, extra = {}) {
    return {
        ...extra,
        targetKey: buildRuleTargetKey(rule),
        key: `rule-${rule.selectorType}`,
        hex: rule.hex,
        latexHex: rule.hex.replace(/^#/, ""),
        latexColorName: toLatexColorName(buildRuleTargetKey(rule)),
        ruleSelectorType: rule.selectorType,
        ruleSelectorValue: rule.selectorValue
    };
}

function collectTargetSourceAtomIds(target = {}) {
    const explicitIds = Array.isArray(target?.sourceAtomIds)
        ? target.sourceAtomIds
        : (Array.isArray(target?.representedSourceAtomIds) ? target.representedSourceAtomIds : []);
    const fallbackId = typeof target?.sourceAtomId === "string" ? target.sourceAtomId.trim() : "";

    return [...new Set([
        ...explicitIds.map((value) => String(value || "").trim()).filter(Boolean),
        ...(fallbackId ? [fallbackId] : [])
    ])];
}

export function parseColorRuleSpec(spec = null) {
    const source = Array.isArray(spec) ? spec.join(";") : String(spec || "");

    if (source.trim().length === 0) {
        return [];
    }

    return source
        .split(/[;\n]+/u)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const separatorIndex = entry.indexOf("=");

            if (separatorIndex <= 0) {
                return null;
            }

            const selector = entry.slice(0, separatorIndex).trim();
            const color = normalizeHexColor(entry.slice(separatorIndex + 1).trim());
            const selectorSeparatorIndex = selector.indexOf(":");

            if (selectorSeparatorIndex <= 0 || !color) {
                return null;
            }

            const selectorType = canonicalRuleSelectorType(selector.slice(0, selectorSeparatorIndex));
            const selectorValue = selector.slice(selectorSeparatorIndex + 1).trim();
            const normalizedSelectorValue = normalizeRuleSelector(selectorType, selectorValue);

            if (!selectorType || !selectorValue || !normalizedSelectorValue) {
                return null;
            }

            return {
                selectorType,
                selectorValue,
                normalizedSelectorValue,
                hex: color
            };
        })
        .filter(Boolean);
}

export function serializeColorRuleSpec(rules = []) {
    return (Array.isArray(rules) ? rules : [])
        .filter((rule) => rule?.selectorType && rule?.selectorValue && rule?.hex)
        .map((rule) => `${rule.selectorType}:${rule.selectorValue}=${rule.hex}`)
        .join(";");
}

function normalizeStringList(value) {
    const items = Array.isArray(value)
        ? value
        : (typeof value === "string" ? value.split(",") : []);

    const normalized = items
        .map((item) => String(item || "").trim().toLowerCase())
        .filter(Boolean);

    return normalized.length > 0 ? [...new Set(normalized)] : null;
}

function normalizeColorMap(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value)
            .map(([key, hex]) => [String(key || "").trim().toLowerCase(), normalizeHexColor(hex)])
            .filter(([key, hex]) => key.length > 0 && typeof hex === "string")
    );
}

function normalizeRuleObjects(value) {
    if (!Array.isArray(value)) {
        return null;
    }

    const normalized = value
        .map((rule) => {
            if (!rule || typeof rule !== "object") {
                return null;
            }

            const selectorType = canonicalRuleSelectorType(rule.selectorType);
            const selectorValue = String(rule.selectorValue || "").trim();
            const normalizedSelectorValue = normalizeRuleSelector(selectorType, selectorValue);
            const hex = normalizeHexColor(rule.hex);

            if (!selectorType || !selectorValue || !normalizedSelectorValue || !hex) {
                return null;
            }

            return {
                selectorType,
                selectorValue,
                normalizedSelectorValue,
                hex
            };
        })
        .filter(Boolean);

    return normalized.length > 0 ? normalized : null;
}

export function normalizeShellColorPolicy(policy = null) {
    if (typeof policy === "string") {
        return {
            fallback: "palette",
            includeKinds: null,
            includeShellIds: null,
            kindColors: {},
            shellIdColors: {},
            defaultHex: null,
            rules: parseColorRuleSpec(policy)
        };
    }

    if (!policy || typeof policy !== "object") {
        return {
            fallback: "palette",
            includeKinds: null,
            includeShellIds: null,
            kindColors: {},
            shellIdColors: {},
            defaultHex: null,
            rules: []
        };
    }

    const includeKinds = normalizeStringList(policy.includeKinds || policy.kinds || null);
    const includeShellIds = normalizeStringList(policy.includeShellIds || policy.shellIds || null);
    const kindColors = normalizeColorMap(policy.kindColors || null);
    const shellIdColors = normalizeColorMap(policy.shellIdColors || null);
    const defaultHex = normalizeHexColor(policy.defaultHex || policy.hex || null);
    const directRules = normalizeRuleObjects(policy.rules || null);
    const rules = directRules || parseColorRuleSpec(
        policy.ruleSpec
        || policy.colorRules
        || policy.colorRuleSpec
        || policy.rules
        || null
    );

    return {
        fallback: policy.fallback === "none" ? "none" : "palette",
        includeKinds,
        includeShellIds,
        kindColors,
        shellIdColors,
        defaultHex,
        rules
    };
}

function buildShellColorEntry(shellId, kind, hex, key = "custom", paletteIndex = null) {
    return {
        shellId,
        kind: typeof kind === "string" && kind.length > 0 ? kind : null,
        paletteIndex,
        key,
        hex,
        latexHex: hex.replace(/^#/, ""),
        latexColorName: toLatexColorName(shellId)
    };
}

function policyMatchesShell(policy, shellId, kind) {
    if (Array.isArray(policy.includeKinds) && policy.includeKinds.length > 0) {
        if (!policy.includeKinds.includes(String(kind || "").trim().toLowerCase())) {
            return false;
        }
    }

    if (Array.isArray(policy.includeShellIds) && policy.includeShellIds.length > 0) {
        if (!policy.includeShellIds.includes(String(shellId || "").trim().toLowerCase())) {
            return false;
        }
    }

    return true;
}

function resolveRuleColorForTarget(target = {}, policy = null) {
    const normalizedPolicy = normalizeShellColorPolicy(policy);
    const rules = Array.isArray(normalizedPolicy.rules) ? normalizedPolicy.rules : [];

    for (let index = rules.length - 1; index >= 0; index -= 1) {
        const rule = rules[index];

        switch (rule.selectorType) {
            case "shell":
                if (String(target.kind || "").trim().toLowerCase() === rule.normalizedSelectorValue) {
                    return buildRuleColorEntry(rule, {
                        shellId: target.shellId || null,
                        kind: target.kind || null
                    });
                }
                break;
            case "function":
                if (
                    String(target.kind || "").trim().toLowerCase() === "function"
                    && String(target.functionName || "").trim().toLowerCase() === rule.normalizedSelectorValue
                ) {
                    return buildRuleColorEntry(rule, {
                        shellId: target.shellId || null,
                        kind: target.kind || null,
                        functionName: target.functionName || null
                    });
                }
                break;
            case "shell-id":
                if (String(target.shellId || "").trim() === rule.selectorValue) {
                    return buildRuleColorEntry(rule, {
                        shellId: target.shellId || null,
                        kind: target.kind || null
                    });
                }
                break;
            case "atom":
                if (collectTargetSourceAtomIds(target).includes(rule.selectorValue)) {
                    return buildRuleColorEntry(rule, {
                        sourceAtomId: target.sourceAtomId || null
                    });
                }
                break;
            case "text":
                if (String(target.text || "").trim() === rule.selectorValue) {
                    return buildRuleColorEntry(rule, {
                        sourceAtomId: target.sourceAtomId || null,
                        text: target.text || null
                    });
                }
                break;
            case "role":
                if (String(target.projectionRole || "").trim().toLowerCase() === rule.normalizedSelectorValue) {
                    return buildRuleColorEntry(rule, {
                        projectionRole: target.projectionRole || null
                    });
                }
                break;
            case "cell-kind":
                if (String(target.kind || "").trim().toLowerCase() === rule.normalizedSelectorValue) {
                    return buildRuleColorEntry(rule, {
                        kind: target.kind || null
                    });
                }
                break;
            case "node-kind":
                if (String(target.nodeKind || "").trim().toLowerCase() === rule.normalizedSelectorValue) {
                    return buildRuleColorEntry(rule, {
                        nodeKind: target.nodeKind || null,
                        sourceAtomId: target.sourceAtomId || null
                    });
                }
                break;
            default:
                break;
        }
    }

    return null;
}

export function listShellColorPalette() {
    return [...shellColorPalette];
}

export function resolveShellColor(shellId, kind = null, policy = null) {
    if (typeof shellId !== "string" || shellId.length === 0) {
        return null;
    }

    const normalizedShellId = shellId.trim();
    const normalizedKind = typeof kind === "string" && kind.length > 0 ? kind.trim().toLowerCase() : null;
    const normalizedPolicy = normalizeShellColorPolicy(policy);
    const ruleColor = resolveRuleColorForTarget({
        shellId: normalizedShellId,
        kind: normalizedKind,
        functionName: typeof policy?.functionName === "string" ? policy.functionName : null
    }, normalizedPolicy);

    if (ruleColor) {
        return ruleColor;
    }

    if (!policyMatchesShell(normalizedPolicy, normalizedShellId, normalizedKind)) {
        return null;
    }

    const shellIdHex = normalizedPolicy.shellIdColors[normalizedShellId.toLowerCase()] || null;
    const kindHex = normalizedKind ? normalizedPolicy.kindColors[normalizedKind] || null : null;
    const customHex = shellIdHex || kindHex || normalizedPolicy.defaultHex;

    if (customHex) {
        return buildShellColorEntry(normalizedShellId, normalizedKind, customHex);
    }

    if (normalizedPolicy.fallback !== "palette") {
        return null;
    }

    const paletteIndex = stableHash(shellId) % shellColorPalette.length;
    const paletteEntry = shellColorPalette[paletteIndex];

    return buildShellColorEntry(
        normalizedShellId,
        normalizedKind,
        paletteEntry.hex,
        paletteEntry.key,
        paletteIndex
    );
}

function normalizeProjectionRole(projectionRole = null) {
    return typeof projectionRole === "string" && projectionRole.trim().length > 0
        ? projectionRole.trim().toLowerCase()
        : null;
}

function isShellChromeProjectionRole(projectionRole = null) {
    const normalizedRole = normalizeProjectionRole(projectionRole);

    if (!normalizedRole) {
        return false;
    }

    if (
        normalizedRole === "power_exponent"
        || normalizedRole === "fraction_line"
        || normalizedRole === "negation_sign"
        || normalizedRole === "inverse_operator"
        || normalizedRole === "product_operator"
        || normalizedRole === "shell_container"
    ) {
        return true;
    }

    if (normalizedRole.startsWith("function_")) {
        return normalizedRole !== "function_argument";
    }

    if (normalizedRole.startsWith("group_")) {
        return true;
    }

    if (normalizedRole.startsWith("root_")) {
        return normalizedRole !== "root_content";
    }

    return false;
}

export function resolveShellColorForNode(node, policy = null) {
    const normalizedPolicy = normalizeShellColorPolicy(policy);
    const normalizedKind = node?.shellType || node?.type || null;
    const normalizedFunctionName = typeof node?.functionName === "string" && node.functionName.trim().length > 0
        ? node.functionName
        : (node?.type === "function" ? node?.name || null : null);
    const inheritedShellId = typeof node?.sourceShellId === "string" && node.sourceShellId.trim().length > 0
        ? node.sourceShellId.trim()
        : null;
    const inheritedShellKind = typeof node?.parentType === "string" && node.parentType.trim().length > 0
        ? node.parentType.trim().toLowerCase()
        : null;
    const ruleColor = resolveRuleColorForTarget({
        shellId: node?.shellId || null,
        kind: normalizedKind,
        functionName: normalizedFunctionName
    }, normalizedPolicy);

    if (ruleColor) {
        return ruleColor;
    }

    const inheritedAtomRuleColor = resolveRuleColorForTarget({
        sourceAtomId: node?.sourceAtomId || null,
        sourceAtomIds: node?.representedSourceAtomIds || null
    }, normalizedPolicy);

    if (inheritedAtomRuleColor) {
        return inheritedAtomRuleColor;
    }

    if (inheritedShellId && isShellChromeProjectionRole(node?.projectionRole)) {
        const inheritedShellRuleColor = resolveRuleColorForTarget({
            shellId: inheritedShellId,
            kind: inheritedShellKind,
            functionName: null
        }, normalizedPolicy);

        if (inheritedShellRuleColor) {
            return inheritedShellRuleColor;
        }

        const inheritedShellColor = resolveShellColor(inheritedShellId, inheritedShellKind, normalizedPolicy);

        if (inheritedShellColor) {
            return inheritedShellColor;
        }
    }

    return resolveShellColor(
        node?.shellId || null,
        normalizedKind,
        normalizedFunctionName
            ? {
                ...normalizedPolicy,
                functionName: normalizedFunctionName
            }
            : normalizedPolicy
    );
}

export function resolveElementColorForNode(node, policy = null) {
    if (!node) {
        return null;
    }

    return resolveRuleColorForTarget({
        sourceAtomId: node.sourceAtomId || null,
        sourceAtomIds: node.representedSourceAtomIds || null,
        text: node.type === "text" ? node.text || null : null,
        nodeKind: node.kind || node.type || null
    }, policy);
}

export function resolveElementColorForCell(cell, policy = null) {
    if (!cell) {
        return null;
    }

    return resolveRuleColorForTarget({
        sourceAtomId: cell.sourceAtomId || null,
        sourceAtomIds: cell.representedSourceAtomIds || null,
        shellId: cell.sourceShellId || null,
        text: cell.text || null,
        kind: cell.kind || null,
        projectionRole: cell.projectionRole || null
    }, policy);
}

function visitRenderNode(node, visitor) {
    if (!node) {
        return;
    }

    visitor(node);

    switch (node.type) {
        case "sequence":
            (node.items || []).forEach((item) => visitRenderNode(item, visitor));
            break;
        case "group":
        case "root":
        case "negation":
            visitRenderNode(node.content, visitor);
            break;
        case "function":
            visitRenderNode(node.argument, visitor);
            break;
        case "power":
            visitRenderNode(node.base, visitor);
            break;
        case "fraction":
            visitRenderNode(node.numerator, visitor);
            visitRenderNode(node.denominator, visitor);
            break;
        case "multiplication":
            visitRenderNode(node.left, visitor);
            visitRenderNode(node.right, visitor);
            break;
        default:
            break;
    }
}

export function collectShellColorEntriesFromViewModel(viewModel, policy = null) {
    const entries = new Map();

    (viewModel?.steps || []).forEach((step) => {
        (step.cells || []).forEach((cell) => {
            if (cell?.kind === "fraction_line") {
                const fractionColor = resolveShellColor(cell.sourceShellId || null, "fraction", policy);
                if (fractionColor) {
                    entries.set(fractionColor.latexColorName, fractionColor);
                }
            }

            const cellColor = resolveElementColorForCell(cell, policy);
            if (cellColor) {
                entries.set(cellColor.latexColorName, cellColor);
            }

            visitRenderNode(cell?.renderNode, (node) => {
                const nodeColor = resolveShellColorForNode(node, policy);
                if (nodeColor) {
                    entries.set(nodeColor.latexColorName, nodeColor);
                }

                const textColor = resolveElementColorForNode(node, policy);
                if (textColor) {
                    entries.set(textColor.latexColorName, textColor);
                }
            });
        });
    });

    return [...entries.values()].sort((left, right) => left.latexColorName.localeCompare(right.latexColorName));
}

export function collectColorControlTargetsFromViewModel(viewModel) {
    const shellKinds = new Set();
    const functionNames = new Set();

    (viewModel?.steps || []).forEach((step) => {
        (step.cells || []).forEach((cell) => {
            if (cell?.kind === "fraction_line") {
                shellKinds.add("fraction");
            }

            visitRenderNode(cell?.renderNode, (node) => {
                if (node?.shellType) {
                    shellKinds.add(String(node.shellType).trim().toLowerCase());
                }

                const functionName = typeof node?.functionName === "string" && node.functionName.trim().length > 0
                    ? node.functionName
                    : (node?.type === "function" ? node?.name : null);

                if (typeof functionName === "string" && functionName.trim().length > 0) {
                    functionNames.add(functionName.trim().toLowerCase());
                }
            });
        });
    });

    return {
        shellKinds: [...shellKinds].sort(),
        functionNames: [...functionNames].sort()
    };
}
