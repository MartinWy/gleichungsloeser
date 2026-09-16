import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = __dirname;

function usage() {
    console.error(
        "Verwendung: node projects/complex_expression_rendering/render_reference_latex.mjs " +
        "<example.json> [--output reference_outputs/datei.pdf]"
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

function wrapIfNeeded(node, latex) {
    if (!node || typeof node !== "object") {
        return `{${latex}}`;
    }

    if (node.type === "text") {
        return latex;
    }

    if (node.type === "group") {
        return latex;
    }

    return `{${latex}}`;
}

function renderStructureLatex(node) {
    if (!node || typeof node !== "object") {
        return "";
    }

    switch (node.type) {
        case "text":
            return String(node.text || "");
        case "sequence":
            return (node.items || [])
                .map((item) => renderStructureLatex(item))
                .filter(Boolean)
                .join(" ");
        case "power": {
            const baseLatex = renderStructureLatex(node.base);
            const exponentLatex = renderStructureLatex(node.exponent);
            return `${wrapIfNeeded(node.base, baseLatex)}^{${exponentLatex}}`;
        }
        case "fraction":
            return String.raw`\dfrac{\displaystyle ${renderStructureLatex(node.numerator)}}{\displaystyle ${renderStructureLatex(node.denominator)}}`;
        case "root":
            return String.raw`\sqrt{\displaystyle ${renderStructureLatex(node.content)}}`;
        case "group":
            return String.raw`\left(${renderStructureLatex(node.content)}\right)`;
        case "function": {
            const name = node.name || "f";
            return String.raw`\operatorname{${name}}\left(${renderStructureLatex(node.argument)}\right)`;
        }
        default:
            return "";
    }
}

function resolveLatexExpression(example) {
    if (example.structure) {
        return renderStructureLatex(example.structure);
    }
    return String(example.latex || "");
}

function buildLatexDocument(latexExpression) {
    return String.raw`\documentclass[varwidth,border=8pt]{standalone}
\usepackage{amsmath}
\begin{document}
\[
\displaystyle ${latexExpression}
\]
\end{document}
`;
}

function resolveOutputPath(example, explicitOutputPath = null) {
    if (explicitOutputPath) {
        return path.resolve(projectDir, explicitOutputPath);
    }

    const fileName = `${example.id || "reference_expression"}.pdf`;
    return path.resolve(projectDir, "reference_outputs", fileName);
}

function compilePdf(texPath, outputDir) {
    const result = spawnSync(
        "pdflatex",
        [
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-output-directory",
            outputDir,
            texPath
        ],
        {
            cwd: outputDir,
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "pdflatex fehlgeschlagen.");
    }
}

function renderPreviewPng(pdfPath, outputPrefix) {
    const result = spawnSync(
        "pdftocairo",
        ["-png", "-singlefile", "-r", "300", pdfPath, outputPrefix],
        {
            cwd: path.dirname(pdfPath),
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "pdftocairo fehlgeschlagen.");
    }
}

function renderSvg(pdfPath, svgPath) {
    const result = spawnSync(
        "pdftocairo",
        ["-svg", pdfPath, svgPath],
        {
            cwd: path.dirname(pdfPath),
            encoding: "utf8"
        }
    );

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "pdftocairo SVG-Export fehlgeschlagen.");
    }
}

function main() {
    const { examplePath, outputPath } = parseArgs(process.argv.slice(2));

    if (!examplePath) {
        usage();
        process.exit(1);
    }

    const { resolvedPath, data } = loadExample(examplePath);
    const pdfPath = resolveOutputPath(data, outputPath);
    const texPath = pdfPath.replace(/\.pdf$/i, ".tex");
    const outputDir = path.dirname(pdfPath);
    const pngPrefix = pdfPath.replace(/\.pdf$/i, "");
    const pngPath = `${pngPrefix}.png`;
    const svgPath = pdfPath.replace(/\.pdf$/i, ".svg");
    const latexExpression = resolveLatexExpression(data);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(texPath, buildLatexDocument(latexExpression), "utf8");

    compilePdf(texPath, outputDir);
    renderPreviewPng(pdfPath, pngPrefix);
    renderSvg(pdfPath, svgPath);

    console.log(`Example: ${resolvedPath}`);
    console.log(`PDF: ${pdfPath}`);
    console.log(`TeX: ${texPath}`);
    console.log(`PNG: ${pngPath}`);
    console.log(`SVG: ${svgPath}`);
}

main();
