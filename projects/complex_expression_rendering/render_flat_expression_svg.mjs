import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = __dirname;

const METRICS = {
    fontSize: 30,
    textAbove: 24,
    textBelow: 10,
    charWidth: 17,
    operatorWidth: 14,
    sequenceGap: 10,
    fractionPad: 12,
    fractionGap: 10,
    rootColumnWidth: 34,
    rootOverbarRowHeight: 18,
    rootDeepPointRowHeight: 18,
    rootEntryStubRatio: 0.42,
    rootNotchRatio: 0.68,
    rootOverbarRightPad: 2,
    groupParenWidth: 14,
    groupSidePad: 2,
    parenHeightWidthRatio: 0.18,
    parenVerticalPad: 4,
    parenCurveFactor: 0.92,
    parenStrokeWidth: 2.4,
    powerGap: 4,
    exponentShiftX: 0,
    exponentScale: 0.62,
    exponentLift: 24,
    canvasMargin: 18,
    strokeWidth: 1.6
};

function usage() {
    console.error(
        "Verwendung: node projects/complex_expression_rendering/render_flat_expression_svg.mjs " +
        "<example.json> [--output reference_outputs/datei.svg]"
    );
}

function parseArgs(argv) {
    const args = [...argv];
    let examplePath = null;
    let outputPath = null;

    while (args.length > 0) {
        const token = args.shift();

        if (!token) {
            continue;
        }

        if (token === "--output") {
            outputPath = args.shift() || null;
            continue;
        }

        if (!examplePath) {
            examplePath = token;
        }
    }

    return { examplePath, outputPath };
}

function loadExample(examplePath) {
    const resolvedPath = path.resolve(projectDir, examplePath);
    const raw = fs.readFileSync(resolvedPath, "utf8");
    return {
        resolvedPath,
        data: JSON.parse(raw)
    };
}

function approxTextWidth(text = "", scale = 1) {
    const content = String(text || "");
    if (content === "+" || content === "-" || content === "=") {
        return METRICS.operatorWidth * scale;
    }
    return Math.max(METRICS.operatorWidth, content.length * METRICS.charWidth) * scale;
}

function resolveParenWidth(height = 0, scale = 1) {
    return Math.max(METRICS.groupParenWidth * scale, height * METRICS.parenHeightWidthRatio);
}

function resolveExponentLift(node, scale = 1) {
    const factor = Number(node?.exponentLiftFactor);
    const normalizedFactor = Number.isFinite(factor) && factor > 0 ? factor : 1;
    return METRICS.exponentLift * scale * normalizedFactor;
}

function measureNode(node, scale = 1) {
    if (!node || typeof node !== "object") {
        return {
            width: 0,
            above: 0,
            below: 0,
            scale
        };
    }

    switch (node.type) {
        case "text":
            return {
                type: "text",
                text: node.text || "",
                width: approxTextWidth(node.text || "", scale),
                above: METRICS.textAbove * scale,
                below: METRICS.textBelow * scale,
                scale
            };
        case "sequence": {
            const children = (node.items || []).map((child) => measureNode(child, scale));
            let width = 0;
            let above = 0;
            let below = 0;

            children.forEach((child, index) => {
                if (index > 0) {
                    width += METRICS.sequenceGap * scale;
                }
                width += child.width;
                above = Math.max(above, child.above);
                below = Math.max(below, child.below);
            });

            return {
                type: "sequence",
                children,
                width,
                above,
                below,
                scale
            };
        }
        case "power": {
            const base = measureNode(node.base, scale);
            const exponent = measureNode(node.exponent, scale * METRICS.exponentScale);
            const exponentLift = resolveExponentLift(node, scale);
            const exponentShiftX = METRICS.exponentShiftX * scale;
            return {
                type: "power",
                base,
                exponent,
                width: base.width + (METRICS.powerGap * scale) + exponentShiftX + exponent.width,
                above: Math.max(base.above, exponentLift + exponent.above),
                below: base.below,
                scale,
                exponentLift,
                exponentShiftX
            };
        }
        case "fraction": {
            const numerator = measureNode(node.numerator, scale);
            const denominator = measureNode(node.denominator, scale);
            const width = Math.max(numerator.width, denominator.width) + (2 * METRICS.fractionPad * scale);
            return {
                type: "fraction",
                numerator,
                denominator,
                width,
                above: numerator.above + numerator.below + (METRICS.fractionGap * scale),
                below: denominator.above + denominator.below + (METRICS.fractionGap * scale),
                scale
            };
        }
        case "root": {
            const content = measureNode(node.content, scale);
            return {
                type: "root",
                content,
                width: (METRICS.rootColumnWidth * scale) + content.width + (METRICS.rootOverbarRightPad * scale),
                above: content.above + (METRICS.rootOverbarRowHeight * scale),
                below: content.below + (METRICS.rootDeepPointRowHeight * scale),
                scale
            };
        }
        case "group": {
            const content = measureNode(node.content, scale);
            const contentHeight = content.above + content.below;
            const parenWidth = resolveParenWidth(contentHeight, scale);
            return {
                type: "group",
                content,
                parenWidth,
                width: content.width + (2 * (parenWidth + (METRICS.groupSidePad * scale))),
                above: content.above + (METRICS.parenVerticalPad * scale),
                below: content.below + (METRICS.parenVerticalPad * scale),
                scale
            };
        }
        case "function": {
            const content = measureNode(node.argument, scale);
            const nameWidth = approxTextWidth(node.name || "f", scale);
            const contentHeight = content.above + content.below;
            const parenWidth = resolveParenWidth(contentHeight, scale);
            return {
                type: "function",
                name: node.name || "f",
                content,
                parenWidth,
                width: nameWidth + content.width + (2 * (parenWidth + (METRICS.groupSidePad * scale))),
                above: content.above + (METRICS.parenVerticalPad * scale),
                below: content.below + (METRICS.parenVerticalPad * scale),
                scale
            };
        }
        default:
            return measureNode({ type: "text", text: "?" }, scale);
    }
}

function escapeXml(text = "") {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;");
}

function fontStyleForText(text = "") {
    if (/^[0-9]+$/.test(text)) {
        return "normal";
    }

    if (/^[+\-=().]$/.test(text)) {
        return "normal";
    }

    return "italic";
}

function renderText(elements, text, x, baselineY, scale) {
    const fontSize = METRICS.fontSize * scale;
    const fontStyle = fontStyleForText(text);
    elements.push(
        `<text x="${x.toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${fontSize.toFixed(2)}" fill="#111827" font-family="Times New Roman, serif" font-style="${fontStyle}">${escapeXml(text)}</text>`
    );
}

function unionBounds(...boundsList) {
    const validBounds = boundsList
        .flat()
        .filter((bounds) =>
            bounds
            && Number.isFinite(bounds.left)
            && Number.isFinite(bounds.right)
            && Number.isFinite(bounds.top)
            && Number.isFinite(bounds.bottom)
        );

    if (validBounds.length === 0) {
        return null;
    }

    return {
        left: Math.min(...validBounds.map((bounds) => bounds.left)),
        right: Math.max(...validBounds.map((bounds) => bounds.right)),
        top: Math.min(...validBounds.map((bounds) => bounds.top)),
        bottom: Math.max(...validBounds.map((bounds) => bounds.bottom))
    };
}

function boxBounds(left, top, right, bottom) {
    return { left, top, right, bottom };
}

function buildParenthesisSegments(side, x, width, yTop, yBottom, strokeWidth, curveFactor = METRICS.parenCurveFactor) {
    const segments = [];
    const segmentCount = 18;
    const height = yBottom - yTop;
    let previousPoint = null;

    for (let index = 0; index <= segmentCount; index += 1) {
        const t = index / segmentCount;
        const sinOffset = Math.sin(Math.PI * t);
        const pointX = side === "left"
            ? x + (width * (1 - (curveFactor * sinOffset)))
            : x + (width * (curveFactor * sinOffset));
        const pointY = yTop + (height * t);
        const point = { x: pointX, y: pointY };

        if (previousPoint) {
            segments.push(
                `<line x1="${previousPoint.x.toFixed(2)}" y1="${previousPoint.y.toFixed(2)}" x2="${point.x.toFixed(2)}" y2="${point.y.toFixed(2)}" stroke="#111827" stroke-width="${strokeWidth.toFixed(2)}" stroke-linecap="round" />`
            );
        }

        previousPoint = point;
    }

    return segments;
}

// Placement contract:
// - axis: mathematical baseline of the subtree
// - contentBounds: relevant inner content without later shell inflation
// - visibleBounds: final visible footprint including shells
function placeNode(node, measured, x, baselineY) {
    switch (measured.type) {
        case "text": {
            const elements = [];
            renderText(elements, measured.text, x, baselineY, measured.scale);
            return {
                elements,
                visibleBounds: boxBounds(
                    x,
                    baselineY - measured.above,
                    x + measured.width,
                    baselineY + measured.below
                ),
                contentBounds: boxBounds(
                    x,
                    baselineY - measured.above,
                    x + measured.width,
                    baselineY + measured.below
                ),
                axis: baselineY
            };
        }
        case "sequence": {
            let cursor = x;
            const elements = [];
            const childVisibleBounds = [];
            const childContentBounds = [];

            measured.children.forEach((child, index) => {
                const result = placeNode((node.items || [])[index], child, cursor, baselineY);
                elements.push(...result.elements);
                childVisibleBounds.push(result.visibleBounds);
                childContentBounds.push(result.contentBounds);
                cursor += child.width;
                if (index < measured.children.length - 1) {
                    cursor += METRICS.sequenceGap * measured.scale;
                }
            });

            return {
                elements,
                visibleBounds: unionBounds(childVisibleBounds),
                contentBounds: unionBounds(childContentBounds),
                axis: baselineY
            };
        }
        case "power": {
            const exponentLift = measured.exponentLift ?? resolveExponentLift(node, measured.scale);
            const exponentShiftX = measured.exponentShiftX ?? (METRICS.exponentShiftX * measured.scale);
            const exponentBaseline = baselineY - exponentLift;
            const baseResult = placeNode(node.base, measured.base, x, baselineY);
            const exponentResult = placeNode(
                node.exponent,
                measured.exponent,
                x + measured.base.width + (METRICS.powerGap * measured.scale) + exponentShiftX,
                exponentBaseline
            );

            return {
                elements: [...baseResult.elements, ...exponentResult.elements],
                visibleBounds: unionBounds(baseResult.visibleBounds, exponentResult.visibleBounds),
                contentBounds: unionBounds(baseResult.contentBounds, exponentResult.contentBounds),
                axis: baseResult.axis ?? baselineY
            };
        }
        case "fraction": {
            const ruleY = baselineY;
            const numX = x + ((measured.width - measured.numerator.width) / 2);
            const denX = x + ((measured.width - measured.denominator.width) / 2);
            const numBaseline = ruleY - (METRICS.fractionGap * measured.scale) - measured.numerator.below;
            const denBaseline = ruleY + (METRICS.fractionGap * measured.scale) + measured.denominator.above;

            const numeratorResult = placeNode(node.numerator, measured.numerator, numX, numBaseline);
            const denominatorResult = placeNode(node.denominator, measured.denominator, denX, denBaseline);
            const ruleBounds = boxBounds(
                x,
                ruleY - (METRICS.strokeWidth / 2),
                x + measured.width,
                ruleY + (METRICS.strokeWidth / 2)
            );

            return {
                elements: [
                    ...numeratorResult.elements,
                    ...denominatorResult.elements,
                    `<line x1="${x.toFixed(2)}" y1="${ruleY.toFixed(2)}" x2="${(x + measured.width).toFixed(2)}" y2="${ruleY.toFixed(2)}" stroke="#111827" stroke-width="${METRICS.strokeWidth}" />`
                ],
                visibleBounds: unionBounds(numeratorResult.visibleBounds, denominatorResult.visibleBounds, ruleBounds),
                contentBounds: unionBounds(
                    numeratorResult.contentBounds,
                    denominatorResult.contentBounds,
                    ruleBounds
                ),
                axis: ruleY
            };
        }
        case "root": {
            const rootColumnWidth = METRICS.rootColumnWidth * measured.scale;
            const overbarRowHeight = METRICS.rootOverbarRowHeight * measured.scale;
            const deepPointRowHeight = METRICS.rootDeepPointRowHeight * measured.scale;
            const contentX = x + rootColumnWidth;
            const contentResult = placeNode(node.content, measured.content, contentX, baselineY);
            const contentVisibleBounds = contentResult.visibleBounds || boxBounds(
                contentX,
                baselineY - measured.content.above,
                contentX + measured.content.width,
                baselineY + measured.content.below
            );
            const contentBounds = contentResult.contentBounds || boxBounds(
                contentX,
                baselineY - measured.content.above,
                contentX + measured.content.width,
                baselineY + measured.content.below
            );
            const barY = contentBounds.top - (overbarRowHeight / 2);
            const deepY = contentBounds.bottom + (deepPointRowHeight / 2);
            const hookMidY = barY + ((deepY - barY) / 2);
            const stubStartX = x;
            const stubEndX = x + (rootColumnWidth * METRICS.rootEntryStubRatio);
            const notchX = x + (rootColumnWidth * METRICS.rootNotchRatio);
            const riseX = x + rootColumnWidth;
            const barRightX = contentVisibleBounds.right + (METRICS.rootOverbarRightPad * measured.scale);
            const shellBounds = boxBounds(
                stubStartX,
                barY - (METRICS.strokeWidth + 0.4),
                barRightX,
                deepY
            );

            return {
                elements: [
                    ...contentResult.elements,
                    `<line x1="${stubStartX.toFixed(2)}" y1="${hookMidY.toFixed(2)}" x2="${stubEndX.toFixed(2)}" y2="${hookMidY.toFixed(2)}" stroke="#111827" stroke-width="${(METRICS.strokeWidth + 0.4).toFixed(2)}" stroke-linecap="round" />`,
                    `<line x1="${stubEndX.toFixed(2)}" y1="${hookMidY.toFixed(2)}" x2="${notchX.toFixed(2)}" y2="${deepY.toFixed(2)}" stroke="#111827" stroke-width="${(METRICS.strokeWidth + 0.4).toFixed(2)}" stroke-linecap="round" />`,
                    `<line x1="${notchX.toFixed(2)}" y1="${deepY.toFixed(2)}" x2="${riseX.toFixed(2)}" y2="${barY.toFixed(2)}" stroke="#111827" stroke-width="${(METRICS.strokeWidth + 0.4).toFixed(2)}" stroke-linecap="round" />`,
                    `<line x1="${riseX.toFixed(2)}" y1="${barY.toFixed(2)}" x2="${barRightX.toFixed(2)}" y2="${barY.toFixed(2)}" stroke="#111827" stroke-width="${(METRICS.strokeWidth + 0.4).toFixed(2)}" stroke-linecap="round" />`
                ],
                visibleBounds: unionBounds(contentVisibleBounds, shellBounds),
                contentBounds: unionBounds(contentBounds, shellBounds),
                axis: hookMidY
            };
        }
        case "group": {
            const parenWidth = measured.parenWidth ?? resolveParenWidth(measured.content.above + measured.content.below, measured.scale);
            const sidePad = METRICS.groupSidePad * measured.scale;
            const contentX = x + parenWidth + sidePad;
            const contentResult = placeNode(node.content, measured.content, contentX, baselineY);
            const contentVisibleBounds = contentResult.visibleBounds || boxBounds(
                contentX,
                baselineY - measured.content.above,
                contentX + measured.content.width,
                baselineY + measured.content.below
            );
            const parenTop = contentVisibleBounds.top - (METRICS.parenVerticalPad * measured.scale);
            const parenBottom = contentVisibleBounds.bottom + (METRICS.parenVerticalPad * measured.scale);
            const rightParenX = contentX + measured.content.width + sidePad;
            const parenAxis = parenTop + ((parenBottom - parenTop) / 2);
            const leftParenBounds = boxBounds(x, parenTop, x + parenWidth, parenBottom);
            const rightParenBounds = boxBounds(rightParenX, parenTop, rightParenX + parenWidth, parenBottom);

            return {
                elements: [
                    ...contentResult.elements,
                    ...buildParenthesisSegments("left", x, parenWidth, parenTop, parenBottom, METRICS.parenStrokeWidth * measured.scale, METRICS.parenCurveFactor),
                    ...buildParenthesisSegments("right", rightParenX, parenWidth, parenTop, parenBottom, METRICS.parenStrokeWidth * measured.scale, METRICS.parenCurveFactor)
                ],
                visibleBounds: unionBounds(
                    contentVisibleBounds,
                    leftParenBounds,
                    rightParenBounds
                ),
                contentBounds: unionBounds(
                    contentResult.contentBounds ?? contentVisibleBounds,
                    leftParenBounds,
                    rightParenBounds
                ),
                axis: parenAxis
            };
        }
        case "function": {
            const nameWidth = approxTextWidth(measured.name, measured.scale);
            const parenWidth = measured.parenWidth ?? resolveParenWidth(measured.content.above + measured.content.below, measured.scale);
            const sidePad = METRICS.groupSidePad * measured.scale;
            const contentX = x + nameWidth + parenWidth + sidePad;
            const contentResult = placeNode(node.argument, measured.content, contentX, baselineY);
            const contentVisibleBounds = contentResult.visibleBounds || boxBounds(
                contentX,
                baselineY - measured.content.above,
                contentX + measured.content.width,
                baselineY + measured.content.below
            );
            const parenTop = contentVisibleBounds.top - (METRICS.parenVerticalPad * measured.scale);
            const parenBottom = contentVisibleBounds.bottom + (METRICS.parenVerticalPad * measured.scale);
            const rightParenX = contentX + measured.content.width + sidePad;
            const parenAxis = parenTop + ((parenBottom - parenTop) / 2);
            const nameBounds = boxBounds(
                x,
                baselineY - measured.above,
                x + nameWidth,
                baselineY + measured.below
            );
            const leftParenBounds = boxBounds(x + nameWidth, parenTop, x + nameWidth + parenWidth, parenBottom);
            const rightParenBounds = boxBounds(rightParenX, parenTop, rightParenX + parenWidth, parenBottom);

            return {
                elements: [
                    ...contentResult.elements,
                    `<text x="${x.toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${(METRICS.fontSize * measured.scale).toFixed(2)}" fill="#111827" font-family="Times New Roman, serif" font-style="normal">${escapeXml(measured.name)}</text>`,
                    ...buildParenthesisSegments("left", x + nameWidth, parenWidth, parenTop, parenBottom, METRICS.parenStrokeWidth * measured.scale, METRICS.parenCurveFactor),
                    ...buildParenthesisSegments("right", rightParenX, parenWidth, parenTop, parenBottom, METRICS.parenStrokeWidth * measured.scale, METRICS.parenCurveFactor)
                ],
                visibleBounds: unionBounds(
                    contentVisibleBounds,
                    nameBounds,
                    leftParenBounds,
                    rightParenBounds
                ),
                contentBounds: unionBounds(
                    nameBounds,
                    contentResult.contentBounds ?? contentVisibleBounds,
                    leftParenBounds,
                    rightParenBounds
                ),
                axis: parenAxis
            };
        }
        default:
            return {
                elements: [],
                visibleBounds: null,
                contentBounds: null,
                axis: baselineY
            };
    }
}

function buildSvg(example) {
    const measured = measureNode(example.structure || {});
    const placement = placeNode(
        example.structure || {},
        measured,
        METRICS.canvasMargin,
        METRICS.canvasMargin + measured.above
    );
    const visibleBounds = placement.visibleBounds || boxBounds(
        METRICS.canvasMargin,
        METRICS.canvasMargin,
        METRICS.canvasMargin + measured.width,
        METRICS.canvasMargin + measured.above + measured.below
    );
    const width = visibleBounds.right + METRICS.canvasMargin;
    const height = visibleBounds.bottom + METRICS.canvasMargin;
    const elements = placement.elements;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(2)}" height="${height.toFixed(2)}" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}">
<rect width="100%" height="100%" fill="white" />
${elements.join("\n")}
</svg>
`;
}

function resolveOutputPath(example, explicitOutputPath = null) {
    if (explicitOutputPath) {
        return path.resolve(projectDir, explicitOutputPath);
    }

    const fileName = `${example.id || "flat_expression"}_flat.svg`;
    return path.resolve(projectDir, "reference_outputs", fileName);
}

function renderPng(svgPath, pngPath) {
    const result = spawnSync(
        "magick",
        ["-density", "220", svgPath, pngPath],
        {
            cwd: path.dirname(svgPath),
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "magick PNG-Export fehlgeschlagen.");
    }
}

function main() {
    const { examplePath, outputPath } = parseArgs(process.argv.slice(2));

    if (!examplePath) {
        usage();
        process.exit(1);
    }

    const { resolvedPath, data } = loadExample(examplePath);
    const svgPath = resolveOutputPath(data, outputPath);
    const pngPath = svgPath.replace(/\.svg$/i, ".png");
    const svg = buildSvg(data);

    fs.mkdirSync(path.dirname(svgPath), { recursive: true });
    fs.writeFileSync(svgPath, svg, "utf8");
    renderPng(svgPath, pngPath);

    console.log(`Example: ${resolvedPath}`);
    console.log(`SVG: ${svgPath}`);
    console.log(`PNG: ${pngPath}`);
}

main();
