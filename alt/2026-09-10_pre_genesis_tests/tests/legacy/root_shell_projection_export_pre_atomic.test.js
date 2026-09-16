import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../components/Arbeitsblatt_Druckansicht/viewModel.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";
import {
    defaultColumnLayoutProfileName,
    withHorizontalLayoutScale
} from "../../presentation/column_layout/index.js";

const result = await GenesisCore.solve("a^2+b^2=c^2", {
    runtimeEngine: "genesis_runtime",
    targetVariable: "a"
});

assert.ok(!result?.fehler, result?.fehler || "GenesisRuntime darf fuer a^2+b^2=c^2 nach a keinen Fehler liefern.");

const viewModel = buildWorksheetViewModel(result);
const tex = buildLatexDocument({
    equation: result.eingabe || "a^2+b^2=c^2",
    targetVariable: result.targetVariable || "a",
    viewModel,
    profile: withHorizontalLayoutScale(defaultColumnLayoutProfileName, 1),
    profileLabel: defaultColumnLayoutProfileName
});

assert.match(
    tex,
    /\\pFourRoot\{\\makebox\[[0-9.]+em\]\[l\]\{(?:\\raisebox\{[^}]+\}\[[^\]]+\]\[[^\]]+\]\{)?\\rule\{0pt\}\{0pt\}\}?\}/,
    "Wenn P4 den Radikanden bereits als eigene Atome projiziert, darf die Wurzelschale nur noch ihre Geometrie tragen."
);
assert.doesNotMatch(
    tex,
    /\\pFourRoot\{[^\n]*c\^\{\\scriptstyle 2\}[^\n]*b\^\{\\scriptstyle 2\}[^\n]*\}/,
    "Bereits separat projizierte Wurzelatome duerfen innerhalb derselben Wurzelschale nicht ein zweites Mal serialisiert werden."
);
assert.match(
    tex,
    /\\node\[anchor=base, inner sep=0pt\] at \([0-9.]+,[0-9.]+\) \{\$c\^\{\\scriptstyle 2\}-b\^\{\\scriptstyle 2\}\$\};/,
    "Der Radikand muss in der Schlusszeile als eigene projizierte Spur neben der Wurzelscha­le sichtbar bleiben."
);
