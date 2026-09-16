import { process as projectTheoryRows } from './P4_Projektion/index.js';
import { clone } from './clone.js';
import { walkAtoms } from './atomTraversal.js';

function buildTheoryRows(equation, initialStruktur, history) {
    return [
        {
            rowId: 'theory-0',
            atoms: clone(initialStruktur),
            strategy: null,
            meta: {
                kind: 'initial',
                eingabe: equation
            }
        },
        ...history.map((schritt, index) => ({
            rowId: `theory-${index + 1}`,
            atoms: clone(schritt.struktur),
            strategy: clone(schritt.strategie),
            meta: {
                kind: 'step',
                stepIndex: index + 1
            }
        }))
    ];
}

function buildAtomRegister(theoryRows) {
    const atomRegister = [];
    const seenIds = new Set();

    theoryRows.forEach((row) => {
        walkAtoms(row.atoms, (atom) => {
            if (!atom || !atom.id || seenIds.has(atom.id)) {
                return;
            }

            seenIds.add(atom.id);
            atomRegister.push(clone(atom));
        });
    });

    return atomRegister;
}

function buildProjectionAtomRegister(projectionRows) {
    const atomRegister = [];
    const seenIds = new Set();

    projectionRows.forEach((row) => {
        (row.positionedAtoms || []).forEach((atom) => {
            if (!atom || !atom.id || seenIds.has(atom.id)) {
                return;
            }

            seenIds.add(atom.id);
            atomRegister.push(clone(atom));
        });
    });

    return atomRegister;
}

function buildTraceIndex(theoryRows, projectionRows) {
    const traceIndex = {};

    function ensureTrace(atom) {
        if (!atom || !atom.id) {
            return null;
        }

        if (!traceIndex[atom.id]) {
            traceIndex[atom.id] = {
                id: atom.id,
                type: atom.type || null,
                value: atom.value ?? null,
                theory: [],
                projection: []
            };
        }

        return traceIndex[atom.id];
    }

    theoryRows.forEach((row) => {
        walkAtoms(row.atoms, (atom, meta) => {
            const entry = ensureTrace(atom);
            if (!entry) {
                return;
            }

            entry.theory.push({
                rowId: row.rowId,
                parentId: meta.parentId,
                containerKey: meta.containerKey,
                path: meta.path,
                isVisible: atom.isVisible !== false,
                isBefreit: atom.isBefreit === true,
                isGenerated: atom.isGenerated === true
            });
        });
    });

    projectionRows.forEach((row) => {
        (row.positionedAtoms || []).forEach((atom, order) => {
            const projectionRef = {
                rowId: row.rowId,
                sourceRowId: row.sourceRowId,
                row: atom.row ?? null,
                absoluteRow: atom.absoluteRow ?? atom.row ?? null,
                localRow: atom.localRow ?? null,
                stackedRow: atom.stackedRow ?? null,
                col: atom.col ?? null,
                order,
                projectionId: atom.id || null,
                isVisible: atom.isVisible !== false,
                visualMode: atom.visualMode || null,
                projectionRole: atom.projectionRole || null,
                sourceShellId: atom.sourceShellId || null,
                sourceAtomId: atom.sourceAtomId || null,
                parentType: atom.parentType || null,
                position: atom.position || null,
                layoutMode: atom.layoutMode || null
            };

            const entry = ensureTrace(atom);
            if (entry) {
                entry.projection.push(projectionRef);
            }

            if (atom.sourceAtomId && atom.sourceAtomId !== atom.id) {
                const sourceEntry = ensureTrace({
                    id: atom.sourceAtomId,
                    type: atom.type,
                    value: atom.value
                });

                if (sourceEntry) {
                    sourceEntry.projection.push(projectionRef);
                }
            }
        });
    });

    return traceIndex;
}

function buildExport(equation, targetVariable, theoryRows, projectionRows, layoutPlan) {
    return {
        eingabe: equation,
        targetVariable,
        atomRegister: buildAtomRegister(theoryRows),
        projectionAtomRegister: buildProjectionAtomRegister(projectionRows),
        traceIndex: buildTraceIndex(theoryRows, projectionRows),
        theoryRows: clone(theoryRows),
        projectionRows: clone(projectionRows),
        layoutPlan: clone(layoutPlan),
        exportProfiles: {
            film: {
                focus: 'animation_ready_projection',
                usesSameAtomIds: true
            },
            arbeitsblatt: {
                focus: 'selective_step_visibility',
                usesSameAtomIds: true
            },
            diagnose: {
                focus: 'full_core_trace',
                usesSameAtomIds: true
            }
        }
    };
}

function buildSolveProjectionOutput({
    equation,
    targetVariable,
    initialStruktur,
    history,
    currentStruktur,
    projectionEngine
}) {
    const theoryRows = buildTheoryRows(equation, initialStruktur, history);
    const { layoutPlan, projectionRows } = projectTheoryRows(theoryRows, {
        engine: projectionEngine
    });
    const projectedSteps = projectionRows.slice(1).map((row, index) => ({
        strategie: clone(history[index].strategie),
        struktur: clone(row.positionedAtoms)
    }));
    const finaleStruktur = projectionRows.length > 0
        ? clone(projectionRows[projectionRows.length - 1].positionedAtoms)
        : clone(currentStruktur);

    return {
        theoryRows,
        projectionRows,
        layoutPlan,
        projectedSteps,
        finaleStruktur,
        exportData: buildExport(equation, targetVariable, theoryRows, projectionRows, layoutPlan)
    };
}

export {
    buildExport,
    buildSolveProjectionOutput,
    buildTheoryRows
};
