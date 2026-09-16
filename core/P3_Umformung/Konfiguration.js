export const UMFORMUNG_CONFIG = {
    SYMBOLS: {
        MULT: '*',
        DIV: '/',
        FRACTION_LINE: '---'
    },
    AUTO_GENERATED_IDS: {
        LINE_PREFIX: 'fraction-line-',
        MOVED_PREFIX: 'moved-'
    },
    BEHAVIOR: {
        KEEP_ORIGINAL_INVISIBLE: true,
        WRAP_IN_PARENTHESES: 'auto'
    },
    LAYOUT_POLICY: {
        RIGHT_SIDE_FACTOR_PLACEMENT: 'suffix'
    }
};

export const RIGHT_SIDE_FACTOR_PLACEMENTS = Object.freeze({
    PREFIX: "prefix",
    SUFFIX: "suffix"
});

export function normalizeRightSideFactorPlacement(value) {
    if (value === RIGHT_SIDE_FACTOR_PLACEMENTS.PREFIX) {
        return RIGHT_SIDE_FACTOR_PLACEMENTS.PREFIX;
    }

    return RIGHT_SIDE_FACTOR_PLACEMENTS.SUFFIX;
}

export function resolveUmformungOptions(options = {}) {
    return {
        rightSideFactorPlacement: normalizeRightSideFactorPlacement(options?.rightSideFactorPlacement || UMFORMUNG_CONFIG.LAYOUT_POLICY.RIGHT_SIDE_FACTOR_PLACEMENT)
    };
}

export function resolveGeneratedMultiplicationFlowDirection(entscheidung, options = {}) {
    const resolvedOptions = resolveUmformungOptions(options);
    const destinationSide = entscheidung?.oppositeEquationSide || (entscheidung?.equationSide === "right" ? "left" : "right");

    if (destinationSide === "left") {
        return "rtl";
    }

    return resolvedOptions.rightSideFactorPlacement === RIGHT_SIDE_FACTOR_PLACEMENTS.PREFIX
        ? "rtl"
        : "ltr";
}
