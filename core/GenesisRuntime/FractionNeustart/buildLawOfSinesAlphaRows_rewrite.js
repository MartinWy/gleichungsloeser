import {
    createAtomShellDefinition,
    createClosedFunctionShellDefinition
} from "./shellDefinitions.js";
import { birthLeafShell } from "./birthLeafShell.js";
import { birthFractionShell } from "./birthFractionShell.js";
import { transportShell } from "./transportShell.js";
import { openFunctionShellToContentAtom } from "./openFunctionShell.js";
import { wrapExistingContent } from "./wrapExistingContent.js";

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

    const leftBirthNumerator = birthLeafShell(aDef, {
        bandStart: 2,
        bandWidth: 4,
        rowStart: 0,
        rowKey: "row0",
        shellId: "row0::left_fraction::numerator"
    });
    const leftBirthDenominator = birthLeafShell(sinAlphaDef, {
        bandStart: 2,
        bandWidth: 4,
        rowStart: 2,
        rowKey: "row0",
        shellId: "row0::left_fraction::denominator"
    });
    const leftBirth = birthFractionShell({
        shellId: "row0::left_fraction",
        rowKey: "row0",
        numeratorShell: leftBirthNumerator,
        denominatorShell: leftBirthDenominator
    });

    const rightBirthNumerator = birthLeafShell(bDef, {
        bandStart: 11,
        bandWidth: 4,
        rowStart: 0,
        rowKey: "row0",
        shellId: "row0::right_fraction::numerator"
    });
    const rightBirthDenominator = birthLeafShell(sinBetaDef, {
        bandStart: 11,
        bandWidth: 4,
        rowStart: 2,
        rowKey: "row0",
        shellId: "row0::right_fraction::denominator"
    });
    const rightBirth = birthFractionShell({
        shellId: "row0::right_fraction",
        rowKey: "row0",
        numeratorShell: rightBirthNumerator,
        denominatorShell: rightBirthDenominator
    });

    const leftTransport = transportShell(leftBirth.numeratorShell, {
        bandStart: leftBirth.numeratorShell.bandStart,
        rowStart: leftBirth.numeratorShell.rowStart,
        rowKey: "row1",
        shellId: "row1::left_numerator_transport"
    });
    const rightClosedFraction = transportShell(rightBirth, {
        bandStart: rightBirth.bandStart,
        rowStart: rightBirth.rowStart,
        rowKey: "row1",
        shellId: "row1::right_fraction_transport"
    });
    const sinAlphaFactor = transportShell(leftBirth.denominatorShell, {
        bandStart: rightClosedFraction.bandEnd + 2,
        rowStart: 1,
        rowKey: "row1",
        shellId: "row1::right_factor_sin_alpha"
    });

    const nestedNumerator = transportShell(leftTransport, {
        bandStart: leftTransport.bandStart,
        rowStart: 0,
        rowKey: "row2",
        shellId: "row2::nested_numerator"
    });
    const nestedDenominator = transportShell(rightClosedFraction, {
        bandStart: leftTransport.bandStart,
        rowStart: 2,
        rowKey: "row2",
        shellId: "row2::nested_denominator"
    });
    const nestedFraction = birthFractionShell({
        shellId: "row2::nested_fraction",
        rowKey: "row2",
        numeratorShell: nestedNumerator,
        denominatorShell: nestedDenominator
    });
    const rightTransportSinAlpha = transportShell(sinAlphaFactor, {
        bandStart: sinAlphaFactor.bandStart,
        rowStart: sinAlphaFactor.rowStart,
        rowKey: "row2",
        shellId: "row2::right_sin_alpha"
    });

    const wrapperContent = transportShell(nestedFraction, {
        bandStart: nestedFraction.bandStart,
        rowStart: nestedFraction.rowStart,
        rowKey: "row3",
        shellId: "row3::nested_fraction_transport"
    });
    const asinWrapper = wrapExistingContent({
        shellId: "row3::asin_wrapper",
        rowKey: "row3",
        name: "asin",
        contentShell: wrapperContent
    });
    const alphaShell = openFunctionShellToContentAtom(rightTransportSinAlpha, {
        rowKey: "row3",
        shellId: "row3::alpha"
    });

    return {
        sceneId: "law_of_sines_alpha_birth_transport",
        definitions: {
            aDef,
            bDef,
            sinAlphaDef,
            sinBetaDef
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
                    multiplicationDotCol: rightClosedFraction.bandEnd + 1,
                    multiplicationDotRow: 1,
                    factorShell: sinAlphaFactor
                }
            },
            {
                rowKey: "row2",
                label: "Doppelbruch",
                anchorCol: 9,
                anchorRow: 2,
                totalRows: 5,
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
                anchorCol: 9,
                anchorRow: 2,
                totalRows: 5,
                left: {
                    wrapper: asinWrapper
                },
                right: {
                    alphaShell
                }
            }
        ]
    };
}

export {
    buildLawOfSinesAlphaRows
};
