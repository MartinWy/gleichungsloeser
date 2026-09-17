import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";
import { normalizeGenesisRuntimeRequest } from "../../core/GenesisRuntime/runtimeRequest.js";
import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import { runStrategyPhase } from "../../core/GenesisRuntime/P2_Strategy/runStrategyPhase.js";
import { runTransformationPhase } from "../../core/GenesisRuntime/P3_Transformation/runTransformationPhase.js";

function visibleRoots(nodes = []) {
    return (nodes || []).filter((node) => node?.isVisible !== false);
}

function findFractionBirthRow(result) {
    return result.phases.projection.theoryRows.find((row) => (
        row?.strategy?.family === "fraction_birth"
    )) || null;
}

function findInitialDivision(result, side) {
    const equationSides = result.phases.strategy.equationSides;
    const nodes = side === "left" ? equationSides.left : equationSides.right;
    return (nodes || []).find((node) => node?.type === "DIVISION") || null;
}

function collectVisibleLeafIds(nodes = []) {
    const ids = [];
    const childKeys = [
        "content",
        "baseContent",
        "degreeNodes",
        "exponentNodes",
        "numerator",
        "denominator",
        "factors",
        "operators",
        "terms",
        "minuend",
        "operator",
        "subtrahend"
    ];

    for (const node of nodes || []) {
        if (!node || node.isVisible === false) {
            continue;
        }

        const childCollections = childKeys
            .map((key) => Array.isArray(node[key]) ? node[key] : (node[key] ? [node[key]] : []))
            .filter((children) => children.length > 0);

        if (childCollections.length === 0) {
            ids.push(node.id);
        } else {
            childCollections.forEach((children) => ids.push(...collectVisibleLeafIds(children)));
        }
    }

    return [...new Set(ids)];
}

function assertDenominatorExtension(result, side, expectedFactorOrder) {
    const row = findFractionBirthRow(result);
    assert.ok(row, "Der Lauf braucht eine sichtbare fraction_birth-Theoriezeile.");
    assert.equal(row.strategy.inverseMode, "extend_existing_denominator");
    assert.equal(row.strategy.action, "MOVE_PASSIVE_EXPRESSION_TO_EXISTING_DENOMINATOR");

    const sourceDivision = findInitialDivision(result, side);
    assert.ok(sourceDivision, "Die Ausgangsseite muss genau den bestehenden Bruch enthalten.");
    assert.equal(row.strategy.oppositeDivisionId, sourceDivision.id);

    const sideNodes = side === "left" ? row.left : row.right;
    const generatedDivision = visibleRoots(sideNodes).find((node) => (
        node?.type === "DIVISION"
        && node?.generatedByAction === "MOVE_PASSIVE_EXPRESSION_TO_EXISTING_DENOMINATOR"
    ));

    assert.ok(generatedDivision, "P3 muss genau eine neue sichtbare DIVISION mit erweitertem Nenner erzeugen.");
    assert.equal(generatedDivision.extendedFromDivisionId, sourceDivision.id);
    assert.equal(visibleRoots(generatedDivision.numerator).length, 1);
    assert.notEqual(
        visibleRoots(generatedDivision.numerator)[0]?.type,
        "DIVISION",
        "Der bestehende Bruch darf nicht als Zaehler eines neuen Doppelbruchs enden."
    );
    assert.equal(
        visibleRoots(generatedDivision.numerator)[0]?.id,
        visibleRoots(sourceDivision.numerator)[0]?.id,
        "Die vorhandene Zaehlerwurzel muss ihre ID behalten."
    );

    const denominatorRoots = visibleRoots(generatedDivision.denominator);
    assert.equal(denominatorRoots.length, 1);
    assert.equal(denominatorRoots[0]?.type, "MULTIPLICATION");
    assert.equal(denominatorRoots[0]?.operators?.length, 1);
    assert.equal(denominatorRoots[0]?.operators?.[0]?.value, "*");

    const factorRoles = denominatorRoots[0].factors.map((factor) => (
        factor?.value === "d" ? "new" : factor?.id === visibleRoots(sourceDivision.denominator)[0]?.id ? "old" : "unknown"
    ));
    assert.deepEqual(factorRoles, expectedFactorOrder);

    const projectionRow = result.phases.projection.projectionRows.find((candidate) => (
        candidate?.rowId === row.rowId
    ));
    const newFactor = denominatorRoots[0].factors.find((factor) => factor?.value === "d");
    const oldDenominator = visibleRoots(sourceDivision.denominator)[0];
    const newFactorCell = projectionRow?.projectionAtoms.find((atom) => (
        atom?.side === side && atom?.sourceNodeId === newFactor?.id
    ));
    const oldDenominatorSpan = projectionRow?.shellSpans.find((span) => (
        span?.side === side && span?.shellId === oldDenominator?.id
    ));

    assert.ok(newFactorCell, "P4 muss den neuen Nennerfaktor atomar projizieren.");
    assert.ok(oldDenominatorSpan, "P4 muss den bestehenden Nenner als unveraenderte Schale projizieren.");

    const stableLeafIds = collectVisibleLeafIds([
        ...visibleRoots(sourceDivision.numerator),
        ...visibleRoots(sourceDivision.denominator)
    ]);
    for (const leafId of stableLeafIds) {
        const positions = result.phases.projection.projectionRows
            .flatMap((candidate) => candidate.projectionAtoms || [])
            .filter((atom) => atom?.side === side && atom?.sourceNodeId === leafId)
            .map((atom) => `${atom.colStart}:${atom.col}:${atom.colEnd}`);

        assert.ok(positions.length >= 2, `Die vorhandene Blattspur ${leafId} muss in beiden Bruchzeilen vorkommen.`);
        assert.equal(
            new Set(positions).size,
            1,
            `Die Nennererweiterung darf die vorhandene Blattspur ${leafId} nicht verschieben.`
        );
    }

    if (side === "left") {
        assert.ok(
            newFactorCell.colEnd < oldDenominatorSpan.colStart,
            "Links muss der neue Nennerfaktor ausserhalb vor dem bestehenden Nenner liegen."
        );
    } else {
        assert.ok(
            oldDenominatorSpan.colEnd < newFactorCell.colStart,
            "Rechts muss der neue Nennerfaktor ausserhalb hinter dem bestehenden Nenner liegen."
        );
    }
}

const generatedOnLeft = await runGenesisRuntime(
    "(a-2)/(b+4)=d*x",
    { targetVariable: "x" }
);
assertDenominatorExtension(generatedOnLeft, "left", ["new", "old"]);

const generatedOnRight = await runGenesisRuntime(
    "d*x=(a-2)/(b+4)",
    { targetVariable: "x" }
);
assertDenominatorExtension(generatedOnRight, "right", ["old", "new"]);

const reportedNestedPowerExample = await runGenesisRuntime(
    "(a-2)/(b+4)=d*e^(x^2+5)",
    { targetVariable: "x" }
);
assertDenominatorExtension(reportedNestedPowerExample, "left", ["new", "old"]);

const reciprocalFactor = await runGenesisRuntime(
    "x*(a/b)=z",
    { targetVariable: "x" }
);
assert.equal(
    findFractionBirthRow(reciprocalFactor)?.strategy?.inverseMode,
    "reciprocal_factor",
    "Ein bewegter Bruchfaktor muss weiterhin vorrangig zum Kehrbruch werden."
);

const ordinaryDivision = await runGenesisRuntime(
    "d*x=z",
    { targetVariable: "x" }
);
assert.equal(
    findFractionBirthRow(ordinaryDivision)?.strategy?.inverseMode,
    "denominator_division",
    "Ohne bestehenden Gegenseitenbruch bleibt die normale Bruchgeburt erhalten."
);

const strictRequest = normalizeGenesisRuntimeRequest(
    "(a-2)/(b+4)=d*x",
    { targetVariable: "x" }
);
const strictInput = await runInputPhase({ request: strictRequest });
const strictStrategy = await runStrategyPhase({
    request: strictRequest,
    inputPhase: strictInput
});

await assert.rejects(
    () => runTransformationPhase({
        request: strictRequest,
        inputPhase: strictInput,
        strategyPhase: {
            ...strictStrategy,
            nextDecision: {
                ...strictStrategy.nextDecision,
                oppositeDivisionId: "missing-division"
            }
        }
    }),
    /bezeichnete Gegenseiten-DIVISION missing-division nicht verifizieren/,
    "P3 darf eine fehlende von P2 bezeichnete Bruchschale weder suchen noch durch einen Doppelbruch ersetzen."
);

console.log("Bestehender Bruch: Nennererweiterung ohne Doppelbruch erfolgreich geprueft.");
