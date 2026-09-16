# Fraction/Root Spaltentreue Contract

Status: normativ  
Stand: 7. September 2026

## Zweck
Dieses Dokument fixiert die verbindliche Rasterlogik fuer sichtbare Brueche,
Wurzeln und andere sichtbare Schalen im produktiven Renderpfad.

Es beschreibt nicht eine spaetere optische Korrektur,
sondern die Grundlogik,
mit der horizontale und vertikale Positionstreue von Anfang an entstehen muss.

## Geometriebegriffe

Dieser Vertrag unterscheidet strikt:

- funktionale Geometrie: Schachtelung, Spuren, Reihen, Achsen, Baender und logische Primitive aus P4
- visuelle Geometrie: Pixel-, `em`-, Font-, SVG-, TikZ- oder Papiermasse des Renderers

Die sichtbaren Shell-Slots dieses Vertrags sind funktionale Slots aus P4.
Der Renderer gibt ihnen nur physische Breite und zeichnet die zugeordnete Tinte.

## Kernsatz
Ein sichtbarer Bruch oder eine sichtbare Wurzel ist keine lokale Textbox.

Er ist eine sichtbare Schale auf demselben globalen Spaltenraster,
auf dem auch alle anderen Atome der Theorie-Folge liegen.

Daraus folgt:
- dieselbe innere Struktur behaelt dieselben semantischen Spalten
- auch dann, wenn sie in einen Bruch, eine Wurzel, eine Funktion, eine Gruppe oder eine Potenz wandert
- und auch dann, wenn um sie herum neue sichtbare Schalen hinzukommen

## Proflight, P4 und Renderer
### Proflight
Der Proflight simuliert die komplette Umformungskette vom Startzustand bis zur letzten Zeile.

Er legt dabei ein einziges globales Raster fest:
- welche semantischen Spalten es insgesamt gibt
- welche lokalen Teilzeilen pro Projektionsblock gebraucht werden
- welche sichtbaren Schalen spaeter eigene Slots benoetigen

Wenn fuer eine spaetere Zeile zusaetzlicher Platz fuer `acos`, Klammern, Bruchstriche, Wurzelhaken oder Potenzklammern gebraucht wird,
dann wird dieser Platz genau hier festgelegt.

### Pufferspalten
Eine Pufferspalte ist nur waehrend des Proflights eine Zukunftsanforderung.

Nach Abschluss des Proflights ist sie keine "Reserve" mehr,
sondern eine normale, fest existierende globale Spalte.

Fruehe Zeilen duerfen diese Spalte leer lassen.
Spaetere Zeilen duerfen sie fuellen.
Aber keine nachgelagerte Schicht darf diese Spalte spaeter neu hinzufuegen,
wegnehmen oder an eine andere Stelle verschieben.

### P4
P4 uebergibt danach bereits die komplette Strukturwahrheit:
- welche Elemente sichtbar sind
- welche semantische Spanne sie besitzen
- welche Shell-Rollen vorliegen
- welche Teilzeile Achse, Oberzeile oder Unterzeile ist
- welche Schale welche Kinder besitzt
- welche Darstellungsform pro Schalenauftreten sichtbar gesetzt wird

Ein sichtbarer Endbruch in `acos(...)` darf deshalb nie als Einzelzelle geliefert werden,
wenn seine semantische Wahrheit eigentlich `19..23` lautet.

### Renderer
Der Renderer darf keine mathematische Ortsentscheidung mehr treffen.

Er darf nur noch:
- vorhandene semantische Spalten physisch breit machen
- vorhandene Teilzeilen sichtbar setzen
- Shell-Slots zeichnen
- LaTeX, HTML, PDF oder Film aus derselben Struktur ableiten
- Font- und Glyphenmasse innerhalb der gelieferten funktionalen Baender bestimmen

Er darf nicht:
- semantische Spannen inferieren
- funktionale Kindbeziehungen aus geometrischem Einschluss inferieren
- einen Bruch nachtraeglich zu einer Box zusammenziehen
- fehlende Klammer- oder Funktionsspalten "erraten"
- fruehere Zeilen wegen spaeterer Schalen noch einmal verschieben
- funktionale Reihen oder Achsen aus sichtbaren Zellarten rekonstruieren

## Fehlerzuordnung
Wenn etwas driftet, gilt die folgende harte Zuordnung:

1. Fehlt eine spaeter benoetigte Spalte ganz, dann ist der Fehler im Proflight.
2. Existiert die Spalte, aber P4 meldet sie fuer ein sichtbares Element nicht explizit, dann ist der Fehler in P4.
3. Meldet P4 die Spalte korrekt und die Ausgabe driftet trotzdem, dann ist der Fehler im Renderer.

## Verbindliche Begriffe
- semantische Spalte: der globale Ortsanker aus P4
- Display-Slot: eine physische Sichtbarkeitszelle fuer echte Tinte wie `cos`, `(`, `)`, Wurzelhaken oder Bruchstrich
- Shell-Span: die zusammenhaengende globale Spaltenspanne, die eine sichtbare Schale umschliesst
- Achsenzeile: die lokale Teilzeile, auf der Bruchstrich und Gleichheitsnachbarn gemeinsam gelesen werden

## Nicht verhandelbare Regeln
### 1. Eine Ortswahrheit
Es gibt genau eine globale Ortswahrheit fuer mathematischen Inhalt:
die semantischen P4-Spalten.

Lokale Schalen duerfen diese Ortswahrheit nicht neu berechnen.

Nach dem Proflight darf auch keine spaetere Schicht mehr zusaetzliche semantische Reserve hinzuerfinden.

### 2. Sichtbare Schalen nur als Zusatz, nie als Ersatz
Funktionsnamen, Klammern, Wurzelhaken, Potenzklammern und Bruchstriche duerfen eigene Display-Slots bekommen.

Diese Slots kommen zur bestehenden Ortswahrheit hinzu.
Sie ersetzen nicht die semantischen Inhaltsspalten.

### 3. Keine zweite Breitenwahrheit
Dieselbe sichtbare Struktur darf nicht einmal als globaler Inhalts-Span
und ein zweites Mal als lokale Boxbreite gerechnet werden.

Sobald dieselbe Tinte doppelt gezaehlt wird,
entstehen kuenstliche Leerspannen, wandernde Bruchstriche und verlorene Spaltentreue.

### 4. Keine lokale Re-Zentrierung
Wenn ein Ausdruck seine semantische Spanne bereits besitzt,
darf keine spaetere Schale ihn lokal noch einmal mittig setzen.

Erlaubt ist nur:
- vorhandene Spalten verwenden
- sichtbare Shell-Slots links oder rechts anhaengen
- Teilzeilen oberhalb oder unterhalb derselben Spalten aufbauen

### 5. Keine Downstream-Reservelogik
Nach dem Proflight darf es downstream keine Reservelogik mehr im mathematischen Sinn geben.

Erlaubt sind nur noch physische Sichtbarkeits-Slots fuer bereits bekannte Schalen.
Nicht erlaubt ist eine spaetere Ortskorrektur nach dem Muster:
"hier kommt irgendwann noch `acos(`, also verschieben wir jetzt noch einmal."

## Horizontale Bruchlogik
### Bruch als Raster-Schnitt
Ein Bruch ist kein eigener Zeilenkasten.

Er ist ein vertikaler Ausschnitt derselben globalen Spalten:
- Zaehler belegt diese Spalten oberhalb der Achse
- Bruchstrich belegt dieselbe Spanne auf der Achse
- Nenner belegt dieselben Spalten unterhalb der Achse

### Bruchstrich-Regel
Der Bruchstrich spannt genau die Spalten,
die vom sichtbaren Zaehler- und Nennerinhalt dieser Bruchschale belegt werden.

Er darf:
- nicht durch eine aeuere Klammerspalte verlaengert werden
- nicht in die Spalte eines Nachbarfaktors hineinragen
- nicht in die eigene rechte oder linke Shell-Nachbarschaft hineinwachsen

### Innere Spaltentreue
Wenn derselbe Ausdruck innerhalb und ausserhalb eines Bruchs vorkommt,
muessen seine inneren Atome dieselben Spuren behalten.

Beispiel:
Wenn `cos(beta)` in einer Zeile auf festen Inhaltsspalten liegt,
darf dieselbe Struktur in `acos(...)`, in einem Bruchzaehler oder in einer Wurzel
nicht neu zusammengedrueckt oder anders verteilt werden.

## Vertikale Bruchlogik
### Eine feste Achsenzeile
Sobald in einer Gleichungszeile ein sichtbarer Bruch vorkommt,
gibt es fuer diesen Projektionsblock eine explizite Achsenzeile.

Auf dieser Achsenzeile liegen:
- der Bruchstrich
- das Gleichheitszeichen
- freistehende Baseline-Nachbarn derselben Gleichungszeile

### Keine Mittelung ueber Textbox-Hoehen
Die Bruchachse wird nicht aus der optischen Hoehenmitte von Zaehler oder Nenner erraten.

Sie ist eine explizite Teilzeile des Blocks.
Zaehler liegt darueber.
Nenner liegt darunter.
Freistehende Nachbarn fluchten auf diese Achse.

Damit gilt:
Der Bruchstrich fluchtet mit `=`,
nicht mit der lokalen Textmitte des Zaehler- oder Nennertexts.

## Wurzel- und Schalenlogik
### Wurzel
Eine Wurzel ist ebenfalls keine lokale Box.

Der Wurzelhaken belegt eigene sichtbare Slots.
Der Wurzelinhalt behaelt seine semantischen Inhaltsspalten.
Der Oberstrich der Wurzel spannt ueber genau diese Inhaltsspalten.

### Funktion, Gruppe, Potenz
Dasselbe Prinzip gilt fuer:
- `FUNCTION`
- `GROUP`
- `POWER`
- spaetere sichtbare Schalen

Die sichtbare Schale baut sich um einen bestehenden Inhaltsspan auf.
Sie darf diesen Inhaltsspan nicht neu definieren.

## Wrapper-Regel
Wenn ein Ausdruck in eine neue Schale eingezogen wird,
zum Beispiel von

```text
a * (cos(beta) / b)
```

nach

```text
acos(a * (cos(beta) / b))
```

dann gilt:
- der innere Ausdruck behaelt seine Spalten
- die neue Funktion baut sich darum herum auf
- linke und rechte Funktionsklammer bekommen eigene Slots
- die rechte Klammer besitzt ihre eigene Spalte und traegt keine fremde Tinte ueber sich

Die Huelle darf dabei den Ausdruck nicht fuer Darstellungszwecke algebraisch umschreiben,
zum Beispiel von `a * Bruch` zu `a` im Zaehler desselben Bruchs.

## Verboten
- Brueche lokal als normale Text- oder LaTeX-Box zu messen und danach global einzupassen
- innere Inhalte innerhalb sichtbarer Schalen neu zu zentrieren
- dieselbe Breite einmal semantisch und einmal als Boxbreite zu rechnen
- Display-seitige Umgruppierung von Produkten oder Quotienten nur fuer eine "schoenere" Anzeige
- rechte Klammern, Wurzelenden oder Bruchrandslots implizit in Nachbarspalten mitlaufen zu lassen
- eine Positionskorrektur einzufuehren, die nur einen Spezialfall trifft, aber nicht aus dieser Grundlogik folgt

## Pruefbare Folgen
Ein Renderpfad erfuellt diesen Vertrag nur dann,
wenn alle folgenden Aussagen wahr sind:

1. Derselbe mathematische Teilbaum behaelt ueber alle Loesungszeilen hinweg dieselben semantischen Inhaltsspalten, solange er algebraisch nicht veraendert wurde.
2. Ein Bruchstrich deckt genau den Shell-Span seines Inhalts ab und nicht die Breite einer spaeteren Boxmessung.
3. Wird ein Ausdruck in `FUNCTION`, `GROUP`, `ROOT` oder `POWER` eingehuellt, bleiben die inneren Spuren erhalten und nur die Shell-Slots kommen hinzu.
4. Das Gleichheitszeichen und die Bruchachse derselben Zeile werden aus derselben expliziten Achsenzeile gelesen.
5. Die rechte Abschlussklammer einer Funktion oder Gruppe besitzt immer ihre eigene Spalte und teilt diese nicht implizit mit innerem Inhalt.

## Architekturfolge
Dieser Vertrag ist fuer alle folgenden Schichten bindend:
- `core/P4_Projektion/`
- `components/Arbeitsblatt_Druckansicht/columnLayoutCore/`
- `components/Arbeitsblatt_Druckansicht/renderKernelCore/`
- `scripts/export_projection_pdf_core/`

Keine dieser Schichten darf eine zweite lokale Layoutwahrheit einfuehren.

## Ausfallanzeichen
Wenn einer der folgenden Effekte sichtbar wird,
ist der Vertrag verletzt:
- ein Bruch wird in einer spaeteren Zeile kuerzer oder laenger, obwohl sein Inhalt gleich blieb
- ein inneres `beta`, `a` oder `+` springt innerhalb derselben Struktur seitlich
- die rechte Klammer einer Funktion scheint ueber fremder Tinte zu stehen
- ein Ausdruck in `acos(...)` sieht ploetzlich enger oder anders gruppiert aus als vor dem Einhuellen
- der Bruchstrich fluchtet mit Zaehler- oder Nennertext statt mit der expliziten Achse
