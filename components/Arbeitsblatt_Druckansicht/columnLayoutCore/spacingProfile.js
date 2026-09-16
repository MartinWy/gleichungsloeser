function normalizeNonNegativeSpacing(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric) || numeric <= 0) {
        return 0;
    }

    return numeric;
}

function resolveTextValue(text = "") {
    const value = String(text || "").trim();
    return value.length > 0 ? value : null;
}

function resolveNodeRole(node) {
    if (!node) {
        return "empty";
    }

    if (node.type === "text") {
        return node.kind || "text";
    }

    return node.type || "unknown";
}

function resolveNodeText(node) {
    if (!node || node.type !== "text") {
        return null;
    }

    return resolveTextValue(node.text);
}

function resolveInlineSpacingConfig(profile = {}) {
    return profile?.spacingEm || {};
}

function resolveSemanticBoundaryConfig(profile = {}) {
    return profile?.semanticBoundaryGapEm
        || resolveInlineSpacingConfig(profile)?.semanticBoundary
        || {};
}

export function resolveIntraTextGapEm(text, kind = "text", profile = {}) {
    const value = resolveTextValue(text);

    if (!value || value.length <= 1) {
        return 0;
    }

    const config = resolveInlineSpacingConfig(profile)?.intraText || {};
    const byTextGap = config?.byText?.[value];

    if (typeof byTextGap === "number") {
        return normalizeNonNegativeSpacing(byTextGap);
    }

    const byKindGap = config?.byKind?.[kind];

    if (typeof byKindGap === "number") {
        return normalizeNonNegativeSpacing(byKindGap);
    }

    return normalizeNonNegativeSpacing(config?.default);
}

export function resolveInlineNodeGapEm(leftNode, rightNode, profile = {}) {
    if (!leftNode || !rightNode) {
        return 0;
    }

    const config = resolveInlineSpacingConfig(profile)?.betweenNodes || {};
    const leftText = resolveNodeText(leftNode);
    const rightText = resolveNodeText(rightNode);

    if (leftText && rightText) {
        const byTextPairGap = config?.byTextPair?.[`${leftText}|${rightText}`];

        if (typeof byTextPairGap === "number") {
            return normalizeNonNegativeSpacing(byTextPairGap);
        }
    }

    const leftRole = resolveNodeRole(leftNode);
    const rightRole = resolveNodeRole(rightNode);
    const byNodeRolePairGap = config?.byNodeRolePair?.[`${leftRole}|${rightRole}`];

    if (typeof byNodeRolePairGap === "number") {
        return normalizeNonNegativeSpacing(byNodeRolePairGap);
    }

    return normalizeNonNegativeSpacing(config?.default);
}

export function resolveSemanticBoundaryGapEm(leftCell, rightCell, profile = {}) {
    const config = resolveSemanticBoundaryConfig(profile);
    const defaultGap = normalizeNonNegativeSpacing(config?.default);
    const candidates = [defaultGap];
    const leftRole = leftCell?.projectionRole || null;
    const rightRole = rightCell?.projectionRole || null;
    const leftKind = leftCell?.kind || null;
    const rightKind = rightCell?.kind || null;
    const leftBoxRole = leftCell?.renderNode?.layout?.boxRole || null;
    const rightBoxRole = rightCell?.renderNode?.layout?.boxRole || null;

    if (leftRole && rightRole) {
        const roleGap = config?.byRolePair?.[`${leftRole}|${rightRole}`];
        if (typeof roleGap === "number") {
            candidates.push(normalizeNonNegativeSpacing(roleGap));
        }
    }

    if (leftKind && rightKind) {
        const kindGap = config?.byKindPair?.[`${leftKind}|${rightKind}`];
        if (typeof kindGap === "number") {
            candidates.push(normalizeNonNegativeSpacing(kindGap));
        }
    }

    if (leftBoxRole && rightBoxRole) {
        const boxGap = config?.byBoxRolePair?.[`${leftBoxRole}|${rightBoxRole}`];
        if (typeof boxGap === "number") {
            candidates.push(normalizeNonNegativeSpacing(boxGap));
        }
    }

    return Math.max(0, ...candidates);
}
