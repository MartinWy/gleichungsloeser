import { splitRuntimeEquationSides } from '../P2_Strategy/equationSides.js';
import { cloneRuntimeValue } from '../runtimeClone.js';

const P4_THEORY_ROWS_VERSION = "p4_theory_rows_v1";

function buildTheoryRow(structure = [], rowIndex = 0, source = "initial", strategy = null) {
    const atoms = cloneRuntimeValue(structure);
    const sides = splitRuntimeEquationSides(atoms);

    return {
        contractVersion: P4_THEORY_ROWS_VERSION,
        rowId: `r${rowIndex}`,
        stepIndex: rowIndex,
        source,
        strategy: strategy ? cloneRuntimeValue(strategy) : null,
        atoms,
        anchorIndex: sides.anchorIndex,
        anchor: sides.anchor,
        left: sides.left,
        right: sides.right
    };
}

function buildTheoryRowsFromRuntime({ inputPhase, transformationPhase }) {
    const rows = [];
    const initialStructure = transformationPhase?.initialStructure || inputPhase?.structure || [];
    const history = Array.isArray(transformationPhase?.history)
        ? transformationPhase.history
        : [];

    rows.push(buildTheoryRow(initialStructure, 0, "initial", null));

    history.forEach((entry, index) => {
        rows.push(
            buildTheoryRow(
                entry?.structure || [],
                index + 1,
                "transformation",
                entry?.strategy || null
            )
        );
    });

    return rows;
}

export {
    P4_THEORY_ROWS_VERSION,
    buildTheoryRow,
    buildTheoryRowsFromRuntime
};
