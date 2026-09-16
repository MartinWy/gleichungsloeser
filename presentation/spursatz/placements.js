function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.getOwnPropertyNames(value).forEach((propertyName) => {
        deepFreeze(value[propertyName]);
    });

    return Object.freeze(value);
}

function normalizeMetric(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return value;
    }

    const rounded = Math.round(value * 1_000_000) / 1_000_000;
    return Object.is(rounded, -0) ? 0 : rounded;
}

function assertPrimitive(primitive) {
    if (!primitive || typeof primitive !== "object" || typeof primitive.primitiveType !== "string") {
        throw new Error("SpurSatz-Primitive fehlt oder ist ungueltig.");
    }
}

function resolveOrigin(options = {}) {
    const x = Number(options?.x ?? 0);
    const y = Number(options?.y ?? 0);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error("Placement-Ursprung muss aus endlichen Zahlen bestehen.");
    }

    return {
        x: normalizeMetric(x),
        y: normalizeMetric(y)
    };
}

function translateAnchors(anchors = {}, origin) {
    return Object.fromEntries(
        Object.entries(anchors).map(([key, value]) => {
            if (typeof value !== "number" || !Number.isFinite(value)) {
                return [key, value];
            }

            const isVerticalAnchor = /(baseline|top|bottom|axis)$/i.test(key);
            return [key, normalizeMetric(value + (isVerticalAnchor ? origin.y : origin.x))];
        })
    );
}

function createPlacementEnvelope(primitive, origin) {
    return {
        placementType: primitive.primitiveType,
        primitiveType: primitive.primitiveType,
        origin,
        width: normalizeMetric(primitive.width ?? primitive.advanceWidth ?? primitive.anchors?.right ?? 0),
        height: normalizeMetric(
            (primitive.anchors?.top ?? 0) - (primitive.anchors?.bottom ?? 0)
        ),
        anchors: translateAnchors(primitive.anchors || {}, origin),
        sourceFont: primitive.sourceFont
    };
}

function placeLeafPrimitive(primitive, origin) {
    return deepFreeze({
        ...createPlacementEnvelope(primitive, origin),
        primitive
    });
}

function createDock(left, right, baseline, top, bottom, mathAxis = baseline) {
    return deepFreeze({
        left: normalizeMetric(left),
        right: normalizeMetric(right),
        center: normalizeMetric((left + right) / 2),
        baseline: normalizeMetric(baseline),
        top: normalizeMetric(top),
        bottom: normalizeMetric(bottom),
        mathAxis: normalizeMetric(mathAxis)
    });
}

function placeFunctionPrimitive(primitive, origin) {
    const functionAtom = placeLeafPrimitive(primitive.children.functionAtom, {
        x: origin.x + primitive.layout.functionStart,
        y: origin.y
    });
    const leftDelimiter = primitive.children.leftDelimiter
        ? placeLeafPrimitive(primitive.children.leftDelimiter, {
            x: origin.x + primitive.layout.leftDelimiterStart,
            y: origin.y
        })
        : null;
    const rightDelimiter = primitive.children.rightDelimiter
        ? placeLeafPrimitive(primitive.children.rightDelimiter, {
            x: origin.x + primitive.layout.rightDelimiterStart,
            y: origin.y
        })
        : null;

    return deepFreeze({
        ...createPlacementEnvelope(primitive, origin),
        primitive,
        children: {
            functionAtom,
            leftDelimiter,
            rightDelimiter
        },
        docks: {
            argument: createDock(
                origin.x + primitive.anchors.argumentLeft,
                origin.x + primitive.anchors.argumentRight,
                origin.y,
                origin.y + primitive.layout.argumentTop,
                origin.y + primitive.layout.argumentBottom,
                origin.y + primitive.anchors.mathAxis
            )
        }
    });
}

function placeRadicalPrimitive(primitive, origin) {
    const hookAtom = placeLeafPrimitive(primitive.children.hookAtom, {
        x: origin.x,
        y: origin.y
    });
    const barRule = placeLeafPrimitive(primitive.children.barRule, {
        x: origin.x + primitive.layout.barStart,
        y: origin.y + primitive.layout.barAxis
    });

    return deepFreeze({
        ...createPlacementEnvelope(primitive, origin),
        primitive,
        children: {
            hookAtom,
            barRule
        },
        docks: {
            content: createDock(
                origin.x + primitive.layout.contentStart,
                origin.x + primitive.layout.contentStart + primitive.layout.contentWidth,
                origin.y,
                origin.y + primitive.layout.contentTop,
                origin.y + primitive.layout.contentBottom,
                origin.y + primitive.anchors.mathAxis
            )
        }
    });
}

function placeFractionPrimitive(primitive, origin) {
    const rule = placeLeafPrimitive(primitive.children.rule, {
        x: origin.x,
        y: origin.y
    });

    return deepFreeze({
        ...createPlacementEnvelope(primitive, origin),
        primitive,
        children: {
            rule
        },
        docks: {
            numerator: createDock(
                origin.x + primitive.layout.numeratorOffsetX,
                origin.x + primitive.layout.numeratorOffsetX + primitive.layout.numeratorWidth,
                origin.y + primitive.layout.numeratorBaseline,
                origin.y + primitive.layout.numeratorBaseline + primitive.layout.numeratorHeight,
                origin.y + primitive.layout.numeratorBaseline,
                origin.y
            ),
            denominator: createDock(
                origin.x + primitive.layout.denominatorOffsetX,
                origin.x + primitive.layout.denominatorOffsetX + primitive.layout.denominatorWidth,
                origin.y + primitive.layout.denominatorBaseline,
                origin.y + primitive.layout.denominatorBaseline,
                origin.y + primitive.layout.denominatorBaseline - primitive.layout.denominatorHeight,
                origin.y
            )
        }
    });
}

export function placePrimitive(primitive, options = {}) {
    assertPrimitive(primitive);
    const origin = resolveOrigin(options);

    switch (primitive.primitiveType) {
        case "atom":
        case "delimiter":
        case "rule":
            return placeLeafPrimitive(primitive, origin);
        case "function":
            return placeFunctionPrimitive(primitive, origin);
        case "radical":
            return placeRadicalPrimitive(primitive, origin);
        case "fraction":
            return placeFractionPrimitive(primitive, origin);
        default:
            throw new Error(`Unbekannter SpurSatz-Primitive-Typ: ${primitive.primitiveType}`);
    }
}
