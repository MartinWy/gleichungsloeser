# Phasenkette P1 bis Renderer

Status: normativ
Stand: 15. September 2026

## Zweck
Dieses Dokument beschreibt die harte Abgrenzung der Hauptphasen.

Es beantwortet nicht:
- welche Familie mathematisch im Detail wie arbeitet
- wie ein einzelnes P4-Modul intern aufgebaut ist

Es beantwortet:
- welche Phase welche Frage beantworten darf
- welche Phase welche Frage nicht beantworten darf
- in welcher Form eine Wahrheit an die naechste Phase uebergeben wird

## Verbindliche Begriffe

In diesem Dokument bedeutet:

- `Prozessschritt`: eine Aufgabe der Pipeline mit genau einem Modul-Eigentuemer
- `Umformungsschritt`: ein algebraischer Uebergang zwischen zwei Theoriezeilen
- `Situation`: eine strukturierte Kombination aus Schalentyp, Zielrolle, Seite und Zustand
- `Fallregel`: der Umgang genau eines Prozessmoduls mit genau einer Situation

Addition, Multiplikation, Bruch, Wurzel und weitere Schalentypen
sind keine zusaetzlichen Prozessschritte.
Sie durchlaufen dieselbe Prozesskette
und werden in jeder Phase nur gemaess der dortigen Modulaufgabe behandelt.

Die ausfuehrliche Norm steht in:

- `PROZESSMODELL_UND_SCHALENSTANDARD.md`

## Oberregel
Die Kette ist strikt:

1. `P1` liest und strukturiert.
2. `P2` entscheidet die naechste zulaessige Umformungsentscheidung.
3. `P3` baut die naechste Theoriezeile.
4. `P4` erzeugt die einzige positionstreue Projektionswahrheit.
5. Renderer, PDF, Film und weitere Medien machen diese Wahrheit nur sichtbar.

Wenn spaeter eine Phase etwas "rekonstruieren" muss,
was frueher haette festgelegt werden muessen,
dann ist die Kette verletzt.

Dasselbe gilt fuer Logik zwischen den Phasen:
Ein Orchestrator darf die Module aufrufen,
wiederholen,
beenden
und Fehler transportieren.
Er darf zwischen zwei benannten Uebergaben keine semantische Struktur normalisieren,
keine Umformungsentscheidung nachbessern
und keine funktionale Geometrie vorberechnen.

Jeder Phasenuebergang liefert entweder:

- einen vollstaendig gueltigen Zustand des benannten Uebergabevertrags
- oder einen expliziten Vertragsfehler ohne fachliche Ersatzausgabe

Zusaetzlich gilt fuer jede Phase:

```text
Richtlinie -> Testvertrag -> Code -> gruener Beweis
```

Eine Grundregel wird zuerst in Genesis dokumentiert.
Erst danach werden lokale Richtlinie,
Test und Code angepasst.

## Zwei Geometrien, eine eindeutige Grenze

`P4` erzeugt die funktionale Geometrie.

Sie beschreibt:

- Schachtelung
- Kindzugehoerigkeit
- Spuren und Baender
- Teilzeilen und Achsen
- sichtbare Huelleprimitive und ihre funktionalen Spannen

Der Renderer erzeugt die visuelle Geometrie.

Sie beschreibt:

- Pixel-, `em`- oder Papiermasse
- Fontmetriken
- konkrete Zeichenpfade
- Strichstaerke, Farbe und Skalierung

Der Renderer baut die visuelle Geometrie auf Basis der funktionalen Geometrie.
Er darf sie nicht fachlich korrigieren,
ergaenzen oder neu deuten.

## P1 Eingabe
### Aufgabe
`P1` liest den Eingabestring und erzeugt die kanonische Anfangsstruktur.

### Eingabe
- Gleichung als String
- kanonische Schreibkonventionen des Systems

### Ausgabe
- Atome
- Operatoren
- Schalen
- stabile IDs
- Sichtbarkeit des Ausgangszustands

### Darf
- parsen
- normalisieren
- stabile Identitaeten vergeben
- kanonische Strukturformen herstellen

### Darf nicht
- den naechsten Loeseschritt bestimmen
- die Struktur schon umformen
- Spalten, Achsen oder sichtbare Breiten bestimmen

### Kurzform
`P1` beantwortet nur:
"Was ist semantisch in der Eingabe enthalten?"

Insbesondere bestimmt `P1`,
welcher Eingabeterm Kind welcher Eingabeschale ist.

Seine Fallregeln muessen fuer jede von `P1` beanspruchte Schalenart
auf den kanonischen Schalenstandard verweisen.

## P2 Strategie_Analyse
### Aufgabe
`P2` waehlt genau die naechste zulaessige Umformungsentscheidung.

### Eingabe
- aktuelle kanonische Struktur
- Zielvariable

### Ausgabe
- genau eine Familien-Decision
- oder `null`, wenn der vertraglich definierte Endzustand erreicht ist

### Darf
- aktive Seite bestimmen
- aeusserste wirksame Huelle lesen
- genau eine Loesefamilie und ihre Metadaten auswaehlen

### Darf nicht
- die Struktur veraendern
- inverse Schalen schon erzeugen
- Spalten oder visuelle Projektion bestimmen

### Kurzform
`P2` beantwortet nur:
"Was ist der naechste semantisch zulaessige Umbau?"

## P3 Umformung
### Aufgabe
`P3` setzt genau die Decision aus `P2` strukturell um.

### Eingabe
- aktuelle Struktur
- explizite Decision aus `P2`

### Ausgabe
- naechste Theoriezeile
- sichtbare und unsichtbare Spuren
- freigelegte Inhalte
- erzeugte inverse Gegenschalen

### Darf
- Struktur klonen und umbauen
- Sichtbarkeiten setzen
- inverse Schalen erzeugen
- Herkunftsmetadaten und stabile Beziehungen erhalten

### Darf nicht
- die Strategie neu erfinden
- horizontale oder vertikale Layoutfragen beantworten
- Bruchstrichlaengen, Klammerbreiten oder Achsenlagen bestimmen

### Kurzform
`P3` beantwortet nur:
"Wie sieht der naechste semantische Gleichungszustand aus?"

Insbesondere bestimmt `P3`,
welche Schachtelung durch den Umbau erhalten,
geoeffnet,
transportiert
oder neu erzeugt wird.

## Uebergang von P3 zu P4
Hier liegt die wichtigste Trennlinie.

`P1` bis `P3` erzeugen nur die semantische Umbaugeschichte.
Bis hier existiert noch keine positionstreue Sichtausgabe.

`P4` bekommt deshalb nicht eine Einzelzeile,
sondern die gesamte Folge der Theoriezeilen.

Im aktiven Tabula-rasa-Neustart gibt es dafuer genau eine Pipeline:
- `core/GenesisRuntime/runtimePipeline.js`

Diese Pipeline darf:
- Theorie-History in `theoryRows` ueberfuehren
- den Projektionspfad aufrufen
- den verbindlichen Exportvertrag bauen

Diese Pipeline darf nicht:
- neue semantische Regeln erfinden
- Spaltenwahrheit lokal korrigieren
- eine zweite Deutung zwischen `P3` und `P4` einschieben

Nur so kann der Proflight sehen:
- was durch alle Zeilen hindurch stehen bleibt
- was die Gleichungsseite wechselt
- welche Schalen spaeter sichtbar werden
- welche Spalten und Shell-Slots schon am Anfang reserviert werden muessen

## P4 Projektion
### Aufgabe
`P4` erzeugt die einzige positionstreue Ortswahrheit des Systems.

### Eingabe
- gesamte Theoriezeilenfolge aus `P3`

### Ausgabe
- explizite Projektionsstruktur
- globale Inhaltsspuren
- sichtbare Schalenprojektionen
- Teilzeilen und Achsen
- Output Contract fuer alle Medien

### Oberregel
`P4` beantwortet alles,
was mit Ort, Spur, Achse, Shell-Spanne und Projektion zu tun hat.

Spaetere Medien duerfen das nicht neu entscheiden.

## P4.1 Shell-Bedarfsplan
### Aufgabe
ermittelt vor jeder Spaltenvergabe den vollstaendigen funktionalen Zellbedarf aller sichtbaren Schalen

### Beantwortet
- Welche Kindrollen besitzt jede sichtbare Schale?
- Welche Huellezellen braucht sie?
- Welche spaeteren Zellansprueche muessen in den gemeinsamen Pre-flight eingehen?

### Darf nicht
- Spalten oder Spaltenspannen vergeben
- vorlaeufige Koordinaten als Ortswahrheit ausgeben

### Kernsatz
Bedarf kommt vor Belegung. Kein spaeteres Modul darf eine Huellezelle melden,
die dem globalen Raster nicht bereits als Bedarf vorlag.

## P4.2 Global Semantic Raster

### Aufgabe

legt nach dem vollstaendigen Bedarfsplan alle horizontalen Zellen ueber alle Theoriezeilen fest

### Beantwortet

- Welche semantischen Inhalte haben globale Spuren?
- Welche endgueltige Zelle oder Zellspanne besitzt jedes Atom und jedes Huelleprimitiv?
- Welche Koordinaten bleiben in frueheren Zeilen fuer spaetere Schalen frei?

### Darf nicht

- Medienbreiten verwenden
- nach seiner Ausgabe eine horizontale Nachkorrektur erlauben

### Kernsatz

Was stehen bleibt, behaelt seine vollstaendige Zelle. Eine spaetere Schale
belegt vorbereitete leere Koordinaten; sie schiebt niemals vorhandene Zellen.

Praezise gilt: Dieselbe atomare Quellidentitaet auf derselben Gleichungsseite
behaelt innerhalb desselben Prozessraums dasselbe Spurzentrum. Ein
Seitenwechsel oder ein ausdruecklich dokumentierter Systemwechsel erzeugt eine
neue Geburtslage; ohne einen solchen Wechsel ist jede Drift ein P4-Fehler.

## P4.3 Funktionale Profilmaterialisierung

### Aufgabe

materialisiert das bereits bottom-up gebaute globale Zellprofil
in den Zugriffssichten fuer Projection Blocks und Writer

### Beantwortet

- Stimmen Theoriezeilen, Zellprofil und koordinatenfreie Blueprints ueberein?
- Welche festen Atomzentren und Atomspannen werden als Maps bereitgestellt?
- Welche bereits lokalisierten Blueprints werden unveraendert weitergereicht?

### Darf nicht

- neu entscheiden, welcher Term in welcher Schale steht
- Kinder neu ordnen oder nachzentrieren
- horizontale Zellen gegenueber dem globalen Raster erzeugen oder veraendern
- fehlende Profildaten rekonstruieren
- lokale Reihen oder visuelle Pixel-, Font- und Medienmasse erzeugen

### Kernsatz

Das globale Zellprofil ist die Eingabe, nicht das Ergebnis dieses Schritts.
Materialisierung bedeutet unveraenderte Uebergabe, nicht zweite Geometrie.

## P4.4 Projection Blocks
### Aufgabe
legt nur die vertikale Struktur der Zeile fest

### Beantwortet
- Wie viele Teilzeilen braucht diese Theoriezeile?
- Wo liegt die mathematische Achse?
- Was sitzt oberhalb, auf oder unter der Achse?

### Darf nicht
- Spalten neu bestimmen
- Mathematik neu interpretieren

### Kernsatz
Ein Bruch bekommt seine Achse hier als echte Teilzeile.
Sie wird nicht spaeter optisch erraten.

## P4.5 Projection Writer
### Aufgabe
schreibt die schon vollstaendig entschiedene Wahrheit als Projektionsatome aus

### Beantwortet
- Welche expliziten Projektionsatome gibt es?
- Welche `row`, `col`, `colStart`, `colEnd` und Rollen haben sie?

### Darf nicht
- lokal zentrieren
- Brueche, Wurzeln oder Funktionen neu rekonstruieren
- fehlenden Platz nachtraeglich "retten"

### Kernsatz
Der Writer liest nur und schreibt aus.
Er ist kein zweiter Layout-Entscheider.

## P4.6 Output Contract
### Aufgabe
gibt die eine verbindliche Projektionswahrheit an alle Verbraucher weiter

### Beantwortet
- Welche Struktur duerfen Arbeitsblatt, PDF, Film und Diagnose lesen?
- Welche Felder muessen stabil bleiben?
- Welche Adapter sind erlaubt?
- Welche atomare, Shell- oder geschlossene Blockform soll in einer Zeile sichtbar sein?

### Darf nicht
- semantische Orte fuer ein Medium umdeuten
- Legacy-Kompatibilitaet versteckt in Writer oder Renderer unterbringen

### Kernsatz
Alle Medien lesen dieselbe Wahrheit.
Wenn ein Medium etwas anderes braucht,
dann ueber einen expliziten Adapter,
nicht ueber eine zweite Kernlogik.

## Renderer, PDF, Film, weitere Medien
### Aufgabe
bauen aus der von `P4` gelieferten funktionalen Geometrie
die visuelle Geometrie des jeweiligen Mediums

### Eingabe
- Output Contract aus `P4`

### Ausgabe
- Browser-Ansicht
- PDF
- Film
- Diagnoseansichten

### Darf
- funktionale Spuren und Reihen in Pixel, `em` oder Papiermasse uebersetzen
- Fonts und Glyphen fuer die visuelle Umsetzung messen
- Zeichenpfade und Tinte erzeugen
- globale Renderparameter wie Strichstaerke und Farbe anwenden
- Animationen auf Basis derselben Projektionsstruktur bauen

### Darf nicht
- semantische Spuren neu berechnen
- Kindzugehoerigkeit oder Schachtelung neu bestimmen
- funktionale Baender, Reihen oder Achsen aus Text- oder Glyphenmessungen ableiten
- Bruchachsen neu erraten
- Klammern oder Wurzelspannen semantisch neu festlegen
- Core-Fehler optisch ausgleichen oder uebermalen

### Kurzform
Der Renderer beantwortet nur:
"Welche visuelle Geometrie bildet die gelieferte funktionale Geometrie im gewaehlten Medium ab?"

### Verbindlicher atomarer Referenzmodus

Bis Core und Uebergabevertraege gruen sind,
wird jede sichtbare Core-Projektion ohne typografische Aggregation dargestellt:

```text
projectionAtom -> Worksheet-Zelle -> Display-Item -> sichtbares Primitiv
       1        ->        1        ->      1       ->          1
```

Jede Stufe bewahrt ID, Rolle, Teilzeile, Spalte und Spanne.
Ein flaechenhaftes Primitiv wie `fraction_line` oder `root_overbar`
bleibt genau ein Primitiv auf der vom Core gelieferten Spanne.

Verboten sind in diesem Modus:

- Core-Zellen zu Gesamtformeln buendeln
- abgedeckte Innenzellen entfernen
- zusammengesetzte Ersatz-Renderknoten erzeugen
- Zellen anhand von Nachbarschaft konsumieren
- fehlende Haken, Striche, Klammern oder Inhalte synthetisieren

Erst nach gruenem atomarem Beweis darf ein Schoensatz-Modul
eine alternative visuelle Komposition anbieten.
Es muss dann gegen denselben atomaren Plan beweisen,
dass funktionale Position, Identitaet und Sichtbarkeit erhalten bleiben.

## Entscheidungsgrenze pro Phase
- `P1`: Was ist da?
- `P2`: Was ist die naechste Umformungsentscheidung?
- `P3`: Wie sieht der naechste semantische Zustand aus?
- `P4`: Wo und in welcher funktionalen Verschachtelung steht alles positionstreu?
- Renderer: Wie wird diese fertige funktionale Wahrheit visuell gezeichnet?

## Fehlerdiagnose nach dieser Kette
- Wenn eine Gleichung mathematisch falsch umgebaut wird, liegt der Fehler in `P2` oder `P3`.
- Wenn dieselbe semantische Einheit ihre Spur verliert, liegt der Fehler in `P4`.
- Wenn eine Schale falsche Kinder, Baender, Reihen oder Achsen besitzt, liegt der Fehler vor dem Renderer, in `P3` oder `P4`.
- Wenn `P4` die funktionale Geometrie korrekt liefert, ihre Pixel-, Font- oder Papierabbildung aber falsch ist, liegt der Fehler im Renderer oder Exporter.

## Optionaler Grenzpfad A1 -> B -> A2

`Bridge B` ist ein eigenes Modul fuer genau einen B-Prozessschritt ausserhalb der normalen Familienkette.

Es darf nur:

- einen dokumentierten `boundary_state` lesen
- genau die aktive komplexe Potenzschale brechen
- genau eine `landing_state`-Zeile fuer A2 liefern

Es darf nicht:

- A1 weiterrechnen
- A2 vorwegnehmen
- allgemeine P2- oder P3-Regeln duplizieren
- eine falsche Landung im Renderer kaschieren

Die Boundary-Zeile beendet den alten `POWER`-Prozessraum. Die Landing-Zeile
setzt genau einmal die neue normale Termlage. A2 uebernimmt diese Landing-Lage
ohne weiteren Positionssprung; alte Exponentenspalten duerfen die Landing-Zeile
nicht blockieren.

Die Trennung gilt auch in Gegenrichtung. Die kompakteren normalen Slots der
Landing- und A2-Zeilen duerfen weder ihre Atombreiten noch ihre Huellebreiten in
die vorherigen A1-Zeilen zuruecktragen. Eine physische Spaltenlage wird deshalb
am Systemwechsel durch `processSpaceId + col` bestimmt, nicht durch `col`
allein. Die getrennten Raumprofile werden ausschliesslich am unveraenderten
Gleichheitsanker ausgerichtet.

Die fuehrende Detailrichtlinie ist:

- `docs/Architecture/BRIDGE_B_VERTRAG_V1.md`

## Fuehrungsregel
Diese Phasenkette ist normativ.

Wenn eine neue Anforderung kommt,
wird zuerst hier geprueft:
- Welche Phase darf diese Frage beantworten?
- Ist die Frage bereits frueher beantwortet?
- Wuerde eine spaetere Antwort Rekonstruktion bedeuten?

Wenn ja,
darf die spaetere Phase nicht erweitert werden.
Dann muss die Frage weiter nach vorn verlegt werden.
