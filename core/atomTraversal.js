const NESTED_COLLECTION_KEYS = ['content', 'numerator', 'denominator', 'factor', 'passive', 'exponentNodes'];

function walkAtoms(atoms, visit, context = { parentId: null, containerKey: null, path: ['atoms'] }) {
    (atoms || []).forEach((atom, index) => {
        if (!atom) {
            return;
        }

        const atomPath = [...(context.path || ['atoms']), String(index)];
        visit(atom, {
            parentId: context.parentId || null,
            containerKey: context.containerKey || null,
            index,
            path: atomPath.join('.')
        });

        NESTED_COLLECTION_KEYS.forEach((key) => {
            if (!Array.isArray(atom[key])) {
                return;
            }

            walkAtoms(atom[key], visit, {
                parentId: atom.id || context.parentId || null,
                containerKey: key,
                path: [...atomPath, key]
            });
        });
    });
}

export {
    NESTED_COLLECTION_KEYS,
    walkAtoms
};
