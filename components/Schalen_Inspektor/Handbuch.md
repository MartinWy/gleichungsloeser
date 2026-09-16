# Handbuch: Schalen_Inspektor

Status: prototypisch

## Zweck
Visuelle Diagnosekomponente fuer ausgewaehlte Faelle des derzeitigen produktiven Solve-Flow.

## Dateien
- `index.html`

## Verantwortung
- `core/index.js` aufrufen
- sichtbare Solve-Daten im Browser illustrieren
- Rohdaten als JSON zeigen

## Staerken
- nutzt den aktuellen Orchestrator
- macht Sichtbarkeit, Schalen und Befreiung direkt sichtbar

## Grenzen
- die Komponente ist Diagnose-UI, keine produktive API
- sie sollte Kernlogik nicht duplizieren, sondern nur rendern
- sie bildet derzeit nicht den vollen heutigen Schalenraum gleich gut ab
- sie darf nicht mit einer vollstaendig aktuellen Strukturdiagnose verwechselt werden
