function createSingleSlot(slotName, role, rawCol, value = null, options = {}) {
    return {
        slotName,
        role,
        rawCol,
        rawColStart: rawCol,
        rawColEnd: rawCol,
        value,
        ...options
    };
}

function createSpanSlot(slotName, role, rawColStart, rawColEnd, value = null) {
    return {
        slotName,
        role,
        rawColStart,
        rawColEnd,
        value
    };
}

function isCompleteRange(range = null) {
    return Number.isFinite(range?.rawColStart)
        && Number.isFinite(range?.rawColEnd);
}

function resolveGapSlotPosition(leftRange, rightRange, fallbackCol = 0) {
    if (
        leftRange
        && rightRange
        && Number.isFinite(leftRange.rawColEnd)
        && Number.isFinite(rightRange.rawColStart)
    ) {
        const gapStart = leftRange.rawColEnd + 1;
        const gapEnd = rightRange.rawColStart - 1;

        if (gapStart <= gapEnd) {
            return Math.floor((gapStart + gapEnd) / 2);
        }
    }

    if (leftRange && Number.isFinite(leftRange.rawColEnd)) {
        return leftRange.rawColEnd + 2;
    }

    if (rightRange && Number.isFinite(rightRange.rawColStart)) {
        return rightRange.rawColStart - 2;
    }

    return fallbackCol;
}

const POWER_BASE_TYPES_REQUIRING_PARENTHESES = new Set([
    "POWER",
    "NEGATION",
    "ADDITION",
    "SUBTRACTION",
    "MULTIPLICATION"
]);

function unwrapTransparentPowerBaseCollections(baseNodes = []) {
    const visibleBaseNodes = (Array.isArray(baseNodes) ? baseNodes : [baseNodes])
        .filter((node) => node && node.isVisible !== false);

    if (visibleBaseNodes.length !== 1 || visibleBaseNodes[0]?.type !== "COLLECTION") {
        return visibleBaseNodes;
    }

    return unwrapTransparentPowerBaseCollections(visibleBaseNodes[0]?.content || []);
}

function resolvePowerBaseParenthesisVisibility(baseNodes = []) {
    const visibleBaseNodes = unwrapTransparentPowerBaseCollections(baseNodes);

    if (visibleBaseNodes.length !== 1) {
        return visibleBaseNodes.length > 0;
    }

    return POWER_BASE_TYPES_REQUIRING_PARENTHESES.has(visibleBaseNodes[0]?.type);
}

function resolveShellCellRequirements(blueprint) {
    switch (blueprint?.shellType) {
        case "GROUP":
            return [
                { slotName: "paren_left", role: "group_left_paren", value: "(" },
                { slotName: "paren_right", role: "group_right_paren", value: ")" }
            ];
        case "FUNCTION":
            return [
                { slotName: "function_name", role: "function_name", value: blueprint?.meta?.functionName || null },
                { slotName: "paren_left", role: "function_left_paren", value: "(" },
                { slotName: "paren_right", role: "function_right_paren", value: ")" }
            ];
        case "ROOT":
            return [
                { slotName: "root_hook", role: "root_hook", value: "sqrt" },
                { slotName: "root_overbar", role: "root_overbar", value: null }
            ];
        case "DIVISION":
            return [
                { slotName: "fraction_line", role: "fraction_line", value: null }
            ];
        case "POWER": {
            const isVisible = blueprint?.meta?.baseParenthesesVisible === true;
            return [
                { slotName: "paren_left", role: "power_left_paren", value: "(", isVisible },
                { slotName: "paren_right", role: "power_right_paren", value: ")", isVisible }
            ];
        }
        default:
            return [];
    }
}

function resolveShellProjectionLayout(blueprint) {
    const contentStart = blueprint?.contentRange?.rawColStart ?? 0;
    const contentEnd = blueprint?.contentRange?.rawColEnd ?? 0;
    const collectionRanges = blueprint?.collectionRanges || {};

    switch (blueprint?.shellType) {
        case "GROUP":
            return {
                slots: [
                    createSingleSlot("paren_left", "group_left_paren", contentStart - 1, "("),
                    createSingleSlot("paren_right", "group_right_paren", contentEnd + 1, ")")
                ]
            };
        case "COLLECTION":
            return {
                slots: []
            };
        case "FUNCTION":
            {
                const argumentRange = isCompleteRange(collectionRanges.content)
                    ? collectionRanges.content
                    : { rawColStart: contentStart, rawColEnd: contentEnd };
                const baseRange = isCompleteRange(collectionRanges.baseContent)
                    ? collectionRanges.baseContent
                    : null;
                const functionNameCol = baseRange
                    ? baseRange.rawColStart - 1
                    : argumentRange.rawColStart - 2;

                return {
                    slots: [
                        createSingleSlot("function_name", "function_name", functionNameCol, blueprint?.meta?.functionName || null),
                        createSingleSlot("paren_left", "function_left_paren", argumentRange.rawColStart - 1, "("),
                        createSingleSlot("paren_right", "function_right_paren", argumentRange.rawColEnd + 1, ")")
                    ]
                };
            }
        case "NEGATION":
            return { slots: [] };
        case "ROOT":
            return {
                slots: [
                    createSingleSlot("root_hook", "root_hook", contentStart - 2, "sqrt"),
                    createSpanSlot("root_overbar", "root_overbar", contentStart - 1, contentEnd, null)
                ]
            };
        case "POWER": {
            const baseRange = isCompleteRange(collectionRanges.content)
                ? collectionRanges.content
                : { rawColStart: contentStart, rawColEnd: contentEnd };
            const isVisible = blueprint?.meta?.baseParenthesesVisible === true;

            return {
                slots: [
                    createSingleSlot(
                        "paren_left",
                        "power_left_paren",
                        baseRange.rawColStart - 1,
                        "(",
                        { isVisible }
                    ),
                    createSingleSlot(
                        "paren_right",
                        "power_right_paren",
                        baseRange.rawColEnd + 1,
                        ")",
                        { isVisible }
                    )
                ]
            };
        }
        case "DIVISION":
            return {
                slots: [
                    createSpanSlot(
                        "fraction_line",
                        "fraction_line",
                        contentStart,
                        contentEnd,
                        null
                    )
                ]
            };
        case "MULTIPLICATION":
            return { slots: [] };
        case "ADDITION":
        case "SUBTRACTION":
            return { slots: [] };
        default:
            return {
                slots: []
            };
    }
}

export {
    resolvePowerBaseParenthesisVisibility,
    resolveShellCellRequirements,
    resolveShellProjectionLayout
};
