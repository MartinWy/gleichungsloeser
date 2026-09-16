import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const entryFile = path.resolve(projectRoot, "components/Arbeitsblatt_Druckansicht/logic.js");
const outputFile = path.resolve(projectRoot, "browser/app.bundle.js");

const importRegex = /^import\s+([\s\S]+?)\s+from\s+["'](.+?)["'];\s*$/gm;
const namedReExportRegex = /^export\s+\{([\s\S]+?)\}\s+from\s+["'](.+?)["'];\s*$/gm;
const starReExportRegex = /^export\s+\*\s+from\s+["'](.+?)["'];\s*$/gm;

function normalizePath(filePath) {
    return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

function resolveLocalImport(fromFile, source) {
    const resolved = path.resolve(path.dirname(fromFile), source);
    return resolved.endsWith(".js") ? resolved : `${resolved}.js`;
}

function parseNamedSpecifiers(source) {
    return source
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const [imported, local] = entry.split(/\s+as\s+/).map((value) => value.trim());
            return {
                imported,
                local: local || imported
            };
        });
}

function toImportDestructuring(source) {
    const pairs = parseNamedSpecifiers(source);
    return `{ ${pairs.map(({ imported, local }) => imported === local ? imported : `${imported}: ${local}`).join(", ")} }`;
}

function collectGraph(filePath, graph = new Map()) {
    if (graph.has(filePath)) {
        return graph;
    }

    const source = fs.readFileSync(filePath, "utf8");
    const imports = [];
    const reExports = [];
    let match;

    importRegex.lastIndex = 0;
    namedReExportRegex.lastIndex = 0;
    starReExportRegex.lastIndex = 0;

    while ((match = importRegex.exec(source)) !== null) {
        const [, clause, specifier] = match;
        if (!specifier.startsWith(".")) {
            throw new Error(`Nur lokale Imports werden unterstuetzt: ${specifier} in ${normalizePath(filePath)}`);
        }

        const resolved = resolveLocalImport(filePath, specifier);
        imports.push({
            raw: match[0],
            clause: clause.trim(),
            specifier,
            resolved
        });
        collectGraph(resolved, graph);
    }

    while ((match = namedReExportRegex.exec(source)) !== null) {
        const [, names, specifier] = match;
        if (!specifier.startsWith(".")) {
            throw new Error(`Nur lokale Re-Exports werden unterstuetzt: ${specifier} in ${normalizePath(filePath)}`);
        }

        const resolved = resolveLocalImport(filePath, specifier);
        reExports.push({
            raw: match[0],
            names,
            specifier,
            resolved
        });
        collectGraph(resolved, graph);
    }

    while ((match = starReExportRegex.exec(source)) !== null) {
        const [, specifier] = match;
        if (!specifier.startsWith(".")) {
            throw new Error(`Nur lokale Re-Exports werden unterstuetzt: ${specifier} in ${normalizePath(filePath)}`);
        }

        const resolved = resolveLocalImport(filePath, specifier);
        reExports.push({
            raw: match[0],
            specifier,
            resolved,
            exportAll: true
        });
        collectGraph(resolved, graph);
    }

    graph.set(filePath, { source, imports, reExports });
    return graph;
}

function transformImports(code, filePath, imports) {
    let next = code;

    imports.forEach((entry) => {
        const request = `__require(${JSON.stringify(normalizePath(entry.resolved))})`;
        let replacement = "";

        if (entry.clause.startsWith("{")) {
            replacement = `const ${toImportDestructuring(entry.clause.slice(1, -1))} = ${request};`;
        } else if (entry.clause.startsWith("* as ")) {
            replacement = `const ${entry.clause.slice(5).trim()} = ${request};`;
        } else if (entry.clause.includes("{")) {
            const [defaultPart, namedPart] = entry.clause.split(",", 2);
            replacement = [
                `const ${defaultPart.trim()} = ${request}.default;`,
                `const ${toImportDestructuring(namedPart.trim().slice(1, -1))} = ${request};`
            ].join("\n");
        } else {
            replacement = `const ${entry.clause} = ${request}.default;`;
        }

        next = next.replace(entry.raw, replacement);
    });

    return next;
}

function transformReExports(code, reExports) {
    let next = code;

    reExports.forEach((entry, index) => {
        const tempName = `__reexport_${index}`;
        const requireLine = `const ${tempName} = __require(${JSON.stringify(normalizePath(entry.resolved))});`;
        const assignments = entry.exportAll
            ? `Object.keys(${tempName}).forEach((key) => {\n  if (key !== "default") {\n    __exports[key] = ${tempName}[key];\n  }\n});`
            : parseNamedSpecifiers(entry.names)
                .map(({ imported, local }) => `__exports.${local} = ${tempName}.${imported};`)
                .join("\n");

        next = next.replace(entry.raw, `${requireLine}\n${assignments}`);
    });

    return next;
}

function transformExports(code) {
    const exportedBindings = [];
    let next = code;

    next = next.replace(/^export default ([^;]+);$/gm, (_match, expression) => `__exports.default = ${expression};`);

    next = next.replace(/^export class (\w+)/gm, (_match, name) => {
        exportedBindings.push({ local: name, exported: name });
        return `class ${name}`;
    });

    next = next.replace(/^export function (\w+)/gm, (_match, name) => {
        exportedBindings.push({ local: name, exported: name });
        return `function ${name}`;
    });

    next = next.replace(/^export const (\w+)\s*=/gm, (_match, name) => {
        exportedBindings.push({ local: name, exported: name });
        return `const ${name} =`;
    });

    next = next.replace(/^export let (\w+)\s*=/gm, (_match, name) => {
        exportedBindings.push({ local: name, exported: name });
        return `let ${name} =`;
    });

    next = next.replace(/^export\s+\{([^}]+)\};$/gm, (_match, names) => {
        return parseNamedSpecifiers(names)
            .map(({ imported, local }) => `__exports.${local} = ${imported};`)
            .join("\n");
    });

    const uniqueAssignments = [];
    const seen = new Set();

    exportedBindings.forEach(({ local, exported }) => {
        const key = `${local}:${exported}`;
        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        uniqueAssignments.push(`__exports.${exported} = ${local};`);
    });

    if (uniqueAssignments.length > 0) {
        next += `\n${uniqueAssignments.join("\n")}\n`;
    }

    return next;
}

function transformModule(filePath, moduleInfo) {
    let code = moduleInfo.source;
    code = transformImports(code, filePath, moduleInfo.imports);
    code = transformReExports(code, moduleInfo.reExports);
    code = transformExports(code);
    return code.trim();
}

function buildBundle() {
    const graph = collectGraph(entryFile);
    const moduleEntries = [];

    for (const [filePath, moduleInfo] of graph.entries()) {
        const moduleId = normalizePath(filePath);
        const transformed = transformModule(filePath, moduleInfo);
        const indentedSource = transformed
            .split("\n")
            .map((line) => (line.length > 0 ? `    ${line}` : ""))
            .join("\n");
        moduleEntries.push(`  ${JSON.stringify(moduleId)}: function(__exports, __require) {\n${indentedSource}\n  }`);
    }

    const banner = `/* Generated by scripts/build_browser_bundle.mjs. */`;
    const runtime = `(function() {\n${banner}\nconst __modules = {\n${moduleEntries.join(",\n")}\n};\nconst __cache = Object.create(null);\nfunction __require(id) {\n  if (__cache[id]) {\n    return __cache[id];\n  }\n  const factory = __modules[id];\n  if (!factory) {\n    throw new Error("Unbekanntes Browser-Modul: " + id);\n  }\n  const __exports = {};\n  __cache[id] = __exports;\n  factory(__exports, __require);\n  return __exports;\n}\n__require(${JSON.stringify(normalizePath(entryFile))});\n})();\n`;

    fs.writeFileSync(outputFile, runtime, "utf8");
}

buildBundle();
console.log(`Browser-Bundle geschrieben: ${normalizePath(outputFile)}`);
