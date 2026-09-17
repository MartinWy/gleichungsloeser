import {
    isRuntimeLeafNode,
    isRuntimeShellNode,
    isVisibleRuntimeNode
} from './projectionTraversal.js';
import { resolveShellProjectionLayout } from './shellLayoutRules.js';
import { cloneRuntimeValue } from '../runtimeClone.js';

const P4_GLOBAL_CELL_PLACEMENT_PLAN_VERSION = "p4_global_cell_placement_plan_v1";

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

function buildShellRegistryKey(side, shellId) {
    return `${String(side || "unknown")}::${String(shellId || "missing-shell-id")}`;
}

function buildLeafRegistryKey(trackKey) {
    if (typeof trackKey !== "string" || trackKey.length === 0) {
        throw new Error("[GenesisRuntime:P4] Eine Blatt-Geburtslage benoetigt einen eindeutigen Spurabschnitt.");
    }

    return trackKey;
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
        collectionAlignmentRanges: Object.fromEntries(
            Object.entries(blueprint.collectionAlignmentRanges || {}).map(([key, range]) => [
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
            rawCol: placement.rawCol + delta,
            rawColStart: Number.isFinite(placement.rawColStart)
                ? placement.rawColStart + delta
                : placement.rawColStart,
            rawColEnd: Number.isFinite(placement.rawColEnd)
                ? placement.rawColEnd + delta
                : placement.rawColEnd
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

function assignDirectSingletonAlignmentCell(localizedResult = null, nodes = [], alignmentRange = null) {
    const visibleNodes = (Array.isArray(nodes) ? nodes : []).filter(isVisibleRuntimeNode);
    const isDirectSingleton = visibleNodes.length === 1
        && isRuntimeLeafNode(visibleNodes[0])
        && localizedResult?.leafPlacements?.length === 1;

    if (
        !isDirectSingleton
        || !alignmentRange
        || !Number.isFinite(alignmentRange.rawColStart)
        || !Number.isFinite(alignmentRange.rawColEnd)
    ) {
        return localizedResult;
    }

    return {
        ...localizedResult,
        leafPlacements: localizedResult.leafPlacements.map((placement) => ({
            ...placement,
            rawColStart: alignmentRange.rawColStart,
            rawColEnd: alignmentRange.rawColEnd
        }))
    };
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

function hasExplicitLocalizedGeometry(localizedResult = null) {
    const coverageRange = localizedResult?.coverageRange || localizedResult?.alignmentRange || null;
    const hasRange = coverageRange
        && Number.isFinite(coverageRange.rawColStart)
        && Number.isFinite(coverageRange.rawColEnd);
    const hasLeafPlacements = Array.isArray(localizedResult?.leafPlacements)
        && localizedResult.leafPlacements.some((placement) => Number.isFinite(placement?.rawCol));

    return hasRange || hasLeafPlacements;
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

function shouldPreserveAbsoluteBirthGeometry(node = null, meta = null) {
    if (!node || node.isVisible === false) {
        return false;
    }

    /*
     * Prinzipvertrag:
     * Dieselbe sichtbare Schale mit derselben Signatur auf derselben Seite
     * behaelt ihre absolute Geburtsgeometrie. Spaetere Elternschalen duerfen
     * nur neue Slots um diesen Block herum ergaenzen, aber den vorhandenen
     * Inhalt nicht horizontal neu platzieren.
     *
     * Explizite Transport-COLLECTIONs haben bereits einen eigenen
     * Ausrichtungsvertrag ueber `transportAlignmentMode`.
     */
    if (node.type === "COLLECTION" && meta?.transportAlignmentMode) {
        return false;
    }

    return true;
}

function alignDivisionCollections(numeratorResult, denominatorResult, meta = {}) {
    const numeratorRange = numeratorResult?.coverageRange || numeratorResult?.alignmentRange || null;
    const denominatorRange = denominatorResult?.coverageRange || denominatorResult?.alignmentRange || null;
    const numeratorWidth = resolveRangeWidth(numeratorRange);
    const denominatorWidth = resolveRangeWidth(denominatorRange);
    const numeratorFrozen = numeratorResult?.isFrozenGeometry === true;
    const denominatorFrozen = denominatorResult?.isFrozenGeometry === true;

    /*
     * Vertrag:
     * Ein Bruch darf nur in seiner Geburtszeile ausgerichtet werden.
     * Sobald die Shell bereits geboren wurde, bleibt ihre innere Geometrie
     * unberuehrt; ab dann darf nur noch der komplette Block transportiert werden.
     */
    if (meta?.hasStoredBirthGeometry === true) {
        return {
            numeratorResult,
            denominatorResult
        };
    }

    /*
     * Eine explizite P3-Nennererweiterung ist keine freie Bruchgeburt:
     * Zaehler und alter Nenner besitzen bereits ihre fortlaufenden Spuren.
     * Der neue Nennerfaktor waechst nur am aeusseren Rand an. Eine erneute
     * Zentrierung wuerde die unveraenderte alte Nennerbahn verschieben.
     */
    if (typeof meta?.extendedFromDivisionId === "string" && meta.extendedFromDivisionId.length > 0) {
        return {
            numeratorResult,
            denominatorResult
        };
    }

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

function alignAdditiveCollections(contentResult, passiveResult, meta = {}) {
    const contentRange = contentResult?.alignmentRange || contentResult?.coverageRange || null;
    const passiveRange = passiveResult?.alignmentRange || passiveResult?.coverageRange || null;
    const flowDirection = meta?.flowDirection || "ltr";

    /*
     * Vertrag:
     * Bei Addition/Subtraktion bleibt der bestehende Inhaltsblock stehen.
     * Nur der neu angehaengte passive Block wird so verschoben, dass genau
     * ein eigener Operatorslot zwischen beiden Teilbereichen frei bleibt.
     *
     * Sobald die Shell bereits geboren wurde, darf ihre innere Geometrie
     * nicht mehr neu berechnet werden.
     */
    if (meta?.hasStoredBirthGeometry === true) {
        return {
            contentResult,
            passiveResult
        };
    }

    if (!contentRange || !passiveRange) {
        return {
            contentResult,
            passiveResult
        };
    }

    const leftRange = flowDirection === "rtl" ? passiveRange : contentRange;
    const rightRange = flowDirection === "rtl" ? contentRange : passiveRange;
    if (
        !Number.isFinite(leftRange.rawColEnd)
        || !Number.isFinite(rightRange.rawColStart)
    ) {
        return {
            contentResult,
            passiveResult
        };
    }

    const deficit = (leftRange.rawColEnd + 2) - rightRange.rawColStart;
    if (deficit <= 0) {
        return {
            contentResult,
            passiveResult
        };
    }

    return flowDirection === "rtl"
        ? {
            contentResult,
            passiveResult: shiftLocalizedResult(passiveResult, -deficit)
        }
        : {
            contentResult,
            passiveResult: shiftLocalizedResult(passiveResult, deficit)
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

function resolveLocalizedRange(localizedResult = null) {
    return localizedResult?.alignmentRange || localizedResult?.coverageRange || null;
}

function shiftLocalizedRangeEdge(localizedResult, targetEdge, edge = "start") {
    const range = resolveLocalizedRange(localizedResult);
    const currentEdge = edge === "end" ? range?.rawColEnd : range?.rawColStart;

    if (!Number.isFinite(targetEdge) || !Number.isFinite(currentEdge)) {
        throw new Error("[GenesisRuntime:P4] Die Nennererweiterung besitzt keine eindeutige Aussenkante.");
    }

    return shiftLocalizedResult(localizedResult, targetEdge - currentEdge);
}

function buildDenominatorExtensionCollections(node, context) {
    const factors = (node.factors || []).filter(isVisibleRuntimeNode);
    const operators = (node.operators || []).filter(isVisibleRuntimeNode);

    if (factors.length < 2 || operators.length !== factors.length - 1) {
        throw new Error(
            "[GenesisRuntime:P4] Die Nennererweiterung braucht eine kanonische Faktoren- und Operatorfolge."
        );
    }

    const growsLeft = context.side === "left";
    const newFactorIndex = growsLeft ? 0 : factors.length - 1;
    const joiningOperatorIndex = growsLeft ? 0 : operators.length - 1;
    const newFactorResult = localizeCollection([factors[newFactorIndex]], context);
    const joiningOperatorResult = localizeCollection([operators[joiningOperatorIndex]], context);
    const existingFactorResult = localizeCollection(
        factors.filter((_, index) => index !== newFactorIndex),
        context
    );
    const existingOperatorResult = localizeCollection(
        operators.filter((_, index) => index !== joiningOperatorIndex),
        context
    );
    const existingRange = mergeRanges([
        existingFactorResult.coverageRange,
        existingOperatorResult.coverageRange
    ]);

    if (!existingRange) {
        throw new Error("[GenesisRuntime:P4] Der Nennererweiterung fehlt der bestehende Nennerblock.");
    }

    let placedNewFactor;
    let placedJoiningOperator;
    if (growsLeft) {
        const operatorCol = existingRange.rawColStart - 2;
        placedJoiningOperator = shiftLocalizedRangeEdge(joiningOperatorResult, operatorCol, "start");
        placedNewFactor = shiftLocalizedRangeEdge(newFactorResult, operatorCol - 2, "end");
    } else {
        const operatorCol = existingRange.rawColEnd + 2;
        placedJoiningOperator = shiftLocalizedRangeEdge(joiningOperatorResult, operatorCol, "start");
        placedNewFactor = shiftLocalizedRangeEdge(newFactorResult, operatorCol + 2, "start");
    }

    const factorResults = growsLeft
        ? [placedNewFactor, existingFactorResult]
        : [existingFactorResult, placedNewFactor];
    const operatorResults = growsLeft
        ? [placedJoiningOperator, existingOperatorResult]
        : [existingOperatorResult, placedJoiningOperator];
    const allResults = [...factorResults, ...operatorResults];

    return {
        blueprints: allResults.flatMap((result) => result.blueprints),
        contentRange: mergeRanges(allResults.map((result) => result.coverageRange)),
        alignmentRange: mergeRanges(allResults.map((result) => result.alignmentRange)),
        collectionRanges: {
            factors: mergeRanges(factorResults.map((result) => result.coverageRange)),
            operators: mergeRanges(operatorResults.map((result) => result.coverageRange))
        },
        collectionAlignmentRanges: {
            factors: mergeRanges(factorResults.map((result) => result.alignmentRange || result.coverageRange)),
            operators: mergeRanges(operatorResults.map((result) => result.alignmentRange || result.coverageRange))
        },
        collectionLeafIds: {
            factors: collectUniqueLeafIds(factorResults.flatMap((result) => result.leafPlacements)),
            operators: collectUniqueLeafIds(operatorResults.flatMap((result) => result.leafPlacements))
        },
        leafPlacements: allResults.flatMap((result) => result.leafPlacements),
        isFrozenGeometry: allResults.some((result) => result.isFrozenGeometry === true)
    };
}

function localizeLeaf(node, context) {
    const placement = context.placementLookup.get(`${context.side}::${node.id}`);

    if (!placement) {
        throw new Error(
            `[GenesisRuntime:P4] Blattknoten ${node.id} auf der ${context.side}-Seite hat keine Rasterspur.`
        );
    }

    const storedBirthPlacement = context.leafBirthRegistry?.get(
        buildLeafRegistryKey(placement.trackKey)
    ) || null;
    const rawCol = Number.isFinite(storedBirthPlacement?.rawCol)
        ? storedBirthPlacement.rawCol
        : placement.rawCol;
    const rawColStart = Number.isFinite(storedBirthPlacement?.rawColStart)
        ? storedBirthPlacement.rawColStart
        : rawCol;
    const rawColEnd = Number.isFinite(storedBirthPlacement?.rawColEnd)
        ? storedBirthPlacement.rawColEnd
        : rawCol;

    return {
        blueprints: [],
        coverageRange: {
            rawColStart,
            rawColEnd
        },
        alignmentRange: {
            rawColStart,
            rawColEnd
        },
        leafPlacements: [{
            rowId: context.rowId,
            side: context.side,
            nodeId: node.id,
            semanticKey: placement.semanticKey,
            trackKey: placement.trackKey,
            trackSegmentIndex: placement.trackSegmentIndex,
            rawCol,
            rawColStart,
            rawColEnd
        }],
        isFrozenGeometry: Boolean(storedBirthPlacement)
    };
}

function finalizeSideBirthGeometry(localizedSide, context) {
    const finalLeafPlacements = Array.isArray(localizedSide?.leafPlacements)
        ? localizedSide.leafPlacements
        : [];
    finalLeafPlacements.forEach((placement) => {
        const registryKey = buildLeafRegistryKey(placement.trackKey);
        if (!context.leafBirthRegistry?.has(registryKey)) {
            context.leafBirthRegistry?.set(registryKey, {
                rawCol: placement.rawCol,
                rawColStart: Number.isFinite(placement.rawColStart)
                    ? placement.rawColStart
                    : placement.rawCol,
                rawColEnd: Number.isFinite(placement.rawColEnd)
                    ? placement.rawColEnd
                    : placement.rawCol,
                geometryBirthRowId: context.rowId
            });
        }
    });

    context.shellBirthRegistry?.forEach((registryEntry, registryKey) => {
        if (
            !registryKey.startsWith(`${context.side}::`)
            || registryEntry?.birthRowId !== context.rowId
            || !registryEntry.snapshot
        ) {
            return;
        }

        const delta = resolveStoredGeometryDelta(
            registryEntry.snapshot,
            { leafPlacements: finalLeafPlacements }
        );
        registryEntry.snapshot = shiftLocalizedResult(registryEntry.snapshot, delta);
    });
}

function localizeNamedCollections(node, keys, context) {
    const results = keys.map((key) => {
        const nodes = Array.isArray(node?.[key])
            ? node[key]
            : (node?.[key] ? [node[key]] : []);

        return [key, localizeCollection(nodes, context)];
    });

    return {
        blueprints: results.flatMap(([, result]) => result.blueprints),
        contentRange: mergeRanges(results.map(([, result]) => result.coverageRange)),
        alignmentRange: mergeRanges(results.map(([, result]) => result.alignmentRange)),
        collectionRanges: Object.fromEntries(
            results.map(([key, result]) => [key, result.coverageRange])
        ),
        collectionAlignmentRanges: Object.fromEntries(
            results.map(([key, result]) => [key, result.alignmentRange || result.coverageRange])
        ),
        collectionLeafIds: Object.fromEntries(
            results.map(([key, result]) => [key, collectUniqueLeafIds(result.leafPlacements)])
        ),
        leafPlacements: results.flatMap(([, result]) => result.leafPlacements),
        isFrozenGeometry: results.some(([, result]) => result.isFrozenGeometry === true)
    };
}

function localizeShell(node, context) {
    const rowShellKey = `${context.rowId}::${node.id}`;
    const sourceBlueprint = context.blueprintLookup?.get(rowShellKey) || null;

    if (!sourceBlueprint) {
        throw new Error(`[GenesisRuntime:P4] Fuer die sichtbare Schale ${rowShellKey} fehlt der Eingabe-Blueprint.`);
    }

    if (sourceBlueprint.side !== context.side || sourceBlueprint.shellType !== node.type) {
        throw new Error(`[GenesisRuntime:P4] Der Eingabe-Blueprint ${rowShellKey} widerspricht der sichtbaren Schale.`);
    }

    context.consumedBlueprintKeys?.add(rowShellKey);
    const meta = cloneRuntimeValue(sourceBlueprint.meta || {});
    const shellRegistryKey = buildShellRegistryKey(context.side, node.id);
    const hasStoredBirthGeometry = context.shellBirthRegistry?.has(shellRegistryKey) === true;
    let resolvedCollections = null;

    if (node.type === "DIVISION") {
        const numeratorNodes = node.numerator || [];
        const denominatorNodes = node.denominator || [];
        let numeratorResult = localizeCollection(numeratorNodes, context);
        let denominatorResult = localizeCollection(denominatorNodes, context);

        if (meta.fractionColumnMode === "shared_vertical") {
            const alignedCollections = alignDivisionCollections(
                numeratorResult,
                denominatorResult,
                {
                    ...meta,
                    hasStoredBirthGeometry
                }
            );
            numeratorResult = alignedCollections.numeratorResult;
            denominatorResult = alignedCollections.denominatorResult;
        }

        const fractionAlignmentRange = mergeRanges([
            numeratorResult.coverageRange || numeratorResult.alignmentRange,
            denominatorResult.coverageRange || denominatorResult.alignmentRange
        ]);
        numeratorResult = assignDirectSingletonAlignmentCell(
            numeratorResult,
            numeratorNodes,
            fractionAlignmentRange
        );
        denominatorResult = assignDirectSingletonAlignmentCell(
            denominatorResult,
            denominatorNodes,
            fractionAlignmentRange
        );
        resolvedCollections = {
            blueprints: [...numeratorResult.blueprints, ...denominatorResult.blueprints],
            contentRange: mergeRanges([
                numeratorResult.coverageRange,
                denominatorResult.coverageRange
            ]),
            alignmentRange: fractionAlignmentRange,
            collectionRanges: {
                numerator: numeratorResult.coverageRange,
                denominator: denominatorResult.coverageRange
            },
            collectionAlignmentRanges: {
                numerator: fractionAlignmentRange,
                denominator: fractionAlignmentRange
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
    } else if (
        node.type === "MULTIPLICATION"
        && typeof meta.extendedFromDenominatorId === "string"
        && meta.extendedFromDenominatorId.length > 0
        && meta.generatedByAction === "MOVE_PASSIVE_EXPRESSION_TO_EXISTING_DENOMINATOR"
    ) {
        resolvedCollections = buildDenominatorExtensionCollections(node, context);
    } else if (node.type === "COLLECTION") {
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
            collectionAlignmentRanges: {
                content: transportedAlignmentRange || localizedContentResult.alignmentRange
            },
            collectionLeafIds: {
                content: collectUniqueLeafIds(localizedContentResult.leafPlacements)
            },
            leafPlacements: [...localizedContentResult.leafPlacements],
            isFrozenGeometry: transportedAlignmentRange ? true : localizedContentResult.isFrozenGeometry
        };
    } else {
        const collectionKeysByType = {
            MULTIPLICATION: ["factors", "operators"],
            ADDITION: ["terms", "operators"],
            SUBTRACTION: ["minuend", "operator", "subtrahend"],
            NEGATION: ["operator", "content"],
            POWER: ["content", "exponentNodes"],
            FUNCTION: ["baseContent", "content"],
            ROOT: ["degreeNodes", "content"],
            GROUP: ["content"]
        };
        resolvedCollections = localizeNamedCollections(
            node,
            collectionKeysByType[node.type] || ["content"],
            context
        );
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
        ...cloneRuntimeValue(sourceBlueprint),
        rowId: context.rowId,
        side: context.side,
        shellId: node.id,
        rowShellKey,
        shellType: node.type,
        contentRange: resolvedCollections.contentRange,
        alignmentRange: resolvedCollections.alignmentRange,
        collectionRanges: resolvedCollections.collectionRanges,
        collectionAlignmentRanges: resolvedCollections.collectionAlignmentRanges,
        collectionLeafIds: resolvedCollections.collectionLeafIds,
        contentLeafIds: [...new Set(resolvedCollections.leafPlacements.map((placement) => placement.nodeId))],
        meta,
        geometryBirthRowId: context.rowId
    };
    const layout = resolveShellProjectionLayout(blueprintBase);
    const visibleLayoutSlots = (layout.slots || []).filter((slot) => slot?.isVisible !== false);
    const containerRange = mergeRanges([
        blueprintBase.contentRange,
        blueprintBase.alignmentRange,
        ...(visibleLayoutSlots.map(buildSlotCoverageRange))
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

    const shellSignature = buildShellGeometrySignature(node, meta, resolvedCollections.leafPlacements);
    const existingBirthGeometry = context.shellBirthRegistry?.get(shellRegistryKey) || null;

    if (existingBirthGeometry && existingBirthGeometry.signature === shellSignature) {
        const preserveAbsoluteBirthGeometry = shouldPreserveAbsoluteBirthGeometry(node, meta);
        const restoreDelta = preserveAbsoluteBirthGeometry
            ? 0
            : resolveStoredGeometryDelta(existingBirthGeometry.snapshot, currentResult);
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
        birthRowId: context.rowId,
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

function planGlobalCellPlacement(theoryRows = [], semanticRaster = null, shellBlueprints = []) {
    if (!Array.isArray(shellBlueprints)) {
        throw new Error("[GenesisRuntime:P4] Die lokale Geometrie benoetigt die fertigen Shell Blueprints.");
    }

    const rowRasterLookup = new Map((semanticRaster?.rows || []).map((row) => [row.rowId, row]));
    const blueprintLookup = new Map();
    const consumedBlueprintKeys = new Set();

    shellBlueprints.forEach((blueprint) => {
        const key = blueprint?.rowShellKey || `${blueprint?.rowId}::${blueprint?.shellId}`;
        if (blueprintLookup.has(key)) {
            throw new Error(`[GenesisRuntime:P4] Doppelter Shell Blueprint ${key}.`);
        }
        blueprintLookup.set(key, blueprint);
    });

    const localizedShellBlueprints = [];
    const localizedContentCols = new Map();
    const localizedContentSpans = new Map();
    const shellBirthRegistry = new Map();
    const leafBirthRegistry = new Map();

    theoryRows.forEach((row) => {
        const rowRaster = rowRasterLookup.get(row.rowId) || null;
        const placementLookup = buildPlacementLookup(rowRaster);

        ["left", "right"].forEach((side) => {
            const localizedSide = localizeCollection(row?.[side] || [], {
                rowId: row.rowId,
                side,
                placementLookup,
                leafBirthRegistry,
                shellBirthRegistry,
                blueprintLookup,
                consumedBlueprintKeys
            });

            finalizeSideBirthGeometry(localizedSide, {
                rowId: row.rowId,
                side,
                leafBirthRegistry,
                shellBirthRegistry
            });

            localizedShellBlueprints.push(...localizedSide.blueprints);

            localizedSide.leafPlacements.forEach((placement) => {
                localizedContentCols.set(
                    `${placement.rowId}::${placement.side}::${placement.nodeId}`,
                    placement.rawCol
                );
                localizedContentSpans.set(
                    `${placement.rowId}::${placement.side}::${placement.nodeId}`,
                    {
                        rawColStart: Number.isFinite(placement.rawColStart)
                            ? placement.rawColStart
                            : placement.rawCol,
                        rawColEnd: Number.isFinite(placement.rawColEnd)
                            ? placement.rawColEnd
                            : placement.rawCol
                    }
                );
            });
        });
    });

    if (consumedBlueprintKeys.size !== blueprintLookup.size) {
        const unusedBlueprints = [...blueprintLookup.keys()]
            .filter((key) => !consumedBlueprintKeys.has(key));
        throw new Error(`[GenesisRuntime:P4] Nicht lokalisierte Shell Blueprints: ${unusedBlueprints.join(", ")}.`);
    }

    return {
        contractVersion: P4_GLOBAL_CELL_PLACEMENT_PLAN_VERSION,
        localizedShellBlueprints,
        localizedContentCols,
        localizedContentSpans
    };
}

export {
    P4_GLOBAL_CELL_PLACEMENT_PLAN_VERSION,
    planGlobalCellPlacement
};
