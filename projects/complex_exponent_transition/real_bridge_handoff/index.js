import * as coreA from "../../../core_a/index.js";
import * as bridgeB from "../../../bridge_b/index.js";
import { buildFunctionHead } from "../../../core/GenesisRuntime/logarithmNotation.js";
import { serializeRuntimeCollection } from "../../../core/GenesisRuntime/runtimeInlineFormat.js";

const STAGE_LAYOUT = Object.freeze({
    width: 1200,
    height: 675,
    anchorX: 600,
    axisY: 360,
    columnWidth: 26,
    rowHeight: 54
});
const LOG_FUNCTION_NAMES = new Set(["log", "ln", "lg"]);
const A1_PROCESS_SPACE_ID = "a1";
const A2_PROCESS_SPACE_ID = "a2";
const BRIDGE_AGGREGATE_ROLES = new Set([
    "function",
    "product",
    "group",
    "fraction",
    "additive_inverse"
]);
const BRIDGE_STRUCTURAL_ROLES = new Set([
    "fraction_line",
    "root_overbar"
]);
const BRIDGE_INNER_CONTENT_ROLES = new Set([
    "content",
    "numerator",
    "denominator",
    "product_factor",
    "product_operator",
    "product_content"
]);

function isVisibleNode(node = null) {
    return Boolean(node) && node.isVisible !== false;
}

function filterVisibleNodes(nodes = []) {
    return (Array.isArray(nodes) ? nodes : []).filter((node) => isVisibleNode(node));
}

function serializeCollection(nodes = []) {
    return serializeRuntimeCollection(filterVisibleNodes(nodes));
}

function xFromColumn(col, anchorColumn) {
    return STAGE_LAYOUT.anchorX + ((col - anchorColumn) * STAGE_LAYOUT.columnWidth);
}

function yFromLocalRow(localRow, axisLocalRow) {
    return STAGE_LAYOUT.axisY + ((localRow - axisLocalRow) * STAGE_LAYOUT.rowHeight);
}

function createAtom({
    id,
    text,
    x,
    y,
    size,
    zone,
    fontStyle = "italic",
    storyKey = null
}) {
    return {
        id,
        text,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        size,
        zone,
        fontStyle,
        storyKey
    };
}

function createShell({
    id,
    kind,
    x,
    y,
    width,
    height
}) {
    return {
        id,
        kind,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10
    };
}

function buildPlacementLookup(positionedAtoms = []) {
    const bySourceAtomId = new Map();
    const bySourceShellId = new Map();
    const byRole = new Map();

    (Array.isArray(positionedAtoms) ? positionedAtoms : []).forEach((atom) => {
        const sourceAtomId = atom?.sourceAtomId || null;
        const sourceShellId = atom?.sourceShellId || null;
        const role = atom?.projectionRole || null;

        if (sourceAtomId) {
            const existing = bySourceAtomId.get(sourceAtomId) || [];
            existing.push(atom);
            bySourceAtomId.set(sourceAtomId, existing);
        }

        if (sourceShellId) {
            const existing = bySourceShellId.get(sourceShellId) || [];
            existing.push(atom);
            bySourceShellId.set(sourceShellId, existing);
        }

        if (role) {
            const existing = byRole.get(role) || [];
            existing.push(atom);
            byRole.set(role, existing);
        }
    });

    return { bySourceAtomId, bySourceShellId, byRole };
}

function findPowerExponentBoundaryRowContext(solveState = {}) {
    const stepIndex = (solveState?.schritte || []).findIndex((step) => step?.strategie?.family === "power_exponent_release");

    if (stepIndex < 0) {
        throw new Error("Kein power_exponent_release im solve_state gefunden.");
    }

    const boundaryRow = solveState?.exportData?.theoryRows?.[stepIndex];
    const landingRow = solveState?.exportData?.theoryRows?.[stepIndex + 1];

    if (!boundaryRow || !landingRow) {
        throw new Error("Boundary- oder Landing-Zeile fuer den Bridge-Handoff fehlt.");
    }

    const boundaryProjectionRow = (solveState?.exportData?.projectionRows || []).find((row) => row?.sourceRowId === boundaryRow?.rowId);
    const landingProjectionRow = (solveState?.exportData?.projectionRows || []).find((row) => row?.sourceRowId === landingRow?.rowId);

    if (!boundaryProjectionRow || !landingProjectionRow) {
        throw new Error("Projektionszeilen fuer Boundary oder Landing fehlen.");
    }

    return {
        stepIndex,
        boundaryRow,
        landingRow,
        boundaryProjectionRow,
        landingProjectionRow
    };
}

function resolveVisiblePowerShell(boundaryRow = {}) {
    const leftVisible = filterVisibleNodes(boundaryRow.left);
    const rightVisible = filterVisibleNodes(boundaryRow.right);
    const leftPower = leftVisible.find((node) => node?.type === "POWER");
    const rightPower = rightVisible.find((node) => node?.type === "POWER");

    if (leftPower) {
        return {
            variant: "right",
            powerShell: leftPower,
            carryNodes: rightVisible
        };
    }

    if (rightPower) {
        return {
            variant: "left",
            powerShell: rightPower,
            carryNodes: leftVisible
        };
    }

    throw new Error("Keine sichtbare Potenzschale in der Boundary-Zeile gefunden.");
}

function resolveLandingLogShell(landingRow = {}) {
    const leftVisible = filterVisibleNodes(landingRow.left);
    const rightVisible = filterVisibleNodes(landingRow.right);
    const leftFunction = leftVisible.find((node) => (
        node?.type === "FUNCTION" && LOG_FUNCTION_NAMES.has(String(node?.name || ""))
    ));
    const rightFunction = rightVisible.find((node) => (
        node?.type === "FUNCTION" && LOG_FUNCTION_NAMES.has(String(node?.name || ""))
    ));

    if (leftFunction) {
        return {
            variant: "left",
            functionShell: leftFunction,
            termNodes: rightVisible
        };
    }

    if (rightFunction) {
        return {
            variant: "right",
            functionShell: rightFunction,
            termNodes: leftVisible
        };
    }

    throw new Error("Keine sichtbare Logarithmus-Schale in der Landing-Zeile gefunden.");
}

function buildBeforeState({
    boundaryState,
    boundaryRow,
    boundaryProjectionRow
}) {
    const anchorColumn = boundaryState?.anchors?.equals?.x;
    const axisLocalRow = boundaryProjectionRow?.axisLocalRow ?? 1;
    const projectionLookup = buildPlacementLookup(boundaryProjectionRow?.positionedAtoms || []);
    const { powerShell } = resolveVisiblePowerShell(boundaryRow);
    const carryGroupId = boundaryState?.carry_through?.group_id || null;
    const basePlacement = (projectionLookup.byRole.get("power_base") || [])
        .find((atom) => Number.isInteger(atom?.col));
    const exponentPlacement = (projectionLookup.byRole.get("power_exponent") || [])
        .find((atom) => Number.isInteger(atom?.col));
    const anchorPlacement = (projectionLookup.byRole.get("anchor") || [])
        .find((atom) => Number.isInteger(atom?.col));
    const numeratorPlacement = (projectionLookup.bySourceShellId.get(carryGroupId) || [])
        .find((atom) => atom?.projectionRole === "numerator" && Number.isInteger(atom?.col));
    const denominatorPlacement = (projectionLookup.bySourceShellId.get(carryGroupId) || [])
        .find((atom) => atom?.projectionRole === "denominator" && Number.isInteger(atom?.col));
    const fractionLinePlacement = (projectionLookup.bySourceShellId.get(carryGroupId) || [])
        .find((atom) => atom?.projectionRole === "fraction_line" && Number.isInteger(atom?.colStart) && Number.isInteger(atom?.colEnd));

    if (!basePlacement || !exponentPlacement || !anchorPlacement) {
        throw new Error("Boundary-Projektion liefert keine vollstaendige Potenzspur.");
    }

    const atoms = [];

    if (numeratorPlacement) {
        atoms.push(createAtom({
            id: "carry_num",
            text: numeratorPlacement.value || "y",
            x: xFromColumn(numeratorPlacement.col, anchorColumn),
            y: yFromLocalRow(numeratorPlacement.localRow, axisLocalRow),
            size: 42,
            zone: "carry"
        }));
    }

    if (fractionLinePlacement) {
        atoms.push(createAtom({
            id: "carry_bar",
            text: "―",
            x: xFromColumn((fractionLinePlacement.colStart + fractionLinePlacement.colEnd) / 2, anchorColumn),
            y: yFromLocalRow(fractionLinePlacement.localRow, axisLocalRow) + 2,
            size: 40,
            zone: "carry",
            fontStyle: "normal"
        }));
    }

    if (denominatorPlacement) {
        atoms.push(createAtom({
            id: "carry_den",
            text: denominatorPlacement.value || "a",
            x: xFromColumn(denominatorPlacement.col, anchorColumn),
            y: yFromLocalRow(denominatorPlacement.localRow, axisLocalRow),
            size: 42,
            zone: "carry"
        }));
    }

    atoms.push(createAtom({
        id: "eq",
        text: "=",
        x: xFromColumn(anchorPlacement.col, anchorColumn),
        y: yFromLocalRow(anchorPlacement.localRow, axisLocalRow),
        size: 40,
        zone: "main",
        fontStyle: "normal"
    }));

    atoms.push(createAtom({
        id: "base_B",
        text: boundaryState?.power_shell?.base?.text || "B",
        x: xFromColumn(basePlacement.col, anchorColumn),
        y: yFromLocalRow(basePlacement.localRow, axisLocalRow),
        size: 52,
        zone: "main"
    }));

    const exponentAtoms = [];
    const exponentStartX = xFromColumn(exponentPlacement.col, anchorColumn) + 12;
    const exponentY = yFromLocalRow(exponentPlacement.localRow, axisLocalRow) - 6;
    const orderedAtoms = boundaryState?.power_shell?.content?.ordered_cells || [];

    orderedAtoms.forEach((entry, index) => {
        const storyKey = `content_${index + 1}`;
        const atom = createAtom({
            id: `exp_${index}`,
            text: entry.text,
            x: exponentStartX + (index * 34),
            y: exponentY,
            size: entry.text === "-" ? 24 : 28,
            zone: "exponent",
            fontStyle: entry.text === "-" ? "normal" : "italic",
            storyKey
        });
        exponentAtoms.push(atom);
        atoms.push(atom);
    });

    const exponentShellX = exponentAtoms.length > 0 ? Math.min(...exponentAtoms.map((atom) => atom.x)) - 14 : exponentStartX - 14;
    const exponentShellY = exponentAtoms.length > 0 ? Math.min(...exponentAtoms.map((atom) => atom.y)) - 34 : exponentY - 34;
    const exponentShellRight = exponentAtoms.length > 0 ? Math.max(...exponentAtoms.map((atom) => atom.x)) + 28 : exponentStartX + 42;

    return {
        sceneId: "before_state",
        sourceProject: "6_Gleichungsloeser",
        coordinateSpace: "transition_local",
        equation: boundaryState?.equation_text || serializeCollection(boundaryRow?.left || []) + " = " + serializeCollection(boundaryRow?.right || []),
        notes: "Realer Grenzzustand direkt vor dem Shell-Breaker B.",
        atoms,
        shells: [
            createShell({
                id: "exp_group",
                kind: "exponent_group",
                x: exponentShellX,
                y: exponentShellY,
                width: exponentShellRight - exponentShellX,
                height: 56
            })
        ]
    };
}

function buildAfterState({
    landingProfile,
    landingState,
    landingRow,
    landingProjectionRow
}) {
    const anchorColumn = landingProfile?.equals_anchor_x;
    const axisLocalRow = landingProjectionRow?.axisLocalRow ?? 1;
    const projectionLookup = buildPlacementLookup(landingProjectionRow?.positionedAtoms || []);
    const { functionShell } = resolveLandingLogShell(landingRow);
    const functionPlacements = (projectionLookup.bySourceShellId.get(functionShell?.id) || []);
    const functionNamePlacement = functionPlacements.find((atom) => atom?.projectionRole === "function_name" && Number.isInteger(atom?.col));
    const functionLeftPlacement = functionPlacements.find((atom) => atom?.projectionRole === "function_left" && Number.isInteger(atom?.col));
    const functionRightPlacement = functionPlacements.find((atom) => atom?.projectionRole === "function_right" && Number.isInteger(atom?.col));
    const fractionLinePlacement = functionPlacements.find((atom) => atom?.projectionRole === "fraction_line" && Number.isInteger(atom?.colStart) && Number.isInteger(atom?.colEnd));
    const numeratorPlacement = functionPlacements.find((atom) => atom?.projectionRole === "numerator" && Number.isInteger(atom?.col));
    const denominatorPlacement = functionPlacements.find((atom) => atom?.projectionRole === "denominator" && Number.isInteger(atom?.col));
    const anchorPlacement = (projectionLookup.byRole.get("anchor") || []).find((atom) => Number.isInteger(atom?.col));

    if (!functionNamePlacement || !functionLeftPlacement || !functionRightPlacement || !anchorPlacement) {
        throw new Error("Landing-Projektion liefert keine vollstaendige Log-Spur.");
    }

    const atoms = [];

    atoms.push(createAtom({
        id: "log_head",
        text: functionNamePlacement.value || "log",
        x: xFromColumn(functionNamePlacement.col, anchorColumn),
        y: yFromLocalRow(functionNamePlacement.localRow, axisLocalRow),
        size: 46,
        zone: "main",
        fontStyle: "normal"
    }));

    const visibleBaseText = serializeCollection(functionShell?.baseContent || []);
    const visibleFunctionHead = buildFunctionHead(functionShell?.name || "log", visibleBaseText);

    if (visibleBaseText && visibleFunctionHead === `log_${visibleBaseText}`) {
        atoms.push(createAtom({
            id: "log_base",
            text: visibleBaseText,
            x: xFromColumn(functionNamePlacement.col, anchorColumn) + 54,
            y: yFromLocalRow(functionNamePlacement.localRow, axisLocalRow) + 32,
            size: 24,
            zone: "base"
        }));
    }

    atoms.push(createAtom({
        id: "paren_l",
        text: "(",
        x: xFromColumn(functionLeftPlacement.col, anchorColumn),
        y: yFromLocalRow(functionLeftPlacement.localRow, axisLocalRow),
        size: 48,
        zone: "main",
        fontStyle: "normal"
    }));

    if (numeratorPlacement) {
        atoms.push(createAtom({
            id: "arg_y",
            text: numeratorPlacement.value || "y",
            x: xFromColumn(numeratorPlacement.col, anchorColumn),
            y: yFromLocalRow(numeratorPlacement.localRow, axisLocalRow),
            size: 38,
            zone: "fraction_num"
        }));
    }

    if (fractionLinePlacement) {
        atoms.push(createAtom({
            id: "frac_bar",
            text: "―",
            x: xFromColumn((fractionLinePlacement.colStart + fractionLinePlacement.colEnd) / 2, anchorColumn),
            y: yFromLocalRow(fractionLinePlacement.localRow, axisLocalRow) + 2,
            size: 40,
            zone: "fraction_bar",
            fontStyle: "normal"
        }));
    }

    if (denominatorPlacement) {
        atoms.push(createAtom({
            id: "arg_a",
            text: denominatorPlacement.value || "a",
            x: xFromColumn(denominatorPlacement.col, anchorColumn),
            y: yFromLocalRow(denominatorPlacement.localRow, axisLocalRow),
            size: 38,
            zone: "fraction_den"
        }));
    }

    atoms.push(createAtom({
        id: "paren_r",
        text: ")",
        x: xFromColumn(functionRightPlacement.col, anchorColumn),
        y: yFromLocalRow(functionRightPlacement.localRow, axisLocalRow),
        size: 48,
        zone: "main",
        fontStyle: "normal"
    }));

    atoms.push(createAtom({
        id: "eq",
        text: "=",
        x: xFromColumn(anchorPlacement.col, anchorColumn),
        y: yFromLocalRow(anchorPlacement.localRow, axisLocalRow),
        size: 40,
        zone: "main",
        fontStyle: "normal"
    }));

    const rawSlots = landingProfile?.term_slots || [];

    rawSlots.forEach((slot, index) => {
        if (!Number.isInteger(slot?.x) || typeof slot?.source_text !== "string") {
            return;
        }

        const isOperator = ["*", "+", "-", "/"].includes(slot.source_text);
        const storyKey = `content_${index + 1}`;
        atoms.push(createAtom({
            id: `rhs_${index}`,
            text: slot.source_text,
            x: xFromColumn(slot.x, anchorColumn),
            y: yFromLocalRow(slot.source_local_row, axisLocalRow),
            size: isOperator ? 34 : (slot.source_local_row < axisLocalRow ? 28 : 46),
            zone: "focus_term",
            fontStyle: isOperator ? "normal" : "italic",
            storyKey
        }));
    });

    const termAtoms = atoms.filter((atom) => atom.zone === "focus_term");
    const termShell = termAtoms.length > 0
        ? createShell({
            id: "rhs_group",
            kind: "term_group",
            x: Math.min(...termAtoms.map((atom) => atom.x)) - 18,
            y: Math.min(...termAtoms.map((atom) => atom.y)) - 34,
            width: (Math.max(...termAtoms.map((atom) => atom.x)) - Math.min(...termAtoms.map((atom) => atom.x))) + 42,
            height: 56
        })
        : null;

    return {
        sceneId: "after_state",
        sourceProject: "6_Gleichungsloeser",
        coordinateSpace: "transition_local",
        equation: landingState?.equation_text || landingProfile?.preview_equation || serializeCollection(landingRow?.left || []) + " = " + serializeCollection(landingRow?.right || []),
        notes: `Reale Startlage von A2 mit echten Zielslots ${rawSlots.map((slot) => slot.x).join(", ")}.`,
        atoms,
        shells: termShell ? [termShell] : []
    };
}

function shiftMaybeInt(value, delta = 0) {
    return Number.isInteger(value) ? value + delta : value;
}

function shiftLegacyProjectionRows(rows = [], delta = 0, rowIdMap = new Map()) {
    return (Array.isArray(rows) ? rows : []).map((row, index) => {
        const remappedSourceRowId = rowIdMap.get(row?.sourceRowId) || row?.sourceRowId || `bridge-a2-row-${index}`;

        return {
            ...structuredClone(row),
            rowId: `bridge-a2-projection-${index}`,
            sourceRowId: remappedSourceRowId,
            positionedAtoms: (Array.isArray(row?.positionedAtoms) ? row.positionedAtoms : []).map((atom) => ({
                ...structuredClone(atom),
                col: shiftMaybeInt(atom?.col, delta),
                colStart: shiftMaybeInt(atom?.colStart, delta),
                colEnd: shiftMaybeInt(atom?.colEnd, delta)
            }))
        };
    });
}

function shiftNativeProjectionRows(rows = [], delta = 0, rowIdMap = new Map()) {
    return (Array.isArray(rows) ? rows : []).map((row, index) => {
        const remappedSourceRowId = rowIdMap.get(row?.sourceRowId)
            || rowIdMap.get(row?.rowId)
            || row?.sourceRowId
            || row?.rowId
            || `bridge-a2-row-${index}`;
        const rawAtoms = Array.isArray(row?.projectionAtoms)
            ? row.projectionAtoms
            : (Array.isArray(row?.positionedAtoms) ? row.positionedAtoms : []);
        const shiftedAtoms = rawAtoms.map((atom) => ({
            ...structuredClone(atom),
            col: shiftMaybeInt(atom?.col, delta),
            colStart: shiftMaybeInt(atom?.colStart, delta),
            colEnd: shiftMaybeInt(atom?.colEnd, delta)
        }));

        return {
            ...structuredClone(row),
            rowId: rowIdMap.get(row?.rowId) || `bridge-a2-row-${index}`,
            sourceRowId: remappedSourceRowId,
            positionedAtoms: shiftedAtoms,
            projectionAtoms: shiftedAtoms
        };
    });
}

function normalizeProjectionAtomContract(atom = {}) {
    const normalizedId = atom?.id || atom?.projectionAtomId || null;
    const normalizedRole = atom?.projectionRole || atom?.role || null;
    const normalizedText = atom?.text ?? atom?.value ?? null;
    const normalizedSourceAtomId = atom?.sourceAtomId || atom?.sourceNodeId || null;
    const normalizedSourceShellId = atom?.sourceShellId || atom?.shellId || null;

    return {
        ...structuredClone(atom),
        id: normalizedId,
        role: atom?.role || normalizedRole,
        projectionRole: normalizedRole,
        text: normalizedText,
        value: atom?.value ?? normalizedText,
        sourceAtomId: normalizedSourceAtomId,
        sourceShellId: normalizedSourceShellId
    };
}

function collectProjectionAtoms(row = {}) {
    const rawAtoms = Array.isArray(row?.projectionAtoms)
        ? row.projectionAtoms
        : (Array.isArray(row?.positionedAtoms) ? row.positionedAtoms : []);

    return rawAtoms.map((atom) => normalizeProjectionAtomContract(atom));
}

function collectStoredProjectionAtoms(row = {}) {
    if (Array.isArray(row?.projectionAtoms)) {
        return row.projectionAtoms;
    }

    return Array.isArray(row?.positionedAtoms) ? row.positionedAtoms : [];
}

function cloneProjectionAtom(atom = {}, overrides = {}) {
    return {
        ...normalizeProjectionAtomContract(atom),
        ...overrides
    };
}

function shiftProjectionAtom(atom = {}, delta = 0, overrides = {}) {
    return cloneProjectionAtom(atom, {
        col: shiftMaybeInt(atom?.col, delta),
        colStart: shiftMaybeInt(atom?.colStart, delta),
        colEnd: shiftMaybeInt(atom?.colEnd, delta),
        ...overrides
    });
}

function resolveAtomStartCol(atom = {}) {
    if (Number.isInteger(atom?.colStart)) {
        return atom.colStart;
    }

    return Number.isInteger(atom?.col) ? atom.col : null;
}

function resolveAtomEndCol(atom = {}) {
    if (Number.isInteger(atom?.colEnd)) {
        return atom.colEnd;
    }

    return Number.isInteger(atom?.col) ? atom.col : null;
}

function normalizeSide(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "left" || normalized === "right" ? normalized : null;
}

function isAnchorProjectionAtom(atom = {}) {
    const role = String(atom?.role || atom?.projectionRole || "").trim().toLowerCase();
    return role === "equation_anchor" || role === "anchor";
}

function isConcreteProjectionAtom(atom = {}) {
    if (atom?.isVisible === false) {
        return false;
    }

    const text = atom?.text ?? atom?.value;
    if (text == null) {
        return false;
    }

    const normalized = String(text).trim();
    return normalized !== "" && normalized !== "?";
}

function shouldKeepBridgeProjectionAtom(atom = {}) {
    const role = String(atom?.role || atom?.projectionRole || "").trim().toLowerCase();
    if (BRIDGE_STRUCTURAL_ROLES.has(role)) {
        return true;
    }

    if (!isConcreteProjectionAtom(atom)) {
        return false;
    }

    return !BRIDGE_AGGREGATE_ROLES.has(role);
}

function isAtomOnSideOfAnchor(atom = {}, side = null, anchorCol = null) {
    if (!Number.isInteger(anchorCol)) {
        return false;
    }

    const startCol = resolveAtomStartCol(atom);
    const endCol = resolveAtomEndCol(atom);

    if (!Number.isInteger(startCol) || !Number.isInteger(endCol)) {
        return false;
    }

    if (side === "left") {
        return endCol < anchorCol;
    }

    if (side === "right") {
        return startCol > anchorCol;
    }

    return false;
}

function collectFunctionBaseProjectionAtoms({
    projectionRow = {},
    projectionAtoms = [],
    functionShellId = null
} = {}) {
    if (typeof functionShellId !== "string" || functionShellId.length === 0) {
        return [];
    }

    const shellSpans = Array.isArray(projectionRow?.shellSpans)
        ? projectionRow.shellSpans
        : [];
    const functionSpan = shellSpans.find((span) => (
        span?.shellId === functionShellId && span?.shellType === "FUNCTION"
    ));
    const baseRange = functionSpan?.collectionRanges?.baseContent || null;

    if (!Number.isInteger(baseRange?.colStart) || !Number.isInteger(baseRange?.colEnd)) {
        return [];
    }

    const baseLeafIds = new Set(functionSpan?.collectionLeafIds?.baseContent || []);
    const baseShellIds = new Set();
    let addedShell = true;

    while (addedShell) {
        addedShell = false;
        shellSpans.forEach((span) => {
            if (
                span?.shellId
                && (span?.parentShellId === functionShellId || baseShellIds.has(span?.parentShellId))
                && span?.colStart >= baseRange.colStart
                && span?.colEnd <= baseRange.colEnd
                && !baseShellIds.has(span.shellId)
            ) {
                baseShellIds.add(span.shellId);
                addedShell = true;
            }
        });
    }

    return (Array.isArray(projectionAtoms) ? projectionAtoms : []).filter((atom) => {
        if (atom?.isVisible === false) {
            return false;
        }

        const startCol = resolveAtomStartCol(atom);
        const endCol = resolveAtomEndCol(atom);

        if (
            !Number.isInteger(startCol)
            || !Number.isInteger(endCol)
            || startCol < baseRange.colStart
            || endCol > baseRange.colEnd
        ) {
            return false;
        }

        return baseLeafIds.has(atom?.sourceAtomId)
            || baseShellIds.has(atom?.sourceShellId);
    });
}

function resolveRowBounds(atoms = []) {
    const localRows = (Array.isArray(atoms) ? atoms : [])
        .map((atom) => atom?.localRow)
        .filter((value) => Number.isInteger(value));

    if (localRows.length === 0) {
        return {
            minRelativeRow: 0,
            maxRelativeRow: 0,
            localRowCount: 1
        };
    }

    const minRelativeRow = Math.min(...localRows);
    const maxRelativeRow = Math.max(...localRows);

    return {
        minRelativeRow,
        maxRelativeRow,
        localRowCount: Math.max(1, (maxRelativeRow - minRelativeRow) + 1)
    };
}

function buildProjectionMatchKeys(atom = {}) {
    const role = String(atom?.role || atom?.projectionRole || "").trim().toLowerCase();
    const text = String(atom?.text ?? atom?.value ?? "").trim();
    const sourceAtomId = String(atom?.sourceAtomId || "").trim();
    const sourceShellId = String(atom?.sourceShellId || "").trim();
    const keys = [];

    if (role && sourceAtomId) {
        keys.push(`role:${role}|atom:${sourceAtomId}`);
        if (text) {
            keys.push(`role:${role}|atom:${sourceAtomId}|text:${text}`);
        }
    }

    if (role && sourceShellId) {
        keys.push(`role:${role}|shell:${sourceShellId}`);
        if (text) {
            keys.push(`role:${role}|shell:${sourceShellId}|text:${text}`);
        }
    }

    return Array.from(new Set(keys));
}

function resolveMatchedBridgeAtom(atom = {}, bridgeAtomsByKey = new Map()) {
    const keys = buildProjectionMatchKeys(atom);

    for (const key of keys) {
        const match = bridgeAtomsByKey.get(key);
        if (match) {
            return match;
        }
    }

    return null;
}

function buildBridgeSideRebindContext({
    exclusiveBridgeProjectionRow = {},
    probeLandingProjectionRow = {},
    side = null
} = {}) {
    const bridgeAtoms = collectProjectionAtoms(exclusiveBridgeProjectionRow);
    const probeAtoms = collectProjectionAtoms(probeLandingProjectionRow);
    const bridgeAnchor = bridgeAtoms.find((atom) => isAnchorProjectionAtom(atom));
    const probeAnchor = probeAtoms.find((atom) => isAnchorProjectionAtom(atom));
    const bridgeAnchorCol = Number.isInteger(bridgeAnchor?.col) ? bridgeAnchor.col : null;
    const probeAnchorCol = Number.isInteger(probeAnchor?.col) ? probeAnchor.col : null;
    const bridgeSideAtoms = bridgeAtoms.filter((atom) => isAtomOnSideOfAnchor(atom, side, bridgeAnchorCol));
    const probeSideAtoms = probeAtoms.filter((atom) => isAtomOnSideOfAnchor(atom, side, probeAnchorCol));
    const bridgeAtomsByKey = new Map();

    bridgeSideAtoms.forEach((atom) => {
        buildProjectionMatchKeys(atom).forEach((key) => {
            if (!bridgeAtomsByKey.has(key)) {
                bridgeAtomsByKey.set(key, atom);
            }
        });
    });

    const matchedPairs = probeSideAtoms
        .map((probeAtom) => ({
            probeAtom,
            bridgeAtom: resolveMatchedBridgeAtom(probeAtom, bridgeAtomsByKey)
        }))
        .filter(({ bridgeAtom }) => Boolean(bridgeAtom));

    const reduceCol = (pairs, sourceKey, reducer, seed) => pairs.reduce((value, pair) => {
        const current = sourceKey(pair);
        return Number.isInteger(current) ? reducer(value, current) : value;
    }, seed);
    const outerProbeStart = reduceCol(matchedPairs, (pair) => resolveAtomStartCol(pair?.probeAtom), Math.min, Number.POSITIVE_INFINITY);
    const outerProbeEnd = reduceCol(matchedPairs, (pair) => resolveAtomEndCol(pair?.probeAtom), Math.max, Number.NEGATIVE_INFINITY);
    const outerBridgeStart = reduceCol(matchedPairs, (pair) => resolveAtomStartCol(pair?.bridgeAtom), Math.min, Number.POSITIVE_INFINITY);
    const outerBridgeEnd = reduceCol(matchedPairs, (pair) => resolveAtomEndCol(pair?.bridgeAtom), Math.max, Number.NEGATIVE_INFINITY);

    const innerPairs = matchedPairs.filter(({ probeAtom }) => (
        BRIDGE_INNER_CONTENT_ROLES.has(String(probeAtom?.role || probeAtom?.projectionRole || "").trim().toLowerCase())
    ));
    const innerProbeStart = reduceCol(innerPairs, (pair) => resolveAtomStartCol(pair?.probeAtom), Math.min, Number.POSITIVE_INFINITY);
    const innerProbeEnd = reduceCol(innerPairs, (pair) => resolveAtomEndCol(pair?.probeAtom), Math.max, Number.NEGATIVE_INFINITY);
    const innerBridgeStart = reduceCol(innerPairs, (pair) => resolveAtomStartCol(pair?.bridgeAtom), Math.min, Number.POSITIVE_INFINITY);
    const innerBridgeEnd = reduceCol(innerPairs, (pair) => resolveAtomEndCol(pair?.bridgeAtom), Math.max, Number.NEGATIVE_INFINITY);

    return {
        bridgeAnchorCol,
        probeAnchorCol,
        bridgeAtomsByKey,
        outerProbeStart: Number.isFinite(outerProbeStart) ? outerProbeStart : null,
        outerProbeEnd: Number.isFinite(outerProbeEnd) ? outerProbeEnd : null,
        outerBridgeStart: Number.isFinite(outerBridgeStart) ? outerBridgeStart : null,
        outerBridgeEnd: Number.isFinite(outerBridgeEnd) ? outerBridgeEnd : null,
        innerProbeStart: Number.isFinite(innerProbeStart) ? innerProbeStart : null,
        innerProbeEnd: Number.isFinite(innerProbeEnd) ? innerProbeEnd : null,
        innerBridgeStart: Number.isFinite(innerBridgeStart) ? innerBridgeStart : null,
        innerBridgeEnd: Number.isFinite(innerBridgeEnd) ? innerBridgeEnd : null
    };
}

function rebaseSideColumn(col, context = {}) {
    if (!Number.isInteger(col)) {
        return col;
    }

    const {
        outerProbeStart,
        outerProbeEnd,
        outerBridgeStart,
        outerBridgeEnd,
        innerProbeStart,
        innerProbeEnd,
        innerBridgeStart,
        innerBridgeEnd
    } = context;

    if (
        Number.isInteger(outerProbeStart)
        && Number.isInteger(outerBridgeStart)
        && col < outerProbeStart
    ) {
        return outerBridgeStart + (col - outerProbeStart);
    }

    if (
        Number.isInteger(outerProbeEnd)
        && Number.isInteger(outerBridgeEnd)
        && col > outerProbeEnd
    ) {
        return outerBridgeEnd + (col - outerProbeEnd);
    }

    if (
        Number.isInteger(innerProbeStart)
        && Number.isInteger(innerProbeEnd)
        && Number.isInteger(innerBridgeStart)
        && Number.isInteger(innerBridgeEnd)
    ) {
        if (col < innerProbeStart) {
            return innerBridgeStart - (innerProbeStart - col);
        }

        if (col > innerProbeEnd) {
            return innerBridgeEnd + (col - innerProbeEnd);
        }

        return innerBridgeStart + (col - innerProbeStart);
    }

    return col;
}

function rebindSideBridgeAtom(atom = {}, context = {}) {
    const lockedBridgeAtom = resolveMatchedBridgeAtom(atom, context?.bridgeAtomsByKey);

    if (lockedBridgeAtom) {
        return cloneProjectionAtom(atom, {
            col: lockedBridgeAtom?.col,
            colStart: lockedBridgeAtom?.colStart,
            colEnd: lockedBridgeAtom?.colEnd
        });
    }

    const nextCol = rebaseSideColumn(atom?.col, context);
    const nextColStart = rebaseSideColumn(atom?.colStart, context);
    const nextColEnd = rebaseSideColumn(atom?.colEnd, context);
    let normalizedCol = nextCol;

    if (
        !Number.isInteger(normalizedCol)
        && Number.isInteger(nextColStart)
        && Number.isInteger(nextColEnd)
    ) {
        normalizedCol = Math.round((nextColStart + nextColEnd) / 2);
    } else if (!Number.isInteger(normalizedCol) && Number.isInteger(nextColStart)) {
        normalizedCol = nextColStart;
    }

    return cloneProjectionAtom(atom, {
        col: normalizedCol,
        colStart: nextColStart,
        colEnd: nextColEnd
    });
}

function buildBridgeContinuationProjectionRows({
    probeProjectionRows = [],
    exclusiveBridgeProjectionRow = {},
    anchorDelta = 0,
    rowIdMap = new Map(),
    boundaryState = {},
    landingState = {}
} = {}) {
    const carrySide = normalizeSide(
        boundaryState?.carry_through?.side
        || landingState?.stories?.carry_through?.side
    );
    const termSide = carrySide === "left" ? "right" : "left";
    const probeLandingProjectionRow = probeProjectionRows?.[0] || {};
    const carryRebindContext = buildBridgeSideRebindContext({
        exclusiveBridgeProjectionRow,
        probeLandingProjectionRow,
        side: carrySide
    });
    const termRebindContext = buildBridgeSideRebindContext({
        exclusiveBridgeProjectionRow,
        probeLandingProjectionRow,
        side: termSide
    });
    const probeAnchorCol = carryRebindContext.probeAnchorCol;
    const bridgeAnchorCol = carryRebindContext.bridgeAnchorCol;

    return (Array.isArray(probeProjectionRows) ? probeProjectionRows : []).slice(1).map((row, index) => {
        const remappedSourceRowId = rowIdMap.get(row?.sourceRowId)
            || rowIdMap.get(row?.rowId)
            || row?.sourceRowId
            || row?.rowId
            || `bridge-a2-row-${index + 1}`;
        const rawAtoms = collectProjectionAtoms(row);
        const adjustedAtoms = rawAtoms
            .map((atom) => {
                if (isAnchorProjectionAtom(atom)) {
                    return shiftProjectionAtom(atom, anchorDelta);
                }

                if (isAtomOnSideOfAnchor(atom, carrySide, probeAnchorCol)) {
                    return rebindSideBridgeAtom(atom, carryRebindContext);
                }

                if (isAtomOnSideOfAnchor(atom, termSide, probeAnchorCol)) {
                    return rebindSideBridgeAtom(atom, termRebindContext);
                }

                return shiftProjectionAtom(atom, anchorDelta);
            })
            .filter((atom) => shouldKeepBridgeProjectionAtom(atom));
        const normalizedAtoms = adjustedAtoms;
        const rowBounds = resolveRowBounds(normalizedAtoms);
        const remappedRowId = rowIdMap.get(row?.rowId) || `bridge-a2-row-${index + 1}`;
        const remappedShellSpans = remapExactShellSpans(
            row?.shellSpans || [],
            rawAtoms,
            normalizedAtoms,
            remappedRowId,
            remappedSourceRowId
        );

        return {
            ...structuredClone(row),
            rowId: remappedRowId,
            sourceRowId: remappedSourceRowId,
            minRelativeRow: rowBounds.minRelativeRow,
            maxRelativeRow: rowBounds.maxRelativeRow,
            localRowCount: rowBounds.localRowCount,
            shellSpans: remappedShellSpans,
            positionedAtoms: normalizedAtoms,
            projectionAtoms: normalizedAtoms
        };
    });
}

function bindTermAtomsToLandingSlots(atoms = [], landingState = {}) {
    const slots = Array.isArray(landingState?.layout?.term_slots)
        ? landingState.layout.term_slots
        : [];
    const bindings = Array.isArray(landingState?.layout?.term_cell_bindings)
        ? landingState.layout.term_cell_bindings
        : [];
    const orderedAtoms = (Array.isArray(atoms) ? atoms : [])
        .slice()
        .sort((left, right) => {
            const leftCol = resolveAtomStartCol(left) ?? 0;
            const rightCol = resolveAtomStartCol(right) ?? 0;

            if (leftCol !== rightCol) {
                return leftCol - rightCol;
            }

            return (left?.localRow ?? 0) - (right?.localRow ?? 0);
        });

    if (orderedAtoms.length !== slots.length) {
        throw new Error(
            `Bridge B kann ${orderedAtoms.length} Termspuren nicht eindeutig auf ${slots.length} Landing-Slots abbilden.`
        );
    }

    if (
        bindings.length === slots.length
        && bindings.every((binding) => typeof binding?.source_cell_id === "string")
    ) {
        const atomsById = new Map(orderedAtoms.map((atom) => [atom?.id, atom]));
        const consumedIds = new Set();

        return bindings.map((binding, index) => {
            const atom = atomsById.get(binding.source_cell_id);
            const col = slots[index];

            if (!atom || consumedIds.has(atom.id)) {
                throw new Error(
                    `Bridge B kann die P4-Zelle ${binding.source_cell_id} keinem eindeutigen Landing-Atom zuordnen.`
                );
            }

            if (!Number.isInteger(col)) {
                throw new Error(`Bridge B erhielt fuer Termspur ${index + 1} keinen ganzzahligen Landing-Slot.`);
            }

            consumedIds.add(atom.id);
            return cloneProjectionAtom(atom, {
                col,
                colStart: col,
                colEnd: col
            });
        });
    }

    return orderedAtoms.map((atom, index) => {
        const col = slots[index];

        if (!Number.isInteger(col)) {
            throw new Error(`Bridge B erhielt fuer Termspur ${index + 1} keinen ganzzahligen Landing-Slot.`);
        }

        return cloneProjectionAtom(atom, {
            col,
            colStart: col,
            colEnd: col
        });
    });
}

function buildExactProjectionAtomPairs(sourceAtoms = [], targetAtoms = []) {
    const targetsById = new Map(
        (Array.isArray(targetAtoms) ? targetAtoms : [])
            .filter((atom) => typeof atom?.id === "string" && atom.id.length > 0)
            .map((atom) => [atom.id, atom])
    );
    const targetsByKey = new Map();

    (Array.isArray(targetAtoms) ? targetAtoms : []).forEach((atom) => {
        buildProjectionMatchKeys(atom).forEach((key) => {
            const matches = targetsByKey.get(key) || [];
            matches.push(atom);
            targetsByKey.set(key, matches);
        });
    });

    return (Array.isArray(sourceAtoms) ? sourceAtoms : []).flatMap((sourceAtom) => {
        const exactTarget = targetsById.get(sourceAtom?.id) || null;
        const keyedTargets = buildProjectionMatchKeys(sourceAtom)
            .flatMap((key) => targetsByKey.get(key) || []);
        const candidates = Array.from(new Set([
            ...(exactTarget ? [exactTarget] : []),
            ...keyedTargets
        ]));

        if (exactTarget) {
            return [{ sourceAtom, targetAtom: exactTarget }];
        }

        if (candidates.length > 1) {
            throw new Error(
                `Bridge B kann die Projektionszelle ${sourceAtom?.id || sourceAtom?.role || "unbekannt"} nicht eindeutig ueber ihre Identitaet binden.`
            );
        }

        return candidates.length === 1
            ? [{ sourceAtom, targetAtom: candidates[0] }]
            : [];
    });
}

function resolveProjectionAtomShellId(atom = {}, shellIds = new Set()) {
    const explicitShellId = atom?.sourceShellId || null;
    if (explicitShellId && shellIds.has(explicitShellId)) {
        return explicitShellId;
    }

    const sourceAtomId = atom?.sourceAtomId || null;
    return sourceAtomId && shellIds.has(sourceAtomId) ? sourceAtomId : null;
}

function buildShellAncestry(shellSpans = []) {
    const parentById = new Map(
        (Array.isArray(shellSpans) ? shellSpans : [])
            .filter((span) => typeof span?.shellId === "string")
            .map((span) => [span.shellId, span.parentShellId || null])
    );
    const shellIds = new Set(parentById.keys());

    function distanceFromAncestor(shellId, ancestorId) {
        let current = shellId;
        let distance = 0;
        const visited = new Set();

        while (current && !visited.has(current)) {
            if (current === ancestorId) {
                return distance;
            }
            visited.add(current);
            current = parentById.get(current) || null;
            distance += 1;
        }

        return null;
    }

    return { shellIds, distanceFromAncestor };
}

function resolveTargetExtent(pairs = []) {
    const starts = pairs
        .map(({ targetAtom }) => resolveAtomStartCol(targetAtom))
        .filter((value) => Number.isInteger(value));
    const ends = pairs
        .map(({ targetAtom }) => resolveAtomEndCol(targetAtom))
        .filter((value) => Number.isInteger(value));

    if (starts.length === 0 || ends.length === 0) {
        return null;
    }

    return {
        colStart: Math.min(...starts),
        colEnd: Math.max(...ends)
    };
}

function sameProjectionRange(left = null, right = null) {
    return Boolean(left && right)
        && left.colStart === right.colStart
        && left.colEnd === right.colEnd;
}

function remapStoredRange(range = null, targetExtent = null) {
    if (!range || !targetExtent) {
        return range;
    }

    return {
        ...structuredClone(range),
        colStart: targetExtent.colStart,
        colEnd: targetExtent.colEnd
    };
}

function resolveSpanEndpoint({
    span,
    fieldName,
    sourceValue,
    pairs,
    ancestry,
    edge
}) {
    if (!Number.isInteger(sourceValue)) {
        return sourceValue;
    }

    const candidates = pairs
        .map((pair) => {
            const sourceEdge = edge === "start"
                ? resolveAtomStartCol(pair.sourceAtom)
                : resolveAtomEndCol(pair.sourceAtom);
            const targetEdge = edge === "start"
                ? resolveAtomStartCol(pair.targetAtom)
                : resolveAtomEndCol(pair.targetAtom);
            const ownerShellId = resolveProjectionAtomShellId(
                pair.sourceAtom,
                ancestry.shellIds
            );
            const distance = ownerShellId
                ? ancestry.distanceFromAncestor(ownerShellId, span.shellId)
                : null;

            return {
                ...pair,
                sourceEdge,
                targetEdge,
                distance
            };
        })
        .filter((candidate) => (
            candidate.sourceEdge === sourceValue
            && Number.isInteger(candidate.targetEdge)
        ));

    if (candidates.length === 0) {
        throw new Error(
            `Bridge B kann ${span.shellId}.${fieldName} keiner identitaetsgebundenen Landing-Zelle zuordnen.`
        );
    }

    const rankedDistances = candidates
        .map((candidate) => candidate.distance)
        .filter((distance) => Number.isInteger(distance));
    const bestDistance = rankedDistances.length > 0 ? Math.min(...rankedDistances) : null;
    const bestCandidates = bestDistance == null
        ? candidates
        : candidates.filter((candidate) => candidate.distance === bestDistance);
    const targetValues = Array.from(new Set(bestCandidates.map((candidate) => candidate.targetEdge)));

    if (targetValues.length !== 1) {
        throw new Error(
            `Bridge B kann ${span.shellId}.${fieldName} nicht eindeutig aus den gebundenen Kindidentitaeten ableiten.`
        );
    }

    return targetValues[0];
}

function collectSpanPairs(span, allPairs, ancestry) {
    const contentLeafIds = new Set(span?.contentLeafIds || []);

    return allPairs.filter(({ sourceAtom }) => {
        const sourceAtomId = sourceAtom?.sourceAtomId || null;
        const ownerShellId = resolveProjectionAtomShellId(sourceAtom, ancestry.shellIds);
        const distance = ownerShellId
            ? ancestry.distanceFromAncestor(ownerShellId, span.shellId)
            : null;

        return contentLeafIds.has(sourceAtomId) || Number.isInteger(distance);
    });
}

function collectContentPairs(span, spanPairs, ancestry) {
    const contentLeafIds = new Set(span?.contentLeafIds || []);

    return spanPairs.filter(({ sourceAtom }) => {
        const sourceAtomId = sourceAtom?.sourceAtomId || null;
        const ownerShellId = resolveProjectionAtomShellId(sourceAtom, ancestry.shellIds);
        const distance = ownerShellId
            ? ancestry.distanceFromAncestor(ownerShellId, span.shellId)
            : null;

        return contentLeafIds.has(sourceAtomId)
            || (Number.isInteger(distance) && distance > 0);
    });
}

function collectCollectionPairs(span, collectionName, spanPairs, shellSpans, ancestry) {
    const collectionLeafIds = new Set(span?.collectionLeafIds?.[collectionName] || []);
    if (collectionLeafIds.size === 0) {
        return [];
    }

    const collectionShellIds = new Set(
        (Array.isArray(shellSpans) ? shellSpans : [])
            .filter((candidate) => {
                const distance = ancestry.distanceFromAncestor(candidate?.shellId, span?.shellId);
                return Number.isInteger(distance)
                    && distance > 0
                    && (candidate?.contentLeafIds || []).some((id) => collectionLeafIds.has(id));
            })
            .map((candidate) => candidate.shellId)
    );

    return spanPairs.filter(({ sourceAtom }) => {
        const sourceAtomId = sourceAtom?.sourceAtomId || null;
        const ownerShellId = resolveProjectionAtomShellId(sourceAtom, ancestry.shellIds);

        if (collectionLeafIds.has(sourceAtomId)) {
            return true;
        }

        if (!ownerShellId) {
            return false;
        }

        return Array.from(collectionShellIds).some((collectionShellId) => (
            Number.isInteger(ancestry.distanceFromAncestor(ownerShellId, collectionShellId))
        ));
    });
}

function remapExactShellSpans(shellSpans = [], sourceAtoms = [], targetAtoms = [], rowId = null, sourceRowId = null) {
    const projectionPairs = buildExactProjectionAtomPairs(sourceAtoms, targetAtoms);
    const ancestry = buildShellAncestry(shellSpans);

    return (Array.isArray(shellSpans) ? shellSpans : []).map((span) => {
        const shellId = span?.shellId || "unbekannte-shell";
        const spanPairs = collectSpanPairs(span, projectionPairs, ancestry);
        const contentPairs = collectContentPairs(span, spanPairs, ancestry);
        const contentExtent = resolveTargetExtent(contentPairs);
        const remappedColStart = resolveSpanEndpoint({
            span,
            fieldName: "colStart",
            sourceValue: span?.colStart,
            pairs: spanPairs,
            ancestry,
            edge: "start"
        });
        const remappedColEnd = resolveSpanEndpoint({
            span,
            fieldName: "colEnd",
            sourceValue: span?.colEnd,
            pairs: spanPairs,
            ancestry,
            edge: "end"
        });
        const remappedOuterRange = {
            colStart: remappedColStart,
            colEnd: remappedColEnd
        };
        const remappedContentRange = contentExtent || remappedOuterRange;
        const sourceOuterRange = { colStart: span?.colStart, colEnd: span?.colEnd };
        const sourceContentRange = {
            colStart: span?.contentColStart,
            colEnd: span?.contentColEnd
        };
        const sourceAlignmentRange = {
            colStart: span?.alignmentColStart,
            colEnd: span?.alignmentColEnd
        };
        const remappedAlignmentRange = sameProjectionRange(sourceAlignmentRange, sourceOuterRange)
            ? remappedOuterRange
            : (sameProjectionRange(sourceAlignmentRange, sourceContentRange)
                ? remappedContentRange
                : remappedContentRange);
        const remappedCollectionRanges = Object.fromEntries(
            Object.entries(span?.collectionRanges || {}).map(([collectionName, range]) => {
                if (!range) {
                    return [collectionName, range];
                }

                const collectionPairs = collectCollectionPairs(
                    span,
                    collectionName,
                    spanPairs,
                    shellSpans,
                    ancestry
                );
                const collectionExtent = resolveTargetExtent(collectionPairs);

                if (!collectionExtent) {
                    throw new Error(
                        `Bridge B kann ${shellId}.collectionRanges.${collectionName} nicht aus den gebundenen Kindidentitaeten ableiten.`
                    );
                }

                return [collectionName, remapStoredRange(range, collectionExtent)];
            })
        );
        const remappedCollectionAlignmentRanges = Object.fromEntries(
            Object.entries(span?.collectionAlignmentRanges || {}).map(([collectionName, range]) => {
                if (!range) {
                    return [collectionName, range];
                }

                if (sameProjectionRange(range, sourceAlignmentRange)) {
                    return [collectionName, remapStoredRange(range, remappedAlignmentRange)];
                }

                const sourceCollectionRange = span?.collectionRanges?.[collectionName] || null;
                if (sameProjectionRange(range, sourceCollectionRange)) {
                    return [collectionName, remappedCollectionRanges[collectionName] || range];
                }

                const collectionPairs = collectCollectionPairs(
                    span,
                    collectionName,
                    spanPairs,
                    shellSpans,
                    ancestry
                );
                return [
                    collectionName,
                    remapStoredRange(range, resolveTargetExtent(collectionPairs))
                ];
            })
        );

        return {
            ...structuredClone(span),
            rowId: rowId || span?.rowId || null,
            sourceRowId: sourceRowId || span?.sourceRowId || null,
            geometryBirthRowId: span?.geometryBirthRowId === span?.rowId && rowId
                ? rowId
                : span?.geometryBirthRowId,
            colStart: remappedOuterRange.colStart,
            colEnd: remappedOuterRange.colEnd,
            contentColStart: remappedContentRange.colStart,
            contentColEnd: remappedContentRange.colEnd,
            alignmentColStart: remappedAlignmentRange.colStart,
            alignmentColEnd: remappedAlignmentRange.colEnd,
            collectionRanges: remappedCollectionRanges,
            collectionAlignmentRanges: remappedCollectionAlignmentRanges
        };
    });
}

function buildExclusiveBridgeLandingProjectionRow({
    boundaryProjectionRow = {},
    probeProjectionRow = {},
    anchorDelta = 0,
    boundaryState = {},
    landingState = {},
    probeTheoryRow = {},
    rowId = "bridge-b-row-0",
    sourceRowId = rowId
} = {}) {
    const boundaryAtoms = collectProjectionAtoms(boundaryProjectionRow);
    const probeAtoms = collectProjectionAtoms(probeProjectionRow);
    const carrySide = normalizeSide(
        boundaryState?.carry_through?.side
        || landingState?.stories?.carry_through?.side
    );
    const variant = normalizeSide(boundaryState?.variant || landingState?.variant);
    const termSide = carrySide === "left"
        ? "right"
        : (carrySide === "right" ? "left" : (variant === "left" ? "right" : "left"));
    const operatorText = String(
        landingState?.stories?.operator?.target
        || landingState?.step_meta?.display_text
        || ""
    ).trim();

    const probeFunctionNameAtom = probeAtoms.find((atom) => (
        String(atom?.role || atom?.projectionRole || "").trim().toLowerCase() === "function_name"
    ));
    const probeFunctionLeftAtom = probeAtoms.find((atom) => (
        ["function_left", "function_left_paren"].includes(
            String(atom?.role || atom?.projectionRole || "").trim().toLowerCase()
        )
    ));
    const probeFunctionRightAtom = probeAtoms.find((atom) => (
        ["function_right", "function_right_paren"].includes(
            String(atom?.role || atom?.projectionRole || "").trim().toLowerCase()
        )
    ));
    const { functionShell: probeFunctionShell } = resolveLandingLogShell(probeTheoryRow);
    const probeFunctionProjectionSpan = (probeProjectionRow?.shellSpans || []).find((span) => (
        span?.shellType === "FUNCTION"
        && span?.shellId === probeFunctionShell?.id
    ));
    const probeFunctionBaseAtoms = collectFunctionBaseProjectionAtoms({
        projectionRow: probeProjectionRow,
        projectionAtoms: probeAtoms,
        functionShellId: probeFunctionShell?.id || null
    });

    const anchorAtom = boundaryAtoms.find((atom) => isAnchorProjectionAtom(atom));
    const boundaryAnchorCol = Number.isInteger(anchorAtom?.col)
        ? anchorAtom.col
        : boundaryState?.anchors?.equals?.x;
    const boundaryAnchorLocalRow = Number.isInteger(anchorAtom?.localRow) ? anchorAtom.localRow : 0;

    const probeAnchorAtom = probeAtoms.find((atom) => isAnchorProjectionAtom(atom));
    const probeAnchorCol = Number.isInteger(probeAnchorAtom?.col) ? probeAnchorAtom.col : null;
    const probeAnchorLocalRow = Number.isInteger(probeAnchorAtom?.localRow)
        ? probeAnchorAtom.localRow
        : boundaryAnchorLocalRow;
    const landingAxisLocalRow = probeAnchorLocalRow;
    const carryLocalRowDelta = landingAxisLocalRow - boundaryAnchorLocalRow;

    const carryAtoms = boundaryAtoms
        .filter((atom) => !isAnchorProjectionAtom(atom))
        .filter((atom) => shouldKeepBridgeProjectionAtom(atom))
        .filter((atom) => isAtomOnSideOfAnchor(atom, carrySide, boundaryAnchorCol))
        .map((atom) => shiftProjectionAtom(atom, 0, {
            localRow: shiftMaybeInt(atom?.localRow, carryLocalRowDelta)
        }));
    const carryRange = resolveTargetExtent(
        carryAtoms.map((atom) => ({ sourceAtom: atom, targetAtom: atom }))
    );

    const termLocalRowDelta = landingAxisLocalRow - probeAnchorLocalRow;
    const termAtoms = probeAtoms
        .filter((atom) => {
            if (!isConcreteProjectionAtom(atom)) {
                return false;
            }

            return isAtomOnSideOfAnchor(atom, termSide, probeAnchorCol);
        })
        .map((atom) => shiftProjectionAtom(atom, anchorDelta, {
            localRow: shiftMaybeInt(atom?.localRow, termLocalRowDelta)
        }));
    const landingTermAtoms = bindTermAtomsToLandingSlots(termAtoms, landingState);

    const landingAtoms = [];

    if (operatorText) {
        if (!probeFunctionNameAtom || !probeFunctionLeftAtom || !probeFunctionRightAtom) {
            throw new Error("Bridge B erhielt von P4 keine vollstaendige inverse Funktionshuelle.");
        }

        const probeFunctionName = String(
            probeFunctionNameAtom?.text ?? probeFunctionNameAtom?.value ?? ""
        ).trim();
        if (
            probeFunctionShell?.id
            && probeFunctionNameAtom?.sourceShellId
            && probeFunctionNameAtom.sourceShellId !== probeFunctionShell.id
        ) {
            throw new Error("Bridge B erhielt eine Funktionszelle, die nicht zur semantischen A2-FUNCTION gehoert.");
        }

        const probeFunctionBaseText = serializeCollection(probeFunctionShell?.baseContent || []);
        const probeOperatorText = buildFunctionHead(
            probeFunctionShell?.name || probeFunctionName,
            probeFunctionBaseText
        );

        if (probeOperatorText !== operatorText) {
            throw new Error("Bridge B erhielt verschiedene inverse Funktionskoepfe aus landing_state und P4-Projektion.");
        }

        const probeContentRange = probeFunctionProjectionSpan?.collectionRanges?.content || null;
        if (
            !carryRange
            || !Number.isInteger(probeContentRange?.colStart)
            || !Number.isInteger(probeContentRange?.colEnd)
        ) {
            throw new Error(
                "Bridge B erhielt keine eindeutigen funktionalen Grenzen fuer die unveraenderte Durchreicheschale."
            );
        }

        const functionPrefixDelta = carryRange.colStart - probeContentRange.colStart;
        const functionSuffixDelta = carryRange.colEnd - probeContentRange.colEnd;

        landingAtoms.push(shiftProjectionAtom(probeFunctionNameAtom, functionPrefixDelta, {
            text: probeFunctionName,
            value: probeFunctionName,
            localRow: shiftMaybeInt(probeFunctionNameAtom?.localRow, termLocalRowDelta)
        }));
        landingAtoms.push(shiftProjectionAtom(probeFunctionLeftAtom, functionPrefixDelta, {
            localRow: shiftMaybeInt(probeFunctionLeftAtom?.localRow, termLocalRowDelta)
        }));
        landingAtoms.push(shiftProjectionAtom(probeFunctionRightAtom, functionSuffixDelta, {
            localRow: shiftMaybeInt(probeFunctionRightAtom?.localRow, termLocalRowDelta)
        }));

        probeFunctionBaseAtoms.forEach((atom) => {
            landingAtoms.push(shiftProjectionAtom(atom, functionPrefixDelta, {
                localRow: shiftMaybeInt(atom?.localRow, termLocalRowDelta)
            }));
        });
    }

    landingAtoms.push(...carryAtoms);

    if (anchorAtom) {
        landingAtoms.push(cloneProjectionAtom(anchorAtom, {
            role: anchorAtom.role || anchorAtom.projectionRole || "anchor",
            localRow: landingAxisLocalRow
        }));
    }

    landingAtoms.push(...landingTermAtoms);

    landingAtoms.sort((left, right) => {
        const leftRow = Number.isInteger(left?.localRow) ? left.localRow : 0;
        const rightRow = Number.isInteger(right?.localRow) ? right.localRow : 0;
        if (leftRow !== rightRow) {
            return leftRow - rightRow;
        }
        const leftCol = resolveAtomStartCol(left) ?? 0;
        const rightCol = resolveAtomStartCol(right) ?? 0;
        return leftCol - rightCol;
    });

    const rowBounds = resolveRowBounds(landingAtoms);
    const landingShellSpans = remapExactShellSpans(
        probeProjectionRow?.shellSpans || [],
        probeAtoms,
        landingAtoms,
        rowId,
        sourceRowId
    );

    return {
        ...structuredClone(probeProjectionRow),
        rowId,
        sourceRowId,
        minRelativeRow: rowBounds.minRelativeRow,
        maxRelativeRow: rowBounds.maxRelativeRow,
        localRowCount: rowBounds.localRowCount,
        axisLocalRow: landingAxisLocalRow,
        rowKinds: Array.from({ length: rowBounds.localRowCount }, (_, index) => (
            (rowBounds.minRelativeRow + index) === landingAxisLocalRow ? "axis" : "band"
        )),
        rowRoles: Array.from({ length: rowBounds.localRowCount }, (_, index) => (
            (rowBounds.minRelativeRow + index) === landingAxisLocalRow ? "axis" : "band"
        )),
        shellSpans: landingShellSpans,
        positionedAtoms: landingAtoms,
        projectionAtoms: landingAtoms
    };
}

function restackLegacyProjectionRows(rows = []) {
    let stackCursor = 0;

    return (Array.isArray(rows) ? rows : []).map((row) => {
        const localRowCount = Number.isInteger(row?.localRowCount) ? row.localRowCount : 1;
        const axisLocalRow = Number.isInteger(row?.axisLocalRow) ? row.axisLocalRow : 0;
        const stackRowStart = stackCursor;
        const stackRowEnd = stackRowStart + Math.max(0, localRowCount - 1);
        const axisAbsoluteRow = stackRowStart + axisLocalRow;
        stackCursor = stackRowEnd + 1;

        return {
            ...row,
            absoluteRowStart: stackRowStart,
            absoluteRowEnd: stackRowEnd,
            stackRowStart,
            stackRowEnd,
            axisAbsoluteRow,
            axisStackedRow: axisAbsoluteRow,
            positionedAtoms: (Array.isArray(row?.positionedAtoms) ? row.positionedAtoms : []).map((atom) => {
                const localRow = Number.isInteger(atom?.localRow) ? atom.localRow : 0;
                const stackedRow = stackRowStart + localRow;

                return {
                    ...atom,
                    row: stackedRow,
                    absoluteRow: stackedRow,
                    stackedRow
                };
            })
        };
    });
}

function remapTheoryRows(rows = [], prefix = "bridge-a2-row-", stepIndexOffset = 0, rowIdOffset = 0) {
    return (Array.isArray(rows) ? rows : []).map((row, index) => ({
        ...structuredClone(row),
        rowId: `${prefix}${rowIdOffset + index}`,
        stepIndex: stepIndexOffset + index
    }));
}

function collectNativeTheoryRows(result = {}) {
    const outputTheoryRows = Array.isArray(result?.exportData?.outputContract?.theoryRows)
        ? result.exportData.outputContract.theoryRows
        : [];

    if (outputTheoryRows.length > 0) {
        return outputTheoryRows;
    }

    return Array.isArray(result?.exportData?.theoryRows)
        ? result.exportData.theoryRows
        : [];
}

function collectNativeProjectionRows(result = {}) {
    if (Array.isArray(result?.exportData?.outputContract?.projectionRows)) {
        return result.exportData.outputContract.projectionRows.map((row) => {
            const positionedAtoms = collectProjectionAtoms(row);
            return {
                ...structuredClone(row),
                positionedAtoms,
                projectionAtoms: positionedAtoms
            };
        });
    }

    if (Array.isArray(result?.exportData?.projectionRows) && result.exportData.projectionRows.length > 0) {
        return result.exportData.projectionRows.map((row) => {
            const projectionAtoms = collectProjectionAtoms(row);
            return {
                ...structuredClone(row),
                positionedAtoms: projectionAtoms,
                projectionAtoms
            };
        });
    }

    return [];
}

function buildTheoryRowIdMap(sourceRows = [], remappedRows = []) {
    const map = new Map();

    (Array.isArray(sourceRows) ? sourceRows : []).forEach((row, index) => {
        const sourceRowId = row?.rowId || null;
        const remappedRowId = remappedRows[index]?.rowId || null;

        if (sourceRowId && remappedRowId) {
            map.set(sourceRowId, remappedRowId);
        }
    });

    return map;
}

function resolveProjectionColumnCount(projectionRows = []) {
    return (Array.isArray(projectionRows) ? projectionRows : []).reduce((currentMax, row) => {
        const rowMax = (Array.isArray(row?.projectionAtoms) ? row.projectionAtoms : [])
            .reduce((atomMax, atom) => {
                const colEnd = Number.isInteger(atom?.colEnd)
                    ? atom.colEnd
                    : (Number.isInteger(atom?.col) ? atom.col : -1);
                return Math.max(atomMax, colEnd);
            }, -1);

        return Math.max(currentMax, rowMax);
    }, -1) + 1;
}

function buildSequentialNativeLayoutPlan(projectionRows = [], anchorProjectionCol = null) {
    let stackedCursor = 0;
    const rows = (Array.isArray(projectionRows) ? projectionRows : []).map((row) => {
        const localRowCount = Number.isInteger(row?.localRowCount) ? row.localRowCount : 1;
        const stackedRowStart = stackedCursor;
        const stackedRowEnd = stackedRowStart + Math.max(0, localRowCount - 1);
        stackedCursor = stackedRowEnd + 1;

        return {
            rowId: row?.rowId || null,
            processSpaceId: row?.processSpaceId || null,
            stackedRowStart,
            stackedRowEnd
        };
    });

    return {
        rowCount: (Array.isArray(projectionRows) ? projectionRows : []).length,
        stackedVisualRowCount: stackedCursor,
        anchorProjectionCol,
        columnCount: Math.max(0, resolveProjectionColumnCount(projectionRows)),
        rows
    };
}

export function buildBridgeWorksheetSolveResultFromSolveState(solveState = {}, equation = "", targetVariable = "x") {
    const {
        stepIndex
    } = findPowerExponentBoundaryRowContext(solveState);
    const bridgedResult = structuredClone(solveState);
    const boundaryState = coreA.buildBridgeBoundaryStateFromSolveState(solveState);
    const landingProfile = coreA.buildBridgeLandingProfileFromSolveState(solveState);
    const landingState = bridgeB.buildBridgeLandingState(boundaryState, landingProfile);
    const a2Probe = coreA.buildBridgeA2ProbeFromSolveState(solveState);
    const nativeTheoryRows = structuredClone(collectNativeTheoryRows(bridgedResult));
    const nativeProjectionRows = structuredClone(collectNativeProjectionRows(bridgedResult));
    const preservedTheoryRows = nativeTheoryRows.slice(0, stepIndex + 1).map((row) => ({
        ...row,
        processSpaceId: A1_PROCESS_SPACE_ID
    }));
    const preservedProjectionRows = nativeProjectionRows.slice(0, stepIndex + 1).map((row) => ({
        ...row,
        processSpaceId: A1_PROCESS_SPACE_ID
    }));
    const remappedProbeTheoryRows = remapTheoryRows(
        a2Probe.theoryRows,
        "bridge-a2-row-",
        stepIndex + 1,
        stepIndex + 1
    ).map((row) => ({
        ...row,
        processSpaceId: A2_PROCESS_SPACE_ID
    }));
    const probeTheoryRowIdMap = buildTheoryRowIdMap(a2Probe.theoryRows, remappedProbeTheoryRows);
    const exclusiveBridgeProjectionRow = {
        ...buildExclusiveBridgeLandingProjectionRow({
            boundaryProjectionRow: preservedProjectionRows[preservedProjectionRows.length - 1] || {},
            probeProjectionRow: a2Probe.nativeProjectionRows?.[0] || {},
            anchorDelta: a2Probe.anchorDelta,
            boundaryState,
            landingState,
            probeTheoryRow: a2Probe.theoryRows?.[0] || {},
            rowId: probeTheoryRowIdMap.get(a2Probe.nativeProjectionRows?.[0]?.rowId) || "bridge-a2-row-1",
            sourceRowId: remappedProbeTheoryRows?.[0]?.rowId || "bridge-a2-row-1"
        }),
        processSpaceId: A2_PROCESS_SPACE_ID
    };
    const continuationProjectionRows = buildBridgeContinuationProjectionRows({
        probeProjectionRows: a2Probe.nativeProjectionRows,
        exclusiveBridgeProjectionRow,
        anchorDelta: a2Probe.anchorDelta,
        rowIdMap: probeTheoryRowIdMap,
        boundaryState,
        landingState
    }).map((row) => ({
        ...row,
        processSpaceId: A2_PROCESS_SPACE_ID
    }));
    const bridgedTheoryRows = [...preservedTheoryRows, ...remappedProbeTheoryRows];
    const bridgedProjectionRows = [
        ...preservedProjectionRows,
        exclusiveBridgeProjectionRow,
        ...continuationProjectionRows
    ];
    const anchorProjectionCol = Number.isInteger(solveState?.exportData?.outputContract?.layoutPlan?.anchorProjectionCol)
        ? solveState.exportData.outputContract.layoutPlan.anchorProjectionCol
        : (Number.isInteger(a2Probe?.boundaryAnchorX) ? a2Probe.boundaryAnchorX : null);
    const bridgedLayoutPlan = buildSequentialNativeLayoutPlan(bridgedProjectionRows, anchorProjectionCol);

    bridgedResult.eingabe = equation || solveState?.eingabe || "";
    bridgedResult.targetVariable = targetVariable || solveState?.targetVariable || null;

    if (!bridgedResult.exportData || typeof bridgedResult.exportData !== "object") {
        bridgedResult.exportData = {};
    }

    if (!bridgedResult.exportData.outputContract || typeof bridgedResult.exportData.outputContract !== "object") {
        bridgedResult.exportData.outputContract = {};
    }

    bridgedResult.exportData.theoryRows = bridgedTheoryRows;
    bridgedResult.exportData.outputContract.theoryRows = bridgedTheoryRows;
    bridgedResult.exportData.outputContract.projectionRows = bridgedProjectionRows;
    bridgedResult.exportData.outputContract.layoutPlan = bridgedLayoutPlan;
    bridgedResult.exportData.outputContract.bridgeProjectionRows = bridgedProjectionRows;
    bridgedResult.bridgeMeta = {
        enabled: true,
        triggerFamily: "power_exponent_release",
        triggerStepIndex: stepIndex,
        worksheetMode: "splice_real_bridge_landing_with_a2_probe",
        boundaryRowCount: preservedTheoryRows.length,
        probeRowCount: remappedProbeTheoryRows.length,
        anchorDelta: a2Probe.anchorDelta
    };

    return bridgedResult;
}

export async function buildRealBridgeHandoffPayload(equation = "", targetVariable = "x") {
    const solveState = await coreA.ACTIVE_CORE_A_RUNTIME.solve(equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable
    });

    if (solveState?.fehler) {
        throw new Error(solveState.fehler);
    }

    const boundaryState = coreA.buildBridgeBoundaryStateFromSolveState(solveState);
    const landingProfile = coreA.buildBridgeLandingProfileFromSolveState(solveState);
    const landingState = bridgeB.buildBridgeLandingState(boundaryState, landingProfile);
    const {
        stepIndex,
        boundaryRow,
        landingRow,
        boundaryProjectionRow,
        landingProjectionRow
    } = findPowerExponentBoundaryRowContext(solveState);

    return {
        equation,
        target_variable: targetVariable,
        trigger_family: "power_exponent_release",
        trigger_step_index: stepIndex,
        boundary_state: boundaryState,
        landing_profile: landingProfile,
        landing_state: landingState,
        before_state: buildBeforeState({
            boundaryState,
            boundaryRow,
            boundaryProjectionRow
        }),
        after_state: buildAfterState({
            landingProfile,
            landingState,
            landingRow,
            landingProjectionRow
        })
    };
}
