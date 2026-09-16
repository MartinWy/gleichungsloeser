const GREEK_SYMBOLS = new Map([
    ["alpha", "α"],
    ["beta", "β"],
    ["gamma", "γ"],
    ["delta", "δ"],
    ["epsilon", "ε"],
    ["zeta", "ζ"],
    ["eta", "η"],
    ["theta", "θ"],
    ["iota", "ι"],
    ["kappa", "κ"],
    ["lambda", "λ"],
    ["mu", "μ"],
    ["nu", "ν"],
    ["xi", "ξ"],
    ["omicron", "ο"],
    ["pi", "π"],
    ["rho", "ρ"],
    ["sigma", "σ"],
    ["tau", "τ"],
    ["upsilon", "υ"],
    ["phi", "φ"],
    ["chi", "χ"],
    ["psi", "ψ"],
    ["omega", "ω"]
]);

function normalizeGreekKey(text) {
    return typeof text === "string" ? text.trim().toLowerCase() : "";
}

export function isGreekSymbolName(text) {
    return GREEK_SYMBOLS.has(normalizeGreekKey(text));
}

export function resolveGreekUnicodeGlyph(text) {
    return GREEK_SYMBOLS.get(normalizeGreekKey(text)) || null;
}

export function resolveGreekLatexCommand(text) {
    const key = normalizeGreekKey(text);
    return GREEK_SYMBOLS.has(key) ? `\\${key}` : null;
}

export function replaceGreekNamesWithGlyphs(text) {
    return String(text || "")
        .match(/[A-Za-z]+|[^A-Za-z]+/g)
        ?.map((token) => resolveGreekUnicodeGlyph(token) || token)
        .join("") || "";
}
