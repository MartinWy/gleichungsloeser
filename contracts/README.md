# contracts

Status: gemeinsame Vertragswurzel aktiv; einzelne V2-Zielvertraege noch nicht umgesetzt
Stand: 7. September 2026

## Zweck

`contracts` enthaelt die gemeinsamen Austauschformate,
ueber die die getrennten Hauptkomponenten miteinander sprechen.

Aktiv angelegt sind:

- Solve-State
- Projection-State
- Bridge-State
- Render-Scene
- Render-Settings
- Worksheet-Profile

## Eigentumsgrenze

Contracts definieren:

- Pflichtfelder
- Versionen
- erlaubte Varianten
- Invarianten
- Validierungsfehler

Contracts erzeugen nicht:

- Solverentscheidungen
- Umformungen
- funktionale oder visuelle Geometrie
- Adapterwerte

## Regeln

- Keine versteckten Direktimporte zwischen Hauptkomponenten.
- Jeder neue Austauschpfad wird hier sichtbar beschrieben.
- Ein Adapter darf einen unvollstaendigen Vertrag nicht durch Rekonstruktion auffuellen.
- Funktionale Geometrie wird in `projection_state` und `render_scene` nur transportiert.
- Visuelle Einstellungen gehoeren ausschliesslich in `render_settings`.

## Zugeordnete Tests

Die Einzeltests stehen pro Vertrag in `docs/Genesis/Neustart_2026-07-28/MODULE_MATRIX.md`.
