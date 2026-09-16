import {
    resolveProjectionBoundaryRange,
    resolveProjectionCollectionBoundaryRange
} from "./shellGeometryBoundaries.js";
import {
    createCenteredRawCol,
    createContainerRange,
    createSingleSlot,
    createSpanningSlot
} from "./shellGeometryPrimitives.js";

export function resolveDivisionLayout(semanticRaster, side, blueprint) {
    const boundaryRange = resolveProjectionBoundaryRange(semanticRaster, side, blueprint);

    if (!boundaryRange) {
        return null;
    }

    return {
        containerRange: createContainerRange(boundaryRange.rawColStart, boundaryRange.rawColEnd),
        slots: {
            fraction_line: createSpanningSlot(boundaryRange.rawColStart, boundaryRange.rawColEnd)
        }
    };
}

export function resolveFunctionLayout(semanticRaster, side, blueprint) {
    const contentRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, "content");

    if (!contentRange) {
        return null;
    }

    const shellStartCol = contentRange.rawColStart - 2;
    const shellEndCol = contentRange.rawColEnd + 1;

    return {
        containerRange: createContainerRange(shellStartCol, shellEndCol),
        slots: {
            function_name: createSingleSlot(contentRange.rawColStart - 2),
            function_left: createSingleSlot(contentRange.rawColStart - 1),
            function_right: createSingleSlot(contentRange.rawColEnd + 1)
        }
    };
}

export function resolveGroupLayout(semanticRaster, side, blueprint) {
    const contentRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, "content");

    if (!contentRange) {
        return null;
    }

    return {
        containerRange: createContainerRange(contentRange.rawColStart - 1, contentRange.rawColEnd + 1),
        slots: {
            group_left: createSingleSlot(contentRange.rawColStart - 1),
            group_right: createSingleSlot(contentRange.rawColEnd + 1)
        }
    };
}

export function resolveRootLayout(semanticRaster, side, blueprint) {
    const contentRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, "content");

    if (!contentRange) {
        return null;
    }

    return {
        containerRange: createContainerRange(contentRange.rawColStart - 1, contentRange.rawColEnd),
        slots: {
            root_hook: createSingleSlot(contentRange.rawColStart - 1),
            root_bar: createSpanningSlot(contentRange.rawColStart, contentRange.rawColEnd)
        }
    };
}

export function resolvePowerLayout(semanticRaster, side, blueprint) {
    const contentRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, "content");
    const contentEndCol = contentRange?.rawColEnd;

    if (!Number.isInteger(contentEndCol)) {
        return null;
    }

    return {
        containerRange: createContainerRange(contentEndCol, contentEndCol + 1),
        slots: {
            power_exponent: createSingleSlot(contentEndCol + 1)
        }
    };
}

export function resolveNegationLayout(semanticRaster, side, blueprint) {
    const contentRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, "content");

    if (!contentRange) {
        return null;
    }

    return {
        containerRange: createContainerRange(contentRange.rawColStart - 1, contentRange.rawColEnd),
        slots: {
            negation_sign: createSingleSlot(contentRange.rawColStart - 1)
        }
    };
}

export function resolveBinaryInlineLayout(semanticRaster, side, blueprint, trailingCollectionKey = "") {
    const contentRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, "content");
    const trailingRange = resolveProjectionCollectionBoundaryRange(semanticRaster, side, blueprint, trailingCollectionKey);

    if (!contentRange || !trailingRange) {
        return null;
    }

    return {
        containerRange: createContainerRange(contentRange.rawColStart, trailingRange.rawColEnd),
        slots: {
            inline_operator: createSingleSlot(
                createCenteredRawCol(contentRange.rawColEnd, trailingRange.rawColStart)
            )
        }
    };
}

export function resolveShellHorizontalLayout(shellType = "", semanticRaster, side, blueprint = null) {
    switch (shellType) {
        case "DIVISION":
            return resolveDivisionLayout(semanticRaster, side, blueprint);
        case "FUNCTION":
            return resolveFunctionLayout(semanticRaster, side, blueprint);
        case "GROUP":
            return resolveGroupLayout(semanticRaster, side, blueprint);
        case "ROOT":
            return resolveRootLayout(semanticRaster, side, blueprint);
        case "POWER":
            return resolvePowerLayout(semanticRaster, side, blueprint);
        case "NEGATION":
            return resolveNegationLayout(semanticRaster, side, blueprint);
        case "MULTIPLICATION":
            return resolveBinaryInlineLayout(semanticRaster, side, blueprint, "factor");
        case "ADDITION":
        case "SUBTRACTION":
            return resolveBinaryInlineLayout(semanticRaster, side, blueprint, "passive");
        default:
            return null;
    }
}
