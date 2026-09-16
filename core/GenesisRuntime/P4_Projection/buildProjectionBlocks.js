import {
    isRuntimeLeafNode,
    isRuntimeShellNode,
    isVisibleRuntimeNode
} from './projectionTraversal.js';

const P4_PROJECTION_BLOCKS_VERSION = "p4_projection_blocks_v2";

function buildContentKey(side, nodeId) {
    return `${side}::${nodeId}`;
}

function buildSlotKey(rowId, shellId, slotName) {
    return `${rowId}::${shellId}::${slotName}`;
}

function buildRowRole(relativeRow) {
    if (relativeRow < 0) {
        return "above_axis";
    }

    if (relativeRow > 0) {
        return "below_axis";
    }

    return "axis";
}

function createFrame({ content = [], slots = [], shells = [], minRelativeRow = 0, maxRelativeRow = 0 } = {}) {
    return {
        content,
        slots,
        shells,
        minRelativeRow,
        maxRelativeRow
    };
}

function mergeFrames(frames = []) {
    const validFrames = frames.filter(Boolean);

    if (validFrames.length === 0) {
        return createFrame();
    }

    return createFrame({
        content: validFrames.flatMap((frame) => frame.content || []),
        slots: validFrames.flatMap((frame) => frame.slots || []),
        shells: validFrames.flatMap((frame) => frame.shells || []),
        minRelativeRow: Math.min(...validFrames.map((frame) => frame.minRelativeRow)),
        maxRelativeRow: Math.max(...validFrames.map((frame) => frame.maxRelativeRow))
    });
}

function shiftFrame(frame, delta = 0) {
    if (!frame || delta === 0) {
        return frame;
    }

    return createFrame({
        content: (frame.content || []).map((entry) => ({
            ...entry,
            relativeRow: entry.relativeRow + delta
        })),
        slots: (frame.slots || []).map((entry) => ({
            ...entry,
            relativeRow: entry.relativeRow + delta,
            minRelativeRow: (entry.minRelativeRow ?? entry.relativeRow) + delta,
            maxRelativeRow: (entry.maxRelativeRow ?? entry.relativeRow) + delta
        })),
        shells: (frame.shells || []).map((shell) => ({
            ...shell,
            axisRelativeRow: shell.axisRelativeRow + delta,
            minRelativeRow: shell.minRelativeRow + delta,
            maxRelativeRow: shell.maxRelativeRow + delta,
            slotRows: (shell.slotRows || []).map((slot) => ({
                ...slot,
                relativeRow: slot.relativeRow + delta,
                minRelativeRow: (slot.minRelativeRow ?? slot.relativeRow) + delta,
                maxRelativeRow: (slot.maxRelativeRow ?? slot.relativeRow) + delta
            }))
        })),
        minRelativeRow: frame.minRelativeRow + delta,
        maxRelativeRow: frame.maxRelativeRow + delta
    });
}

function asCollection(value) {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
}

function buildOwnSlotRows(node, context, childFrame = null) {
    const create = (slotName, relativeRow, rowSpan = null) => ({
        key: buildSlotKey(context.rowId, node.id, slotName),
        rowId: context.rowId,
        shellId: node.id,
        slotName,
        relativeRow,
        minRelativeRow: Number.isFinite(rowSpan?.minRelativeRow)
            ? rowSpan.minRelativeRow
            : relativeRow,
        maxRelativeRow: Number.isFinite(rowSpan?.maxRelativeRow)
            ? rowSpan.maxRelativeRow
            : relativeRow
    });

    switch (node.type) {
        case "GROUP":
            return [create("paren_left", 0), create("paren_right", 0)];
        case "FUNCTION":
            return [
                create("function_name", 0),
                create("paren_left", 0),
                create("paren_right", 0)
            ];
        case "ROOT": {
            const radicandMinRelativeRow = childFrame?.rootRadicandMinRelativeRow;

            if (!Number.isFinite(radicandMinRelativeRow)) {
                throw new Error(
                    `[GenesisRuntime:P4] Der ROOT-Schale ${node.id} fehlt die oberste Radikandzeile.`
                );
            }

            return [
                create("root_hook", 0),
                create("root_overbar", radicandMinRelativeRow - 1)
            ];
        }
        case "DIVISION":
            return [create("fraction_line", 0)];
        case "POWER": {
            const baseRowSpan = {
                minRelativeRow: childFrame?.powerBaseMinRelativeRow,
                maxRelativeRow: childFrame?.powerBaseMaxRelativeRow
            };

            if (!Number.isFinite(baseRowSpan.minRelativeRow) || !Number.isFinite(baseRowSpan.maxRelativeRow)) {
                throw new Error(`[GenesisRuntime:P4] Der POWER-Schale ${node.id} fehlt die vertikale Basisspanne.`);
            }

            return [
                create("paren_left", 0, baseRowSpan),
                create("paren_right", 0, baseRowSpan)
            ];
        }
        default:
            return [];
    }
}

function layoutCollection(nodes, context) {
    return mergeFrames(
        asCollection(nodes)
            .filter((node) => isVisibleRuntimeNode(node))
            .map((node) => layoutNode(node, context))
    );
}

function layoutLinearCollections(node, keys, context) {
    return mergeFrames(
        keys.map((key) => layoutCollection(node?.[key], context))
    );
}

function layoutShellChildren(node, context) {
    switch (node.type) {
        case "DIVISION": {
            const numerator = layoutCollection(node.numerator, context);
            const denominator = layoutCollection(node.denominator, context);
            return mergeFrames([
                shiftFrame(numerator, -1 - numerator.maxRelativeRow),
                shiftFrame(denominator, 1 - denominator.minRelativeRow)
            ]);
        }
        case "MULTIPLICATION":
            return layoutLinearCollections(node, ["factors", "operators"], context);
        case "ADDITION":
            return layoutLinearCollections(node, ["terms", "operators"], context);
        case "SUBTRACTION":
            return layoutLinearCollections(node, ["minuend", "operator", "subtrahend"], context);
        case "NEGATION":
            return layoutLinearCollections(node, ["operator", "content"], context);
        case "POWER": {
            const base = layoutCollection(node.content, context);
            const exponent = layoutCollection(node.exponentNodes, context);
            return {
                ...mergeFrames([
                    base,
                    shiftFrame(exponent, -1 - exponent.maxRelativeRow)
                ]),
                powerBaseMinRelativeRow: base.minRelativeRow,
                powerBaseMaxRelativeRow: base.maxRelativeRow
            };
        }
        case "FUNCTION": {
            const content = layoutCollection(node.content, context);
            const base = layoutCollection(node.baseContent, context);
            return mergeFrames([
                content,
                node.baseContent?.length > 0
                    ? shiftFrame(base, 1 - base.minRelativeRow)
                    : null
            ]);
        }
        case "ROOT": {
            const content = layoutCollection(node.content, context);
            const degree = layoutCollection(node.degreeNodes, context);
            return {
                ...mergeFrames([
                    content,
                    node.degreeNodes?.length > 0
                        ? shiftFrame(degree, -1 - degree.maxRelativeRow)
                        : null
                ]),
                rootRadicandMinRelativeRow: content.minRelativeRow
            };
        }
        case "GROUP":
        case "COLLECTION":
            return layoutCollection(node.content, context);
        default:
            return createFrame();
    }
}

function layoutNode(node, context) {
    if (!isVisibleRuntimeNode(node)) {
        return null;
    }

    if (isRuntimeLeafNode(node)) {
        return createFrame({
            content: [{
                key: buildContentKey(context.side, node.id),
                side: context.side,
                nodeId: node.id,
                relativeRow: 0
            }]
        });
    }

    if (!isRuntimeShellNode(node)) {
        throw new Error(`[GenesisRuntime:P4] Unbekannter sichtbarer Knotentyp ${node.type || "UNKNOWN"}.`);
    }

    const nextContext = {
        ...context,
        shellPath: [...(context.shellPath || []), node.id]
    };
    const childFrame = layoutShellChildren(node, nextContext);
    const ownSlots = buildOwnSlotRows(node, context, childFrame);
    const minRelativeRow = Math.min(
        0,
        childFrame.minRelativeRow,
        ...ownSlots.map((slot) => slot.minRelativeRow ?? slot.relativeRow)
    );
    const maxRelativeRow = Math.max(
        0,
        childFrame.maxRelativeRow,
        ...ownSlots.map((slot) => slot.maxRelativeRow ?? slot.relativeRow)
    );
    const shell = {
        rowId: context.rowId,
        shellId: node.id,
        shellType: node.type,
        side: context.side,
        depth: (context.shellPath || []).length,
        parentShellId: (context.shellPath || []).at(-1) || null,
        axisRelativeRow: 0,
        minRelativeRow,
        maxRelativeRow,
        slotRows: ownSlots.map((slot) => ({
            slotName: slot.slotName,
            relativeRow: slot.relativeRow,
            minRelativeRow: slot.minRelativeRow,
            maxRelativeRow: slot.maxRelativeRow
        }))
    };

    return createFrame({
        content: childFrame.content,
        slots: [...childFrame.slots, ...ownSlots],
        shells: [...childFrame.shells, shell],
        minRelativeRow,
        maxRelativeRow
    });
}

function buildLocalRowLookup(entries = [], relativeRowMin = 0) {
    return entries.reduce((lookup, entry) => {
        lookup[entry.key] = entry.relativeRow - relativeRowMin;
        return lookup;
    }, {});
}

function buildLocalRowSpanLookup(entries = [], relativeRowMin = 0) {
    return entries.reduce((lookup, entry) => {
        lookup[entry.key] = {
            rowSpanStart: (entry.minRelativeRow ?? entry.relativeRow) - relativeRowMin,
            rowSpanEnd: (entry.maxRelativeRow ?? entry.relativeRow) - relativeRowMin
        };
        return lookup;
    }, {});
}

function buildProjectionBlockForRow(row, blueprintLookup) {
    const rowFrame = mergeFrames([
        layoutCollection(row.left, { rowId: row.rowId, side: "left", shellPath: [] }),
        layoutCollection(row.right, { rowId: row.rowId, side: "right", shellPath: [] })
    ]);
    const relativeRowMin = Math.min(0, rowFrame.minRelativeRow);
    const relativeRowMax = Math.max(0, rowFrame.maxRelativeRow);
    const rowRoles = Array.from(
        { length: relativeRowMax - relativeRowMin + 1 },
        (_, index) => buildRowRole(relativeRowMin + index)
    );

    const shellBlocks = [...rowFrame.shells]
        .sort((left, right) => {
            if (left.depth !== right.depth) {
                return left.depth - right.depth;
            }

            return String(left.shellId).localeCompare(String(right.shellId));
        })
        .map((shell) => {
            const rowShellKey = `${shell.rowId}::${shell.shellId}`;
            const blueprint = blueprintLookup.get(rowShellKey) || null;

            if (!blueprint) {
                throw new Error(`[GenesisRuntime:P4] Dem Shell-Block ${rowShellKey} fehlt die lokalisierte Geometrie.`);
            }

            return {
                contractVersion: P4_PROJECTION_BLOCKS_VERSION,
                ...shell,
                axisLocalRow: shell.axisRelativeRow - relativeRowMin,
                localTopRow: shell.minRelativeRow - relativeRowMin,
                localBottomRow: shell.maxRelativeRow - relativeRowMin,
                rawColStart: blueprint.containerRange?.rawColStart ?? null,
                rawColEnd: blueprint.containerRange?.rawColEnd ?? null,
                contentRawColStart: blueprint.contentRange?.rawColStart ?? null,
                contentRawColEnd: blueprint.contentRange?.rawColEnd ?? null,
                alignmentRawColStart: blueprint.alignmentRange?.rawColStart ?? null,
                alignmentRawColEnd: blueprint.alignmentRange?.rawColEnd ?? null,
                slotLocalRows: (shell.slotRows || []).reduce((lookup, slot) => {
                    lookup[slot.slotName] = slot.relativeRow - relativeRowMin;
                    return lookup;
                }, {}),
                slotLocalRowSpans: (shell.slotRows || []).reduce((lookup, slot) => {
                    lookup[slot.slotName] = {
                        rowSpanStart: (slot.minRelativeRow ?? slot.relativeRow) - relativeRowMin,
                        rowSpanEnd: (slot.maxRelativeRow ?? slot.relativeRow) - relativeRowMin
                    };
                    return lookup;
                }, {})
            };
        });

    return {
        contractVersion: P4_PROJECTION_BLOCKS_VERSION,
        rowId: row.rowId,
        axisRelativeRow: 0,
        relativeRowMin,
        relativeRowMax,
        axisLocalRow: -relativeRowMin,
        localRowCount: relativeRowMax - relativeRowMin + 1,
        relativeRows: Array.from(
            { length: relativeRowMax - relativeRowMin + 1 },
            (_, index) => relativeRowMin + index
        ),
        rowRoles,
        rowKinds: [...rowRoles],
        contentLocalRows: buildLocalRowLookup(rowFrame.content, relativeRowMin),
        slotLocalRows: buildLocalRowLookup(rowFrame.slots, relativeRowMin),
        slotLocalRowSpans: buildLocalRowSpanLookup(rowFrame.slots, relativeRowMin),
        shellBlocks
    };
}

function buildProjectionBlocks(theoryRows = [], localGeometry = null) {
    const localizedBlueprints = localGeometry?.localizedShellBlueprints;
    if (!Array.isArray(localizedBlueprints)) {
        throw new Error("[GenesisRuntime:P4] Projektionsbloecke benoetigen die fertige lokale Geometrie.");
    }

    const blueprintLookup = new Map(
        localizedBlueprints.map((blueprint) => [blueprint.rowShellKey, blueprint])
    );

    return theoryRows.map((row) => buildProjectionBlockForRow(row, blueprintLookup));
}

export {
    P4_PROJECTION_BLOCKS_VERSION,
    buildProjectionBlocks
};
