export function createTextNode(text, kind = "text") {
    if (typeof text !== "string" || text.length === 0) {
        return null;
    }

    return {
        type: "text",
        text,
        kind
    };
}

export function createSequenceNode(items = []) {
    const filteredItems = items.filter(Boolean);

    if (filteredItems.length === 0) {
        return null;
    }

    if (filteredItems.length === 1) {
        return filteredItems[0];
    }

    return {
        type: "sequence",
        items: filteredItems
    };
}

export function createLayout(boxRole, axisBehavior, extra = {}) {
    return {
        boxRole,
        axisBehavior,
        nestingDepth: 0,
        fractionDepth: 0,
        maxFractionDepth: 0,
        containsFraction: false,
        ...extra
    };
}

export function roundEm(value) {
    return Math.round(value * 100) / 100;
}
