# Contract

## Mandat

Dieses Projekt ist ein reines Renderprojekt fuer hochgradig komplexe Ausdruecke.

Es hat genau eine Aufgabe:
- komplexe Ausdruecke visuell sauber und prinzipientreu zu setzen

Es hat ausdruecklich nicht die Aufgabe:
- Gleichungen umzuformen
- den aktuellen Gleichungsloeser zu reparieren
- bestehende Rendererdateien direkt umzubauen

## Harte Trennung

Dieses Projekt darf:
- Wissen kopieren
- Beispiele kopieren
- Ideen kopieren
- Referenz-Snapshots erzeugen

Dieses Projekt darf nicht:
- A veraendern
- B veraendern
- den bestehenden Kern ueberschreiben
- bestehende Architekturtexte als laufenden Stand uminterpretieren

## Layoutprinzipien

1. Es gibt kein globales Spaltenraster fuer komplexe Ausdruecke.
2. Schalen sind keine Spalten.
3. Nur echte Vertikalbeziehungen erzeugen eine gemeinsame lokale Spanne.
4. Ein Bruch erzeugt einen lokalen Stapel:
   Zaehler und Nenner teilen sich dieselbe lokale Breite.
5. Eine Wurzel erzeugt keine eigene Spalte fuer ihren Inhalt:
   Das Wurzelzeichen ist Schale, der Inhalt ist Inhalt.
6. Eine Potenz erzeugt keine lineare Fortsetzung des Grundterms:
   Exponent und Basis bilden eine lokale Beziehung.
7. Klammern folgen der Hoehe ihres Inhalts, nicht einem Raster.
8. Verschachtelung ist primaer ein Baumproblem, nicht ein Spaltenproblem.
9. Es gibt genau zwei Atomgroessen:
   normale Atome und Exponenten.
10. Brueche, Wurzeln und Klammern duerfen die Groesse normaler Atome nicht verkleinern.
11. Wurzeln werden als Projektion ueber bereits gesetzte Inhalte gebaut:
   erst Atome, dann Schale.
12. Jeder Teilbaum liefert drei verbindliche Werte:
   `axis`, `contentBounds`, `visibleBounds`.
13. Schalen lesen immer `contentBounds`, nicht Textserialisierung und nicht fruehere Zeilen.
14. Die Zeilenhoehe liest immer `visibleBounds`, nicht nur einzelne Teilschalen.

## Erfolgsdefinition

Der erste Erfolg dieses Projekts ist nicht:
- dass es schon in den Hauptloeser integriert ist

Der erste Erfolg dieses Projekts ist:
- dass Referenzfaelle sauber als eigenstaendige Setzaufgabe beschrieben sind
- dass Golden References existieren
- dass die Regeln fuer lokale Stapel und Schalen explizit sind
