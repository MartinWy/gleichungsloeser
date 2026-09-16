# core_a

Status: Ziel-Fassade aktiv; bleibt Migration ohne zweite Kernlogik
Stand: 7. September 2026

## Zweck

`core_a` ist die kuenftige Ordnerwurzel
des bestehenden mathematischen Hauptkerns.

Hier soll spaeter nur der kanonische Gleichungsloeser liegen:

- Eingabe
- Strategie
- Umformung
- positionstreue Solve-Zustaende
- funktionale Orts- und Schalengeometrie
- Export des Kernzustands

## Heute

Heute bleibt der produktive Kern noch unter:

```text
core/
```

Der produktive Altpfad bleibt dort unangetastet.

Hier existieren jetzt bereits:

- `index.js` als Ziel-Fassade auf `core/index.js`
- `adapters/` mit dem formalen Einstiegspunkt
- `contracts_out/` als Ausgabevertragsschicht
- ein erster Boundary-Adapter fuer `solve_state -> boundary_state`
- ein erster Landing-Profile-Adapter fuer `solve_state -> landing_profile`

Wichtig:

- Es wurde nichts aus `core/` verschoben.
- Die neue Struktur beschreibt den aktiven Kern nur lesend.

## Regeln

- Keine produktiven Dateien verschieben, solange kein expliziter Migrationsschritt beschlossen ist.
- Keine neuen Imports aus `core_a/` im aktiven System ohne eigenen Andockschritt.
- Jede spaetere Befuellung muss zuerst mit Genesis und danach mit der Magna Carta konsistent sein.
- `core_a` darf keinen zweiten Solver neben `core/GenesisRuntime/` bilden.
- Adapter duerfen nur Schemata uebersetzen; sie erzeugen weder funktionale noch visuelle Geometrie.

## Zugeordnete Tests

- `tests/active/core_a_target_entrypoint.test.js`
- Adaptertests unter `tests/active/core_a_*_adapter.test.js`

Die Zielfassade und beide Bridge-Adapter sind gruen.
Der Render-Scene-Adapter ist rot.
