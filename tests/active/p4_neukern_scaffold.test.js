import assert from "node:assert/strict";

import {
    P4_NEUKERN_MODULES,
    P4_NEUKERN_PRINCIPLES,
    normalizeTheoryRowsForNeukern,
    createProjectionDraft,
    ANCHOR_PLACEMENT_KEY,
    createRowShellKey,
    buildRowShellLookup,
    createPlacementKey,
    resolveSemanticColumn,
    resolveBoundarySemanticIds,
    findBlueprintCollection,
    resolveSemanticBoundaryColumns,
    resolveBlueprintBoundaryColumns,
    resolveCollectionBoundaryColumns,
    CHILD_COLLECTION_KEYS,
    SHELL_SLOT_KIND_BY_TYPE,
    resolveShellRole,
    collectChildCollections,
    isShellAtom,
    SHELL_GEOMETRY_CONTENT_COL_STEP,
    toProjectionContentCol,
    toProjectionBoundaryRange,
    resolveProjectionBoundaryRange,
    resolveProjectionCollectionBoundaryRange,
    createCenteredRawCol,
    createContainerRange,
    createSingleSlot,
    createSpanningSlot,
    resolveDivisionLayout,
    resolveFunctionLayout,
    resolveGroupLayout,
    resolveRootLayout,
    resolvePowerLayout,
    resolveNegationLayout,
    resolveBinaryInlineLayout,
    resolveShellHorizontalLayout,
    resolveShellSlotDescriptors,
    resolveShellSlotLocalRow,
    createShellContainerProjectionAtom,
    createShellSlotProjectionAtom,
    buildShellProjectionAtoms,
    createAtomPathKey,
    resolveLeafProjectionRole,
    buildLeafColumnLookup,
    createLeafProjectionAtom,
    collectVisibleLeafProjectionAtoms,
    sortProjectionAtoms,
    normalizeProjectionColumns,
    createDefaultBlockRow,
    createLeafTraversalContext,
    buildProjectionRowDraft,
    buildProjectionRowsDraft,
    collectCollectionBounds,
    collectAtomBounds,
    collectRowShellStatesAndBounds,
    buildShellBlock,
    buildProjectionBlockRow,
    buildProjectionBlockRows,
    createRelativeBounds,
    mergeRelativeBounds,
    toLocalRow,
    toRelativeRow,
    resolveRowKind,
    buildRowKinds,
    resolveAxisContext,
    createBlockFrame,
    buildGlobalSemanticRasterDraft,
    resolveGlobalSemanticRasterDraftInputs,
    createGlobalSemanticRasterDraftFromResolvedInputs,
    resolveAnchorIndex,
    resolveSemanticId,
    isLeafAtom,
    isVisibleLeafEntry,
    createSemanticEntry,
    flattenAtomEntries,
    createRowRasterEntry,
    buildTraceMap,
    buildSharedSemanticIds,
    buildMixedSideSemanticIds,
    dedupeSemanticSequence,
    compareNodePriority,
    buildSideOrderDraft,
    createContentColumnEntry,
    createAnchorColumn,
    buildSemanticPlacements,
    buildColumnBySemanticId,
    buildRowsWithColumns,
    createSemanticRasterColumnLayout,
    buildShellBlueprintDraft,
    resolveShellBlueprintDraftInputs,
    collectVisibleLeafSemanticIds,
    collectVisibleDescendantSemanticIds,
    collectVisibleDescendantShellIds,
    buildCollectionBlueprint,
    buildCollectionBlueprints,
    createShellBlueprint,
    walkShellBlueprints,
    createShellBlueprintTraversalContext,
    createShellBlueprintDraftFromResolvedInputs,
    buildProjectionBlockDraft,
    resolveProjectionBlockDraftInputs,
    buildProjectionWriterDraft,
    createProjectionWriterDraftFromResolvedInputs,
    resolveProjectionWriterDraftInputs,
    buildOutputContractDraft,
    createOutputContractDraftFromResolvedInputs,
    resolveOutputContractDraftInputs,
    walkTheoryAtoms,
    buildAtomRegister,
    buildProjectionAtomRegister,
    buildTraceIndex,
    buildLayoutPlan,
    buildOutputProfiles,
    buildLegacyProjectionResultFromOutputContract,
    processP4NeukernLegacy,
    buildP4NeukernDraft
} from "../../core/P4_Neukern/index.js";

assert.equal(P4_NEUKERN_MODULES.length, 5);
assert.ok(P4_NEUKERN_PRINCIPLES.includes("one_semantic_raster"));

const normalizedRows = normalizeTheoryRowsForNeukern([
    {
        atoms: [{ id: "x", value: "x", type: "VARIABLE", isVisible: true }]
    }
]);

assert.equal(normalizedRows.length, 1);
assert.equal(normalizedRows[0].rowId, "theory-0");
assert.equal(normalizedRows[0].atoms[0].id, "x");
assert.equal(ANCHOR_PLACEMENT_KEY, "__anchor__");
assert.equal(createRowShellKey("r0", "shell-a"), "r0::shell-a");
assert.equal(createPlacementKey("left", "alpha"), "left::alpha");
assert.equal(createPlacementKey("anchor", "eq"), "__anchor__");
assert.ok(CHILD_COLLECTION_KEYS.includes("numerator"));
assert.deepEqual(SHELL_SLOT_KIND_BY_TYPE.DIVISION, ["fraction_line"]);
assert.equal(resolveShellRole({ type: "DIVISION" }), "fraction");
assert.equal(
    collectChildCollections({
        type: "DIVISION",
        numerator: [{ id: "a", value: "a", type: "VARIABLE", isVisible: true }],
        denominator: [{ id: "b", value: "b", type: "VARIABLE", isVisible: true }]
    })[0].rowShift,
    -1
);
assert.equal(isShellAtom({ type: "FUNCTION", content: [] }), true);
assert.equal(createAtomPathKey([0, "denominator", 1]), "0.denominator.1");
assert.equal(resolveAnchorIndex([{ value: "a" }, { value: "=" }, { value: "b" }]), 1);
assert.equal(resolveSemanticId({ id: "alpha" }, 0, 0), "alpha");
assert.equal(resolveSemanticId({}, 2, 3), "anonymous-2-3");
assert.equal(isLeafAtom({ id: "leaf", value: "x", type: "VARIABLE" }), true);
assert.equal(SHELL_GEOMETRY_CONTENT_COL_STEP, 4);
assert.equal(toProjectionContentCol(3), 12);
assert.equal(createCenteredRawCol(2, 5), 3);
assert.equal(createContainerRange(2, 6).rawCol, 4);
assert.equal(createSingleSlot(7).rawColEnd, 7);
assert.equal(createSpanningSlot(2, 6).rawCol, 4);
assert.deepEqual(
    resolveBoundarySemanticIds(["alpha", "beta", "gamma"]),
    {
        leftBoundarySemanticId: "alpha",
        rightBoundarySemanticId: "gamma"
    }
);
assert.deepEqual(createRelativeBounds(2), {
    minRelativeRow: 2,
    maxRelativeRow: 2
});
assert.deepEqual(
    mergeRelativeBounds(createRelativeBounds(-1), createRelativeBounds(2)),
    {
        minRelativeRow: -1,
        maxRelativeRow: 2
    }
);
assert.equal(toLocalRow(2, -1), 3);
assert.equal(toRelativeRow(1, -1), 0);
assert.equal(resolveRowKind(-1, 0), "above_axis");
assert.equal(resolveRowKind(0, 0), "axis");
assert.equal(resolveRowKind(1, 0), "below_axis");
assert.deepEqual(buildRowKinds(-1, 2, 0), [
    "above_axis",
    "axis",
    "below_axis",
    "below_axis"
]);
assert.equal(resolveAxisContext([{ shellRole: "fraction" }]), "fraction_axis");
assert.equal(resolveAxisContext([{ shellRole: "function" }]), "baseline_axis");
assert.deepEqual(createBlockFrame(-1, 2, 0, "fraction_axis"), {
    minRelativeRow: -1,
    maxRelativeRow: 2,
    localRowCount: 4,
    axisRelativeRow: 0,
    axisLocalRow: 1,
    axisContext: "fraction_axis",
    rowKinds: [
        "above_axis",
        "axis",
        "below_axis",
        "below_axis"
    ]
});
assert.deepEqual(
    collectCollectionBounds(
        [{ id: "leaf", value: "x", type: "VARIABLE", isVisible: true }],
        2
    ),
    { minRelativeRow: 2, maxRelativeRow: 2 }
);
assert.equal(resolveShellSlotDescriptors("DIVISION").length, 1);
assert.equal(resolveShellSlotDescriptors("FUNCTION", { shellName: "cos" })[0].value, "cos");
assert.equal(resolveShellSlotDescriptors("ROOT")[0].rowMode, "top");
assert.equal(resolveShellSlotLocalRow({ axisLocalRow: 1, localTopRow: 0 }, "axis"), 1);
assert.equal(resolveShellSlotLocalRow({ axisLocalRow: 1, localTopRow: 0 }, "top"), 0);
assert.equal(resolveLeafProjectionRole({ side: "anchor" }), "anchor");
assert.equal(resolveLeafProjectionRole({ collectionPath: ["numerator"] }), "numerator");
assert.equal(
    resolveLeafProjectionRole({ immediateCollectionKey: "content", immediateShellType: "NEGATION" }),
    "negation_content"
);
assert.equal(
    isVisibleLeafEntry({
        projectionVisible: true,
        atom: { id: "leaf", value: "x", type: "VARIABLE" }
    }),
    true
);
assert.equal(
    createSemanticEntry(
        { id: "alpha", value: "a", type: "VARIABLE", isVisible: true },
        {
            rowId: "r0",
            rowIndex: 0,
            atomIndex: 0,
            atomPath: [0],
            side: "left",
            rootAtomIndex: 0,
            depth: 0,
            parentSemanticId: null,
            parentCollectionKey: null,
            projectionVisible: true
        }
    ).semanticId,
    "alpha"
);
assert.equal(
    flattenAtomEntries(
        { id: "alpha", value: "a", type: "VARIABLE", isVisible: true },
        {
            rowId: "r0",
            rowIndex: 0,
            atomIndex: 0,
            atomPath: [0],
            side: "left",
            rootAtomIndex: 0,
            depth: 0,
            parentSemanticId: null,
            parentCollectionKey: null,
            projectionVisible: true
        }
    ).length,
    1
);
assert.deepEqual(dedupeSemanticSequence(["a", "a", "b"]), ["a", "b"]);
assert.equal(
    compareNodePriority(
        { firstRowIndex: 0, firstSequenceIndex: 1, semanticId: "a" },
        { firstRowIndex: 1, firstSequenceIndex: 0, semanticId: "b" }
    ) < 0,
    true
);
assert.deepEqual(
    collectVisibleLeafSemanticIds([
        { id: "leaf-a", value: "a", type: "VARIABLE", isVisible: true }
    ]),
    ["leaf-a"]
);
assert.deepEqual(
    collectVisibleDescendantSemanticIds([
        { id: "leaf-a", value: "a", type: "VARIABLE", isVisible: true }
    ]),
    ["leaf-a"]
);
assert.deepEqual(
    collectVisibleDescendantShellIds([
        {
            id: "fn-shell",
            type: "FUNCTION",
            name: "cos",
            isVisible: true,
            content: [{ id: "leaf-a", value: "a", type: "VARIABLE", isVisible: true }]
        }
    ]),
    ["fn-shell"]
);
let walkedTheoryAtomCount = 0;

walkTheoryAtoms(
    [{ id: "leaf-a", value: "a", type: "VARIABLE", isVisible: true }],
    () => {
        walkedTheoryAtomCount += 1;
    }
);

assert.equal(walkedTheoryAtomCount, 1);

const draft = createProjectionDraft(normalizedRows);

assert.deepEqual(Object.keys(draft), [
    "theoryRows",
    "semanticRaster",
    "shellBlueprints",
    "projectionBlocks",
    "projectionRows"
]);
assert.equal(draft.theoryRows.length, 1);
assert.deepEqual(draft.semanticRaster, {
    columns: [],
    traces: []
});

const rasterDraft = buildGlobalSemanticRasterDraft([
    {
        rowId: "r0",
        atoms: [
            { id: "a", value: "a", type: "VARIABLE", isVisible: true },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "b", value: "b", type: "VARIABLE", isVisible: true }
        ]
    },
    {
        rowId: "r1",
        atoms: [
            { id: "a", value: "a", type: "VARIABLE", isVisible: true },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);
const resolvedRasterInputs = resolveGlobalSemanticRasterDraftInputs([
    {
        rowId: "r0",
        atoms: [
            { id: "a", value: "a", type: "VARIABLE", isVisible: true },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "b", value: "b", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(rasterDraft.rows.length, 2);
assert.equal(resolvedRasterInputs.normalizedTheoryRows[0].rowId, "r0");
assert.equal(rasterDraft.rows[0].anchorIndex, 1);
assert.deepEqual(rasterDraft.rows[0].leftAtoms.map((atom) => atom.id), ["a"]);
assert.deepEqual(rasterDraft.rows[0].rightAtoms.map((atom) => atom.id), ["b"]);
assert.deepEqual(rasterDraft.rows[0].leftLeafSemanticIds, ["a"]);
assert.deepEqual(rasterDraft.rows[0].anchorLeafSemanticIds, ["eq"]);
assert.deepEqual(rasterDraft.rows[0].rightLeafSemanticIds, ["b"]);
assert.equal(rasterDraft.anchorColumn.globalCol, 1);
assert.equal(rasterDraft.columns.length, 4);
assert.equal(rasterDraft.columnBySemanticId.a.globalCol, 0);
assert.equal(rasterDraft.columnBySemanticId.eq.globalCol, 1);
assert.equal(rasterDraft.columnBySemanticId.b.globalCol, 2);
assert.equal(rasterDraft.columnBySemanticId.c.globalCol, 3);
assert.equal(rasterDraft.rows[1].leafColumns.find((entry) => entry.semanticId === "c")?.globalCol, 3);
assert.equal(resolveSemanticColumn(rasterDraft, "left", "a")?.globalCol, 0);
assert.equal(resolveSemanticColumn(rasterDraft, "anchor", "eq")?.globalCol, 1);
assert.equal(resolveSemanticColumn(rasterDraft, "right", "c")?.globalCol, 3);
assert.equal(
    resolveSemanticBoundaryColumns(rasterDraft, "left", "a", "a")?.leftColumn?.globalCol,
    0
);
assert.equal(
    resolveSemanticBoundaryColumns(rasterDraft, "right", "c", "c")?.rightColumn?.globalCol,
    3
);
assert.equal(rasterDraft.orderingDiagnostics.left.hasCycle, false);
assert.equal(rasterDraft.orderingDiagnostics.right.hasCycle, false);
assert.equal(
    createGlobalSemanticRasterDraftFromResolvedInputs(resolvedRasterInputs).rows.length,
    1
);
assert.equal(createRowRasterEntry(resolvedRasterInputs.normalizedTheoryRows[0], 0).anchorIndex, 1);
assert.equal(buildTraceMap(rasterDraft.rows).get("a")?.occurrences.length, 2);
assert.ok(buildSharedSemanticIds(buildTraceMap(rasterDraft.rows)).includes("a"));
assert.equal(buildMixedSideSemanticIds(buildTraceMap(rasterDraft.rows)).includes("a"), false);
assert.equal(buildSideOrderDraft(rasterDraft.rows, "left").hasCycle, false);
assert.equal(createAnchorColumn(3).globalCol, 3);
assert.equal(
    createContentColumnEntry("a", "left", 0, 0, buildTraceMap(rasterDraft.rows)).globalCol,
    0
);
assert.ok(rasterDraft.sharedSemanticIds.includes("a"));
assert.ok(rasterDraft.sharedSemanticIds.includes("eq"));
assert.equal(
    rasterDraft.traces.find((trace) => trace.semanticId === "a")?.occurrences.length,
    2
);
assert.equal(
    rasterDraft.traces.find((trace) => trace.semanticId === "a")?.occurrences[0]?.depth,
    0
);
const rasterColumnLayout = createSemanticRasterColumnLayout(
    rasterDraft.rows,
    buildTraceMap(rasterDraft.rows)
);
assert.equal(rasterColumnLayout.columns.length, 4);
assert.equal(
    buildColumnBySemanticId(
        rasterColumnLayout.semanticPlacements,
        rasterColumnLayout.columnByPlacementKey
    ).a?.globalCol,
    0
);
assert.equal(
    buildSemanticPlacements(
        buildTraceMap(rasterDraft.rows),
        rasterColumnLayout.columns,
        rasterColumnLayout.anchorColumn,
        rasterDraft.rows
    ).semanticPlacements.eq.length,
    1
);
assert.equal(
    buildRowsWithColumns(
        rasterDraft.rows,
        rasterColumnLayout.columnByPlacementKey,
        rasterColumnLayout.anchorColumn
    )[0].leafColumns.length,
    3
);
const simpleLeafColumnLookup = buildLeafColumnLookup(rasterDraft.rows[0]);
const simpleLeafBlockRow = {
    rowId: "r0",
    rowIndex: 0,
    minRelativeRow: 0
};
const simpleLeafContext = {
    atomPath: [0],
    relativeRow: 0,
    side: "left",
    collectionPath: [],
    shellTypePath: [],
    immediateCollectionKey: null,
    immediateShellType: null,
    parentShellId: null
};
const simpleLeafProjectionAtom = createLeafProjectionAtom(
    rasterDraft.rows[0].atoms[0].atom,
    simpleLeafColumnLookup.get("0"),
    simpleLeafContext,
    simpleLeafBlockRow
);

assert.equal(simpleLeafColumnLookup.get("0")?.semanticId, "a");
assert.equal(simpleLeafProjectionAtom.col, 0);
assert.equal(simpleLeafProjectionAtom.projectionRole, "content");
assert.equal(
    collectVisibleLeafProjectionAtoms(
        [rasterDraft.rows[0].atoms[0].atom],
        {
            ...simpleLeafContext,
            projectionVisible: true,
            useCollectionIndex: false
        },
        simpleLeafColumnLookup,
        simpleLeafBlockRow
    )[0]?.sourceAtomId,
    "a"
);
assert.deepEqual(
    [
        { id: "b", localRow: 1, colStart: 8 },
        { id: "a", localRow: 0, colStart: 8 },
        { id: "c", localRow: 1, colStart: 4 }
    ].sort(sortProjectionAtoms).map((atom) => atom.id),
    ["a", "c", "b"]
);
assert.equal(
    normalizeProjectionColumns([
        {
            positionedAtoms: [
                { id: "shift", rawCol: -2, rawColStart: -2, rawColEnd: 0 }
            ]
        }
    ]).globalColShift,
    2
);
assert.deepEqual(createDefaultBlockRow({ rowId: "r0", rowIndex: 0 }), {
    rowId: "r0",
    rowIndex: 0,
    minRelativeRow: 0,
    axisLocalRow: 0,
    localRowCount: 1,
    rowKinds: ["axis"],
    shellBlocks: []
});
assert.deepEqual(createLeafTraversalContext({ atomIndex: 3, side: "right" }), {
    atomPath: [3],
    relativeRow: 0,
    side: "right",
    projectionVisible: true,
    collectionPath: [],
    shellTypePath: [],
    immediateCollectionKey: null,
    immediateShellType: null,
    parentShellId: null,
    useCollectionIndex: false
});

const shellBlueprintRows = [
    {
        rowId: "r0",
        atoms: [
            {
                id: "div-1",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-1",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
];
const shellBlueprintRasterDraft = buildGlobalSemanticRasterDraft(shellBlueprintRows);
const shellBlueprintDraft = buildShellBlueprintDraft(shellBlueprintRows, shellBlueprintRasterDraft);
const resolvedShellBlueprintInputs = resolveShellBlueprintDraftInputs(shellBlueprintRows);
const resolvedProjectionBlockInputs = resolveProjectionBlockDraftInputs(shellBlueprintRows);
const resolvedProjectionWriterInputs = resolveProjectionWriterDraftInputs(shellBlueprintRows);
const resolvedOutputContractInputs = resolveOutputContractDraftInputs(shellBlueprintRows);

assert.equal(shellBlueprintDraft.blueprints.length, 2);
assert.equal(resolvedShellBlueprintInputs.normalizedTheoryRows[0].rowId, "r0");
assert.equal(resolvedShellBlueprintInputs.semanticRaster.rows.length, 1);
assert.equal(resolvedProjectionBlockInputs.shellBlueprintDraft.blueprints.length, 2);
assert.equal(resolvedProjectionWriterInputs.projectionBlockDraft.rows.length, 1);
assert.equal(resolvedOutputContractInputs.projectionWriterDraft.rows.length, 1);
assert.equal(
    createProjectionWriterDraftFromResolvedInputs(resolvedProjectionWriterInputs).rows.length,
    1
);
assert.equal(
    createOutputContractDraftFromResolvedInputs(resolvedOutputContractInputs).layoutPlan.rowCount,
    1
);

const divisionBlueprint = shellBlueprintDraft.blueprints.find((blueprint) => blueprint.shellId === "div-1");
const functionBlueprint = shellBlueprintDraft.blueprints.find((blueprint) => blueprint.shellId === "fn-1");
const shellBlueprintLookup = buildRowShellLookup(shellBlueprintDraft.blueprints);
const divisionBoundsCollection = collectRowShellStatesAndBounds(shellBlueprintRasterDraft.rows[0]);
let walkedShellBlueprintCount = 0;

walkShellBlueprints(
    [shellBlueprintRows[0].atoms[0]],
    createShellBlueprintTraversalContext(shellBlueprintRasterDraft.rows[0], shellBlueprintRasterDraft.rows[0].atoms[0]),
    {
        push() {
            walkedShellBlueprintCount += 1;
        }
    }
);

assert.ok(divisionBlueprint);
assert.ok(functionBlueprint);
assert.equal(walkedShellBlueprintCount, 2);
assert.equal(divisionBoundsCollection.bounds?.minRelativeRow, -1);
assert.equal(divisionBoundsCollection.shellStates.length, 2);
assert.deepEqual(
    buildCollectionBlueprint({
        key: "numerator",
        entries: [{ id: "a", value: "a", type: "VARIABLE", isVisible: true }]
    }).visibleLeafSemanticIds,
    ["a"]
);
assert.equal(
    buildCollectionBlueprints([
        {
            key: "numerator",
            entries: [{ id: "a", value: "a", type: "VARIABLE", isVisible: true }]
        }
    ]).length,
    1
);
assert.equal(
    createShellBlueprint(
        shellBlueprintRows[0].atoms[0],
        {
            rowId: "r0",
            rowIndex: 0,
            rootAtomIndex: 0,
            side: "left",
            depth: 0,
            parentShellId: null,
            parentCollectionKey: null,
            shellId: "div-1"
        }
    ).shellRole,
    "fraction"
);
assert.equal(
    createShellBlueprintDraftFromResolvedInputs({
        semanticRaster: shellBlueprintRasterDraft
    }).blueprints.length,
    2
);
assert.equal(shellBlueprintLookup.get("r0::div-1")?.shellType, "DIVISION");
assert.equal(shellBlueprintLookup.get("r0::fn-1")?.shellType, "FUNCTION");
assert.equal(findBlueprintCollection(divisionBlueprint, "numerator")?.key, "numerator");
assert.equal(findBlueprintCollection(divisionBlueprint, "denominator")?.key, "denominator");
assert.equal(divisionBlueprint.shellRole, "fraction");
assert.deepEqual(divisionBlueprint.shellSlotKinds, ["fraction_line"]);
assert.equal(divisionBlueprint.collections[0].key, "numerator");
assert.deepEqual(divisionBlueprint.collections[0].visibleLeafSemanticIds, ["a"]);
assert.equal(divisionBlueprint.collections[1].key, "denominator");
assert.deepEqual(divisionBlueprint.collections[1].visibleLeafSemanticIds, ["beta"]);
assert.equal(
    resolveBlueprintBoundaryColumns(shellBlueprintRasterDraft, "left", divisionBlueprint)?.leftColumn?.globalCol,
    0
);
assert.equal(
    resolveBlueprintBoundaryColumns(shellBlueprintRasterDraft, "left", divisionBlueprint)?.rightColumn?.globalCol,
    1
);
assert.equal(
    resolveCollectionBoundaryColumns(shellBlueprintRasterDraft, "left", divisionBlueprint, "numerator")?.leftColumn?.globalCol,
    0
);
assert.equal(
    resolveCollectionBoundaryColumns(shellBlueprintRasterDraft, "left", divisionBlueprint, "denominator")?.rightColumn?.globalCol,
    1
);
assert.equal(
    resolveProjectionBoundaryRange(shellBlueprintRasterDraft, "left", divisionBlueprint)?.rawColEnd,
    4
);
assert.equal(
    toProjectionBoundaryRange({
        leftColumn: { globalCol: 0 },
        rightColumn: { globalCol: 1 }
    })?.rawColEnd,
    4
);
assert.equal(
    resolveProjectionCollectionBoundaryRange(shellBlueprintRasterDraft, "left", divisionBlueprint, "denominator")?.rawColStart,
    4
);
assert.equal(
    resolveShellHorizontalLayout("DIVISION", shellBlueprintRasterDraft, "left", divisionBlueprint)?.containerRange?.rawColEnd,
    4
);
assert.equal(
    resolveShellHorizontalLayout("FUNCTION", shellBlueprintRasterDraft, "left", functionBlueprint)?.slots?.function_name?.rawCol,
    2
);
assert.equal(
    resolveDivisionLayout(shellBlueprintRasterDraft, "left", divisionBlueprint)?.slots?.fraction_line?.rawColEnd,
    4
);
assert.equal(
    resolveFunctionLayout(shellBlueprintRasterDraft, "left", functionBlueprint)?.containerRange?.rawColStart,
    2
);
assert.equal(
    resolveGroupLayout(
        shellBlueprintRasterDraft,
        "left",
        {
            ...functionBlueprint,
            collections: [{ key: "content", leftBoundarySemanticId: "beta", rightBoundarySemanticId: "beta" }]
        }
    )?.slots?.group_left?.rawCol,
    3
);
assert.equal(
    resolveRootLayout(
        shellBlueprintRasterDraft,
        "left",
        {
            ...functionBlueprint,
            collections: [{ key: "content", leftBoundarySemanticId: "beta", rightBoundarySemanticId: "beta" }]
        }
    )?.slots?.root_hook?.rawCol,
    3
);
assert.equal(
    resolvePowerLayout(
        shellBlueprintRasterDraft,
        "left",
        {
            ...functionBlueprint,
            collections: [{ key: "content", leftBoundarySemanticId: "beta", rightBoundarySemanticId: "beta" }]
        }
    )?.slots?.power_exponent?.rawCol,
    5
);
assert.equal(
    resolveNegationLayout(
        shellBlueprintRasterDraft,
        "left",
        {
            ...functionBlueprint,
            collections: [{ key: "content", leftBoundarySemanticId: "beta", rightBoundarySemanticId: "beta" }]
        }
    )?.slots?.negation_sign?.rawCol,
    3
);
assert.equal(
    resolveBinaryInlineLayout(
        shellBlueprintRasterDraft,
        "left",
        {
            ...divisionBlueprint,
            collections: [
                { key: "content", leftBoundarySemanticId: "a", rightBoundarySemanticId: "a" },
                { key: "factor", leftBoundarySemanticId: "beta", rightBoundarySemanticId: "beta" }
            ]
        },
        "factor"
    )?.slots?.inline_operator?.rawCol,
    2
);
const divisionGeometry = resolveShellHorizontalLayout(
    "DIVISION",
    shellBlueprintRasterDraft,
    "left",
    divisionBlueprint
);
const divisionBlockRow = {
    rowId: "r0",
    rowIndex: 0,
    minRelativeRow: -1,
    axisLocalRow: 1
};
const divisionShellBlock = {
    shellId: "div-1",
    shellType: "DIVISION",
    shellRole: "fraction",
    shellSlotKinds: ["fraction_line"],
    side: "left",
    axisLocalRow: 1,
    parentShellId: null
};
const divisionContainerAtom = createShellContainerProjectionAtom(
    divisionShellBlock,
    divisionBlueprint,
    divisionBlockRow,
    divisionGeometry
);
const divisionSlotAtom = createShellSlotProjectionAtom(
    divisionShellBlock,
    divisionBlockRow,
    resolveShellSlotDescriptors("DIVISION")[0],
    divisionGeometry?.slots?.fraction_line || null
);

assert.equal(divisionContainerAtom?.colEnd, 4);
assert.equal(divisionContainerAtom?.projectionRole, "fraction");
assert.equal(divisionContainerAtom?.relativeRow, 0);
assert.equal(divisionSlotAtom?.projectionRole, "fraction_line");
assert.equal(divisionSlotAtom?.localRow, 1);
assert.deepEqual(
    buildShellProjectionAtoms(
        divisionShellBlock,
        shellBlueprintRasterDraft,
        shellBlueprintLookup,
        divisionBlockRow
    ).map((atom) => atom.projectionRole),
    ["fraction", "fraction_line"]
);
assert.equal(
    buildShellBlock(
        divisionBoundsCollection.shellStates.find((shellState) => shellState.shellId === "div-1"),
        -1,
        shellBlueprintLookup
    ).axisLocalRow,
    1
);
assert.equal(
    buildProjectionRowDraft(
        shellBlueprintRasterDraft.rows[0],
        shellBlueprintRasterDraft,
        shellBlueprintLookup,
        {
            ...divisionBlockRow,
            maxRelativeRow: 1,
            localRowCount: 3,
            axisContext: "fraction_axis",
            rowKinds: ["above_axis", "axis", "below_axis"],
            shellBlocks: [divisionShellBlock]
        }
    ).positionedAtoms.some((atom) => atom.projectionRole === "fraction_line"),
    true
);
assert.equal(
    buildProjectionRowsDraft(
        [shellBlueprintRasterDraft.rows[0]],
        shellBlueprintRasterDraft,
        shellBlueprintLookup,
        new Map([[
            "r0",
            {
                ...divisionBlockRow,
                maxRelativeRow: 1,
                localRowCount: 3,
                axisContext: "fraction_axis",
                rowKinds: ["above_axis", "axis", "below_axis"],
                shellBlocks: [divisionShellBlock]
            }
        ]])
    )[0].rowId,
    "r0"
);
assert.equal(
    buildProjectionBlockRow(shellBlueprintRasterDraft.rows[0], shellBlueprintLookup).axisContext,
    "fraction_axis"
);
assert.equal(
    buildProjectionBlockRows([shellBlueprintRasterDraft.rows[0]], shellBlueprintLookup).length,
    1
);
assert.equal(functionBlueprint.parentShellId, "div-1");
assert.equal(functionBlueprint.parentCollectionKey, "denominator");
assert.deepEqual(functionBlueprint.shellSlotKinds, ["function_name", "function_left", "function_right"]);

const fullDraft = buildP4NeukernDraft([
    {
        rowId: "r0",
        atoms: [
            {
                id: "div-1",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-1",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(fullDraft.semanticRaster.rows.length, 1);
assert.equal(fullDraft.shellBlueprints.length, 2);
assert.equal(fullDraft.projectionBlocks.length, 1);
assert.equal(fullDraft.projectionRows.length, 1);
assert.equal(fullDraft.projectionWriterDiagnostics.globalColShift, 0);
assert.equal(fullDraft.outputContract.version, "p4_neukern_output_contract_v1");
assert.equal(fullDraft.outputContract.layoutPlan.anchorProjectionCol, 8);
assert.equal(fullDraft.outputContract.outputProfiles.film.readsSameTraceIndex, true);

const projectionBlocks = buildProjectionBlockDraft([
    {
        rowId: "r0",
        atoms: [
            {
                id: "outer-div",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "inner-div",
                        type: "DIVISION",
                        isVisible: true,
                        numerator: [
                            { id: "b", value: "b", type: "VARIABLE", isVisible: true }
                        ],
                        denominator: [
                            {
                                id: "fn-1",
                                type: "FUNCTION",
                                name: "cos",
                                isVisible: true,
                                content: [
                                    { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                                ]
                            }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(projectionBlocks.rows.length, 1);
assert.equal(projectionBlocks.rows[0].minRelativeRow, -1);
assert.equal(projectionBlocks.rows[0].maxRelativeRow, 2);
assert.equal(projectionBlocks.rows[0].localRowCount, 4);
assert.equal(projectionBlocks.rows[0].axisLocalRow, 1);
assert.equal(projectionBlocks.rows[0].axisContext, "fraction_axis");
assert.deepEqual(projectionBlocks.rows[0].rowKinds, [
    "above_axis",
    "axis",
    "below_axis",
    "below_axis"
]);

const outerDivisionBlock = projectionBlocks.rows[0].shellBlocks.find((shellBlock) => shellBlock.shellId === "outer-div");
const innerDivisionBlock = projectionBlocks.rows[0].shellBlocks.find((shellBlock) => shellBlock.shellId === "inner-div");

assert.ok(outerDivisionBlock);
assert.ok(innerDivisionBlock);
assert.equal(outerDivisionBlock.axisLocalRow, 1);
assert.equal(outerDivisionBlock.localTopRow, 0);
assert.equal(outerDivisionBlock.localBottomRow, 3);
assert.equal(innerDivisionBlock.axisLocalRow, 2);
assert.equal(innerDivisionBlock.localTopRow, 1);
assert.equal(innerDivisionBlock.localBottomRow, 3);

const projectionWriterDraft = buildProjectionWriterDraft([
    {
        rowId: "r0",
        atoms: [
            {
                id: "div-1",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-1",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(projectionWriterDraft.globalColShift, 0);
assert.equal(projectionWriterDraft.rows.length, 1);
assert.equal(projectionWriterDraft.rows[0].localRowCount, 3);

const writerAtoms = projectionWriterDraft.rows[0].positionedAtoms;
const numeratorLeaf = writerAtoms.find((atom) => atom.sourceAtomId === "a");
const denominatorLeaf = writerAtoms.find((atom) => atom.sourceAtomId === "beta");
const anchorLeaf = writerAtoms.find((atom) => atom.sourceAtomId === "eq");
const rightLeaf = writerAtoms.find((atom) => atom.sourceAtomId === "c");
const fractionLine = writerAtoms.find((atom) => atom.projectionRole === "fraction_line");
const functionName = writerAtoms.find((atom) => atom.projectionRole === "function_name");
const functionLeft = writerAtoms.find((atom) => atom.projectionRole === "function_left");
const functionRight = writerAtoms.find((atom) => atom.projectionRole === "function_right");

assert.ok(numeratorLeaf);
assert.ok(denominatorLeaf);
assert.ok(anchorLeaf);
assert.ok(rightLeaf);
assert.ok(fractionLine);
assert.ok(functionName);
assert.ok(functionLeft);
assert.ok(functionRight);

assert.equal(numeratorLeaf.localRow, 0);
assert.equal(numeratorLeaf.col, 0);
assert.equal(numeratorLeaf.projectionRole, "numerator");
assert.equal(fractionLine.localRow, 1);
assert.equal(fractionLine.colStart, 0);
assert.equal(fractionLine.colEnd, 4);
assert.equal(anchorLeaf.localRow, 1);
assert.equal(anchorLeaf.col, 8);
assert.equal(rightLeaf.col, 12);
assert.equal(denominatorLeaf.localRow, 2);
assert.equal(denominatorLeaf.col, 4);
assert.equal(denominatorLeaf.projectionRole, "denominator");
assert.equal(functionName.col, 2);
assert.equal(functionLeft.col, 3);
assert.equal(functionRight.col, 5);

const shiftedFunctionWriterDraft = buildProjectionWriterDraft([
    {
        rowId: "r0",
        atoms: [
            {
                id: "fn-shift",
                type: "FUNCTION",
                name: "cos",
                isVisible: true,
                content: [
                    { id: "alpha-shift", value: "alpha", type: "VARIABLE", isVisible: true }
                ]
            },
            { id: "eq-shift", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c-shift", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(shiftedFunctionWriterDraft.globalColShift, 2);
assert.ok(
    shiftedFunctionWriterDraft.rows[0].positionedAtoms.every((atom) => atom.colStart >= 0),
    "Ein globaler Shell-Shift soll negative Startspalten einmalig fuer alle Zeilen vermeiden."
);

const outputContractDraft = buildOutputContractDraft([
    {
        rowId: "r0",
        atoms: [
            {
                id: "div-1",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-1",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(outputContractDraft.version, "p4_neukern_output_contract_v1");
assert.equal(outputContractDraft.atomRegister.length, 6);
assert.ok(outputContractDraft.projectionAtomRegister.length > outputContractDraft.atomRegister.length);
assert.equal(outputContractDraft.layoutPlan.mode, "p4_neukern_output_contract_v1");
assert.equal(outputContractDraft.layoutPlan.anchorContentCol, 2);
assert.equal(outputContractDraft.layoutPlan.anchorProjectionCol, 8);
assert.equal(outputContractDraft.layoutPlan.globalColShift, 0);
assert.equal(outputContractDraft.layoutPlan.stackedVisualRowCount, 3);
assert.equal(outputContractDraft.traceIndex.a.theory.length, 1);
assert.ok(outputContractDraft.traceIndex.a.projection.some((entry) => entry.projectionRole === "numerator"));
assert.ok(outputContractDraft.traceIndex.beta.projection.some((entry) => entry.projectionRole === "denominator"));
assert.equal(outputContractDraft.outputProfiles.pdf.reconstructsNothing, true);
assert.equal(buildAtomRegister(outputContractDraft.theoryRows).length, 6);
assert.ok(
    buildProjectionAtomRegister(outputContractDraft.projectionRows).length
        > buildAtomRegister(outputContractDraft.theoryRows).length
);
assert.equal(buildTraceIndex(outputContractDraft.theoryRows, outputContractDraft.projectionRows).a.theory.length, 1);
assert.equal(
    buildLayoutPlan(
        outputContractDraft.projectionRows,
        {
            columns: outputContractDraft.semanticColumns,
            anchorColumn: { globalCol: outputContractDraft.layoutPlan.anchorContentCol }
        },
        outputContractDraft.diagnostics.projectionWriterDiagnostics
    ).anchorProjectionCol,
    8
);
assert.equal(buildOutputProfiles().film.readsSameTraceIndex, true);

const legacyProjectionDraft = buildLegacyProjectionResultFromOutputContract(outputContractDraft);

assert.equal(legacyProjectionDraft.layoutPlan.mode, "p4_neukern_legacy_adapter_v1");
assert.equal(legacyProjectionDraft.layoutPlan.visualRowCount, 3);
assert.equal(legacyProjectionDraft.layoutPlan.anchorColumn, 8);
assert.equal(legacyProjectionDraft.projectionRows.length, 1);
assert.equal(legacyProjectionDraft.projectionRows[0].rowId, "projection-0");
assert.equal(legacyProjectionDraft.projectionRows[0].sourceRowId, "r0");
assert.equal(legacyProjectionDraft.projectionRows[0].axisAbsoluteRow, 1);
assert.equal(
    legacyProjectionDraft.projectionRows[0].positionedAtoms.find((atom) => atom.projectionRole === "fraction_line")?.row,
    1
);
assert.equal(
    legacyProjectionDraft.projectionRows[0].positionedAtoms.find((atom) => atom.projectionRole === "denominator")?.row,
    2
);

const legacyProcessDraft = processP4NeukernLegacy([
    {
        rowId: "r0",
        atoms: [
            {
                id: "div-1",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-1",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "c", value: "c", type: "VARIABLE", isVisible: true }
        ]
    }
]);

assert.equal(legacyProcessDraft.projectionRows.length, 1);
assert.equal(legacyProcessDraft.layoutPlan.anchorColumn, 8);
assert.equal(legacyProcessDraft.outputContract.version, "p4_neukern_output_contract_v1");

const multiPlacementRaster = buildGlobalSemanticRasterDraft([
    {
        rowId: "r0",
        atoms: [
            {
                id: "div-left",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "a", value: "a", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-alpha-left",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "alpha", value: "alpha", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            {
                id: "div-right",
                type: "DIVISION",
                isVisible: true,
                numerator: [
                    { id: "b", value: "b", type: "VARIABLE", isVisible: true }
                ],
                denominator: [
                    {
                        id: "fn-beta-right",
                        type: "FUNCTION",
                        name: "cos",
                        isVisible: true,
                        content: [
                            { id: "beta", value: "beta", type: "VARIABLE", isVisible: true }
                        ]
                    }
                ]
            }
        ]
    },
    {
        rowId: "r1",
        atoms: [
            { id: "a", value: "a", type: "VARIABLE", isVisible: true },
            { id: "eq", value: "=", type: "ANCHOR", isVisible: true },
            { id: "b", value: "b", type: "VARIABLE", isVisible: true },
            {
                id: "fn-alpha-right",
                type: "FUNCTION",
                name: "cos",
                isVisible: true,
                content: [
                    { id: "alpha", value: "alpha", type: "VARIABLE", isVisible: true }
                ]
            }
        ]
    }
]);

assert.ok(multiPlacementRaster.multiPlacementSemanticIds.includes("alpha"));
assert.deepEqual(multiPlacementRaster.semanticPlacements.alpha, ["left::alpha", "right::alpha"]);
assert.equal(
    multiPlacementRaster.rows[0].leafColumns.find((entry) => entry.semanticId === "alpha")?.placementKey,
    "left::alpha"
);
assert.equal(
    multiPlacementRaster.rows[1].leafColumns.find((entry) => entry.semanticId === "alpha")?.placementKey,
    "right::alpha"
);

console.log("P4-Neukern-Geruest erfolgreich geprueft.");
