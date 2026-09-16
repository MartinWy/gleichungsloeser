# atoms

Status: Migrationsfassade; lokaler Blindheitsbeweis fehlt
Stand: 7. September 2026

## Aufgabe

Dieses Modul baut visuelle Tinte fuer bereits vollstaendig beschriebene Atome.

Es darf:

- gelieferten Text und Symbolrollen in Renderknoten uebertragen
- Font- und Glyphenmetriken bestimmen
- physische Groesse und Baseline innerhalb der gelieferten funktionalen Spur setzen

Es darf nicht:

- aus einem semantischen Teilbaum neue Schalen bauen
- implizite Operatoren aufgrund von Nachbaratomen sichtbar oder unsichtbar machen
- Atomrollen umdeuten
- funktionale Spalten oder Reihen veraendern

## Verantwortlicher Code

- `renderer_kernel/atoms/index.js`
- derzeitiger Migrationsursprung: `components/Arbeitsblatt_Druckansicht/renderKernelCore/renderNodeFactory.js`

Der Re-Export ist Code,
aber noch kein Beweis dafuer,
dass die Altimplementierung diese engere Grenze einhaelt.

## Zugeordnete Tests

- `tests/active/render_kernel.test.js`
- `tests/active/renderer_kernel_target_entrypoint.test.js`

Ein fokussierter Test muss noch beweisen,
dass fehlende Atomrollen nicht aus Text oder Nachbarschaft erraten werden.
