import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const inspectScript = path.resolve(projectRoot, "scripts/inspect_equation.mjs");

const inspectResult = spawnSync(
  process.execPath,
  [inspectScript, "2*x+3=5", "--target", "x"],
  {
    cwd: projectRoot,
    encoding: "utf8"
  }
);

assert.equal(inspectResult.status, 0, inspectResult.stderr || inspectResult.stdout);
assert.match(inspectResult.stdout, /Eingabe: 2\*x\+3=5/);
assert.match(inspectResult.stdout, /Zielvariable: x/);
assert.match(inspectResult.stdout, /Schritt 2: Ausdruck in Nenner \(fraction_birth\)/);
assert.match(inspectResult.stdout, /Block: local axis=1, stack=2-4, absolute=2-4, axisAbsolute=3, axisStacked=3/);
assert.match(inspectResult.stdout, /Zeilenrollen: above_axis \| axis \| below_axis/);
assert.match(inspectResult.stdout, /Teilzeile 1: axis, min=1\.12em, Zellen=3, Achsenreserve=0\.52\/0\.32em, Achsenbalance=0\.2em, Achsenversatz=0em, Achsenkontext=fraction_axis, Linienversatz=0em, Bruchspanne=3, Bruchstrich/);
assert.match(inspectResult.stdout, /text=x, id=.*rowKind=axis, axis=baseline, .*boxExtent=0\.52\/0\.28em, boxHeight=0\.8em, .*rowShift=0em, rowLine=0em, rowContext=fraction_axis, blockContext=fraction_axis, rowSpan=3, blockSpan=3, shift=-0\.04em, Zielspur/);
assert.match(inspectResult.stdout, /text=---, id=.*absolute=3, stacked=3, col=7, rowKind=axis, role=fraction_line, shell=.*rowBalance=0\.2em, rowShift=0em, rowLine=0em, rowContext=fraction_axis, blockContext=fraction_axis, rowSpan=3, blockSpan=3, shift=-0\.27em, lineHeight=0\.3em, lineThickness=0\.1em/);
assert.match(inspectResult.stdout, /text=5, id=.*rowKind=above_axis, role=inverse_content, shell=.*blockContext=fraction_axis, blockSpan=3, shift=0em/);
assert.match(inspectResult.stdout, /text=2, id=.*rowKind=below_axis, role=denominator, shell=.*blockContext=fraction_axis, blockSpan=3, shift=0em/);

const normalizedInspectResult = spawnSync(
  process.execPath,
  [inspectScript, "\\sqrt{\\frac{x}{2}}=3", "--target", "x"],
  {
    cwd: projectRoot,
    encoding: "utf8"
  }
);

assert.equal(normalizedInspectResult.status, 0, normalizedInspectResult.stderr || normalizedInspectResult.stdout);
assert.match(normalizedInspectResult.stdout, /Eingabe: \\sqrt\{\\frac\{x\}\{2\}\}=3/);
assert.match(normalizedInspectResult.stdout, /Normalisiert: sqrt\(x\/2\)=3/);
assert.match(normalizedInspectResult.stdout, /Schritt 1: .* \(root_power\)/);
assert.match(normalizedInspectResult.stdout, /Schritt 2: .* \(fraction_collapse\)/);
assert.match(normalizedInspectResult.stdout, /Block: local axis=1, stack=1-3, absolute=1-3, axisAbsolute=2, axisStacked=2/);
assert.match(normalizedInspectResult.stdout, /Teilzeile 1: axis, min=1\.19em, Zellen=3, Achsenreserve=0\.86\/0\.32em, Achsenbalance=0\.54em, Achsenversatz=0em, Achsenkontext=fraction_power_axis, Linienversatz=0em, Bruchspanne=1, Bruchstrich/);
assert.match(normalizedInspectResult.stdout, /text==, id=.*rowKind=axis, axis=baseline, .*boxExtent=0\.32\/0\.32em, boxHeight=0\.64em, .*rowShift=0em, rowLine=0em, rowContext=fraction_power_axis, blockContext=fraction_power_axis, rowSpan=1, blockSpan=1, shift=0em/);
assert.match(normalizedInspectResult.stdout, /text=sqrt\(\(x\) \/ \(2\)\), id=.*boxExtent=1\.22\/1\.04em, boxHeight=2\.26em, boxReserve=0\.24\/0\.14em, boxBalance=0\.1em, rowBalance=0\.18em, rowShift=0em/);
assert.doesNotMatch(normalizedInspectResult.stdout, /\(group_release\)/);

const jsonInspectResult = spawnSync(
  process.execPath,
  [inspectScript, "\\frac{\\sin(x)}{2}=5", "--target", "x", "--json"],
  {
    cwd: projectRoot,
    encoding: "utf8"
  }
);

assert.equal(jsonInspectResult.status, 0, jsonInspectResult.stderr || jsonInspectResult.stdout);
const jsonPayload = JSON.parse(jsonInspectResult.stdout);
assert.equal(jsonPayload.input, "\\frac{\\sin(x)}{2}=5");
assert.equal(jsonPayload.normalized, "sin(x)/2=5");
assert.equal(jsonPayload.targetVariable, "x");
assert.equal(jsonPayload.runtimeEngine, null);
assert.equal(jsonPayload.stepCount, 3);
assert.deepEqual(jsonPayload.diagnostics.steps[0].rowKinds, ["above_axis", "axis", "below_axis"]);
assert.equal(jsonPayload.diagnostics.steps[0].axisLocalRow, 1);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.projectionRole === "fraction_line" && typeof cell.id === "string" && typeof cell.sourceShellId === "string" && cell.absoluteRow === 1 && cell.stackedRow === 1)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.text === "sin" && cell.projectionRole === "function_name" && cell.axisMinHeightEm === 1.12 && cell.axisAboveEm === 0.52 && cell.axisBelowEm === 0.28 && cell.sourceAtomId)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.text === "x" && cell.projectionRole === "function_argument" && cell.axisBalanceEm === 0.04 && cell.boxHeightEm === 0.8)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.rowKind === "axis" && cell.rowAxisBalanceEm === 0.2)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.rowKind === "axis" && cell.rowAxisShiftEm === 0)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.rowKind === "axis" && cell.rowAxisContext === "fraction_axis")
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.rowKind === "axis" && cell.rowAxisCompanionShiftEm === null)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.rowKind === "axis" && cell.rowAxisLineShiftEm === 0)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].cells.some((cell) => cell.projectionRole === "denominator" && cell.blockAxisContext === "fraction_axis" && cell.blockFractionSpanWidth === 4 && cell.shiftYEm === 0)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.axisTopReserveEm === 0.52 && metric.axisBottomReserveEm === 0.32)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.axisBalanceEm === 0.2)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.axisShiftEm === 0)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.axisContext === "fraction_axis")
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.axisCompanionShiftEm === null)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.axisLineShiftEm === 0)
);
assert.ok(
  jsonPayload.diagnostics.steps[0].rowMetrics.some((metric) => metric.kind === "axis" && metric.fractionSpanWidth === 4)
);
