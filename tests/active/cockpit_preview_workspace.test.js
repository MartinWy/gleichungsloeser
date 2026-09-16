import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
    createPreviewWorkspace,
    pruneExpiredPreviewWorkspaces
} from "../../scripts/cockpit_preview_workspace/index.mjs";

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cockpit-preview-workspace-test-"));

try {
    const first = createPreviewWorkspace(testRoot);
    const second = createPreviewWorkspace(testRoot);

    assert.notEqual(first.id, second.id);
    assert.notEqual(first.directory, second.directory);
    assert.equal(path.dirname(first.texPath), first.directory);
    assert.equal(path.basename(first.pdfPath), "current.pdf");
    assert.equal(path.basename(first.pngPath), "current.png");
    assert.ok(first.directory.startsWith(`${path.resolve(testRoot)}${path.sep}`));

    const removed = pruneExpiredPreviewWorkspaces(testRoot, {
        maxAgeMs: -1,
        preserveIds: [second.id]
    });

    assert.deepEqual(removed, [first.id]);
    assert.equal(fs.existsSync(first.directory), false);
    assert.equal(fs.existsSync(second.directory), true);
} finally {
    fs.rmSync(testRoot, { recursive: true, force: true });
}

console.log("Cockpit-Vorschau-Arbeitsraum erfolgreich geprueft.");
