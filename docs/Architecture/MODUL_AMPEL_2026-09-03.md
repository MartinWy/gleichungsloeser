# Modul-Ampel

Stand: 2026-09-03

## Zweck

Diese Datei trennt vier Fragen hart voneinander:

1. `Doku`
2. `Code`
3. `Test`
4. `Beweis erfolgreich`

Wichtig:

- `Doku` bedeutet nur: die Rolle ist klar beschrieben
- `Code` bedeutet nur: es gibt einen eigenen verantwortlichen Pfad
- `Test` bedeutet nur: es gibt aktive Vertrags- oder Modul-Tests
- `Beweis erfolgreich` bedeutet: der heutige Lauf ist wirklich gruen

Vertraege allein reichen ausdruecklich nicht.

## Bewertungslogik

- `gruen`: vorhanden und heute nachgewiesen
- `gelb`: vorhanden, aber heute nicht voll nachgewiesen
- `rot`: heute widerlegt oder aktiv fehlgeschlagen

## Test-Snapshot von heute

Gezielt gelaufen am 2026-09-03:

```text
node tests/active/genesis_runtime_p1_input.test.js
node tests/active/genesis_runtime_p2_decisions.test.js
node tests/active/genesis_runtime_p2_targeting.test.js
node tests/active/genesis_runtime_p3_shells.test.js
node tests/active/genesis_runtime_p4_projection.test.js
node tests/active/bridge_b_position_contract.test.js
node tests/active/bridge_b_transition_step.test.js
node tests/active/core_solve_flow.test.js
```

Ergebnis:

- `P1_Input`: gruen
- `P2_Strategy`: gruen
- `P3_Transformation`: rot
- `P4_Projection`: rot
- `bridge_b`: gruen
- `core_solve_flow`: rot

## Modulmatrix

| Modul | Hauptpfad | Doku | Code | Test | Beweis erfolgreich | Kurzurteil |
| --- | --- | --- | --- | --- | --- | --- |
| `P1_Input` | `core/GenesisRuntime/P1_Input/` | `gruen` | `gruen` | `gruen` | `gruen` | Rolle klar, eigener Pfad, heutiger P1-Nachweis gruen. |
| `P2_Strategy` | `core/GenesisRuntime/P2_Strategy/` | `gruen` | `gruen` | `gruen` | `gruen` | Entscheidungen und Targeting heute gruen. |
| `P3_Transformation` | `core/GenesisRuntime/P3_Transformation/` | `gruen` | `gruen` | `gruen` | `rot` | Eigener Vertragsraum vorhanden, aber `genesis_runtime_p3_shells.test.js` ist heute rot. |
| `P4_Projection` | `core/GenesisRuntime/P4_Projection/` | `gruen` | `gruen` | `gruen` | `rot` | P4 ist die Ortswahrheit, aber `genesis_runtime_p4_projection.test.js` ist heute rot. |
| `bridge_b` | `bridge_b/` | `gruen` | `gruen` | `gruen` | `gruen` | Der kleine Grenzschritt ist heute ueber Positions- und Transition-Step-Test gruen nachgewiesen. |
| `core_a boundary adapter` | `core_a/adapters/bridge_boundary/` | `gelb` | `gelb` | `gruen` | `gelb` | Vertragsidee und Tests vorhanden, heute nicht erneut gemessen. |
| `A1 -> B -> A2 Handoff` | `projects/complex_exponent_transition/real_bridge_handoff/` | `gelb` | `gelb` | `gruen` | `gelb` | Vertrag vorhanden, aber der volle Handoff wurde heute nicht separat gruen nachgemessen. |
| `core_solve_flow` | `core/index.js` plus Runtime-Kette | `gruen` | `gruen` | `gruen` | `rot` | Familien- und Reservespuren verletzen heute noch mindestens einen Kernvertrag. |
| `renderer_kernel` | `renderer_kernel/` | `gelb` | `gelb` | `gruen` | `gelb` | Nicht Teil dieses Messblocks; fuer heutige Core-Ampel bewusst nicht freigegeben. |
| `cockpit_user` | `index.html`, `browser/`, `cockpit.css` | `gelb` | `gelb` | `gruen` | `gelb` | Nicht Prioritaet dieser Runde; keine Freigabe vor gruener Core-Ampel. |
| `PDF-/LaTeX-Exporter` | `scripts/export_projection_pdf_core/` | `gelb` | `gelb` | `gruen` | `gelb` | Nicht Teil des heutigen Kern-Nachweises. |

## Heute objektiv gruen

- `P1_Input`
- `P2_Strategy`
- `bridge_b`

## Heute objektiv rot

- `P3_Transformation`
- `P4_Projection`
- `core_solve_flow`

## Wichtigste Schlussfolgerung

Der zentrale Fortschritt gegenueber frueher ist:

```text
B ist heute nicht mehr nur beschrieben,
sondern lokal ueber eigene Prinzip-Tests gruen nachgewiesen.
```

Die zentrale Restarbeit ist:

```text
P3, P4 und der uebergeordnete Solve-Flow muessen denselben Haertegrad bekommen.
```

## Direkte Arbeitsregel ab jetzt

Jede weitere Aussage ueber ein Modul gilt nur dann als belastbar,
wenn wir diese vier Punkte gleichzeitig zeigen koennen:

1. Vertrag
2. genau ein verantwortlicher Codepfad
3. aktiver Test
4. heutiger gruener Nachweis

Ohne Punkt 4 ist ein Modul vorbereitet,
aber nicht fertig.
