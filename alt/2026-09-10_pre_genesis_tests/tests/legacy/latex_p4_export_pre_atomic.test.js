import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const exportScript = path.resolve(projectRoot, "scripts/export_projection_pdf.mjs");
const p4 = (contentPattern = "") => `\\\\pFourCell\\{[0-9.]+\\}\\{${contentPattern}\\}`;
const p4Frac = (numeratorPattern = "[\\s\\S]*?", denominatorPattern = "[\\s\\S]*?") =>
  `\\\\pFourFraction\\{[0-9.]+em\\}\\{${numeratorPattern}\\}\\{${denominatorPattern}\\}`;
const p4Sin = () => p4("(?:\\\\sin|sin)");
const p4Asin = () => p4("(?:\\\\operatorname\\{asin\\}|asin)");
const adaptiveDelimiterStrut = (contentPattern = "[\\s\\S]*?") =>
  `(?:\\\\vphantom\\{${contentPattern}\\}|\\\\rule\\[-[0-9.]+em\\]\\{0pt\\}\\{[0-9.]+em\\})`;

function extractLatexCommandArgs(expression, commandName, argCount = 3) {
  const prefix = `\\${commandName}`;
  const startIndex = expression.indexOf(prefix);

  if (startIndex < 0) {
    return null;
  }

  const args = [];
  let cursor = startIndex + prefix.length;

  for (let index = 0; index < argCount; index += 1) {
    while (/\s/.test(expression[cursor] || "")) {
      cursor += 1;
    }

    if (expression[cursor] !== "{") {
      return null;
    }

    const contentStart = cursor + 1;
    let depth = 0;

    while (cursor < expression.length) {
      const char = expression[cursor];

      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;

        if (depth === 0) {
          args.push(expression.slice(contentStart, cursor));
          cursor += 1;
          break;
        }
      }

      cursor += 1;
    }
  }

  return args;
}

function extractNodeX(line) {
  const match = String(line || "").match(/at \(([0-9.]+),/);
  return match ? Number(match[1]) : null;
}

const pdflatexCheck = spawnSync("pdflatex", ["--version"], { encoding: "utf8" });
if (pdflatexCheck.error?.code === "ENOENT") {
  console.log("pdflatex nicht verfuegbar, LaTeX-PDF-Exporttest uebersprungen.");
  process.exit(0);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gleichungsloeser-latex-p4-"));
const wideOutput = path.join(tmpDir, "wide.pdf");
const simpleOutput = path.join(tmpDir, "simple.pdf");
const rootOutput = path.join(tmpDir, "root.pdf");
const complexOutput = path.join(tmpDir, "complex.pdf");
const profiledOutput = path.join(tmpDir, "profiled.pdf");
const scaledProfiledOutput = path.join(tmpDir, "profiled-scaled.pdf");
const functionOutput = path.join(tmpDir, "function.pdf");
const sinRootOutput = path.join(tmpDir, "sin-root.pdf");
const scaledSinRootOutput = path.join(tmpDir, "sin-root-scaled.pdf");
const rightSideFunctionFractionOutput = path.join(tmpDir, "right-side-function-fraction.pdf");
const denominatorTargetOutput = path.join(tmpDir, "denominator-target.pdf");
const mirroredDenominatorTargetOutput = path.join(tmpDir, "mirrored-denominator-target.pdf");
const oneOverSinTargetOutput = path.join(tmpDir, "one-over-sin-target.pdf");
const mirroredOneOverSinTargetOutput = path.join(tmpDir, "mirrored-one-over-sin-target.pdf");
const groupedAdditionOutput = path.join(tmpDir, "grouped-addition.pdf");
const subtrahendNegationOutput = path.join(tmpDir, "subtrahend-negation.pdf");
const productNegationOutput = path.join(tmpDir, "product-negation.pdf");
const cosineLawNegativeOutput = path.join(tmpDir, "cosine-law-negative.pdf");
const functionFractionOutput = path.join(tmpDir, "function-fraction.pdf");
const prefixedFunctionFractionOutput = path.join(tmpDir, "function-fraction-prefix.pdf");
const mirroredFunctionFractionOutput = path.join(tmpDir, "mirrored-function-fraction.pdf");
const cosineRatioBetaOutput = path.join(tmpDir, "cosine-ratio-beta.pdf");
const cosineRatioAlphaOutput = path.join(tmpDir, "cosine-ratio-alpha.pdf");
const nestedDenominatorTargetOutput = path.join(tmpDir, "nested-denominator-target.pdf");
const selectiveShellColorOutput = path.join(tmpDir, "selective-shell-colors.pdf");
const lawOfSinesOutput = path.join(tmpDir, "law-of-sines.pdf");
const lawOfSinesAlphaOutput = path.join(tmpDir, "law-of-sines-alpha.pdf");
const invertedLawOfSinesOutput = path.join(tmpDir, "inverted-law-of-sines.pdf");

const wideResult = spawnSync(
  process.execPath,
  [exportScript, "a*x+3=5", "--target", "x", "--output", wideOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(wideResult.status, 0, wideResult.stderr || wideResult.stdout);
assert.ok(fs.existsSync(wideOutput), "Der LaTeX-P4-Export muss eine PDF fuer den breiten Bruch erzeugen.");

const wideTex = fs.readFileSync(wideOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(wideTex, /\\newcommand\{\\pFourCell\}/, "Der Export muss feste P4-Zellen definieren.");
assert.match(
  wideTex,
  /\\pFourFraction\{[0-9.]+em\}\{\s*\\pFourCell\{[0-9.]+\}\{5\}\\pFourCell\{[0-9.]+\}\{-\}\\pFourCell\{[0-9.]+\}\{3\}\s*\}\{\s*\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\pFourCell\{[0-9.]+\}\{a\}\}\}\s*\}/,
  "Bei symmetrischem Dreier-Span soll ein schmalerer Nenner innerhalb derselben festen Bruchbreite zentriert werden."
);
assert.doesNotMatch(wideTex, /\\begin\{array\}/, "Der Export darf die Spaltentreue nicht ueber inhaltsbreite Arrays verlieren.");

const simpleResult = spawnSync(
  process.execPath,
  [exportScript, "2*x=5", "--target", "x", "--output", simpleOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(simpleResult.status, 0, simpleResult.stderr || simpleResult.stdout);
assert.ok(fs.existsSync(simpleOutput), "Der LaTeX-P4-Export muss eine PDF fuer den einfachen Bruch erzeugen.");

const simpleTex = fs.readFileSync(simpleOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  simpleTex,
  new RegExp(p4Frac(p4("5"), p4("2"))),
  "Auch einfache Brueche sollen als echte LaTeX-Brueche mit festen P4-Zellen gesetzt werden."
);

const rootResult = spawnSync(
  process.execPath,
  [exportScript, "2*sqrt(x+3)=5", "--target", "x", "--output", rootOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(rootResult.status, 0, rootResult.stderr || rootResult.stdout);
assert.ok(fs.existsSync(rootOutput), "Der LaTeX-P4-Export muss eine PDF fuer Wurzel/Potenz erzeugen.");

const rootTex = fs.readFileSync(rootOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(rootTex, new RegExp(`\\\\pFourRoot\\{${p4("x")}${p4("\\+")}${p4("3")}\\}`), "Wurzeln muessen als eigene P4-Wurzelschalen mit festen Inhaltszellen gesetzt werden.");
assert.match(
  rootTex,
  new RegExp(p4Frac(p4("5"), p4("2"))),
  "Die Basis einer Potenz ueber einem Bruch muss als feste P4-Bruchbox erhalten bleiben."
);
assert.match(
  rootTex,
  new RegExp(`\\\\left\\.${adaptiveDelimiterStrut(p4Frac(p4("5"), p4("2")))}\\\\right\\)\\^\\{\\\\scriptstyle 2\\}`),
  "Schliessende Potenzklammer und Exponent sollen als eigener Shell-Baustein auf derselben rechten Display-Spalte landen."
);
assert.match(
  rootTex,
  new RegExp(`\\\\left\\(${adaptiveDelimiterStrut(p4Frac(p4("5"), p4("2")))}\\\\right\\.`),
  "Die oeffnende Potenzklammer soll als eigener linker Shell-Baustein gesetzt werden."
);
assert.doesNotMatch(rootTex, /\{\$sqrt\(/, "Wurzeln duerfen nicht als Textform sqrt(...) ausgegeben werden.");
assert.doesNotMatch(rootTex, /\\left\(\\frac\{5\}\{2\}\\right\)\^\{2\}/, "Verschachtelte Brueche duerfen nicht als normal skalierte LaTeX-Brueche ausgegeben werden.");
assert.doesNotMatch(rootTex, /\{\$\(\(5\) \/ \(2\)\)\^2\$\}/, "Verschachtelte Brueche duerfen nicht als Slash-Text ausgegeben werden.");

const complexResult = spawnSync(
  process.execPath,
  [exportScript, "2*sqrt((x+3)/(2+1))=5", "--target", "x", "--output", complexOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(complexResult.status, 0, complexResult.stderr || complexResult.stdout);
assert.ok(fs.existsSync(complexOutput), "Der LaTeX-P4-Export muss eine PDF fuer den komplexeren Wurzel-Bruch-Fall erzeugen.");

const complexTex = fs.readFileSync(complexOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  complexTex,
  new RegExp(`\\\\pFourRoot\\{${p4Frac(`${p4("x")}${p4("\\+")}${p4("3")}`, `${p4("2")}${p4("\\+")}${p4("1")}`)}\\}`),
  "Ein Bruch unter einer Wurzel muss seine Gruppeninhalte ohne kuenstliche Bruch-Klammern als feste P4-Zellen tragen."
);
assert.doesNotMatch(
  complexTex,
  /\\pFourCell\{[0-9.]+\}\{\\pFourFraction\{/,
  "Eine ganze verschachtelte Bruchschale darf nicht in eine einzelne P4-Zelle verpackt werden."
);
assert.doesNotMatch(
  complexTex,
  /\\pFourRoot\{\\displaystyle\\frac\{\\left\(/,
  "Zaehler und Nenner eines sichtbaren Bruchs unter der Wurzel duerfen keine automatisch erzwungenen Gruppenklammern tragen."
);

const profiledResult = spawnSync(
  process.execPath,
  [exportScript, "2*x=5", "--target", "x", "--profile", "lesefreundlich", "--output", profiledOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(profiledResult.status, 0, profiledResult.stderr || profiledResult.stdout);
assert.ok(fs.existsSync(profiledOutput), "Der LaTeX-P4-Export muss auch mit benanntem Spaltenprofil eine PDF erzeugen.");
const profiledTex = fs.readFileSync(profiledOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(profiledTex, /Profil: \\texttt\{lesefreundlich\}/, "Der Export soll das verwendete benannte Spaltenprofil dokumentieren.");
assert.match(
  profiledTex,
  /\\newcommand\{\\pFourFraction\}\[3\]\{\\genfrac\{\}\{\}\{\\pFourFractionRuleThickness\}\{0\}\{\\raisebox\{0\.18em\}\{[\s\S]*\}\}\{\\raisebox\{-0\.22em\}\{[\s\S]*\}\}\}/,
  "Das benannte lesefreundliche Profil soll die vergroesserten Zaeher- und Nennerabstaende explizit um eine gemeinsame TeX-Achse herum tragen."
);

const scaledProfiledResult = spawnSync(
  process.execPath,
  [exportScript, "2*x=5", "--target", "x", "--scale", "3", "--output", scaledProfiledOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(scaledProfiledResult.status, 0, scaledProfiledResult.stderr || scaledProfiledResult.stdout);
assert.ok(fs.existsSync(scaledProfiledOutput), "Der LaTeX-P4-Export muss auch mit generischer Horizontal-Skalierung eine PDF erzeugen.");
const scaledProfiledTex = fs.readFileSync(scaledProfiledOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(scaledProfiledTex, /Profil: \\texttt\{standard @3x\}/, "Der Export soll auch eine generische Breiten-Skalierung im Profiltitel dokumentieren.");
assert.match(
  scaledProfiledTex,
  /\\newcommand\{\\pFourFraction\}\[3\]\{\\genfrac\{\}\{\}\{\\pFourFractionRuleThickness\}\{0\}\{\\raisebox\{0\.14em\}\{[\s\S]*\}\}\{\\raisebox\{-0\.18em\}\{[\s\S]*\}\}\}/,
  "Auch das Standardprofil soll seine allgemeinen Bruchabstaende als Verschiebung relativ zur gemeinsamen TeX-Achse sichtbar im Vertrag tragen."
);
assert.match(
  scaledProfiledTex,
  /\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{2\.64\}\{5\}\}\{\\pFourCell\{2\.64\}\{2\}\}/,
  "Bei 3-facher Horizontal-Skalierung muessen auch die festen P4-Zellbreiten proportional wachsen."
);

const functionResult = spawnSync(
  process.execPath,
  [exportScript, "sin(x)=5", "--target", "x", "--output", functionOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(functionResult.status, 0, functionResult.stderr || functionResult.stdout);
assert.ok(fs.existsSync(functionOutput), "Der LaTeX-P4-Export muss auch fuer Funktionen eine PDF erzeugen.");
const functionTex = fs.readFileSync(functionOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  functionTex,
  new RegExp(p4Sin()),
  "Der sichtbare Funktionsname soll als eigene Shell-Zelle erscheinen."
);
assert.match(
  functionTex,
  new RegExp(`\\\\left\\(${adaptiveDelimiterStrut(p4("x"))}\\\\right\\.`),
  "Die oeffnende Funktionsklammer soll als eigener Shell-Baustein gesetzt werden."
);
assert.match(
  functionTex,
  new RegExp(`\\\\left\\.${adaptiveDelimiterStrut(p4("x"))}\\\\right\\)`),
  "Die schliessende Funktionsklammer soll als eigener Shell-Baustein gesetzt werden."
);

const rightSideFunctionFractionResult = spawnSync(
  process.execPath,
  [exportScript, "5=sin(m)/(2a)", "--target", "m", "--output", rightSideFunctionFractionOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(rightSideFunctionFractionResult.status, 0, rightSideFunctionFractionResult.stderr || rightSideFunctionFractionResult.stdout);
assert.ok(
  fs.existsSync(rightSideFunctionFractionOutput),
  "Der LaTeX-P4-Export muss auch eine rechte Funktionsschale im sichtbaren Bruch erzeugen."
);
const rightSideFunctionFractionTex = fs.readFileSync(rightSideFunctionFractionOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  rightSideFunctionFractionTex,
  /\\pFourFraction\{[0-9.]+em\}\{[\s\S]*\\pFourCell\{[0-9.]+\}\{(?:\\sin|sin)\}[\s\S]*\\pFourCell\{[0-9.]+\}\{\\left\((?:\\vphantom\{[\s\S]*?\}|\\rule\[-[0-9.]+em\]\{0pt\}\{[0-9.]+em\})\\right\.\}[\s\S]*\\pFourCell\{[0-9.]+\}\{m\}[\s\S]*\\pFourCell\{[0-9.]+\}\{\\left\.(?:\\vphantom\{[\s\S]*?\}|\\rule\[-[0-9.]+em\]\{0pt\}\{[0-9.]+em\})\\right\)\}/,
  "Im sichtbaren Startbruch muessen Funktionsname, linke Klammer, Argument und rechte Klammer als getrennte Slot-Zellen erhalten bleiben."
);
assert.match(
  rightSideFunctionFractionTex,
  /\\pFourFraction\{[0-9.]+em\}\{[\s\S]*?\}\{[\s\S]*\\pFourCell\{[0-9.]+\}\{2\}\\pFourCell\{[0-9.]+\}\{a\}(?:\\pFourCell\{[0-9.]+\}\{\})?\}/,
  "Der rechte Seitenbruch soll den Funktionszaehler sichtbar behalten und den Nenner ohne kuenstliche Bruch-Klammern setzen."
);

const denominatorTargetResult = spawnSync(
  process.execPath,
  [exportScript, "2/x=5", "--target", "x", "--output", denominatorTargetOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(denominatorTargetResult.status, 0, denominatorTargetResult.stderr || denominatorTargetResult.stdout);
assert.ok(fs.existsSync(denominatorTargetOutput), "Der LaTeX-P4-Export muss auch den Nennerziel-Fall erzeugen.");
const denominatorTargetTex = fs.readFileSync(denominatorTargetOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  denominatorTargetTex,
  /\\pFourFraction\{[0-9.]+em\}\{(?:\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{)?\\pFourCell\{[0-9.]+\}\{2\}(?:\}\})?\}\{(?:\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{)?\\pFourCell\{[0-9.]+\}\{5\}(?:\}\})?\}/,
  "Beim Nennerziel-Fall sollen Zaehler und Nenner des Schlussbruchs auf denselben sichtbaren Bruch-Span zentriert werden, egal ob dafuer Zusatzpadding noetig ist oder nicht."
);

const mirroredDenominatorTargetResult = spawnSync(
  process.execPath,
  [exportScript, "5=2/x", "--target", "x", "--output", mirroredDenominatorTargetOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(mirroredDenominatorTargetResult.status, 0, mirroredDenominatorTargetResult.stderr || mirroredDenominatorTargetResult.stdout);
assert.ok(fs.existsSync(mirroredDenominatorTargetOutput), "Der LaTeX-P4-Export muss auch die gespiegelte Nennerziel-Richtung erzeugen.");
const mirroredDenominatorTargetTex = fs.readFileSync(mirroredDenominatorTargetOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  mirroredDenominatorTargetTex,
  /\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{2\}\}\{\\pFourCell\{[0-9.]+\}\{5\}\}/,
  "Die gespiegelte Richtung soll denselben Schlussbruch auch rechts sauber und ohne Drift setzen."
);

const oneOverSinTargetResult = spawnSync(
  process.execPath,
  [exportScript, "1/sin(x)=5", "--target", "x", "--output", oneOverSinTargetOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(oneOverSinTargetResult.status, 0, oneOverSinTargetResult.stderr || oneOverSinTargetResult.stdout);
assert.ok(fs.existsSync(oneOverSinTargetOutput), "Der LaTeX-P4-Export muss auch den Funktionsnenner-Zielfall erzeugen.");
const oneOverSinTargetTex = fs.readFileSync(oneOverSinTargetOutput.replace(/\.pdf$/, ".tex"), "utf8");
const oneOverSinNarrowFractions = [
  ...oneOverSinTargetTex.matchAll(/\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{1\}\}\{\\pFourCell\{[0-9.]+\}\{5\}\}/g)
];
assert.ok(
  oneOverSinNarrowFractions.length >= 2,
  "Beim Funktionsnenner-Zielfall muessen sowohl der Zwischenbruch 1/5 als auch der spaetere asin-Innenbruch schmal aus dem echten Inhalt gebaut werden."
);

const mirroredOneOverSinTargetResult = spawnSync(
  process.execPath,
  [exportScript, "5=1/sin(x)", "--target", "x", "--output", mirroredOneOverSinTargetOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(mirroredOneOverSinTargetResult.status, 0, mirroredOneOverSinTargetResult.stderr || mirroredOneOverSinTargetResult.stdout);
assert.ok(fs.existsSync(mirroredOneOverSinTargetOutput), "Der LaTeX-P4-Export muss auch den gespiegelten Funktionsnenner-Zielfall erzeugen.");
const mirroredOneOverSinTargetTex = fs.readFileSync(mirroredOneOverSinTargetOutput.replace(/\.pdf$/, ".tex"), "utf8");
const mirroredOneOverSinNarrowFractions = [
  ...mirroredOneOverSinTargetTex.matchAll(/\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{1\}\}\{\\pFourCell\{[0-9.]+\}\{5\}\}/g)
];
assert.ok(
  mirroredOneOverSinNarrowFractions.length >= 2,
  "Auch gespiegelt muessen Zwischenbruch und finaler asin-Innenbruch ohne geerbte Zukunfts-Slots schmal bleiben."
);

const groupedAdditionResult = spawnSync(
  process.execPath,
  [exportScript, "(x+1)=5", "--target", "x", "--output", groupedAdditionOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(groupedAdditionResult.status, 0, groupedAdditionResult.stderr || groupedAdditionResult.stdout);
assert.ok(fs.existsSync(groupedAdditionOutput), "Der LaTeX-P4-Export muss auch redundante Aussenklammern vor der ersten Familie sauber weg-normalisieren.");
const groupedAdditionTex = fs.readFileSync(groupedAdditionOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.doesNotMatch(
  groupedAdditionTex,
  /\\left\([\\s\\S]*\\vphantom\{\\pFourCell\{[0-9.]+\}\{x\}\\pFourCell\{[0-9.]+\}\{\\+\}\\pFourCell\{[0-9.]+\}\{1\}\}[\\s\\S]*\\right\)/,
  "Eine redundante Seitengruppenklammer um x+1 darf im exportierten Start- oder Zwischenschritt nicht mehr auftauchen."
);

const subtrahendNegationResult = spawnSync(
  process.execPath,
  [exportScript, "2-x=5", "--target", "x", "--output", subtrahendNegationOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(subtrahendNegationResult.status, 0, subtrahendNegationResult.stderr || subtrahendNegationResult.stdout);
assert.ok(fs.existsSync(subtrahendNegationOutput), "Der LaTeX-P4-Export muss auch die Gegenrichtung mit sichtbarer Negation sauber erzeugen.");
const subtrahendNegationTex = fs.readFileSync(subtrahendNegationOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  subtrahendNegationTex,
  /\\pFourCell\{[0-9.]+\}\{-\}\\left\(\\pFourCell\{[0-9.]+\}\{5\}\\pFourCell\{[0-9.]+\}\{-\}\\pFourCell\{[0-9.]+\}\{2\}\\right\)/,
  "Bei der finalen Negation muss das Minus als eigene P4-Zelle vor dem geklammerten Inhalt erscheinen, statt als ein einzelner zentrierter Gesamtknoten."
);

const productNegationResult = spawnSync(
  process.execPath,
  [exportScript, "-2*a*b*cos(gamma)=5", "--target", "gamma", "--output", productNegationOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(productNegationResult.status, 0, productNegationResult.stderr || productNegationResult.stdout);
assert.ok(fs.existsSync(productNegationOutput), "Der LaTeX-P4-Export muss auch negative Produktketten fuer trigonometrische Ziele sauber erzeugen.");
const productNegationTex = fs.readFileSync(productNegationOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  productNegationTex,
  /\\pFourCell\{[0-9.]+\}\{-\}\\pFourCell\{[0-9.]+\}\{2\}\\pFourCell\{[0-9.]+\}\{a\}\\pFourCell\{[0-9.]+\}\{b\}/,
  "Ein negativer Faktorblock wie -2ab muss als direkte Zellfolge erscheinen und nicht als geklammerte Negationsgruppe."
);
assert.doesNotMatch(
  productNegationTex,
  /-\\left\(\\pFourCell\{[0-9.]+\}\{2\}\\pFourCell\{[0-9.]+\}\{a\}\\pFourCell\{[0-9.]+\}\{b\}/,
  "Ein negativer Faktorblock darf im Export nicht mehr als -(2ab) gesetzt werden."
);

const cosineLawNegativeResult = spawnSync(
  process.execPath,
  [exportScript, "a^2+b^2-2abcosgamma=c^2", "--target", "gamma", "--output", cosineLawNegativeOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(cosineLawNegativeResult.status, 0, cosineLawNegativeResult.stderr || cosineLawNegativeResult.stdout);
assert.ok(fs.existsSync(cosineLawNegativeOutput), "Der LaTeX-P4-Export muss auch den negativen Kosinussatz-Fall erzeugen.");
const cosineLawNegativeTex = fs.readFileSync(cosineLawNegativeOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  cosineLawNegativeTex,
  /\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{c\^\{(?:2|\\scriptstyle 2)\}\}\\pFourCell\{[0-9.]+\}\{-\}\\pFourCell\{[0-9.]+\}\{a\^\{(?:2|\\scriptstyle 2)\}\}\\pFourCell\{[0-9.]+\}\{-\}\\pFourCell\{[0-9.]+\}\{b\^\{(?:2|\\scriptstyle 2)\}\}/,
  "Der Zwischenbruch im negativen Kosinussatz soll den sichtbaren Zaehler direkt bei c^2 beginnen."
);
assert.doesNotMatch(
  cosineLawNegativeTex,
  /\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{\}\\pFourCell\{[0-9.]+\}\{\}\\pFourCell\{[0-9.]+\}\{c\^\{2\}\}/,
  "Der Zwischenbruch im negativen Kosinussatz darf keine leeren Zukunfts-Slots der spaeteren acos-Schale vor dem Zaehler mitschleppen."
);
const cosineLawNegativeFractionNodes = cosineLawNegativeTex
  .split("\n")
  .filter((line) => line.includes("\\node[anchor=base, inner sep=0pt]") && line.includes("{$\\pFourFraction{"));
const cosineLawNegativeUniqueFractionNodes = Array.from(new Set(cosineLawNegativeFractionNodes));
const cosineLawNegativeStandaloneFractionNode = cosineLawNegativeUniqueFractionNodes[0];
const cosineLawNegativeInverseFractionNode = cosineLawNegativeUniqueFractionNodes[1];
assert.ok(
  cosineLawNegativeStandaloneFractionNode && cosineLawNegativeInverseFractionNode,
  "Der negative Kosinussatz muss sowohl den freien Zwischenbruch als auch den finalen Bruchkern in acos(...) als eigene Knoten exportieren."
);
assert.ok(
  Math.abs(extractNodeX(cosineLawNegativeStandaloneFractionNode) - extractNodeX(cosineLawNegativeInverseFractionNode)) < 0.001,
  "Freier Zwischenbruch und finaler Bruchkern in acos(...) muessen auf derselben horizontalen Kernspur stehen."
);

const functionFractionResult = spawnSync(
  process.execPath,
  [exportScript, "sin(x/2)=5", "--target", "x", "--output", functionFractionOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(functionFractionResult.status, 0, functionFractionResult.stderr || functionFractionResult.stdout);
assert.ok(fs.existsSync(functionFractionOutput), "Der LaTeX-P4-Export muss auch einen Bruch im Funktionsargument erzeugen.");
const functionFractionTex = fs.readFileSync(functionFractionOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  functionFractionTex,
  /\\pFourCell\{[0-9.]+\}\{(?:\\sin|sin)\}[\s\S]*\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{x\}\}\{\\pFourCell\{[0-9.]+\}\{2\}\}/,
  "Bei sin(x/2)=5 muessen Funktionsschale und innerer Bruch gemeinsam spaltentreu erscheinen."
);
assert.match(
  functionFractionTex,
  /\\pFourCell\{[0-9.]+\}\{(?:\\operatorname\{asin\}|asin)\}[\s\S]*\\pFourCell\{[0-9.]+\}\{5\}[\s\S]*\\cdot[\s\S]*\{2\}/,
  "Nach trigonometrischer Umkehrung und Bruchabbau muss asin(5) auf der rechten Seite stehen bleiben und der Faktor 2 rechts angehaengt werden."
);

const prefixedFunctionFractionResult = spawnSync(
  process.execPath,
  [
    exportScript,
    "sin(x/2)=5",
    "--target",
    "x",
    "--right-side-factor-placement",
    "prefix",
    "--output",
    prefixedFunctionFractionOutput
  ],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(prefixedFunctionFractionResult.status, 0, prefixedFunctionFractionResult.stderr || prefixedFunctionFractionResult.stdout);
assert.ok(fs.existsSync(prefixedFunctionFractionOutput), "Der LaTeX-P4-Export muss die alternative Rechtsseiten-Policy ebenfalls rendern koennen.");
const prefixedFunctionFractionTex = fs.readFileSync(prefixedFunctionFractionOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  prefixedFunctionFractionTex,
  /\{2\}[\s\S]*\\cdot[\s\S]*\\pFourCell\{[0-9.]+\}\{(?:\\operatorname\{asin\}|asin)\}[\s\S]*\\pFourCell\{[0-9.]+\}\{5\}/,
  "Mit praefixierter Rechtsseiten-Policy muss der neue Faktor links vor der rechten asin-Schale erscheinen."
);

const mirroredFunctionFractionResult = spawnSync(
  process.execPath,
  [exportScript, "5=sin(x/2)", "--target", "x", "--output", mirroredFunctionFractionOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(mirroredFunctionFractionResult.status, 0, mirroredFunctionFractionResult.stderr || mirroredFunctionFractionResult.stdout);
assert.ok(fs.existsSync(mirroredFunctionFractionOutput), "Der LaTeX-P4-Export muss auch die gespiegelte Richtung mit Bruch im Funktionsargument erzeugen.");
const mirroredFunctionFractionTex = fs.readFileSync(mirroredFunctionFractionOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  mirroredFunctionFractionTex,
  /\\pFourCell\{[0-9.]+\}\{(?:\\sin|sin)\}[\s\S]*\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{x\}\}\{\\pFourCell\{[0-9.]+\}\{2\}\}/,
  "Auch gespiegelt muss der Bruch innerhalb der Funktionsschale als echter P4-Bruch erhalten bleiben."
);
assert.match(
  mirroredFunctionFractionTex,
  /\{2\}[\s\S]*\\cdot[\s\S]*\\pFourCell\{[0-9.]+\}\{(?:\\operatorname\{asin\}|asin)\}[\s\S]*=\}?\$?[\s\S]*\{x\}/,
  "Beim gespiegelten Bruchabbau muss der neue Faktor auf der linken Seite links vor der bestehenden asin-Schale stehen."
);

const cosineRatioBetaResult = spawnSync(
  process.execPath,
  [exportScript, "cos(beta)/b=cos(alpha)/a", "--target", "beta", "--output", cosineRatioBetaOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(cosineRatioBetaResult.status, 0, cosineRatioBetaResult.stderr || cosineRatioBetaResult.stdout);
assert.ok(fs.existsSync(cosineRatioBetaOutput), "Der LaTeX-P4-Export muss auch das Kosinus-Verhaeltnis fuer beta erzeugen.");
const cosineRatioBetaTex = fs.readFileSync(cosineRatioBetaOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  cosineRatioBetaTex,
  /\\pFourFraction\{[0-9.]+em\}\{(?:\\pFourCell\{[0-9.]+\}\{\\cos\\left\(\\alpha\\right\)\}|\\pFourCell\{[0-9.]+\}\{(?:\\cos|cos)\}\\pFourCell\{[0-9.]+\}\{\(}\pFourCell\{[0-9.]+\}\{\\alpha\}\\pFourCell\{[0-9.]+\}\{\)\})\}\{(?:\\pFourCell\{[0-9.]+\}\{a\}|\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\pFourCell\{[0-9.]+\}\{a\}\}\})\}\\pFourCell\{[0-9.]+\}\{b\}/,
  "Im finalen acos-Argument fuer beta soll die Struktur Bruch mal Faktor erhalten bleiben."
);

const cosineRatioAlphaResult = spawnSync(
  process.execPath,
  [exportScript, "cos(beta)/b=cos(alpha)/a", "--target", "alpha", "--output", cosineRatioAlphaOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(cosineRatioAlphaResult.status, 0, cosineRatioAlphaResult.stderr || cosineRatioAlphaResult.stdout);
assert.ok(fs.existsSync(cosineRatioAlphaOutput), "Der LaTeX-P4-Export muss auch das gespiegelte Kosinus-Verhaeltnis erzeugen.");
const cosineRatioAlphaTex = fs.readFileSync(cosineRatioAlphaOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  cosineRatioAlphaTex,
  /\\pFourCell\{[0-9.]+\}\{a\}\\pFourFraction\{[0-9.]+em\}\{(?:\\pFourCell\{[0-9.]+\}\{\\cos\\left\(\\beta\\right\)\}|\\pFourCell\{[0-9.]+\}\{(?:\\cos|cos)\}\\pFourCell\{[0-9.]+\}\{\(}\pFourCell\{[0-9.]+\}\{\\beta\}\\pFourCell\{[0-9.]+\}\{\)\})\}\{(?:\\pFourCell\{[0-9.]+\}\{b\}|\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\pFourCell\{[0-9.]+\}\{b\}\}\})\}/,
  "Auch gespiegelt soll das finale acos-Argument die Struktur Faktor mal Bruch behalten."
);

const sinRootResult = spawnSync(
  process.execPath,
  [exportScript, "sin(sqrt((x+3)/(2+1)))=5", "--target", "x", "--output", sinRootOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(sinRootResult.status, 0, sinRootResult.stderr || sinRootResult.stdout);
assert.ok(fs.existsSync(sinRootOutput), "Der LaTeX-P4-Export muss auch den komplexen Sinus-Wurzel-Bruch-Fall erzeugen.");
const sinRootTex = fs.readFileSync(sinRootOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  sinRootTex,
  new RegExp(`${p4Sin()}[\\s\\S]*\\\\pFourRoot\\{${p4Frac(`${p4("x")}${p4("\\+")}${p4("3")}`, `${p4("2")}${p4("\\+")}${p4("1")}`)}\\}`),
  "Ein Sinus ueber einer Wurzel mit innerem Bruch soll Funktionsname, Funktionsklammern und Wurzel-Bruch-Inhalt gemeinsam spaltentreu setzen."
);
assert.match(
  sinRootTex,
  new RegExp(p4Asin()),
  "Nach der trigonometrischen Umkehrung soll auch die inverse Funktion als eigener Shell-Baustein erscheinen."
);
const sinRootWidths = [...sinRootTex.matchAll(/\{\$(?:\\pFourCenterBox\{)?\\pFourCell\{([0-9.]+)\}\{\\pFourRoot\{/g)].map((match) => match[1]);
assert.ok(
  sinRootWidths.length >= 2,
  "Der Sinus-Wurzel-Fall muss mindestens die sichtbare Startwurzel und die isolierte Folge-Wurzel im Export enthalten."
);
assert.equal(
  sinRootWidths[0],
  sinRootWidths[1],
  "Dieselbe sichtbare Wurzel soll unter der Funktionshuelle und nach der Umkehrung mit identischer Breite gesetzt werden."
);
assert.doesNotMatch(
  sinRootTex,
  /\\node\[anchor=base, inner sep=0pt\] at \([^)]+\) \{\$(?:\\pFourCenterBox\{)?\\pFourCell\{[0-9.]+\}\{=\}\\pFourCell\{[0-9.]+\}\{5\}\}?\$\};/,
  "Das Gleichheitszeichen darf im komplexen Sinus-Wurzel-Fall nicht mehr mit der benachbarten 5 zu einem einzigen LaTeX-Lauf verschmolzen werden."
);

const selectiveShellColorResult = spawnSync(
  process.execPath,
  [
    exportScript,
    "sin(sqrt((x+3)/(2+1)))=5",
    "--target",
    "x",
    "--shell-colors",
    "--shell-color-kinds",
    "root,power",
    "--shell-color-hex",
    "D97706",
    "--output",
    selectiveShellColorOutput
  ],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(selectiveShellColorResult.status, 0, selectiveShellColorResult.stderr || selectiveShellColorResult.stdout);
assert.ok(fs.existsSync(selectiveShellColorOutput), "Selektive Schalenfarben muessen ueber den produktiven LaTeX-Export gerendert werden koennen.");
const selectiveShellColorTex = fs.readFileSync(selectiveShellColorOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  selectiveShellColorTex,
  /\\definecolor\{pFourShell[a-z0-9]+\}\{HTML\}\{D97706\}/i,
  "Die selektive Schalenfaerbung soll die gewuenschte Produktivfarbe im Dokument definieren."
);
assert.match(
  selectiveShellColorTex,
  /\\pFourRootC\{pFourShell[a-z0-9]+\}\{/i,
  "Die echte Wurzelschale muss direkt im produktiven Root-Fragment gefaerbt werden, waehrend ihr Inhalt als eigener Inhalt unveraendert bleibt."
);
assert.match(
  selectiveShellColorTex,
  /\\textcolor\{pFourShell[a-z0-9]+\}\{\\pFourCell\{[0-9.]+\}\{\\left\.[\s\S]*?\\right\)\^\{2\}\}\}/i,
  "Auch die Gegenschritt-Potenz muss als echte farbige Powerschale erscheinen."
);
assert.doesNotMatch(
  selectiveShellColorTex,
  /\\textcolor\{pFourShell[a-z0-9]+\}\{\\pFourCell\{[0-9.]+\}\{(?:\\sin|sin)\}\}/i,
  "Nicht ausgewaehlte Funktionsschalen duerfen bei selektiver Fokussierung ungefärbt bleiben."
);

const scaledSinRootResult = spawnSync(
  process.execPath,
  [exportScript, "2*sin(sqrt((x+3)/(2+1)))=5", "--target", "x", "--output", scaledSinRootOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(scaledSinRootResult.status, 0, scaledSinRootResult.stderr || scaledSinRootResult.stdout);
assert.ok(fs.existsSync(scaledSinRootOutput), "Der LaTeX-P4-Export muss auch den skalierten Sinus-Wurzel-Bruch-Fall erzeugen.");
const scaledSinRootTex = fs.readFileSync(scaledSinRootOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  scaledSinRootTex,
  /\\pFourFraction\{[0-9.]+em\}\{\\pFourCell\{[0-9.]+\}\{5\}\}\{\\pFourCell\{[0-9.]+\}\{2\}\}/,
  "Beim skalierten Sinusfall soll der ausgegliederte Faktor als fester P4-Bruch erhalten bleiben."
);
assert.match(
  scaledSinRootTex,
  new RegExp(`${p4Asin()}[\\s\\S]*\\\\left\\.${adaptiveDelimiterStrut(p4Frac(p4("5"), p4("2")))}\\\\right\\)`),
  "Die inverse Funktion ueber einem Bruch soll ihre rechte Funktionsklammer sichtbar um den festen P4-Bruch legen."
);

const lawOfSinesExportResult = spawnSync(
  process.execPath,
  [exportScript, "a/sin(alpha)=b/sin(beta)", "--target", "a", "--output", lawOfSinesOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(lawOfSinesExportResult.status, 0, lawOfSinesExportResult.stderr || lawOfSinesExportResult.stdout);
assert.ok(fs.existsSync(lawOfSinesOutput), "Der LaTeX-P4-Export muss auch den Sinussatz stabil erzeugen.");
const lawOfSinesTex = fs.readFileSync(lawOfSinesOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.doesNotMatch(
  lawOfSinesTex,
  /\\node\[anchor=base, inner sep=0pt\] at \([^)]+\) \{\$\\pFourCenterBox\{/,
  "Der Sinussatz soll nicht mehr ueber eine kuenstliche Mittelbox korrigiert werden, sondern direkt auf der mathematischen Achse liegen."
);
const lawOfSinesPictureMatch = lawOfSinesTex.match(/\\begin\{tikzpicture\}\[x=1em,y=-1em\]\n([\s\S]*?)\n\\end\{tikzpicture\}/);
assert.ok(lawOfSinesPictureMatch, "Der Sinussatz-Export muss eine erste produktive TikZ-Zeichnung enthalten.");
const lawOfSinesNodes = [...lawOfSinesPictureMatch[1].matchAll(
  /\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g
)].map((match) => ({
  x: Number.parseFloat(match[1]),
  y: match[2],
  latex: match[3]
}));
const lawOfSinesAxisGroups = lawOfSinesNodes.reduce((groups, node) => {
  const existing = groups.get(node.y) || [];
  existing.push(node);
  groups.set(node.y, existing);
  return groups;
}, new Map());
assert.equal(
  lawOfSinesAxisGroups.size,
  2,
  "Im sichtbaren Sinussatz sollen beide Schritte jeweils genau eine gemeinsame Achsenhoehe fuer alle Achsenknoten besitzen."
);
assert.deepEqual(
  [...lawOfSinesAxisGroups.values()].map((nodes) => nodes.length).sort((left, right) => left - right),
  [3, 7],
  "Der Startschritt soll drei Achsenknoten und der Umformungsschritt sieben Achsenknoten auf jeweils derselben Hoehe tragen."
);
const lawOfSinesGroupSummaries = [...lawOfSinesAxisGroups.values()].map((nodes) => ({
  nodeCount: nodes.length,
  fractionCount: nodes.filter((node) => node.latex.includes("\\pFourFraction{")).length,
  equalsCount: nodes.filter((node) => node.latex.includes("\\pFourCell{1.62}{=}")).length
})).sort((left, right) => left.nodeCount - right.nodeCount);
assert.deepEqual(
  lawOfSinesGroupSummaries,
  [
    { nodeCount: 3, fractionCount: 2, equalsCount: 1 },
    { nodeCount: 7, fractionCount: 1, equalsCount: 1 }
  ],
  "In beiden sichtbaren Sinussatz-Schritten muessen Brueche und Gleichheitszeichen jeweils auf derselben gemeinsamen Achsenzeile liegen."
);

const lawOfSinesAlphaResult = spawnSync(
  process.execPath,
  [exportScript, "a/sin(alpha)=b/sin(beta)", "--target", "alpha", "--output", lawOfSinesAlphaOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(lawOfSinesAlphaResult.status, 0, lawOfSinesAlphaResult.stderr || lawOfSinesAlphaResult.stdout);
assert.ok(fs.existsSync(lawOfSinesAlphaOutput), "Der LaTeX-P4-Export muss auch den Sinussatz nach alpha stabil erzeugen.");
const lawOfSinesAlphaTex = fs.readFileSync(lawOfSinesAlphaOutput.replace(/\.pdf$/, ".tex"), "utf8");
const lawOfSinesAlphaPictureMatch = lawOfSinesAlphaTex.match(/\\begin\{tikzpicture\}\[x=1em,y=-1em\]\n([\s\S]*?)\n\\end\{tikzpicture\}/);
assert.ok(lawOfSinesAlphaPictureMatch, "Der Sinussatz-Export nach alpha muss eine produktive TikZ-Zeichnung enthalten.");
const lawOfSinesAlphaNodes = [...lawOfSinesAlphaPictureMatch[1].matchAll(
  /\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g
)].map((match) => ({
  x: Number.parseFloat(match[1]),
  y: Number.parseFloat(match[2]),
  latex: match[3]
}));
const lawOfSinesAlphaNestedNode = lawOfSinesAlphaNodes.find((node) => (
  node.latex.includes("\\pFourTopAlign")
  && node.latex.includes("\\pFourCell{0.9}{a}")
));
assert.ok(
  lawOfSinesAlphaNestedNode,
  "Beim Sinussatz nach alpha muss der finale Nennerbruch als eingebetteter verschachtelter Bruch exportiert werden."
);
const lawOfSinesAlphaOuterFractionArgs = extractLatexCommandArgs(lawOfSinesAlphaNestedNode.latex, "pFourFraction");
assert.ok(
  lawOfSinesAlphaOuterFractionArgs && lawOfSinesAlphaOuterFractionArgs.length === 3,
  "Der finale Alpha-Schritt muss als echter aeusserer P4-Bruch lesbar bleiben."
);
assert.match(
  lawOfSinesAlphaOuterFractionArgs[2],
  /^\\pFourTopAlign\{[0-9.]+em\}\{[0-9.]+em\}\{\\pFourFraction\{[\s\S]*\}\}$/,
  "Wenn der neue Nenner selbst wieder ein Bruch ist, muss er im Alpha-Schritt komplett in der Nennerzone des aeusseren Bruchs gekapselt bleiben."
);
assert.equal(
  lawOfSinesAlphaOuterFractionArgs[2].startsWith("\\pFourFraction{"),
  false,
  "Der Alpha-Schritt darf den inneren Nennerbruch nicht mehr als lose zweite Bruchnode neben dem aeusseren Bruch stehen lassen."
);
const lawOfSinesAlphaInnerFractionMatch = lawOfSinesAlphaOuterFractionArgs[2].match(/\\pFourFraction\{[\s\S]*\}/);
assert.ok(
  lawOfSinesAlphaInnerFractionMatch,
  "Der im finalen Alpha-Schritt eingebettete Nennerbruch muss als eigener innerer P4-Bruch erhalten bleiben."
);
const lawOfSinesAlphaInnerFractionArgs = extractLatexCommandArgs(lawOfSinesAlphaInnerFractionMatch[0], "pFourFraction");
assert.ok(
  lawOfSinesAlphaInnerFractionArgs && lawOfSinesAlphaInnerFractionArgs.length === 3,
  "Auch der eingebettete Nennerbruch muss weiterhin sauber als P4-Bruch lesbar bleiben."
);
assert.match(
  lawOfSinesAlphaInnerFractionArgs[1],
  /\\pFourCell\{[0-9.]+\}\{b\}/,
  "Der Zaehler des eingebetteten Nennerbruchs muss das b tragen und darf nicht leer ausfallen."
);
assert.match(
  lawOfSinesAlphaInnerFractionArgs[2],
  /sin\\left\(\\beta\\right\)|\\beta/,
  "Der Nenner des eingebetteten Nennerbruchs muss sin(beta) tragen und darf nicht in eine leere Zusatzspalte abrutschen."
);
assert.doesNotMatch(
  lawOfSinesAlphaInnerFractionMatch[0],
  /\\ensuremath\{\s*\}/,
  "Beim eingebetteten Nennerbruch duerfen keine leeren Makeboxen an die Stelle des echten Inhalts treten."
);

const invertedLawOfSinesResult = spawnSync(
  process.execPath,
  [exportScript, "sin(alpha)/a=sin(beta)/b", "--target", "a", "--output", invertedLawOfSinesOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(invertedLawOfSinesResult.status, 0, invertedLawOfSinesResult.stderr || invertedLawOfSinesResult.stdout);
assert.ok(fs.existsSync(invertedLawOfSinesOutput), "Der LaTeX-P4-Export muss auch den invertierten Sinussatz stabil erzeugen.");
const invertedLawOfSinesTex = fs.readFileSync(invertedLawOfSinesOutput.replace(/\.pdf$/, ".tex"), "utf8");
const invertedLawOfSinesPictureMatch = invertedLawOfSinesTex.match(/\\begin\{tikzpicture\}\[x=1em,y=-1em\]\n([\s\S]*?)\n\\end\{tikzpicture\}/);
assert.ok(invertedLawOfSinesPictureMatch, "Der invertierte Sinussatz-Export muss eine erste produktive TikZ-Zeichnung enthalten.");
const invertedLawOfSinesNodes = [...invertedLawOfSinesPictureMatch[1].matchAll(
  /\\node\[anchor=base, inner sep=0pt\] at \(([^,]+),([^)]+)\) \{\$([\s\S]*?)\$\};/g
)].map((match) => ({
    x: Number.parseFloat(match[1]),
    y: Number.parseFloat(match[2]),
    latex: match[3]
}));
const invertedNestedFractionNode = invertedLawOfSinesNodes.find((node) => node.latex.includes("\\pFourTopAlign"));
assert.ok(
  invertedNestedFractionNode,
  "Der invertierte Sinussatz muss einen finalen verschachtelten Bruchknoten mit expliziter Oberkanten-Ausrichtung erzeugen."
);
const invertedOuterFractionArgs = extractLatexCommandArgs(invertedNestedFractionNode.latex, "pFourFraction");
assert.ok(
  invertedOuterFractionArgs && invertedOuterFractionArgs.length === 3,
  "Der finale invertierte Sinussatzknoten muss als echter aeusserer P4-Bruch lesbar bleiben."
);
assert.match(
  invertedOuterFractionArgs[2],
  /^\\pFourTopAlign\{[0-9.]+em\}\{[0-9.]+em\}\{\\pFourFraction\{[\s\S]*\}\}$/,
  "Wenn ein sichtbarer Bruch als Nenner eines neuen Bruchs auftaucht, muss er an der Oberkante der Nennerzone andocken statt wieder ungebunden mittig in der Zone zu schweben."
);
assert.equal(
  invertedOuterFractionArgs[2].startsWith("\\pFourFraction{"),
  false,
  "Der invertierte Sinussatz darf den inneren Nennerbruch nicht mehr ohne expliziten Oberkanten-Anker in den neuen Nenner setzen."
);
const invertedTopAlignArgs = extractLatexCommandArgs(invertedOuterFractionArgs[2], "pFourTopAlign");
assert.ok(
  invertedTopAlignArgs && invertedTopAlignArgs.length === 3,
  "Die Oberkanten-Ausrichtung des verschachtelten Nennerbruchs muss ihre drei expliziten Parameter tragen."
);
assert.match(
  invertedTopAlignArgs[2],
  /^\\pFourFraction\{[0-9.]+em\}\{[\s\S]*?\}\{[\s\S]*?\}$/,
  "Die Top-Align-Huelle des invertierten Sinussatzes muss den inneren Nennerbruch komplett kapseln."
);
const invertedStartAlphaOverANode = invertedLawOfSinesNodes.find((node) => (
  node.latex.includes("\\pFourFraction{")
  && /\\pFourCell\{[0-9.]+\}\{\\alpha\}/.test(node.latex)
  && /\\pFourCell\{[0-9.]+\}\{a\}/.test(node.latex)
  && !node.latex.includes("\\pFourTopAlign")
));
assert.ok(
  invertedStartAlphaOverANode,
  "Der invertierte Sinussatz muss den linken Startbruch als Referenzspur fuer die Spaltentreue enthalten."
);
assert.ok(
  Math.abs(invertedNestedFractionNode.x - invertedStartAlphaOverANode.x) <= 0.001,
  "Der finale verschachtelte Aussenbruch muss horizontal auf derselben Spaltenspur bleiben wie der linke Startbruch und darf nicht in das Gleichheitszeichen driften."
);

const nestedDenominatorTargetResult = spawnSync(
  process.execPath,
  [exportScript, "sin(sqrt((2+1)/x))=5", "--target", "x", "--output", nestedDenominatorTargetOutput],
  { cwd: projectRoot, encoding: "utf8" }
);
assert.equal(nestedDenominatorTargetResult.status, 0, nestedDenominatorTargetResult.stderr || nestedDenominatorTargetResult.stdout);
assert.ok(fs.existsSync(nestedDenominatorTargetOutput), "Der LaTeX-P4-Export muss auch den verschachtelten Nennerzielfall erzeugen.");
const nestedDenominatorTargetTex = fs.readFileSync(nestedDenominatorTargetOutput.replace(/\.pdf$/, ".tex"), "utf8");
assert.match(
  nestedDenominatorTargetTex,
  /\\node\[anchor=base, inner sep=0pt\] at \([^)]+\) \{\$(?:\\pFourCenterBox\{)?\\pFourCell\{[0-9.]+\}\{=\}\}?\$\};/,
  "Wenn ein freigelegter Zaehlerausdruck aus dem Bruch austritt, muss das Gleichheitszeichen als eigener Slotknoten gesetzt werden und darf nicht in einem kompakterten LaTeX-Lauf verschwinden."
);
assert.doesNotMatch(
  nestedDenominatorTargetTex,
  /\\node\[anchor=base, inner sep=0pt\] at \([^)]+\) \{\$(?:\\pFourCenterBox\{)?\\pFourCell\{0\.9\}\{2\}\\pFourCell\{0\.9\}\{\+\}\\pFourCell\{0\.88\}\{1\}\\pFourCell\{[0-9.]+\}\{=\}\}?\$\};/,
  "Auch im verschachtelten Nennerzielfall darf der Exporter die Summenfolge links nicht mehr mit dem Gleichheitszeichen zu einem gemeinsamen LaTeX-Block zusammenziehen."
);
assert.match(
  nestedDenominatorTargetTex,
  /\\pFourFraction\{[0-9.]+em\}\{\\makebox\[[0-9.]+em\]\[c\]\{\\ensuremath\{\\pFourCell\{[0-9.]+\}\{2\}\\pFourCell\{[0-9.]+\}\{\+\}\\pFourCell\{[0-9.]+\}\{1\}\}\}\}\{/,
  "Auch innerhalb eines neu aufgebauten Bruchs muss der Zaehlerausdruck als kompakter Block zentriert bleiben und darf nicht ueber die Breite des Nenners aufgefaechert werden."
);

console.log("LaTeX-P4-Export erfolgreich geprueft.");
