# PROTOCOL v1.0.0 - Gleichungsloeser

Status: aktiv  
Stand: 5. April 2026

## Zweck
Dieses Dokument definiert die operative Architektur-Norm fuer den Gleichungsloeser.
Es beschreibt nicht die ganze Mathematik, sondern die Aufteilung der Verantwortung.

## Das Zentralprinzip
Der Gleichungsloeser ist das Herz des Projekts.
Nicht Diagnose, nicht UI und nicht spaetere Ausgabeformen tragen die Wahrheit,
sondern der Kern unter `core/`.

Alle weiteren Systeme haengen an derselben Rueckgabe an:
- Diagnose-Komponenten
- Filmgeneratoren
- Arbeitsblattgeneratoren
- spaetere Renderer

## Die vier Kernphasen
| Phase | Name | Fokus | Verantwortung |
| :--- | :--- | :--- | :--- |
| `P1` | `Eingabe` | Struktur lesen | Eingabestring in Atome und Schalen ueberfuehren |
| `P2` | `Strategie_Analyse` | Zulaessigkeit | naechste erlaubte strukturelle Aktion bestimmen |
| `P3` | `Umformung` | Transformation | die ausgewaehlte Strukturveraenderung ausfuehren |
| `P4` | `Projektion` | Sichtbarkeit | Struktur fuer Darstellung, Positionstreue und Export vorbereiten |

## Architekturgesetze
1. `core/index.js` ist der produktive Orchestrator.
2. `P1` bis `P4` bleiben phasenrein; keine heimlichen Queraufrufe.
3. Die kanonische Wahrheit besteht aus Atomen, Umbaugeschichte und positionstreuer Projektion.
4. UI-Komponenten unter `components/` sind Diagnose- oder Visualisierungskomponenten, keine Fachinstanzen.
5. Export ist eine offizielle Kernschnittstelle und keine nachtraegliche Behelfsausgabe.
6. Jede Komponente muss lokal dokumentiert sein.
7. Wenn sich ein Vertrag aendert, muessen Doku und Tests im selben Commit mitgezogen werden.
8. Komponenten werden kuenftig komponentenweise committed, nicht mehr paketweise ueber das ganze Projekt.

## Dokumentationsregel
Die Dokumentation lebt auf drei Ebenen:
- Projektweit: `PROTOCOL.md`, `CHRONICLE.md`, `docs/Architecture/*`, `docs/Genesis/*`
- Komponentenweit: lokale `Handbuch.md`, `CONTRACT.md`, `EVENTFLOW.md`
- Projektstand: `docs/Projektstand/*`

## Harte Verbote
- `P2` darf keine Transformation ausfuehren.
- `P3` darf keine neue Strategie erfinden.
- `P4` darf keine mathematische Regel anwenden.
- `components/*` duerfen keine eigene Solver-Logik als Wahrheit einfuehren.
- Film- oder Arbeitsblattgeneratoren duerfen keine zweite Atomhistorie erfinden.
- Tests und Komponenten duerfen keine veralteten Pfade stillschweigend weitertragen, ohne dass dies dokumentiert wird.
