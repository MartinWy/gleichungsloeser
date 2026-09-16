import assert from "node:assert/strict";

import { buildRenderNode } from "../../components/Arbeitsblatt_Druckansicht/renderKernel.js";
import {
    buildDelimiterStretchMetrics,
    buildRootStretchMetrics
} from "../../components/Arbeitsblatt_Druckansicht/renderStretchMetrics.js";

const simpleGroupNode = buildRenderNode({
    id: "simple-group",
    type: "GROUP",
    isVisible: true,
    content: [
        { id: "x", value: "x", type: "VARIABLE", isVisible: true }
    ]
});

const fractionGroupNode = buildRenderNode({
    id: "fraction-group",
    type: "GROUP",
    isVisible: true,
    content: [
        {
            id: "fraction-shell",
            type: "DIVISION",
            isVisible: true,
            numerator: [
                { id: "num-x", value: "x", type: "VARIABLE", isVisible: true }
            ],
            denominator: [
                { id: "den-two", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }
            ]
        }
    ]
});

const simpleDelimiterMetrics = buildDelimiterStretchMetrics(simpleGroupNode.content);
const fractionDelimiterMetrics = buildDelimiterStretchMetrics(fractionGroupNode.content);

assert.ok(
    fractionDelimiterMetrics.boxHeightEm > simpleDelimiterMetrics.boxHeightEm,
    "Klammern muessen die groessere Inhaltsbox erkennen."
);
assert.ok(
    fractionDelimiterMetrics.scaleY > simpleDelimiterMetrics.scaleY,
    "Klammern muessen sich bei hoeherem Inhalt auch sichtbar staerker strecken."
);

const simpleRootNode = buildRenderNode({
    id: "simple-root",
    type: "ROOT",
    isVisible: true,
    content: [
        { id: "root-x", value: "x", type: "VARIABLE", isVisible: true }
    ]
});

const fractionRootNode = buildRenderNode({
    id: "fraction-root",
    type: "ROOT",
    isVisible: true,
    content: [
        {
            id: "root-fraction-shell",
            type: "DIVISION",
            isVisible: true,
            numerator: [
                { id: "root-num-x", value: "x", type: "VARIABLE", isVisible: true }
            ],
            denominator: [
                { id: "root-den-two", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }
            ]
        }
    ]
});

const simpleRootMetrics = buildRootStretchMetrics(simpleRootNode.content, simpleRootNode);
const fractionRootMetrics = buildRootStretchMetrics(fractionRootNode.content, fractionRootNode);

assert.ok(
    fractionRootMetrics.boxHeightEm > simpleRootMetrics.boxHeightEm,
    "Die Wurzel muss den hoeheren Inhalt als groessere Box erkennen."
);
assert.ok(
    fractionRootMetrics.scaleY > simpleRootMetrics.scaleY,
    "Das Wurzelzeichen muss sich bei hoeherem Inhalt sichtbar staerker strecken."
);
assert.ok(
    fractionRootMetrics.targetHeightEm >= fractionRootMetrics.boxHeightEm,
    "Die Wurzelhoehe darf niemals kleiner als ihr Inhalt werden."
);

const rootOverComplexExponentNode = buildRenderNode({
    id: "root-complex-exponent",
    type: "ROOT",
    isVisible: true,
    content: [
        {
            id: "power-complex-exponent",
            type: "POWER",
            exponent: "n",
            exponentNodes: [
                {
                    id: "power-exponent-fraction",
                    type: "DIVISION",
                    isVisible: true,
                    numerator: [
                        { id: "exp-num-1", value: "1", type: "NUMBER", isVisible: true }
                    ],
                    denominator: [
                        { id: "exp-den-2", value: "2", type: "NUMBER", isVisible: true, position: "denominator" }
                    ]
                }
            ],
            content: [
                { id: "power-base-x", value: "x", type: "VARIABLE", isVisible: true }
            ]
        }
    ]
});

const rootOverComplexExponentMetrics = buildRootStretchMetrics(
    rootOverComplexExponentNode.content,
    rootOverComplexExponentNode
);

assert.ok(
    rootOverComplexExponentMetrics.boxHeightEm > simpleRootMetrics.boxHeightEm,
    "Eine Wurzel muss auch strukturelle Exponenten im Radikanden in ihrer Inhaltsbox erkennen."
);
assert.ok(
    rootOverComplexExponentMetrics.scaleY > simpleRootMetrics.scaleY,
    "Eine Wurzel ueber einer Potenz mit hohem Exponenten muss sichtbar hoeher werden."
);

console.log("Render-Stretch-Metriken erfolgreich geprueft.");
