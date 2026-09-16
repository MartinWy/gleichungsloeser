import assert from "node:assert/strict";
import { Readable } from "node:stream";

import {
    RequestBodyTooLargeError,
    readJsonRequestBody,
    resolvePathWithinRoot
} from "../../scripts/cockpit_http_boundary/index.mjs";

const parsed = await readJsonRequestBody(Readable.from([Buffer.from('{"equation":"x=1"}')]));
assert.deepEqual(parsed, { equation: "x=1" });

await assert.rejects(
    readJsonRequestBody(Readable.from([Buffer.from('{"equation":"x=123456"}')]), 8),
    RequestBodyTooLargeError
);

assert.equal(
    resolvePathWithinRoot("/srv/cockpit", "projects/demo.html"),
    "/srv/cockpit/projects/demo.html"
);
assert.throws(
    () => resolvePathWithinRoot("/srv/cockpit", "../secret.txt"),
    /nicht erlaubt/
);
assert.throws(
    () => resolvePathWithinRoot("/srv/cockpit", "%2e%2e/secret.txt"),
    /nicht erlaubt/
);
assert.throws(
    () => resolvePathWithinRoot("/srv/cockpit", ".git/config"),
    /nicht erlaubt/
);

console.log("Cockpit-HTTP-Grenze erfolgreich geprueft.");
