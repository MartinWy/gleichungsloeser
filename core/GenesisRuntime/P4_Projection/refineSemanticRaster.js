import { cloneRuntimeValue } from '../runtimeClone.js';

const P4_REFINED_SEMANTIC_RASTER_VERSION = "p4_refined_semantic_raster_v2";

function assertRasterSide(side, tracks) {
    if (!Array.isArray(tracks)) {
        throw new Error(`[GenesisRuntime:P4] Das semantische Raster besitzt keine ${side}-Spuren.`);
    }

    const trackKeys = new Set();

    tracks.forEach((track) => {
        if (
            !track
            || track.side !== side
            || typeof track.trackKey !== "string"
            || typeof track.nodeId !== "string"
            || !Number.isFinite(track.rawCol)
        ) {
            throw new Error(`[GenesisRuntime:P4] Ungueltige ${side}-Spur im semantischen Raster.`);
        }

        if (trackKeys.has(track.trackKey)) {
            throw new Error(`[GenesisRuntime:P4] Doppelte semantische Spur ${track.trackKey}.`);
        }

        trackKeys.add(track.trackKey);
    });
}

function validateRasterRows(theoryRows, rasterRows) {
    if (!Array.isArray(rasterRows) || rasterRows.length !== theoryRows.length) {
        throw new Error("[GenesisRuntime:P4] Raster- und Theoriezeilenanzahl stimmen nicht ueberein.");
    }

    theoryRows.forEach((row, index) => {
        if (rasterRows[index]?.rowId !== row?.rowId) {
            throw new Error(`[GenesisRuntime:P4] Das Raster fuer Theoriezeile ${row?.rowId || index} fehlt.`);
        }
    });
}

function validateCellProfile(theoryRows, cellProfile) {
    if (
        !cellProfile
        || cellProfile.contractVersion !== "p4_global_cell_profile_v1"
        || !Array.isArray(cellProfile.rows)
        || !Array.isArray(cellProfile.localizedShellBlueprints)
    ) {
        throw new Error("[GenesisRuntime:P4] Das globale Raster besitzt kein vollstaendiges Zellprofil.");
    }

    validateRasterRows(theoryRows, cellProfile.rows);
    cellProfile.rows.forEach((row) => {
        ["left", "right"].forEach((side) => {
            if (
                !Array.isArray(row?.placements?.[side])
                || !Array.isArray(row?.shellSlots?.[side])
                || !Array.isArray(row?.occupiedRanges?.[side])
                || !Array.isArray(row?.reservedRanges?.[side])
            ) {
                throw new Error(`[GenesisRuntime:P4] Das Zellprofil fuer ${row?.rowId}::${side} ist unvollstaendig.`);
            }
        });
    });
}

function refineSemanticRaster(theoryRows = [], semanticRaster = null) {
    if (!Array.isArray(theoryRows) || !semanticRaster || typeof semanticRaster !== "object") {
        throw new Error("[GenesisRuntime:P4] Die Rasterverfeinerung benoetigt Theoriezeilen und ein semantisches Raster.");
    }

    assertRasterSide("left", semanticRaster?.tracks?.left);
    assertRasterSide("right", semanticRaster?.tracks?.right);
    validateRasterRows(theoryRows, semanticRaster?.rows);
    validateCellProfile(theoryRows, semanticRaster?.cellProfile);

    return {
        ...cloneRuntimeValue(semanticRaster),
        contractVersion: P4_REFINED_SEMANTIC_RASTER_VERSION
    };
}

export {
    P4_REFINED_SEMANTIC_RASTER_VERSION,
    refineSemanticRaster
};
