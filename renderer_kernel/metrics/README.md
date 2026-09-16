# metrics

Status: Migrationsfassade; Basistest vorhanden
Stand: 7. September 2026

## Aufgabe

Dieses Modul besitzt ausschliesslich gemeinsame physische Renderparameter:

- Schrift- und Glyphenmasse
- Pixel-, `em`- und Papier-Skalierung
- Strichstaerken
- medienabhaengige Abstaende innerhalb eines gelieferten funktionalen Bands
- numerische Rundung visueller Werte

Es darf keine funktionalen Spalten, Reihen, Achsen, Shell-Spannen oder Kindbeziehungen erzeugen.
Eine visuelle Messung darf niemals in den Core-Vertrag zurueckgeschrieben werden.

## Verantwortlicher Code

- `renderer_kernel/metrics/index.js`
- derzeitiger Migrationsursprung: `components/Arbeitsblatt_Druckansicht/renderKernelCore/shared.js`

## Zugeordnete Tests

- `tests/active/render_kernel.test.js`
- kuenftig ein fokussierter Test fuer reine physische Skalierung
