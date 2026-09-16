# export

Status: Export-Fassade fuer den atomaren Szenen-Ingest aktiv
Stand: 10. September 2026

Hier liegt jetzt der neutrale Aussenrand des kuenftigen Renderkerns.

Er beschreibt:

- den offiziellen Ziel-Einstieg des Renderkerns
- die Exportgruppen `atoms`, `rows`, `shells`, `metrics`, `roots`
- die neue Exportgruppe `groups` fuer echte Klammerregeln
- das konsumierte `render_scene`-Vertragsprofil
- den ersten lesenden Szenen-Ingest fuer den gemeinsamen Szenenraum
- die Invarianten des lesenden Renderkerns

Die abgeloesten experimentellen Scene-Plan-, Root- und Group-Pfade liegen
ausserhalb der aktiven API unter `alt/2026-09-10_pre_atomic_renderer_kernel/`.

## Vertragsgrenze

`export/` ist trotz seines Namens ein lesender Renderer-Aussenrand.
Er darf:

- den `render_scene`-Vertrag validieren
- Felder verlustfrei gruppieren und fuer visuelle Spezialisten adressierbar machen
- fertige visuelle Projektionen nach aussen geben

Er darf nicht:

- funktionale Geometrie vervollstaendigen
- Shell-IDs oder Kindbeziehungen aus Fragmenten zusammensuchen
- Spannen aus sichtbaren Knoten neu berechnen
- fehlende Rollen oder Darstellungsformen mit Defaults kaschieren

Der aktuelle `render_scene`-V1-Vertrag traegt noch nicht alle
von Genesis geforderten funktionalen Pflichtfelder.
Darum ist diese Fassade noch nicht vollstaendig freigegeben.

## Perspektive

Spaeter bleibt dies die Heimat fuer Renderer-Fassaden:

- oeffentliche Renderer-API
- SVG/PDF-nahe Ausgabehilfen
- Adapter nach aussen
