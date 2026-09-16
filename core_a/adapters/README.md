# adapters

Status: erste Adapterphase aktiv  
Stand: 9. August 2026

Hier liegen die expliziten Adapter an den Kern.

Aktuell ist der erste echte Adapter vorhanden:

- `render_scene/`
- `bridge_boundary/`
- `bridge_landing_profile/`

Er uebersetzt den vorhandenen Kernexport
`projectionRows + layoutPlan`
in den neutralen Szenenraum `render_scene`.

Der neue Boundary-Adapter liest dagegen
einen kompletten `solve_state`
und exportiert daraus die Grenzzeile
fuer den Bridge-Uebergang komplexer Exponenten.

Der Landing-Profile-Adapter liest die reale Folgezeile
nach dieser Grenze
und exportiert daraus das Zielprofil,
an dem `B` die Landung ausrichten muss.
