import { createLayout, createSequenceNode, createTextNode, roundEm } from "./shared.js";
import {
    resolveNodeAxisGeometry
} from "../renderVerticalGeometry.js";
import { resolveFunctionNotation } from "../functionNotation.js";

function withRenderIdentity(node, atom, shellType = null) {
    if (!node || !atom || typeof atom !== "object") {
        return node;
    }

    const representedSourceAtomIds = Array.isArray(atom.representedSourceAtomIds)
        ? [...new Set(atom.representedSourceAtomIds.map((id) => String(id || "").trim()).filter(Boolean))]
        : [];

    return {
        ...node,
        sourceAtomId: atom.sourceAtomId || atom.id || null,
        representedSourceAtomIds: representedSourceAtomIds.length > 0
            ? representedSourceAtomIds
            : (Array.isArray(node.representedSourceAtomIds) ? node.representedSourceAtomIds : null),
        sourceShellId: atom.sourceShellId || null,
        parentType: atom.parentType || node.parentType || null,
        shellId: atom.shellId || (shellType ? (atom.id || null) : (node.shellId || null)),
        shellType: atom.shellType || shellType || node.shellType || null,
        functionName: atom.functionName || node.functionName || null,
        projectionRole: atom.projectionRole || node.projectionRole || null,
        position: atom.position || node.position || null
    };
}

function needsParentheses(text) {
    return /[+\-*/= ]/.test(text);
}

function formatOperator(atom) {
    if (!atom) {
        return "";
    }

    if (atom.value === "*" && atom.isImplicit) {
        return "";
    }

    if (atom.value === "*") {
        return " * ";
    }

    if (["+", "-", "="].includes(atom.value)) {
        return ` ${atom.value} `;
    }

    return atom.value || "";
}

function normalizeInlineMath(text) {
    return text.replace(/\s+/g, " ").trim();
}

function formatFunctionHead(name = "f", baseText = "") {
    return resolveFunctionNotation(name, normalizeInlineMath(String(baseText || ""))).displayHead;
}

function unwrapOuterParens(text = "") {
    const normalized = String(text || "").trim();

    if (!(normalized.startsWith("(") && normalized.endsWith(")"))) {
        return normalized;
    }

    let depth = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        const char = normalized[index];
        if (char === "(") {
            depth += 1;
        } else if (char === ")") {
            depth -= 1;
        }

        if (depth === 0 && index < normalized.length - 1) {
            return normalized;
        }
    }

    return normalized.slice(1, -1).trim();
}

function resolveRootDegreeText(atom) {
    if (!atom || typeof atom !== "object") {
        return "";
    }

    if (atom.type === "ROOT") {
        const degreeText = String(atom.degree ?? "").trim();
        return degreeText === "2" ? "" : degreeText;
    }

    if (atom.type !== "POWER" || atom.generatedByFamily !== "power_base_release") {
        return "";
    }

    const exponentText = String(atom.exponent ?? "").trim();
    if (!exponentText.startsWith("1/")) {
        return "";
    }

    const denominatorText = unwrapOuterParens(exponentText.slice(2));
    return denominatorText === "2" ? "" : denominatorText;
}

function shouldRenderPowerAsRoot(atom) {
    return resolveRootDegreeText(atom).length > 0 || (
        atom?.type === "POWER"
        && atom?.generatedByFamily === "power_base_release"
        && String(atom?.exponent ?? "").trim() === "1/2"
    );
}

function resolveAxisEnvelope(layout, tuning, ownFractionDepth, maxFractionDepth, containsFraction) {
    const normalizedOwnFractionDepth = Math.max(0, ownFractionDepth || 0);
    const normalizedMaxFractionDepth = Math.max(0, maxFractionDepth || 0);
    const nestedFractionBonus = Math.max(0, normalizedMaxFractionDepth - 1);
    let axisMinHeightEm = 1.12;
    let aboveAxisMinHeightEm = 0.92;
    let belowAxisMinHeightEm = 0.86;

    if (containsFraction === true) {
        axisMinHeightEm = Math.max(axisMinHeightEm, 1.14 + (nestedFractionBonus * 0.06));
        aboveAxisMinHeightEm = Math.max(aboveAxisMinHeightEm, 0.94 + (nestedFractionBonus * 0.05));
        belowAxisMinHeightEm = Math.max(belowAxisMinHeightEm, 0.88 + (nestedFractionBonus * 0.04));
    }

    if (layout.boxRole === "fraction") {
        axisMinHeightEm = Math.max(axisMinHeightEm, ((tuning.scale || 1) * 1.1) + 0.08);
        aboveAxisMinHeightEm = Math.max(aboveAxisMinHeightEm, ((tuning.scale || 1) * 0.94) + 0.04);
        belowAxisMinHeightEm = Math.max(belowAxisMinHeightEm, ((tuning.scale || 1) * 0.86) + 0.04);

        if (normalizedOwnFractionDepth >= 2) {
            axisMinHeightEm = Math.max(axisMinHeightEm, 1.2);
        }
    }

    if (layout.boxRole === "root") {
        axisMinHeightEm = Math.max(axisMinHeightEm, (tuning.rootMinHeightEm || 1.08) + 0.06);
        aboveAxisMinHeightEm = Math.max(aboveAxisMinHeightEm, 0.92 + ((tuning.rootPadTopEm || 0.08) * 0.8));
    }

    if (layout.boxRole === "power") {
        axisMinHeightEm = Math.max(axisMinHeightEm, 1 + ((tuning.exponentLiftEm || 0.34) * 0.55));
        aboveAxisMinHeightEm = Math.max(aboveAxisMinHeightEm, 0.84 + ((tuning.exponentLiftEm || 0.34) * 0.35));
    }

    const axisTopReserveEm = Math.max(
        0.18,
        axisMinHeightEm - belowAxisMinHeightEm - 0.08,
        layout.boxRole === "root" ? 0.24 : 0,
        layout.boxRole === "power" ? 0.22 : 0
    );
    const axisBottomReserveEm = Math.max(
        0.14,
        axisMinHeightEm - aboveAxisMinHeightEm - 0.06,
        layout.boxRole === "fraction" ? 0.16 : 0,
        normalizedOwnFractionDepth >= 2 ? 0.18 : 0
    );

    const axisBalanceEm = axisTopReserveEm - axisBottomReserveEm;

    return {
        axisMinHeightEm: roundEm(axisMinHeightEm),
        aboveAxisMinHeightEm: roundEm(aboveAxisMinHeightEm),
        belowAxisMinHeightEm: roundEm(belowAxisMinHeightEm),
        axisTopReserveEm: roundEm(axisTopReserveEm),
        axisBottomReserveEm: roundEm(axisBottomReserveEm),
        axisBalanceEm: roundEm(axisBalanceEm)
    };
}

function resolveLayoutTuning(layout, ownFractionDepth, maxFractionDepth, containsFraction) {
    const tuning = {};
    const normalizedOwnFractionDepth = Math.max(0, ownFractionDepth || 0);
    const normalizedMaxFractionDepth = Math.max(0, maxFractionDepth || 0);

    if (layout.boxRole === "fraction") {
        const depth = Math.max(1, normalizedOwnFractionDepth);

        tuning.scale = depth >= 4 ? 0.8 : depth === 3 ? 0.86 : depth === 2 ? 0.92 : 1;
        tuning.rowGapEm = depth >= 2 ? 0.01 : 0.02;
        tuning.marginInlineEm = depth >= 4 ? 0.025 : depth === 3 ? 0.03 : depth === 2 ? 0.04 : 0.06;
        tuning.barThicknessEm = depth >= 3 ? 0.065 : depth === 2 ? 0.07 : 0.08;
        tuning.numeratorGapEm = depth >= 3 ? 0.1 : depth === 2 ? 0.11 : 0.12;
        tuning.denominatorGapEm = depth >= 3 ? 0.14 : depth === 2 ? 0.15 : 0.16;
    }

    if (layout.boxRole === "power") {
        tuning.exponentLiftEm = containsFraction
            ? 0.48 + (Math.max(0, normalizedMaxFractionDepth - 1) * 0.04)
            : 0.34;
        tuning.exponentGapEm = containsFraction ? 0.03 : 0;
    }

    if (layout.boxRole === "root") {
        tuning.rootPadTopEm = containsFraction
            ? 0.14 + (Math.max(0, normalizedMaxFractionDepth - 1) * 0.03)
            : 0.08;
        tuning.rootPadLeftEm = containsFraction
            ? 0.16 + (Math.max(0, normalizedMaxFractionDepth - 1) * 0.02)
            : 0.12;
        tuning.rootSignScale = containsFraction ? 1.18 : 1.15;
        tuning.rootMinHeightEm = containsFraction ? 1.14 : 1.08;
    }

    if (layout.boxRole === "multiplication" && layout.separatorVisible === true) {
        tuning.separatorOpacity = 0.92;
    }

    return {
        ...tuning,
        ...resolveAxisEnvelope(
            layout,
            tuning,
            normalizedOwnFractionDepth,
            normalizedMaxFractionDepth,
            containsFraction
        )
    };
}

function classifyRenderNode(node) {
    if (!node) {
        return "empty";
    }

    if (node.type === "text") {
        if (node.kind === "number") {
            return "number";
        }

        if (node.kind === "variable") {
            return "variable";
        }

        if (node.kind === "operator") {
            return "operator";
        }

        return "text";
    }

    return node.type;
}

function chooseMultiplicationSeparator(leftNode, rightNode) {
    const leftType = classifyRenderNode(leftNode);
    const rightType = classifyRenderNode(rightNode);

    if (leftType === "empty" || rightType === "empty") {
        return "";
    }

    if (rightType === "number") {
        return "·";
    }

    if (leftType === "number" && rightType === "number") {
        return "·";
    }

    return "";
}

function buildCollectionRenderNode(collection = [], options = {}) {
    const showImplicitMultiplication = options.showImplicitMultiplication === true;

    return createSequenceNode(collection.map((atom) => {
        if (showImplicitMultiplication && atom?.type === "OPERATOR" && atom.value === "*" && atom.isImplicit) {
            return withRenderIdentity(createTextNode("·", "operator"), atom);
        }

        return buildRenderNode(atom);
    }));
}

function formatCollection(collection = []) {
    const parts = [];

    collection.forEach((atom) => {
        const formatted = formatAtom(atom);
        if (!formatted) {
            return;
        }

        parts.push(formatted);
    });

    return normalizeInlineMath(parts.join(""));
}

function formatBinaryShell(content, otherSide, separator) {
    const left = formatCollection(content);
    const right = formatCollection(otherSide);

    if (!left) {
        return right;
    }

    if (!right) {
        return left;
    }

    return `${left}${separator}${right}`;
}

function formatPower(atom) {
    const inner = formatCollection(atom.content || []);
    const degreeText = resolveRootDegreeText(atom);

    if (shouldRenderPowerAsRoot(atom)) {
        return degreeText.length > 0
            ? `sqrt[${degreeText}](${inner})`
            : `sqrt(${inner})`;
    }

    const exponent = atom.exponent ?? 2;
    const base = needsParentheses(inner) ? `(${inner})` : inner;
    return `${base}^${exponent}`;
}

function formatNegation(atom) {
    const inner = formatCollection(atom.content || []);
    if (!inner) {
        return "-";
    }

    return needsParentheses(inner) ? `-(${inner})` : `-${inner}`;
}

function formatDivision(atom) {
    const numerator = formatCollection(atom.numerator || []);
    const denominator = formatCollection(atom.denominator || []);

    if (!numerator) {
        return denominator;
    }

    if (!denominator) {
        return numerator;
    }

    return `(${numerator}) / (${denominator})`;
}

function buildBinaryRenderNode(content = [], otherSide = [], operatorText = "+", atom = null) {
    const left = buildCollectionRenderNode(content);
    const right = buildCollectionRenderNode(otherSide);
    const operatorNode = atom
        ? withRenderIdentity(createTextNode(operatorText, "operator"), atom)
        : createTextNode(operatorText, "operator");

    if (!left) {
        return right;
    }

    if (!right) {
        return left;
    }

    return createSequenceNode([
        left,
        operatorNode,
        right
    ]);
}

function buildMultiplicationRenderNode(content = [], factor = [], flowDirection = "ltr") {
    const reverseFlow = flowDirection === "rtl";
    const left = buildCollectionRenderNode(reverseFlow ? factor : content);
    const right = buildCollectionRenderNode(reverseFlow ? content : factor);

    if (!left) {
        return right;
    }

    if (!right) {
        return left;
    }

    return {
        type: "multiplication",
        left,
        right,
        separator: chooseMultiplicationSeparator(left, right)
    };
}

function buildRawRenderNode(atom) {
    if (!atom) {
        return null;
    }

    if (Array.isArray(atom)) {
        return buildCollectionRenderNode(atom);
    }

    switch (atom.type) {
        case "NUMBER":
        case "VARIABLE":
            return withRenderIdentity(
                createTextNode(atom.value || "", atom.type.toLowerCase()),
                atom
            );
        case "ANCHOR":
            return withRenderIdentity(
                createTextNode(atom.value || "", "anchor"),
                atom
            );
        case "OPERATOR":
            if (atom.value === "*" && atom.isImplicit) {
                return null;
            }

            return withRenderIdentity(
                createTextNode(atom.value || "", "operator"),
                atom
            );
        case "GROUP":
            return withRenderIdentity({
                type: "group",
                content: buildCollectionRenderNode(atom.content || [])
            }, atom, "group");
        case "COLLECTION":
            return withRenderIdentity(
                buildCollectionRenderNode(atom.content || []),
                atom,
                "sequence"
            );
        case "FUNCTION":
            return withRenderIdentity({
                type: "function",
                name: atom.name || "f",
                argument: buildCollectionRenderNode(atom.content || []),
                baseArgument: buildCollectionRenderNode(atom.baseContent || []),
                baseText: normalizeInlineMath(formatCollection(atom.baseContent || []))
            }, atom, "function");
        case "ROOT":
            return withRenderIdentity({
                type: "root",
                content: buildCollectionRenderNode(atom.content || []),
                degreeText: resolveRootDegreeText(atom)
            }, atom, "root");
        case "POWER":
            if (shouldRenderPowerAsRoot(atom)) {
                return withRenderIdentity({
                    type: "root",
                    content: buildCollectionRenderNode(atom.content || []),
                    degreeText: resolveRootDegreeText(atom)
                }, atom, "root");
            }

            return withRenderIdentity({
                type: "power",
                base: buildCollectionRenderNode(atom.content || []),
                exponent: String(atom.exponent ?? 2),
                exponentNode: Array.isArray(atom.exponentNodes) && atom.exponentNodes.length > 0
                    ? buildCollectionRenderNode(atom.exponentNodes)
                    : null
            }, atom, "power");
        case "NEGATION":
            return withRenderIdentity({
                type: "negation",
                content: buildCollectionRenderNode(atom.content || [], { showImplicitMultiplication: true })
            }, atom, "negation");
        case "ADDITION":
            return buildBinaryRenderNode(atom.content || [], atom.passive || [], "+", atom);
        case "SUBTRACTION":
            return buildBinaryRenderNode(atom.content || [], atom.passive || [], "-", atom);
        case "MULTIPLICATION":
            return buildMultiplicationRenderNode(atom.content || [], atom.factor || [], atom.flowDirection || "ltr");
        case "DIVISION":
            return withRenderIdentity({
                type: "fraction",
                numerator: buildCollectionRenderNode(atom.numerator || []),
                denominator: buildCollectionRenderNode(atom.denominator || [])
            }, atom, "fraction");
        default:
            return withRenderIdentity(
                createTextNode(atom.value || "", "text"),
                atom
            );
    }
}

function attachFractionMetrics(node, childNodes = [], currentFractionDepth = 0, currentNestingDepth = 0, layout = {}) {
    const childFractionDepth = childNodes.reduce(
        (max, child) => Math.max(max, child?.layout?.maxFractionDepth || 0),
        0
    );
    const containsFraction = layout.boxRole === "fraction" || childNodes.some((child) => child?.layout?.containsFraction === true);
    const ownFractionDepth = layout.boxRole === "fraction" ? currentFractionDepth : 0;
    const resolvedTuning = resolveLayoutTuning(
        layout,
        ownFractionDepth,
        Math.max(ownFractionDepth, childFractionDepth),
        containsFraction
    );
    const axisGeometry = resolveNodeAxisGeometry(node, resolvedTuning);

    node.layout = {
        ...layout,
        nestingDepth: currentNestingDepth,
        fractionDepth: ownFractionDepth,
        maxFractionDepth: Math.max(ownFractionDepth, childFractionDepth),
        containsFraction,
        ...resolvedTuning,
        ...axisGeometry
    };

    return node;
}

function enrichRenderNode(node, nestingDepth = 0, fractionDepth = 0) {
    if (!node) {
        return null;
    }

    if (node.type === "text") {
        return attachFractionMetrics(
            node,
            [],
            fractionDepth,
            nestingDepth,
            createLayout("text", "baseline")
        );
    }

    if (node.type === "sequence") {
        node.items = node.items.map((item) => enrichRenderNode(item, nestingDepth + 1, fractionDepth)).filter(Boolean);
        return attachFractionMetrics(
            node,
            node.items,
            fractionDepth,
            nestingDepth,
            createLayout("sequence", "baseline")
        );
    }

    if (node.type === "group") {
        node.content = enrichRenderNode(node.content, nestingDepth + 1, fractionDepth);
        return attachFractionMetrics(
            node,
            [node.content],
            fractionDepth,
            nestingDepth,
            createLayout("group", "baseline")
        );
    }

    if (node.type === "function") {
        node.argument = enrichRenderNode(node.argument, nestingDepth + 1, fractionDepth);
        node.baseArgument = enrichRenderNode(node.baseArgument, nestingDepth + 1, fractionDepth);
        return attachFractionMetrics(
            node,
            [node.argument, node.baseArgument].filter(Boolean),
            fractionDepth,
            nestingDepth,
            createLayout("function", "baseline")
        );
    }

    if (node.type === "root") {
        node.content = enrichRenderNode(node.content, nestingDepth + 1, fractionDepth);
        return attachFractionMetrics(
            node,
            [node.content],
            fractionDepth,
            nestingDepth,
            createLayout("root", "raised_overbar")
        );
    }

    if (node.type === "power") {
        node.base = enrichRenderNode(node.base, nestingDepth + 1, fractionDepth);
        node.exponentNode = enrichRenderNode(node.exponentNode, nestingDepth + 1, fractionDepth);
        return attachFractionMetrics(
            node,
            [node.base, node.exponentNode].filter(Boolean),
            fractionDepth,
            nestingDepth,
            createLayout("power", "superscript")
        );
    }

    if (node.type === "negation") {
        node.content = enrichRenderNode(node.content, nestingDepth + 1, fractionDepth);
        return attachFractionMetrics(
            node,
            [node.content],
            fractionDepth,
            nestingDepth,
            createLayout("negation", "baseline")
        );
    }

    if (node.type === "multiplication") {
        node.left = enrichRenderNode(node.left, nestingDepth + 1, fractionDepth);
        node.right = enrichRenderNode(node.right, nestingDepth + 1, fractionDepth);
        return attachFractionMetrics(
            node,
            [node.left, node.right],
            fractionDepth,
            nestingDepth,
            createLayout("multiplication", "baseline", {
                separatorVisible: typeof node.separator === "string" && node.separator.length > 0
            })
        );
    }

    if (node.type === "fraction") {
        const ownFractionDepth = fractionDepth + 1;
        node.numerator = enrichRenderNode(node.numerator, nestingDepth + 1, ownFractionDepth);
        node.denominator = enrichRenderNode(node.denominator, nestingDepth + 1, ownFractionDepth);
        return attachFractionMetrics(
            node,
            [node.numerator, node.denominator],
            ownFractionDepth,
            nestingDepth,
            createLayout("fraction", "fraction_axis", {
                blockRows: 3
            })
        );
    }

    return attachFractionMetrics(
        node,
        [],
        fractionDepth,
        nestingDepth,
        createLayout(node.type, "baseline")
    );
}

export function buildRenderNode(atom) {
    return enrichRenderNode(buildRawRenderNode(atom));
}

function formatAtom(atom) {
    if (!atom) {
        return "";
    }

    if (Array.isArray(atom)) {
        return formatCollection(atom);
    }

    switch (atom.type) {
        case "NUMBER":
        case "VARIABLE":
        case "ANCHOR":
            return atom.value || "";
        case "OPERATOR":
            return formatOperator(atom);
        case "GROUP":
            return `(${formatCollection(atom.content || [])})`;
        case "COLLECTION":
            return formatCollection(atom.content || []);
        case "FUNCTION":
            return `${formatFunctionHead(atom.name || "f", formatCollection(atom.baseContent || []))}(${formatCollection(atom.content || [])})`;
        case "ROOT": {
            const degreeText = resolveRootDegreeText(atom);
            return degreeText.length > 0
                ? `sqrt[${degreeText}](${formatCollection(atom.content || [])})`
                : `sqrt(${formatCollection(atom.content || [])})`;
        }
        case "POWER":
            return formatPower(atom);
        case "NEGATION":
            return formatNegation(atom);
        case "ADDITION":
            return formatBinaryShell(atom.content || [], atom.passive || [], " + ");
        case "SUBTRACTION":
            return formatBinaryShell(atom.content || [], atom.passive || [], " - ");
        case "MULTIPLICATION":
            return formatBinaryShell(
                atom.flowDirection === "rtl" ? (atom.factor || []) : (atom.content || []),
                atom.flowDirection === "rtl" ? (atom.content || []) : (atom.factor || []),
                chooseMultiplicationSeparator(
                    buildCollectionRenderNode(atom.flowDirection === "rtl" ? (atom.factor || []) : (atom.content || [])),
                    buildCollectionRenderNode(atom.flowDirection === "rtl" ? (atom.content || []) : (atom.factor || []))
                ) || ""
            );
        case "DIVISION":
            return formatDivision(atom);
        case "FRACTION_LINE":
            return "---";
        default:
            return atom.value || "";
    }
}

export function formatCellText(atom) {
    if (!atom) {
        return "";
    }

    if (atom.type === "OPERATOR" || atom.type === "ANCHOR") {
        return atom.value || "";
    }

    if (atom.type === "FRACTION_LINE") {
        return "---";
    }

    return formatAtom(atom);
}
