import {
    isRuntimeLeafNode,
    isRuntimeShellNode,
    isVisibleRuntimeNode
} from './projectionTraversal.js';
import { cloneRuntimeValue } from '../runtimeClone.js';
import { serializeRuntimeCollection } from '../runtimeInlineFormat.js';
import {
    resolvePowerBaseParenthesisVisibility,
    resolveShellCellRequirements
} from './shellLayoutRules.js';

const P4_SHELL_BLUEPRINTS_VERSION = "p4_shell_blueprints_v2";

const COLLECTION_KEYS_BY_TYPE = Object.freeze({
    DIVISION: ["numerator", "denominator"],
    COLLECTION: ["content"],
    MULTIPLICATION: ["factors", "operators"],
    ADDITION: ["terms", "operators"],
    SUBTRACTION: ["minuend", "operator", "subtrahend"],
    NEGATION: ["operator", "content"],
    POWER: ["content", "exponentNodes"],
    FUNCTION: ["baseContent", "content"],
    ROOT: ["degreeNodes", "content"],
    GROUP: ["content"]
});

function buildShellMeta(node) {
    switch (node?.type) {
        case "DIVISION":
            return {
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null,
                extendedFromDivisionId: node.extendedFromDivisionId || null,
                fractionColumnMode: "shared_vertical",
                operatorId: node.operator?.id || null
            };
        case "COLLECTION":
            return {
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null,
                transportSourceShellId: node.transportSourceShellId || null,
                transportAlignmentMode: node.transportSourceShellId ? "preserve_shell_band" : null,
                transportLeafIds: Array.isArray(node.transportLeafIds)
                    ? [...new Set(node.transportLeafIds)]
                    : []
            };
        case "FUNCTION":
            return {
                functionName: node.name,
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "NEGATION":
            return {
                sign: node.operator?.value || "-",
                operatorId: node.operator?.id || null,
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null,
                transportSourceShellId: node.transportSourceShellId || null,
                transportAlignmentMode: node.transportSourceShellId ? "preserve_shell_band" : null,
                transportLeafIds: Array.isArray(node.transportLeafIds)
                    ? [...new Set(node.transportLeafIds)]
                    : []
            };
        case "MULTIPLICATION":
            return {
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null,
                extendedFromDenominatorId: node.extendedFromDenominatorId || null,
                extendedFromMultiplicationId: node.extendedFromMultiplicationId || null
            };
        case "POWER":
            return {
                exponentValue: node.exponent ?? serializeRuntimeCollection(node.exponentNodes || []),
                baseParenthesesVisible: resolvePowerBaseParenthesisVisibility(node.content || []),
                baseParenthesisPolicy: "structural_precedence_v1",
                generatedByFamily: node.generatedByFamily || null,
                generatedByAction: node.generatedByAction || null
            };
        case "ROOT":
            return {
                degree: node.degree || 2,
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
                operatorId: node.operator?.id || null,
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

function normalizeCollection(node, key) {
    if (Array.isArray(node?.[key])) {
        return node[key];
    }

    return node?.[key] ? [node[key]] : [];
}

function describeCollection(nodes, context) {
    const blueprints = [];
    const leafIds = [];

    (Array.isArray(nodes) ? nodes : []).forEach((node) => {
        const description = describeNode(node, context);
        if (!description) {
            return;
        }

        blueprints.push(...description.blueprints);
        leafIds.push(...description.leafIds);
    });

    return {
        blueprints,
        leafIds: [...new Set(leafIds)]
    };
}

function describeNode(node, context) {
    if (!isVisibleRuntimeNode(node)) {
        return null;
    }

    if (isRuntimeLeafNode(node)) {
        return {
            blueprints: [],
            leafIds: [node.id]
        };
    }

    if (!isRuntimeShellNode(node)) {
        return null;
    }

    const collectionKeys = COLLECTION_KEYS_BY_TYPE[node.type] || ["content"];
    const collectionDescriptions = collectionKeys.map((key) => [
        key,
        describeCollection(normalizeCollection(node, key), context)
    ]);
    const nestedBlueprints = collectionDescriptions.flatMap(([, result]) => result.blueprints);
    const collectionLeafIds = Object.fromEntries(
        collectionDescriptions.map(([key, result]) => [key, result.leafIds])
    );
    const contentLeafIds = [...new Set(
        collectionDescriptions.flatMap(([, result]) => result.leafIds)
    )];

    if (contentLeafIds.length === 0) {
        return {
            blueprints: nestedBlueprints,
            leafIds: []
        };
    }

    const meta = buildShellMeta(node);
    const blueprint = {
        contractVersion: P4_SHELL_BLUEPRINTS_VERSION,
        placementStatus: "unassigned_preflight",
        rowId: context.rowId,
        side: context.side,
        shellId: node.id,
        rowShellKey: `${context.rowId}::${node.id}`,
        shellType: node.type,
        collectionLeafIds,
        contentLeafIds,
        slotRequirements: resolveShellCellRequirements({
            shellType: node.type,
            meta
        }),
        meta: cloneRuntimeValue(meta)
    };

    return {
        blueprints: [...nestedBlueprints, blueprint],
        leafIds: contentLeafIds
    };
}

function buildShellBlueprints(theoryRows = []) {
    const blueprints = [];

    theoryRows.forEach((row) => {
        ["left", "right"].forEach((side) => {
            const result = describeCollection(row?.[side] || [], {
                rowId: row.rowId,
                side
            });
            blueprints.push(...result.blueprints);
        });
    });

    return blueprints;
}

export {
    P4_SHELL_BLUEPRINTS_VERSION,
    buildShellBlueprints
};
