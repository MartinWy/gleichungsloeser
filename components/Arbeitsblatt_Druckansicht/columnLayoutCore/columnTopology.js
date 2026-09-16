import { cellSemanticEndCol, cellSemanticStartCol } from "./cellSemanticBounds.js";
import { decomposeVisibleShells, needsPowerParens } from "../displayShellModel.js";
import { estimateRenderNodeHeight } from "../renderVerticalGeometry.js";

const beforeSlotPriority = {
    function_name: 10,
    function_left: 20,
    power_left: 30,
    root_lead: 40,
    group_left: 50
};

const afterSlotPriority = {
    group_right: 10,
    function_right: 20,
    power_right: 30
};

function hasSuppressedOuterGroupShell(cell) {
    return cell?.projectionRole === "numerator" || cell?.projectionRole === "denominator";
}

function usesSourceShellAsBoundaryCarrier(cell) {
    const renderNodeType = cell?.sourceShellRenderNode?.type || null;

    return ["power", "root"].includes(renderNodeType)
        && Number.isInteger(cell?.shellContentColStart)
        && Number.isInteger(cell?.shellContentColEnd);
}

function resolveBoundaryCarrierCell(cell) {
    if (!usesSourceShellAsBoundaryCarrier(cell)) {
        return cell;
    }

    return {
        ...cell,
        renderNode: cell.sourceShellRenderNode,
        col: cell.shellContentColStart,
        colStart: cell.shellContentColStart,
        colEnd: cell.shellContentColEnd
    };
}

function resolveFunctionHeadText(node) {
    const baseText = typeof node?.baseText === "string"
        ? node.baseText.trim()
        : "";

    return baseText.length > 0
        ? `${node?.name || "f"}_${baseText}`
        : (node?.name || "f");
}

function createRequirement(kind, side, semanticCol, extra = {}) {
    const priorityTable = side === "before" ? beforeSlotPriority : afterSlotPriority;

    return {
        kind,
        side,
        semanticCol,
        priority: priorityTable[kind] ?? 999,
        ...extra
    };
}

function mergeRequirement(current, next) {
    const merged = {
        ...current,
        priority: Math.min(current.priority ?? 999, next.priority ?? 999),
        originStepIndex: Math.max(current.originStepIndex ?? 0, next.originStepIndex ?? 0)
    };

    if (Array.isArray(current.functionNames) || Array.isArray(next.functionNames)) {
        merged.functionNames = Array.from(new Set([
            ...(current.functionNames || []),
            ...(next.functionNames || [])
        ]));
    }

    if (Array.isArray(current.functionHeadTexts) || Array.isArray(next.functionHeadTexts)) {
        merged.functionHeadTexts = Array.from(new Set([
            ...(current.functionHeadTexts || []),
            ...(next.functionHeadTexts || [])
        ]));
    }

    if (Array.isArray(current.exponents) || Array.isArray(next.exponents)) {
        merged.exponents = Array.from(new Set([
            ...(current.exponents || []),
            ...(next.exponents || [])
        ]));
    }

    merged.delimiterContentHeightEm = Math.max(
        current.delimiterContentHeightEm || 0,
        next.delimiterContentHeightEm || 0
    );

    return merged;
}

function addRequirement(boundaries, requirement) {
    const semanticCol = requirement.semanticCol;
    const currentByCol = boundaries.get(semanticCol) || new Map();
    const current = currentByCol.get(requirement.kind);

    currentByCol.set(
        requirement.kind,
        current ? mergeRequirement(current, requirement) : requirement
    );
    boundaries.set(semanticCol, currentByCol);
}

function addBoundarySequence(sequenceMap, semanticCol, kinds = []) {
    const filteredKinds = kinds.filter(Boolean);

    if (filteredKinds.length === 0) {
        return;
    }

    const currentSequences = sequenceMap.get(semanticCol) || [];
    currentSequences.push(filteredKinds);
    sequenceMap.set(semanticCol, currentSequences);
}

function requirementComparator(side = "before") {
    return (left, right) => {
        const leftStep = left.originStepIndex ?? 0;
        const rightStep = right.originStepIndex ?? 0;

        if (leftStep !== rightStep) {
            return side === "before" ? rightStep - leftStep : leftStep - rightStep;
        }

        return (left.priority ?? 999) - (right.priority ?? 999);
    };
}

function sortedBoundaryRequirements(boundaryMap, sequenceMap, semanticCol = 0, side = "before") {
    const requirements = Array.from(boundaryMap.get(semanticCol)?.values() || []);

    if (requirements.length <= 1) {
        return requirements;
    }

    const comparator = requirementComparator(side);
    const requirementsByKind = new Map(requirements.map((requirement) => [requirement.kind, requirement]));
    const edges = new Map();
    const indegree = new Map();

    requirements.forEach((requirement) => {
        edges.set(requirement.kind, edges.get(requirement.kind) || new Set());
        indegree.set(requirement.kind, indegree.get(requirement.kind) || 0);
    });

    (sequenceMap.get(semanticCol) || []).forEach((sequence) => {
        const relevantKinds = sequence.filter((kind) => requirementsByKind.has(kind));

        for (let index = 0; index < relevantKinds.length - 1; index += 1) {
            const source = relevantKinds[index];
            const target = relevantKinds[index + 1];
            const sourceEdges = edges.get(source) || new Set();

            if (source === target || sourceEdges.has(target)) {
                continue;
            }

            sourceEdges.add(target);
            edges.set(source, sourceEdges);
            indegree.set(target, (indegree.get(target) || 0) + 1);
        }
    });

    const pending = requirements
        .filter((requirement) => (indegree.get(requirement.kind) || 0) === 0)
        .sort(comparator);
    const orderedRequirements = [];

    while (pending.length > 0) {
        const current = pending.shift();
        orderedRequirements.push(current);

        (edges.get(current.kind) || new Set()).forEach((target) => {
            const nextIndegree = (indegree.get(target) || 0) - 1;
            indegree.set(target, nextIndegree);

            if (nextIndegree === 0) {
                pending.push(requirementsByKind.get(target));
                pending.sort(comparator);
            }
        });
    }

    if (orderedRequirements.length !== requirements.length) {
        return requirements.sort(comparator);
    }

    return orderedRequirements;
}

function buildCellRequirementModel(cell, originStepIndex = 0) {
    const boundaryCarrierCell = resolveBoundaryCarrierCell(cell);

    if (!boundaryCarrierCell?.renderNode) {
        return {
            requirements: [],
            beforeSequence: [],
            afterSequence: []
        };
    }

    const startCol = cellSemanticStartCol(boundaryCarrierCell);
    const endCol = cellSemanticEndCol(boundaryCarrierCell);
    const requirements = [];
    const beforeSequence = [];
    const afterSequence = [];
    const keepVisibleShellInsideSemanticBand = boundaryCarrierCell?.projectionRole === "closed_visible_shell";
    const shellModel = decomposeVisibleShells(
        boundaryCarrierCell.renderNode,
        {
            suppressOuterGroupShell: hasSuppressedOuterGroupShell(boundaryCarrierCell),
            includeRootShell: true
        }
    );

    shellModel.shells.forEach((shell) => {
        if (shell.kind === "root") {
            if (!keepVisibleShellInsideSemanticBand) {
                requirements.push(createRequirement("root_lead", "before", startCol, { originStepIndex }));
                beforeSequence.push("root_lead");
            }
            return;
        }

        if (shell.kind === "group") {
            if (!keepVisibleShellInsideSemanticBand) {
                const delimiterContentHeightEm = estimateRenderNodeHeight(shell.node.content);
                requirements.push(createRequirement("group_left", "before", startCol, { originStepIndex, delimiterContentHeightEm }));
                requirements.push(createRequirement("group_right", "after", endCol, { originStepIndex, delimiterContentHeightEm }));
                beforeSequence.push("group_left");
            }
            return;
        }

        if (shell.kind === "function") {
            if (!keepVisibleShellInsideSemanticBand) {
                const delimiterContentHeightEm = estimateRenderNodeHeight(shell.node.argument);
                requirements.push(createRequirement("function_name", "before", startCol, {
                    originStepIndex,
                    functionNames: [shell.node.name || "f"],
                    functionHeadTexts: [resolveFunctionHeadText(shell.node)]
                }));
                requirements.push(createRequirement("function_left", "before", startCol, { originStepIndex, delimiterContentHeightEm }));
                requirements.push(createRequirement("function_right", "after", endCol, { originStepIndex, delimiterContentHeightEm }));
                beforeSequence.push("function_name", "function_left");
            }
            return;
        }

        if (shell.kind === "power" && needsPowerParens(shell.node.base)) {
            if (!keepVisibleShellInsideSemanticBand) {
                const delimiterContentHeightEm = estimateRenderNodeHeight(shell.node.base);
                requirements.push(createRequirement("power_left", "before", startCol, { originStepIndex, delimiterContentHeightEm }));
                requirements.push(createRequirement("power_right", "after", endCol, {
                    originStepIndex,
                    exponents: [String(shell.node.exponent || "2")],
                    delimiterContentHeightEm
                }));
                beforeSequence.push("power_left");
            }
        }
    });

    if (!keepVisibleShellInsideSemanticBand) {
        [...shellModel.shells]
            .reverse()
            .forEach((shell) => {
                if (shell.kind === "group") {
                    afterSequence.push("group_right");
                    return;
                }

                if (shell.kind === "function") {
                    afterSequence.push("function_right");
                    return;
                }

                if (shell.kind === "power" && needsPowerParens(shell.node.base)) {
                    afterSequence.push("power_right");
                }
            });
    }

    return {
        requirements,
        beforeSequence,
        afterSequence
    };
}

export function buildColumnTopology(viewModel) {
    const beforeBoundaries = new Map();
    const afterBoundaries = new Map();
    const beforeBoundarySequences = new Map();
    const afterBoundarySequences = new Map();
    const semanticColumnCount = Math.max(0, viewModel?.columnCount || 0);

    (viewModel?.steps || []).forEach((step, stepIndex) => {
        if (step?.projectionMode === "native_atomic") {
            return;
        }

        (step?.cells || []).forEach((cell) => {
            const { requirements, beforeSequence, afterSequence } = buildCellRequirementModel(cell, stepIndex);
            const startCol = cellSemanticStartCol(cell);
            const endCol = cellSemanticEndCol(cell);

            addBoundarySequence(beforeBoundarySequences, startCol, beforeSequence);
            addBoundarySequence(afterBoundarySequences, endCol, afterSequence);

            requirements.forEach((requirement) => {
                if (requirement.side === "before") {
                    addRequirement(beforeBoundaries, requirement);
                    return;
                }

                addRequirement(afterBoundaries, requirement);
            });
        });
    });

    return {
        semanticColumnCount,
        beforeBoundaries,
        afterBoundaries,
        beforeBoundarySequences,
        afterBoundarySequences
    };
}

export function listBeforeBoundarySlots(topology, semanticCol = 0) {
    return sortedBoundaryRequirements(
        topology?.beforeBoundaries || new Map(),
        topology?.beforeBoundarySequences || new Map(),
        semanticCol,
        "before"
    );
}

export function listAfterBoundarySlots(topology, semanticCol = 0) {
    return sortedBoundaryRequirements(
        topology?.afterBoundaries || new Map(),
        topology?.afterBoundarySequences || new Map(),
        semanticCol,
        "after"
    );
}
