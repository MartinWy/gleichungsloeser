const REQUIRED_TOP_LEVEL_FIELDS = [
    "formatVersion",
    "font",
    "fontMetrics",
    "glyphCatalog",
    "delimiterCatalog",
    "layoutHints",
    "coverage"
];

const REQUIRED_FONT_FIELDS = [
    "family",
    "source",
    "unitsPerEm"
];

const REQUIRED_FONT_METRIC_FIELDS = [
    "axisHeight",
    "fractionRuleThickness",
    "radicalRuleThickness",
    "superscriptShiftUp",
    "subscriptShiftDown"
];

const REQUIRED_GLYPH_FIELDS = [
    "kind",
    "text",
    "glyphs",
    "advanceWidth",
    "bbox",
    "baseline",
    "mathAxis",
    "italicCorrection"
];

const REQUIRED_DELIMITER_FIELDS = [
    "text",
    "variants",
    "parts",
    "innerLeft",
    "innerRight"
];

const REQUIRED_LAYOUT_HINT_FIELDS = [
    "ruleThicknessDefault",
    "delimiterOvershootDefault",
    "radicalClearanceDefault",
    "superscriptScaleDefault"
];

const REQUIRED_COVERAGE_FIELDS = [
    "coreSymbols",
    "functionNames",
    "delimiters"
];

const ALLOWED_GLYPH_KINDS = new Set([
    "number",
    "variable",
    "operator",
    "anchor",
    "delimiter",
    "function_text",
    "superscript_text",
    "radical_part"
]);

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

function validateRequiredFields(objectValue, requiredFields, objectName, errors) {
    requiredFields.forEach((field) => {
        if (!(field in objectValue)) {
            errors.push(`${objectName}.${field} fehlt.`);
        }
    });
}

function validateString(value, fieldName, errors) {
    if (typeof value !== "string" || value.length === 0) {
        errors.push(`${fieldName} muss ein nichtleerer String sein.`);
    }
}

function validateNonNegativeNumber(value, fieldName, errors) {
    if (!isFiniteNumber(value) || value < 0) {
        errors.push(`${fieldName} muss eine endliche Zahl >= 0 sein.`);
    }
}

function validateFiniteNumber(value, fieldName, errors) {
    if (!isFiniteNumber(value)) {
        errors.push(`${fieldName} muss eine endliche Zahl sein.`);
    }
}

function validateStringArray(value, fieldName, errors) {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) {
        errors.push(`${fieldName} muss eine Liste nichtleerer Strings sein.`);
    }
}

function validateBBox(bbox, fieldName, errors) {
    if (!isPlainObject(bbox)) {
        errors.push(`${fieldName} muss ein Objekt sein.`);
        return;
    }

    ["xMin", "xMax", "yMin", "yMax"].forEach((key) => {
        validateFiniteNumber(bbox[key], `${fieldName}.${key}`, errors);
    });
}

function validateDelimiterVariants(variants, fieldName, errors) {
    if (!Array.isArray(variants)) {
        errors.push(`${fieldName} muss eine Liste sein.`);
        return;
    }

    variants.forEach((variant, index) => {
        const variantName = `${fieldName}[${index}]`;
        if (!isPlainObject(variant)) {
            errors.push(`${variantName} muss ein Objekt sein.`);
            return;
        }

        validateString(variant.glyphId, `${variantName}.glyphId`, errors);
        validateNonNegativeNumber(variant.height, `${variantName}.height`, errors);
        validateNonNegativeNumber(variant.advanceWidth, `${variantName}.advanceWidth`, errors);
    });
}

function validateDelimiterParts(parts, fieldName, errors) {
    if (!Array.isArray(parts)) {
        errors.push(`${fieldName} muss eine Liste sein.`);
        return;
    }

    parts.forEach((part, index) => {
        const partName = `${fieldName}[${index}]`;
        if (!isPlainObject(part)) {
            errors.push(`${partName} muss ein Objekt sein.`);
            return;
        }

        validateString(part.role, `${partName}.role`, errors);
        validateString(part.glyphId, `${partName}.glyphId`, errors);
        validateNonNegativeNumber(part.advanceWidth, `${partName}.advanceWidth`, errors);
    });
}

export function validateSpurSatzSnapshot(snapshot) {
    const errors = [];

    if (!isPlainObject(snapshot)) {
        return {
            valid: false,
            errors: ["Snapshot muss ein Objekt sein."]
        };
    }

    validateRequiredFields(snapshot, REQUIRED_TOP_LEVEL_FIELDS, "snapshot", errors);

    if (typeof snapshot.formatVersion !== "string" || snapshot.formatVersion !== "1.0") {
        errors.push("snapshot.formatVersion muss '1.0' sein.");
    }

    if (!isPlainObject(snapshot.font)) {
        errors.push("snapshot.font muss ein Objekt sein.");
    } else {
        validateRequiredFields(snapshot.font, REQUIRED_FONT_FIELDS, "snapshot.font", errors);
        validateString(snapshot.font.family, "snapshot.font.family", errors);
        validateString(snapshot.font.source, "snapshot.font.source", errors);
        validateNonNegativeNumber(snapshot.font.unitsPerEm, "snapshot.font.unitsPerEm", errors);
    }

    if (!isPlainObject(snapshot.fontMetrics)) {
        errors.push("snapshot.fontMetrics muss ein Objekt sein.");
    } else {
        validateRequiredFields(snapshot.fontMetrics, REQUIRED_FONT_METRIC_FIELDS, "snapshot.fontMetrics", errors);
        REQUIRED_FONT_METRIC_FIELDS.forEach((field) => {
            validateNonNegativeNumber(snapshot.fontMetrics[field], `snapshot.fontMetrics.${field}`, errors);
        });
    }

    if (!isPlainObject(snapshot.glyphCatalog)) {
        errors.push("snapshot.glyphCatalog muss ein Objekt sein.");
    } else {
        Object.entries(snapshot.glyphCatalog).forEach(([glyphId, glyph]) => {
            const glyphName = `snapshot.glyphCatalog.${glyphId}`;
            if (!isPlainObject(glyph)) {
                errors.push(`${glyphName} muss ein Objekt sein.`);
                return;
            }

            validateRequiredFields(glyph, REQUIRED_GLYPH_FIELDS, glyphName, errors);
            if (!ALLOWED_GLYPH_KINDS.has(glyph.kind)) {
                errors.push(`${glyphName}.kind ist nicht erlaubt.`);
            }
            validateString(glyph.text, `${glyphName}.text`, errors);
            validateStringArray(glyph.glyphs, `${glyphName}.glyphs`, errors);
            validateNonNegativeNumber(glyph.advanceWidth, `${glyphName}.advanceWidth`, errors);
            validateBBox(glyph.bbox, `${glyphName}.bbox`, errors);
            validateFiniteNumber(glyph.baseline, `${glyphName}.baseline`, errors);
            validateFiniteNumber(glyph.mathAxis, `${glyphName}.mathAxis`, errors);
            validateNonNegativeNumber(glyph.italicCorrection, `${glyphName}.italicCorrection`, errors);
        });
    }

    if (!isPlainObject(snapshot.delimiterCatalog)) {
        errors.push("snapshot.delimiterCatalog muss ein Objekt sein.");
    } else {
        Object.entries(snapshot.delimiterCatalog).forEach(([delimiterId, delimiter]) => {
            const delimiterName = `snapshot.delimiterCatalog.${delimiterId}`;
            if (!isPlainObject(delimiter)) {
                errors.push(`${delimiterName} muss ein Objekt sein.`);
                return;
            }

            validateRequiredFields(delimiter, REQUIRED_DELIMITER_FIELDS, delimiterName, errors);
            validateString(delimiter.text, `${delimiterName}.text`, errors);
            validateDelimiterVariants(delimiter.variants, `${delimiterName}.variants`, errors);
            validateDelimiterParts(delimiter.parts, `${delimiterName}.parts`, errors);
            validateNonNegativeNumber(delimiter.innerLeft, `${delimiterName}.innerLeft`, errors);
            validateNonNegativeNumber(delimiter.innerRight, `${delimiterName}.innerRight`, errors);
        });
    }

    if (!isPlainObject(snapshot.layoutHints)) {
        errors.push("snapshot.layoutHints muss ein Objekt sein.");
    } else {
        validateRequiredFields(snapshot.layoutHints, REQUIRED_LAYOUT_HINT_FIELDS, "snapshot.layoutHints", errors);
        REQUIRED_LAYOUT_HINT_FIELDS.forEach((field) => {
            validateNonNegativeNumber(snapshot.layoutHints[field], `snapshot.layoutHints.${field}`, errors);
        });
    }

    if (!isPlainObject(snapshot.coverage)) {
        errors.push("snapshot.coverage muss ein Objekt sein.");
    } else {
        validateRequiredFields(snapshot.coverage, REQUIRED_COVERAGE_FIELDS, "snapshot.coverage", errors);
        REQUIRED_COVERAGE_FIELDS.forEach((field) => {
            validateStringArray(snapshot.coverage[field], `snapshot.coverage.${field}`, errors);
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function assertValidSpurSatzSnapshot(snapshot) {
    const result = validateSpurSatzSnapshot(snapshot);
    if (!result.valid) {
        throw new Error(`Ungueltiger SpurSatz-Snapshot:\n- ${result.errors.join("\n- ")}`);
    }
    return snapshot;
}
