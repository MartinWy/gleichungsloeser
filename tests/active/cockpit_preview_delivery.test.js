import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildPreviewDeliveryArtifacts } from "../../scripts/cockpit_preview_delivery/index.mjs";
import {
    createPreviewObjectUrl,
    revokePreviewObjectUrl
} from "../../scripts/cockpit_preview_delivery/browser.js";

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "cockpit-preview-delivery-test-"));

try {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]);
    const pdfBytes = Buffer.from("%PDF-1.4\npreview\n", "utf8");
    const pngPath = path.join(testRoot, "current.png");
    const pdfPath = path.join(testRoot, "current.pdf");

    fs.writeFileSync(pngPath, pngBytes);
    fs.writeFileSync(pdfPath, pdfBytes);

    const delivery = buildPreviewDeliveryArtifacts({ pngPath, pdfPath });

    assert.deepEqual(delivery, {
        previewArtifact: {
            mimeType: "image/png",
            base64: pngBytes.toString("base64")
        },
        pdfArtifact: {
            mimeType: "application/pdf",
            base64: pdfBytes.toString("base64")
        }
    });

    const previewObjectUrl = createPreviewObjectUrl(delivery.previewArtifact, "image/png");
    const deliveredPreview = Buffer.from(await (await fetch(previewObjectUrl)).arrayBuffer());
    assert.deepEqual(deliveredPreview, pngBytes);
    revokePreviewObjectUrl(previewObjectUrl);

    const pdfObjectUrl = createPreviewObjectUrl(delivery.pdfArtifact, "application/pdf");
    const deliveredPdf = Buffer.from(await (await fetch(pdfObjectUrl)).arrayBuffer());
    assert.deepEqual(deliveredPdf, pdfBytes);
    revokePreviewObjectUrl(pdfObjectUrl);

    assert.throws(
        () => createPreviewObjectUrl(delivery.pdfArtifact, "image/png"),
        /Ungueltiges Vorschauartefakt/
    );
    assert.throws(
        () => buildPreviewDeliveryArtifacts({
            pngPath: path.join(testRoot, "missing.png"),
            pdfPath
        }),
        /Vorschauartefakt fehlt/
    );

    const emptyPdfPath = path.join(testRoot, "empty.pdf");
    fs.writeFileSync(emptyPdfPath, Buffer.alloc(0));
    assert.throws(
        () => buildPreviewDeliveryArtifacts({ pngPath, pdfPath: emptyPdfPath }),
        /Vorschauartefakt ist leer/
    );
} finally {
    fs.rmSync(testRoot, { recursive: true, force: true });
}

console.log("Zustandslose Cockpit-Vorschauauslieferung erfolgreich geprueft.");
