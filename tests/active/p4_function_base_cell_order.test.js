import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";

async function solve(equation) {
    const result = await GenesisCore.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: "x"
    });

    assert.ok(!result?.fehler, result?.fehler || `Solve-State fuer ${equation} fehlt.`);
    return result;
}

function atomRole(atom) {
    return String(atom?.role || atom?.projectionRole || "").toLowerCase();
}

function findFunctionAtom(row, acceptedRoles) {
    return (row?.projectionAtoms || []).find((atom) => acceptedRoles.includes(atomRole(atom))) || null;
}

function assertBasedFunctionOrder(row) {
    const functionSpan = (row?.shellSpans || []).find((span) => (
        span?.shellType === "FUNCTION"
        && span?.collectionRanges?.baseContent
        && span?.collectionRanges?.content
    ));

    assert.ok(functionSpan, `Zeile ${row?.rowId} braucht eine FUNCTION mit Basis- und Argumentblock.`);

    const name = findFunctionAtom(row, ["function_name"]);
    const leftParen = findFunctionAtom(row, ["function_left", "function_left_paren"]);
    const rightParen = findFunctionAtom(row, ["function_right", "function_right_paren"]);
    const baseRange = functionSpan.collectionRanges.baseContent;
    const argumentRange = functionSpan.collectionRanges.content;

    assert.ok(name && leftParen && rightParen, "Die FUNCTION-Huelle muss Name und beide Klammern atomar ausgeben.");
    assert.ok(
        name.colEnd < baseRange.colStart,
        "Der Funktionsname muss vollstaendig vor dem fertigen Basisblock liegen."
    );
    assert.ok(
        baseRange.colEnd < leftParen.colStart,
        "Der vollstaendige Basisblock muss vor der linken Argumentklammer liegen."
    );
    assert.ok(
        leftParen.colEnd < argumentRange.colStart,
        "Die linke Funktionsklammer muss vor dem vollstaendigen Argumentblock liegen."
    );
    assert.ok(
        argumentRange.colEnd < rightParen.colStart,
        "Die rechte Funktionsklammer muss hinter dem vollstaendigen Argumentblock liegen."
    );
}

const numericBaseResult = await solve("a-1=2*3^(x^2-2)");
const numericBaseRows = numericBaseResult.exportData.outputContract.projectionRows.filter((row) => (
    (row?.shellSpans || []).some((span) => span?.shellType === "FUNCTION" && span?.collectionRanges?.baseContent)
));

assert.ok(numericBaseRows.length > 0, "Der Zahlenbasisfall muss mindestens eine FUNCTION-Projektionszeile besitzen.");
numericBaseRows.forEach(assertBasedFunctionOrder);

const structuredBaseResult = await solve("y=(a+1)^x");
const structuredBaseRows = structuredBaseResult.exportData.outputContract.projectionRows.filter((row) => (
    (row?.shellSpans || []).some((span) => span?.shellType === "FUNCTION" && span?.collectionRanges?.baseContent)
));

assert.ok(structuredBaseRows.length > 0, "Der mehrzellige Basisfall muss mindestens eine FUNCTION-Projektionszeile besitzen.");
structuredBaseRows.forEach(assertBasedFunctionOrder);

console.log("P4 ordnet jeden vollstaendigen Funktionsbasisblock vor der linken Argumentklammer ein.");
