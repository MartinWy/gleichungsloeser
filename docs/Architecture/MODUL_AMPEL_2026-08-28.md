# Modul-Ampel

Stand: 2026-08-28

## Zweck

Diese Datei beantwortet fuer die Hauptmodule vier getrennte Fragen:

1. `Doku`: Ist die Modulrolle klar und aktuell dokumentiert?
2. `Code`: Gibt es einen eigenen Codepfad, der diese Rolle wirklich traegt?
3. `Test`: Gibt es aktive Tests, die genau dieses Modul pruefen?
4. `Beweis erfolgreich`: Ist heute ein gruener Nachweis vorhanden, dass das Modul seine Rolle wirklich erfuellt?

Wichtig:

- `Test` heisst hier: Es gibt einen aktiven Testpfad.
- `Beweis erfolgreich` heisst hier: Der heutige Stand ist wirklich gruen.
- Vertrage allein reichen ausdruecklich nicht.

## Bewertungslogik

- `gruen`: vorhanden, klar, heute tragfaehig
- `gelb`: teilweise vorhanden oder nur als Fassade / Teilumsetzung
- `rot`: fehlt, widerspricht dem Vertrag oder scheitert aktuell sichtbar

## Normative Fuehrung ausserhalb der Matrix

Diese Dateien sind Fuehrungsdokumente, nicht Laufzeitmodule:

- `docs/Architecture/MAGNA_CARTA.md`
- `docs/Genesis/Genesis_Gleichungsloeser_Mensch.md`
- `docs/Genesis/Genesis_Gleichungsloeser_Maschine.md`
- `docs/Projektstand/HANDOVER_2026-08-01.md`

## Test-Snapshot von heute

Heutiger aktiver Lauf:

```text
npm test
```

Ergebnis am 2026-08-28:

- `19` aktive Tests fehlgeschlagen
- damit ist die globale Systemampel heute nicht gruen

## Modulmatrix

| Modul | Hauptpfad | Doku | Code | Test | Beweis erfolgreich | Kurzurteil |
| --- | --- | --- | --- | --- | --- | --- |
| `P1_Input` | `core/GenesisRuntime/P1_Input/` | `gruen` | `gruen` | `gruen` | `gruen` | Eigener Vertrag vorhanden; heutiger P1-Test war gruen. |
| `P2_Strategy` | `core/GenesisRuntime/P2_Strategy/` | `gruen` | `gruen` | `gruen` | `gruen` | Eigener Vertrag vorhanden; heutige P2-Targeting- und P2-Entscheidungstests waren gruen. |
| `P3_Transformation` | `core/GenesisRuntime/P3_Transformation/` | `gruen` | `gelb` | `gruen` | `rot` | Eigener Modulpfad und Tests vorhanden, aber heutige P3- und Shell-Tests sind rot. |
| `P4_Projection` | `core/GenesisRuntime/P4_Projection/` | `gruen` | `gelb` | `gruen` | `rot` | P4 ist die aktive Ortswahrheit, aber heutige Projektions-, Spalten- und Exporttests widersprechen dem Soll. |
| `core_a` | `core_a/` | `gruen` | `gelb` | `gruen` | `gelb` | Gute Fassade und Adaptertests vorhanden, aber `core_a` ist noch lesende Ziel-Fassade und einzelne Adaptertests sind rot. |
| `contracts` | `contracts/` | `gruen` | `gelb` | `gruen` | `gelb` | Gemeinsame Vertragsobjekte existieren schon, aber noch nicht alle Austauschpfade sind wirklich zentralisiert und hart erzwungen. |
| `bridge_b` | `bridge_b/` | `gruen` | `gelb` | `gruen` | `gelb` | Ziel-Fassade und lokaler Bridge-Motor existieren; die volle harte Andockung an A1 und A2 ist laut Doku noch nicht umgesetzt. |
| `bridge_b transition_step` | `bridge_b/transition_step/` | `gruen` | `gruen` | `gruen` | `gruen` | Der kleinste lokale B-Motor ist als eigener Schritt vorhanden und sein heutiger Transition-Step-Test war gruen. |
| `B produktiver Handoff` | `projects/complex_exponent_transition/real_bridge_handoff/` | `gruen` | `rot` | `gruen` | `rot` | Die Doku sagt: genau ein Grenzschritt. Im produktiven Handoff existieren weiterhin hybride Effekte ueber die Landung hinaus. |
| `renderer_kernel` | `renderer_kernel/` | `gruen` | `gelb` | `gruen` | `rot` | Eigene Szenen-, Root- und Group-Pfade existieren, aber mehrere heutige Geometrie- und Plan-Tests sind rot. |
| `cockpit_user` | `cockpit_user/` | `gruen` | `gelb` | `gruen` | `gelb` | Gute Ziel-Fassade und aktive Kontrolltests, aber produktive Wirkung haengt weiter an roten Kern- und Rendererpfaden. |
| `cockpit_designer` | `cockpit_designer/` | `gelb` | `gelb` | `gruen` | `gelb` | Mehr als Platzhalter, aber laut eigener Doku noch keine voll angedockte Produktivkomponente. |
| `Arbeitsblatt_Druckansicht` | `components/Arbeitsblatt_Druckansicht/` | `gelb` | `rot` | `gruen` | `rot` | Aktive produktive Ausgabe, aber Handover und heutige Tests zeigen weiterhin Rekonstruktion statt blindem Konsum. |
| `PDF-/LaTeX-Exporter` | `scripts/export_projection_pdf_core/` | `gruen` | `rot` | `gruen` | `rot` | Eigener Exportkern existiert, aber Handover und heutige LaTeX-Tests zeigen rekonstruktive Bruch-/Wurzel-Logik. |

## Was heute objektiv gruen ist

- `P1_Input`
- `P2_Strategy`
- `bridge_b/transition_step`

## Was heute objektiv gelb ist

- `core_a`
- `contracts`
- `bridge_b`
- `cockpit_user`
- `cockpit_designer`

## Was heute objektiv rot ist

- `P3_Transformation`
- `P4_Projection`
- `B produktiver Handoff`
- `renderer_kernel`
- `Arbeitsblatt_Druckansicht`
- `PDF-/LaTeX-Exporter`

## Konkrete Belege fuer rote Module

### P3

- `core/P3_Umformung/Validierung.test.js`
- `tests/active/genesis_runtime_p3_shells.test.js`
- `tests/active/input_adapter.test.js`

### P4

- `tests/active/genesis_runtime_p4_projection.test.js`
- `tests/active/genesis_runtime_view_model_columns.test.js`
- `tests/active/target_variable_selection.test.js`

### core_a

- `tests/active/core_a_bridge_boundary_adapter.test.js`
- `tests/active/core_a_render_scene_adapter.test.js`

### B produktiver Handoff

- `projects/complex_exponent_transition/B_IO_CONTRACT.md`
- `projects/complex_exponent_transition/real_bridge_handoff/index.js`
- `tests/active/active_runtime_export_wrappers.test.js`

### renderer_kernel

- `tests/active/renderer_kernel_scene_plan.test.js`
- `tests/active/renderer_kernel_root_geometry_plan.test.js`
- `tests/active/renderer_kernel_root_projection.test.js`
- `tests/active/renderer_kernel_group_geometry_plan.test.js`

### Arbeitsblatt_Druckansicht

- `tests/active/arbeitsblatt_druckansicht.test.js`
- `tests/active/worksheet_display_model.test.js`
- `docs/Projektstand/HANDOVER_2026-08-01.md`

### PDF-/LaTeX-Exporter

- `tests/active/latex_p4_export.test.js`
- `tests/active/latex_p4_column_layout.test.js`
- `docs/Projektstand/HANDOVER_2026-08-01.md`

## Wichtigste Schlussfolgerung

Das Hauptproblem ist heute nicht,
dass keine Vertraege existieren.

Das Hauptproblem ist:

- mehrere Modulgrenzen sind dokumentiert
- mehrere Testpfade sind vorhanden
- aber der heutige Nachweis ist fuer zentrale Module weiter rot

Anders gesagt:

```text
Doku ist weiter als die Umsetzung.
Tests sind weiter als die gruenen Ergebnisse.
```

## Direkt nutzbarer Arbeitsmodus

Wenn wir jetzt weiterarbeiten,
sollte jede neue Aussage immer in dieser Reihenfolge belegt werden:

1. Vertrag
2. verantwortlicher Codepfad
3. aktiver Test
4. heute gruener Nachweis

Ohne Schritt 4 gilt ein Modul nur als vorbereitet,
nicht als wirklich fertig.
