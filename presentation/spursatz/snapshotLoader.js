import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertValidSpurSatzSnapshot } from "./snapshotValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const defaultSpurSatzSnapshotPath = path.resolve(
    __dirname,
    "examples",
    "latin-modern-math.core.v1.json"
);

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.getOwnPropertyNames(value).forEach((propertyName) => {
        deepFreeze(value[propertyName]);
    });

    return Object.freeze(value);
}

function cloneJsonLike(value) {
    return JSON.parse(JSON.stringify(value));
}

function buildIdsByText(entriesById = {}) {
    return Object.entries(entriesById).reduce((accumulator, [id, entry]) => {
        const text = entry?.text;
        if (typeof text === "string" && text.length > 0) {
            if (!accumulator[text]) {
                accumulator[text] = [];
            }
            accumulator[text].push(id);
        }
        return accumulator;
    }, {});
}

export function parseSpurSatzSnapshot(jsonText) {
    return JSON.parse(jsonText);
}

export function loadSpurSatzSnapshotFromFile(filePath = defaultSpurSatzSnapshotPath) {
    const jsonText = fs.readFileSync(filePath, "utf8");
    const snapshot = parseSpurSatzSnapshot(jsonText);
    return assertValidSpurSatzSnapshot(snapshot);
}

export function buildSpurSatzMaterial(snapshot) {
    const validSnapshot = assertValidSpurSatzSnapshot(snapshot);
    const clonedSnapshot = cloneJsonLike(validSnapshot);
    const glyphsById = deepFreeze(clonedSnapshot.glyphCatalog);
    const delimitersById = deepFreeze(clonedSnapshot.delimiterCatalog);
    const material = {
        formatVersion: clonedSnapshot.formatVersion,
        font: deepFreeze(clonedSnapshot.font),
        fontMetrics: deepFreeze(clonedSnapshot.fontMetrics),
        glyphsById,
        delimitersById,
        glyphIdsByText: deepFreeze(buildIdsByText(glyphsById)),
        delimiterIdsByText: deepFreeze(buildIdsByText(delimitersById)),
        layoutHints: deepFreeze(clonedSnapshot.layoutHints),
        coverage: deepFreeze(clonedSnapshot.coverage)
    };

    return deepFreeze(material);
}

export function loadSpurSatzMaterialFromFile(filePath = defaultSpurSatzSnapshotPath) {
    return buildSpurSatzMaterial(loadSpurSatzSnapshotFromFile(filePath));
}

export function getSpurSatzGlyph(material, glyphId) {
    return material?.glyphsById?.[glyphId] || null;
}

export function getSpurSatzDelimiter(material, delimiterId) {
    return material?.delimitersById?.[delimiterId] || null;
}

export function findSpurSatzGlyphsByText(material, text) {
    const ids = material?.glyphIdsByText?.[text] || [];
    return ids.map((glyphId) => material.glyphsById[glyphId]).filter(Boolean);
}

export function findSpurSatzDelimitersByText(material, text) {
    const ids = material?.delimiterIdsByText?.[text] || [];
    return ids.map((delimiterId) => material.delimitersById[delimiterId]).filter(Boolean);
}
