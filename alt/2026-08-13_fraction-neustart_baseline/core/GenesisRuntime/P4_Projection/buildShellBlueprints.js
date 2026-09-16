import {
    isRuntimeLeafNode,
    isRuntimeShellNode,
    isVisibleRuntimeNode
} from './projectionTraversal.js';
import { resolveShellProjectionLayout } from './shellLayoutRules.js';
import { serializeRuntimeCollection } from '../runtimeInlineFormat.js';

function mergeRanges(ranges = []) {
    const validRanges = ranges.filter((range) => (
        range
        && Number.isFinite(range.rawColStart)
        && Number.isFinite(range.rawColEnd)
    ));

    if (validRanges.length === 0) {
        return null;
    }

    return {
        rawColStart: Math.min(...validRanges.map((range) => range.rawColStart)),
        rawColEnd: Math.max(...validRanges.map((range) => range.rawColEnd))
    };
}

function buildSlotCoverageRange(slot) {
    if (Number.isFinite(slot?.rawColStart) && Number.isFinite(slot?.rawColEnd)) {
        return {
            rawColStart: slot.rawColStart,
            rawColEnd: slot.rawColEnd
        };
    }

    if (Number.isFinite(slot?.rawCol)) {
        return {
            rawColStart: slot.rawCol,
            rawColEnd: slot.rawCol
        };
    }

    return null;
}

function buildRowPlacementLookup(rowRaster) {
    const lookup = new Map();

    ["left", "right"].forEach((side) => {
        (rowRaster?.placements?.[side] || []).forEach((placement) => {
            lookup.set(`${side}::${placement.nodeId}`, placement);
        });
    });

    return lookup;
}

function buildShellMeta(node) {
    switch (node?.type) {
        case "DIVISION":
            return {
                fractionColumnMode: node.fractionColumnMode || "shared_vertical",
                sharedDenominatorAnchorLeafIds: Array.isArray(node.sharedDenominatorAnchorLeafIds)
                    ? [...new Set(node.sharedDenominatorAnchorLeafIds)]
                    : []
            };
        case "COLLECTION":
            return {
                transportSourceShellId: node.transportSourceShellId || null,
                transportAlignmentMode: node.transportAlignmentMode || null
            };
        case "FUNCTION":
            return {
                functionName: node.name
            };
        case "NEGATION":
            return {
                sign: node.sign || "-"
            };
        case "POWER":
            return {
                exponentValue: node.exponent ?? serializeRuntimeCollection(node.exponentNodes || [])
            };
        case "ROOT":
            return {
                degree: node.degree || 2
            };
        case "MULTIPLICATION":
            return {
                flowDirection: node.flowDirection || "ltr"
            };
        case "ADDITION":
            return {
                operatorSymbol: "+"
            };
        case "SUBTRACTION":
            return {
                operatorSymbol: "-"
            };
        default:
            return {};
    }
}

function resolveCollectionCoverage(nodes, context) {
    const blueprints = [];
    const coverageRanges = [];
    const leafIds = [];

    (Array.isArray(nodes) ? nodes : []).forEach((node, index) => {
        const resolvedNode = resolveNodeCoverage(node, {
            ...context,
            path: [...(context.path || ["nodes"]), String(index)]
        });

        if (!resolvedNode) {
            return;
        }

        blueprints.push(...resolvedNode.blueprints);
        if (resolvedNode.coverageRange) {
            coverageRanges.push(resolvedNode.coverageRange);
        }
        leafIds.push(...resolvedNode.leafIds);
    });

    return {
        blueprints,
        coverageRange: mergeRanges(coverageRanges),
        leafIds: [...new Set(leafIds)]
    };
}

function buildLeafCoverage(node, context) {
    const placement = context.placementLookup.get(`${context.side}::${node.id}`);

    if (!placement) {
        throw new Error(
            `[GenesisRuntime:P4] Blattknoten ${node.id} auf der ${context.side}-Seite hat keine Rasterspur.`
        );
    }

    return {
        blueprints: [],
        coverageRange: {
            rawColStart: placement.rawCol,
            rawColEnd: placement.rawCol
        },
        leafIds: [node.id]
    };
}

function resolveShellCollections(node, context) {
    if (node?.type === "DIVISION") {
        const numerator = resolveCollectionCoverage(node.numerator || [], {
            ...context,
            path: [...(context.path || ["node"]), "numerator"]
        });
        const denominator = resolveCollectionCoverage(node.denominator || [], {
            ...context,
            path: [...(context.path || ["node"]), "denominator"]
        });

        return {
            blueprints: [...numerator.blueprints, ...denominator.blueprints],
            contentRange: mergeRanges([
                numerator.coverageRange,
                denominator.coverageRange
            ]),
            collectionRanges: {
                numerator: numerator.coverageRange,
                denominator: denominator.coverageRange
            },
            collectionLeafIds: {
                numerator: numerator.leafIds,
                denominator: denominator.leafIds
            },
            leafIds: [...new Set([...numerator.leafIds, ...denominator.leafIds])]
        };
    }

    if (node?.type === "MULTIPLICATION") {
        const content = resolveCollectionCoverage(node.content || [], {
            ...context,
            path: [...(context.path || ["node"]), "content"]
        });
        const factor = resolveCollectionCoverage(node.factor || [], {
            ...context,
            path: [...(context.path || ["node"]), "factor"]
        });

        return {
            blueprints: [...content.blueprints, ...factor.blueprints],
            contentRange: mergeRanges([
                content.coverageRange,
                factor.coverageRange
            ]),
            collectionRanges: {
                content: content.coverageRange,
                factor: factor.coverageRange
            },
            collectionLeafIds: {
                content: content.leafIds,
                factor: factor.leafIds
            },
            leafIds: [...new Set([...content.leafIds, ...factor.leafIds])]
        };
    }

    if (["ADDITION", "SUBTRACTION"].includes(node?.type)) {
        const content = resolveCollectionCoverage(node.content || [], {
            ...context,
            path: [...(context.path || ["node"]), "content"]
        });
        const passive = resolveCollectionCoverage(node.passive || [], {
            ...context,
            path: [...(context.path || ["node"]), "passive"]
        });

        return {
            blueprints: [...content.blueprints, ...passive.blueprints],
            contentRange: mergeRanges([
                content.coverageRange,
                passive.coverageRange
            ]),
            collectionRanges: {
                content: content.coverageRange,
                passive: passive.coverageRange
            },
            collectionLeafIds: {
                content: content.leafIds,
                passive: passive.leafIds
            },
            leafIds: [...new Set([...content.leafIds, ...passive.leafIds])]
        };
    }

    const content = resolveCollectionCoverage(node.content || [], {
        ...context,
        path: [...(context.path || ["node"]), "content"]
    });

    return {
        blueprints: content.blueprints,
        contentRange: content.coverageRange,
        collectionRanges: {
            content: content.coverageRange
        },
        collectionLeafIds: {
            content: content.leafIds
        },
        leafIds: content.leafIds
    };
}

function resolveNodeCoverage(node, context) {
    if (!isVisibleRuntimeNode(node)) {
        return null;
    }

    if (isRuntimeLeafNode(node)) {
        return buildLeafCoverage(node, context);
    }

    if (!isRuntimeShellNode(node)) {
        return null;
    }

    const resolvedCollections = resolveShellCollections(node, context);
    if (!resolvedCollections.contentRange) {
        return {
            blueprints: resolvedCollections.blueprints,
            coverageRange: null,
            leafIds: resolvedCollections.leafIds
        };
    }

    const blueprintBase = {
        rowId: context.rowId,
        side: context.side,
        shellId: node.id,
        rowShellKey: `${context.rowId}::${node.id}`,
        shellType: node.type,
        contentRange: resolvedCollections.contentRange,
        collectionRanges: resolvedCollections.collectionRanges,
        collectionLeafIds: resolvedCollections.collectionLeafIds,
        contentLeafIds: resolvedCollections.leafIds,
        meta: buildShellMeta(node)
    };
    const layout = resolveShellProjectionLayout(blueprintBase);
    const containerRange = mergeRanges([
        blueprintBase.contentRange,
        ...((layout.slots || []).map(buildSlotCoverageRange))
    ]);
    const blueprint = {
        ...blueprintBase,
        containerRange,
        slotLayout: layout.slots || []
    };

    return {
        blueprints: [...resolvedCollections.blueprints, blueprint],
        coverageRange: containerRange,
        leafIds: resolvedCollections.leafIds
    };
}

function buildShellBlueprints(theoryRows = [], semanticRaster = null) {
    const rowLookup = new Map((semanticRaster?.rows || []).map((row) => [row.rowId, row]));
    const blueprints = [];

    theoryRows.forEach((row) => {
        const rowRaster = rowLookup.get(row.rowId) || null;
        const placementLookup = buildRowPlacementLookup(rowRaster);

        ["left", "right"].forEach((side) => {
            const resolvedSide = resolveCollectionCoverage(row?.[side] || [], {
                rowId: row.rowId,
                side,
                placementLookup,
                path: [row.rowId, side]
            });

            blueprints.push(...resolvedSide.blueprints);
        });
    });

    return blueprints;
}

export {
    buildShellBlueprints
};
