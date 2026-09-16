import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";
import { deriveRowTargets } from "../../scripts/cockpit_server.mjs";

function extractFirstPage(latex = "") {
    return String(latex || "").split("\\newpage")[0] || "";
}

function extractNodeLatex(firstPage = "") {
    return [...firstPage.matchAll(/\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => match[3]);
}

function extractNodeData(firstPage = "") {
    return [...firstPage.matchAll(/\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g)]
        .map((match) => ({
            x: Number.parseFloat(match[1]),
            y: Number.parseFloat(match[2]),
            latex: match[3]
        }));
}

function extractDelimiterExtents(latex = "") {
    const match = String(latex || "").match(
        /\\left[.(]\\raisebox\{0pt\}\[([0-9.]+)em\]\[([0-9.]+)em\]\{\\rule\{0pt\}\{0pt\}\}\\right[.)]/
    );

    if (!match) {
        return null;
    }

    return {
        axisAboveEm: Number.parseFloat(match[1]),
        axisBelowEm: Number.parseFloat(match[2])
    };
}

function extractMakeboxWidth(latex = "") {
    const match = String(latex || "").match(/\\makebox\[([0-9.]+)em\]\[c\]/);
    return match ? Number.parseFloat(match[1]) : null;
}

function extractLogFunctionLeftDelimiterExtents(firstPage = "") {
    const nodes = extractNodeData(firstPage)
        .slice()
        .sort((left, right) => {
            if (left.y !== right.y) {
                return left.y - right.y;
            }

            return left.x - right.x;
        });

    return nodes
        .filter((node) => node.latex.includes("\\log_{B}"))
        .map((logNode) => {
            const inlineExtents = extractDelimiterExtents(logNode.latex);
            if (inlineExtents) {
                return inlineExtents;
            }

            const delimiterNode = nodes.find((candidate) => (
                Math.abs(candidate.y - logNode.y) < 0.01
                && candidate.x > logNode.x
                && candidate.latex.includes("\\left(")
                && candidate.latex.includes("\\right.")
            ));

            return delimiterNode ? extractDelimiterExtents(delimiterNode.latex) : null;
        })
        .filter(Boolean);
}

const cases = [
    {
        equation: "y=a*2^x",
        expectedText: "lg((y) / (a))",
        expectedLatex: /\\lg/,
        forbiddenLatex: /\\log_\{2\}|\\ln\\left\(/
    },
    {
        equation: "y=a*e^x",
        expectedText: "ln((y) / (a))",
        expectedLatex: /\\ln/,
        forbiddenLatex: /\\log_\{e\}|\\lg\\left\(/
    },
    {
        equation: "y=a*10^x",
        expectedText: "log((y) / (a))",
        expectedLatex: /\\log/,
        forbiddenLatex: /\\log_\{10\}|\\ln\\left\(|\\lg\\left\(/
    },
    {
        equation: "y=a*B^x",
        expectedText: "log_B((y) / (a))",
        expectedLatex: /\\log_\{B\}/,
        forbiddenLatex: /\\ln\\left\(|\\lg\\left\(/
    }
];

for (const testCase of cases) {
    const result = await GenesisCore.solve(testCase.equation, {
        runtimeEngine: "genesis_runtime",
        targetVariable: "x"
    });

    assert.ok(!result?.fehler, result?.fehler || `${testCase.equation} darf beim Exponentenabbau nicht fehlschlagen.`);

    const viewModel = buildWorksheetViewModel(result);
    const rowTargets = deriveRowTargets(viewModel, [], result?.exportData?.outputContract?.theoryRows || []);
    const finalText = rowTargets.at(-1)?.atoms?.[0] || "";

    assert.equal(
        finalText,
        testCase.expectedText,
        `Die Cockpit-Zeile fuer ${testCase.equation} muss die gewuenschte Logarithmusnotation tragen.`
    );

    const firstPage = extractFirstPage(buildLatexDocument({
        equation: result.eingabe || testCase.equation,
        targetVariable: result.targetVariable || "x",
        viewModel,
        showDocumentHeader: false,
        includeDiagnosticPage: false
    }));

    assert.match(
        firstPage,
        testCase.expectedLatex,
        `Der LaTeX-Export fuer ${testCase.equation} muss die gewuenschte Logarithmusnotation tragen.`
    );
    assert.doesNotMatch(
        firstPage,
        testCase.forbiddenLatex,
        `Der LaTeX-Export fuer ${testCase.equation} darf keine unerwuenschte Logarithmusnotation zeigen.`
    );
}

const complexExponentResult = await GenesisCore.solve("y=a*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(
    !complexExponentResult?.fehler,
    complexExponentResult?.fehler || "Der komplexe Exponent darf beim Schlussbruch nach x nicht fehlschlagen."
);

const complexExponentViewModel = buildWorksheetViewModel(complexExponentResult);
const complexExponentFirstPage = extractFirstPage(buildLatexDocument({
    equation: complexExponentResult.eingabe || "y=a*B^(2x-1)",
    targetVariable: complexExponentResult.targetVariable || "x",
    viewModel: complexExponentViewModel,
    showDocumentHeader: false,
    includeDiagnosticPage: false
}));
const complexExponentNodeLatex = extractNodeLatex(complexExponentFirstPage);
const complexExponentFinalStep = complexExponentViewModel.steps.at(-1);

assert.ok(
    complexExponentFirstPage.includes("\\log_{B}"),
    "Im Schlussbruch eines komplexen Exponenten muss der Logarithmus als explizite B-Schale erhalten bleiben."
);
assert.ok(
    complexExponentNodeLatex.some((latex) => latex.includes("\\pFourFraction{")),
    "Passive innere Brueche wie y/a duerfen im Renderer als geschlossene Bruchschale erhalten bleiben."
);
assert.ok(
    complexExponentNodeLatex.filter((latex) => latex.includes("\\vcenter{\\hrule")).length >= 2,
    "Beim komplexen Exponenten muessen die sichtbaren Bruchstriche als eigene Knoten erhalten bleiben."
);
const complexFinalOneCell = complexExponentFinalStep.cells.find((cell) => (
    cell.text === "1"
    && cell.rowKind === "above_axis"
    && cell.sourceShellNodeType === "ADDITION"
));
const complexFinalPlusCell = complexExponentFinalStep.cells.find((cell) => (
    cell.text === "+"
    && cell.rowKind === "above_axis"
    && cell.projectionRole === "inverse_operator"
));
const complexFinalLogCell = complexExponentFinalStep.cells.find((cell) => (
    cell.text === "log"
    && cell.rowKind === "above_axis"
    && cell.projectionRole === "function_name"
));

assert.ok(
    complexFinalOneCell && complexFinalPlusCell && complexFinalLogCell
        && complexFinalOneCell.col < complexFinalPlusCell.col
        && complexFinalPlusCell.col < complexFinalLogCell.col,
    "Der Schlusszaehler muss den von rechts kommenden Additionsterm links vorne tragen: 1 + log_B(...)."
);
assert.ok(
    complexExponentFirstPage.includes("\\pFourCell{0.88}{2}"),
    "Der letzte Schritt fuer komplexe Exponenten muss die Division durch 2 weiterhin im Nenner tragen."
);

const groupedComplexExponentResult = await GenesisCore.solve("y-2=(a+2)*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(
    !groupedComplexExponentResult?.fehler,
    groupedComplexExponentResult?.fehler || "Auch komplexe Logarithmusargumente duerfen im Schlussbruch nicht kaputtgerendert werden."
);

const groupedComplexExponentViewModel = buildWorksheetViewModel(groupedComplexExponentResult);
const groupedComplexExponentFirstPage = extractFirstPage(buildLatexDocument({
    equation: groupedComplexExponentResult.eingabe || "y-2=(a+2)*B^(2x-1)",
    targetVariable: groupedComplexExponentResult.targetVariable || "x",
    viewModel: groupedComplexExponentViewModel,
    showDocumentHeader: false,
    includeDiagnosticPage: false
}));
const groupedComplexNodeLatex = extractNodeLatex(groupedComplexExponentFirstPage);

assert.ok(
    groupedComplexNodeLatex.some((latex) => latex.includes("\\log_{B}")),
    "Der Schlussschritt fuer komplexe Logarithmusargumente muss weiterhin den Logarithmus tragen."
);
assert.ok(
    groupedComplexNodeLatex.some((latex) => latex.includes("\\pFourFraction{")),
    "Auch bei komplexen Logarithmusargumenten duerfen passive innere Brueche als geschlossene Schalen gerendert bleiben."
);
assert.ok(
    groupedComplexNodeLatex.filter((latex) => latex.includes("\\vcenter{\\hrule")).length >= 2,
    "Auch komplexe Logarithmusargumente muessen ihre sichtbaren Bruchstriche als eigene Knoten behalten."
);
assert.ok(
    groupedComplexNodeLatex.some((latex) => latex.includes("{y}"))
    && groupedComplexNodeLatex.some((latex) => latex.includes("{a}")),
    "Im Schlussbild muessen innerer Zaehler und innerer Nenner weiterhin als eigene Zellen sichtbar bleiben."
);

const mirroredGroupedComplexExponentResult = await GenesisCore.solve("2-a=(1-b)*B^(2x-1)", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "x"
});

assert.ok(
    !mirroredGroupedComplexExponentResult?.fehler,
    mirroredGroupedComplexExponentResult?.fehler || "Auch spiegelverkehrte komplexe Logarithmusargumente duerfen nicht an Shell-Grenzen zerfallen."
);

const mirroredGroupedComplexExponentFirstPage = extractFirstPage(buildLatexDocument({
    equation: mirroredGroupedComplexExponentResult.eingabe || "2-a=(1-b)*B^(2x-1)",
    targetVariable: mirroredGroupedComplexExponentResult.targetVariable || "x",
    viewModel: buildWorksheetViewModel(mirroredGroupedComplexExponentResult),
    showDocumentHeader: false,
    includeDiagnosticPage: false
}));
const mirroredGroupedComplexExponentViewModel = buildWorksheetViewModel(mirroredGroupedComplexExponentResult);
const mirroredFinalStep = mirroredGroupedComplexExponentViewModel.steps.at(-1);
const mirroredNodeData = extractNodeData(mirroredGroupedComplexExponentFirstPage);

assert.match(
    mirroredGroupedComplexExponentFirstPage,
    /\\left\(\\raisebox\{0pt\}\[0\.52em\]\[0\.32em\]\{\\rule\{0pt\}\{0pt\}\}\\right\./,
    "Gruppenklammern duerfen nur noch die Hoehe ihres eigenen Gruppeninhalts tragen."
);
assert.doesNotMatch(
    mirroredGroupedComplexExponentFirstPage,
    /\\left\(\\raisebox\{0pt\}\[2\.72em\]\[[0-9.]+em\]\{\\rule\{0pt\}\{0pt\}\}\\right\./,
    "Eine Gruppenklammer darf die Hoehe des uebergeordneten Bruchs nicht mehr ueber Spaltennaehe erben."
);

const mirroredOuterFractionLine = mirroredNodeData
    .filter((node) => node.latex.includes("\\vcenter{\\hrule"))
    .sort((left, right) => {
        const widthDelta = (extractMakeboxWidth(right.latex) || 0) - (extractMakeboxWidth(left.latex) || 0);
        if (widthDelta !== 0) {
            return widthDelta;
        }

        return right.y - left.y;
    })[0];
const mirroredFinalDenominatorTwo = mirroredNodeData
    .filter((node) => node.latex.includes("{2}"))
    .sort((left, right) => right.y - left.y)[0];
const mirroredFinalStepFractionLine = mirroredFinalStep?.cells.find((cell) => cell.kind === "fraction_line" && cell.rowKind === "axis");
const mirroredFinalStepDenominatorTwo = mirroredFinalStep?.cells.find((cell) => cell.text === "2" && cell.rowKind === "below_axis");

assert.ok(
    mirroredOuterFractionLine,
    "Der gespiegelt komplexe Exponent muss den aeusseren Bruchstrich weiterhin als eigenen sichtbaren Knoten ausgeben."
);
assert.ok(
    mirroredFinalDenominatorTwo,
    "Die Nenner-2 des aeusseren Schlussbruchs muss als eigene Zelle sichtbar bleiben."
);
assert.ok(
    mirroredFinalStepFractionLine && mirroredFinalStepDenominatorTwo,
    "Der gespiegelt komplexe Exponent muss im letzten Schritt Bruchlinie und Nennerzelle explizit im Grid tragen."
);
assert.ok(
    mirroredFinalStepDenominatorTwo.colStart * 2 === (mirroredFinalStepFractionLine.colStart + mirroredFinalStepFractionLine.colEnd),
    "Die Nenner-2 des aeusseren Schlussbruchs muss im Grid am zentralen Slot des Bruchs bleiben."
);

const mirroredLogFunctionDelimiterExtents = extractLogFunctionLeftDelimiterExtents(
    mirroredGroupedComplexExponentFirstPage
);

assert.ok(
    mirroredLogFunctionDelimiterExtents.length >= 2,
    "Die gespiegelt komplexe Exponentenkette muss die explizit weitergereichte log-Klammer in mehreren Folgeschritten sichtbar tragen."
);

const firstMirroredLogFunctionDelimiterExtents = mirroredLogFunctionDelimiterExtents[0];
mirroredLogFunctionDelimiterExtents.forEach((extents, index) => {
    assert.deepEqual(
        extents,
        firstMirroredLogFunctionDelimiterExtents,
        `Dieselbe log-Schale darf ihre Klammerhoehe beim Weiterreichen nicht neu berechnen (Folgeschritt ${index + 1}).`
    );
});

console.log("Logarithmusnotation fuer Basis 2, e, 10 und freie Basen erfolgreich geprueft.");
