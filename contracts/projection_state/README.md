# projection_state

Status: V1 implementiert; funktionaler V2-Zielvertrag dokumentiert
Stand: 7. September 2026

Hier liegt jetzt der versionierte Vertrag
fuer positionstreue Projektionsdaten.

Aktuell exportiert `index.js`:

- Pflichtfelder fuer `projectionRows`
- Pflichtfelder fuer `layoutPlan`
- eine minimale Projektionsvorlage
- Invarianten fuer Positionstreue und Verbrauchbarkeit ohne Neuloesen

## Genesis-Zielvertrag

`projection_state` ist der letzte neutrale Core-Vertrag vor Adaptern und Renderern.
Er muss deshalb nicht nur Atompositionen,
sondern die vollstaendige funktionale Geometrie enthalten.

Jede `projectionRow` muss mindestens tragen:

- `rowId` und `sourceRowId`
- funktionale Reihen mit expliziten Rollen
- eine explizite Achsenreihe
- `positionedAtoms` mit stabilen Quellidentitaeten
- `shellSpans` als kanonische zeilenlokale Schalenauftreten
- eine explizite sichtbare Darstellungsform pro Schalenauftreten

Jeder Eintrag in `shellSpans` muss mindestens tragen:

- stabile `shellId`
- zeilenlokale Identitaet aus `rowId + shellId`
- `shellType`
- `parentShellId` und explizite Kind- oder Inhalts-IDs
- Inhalts-, Ausrichtungs- und Huelleband
- obere, Achsen- und untere funktionale Reihe
- `geometryBirthRowId`
- Transportzustand
- sichtbare Huelleprimitive
- explizite Darstellungsform

`layoutPlan` darf die globale funktionale Lage zusammenfassen.
Es darf keine medienabhaengigen Pixel-, Font- oder Papierwerte enthalten.

## Aktuelle Luecke

Die Implementierung in `contracts/projection_state/index.js`
validiert derzeit nur einen kleinen V1-Ausschnitt.
Sie verlangt weder `shellSpans` noch die explizite Darstellungsform.

Bis diese Pflichtfelder versioniert, implementiert und getestet sind,
ist `projection_state` kein vollstaendiger Renderer-Eingabevertrag.

## Verboten

- funktionale Shell-Geometrie erst im Adapter oder Renderer ergaenzen
- Kindbeziehungen aus Spannen oder Text rekonstruieren
- fehlende Darstellungsform durch Medienlogik waehlen
- visuelle Masse in die funktionale Ortswahrheit mischen

## Zugeordnete Tests

- `tests/active/core_a_target_entrypoint.test.js`
- `tests/active/core_a_render_scene_adapter.test.js`
- `tests/active/root_chrome_overlay_contract.test.js`
- `tests/active/root_shell_projection_export.test.js`

Ein neuer negativer Vertragsbeweis muss unvollstaendige `shellSpans` ablehnen.
