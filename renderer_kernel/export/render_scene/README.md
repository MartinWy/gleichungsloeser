# render_scene

Status: atomarer Szenen-Ingest aktiv; kein interner Shell-Szenenplan  
Stand: 10. September 2026

Dieser Baustein ist der erste echte Verbraucher
des neutralen `render_scene`-Vertrags
im kuenftigen `renderer_kernel`.

Er darf bewusst nur:

1. `render_scene` validieren
2. explizit zugeordnete Szenenknoten renderer-tauglich gruppieren
3. gelieferte funktionale Reihen, Spannen und Kindbeziehungen unveraendert lesen

Er tut bewusst nicht:

- neue Mathematik bauen
- neue Spalten berechnen
- eigene Shell-Geometrie erfinden
- Shell-Zugehoerigkeit aus `sourceAtomId`, Text oder geometrischem Einschluss erraten
- Reihenrollen aus der Lage zur Achse rekonstruieren
- unvollstaendige Szenen mit Fallbackwerten gueltig erscheinen lassen
- den Alt-Renderer ueberschreiben

## Pflichtverhalten

Wenn eine fuer die visuelle Ausgabe benoetigte funktionale Angabe fehlt,
liefert der Ingest einen Vertragsfehler.
Er darf die fehlende Angabe nicht aus anderen Knoten ableiten.

Sortieren ist nur zulaessig,
wenn die Sortierschluessel bereits Bestandteil des Vertrags sind.
Gruppieren ist nur zulaessig,
wenn die Gruppenidentitaet und Eltern-Kind-Zuordnung explizit geliefert werden.

## Zugeordnete Tests

- `tests/active/render_scene_contract_entrypoint.test.js`
- `tests/active/renderer_kernel_render_scene_ingest.test.js`

Ein weiterer negativer Test muss beweisen,
dass unvollstaendige funktionale Shell-Geometrie nicht rekonstruiert wird.
