import { normalizeTargetVariableInput } from "./inputAdapter.js";
import { buildCellMetrics, buildRenderNode, buildStepRowKinds, buildStepRowMetrics, formatCellText } from "./renderKernel.js";
import { decomposeVisibleShells } from "./displayShellModel.js";

export function normalizeTargetVariable(value) {
    return normalizeTargetVariableInput(value);
}

function collectNativeRuntimeProjectionRows(result) {
    const nativeRows = result?.exportData?.outputContract?.projectionRows;
    if (Array.isArray(nativeRows)) {
        return nativeRows;
    }

    const bridgeRows = result?.exportData?.outputContract?.bridgeProjectionRows;
    return Array.isArray(bridgeRows) ? bridgeRows : [];
}

function collectRuntimeTheoryRows(result) {
    const nativeTheoryRows = result?.exportData?.outputContract?.theoryRows;
    if (Array.isArray(nativeTheoryRows)) {
        return nativeTheoryRows;
    }

    const legacyTheoryRows = result?.exportData?.theoryRows;
    return Array.isArray(legacyTheoryRows) ? legacyTheoryRows : [];
}

function collectProjectionRows(result) {
    const nativeRows = collectNativeRuntimeProjectionRows(result);
    if (nativeRows.length > 0) {
        return nativeRows;
    }

    return Array.isArray(result?.exportData?.projectionRows) ? result.exportData.projectionRows : [];
}

function isNativeRuntimeProjectionRow(row) {
    return Array.isArray(row?.projectionAtoms);
}

function resolveNativeProjectionRoleValue(atom) {
    if (typeof atom?.role === "string" && atom.role.length > 0) {
        return atom.role;
    }

    if (typeof atom?.projectionRole === "string" && atom.projectionRole.length > 0) {
        return atom.projectionRole;
    }

    return null;
}

function formatNativeProjectionValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function isPureNumberTimesNumberOperatorContext(theoryNodeContext = null) {
    return theoryNodeContext?.previousNodeType === "NUMBER"
        && theoryNodeContext?.nextNodeType === "NUMBER";
}

function shouldHideNativeProjectionAtom(atom, theoryNodeContext = null) {
    const projectionValue = formatNativeProjectionValue(atom?.value ?? atom?.text);
    const projectionRoleValue = resolveNativeProjectionRoleValue(atom);
    const sourceNodeType = atom?.sourceNodeType || theoryNodeContext?.node?.type || null;

    if (projectionValue !== "*") {
        return false;
    }

    if (projectionRoleValue === "multiplication_operator" || atom?.kind === "shell_slot") {
        return false;
    }

    if (sourceNodeType !== "OPERATOR") {
        return false;
    }

    if (atom?.isImplicit === true || theoryNodeContext?.node?.isImplicit === true) {
        return true;
    }

    return !isPureNumberTimesNumberOperatorContext(theoryNodeContext);
}

function buildTheoryNodeContext(node, parentShell = null, siblingMeta = null) {
    return {
        node,
        parentShellId: parentShell?.id || null,
        parentShellType: parentShell?.type || null,
        previousNodeId: siblingMeta?.previousNode?.id || null,
        previousNodeType: siblingMeta?.previousNode?.type || null,
        nextNodeId: siblingMeta?.nextNode?.id || null,
        nextNodeType: siblingMeta?.nextNode?.type || null
    };
}

function visitTheoryNodeChildren(node, nextParentShell, visit) {
    if (!node || typeof node !== "object") {
        return;
    }

    const visitArray = (collection = []) => {
        collection.forEach((child, index) => {
            visit(child, nextParentShell, {
                previousNode: index > 0 ? collection[index - 1] : null,
                nextNode: index < collection.length - 1 ? collection[index + 1] : null
            });
        });
    };

    if (node.type === "DIVISION") {
        visitArray(Array.isArray(node.numerator) ? node.numerator : []);
        visitArray(Array.isArray(node.denominator) ? node.denominator : []);
        return;
    }

    if (node.type === "MULTIPLICATION") {
        visitArray(Array.isArray(node.content) ? node.content : []);
        visitArray(Array.isArray(node.factor) ? node.factor : []);
        return;
    }

    if (["GROUP", "COLLECTION", "FUNCTION", "ROOT", "NEGATION", "POWER"].includes(node.type)) {
        visitArray(Array.isArray(node.content) ? node.content : []);
        return;
    }

    if (["ADDITION", "SUBTRACTION"].includes(node.type)) {
        visitArray(Array.isArray(node.content) ? node.content : []);
        visitArray(Array.isArray(node.passive) ? node.passive : []);
    }
}

function shouldRenderNativeShellContainer(atom) {
    return atom?.nativeKind === "shell_container"
        && atom?.type === "ROOT";
}

function resolveCoreShellSpan(renderNode, shellSpanLookup = null) {
    if (!renderNode || !(shellSpanLookup instanceof Map)) {
        return null;
    }

    const shellModel = decomposeVisibleShells(renderNode);
    const coreNode = shellModel?.coreNode || null;
    const lookupKeys = [
        coreNode?.sourceAtomId,
        coreNode?.sourceShellId,
        coreNode?.shellId
    ].filter((value) => typeof value === "string" && value.length > 0);

    for (const key of lookupKeys) {
        const shellSpan = shellSpanLookup.get(key);
        if (shellSpan) {
            return {
                shellSpan,
                coreNode
            };
        }
    }

    return null;
}

function resolveNativeProjectionRole(atom) {
    switch (resolveNativeProjectionRoleValue(atom)) {
        case "equation_anchor":
            return "anchor";
        case "fraction_line":
            return "fraction_line";
        case "function_name":
            return "function_name";
        case "function_left_paren":
            return "function_left";
        case "function_right_paren":
            return "function_right";
        case "group_left_paren":
            return "group_left";
        case "group_right_paren":
            return "group_right";
        case "negation_sign":
            return "negation_sign";
        case "multiplication_operator":
            return "product_operator";
        case "addition_operator":
        case "subtraction_operator":
            return "inverse_operator";
        case "power_exponent":
            return "power_exponent";
        default:
            return resolveNativeProjectionRoleValue(atom);
    }
}

function resolveNativeProjectionType(atom) {
    const projectionRole = resolveNativeProjectionRoleValue(atom);
    const sourceNodeType = atom?.sourceNodeType || atom?.type || null;

    if (projectionRole === "equation_anchor" || atom?.kind === "anchor" || sourceNodeType === "ANCHOR") {
        return "ANCHOR";
    }

    if (projectionRole === "fraction_line" || sourceNodeType === "FRACTION_LINE") {
        return "FRACTION_LINE";
    }

    if (projectionRole === "power_exponent") {
        return "NUMBER";
    }

    if (projectionRole === "function_name") {
        return "VARIABLE";
    }

    if ([
        "function_left_paren",
        "function_right_paren",
        "group_left_paren",
        "group_right_paren",
        "negation_sign",
        "multiplication_operator",
        "addition_operator",
        "subtraction_operator"
    ].includes(projectionRole)) {
        return "OPERATOR";
    }

    return sourceNodeType || "TEXT";
}

function inferNativeProjectionKind(atom) {
    if (typeof atom?.kind === "string" && atom.kind.length > 0) {
        return atom.kind;
    }

    const projectionRole = resolveNativeProjectionRoleValue(atom);
    const sourceNodeType = atom?.sourceNodeType || atom?.type || null;

    if (sourceNodeType === "ANCHOR" || projectionRole === "equation_anchor") {
        return "anchor";
    }

    if ([
        "FUNCTION",
        "GROUP",
        "COLLECTION",
        "DIVISION",
        "ROOT",
        "POWER",
        "NEGATION",
        "MULTIPLICATION",
        "ADDITION",
        "SUBTRACTION"
    ].includes(sourceNodeType)) {
        return "shell_container";
    }

    if ([
        "fraction_line",
        "function_name",
        "function_left",
        "function_right",
        "group_left",
        "group_right",
        "power_exponent"
    ].includes(resolveNativeProjectionRole(atom))) {
        return "shell_slot";
    }

    return "content";
}

function buildPseudoAtomFromNativeProjectionAtom(atom, theoryNodeLookup = null) {
    const theoryNodeContext = theoryNodeLookup instanceof Map
        ? theoryNodeLookup.get(atom?.sourceNodeId || atom?.sourceAtomId || "") || null
        : null;
    const hiddenByProjectionRule = shouldHideNativeProjectionAtom(atom, theoryNodeContext);
    const resolvedRole = resolveNativeProjectionRole(atom);
    const value = hiddenByProjectionRule
        ? ""
        : formatNativeProjectionValue(atom?.value ?? atom?.text);
    const inheritedShellId = theoryNodeContext?.parentShellId || null;
    const inheritedShellType = theoryNodeContext?.parentShellType || null;
    const resolvedShellId = atom?.shellId || atom?.sourceShellId || inheritedShellId || null;
    const resolvedShellType = atom?.shellType || inheritedShellType || null;

    return {
        id: atom?.projectionAtomId || atom?.id || null,
        value: resolvedRole === "fraction_line" ? "---" : value,
        type: resolveNativeProjectionType(atom),
        isVisible: !hiddenByProjectionRule,
        isImplicit: atom?.isImplicit === true || theoryNodeContext?.node?.isImplicit === true,
        row: null,
        absoluteRow: null,
        stackedRow: null,
        localRow: Number.isInteger(atom?.localRow) ? atom.localRow : 0,
        col: Number.isInteger(atom?.col) ? atom.col : 0,
        colStart: Number.isInteger(atom?.colStart) ? atom.colStart : (Number.isInteger(atom?.col) ? atom.col : 0),
        colEnd: Number.isInteger(atom?.colEnd) ? atom.colEnd : (Number.isInteger(atom?.col) ? atom.col : 0),
        projectionRole: resolvedRole,
        nativeKind: inferNativeProjectionKind(atom),
        sourceAtomId: atom?.sourceNodeId || atom?.sourceAtomId || atom?.projectionAtomId || atom?.id || null,
        sourceShellId: resolvedShellId,
        parentType: resolvedShellType,
        shellType: resolvedShellType,
        functionName: resolvedShellType === "FUNCTION" ? value : null,
        visualMode: null
    };
}

function buildNativeRuntimeRowLookup(result) {
    const theoryRows = collectRuntimeTheoryRows(result);
    const lookup = new Map();

    theoryRows.forEach((row) => {
        if (typeof row?.rowId === "string") {
            lookup.set(row.rowId, row);
        }
    });

    return lookup;
}

function normalizeNativeRuntimeCoordinate(value) {
    if (!Number.isFinite(value)) {
        return null;
    }

    // Der Adapter darf die semantischen Core-Spalten nicht aufblasen.
    // Zusatzraum fuer sichtbare Schalen entsteht erst spaeter ueber Display-Slots.
    return Math.round(value);
}

function normalizeNativeRuntimeRange(range = null) {
    if (!range || typeof range !== "object") {
        return range;
    }

    return {
        ...range,
        colStart: normalizeNativeRuntimeCoordinate(range.colStart),
        colEnd: normalizeNativeRuntimeCoordinate(range.colEnd)
    };
}

function normalizeNativeRuntimeCollectionRanges(collectionRanges = null) {
    if (!collectionRanges || typeof collectionRanges !== "object") {
        return collectionRanges;
    }

    return Object.fromEntries(
        Object.entries(collectionRanges).map(([key, range]) => [
            key,
            normalizeNativeRuntimeRange(range)
        ])
    );
}

function normalizeNativeRuntimeShellSpan(shellSpan = null) {
    if (!shellSpan || typeof shellSpan !== "object") {
        return shellSpan;
    }

    return {
        ...shellSpan,
        colStart: normalizeNativeRuntimeCoordinate(shellSpan.colStart),
        colEnd: normalizeNativeRuntimeCoordinate(shellSpan.colEnd),
        contentColStart: normalizeNativeRuntimeCoordinate(shellSpan.contentColStart),
        contentColEnd: normalizeNativeRuntimeCoordinate(shellSpan.contentColEnd),
        alignmentColStart: normalizeNativeRuntimeCoordinate(shellSpan.alignmentColStart),
        alignmentColEnd: normalizeNativeRuntimeCoordinate(shellSpan.alignmentColEnd),
        collectionRanges: normalizeNativeRuntimeCollectionRanges(shellSpan.collectionRanges)
    };
}

function normalizeNativeRuntimeProjectionAtom(atom = null) {
    if (!atom || typeof atom !== "object") {
        return atom;
    }

    return {
        ...atom,
        col: normalizeNativeRuntimeCoordinate(atom.col),
        colStart: normalizeNativeRuntimeCoordinate(atom.colStart),
        colEnd: normalizeNativeRuntimeCoordinate(atom.colEnd)
    };
}

function buildLegacyLikeRuntimeProjectionRows(result, nativeRowsOverride = null) {
    const nativeRows = Array.isArray(nativeRowsOverride)
        ? nativeRowsOverride
        : collectNativeRuntimeProjectionRows(result);
    if (nativeRows.length === 0) {
        return [];
    }

    const theoryRowLookup = buildNativeRuntimeRowLookup(result);
    let stackedCursor = 0;

    return nativeRows.map((row, index) => {
        const localRowCount = Number.isInteger(row?.localRowCount) ? row.localRowCount : 1;
        const axisLocalRow = Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0;
        const stackRowStart = stackedCursor;
        const stackRowEnd = stackRowStart + Math.max(0, localRowCount - 1);
        stackedCursor = stackRowEnd + 1;
        const theoryRow = theoryRowLookup.get(row?.rowId) || null;
        const theoryNodeLookup = buildTheoryNodeLookupForRow(theoryRow);

        return {
            rowId: row?.rowId || `projection-${index}`,
            sourceRowId: row?.rowId || `projection-${index}`,
            strategy: theoryRow?.strategy || null,
            theoryNodeLookup,
            absoluteRowStart: stackRowStart,
            absoluteRowEnd: stackRowEnd,
            axisAbsoluteRow: stackRowStart + axisLocalRow,
            axisLocalRow,
            localRowCount,
            rowRoles: Array.isArray(row?.rowRoles) ? [...row.rowRoles] : (Array.isArray(row?.rowKinds) ? [...row.rowKinds] : []),
            rowKinds: Array.isArray(row?.rowKinds) ? [...row.rowKinds] : (Array.isArray(row?.rowRoles) ? [...row.rowRoles] : []),
            stackRowStart,
            stackRowEnd,
            axisStackedRow: stackRowStart + axisLocalRow,
            shellSpans: Array.isArray(row?.shellSpans)
                ? row.shellSpans.map((shellSpan) => normalizeNativeRuntimeShellSpan(shellSpan))
                : [],
            positionedAtoms: (row?.projectionAtoms || [])
                .map((atom) => normalizeNativeRuntimeProjectionAtom(atom))
                .map((atom) => buildPseudoAtomFromNativeProjectionAtom(atom, theoryNodeLookup))
        };
    });
}

function resolveExplicitRowKinds(row = {}, rowCount = 1, axisLocalRow = 0) {
    const explicitRowKinds = Array.isArray(row?.rowRoles)
        ? row.rowRoles
        : (Array.isArray(row?.rowKinds) ? row.rowKinds : []);

    if (explicitRowKinds.length === rowCount) {
        return [...explicitRowKinds];
    }

    return buildStepRowKinds(rowCount, axisLocalRow);
}

function collectShellIdsWithProjectedChildren(positionedAtoms = []) {
    const shellIds = new Set();

    positionedAtoms.forEach((atom) => {
        if (atom?.isVisible === false) {
            return;
        }

        if (typeof atom?.sourceShellId === "string" && atom.sourceShellId.length > 0) {
            shellIds.add(atom.sourceShellId);
        }
    });

    return shellIds;
}

function buildTheoryNodeLookupForRow(theoryRow = null) {
    const lookup = new Map();
    const shellLikeTypes = new Set([
        "GROUP",
        "COLLECTION",
        "FUNCTION",
        "ROOT",
        "POWER",
        "NEGATION",
        "DIVISION",
        "MULTIPLICATION",
        "ADDITION",
        "SUBTRACTION"
    ]);

    function contextPriorityScore(node, parentShell = null) {
        let score = 0;

        if (node?.isVisible !== false) {
            score += 8;
        }

        if (parentShell && parentShell.isVisible !== false) {
            score += 4;
        }

        if (!parentShell) {
            score += 1;
        }

        return score;
    }

    function visit(node, parentShell = null, siblingMeta = null) {
        if (!node || typeof node !== "object") {
            return;
        }

        if (typeof node.id === "string" && node.id.length > 0) {
            const nextContext = buildTheoryNodeContext(node, parentShell, siblingMeta);
            const existingContext = lookup.get(node.id) || null;
            const existingScore = existingContext
                ? contextPriorityScore(existingContext.node, lookup.get(existingContext.parentShellId || "")?.node || null)
                : -1;
            const nextScore = contextPriorityScore(node, parentShell);

            if (!existingContext || nextScore > existingScore) {
                lookup.set(node.id, nextContext);
            }
        }

        const nextParentShell = shellLikeTypes.has(node.type) ? node : parentShell;
        visitTheoryNodeChildren(node, nextParentShell, visit);
    }

    const hasExplicitSides = Array.isArray(theoryRow?.left) || Array.isArray(theoryRow?.right);
    const visitArray = (nodes = [], parentShell = null) => {
        nodes.forEach((node, index) => {
            visit(node, parentShell, {
                previousNode: index > 0 ? nodes[index - 1] : null,
                nextNode: index < nodes.length - 1 ? nodes[index + 1] : null
            });
        });
    };

    if (hasExplicitSides) {
        visitArray(Array.isArray(theoryRow?.left) ? theoryRow.left : []);
        visitArray(Array.isArray(theoryRow?.right) ? theoryRow.right : []);
    } else {
        visitArray(Array.isArray(theoryRow?.atoms) ? theoryRow.atoms : []);
    }

    if (theoryRow?.anchor && typeof theoryRow.anchor === "object") {
        visit(theoryRow.anchor);
    }

    return lookup;
}

function buildTheoryNodeRenderNode(node = null) {
    if (!node || typeof node !== "object") {
        return null;
    }

    return buildRenderNode(node);
}

function collectVisibleAncestorShellDescriptors(theoryNodeLookup = null, startingShellId = null) {
    if (!(theoryNodeLookup instanceof Map) || typeof startingShellId !== "string" || startingShellId.length === 0) {
        return [];
    }

    const descriptors = [];
    const visitedShellIds = new Set();
    let currentShellId = theoryNodeLookup.get(startingShellId)?.parentShellId || null;

    while (typeof currentShellId === "string" && currentShellId.length > 0 && !visitedShellIds.has(currentShellId)) {
        visitedShellIds.add(currentShellId);
        const context = theoryNodeLookup.get(currentShellId) || null;
        const node = context?.node || null;

        if (node && node.isVisible !== false) {
            descriptors.push({
                shellId: currentShellId,
                shellType: node.type || null,
                node,
                renderNode: buildTheoryNodeRenderNode(node)
            });
        }

        currentShellId = context?.parentShellId || null;
    }

    return descriptors;
}

function resolveVisibleTheoryNode(theoryNodeLookup = null, nodeId = null) {
    if (!(theoryNodeLookup instanceof Map) || typeof nodeId !== "string" || nodeId.length === 0) {
        return null;
    }

    const context = theoryNodeLookup.get(nodeId) || null;
    const node = context?.node || null;
    return node && node.isVisible !== false ? node : null;
}

function renderNodeContainsStructuredCore(renderNode = null) {
    if (!renderNode) {
        return false;
    }

    const shellModel = decomposeVisibleShells(renderNode);
    const coreNode = shellModel?.coreNode || null;

    return renderNode?.layout?.containsFraction === true
        || coreNode?.type === "fraction"
        || coreNode?.layout?.containsFraction === true;
}

function shouldRenderWholeVisibleShellNode(node = null) {
    if (!node || node.isVisible === false) {
        return false;
    }

    const isSupportedShellType = [
        "FUNCTION",
        "GROUP",
        "COLLECTION",
        "ROOT",
        "POWER",
        "NEGATION",
        "DIVISION",
        "MULTIPLICATION",
        "ADDITION",
        "SUBTRACTION"
    ].includes(node.type);

    if (!isSupportedShellType) {
        return false;
    }

    const renderNode = buildTheoryNodeRenderNode(node);

    if (renderNodeContainsStructuredCore(renderNode)) {
        return false;
    }

    return true;
}

function collectRenderableClosedShellIds(shellSpans = [], theoryNodeLookup = null) {
    if (!(theoryNodeLookup instanceof Map)) {
        return new Set();
    }

    const candidateShellIds = new Set(
        (Array.isArray(shellSpans) ? shellSpans : [])
            .map((shellSpan) => (typeof shellSpan?.shellId === "string" ? shellSpan.shellId : ""))
            .filter(Boolean)
            .filter((shellId) => {
                const node = resolveVisibleTheoryNode(theoryNodeLookup, shellId);
                return shouldRenderWholeVisibleShellNode(node);
            })
    );

    const renderedShellIds = new Set();

    candidateShellIds.forEach((shellId) => {
        let currentShellId = theoryNodeLookup.get(shellId)?.parentShellId || null;
        let hasVisibleCandidateAncestor = false;

        while (typeof currentShellId === "string" && currentShellId.length > 0) {
            if (candidateShellIds.has(currentShellId) && resolveVisibleTheoryNode(theoryNodeLookup, currentShellId)) {
                hasVisibleCandidateAncestor = true;
                break;
            }

            currentShellId = theoryNodeLookup.get(currentShellId)?.parentShellId || null;
        }

        if (!hasVisibleCandidateAncestor) {
            renderedShellIds.add(shellId);
        }
    });

    return renderedShellIds;
}

function belongsToRenderedShell(atom, renderedShellIds = new Set(), theoryNodeLookup = null) {
    if (!(renderedShellIds instanceof Set) || renderedShellIds.size === 0 || !(theoryNodeLookup instanceof Map)) {
        return false;
    }

    let currentShellId = typeof atom?.sourceShellId === "string" && atom.sourceShellId.length > 0
        ? atom.sourceShellId
        : null;

    while (typeof currentShellId === "string" && currentShellId.length > 0) {
        if (renderedShellIds.has(currentShellId)) {
            return true;
        }

        currentShellId = theoryNodeLookup.get(currentShellId)?.parentShellId || null;
    }

    return false;
}

function collectRenderableAtoms(positionedAtoms = [], theoryNodeLookup = null, renderedShellIds = new Set()) {
    const shellIdsWithProjectedChildren = collectShellIdsWithProjectedChildren(positionedAtoms);

    return positionedAtoms.filter((atom) => {
        if (!atom || atom.isVisible === false) {
            return false;
        }

        if (atom?.nativeKind === "shell_container") {
            return shouldRenderNativeShellContainer(atom);
        }

        if (belongsToRenderedShell(atom, renderedShellIds, theoryNodeLookup)) {
            return false;
        }

        if (atom?.nativeKind === "shell_slot" && atom?.parentType === "ROOT") {
            return false;
        }

        if (atom.type === "DIVISION") {
            return false;
        }

        if (shellIdsWithProjectedChildren.has(atom.id)) {
            return false;
        }

        return true;
    });
}

function getVisibleRowBounds(renderableAtoms) {
    if (renderableAtoms.length === 0) {
        return {
            minRow: 0,
            maxRow: 0
        };
    }

    let minRow = renderableAtoms[0].row;
    let maxRow = renderableAtoms[0].row;

    renderableAtoms.forEach((atom) => {
        minRow = Math.min(minRow, atom.row);
        maxRow = Math.max(maxRow, atom.row);
    });

    return { minRow, maxRow };
}

function buildShellSpanLookup(shellSpans = []) {
    const lookup = new Map();

    (Array.isArray(shellSpans) ? shellSpans : []).forEach((shellSpan) => {
        const shellId = typeof shellSpan?.shellId === "string" ? shellSpan.shellId : null;
        if (!shellId || lookup.has(shellId)) {
            return;
        }

        lookup.set(shellId, shellSpan);
    });

    return lookup;
}

function resolveAtomLocalRow(atom, fallbackMinRow = 0) {
    if (Number.isInteger(atom?.localRow)) {
        return atom.localRow;
    }

    return (atom?.row ?? 0) - fallbackMinRow;
}

function hydrateNativeRootChromeRenderNode(renderNode, atom, sourceTheoryNode = null) {
    if (!renderNode || atom?.nativeKind !== "shell_container" || renderNode.type !== "root") {
        return renderNode;
    }

    if (!sourceTheoryNode || sourceTheoryNode.type !== "ROOT") {
        return renderNode;
    }

    const sourceRenderNode = buildRenderNode(sourceTheoryNode);
    if (!sourceRenderNode || sourceRenderNode.type !== "root") {
        return renderNode;
    }

    return {
        ...renderNode,
        degreeText: sourceRenderNode.degreeText || renderNode.degreeText || "",
        layout: sourceRenderNode.layout || renderNode.layout
    };
}

function collectProjectionRoleSourceNodes(projectionRole = null, sourceShellNode = null) {
    if (!sourceShellNode || typeof sourceShellNode !== "object") {
        return [];
    }

    switch (projectionRole) {
        case "power_exponent":
            return Array.isArray(sourceShellNode.exponentNodes) ? sourceShellNode.exponentNodes : [];
        case "content":
        case "function_argument":
        case "root_content":
        case "negation_content":
        case "group_content":
        case "power_base":
            return Array.isArray(sourceShellNode.content) ? sourceShellNode.content : [];
        case "numerator":
            return Array.isArray(sourceShellNode.numerator) ? sourceShellNode.numerator : [];
        case "denominator":
            return Array.isArray(sourceShellNode.denominator) ? sourceShellNode.denominator : [];
        case "product_content":
            return Array.isArray(sourceShellNode.content) ? sourceShellNode.content : [];
        case "product_factor":
            return Array.isArray(sourceShellNode.factor) ? sourceShellNode.factor : [];
        case "inverse_content":
            return Array.isArray(sourceShellNode.content) ? sourceShellNode.content : [];
        case "inverse_passive":
            return Array.isArray(sourceShellNode.passive) ? sourceShellNode.passive : [];
        default:
            return [];
    }
}

function collectionContainsNode(collection = [], nodeId = "") {
    if (!Array.isArray(collection) || typeof nodeId !== "string" || nodeId.length === 0) {
        return false;
    }

    return collection.some((node) => node?.id === nodeId);
}

function resolveChildShellProjectionRole(parentShellNode = null, childShellId = "") {
    if (!parentShellNode || typeof childShellId !== "string" || childShellId.length === 0) {
        return null;
    }

    switch (parentShellNode.type) {
        case "FUNCTION":
            return collectionContainsNode(parentShellNode.content, childShellId) ? "function_argument" : null;
        case "ROOT":
            return collectionContainsNode(parentShellNode.content, childShellId) ? "root_content" : null;
        case "NEGATION":
            return collectionContainsNode(parentShellNode.content, childShellId) ? "negation_content" : null;
        case "GROUP":
            return collectionContainsNode(parentShellNode.content, childShellId) ? "group_content" : null;
        case "POWER":
            return collectionContainsNode(parentShellNode.content, childShellId) ? "power_base" : null;
        case "DIVISION":
            if (collectionContainsNode(parentShellNode.numerator, childShellId)) {
                return "numerator";
            }

            if (collectionContainsNode(parentShellNode.denominator, childShellId)) {
                return "denominator";
            }

            return null;
        case "MULTIPLICATION":
            if (collectionContainsNode(parentShellNode.content, childShellId)) {
                return "product_content";
            }

            if (collectionContainsNode(parentShellNode.factor, childShellId)) {
                return "product_factor";
            }

            return null;
        case "ADDITION":
        case "SUBTRACTION":
            if (collectionContainsNode(parentShellNode.content, childShellId)) {
                return "inverse_content";
            }

            if (collectionContainsNode(parentShellNode.passive, childShellId)) {
                return "inverse_passive";
            }

            return null;
        default:
            return null;
    }
}

function resolveRootShellProjectionRole(shellSpan = null, theoryNodeLookup = null) {
    const shellId = typeof shellSpan?.shellId === "string" ? shellSpan.shellId : "";
    if (!(theoryNodeLookup instanceof Map) || shellId.length === 0) {
        return "root";
    }

    const shellContext = theoryNodeLookup.get(shellId) || null;
    const parentShellId = shellContext?.parentShellId || null;
    if (typeof parentShellId !== "string" || parentShellId.length === 0) {
        return "root";
    }

    const parentShellNode = theoryNodeLookup.get(parentShellId)?.node || null;
    return resolveChildShellProjectionRole(parentShellNode, shellId) || "root";
}

function buildVisibleRootShellCells(row = {}, shellSpanLookup = null, targetVariable = "") {
    const shellSpans = Array.isArray(row?.shellSpans) ? row.shellSpans : [];
    const theoryNodeLookup = row?.theoryNodeLookup instanceof Map ? row.theoryNodeLookup : null;
    const axisLocalRow = Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0;
    const rowCount = Math.max(1, Number.isInteger(row?.localRowCount) ? row.localRowCount : (axisLocalRow + 1));
    const rowKinds = resolveExplicitRowKinds(row, rowCount, axisLocalRow);

    return shellSpans
        .filter((shellSpan) => shellSpan?.shellType === "ROOT")
        .map((shellSpan) => {
            const shellId = typeof shellSpan?.shellId === "string" ? shellSpan.shellId : "";
            const sourceTheoryNode = theoryNodeLookup?.get(shellId)?.node || null;
            if (!sourceTheoryNode || sourceTheoryNode.isVisible === false || sourceTheoryNode.type !== "ROOT") {
                return null;
            }

            const renderNode = buildTheoryNodeRenderNode(sourceTheoryNode);
            if (!renderNode || renderNode.type !== "root") {
                return null;
            }

            const visibleAncestorShells = collectVisibleAncestorShellDescriptors(
                theoryNodeLookup,
                shellId
            );
            const projectionRole = resolveRootShellProjectionRole(shellSpan, theoryNodeLookup);
            const coreShellSpanDescriptor = resolveCoreShellSpan(renderNode, shellSpanLookup);
            const coreShellSpan = coreShellSpanDescriptor?.shellSpan || null;
            const coreShellNode = coreShellSpanDescriptor?.coreNode || null;
            const axisRow = Number.isInteger(shellSpan?.axisLocalRow)
                ? shellSpan.axisLocalRow
                : (Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0);

            return {
                id: `${shellId}::root-shell`,
                sourceAtomId: shellId,
                sourceShellId: shellId,
                text: formatCellText(sourceTheoryNode),
                renderNode: {
                    ...renderNode,
                    shellContent: null
                },
                fractionRenderNode: null,
                kind: "root",
                row: axisRow,
                rowKind: rowKinds[axisRow] || "axis",
                rowSpanStart: Number.isInteger(shellSpan?.localTopRow) ? shellSpan.localTopRow : axisRow,
                rowSpanEnd: Number.isInteger(shellSpan?.localBottomRow) ? shellSpan.localBottomRow : axisRow,
                absoluteRow: null,
                stackedRow: null,
                col: Number.isInteger(shellSpan?.colStart) ? shellSpan.colStart : 0,
                colStart: Number.isInteger(shellSpan?.colStart) ? shellSpan.colStart : 0,
                colEnd: Number.isInteger(shellSpan?.colEnd) ? shellSpan.colEnd : 0,
                shellContentColStart: Number.isInteger(shellSpan?.contentColStart) ? shellSpan.contentColStart : null,
                shellContentColEnd: Number.isInteger(shellSpan?.contentColEnd) ? shellSpan.contentColEnd : null,
                shellAlignmentColStart: Number.isInteger(shellSpan?.alignmentColStart) ? shellSpan.alignmentColStart : null,
                shellAlignmentColEnd: Number.isInteger(shellSpan?.alignmentColEnd) ? shellSpan.alignmentColEnd : null,
                shellCollectionRanges: shellSpan?.collectionRanges
                    ? JSON.parse(JSON.stringify(shellSpan.collectionRanges))
                    : null,
                coreShellSourceAtomId: coreShellNode?.sourceAtomId || shellId,
                coreShellSourceShellId: coreShellNode?.shellId || coreShellNode?.sourceShellId || shellId,
                coreShellContentColStart: coreShellSpan && Number.isInteger(coreShellSpan.contentColStart)
                    ? coreShellSpan.contentColStart
                    : (Number.isInteger(shellSpan?.contentColStart) ? shellSpan.contentColStart : null),
                coreShellContentColEnd: coreShellSpan && Number.isInteger(coreShellSpan.contentColEnd)
                    ? coreShellSpan.contentColEnd
                    : (Number.isInteger(shellSpan?.contentColEnd) ? shellSpan.contentColEnd : null),
                coreShellAlignmentColStart: coreShellSpan && Number.isInteger(coreShellSpan.alignmentColStart)
                    ? coreShellSpan.alignmentColStart
                    : (Number.isInteger(shellSpan?.alignmentColStart) ? shellSpan.alignmentColStart : null),
                coreShellAlignmentColEnd: coreShellSpan && Number.isInteger(coreShellSpan.alignmentColEnd)
                    ? coreShellSpan.alignmentColEnd
                    : (Number.isInteger(shellSpan?.alignmentColEnd) ? shellSpan.alignmentColEnd : null),
                coreShellCollectionRanges: coreShellSpan?.collectionRanges
                    ? JSON.parse(JSON.stringify(coreShellSpan.collectionRanges))
                    : (shellSpan?.collectionRanges ? JSON.parse(JSON.stringify(shellSpan.collectionRanges)) : null),
                projectionRole,
                position: null,
                sourceShellNodeType: sourceTheoryNode.type,
                sourceShellNode: sourceTheoryNode,
                sourceShellRenderNode: renderNode,
                visibleAncestorShells,
                representedSourceAtomIds: [],
                isTarget: false,
                isEmerged: false
            };
        })
        .filter(Boolean);
}

function buildVisibleClosedShellCells(row = {}, shellSpanLookup = null, targetVariable = "") {
    const shellSpans = Array.isArray(row?.shellSpans) ? row.shellSpans : [];
    const theoryNodeLookup = row?.theoryNodeLookup instanceof Map ? row.theoryNodeLookup : null;
    const axisLocalRow = Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0;
    const rowCount = Math.max(1, Number.isInteger(row?.localRowCount) ? row.localRowCount : (axisLocalRow + 1));
    const rowKinds = resolveExplicitRowKinds(row, rowCount, axisLocalRow);
    const renderedShellIds = collectRenderableClosedShellIds(shellSpans, theoryNodeLookup);

    const shellCells = shellSpans
        .filter((shellSpan) => renderedShellIds.has(shellSpan?.shellId || ""))
        .map((shellSpan) => {
            const shellId = typeof shellSpan?.shellId === "string" ? shellSpan.shellId : "";
            const sourceTheoryNode = theoryNodeLookup?.get(shellId)?.node || null;

            if (!sourceTheoryNode || sourceTheoryNode.isVisible === false) {
                return null;
            }

            const baseRenderNode = buildTheoryNodeRenderNode(sourceTheoryNode);
            if (!baseRenderNode) {
                return null;
            }

            const renderNode = sourceTheoryNode.type === "ROOT"
                ? {
                    ...baseRenderNode,
                    shellContent: null
                }
                : baseRenderNode;
            const coreShellSpanDescriptor = resolveCoreShellSpan(renderNode, shellSpanLookup);
            const coreShellSpan = coreShellSpanDescriptor?.shellSpan || null;
            const coreShellNode = coreShellSpanDescriptor?.coreNode || null;
            const axisRow = Number.isInteger(shellSpan?.axisLocalRow)
                ? shellSpan.axisLocalRow
                : (Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0);

            return {
                id: `${shellId}::closed-shell`,
                sourceAtomId: shellId,
                sourceShellId: shellId,
                text: formatCellText(sourceTheoryNode),
                renderNode,
                fractionRenderNode: null,
                kind: String(sourceTheoryNode.type || "shell").toLowerCase(),
                row: axisRow,
                rowKind: rowKinds[axisRow] || "axis",
                rowSpanStart: Number.isInteger(shellSpan?.localTopRow) ? shellSpan.localTopRow : axisRow,
                rowSpanEnd: Number.isInteger(shellSpan?.localBottomRow) ? shellSpan.localBottomRow : axisRow,
                absoluteRow: null,
                stackedRow: null,
                col: Number.isInteger(shellSpan?.colStart) ? shellSpan.colStart : 0,
                colStart: Number.isInteger(shellSpan?.colStart) ? shellSpan.colStart : 0,
                colEnd: Number.isInteger(shellSpan?.colEnd) ? shellSpan.colEnd : 0,
                shellContentColStart: Number.isInteger(shellSpan?.contentColStart) ? shellSpan.contentColStart : null,
                shellContentColEnd: Number.isInteger(shellSpan?.contentColEnd) ? shellSpan.contentColEnd : null,
                shellAlignmentColStart: Number.isInteger(shellSpan?.alignmentColStart) ? shellSpan.alignmentColStart : null,
                shellAlignmentColEnd: Number.isInteger(shellSpan?.alignmentColEnd) ? shellSpan.alignmentColEnd : null,
                shellCollectionRanges: shellSpan?.collectionRanges
                    ? JSON.parse(JSON.stringify(shellSpan.collectionRanges))
                    : null,
                coreShellSourceAtomId: coreShellNode?.sourceAtomId || shellId,
                coreShellSourceShellId: coreShellNode?.shellId || coreShellNode?.sourceShellId || shellId,
                coreShellContentColStart: coreShellSpan && Number.isInteger(coreShellSpan.contentColStart)
                    ? coreShellSpan.contentColStart
                    : (Number.isInteger(shellSpan?.contentColStart) ? shellSpan.contentColStart : null),
                coreShellContentColEnd: coreShellSpan && Number.isInteger(coreShellSpan.contentColEnd)
                    ? coreShellSpan.contentColEnd
                    : (Number.isInteger(shellSpan?.contentColEnd) ? shellSpan.contentColEnd : null),
                coreShellAlignmentColStart: coreShellSpan && Number.isInteger(coreShellSpan.alignmentColStart)
                    ? coreShellSpan.alignmentColStart
                    : (Number.isInteger(shellSpan?.alignmentColStart) ? shellSpan.alignmentColStart : null),
                coreShellAlignmentColEnd: coreShellSpan && Number.isInteger(coreShellSpan.alignmentColEnd)
                    ? coreShellSpan.alignmentColEnd
                    : (Number.isInteger(shellSpan?.alignmentColEnd) ? shellSpan.alignmentColEnd : null),
                coreShellCollectionRanges: coreShellSpan?.collectionRanges
                    ? JSON.parse(JSON.stringify(coreShellSpan.collectionRanges))
                    : (shellSpan?.collectionRanges ? JSON.parse(JSON.stringify(shellSpan.collectionRanges)) : null),
                projectionRole: "closed_visible_shell",
                position: null,
                sourceShellNodeType: sourceTheoryNode.type,
                sourceShellNode: sourceTheoryNode,
                sourceShellRenderNode: renderNode,
                visibleAncestorShells: collectVisibleAncestorShellDescriptors(theoryNodeLookup, shellId),
                representedSourceAtomIds: Array.isArray(shellSpan?.contentLeafIds)
                    ? [...shellSpan.contentLeafIds]
                    : [],
                isTarget: false,
                isEmerged: false
            };
        })
        .filter(Boolean);

    return {
        renderedShellIds,
        shellCells
    };
}

function isAtomicTheoryNode(node) {
    return ["VARIABLE", "NUMBER", "OPERATOR", "ANCHOR"].includes(node?.type);
}

function isExactTargetVariableNode(node, targetVariable = "") {
    return node?.type === "VARIABLE" && node?.value === targetVariable;
}

function collectAtomicRepresentationNodes(atom, sourceTheoryNode = null, sourceShellNode = null) {
    if (sourceTheoryNode && sourceTheoryNode.isVisible !== false && isAtomicTheoryNode(sourceTheoryNode)) {
        return [sourceTheoryNode];
    }

    const representedNodes = collectProjectionRoleSourceNodes(atom?.projectionRole || null, sourceShellNode)
        .filter((node) => node && node.isVisible !== false);

    return representedNodes.length === 1 && isAtomicTheoryNode(representedNodes[0])
        ? representedNodes
        : [];
}

function collectRepresentedSourceAtomIds(atom, sourceTheoryNode = null, sourceShellNode = null) {
    return [...new Set(
        collectAtomicRepresentationNodes(atom, sourceTheoryNode, sourceShellNode)
            .map((node) => (typeof node?.id === "string" ? node.id : ""))
            .filter(Boolean)
    )];
}

function isExactTargetVariableProjection(atom, sourceTheoryNode = null, sourceShellNode = null, targetVariable = "") {
    const normalizedTargetVariable = String(targetVariable || "").trim();

    if (!normalizedTargetVariable) {
        return false;
    }

    const representedNodes = collectAtomicRepresentationNodes(atom, sourceTheoryNode, sourceShellNode);

    return representedNodes.length === 1 && isExactTargetVariableNode(representedNodes[0], normalizedTargetVariable);
}

function buildProjectionFragmentRenderNode(atom, sourceShellNode = null) {
    const fragmentIdentity = {
        sourceAtomId: atom?.sourceAtomId || atom?.id || null,
        representedSourceAtomIds: Array.isArray(atom?.representedSourceAtomIds) ? atom.representedSourceAtomIds : null,
        projectionRole: atom?.projectionRole || null,
        sourceShellId: atom?.sourceShellId || null,
        parentType: atom?.parentType || sourceShellNode?.type || null
    };

    switch (atom?.projectionRole) {
        case "power_exponent":
            if (sourceShellNode?.type === "POWER" && Array.isArray(sourceShellNode.exponentNodes) && sourceShellNode.exponentNodes.length > 0) {
                return buildRenderNode(sourceShellNode.exponentNodes);
            }

            return buildRenderNode({
                value: formatCellText(atom),
                ...fragmentIdentity
            });
        case "function_name":
            return buildRenderNode({
                type: "VARIABLE",
                value: formatCellText(atom),
                functionName: sourceShellNode?.name || formatCellText(atom),
                shellType: sourceShellNode?.type || "FUNCTION",
                ...fragmentIdentity
            });
        case "function_left":
        case "group_left":
            return buildRenderNode({
                value: "(",
                ...fragmentIdentity
            });
        case "function_right":
        case "group_right":
            return buildRenderNode({
                value: ")",
                ...fragmentIdentity
            });
        default:
            return null;
    }
}

function buildStepViewModel(row, index, targetVariable) {
    const shellSpanLookup = buildShellSpanLookup(row?.shellSpans || []);
    const closedShellView = buildVisibleClosedShellCells(row, shellSpanLookup, targetVariable);
    const renderableAtoms = collectRenderableAtoms(
        row?.positionedAtoms || [],
        row?.theoryNodeLookup || null,
        closedShellView.renderedShellIds
    )
        .slice()
        .sort((left, right) => {
            const leftRow = Number.isInteger(left?.localRow) ? left.localRow : left.row;
            const rightRow = Number.isInteger(right?.localRow) ? right.localRow : right.row;

            if (leftRow !== rightRow) {
                return leftRow - rightRow;
            }

            return left.col - right.col;
        });

    const { minRow, maxRow } = getVisibleRowBounds(renderableAtoms);
    const fallbackRowCount = Math.max(1, maxRow - minRow + 1);
    const rowCount = Math.max(1, row?.localRowCount || fallbackRowCount);
    const axisLocalRow = Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0;
    const rowKinds = resolveExplicitRowKinds(row, rowCount, axisLocalRow);
    const atomCells = renderableAtoms.map((atom) => {
        const localRow = resolveAtomLocalRow(atom, minRow);
        const sourceTheoryNodeContext = typeof atom?.sourceAtomId === "string"
            ? row?.theoryNodeLookup?.get(atom.sourceAtomId) || null
            : null;
        const sourceTheoryNode = sourceTheoryNodeContext?.node || null;
        const sourceShellContext = typeof atom?.sourceShellId === "string"
            ? row?.theoryNodeLookup?.get(atom.sourceShellId) || null
            : null;
        const sourceShellNode = sourceShellContext?.node || null;
        const sourceShellRenderNode = sourceShellNode && sourceShellNode.isVisible !== false
            ? buildTheoryNodeRenderNode(sourceShellNode)
            : null;
        const visibleAncestorShells = collectVisibleAncestorShellDescriptors(
            row?.theoryNodeLookup || null,
            atom?.sourceShellId || sourceTheoryNodeContext?.parentShellId || null
        );
        const representedSourceAtomIds = collectRepresentedSourceAtomIds(atom, sourceTheoryNode, sourceShellNode);
        const renderSourceAtom = representedSourceAtomIds.length > 0
            ? {
                ...atom,
                representedSourceAtomIds
            }
            : atom;
        const shellRenderNode = atom?.nativeKind === "shell_container" && sourceTheoryNode && sourceTheoryNode.isVisible !== false
            ? buildTheoryNodeRenderNode(sourceTheoryNode)
            : null;
        const fragmentRenderNode = shellRenderNode ? null : buildProjectionFragmentRenderNode(atom, sourceShellNode);
        const renderNode = hydrateNativeRootChromeRenderNode(
            atom.type === "FRACTION_LINE" ? null : (shellRenderNode || fragmentRenderNode || buildRenderNode(renderSourceAtom)),
            atom,
            sourceTheoryNode
        );
        const text = atom?.nativeKind === "shell_container" && sourceTheoryNode
            ? formatCellText(sourceTheoryNode)
            : formatCellText(atom);
        const shellSpan = atom?.nativeKind === "shell_container"
            ? (shellSpanLookup.get(atom?.sourceAtomId || atom?.id || "") || null)
            : null;
        const sourceShellSpan = typeof atom?.sourceShellId === "string" && atom.sourceShellId.length > 0
            ? (shellSpanLookup.get(atom.sourceShellId) || null)
            : null;
        const resolvedShellSpan = shellSpan || sourceShellSpan;
        const coreShellSpanDescriptor = atom?.nativeKind === "shell_container" && shellRenderNode
            ? resolveCoreShellSpan(shellRenderNode, shellSpanLookup)
            : null;
        const coreShellSpan = coreShellSpanDescriptor?.shellSpan || null;
        const coreShellNode = coreShellSpanDescriptor?.coreNode || null;
        const usesWholeShellRowSpan = atom?.nativeKind === "shell_container";
        const rowSpanStart = usesWholeShellRowSpan && resolvedShellSpan && Number.isInteger(resolvedShellSpan.localTopRow)
            ? resolvedShellSpan.localTopRow
            : localRow;
        const rowSpanEnd = usesWholeShellRowSpan && resolvedShellSpan && Number.isInteger(resolvedShellSpan.localBottomRow)
            ? resolvedShellSpan.localBottomRow
            : localRow;

        return {
            id: atom.id,
            sourceAtomId: atom.sourceAtomId || atom.id,
            sourceShellId: atom.sourceShellId || null,
            text,
            renderNode,
            fractionRenderNode: atom.type === "FRACTION_LINE" && sourceTheoryNode
                ? buildRenderNode(sourceTheoryNode)
                : null,
            kind: atom.type === "FRACTION_LINE" ? "fraction_line" : (atom.type || "unknown").toLowerCase(),
            row: localRow,
            rowKind: rowKinds[localRow] || "axis",
            rowSpanStart,
            rowSpanEnd,
            absoluteRow: atom.absoluteRow ?? atom.row,
            stackedRow: Number.isInteger(atom?.stackedRow) ? atom.stackedRow : null,
            col: atom.col,
            colStart: Number.isInteger(atom?.colStart) ? atom.colStart : atom.col,
            colEnd: Number.isInteger(atom?.colEnd) ? atom.colEnd : atom.col,
            shellContentColStart: resolvedShellSpan && Number.isInteger(resolvedShellSpan.contentColStart)
                ? resolvedShellSpan.contentColStart
                : null,
            shellContentColEnd: resolvedShellSpan && Number.isInteger(resolvedShellSpan.contentColEnd)
                ? resolvedShellSpan.contentColEnd
                : null,
            shellAlignmentColStart: resolvedShellSpan && Number.isInteger(resolvedShellSpan.alignmentColStart)
                ? resolvedShellSpan.alignmentColStart
                : null,
            shellAlignmentColEnd: resolvedShellSpan && Number.isInteger(resolvedShellSpan.alignmentColEnd)
                ? resolvedShellSpan.alignmentColEnd
                : null,
            shellCollectionRanges: resolvedShellSpan && resolvedShellSpan.collectionRanges
                ? JSON.parse(JSON.stringify(resolvedShellSpan.collectionRanges))
                : null,
            coreShellSourceAtomId: coreShellNode?.sourceAtomId || null,
            coreShellSourceShellId: coreShellNode?.shellId || coreShellNode?.sourceShellId || null,
            coreShellContentColStart: coreShellSpan && Number.isInteger(coreShellSpan.contentColStart)
                ? coreShellSpan.contentColStart
                : null,
            coreShellContentColEnd: coreShellSpan && Number.isInteger(coreShellSpan.contentColEnd)
                ? coreShellSpan.contentColEnd
                : null,
            coreShellAlignmentColStart: coreShellSpan && Number.isInteger(coreShellSpan.alignmentColStart)
                ? coreShellSpan.alignmentColStart
                : null,
            coreShellAlignmentColEnd: coreShellSpan && Number.isInteger(coreShellSpan.alignmentColEnd)
                ? coreShellSpan.alignmentColEnd
                : null,
            coreShellCollectionRanges: coreShellSpan && coreShellSpan.collectionRanges
                ? JSON.parse(JSON.stringify(coreShellSpan.collectionRanges))
                : null,
            projectionRole: atom.projectionRole || null,
            position: atom.position || null,
            sourceShellNodeType: sourceShellNode?.type || null,
            sourceShellNode,
            sourceShellRenderNode,
            visibleAncestorShells,
            representedSourceAtomIds,
            isTarget: isExactTargetVariableProjection(atom, sourceTheoryNode, sourceShellNode, targetVariable),
            isEmerged: atom.visualMode === "EMERGED"
        };
    }).filter((cell) => cell.kind === "fraction_line" || cell.text.length > 0 || Boolean(cell.renderNode));
    const rootShellCells = buildVisibleRootShellCells(row, shellSpanLookup, targetVariable)
        .filter((cell) => !closedShellView.renderedShellIds.has(cell.sourceShellId || ""));
    const baseCells = [...atomCells, ...closedShellView.shellCells, ...rootShellCells];
    const rowMetrics = buildStepRowMetrics(baseCells, rowKinds);
    const blockAxisMetric = rowMetrics[axisLocalRow] || null;
    const enrichedCells = baseCells.map((cell) => {
        const rowMetric = rowMetrics[cell.row] || null;
        const enrichedCell = {
            ...cell,
            rowMinHeightEm: rowMetric?.minHeightEm ?? null,
            rowAxisTopReserveEm: rowMetric?.axisTopReserveEm ?? null,
            rowAxisBottomReserveEm: rowMetric?.axisBottomReserveEm ?? null,
            rowAxisBalanceEm: rowMetric?.axisBalanceEm ?? null,
            rowAxisContext: rowMetric?.axisContext ?? null,
            rowFractionSpanWidth: rowMetric?.fractionSpanWidth ?? null,
            rowContentShiftEm: rowMetric?.rowContentShiftEm ?? null,
            rowAxisLineShiftEm: rowMetric?.axisLineShiftEm ?? null,
            rowFractionLineHeightEm: rowMetric?.fractionLineHeightEm ?? null,
            rowFractionLineThicknessEm: rowMetric?.fractionLineThicknessEm ?? null,
            rowAxisCompanionShiftEm: rowMetric?.axisCompanionShiftEm ?? null,
            rowAxisShiftEm: rowMetric?.axisShiftEm ?? null,
            blockAxisTopReserveEm: blockAxisMetric?.axisTopReserveEm ?? null,
            blockAxisBottomReserveEm: blockAxisMetric?.axisBottomReserveEm ?? null,
            blockAxisBalanceEm: blockAxisMetric?.axisBalanceEm ?? null,
            blockAxisContext: blockAxisMetric?.axisContext ?? null,
            blockFractionSpanWidth: blockAxisMetric?.fractionSpanWidth ?? null,
            blockAxisShiftEm: blockAxisMetric?.axisShiftEm ?? null
        };

        return {
            ...enrichedCell,
            cellMetrics: buildCellMetrics(enrichedCell)
        };
    });

    return {
        rowId: row?.rowId || `projection-${index}`,
        title: index === 0 ? "Ausgangsgleichung" : `Schritt ${index}`,
        label: index === 0 ? "Start" : (row?.strategy?.label || "Umbau"),
        family: row?.strategy?.family || null,
        rowCount,
        axisLocalRow,
        rowKinds,
        rowMetrics,
        stackRowStart: Number.isInteger(row?.stackRowStart) ? row.stackRowStart : null,
        stackRowEnd: Number.isInteger(row?.stackRowEnd) ? row.stackRowEnd : null,
        absoluteRowStart: Number.isInteger(row?.absoluteRowStart) ? row.absoluteRowStart : null,
        absoluteRowEnd: Number.isInteger(row?.absoluteRowEnd) ? row.absoluteRowEnd : null,
        axisAbsoluteRow: Number.isInteger(row?.axisAbsoluteRow) ? row.axisAbsoluteRow : null,
        axisStackedRow: Number.isInteger(row?.axisStackedRow) ? row.axisStackedRow : null,
        shellSpans: Array.isArray(row?.shellSpans) ? row.shellSpans.map((shellSpan) => ({ ...shellSpan })) : [],
        cells: enrichedCells
    };
}

function buildWorksheetLayout(steps) {
    const interStepGapEm = 0.9;
    const cells = [];
    const rows = [];
    let rowCursor = 0;

    steps.forEach((step, stepIndex) => {
        step.rowKinds.forEach((rowKind, localRow) => {
            const metric = step.rowMetrics?.[localRow] || null;

            rows.push({
                index: rowCursor + localRow,
                localRow,
                stepIndex,
                kind: rowKind,
                isAxis: rowKind === "axis",
                minHeightEm: metric?.minHeightEm ?? null,
                cellCount: metric?.cellCount ?? 0,
                hasFractionLine: metric?.hasFractionLine === true,
                hasNestedFraction: metric?.hasNestedFraction === true,
                axisTopReserveEm: metric?.axisTopReserveEm ?? null,
                axisBottomReserveEm: metric?.axisBottomReserveEm ?? null,
                axisBalanceEm: metric?.axisBalanceEm ?? null,
                axisContext: metric?.axisContext ?? null,
                fractionSpanWidth: metric?.fractionSpanWidth ?? null,
                rowContentShiftEm: metric?.rowContentShiftEm ?? null,
                axisLineShiftEm: metric?.axisLineShiftEm ?? null,
                fractionLineHeightEm: metric?.fractionLineHeightEm ?? null,
                fractionLineThicknessEm: metric?.fractionLineThicknessEm ?? null,
                axisCompanionShiftEm: metric?.axisCompanionShiftEm ?? null,
                axisShiftEm: metric?.axisShiftEm ?? null
            });
        });

        step.cells.forEach((cell) => {
            const stackedRow = Number.isInteger(cell.stackedRow) ? cell.stackedRow : rowCursor + cell.row;
            cells.push({
                ...cell,
                row: stackedRow,
                rowSpanStart: rowCursor + (Number.isInteger(cell.rowSpanStart) ? cell.rowSpanStart : cell.row),
                rowSpanEnd: rowCursor + (Number.isInteger(cell.rowSpanEnd) ? cell.rowSpanEnd : cell.row),
                rowKind: step.rowKinds[cell.row] || "axis",
                stepIndex
            });
        });

        rowCursor += step.rowCount;

        if (stepIndex < steps.length - 1) {
            rows.push({
                index: rowCursor,
                localRow: null,
                stepIndex,
                kind: "step_gap",
                isAxis: false,
                minHeightEm: interStepGapEm,
                cellCount: 0,
                hasFractionLine: false,
                hasNestedFraction: false,
                axisTopReserveEm: null,
                axisBottomReserveEm: null,
                axisBalanceEm: null,
                axisContext: null,
                fractionSpanWidth: null,
                rowContentShiftEm: null,
                axisLineShiftEm: null,
                fractionLineHeightEm: null,
                fractionLineThicknessEm: null,
                axisCompanionShiftEm: null,
                axisShiftEm: null
            });

            rowCursor += 1;
        }
    });

    return {
        rowCount: Math.max(1, rowCursor),
        rows,
        cells
    };
}

function buildDiagnostics(steps, result) {
    return {
        equation: result?.eingabe || "",
        targetVariable: result?.targetVariable || null,
        steps: steps.map((step, stepIndex) => ({
            stepIndex,
            rowId: step.rowId,
            label: step.label,
            family: step.family,
            axisLocalRow: step.axisLocalRow,
            stackRowStart: step.stackRowStart,
            stackRowEnd: step.stackRowEnd,
            absoluteRowStart: step.absoluteRowStart,
            absoluteRowEnd: step.absoluteRowEnd,
            axisAbsoluteRow: step.axisAbsoluteRow,
            axisStackedRow: step.axisStackedRow,
            rowKinds: [...step.rowKinds],
            rowMetrics: step.rowMetrics.map((metric) => ({ ...metric })),
            cells: step.cells.map((cell) => ({
                id: cell.id,
                sourceAtomId: cell.sourceAtomId,
                sourceShellId: cell.sourceShellId,
                text: cell.text,
                row: cell.row,
                rowKind: cell.rowKind,
                absoluteRow: cell.absoluteRow,
                stackedRow: cell.stackedRow,
                col: cell.col,
                colStart: cell.colStart,
                colEnd: cell.colEnd,
                kind: cell.kind,
                projectionRole: cell.projectionRole || null,
                isTarget: cell.isTarget === true,
                axisBehavior: cell.renderNode?.layout?.axisBehavior || null,
                containsFraction: cell.renderNode?.layout?.containsFraction === true,
                axisAboveEm: cell.renderNode?.layout?.axisAboveEm ?? null,
                axisBelowEm: cell.renderNode?.layout?.axisBelowEm ?? null,
                boxHeightEm: cell.renderNode?.layout?.boxHeightEm ?? null,
                axisMinHeightEm: cell.renderNode?.layout?.axisMinHeightEm ?? null,
                aboveAxisMinHeightEm: cell.renderNode?.layout?.aboveAxisMinHeightEm ?? null,
                belowAxisMinHeightEm: cell.renderNode?.layout?.belowAxisMinHeightEm ?? null,
                axisTopReserveEm: cell.renderNode?.layout?.axisTopReserveEm ?? null,
                axisBottomReserveEm: cell.renderNode?.layout?.axisBottomReserveEm ?? null,
                axisBalanceEm: cell.renderNode?.layout?.axisBalanceEm ?? null,
                rowAxisTopReserveEm: cell.rowAxisTopReserveEm ?? null,
                rowAxisBottomReserveEm: cell.rowAxisBottomReserveEm ?? null,
                rowAxisBalanceEm: cell.rowAxisBalanceEm ?? null,
                rowAxisContext: cell.rowAxisContext ?? null,
                rowFractionSpanWidth: cell.rowFractionSpanWidth ?? null,
                rowContentShiftEm: cell.rowContentShiftEm ?? null,
                rowAxisLineShiftEm: cell.rowAxisLineShiftEm ?? null,
                rowFractionLineHeightEm: cell.rowFractionLineHeightEm ?? null,
                rowFractionLineThicknessEm: cell.rowFractionLineThicknessEm ?? null,
                rowAxisCompanionShiftEm: cell.rowAxisCompanionShiftEm ?? null,
                rowAxisShiftEm: cell.rowAxisShiftEm ?? null,
                blockAxisTopReserveEm: cell.blockAxisTopReserveEm ?? null,
                blockAxisBottomReserveEm: cell.blockAxisBottomReserveEm ?? null,
                blockAxisBalanceEm: cell.blockAxisBalanceEm ?? null,
                blockAxisContext: cell.blockAxisContext ?? null,
                blockFractionSpanWidth: cell.blockFractionSpanWidth ?? null,
                blockAxisShiftEm: cell.blockAxisShiftEm ?? null,
                shiftYEm: cell.cellMetrics?.shiftYEm ?? 0,
                alignItems: cell.cellMetrics?.alignItems || null,
                alignSelf: cell.cellMetrics?.alignSelf || null,
                lineHeightEm: cell.cellMetrics?.lineHeightEm ?? null,
                lineThicknessEm: cell.cellMetrics?.lineThicknessEm ?? null
            }))
        }))
    };
}

export function buildWorksheetViewModel(result) {
    const nativeRows = collectNativeRuntimeProjectionRows(result);
    const rawRows = nativeRows.length > 0
        ? buildLegacyLikeRuntimeProjectionRows(result)
        : collectProjectionRows(result);
    const theoryRowLookup = new Map(
        collectRuntimeTheoryRows(result)
            .filter((row) => typeof row?.rowId === "string" && row.rowId.length > 0)
            .map((row) => [row.rowId, row])
    );
    const rows = rawRows.map((row) => {
        if (row?.theoryNodeLookup instanceof Map) {
            return row;
        }

        const sourceRowId = typeof row?.sourceRowId === "string" && row.sourceRowId.length > 0
            ? row.sourceRowId
            : row?.rowId;
        const theoryRow = theoryRowLookup.get(sourceRowId) || null;

        if (!theoryRow) {
            return row;
        }

        return {
            ...row,
            strategy: row?.strategy || theoryRow?.strategy || null,
            theoryNodeLookup: buildTheoryNodeLookupForRow(theoryRow)
        };
    });
    const steps = rows.map((row, index) => buildStepViewModel(row, index, result?.targetVariable || null));

    let columnCount = 1;
    steps.forEach((step) => {
        step.cells.forEach((cell) => {
            columnCount = Math.max(columnCount, cell.colEnd + 1);
        });
    });

    return {
        equation: result?.eingabe || "",
        targetVariable: result?.targetVariable || null,
        stepCount: Array.isArray(result?.schritte) ? result.schritte.length : 0,
        columnCount,
        steps,
        layout: buildWorksheetLayout(steps),
        diagnostics: buildDiagnostics(steps, result)
    };
}
