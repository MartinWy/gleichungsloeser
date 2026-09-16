# renderKernelCore

Status: produktiver Migrationspfad; Blindheitsgrenze noch nicht vollstaendig umgesetzt
Stand: 7. September 2026

## Zweck

Dieses Untermodul enthaelt die reine Render-Vorbereitung der Arbeitsblatt-Druckansicht.

Die Trennung ist absichtlich:

- `renderNodeFactory.js` muss explizite Darstellungsrollen in visuelle `renderNode`s und Zelltexte uebersetzen
- `rowMetrics.js` muss gelieferte funktionale Teilzeilen und Achsen in physische Zellmetriken abbilden
- `renderKernel.js` bleibt nur die oeffentliche Fassade

## Regel

```text
Keine Spaltenbreiten hier erfinden.
Keine semantischen Solver-Regeln hier erfinden.
Keine Reihenrolle, Achse, Schale oder Darstellungsform aus Zellinhalten erraten.
Nur visuelle Renderstruktur und physische Metrik aus vollstaendigen Core-Daten ableiten.
```

## Bekannte Umsetzungsschuld

Die aktuelle Altimplementierung leitet teilweise noch:

- Achsenkontexte aus sichtbaren Zellarten
- funktionale Schalentypen aus semantischen Teilbaeumen
- Zeilenreserven aus rekonstruierten Renderknoten

ab.

Diese Fallbacks sind nicht Teil des Zielvertrags.
Sie werden nach Vervollstaendigung des Core-/Szenenvertrags entfernt.

## Zugeordnete Tests

- `tests/active/render_kernel.test.js`
- `tests/active/render_stretch_metrics.test.js`
- `tests/active/arbeitsblatt_druckansicht.test.js`

Die ersten beiden Tests sind im Standardlauf registriert und gruen.
Der Arbeitsblatttest ist rot.
