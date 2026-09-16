import {
    isRuntimeLeafNode,
    isRuntimeShellNode,
    isVisibleRuntimeNode
} from './projectionTraversal.js';
import { resolveShellProjectionLayout } from './shellLayoutRules.js';
import { cloneRuntimeValue } from '../runtimeClone.js';
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

function buildPlacementLookup(rowRaster = null) {
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
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null,
                fractionColumnMode: node.fractionColumnMode || "shared_vertical",
                sharedDenominatorAnchorLeafIds: Array.isArray(node.sharedDenominatorAnchorLeafIds)
                    ? [...new Set(node.sharedDenominatorAnchorLeafIds)]
                    : []
            };
        case "COLLECTION":
            return {
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null,
                transportSourceShellId: node.transportSourceShellId || null,
                transportAlignmentMode: node.transportAlignmentMode || null
            };
        case "FUNCTION":
            return {
                functionName: node.name,
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "NEGATION":
            return {
                sign: node.sign || "-",
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "POWER":
            return {
                exponentValue: node.exponent ?? serializeRuntimeCollection(node.exponentNodes || []),
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "ROOT":
            return {
                degree: node.degree || 2,
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "MULTIPLICATION":
            return {
                flowDirection: node.flowDirection || "ltr",
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "ADDITION":
            return {
                operatorSymbol: "+",
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "SUBTRACTION":
            return {
                operatorSymbol: "-",
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        default:
            return {
                generatedByFamily: node?.generatedByFamily || null,
                generatedByAction: node?.generatedByAction || null
            };
    }
}

function buildShellRegistryKey(side, shellId) {
    return String(shellId || `${side}::missing-shell-id`);
}

function buildShellGeometrySignature(node, meta, leafPlacements = []) {
    const leafIds = [...new Set((leafPlacements || []).map((placement) => placement?.nodeId).filter(Boolean))]
        .sort((left, right) => String(left).localeCompare(String(right)));

    return JSON.stringify({
        shellType: node?.type || null,
        meta: cloneRuntimeValue(meta || {}),
        leafIds
    });
}

function cloneBlueprintSnapshotForStore(blueprint = null) {
    if (!blueprint) {
        return null;
    }

    const storedBlueprint = cloneRuntimeValue(blueprint);
    delete storedBlueprint.rowId;
    delete storedBlueprint.rowShellKey;
    return storedBlueprint;
}

function cloneLeafPlacementSnapshotForStore(placement = null) {
    if (!placement) {
        return null;
    }

    const storedPlacement = cloneRuntimeValue(placement);
    delete storedPlacement.rowId;
    return storedPlacement;
}

function createStoredLocalizedSnapshot(localizedResult = null) {
    if (!localizedResult) {
        return null;
    }

    return {
        coverageRange: cloneRuntimeValue(localizedResult.coverageRange),
        alignmentRange: cloneRuntimeValue(localizedResult.alignmentRange),
        blueprints: (localizedResult.blueprints || [])
            .map((blueprint) => cloneBlueprintSnapshotForStore(blueprint))
            .filter(Boolean),
        leafPlacements: (localizedResult.leafPlacements || [])
            .map((placement) => cloneLeafPlacementSnapshotForStore(placement))
            .filter(Boolean)
    };
}

function resolveStoredGeometryDelta(snapshot = null, currentResult = null) {
    const storedLeafPlacements = snapshot?.leafPlacements || [];
    const currentLeafPlacements = currentResult?.leafPlacements || [];
    const currentLeafById = new Map(
        currentLeafPlacements
            .filter((placement) => placement && typeof placement.nodeId === "string" && Number.isFinite(placement.rawCol))
            .map((placement) => [placement.nodeId, placement.rawCol])
    );

    for (const storedPlacement of storedLeafPlacements) {
        if (!storedPlacement || typeof storedPlacement.nodeId !== "string" || !Number.isFinite(storedPlacement.rawCol)) {
            continue;
        }

        if (currentLeafById.has(storedPlacement.nodeId)) {
            return currentLeafById.get(storedPlacement.nodeId) - storedPlacement.rawCol;
        }
    }

    const storedRange = snapshot?.alignmentRange || snapshot?.coverageRange || null;
    const currentRange = currentResult?.alignmentRange || currentResult?.coverageRange || null;

    if (
        storedRange
        && currentRange
        && Number.isFinite(storedRange.rawColStart)
        && Number.isFinite(currentRange.rawColStart)
    ) {
        return currentRange.rawColStart - storedRange.rawColStart;
    }

    return 0;
}

function restoreStoredLocalizedSnapshot(snapshot = null, rowId, side, delta = 0) {
    if (!snapshot) {
        return null;
    }

    const restoredResult = {
        coverageRange: cloneRuntimeValue(snapshot.coverageRange),
        alignmentRange: cloneRuntimeValue(snapshot.alignmentRange),
        blueprints: (snapshot.blueprints || []).map((blueprint) => ({
            ...cloneRuntimeValue(blueprint),
            rowId,
            side,
            rowShellKey: `${rowId}::${blueprint.shellId}`
        })),
        leafPlacements: (snapshot.leafPlacements || []).map((placement) => ({
            ...cloneRuntimeValue(placement),
            rowId,
            side
        })),
        isFrozenGeometry: true
    };

    return delta === 0 ? restoredResult : shiftLocalizedResult(restoredResult, delta);
}

function shiftRange(range = null, delta = 0) {
    if (!range || delta === 0) {
        return range;
    }

    return {
        rawColStart: range.rawColStart + delta,
        rawColEnd: range.rawColEnd + delta
    };
}

function shiftSlot(slot = null, delta = 0) {
    if (!slot || delta === 0) {
        return slot;
    }

    return {
        ...slot,
        rawCol: Number.isFinite(slot.rawCol) ? slot.rawCol + delta : slot.rawCol,
        rawColStart: Number.isFinite(slot.rawColStart) ? slot.rawColStart + delta : slot.rawColStart,
        rawColEnd: Number.isFinite(slot.rawColEnd) ? slot.rawColEnd + delta : slot.rawColEnd
    };
}

function shiftBlueprint(blueprint = null, delta = 0) {
    if (!blueprint || delta === 0) {
        return blueprint;
    }

    return {
        ...blueprint,
        contentRange: shiftRange(blueprint.contentRange, delta),
        alignmentRange: shiftRange(blueprint.alignmentRange, delta),
        containerRange: shiftRange(blueprint.containerRange, delta),
        collectionRanges: Object.fromEntries(
            Object.entries(blueprint.collectionRanges || {}).map(([key, range]) => [
                key,
                shiftRange(range, delta)
            ])
        ),
        slotLayout: (blueprint.slotLayout || []).map((slot) => shiftSlot(slot, delta))
    };
}

function shiftLocalizedResult(localizedResult = null, delta = 0) {
    if (!localizedResult || delta === 0) {
        return localizedResult;
    }

    return {
        ...localizedResult,
        coverageRange: shiftRange(localizedResult.coverageRange, delta),
        alignmentRange: shiftRange(localizedResult.alignmentRange, delta),
        blueprints: (localizedResult.blueprints || []).map((blueprint) => shiftBlueprint(blueprint, delta)),
        leafPlacements: (localizedResult.leafPlacements || []).map((placement) => ({
            ...placement,
            rawCol: placement.rawCol + delta
        }))
    };
}

function collectUniqueLeafIds(leafPlacements = []) {
    return [...new Set(
        (Array.isArray(leafPlacements) ? leafPlacements : [])
            .map((placement) => placement?.nodeId)
            .filter((nodeId) => typeof nodeId === "string" && nodeId.length > 0)
    )];
}

function resolveRangeWidth(range = null) {
    if (!range || !Number.isFinite(range.rawColStart) || !Number.isFinite(range.rawColEnd)) {
        return null;
    }

    return range.rawColEnd - range.rawColStart;
}

function resolveRangeCenter(range = null) {
    if (!range || !Number.isFinite(range.rawColStart) || !Number.isFinite(range.rawColEnd)) {
        return null;
    }

    return (range.rawColStart + range.rawColEnd) / 2;
}

function resolveCenteredRange(range = null, targetCenter = null) {
    const width = resolveRangeWidth(range);

    if (!Number.isFinite(width) || !Number.isFinite(targetCenter)) {
        return range;
    }

    const rawColStart = Math.round(targetCenter - (width / 2));

    return {
        rawColStart,
        rawColEnd: rawColStart + width
    };
}

function centerLocalizedResultOnRange(localizedResult, referenceRange) {
    const localizedRange = localizedResult?.alignmentRange || localizedResult?.coverageRange || null;
    const targetCenter = resolveRangeCenter(referenceRange);
    const targetRange = resolveCenteredRange(localizedRange, targetCenter);

    if (!localizedRange || !targetRange) {
        return localizedResult;
    }

    return shiftLocalizedResult(
        localizedResult,
        targetRange.rawColStart - localizedRange.rawColStart
    );
}

function resolveOrderedLeafPlacementCols(localizedResult = null) {
    return [...new Set(
        (localizedResult?.leafPlacements || [])
            .map((placement) => placement?.rawCol)
            .filter((rawCol) => Number.isFinite(rawCol))
    )].sort((left, right) => left - right);
}

function resolveLeafCoverageRange(localizedResult = null) {
    const leafCols = resolveOrderedLeafPlacementCols(localizedResult);

    if (leafCols.length === 0) {
        return null;
    }

    return {
        rawColStart: leafCols[0],
        rawColEnd: leafCols[leafCols.length - 1]
    };
}

function isLeafAnchoredAlignment(localizedResult = null) {
    const alignmentRange = localizedResult?.alignmentRange || localizedResult?.coverageRange || null;
    const leafCoverageRange = resolveLeafCoverageRange(localizedResult);

    if (!alignmentRange || !leafCoverageRange) {
        return false;
    }

    return alignmentRange.rawColStart === leafCoverageRange.rawColStart
        && alignmentRange.rawColEnd === leafCoverageRange.rawColEnd;
}

function hasSharedVerticalLeafAlignment(numeratorResult = null, denominatorResult = null) {
    const numeratorCols = resolveOrderedLeafPlacementCols(numeratorResult);
    const denominatorCols = resolveOrderedLeafPlacementCols(denominatorResult);

    if (numeratorCols.length === 0 || denominatorCols.length === 0) {
        return false;
    }

    if (numeratorCols.length !== denominatorCols.length) {
        return false;
    }

    return numeratorCols.every((rawCol, index) => rawCol === denominatorCols[index])
        && isLeafAnchoredAlignment(numeratorResult)
        && isLeafAnchoredAlignment(denominatorResult);
}

function isVisibleHullTransportShellType(shellType = null) {
    return ["FUNCTION", "GROUP", "ROOT"].includes(shellType);
}

function resolveShellTransportAlignmentRange(node = null, meta = {}, inheritedAlignmentRange = null, containerRange = null) {
    if (!isVisibleHullTransportShellType(node?.type)) {
        return inheritedAlignmentRange;
    }

    if (meta?.generatedByFamily || meta?.generatedByAction) {
        return inheritedAlignmentRange;
    }

    return containerRange || inheritedAlignmentRange;
}

function resolveStoredTransportAlignmentRange(shellBirthRegistry = null, side = null, shellId = null) {
    if (!(shellBirthRegistry instanceof Map) || typeof side !== "string" || typeof shellId !== "string" || shellId.length === 0) {
        return null;
    }

    const snapshotEntry = shellBirthRegistry.get(buildShellRegistryKey(side, shellId)) || null;
    const shellBlueprint = (snapshotEntry?.snapshot?.blueprints || []).find((blueprint) => blueprint?.shellId === shellId) || null;

    return cloneRuntimeValue(
        shellBlueprint?.alignmentRange
        || shellBlueprint?.containerRange
        || snapshotEntry?.snapshot?.alignmentRange
        || snapshotEntry?.snapshot?.coverageRange
        || null
    );
}

function alignDivisionCollections(numeratorResult, denominatorResult, meta = {}) {
    const numeratorRange = numeratorResult?.alignmentRange || numeratorResult?.coverageRange || null;
    const denominatorRange = denominatorResult?.alignmentRange || denominatorResult?.coverageRange || null;
    const numeratorCoverageRange = numeratorResult?.coverageRange || numeratorRange || null;
    const numeratorWidth = resolveRangeWidth(numeratorRange);
    const denominatorWidth = resolveRangeWidth(denominatorRange);
    const numeratorFrozen = numeratorResult?.isFrozenGeometry === true;
    const denominatorFrozen = denominatorResult?.isFrozenGeometry === true;

    if (
        !Number.isFinite(numeratorWidth)
        || !Number.isFinite(denominatorWidth)
        || !numeratorRange
        || !denominatorRange
    ) {
        return {
            numeratorResult,
            denominatorResult
        };
    }

    if (
        meta?.fractionColumnMode === "shared_vertical"
        && hasSharedVerticalLeafAlignment(numeratorResult, denominatorResult)
    ) {
        return {
            numeratorResult,
            denominatorResult
        };
    }

    if (meta?.generatedByFamily === "fraction_birth") {
        return {
            numeratorResult,
            denominatorResult: centerLocalizedResultOnRange(denominatorResult, numeratorRange)
        };
    }

    if (numeratorFrozen && !denominatorFrozen) {
        return {
            numeratorResult,
            denominatorResult: centerLocalizedResultOnRange(denominatorResult, numeratorRange)
        };
    }

    if (!numeratorFrozen && denominatorFrozen) {
        return {
            numeratorResult: centerLocalizedResultOnRange(numeratorResult, denominatorRange),
            denominatorResult
        };
    }

    if (numeratorFrozen && denominatorFrozen) {
        return {
            numeratorResult,
            denominatorResult
        };
    }

    if (numeratorWidth === denominatorWidth) {
        const numeratorCenter = resolveRangeCenter(numeratorRange);
        const denominatorCenter = resolveRangeCenter(denominatorRange);

        if (!Number.isFinite(numeratorCenter) || !Number.isFinite(denominatorCenter) || numeratorCenter === denominatorCenter) {
            return {
                numeratorResult,
                denominatorResult
            };
        }

        const targetRange = resolveCenteredRange(denominatorRange, numeratorCenter);
        return {
            numeratorResult,
            denominatorResult: shiftLocalizedResult(
                denominatorResult,
                targetRange.rawColStart - denominatorRange.rawColStart
            )
        };
    }

    if (numeratorWidth > denominatorWidth) {
        const targetRange = resolveCenteredRange(denominatorRange, resolveRangeCenter(numeratorRange));
        return {
            numeratorResult,
            denominatorResult: shiftLocalizedResult(
                denominatorResult,
                targetRange.rawColStart - denominatorRange.rawColStart
            )
        };
    }

    const targetRange = resolveCenteredRange(numeratorRange, resolveRangeCenter(denominatorRange));
    return {
        numeratorResult: shiftLocalizedResult(
            numeratorResult,
            targetRange.rawColStart - numeratorRange.rawColStart
        ),
        denominatorResult
    };
}

function localizeCollection(nodes, context) {
    const blueprints = [];
    const coverageRanges = [];
    const alignmentRanges = [];
    const leafPlacements = [];
    let isFrozenGeometry = false;

    (Array.isArray(nodes) ? nodes : []).forEach((node) => {
        const localizedNode = localizeNode(node, context);

        if (!localizedNode) {
            return;
        }

        blueprints.push(...localizedNode.blueprints);
        if (localizedNode.coverageRange) {
            coverageRanges.push(localizedNode.coverageRange);
        }
        if (localizedNode.alignmentRange) {
            alignmentRanges.push(localizedNode.alignmentRange);
        }
        leafPlacements.push(...localizedNode.leafPlacements);
        isFrozenGeometry = isFrozenGeometry || localizedNode.isFrozenGeometry === true;
    });

    return {
        blueprints,
        coverageRange: mergeRanges(coverageRanges),
        alignmentRange: mergeRanges(alignmentRanges),
        leafPlacements,
        isFrozenGeometry
    };
}

function localizeLeaf(node, context) {
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
        alignmentRange: {
            rawColStart: placement.rawCol,
            rawColEnd: placement.rawCol
        },
        leafPlacements: [{
            rowId: context.rowId,
            side: context.side,
            nodeId: node.id,
            rawCol: placement.rawCol
        }],
        isFrozenGeometry: false
    };
}

function localizeShell(node, context) {
    const meta = buildShellMeta(node);
    let resolvedCollections = null;

    if (node.type === "DIVISION") {
        let numeratorResult = localizeCollection(node.numerator || [], context);
        let denominatorResult = localizeCollection(node.denominator || [], context);

        if (meta.fractionColumnMode === "shared_vertical") {
            const alignedCollections = alignDivisionCollections(numeratorResult, denominatorResult, meta);
            numeratorResult = alignedCollections.numeratorResult;
            denominatorResult = alignedCollections.denominatorResult;
        }

        resolvedCollections = {
            blueprints: [...numeratorResult.blueprints, ...denominatorResult.blueprints],
            contentRange: mergeRanges([
                numeratorResult.coverageRange,
                denominatorResult.coverageRange
            ]),
            alignmentRange: mergeRanges([
                numeratorResult.alignmentRange,
                denominatorResult.alignmentRange
            ]),
            collectionRanges: {
                numerator: numeratorResult.coverageRange,
                denominator: denominatorResult.coverageRange
            },
            collectionLeafIds: {
                numerator: collectUniqueLeafIds(numeratorResult.leafPlacements),
                denominator: collectUniqueLeafIds(denominatorResult.leafPlacements)
            },
            leafPlacements: [
                ...numeratorResult.leafPlacements,
                ...denominatorResult.leafPlacements
            ],
            isFrozenGeometry: numeratorResult.isFrozenGeometry || denominatorResult.isFrozenGeometry
        };
    } else if (node.type === "MULTIPLICATION") {
        const contentResult = localizeCollection(node.content || [], context);
        const factorResult = localizeCollection(node.factor || [], context);
        resolvedCollections = {
            blueprints: [...contentResult.blueprints, ...factorResult.blueprints],
            contentRange: mergeRanges([
                contentResult.coverageRange,
                factorResult.coverageRange
            ]),
            alignmentRange: mergeRanges([
                contentResult.alignmentRange,
                factorResult.alignmentRange
            ]),
            collectionRanges: {
                content: contentResult.coverageRange,
                factor: factorResult.coverageRange
            },
            collectionLeafIds: {
                content: collectUniqueLeafIds(contentResult.leafPlacements),
                factor: collectUniqueLeafIds(factorResult.leafPlacements)
            },
            leafPlacements: [
                ...contentResult.leafPlacements,
                ...factorResult.leafPlacements
            ],
            isFrozenGeometry: contentResult.isFrozenGeometry || factorResult.isFrozenGeometry
        };
    } else if (["ADDITION", "SUBTRACTION"].includes(node.type)) {
        const contentResult = localizeCollection(node.content || [], context);
        const passiveResult = localizeCollection(node.passive || [], context);
        resolvedCollections = {
            blueprints: [...contentResult.blueprints, ...passiveResult.blueprints],
            contentRange: mergeRanges([
                contentResult.coverageRange,
                passiveResult.coverageRange
            ]),
            alignmentRange: mergeRanges([
                contentResult.alignmentRange,
                passiveResult.alignmentRange
            ]),
            collectionRanges: {
                content: contentResult.coverageRange,
                passive: passiveResult.coverageRange
            },
            collectionLeafIds: {
                content: collectUniqueLeafIds(contentResult.leafPlacements),
                passive: collectUniqueLeafIds(passiveResult.leafPlacements)
            },
            leafPlacements: [
                ...contentResult.leafPlacements,
                ...passiveResult.leafPlacements
            ],
            isFrozenGeometry: contentResult.isFrozenGeometry || passiveResult.isFrozenGeometry
        };
    } else {
        const contentResult = localizeCollection(node.content || [], context);
        const transportedAlignmentRange = node.type === "COLLECTION" && meta.transportAlignmentMode === "preserve_shell_band"
            ? resolveStoredTransportAlignmentRange(
                context.shellBirthRegistry,
                context.side,
                meta.transportSourceShellId
            )
            : null;
        const localizedContentResult = transportedAlignmentRange
            ? centerLocalizedResultOnRange(contentResult, transportedAlignmentRange)
            : contentResult;
        resolvedCollections = {
            blueprints: [...localizedContentResult.blueprints],
            contentRange: localizedContentResult.coverageRange,
            alignmentRange: transportedAlignmentRange || localizedContentResult.alignmentRange,
            collectionRanges: {
                content: localizedContentResult.coverageRange
            },
            collectionLeafIds: {
                content: collectUniqueLeafIds(localizedContentResult.leafPlacements)
            },
            leafPlacements: [...localizedContentResult.leafPlacements],
            isFrozenGeometry: transportedAlignmentRange ? true : localizedContentResult.isFrozenGeometry
        };
    }

    if (!resolvedCollections.contentRange) {
        return {
            blueprints: resolvedCollections.blueprints,
            coverageRange: null,
            alignmentRange: resolvedCollections.alignmentRange,
            leafPlacements: resolvedCollections.leafPlacements,
            isFrozenGeometry: resolvedCollections.isFrozenGeometry
        };
    }

    const blueprintBase = {
        rowId: context.rowId,
        side: context.side,
        shellId: node.id,
        rowShellKey: `${context.rowId}::${node.id}`,
        shellType: node.type,
        contentRange: resolvedCollections.contentRange,
        alignmentRange: resolvedCollections.alignmentRange,
        collectionRanges: resolvedCollections.collectionRanges,
        collectionLeafIds: resolvedCollections.collectionLeafIds,
        contentLeafIds: [...new Set(resolvedCollections.leafPlacements.map((placement) => placement.nodeId))],
        meta,
        geometryBirthRowId: context.rowId
    };
    const layout = resolveShellProjectionLayout(blueprintBase);
    const containerRange = mergeRanges([
        blueprintBase.contentRange,
        blueprintBase.alignmentRange,
        ...((layout.slots || []).map(buildSlotCoverageRange))
    ]);
    const shellAlignmentRange = resolveShellTransportAlignmentRange(
        node,
        meta,
        resolvedCollections.alignmentRange,
        containerRange
    );
    const blueprint = {
        ...blueprintBase,
        containerRange,
        alignmentRange: shellAlignmentRange,
        slotLayout: layout.slots || []
    };

    const currentResult = {
        blueprints: [...resolvedCollections.blueprints, blueprint],
        coverageRange: containerRange,
        alignmentRange: shellAlignmentRange,
        leafPlacements: resolvedCollections.leafPlacements,
        isFrozenGeometry: resolvedCollections.isFrozenGeometry
    };

    const shellRegistryKey = buildShellRegistryKey(context.side, node.id);
    const shellSignature = buildShellGeometrySignature(node, meta, resolvedCollections.leafPlacements);
    const existingBirthGeometry = context.shellBirthRegistry?.get(shellRegistryKey) || null;

    if (existingBirthGeometry && existingBirthGeometry.signature === shellSignature) {
        const restoreDelta = resolveStoredGeometryDelta(existingBirthGeometry.snapshot, currentResult);
        const restoredResult = restoreStoredLocalizedSnapshot(
            existingBirthGeometry.snapshot,
            context.rowId,
            context.side,
            restoreDelta
        );
        if (restoredResult) {
            return restoredResult;
        }
    }

    context.shellBirthRegistry?.set(shellRegistryKey, {
        signature: shellSignature,
        snapshot: createStoredLocalizedSnapshot(currentResult)
    });

    return {
        ...currentResult,
        isFrozenGeometry: false
    };
}

function localizeNode(node, context) {
    if (!isVisibleRuntimeNode(node)) {
        return null;
    }

    if (isRuntimeLeafNode(node)) {
        return localizeLeaf(node, context);
    }

    if (!isRuntimeShellNode(node)) {
        return null;
    }

    return localizeShell(node, context);
}

function localizeProjectionGeometry(theoryRows = [], semanticRaster = null) {
    const rowRasterLookup = new Map((semanticRaster?.rows || []).map((row) => [row.rowId, row]));
    const localizedShellBlueprints = [];
    const localizedContentCols = new Map();
    const shellBirthRegistry = new Map();

    theoryRows.forEach((row) => {
        const rowRaster = rowRasterLookup.get(row.rowId) || null;
        const placementLookup = buildPlacementLookup(rowRaster);

        ["left", "right"].forEach((side) => {
            const localizedSide = localizeCollection(row?.[side] || [], {
                rowId: row.rowId,
                side,
                placementLookup,
                shellBirthRegistry
            });

            localizedShellBlueprints.push(...localizedSide.blueprints);

            localizedSide.leafPlacements.forEach((placement) => {
                localizedContentCols.set(
                    `${placement.rowId}::${placement.side}::${placement.nodeId}`,
                    placement.rawCol
                );
            });
        });
    });

    return {
        localizedShellBlueprints,
        localizedContentCols
    };
}

export {
    localizeProjectionGeometry
};
