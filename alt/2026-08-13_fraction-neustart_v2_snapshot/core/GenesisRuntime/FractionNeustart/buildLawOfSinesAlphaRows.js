import {
    createAtomShellDefinition,
    createClosedFractionShellDefinition,
    createClosedFunctionShellDefinition,
    createWrapperFunctionShellDefinition
} from "./shellDefinitions.js";
import { placeShellInBand } from "./placeShellInBand.js";
import { buildFractionBirth } from "./buildFractionBirth.js";

function buildLawOfSinesAlphaRows() {
    const aDef = createAtomShellDefinition({
        id: "law_of_sines::a",
        value: "a"
    });
    const bDef = createAtomShellDefinition({
        id: "law_of_sines::b",
        value: "b"
    });
    const sinAlphaDef = createClosedFunctionShellDefinition({
        id: "law_of_sines::sin_alpha",
        name: "sin",
        argumentValue: "alpha"
    });
    const sinBetaDef = createClosedFunctionShellDefinition({
        id: "law_of_sines::sin_beta",
        name: "sin",
        argumentValue: "beta"
    });

    const leftBirth = buildFractionBirth({
        fractionId: "row0::left_fraction",
        rowKey: "row0",
        side: "left",
        bandStart: 2,
        numeratorDefinition: aDef,
        denominatorDefinition: sinAlphaDef
    });
    const rightBirth = buildFractionBirth({
        fractionId: "row0::right_fraction",
        rowKey: "row0",
        side: "right",
        bandStart: 11,
        numeratorDefinition: bDef,
        denominatorDefinition: sinBetaDef
    });

    const rightFractionDef = createClosedFractionShellDefinition({
        id: "row1::right_fraction_transport",
        numeratorDefinition: bDef,
        denominatorDefinition: sinBetaDef
    });

    const leftTransport = placeShellInBand(aDef, {
        bandStart: leftBirth.bandStart,
        bandWidth: leftBirth.bandWidth,
        rowStart: 1,
        rowKey: "row1",
        shellId: "row1::left_numerator_transport"
    });

    const rightClosedFraction = placeShellInBand(rightFractionDef, {
        bandStart: rightBirth.bandStart,
        bandWidth: rightFractionDef.intrinsicWidth,
        rowStart: 0,
        rowKey: "row1",
        shellId: "row1::right_fraction_transport"
    });

    const sinAlphaFactor = placeShellInBand(sinAlphaDef, {
        bandStart: rightClosedFraction.placedEnd + 2,
        bandWidth: sinAlphaDef.intrinsicWidth,
        rowStart: 1,
        rowKey: "row1",
        shellId: "row1::right_factor_sin_alpha"
    });

    const nestedFractionDef = createClosedFractionShellDefinition({
        id: "row2::nested_fraction",
        numeratorDefinition: aDef,
        denominatorDefinition: rightFractionDef
    });
    const nestedFraction = placeShellInBand(nestedFractionDef, {
        bandStart: 2,
        bandWidth: nestedFractionDef.intrinsicWidth,
        rowStart: 0,
        rowKey: "row2",
        shellId: "row2::nested_fraction"
    });
    const rightTransportSinAlpha = placeShellInBand(sinAlphaDef, {
        bandStart: 14,
        bandWidth: sinAlphaDef.intrinsicWidth,
        rowStart: 2,
        rowKey: "row2",
        shellId: "row2::right_sin_alpha"
    });

    const asinWrapperDef = createWrapperFunctionShellDefinition({
        id: "row3::asin_wrapper",
        name: "asin",
        contentDefinition: nestedFractionDef
    });
    const asinWrapper = placeShellInBand(asinWrapperDef, {
        bandStart: 1,
        bandWidth: asinWrapperDef.intrinsicWidth,
        rowStart: 0,
        rowKey: "row3",
        shellId: "row3::asin_wrapper"
    });

    return {
        sceneId: "law_of_sines_alpha_birth_transport",
        definitions: {
            aDef,
            bDef,
            sinAlphaDef,
            sinBetaDef,
            rightFractionDef,
            nestedFractionDef,
            asinWrapperDef
        },
        rows: [
            {
                rowKey: "row0",
                label: "Geburt",
                anchorCol: 9,
                anchorRow: 1,
                totalRows: 3,
                left: {
                    fraction: leftBirth
                },
                right: {
                    fraction: rightBirth
                }
            },
            {
                rowKey: "row1",
                label: "Nennertransport",
                anchorCol: 9,
                anchorRow: 1,
                totalRows: 3,
                left: {
                    shell: leftTransport
                },
                right: {
                    fraction: rightClosedFraction,
                    multiplicationDotCol: rightClosedFraction.placedEnd + 1,
                    multiplicationDotRow: 1,
                    factorShell: sinAlphaFactor
                }
            },
            {
                rowKey: "row2",
                label: "Doppelbruch",
                anchorCol: 10,
                anchorRow: 2,
                totalRows: nestedFraction.rowEnd + 1,
                left: {
                    fraction: nestedFraction
                },
                right: {
                    shell: rightTransportSinAlpha
                }
            },
            {
                rowKey: "row3",
                label: "Asin-Huelle",
                anchorCol: 10,
                anchorRow: 2,
                totalRows: asinWrapper.rowEnd + 1,
                left: {
                    wrapper: asinWrapper
                },
                right: {
                    alphaShell: placeShellInBand(
                        createAtomShellDefinition({
                            id: "row3::alpha",
                            value: "alpha"
                        }),
                        {
                            bandStart: 15,
                            bandWidth: 1,
                            rowStart: 2,
                            rowKey: "row3",
                            shellId: "row3::alpha"
                        }
                    )
                }
            }
        ]
    };
}

export {
    buildLawOfSinesAlphaRows
};
