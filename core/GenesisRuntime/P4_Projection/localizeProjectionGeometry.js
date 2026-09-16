import { cloneRuntimeValue } from '../runtimeClone.js';

const P4_LOCAL_GEOMETRY_VERSION = "p4_local_geometry_v4";

function localizeProjectionGeometry(theoryRows = [], semanticRaster = null, shellBlueprints = []) {
    const cellProfile = semanticRaster?.cellProfile || null;
    if (
        !cellProfile
        || cellProfile.contractVersion !== "p4_global_cell_profile_v1"
        || !Array.isArray(cellProfile.rows)
        || !Array.isArray(cellProfile.localizedShellBlueprints)
    ) {
        throw new Error(
            "[GenesisRuntime:P4] Die funktionale Schalengeometrie benoetigt das abgeschlossene globale Zellprofil."
        );
    }

    const theoryRowIds = new Set((theoryRows || []).map((row) => row?.rowId));
    const profileRowIds = new Set(cellProfile.rows.map((row) => row?.rowId));
    if (
        theoryRowIds.size !== profileRowIds.size
        || [...theoryRowIds].some((rowId) => !profileRowIds.has(rowId))
    ) {
        throw new Error("[GenesisRuntime:P4] Theoriezeilen und globales Zellprofil widersprechen sich.");
    }

    const expectedBlueprintKeys = new Set(
        (shellBlueprints || []).map((blueprint) => blueprint?.rowShellKey)
    );
    const localizedBlueprintKeys = new Set(
        cellProfile.localizedShellBlueprints.map((blueprint) => blueprint?.rowShellKey)
    );
    if (
        expectedBlueprintKeys.size !== localizedBlueprintKeys.size
        || [...expectedBlueprintKeys].some((key) => !localizedBlueprintKeys.has(key))
    ) {
        throw new Error("[GenesisRuntime:P4] Zellprofil und Shell-Bedarfsplaene widersprechen sich.");
    }

    const localizedContentCols = new Map();
    const localizedContentSpans = new Map();
    cellProfile.rows.forEach((row) => {
        ["left", "right"].forEach((side) => {
            (row?.placements?.[side] || []).forEach((placement) => {
                const key = `${row.rowId}::${side}::${placement.nodeId}`;
                localizedContentCols.set(key, placement.rawCol);
                localizedContentSpans.set(key, {
                    rawColStart: placement.rawColStart,
                    rawColEnd: placement.rawColEnd
                });
            });
        });
    });

    return {
        contractVersion: P4_LOCAL_GEOMETRY_VERSION,
        localizedShellBlueprints: cloneRuntimeValue(cellProfile.localizedShellBlueprints),
        localizedContentCols,
        localizedContentSpans
    };
}

export {
    P4_LOCAL_GEOMETRY_VERSION,
    localizeProjectionGeometry
};
