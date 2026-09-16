# Wurzel-Vertrag V1

Status: verbindlicher funktionaler Eingabevertrag  
Stand: 7. September 2026

## Zweck

Dieses Dokument definiert den harten Vertrag zwischen:

- Core
- ViewModel
- blindem Renderer

fuer sichtbare Wurzeln.

Auch hier gilt:
Der Renderer darf die funktionale Geometrie nicht selbst herleiten.
Er baut daraus ausschliesslich die visuelle Geometrie.

## Begriffsgrenze

Spalten, Reihen, Baender, Achsen und Cover-Spannen
sind medienneutrale funktionale Core-Geometrie.

Der konkrete Hakenpfad,
die physische Oberstrichdicke,
Fontmasse und Pixel-, `em`- oder Papierkoordinaten
sind visuelle Renderer-Geometrie.

## Kernsatz

Eine sichtbare Wurzel ist keine LaTeX-Box `\\sqrt{...}`.

Eine sichtbare Wurzel ist eine eigene Schale mit:

- eigener Wurzelspalte
- eigener funktionaler Hakenrolle und Hakenlage
- eigener funktionaler Oberstrichspanne
- festem Inhaltsband
- fester Inhalts-Hoehe

Die Inhalts-Hoehe ist die exportierte funktionale Reihenspanne,
nicht eine optische oder physische Hoehenangabe.

## Blindheitsregel des Renderers

Der Renderer darf bei einer Wurzel nur:

- den Haken an vorgegebener Stelle zeichnen
- den Oberstrich ueber ein vorgegebenes Band zeichnen
- den Inhalt in seinen gelieferten Banden setzen
- den konkreten Glyphen- oder Vektorpfad innerhalb dieser Vorgaben physisch messen und bauen

Der Renderer darf nicht:

- die funktionale Hoehe aus Glyphenformen neu bestimmen
- den Oberstrich aus sichtbarem Text ableiten
- Exponenten oder Brueche unter der Wurzel nachtraeglich "mitdenken"

## Mindestdaten fuer jede sichtbare Wurzel

### 1. Identitaet

```text
id
type = root
state = closed | opened
rowOccurrenceId = rowId + shellId
visibleRepresentation = atomic | closed_block
```

### 2. Horizontale Wahrheit

```text
rootCol
overbarColStart
overbarColEnd
contentColStart
contentColEnd
outerColStart
outerColEnd
```

Bedeutung:

- `rootCol` ist die eigene Wurzelspalte
- `overbarColStart..overbarColEnd` ist der Oberstrich
- `contentColStart..contentColEnd` ist das Band des Inhalts
- `outerColStart..outerColEnd` ist das gesamte Besitzband der Wurzel

### 3. Vertikale Wahrheit

```text
rowTop
rowAxis
rowBottom
coverRowTop
coverRowBottom
hookMidRow
hookDepthRow
```

Bedeutung:

- `coverRowTop..coverRowBottom` ist die volle Hoehe,
  die von der Wurzel ueberspannt wird
- `hookMidRow` ist die mittlere Hakenlage
- `hookDepthRow` ist der tiefste Punkt des Hakens

Regel:

- diese Hoehen werden im Core bestimmt
- sie werden spaeter nicht neu berechnet

### 4. Kinder

```text
contentShellId
degreeShellId optional
```

Regel:

- der Wurzelinhalt ist ein Kind der Wurzel
- ein Wurzelgrad ist ein optionales eigenes Kind

### 5. Funktionaler Linienstil

```text
lineThicknessClass = main | secondary
```

Die Stilklasse ist ein medienneutraler Hinweis.
Physische Werte wie `hookInset`, Strichdicke und Oberstrich-Ueberstand
gehoeren in ein globales Rendererprofil.
Sie duerfen nur auf die bereits exportierte funktionale Geometrie angewandt werden.

## Geburtsregeln

### R1. Die Wurzel entsteht genau einmal

Im Geburtsmoment werden festgelegt:

- Wurzelspalte
- Inhaltsband
- Inhalts-Hoehe
- Oberstrichband
- funktionale Hakenlage
- Gradband, falls vorhanden
- explizite sichtbare Darstellungsform

Danach ist die Wurzelgeometrie stabil.

### R2. Die Hoehe kommt aus dem Inhalt, aber nur bei der Geburt

Der Core muss bei der Geburt der Wurzel
die bereits fertige funktionale Reihenspanne des Inhalts lesen.

Dabei muessen bereits mitzaehlen:

- Brueche
- Exponenten
- Klammern
- innere Wurzeln
- andere sichtbare Schalen

Wichtig:

- diese funktionale Ableitung geschieht einmal
- danach wird die Wurzelhoehe nur weitergereicht

### R3. Der Renderer malt die exportierte Hoehe

Wenn `coverRowTop..coverRowBottom` feststehen,
dann darf der Renderer diese funktionale Hoehe nicht mehr veraendern.

Er darf daraus fuer jedes Medium eine andere physische Hoehe erzeugen,
solange dieselben funktionalen Reihen und Kindzuordnungen erhalten bleiben.

## Weitergabe-Regeln

### W1. Geschlossene Wurzeln bleiben geschlossene Wurzeln

Wenn eine Wurzel algebraisch nicht geoeffnet wird,
wandert sie als geschlossene Schale.

Ihre Haken- und Oberstrichgeometrie bleibt stabil.

### W2. Oeffnung erzeugt keine neue Geometrie

Wenn eine Wurzel spaeter algebraisch geoeffnet wird,
werden nur bereits bekannte Kinder adressierbar.

Es entsteht keine neu erfundene Innenordnung.

## Verschachtelung

### V1. Wurzel in Wurzel

Eine innere Wurzel bleibt eine eigene Wurzel.

Die aeussere Wurzel darf:

- die innere als Kind tragen
- ihre eigene Hoehe um diese Kindgeometrie herum bauen

Sie darf nicht:

- die innere Wurzel nachtraeglich zusammendruecken

### V2. Wurzel um Bruch

Wenn unter einer Wurzel ein Bruch liegt,
dann muss die Bruchhoehe bereits im Inhalt angekommen sein.

Der Renderer darf die Wurzel nicht "nach oben retten",
weil ihm erst beim Zeichnen auffaellt,
dass der Inhalt hoeher ist.

## Renderer-Pflichten

Der Renderer muss:

- `rootCol` als einzige Wurzelspalte lesen
- `overbarColStart..overbarColEnd` als einzige Oberstrichwahrheit lesen
- `coverRowTop..coverRowBottom` als einzige Hoehenwahrheit lesen
- den Inhalt unveraendert in seinen gelieferten Banden setzen
- den visuellen Hakenpfad und Oberstrich innerhalb dieser funktionalen Vorgaben bauen

## Renderer-Verbote

Der Renderer darf nicht:

- aus `\\sqrt{...}` eigene Hoehenlogik beziehen
- den Oberstrich nach Nachbarinhalten verlaengern
- die Wurzelhoehe aus sichtbarem Text neu ableiten
- Klammer- oder Exponentenhoehen lokal nachziehen

## Prueffragen

Der Vertrag ist nur erfuellt, wenn alle Antworten `ja` lauten:

1. Ist die Wurzelhoehe vollstaendig aus exportierten Zeilen ableitbar?
2. Bleibt eine geschlossene Wurzel beim Weiterreichen geometrisch stabil?
3. Zaehlen Brueche, Exponenten und innere Wurzeln nur bei der Geburt in die Hoehe ein?
4. Muss der Renderer beim Zeichnen nichts mehr erraten?
5. Ist pro Zeilenauftreten die sichtbare Darstellungsform explizit festgelegt?
