# LaTeX-P4-Rendering

Stand: 11. September 2026

## Vorrangiger atomarer Uebergangsstandard

Bis ein spaeterer typografischer Schoensatzmodus durch einen eigenen
Aequivalenzvertrag bewiesen ist, gilt produktiv:

```text
1 Worksheet-Zelle -> 1 LaTeX-/TikZ-Primitiv
```

- Text-, Operator- und Exponentenzellen werden einzeln gesetzt.
- `fraction_line`, `root_hook` und `root_overbar` werden jeweils als genau ein
  Linien- oder Huelleprimitiv auf ihrer gelieferten Spanne gezeichnet.
- Klammerprimitive bleiben eigene Zellen; ihre Kurvenhoehe ist rein visuelle
  Tinte innerhalb der gelieferten Shell-Metadaten.
- Kein Renderer darf Kinder konsumieren und daraus eine gemeinsame
  `\frac`, `\sqrt`-, Potenz- oder Funktionszelle erzeugen.
- Leerer Text ist bei einem expliziten Linienprimitiv kein Grund, die Zelle
  wegzulassen.

Fuer die physische Position gilt ebenfalls eine reine Abbildung:

- gleiche `sourceAtomId`, gleiche Gleichungsseite und gleicher Prozessraum
  bedeuten in allen Folgezeilen dasselbe physische Slotzentrum
- ein Seitenwechsel beginnt gemaess P4 eine neue Geburtslage
- der explizite Wechsel von A1 nach Bridge-B-Landing beginnt genau einmal einen
  neuen Prozessraum; A2 uebernimmt danach die Landing-Zentren unveraendert
- Textbreite, Klammerhoehe oder Bruchbreite einer einzelnen Zeile duerfen kein
  bereits festgelegtes Atomzentrum verschieben

Die weiter unten beschriebene zusammengesetzte Festzellen-Technik dokumentiert
den frueheren beziehungsweise einen moeglichen spaeteren Schoensatzmodus. Sie
ist waehrend des atomaren Referenzbetriebs nicht der produktive Ausgabevertrag.

## Historische Erkenntnis zum zusammengesetzten Schoensatz

LaTeX allein loest unser Darstellungsproblem nicht. Wenn ein ganzer rechter Ausdruck nur als normale Formel wie `\frac{5-3}{a}` gesetzt wird, berechnet LaTeX die inneren Abstaende neu. Dann ist der Ausdruck mathematisch sauber, aber nicht mehr P4-spaltentreu.

Der Fortschritt liegt in der Kombination:

- P4 bestimmt weiterhin die globalen Orte.
- LaTeX zeichnet weiterhin die visuelle Tinte bereits funktional beschriebener Schalen.
- Innerhalb solcher Schalen werden P4-Spalten als feste LaTeX-Zellen erhalten.

## Was anders ist

Die erste sichtbare Verbesserung kam durch feste P4-Zellen im LaTeX-Bruch:

```latex
\newcommand{\pFourCell}[1]{\makebox[2.7em][c]{\ensuremath{#1}}}

\frac{
  \pFourCell{5}\pFourCell{-}\pFourCell{3}
}{
  \pFourCell{}\pFourCell{a}\pFourCell{}
}
```

Damit darf LaTeX den Bruch setzen, aber nicht die P4-Orte der inneren Atome zusammenziehen. In diesem Beispiel bleiben `5`, `-`, `3` auf den Spalten `6`, `7`, `8`, und `a` sitzt in der mittleren Spalte `7`.

## Regel

Ein mathematischer Block darf als LaTeX-Formel gesetzt werden, aber sobald er P4-Spalten enthaelt, muessen diese Spalten in der Formel selbst als feste Zellen erhalten bleiben.

Kurz:

```text
P4 setzt die funktionale Schale und ihren Ort.
LaTeX setzt ihre visuelle Tinte.
Feste P4-Zellen erhalten die Spaltentreue innerhalb der Schale.
```

## Physische Spaltenverdichtung

P4-Spalten sind semantische Orte. Sie duerfen im Kern nicht verschwinden, weil sie die Positionstreue ueber den ganzen Loesungsprozess tragen. Die Papierausgabe braucht danach aber eine zweite, physische Spaltenkarte.

Regel:

```text
Semantische P4-Spalte bleibt erhalten.
Physische Renderbreite wird am Ende aus sichtbarem Bedarf berechnet.
Nie sichtbar benoetigte Hilfsspalten duerfen auf 0em kollabieren.
```

Beispiel: Ein impliziter Malpunkt kann intern als eigene Spalte existieren. Wenn er ueber alle Loesungszeilen nie sichtbar gesetzt wird, braucht diese Spalte auf Papier keine Breite. Wird der Malpunkt dagegen irgendwo sichtbar, bekommt seine Spalte nur die Breite, die fuer den sichtbaren Punkt plus Lesepuffer noetig ist.

Der LaTeX-Exporter baut deshalb nach dem ViewModel eine physische Spaltenkarte:

```text
P4:       col, colStart, colEnd
Export:   widths[], starts[], centerX(col)
```

Damit sind die Schichten sauber getrennt:

- P4 entscheidet, welches Atom an welchem semantischen Ort steht.
- Die Spaltenbreiten-Komponente entscheidet aus atomaren Minimalbreiten, explizit gelieferten Shell-Slots und konfigurierbaren visuellen Abstaenden, wie viel Papierbreite dieser Ort wirklich braucht.
- Feste P4-Zellen innerhalb von Bruechen, Wurzeln und Gruppen bekommen diese berechneten Breiten als Parameter.

Aktueller Modularisierungsstand:

```text
components/Arbeitsblatt_Druckansicht/columnLayoutCore/
```

Dort liegen jetzt getrennt:

- `atomWidthCatalog.js`: explizite Liste der bekannten Atombreiten
- `columnLayoutProfile.js`: atomare Minimalbreiten und Breitenwerte fuer bereits definierte Shell-Slots
- `columnTopology.js`: Abbildung explizit gelieferter funktionaler Shell-Slots
- `columnWidthAtoms.js`: physische Breite sichtbarer Atome in bereits bekannten Spalten
- `columnWidths.js`: globaler Aufbau visueller `widths[]` und `starts[]`
- `displayColumnLayout.js`: physische Display-Slot-Karte fuer den Export

Die bisherigen Top-Level-Dateien in `components/Arbeitsblatt_Druckansicht/` bleiben nur als duenne Re-Export-Fassaden erhalten.

Die ausdrueckliche Prozessbeschreibung fuer diese Kette liegt jetzt in:

```text
docs/Architecture/COLUMN_LAYOUT_PIPELINE.md
```

## Produktiver Export

Der wiederholbare Export liegt in:

```text
scripts/export_projection_pdf.mjs
```

Der produktive atomare Exportkern liegt in:

```text
scripts/export_projection_pdf_core/
```

Dort liegen nur die Richtlinie, die Fassade und der atomare LaTeX-/TikZ-Renderkern.
Die frueheren Sammelrenderer-Helfer `shared.js` und `stepLayout.js` sind unter
`alt/2026-09-10_pre_atomic_latex_exporter/` archiviert und duerfen von keinem
produktiven Skript importiert werden.

`scripts/export_projection_pdf.mjs` bleibt nur noch die CLI-Huelle. Die Breitenregeln selbst sollen kuenftig weiter in `columnLayoutCore/` entwickelt werden, nicht mehr verstreut im PDF-Skript.

Beispiel:

```bash
npm run export:pdf -- "a*x+3=5" --target x
```

Die Ausgabe landet unter:

```text
Projektstand/pdf/
```

Die PDF enthaelt zwei Seiten:

- saubere LaTeX-Ausgabe
- dieselbe Ausgabe mit P4-Raster

## Struktureller LaTeX-Serializer

Der Exporter darf keine mathematische Zelle ueber den reinen Anzeigetext setzen,
sobald eine explizite Core-Darstellungsform vorhanden ist.
Sonst gehen gelieferte Schalen verloren:

- `ROOT` wird faelschlich zu `sqrt(x + 3)` statt zu `\sqrt{x + 3}`.
- eine verschachtelte Division in einer Potenz wird faelschlich zu `((5) / (2))^2` statt zu `\left(\frac{5}{2}\right)^{2}`.

Regel fuer den Export:

```text
Wenn eine explizite Darstellungsform vorhanden ist: diese mechanisch nach LaTeX abbilden.
Wenn eine sichtbare P4-Bruchachse vorhanden ist: Zaehler/Nenner zusaetzlich mit festen P4-Zellen setzen.
```

Damit ist der Slash-Fehler ein Exportfehler, kein Rechenfehler.

## Keine automatische Skalierung

LaTeX skaliert verschachtelte Brueche normalerweise kleiner, zum Beispiel wenn `\frac{5}{2}` in einer Potenz steht. Fuer uns ist das keine harmlose Typografie, weil derselbe mathematische Ausdruck dadurch je nach Zeile anders aussieht.

Regel:

```text
Ein P4-Ausdruck muss seine Projektionsgroesse behalten, auch wenn er in eine neue mathematische Schale wandert.
```

Darum setzt der LaTeX-Exporter verschachtelte Brueche ebenfalls als feste P4-Bruchbox:

```latex
\left(\displaystyle\frac{\pFourCell{5}}{\pFourCell{2}}\right)^{2}
```

Nicht erlaubt ist fuer solche P4-Ausdruecke die normale LaTeX-Form `\left(\frac{5}{2}\right)^2`, weil LaTeX sie kleiner setzen darf.

## Root-Span als P4-Vertrag

Bei `2*sqrt(x+3)=5` exportiert P4 die sichtbare Wurzelschale als Span ueber die spaeter befreiten Kind-Spalten. Im geprueften Fall liegt die Wurzel auf `colStart=3` bis `colEnd=5`; nach dem Wurzelabbau stehen `x`, `+`, `3` auf `3`, `4`, `5`. Der Renderkern darf diesen Span nutzen, aber nicht selbst erraten.

## Gruppen-Span im komplexen Fall

Der komplexere Prueffall `2*sqrt((x+3)/(2+1))=5` zeigt, dass nicht nur Wurzeln, sondern auch Gruppen als Spans projiziert werden muessen. Sonst wuerde `x + 3` im Bruch als eine einzige Zelle erscheinen und erst nach `group_release` auffaechern.

Aktuelle Regel:

```text
GROUP ist eine im Core geborene sichtbare Schale mit explizitem Inhalts- und Huelleband.
Der Renderkern darf die gelieferten Klammerprimitive setzen, muss die Kinder aber als P4-Zellen erhalten.
```

Beispiel im LaTeX-Export:

```latex
\sqrt{\displaystyle\frac{\left(\pFourCell{x}\pFourCell{+}\pFourCell{3}\right)}{\left(\pFourCell{2}\pFourCell{+}\pFourCell{1}\right)}}
```

## Schalen-Tinte zaehlt zur Breite

Die semantischen P4-Spalten duerfen nicht nur den Inhalt einer Schale rechnen. Auch die sichtbare Tinte der Schale selbst braucht Raum: Klammern, Wurzelhaken, Bruchrand und Potenzklammern koennen sonst in Nachbarspalten laufen.

Regel:

```text
Atom-Ort:                    funktionale P4-Spalte
Schalen-Slot und -Spanne:    funktionale P4-Geometrie
Schalen-Tinte und Ueberstand: visuelle Renderer-Geometrie
```

Das ist besonders wichtig bei Ausdruecken wie `(x+3)/(2+1) = (5:2)^2`. Ohne Randreserve bleiben die P4-Spalten zwar korrekt, aber die gedruckten Klammern oder Potenzklammern koennen optisch ueber das Gleichheitszeichen oder den naechsten Faktor laufen.

Die Diagnose-Seite und die Reinschrift verwenden dieselben Koordinaten. Die Diagnose-Seite legt nur Spaltennummern und Hilfslinien darueber bzw. dahinter. Geltend fuer den Ausdruck ist die Reinschrift; die Rasterseite ist das Pruefwerkzeug.

## Produkt-Schalen nicht als Einzelbox

Eine erzeugte Multiplikation wie `(5:2)^2(2+1)` darf in der Projektion nicht als ein einzelnes breites LaTeX-Objekt in einer P4-Spalte landen. Sonst wird die Box um ihre Mitte gesetzt und ragt nach links in die Spalte des Gleichheitszeichens.

Regel:

```text
Falsch:  eine breite MULTIPLICATION-Box auf col 9
Richtig: product_content auf col 9, product_factor rechts daneben
```

Wenn der Multiplikationspunkt sichtbar noetig ist, zum Beispiel bei `5*2`,
muss P4 ihn als `product_operator` mit eigener funktionaler Spur exportieren.
Wenn die Multiplikation fachlich implizit dargestellt werden soll,
muss ebenfalls P4 diese Darstellungsform explizit festlegen.
Der Exporter darf die Entscheidung nicht aus den Nachbaratomen ableiten.

Damit bleibt das Gleichheitszeichen eine eigene Spalte, und der rechte Ausdruck kann nicht mehr durch eine zentrierte Gesamtbox nach links ueber das `=` laufen.

## Naechste Prueffragen

- Traegt das feste Zellenprinzip fuer einfache Brueche wie `2*x=5`?
- Traegt es fuer breite Zaehler wie `a*x+3=5`?
- Traegt es fuer Bruchketten wie `sin(x)/(2a)=5`?
- Soll dasselbe Span-Prinzip nach Wurzeln und Gruppen auch fuer Funktionen und Potenzen verbindlich gemacht werden?
