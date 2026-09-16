import { resolveNodeLayoutMetrics } from "./renderVerticalGeometry.js";

function roundMetric(value) {
    return Math.round(Math.max(0, Number(value) || 0) * 100) / 100;
}

function clampMetric(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

export function buildDelimiterStretchMetrics(contentNode, options = {}) {
    const geometry = resolveNodeLayoutMetrics(contentNode, options?.fallbackHeightEm ?? 0.92);
    const minimumHeightEm = Math.max(1.02, Number(options?.minimumHeightEm) || 0);
    const overshootEm = Math.max(0.1, Number(options?.overshootEm) || 0.12);
    const baseGlyphHeightEm = Math.max(0.9, Number(options?.baseGlyphHeightEm) || 1.02);
    const maxHeightEm = Math.max(minimumHeightEm, Number(options?.maxHeightEm) || 3.2);
    const targetHeightEm = clampMetric(
        Math.max(minimumHeightEm, geometry.boxHeightEm + overshootEm),
        minimumHeightEm,
        maxHeightEm
    );
    const scaleY = clampMetric(
        targetHeightEm / baseGlyphHeightEm,
        1,
        Math.max(1, Number(options?.maxScaleY) || 3)
    );
    const originOffsetEm = clampMetric(
        0.08 + Math.max(0, geometry.axisBelowEm - 0.28) * 0.4,
        0.08,
        0.2
    );

    return {
        ...geometry,
        targetHeightEm: roundMetric(targetHeightEm),
        scaleY: Math.round(scaleY * 1000) / 1000,
        originOffsetEm: roundMetric(originOffsetEm)
    };
}

export function buildRootStretchMetrics(contentNode, shellNode = null, options = {}) {
    const geometry = resolveNodeLayoutMetrics(
        contentNode,
        Number(shellNode?.layout?.rootMinHeightEm) || Number(options?.fallbackHeightEm) || 1.08
    );
    const minimumHeightEm = Math.max(
        Number(shellNode?.layout?.rootMinHeightEm) || 0,
        Number(options?.minimumHeightEm) || 1.08
    );
    const topPadEm = Math.max(0, Number(shellNode?.layout?.rootPadTopEm) || 0.08);
    const degreeBonusEm = shellNode?.degreeText ? 0.08 : 0;
    const baseGlyphHeightEm = Math.max(0.92, Number(options?.baseGlyphHeightEm) || 1.06);
    const maxHeightEm = Math.max(minimumHeightEm, Number(options?.maxHeightEm) || 3.8);
    const targetHeightEm = clampMetric(
        Math.max(minimumHeightEm, geometry.boxHeightEm + topPadEm + 0.18 + degreeBonusEm),
        minimumHeightEm,
        maxHeightEm
    );
    const scaleY = clampMetric(
        targetHeightEm / baseGlyphHeightEm,
        1,
        Math.max(1, Number(options?.maxScaleY) || 3.4)
    );
    const originOffsetEm = clampMetric(
        0.04 + Math.max(0, geometry.axisBelowEm - 0.28) * 0.35,
        0.04,
        0.14
    );
    const extraWidthEm = clampMetric(
        (scaleY - 1) * 0.12,
        0,
        0.32
    );

    return {
        ...geometry,
        targetHeightEm: roundMetric(targetHeightEm),
        scaleY: Math.round(scaleY * 1000) / 1000,
        originOffsetEm: roundMetric(originOffsetEm),
        extraWidthEm: roundMetric(extraWidthEm)
    };
}
