import { createClosedFractionShellDefinition } from "./shellDefinitions.js";
import { placeShellInBand } from "./placeShellInBand.js";

function buildFractionBirth({
    fractionId,
    rowKey,
    side,
    bandStart,
    rowStart = 0,
    numeratorDefinition,
    denominatorDefinition
}) {
    const fractionDefinition = createClosedFractionShellDefinition({
        id: fractionId,
        numeratorDefinition,
        denominatorDefinition
    });

    const placedFraction = placeShellInBand(fractionDefinition, {
        bandStart,
        bandWidth: fractionDefinition.intrinsicWidth,
        rowStart,
        rowKey,
        shellId: fractionId
    });

    return {
        ...placedFraction,
        side
    };
}

export {
    buildFractionBirth
};
