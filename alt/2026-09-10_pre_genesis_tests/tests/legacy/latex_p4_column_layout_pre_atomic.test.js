import assert from "node:assert/strict";

import GenesisCore from "../../core/index.js";
import { buildWorksheetViewModel } from "../../presentation/adapters/index.js";
import {
  getDefaultAtomWidth,
  listAtomWidthEntries
} from "../../presentation/column_layout/index.js";
import {
  cloneColumnLayoutProfile,
  defaultColumnLayoutProfileName,
  getColumnLayoutProfile,
  listColumnLayoutProfiles,
  resolveHorizontalLayoutScale,
  withHorizontalLayoutScale
} from "../../presentation/column_layout/index.js";
import {
  buildNodeColumnWidths,
  resolveAtomicTextWidthEm,
  resolveInlineNodeGapEm,
  resolveIntraTextGapEm,
  resolveSemanticBoundaryGapEm
} from "../../presentation/column_layout/index.js";
import {
  resolveCellSemanticBounds
} from "../../presentation/column_layout/index.js";
import {
  buildColumnLayout
} from "../../presentation/column_layout/index.js";
import {
  buildDisplayColumnLayout
} from "../../presentation/column_layout/index.js";
import {
  buildColumnTopology
} from "../../presentation/column_layout/index.js";
import { buildLatexDocument } from "../../scripts/export_projection_pdf_core/index.js";

assert.equal(defaultColumnLayoutProfileName, "standard");
assert.equal(getDefaultAtomWidth("5"), 0.88);
assert.equal(getDefaultAtomWidth("+"), 0.78);
assert.equal(getDefaultAtomWidth("x"), 0.9);
assert.ok(
  listAtomWidthEntries().length >= 70,
  "Der Atomkatalog soll eine explizite Liste der aktuell bekannten Atombreiten liefern."
);
assert.deepEqual(
  listColumnLayoutProfiles(),
  ["standard", "kompakt", "lesefreundlich"],
  "Die Profilschicht soll eine feste Liste benannter Spaltenprofile bereitstellen."
);
assert.equal(
  resolveHorizontalLayoutScale(getColumnLayoutProfile("standard")),
  1,
  "Ohne explizite Vorgabe soll das Layoutprofil mit der neutralen Horizontal-Skalierung starten."
);
assert.ok(
  getColumnLayoutProfile("lesefreundlich").displaySlotEm.rootLead > getColumnLayoutProfile("kompakt").displaySlotEm.rootLead,
  "Lesefreundliche Profile sollen groessere sichtbare Wurzel-Vorspalten tragen koennen als kompakte Profile."
);
assert.ok(
  getColumnLayoutProfile("lesefreundlich").fractionDisplayEm.numeratorGapEm
    > getColumnLayoutProfile("kompakt").fractionDisplayEm.numeratorGapEm,
  "Lesefreundliche Profile sollen dem Zaehler sichtbar mehr Luft zum Bruchstrich geben als kompakte Profile."
);
assert.ok(
  getColumnLayoutProfile("lesefreundlich").fractionDisplayEm.denominatorGapEm
    > getColumnLayoutProfile("kompakt").fractionDisplayEm.denominatorGapEm,
  "Lesefreundliche Profile sollen dem Nenner sichtbar mehr Luft zum Bruchstrich geben als kompakte Profile."
);
assert.ok(
  getColumnLayoutProfile("standard").fractionDisplayEm.denominatorGapEm
    > getColumnLayoutProfile("standard").fractionDisplayEm.numeratorGapEm,
  "Schon das Standardprofil soll dem Nenner etwas mehr Luft zum Bruchstrich geben als dem Zaehler."
);
assert.ok(
  getColumnLayoutProfile("lesefreundlich").fractionDisplayEm.denominatorGapEm
    > getColumnLayoutProfile("lesefreundlich").fractionDisplayEm.numeratorGapEm,
  "Auch im lesefreundlichen Profil soll der Nenner systematisch etwas mehr Luft zum Bruchstrich erhalten."
);

const simpleResult = await GenesisCore.solve("2*x=5", { targetVariable: "x" });
assert.equal(simpleResult.fehler, undefined);
const simpleViewModel = buildWorksheetViewModel(simpleResult);
const simpleDefaultLayout = buildColumnLayout(simpleViewModel);
const widenedFiveProfile = cloneColumnLayoutProfile();
const fiveColumn = simpleViewModel.steps[0].cells.find((cell) => cell.text === "5")?.col;
const anchorColumn = simpleViewModel.steps[0].cells.find((cell) => cell.text === "=")?.col;
const zeroAnchorPaddingProfile = cloneColumnLayoutProfile();

assert.notEqual(fiveColumn, undefined, "Die Testgleichung muss eine sichtbare 5-Spalte enthalten.");
assert.notEqual(anchorColumn, undefined, "Die Testgleichung muss eine sichtbare Gleichheitsspalte enthalten.");
widenedFiveProfile.atomMinWidthEm.explicit["5"] = 1.28;
zeroAnchorPaddingProfile.atomMinWidthEm.byKind.anchor.leftPaddingEm = 0;
zeroAnchorPaddingProfile.atomMinWidthEm.byKind.anchor.rightPaddingEm = 0;
assert.equal(
  resolveAtomicTextWidthEm("5", "number", widenedFiveProfile),
  1.28,
  "Das Atommodul muss Profil-Overrides fuer einzelne Zeichen direkt uebernehmen."
);
assert.ok(
  resolveAtomicTextWidthEm("=", "anchor") > getDefaultAtomWidth("="),
  "Die Gleichheitsspalte soll ueber die reine Zeichenbreite hinaus eigene Seitenluft tragen."
);

const spacingProfile = cloneColumnLayoutProfile();
spacingProfile.spacingEm.intraText.byKind.number = 0.12;
spacingProfile.spacingEm.betweenNodes.byNodeRolePair["number|operator"] = 0.2;
spacingProfile.spacingEm.betweenNodes.byNodeRolePair["operator|number"] = 0.18;
spacingProfile.spacingEm.betweenNodes.byNodeRolePair["fraction|anchor"] = 0.34;

assert.equal(
  resolveIntraTextGapEm("12", "number", spacingProfile),
  0.12,
  "Mehrstellige Zahlen sollen ueber ein eigenes sichtbares Binnen-Spacing verfuegen koennen."
);
assert.equal(
  resolveInlineNodeGapEm(
    { type: "text", kind: "number", text: "12" },
    { type: "text", kind: "operator", text: "+" },
    spacingProfile
  ),
  0.2,
  "Die Nachbarschaft zwischen Zahl und Operator soll ueber das Spacing-Profil explizit steuerbar sein."
);
assert.equal(
  resolveInlineNodeGapEm(
    { type: "fraction" },
    { type: "text", kind: "anchor", text: "=" },
    spacingProfile
  ),
  0.34,
  "Auch nichtatomare Renderknoten wie Brueche sollen vor Ankern einen eigenen sichtbaren Nachbarabstand bekommen koennen."
);
assert.ok(
  resolveAtomicTextWidthEm("12", "number", spacingProfile) > resolveAtomicTextWidthEm("12", "number"),
  "Ein mehrstelliges Atom soll durch sichtbares Binnen-Spacing physisch breiter werden koennen."
);

const inlineSequenceNode = {
  type: "sequence",
  items: [
    { type: "text", kind: "number", text: "12" },
    { type: "text", kind: "operator", text: "+" },
    { type: "text", kind: "number", text: "11" }
  ]
};
const defaultInlineSequenceWidth = buildNodeColumnWidths(inlineSequenceNode)
  .reduce((sum, value) => sum + value, 0);
const customInlineSequenceWidth = buildNodeColumnWidths(inlineSequenceNode, null, spacingProfile)
  .reduce((sum, value) => sum + value, 0);

assert.ok(
  customInlineSequenceWidth > defaultInlineSequenceWidth,
  "Eine Folge wie '12 + 11' soll durch konfigurierbare Zeichen- und Nachbarabstaende sichtbar verbreitert werden koennen."
);

const simpleWidenedLayout = buildColumnLayout(simpleViewModel, widenedFiveProfile);
const simpleZeroAnchorPaddingLayout = buildColumnLayout(simpleViewModel, zeroAnchorPaddingProfile);
const simpleTripleScaleProfile = withHorizontalLayoutScale("standard", 3);
const simpleTripleLayout = buildColumnLayout(simpleViewModel, simpleTripleScaleProfile);
const simpleTripleDisplayLayout = buildDisplayColumnLayout(simpleViewModel, simpleTripleScaleProfile);
const simpleDefaultDisplayLayout = buildDisplayColumnLayout(simpleViewModel);
assert.ok(
  simpleWidenedLayout.widths[fiveColumn] > simpleDefaultLayout.widths[fiveColumn],
  "Eine atomare Override-Breite fuer '5' muss die globale Breite der betroffenen P4-Spalte vergroessern."
);
assert.ok(
  simpleDefaultLayout.widths[anchorColumn] > simpleZeroAnchorPaddingLayout.widths[anchorColumn],
  "Die Gleichheitsspalte muss ueber explizite linke und rechte Seitenluft verbreitert werden koennen."
);
assert.ok(
  buildColumnLayout(simpleViewModel, "lesefreundlich").totalWidth > buildColumnLayout(simpleViewModel, "kompakt").totalWidth,
  "Die globale Breitenkomponente soll benannte Profile direkt akzeptieren."
);
assert.ok(
  Math.abs(simpleTripleLayout.totalWidth - (simpleDefaultLayout.totalWidth * 3)) < 1e-9,
  "Eine generische horizontale Profil-Skalierung soll die gesamte semantische Spaltenbreite proportional vergroessern."
);
assert.ok(
  Math.abs(simpleTripleDisplayLayout.totalWidth - (simpleDefaultDisplayLayout.totalWidth * 3)) < 1e-9,
  "Dieselbe horizontale Profil-Skalierung soll auch alle sichtbaren Display-Slots proportional vergroessern."
);

const rootResult = await GenesisCore.solve("2*sqrt(x+3)=5", { targetVariable: "x" });
assert.equal(rootResult.fehler, undefined);
const rootViewModel = buildWorksheetViewModel(rootResult);
const rootDefaultLayout = buildColumnLayout(rootViewModel);
const rootDefaultDisplayLayout = buildDisplayColumnLayout(rootViewModel);
const rootNoLeadProfile = cloneColumnLayoutProfile();
const rootCell = rootViewModel.steps[0].cells.find((cell) => cell.renderNode?.type === "root");

assert.ok(rootCell, "Die Ausgangszeile muss eine sichtbare Wurzelschale tragen.");
rootNoLeadProfile.displaySlotEm.rootLead = 0;
assert.equal(
  buildNodeColumnWidths(rootCell.renderNode, rootCell.colEnd - rootCell.colStart + 1).length,
  rootCell.colEnd - rootCell.colStart + 1,
  "Das Atommodul muss sichtbare Schalen auf die vorgegebenen P4-Teilspalten aufteilen koennen."
);

const rootNoLeadLayout = buildColumnLayout(rootViewModel, rootNoLeadProfile);
const rootNoLeadDisplayLayout = buildDisplayColumnLayout(rootViewModel, rootNoLeadProfile);
assert.ok(
  Number.isInteger(rootDefaultDisplayLayout.rootLeadSlotIndexBySemanticCol[rootCell.colStart]),
  "Sichtbare Wurzeln sollen vor ihrer ersten Inhaltsspalte einen eigenen Display-Slot reservieren."
);
assert.ok(
  rootDefaultDisplayLayout.totalWidth > rootNoLeadDisplayLayout.totalWidth,
  "Ein sichtbarer Wurzelhaken vor der ersten Inhaltsspalte muss die physische Displaybreite vergroessern."
);
assert.deepEqual(
  rootDefaultLayout.widths,
  rootNoLeadLayout.widths,
  "Die semantischen Inhaltsspalten sollen von einem reinen Display-Slot fuer den Wurzelhaken unberuehrt bleiben."
);

const inverseRootLatexResult = await GenesisCore.solve("a^2+b^2=c^2", {
  targetVariable: "a",
  runtimeEngine: "genesis_runtime"
});
assert.equal(inverseRootLatexResult.fehler, undefined);
const inverseRootLatexViewModel = buildWorksheetViewModel(inverseRootLatexResult);
const inverseRootLatexDocument = buildLatexDocument({
  equation: "a^2+b^2=c^2",
  targetVariable: "a",
  viewModel: inverseRootLatexViewModel,
  showDocumentHeader: false,
  includeDiagnosticPage: false
});
assert.ok(
  inverseRootLatexDocument.includes(String.raw`\pFourRoot{`),
  "Wenn eine sichtbare Wurzel ueber mehrere Projektionsrollen verteilt ist, darf in der LaTeX-Ausgabe nur der fuehrende Shell-Traeger rendern."
);
assert.match(
  inverseRootLatexDocument,
  /\\pFourRoot\{[\s\S]*c\^\{\\scriptstyle 2\}[\s\S]*b\^\{\\scriptstyle 2\}/,
  "Die fuehrende Genesis-Wurzel muss den echten Radikandeninhalt tragen und darf nicht nur eine leere Shell-Spur sein."
);
assert.equal(
  inverseRootLatexDocument.includes(String.raw`\pFourRoot{\pFourCell{0}{}`),
  false,
  "Eine projizierte Wurzel darf im Export nicht als leere Fuehrungsspur mit nachgereichten Einzelatomen landen."
);

const complexResult = await GenesisCore.solve("2*sqrt((x+3)/(2+1))=5", { targetVariable: "x" });
assert.equal(complexResult.fehler, undefined);
const complexViewModel = buildWorksheetViewModel(complexResult);
const complexDefaultLayout = buildColumnLayout(complexViewModel);
const complexDisplayLayout = buildDisplayColumnLayout(complexViewModel);
const noImplicitBlockGapProfile = cloneColumnLayoutProfile();
const implicitProductStep = complexViewModel.steps.find((step) => (
  step.cells.some((cell) => cell.projectionRole === "product_content")
  && step.cells.some((cell) => cell.projectionRole === "product_factor")
  && !step.cells.some((cell) => cell.projectionRole === "product_operator")
));

assert.ok(implicitProductStep, "Der komplexe Fall muss eine implizite Produktgrenze ohne sichtbare Operatorspalte enthalten.");
noImplicitBlockGapProfile.semanticBoundaryGapEm.byRolePair["product_content|product_factor"] = 0;

const complexNoImplicitGapLayout = buildColumnLayout(complexViewModel, noImplicitBlockGapProfile);
const productContentCell = implicitProductStep.cells.find((cell) => cell.projectionRole === "product_content");
const productFactorCell = implicitProductStep.cells.find((cell) => cell.projectionRole === "product_factor");
const wrappedPowerCell = complexViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.renderNode?.type === "power" && cell.renderNode?.base?.type === "fraction");
const groupedFactorCell = complexViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.renderNode?.type === "group" && cell.projectionRole === "product_factor");

assert.ok(productContentCell && productFactorCell, "Die implizite Produktgrenze muss aus Content- und Faktorblock bestehen.");
assert.ok(wrappedPowerCell, "Der komplexe Fall muss eine Potenzhülle um einen Bruch tragen.");
assert.ok(groupedFactorCell, "Der komplexe Fall muss rechts eine sichtbare Nennergruppe als Faktor tragen.");
assert.equal(productFactorCell.colStart, productContentCell.colEnd + 1);
assert.equal(
  resolveSemanticBoundaryGapEm(productContentCell, productFactorCell, noImplicitBlockGapProfile),
  0,
  "Semantische Zellgrenzen sollen ihren Zusatzabstand komplett ueber das Profil verlieren koennen."
);
assert.ok(
  complexDefaultLayout.totalWidth > complexNoImplicitGapLayout.totalWidth,
  "Ein konfigurierbarer Blockabstand zwischen benachbarten semantischen Blaecken muss die physische Gesamtbreite vergroessern koennen."
);
assert.ok(
  complexDefaultLayout.widths[productContentCell.colEnd] > complexNoImplicitGapLayout.widths[productContentCell.colEnd]
  || complexDefaultLayout.widths[productFactorCell.colStart] > complexNoImplicitGapLayout.widths[productFactorCell.colStart],
  "Die implizite Produktgrenze muss sich auf mindestens eine der beiden angrenzenden P4-Spalten auswirken."
);
assert.ok(
  Number.isInteger(complexDisplayLayout.powerLeftSlotIndexBySemanticCol[wrappedPowerCell.colStart]),
  "Komplexe Potenzbasen sollen links eine eigene Display-Spalte fuer die oeffnende Klammer reservieren."
);
assert.ok(
  Number.isInteger(complexDisplayLayout.powerRightSlotIndexBySemanticCol[wrappedPowerCell.colEnd]),
  "Komplexe Potenzbasen sollen rechts eine eigene Display-Spalte fuer schliessende Klammer und Exponent reservieren."
);
assert.ok(
  complexDefaultLayout.widths[wrappedPowerCell.colStart] < 1.2,
  "Die semantische Inhaltsspalte einer Potenz ueber einem Bruch soll nicht mehr durch Klammern und Exponent kuenstlich aufgeblasen werden."
);
assert.ok(
  Number.isInteger(complexDisplayLayout.groupLeftSlotIndexBySemanticCol[groupedFactorCell.colStart]),
  "Die rechts erscheinende Nennergruppe soll links eine eigene sichtbare Klammer-Spalte bekommen."
);
assert.ok(
  Number.isInteger(complexDisplayLayout.groupRightSlotIndexBySemanticCol[groupedFactorCell.colEnd]),
  "Die rechts erscheinende Nennergruppe soll rechts eine eigene sichtbare Klammer-Spalte bekommen."
);
assert.ok(
  complexDisplayLayout.slots[complexDisplayLayout.groupRightSlotIndexBySemanticCol[groupedFactorCell.colEnd]].width
    >= resolveAtomicTextWidthEm(")", "text"),
  "Die rechte Klammer-Spalte darf nicht schmaler sein als die minimale Atombreite der sichtbaren ')'."
);

const functionResult = await GenesisCore.solve("sin(x)=5", { targetVariable: "x" });
assert.equal(functionResult.fehler, undefined);
const functionViewModel = buildWorksheetViewModel(functionResult);
const functionTopology = buildColumnTopology(functionViewModel);
const functionDisplayLayout = buildDisplayColumnLayout(functionViewModel);
const functionNoRightPaddingProfile = cloneColumnLayoutProfile();
const functionNameCell = functionViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "sin");
const functionLeftCell = functionViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_left");
const functionArgumentCell = functionViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_argument" && cell.text === "x");
const functionRightCell = functionViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_right");

functionNoRightPaddingProfile.shellPaddingEm.functionRight = 0;
const functionNoRightPaddingDisplayLayout = buildDisplayColumnLayout(functionViewModel, functionNoRightPaddingProfile);

assert.ok(functionNameCell && functionLeftCell && functionArgumentCell && functionRightCell, "Der Funktionsfall muss Name, Klammern und Argument bereits als explizite P4-Zellen tragen.");
assert.ok(
  !Number.isInteger(functionDisplayLayout.functionNameSlotIndexBySemanticCol[functionNameCell.colStart]),
  "Bei expliziter Funktionsnamensspur darf kein nachtraeglicher Namens-Slot mehr rekonstruiert werden."
);
assert.ok(
  !Number.isInteger(functionDisplayLayout.functionLeftSlotIndexBySemanticCol[functionLeftCell.colStart]),
  "Auch fuer die explizite linke Funktionsklammer darf kein zusaetzlicher Display-Slot mehr entstehen."
);
assert.ok(
  functionNameCell.colStart + 1 === functionLeftCell.colStart
    && functionLeftCell.colStart + 1 === functionArgumentCell.colStart
    && functionArgumentCell.colEnd + 1 === functionRightCell.colStart,
  "Die explizite Funktionsspur soll semantisch als Name, linke Klammer, Argument und rechte Klammer direkt hintereinander laufen."
);
assert.ok(
  Math.abs(functionDisplayLayout.totalWidth - functionNoRightPaddingDisplayLayout.totalWidth) < 1e-9,
  "Eine reine Display-Padding-Einstellung fuer Funktionsklammern darf explizit projizierte Funktionsspuren nicht mehr nachtraeglich verschieben."
);

const lawOfSinesResult = await GenesisCore.solve("a/sin(alpha)=b/sin(beta)", { targetVariable: "a" });
assert.equal(lawOfSinesResult.fehler, undefined);
const lawOfSinesViewModel = buildWorksheetViewModel(lawOfSinesResult);
const lawOfSinesDisplayLayout = buildDisplayColumnLayout(lawOfSinesViewModel);
const lawOfSinesCollapseStep = lawOfSinesViewModel.steps[1];
const lawOfSinesRetainedRightDelimiter = lawOfSinesCollapseStep.cells.find((cell) => cell.projectionRole === "function_right" && cell.colStart < 9);
const lawOfSinesMovedFunctionName = lawOfSinesCollapseStep.cells.find((cell) => cell.projectionRole === "function_name" && cell.colStart > 8);
const lawOfSinesBoundaryGapSlot = lawOfSinesDisplayLayout.slots.find((slot) => (
  slot.kind === "boundary_gap"
  && slot.semanticBeforeCol === lawOfSinesMovedFunctionName?.colStart
));
const lawOfSinesConfiguredImplicitBlockGap = Math.max(
  getColumnLayoutProfile("standard").semanticBoundaryGapEm.byRolePair["product_content|product_factor"],
  resolveAtomicTextWidthEm("·", "operator")
);

assert.ok(lawOfSinesRetainedRightDelimiter, "Im Sinus-Bruchfall muss der rechte Startbruch im Kollaps-Schritt bis zur expliziten Abschlussklammer erhalten bleiben.");
assert.ok(lawOfSinesMovedFunctionName, "Im Sinus-Bruchfall muss der verschobene Nenner als explizite Funktionsspur erscheinen.");
assert.ok(
  lawOfSinesBoundaryGapSlot?.width >= lawOfSinesConfiguredImplicitBlockGap,
  "Zwischen erhaltenem Bruch und nachgezogenem Faktor muss mindestens derselbe sichtbare Blockabstand gelten wie zwischen impliziten Produktbloecken."
);
assert.deepEqual(
  lawOfSinesDisplayLayout.slots
    .filter((slot) => slot.semanticBeforeCol === lawOfSinesMovedFunctionName.colStart)
    .map((slot) => slot.label),
  [`bg${lawOfSinesMovedFunctionName.colStart}`],
  "Der implizite Abstand muss vor der explizit projizierten Funktionsnamensspur des nachgezogenen Faktors liegen."
);
assert.ok(
  lawOfSinesMovedFunctionName.colStart === lawOfSinesRetainedRightDelimiter.colEnd + 1,
  "Der sichtbare Funktionsname des nachgezogenen Faktors muss direkt rechts vom expliziten Abschluss des erhaltenen Bruches beginnen."
);

const sinRootResult = await GenesisCore.solve("sin(sqrt((x+3)/(2+1)))=5", { targetVariable: "x" });
assert.equal(sinRootResult.fehler, undefined);
const sinRootViewModel = buildWorksheetViewModel(sinRootResult);
const sinRootDisplayLayout = buildDisplayColumnLayout(sinRootViewModel);
const sinRootStartFunctionName = sinRootViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "sin");
const sinRootStartFunctionLeft = sinRootViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_left");
const sinRootStartFunctionArgument = sinRootViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_argument" && cell.renderNode?.type === "root");
const sinRootStartFunctionRight = sinRootViewModel.steps[0].cells.find((cell) => cell.projectionRole === "function_right");
const sinRootInverseRoot = sinRootViewModel.steps[1].cells.find((cell) => cell.renderNode?.type === "root");
const sinRootPowerCell = sinRootViewModel.steps[2].cells.find((cell) => cell.renderNode?.type === "power");
const sinRootFactorGroup = sinRootViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.renderNode?.type === "group" && cell.projectionRole === "product_factor");
const sinRootStartBounds = resolveCellSemanticBounds(sinRootStartFunctionArgument);

assert.ok(sinRootStartFunctionName && sinRootStartFunctionLeft && sinRootStartFunctionArgument && sinRootStartFunctionRight, "Der komplexe Sinusfall muss in der Startzeile eine explizite Funktionsspur tragen.");
assert.ok(sinRootInverseRoot, "Nach der trigonometrischen Umkehrung muss die sichtbare Wurzel als eigener Block erhalten bleiben.");
assert.ok(sinRootPowerCell, "Nach dem Wurzelabbau muss rechts eine Potenzhuelle entstehen.");
assert.ok(sinRootFactorGroup, "Nach dem Nennerabbau muss rechts ein sichtbarer Gruppenfaktor entstehen.");
assert.ok(
  sinRootStartBounds.isInferred === false
    && sinRootStartBounds.semanticStart === sinRootStartFunctionArgument.colStart
    && sinRootStartBounds.semanticEnd === sinRootStartFunctionArgument.colEnd,
  "Verschachtelte sichtbare Funktionsargumente sollen ihre semantische Inhalts-Spanne bereits explizit aus P4 mitbringen."
);
assert.ok(
  sinRootStartFunctionName.colEnd + 1 === sinRootStartFunctionLeft.colStart
    && sinRootStartFunctionLeft.colEnd + 1 === sinRootStartBounds.semanticStart
    && sinRootStartBounds.semanticEnd + 1 === sinRootStartFunctionRight.colStart,
  "Auch eine Funktion mit Wurzel ueber Bruch im Argument soll als explizite Folge aus Name, linker Klammer, Argument und rechter Klammer erscheinen."
);
assert.ok(
  Number.isInteger(sinRootDisplayLayout.rootLeadSlotIndexBySemanticCol[sinRootInverseRoot.colStart]),
  "Nach der Sinus-Umkehrung soll die sichtbare Wurzel weiterhin ihren eigenen Vorslot tragen."
);
assert.ok(
  Number.isInteger(sinRootDisplayLayout.powerLeftSlotIndexBySemanticCol[sinRootPowerCell.colStart]),
  "Die aus dem Sinusfall entstehende Potenz ueber einer Funktionsbasis soll links einen eigenen Shell-Slot tragen."
);
assert.ok(
  Number.isInteger(sinRootDisplayLayout.powerRightSlotIndexBySemanticCol[sinRootPowerCell.colEnd]),
  "Die aus dem Sinusfall entstehende Potenz ueber einer Funktionsbasis soll rechts einen eigenen Shell-Slot tragen."
);
assert.ok(
  Number.isInteger(sinRootDisplayLayout.groupLeftSlotIndexBySemanticCol[sinRootFactorGroup.colStart]),
  "Der rechte Faktor aus dem Sinusfall soll links eine eigene Gruppenklammer-Spalte tragen."
);
assert.ok(
  Number.isInteger(sinRootDisplayLayout.groupRightSlotIndexBySemanticCol[sinRootFactorGroup.colEnd]),
  "Der rechte Faktor aus dem Sinusfall soll rechts eine eigene Gruppenklammer-Spalte tragen."
);
assert.deepEqual(
  sinRootDisplayLayout.slots
    .filter((slot) => slot.semanticBeforeCol === sinRootStartBounds.semanticStart)
    .map((slot) => slot.label),
  [`r${sinRootStartBounds.semanticStart}`],
  "Vor der expliziten Argumentspur muessen nur noch die Shell-Slots liegen, die wirklich erst am Argument selbst beginnen."
);
assert.deepEqual(
  sinRootDisplayLayout.slots
    .filter((slot) => slot.semanticAfterCol === sinRootStartBounds.semanticEnd)
    .map((slot) => slot.label),
  [],
  "Hinter einer explizit abgeschlossenen Funktionsargumentspur darf keine zusaetzliche rechte Funktionsklammer mehr rekonstruiert werden."
);
assert.deepEqual(
  sinRootDisplayLayout.slots
    .filter((slot) => slot.semanticBeforeCol === sinRootPowerCell.colStart)
    .map((slot) => slot.label),
  [
    `pl${sinRootPowerCell.colStart}`,
    `fn${sinRootPowerCell.colStart}`,
    `fl${sinRootPowerCell.colStart}`
  ],
  "Wenn eine Potenz eine Funktion umhuellt, muss die linke Potenzklammer ausserhalb des Funktionsnamens und der inneren Funktionsklammer liegen."
);
assert.deepEqual(
  sinRootDisplayLayout.slots
    .filter((slot) => slot.semanticAfterCol === sinRootPowerCell.colEnd)
    .map((slot) => slot.label),
  [`fr${sinRootPowerCell.colEnd}`, `pr${sinRootPowerCell.colEnd}`],
  "Wenn eine Potenz eine Funktion umhuellt, muss die rechte Funktionsklammer innerhalb der aeusseren Potenzklammer bleiben."
);

const scaledSinRootResult = await GenesisCore.solve("2*sin(sqrt((x+3)/(2+1)))=5", { targetVariable: "x" });
assert.equal(scaledSinRootResult.fehler, undefined);
const scaledSinRootViewModel = buildWorksheetViewModel(scaledSinRootResult);
const scaledSinRootDisplayLayout = buildDisplayColumnLayout(scaledSinRootViewModel);
const scaledSinInverseFunctionName = scaledSinRootViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.projectionRole === "function_name" && cell.text === "asin");
const scaledSinInverseFunctionLeft = scaledSinRootViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.projectionRole === "function_left" && cell.sourceShellId === scaledSinInverseFunctionName?.sourceShellId);
const scaledSinInverseFunctionRight = scaledSinRootViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.projectionRole === "function_right" && cell.sourceShellId === scaledSinInverseFunctionName?.sourceShellId);
const scaledSinPowerCell = scaledSinRootViewModel.steps
  .flatMap((step) => step.cells)
  .find((cell) => cell.renderNode?.type === "power" && cell.text.includes("asin"));

assert.ok(scaledSinInverseFunctionName && scaledSinInverseFunctionLeft && scaledSinInverseFunctionRight, "Der skalierte Sinusfall muss nach dem Nenner-Schritt rechts eine explizite inverse Funktion tragen.");
assert.ok(scaledSinPowerCell, "Der skalierte Sinusfall muss nach dem Wurzelabbau eine Potenz ueber einer inversen Funktion tragen.");
assert.ok(
  scaledSinInverseFunctionName.colEnd + 1 === scaledSinInverseFunctionLeft.colStart
    && scaledSinInverseFunctionRight.colStart > scaledSinInverseFunctionLeft.colStart,
  "Auch die inverse Funktion ueber einem Bruch soll explizit als Name plus Klammern erscheinen."
);
assert.ok(
  Number.isInteger(scaledSinRootDisplayLayout.powerLeftSlotIndexBySemanticCol[scaledSinPowerCell.colStart]),
  "Die Potenz ueber einer inversen Funktion soll links einen eigenen Shell-Slot tragen."
);
assert.ok(
  Number.isInteger(scaledSinRootDisplayLayout.powerRightSlotIndexBySemanticCol[scaledSinPowerCell.colEnd]),
  "Die Potenz ueber einer inversen Funktion soll rechts einen eigenen Shell-Slot tragen."
);

const cosineRatioAlphaResult = await GenesisCore.solve("cos(beta)/b=cos(alpha)/a", { targetVariable: "alpha" });
assert.equal(cosineRatioAlphaResult.fehler, undefined);
const cosineRatioAlphaViewModel = buildWorksheetViewModel(cosineRatioAlphaResult);
const cosineRatioAlphaLayout = buildColumnLayout(cosineRatioAlphaViewModel);
const cosineRatioAlphaFinalStep = cosineRatioAlphaViewModel.steps.at(-1);
const cosineRatioAlphaFinalFunctionName = cosineRatioAlphaFinalStep?.cells.find((cell) => cell.projectionRole === "function_name" && cell.text === "acos");
const cosineRatioAlphaFinalFractionLine = cosineRatioAlphaFinalStep?.cells.find((cell) => cell.projectionRole === "fraction_line");
const cosineRatioAlphaFinalFunctionRight = cosineRatioAlphaFinalStep?.cells.find(
  (cell) => cell.projectionRole === "function_right" && cell.colStart > (cosineRatioAlphaFinalFractionLine?.colEnd ?? -1)
);

assert.ok(cosineRatioAlphaFinalFunctionName && cosineRatioAlphaFinalFractionLine && cosineRatioAlphaFinalFunctionRight, "Der gespiegelte Kosinusfall muss im Endschritt eine explizite inverse Funktion tragen.");
assert.ok(
  cosineRatioAlphaFinalFractionLine.colEnd - cosineRatioAlphaFinalFractionLine.colStart + 1 === 4
    && cosineRatioAlphaFinalFunctionRight.colStart === cosineRatioAlphaFinalFractionLine.colEnd + 1
    && cosineRatioAlphaLayout.widths[cosineRatioAlphaFinalFractionLine.colStart] > 0,
  "Wenn ein sichtbarer Funktionszaehler innerhalb eines inneren Bruchs in eine inverse Funktion wandert, muss der innere Bruch als expliziter Vier-Spalten-Block innerhalb der acos-Schale erhalten bleiben."
);

const cosineLawGammaResult = await GenesisCore.solve("a^2+b^2-2ab*cos(gamma)=c^2", { targetVariable: "gamma" });
assert.equal(cosineLawGammaResult.fehler, undefined);
const cosineLawGammaViewModel = buildWorksheetViewModel(cosineLawGammaResult);
const cosineLawGammaLayout = buildColumnLayout(cosineLawGammaViewModel);
const cosineLawGammaLatex = buildLatexDocument({
  equation: cosineLawGammaResult.eingabe,
  targetVariable: cosineLawGammaResult.targetVariable,
  viewModel: cosineLawGammaViewModel,
  profileName: "standard"
});
const cosineLawGammaFinalFraction = cosineLawGammaViewModel.steps.at(-1)?.cells.find((cell) => cell.projectionRole === "fraction_line");
const cosineLawGammaFinalFractionWidth = cosineLawGammaLayout.widths
  .slice(cosineLawGammaFinalFraction.colStart, cosineLawGammaFinalFraction.colEnd + 1)
  .reduce((sum, width) => sum + width, 0)
  .toFixed(2)
  .replace(/\.?0+$/, "");
const cosineLawGammaRenderedFractionWidths = [
  ...cosineLawGammaLatex.matchAll(/\\makebox\[([0-9.]+)em\]\[c\]\{\\ensuremath\{\\vcenter\{\\hrule width ([0-9.]+)em height \\pFourFractionRuleThickness\}\}\}/g)
].map((match) => ({ box: match[1], rule: match[2] }));

assert.ok(cosineLawGammaFinalFraction, "Der Kosinussatz nach gamma muss im Endschritt einen sichtbaren Bruch tragen.");
assert.ok(
  cosineLawGammaRenderedFractionWidths.length >= 2,
  "Der direkte LaTeX-Export des Kosinussatzes soll sowohl den freien Bruchschritt als auch den finalen Bruch in acos(...) explizit als Balken rendern."
);
assert.ok(
  cosineLawGammaRenderedFractionWidths.every(({ box, rule }) => box === cosineLawGammaFinalFractionWidth && rule === cosineLawGammaFinalFractionWidth),
  "Der freie Bruch und der finale Bruch in acos(...) muessen im direkten LaTeX-Export dieselbe explizite P4-Spannweite behalten, statt spaeter lokal verbreitert zu werden."
);
assert.match(
  cosineLawGammaLatex,
  /\\operatorname\{acos\}[\s\S]*\\left\([\s\S]*\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\vcenter\{\\hrule width [0-9.]+em height \\pFourFractionRuleThickness\}\}\}/,
  "Der direkte LaTeX-Export muss fuer acos(...) zuerst die eigenen Shell-Spalten und danach den bereits feststehenden Bruch setzen."
);

const dividedByFractionResult = await GenesisCore.solve("a/cos(alpha)=b/cos(beta)", { targetVariable: "alpha" });
assert.equal(dividedByFractionResult.fehler, undefined);
const dividedByFractionViewModel = buildWorksheetViewModel(dividedByFractionResult);
const dividedByFractionLatex = buildLatexDocument({
  equation: dividedByFractionResult.eingabe,
  targetVariable: dividedByFractionResult.targetVariable,
  viewModel: dividedByFractionViewModel,
  profileName: "standard"
});

assert.match(
  dividedByFractionLatex,
  /\\operatorname\{acos\}[\s\S]*\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\vcenter\{\\hrule width [0-9.]+em height \\pFourFractionRuleThickness\}\}\}[\s\S]*\\pFourCell\{[0-9.]+\}\{b\}[\s\S]*\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\vcenter\{\\hrule width [0-9.]+em height \\pFourFractionRuleThickness\}\}\}[\s\S]*\\pFourCell\{1\.62\}\{\\cos\}[\s\S]*\\pFourCell\{[0-9.]+\}\{\\beta\}/,
  "Wenn ein Aussenbruch ueber einem inneren Bruch eingeklappt wird, muss der direkte LaTeX-Export den inneren Nenner nur noch als explizite Funktion innerhalb des Aussenbruchs zeichnen."
);

console.log("Atomare P4-Spaltenbreiten und Blockabstaende erfolgreich geprueft.");
