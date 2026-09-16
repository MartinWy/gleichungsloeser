# Tabula-Rasa-Mandat

Stand: 8. September 2026

## Zweck
Dieses Dokument zieht die harte Linie zwischen:

- Wissen, das erhalten bleiben muss
- alter Runtime, die nicht mehr fuehrend sein darf
- neuem aktiven Kern, der ohne Altlasten wachsen soll

## Nicht verhandelbar
1. Alter Code darf als Wissen erhalten bleiben.
2. Alter Code darf nicht mehr die Architektur des neuen Kerns fuehren.
3. Archiv ist erlaubt.
4. Laufzeitabhaengigkeit auf Archiv ist verboten.
5. Rekonstruktion spaeterer Phasen bleibt verboten.
6. Jede neue Kernentscheidung muss in Genesis begruendet sein.
7. Genesis wird vor lokalen Richtlinien, Tests und Code geaendert.
8. Jedes aktive Modul besitzt Richtlinie, verantwortlichen Code und einen im Standardlauf registrierten Test.
9. Funktionale Geometrie entsteht im Core von innen nach aussen.
10. Renderer bauen nur visuelle Geometrie auf Basis dieser funktionalen Geometrie.
11. Ein Prozessmodul uebernimmt einen gueltigen Vertragszustand, erfuellt genau eine Aufgabe und uebergibt einen gueltigen Folgezustand.
12. Schalenarten sind Situationen innerhalb der Prozessmodule und keine versteckten Parallelprozesse.
13. Fehlende oder ungueltige Pflichtdaten fuehren zum expliziten Abbruch, nicht zu Reparatur oder Fallback.

## Archivregel
Alles, was vor diesem Neustart bereits als Runtime-Pfad existierte,
wird als historischer Referenzstand behandelt.

Es darf:
- gelesen werden
- verglichen werden
- als Fehler- und Erfahrungsquelle dienen

Es darf nicht:
- neue Architekturprinzipien diktieren
- als versteckte Abkuerzung im neuen Kern wieder auftauchen
- als Rueckfalloption aktive Designentscheidungen bestimmen

## Aktivregel
Der neue Kern waechst nur noch in einer ausdruecklich markierten aktiven Runtime-Zone.

Diese Zone darf:
- nur aus Genesis-Prinzipien entstehen
- nur eine Verantwortung pro Modul haben
- keine Imports aus Archivpfaden haben
- keine fachlich veraendernden Hilfsschritte zwischen benannten Modulen enthalten

## Bauprinzip von innen nach aussen

Die semantische Schachtelung entsteht in `P1` und `P3`.

`P4` baut daraus die funktionale Geometrie bottom-up:

```text
Atome -> innere Schale -> aeussere Schale -> Output Contract
```

Renderer uebersetzen diese fertige funktionale Geometrie
in visuelle Pixel-, `em`- oder Papiergeometrie.

Sie duerfen keine Kindzugehoerigkeit,
Spur,
Bandbreite,
Teilzeile
oder Achse neu bestimmen.

## Aktivierungsregel fuer Module

Ein Modul ist nur aktiv,
wenn alle Nachweise getrennt vorliegen:

1. fuehrende Richtlinie
2. benannter Vorgaenger, Eingabe, Ausgabe und Nachfolger
3. vollstaendige Situationsmatrix mit kanonischen Schalenverweisen
4. genau ein verantwortlicher Codepfad
5. zugeordneter Test im Standard-Runner
6. heutiger gruener Beweis

Vorbereitete Ordner ohne diese Dreierbindung bleiben Zielstruktur,
Migration oder isolierter Neubau.

## Fuehrungsfrage
Bei jeder neuen Datei gilt nur noch diese Frage:

"Ist diese Datei Teil des neuen aktiven Kerns oder Teil des Archivs?"

Ein Dazwischen ist nicht erlaubt.

Ist sie Teil des aktiven Kerns,
muss zusaetzlich eindeutig sein,
welchem einen Prozessmodul und welcher einen Aufgabe sie gehoert.
