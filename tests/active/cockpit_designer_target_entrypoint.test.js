import assert from "node:assert/strict";

import * as cockpitDesigner from "../../cockpit_designer/index.js";
import {
    RENDER_SETTINGS_CONTRACT_VERSION,
    buildRenderSettingsManifest
} from "../../contracts/render_settings/index.js";

assert.equal(typeof cockpitDesigner.buildDesignerCockpitManifest, "function");
assert.equal(
    cockpitDesigner.DESIGNER_COCKPIT_ENTRY.relativePathFromRepoRoot,
    "projects/complex_expression_rendering/prototypes/renderer-settings-demo.html"
);

assert.ok(cockpitDesigner.ROOT_CONTROL_DEFINITIONS.length > 0);
assert.ok(cockpitDesigner.FRACTION_CONTROL_DEFINITIONS.length > 0);
assert.ok(cockpitDesigner.EXPONENT_CONTROL_DEFINITIONS.length > 0);
assert.ok(cockpitDesigner.PARENTHESIS_CONTROL_DEFINITIONS.length > 0);
assert.ok(cockpitDesigner.DESIGNER_DIAGNOSTIC_PREVIEWS.length >= 2);

const manifest = cockpitDesigner.buildDesignerCockpitManifest();
assert.equal(manifest.renderScene.version, "2026-08-09");
assert.equal(manifest.renderSettings.version, RENDER_SETTINGS_CONTRACT_VERSION);
assert.equal(manifest.entry, cockpitDesigner.DESIGNER_COCKPIT_ENTRY);
assert.equal(manifest.controls.roots, cockpitDesigner.ROOT_CONTROL_DEFINITIONS);
assert.equal(manifest.controls.fractions, cockpitDesigner.FRACTION_CONTROL_DEFINITIONS);
assert.equal(manifest.controls.exponents, cockpitDesigner.EXPONENT_CONTROL_DEFINITIONS);
assert.equal(manifest.controls.parentheses, cockpitDesigner.PARENTHESIS_CONTROL_DEFINITIONS);

const renderSettingsManifest = buildRenderSettingsManifest();
assert.ok(renderSettingsManifest.definitions.length >= 10);

console.log("cockpit_designer Ziel-Fassade erfolgreich geprueft.");
