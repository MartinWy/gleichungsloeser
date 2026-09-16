import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";

function cellRange(atom) {
    return {
        start: Number.isFinite(atom?.colStart) ? atom.colStart : atom?.col,
        end: Number.isFinite(atom?.colEnd) ? atom.colEnd : atom?.col
    };
}

function assertFunctionSlotsOutsideCompleteContent(row, functionSpan) {
    const functionName = row.projectionAtoms.find((atom) => (
        atom.shellId === functionSpan.shellId
        && atom.role === "function_name"
    ));
    const leftParen = row.projectionAtoms.find((atom) => (
        atom.shellId === functionSpan.shellId
        && atom.role === "function_left_paren"
    ));
    const rightParen = row.projectionAtoms.find((atom) => (
        atom.shellId === functionSpan.shellId
        && atom.role === "function_right_paren"
    ));
    const contentLeafIds = new Set(functionSpan.contentLeafIds || []);
    const contentAtoms = row.projectionAtoms.filter((atom) => contentLeafIds.has(atom.sourceNodeId));

    assert.ok(functionName && leftParen && rightParen, "Jede FUNCTION braucht Name sowie beide Klammer-Slots.");
    assert.ok(contentAtoms.length > 0, "Jede FUNCTION braucht einen vollstaendigen Argumentblock.");

    const nameRange = cellRange(functionName);
    const leftRange = cellRange(leftParen);
    const rightRange = cellRange(rightParen);
    const actualContentStart = Math.min(...contentAtoms.map((atom) => cellRange(atom).start));
    const actualContentEnd = Math.max(...contentAtoms.map((atom) => cellRange(atom).end));

    assert.equal(
        functionSpan.contentColStart,
        actualContentStart,
        "Die FUNCTION-contentRange muss am Anfang der vollstaendigen Kindzelle beginnen."
    );
    assert.equal(
        functionSpan.contentColEnd,
        actualContentEnd,
        "Die FUNCTION-contentRange muss am Ende der vollstaendigen Kindzelle enden."
    );
    assert.ok(nameRange.end < leftRange.start, "Der Funktionsname braucht eine eigene Zelle vor der linken Klammer.");
    assert.ok(leftRange.end < actualContentStart, "Die linke Funktionsklammer darf keine Argumentzelle ueberdecken.");
    assert.ok(rightRange.start > actualContentEnd, "Die rechte Funktionsklammer muss hinter dem fertigen Argument liegen.");
}

function stableProjectionKey(atom) {
    return [
        atom?.sourceNodeId || "",
        atom?.role || "",
        atom?.shellId || "",
        atom?.value ?? ""
    ].join("::");
}

const result = await runGenesisRuntime(
    "a/cos(alpha)=b/cos(beta)",
    { targetVariable: "beta" }
);
const finalRow = result.phases.projection.projectionRows.at(-1);
const previousRow = result.phases.projection.projectionRows.at(-2);
const inverseFunction = finalRow.shellSpans.find((shell) => (
    shell.side === "right"
    && shell.shellType === "FUNCTION"
    && finalRow.projectionAtoms.some((atom) => (
        atom.shellId === shell.shellId
        && atom.role === "function_name"
        && atom.value === "acos"
    ))
));

assert.ok(inverseFunction, "Die Schlusszeile muss die erzeugte inverse FUNCTION enthalten.");
assertFunctionSlotsOutsideCompleteContent(finalRow, inverseFunction);

const inverseFunctionName = finalRow.projectionAtoms.find((atom) => (
    atom.shellId === inverseFunction.shellId
    && atom.role === "function_name"
));
const inverseLeftParen = finalRow.projectionAtoms.find((atom) => (
    atom.shellId === inverseFunction.shellId
    && atom.role === "function_left_paren"
));
const futureShellStart = cellRange(inverseFunctionName).start;
const futureShellEnd = cellRange(inverseLeftParen).end;

result.phases.projection.projectionRows.slice(0, -1).forEach((earlierRow) => {
    const collision = earlierRow.projectionAtoms.find((atom) => {
        const range = cellRange(atom);
        return range.start <= futureShellEnd && range.end >= futureShellStart;
    });

    assert.equal(
        collision,
        undefined,
        `Die spaeteren FUNCTION-Spalten ${futureShellStart} bis ${futureShellEnd} muessen in ${earlierRow.rowId} bereits frei sein.`
    );
});

const finalRightAtomsByKey = new Map(
    finalRow.projectionAtoms
        .filter((atom) => atom.side === "right")
        .map((atom) => [stableProjectionKey(atom), atom])
);

previousRow.projectionAtoms
    .filter((atom) => atom.side === "right")
    .forEach((previousAtom) => {
        const finalAtom = finalRightAtomsByKey.get(stableProjectionKey(previousAtom));
        assert.ok(finalAtom, `Die vorhandene Zelle ${stableProjectionKey(previousAtom)} muss in der FUNCTION-Zeile erhalten bleiben.`);
        assert.deepEqual(
            [finalAtom.colStart, finalAtom.col, finalAtom.colEnd, finalAtom.localRow],
            [previousAtom.colStart, previousAtom.col, previousAtom.colEnd, previousAtom.localRow],
            `Die neue FUNCTION darf die vorhandene Zelle ${stableProjectionKey(previousAtom)} nicht verschieben.`
        );
    });

console.log("FUNCTION-Slots liegen disjunkt ausserhalb der vollstaendigen Kindzellen.");
