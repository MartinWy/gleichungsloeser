function splitRuntimeEquationSides(structure) {
    const anchorIndex = structure.findIndex((node) => node?.value === "=");

    if (anchorIndex === -1) {
        return {
            anchorIndex: -1,
            left: structure,
            right: [],
            anchor: null
        };
    }

    return {
        anchorIndex,
        left: structure.slice(0, anchorIndex),
        right: structure.slice(anchorIndex + 1),
        anchor: structure[anchorIndex]
    };
}

export {
    splitRuntimeEquationSides
};
