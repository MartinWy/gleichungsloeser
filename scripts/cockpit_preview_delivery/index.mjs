import fs from "node:fs";

function readNonEmptyArtifact(filePath) {
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        throw new Error(`Vorschauartefakt fehlt: ${filePath || "<kein Pfad>"}`);
    }

    const bytes = fs.readFileSync(filePath);
    if (bytes.length === 0) {
        throw new Error(`Vorschauartefakt ist leer: ${filePath}`);
    }

    return bytes;
}

function buildArtifact(filePath, mimeType) {
    return Object.freeze({
        mimeType,
        base64: readNonEmptyArtifact(filePath).toString("base64")
    });
}

export function buildPreviewDeliveryArtifacts({ pngPath, pdfPath } = {}) {
    return Object.freeze({
        previewArtifact: buildArtifact(pngPath, "image/png"),
        pdfArtifact: buildArtifact(pdfPath, "application/pdf")
    });
}
