# rows

Status: Migrationsfassade; Altlogik verletzt teilweise den Zielvertrag
Stand: 7. September 2026

## Aufgabe

Dieses Modul bildet bereits gelieferte funktionale Reihen und Achsen
in physische Zeilenhoehen, Baselines und Abstaende ab.

Der Core liefert:

- Reihenanzahl und Reihenrollen
- Achsenreihe
- funktionale obere und untere Baender
- Verschachtelungs- und Shell-Zuordnung

Dieses Modul darf daraus:

- `em`-, Pixel- oder Papierhoehen berechnen
- Fontreserven und Strichstaerken anwenden
- die physische Baseline innerhalb einer gelieferten Achsenreihe setzen

Es darf nicht:

- `above_axis`, `axis` oder `below_axis` aus Zellinhalten ableiten
- einen Achsenkontext aus `fraction_line`, Root- oder Power-Knoten erraten
- funktionale Reihen hinzufuegen oder entfernen
- eine fehlende Core-Achse visuell ausgleichen

## Verantwortlicher Code

- `renderer_kernel/rows/index.js`
- derzeitiger Migrationsursprung: `components/Arbeitsblatt_Druckansicht/renderKernelCore/rowMetrics.js`

Die aktuelle Altimplementierung enthaelt noch inhaltliche Fallbacks
wie die Ableitung eines Achsenkontexts aus sichtbaren Zellen.
Diese Fallbacks sind nach Genesis zu entfernen,
nicht als Renderer-Vertrag zu dokumentieren.

## Zugeordnete Tests

- `tests/active/render_kernel.test.js`
- `tests/active/render_stretch_metrics.test.js`

Beide Tests sind im Standardlauf registriert und aktuell gruen.
Das macht die dokumentierte Inferenzschuld im Altcode nicht zulaessig.
