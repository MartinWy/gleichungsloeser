function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.getOwnPropertyNames(value).forEach((propertyName) => {
        deepFreeze(value[propertyName]);
    });

    return Object.freeze(value);
}

function assertFiniteNumber(value, fieldName) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`${fieldName} muss eine endliche Zahl sein.`);
    }
}

function assertNonNegativeNumber(value, fieldName) {
    assertFiniteNumber(value, fieldName);
    if (value < 0) {
        throw new Error(`${fieldName} muss >= 0 sein.`);
    }
}

function assertMaterial(material) {
    if (!material || typeof material !== "object") {
        throw new Error("SpurSatz-Material fehlt.");
    }

    if (!material.glyphsById || !material.delimitersById || !material.fontMetrics) {
        throw new Error("Ungueltiges SpurSatz-Materialobjekt.");
    }
}

function cloneJsonLike(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeMetric(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return value;
    }

    const rounded = Math.round(value * 1_000_000) / 1_000_000;
    return Object.is(rounded, -0) ? 0 : rounded;
}

function resolveSymmetricVerticalExtent(options = {}, fieldPrefix = "content") {
    const heightField = `${fieldPrefix}Height`;
    const topField = `${fieldPrefix}Top`;
    const bottomField = `${fieldPrefix}Bottom`;
    const explicitTop = options?.[topField];
    const explicitBottom = options?.[bottomField];

    if (explicitTop !== undefined || explicitBottom !== undefined) {
        assertFiniteNumber(explicitTop, topField);
        assertFiniteNumber(explicitBottom, bottomField);
        if (explicitTop < explicitBottom) {
            throw new Error(`${fieldPrefix}Top muss >= ${fieldPrefix}Bottom sein.`);
        }

        return {
            top: explicitTop,
            bottom: explicitBottom,
            height: explicitTop - explicitBottom
        };
    }

    const height = options?.[heightField] ?? 0;
    assertNonNegativeNumber(height, heightField);

    return {
        top: height / 2,
        bottom: -(height / 2),
        height
    };
}

function resolvePositiveExtent(options = {}, fieldName, fallback = 0) {
    const value = options?.[fieldName] ?? fallback;
    assertNonNegativeNumber(value, fieldName);
    return value;
}

function createBoxAnchors({ advanceWidth, bbox, baseline = 0, mathAxis = 0 }) {
    return {
        left: 0,
        center: normalizeMetric(advanceWidth / 2),
        right: normalizeMetric(advanceWidth),
        baseline: normalizeMetric(baseline),
        top: normalizeMetric(bbox.yMax),
        bottom: normalizeMetric(bbox.yMin),
        mathAxis: normalizeMetric(mathAxis),
        inkLeft: normalizeMetric(bbox.xMin),
        inkRight: normalizeMetric(bbox.xMax),
        advanceLeft: 0,
        advanceRight: normalizeMetric(advanceWidth)
    };
}

function chooseDelimiterVariant(delimiter, targetHeight = 0) {
    const variants = Array.isArray(delimiter?.variants) ? delimiter.variants : [];
    if (variants.length === 0) {
        return null;
    }

    const adequateVariant = variants.find((variant) => variant.height >= targetHeight);
    return adequateVariant || variants[variants.length - 1];
}

function createDelimiterAnchors(delimiter, variant, mathAxis) {
    const width = variant.advanceWidth;
    const halfHeight = variant.height / 2;

    return {
        left: 0,
        center: normalizeMetric(width / 2),
        right: normalizeMetric(width),
        baseline: 0,
        top: normalizeMetric(halfHeight),
        bottom: normalizeMetric(-halfHeight),
        mathAxis: normalizeMetric(mathAxis),
        inkLeft: 0,
        inkRight: normalizeMetric(width),
        advanceLeft: 0,
        advanceRight: normalizeMetric(width),
        innerLeft: normalizeMetric(delimiter.innerLeft),
        innerRight: normalizeMetric(delimiter.innerRight),
        stretchTop: normalizeMetric(halfHeight),
        stretchBottom: normalizeMetric(-halfHeight)
    };
}

function resolveRuleThickness(material, role) {
    switch (role) {
        case "fraction_rule":
            return material.fontMetrics.fractionRuleThickness;
        case "radical_bar":
            return material.fontMetrics.radicalRuleThickness;
        default:
            throw new Error(`Unbekannte RulePrimitive-Rolle: ${role}`);
    }
}

export function buildAtomPrimitive(material, glyphId) {
    assertMaterial(material);

    const glyph = material.glyphsById[glyphId];
    if (!glyph) {
        throw new Error(`Unbekannte Glyph-ID fuer AtomPrimitive: ${glyphId}`);
    }

    assertNonNegativeNumber(glyph.advanceWidth, `${glyphId}.advanceWidth`);

    const primitive = {
        primitiveType: "atom",
        glyphId,
        kind: glyph.kind,
        text: glyph.text,
        glyphs: [...glyph.glyphs],
        advanceWidth: normalizeMetric(glyph.advanceWidth),
        bbox: cloneJsonLike(glyph.bbox),
        anchors: createBoxAnchors({
            advanceWidth: glyph.advanceWidth,
            bbox: glyph.bbox,
            baseline: glyph.baseline,
            mathAxis: glyph.mathAxis
        }),
        sourceFont: material.font.family
    };

    return deepFreeze(primitive);
}

export function buildDelimiterPrimitive(material, delimiterId, options = {}) {
    assertMaterial(material);

    const delimiter = material.delimitersById[delimiterId];
    if (!delimiter) {
        throw new Error(`Unbekannte Delimiter-ID: ${delimiterId}`);
    }

    const targetHeight = options?.targetHeight ?? 0;
    assertNonNegativeNumber(targetHeight, "targetHeight");

    const variant = chooseDelimiterVariant(delimiter, targetHeight);
    if (!variant) {
        throw new Error(`Delimiter ${delimiterId} hat keine Variante fuer die Primitive-Erzeugung.`);
    }

    const primitive = {
        primitiveType: "delimiter",
        delimiterId,
        text: delimiter.text,
        targetHeight: normalizeMetric(targetHeight),
        compositionMode: "variant",
        selectedVariant: cloneJsonLike(variant),
        anchors: createDelimiterAnchors(delimiter, variant, material.fontMetrics.axisHeight),
        sourceFont: material.font.family
    };

    return deepFreeze(primitive);
}

export function buildRulePrimitive(material, options = {}) {
    assertMaterial(material);

    const role = options?.role || "fraction_rule";
    const width = options?.width;

    assertNonNegativeNumber(width, "width");
    const normalizedWidth = normalizeMetric(width);
    const thickness = normalizeMetric(resolveRuleThickness(material, role));
    const halfThickness = normalizeMetric(thickness / 2);

    const primitive = {
        primitiveType: "rule",
        role,
        width: normalizedWidth,
        thickness,
        axisReferenceEm: normalizeMetric(material.fontMetrics.axisHeight),
        anchors: {
            left: 0,
            center: normalizeMetric(normalizedWidth / 2),
            right: normalizedWidth,
            baseline: 0,
            top: halfThickness,
            bottom: normalizeMetric(-halfThickness),
            mathAxis: 0,
            ruleAxis: 0,
            inkLeft: 0,
            inkRight: normalizedWidth,
            advanceLeft: 0,
            advanceRight: normalizedWidth
        },
        sourceFont: material.font.family
    };

    return deepFreeze(primitive);
}

export function buildFunctionPrimitive(material, functionGlyphId, options = {}) {
    assertMaterial(material);

    const functionAtom = buildAtomPrimitive(material, functionGlyphId);
    if (functionAtom.kind !== "function_text") {
        throw new Error(`Glyph ${functionGlyphId} ist kein Function-Text.`);
    }

    const argumentWidth = options?.argumentWidth;
    assertNonNegativeNumber(argumentWidth, "argumentWidth");
    const argumentExtent = resolveSymmetricVerticalExtent(options, "argument");
    const includeDelimiters = options?.includeDelimiters !== false;

    const delimiterHeight = Math.max(
        functionAtom.anchors.top - functionAtom.anchors.bottom,
        argumentExtent.height
    );

    const leftDelimiter = includeDelimiters
        ? buildDelimiterPrimitive(material, options?.leftDelimiterId || "paren_left", { targetHeight: delimiterHeight })
        : null;
    const rightDelimiter = includeDelimiters
        ? buildDelimiterPrimitive(material, options?.rightDelimiterId || "paren_right", { targetHeight: delimiterHeight })
        : null;

    const leftDelimiterWidth = leftDelimiter?.selectedVariant?.advanceWidth || 0;
    const rightDelimiterWidth = rightDelimiter?.selectedVariant?.advanceWidth || 0;
    const width = normalizeMetric(functionAtom.advanceWidth + leftDelimiterWidth + argumentWidth + rightDelimiterWidth);
    const top = normalizeMetric(Math.max(
        functionAtom.anchors.top,
        leftDelimiter?.anchors.top ?? Number.NEGATIVE_INFINITY,
        rightDelimiter?.anchors.top ?? Number.NEGATIVE_INFINITY,
        argumentExtent.top
    ));
    const bottom = normalizeMetric(Math.min(
        functionAtom.anchors.bottom,
        leftDelimiter?.anchors.bottom ?? Number.POSITIVE_INFINITY,
        rightDelimiter?.anchors.bottom ?? Number.POSITIVE_INFINITY,
        argumentExtent.bottom
    ));
    const leftDelimiterStart = normalizeMetric(functionAtom.advanceWidth);
    const argumentStart = normalizeMetric(functionAtom.advanceWidth + leftDelimiterWidth);
    const rightDelimiterStart = normalizeMetric(functionAtom.advanceWidth + leftDelimiterWidth + argumentWidth);
    const argumentRight = normalizeMetric(argumentStart + argumentWidth);
    const argumentDock = normalizeMetric(functionAtom.advanceWidth + (leftDelimiter?.anchors.innerRight ?? 0));

    const primitive = {
        primitiveType: "function",
        functionGlyphId,
        text: functionAtom.text,
        includeDelimiters,
        width,
        children: {
            functionAtom,
            leftDelimiter,
            rightDelimiter
        },
        layout: {
            functionStart: 0,
            functionEnd: normalizeMetric(functionAtom.advanceWidth),
            leftDelimiterStart,
            leftDelimiterWidth: normalizeMetric(leftDelimiterWidth),
            argumentStart,
            argumentWidth: normalizeMetric(argumentWidth),
            argumentTop: normalizeMetric(argumentExtent.top),
            argumentBottom: normalizeMetric(argumentExtent.bottom),
            rightDelimiterStart,
            rightDelimiterWidth: normalizeMetric(rightDelimiterWidth)
        },
        anchors: {
            left: 0,
            center: normalizeMetric(width / 2),
            right: width,
            baseline: 0,
            top,
            bottom,
            mathAxis: normalizeMetric(material.fontMetrics.axisHeight),
            inkLeft: 0,
            inkRight: width,
            advanceLeft: 0,
            advanceRight: width,
            prefixLeft: 0,
            prefixRight: normalizeMetric(functionAtom.advanceWidth),
            argumentDock,
            argumentLeft: argumentStart,
            argumentRight,
            suffixLeft: argumentRight
        },
        sourceFont: material.font.family
    };

    return deepFreeze(primitive);
}

export function buildRadicalPrimitive(material, hookGlyphId, options = {}) {
    assertMaterial(material);

    const hookAtom = buildAtomPrimitive(material, hookGlyphId);
    if (hookAtom.kind !== "radical_part") {
        throw new Error(`Glyph ${hookGlyphId} ist kein Radical-Part.`);
    }

    const contentWidth = options?.contentWidth;
    assertNonNegativeNumber(contentWidth, "contentWidth");
    const contentExtent = resolveSymmetricVerticalExtent(options, "content");
    const clearance = resolvePositiveExtent(options, "clearance", material.layoutHints.radicalClearanceDefault || 0);
    const barOvershoot = resolvePositiveExtent(options, "barOvershoot", material.layoutHints.delimiterOvershootDefault || 0);
    const barWidth = normalizeMetric(contentWidth + barOvershoot);
    const barRule = buildRulePrimitive(material, { role: "radical_bar", width: barWidth });
    const width = normalizeMetric(hookAtom.advanceWidth + barWidth);
    const top = normalizeMetric(Math.max(
        hookAtom.anchors.top,
        contentExtent.top + clearance + barRule.thickness
    ));
    const bottom = normalizeMetric(Math.min(
        hookAtom.anchors.bottom,
        contentExtent.bottom
    ));
    const contentStart = normalizeMetric(hookAtom.advanceWidth);
    const barEnd = normalizeMetric(hookAtom.advanceWidth + barWidth);

    const primitive = {
        primitiveType: "radical",
        hookGlyphId,
        width,
        children: {
            hookAtom,
            barRule
        },
        layout: {
            hookWidth: normalizeMetric(hookAtom.advanceWidth),
            contentWidth: normalizeMetric(contentWidth),
            contentStart,
            contentTop: normalizeMetric(contentExtent.top),
            contentBottom: normalizeMetric(contentExtent.bottom),
            barStart: contentStart,
            barWidth,
            barEnd,
            barAxis: normalizeMetric(contentExtent.top + clearance + (barRule.thickness / 2)),
            clearance: normalizeMetric(clearance),
            barOvershoot: normalizeMetric(barOvershoot)
        },
        anchors: {
            left: 0,
            center: normalizeMetric(width / 2),
            right: width,
            baseline: 0,
            top,
            bottom,
            mathAxis: normalizeMetric(material.fontMetrics.axisHeight),
            inkLeft: 0,
            inkRight: width,
            advanceLeft: 0,
            advanceRight: width,
            hookLeft: 0,
            contentStart,
            barStart: contentStart,
            barEnd
        },
        sourceFont: material.font.family
    };

    return deepFreeze(primitive);
}

export function buildFractionPrimitive(material, options = {}) {
    assertMaterial(material);

    const numeratorWidth = options?.numeratorWidth;
    const denominatorWidth = options?.denominatorWidth;
    assertNonNegativeNumber(numeratorWidth, "numeratorWidth");
    assertNonNegativeNumber(denominatorWidth, "denominatorWidth");

    const numeratorHeight = resolvePositiveExtent(options, "numeratorHeight", 0);
    const denominatorHeight = resolvePositiveExtent(options, "denominatorHeight", 0);
    const axisGap = resolvePositiveExtent(options, "axisGap", material.fontMetrics.stackGapMin || 0);
    const width = normalizeMetric(Math.max(numeratorWidth, denominatorWidth));
    const rule = buildRulePrimitive(material, { role: "fraction_rule", width });
    const numeratorOffsetX = normalizeMetric((width - numeratorWidth) / 2);
    const denominatorOffsetX = normalizeMetric((width - denominatorWidth) / 2);
    const numeratorBaseline = normalizeMetric(axisGap + (rule.thickness / 2));
    const denominatorBaseline = normalizeMetric(-(axisGap + (rule.thickness / 2)));
    const top = normalizeMetric(numeratorBaseline + numeratorHeight);
    const bottom = normalizeMetric(denominatorBaseline - denominatorHeight);

    const primitive = {
        primitiveType: "fraction",
        width,
        children: {
            rule
        },
        layout: {
            numeratorWidth,
            denominatorWidth,
            numeratorHeight: normalizeMetric(numeratorHeight),
            denominatorHeight: normalizeMetric(denominatorHeight),
            numeratorOffsetX,
            denominatorOffsetX,
            numeratorBaseline,
            denominatorBaseline,
            axisGap
        },
        anchors: {
            left: 0,
            center: normalizeMetric(width / 2),
            right: width,
            baseline: 0,
            top,
            bottom,
            mathAxis: 0,
            inkLeft: 0,
            inkRight: width,
            advanceLeft: 0,
            advanceRight: width,
            ruleLeft: 0,
            ruleRight: width,
            ruleAxis: 0,
            numeratorCenter: normalizeMetric(numeratorOffsetX + (numeratorWidth / 2)),
            denominatorCenter: normalizeMetric(denominatorOffsetX + (denominatorWidth / 2))
        },
        sourceFont: material.font.family
    };

    return deepFreeze(primitive);
}
