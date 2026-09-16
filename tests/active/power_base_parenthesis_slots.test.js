import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function cellRange(value = null) {
    return {
        start: value?.colStart ?? value?.col,
        end: value?.colEnd ?? value?.col
    };
}

function powerSlots(row, shellId) {
    return (row?.projectionAtoms || []).filter((atom) => (
        atom?.shellId === shellId
        && ["power_left_paren", "power_right_paren"].includes(atom?.role)
    ));
}

function assertPowerSlotOrder(row, powerSpan) {
    const slots = powerSlots(row, powerSpan.shellId);
    const left = slots.find((slot) => slot.role === "power_left_paren");
    const right = slots.find((slot) => slot.role === "power_right_paren");
    const baseRange = powerSpan.collectionRanges?.content;
    const exponentRange = powerSpan.collectionRanges?.exponentNodes;

    assert.ok(left && right, `POWER ${powerSpan.shellId} braucht immer beide Basis-Klammer-Slots.`);
    assert.equal(
        left.isVisible,
        right.isVisible,
        `Beide Basis-Klammern von ${powerSpan.shellId} muessen dieselbe Core-Sichtbarkeit tragen.`
    );
    assert.ok(baseRange && exponentRange, `POWER ${powerSpan.shellId} braucht getrennte Basis- und Exponentenbaender.`);
    assert.ok(
        cellRange(left).end < baseRange.colStart,
        `Die linke POWER-Klammer von ${powerSpan.shellId} muss vor dem vollstaendigen Basisblock liegen.`
    );
    assert.ok(
        cellRange(right).start > baseRange.colEnd,
        `Die rechte POWER-Klammer von ${powerSpan.shellId} muss hinter dem vollstaendigen Basisblock liegen.`
    );
    assert.ok(
        cellRange(right).end < exponentRange.colStart,
        `Der Exponent von ${powerSpan.shellId} muss ausserhalb der rechten Basis-Klammer liegen.`
    );

    return { left, right };
}

const result = await GenesisCore.solve("sqrt(sqrt(x-2))=3", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});
assert.ok(!result?.fehler, result?.fehler || "Der verschachtelte Wurzellauf muss gueltig sein.");

const rows = result.exportData.outputContract.projectionRows;
const firstPowerRow = rows.find((row) => (
    row.shellSpans.filter((shell) => shell.shellType === "POWER").length === 1
));
const nestedPowerRow = rows.find((row) => (
    row.shellSpans.filter((shell) => shell.shellType === "POWER").length === 2
));

assert.ok(firstPowerRow, "Der Lauf braucht eine Zeile mit einfacher Potenz.");
assert.ok(nestedPowerRow, "Der Lauf braucht eine Zeile mit verschachtelter Potenz.");

const simplePower = firstPowerRow.shellSpans.find((shell) => shell.shellType === "POWER");
const simpleSlots = assertPowerSlotOrder(firstPowerRow, simplePower);

assert.equal(simpleSlots.left.isVisible, false, "Eine atomare Potenzbasis klappt ihre Pflichtklammern explizit ein.");
assert.equal(simpleSlots.right.isVisible, false, "Eine atomare Potenzbasis klappt beide Pflichtklammern gemeinsam ein.");
assert.equal(
    simplePower.colStart,
    simplePower.collectionRanges.content.colStart,
    "Ein eingeklappter linker POWER-Slot darf die sichtbare containerRange nicht nach links erweitern."
);
assert.ok(
    simpleSlots.left.col < simplePower.colStart,
    "Der eingeklappte linke POWER-Slot muss ausserhalb der sichtbaren containerRange nachweisbar bleiben."
);

const nestedPowers = nestedPowerRow.shellSpans.filter((shell) => shell.shellType === "POWER");
const nestedSlotPairs = nestedPowers.map((power) => ({
    power,
    slots: assertPowerSlotOrder(nestedPowerRow, power)
}));
const visiblePairs = nestedSlotPairs.filter(({ slots }) => slots.left.isVisible === true);
const hiddenPairs = nestedSlotPairs.filter(({ slots }) => slots.left.isVisible === false);

assert.equal(visiblePairs.length, 1, "Genau die aeussere POWER muss ihre verschachtelte Potenzbasis sichtbar klammern.");
assert.equal(hiddenPairs.length, 1, "Die innere POWER mit atomarer Basis behaelt eingeklappte Pflichtslots.");

const visibleOuter = visiblePairs[0];
const hiddenInner = hiddenPairs[0];
assert.ok(
    visibleOuter.power.collectionRanges.content.colStart <= hiddenInner.power.colStart
        && visibleOuter.power.collectionRanges.content.colEnd >= hiddenInner.power.colEnd,
    "Die sichtbaren aeusseren Klammern muessen den vollstaendigen inneren POWER-Block umschliessen."
);
assert.deepEqual(
    [visibleOuter.slots.left.rowSpanStart, visibleOuter.slots.left.rowSpanEnd],
    [hiddenInner.power.localTopRow, hiddenInner.power.localBottomRow],
    "Die linke aeussere Klammer muss vertikal ueber den vollstaendigen inneren POWER-Block spannen."
);
assert.deepEqual(
    [visibleOuter.slots.right.rowSpanStart, visibleOuter.slots.right.rowSpanEnd],
    [hiddenInner.power.localTopRow, hiddenInner.power.localBottomRow],
    "Die rechte aeussere Klammer muss den inneren Exponenten funktional einschliessen."
);

const viewModel = buildWorksheetViewModel(result);
const nestedStep = viewModel.steps.find((step) => step.rowId === nestedPowerRow.rowId);
const visibleWorksheetParens = (nestedStep?.cells || []).filter((cell) => (
    ["power_left", "power_right"].includes(cell?.projectionRole)
));

assert.equal(visibleWorksheetParens.length, 2, "Das ViewModel darf nur die zwei vom Core sichtbar gesetzten POWER-Klammern abbilden.");
visibleWorksheetParens.forEach((cell) => {
    assert.deepEqual(
        [cell.rowSpanStart, cell.rowSpanEnd],
        [hiddenInner.power.localTopRow, hiddenInner.power.localBottomRow],
        "Das ViewModel muss die Core-Zeilenspanne der sichtbaren POWER-Klammer unveraendert uebernehmen."
    );
});

const displayModel = buildWorksheetDisplayModel(viewModel);
[hiddenInner.slots.left, hiddenInner.slots.right].forEach((slot) => {
    const columnIsUsedVisibly = viewModel.steps.some((step) => (
        (step.cells || []).some((cell) => cell.colStart <= slot.col && cell.colEnd >= slot.col)
    ));
    const width = displayModel.displayLayout.semanticLayout.widths[slot.col];
    if (columnIsUsedVisibly) {
        assert.ok(width > 0, `Eine anderweitig sichtbar belegte Spalte ${slot.col} darf nicht eingeklappt werden.`);
    } else {
        assert.equal(width, 0, `Eine global ausschliesslich unsichtbare POWER-Slotspalte ${slot.col} muss Breite 0 haben.`);
    }
});

const latex = buildLatexDocument({
    equation: result.eingabe,
    targetVariable: result.targetVariable,
    viewModel,
    shellColors: false,
    shellColorPolicy: null
});
const allVisiblePowerParens = viewModel.steps.flatMap((step) => (
    (step.cells || []).filter((cell) => ["power_left", "power_right"].includes(cell?.projectionRole))
));
const stretchedDelimiterCommands = String(latex)
    .split("\n")
    .filter((line) => line.includes(".. controls"));

assert.equal(
    stretchedDelimiterCommands.length,
    allVisiblePowerParens.length,
    "Jede sichtbare POWER-Klammerzelle muss genau ein ueber ihre Core-Zeilenspanne gestrecktes Renderprimitiv erzeugen."
);
assert.doesNotMatch(
    latex,
    /\{\$[()]\$\};/u,
    "Sichtbare POWER-Klammern duerfen nicht als ungestreckte Textzeichen auf der Achsenzeile ausgegeben werden."
);

console.log("POWER-Basis-Klammern sind verpflichtende Core-Slots mit struktureller Sichtbarkeit.");
