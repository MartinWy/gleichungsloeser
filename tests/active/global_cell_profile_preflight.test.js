import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function rangeOf(value) {
    return {
        start: value?.rawColStart ?? value?.rawCol,
        center: value?.rawCol ?? null,
        end: value?.rawColEnd ?? value?.rawCol
    };
}

function findProfileRow(profile, rowId) {
    const row = (profile?.rows || []).find((candidate) => candidate.rowId === rowId);
    assert.ok(row, `Im globalen Zellprofil fehlt ${rowId}.`);
    return row;
}

function assertRangeCovered(ranges, expectedStart, expectedEnd, message) {
    assert.ok(
        (ranges || []).some((range) => range.rawColStart <= expectedStart && range.rawColEnd >= expectedEnd),
        message
    );
}

async function assertCompleteEarlyProfile(equation, targetVariable) {
    const result = await runGenesisRuntime(equation, { targetVariable });
    const projection = result.phases.projection;
    const profile = projection.semanticRaster?.cellProfile;

    assert.ok(profile, "Der P4-Pre-flight muss vor Blocks und Writer ein globales Zellprofil liefern.");
    assert.equal(profile.contractVersion, "p4_global_cell_profile_v1");

    projection.outputContract.projectionRows.forEach((row) => {
        const profileRow = findProfileRow(profile, row.rowId);

        row.projectionAtoms
            .filter((atom) => atom.side === "left" || atom.side === "right")
            .forEach((atom) => {
                const claims = atom.kind === "content"
                    ? profileRow.placements?.[atom.side]
                    : profileRow.shellSlots?.[atom.side];
                const claim = (claims || []).find((candidate) => (
                    atom.kind === "content"
                        ? candidate.nodeId === atom.sourceNodeId
                        : candidate.shellId === atom.shellId && candidate.slotName === atom.slotName
                ));

                assert.ok(
                    claim,
                    `Die sichtbare Zelle ${row.rowId}::${atom.role} muss bereits im Pre-flight-Profil stehen.`
                );
                assert.deepEqual(
                    rangeOf(atom),
                    rangeOf(claim),
                    `Nach dem Pre-flight darf ${row.rowId}::${atom.role} horizontal nicht mehr veraendert werden.`
                );
            });
    });

    return result;
}

await assertCompleteEarlyProfile("sin(x)=1", "x");
await assertCompleteEarlyProfile("sqrt(x)=5", "x");
const cosineResult = await assertCompleteEarlyProfile("a/cos(alpha)=b/cos(beta)", "beta");
const cosineProjection = cosineResult.phases.projection;
const cosineProfile = cosineProjection.semanticRaster.cellProfile;
const finalRow = cosineProjection.outputContract.projectionRows.at(-1);
const futureName = finalRow.projectionAtoms.find((atom) => (
    atom.side === "right"
    && atom.role === "function_name"
    && atom.value === "acos"
));
const futureLeftParen = finalRow.projectionAtoms.find((atom) => (
    atom.side === "right"
    && atom.shellId === futureName?.shellId
    && atom.role === "function_left_paren"
));

assert.ok(futureName && futureLeftParen, "Die spaetere inverse FUNCTION braucht Name und linke Klammer.");

const futureStart = rangeOf(futureName).start;
const futureEnd = rangeOf(futureLeftParen).end;
cosineProjection.outputContract.projectionRows.slice(0, -1).forEach((earlierRow) => {
    const profileRow = findProfileRow(cosineProfile, earlierRow.rowId);
    assertRangeCovered(
        profileRow.reservedRanges?.right,
        futureStart,
        futureEnd,
        `Die spaeteren FUNCTION-Zellen ${futureStart} bis ${futureEnd} muessen in ${earlierRow.rowId} im fruehen Profil frei reserviert sein.`
    );
});

console.log("Der P4-Pre-flight besitzt die vollstaendige horizontale Zellwahrheit vor Blocks und Writer.");
