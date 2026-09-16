import {
    buildDisplayColumnLayout,
    resolveCellDisplaySlotBounds
} from "./displayColumnLayout.js";

const DEFAULT_PROCESS_SPACE_ID = "default";
const COORDINATE_PRECISION = 1_000_000_000;

function normalizeProcessSpaceId(value) {
    return typeof value === "string" && value.length > 0
        ? value
        : DEFAULT_PROCESS_SPACE_ID;
}

function coordinateKey(value) {
    return Math.round(Number(value || 0) * COORDINATE_PRECISION);
}

function coordinateValue(key) {
    return key / COORDINATE_PRECISION;
}

function slotLeft(layout, slotIndex) {
    return Number(layout?.starts?.[slotIndex]) || 0;
}

function slotRight(layout, slotIndex) {
    return slotLeft(layout, slotIndex) + Math.max(0, Number(layout?.slots?.[slotIndex]?.width) || 0);
}

function collectProcessSpaceIds(viewModel) {
    const ids = [];
    const seen = new Set();

    (viewModel?.steps || []).forEach((step) => {
        const processSpaceId = normalizeProcessSpaceId(step?.processSpaceId);
        if (!seen.has(processSpaceId)) {
            seen.add(processSpaceId);
            ids.push(processSpaceId);
        }
    });

    return ids;
}

function buildScopedViewModel(viewModel, processSpaceId) {
    return {
        ...viewModel,
        steps: (viewModel?.steps || []).map((step) => (
            normalizeProcessSpaceId(step?.processSpaceId) === processSpaceId
                ? step
                : { ...step, cells: [] }
        ))
    };
}

function findAnchorCell(viewModel, processSpaceId) {
    return (viewModel?.layout?.cells || []).find((cell) => (
        normalizeProcessSpaceId(cell?.processSpaceId) === processSpaceId
        && (cell?.projectionRole === "anchor" || cell?.kind === "anchor")
    ));
}

function resolveLocalCellBounds(cell, displayLayout) {
    return resolveCellDisplaySlotBounds(
        cell,
        displayLayout,
        {
            minOriginStepIndex: Number.isInteger(cell?.stepIndex) ? cell.stepIndex : 0
        }
    );
}

function resolveAnchorCenter(viewModel, processSpaceId, displayLayout) {
    const anchorCell = findAnchorCell(viewModel, processSpaceId);
    if (!anchorCell) {
        throw new Error(`[ColumnLayout] Im Prozessraum ${processSpaceId} fehlt der Gleichheitsanker.`);
    }

    const bounds = resolveLocalCellBounds(anchorCell, displayLayout);
    return (
        slotLeft(displayLayout, bounds.displayStartSlot)
        + slotRight(displayLayout, bounds.displayEndSlot)
    ) / 2;
}

function buildProcessSpaceRecords(viewModel, profile, processSpaceIds) {
    const records = processSpaceIds.map((processSpaceId) => {
        const displayLayout = buildDisplayColumnLayout(
            buildScopedViewModel(viewModel, processSpaceId),
            profile
        );

        return {
            processSpaceId,
            displayLayout,
            anchorCenter: resolveAnchorCenter(viewModel, processSpaceId, displayLayout)
        };
    });
    const sharedAnchorCenter = Math.max(...records.map((record) => record.anchorCenter));

    return records.map((record) => ({
        ...record,
        offset: sharedAnchorCenter - record.anchorCenter,
        sharedAnchorCenter
    }));
}

function buildGlobalCoordinateKeys(records) {
    const keys = new Set([coordinateKey(0)]);

    records.forEach((record) => {
        const { displayLayout, offset } = record;
        (displayLayout?.slots || []).forEach((slot, slotIndex) => {
            keys.add(coordinateKey(offset + slotLeft(displayLayout, slotIndex)));
            keys.add(coordinateKey(offset + slotRight(displayLayout, slotIndex)));
        });
    });

    return [...keys].sort((left, right) => left - right);
}

function buildGlobalDisplayLayout(records, coordinateKeys, profile) {
    const slots = [];
    const starts = [];

    for (let index = 0; index < coordinateKeys.length - 1; index += 1) {
        const start = coordinateValue(coordinateKeys[index]);
        const end = coordinateValue(coordinateKeys[index + 1]);

        starts.push(start);
        slots.push({
            id: `process-space-segment-${index}`,
            kind: "process_space_segment",
            label: `ps${index}`,
            width: end - start
        });
    }

    const boundaryIndexByKey = new Map(
        coordinateKeys.map((key, index) => [key, index])
    );
    const primaryRecord = records[0];
    const semanticToSlotIndex = (primaryRecord?.displayLayout?.semanticToSlotIndex || []).map((slotIndex) => {
        if (!Number.isInteger(slotIndex)) {
            return null;
        }
        const key = coordinateKey(primaryRecord.offset + slotLeft(primaryRecord.displayLayout, slotIndex));
        return boundaryIndexByKey.get(key) ?? null;
    });

    return {
        profile,
        processScoped: true,
        slots,
        starts,
        totalWidth: coordinateKeys.length > 0
            ? coordinateValue(coordinateKeys[coordinateKeys.length - 1])
            : 0,
        semanticToSlotIndex,
        slotIndexByKindAndSemanticCol: {},
        processSpaces: records.map((record) => ({
            processSpaceId: record.processSpaceId,
            offset: record.offset,
            anchorCenter: record.anchorCenter,
            sharedAnchorCenter: record.sharedAnchorCenter
        }))
    };
}

function mapLocalSlotStart(record, slotIndex, boundaryIndexByKey) {
    const key = coordinateKey(record.offset + slotLeft(record.displayLayout, slotIndex));
    const boundaryIndex = boundaryIndexByKey.get(key);
    if (!Number.isInteger(boundaryIndex) || boundaryIndex >= boundaryIndexByKey.size - 1) {
        throw new Error(`[ColumnLayout] Ungueltige Startlinie im Prozessraum ${record.processSpaceId}.`);
    }
    return boundaryIndex;
}

function mapLocalSlotEnd(record, slotIndex, boundaryIndexByKey) {
    if (!Number.isInteger(slotIndex)) {
        return mapLocalSlotStart(record, slotIndex, boundaryIndexByKey);
    }

    const key = coordinateKey(record.offset + slotRight(record.displayLayout, slotIndex));
    const boundaryIndex = boundaryIndexByKey.get(key);
    if (!Number.isInteger(boundaryIndex)) {
        throw new Error(`[ColumnLayout] Ungueltige Endlinie im Prozessraum ${record.processSpaceId}.`);
    }
    return Math.max(0, boundaryIndex - 1);
}

function mapSemanticContentBounds(cell, record, boundaryIndexByKey) {
    const localLayout = record.displayLayout;
    const startSemanticSlot = Number.isInteger(cell?.shellContentColStart)
        ? localLayout?.semanticToSlotIndex?.[cell.shellContentColStart]
        : null;
    const endSemanticSlot = Number.isInteger(cell?.shellContentColEnd)
        ? localLayout?.semanticToSlotIndex?.[cell.shellContentColEnd]
        : null;

    return {
        displayShellContentStartSlot: Number.isInteger(startSemanticSlot)
            ? mapLocalSlotStart(record, startSemanticSlot, boundaryIndexByKey)
            : null,
        displayShellContentEndSlot: Number.isInteger(endSemanticSlot)
            ? mapLocalSlotEnd(record, endSemanticSlot, boundaryIndexByKey)
            : null
    };
}

function buildCellBounds(viewModel, records, coordinateKeys) {
    const recordsById = new Map(records.map((record) => [record.processSpaceId, record]));
    const boundaryIndexByKey = new Map(
        coordinateKeys.map((key, index) => [key, index])
    );
    const boundsByCell = new Map();

    (viewModel?.layout?.cells || []).forEach((cell) => {
        const processSpaceId = normalizeProcessSpaceId(cell?.processSpaceId);
        const record = recordsById.get(processSpaceId);
        if (!record) {
            throw new Error(`[ColumnLayout] Unbekannter Prozessraum ${processSpaceId}.`);
        }

        const localBounds = resolveLocalCellBounds(cell, record.displayLayout);
        boundsByCell.set(cell, {
            ...localBounds,
            processSpaceId,
            semanticStartSlot: mapLocalSlotStart(record, localBounds.semanticStartSlot, boundaryIndexByKey),
            semanticEndSlot: mapLocalSlotEnd(record, localBounds.semanticEndSlot, boundaryIndexByKey),
            displayStartSlot: mapLocalSlotStart(record, localBounds.displayStartSlot, boundaryIndexByKey),
            displayEndSlot: mapLocalSlotEnd(record, localBounds.displayEndSlot, boundaryIndexByKey),
            ...mapSemanticContentBounds(cell, record, boundaryIndexByKey)
        });
    });

    return boundsByCell;
}

export function buildProcessSpaceDisplayLayout(viewModel, profile) {
    const processSpaceIds = collectProcessSpaceIds(viewModel);
    if (processSpaceIds.length <= 1) {
        return null;
    }

    const records = buildProcessSpaceRecords(viewModel, profile, processSpaceIds);
    const coordinateKeys = buildGlobalCoordinateKeys(records);

    return {
        displayLayout: buildGlobalDisplayLayout(records, coordinateKeys, profile),
        boundsByCell: buildCellBounds(viewModel, records, coordinateKeys)
    };
}

export {
    DEFAULT_PROCESS_SPACE_ID
};
