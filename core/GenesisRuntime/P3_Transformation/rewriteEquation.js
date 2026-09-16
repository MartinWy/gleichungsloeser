import { splitRuntimeEquationSides } from '../P2_Strategy/equationSides.js';

function resolveEquationSide(decision, sideAnalysis) {
    if (decision?.equationSide === "right") {
        return "right";
    }

    if (decision?.equationSide === "left") {
        return "left";
    }

    return sideAnalysis?.side === "right" ? "right" : "left";
}

function resolveOppositeEquationSide(equationSide) {
    if (equationSide === "left") {
        return "right";
    }

    if (equationSide === "right") {
        return "left";
    }

    throw new Error(`[GenesisRuntime:P3] Unbekannte Gleichungsseite "${equationSide}".`);
}

function createEquationRewriteContext(structure, decision, sideAnalysis) {
    const equationSides = splitRuntimeEquationSides(structure);
    const equationSide = resolveEquationSide(decision, sideAnalysis);

    return {
        equationSide,
        anchor: equationSides.anchor,
        left: equationSides.left,
        right: equationSides.right,
        activeSide: equationSide === "right" ? equationSides.right : equationSides.left,
        oppositeSide: equationSide === "right" ? equationSides.left : equationSides.right
    };
}

function rebuildRuntimeEquation({ equationSide, anchor }, activeSide, oppositeSide) {
    if (!anchor) {
        return activeSide;
    }

    if (equationSide === "right") {
        return [...oppositeSide, anchor, ...activeSide];
    }

    return [...activeSide, anchor, ...oppositeSide];
}

export {
    createEquationRewriteContext,
    rebuildRuntimeEquation,
    resolveOppositeEquationSide
};
