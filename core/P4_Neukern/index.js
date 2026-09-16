export {
    P4_NEUKERN_MODULES,
    P4_NEUKERN_PRINCIPLES,
    normalizeTheoryRowsForNeukern,
    createProjectionDraft
} from "./contracts.js";
export {
    ANCHOR_PLACEMENT_KEY,
    createRowShellKey,
    buildRowShellLookup,
    createPlacementKey,
    resolveSemanticColumn,
    resolveBoundarySemanticIds,
    findBlueprintCollection,
    resolveSemanticBoundaryColumns,
    resolveBlueprintBoundaryColumns,
    resolveCollectionBoundaryColumns
} from "./structure.js";
export {
    CHILD_COLLECTION_KEYS,
    SHELL_SLOT_KIND_BY_TYPE,
    resolveShellRole,
    collectChildCollections,
    isShellAtom
} from "./structureShells.js";

export {
    buildGlobalSemanticRasterDraft,
    resolveGlobalSemanticRasterDraftInputs,
    createGlobalSemanticRasterDraftFromResolvedInputs
} from "./GlobalSemanticRaster.js";
export {
    resolveAnchorIndex,
    resolveSemanticId,
    isLeafAtom,
    isVisibleLeafEntry,
    createSemanticEntry,
    flattenAtomEntries,
    createRowRasterEntry
} from "./semanticRasterRows.js";
export {
    buildTraceMap,
    buildSharedSemanticIds,
    buildMixedSideSemanticIds
} from "./semanticRasterTrace.js";
export {
    dedupeSemanticSequence,
    compareNodePriority,
    buildSideOrderDraft,
    createContentColumnEntry,
    createAnchorColumn,
    buildSemanticPlacements,
    buildColumnBySemanticId,
    buildRowsWithColumns,
    createSemanticRasterColumnLayout
} from "./semanticRasterColumns.js";
export {
    buildShellBlueprintDraft,
    resolveShellBlueprintDraftInputs
} from "./ShellBlueprints.js";
export {
    collectVisibleLeafSemanticIds,
    collectVisibleDescendantSemanticIds,
    collectVisibleDescendantShellIds,
    buildCollectionBlueprint,
    buildCollectionBlueprints
} from "./shellBlueprintCollections.js";
export {
    createShellBlueprint,
    walkShellBlueprints,
    createShellBlueprintTraversalContext,
    createShellBlueprintDraftFromResolvedInputs
} from "./shellBlueprintAssembly.js";
export {
    buildProjectionBlockDraft,
    resolveProjectionBlockDraftInputs
} from "./ProjectionBlocks.js";
export {
    buildProjectionWriterDraft,
    PROJECTION_CONTENT_COL_STEP,
    createProjectionWriterDraftFromResolvedInputs,
    resolveProjectionWriterDraftInputs
} from "./ProjectionWriter.js";
export {
    buildOutputContractDraft,
    createOutputContractDraftFromResolvedInputs,
    resolveOutputContractDraftInputs
} from "./OutputContract.js";
export {
    walkTheoryAtoms,
    buildAtomRegister,
    buildProjectionAtomRegister,
    buildTraceIndex
} from "./outputContractTrace.js";
export {
    buildLayoutPlan,
    buildOutputProfiles
} from "./outputContractLayout.js";
export {
    PROJECTION_CONTENT_COL_STEP as SHELL_GEOMETRY_CONTENT_COL_STEP,
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
    resolveShellHorizontalLayout
} from "./shellGeometry.js";
export {
    resolveShellSlotDescriptors,
    resolveShellSlotLocalRow
} from "./shellEmission.js";
export {
    createShellContainerProjectionAtom,
    createShellSlotProjectionAtom,
    buildShellProjectionAtoms
} from "./shellProjectionAtoms.js";
export {
    createAtomPathKey,
    resolveLeafProjectionRole,
    buildLeafColumnLookup,
    createLeafProjectionAtom,
    collectVisibleLeafProjectionAtoms
} from "./leafProjectionAtoms.js";
export {
    sortProjectionAtoms,
    normalizeProjectionColumns
} from "./projectionRowLayout.js";
export {
    createDefaultBlockRow,
    createLeafTraversalContext,
    buildProjectionRowDraft,
    buildProjectionRowsDraft
} from "./projectionRowAssembly.js";
export {
    collectCollectionBounds,
    collectAtomBounds,
    collectRowShellStatesAndBounds
} from "./projectionBlockBounds.js";
export {
    buildShellBlock,
    buildProjectionBlockRow,
    buildProjectionBlockRows
} from "./projectionBlockAssembly.js";
export {
    createRelativeBounds,
    mergeRelativeBounds,
    toLocalRow,
    toRelativeRow,
    resolveRowKind,
    buildRowKinds,
    resolveAxisContext,
    createBlockFrame
} from "./verticalLayout.js";
export {
    buildLegacyProjectionResultFromOutputContract,
    process as processP4NeukernLegacy
} from "./LegacyProjectionAdapter.js";
export { buildP4NeukernDraft } from "./pipeline.js";
