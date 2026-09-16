# Bruch-Vertrag V2

Status: verbindlicher funktionaler Eingabevertrag  
Stand: 7. September 2026

## Zweck

Dieses Dokument definiert den harten Vertrag zwischen:

- Core
- ViewModel
- blindem Renderer

fuer sichtbare Brueche.

Er beschreibt nicht,
wie ein Bruch optisch "schoen" gemacht werden koennte,
sondern welche Orts- und Bandwahrheit vorliegen muss,
damit der Renderer nichts mehr erraten muss.

## Begriffsgrenze

Alle Spalten, Reihen, Baender, Achsen und Spannen dieses Vertrags
sind funktionale Geometrie in medienneutralen Core-Einheiten.

Sie sind keine Pixel-, `em`-, Font- oder Papiermasse.
Der Renderer erzeugt aus ihnen erst die visuelle Geometrie.

## Kernsatz

Ein sichtbarer Bruch ist keine lokale Textbox.

Ein sichtbarer Bruch ist eine eigene Schale mit:

- festem Horizontalband
- fester Achsenzeile
- festem Zaehlerbereich
- festem Nennerbereich
- fester Innengeometrie

Diese Wahrheit entsteht genau einmal bei der Geburt des Bruchs.
Danach wird sie nur noch:

- weitergereicht
- als ganze Schale bewegt
- in groessere Schalen eingelagert
- oder algebraisch geoeffnet

Nicht erlaubt ist:

- spaeteres Neumessen
- spaeteres Neuzentrieren
- spaeteres Breiter- oder Schmalermachen
- Renderer-Logik nach Augenmass

## Blindheitsregel des Renderers

Der Renderer darf bei einem Bruch nur:

- Text an vorgegebene Baender setzen
- den Bruchstrich ueber ein vorgegebenes Band zeichnen
- globale konfigurierte Liniendicke und kleine physische Ueberstaende anwenden
- Glyphen innerhalb der gelieferten funktionalen Spuren physisch messen

Der Renderer darf nicht:

- Bruchbreite aus Textbreite ableiten
- Zaehler oder Nenner neu zentrieren
- fremde Leer- oder Nachbarspalten einbeziehen
- offene oder geschlossene Schalen aus Text rekonstruieren
- aufgrund von Fontmessungen funktionale Spalten, Reihen oder Baender veraendern

## Mindestdaten fuer jeden sichtbaren Bruch

Jeder sichtbare Bruch muss vom Core in expliziter Form geliefert werden.

### 1. Identitaet

```text
id
type = fraction
state = closed | opened
rowOccurrenceId = rowId + shellId
visibleRepresentation = atomic | closed_block
```

### 2. Horizontale Wahrheit

```text
outerColStart
outerColEnd
contentColStart
contentColEnd
alignmentColStart
alignmentColEnd
```

Bedeutung:

- `outerColStart..outerColEnd`:
  gesamtes Besitzband der Bruchschale
- `contentColStart..contentColEnd`:
  Band des mathematischen Inhalts
- `alignmentColStart..alignmentColEnd`:
  Band, an dem die Geburt des Bruchs Zaehler und Nenner ausrichtet

Im Normalfall duerfen diese Baender zusammenfallen.
Wenn sie nicht zusammenfallen,
muss der Core den Unterschied explizit exportieren.

## 3. Vertikale Wahrheit

```text
rowTop
rowAxis
rowBottom
numeratorRowTop
numeratorRowBottom
lineRow
denominatorRowTop
denominatorRowBottom
```

Bedeutung:

- `rowAxis` ist die mathematische Achsenzeile des Bruchs
- `lineRow` ist die Teilzeile des Bruchstrichs
- `numeratorRowTop..numeratorRowBottom` ist der Bereich des Zaehlerinhalts
- `denominatorRowTop..denominatorRowBottom` ist der Bereich des Nennerinhalts

Regel:

- `lineRow` und `rowAxis` muessen auf derselben Achsenlage liegen
- der Renderer darf diese Achse nicht aus optischen Textmitten rekonstruieren

### 4. Kinder

```text
numeratorShellId
denominatorShellId
```

Regel:

- Zaehler und Nenner sind Kinder des Bruchs
- sie bleiben Kinder,
  auch wenn sie intern selbst wieder Schalen enthalten

### 5. Funktionale Strichdaten

```text
lineThicknessClass = main | secondary
lineColStart
lineColEnd
```

Regel:

- die funktionale Strichspanne wird im Core festgelegt
- physische Dicke und kleine Ueberstaende stammen aus einem globalen Rendererprofil
- visuelle Ueberstaende duerfen nur auf das exportierte Bruchband angewandt werden
- sie duerfen nie funktionale Nachbarspalten einbeziehen

## Geburtsregeln

### B1. Ein Bruch entsteht genau einmal

Im Geburtsmoment werden festgelegt:

- Zaehlerkind
- Nennerkind
- Achse
- Bruchband
- Innengeometrie
- funktionale Strichspanne und Stilklasse
- explizite sichtbare Darstellungsform

Danach ist die Geometrie stabil.

### B2. Der Bruchstrich uebernimmt das Bruchband

Der Bruchstrich spannt ueber:

```text
outerColStart..outerColEnd
```

plus die kleinen konfigurierten Ueberstaende.

Diese Ueberstaende sind visuelle Tinte.
Sie vergroessern das funktionale Besitzband nicht.

Er darf nicht:

- kuerzer sein als der Inhalt
- laenger sein als das exportierte Bruchband
- asymmetrisch wachsen,
  wenn der Core das nicht explizit verlangt

### B3. Zentrierung gehoert zur Geburt

Wenn Zaehler oder Nenner schmaler als das Bruchband sind,
wird ihre funktionale Ausrichtung genau jetzt entschieden.

Spaetere Schichten duerfen diese Ausrichtung nur noch physisch abbilden.

### B4. Geschlossene Kinder bleiben geschlossen

Wenn Zaehler oder Nenner algebraisch nicht geoeffnet werden,
bleiben sie als geschlossene Kinder erhalten.

Der Core exportiert weiterhin die atomare Innenwahrheit,
die bereits geborene Schale mit ihrer bekannten Innengeometrie
und die explizite Wahl `visibleRepresentation = closed_block`.

Der Renderer zeichnet nur die gewaehlte Form.
Er darf weder die Innenatome verwerfen
noch Block und Innenprimitive doppelt sichtbar setzen.

## Weitergabe-Regeln

### W1. Was nicht bewegt wird, bleibt in seinem Band

Wenn der Zaehler im naechsten Schritt allein stehen bleibt,
dann bleibt seine Schale in genau demselben Horizontalband.

Wenn der Nenner als Faktor auf die andere Seite wandert,
dann wandert seine geschlossene Schale als ganze Schale.

### W2. Ein geoeffneter Bruch erzeugt keine neue Vergangenheit

Wenn ein Bruch spaeter algebraisch geoeffnet wird,
entsteht daraus keine neu erfundene Innengeometrie.

Sichtbar werden nur die Kinder,
deren innere Wahrheit bereits bekannt war.

## Verschachtelung

### V1. Bruch in Bruch

Ein innerer Bruch bleibt ein eigener Bruch.

Der aeussere Bruch darf:

- ihn als Kind tragen
- sein eigenes Band darum bauen

Der aeussere Bruch darf nicht:

- die Geometrie des inneren Bruchs ueberschreiben
- dessen Strichbreite neu definieren

### V2. Bruch in Funktion, Klammer oder Wurzel

Ein Bruch behaelt:

- sein Band
- seine Achse
- seine Innengeometrie

Neue aeussere Schalen duerfen nur eigene Huelle-Slots hinzufuegen.

## Renderer-Pflichten

Der Renderer muss:

- `outerColStart..outerColEnd` als einziges Strichband lesen
- `rowAxis` als einzige Achsenlage lesen
- Kinder genau in ihren gelieferten Banden setzen
- die Bruchschale unveraendert weiterzeichnen
- physische Font- und Linienmasse anwenden, ohne funktionale Baender zu veraendern

## Renderer-Verbote

Der Renderer darf nicht:

- aus LaTeX `\\frac` neue Geometrie beziehen
- Zaehler und Nenner aus Textboxen neu mitteln
- Unterschiede zwischen linkem und rechtem Bruch einbauen,
  wenn der Core dieselben Daten liefert
- Leerspalten dazuerfinden
- einen Bruchstrich durch Nachbarterme verlaengern

## Prueffragen

Der Vertrag ist nur erfuellt, wenn alle Antworten `ja` lauten:

1. Haben zwei identische Brueche identische Banddaten?
2. Ist der Bruchstrich vollstaendig aus `outerColStart..outerColEnd` ableitbar?
3. Bleibt ein geschlossener Zaehler als dieselbe Schale stehen, wenn nur der Nenner entfernt wird?
4. Wandert ein geschlossener Nenner als dieselbe Schale, wenn er zum Faktor wird?
5. Muss der Renderer an keiner Stelle raten?
6. Ist pro Zeilenauftreten explizit festgelegt, welche Darstellungsform sichtbar ist?
