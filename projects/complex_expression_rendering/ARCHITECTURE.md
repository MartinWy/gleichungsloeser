# Architecture

## Grundidee

Der aktuelle Hauptloeser arbeitet stark ueber Spalten, Weiterreichen und Positionstreue.
Fuer hochgradig komplexe Ausdruecke reicht dieses Modell nicht mehr aus.

Dieses Seitenprojekt ersetzt das globale Spaltendenken durch ein lokales Boxen- und Stapelmodell.

## Kernmodell

Ein Ausdruck wird als Baum beschrieben.

Zusaetzliche Grundregel:
- Normale Atome behalten ueber den ganzen Prozess ihre Groesse.
- Es gibt nur zwei Schriftgroessen:
  normale Atome und Exponenten.

Knotentypen:
- `text`
- `sequence`
- `fraction`
- `root`
- `power`
- `group`
- `function`

## Lokale Breiten

Breite wird immer lokal bestimmt:
- `sequence`: Summe der Kinder
- `fraction`: Maximum aus Zaehlerbreite und Nennerbreite
- `root`: Breite aus Wurzelzeichen plus Inhaltsbreite
- `power`: Breite aus Basis plus lokalem Exponentenraum
- `group`: Breite aus linker Klammer plus Inhalt plus rechter Klammer

## Lokale Vertikalbeziehungen

Nur diese Beziehungen erzeugen gemeinsame lokale Spannen:
- Zaehler ueber Nenner
- Exponent ueber Basis
- optional Wurzelgrad ueber Wurzelhaken

Alles andere ist Schachtelung, nicht Spaltenbindung.

## Projektion der Schalen

Wurzeln und Klammern werden nicht als normale Zellen gesetzt.

Stattdessen gilt:
1. Zuerst werden die inhaltlichen Atome gesetzt.
2. Diese Atome behalten ihre Schriftgroesse und ihre lokale Lage.
3. Danach wird die Wurzel als Schale ueber den bereits belegten Raum projiziert.
4. Die Wurzel liest also den linken Rand, den rechten Rand, die Oberkante und die Unterkante ihres Inhalts.
5. Erst aus dieser Projektion entstehen Haken, Anstieg und Balken.

Damit ist die Wurzel kein traegendes Rasterelement, sondern eine nachgelagerte Huelle.

Dieselbe Logik gilt auch fuer Klammern:
- erst Inhalt
- dann Projektion der Schale entlang der Inhaltshoehe

## Kaskadenregel

Die Renderreihenfolge ist eine Kaskade.

1. Atome liefern feste Grundmetriken.
   Es gibt nur `normal` und `Exponent`.
2. Daraus entsteht pro Teilbaum eine lokale `axis`.
   Diese Achse ist die mathematische Grundlinie des Teilbaums.
3. Daraus entstehen `contentBounds`.
   Sie beschreiben den inhaltlich relevanten Raum eines Teilbaums, ohne spaetere Huellschalen.
4. Daraus entstehen Schalen:
   Klammern, Brueche und Wurzeln lesen die `contentBounds` ihrer Kinder.
5. Daraus entstehen `visibleBounds`.
   Sie beschreiben den tatsaechlich sichtbaren Endraum inklusive Schalen.
6. Die Zeilenhoehe liest am Ende die maximalen `visibleBounds` aller sichtbaren Teile dieser Zeile.

Wichtig:
- Klammern lesen die Hoehe ihres Inhalts.
- Brueche lesen die Hoehen von Zaehler und Nenner.
- Wurzeln lesen die Hoehe ihres Inhalts.
- Keine Schale darf die normale Atomgroesse verkleinern.

## Erste Projektphasen

1. Referenzfaelle sammeln.
2. Fuer jeden Referenzfall ein explizites Strukturmodell festhalten.
3. Golden-Reference-Ausgaben erzeugen.
4. Erst danach einen eigenen Renderkernel fuer Boxen und Stapel bauen.

## Bewusste Nicht-Ziele

- keine Rueckintegration in A im ersten Schritt
- kein Umbau des aktuellen Renderers in diesem Projekt
- kein Mischbetrieb mit dem bestehenden globalen Spaltenraster
