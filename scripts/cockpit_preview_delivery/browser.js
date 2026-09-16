export function createPreviewObjectUrl(artifact, expectedMimeType) {
    if (!artifact || artifact.mimeType !== expectedMimeType || typeof artifact.base64 !== "string" || artifact.base64.length === 0) {
        throw new Error(`Ungueltiges Vorschauartefakt fuer ${expectedMimeType}.`);
    }

    const binary = globalThis.atob(artifact.base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const blob = new Blob([bytes], { type: expectedMimeType });

    return URL.createObjectURL(blob);
}

export function revokePreviewObjectUrl(objectUrl) {
    if (typeof objectUrl === "string" && objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
    }
}
