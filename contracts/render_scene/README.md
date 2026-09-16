# render_scene

Status: V1 implementiert; funktionaler V2-Zielvertrag dokumentiert
Stand: 7. September 2026

Hier liegt jetzt der neutrale Vertrag
fuer Render-Szenen und Render-Knoten.

Er ist bewusst kein Solververtrag
und auch kein Renderer.

Er beschreibt:

- welche Szenentypen es gibt
- in welchem Koordinatenraum sie liegen
- welche Knotentypen ein Verbraucher erwarten darf
- welche Mindestfelder jede Szene tragen muss
- welche funktionale Geometrie unveraendert aus `projection_state` ankommt

Damit koennen `bridge_b`,
`renderer_kernel`,
`cockpit_user`
und `cockpit_designer`
denselben Szenenraum referenzieren,
ohne sich gegenseitig intern zu kennen.

## Eigentumsgrenze

`render_scene` berechnet nichts.
Der Vertrag transportiert nur:

```text
Core-Funktionalgeometrie
-> schemafeste Render-Szene
-> visuelle Renderer-Geometrie
```

## Pflichtdaten des V2-Ziels

Eine Render-Szene muss mindestens enthalten:

- `sceneId`, `sourceProject`, `coordinateSpace`
- `atoms`, `shells` und `focusIds`
- die atomare Zielmarkierung `isTarget`, aus der `focusIds` ohne Textvergleich
  uebernommen werden
- explizite funktionale Reihen und Achsen
- explizite globale und zeilenlokale Spaltenlagen
- kanonische Schalenauftreten mit `rowId + shellId`
- `parentShellId` und explizite Kind- oder Inhalts-IDs
- Inhalts-, Ausrichtungs- und Huellebaender
- funktionale obere, Achsen- und untere Reihen
- sichtbare Huelleprimitive
- `geometryBirthRowId` und Transportzustand
- explizite sichtbare Darstellungsform

Die vorhandenen `rowMeta.shellSpans` sind der aktuelle Anknuepfungspunkt.
Sie muessen verlustfrei transportiert
und als kanonische funktionale Schalenquelle benutzt werden.

## Blindheitsregel

Ein Renderer-Verbraucher darf nicht:

- Shell-Tracks aus `sourceAtomId` oder Text erraten
- Kindschalen durch geometrischen Einschluss finden
- Reihenrollen aus relativer Lage zur Achse rekonstruieren
- Inhalts- oder Huellebounds aus sichtbaren Fragmenten neu bilden
- Fokus-IDs durch Textvergleich erzeugen
- eine fehlende Darstellungsform selbst waehlen

Fehlt eine Pflichtangabe,
ist die Szene ungueltig.
Ein Default oder Fallback waere eine zweite funktionale Wahrheit.

## Aktuelle Luecke

`contracts/render_scene/index.js` implementiert noch den minimalen V1-Vertrag vom 9. August.
Er prueft die funktionale Geometrie nicht vollstaendig.

Der naechste Versionsschritt muss zuerst den Vertrags- und Negativtest festlegen
und danach die Implementierung auf eine neue Vertragsversion heben.

## Zugeordnete Tests

- `tests/active/render_scene_contract_entrypoint.test.js`
- `tests/active/core_a_render_scene_adapter.test.js`
- `tests/active/renderer_kernel_render_scene_ingest.test.js`
- `tests/active/renderer_kernel_target_entrypoint.test.js`

Der fruehere Szenenplan-Test ist zusammen mit dem rekonstruierenden
Sammelrenderer archiviert. Er ist kein aktiver Vertrag mehr: Nach dem heutigen
atomaren Vertrag darf `renderer_kernel` keine Schalen- oder Sammelspuren aus
einzelnen Renderknoten neu bilden.
