# GenesisRuntime P4 Projection Contract

Status: normativer Phasenvertrag
Stand: 16. September 2026

## Aufgabe
`P4_Projection` ist eine Phase aus mehreren geordneten Prozessmodulen.
Gemeinsam erzeugen sie die einzige Projektionswahrheit des neuen Kerns.

P4 als Phasenname ist deshalb kein Freibrief fuer ein Sammelmodul.
Jeder interne Prozessschritt besitzt weiterhin genau eine Aufgabe,
eine eigene Richtlinie,
einen Ein- und Ausgabevertrag
und eine Situationsmatrix.

## Uebergabe der Phase

- Vorgaenger: abgeschlossene P2/P3-Laufhistorie der Runtime-Pipeline
- erste interne Instanz: `buildTheoryRows`
- Ausgabe der Phase: vollstaendiger P4 Output Contract
- Nachfolger: reine Schema-Adapter und Renderer

P4 darf nur vollstaendige funktionale Geometrie ausgeben.
Fehlende Pflichtgeometrie ist ein P4-Vertragsfehler
und darf nicht als reparierbare Renderaufgabe weitergereicht werden.

## Kette

1. `buildTheoryRows.js`
2. `buildShellBlueprints.js`
3. `buildGlobalSemanticRaster.js`
4. `refineSemanticRaster.js`
5. `localizeProjectionGeometry.js`
6. `buildProjectionBlocks.js`
7. `writeProjectionRows.js`
8. `buildOutputContract.js`

Diese Reihenfolge ist normativ.
Die funktionale Geometrie muss von innen nach aussen fertig sein,
bevor Projektionsbloecke und Writer sie konsumieren.

`buildShellBlueprints.js` beschreibt nur den koordinatenfreien Zellbedarf.
`buildGlobalSemanticRaster.js` und `refineSemanticRaster.js` vergeben und
validieren danach die endgueltigen horizontalen Zellen genau einmal.
`localizeProjectionGeometry.js` darf keine horizontale Zelle mehr veraendern.
`buildOutputContract.js` darf keine neue Spalten- oder Ankergeometrie berechnen.
Eine Abweichung der Implementierungsreihenfolge ist ein Vertragsfehler.

## Situationsregel der internen Module

Jedes interne P4-Modul fuehrt in seiner lokalen Richtlinie
fuer jede sichtbare oder transportierte Schalenart einen der Zustaende:

- `unterstuetzt`
- `durchreichen`
- `zurueckweisen`

Dabei verweist es auf den kanonischen Schalenstandard.
Ein gemeinsamer P4-Sonderfall darf nicht gleichzeitig Raster,
Blueprint,
funktionale Geometrie,
Writer
und Output-Vertrag besitzen.

## Verantwortet
- Theoriezeilenfolge aus dem neuen Runtime-Verlauf
- globale Inhaltsspuren pro Gleichungsseite
- sichtbare Schalen als koordinatenfreie Zellbedarfs-Blueprints
- endgueltige Atom-, Huelle- und Zukunftszellen im globalen Zellprofil
- funktionale Schalen-, Kind-, Band-, Reihen- und Achsenbeziehungen bottom-up aus diesen festen Zellen
- geschlossene sichtbare Transportbloecke, wenn eine Schale im aktuellen Umformungsschritt optisch geschlossen bleibt
- vertikale Relativzeilen fuer Brueche und weitere Schalen
- explizite Projektionsatome mit stabilen Rueckbindungen
- eine explizite Darstellungsform pro Schale und Theoriezeile

## Exportwahrheiten
`P4_Projection` exportiert nie nur eine einzige Sicht auf denselben Inhalt.

Es liefert gleichzeitig:

1. die atomare Wahrheitslage
2. die Schalengeometrie
3. falls noetig die geschlossene sichtbare Blockform
4. die explizite Entscheidung, welche Form in dieser Zeile sichtbar ist

### 1. Atomare Wahrheitslage
- jedes sichtbare Atom behaelt seine Identitaet
- jedes sichtbare Atom behaelt seine logische Zeile und Spalte
- ein inhaltliches Atom wird genau einmal als Display-Atom ausgegeben
- ein einzelnes kuerzeres Bruchkind erhaelt genau eine funktionale Zelle, deren
  Grenzen das von P4 bestimmte Bruchband tragen; `col` bleibt davon getrennt
  seine Identitaetsspur innerhalb der Zelle
- Durchreichen bedeutet, dass diese Orte ohne Neudeutung weitergegeben werden
- Operatoratome aus `NEGATION`, `MULTIPLICATION`, `ADDITION` und `SUBTRACTION`
  werden als eigene atomare Projektionszellen exportiert
- `POWER.exponentNodes` werden als eigene atomare Projektionszellen
  in der funktionalen Exponentenreihe exportiert
- ein Renderer darf weder Operator noch Exponent aus einer Shellbeschriftung ersetzen

### 2. Schalengeometrie
- jede sichtbare Schale bekommt ihr Blueprint-Band
- dazu gehoeren mindestens Inhaltsband, Ausrichtungsband und Huelleband
- bei `DIVISION` bestimmt der laengere fertige Kindblock das gemeinsame
  Bruchband; der kuerzere fertige Kindblock wird genau einmal darin zentriert
- `collectionRanges` bleiben tatsaechliche Belegung, waehrend
  `collectionAlignmentRanges` das fuer Zaehler und Nenner gemeinsame
  Bruchband ausweisen
- die tatsaechliche Belegung eines Bruchkindes umfasst nur dessen in dieser
  Theoriezeile aktiven Spurabschnitte; ein spaeter nach algebraischem Umzug
  neu geborener Abschnitt derselben semantischen Identitaet darf die fruehere
  Belegung nicht verbreitern
- diese Geometrie wird im Geburtsmoment festgelegt und danach nur noch transportiert
- innere Schalen sind vollstaendig fertig, bevor eine aeussere Schale um sie gebaut wird
- eine aeussere Schale darf einen fertigen Kindblock bei ihrer erstmaligen Geburt nur
  mit den bereits im globalen Zellprofil zugewiesenen Aussenzellen umschliessen;
  die absolute Lage aller enthaltenen Blaetter und Schalen steht vor diesem Schritt fest
- `shellId` ist die stabile Schalenidentitaet
- `rowId + shellId` ist nur das zeilenlokale Auftreten dieser Schale
- getrennte Huelleprimitive derselben Schale besitzen getrennte funktionale
  Zellen; bei `ROOT` duerfen sich Hook- und Overbar-Slot nicht ueberdecken
- jede `POWER` besitzt zwei eigene Basis-Klammer-Slots; sie stehen disjunkt um
  den vollstaendigen Basisblock und vor dem Exponentenblock. Ihre vom Core
  bestimmte gemeinsame Sichtbarkeit bleibt Teil der funktionalen Geometrie;
  unsichtbare Slots bleiben im Zellprofil, erweitern aber nicht die sichtbare
  `containerRange` der Schale
- eine `FUNCTION` mit optionaler Basis besitzt zwei getrennte Kindbloecke:
  Basis und Argument. Das globale Profil ordnet sie strikt als
  `function_name < baseContent < function_left_paren < content < function_right_paren`;
  die Basis darf weder dem Argumentband zugerechnet noch hinter die linke
  Klammer gesetzt werden

### 3. Geschlossene sichtbare Blockform
- wenn eine Schale im aktuellen Umformungsschritt algebraisch geschlossen bleibt, darf sie zusaetzlich als geschlossener sichtbarer Block exportiert werden
- dieser Block ersetzt nie die Innenatome
- er beschreibt nur die sichtbare Gesamtform, die der Renderer direkt zeichnen darf
- sobald die Schale spaeter geoeffnet wird, bleiben die bereits bekannten Innenatome die einzige Quelle der Innenordnung
- wenn eine bereits geborene passive Schale spaeter nur in eine neue aeussere Schale eingehaengt wird
  - bleiben `shellId`, Inhaltsband, Ausrichtungsband und Huelleband identisch
  - nur die neue aeussere Schale bekommt eine eigene Geburtsgeometrie
  - der Writer und der Renderer duerfen diese uebernommene Schale nicht neu verankern
- wird eine Schale spaeter semantisch geoeffnet, wird ihre Huelle nicht weitertransportiert
  - unveraenderte sichtbare Blaetter derselben Gleichungsseite behalten anhand ihrer IDs
    die nach der urspruenglichen Seitenlokalisierung festgeschriebene Geburtsspalte
  - ein einzelnes freigelegtes Blatt benoetigt dafuer keine kuenstliche Transportschale

### 4. Explizite Darstellungsform

Der Core legt pro Auftreten fest,
ob atomare Innenprimitive,
eine geschlossene Blockform
oder eine andere vertraglich benannte Form sichtbar gesetzt wird.

Der Renderer darf diese Wahl nicht aus `state`, Text oder Nachbarschaft ableiten.
Atomare Wahrheit und geschlossene Blockform duerfen gleichzeitig im Vertrag existieren,
aber nur die explizit gewaehlte Form wird sichtbar gezeichnet.

## Funktionale und visuelle Geometrie

P4 besitzt die funktionale Geometrie:

- semantische Spuren
- Kindzugehoerigkeit
- Inhalts-, Ausrichtungs- und Huellebaender
- funktionale Reihen und Achsen
- logische Primitive und ihre Spannen

Renderer besitzen nur die visuelle Geometrie:

- Abbildung vorhandener Spuren auf Pixel, `em` oder Papier
- Font- und Glyphenmetriken innerhalb des gelieferten funktionalen Rahmens
- Strichstaerken, Farbe und Ausgabemedium

Eine physische Messung darf die funktionale Geometrie weder erweitern noch korrigieren.

## Teilmodul Theoriezeilenaufbau

Die fuehrende Richtlinie fuer `buildTheoryRows.js` ist:

- `THEORY_ROWS_CONTRACT.md`

## Richtlinien aller internen Prozessmodule

- `THEORY_ROWS_CONTRACT.md`
- `GLOBAL_SEMANTIC_RASTER_CONTRACT.md`
- `SEMANTIC_RASTER_REFINEMENT_CONTRACT.md`
- `SHELL_BLUEPRINTS_CONTRACT.md`
- `LOCAL_GEOMETRY_CONTRACT.md`
- `PROJECTION_BLOCKS_CONTRACT.md`
- `PROJECTION_WRITER_CONTRACT.md`
- `OUTPUT_CONTRACT.md`

## Darf nicht
- semantische Umformungen neu entscheiden
- fehlende P1- oder P3-Schalen aus flachen Atomen rekonstruieren
- Inhalte ausserhalb der einmaligen `DIVISION`-Geburtsgeometrie lokal
  zentrieren oder einzelne Kindatome statt des fertigen Kindblocks verschieben
- nach Abschluss des globalen Zellprofils irgendein `colStart`, `col` oder `colEnd` veraendern
- Shell-Geometrie spaeter im Writer retten
- geschlossene sichtbare Bloecke erst spaeter im Writer oder Renderer erraten
- funktionale Kind-, Band-, Reihen- oder Achsengeometrie an Adapter oder Renderer delegieren
- bereits geborene Kindgeometrie zeilenweise neu zentrieren
- Altpfade importieren
