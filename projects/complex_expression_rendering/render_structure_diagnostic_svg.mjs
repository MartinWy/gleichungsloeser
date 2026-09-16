import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = __dirname;

const COLORS = {
    level0: "#2563eb",
    level1: "#dc2626",
    level2: "#059669",
    level3: "#7c3aed",
    level4: "#d97706",
    text: "#111827",
    shell: "#6b7280",
    guide: "#cbd5e1",
    spanFill: "rgba(37,99,235,0.06)"
};

const METRICS = {
    fontSize: 30,
    textAbove: 24,
    textBelow: 10,
    charWidth: 17,
    operatorWidth: 14,
    sequenceGap: 10,
    fractionPad: 12,
    fractionGap: 10,
    fractionRuleGap: 4,
    rootLead: 28,
    rootTopPad: 8,
    rootBottomPad: 8,
    groupParenWidth: 14,
    groupSidePad: 2,
    powerGap: 4,
    exponentScale: 0.62,
    exponentLift: 24,
    canvasMargin: 48,
    titleHeight: 68,
    legendHeight: 56
};

function usage() {
    console.error(
        "Verwendung: node projects/complex_expression_rendering/render_structure_diagnostic_svg.mjs " +
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

function nodeColor(depth = 0) {
    const palette = [
        COLORS.level0,
        COLORS.level1,
        COLORS.level2,
        COLORS.level3,
        COLORS.level4
    ];
    return palette[depth % palette.length];
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
            return {
                type: "power",
                base,
                exponent,
                width: base.width + (METRICS.powerGap * scale) + exponent.width,
                above: Math.max(base.above, (METRICS.exponentLift * scale) + exponent.above),
                below: base.below,
                scale
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
                above: numerator.above + numerator.below + ((METRICS.fractionGap + METRICS.fractionRuleGap) * scale),
                below: denominator.above + denominator.below + ((METRICS.fractionGap + METRICS.fractionRuleGap) * scale),
                scale
            };
        }
        case "root": {
            const content = measureNode(node.content, scale);
            return {
                type: "root",
                content,
                width: (METRICS.rootLead * scale) + content.width,
                above: Math.max(content.above + (METRICS.rootTopPad * scale), 32 * scale),
                below: Math.max(content.below, METRICS.rootBottomPad * scale),
                scale
            };
        }
        case "group": {
            const content = measureNode(node.content, scale);
            return {
                type: "group",
                content,
                width: content.width + (2 * (METRICS.groupParenWidth + METRICS.groupSidePad) * scale),
                above: content.above + (4 * scale),
                below: content.below + (4 * scale),
                scale
            };
        }
        case "function": {
            const content = measureNode(node.argument, scale);
            const nameWidth = approxTextWidth(node.name || "f", scale);
            return {
                type: "function",
                name: node.name || "f",
                content,
                width: nameWidth + content.width + (2 * (METRICS.groupParenWidth + METRICS.groupSidePad) * scale),
                above: content.above + (4 * scale),
                below: content.below + (4 * scale),
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

function pushSpanRect(elements, x, yTop, width, height, color, label = "") {
    elements.push(
        `<rect x="${x.toFixed(2)}" y="${yTop.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" fill="none" stroke="${color}" stroke-width="1.1" rx="2" ry="2" />`
    );
    if (label) {
        elements.push(
            `<text x="${(x + 4).toFixed(2)}" y="${(yTop - 4).toFixed(2)}" font-size="10" fill="${color}" font-family="Menlo, monospace">${escapeXml(label)}</text>`
        );
    }
}

function pushVerticalGuides(elements, boundaries = [], yTop = 0, yBottom = 0, color = COLORS.guide) {
    boundaries.forEach((x) => {
        elements.push(
            `<line x1="${x.toFixed(2)}" y1="${yTop.toFixed(2)}" x2="${x.toFixed(2)}" y2="${yBottom.toFixed(2)}" stroke="${color}" stroke-width="0.7" stroke-dasharray="3 3" />`
        );
    });
}

function pushDashedShellRect(elements, x, yTop, width, height, color, label = "", fillOpacity = 0.05) {
    elements.push(
        `<rect x="${x.toFixed(2)}" y="${yTop.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" fill="${color}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-width="1.4" stroke-dasharray="6 4" rx="3" ry="3" />`
    );
    if (label) {
        elements.push(
            `<text x="${(x + 4).toFixed(2)}" y="${(yTop - 6).toFixed(2)}" font-size="11" fill="${color}" font-family="Menlo, monospace">${escapeXml(label)}</text>`
        );
    }
}

function renderNode(node, measured, x, baselineY, depth, elements, guideSegments) {
    const color = nodeColor(depth);
    const top = baselineY - measured.above;
    const bottom = baselineY + measured.below;
    const totalHeight = measured.above + measured.below;

    switch (measured.type) {
        case "text": {
            const fontSize = METRICS.fontSize * measured.scale;
            elements.push(
                `<text x="${x.toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${fontSize.toFixed(2)}" fill="${COLORS.text}" font-family="Times New Roman, serif" font-style="italic">${escapeXml(measured.text)}</text>`
            );
            pushSpanRect(elements, x, top, measured.width, totalHeight, color, "text");
            guideSegments.push({
                boundaries: [x, x + measured.width],
                yTop: top,
                yBottom: bottom
            });
            return;
        }
        case "sequence": {
            let cursor = x;
            const boundaries = [x];
            measured.children.forEach((child, index) => {
                renderNode((node.items || [])[index], child, cursor, baselineY, depth + 1, elements, guideSegments);
                cursor += child.width;
                boundaries.push(cursor);
                if (index < measured.children.length - 1) {
                    cursor += METRICS.sequenceGap * measured.scale;
                    boundaries[boundaries.length - 1] = cursor;
                }
            });
            pushSpanRect(elements, x, top, measured.width, totalHeight, color, "sequence");
            guideSegments.push({ boundaries, yTop: top, yBottom: bottom });
            return;
        }
        case "power": {
            const baseX = x;
            const exponentX = x + measured.base.width + (METRICS.powerGap * measured.scale);
            const exponentBaseline = baselineY - (METRICS.exponentLift * measured.scale);
            renderNode(node.base, measured.base, baseX, baselineY, depth + 1, elements, guideSegments);
            renderNode(node.exponent, measured.exponent, exponentX, exponentBaseline, depth + 1, elements, guideSegments);
            pushSpanRect(elements, baseX, top, measured.base.width, measured.base.above + measured.base.below, color, "base");
            pushSpanRect(
                elements,
                exponentX,
                exponentBaseline - measured.exponent.above,
                measured.exponent.width,
                measured.exponent.above + measured.exponent.below,
                color,
                "exp"
            );
            guideSegments.push({
                boundaries: [x, x + measured.base.width, x + measured.width],
                yTop: top,
                yBottom: bottom
            });
            return;
        }
        case "fraction": {
            const numX = x + ((measured.width - measured.numerator.width) / 2);
            const denX = x + ((measured.width - measured.denominator.width) / 2);
            const ruleY = baselineY;
            const numBaseline = ruleY - (METRICS.fractionGap * measured.scale) - measured.numerator.below;
            const denBaseline = ruleY + (METRICS.fractionGap * measured.scale) + measured.denominator.above;
            renderNode(node.numerator, measured.numerator, numX, numBaseline, depth + 1, elements, guideSegments);
            renderNode(node.denominator, measured.denominator, denX, denBaseline, depth + 1, elements, guideSegments);
            elements.push(
                `<line x1="${x.toFixed(2)}" y1="${ruleY.toFixed(2)}" x2="${(x + measured.width).toFixed(2)}" y2="${ruleY.toFixed(2)}" stroke="${color}" stroke-width="1.4" />`
            );
            pushSpanRect(elements, x, top, measured.width, totalHeight, color, "fraction");
            guideSegments.push({
                boundaries: [x, x + measured.width],
                yTop: top,
                yBottom: bottom
            });
            return;
        }
        case "root": {
            const contentX = x + (METRICS.rootLead * measured.scale);
            const contentTop = baselineY - measured.content.above;
            const hookX = x + (4 * measured.scale);
            const kneeX = x + (12 * measured.scale);
            const riseX = x + (20 * measured.scale);
            const barY = contentTop + (6 * measured.scale);
            const midY = baselineY + (10 * measured.scale);
            const shellTop = Math.min(top, barY - (10 * measured.scale));
            const shellBottom = Math.max(bottom, baselineY + measured.content.below);

            pushDashedShellRect(
                elements,
                x,
                shellTop,
                measured.width,
                shellBottom - shellTop,
                color,
                "root-shell"
            );
            elements.push(
                `<path d="M ${hookX.toFixed(2)} ${(baselineY - 2).toFixed(2)} L ${kneeX.toFixed(2)} ${midY.toFixed(2)} L ${riseX.toFixed(2)} ${barY.toFixed(2)} L ${(contentX + measured.content.width).toFixed(2)} ${barY.toFixed(2)}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`
            );
            renderNode(node.content, measured.content, contentX, baselineY, depth + 1, elements, guideSegments);
            pushSpanRect(elements, contentX, contentTop, measured.content.width, measured.content.above + measured.content.below, color, "root-content");
            guideSegments.push({
                boundaries: [contentX, contentX + measured.content.width],
                yTop: contentTop,
                yBottom: baselineY + measured.content.below
            });
            return;
        }
        case "group": {
            const contentX = x + ((METRICS.groupParenWidth + METRICS.groupSidePad) * measured.scale);
            const contentTop = baselineY - measured.content.above;
            const parenSize = Math.max(METRICS.fontSize * measured.scale, (measured.content.above + measured.content.below) * 0.9);
            elements.push(
                `<text x="${x.toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${parenSize.toFixed(2)}" fill="${COLORS.shell}" font-family="Times New Roman, serif">(</text>`
            );
            elements.push(
                `<text x="${(contentX + measured.content.width + (METRICS.groupSidePad * measured.scale)).toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${parenSize.toFixed(2)}" fill="${COLORS.shell}" font-family="Times New Roman, serif">)</text>`
            );
            renderNode(node.content, measured.content, contentX, baselineY, depth + 1, elements, guideSegments);
            pushSpanRect(elements, contentX, contentTop, measured.content.width, measured.content.above + measured.content.below, color, "group-content");
            guideSegments.push({
                boundaries: [contentX, contentX + measured.content.width],
                yTop: contentTop,
                yBottom: baselineY + measured.content.below
            });
            return;
        }
        case "function": {
            const name = node.name || "f";
            const nameWidth = approxTextWidth(name, measured.scale);
            const contentX = x + nameWidth + ((METRICS.groupParenWidth + METRICS.groupSidePad) * measured.scale);
            const contentTop = baselineY - measured.content.above;
            const parenSize = Math.max(METRICS.fontSize * measured.scale, (measured.content.above + measured.content.below) * 0.9);
            elements.push(
                `<text x="${x.toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${(METRICS.fontSize * measured.scale).toFixed(2)}" fill="${COLORS.text}" font-family="Times New Roman, serif">${escapeXml(name)}</text>`
            );
            elements.push(
                `<text x="${(x + nameWidth).toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${parenSize.toFixed(2)}" fill="${COLORS.shell}" font-family="Times New Roman, serif">(</text>`
            );
            elements.push(
                `<text x="${(contentX + measured.content.width + (METRICS.groupSidePad * measured.scale)).toFixed(2)}" y="${baselineY.toFixed(2)}" font-size="${parenSize.toFixed(2)}" fill="${COLORS.shell}" font-family="Times New Roman, serif">)</text>`
            );
            renderNode(node.argument, measured.content, contentX, baselineY, depth + 1, elements, guideSegments);
            pushSpanRect(elements, contentX, contentTop, measured.content.width, measured.content.above + measured.content.below, color, "arg");
            guideSegments.push({
                boundaries: [contentX, contentX + measured.content.width],
                yTop: contentTop,
                yBottom: baselineY + measured.content.below
            });
        }
    }
}

function buildSvg(example) {
    const measured = measureNode(example.structure || {});
    const title = example.title || example.id || "Diagnostic";
    const subtitle = "Lokale Spalten und Spannbreiten; Schalen liegen ausserhalb der Content-Spannen.";
    const legend = "Blau/Rot/Gruen/... = lokale Spanngrenzen je Hierarchieebene, grau gestrichelt = lokale Spaltenlinien.";
    const minWidth = Math.max(
        measured.width + (2 * METRICS.canvasMargin),
        approxTextWidth(title, 0.95) + (2 * METRICS.canvasMargin),
        approxTextWidth(subtitle, 0.6) + (2 * METRICS.canvasMargin),
        approxTextWidth(legend, 0.52) + (2 * METRICS.canvasMargin)
    );
    const width = minWidth;
    const height = measured.above + measured.below + METRICS.titleHeight + METRICS.legendHeight + (2 * METRICS.canvasMargin);
    const baselineY = METRICS.canvasMargin + METRICS.titleHeight + METRICS.legendHeight + measured.above;
    const rootX = Math.max(METRICS.canvasMargin, (width - measured.width) / 2);
    const elements = [];
    const guideSegments = [];

    renderNode(example.structure || {}, measured, rootX, baselineY, 0, elements, guideSegments);

    const guideElements = [];
    guideSegments.forEach((segment) => {
        pushVerticalGuides(
            guideElements,
            segment.boundaries || [],
            segment.yTop || 0,
            segment.yBottom || 0,
            COLORS.guide
        );
    });

    const titleText = escapeXml(title);
    const subtitleText = escapeXml(subtitle);
    const legendText = escapeXml(legend);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="white" />
  <text x="${METRICS.canvasMargin}" y="${(METRICS.canvasMargin).toFixed(2)}" font-size="22" font-weight="700" font-family="Georgia, serif" fill="#111827">${titleText}</text>
  <text x="${METRICS.canvasMargin}" y="${(METRICS.canvasMargin + 26).toFixed(2)}" font-size="12" font-family="Menlo, monospace" fill="#374151">${subtitleText}</text>
  <text x="${METRICS.canvasMargin}" y="${(METRICS.canvasMargin + 46).toFixed(2)}" font-size="11" font-family="Menlo, monospace" fill="#6b7280">${legendText}</text>
  ${guideElements.join("\n  ")}
  ${elements.join("\n  ")}
</svg>`;
}

function resolveOutputPath(example, explicitOutputPath = null) {
    if (explicitOutputPath) {
        return path.resolve(projectDir, explicitOutputPath);
    }

    const fileName = `${example.id || "reference_expression"}_diagnostic.svg`;
    return path.resolve(projectDir, "reference_outputs", fileName);
}

function renderPngPreview(svgPath) {
    const outputDir = path.dirname(svgPath);
    const previewPath = svgPath.replace(/\.svg$/i, "_preview.png");
    const result = spawnSync(
        "qlmanage",
        ["-t", "-s", "1600", "-o", outputDir, svgPath],
        {
            cwd: outputDir,
            encoding: "utf8"
        }
    );

    const generatedPath = path.join(outputDir, `${path.basename(svgPath)}.png`);
    if (fs.existsSync(generatedPath)) {
        fs.renameSync(generatedPath, previewPath);
    }

    if (result.status !== 0 || !fs.existsSync(previewPath)) {
        return null;
    }

    return previewPath;
}

function main() {
    const { examplePath, outputPath } = parseArgs(process.argv.slice(2));

    if (!examplePath) {
        usage();
        process.exit(1);
    }

    const { resolvedPath, data } = loadExample(examplePath);
    const svgPath = resolveOutputPath(data, outputPath);
    fs.mkdirSync(path.dirname(svgPath), { recursive: true });
    fs.writeFileSync(svgPath, buildSvg(data), "utf8");
    const previewPath = renderPngPreview(svgPath);

    console.log(`Example: ${resolvedPath}`);
    console.log(`SVG: ${svgPath}`);
    if (previewPath) {
        console.log(`PNG: ${previewPath}`);
    }
}

main();
