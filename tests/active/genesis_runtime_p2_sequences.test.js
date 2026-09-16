import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import {
  normalizeEquationInput,
  normalizeTargetVariableInput
} from "../../components/Arbeitsblatt_Druckansicht/inputAdapter.js";

async function solveNormalized(rawEquation, targetVariable) {
  const input = normalizeEquationInput(rawEquation);
  const result = await GenesisCore.solve(input.normalized, {
    runtimeEngine: "genesis_runtime",
    targetVariable: normalizeTargetVariableInput(targetVariable)
  });

  assert.equal(result.fehler, undefined);
  return result;
}

function families(result) {
  return result.schritte.map((step) => step.strategie.family);
}

assert.deepEqual(
  families(await solveNormalized("\\sqrt{x+3}=5", "x")),
  ["root_power", "addition_release"]
);

assert.deepEqual(
  families(await solveNormalized("\\frac{x}{2}=5", "x")),
  ["fraction_collapse"]
);

assert.deepEqual(
  families(await solveNormalized("\\sin(x)=5", "x")),
  ["trig_inverse"]
);

assert.deepEqual(
  families(await solveNormalized("\\sqrt{\\frac{x}{2}}=3", "x")),
  ["root_power", "fraction_collapse"]
);

assert.deepEqual(
  families(await solveNormalized("\\frac{\\sin(x)}{2}=5", "x")),
  ["fraction_collapse", "trig_inverse"]
);

assert.deepEqual(
  families(await solveNormalized("(log(2*x-1)+3)/a=2", "x")),
  [
    "fraction_collapse",
    "group_release",
    "addition_release",
    "log_inverse",
    "subtraction_release",
    "fraction_birth"
  ],
  "Eine nach dem Bruchabbau allein sichtbare aeussere Gruppe wird als eigener P2-Schritt freigegeben."
);

assert.deepEqual(
  families(await solveNormalized("y=a*B^{x}", "a")),
  ["fraction_birth"]
);

assert.deepEqual(
  families(await solveNormalized("y=a*B^{x}", "x")),
  ["fraction_birth", "power_exponent_release"]
);

const greekResult = await solveNormalized("γ+1=2", "γ");
assert.equal(greekResult.targetVariable, "gamma");

console.log("GenesisRuntime-P2-Mehrschrittfolgen erfolgreich geprueft.");
