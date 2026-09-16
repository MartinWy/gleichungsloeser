import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const exportScript = path.resolve(projectRoot, "scripts/export_projection_pdf_active.mjs");
const inspectScript = path.resolve(projectRoot, "scripts/inspect_equation_active.mjs");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gleichungsloeser-active-runtime-"));
const exportOutput = path.join(tmpDir, "exponent-active.pdf");
const complexExportOutput = path.join(tmpDir, "complex-exponent-active.pdf");

function extractAtomicNodes(latex = "") {
  return [...String(latex).matchAll(/\\node\[inner sep=0pt, outer sep=0pt, anchor=center\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
    .map((match) => ({
      x: Number(match[1]),
      y: Number(match[2]),
      latex: match[3]
    }));
}

function collectRows(nodes = []) {
  return Object.values(nodes.reduce((rows, node) => {
    const key = String(node.y);
    rows[key] ||= [];
    rows[key].push(node);
    return rows;
  }, {})).map((row) => row.sort((left, right) => left.x - right.x));
}

const exportResult = spawnSync(
  process.execPath,
  [exportScript, "B^x=y/a", "--target", "x", "--output", exportOutput],
  { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(exportResult.status, 0, exportResult.stderr || exportResult.stdout);
assert.ok(fs.existsSync(exportOutput), "Der aktive Export-Wrapper muss eine echte PDF erzeugen.");

const exportTex = fs.readFileSync(exportOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  exportTex,
  /\{\$log\$\}/,
  "Der aktive Export-Wrapper muss den gelieferten atomaren Funktionsnamen des Logarithmusschritts zeigen."
);
assert.match(
  exportTex,
  /\{\$B\$\}/,
  "Die vom Core getrennt gelieferte Logarithmusbasis muss als eigenes Primitiv sichtbar bleiben."
);
assert.doesNotMatch(
  exportTex,
  /\\log_\{B\}/,
  "Der aktive Export-Wrapper darf Funktionsname und Basis nicht wieder zu einer LaTeX-Zelle buendeln."
);

const complexExportResult = spawnSync(
  process.execPath,
  [exportScript, "B^(2*x-1)=y/a", "--target", "x", "--output", complexExportOutput],
  { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(complexExportResult.status, 0, complexExportResult.stderr || complexExportResult.stdout);
assert.ok(fs.existsSync(complexExportOutput), "Der aktive Export-Wrapper muss auch komplexe Exponenten als echte PDF erzeugen.");

const complexExportTex = fs.readFileSync(complexExportOutput.replace(/\.pdf$/, ".tex"), "utf8");
const complexRows = collectRows(extractAtomicNodes(complexExportTex));
assert.ok(
  complexRows.some((row) => row.slice(0, 5).map((node) => node.latex).join("|") === "2|\\cdot{}|x|-|1"),
  "Der sichtbare komplexe Exponent muss als Folge von fuenf atomaren LaTeX-Primitiven erscheinen."
);
assert.match(
  complexExportTex,
  /\{\$log\$\}/,
  "Auch beim komplexen Exponenten muss der aktive Export den atomaren Logarithmusnamen zeigen."
);
assert.doesNotMatch(
  complexExportTex,
  /\^\{/,
  "Der aktive Export darf aus Basis und Exponentenatomen keine neue LaTeX-Potenz zusammensetzen."
);

const inspectResult = spawnSync(
  process.execPath,
  [inspectScript, "B^x=y/a", "--target", "x", "--json"],
  { cwd: projectRoot, encoding: "utf8" }
);

assert.equal(inspectResult.status, 0, inspectResult.stderr || inspectResult.stdout);

const inspectJson = JSON.parse(inspectResult.stdout);
assert.equal(inspectJson.runtimeEngine, "genesis_runtime");
assert.equal(inspectJson.stepCount, 2);
assert.equal(inspectJson.diagnostics.steps[1].family, "power_exponent_release");
assert.ok(
  inspectJson.diagnostics.steps[1].cells.some((cell) => cell.text === "log" && cell.projectionRole === "function_name"),
  "Der aktive Diagnose-Wrapper muss denselben echten log-Schritt zeigen wie der aktive Export."
);

console.log("Aktive Export-/Diagnose-Wrapper erfolgreich geprueft.");
