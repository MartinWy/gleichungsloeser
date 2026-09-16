import assert from "node:assert/strict";

import * as cockpitUser from "../../cockpit_user/index.js";
import {
    WORKSHEET_PROFILE_CONTRACT_VERSION,
    buildWorksheetProfileManifest
} from "../../contracts/worksheet_profile/index.js";

assert.equal(cockpitUser.WORKSHEET_PROFILE_CONTRACT_VERSION, WORKSHEET_PROFILE_CONTRACT_VERSION);
assert.equal(cockpitUser.USER_COCKPIT_ENTRY.serverOrigin, "http://127.0.0.1:4173");
assert.equal(cockpitUser.USER_COCKPIT_ENTRY.script, "cockpit.js");

assert.ok(cockpitUser.USER_WORKSHEET_CONTROL_DEFINITIONS.some((definition) => definition.key === "powerInverseStyle"));
assert.ok(cockpitUser.USER_VISIBILITY_CONTROL_DEFINITIONS[0].preserveLayoutGap);
assert.ok(cockpitUser.USER_COLOR_PALETTE.some((entry) => entry.key === "orange"));
assert.ok(cockpitUser.USER_EXPORT_CONTROL_DEFINITIONS.some((definition) => definition.key === "pdfLink"));

const worksheetManifest = buildWorksheetProfileManifest();
assert.equal(worksheetManifest.version, WORKSHEET_PROFILE_CONTRACT_VERSION);
assert.ok(worksheetManifest.invariants.some((line) => line.includes("Ausgeblendete Zeilen")));

const manifest = cockpitUser.buildUserCockpitManifest();
assert.equal(manifest.entry, cockpitUser.USER_COCKPIT_ENTRY);
assert.equal(manifest.renderScene.version, "2026-08-09");
assert.equal(manifest.worksheetProfile.version, WORKSHEET_PROFILE_CONTRACT_VERSION);
assert.ok(manifest.controls.visibility.some((definition) => definition.key === "hiddenStepIndexes"));
assert.ok(manifest.invariants.some((line) => line.includes("Argument nicht automatisch")));

console.log("cockpit_user Ziel-Fassade erfolgreich geprueft.");
