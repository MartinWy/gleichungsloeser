import path from "node:path";

export const DEFAULT_MAX_JSON_BODY_BYTES = 64 * 1024;

export class RequestBodyTooLargeError extends Error {
    constructor(maxBytes) {
        super(`Der Request-Body darf hoechstens ${maxBytes} Bytes gross sein.`);
        this.name = "RequestBodyTooLargeError";
        this.statusCode = 413;
    }
}

export function readJsonRequestBody(request, maxBytes = DEFAULT_MAX_JSON_BODY_BYTES) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let byteLength = 0;
        let settled = false;

        request.on("data", (chunk) => {
            if (settled) {
                return;
            }

            byteLength += chunk.length;
            if (byteLength > maxBytes) {
                settled = true;
                chunks.length = 0;
                reject(new RequestBodyTooLargeError(maxBytes));
                return;
            }

            chunks.push(chunk);
        });

        request.on("end", () => {
            if (settled) {
                return;
            }

            settled = true;
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (error) {
                reject(error);
            }
        });

        request.on("error", (error) => {
            if (!settled) {
                settled = true;
                reject(error);
            }
        });
    });
}

export function resolvePathWithinRoot(rootPath, rawRelativePath) {
    const root = path.resolve(rootPath);
    const decoded = decodeURIComponent(String(rawRelativePath || ""));
    const segments = decoded.split(/[\\/]+/).filter(Boolean);

    if (decoded.includes("\0") || segments.some((segment) => segment.startsWith("."))) {
        throw new Error("Der angeforderte Pfad ist nicht erlaubt.");
    }

    const candidate = path.resolve(root, ...segments);
    const rootPrefix = `${root}${path.sep}`;

    if (candidate !== root && !candidate.startsWith(rootPrefix)) {
        throw new Error("Der angeforderte Pfad verlaesst den erlaubten Wurzelordner.");
    }

    return candidate;
}
