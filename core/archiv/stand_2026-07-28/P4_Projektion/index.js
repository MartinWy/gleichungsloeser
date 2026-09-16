import { process as processP4NeukernLegacy } from '../P4_Neukern/LegacyProjectionAdapter.js';
import { resolveProjectionEngine } from './projectionEngine.js';
import { normalizeProjectionRows } from './projectionRowUtils.js';
import { processClassicProjection } from './classicProjectionPipeline.js';

export const process = (theoryRows, options = {}) => {
    const normalizedRows = normalizeProjectionRows(theoryRows);
    const engine = resolveProjectionEngine(options);

    if (engine === "neukern_adapter") {
        return processP4NeukernLegacy(normalizedRows);
    }

    return processClassicProjection(normalizedRows);
};

export { projectToGrid } from './Regelwerk.js';
export { generateGlobalLayout } from './PreFlightEngine.js';
export { Projektor } from './LochLogik.js';
export { resolveProjectionEngine } from './projectionEngine.js';
export {
    clone,
    getRowBounds,
    normalizeProjectionRows,
    resolveAxisAbsoluteRow
} from './projectionRowUtils.js';
export { processClassicProjection } from './classicProjectionPipeline.js';
