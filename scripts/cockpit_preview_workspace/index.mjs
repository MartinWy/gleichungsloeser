import fs from "node:fs";
import path from "node:path";

export function createPreviewWorkspace(previewRoot) {
    const root = path.resolve(previewRoot);
    fs.mkdirSync(root, { recursive: true });

    const directory = fs.mkdtempSync(path.join(root, "render-"));
    const id = path.basename(directory);

    return Object.freeze({
        id,
        directory,
        texPath: path.resolve(directory, "current.tex"),
        pdfPath: path.resolve(directory, "current.pdf"),
        pngPrefix: path.resolve(directory, "current"),
        pngPath: path.resolve(directory, "current.png")
    });
}

export function pruneExpiredPreviewWorkspaces(
    previewRoot,
    { maxAgeMs = 60 * 60 * 1000, now = Date.now(), preserveIds = [] } = {}
) {
    const root = path.resolve(previewRoot);
    if (!fs.existsSync(root)) {
        return [];
    }

    const preserve = new Set(preserveIds);
    const removed = [];

    fs.readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name.startsWith("render-"))
        .forEach((entry) => {
            if (preserve.has(entry.name)) {
                return;
            }

            const directory = path.resolve(root, entry.name);
            const ageMs = now - fs.statSync(directory).mtimeMs;
            if (ageMs <= maxAgeMs) {
                return;
            }

            fs.rmSync(directory, { recursive: true, force: true });
            removed.push(entry.name);
        });

    return removed;
}
