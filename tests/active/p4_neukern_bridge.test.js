import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { process as projectTheoryRows } from "../../core/P4_Projektion/index.js";

const bridgeTheoryRows = [
    {
        rowId: "theory-0",
        atoms: [
            { id: "a-0", value: "a", type: "VARIABLE", isVisible: true },
            { id: "eq-0", value: "=", type: "ANCHOR", isVisible: true },
            {
                id: "div-0",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "b-0", value: "b", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-0",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta-0", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            }
        ],
        strategy: null
    },
    {
        rowId: "theory-1",
        atoms: [
            { id: "a-1", value: "a", type: "VARIABLE", isVisible: true },
            { id: "eq-1", value: "=", type: "ANCHOR", isVisible: true },
            {
                id: "fn-1",
                type: "FUNCTION",
                name: "acos",
                isVisible: true,
                content: [
                    {
                        id: "div-1",
                        type: "DIVISION",
                        isVisible: true,
                        numerator: [
                            { id: "b-1", value: "b", type: "VARIABLE", isVisible: true }
                        ],
                        denominator: [
                            {
                                id: "fn-2",
                                type: "FUNCTION",
                                name: "cos",
                                isVisible: true,
                                content: [
                                    { id: "beta-1", value: "beta", type: "VARIABLE", isVisible: true }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        strategy: {
            family: "demo_bridge"
        }
    }
];

const classicProjection = projectTheoryRows(bridgeTheoryRows);
assert.equal(classicProjection.layoutPlan.mode, "two_pass_preflight");

const neukernProjection = projectTheoryRows(bridgeTheoryRows, { engine: "neukern_adapter" });
assert.equal(neukernProjection.layoutPlan.mode, "p4_neukern_legacy_adapter_v1");
assert.equal(neukernProjection.layoutPlan.source, "P4_Neukern");
assert.equal(neukernProjection.projectionRows.length, 2);
assert.equal(neukernProjection.projectionRows[0].rowId, "projection-0");
assert.equal(neukernProjection.projectionRows[1].sourceRowId, "theory-1");
assert.ok(
    neukernProjection.projectionRows[0].positionedAtoms.some((atom) => atom.projectionRole === "fraction_line"),
    "Der Adapterpfad muss explizite Bruchlinien aus dem Neukern sichtbar machen."
);
assert.ok(
    neukernProjection.projectionRows[1].positionedAtoms.some((atom) => atom.projectionRole === "function_name" && atom.value === "acos"),
    "Der Adapterpfad muss explizite Funktionsbausteine aus dem Neukern durchreichen."
);
assert.ok(
    Number.isInteger(neukernProjection.layoutPlan.anchorColumn),
    "Der Adapterpfad muss einen globalen Anker fuer bestehende Verbraucher exportieren."
);
assert.ok(neukernProjection.outputContract, "Der Adapterpfad soll den neuen Vertrag fuer Diagnose und Weiterbau mitliefern.");

const bridgeSolveResult = await GenesisCore.solve("x/2=5", {
    projectionEngine: "neukern_adapter"
});

assert.ok(!bridgeSolveResult.fehler, "Der opt-in Solve-Pfad ueber den Neukern darf keinen Fehler liefern.");
assert.equal(bridgeSolveResult.schritte.length, 1);
assert.equal(bridgeSolveResult.schritte[0].strategie.family, "fraction_collapse");
assert.equal(bridgeSolveResult.exportData.layoutPlan.mode, "p4_neukern_legacy_adapter_v1");
assert.equal(bridgeSolveResult.exportData.layoutPlan.source, "P4_Neukern");
assert.equal(bridgeSolveResult.exportData.theoryRows.length, 2);
assert.equal(bridgeSolveResult.exportData.projectionRows.length, 2);
assert.ok(
    bridgeSolveResult.exportData.projectionRows[0].positionedAtoms.some((atom) => atom.projectionRole === "fraction_line"),
    "Der Solve-Export ueber den Neukern muss den Startbruch explizit projizieren."
);
assert.ok(
    bridgeSolveResult.exportData.projectionAtomRegister.length > 0,
    "Auch im opt-in Pfad muss das Projektionsregister fuer Folgeverbraucher befuellt bleiben."
);
assert.ok(
    bridgeSolveResult.exportData.traceIndex,
    "Auch im opt-in Pfad muss der Solve-Lauf einen Trace-Index exportieren."
);
