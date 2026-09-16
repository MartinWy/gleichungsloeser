# Snapshots

Hier liegen spaeter feste Szenenzustaende,
mit denen das Uebergangsprojekt arbeitet.

Geplant sind mindestens:

- `before_state.json`
- `after_state.json`
- optional `mapping.json`

Der aktuelle reale Demo-Pfad arbeitet bereits mit:

- `real_bridge_handoff_left.json`
- `real_bridge_handoff_right.json`

Diese Dateien werden aus dem echten Kernpfad erzeugt
und enthalten:

- `boundary_state`
- `landing_profile`
- `landing_state`
- `before_state`
- `after_state`

Der aktive Stand vom 9. September 2026 enthaelt ausserdem den expliziten
Spurwechsel von B: `boundary_state.power_shell.content.functional_track_count`
ist `1`; `ordered_cells` fuehrt die inneren P4-Zellen dieser geschlossenen Spur,
und `landing_profile.term_slots` enthaelt danach genau einen normalen Zielslot
je diskret spaltentragender P4-Zelle.

Regel:

Diese Dateien sind Eingaben fuer das Uebergangsprojekt.
Sie aendern den aktiven Gleichungsloeser nicht.
