import assert from "node:assert/strict";

import { resolveCockpitRuntimeEnvironment } from "../../scripts/cockpit_runtime_environment/index.mjs";

const local = resolveCockpitRuntimeEnvironment({});
assert.equal(local.host, "127.0.0.1");
assert.equal(local.port, 4173);

const hosted = resolveCockpitRuntimeEnvironment({
    HOST: "0.0.0.0",
    PORT: "10000",
    PDFLATEX_BINARY: "/tools/pdflatex",
    PDFTOPPM_BINARY: "/tools/pdftoppm"
});

assert.deepEqual(hosted, {
    host: "0.0.0.0",
    port: 10000,
    pdflatexBinary: "/tools/pdflatex",
    pdftoppmBinary: "/tools/pdftoppm"
});
assert.throws(
    () => resolveCockpitRuntimeEnvironment({ PORT: "not-a-port" }),
    /Ungueltiger Cockpit-Port/
);

console.log("Cockpit-Laufzeitumgebung erfolgreich geprueft.");
