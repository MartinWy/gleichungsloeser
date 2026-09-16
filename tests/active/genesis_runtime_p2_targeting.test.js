import assert from "node:assert/strict";

import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import {
    P2_STRATEGY_CONTRACT_VERSION,
    runStrategyPhase
} from "../../core/GenesisRuntime/P2_Strategy/runStrategyPhase.js";

const implicitLinearInput = await runInputPhase({
    request: {
        equation: "2a=10"
    }
});
const implicitLinearSnapshot = structuredClone(implicitLinearInput.structure);
const implicitLinearStrategy = await runStrategyPhase({
    request: {
        requestedTargetVariable: null
    },
    inputPhase: implicitLinearInput
});
assert.equal(implicitLinearStrategy.targetVariable, "a");
assert.equal(implicitLinearStrategy.contractVersion, P2_STRATEGY_CONTRACT_VERSION);
assert.equal(implicitLinearStrategy.equationSideAnalysis.side, "left");
assert.equal(implicitLinearStrategy.activeSideNodes.length, 1);
assert.equal(implicitLinearStrategy.activeSideNodes[0].type, "MULTIPLICATION");
assert.equal(implicitLinearStrategy.activeSideNodes[0].factors[1].value, "a");
assert.equal(implicitLinearStrategy.nextDecision.family, "fraction_birth");
assert.equal(implicitLinearStrategy.nextDecision.sourceShellId, implicitLinearStrategy.activeSideNodes[0].id);
assert.equal(implicitLinearStrategy.nextDecision.targetRole, "factors");
assert.equal(implicitLinearStrategy.nextDecision.passiveRole, "factors");
assert.deepEqual(implicitLinearInput.structure, implicitLinearSnapshot, "P2 darf die P1-Struktur nicht veraendern.");

const explicitTargetInput = await runInputPhase({
    request: {
        equation: "sin(x)/(2a)=5"
    }
});
const explicitTargetStrategy = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: explicitTargetInput
});
assert.equal(explicitTargetStrategy.targetVariable, "x");
assert.equal(explicitTargetStrategy.equationSideAnalysis.side, "left");
assert.equal(explicitTargetStrategy.variableNames.includes("a"), true);
assert.equal(explicitTargetStrategy.variableNames.includes("x"), true);
assert.equal(explicitTargetStrategy.nextDecision.family, "fraction_collapse");

const exponentTargetInput = await runInputPhase({
    request: {
        equation: "y=a*B^x"
    }
});
const exponentTargetStrategy = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: exponentTargetInput
});
assert.equal(exponentTargetStrategy.targetVariable, "x");
assert.equal(exponentTargetStrategy.equationSideAnalysis.side, "right");
assert.equal(exponentTargetStrategy.variableNames.includes("x"), true);
assert.equal(exponentTargetStrategy.nextDecision.family, "fraction_birth");
assert.equal(exponentTargetStrategy.nextDecision.targetRole, "factors");

const ambiguousInput = await runInputPhase({
    request: {
        equation: "x+a=5"
    }
});
await assert.rejects(
    () => runStrategyPhase({
        request: {
            requestedTargetVariable: null
        },
        inputPhase: ambiguousInput
    }),
    /targetVariable/
);

const missingTargetInput = await runInputPhase({
    request: {
        equation: "m+2=5"
    }
});
await assert.rejects(
    () => runStrategyPhase({
        request: {
            requestedTargetVariable: "x"
        },
        inputPhase: missingTargetInput
    }),
    /kommt in der Gleichung nicht vor/
);

const bothSidesInput = await runInputPhase({
    request: {
        equation: "x+1=x+2"
    }
});
await assert.rejects(
    () => runStrategyPhase({
        request: {
            requestedTargetVariable: "x"
        },
        inputPhase: bothSidesInput
    }),
    /genau einmal vorkommt/
);

const isolatedInput = await runInputPhase({
    request: {
        equation: "x=5"
    }
});
const isolatedStrategy = await runStrategyPhase({
    request: {
        requestedTargetVariable: "x"
    },
    inputPhase: isolatedInput
});
assert.equal(isolatedStrategy.nextDecision, null);

await assert.rejects(
    () => runStrategyPhase({
        request: {
            requestedTargetVariable: "x"
        },
        inputPhase: {
            structure: [
                {
                    id: "unsupported-collection",
                    type: "COLLECTION",
                    isVisible: true,
                    content: [{ id: "x", type: "VARIABLE", value: "x", isVisible: true }]
                },
                { id: "eq", type: "ANCHOR", value: "=", isVisible: true },
                { id: "five", type: "NUMBER", value: "5", isVisible: true }
            ]
        }
    }),
    /UNSUPPORTED_STRATEGY_SITUATION/,
    "Eine nicht isolierte Zielspur ohne Fallregel darf nicht als erfolgreicher Endzustand gelten."
);

console.log("GenesisRuntime-P2-Targeting erfolgreich geprueft.");
