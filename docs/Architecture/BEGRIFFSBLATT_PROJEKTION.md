# Begriffsblatt: Zeilen, Bloecke und Projektionssprache

Status: normativ  
Stand: 7. September 2026

## Zweck
Dieses Blatt legt die verbindliche Sprache fuer den Projektionskern fest.
Es verhindert, dass das Wort `Zeile` einmal den algebraischen Schritt,
ein anderes Mal die sichtbare Gesamtzeile und ein drittes Mal nur eine innere Bruchteilzeile meint.

## Kernbegriffe
### Gleichung
Die vom Aufrufer eingegebene mathematische Aussage, zum Beispiel:
`2*x+3=5`

### Zielvariable
Die Variable, nach der in genau einem Solve-Lauf geloest wird.
Sie ist Teil des Solve-Vertrags, aber nicht Teil der Projektionssprache.

### Loesungsschritt
Der menschlich gemeinte Schritt im Loesungsweg.
Er entspricht fachlich einem neuen algebraischen Zustand nach einer erlaubten Umformung.

Empfehlung:
- nach aussen gegenueber Lehrkraft, Schueler oder UI meist `Loesungsschritt`

### Theoriezeile
Der semantische Kernzustand eines Loesungsschritts.
Im Export ist das ein Eintrag in `theoryRows`.

Wichtig:
- eine Theoriezeile ist noch keine fertige sichtbare Darstellung
- sie beschreibt Struktur, nicht Typografie

### Projektionsblock
Die sichtbare, medienneutrale Umsetzung genau einer Theoriezeile.
Im Export ist das ein Eintrag in `projectionRows`.

Wichtig:
- ein Projektionsblock hat globale Spalten
- ein Projektionsblock kann intern eine oder mehrere Teilzeilen besitzen
- ein Projektionsblock traegt die funktionale Geometrie seiner sichtbaren Schalen
- ein Projektionsblock ist die richtige Einheit fuer P4

Empfehlung:
- im Kern und in der Doku fuer P4 moeglichst `Projektionsblock`

### Teilzeile
Eine innere sichtbare Zeile innerhalb eines Projektionsblocks.

Beispiele:
- bei einer einfachen Gleichungszeile gibt es nur eine Teilzeile
- bei einem sichtbaren Bruch typischerweise drei Teilzeilen:
  - Zaehlerzeile
  - Achsenzeile
  - Nennerzeile

Empfehlung:
- fuer die innere Vertikalstruktur `Teilzeile`
- nur wenn besonders hilfreich: `Zaehlerzeile`, `Achsenzeile`, `Nennerzeile`

### Achsenzeile
Die Teilzeile innerhalb eines Projektionsblocks, auf der mathematische Nachbarelemente fluchten.

Beispiele:
- bei `x = 3/2` liegen `x`, `=` und der Bruchstrich auf derselben Achsenzeile
- bei einer einfachen linearen Zeile ist die einzige Teilzeile zugleich die Achsenzeile

## Datenbegriffe im Export
### `theoryRows`
Liste der Theoriezeilen, also der semantischen Loesungsschritte.

### `projectionRows`
Liste der Projektionsbloecke, also der sichtbaren medienneutralen Umsetzungen der Theoriezeilen.

### `row`
Die absolute P4-Zeile innerhalb der globalen Projektionsmatrix.
Sie dient dem Projektionskern selbst und ist nicht automatisch die beste Anzeigezeile fuer lineare Medien.

### `absoluteRow`
Explizite Kopie der absoluten P4-Zeile eines projizierten Atoms.
Sie ist vor allem fuer Diagnose und Rueckverfolgung hilfreich.

### `localRow`
Die Teilzeile eines Atoms innerhalb seines Projektionsblocks.

Beispiel:
- `0` kann die Zaehlerzeile sein
- `1` die Achsenzeile
- `2` die Nennerzeile

### `stackedRow`
Die linear gestapelte Zeile fuer Medien, die Projektionsbloecke einfach untereinander zeigen wollen.

Wichtig:
- `stackedRow` ist nicht die fachliche Wahrheit des Blocks
- `stackedRow` ist die konsumfreundliche Sequenzsicht fuer Arbeitsblatt, Diagnose oder aehnliche Ausgaben

### `localRowCount`
Die Anzahl der Teilzeilen eines Projektionsblocks.

### `axisLocalRow`
Die lokale Teilzeile eines Projektionsblocks, die als mathematische Achse dient.

Wichtig:
- `axisLocalRow` ist explizite Kerninformation
- sie wird nicht spaeter aus sichtbarer Geometrie geraten
- `=` liegt auf dieser Teilzeile
- ein aeusserer Haupt-Bruchstrich derselben Struktur liegt ebenfalls auf dieser Teilzeile

### `stackRowStart` / `stackRowEnd`
Der Bereich, den ein Projektionsblock in der gestapelten Sequenzsicht einnimmt.

### `rowRoles`
Empfohlene explizite Benennung der lokalen Teilzeilen eines Projektionsblocks.

Mindestens sinnvoll sind:
- `above_axis`
- `axis`
- `below_axis`

Feiner moeglich sind spaeter zum Beispiel:
- `numerator`
- `denominator`
- `root_top`
- `root_bottom`

Wichtig:
- `rowRoles` beschreiben Zeilen
- sie ersetzen nicht `localRow`
- sie helfen dem Renderer,
  ohne eigene mathematische Deutung dieselbe Teilzeilenstruktur korrekt zu lesen

### Funktionale Geometrie

Die medienneutrale Orts- und Schalenwahrheit aus P4:

- Eltern-Kind-Zuordnung
- globale Spalten
- Teilzeilen und Achsen
- Inhalts-, Ausrichtungs- und Huellebaender
- funktionale Primitive und ihre Spannen
- explizite sichtbare Darstellungsform

### Visuelle Geometrie

Die physische Abbildung durch einen Renderer:

- Pixel-, `em`-, SVG-, TikZ- oder Papierkoordinaten
- Font- und Glyphenmasse
- Strichstaerken, Farbe und Medienabstaende

Visuelle Geometrie darf funktionale Geometrie nicht korrigieren oder ergaenzen.

## Horizontale und vertikale Logik
### Horizontal
Horizontalitaet ist global und prozessweit.

Das bedeutet:
- Spalten gelten ueber den ganzen Solve-Lauf
- Gleichheitsanker, Zielspur und stabile Gegenseiten bleiben seitlich verankert
- horizontale Ortstreue ist Aufgabe des Projektionskerns

### Vertikal
Vertikalitaet ist blocklokal und dynamisch.

Das bedeutet:
- jeder Projektionsblock kann seine eigene innere Architektur haben
- eine Theoriezeile kann 1 Teilzeile haben, die naechste 3, die naechste spaeter vielleicht mehr
- neue Schalen erhalten ihre funktionale Vertikalstruktur bei ihrer Geburt von innen nach aussen
- bereits geborene unveraenderte Schalen transportieren diese Struktur geschlossen weiter
- der Projektionsblock ordnet die gelieferten Schalenauftreten in seine lokale Reihenfolge ein, ohne ihre Innengeometrie neu zu bauen

Kurzform:
- Spalten sind global
- Teilzeilen sind lokal
- gestapelte Zeilen sind eine Verbrauchersicht

## Kernregel fuer den Renderer
Der Renderer liest:
- globale Spalten
- lokale Teilzeilen
- explizite Rollen
- explizite Schalen-Spannen

Er darf:
- gelieferte Teilzeilen physisch hoch genug abbilden
- Schalen zeichnen
- Medienausgaben daraus ableiten

Er darf nicht:
- Teilzeilen neu erfinden
- Achsenlagen aus optischer Mitte erraten
- Atome lokal neu zentrieren
- Brueche, Wurzeln oder Klammern als Ersatz fuer fehlende Kerninformationen interpretieren

## Sprachregelung fuer die Zukunft
Wenn `Zeile` mehrdeutig waere, soll moeglichst praezise gesprochen werden:

- `Loesungsschritt`, wenn der algebraische Schritt gemeint ist
- `Theoriezeile`, wenn der semantische Exportzustand gemeint ist
- `Projektionsblock`, wenn die sichtbare P4-Einheit gemeint ist
- `Teilzeile`, wenn eine innere Blockzeile gemeint ist
- `Achsenzeile`, wenn die mathematische Fluchtlinie gemeint ist
- `stackedRow`, wenn die lineare Anzeigesicht gemeint ist

## Merksatz
Ein Loesungsschritt erzeugt eine Theoriezeile.  
Eine Theoriezeile wird in P4 zu einem Projektionsblock.  
Ein Projektionsblock kann aus mehreren Teilzeilen bestehen.  
Lineare Medien zeigen diese Projektionsbloecke ueber `stackedRow` einfach untereinander.
