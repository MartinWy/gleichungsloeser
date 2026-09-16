import assert from "node:assert/strict";

import { runInputPhase } from "../../core/GenesisRuntime/P1_Input/runInputPhase.js";
import {
    P4_THEORY_ROWS_VERSION,
    buildTheoryRowsFromRuntime
} from "../../core/GenesisRuntime/P4_Projection/buildTheoryRows.js";
import {
    P4_GLOBAL_SEMANTIC_RASTER_VERSION,
    buildGlobalSemanticRaster
} from "../../core/GenesisRuntime/P4_Projection/buildGlobalSemanticRaster.js";
import {
    P4_REFINED_SEMANTIC_RASTER_VERSION,
    refineSemanticRaster
} from "../../core/GenesisRuntime/P4_Projection/refineSemanticRaster.js";
import {
    P4_SHELL_BLUEPRINTS_VERSION,
    buildShellBlueprints
} from "../../core/GenesisRuntime/P4_Projection/buildShellBlueprints.js";
import {
    P4_LOCAL_GEOMETRY_VERSION,
    localizeProjectionGeometry
} from "../../core/GenesisRuntime/P4_Projection/localizeProjectionGeometry.js";
import {
    P4_PROJECTION_BLOCKS_VERSION,
    buildProjectionBlocks
} from "../../core/GenesisRuntime/P4_Projection/buildProjectionBlocks.js";
import {
    P4_WRITTEN_PROJECTION_ROWS_VERSION,
    writeProjectionRows
} from "../../core/GenesisRuntime/P4_Projection/writeProjectionRows.js";
import {
    P4_OUTPUT_CONTRACT_VERSION,
    buildOutputContract
} from "../../core/GenesisRuntime/P4_Projection/buildOutputContract.js";

const request = { equation: "x/2=5", requestedTargetVariable: "x" };
const inputPhase = await runInputPhase({ request });
const transformationPhase = {
    initialStructure: inputPhase.structure,
    history: []
};
const theoryRows = buildTheoryRowsFromRuntime({ inputPhase, transformationPhase });

assert.equal(theoryRows[0].contractVersion, P4_THEORY_ROWS_VERSION);

const shellBlueprints = buildShellBlueprints(theoryRows);
assert.ok(shellBlueprints.length > 0);
assert.ok(shellBlueprints.every((blueprint) => blueprint.contractVersion === P4_SHELL_BLUEPRINTS_VERSION));
assert.ok(
    shellBlueprints.every((blueprint) => !/rawCol/.test(JSON.stringify(blueprint))),
    "Der Shell-Bedarfsplan darf keine vorlaeufige Spaltenwahrheit enthalten."
);

assert.throws(
    () => buildGlobalSemanticRaster(theoryRows, []),
    /fehlt der Eingabe-Blueprint/,
    "Das globale Raster darf fehlende Huellezellansprueche nicht erraten."
);

const globalRaster = buildGlobalSemanticRaster(theoryRows, shellBlueprints);
const globalRasterSnapshot = structuredClone(globalRaster);
assert.equal(globalRaster.contractVersion, P4_GLOBAL_SEMANTIC_RASTER_VERSION);

const refinedRaster = refineSemanticRaster(theoryRows, globalRaster);
assert.equal(refinedRaster.contractVersion, P4_REFINED_SEMANTIC_RASTER_VERSION);
assert.equal(Object.prototype.hasOwnProperty.call(refinedRaster, "shellBlueprints"), false);
assert.deepEqual(globalRaster, globalRasterSnapshot, "Die Rasterverfeinerung darf ihre Eingabe nicht veraendern.");

assert.throws(
    () => localizeProjectionGeometry(theoryRows, refinedRaster, []),
    /widersprechen/,
    "Die Schalengeometrie darf fehlende Blueprints nicht selbst rekonstruieren."
);

const localGeometry = localizeProjectionGeometry(theoryRows, refinedRaster, shellBlueprints);
assert.equal(localGeometry.contractVersion, P4_LOCAL_GEOMETRY_VERSION);
assert.ok(localGeometry.localizedContentCols instanceof Map);
assert.ok(localGeometry.localizedContentSpans instanceof Map);

assert.throws(
    () => buildProjectionBlocks(theoryRows),
    /benoetigen die fertige lokale Geometrie/,
    "Der Blockbau darf die lokale Geometrie nicht ueberspringen."
);

const projectionBlocks = buildProjectionBlocks(theoryRows, localGeometry);
assert.ok(
    projectionBlocks.flatMap((row) => row.shellBlocks).every(
        (block) => block.contractVersion === P4_PROJECTION_BLOCKS_VERSION
    )
);

assert.throws(
    () => writeProjectionRows(theoryRows, refinedRaster, null, projectionBlocks, "x"),
    /benoetigt die vollstaendige lokale Geometrie/,
    "Der Writer darf fehlende lokale Geometrie nicht durch Rasterwerte ersetzen."
);

const writtenRows = writeProjectionRows(
    theoryRows,
    refinedRaster,
    localGeometry,
    projectionBlocks,
    "x"
);
assert.ok(writtenRows.every((row) => row.contractVersion === P4_WRITTEN_PROJECTION_ROWS_VERSION));

const outputContract = buildOutputContract({
    request,
    targetVariable: "x",
    theoryRows,
    semanticRaster: refinedRaster,
    shellBlueprints: localGeometry.localizedShellBlueprints,
    projectionBlocks,
    writtenRows
});
assert.equal(outputContract.contractVersion, P4_OUTPUT_CONTRACT_VERSION);

console.log("GenesisRuntime-P4-Modulgrenzen erfolgreich geprueft.");
