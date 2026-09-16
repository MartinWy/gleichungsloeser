import { getDefaultAtomWidth } from "./atomWidthCatalog.js";
import { defaultColumnLayoutProfile } from "./columnLayoutProfile.js";
import { estimateDelimiterExtraWidthEm } from "./delimiterWidthModel.js";
import { resolveInlineNodeGapEm, resolveIntraTextGapEm } from "./spacingProfile.js";
import { resolveGreekUnicodeGlyph } from "../greekSymbols.js";

const hiddenColumnWidthEm = 0;

function needsPowerParens(node) {
    return Boolean(node && !(
        node.type === "text"
        && ["number", "variable", "anchor"].includes(node.kind)
    ));
}

function resolveKindWidthProfile(kind = "text", profile = defaultColumnLayoutProfile) {
    return profile?.atomMinWidthEm?.byKind?.[kind] || profile?.atomMinWidthEm?.byKind?.text || {
        min: 0.9,
        perCharEm: 0.42,
        basePaddingEm: 0.36,
        leftPaddingEm: 0,
        rightPaddingEm: 0
    };
}

export function resolveAtomicTextWidthEm(text, kind = "text", profile = defaultColumnLayoutProfile) {
    const value = String(text || "").trim();
    const displayValue = resolveGreekUnicodeGlyph(value) || value;

    if (!value) {
        return hiddenColumnWidthEm;
    }

    const directWidth = profile?.atomMinWidthEm?.explicit?.[displayValue]
        ?? profile?.atomMinWidthEm?.byText?.[displayValue]
        ?? profile?.atomMinWidthEm?.explicit?.[value]
        ?? profile?.atomMinWidthEm?.byText?.[value]
        ?? getDefaultAtomWidth(displayValue)
        ?? getDefaultAtomWidth(value);

    const kindProfile = resolveKindWidthProfile(kind, profile);
    const leftPaddingEm = kindProfile.leftPaddingEm || 0;
    const rightPaddingEm = kindProfile.rightPaddingEm || 0;
    const intraTextGapEm = resolveIntraTextGapEm(displayValue, kind, profile);

    if (typeof directWidth === "number") {
        return directWidth + leftPaddingEm + rightPaddingEm;
    }

    if (displayValue.length <= 1) {
        return kindProfile.min + leftPaddingEm + rightPaddingEm;
    }

    return Math.max(
        kindProfile.min,
        (displayValue.length * (kindProfile.perCharEm || 0.42)) + (kindProfile.basePaddingEm || 0.36)
    ) + leftPaddingEm + rightPaddingEm + (Math.max(0, displayValue.length - 1) * intraTextGapEm);
}

function createWidthSlots(count = 0) {
    return Array.from({ length: Math.max(0, count) }, () => hiddenColumnWidthEm);
}

function addWidthToFirstSlot(widths = [], amount = 0) {
    if (!(amount > 0)) {
        return [...widths];
    }

    if (widths.length === 0) {
        return [amount];
    }

    const expanded = [...widths];
    expanded[0] += amount;
    return expanded;
}

function addWidthToLastSlot(widths = [], amount = 0) {
    if (!(amount > 0)) {
        return [...widths];
    }

    if (widths.length === 0) {
        return [amount];
    }

    const expanded = [...widths];
    expanded[expanded.length - 1] += amount;
    return expanded;
}

function addEdgeSpacing(widths = [], leftSpacing = 0, rightSpacing = leftSpacing) {
    const expanded = [...widths];

    if (expanded.length === 0) {
        return leftSpacing > 0 || rightSpacing > 0 ? [leftSpacing + rightSpacing] : expanded;
    }

    if (expanded.length === 1) {
        expanded[0] += leftSpacing + rightSpacing;
        return expanded;
    }

    expanded[0] += leftSpacing;
    expanded[expanded.length - 1] += rightSpacing;
    return expanded;
}

function prependWidthSlot(widths = [], amount = 0) {
    return [Math.max(0, amount), ...widths];
}

function appendWidthSlot(widths = [], amount = 0) {
    return [...widths, Math.max(0, amount)];
}

function createTextNodeStub(text, kind = "text") {
    return {
        type: "text",
        text,
        kind
    };
}

function fitWidthsToTargetCount(rawWidths = [], spanCount = 1) {
    const targetCount = Math.max(1, spanCount || rawWidths.length || 1);

    if (rawWidths.length === 0) {
        return createWidthSlots(targetCount);
    }

    if (rawWidths.length === targetCount) {
        return [...rawWidths];
    }

    if (rawWidths.length < targetCount) {
        return [
            ...rawWidths,
            ...createWidthSlots(targetCount - rawWidths.length)
        ];
    }

    const buckets = createWidthSlots(targetCount);

    rawWidths.forEach((width, index) => {
        const bucket = Math.min(targetCount - 1, Math.floor((index * targetCount) / rawWidths.length));
        buckets[bucket] += width;
    });

    return buckets;
}

function shellGlyphWidth(text, profile = defaultColumnLayoutProfile) {
    return resolveAtomicTextWidthEm(text, "text", profile);
}

function nodeContentHeightEm(node) {
    return Math.max(0, Number(node?.layout?.boxHeightEm) || 0);
}

function stretchedDelimiterWidth(baseWidth = 0, glyph = "(", contentNode = null, profile = defaultColumnLayoutProfile) {
    return Math.max(
        0,
        baseWidth || 0,
        shellGlyphWidth(glyph, profile) + estimateDelimiterExtraWidthEm(nodeContentHeightEm(contentNode), profile)
    );
}

export function resolveFunctionShellWidths(node, profile = defaultColumnLayoutProfile) {
    const displaySlots = profile?.displaySlotEm || {};
    const shellPadding = profile?.shellPaddingEm || {};

    return {
        name: Math.max(0, resolveAtomicTextWidthEm(node?.name || "f", "text", profile)),
        left: stretchedDelimiterWidth(
            displaySlots.functionLeft ?? displaySlots.groupLeft ?? 0,
            "(",
            node?.argument,
            profile
        ) + Math.max(0, shellPadding.functionLeftPrefix || 0),
        right: stretchedDelimiterWidth(
            displaySlots.functionRight ?? displaySlots.groupRight ?? 0,
            ")",
            node?.argument,
            profile
        ) + Math.max(0, shellPadding.functionRight || 0)
    };
}

export function resolveGroupShellWidths(node, profile = defaultColumnLayoutProfile) {
    const displaySlots = profile?.displaySlotEm || {};
    const shellPadding = profile?.shellPaddingEm || {};

    return {
        left: stretchedDelimiterWidth(
            displaySlots.groupLeft || 0,
            "(",
            node?.content,
            profile
        ) + Math.max(0, shellPadding.groupLeft || 0),
        right: stretchedDelimiterWidth(
            displaySlots.groupRight || 0,
            ")",
            node?.content,
            profile
        ) + Math.max(0, shellPadding.groupRight || 0)
    };
}

export function resolvePowerShellWidths(node, profile = defaultColumnLayoutProfile) {
    const displaySlots = profile?.displaySlotEm || {};
    const shellPadding = profile?.shellPaddingEm || {};
    const exponentWidth = resolveAtomicTextWidthEm(node?.exponent || "2", "number", profile);

    return {
        left: stretchedDelimiterWidth(
            displaySlots.powerWrapLeft ?? displaySlots.groupLeft ?? 0,
            "(",
            node?.base,
            profile
        ) + Math.max(0, shellPadding.powerWrappedBaseLeft || 0),
        right: stretchedDelimiterWidth(
            displaySlots.powerWrapRightBase ?? displaySlots.groupRight ?? 0,
            ")",
            node?.base,
            profile
        )
            + exponentWidth
            + Math.max(
                0,
                displaySlots.powerExponentOffset || 0,
                shellPadding.powerWrappedBaseRight || 0
            )
    };
}

export function resolveRootShellWidths(profile = defaultColumnLayoutProfile) {
    const displaySlots = profile?.displaySlotEm || {};
    const shellPadding = profile?.shellPaddingEm || {};

    return {
        lead: Math.max(0, displaySlots.rootLead || 0) + Math.max(0, shellPadding.rootLeft || 0),
        right: Math.max(0, shellPadding.rootRight || 0)
    };
}

function combineParallelWidths(upper = [], lower = [], targetCount = Math.max(1, upper.length, lower.length)) {
    const fittedUpper = fitWidthsToTargetCount(upper, targetCount);
    const fittedLower = fitWidthsToTargetCount(lower, targetCount);

    return Array.from({ length: targetCount }, (_, index) => Math.max(fittedUpper[index] || 0, fittedLower[index] || 0));
}

function joinWidthTracks(tracks = [], profile = defaultColumnLayoutProfile) {
    let combinedWidths = [];
    let previousTrack = null;

    tracks.forEach((track) => {
        const currentWidths = Array.isArray(track?.widths) ? [...track.widths] : [];

        if (currentWidths.length === 0) {
            return;
        }

        if (previousTrack) {
            const gap = resolveInlineNodeGapEm(previousTrack.node, track.node, profile);

            if (gap > 0) {
                combinedWidths = addWidthToLastSlot(combinedWidths, gap / 2);
                currentWidths[0] += gap / 2;
            }
        }

        combinedWidths = [...combinedWidths, ...currentWidths];
        previousTrack = track;
    });

    return combinedWidths;
}

function resolveNodeMeasureOptions(options = {}) {
    return {
        suppressOuterGroupShell: options?.suppressOuterGroupShell === true,
        externalizeVisibleShells: options?.externalizeVisibleShells === true
    };
}

export function buildNodeColumnWidths(node, targetCount = null, profile = defaultColumnLayoutProfile, options = {}) {
    const resolvedOptions = resolveNodeMeasureOptions(options);

    if (!node) {
        return targetCount === null ? [] : createWidthSlots(targetCount);
    }

    let rawWidths = [];

    switch (node.type) {
        case "text":
            rawWidths = [resolveAtomicTextWidthEm(node.text, node.kind, profile)];
            break;
        case "sequence":
            rawWidths = joinWidthTracks(
                (node.items || []).map((item) => ({
                    node: item,
                    widths: buildNodeColumnWidths(
                        item,
                        null,
                        profile,
                        {
                            ...resolvedOptions,
                            externalizeVisibleShells: false
                        }
                    )
                })),
                profile
            );
            break;
        case "group": {
            const contentWidths = buildNodeColumnWidths(
                node.content,
                null,
                profile,
                {
                    ...resolvedOptions,
                    suppressOuterGroupShell: false,
                    externalizeVisibleShells: false
                }
            );
            rawWidths = contentWidths.length > 0 ? contentWidths : createWidthSlots(1);

            if (!resolvedOptions.suppressOuterGroupShell && !resolvedOptions.externalizeVisibleShells) {
                const groupShellWidths = resolveGroupShellWidths(node, profile);
                rawWidths = prependWidthSlot(rawWidths, groupShellWidths.left);
                rawWidths = appendWidthSlot(rawWidths, groupShellWidths.right);
            }
            break;
        }
        case "root": {
            rawWidths = buildNodeColumnWidths(
                node.content,
                null,
                profile,
                {
                    ...resolvedOptions,
                    externalizeVisibleShells: false
                }
            );
            rawWidths = rawWidths.length > 0 ? rawWidths : createWidthSlots(1);

            if (!resolvedOptions.externalizeVisibleShells) {
                const rootShellWidths = resolveRootShellWidths(profile);
                rawWidths = addWidthToFirstSlot(rawWidths, rootShellWidths.lead);
                rawWidths = addWidthToLastSlot(rawWidths, rootShellWidths.right);
            }
            break;
        }
        case "function": {
            const argumentWidths = buildNodeColumnWidths(
                node.argument,
                null,
                profile,
                {
                    ...resolvedOptions,
                    suppressOuterGroupShell: true,
                    externalizeVisibleShells: false
                }
            );
            rawWidths = argumentWidths.length > 0 ? argumentWidths : createWidthSlots(1);

            if (!resolvedOptions.externalizeVisibleShells) {
                const functionShellWidths = resolveFunctionShellWidths(node, profile);
                rawWidths = [
                    Math.max(0, functionShellWidths.name),
                    Math.max(0, functionShellWidths.left),
                    ...rawWidths,
                    Math.max(0, functionShellWidths.right)
                ];
            }
            break;
        }
        case "multiplication": {
            let leftWidths = buildNodeColumnWidths(
                node.left,
                null,
                profile,
                {
                    ...resolvedOptions,
                    externalizeVisibleShells: false
                }
            );
            let rightWidths = buildNodeColumnWidths(
                node.right,
                null,
                profile,
                {
                    ...resolvedOptions,
                    externalizeVisibleShells: false
                }
            );

            if (typeof node.separator === "string" && node.separator.length > 0) {
                rawWidths = joinWidthTracks(
                    [
                        { node: node.left, widths: leftWidths },
                        {
                            node: createTextNodeStub(node.separator, "operator"),
                            widths: [resolveAtomicTextWidthEm(node.separator, "operator", profile)]
                        },
                        { node: node.right, widths: rightWidths }
                    ],
                    profile
                );
                break;
            }

            const implicitGap = profile?.shellPaddingEm?.implicitMultiplicationGap || 0;
            const neighborGap = resolveInlineNodeGapEm(node.left, node.right, profile);
            const totalGap = implicitGap + neighborGap;

            if (leftWidths.length > 0 && rightWidths.length > 0 && totalGap > 0) {
                leftWidths = addWidthToLastSlot(leftWidths, totalGap / 2);
                rightWidths = addWidthToFirstSlot(rightWidths, totalGap / 2);
            }

            rawWidths = [...leftWidths, ...rightWidths];
            break;
        }
        case "power": {
            const baseWidths = buildNodeColumnWidths(
                node.base,
                null,
                profile,
                {
                    ...resolvedOptions,
                    suppressOuterGroupShell: true,
                    externalizeVisibleShells: false
                }
            );

            if (needsPowerParens(node.base)) {
                rawWidths = [...baseWidths];

                if (!resolvedOptions.externalizeVisibleShells) {
                    const powerShellWidths = resolvePowerShellWidths(node, profile);
                    rawWidths = addWidthToFirstSlot(rawWidths, powerShellWidths.left);
                    rawWidths = addWidthToLastSlot(rawWidths, powerShellWidths.right);
                }
                break;
            }

            const exponentWidth = resolveAtomicTextWidthEm(node.exponent || "2", "number", profile);
            rawWidths = addWidthToLastSlot(
                baseWidths,
                exponentWidth + (profile?.shellPaddingEm?.powerExponentOffset || 0)
            );
            break;
        }
        case "negation":
            rawWidths = [
                resolveAtomicTextWidthEm("-", "operator", profile),
                ...buildNodeColumnWidths(
                    node.content,
                    null,
                    profile,
                    {
                        ...resolvedOptions,
                        externalizeVisibleShells: false
                    }
                )
            ];
            break;
        case "fraction": {
            const childOptions = {
                ...resolvedOptions,
                suppressOuterGroupShell: true,
                externalizeVisibleShells: false
            };
            const numeratorWidths = buildNodeColumnWidths(node.numerator, null, profile, childOptions);
            const denominatorWidths = buildNodeColumnWidths(node.denominator, null, profile, childOptions);
            const innerWidth = Math.max(1, numeratorWidths.length, denominatorWidths.length);

            rawWidths = combineParallelWidths(numeratorWidths, denominatorWidths, innerWidth);
            break;
        }
        default:
            rawWidths = [resolveAtomicTextWidthEm(node.text || "", "text", profile)];
            break;
    }

    if (targetCount === null) {
        return rawWidths;
    }

    return fitWidthsToTargetCount(rawWidths, targetCount);
}
