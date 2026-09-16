import assert from "node:assert/strict";

import { runGenesisRuntime } from "../../core/GenesisRuntime/index.js";
import { resolveShellProjectionLayout } from "../../core/GenesisRuntime/P4_Projection/shellLayoutRules.js";

const genericLayout = resolveShellProjectionLayout({
    shellType: "ROOT",
    contentRange: {
        rawColStart: 7,
        rawColEnd: 13
    }
});
const genericHook = genericLayout.slots.find((slot) => slot.slotName === "root_hook");
const genericOverbar = genericLayout.slots.find((slot) => slot.slotName === "root_overbar");

assert.ok(genericHook && genericOverbar, "Eine Wurzel braucht Haken und Oberstrich als getrennte Primitive.");
assert.equal(
    genericHook.rawColEnd + 1,
    genericOverbar.rawColStart,
    "Der Oberstrich muss in der direkt auf den Haken folgenden Zelle beginnen."
);

const result = await runGenesisRuntime("u^2+v^2=w^2", {
    targetVariable: "u"
});

const rootRows = result.phases.projection.projectionRows.filter((row) => (
    row.shellSpans.some((shell) => shell.shellType === "ROOT")
));

assert.ok(rootRows.length > 0, "Der Lauf muss mindestens eine sichtbare Wurzel enthalten.");

for (const row of rootRows) {
    for (const root of row.shellSpans.filter((shell) => shell.shellType === "ROOT")) {
        const hook = row.projectionAtoms.find((atom) => (
            atom.shellId === root.shellId && atom.role === "root_hook"
        ));
        const overbar = row.projectionAtoms.find((atom) => (
            atom.shellId === root.shellId && atom.role === "root_overbar"
        ));
        const radicandAtoms = row.projectionAtoms.filter((atom) => (
            atom.kind === "content"
            && Array.isArray(atom.shellPath)
            && atom.shellPath.includes(root.shellId)
            && atom.regionRole !== "root_degree"
        ));

        assert.ok(hook && overbar, "Jede sichtbare Wurzel muss beide Primitive ausgeben.");
        assert.ok(radicandAtoms.length > 0, "Jede sichtbare Wurzel muss ihren atomaren Radikanden ausgeben.");
        assert.equal(
            hook.colEnd + 1,
            overbar.colStart,
            "Haken und Oberstrich duerfen keine funktionale Zelle gemeinsam belegen."
        );
        assert.equal(
            overbar.localRow,
            Math.min(...radicandAtoms.map((atom) => atom.localRow)) - 1,
            "Der Oberstrich muss eine eigene Teilzeile ueber der obersten Radikandzeile erhalten."
        );
    }
}

console.log("Wurzelhaken und Oberstrich besitzen disjunkte funktionale Zellen.");
