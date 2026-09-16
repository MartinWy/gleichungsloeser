import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

function extractFirstPage(latex = "") {
    return String(latex || "").split("\\newpage")[0] || "";
}

function extractNodes(firstPage = "") {
    return [...firstPage.matchAll(/\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => ({
            x: Number.parseFloat(match[1]),
            y: Number.parseFloat(match[2]),
            latex: match[3]
        }));
}

function isStandaloneAtom(node, atomLatex = "a") {
    return new RegExp(`^\\\\pFourCell\\{[^}]+\\}\\{${atomLatex}\\}$`).test(node?.latex || "");
}

const result = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "alpha"
});

assert.ok(!result?.fehler, result?.fehler || "Der Sinussatz nach alpha darf nicht fehlschlagen.");

const viewModel = buildWorksheetViewModel(result);
const firstPage = extractFirstPage(buildLatexDocument({
    equation: result.eingabe,
    targetVariable: result.targetVariable,
    viewModel,
    profile: "standard",
    profileLabel: "standard",
    shellColors: false,
    shellColorPolicy: null
}));

const nodes = extractNodes(firstPage);
const fractionLineNodes = nodes.filter((node) => node.latex.includes("\\hrule width"));
const numeratorNodes = nodes.filter((node) => {
    if (!isStandaloneAtom(node, "a") && !isStandaloneAtom(node, "b")) {
        return false;
    }

    return fractionLineNodes.some((line) => (
        (line.y - node.y) > 0
        && (line.y - node.y) < 1.4
    ));
});

assert.ok(
    fractionLineNodes.length >= 6,
    "Der Sinussatz nach alpha muss im PDF mehrere sichtbare Bruchbalken fuer die offenen Bruchschritte tragen."
);

assert.ok(
    numeratorNodes.length >= 6,
    "Der Sinussatz nach alpha muss die weitergereichten Einzelzaehler a und b im PDF explizit als eigene Atome setzen."
);

numeratorNodes.forEach((node) => {
    const nearestFractionBelow = fractionLineNodes
        .map((line) => ({
            line,
            deltaY: line.y - node.y,
            deltaX: Math.abs(line.x - node.x)
        }))
        .filter(({ deltaY }) => deltaY > 0 && deltaY < 1.4)
        .sort((left, right) => {
            if (left.deltaY !== right.deltaY) {
                return left.deltaY - right.deltaY;
            }

            return left.deltaX - right.deltaX;
        })[0];

    assert.ok(
        nearestFractionBelow,
        `Fuer den Zaehlerknoten ${node.latex} muss direkt darunter ein sichtbarer Bruchbalken liegen.`
    );

    assert.ok(
        Math.abs(nearestFractionBelow.line.x - node.x) < 0.02,
        `Der Zaehlerknoten ${node.latex} muss optisch mittig auf seinem Bruchbalken sitzen, statt an einer alten Slotposition haengen zu bleiben.`
    );
});

console.log("Freie Zaehler werden im PDF innerhalb ihrer Bruchbreite optisch mittig auf dem Bruchbalken zentriert.");
