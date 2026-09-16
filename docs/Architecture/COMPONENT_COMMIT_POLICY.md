# Component Commit Policy

Status: normativ  
Stand: 5. April 2026

## Ziel
Die Historie soll pro Komponente nachvollziehbar bleiben.
Ein Commit ist deshalb primaer eine Komponenteneinheit, nicht ein Sammelbehaelter fuer alles.

## Definition eines Komponenten-Commits
Ein Komponenten-Commit aendert vorzugsweise:
- genau eine Komponente
- die dazugehoerige lokale Doku
- die zugehoerigen Tests

## Erlaubte Commit-Groessen
- Lokal: eine Komponente
- Vertraglich: eine Komponente plus uebergeordnete Architekturdoku
- Querschnitt: mehrere Komponenten nur mit expliziter Begruendung

## Commit-Regeln
1. Wenn `P2` geaendert wird, gehoeren `P2`-Doku und `P2`-Tests dazu.
2. Wenn ein Pfad umbenannt wird, muessen auch betroffene Komponenten und Tests angepasst oder als legacy markiert werden.
3. Projektstandsnotizen gehoeren dazu, wenn eine Aenderung Lernwert oder Risiko hat.
4. Bei Strukturmigrationen werden produktive Dateien nicht verschoben, sondern zuerst kopiert oder sauber neu gebaut.
5. Ein Struktur-Commit darf nie gleichzeitig den alten Pfad loeschen und den neuen Pfad erstmalig einfuehren.

## Empfohlenes Commit-Muster
`<Komponente>: <kurzer Zweck>`

Beispiele:
- `P1_Eingabe: dokumentiere aktuellen ID-Vertrag`
- `P4_Projektion: markiere Projektionsgrenzen im Vertrag`
- `Schalen_Inspektor: dokumentiere aktiven Diagnosepfad`

## Vor jedem Commit pruefen
- Ist klar, welche Komponente eigentlich betroffen ist?
- Liegt die Doku direkt bei der Komponente vor?
- Sind globale Architekturdateien nur dann mitgeaendert, wenn ihr Vertrag wirklich betroffen ist?
- Ist der alte Pfad noch unangetastet, solange der neue Pfad noch beweisen muss, dass er traegt?
