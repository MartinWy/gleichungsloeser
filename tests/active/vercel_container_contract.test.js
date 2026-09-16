import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "../..");

const vercelConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8")
);

assert.equal(vercelConfig.$schema, "https://openapi.vercel.sh/vercel.json");
assert.deepEqual(vercelConfig.services, {
    api: {
        root: ".",
        entrypoint: "Dockerfile.vercel",
        runtime: "container"
    }
});
assert.deepEqual(vercelConfig.rewrites, [
    {
        source: "/(.*)",
        destination: { service: "api" }
    }
]);

const dockerfile = fs.readFileSync(path.join(projectRoot, "Dockerfile.vercel"), "utf8");
assert.match(dockerfile, /^ENV HOST=0\.0\.0\.0$/m);
assert.match(dockerfile, /^CMD \["npm", "start"\]$/m);

const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
);
assert.equal(packageJson.scripts.start, "node scripts/cockpit_server.mjs");

const gitignoreLines = fs.readFileSync(path.join(projectRoot, ".gitignore"), "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim());
assert.ok(gitignoreLines.includes(".vercel"));
assert.ok(gitignoreLines.includes(".env*"));

console.log("Vercel-Containervertrag erfolgreich geprueft.");
