import { collectChildCollections } from "./structure.js";

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function walkTheoryAtoms(atoms = [], visit, context = {}) {
    (atoms || []).forEach((atom, index) => {
        if (!atom) {
            return;
        }

        const atomPath = [...(context.path || ["atoms"]), String(index)];

        visit(atom, {
            parentId: context.parentId || null,
            containerKey: context.containerKey || null,
            index,
            path: atomPath.join(".")
        });

        collectChildCollections(atom).forEach((childCollection) => {
            walkTheoryAtoms(childCollection.entries, visit, {
                parentId: atom.id || context.parentId || null,
                containerKey: childCollection.key,
                path: [...atomPath, childCollection.key]
            });
        });
    });
}

export function buildAtomRegister(theoryRows = []) {
    const atomRegister = [];
    const seenIds = new Set();

    theoryRows.forEach((row) => {
        walkTheoryAtoms(row.atoms, (atom) => {
            if (!atom || typeof atom.id !== "string" || seenIds.has(atom.id)) {
                return;
            }

            seenIds.add(atom.id);
            atomRegister.push(clone(atom));
        });
    });

    return atomRegister;
}

export function buildProjectionAtomRegister(projectionRows = []) {
    const projectionAtomRegister = [];
    const seenIds = new Set();

    projectionRows.forEach((row) => {
        (row.positionedAtoms || []).forEach((atom) => {
            if (!atom || typeof atom.id !== "string" || seenIds.has(atom.id)) {
                return;
            }

            seenIds.add(atom.id);
            projectionAtomRegister.push(clone(atom));
        });
    });

    return projectionAtomRegister;
}

export function buildTraceIndex(theoryRows = [], projectionRows = []) {
    const traceIndex = {};

    function ensureTrace(id, type = null, value = null) {
        if (typeof id !== "string" || id.length === 0) {
            return null;
        }

        if (!traceIndex[id]) {
            traceIndex[id] = {
                id,
                type,
                value,
                theory: [],
                projection: []
            };
        }

        return traceIndex[id];
    }

    theoryRows.forEach((row, rowIndex) => {
        walkTheoryAtoms(row.atoms, (atom, meta) => {
            const entry = ensureTrace(atom.id, atom.type || null, atom.value ?? null);

            if (!entry) {
                return;
            }

            entry.theory.push({
                rowId: row.rowId,
                rowIndex,
                parentId: meta.parentId,
                containerKey: meta.containerKey,
                path: meta.path,
                isVisible: atom.isVisible !== false,
                isGenerated: atom.isGenerated === true,
                isBefreit: atom.isBefreit === true
            });
        });
    });

    projectionRows.forEach((row, rowIndex) => {
        (row.positionedAtoms || []).forEach((atom, order) => {
            const projectionRef = {
                rowId: row.rowId,
                rowIndex,
                localRow: atom.localRow ?? null,
                relativeRow: atom.relativeRow ?? null,
                col: atom.col ?? null,
                colStart: atom.colStart ?? atom.col ?? null,
                colEnd: atom.colEnd ?? atom.col ?? null,
                order,
                projectionId: atom.id || null,
                isVisible: atom.isVisible !== false,
                projectionRole: atom.projectionRole || null,
                sourceShellId: atom.sourceShellId || null,
                sourceAtomId: atom.sourceAtomId || null,
                placementKey: atom.placementKey || null
            };
            const projectionEntry = ensureTrace(atom.id, atom.type || null, atom.value ?? null);

            if (projectionEntry) {
                projectionEntry.projection.push(projectionRef);
            }

            if (atom.sourceAtomId && atom.sourceAtomId !== atom.id) {
                const sourceEntry = ensureTrace(atom.sourceAtomId, atom.type || null, atom.value ?? null);

                if (sourceEntry) {
                    sourceEntry.projection.push(projectionRef);
                }
            }
        });
    });

    return traceIndex;
}
