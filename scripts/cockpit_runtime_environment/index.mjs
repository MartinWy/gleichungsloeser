import fs from "node:fs";

const DEFAULT_PORT = 4173;

function resolvePort(rawPort) {
    const port = Number(rawPort || DEFAULT_PORT);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Ungueltiger Cockpit-Port: ${rawPort}`);
    }

    return port;
}

function resolveBinary(env, envKey, knownPaths, commandName) {
    const override = String(env?.[envKey] || "").trim();
    if (override) {
        return override;
    }

    return knownPaths.find((candidate) => fs.existsSync(candidate)) || commandName;
}

export function resolveCockpitRuntimeEnvironment(env = process.env) {
    return Object.freeze({
        host: String(env?.HOST || "127.0.0.1").trim() || "127.0.0.1",
        port: resolvePort(env?.PORT),
        pdflatexBinary: resolveBinary(
            env,
            "PDFLATEX_BINARY",
            ["/Library/TeX/texbin/pdflatex"],
            "pdflatex"
        ),
        pdftoppmBinary: resolveBinary(
            env,
            "PDFTOPPM_BINARY",
            [
                "/opt/homebrew/bin/pdftoppm",
                "/usr/local/bin/pdftoppm"
            ],
            "pdftoppm"
        )
    });
}
