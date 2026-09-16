import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function visibleRoots(nodes = []) {
    return nodes.filter((node) => node?.isVisible !== false);
}

for (const targetVariable of ["v", "w"]) {
    const result = await runGenesisRuntime("u+v+w=n", { targetVariable });
    const decision = result?.phases?.transformations?.[0]?.appliedDecision
        || result?.history?.[0]?.decision
        || result?.phases?.projection?.theoryRows?.[1]?.strategy;
    const bindingRow = result?.phases?.projection?.theoryRows?.[1];
    const oppositeRoots = visibleRoots(bindingRow?.right || []);
    const subtraction = oppositeRoots.find((node) => node?.type === "SUBTRACTION");

    assert.equal(decision?.family, "addition_release");
    assert.ok(subtraction, "Die Gegenseite muss genau eine erzeugte SUBTRACTION tragen.");
    assert.equal(
        visibleRoots(subtraction.subtrahend || []).length,
        1,
        "Mehrere passive Summanden muessen als genau ein Subtrahend gebunden sein."
    );

    const group = visibleRoots(subtraction.subtrahend || [])[0];
    const passiveAddition = visibleRoots(group?.content || [])[0];

    assert.equal(group?.type, "GROUP", "Der zusammengesetzte Subtrahend braucht eine Core-GROUP.");
    assert.equal(passiveAddition?.type, "ADDITION", "Die GROUP muss die vollstaendige passive Summe enthalten.");
    assert.equal(passiveAddition?.terms?.length, 2);
    assert.equal(passiveAddition?.operators?.length, 1);
    assert.deepEqual(
        passiveAddition.terms.map((term) => term?.value),
        targetVariable === "v" ? ["u", "w"] : ["u", "v"],
        "Reihenfolge und Identitaet der passiven Summanden muessen erhalten bleiben."
    );

    const bindingProjectionRow = result?.phases?.projection?.projectionRows?.[1];
    const groupPrimitives = (bindingProjectionRow?.projectionAtoms || []).filter((atom) => (
        atom?.sourceNodeId === group.id
        && ["group_left_paren", "group_right_paren"].includes(atom?.role)
    ));

    assert.equal(
        groupPrimitives.length,
        2,
        "P4 muss die in P3 geborene Bindung als zwei eigene Klammerprimitive projizieren."
    );

    assert.deepEqual(
        result.phases.transformation.history.map((entry) => entry.strategy.family),
        ["addition_release", "subtracted_sum_release"],
        "Die notwendige Bindung und ihre spaetere sichtbare Aufloesung muessen zwei getrennte Umformungsschritte bleiben."
    );
}

console.log("Mehrsummanden werden zuerst gebunden und danach in einem eigenen Schritt aufgeloest.");
