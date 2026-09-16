import { normalizeTheoryRowsForNeukern } from "./theoryRows.js";

export function createProjectionDraft(theoryRows = []) {
    const normalizedTheoryRows = normalizeTheoryRowsForNeukern(theoryRows);

    return {
        theoryRows: normalizedTheoryRows,
        semanticRaster: {
            columns: [],
            traces: []
        },
        shellBlueprints: [],
        projectionBlocks: [],
        projectionRows: []
    };
}
