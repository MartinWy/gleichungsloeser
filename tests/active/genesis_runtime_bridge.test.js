import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";

const bridgeResult = await GenesisCore.solve("x/2=5", {
    runtimeEngine: "genesis_runtime"
});

assert.ok(!bridgeResult.fehler, "Der GenesisRuntime-Opt-in-Pfad darf keinen Fehler liefern.");
assert.equal(bridgeResult.targetVariable, "x");
assert.equal(bridgeResult.schritte.length, 1);
assert.equal(bridgeResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(bridgeResult.exportData.layoutPlan.mode, "genesis_runtime_legacy_adapter_v1");
assert.equal(bridgeResult.exportData.layoutPlan.source, "GenesisRuntime");
assert.equal(bridgeResult.exportData.theoryRows.length, 2);
assert.equal(bridgeResult.exportData.projectionRows.length, 2);
assert.deepEqual(
    bridgeResult.exportData.outputContract.projectionRows[0].rowRoles,
    ["above_axis", "axis", "below_axis"],
    "Der native Runtime-Export muss die Teilzeilen des Bruchs explizit ausweisen."
);
assert.deepEqual(
    bridgeResult.exportData.projectionRows[0].rowRoles,
    ["above_axis", "axis", "below_axis"],
    "Der Legacy-Adapter darf die expliziten Teilzeilenrollen nicht verlieren."
);
assert.ok(
    bridgeResult.exportData.projectionRows[0].positionedAtoms.some((atom) => atom.projectionRole === "fraction_line"),
    "Die Startzeile muss den Bruchstrich explizit projizieren."
);
assert.ok(
    bridgeResult.exportData.outputContract.projectionRows[0].shellSpans.some((shell) => shell.shellType === "DIVISION"),
    "Der native Runtime-Export muss die Bruchschale als explizite Spanne mitliefern."
);
assert.ok(
    bridgeResult.exportData.projectionRows[0].shellSpans.some((shell) => shell.shellType === "DIVISION"),
    "Auch der Legacy-Adapter soll die Bruchspanne fuer nachgelagerte Renderer erhalten."
);
assert.ok(
    bridgeResult.exportData.projectionRows[1].positionedAtoms.some((atom) => atom.projectionRole === "product_operator"),
    "Die Folgezeile muss den Multiplikationsoperator der Gegenschale explizit projizieren."
);
assert.ok(
    bridgeResult.exportData.projectionAtomRegister.length > 0,
    "Auch der Runtime-Adapterpfad muss ein Projektionsregister liefern."
);
assert.ok(
    bridgeResult.exportData.traceIndex,
    "Auch der Runtime-Adapterpfad muss einen Trace-Index liefern."
);
assert.ok(
    bridgeResult.exportData.outputContract,
    "Der neue Output-Contract soll am Adapterergebnis fuer Diagnose erhalten bleiben."
);

const groupedBridgeResult = await GenesisCore.solve("(x+1)=5", {
    runtimeEngine: "genesis_runtime"
});

assert.ok(!groupedBridgeResult.fehler);
assert.equal(groupedBridgeResult.schritte.length, 2);
assert.equal(groupedBridgeResult.schritte[0].strategie.family, "group_release");
assert.equal(groupedBridgeResult.schritte[1].strategie.family, "addition_release");
assert.equal(groupedBridgeResult.exportData.projectionRows.length, 3);
assert.ok(
    groupedBridgeResult.exportData.projectionRows[2].positionedAtoms.some((atom) => atom.projectionRole === "inverse_operator"),
    "Die Endzeile der Additionsauflösung muss den inversen Operator explizit tragen."
);

const exponentialExponentBridgeResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!exponentialExponentBridgeResult.fehler);
assert.deepEqual(
    exponentialExponentBridgeResult.schritte.map((step) => step.strategie.family),
    ["fraction_birth", "power_exponent_release"]
);
assert.ok(
    exponentialExponentBridgeResult.exportData.projectionRows.at(-1)?.positionedAtoms.some((atom) => atom.value === "log"),
    "Nach dem Exponentenabbau muss die Runtime-Bruecke die Logarithmus-Schalen auch im Adapterpfad sichtbar machen."
);

const exponentialBaseBridgeResult = await GenesisCore.solve("y=a*B^x", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "B"
});

assert.ok(!exponentialBaseBridgeResult.fehler);
assert.deepEqual(
    exponentialBaseBridgeResult.schritte.map((step) => step.strategie.family),
    ["fraction_birth", "power_base_release"]
);

const logarithmBridgeResult = await GenesisCore.solve("(log(2*x-1)+3)/a=2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(!logarithmBridgeResult.fehler);
assert.deepEqual(
    logarithmBridgeResult.schritte.map((step) => step.strategie.family),
    ["fraction_collapse", "group_release", "addition_release", "log_inverse", "subtraction_release", "fraction_birth"]
);
assert.ok(
    logarithmBridgeResult.exportData.projectionRows.some((row, index) => (
        index >= 4 && row?.positionedAtoms.some((atom) => atom.projectionRole === "power_exponent")
    )),
    "Nach der Logarithmus-Umkehr muss die Runtime-Bruecke den neuen Exponenten als eigene Potenzspur projizieren."
);

const invalidRuntimeResult = await GenesisCore.solve("x/2=5", {
    runtimeEngine: "future_engine"
});

assert.equal(
    invalidRuntimeResult.fehler,
    'Unbekannte runtimeEngine "future_engine". Erlaubt: genesis_runtime.'
);

console.log("GenesisRuntime-Bridge erfolgreich geprueft.");
