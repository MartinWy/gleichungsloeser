# Wiring Plan: Zielbild fuer die Verdrahtung

Status: normatives Zielbild  
Stand: 5. April 2026

## 1. Zentrales Prinzip
`core/index.js` ist nicht nur ein technischer Hub,
sondern das Zentrum, an dem der Gleichungsloeser als kanonische Wahrheit zusammenlaeuft.

Die Phasen haengen ueber definierte Aufrufe am Orchestrator und nicht kreuzweise direkt aneinander.
Alle spaeteren Verbraucher haengen am Rueckgabeobjekt des Kerns und nicht an versteckten Nebenpfaden.

Wesentlich ist das Zwei-Durchlauf-Modell:
- Durchlauf A: Theorie erzeugen
- Durchlauf B: positionstreu setzen

## 2. Direkte Partner
| Komponente | Muss verbunden sein mit | Zweck |
| :--- | :--- | :--- |
| `core/index.js` | `P1_Eingabe` | Struktur aus String und stabile IDs erzeugen |
| `core/index.js` | `P2_Strategie_Analyse` | naechste Aktion bestimmen |
| `core/index.js` | `P3_Umformung` | Theorie-Zeilen erzeugen |
| `core/index.js` | `P4_Projektion/PreFlightEngine` | globale Layoutmatrix vorbereiten |
| `core/index.js` | `P4_Projektion/Regelwerk` | Zeilen anhand der Matrix positionstreu setzen |
| `core/index.js` | Exportmodell | kanonische Solve-Daten fuer externe Verbraucher bereitstellen |
| Diagnose-Komponenten | `core/index.js` oder explizit freigegebene Teil-API | Visualisierung und Debugging |
| Filmgenerator | Exportmodell | Animationen derselben Atome und Schritte |
| Arbeitsblattgenerator | Exportmodell | didaktische Auswahl ohne Aenderung der Kernwahrheit |

## 3. Produktiver Solve-Flow
1. `solve(equation)` startet im Orchestrator.
2. `P1` erzeugt eine Struktur mit stabilen IDs.
3. `P2` bestimmt den naechsten zulaessigen Schritt.
4. `P3` erzeugt den naechsten Theorie-Zustand.
5. Der Orchestrator sammelt alle Theorie-Zeilen.
6. `P4 PreFlight` analysiert diese Zeilen global und baut die Spalten-/Breitenmatrix.
7. `P4 Setzlauf` setzt die einzelnen Zeilen mit stabilen `row`/`col`-Positionen.
8. Der Orchestrator baut daraus das Exportmodell des Gleichungsloesers.
9. Diagnose, Rendering, Film oder Arbeitsblatt nutzen diese kanonischen Daten.

## 4. Adapter-Flow
Ein Andocksystem darf:
- den kompletten Orchestrator aufrufen und dessen Theorie-, Projektions- und Exportdaten nutzen
- eine definierte Teil-API verwenden, wenn diese explizit dokumentiert ist
- eigene Ausgabeprofile bilden, solange die Kernwahrheit unberuehrt bleibt

Ein Andocksystem darf nicht:
- produktive Kernlogik kopieren
- veraltete Importpfade still als Standard verwenden
- eigene Spaltenlogik neben dem PreFlight entwickeln
- die atomare Solve-Geschichte durch lokale Vereinfachung ersetzen

## 5. Verbotsmatrix
- `P1` ↛ `P3`
- `P2` ↛ `P4`
- `P3` ↛ UI
- `P4` ↛ Parser
- `components/*` ↛ versteckte Core-Forks
- Exporter ↛ ID-Neuerzeugung
- Film-/Arbeitsblatt-Generatoren ↛ Solver-Reimplementierung

## 6. Verdrahtungsziel fuer die Zukunft
- aktive Komponenten importieren nur aktuelle `P`-Pfadmodule
- PreFlight und Setzlauf werden als zwei explizite Unterteile von `P4` gefuehrt
- das Rueckgabeobjekt von `core/index.js` wird zur offiziellen Kernschnittstelle
- Film, Arbeitsblatt und Diagnose greifen ueber das Exportmodell an
- veraltete 0-3-, `transformation/`- oder `topology/`-Pfade werden entweder migriert oder explizit als legacy markiert
- jeder Querschnittspfadwechsel wird in `CHRONICLE.md` und `LESSONS_LEARNED.md` vermerkt
