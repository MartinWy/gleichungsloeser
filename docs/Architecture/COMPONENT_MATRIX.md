# Component Matrix

Status: operativ  
Stand: 12. Juli 2026

## Komponentenordner-Audit

| Komponente | Brauchen wir sie noch? | Ist sie aktuell? | Tut sie nur, was sie soll? | Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| `Arbeitsblatt_Druckansicht` | ja | ja, mit kleineren Doku- und UI-Altersmarken | weitgehend ja | aktiv behalten |
| `Arbeitsblatt_Druckansicht/columnLayoutCore` | ja | ja | ja, nach Entkopplung von `columnWidths.js` noch sauberer | aktiv behalten |
| `Arbeitsblatt_Druckansicht/renderKernelCore` | ja | ja | ja, nach Aufteilung in RenderNode-Aufbau und Row-Metrik | aktiv behalten |
| `0_Basis_Muster` | ja, als Vorlage | ja | ja | prototypisch behalten |
| `Schalen_Inspektor` | ja, als leichte Diagnose | nur teilweise | nur teilweise, weil die heutige Schalentiefe nicht voll abgebildet wird | prototypisch behalten oder spaeter modernisieren |
| `FractionVisualizer` | nicht fuer den aktiven Pfad | nein | nein, weil er auf alte Core-Pfade zeigt | legacy, Kandidat fuer `components/alt/` |
| `ID_Inspektor` | nicht fuer den aktiven Pfad | nein | nein, weil er auf alte Ingestion-Pfade zeigt | legacy, Kandidat fuer `components/alt/` |
| `Umzugs_Inspektor` | nur als statische Referenz | ja, aber bewusst nicht technisch | ja, fuer einen reinen Mock | prototypisch oder spaeter nach `components/alt/` |

## Produktive Verdrahtung

Heute produktiv verdrahtet sind nur:

- Root-Einstieg `index.html`
- Browser-Bundle aus `scripts/build_browser_bundle.mjs`
- Einstiegskomponente `components/Arbeitsblatt_Druckansicht/logic.js`

Die anderen Komponenten sind Diagnose-, Mock- oder Altspuren.

## Wichtigste Befunde

### 1. `Arbeitsblatt_Druckansicht`
- ist klar die produktive Peripherie
- ist weiterhin noetig
- delegiert Kernwahrheit korrekt an `core/index.js`
- delegiert die physische Spaltenlogik jetzt an `columnLayoutCore/`

### 2. `columnLayoutCore`
- ist ein echtes Untermodul und sollte als eigene Komponente gelesen werden
- ist heute der sauberste modularisierte Bereich unter `components/`
- die Fremd-Fassadenrolle in `columnWidths.js` wurde entfernt; die Datei ist wieder reine Breitenaggregation

### 3. `renderKernelCore`
- ist jetzt ebenfalls ein echtes Untermodul
- trennt strukturellen `renderNode`-Aufbau von Teilzeilen- und Achsenmetriken
- `renderKernel.js` ist dadurch wieder reine Fassade statt gemischter Sammeldatei

### 4. `Schalen_Inspektor`
- nutzt zwar den aktuellen Orchestrator
- bildet aber nicht den vollen heutigen Struktur- und Schalenraum gleich zuverlaessig ab
- ist deshalb besser als prototypische Diagnose statt als voll aktive Referenz beschrieben

### 5. Legacy-Komponenten
- `FractionVisualizer` und `ID_Inspektor` sind nicht mehr an heutige Core-Vertraege angeschlossen
- sie sollten nicht mit aktiven Komponenten verwechselt werden
- wenn der sichtbare Komponentenordner schlanker werden soll, sind sie die ersten Kandidaten fuer `components/alt/`

### 6. Didaktische Mock-Komponente
- `Umzugs_Inspektor` ist kein technischer Teil des Systems
- als statischer Mock ist das in Ordnung
- fuer einen strikt technischen Komponentenordner waere auch sie ein spaeterer Archivkandidat
