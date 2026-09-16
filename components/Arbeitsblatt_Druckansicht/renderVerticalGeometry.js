import { roundEm } from "./renderKernelCore/shared.js";
import { resolveFunctionNotation } from "./functionNotation.js";

export function roundAxisGeometry(aboveEm = 0, belowEm = 0) {
    const safeAbove = roundEm(Math.max(0, aboveEm || 0));
    const safeBelow = roundEm(Math.max(0, belowEm || 0));

    return {
        axisAboveEm: safeAbove,
        axisBelowEm: safeBelow,
        boxHeightEm: roundEm(safeAbove + safeBelow)
    };
}

export function layoutAxisGeometry(layout = null, fallbackHeightEm = 0.8) {
    if (!layout) {
        return roundAxisGeometry(fallbackHeightEm * 0.65, fallbackHeightEm * 0.35);
    }

    if (typeof layout.axisAboveEm === "number" && typeof layout.axisBelowEm === "number") {
        return roundAxisGeometry(layout.axisAboveEm, layout.axisBelowEm);
    }

    const fallbackHeight = typeof layout.boxHeightEm === "number"
        ? layout.boxHeightEm
        : (layout.axisMinHeightEm || fallbackHeightEm);

    return roundAxisGeometry(fallbackHeight * 0.65, fallbackHeight * 0.35);
}

export function overshootGeometry(baseGeometry, minimumHeightEm = 0.8, extraTopEm = 0, extraBottomEm = 0) {
    const contentHeight = Math.max(0, baseGeometry?.boxHeightEm || 0);
    const minimumHeight = Math.max(contentHeight, minimumHeightEm || 0);
    const overshoot = Math.max(0, minimumHeight - contentHeight) / 2;

    return roundAxisGeometry(
        (baseGeometry?.axisAboveEm || 0) + overshoot + extraTopEm,
        (baseGeometry?.axisBelowEm || 0) + overshoot + extraBottomEm
    );
}

export function textAxisGeometry(kind = "text", text = "") {
    if (kind === "anchor" || (kind === "operator" && ["=", "+", "-"].includes(text))) {
        return roundAxisGeometry(0.32, 0.32);
    }

    if (kind === "operator") {
        return roundAxisGeometry(0.36, 0.24);
    }

    return roundAxisGeometry(0.52, 0.28);
}

export function resolveNodeAxisGeometry(node, tuning = {}) {
    if (!node) {
        return roundAxisGeometry(0.52, 0.28);
    }

    if (node.type === "text") {
        return textAxisGeometry(node.kind || "text", node.text || "");
    }

    if (node.type === "sequence") {
        const items = (node.items || []).map((item) => layoutAxisGeometry(item?.layout)).filter(Boolean);

        return items.reduce((current, itemGeometry) => roundAxisGeometry(
            Math.max(current.axisAboveEm, itemGeometry.axisAboveEm),
            Math.max(current.axisBelowEm, itemGeometry.axisBelowEm)
        ), roundAxisGeometry(0.52, 0.28));
    }

    if (node.type === "group") {
        return overshootGeometry(
            layoutAxisGeometry(node.content?.layout),
            Math.max(0.92, (node.content?.layout?.boxHeightEm || 0) + 0.08)
        );
    }

    if (node.type === "function") {
        const functionNotation = resolveFunctionNotation(node.name || "f", node.baseText || "");
        const nameGeometry = textAxisGeometry("text", functionNotation.renderLabel || "f");
        const argumentGeometry = overshootGeometry(
            layoutAxisGeometry(node.argument?.layout),
            Math.max(0.96, (node.argument?.layout?.boxHeightEm || 0) + 0.12)
        );
        const baseGeometry = functionNotation.renderBaseArgument && node.baseArgument
            ? layoutAxisGeometry(node.baseArgument?.layout, 0.72)
            : null;
        const baseScale = tuning.functionBaseScale || 0.72;
        const baseShift = tuning.functionBaseShiftDownEm || 0.18;

        return roundAxisGeometry(
            Math.max(nameGeometry.axisAboveEm, argumentGeometry.axisAboveEm),
            Math.max(
                nameGeometry.axisBelowEm,
                argumentGeometry.axisBelowEm,
                baseGeometry ? baseShift + Math.max(
                    baseGeometry.axisBelowEm * baseScale,
                    baseGeometry.boxHeightEm * baseScale
                ) : 0
            )
        );
    }

    if (node.type === "root") {
        const contentGeometry = layoutAxisGeometry(node.content?.layout);
        const topPad = tuning.rootPadTopEm || 0.08;
        const bottomPad = Math.max(0.04, topPad * 0.25);
        const degreeBonus = node.degreeText ? 0.08 : 0;

        return roundAxisGeometry(
            contentGeometry.axisAboveEm + topPad + 0.12 + degreeBonus,
            Math.max(0.34, contentGeometry.axisBelowEm + bottomPad)
        );
    }

    if (node.type === "power") {
        const baseGeometry = layoutAxisGeometry(node.base?.layout);
        const exponentGeometry = node.exponentNode
            ? layoutAxisGeometry(node.exponentNode?.layout)
            : textAxisGeometry("number", String(node.exponent ?? "2"));
        const exponentLift = tuning.exponentLiftEm || 0.34;
        const shiftedExponentBelowEm = Math.max(0, exponentGeometry.axisBelowEm - exponentLift);

        return roundAxisGeometry(
            Math.max(baseGeometry.axisAboveEm, exponentLift + exponentGeometry.axisAboveEm),
            Math.max(baseGeometry.axisBelowEm, shiftedExponentBelowEm)
        );
    }

    if (node.type === "multiplication") {
        const leftGeometry = layoutAxisGeometry(node.left?.layout);
        const rightGeometry = layoutAxisGeometry(node.right?.layout);

        return roundAxisGeometry(
            Math.max(leftGeometry.axisAboveEm, rightGeometry.axisAboveEm),
            Math.max(leftGeometry.axisBelowEm, rightGeometry.axisBelowEm)
        );
    }

    if (node.type === "negation") {
        const signGeometry = textAxisGeometry("operator", "-");
        const contentGeometry = layoutAxisGeometry(node.content?.layout);

        return roundAxisGeometry(
            Math.max(signGeometry.axisAboveEm, contentGeometry.axisAboveEm),
            Math.max(signGeometry.axisBelowEm, contentGeometry.axisBelowEm)
        );
    }

    if (node.type === "fraction") {
        const numeratorGeometry = layoutAxisGeometry(node.numerator?.layout);
        const denominatorGeometry = layoutAxisGeometry(node.denominator?.layout);
        const lineHalfThickness = (tuning.barThicknessEm || 0.08) / 2;

        return roundAxisGeometry(
            numeratorGeometry.boxHeightEm + (tuning.numeratorGapEm || 0.12) + lineHalfThickness,
            denominatorGeometry.boxHeightEm + (tuning.denominatorGapEm || 0.16) + lineHalfThickness
        );
    }

    return roundAxisGeometry(0.52, 0.28);
}

export function resolveNodeLayoutMetrics(node, fallbackHeightEm = 0.8) {
    return layoutAxisGeometry(node?.layout || null, fallbackHeightEm);
}

export function estimateRenderNodeHeight(node, minimumHeightEm = 1.1) {
    return Math.max(minimumHeightEm, resolveNodeLayoutMetrics(node, minimumHeightEm).boxHeightEm);
}
