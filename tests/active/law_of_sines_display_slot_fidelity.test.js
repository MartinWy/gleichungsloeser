import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildWorksheetDisplayModel } from "../../components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js";

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    targetVariable: "alpha",
    runtimeEngine: "genesis_runtime"
});

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach alpha darf nicht fehlschlagen.");

const projectionRows = result.exportData.outputContract.projectionRows;
const viewModel = buildWorksheetViewModel(result);
const displayModel = buildWorksheetDisplayModel(viewModel);
const startStep = viewModel.steps[0];
const transportStep = viewModel.steps[1];

function findProjectionAtom(row, predicate) {
    return row.projectionAtoms.find(predicate);
}

function findCell(step, atom, role = null) {
    return step.cells.find((cell) => (
        cell.sourceAtomId === atom?.sourceNodeId
        && (!role || cell.projectionRole === role)
    ));
}

function resolveDisplaySnapshot(cell, stepIndex) {
    const item = displayModel.items.find((candidate) => (
        candidate.cell.id === cell?.id
        && candidate.cell.stepIndex === stepIndex
    ));

    assert.ok(item, `Display-Item fuer ${cell?.id || "unbekannte Zelle"} fehlt.`);

    return {
        colStart: cell.colStart,
        colEnd: cell.colEnd,
        displayStartSlot: item.displayStartSlot,
        displayEndSlot: item.displayEndSlot,
        gridStart: item.gridColumnStartLine,
        gridEnd: item.gridColumnEndLine
    };
}

const startLeftAAtom = findProjectionAtom(
    projectionRows[0],
    (atom) => atom.side === "left" && atom.collectionRole === "numerator" && atom.value === "a"
);
const startRightBAtom = findProjectionAtom(
    projectionRows[0],
    (atom) => atom.side === "right" && atom.collectionRole === "numerator" && atom.value === "b"
);
const startRightFractionAtom = findProjectionAtom(
    projectionRows[0],
    (atom) => atom.side === "right" && atom.role === "fraction_line"
);
const startRightSinAtom = findProjectionAtom(
    projectionRows[0],
    (atom) => atom.side === "right" && atom.role === "function_name" && atom.value === "sin"
);
const startRightBetaAtom = findProjectionAtom(
    projectionRows[0],
    (atom) => atom.side === "right" && atom.role === "content" && atom.value === "beta"
);

const trackedAtoms = [
    [startLeftAAtom, "content", "linkes Zaehleratom a"],
    [startRightBAtom, "content", "rechtes Zaehleratom b"],
    [startRightFractionAtom, "fraction_line", "rechter Bruchstrich"],
    [startRightSinAtom, "function_name", "passiver Funktionsname sin"],
    [startRightBetaAtom, "content", "passives Inhaltsatom beta"]
];

for (const [sourceAtom, role, label] of trackedAtoms) {
    assert.ok(sourceAtom, `P4 muss ${label} in der Startzeile liefern.`);

    const transportedAtom = findProjectionAtom(
        projectionRows[1],
        (atom) => atom.sourceNodeId === sourceAtom.sourceNodeId && atom.role === sourceAtom.role
    );
    const startCell = findCell(startStep, sourceAtom, role);
    const transportCell = findCell(transportStep, transportedAtom, role);

    assert.ok(transportedAtom && startCell && transportCell, `${label} muss in P4 und Worksheet atomar weitergereicht werden.`);
    assert.deepEqual(
        [transportCell.colStart, transportCell.colEnd],
        [transportedAtom.colStart, transportedAtom.colEnd],
        `${label} muss im Worksheet exakt seine P4-Spanne tragen.`
    );
    assert.deepEqual(
        resolveDisplaySnapshot(transportCell, 1),
        resolveDisplaySnapshot(startCell, 0),
        `${label} darf zwischen Start und Transport weder semantische noch physische Spur verlieren.`
    );
}

console.log("Atomarer Sinussatz-Displaytransport erfolgreich geprueft.");
