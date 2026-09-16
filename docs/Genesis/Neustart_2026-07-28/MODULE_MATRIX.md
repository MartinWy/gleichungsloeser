# Modulmatrix fuer den Genesis-Neustart

Status: normativ
Stand: 15. September 2026

## Zweck

Diese Matrix ist das verbindliche Register der Modulgrenzen.

Jedes aktive Modul braucht:

```text
Richtlinie -> Testvertrag -> verantwortlicher Code -> gruener Beweis
```

Die Matrix trennt bewusst:

- Aufgabe dokumentiert
- Codepfad vorhanden
- Test vorhanden
- Test im Standardlauf registriert
- heutiger Test erfolgreich

Der volatile Rot-/Gruen-Stand gehoert in eine aktuelle Modul- oder Testampel.
Genesis legt fest,
welcher Test zu welchem Modul gehoert
und welche Grenze er beweisen muss.

Aktueller Messstand:

- `docs/Architecture/MODUL_AMPEL_2026-09-07.md`
- `docs/Architecture/TEST_AMPEL_2026-09-07.md`

Die Aktivierungsregel steht in:

- `MODULES/00_MODULSTANDARD.md`

Der gemeinsame Prozess- und Schalenstandard steht in:

- `PROZESSMODELL_UND_SCHALENSTANDARD.md`

## Bedeutung einer Modulzeile

Jede als Modul bezeichnete Zeile dieser Matrix bezeichnet genau einen Prozessschritt:

```text
Vorgaenger -> Eingabevertrag -> eine Aufgabe -> Ausgabevertrag -> Nachfolger
```

Schalentypen und Operationsarten sind keine zusaetzlichen Prozessschritte.
Sie erscheinen als Situationen in der lokalen Richtlinie des zustaendigen Moduls.

Ein technischer Helper ist kein eigenes Modul,
solange er nur intern an der einen Aufgabe mitarbeitet.
Sobald er ausserhalb des benannten Modulvertrags fachliche Daten veraendert,
ist er ein nicht registrierter Prozessschritt und damit ein Architekturfehler.

Zeilen fuer Integrationsbeweise,
Phasencontainer
oder reine Vertragsbibliotheken
werden ausdruecklich als solche markiert.
Sie sind keine weiteren fachlichen Prozessmodule.

## Oberste Eigentumsgrenzen

| Frage | Einziger Eigentuemer |
| :--- | :--- |
| Was steht semantisch in der Eingabe und in welcher Eingabeschale? | `P1_Input` |
| Welche Umformungsentscheidung kommt als Naechstes? | `P2_Strategy` |
| Wie aendert diese Umformungsentscheidung die semantische Schachtelung? | `P3_Transformation` |
| Wo liegen Inhalte, Schalen, Baender, Reihen und Achsen funktional? | `P4_Projection` |
| Wie werden funktionale Spuren in Pixel, `em` oder Papiermasse abgebildet? | Renderer |
| Wie wird genau eine komplexe Potenzgrenze gebrochen? | `bridge_b` |

## A. Aktiver Solve-Kern

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Runtime-Einstieg und Pipeline | `core/GenesisRuntime/CONTRACT.md` | `core/GenesisRuntime/index.js`, `runtimePipeline.js`, `runtimeRequest.js` | `genesis_runtime_isolation.test.js`, `core_solve_flow.test.js` | eigene Strategie, Umformung oder Ortskorrektur in der Orchestrierung |
| P1 Input | `core/GenesisRuntime/P1_Input/CONTRACT.md` | `core/GenesisRuntime/P1_Input/` | `genesis_runtime_p1_input.test.js` | Zielvariable, Strategie, Umformung oder Geometrie bestimmen |
| P2 Strategy | `core/GenesisRuntime/P2_Strategy/CONTRACT.md` | `core/GenesisRuntime/P2_Strategy/` | `genesis_runtime_p2_targeting.test.js`, `genesis_runtime_p2_decisions.test.js`, `genesis_runtime_p2_sequences.test.js`, `subtracted_sum_release.test.js`, `fraction_birth_grouped_reciprocal_factor.test.js` | Struktur veraendern oder Geometrie bestimmen |
| P3 Transformation | `core/GenesisRuntime/P3_Transformation/CONTRACT.md` | `core/GenesisRuntime/P3_Transformation/` | `genesis_runtime_p3_shells.test.js`, `addition_release_left_prefix_flow.test.js`, `addition_release_multi_term_binding.test.js`, `subtracted_sum_release.test.js`, `fraction_birth_reciprocal_factor.test.js`, `fraction_birth_grouped_reciprocal_factor.test.js`, `multiplication_side_outward_flow.test.js` | Strategie neu waehlen oder Spalten, Baender und Reihen bestimmen |
| Gesamt-Solve-Flow (Integrationsbeweis, kein Modul) | beide zentralen Genesis-Fassungen und `core/GenesisRuntime/CONTRACT.md` | `core/index.js` plus GenesisRuntime | `core_solve_flow.test.js`, `target_variable_selection.test.js`, `cosine_law_gamma.test.js` | Fehler nachgelagerter Verbraucher als Solvererfolg ausgeben |
| Legacy-Projektionsadapter | `core/GenesisRuntime/LEGACY_PROJECTION_ADAPTER_CONTRACT.md` | `LegacyProjectionAdapter.js` | `genesis_runtime_bridge.test.js` | Theorie erneut auswerten oder neue Rollen und Ortswahrheit erraten |
| Legacy-Solve-Adapter | `core/GenesisRuntime/LEGACY_SOLVE_ADAPTER_CONTRACT.md` | `LegacySolveAdapter.js` | `genesis_runtime_bridge.test.js` | Strategie, Umformung oder Projektionslage veraendern |

Hinweis:
Die alten Basisvalidierungen unter `core/P1_Eingabe/` bis `core/P4_Projektion/`
bleiben Schutztests der oeffentlichen Fassade.
Sie ersetzen nicht die direkt zugeordneten GenesisRuntime-Tests.

## B. Interne P4-Kette

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Theoriezeilenaufbau | `core/GenesisRuntime/P4_Projection/THEORY_ROWS_CONTRACT.md` | `buildTheoryRows.js` | `genesis_runtime_p4_theory_rows.test.js`, indirekt auch `genesis_runtime_p4_projection.test.js` | eigene Umformungen oder Placements erzeugen |
| Shell-Bedarfsplan | `core/GenesisRuntime/P4_Projection/SHELL_BLUEPRINTS_CONTRACT.md` | `buildShellBlueprints.js` | `genesis_runtime_p4_module_boundaries.test.js`, `genesis_runtime_p4_projection.test.js` | irgendeine horizontale Koordinate oder ein Projektionsatom erzeugen |
| Global Semantic Raster | `core/GenesisRuntime/P4_Projection/GLOBAL_SEMANTIC_RASTER_CONTRACT.md` | `buildGlobalSemanticRaster.js`; `planGlobalCellPlacement.js` und `shellLayoutRules.js` sind interne reine Planungshelfer | `genesis_runtime_p4_module_boundaries.test.js`, `global_cell_profile_preflight.test.js`, `p4_function_base_cell_order.test.js`, `p4_positionstreue.test.js`, `p4_mehrschritt_positionstreue.test.js`, `worksheet_process_space_position_fidelity.test.js` | Band-, Reihen- oder Mediengeometrie an spaetere Module delegieren oder Projektionsatome schreiben |
| Semantic Raster Refinement | `core/GenesisRuntime/P4_Projection/SEMANTIC_RASTER_REFINEMENT_CONTRACT.md` | `refineSemanticRaster.js` | `genesis_runtime_p4_module_boundaries.test.js`, `global_cell_profile_preflight.test.js` | Blueprints, neue Zellansprueche, lokale Reihen oder Medienmasse erzeugen |
| Funktionale Profilmaterialisierung | `core/GenesisRuntime/P4_Projection/LOCAL_GEOMETRY_CONTRACT.md` | `localizeProjectionGeometry.js` | `genesis_runtime_p4_module_boundaries.test.js`, `global_cell_profile_preflight.test.js`, `genesis_runtime_p4_projection.test.js`, `law_of_sines_numerator_shell_transport.test.js`, `law_of_sines_right_numerator_shell_transport.test.js`, `law_of_sines_shell_alignment_contract.test.js` | eine horizontale Zelle veraendern, Shell-Metadaten rekonstruieren, Textrekonstruktion oder visuelle Pixelgeometrie |
| Projection Blocks | `core/GenesisRuntime/P4_Projection/PROJECTION_BLOCKS_CONTRACT.md` | `buildProjectionBlocks.js`; `projectionTraversal.js` ist reine Rollenbibliothek | `genesis_runtime_p4_module_boundaries.test.js`, `genesis_runtime_p4_projection.test.js`, `root_primitive_cell_separation.test.js` | Spalten oder visuelle Pixelhoehen bestimmen |
| Projection Writer | `core/GenesisRuntime/P4_Projection/PROJECTION_WRITER_CONTRACT.md` | `writeProjectionRows.js` | `genesis_runtime_p4_module_boundaries.test.js`, `genesis_runtime_p4_projection.test.js` | Geometrie erzeugen, zentrieren oder fehlende Vorstufen ersetzen |
| Output Contract | `core/GenesisRuntime/P4_Projection/OUTPUT_CONTRACT.md` | `buildOutputContract.js` | `genesis_runtime_p4_module_boundaries.test.js`, `genesis_runtime_bridge.test.js` | medienabhaengige Rekonstruktion oder neue Ortswahrheit |

Jeder P4-Prozessschritt besitzt damit eine eigene Richtlinie und eigenen Code.
`genesis_runtime_p4_module_boundaries.test.js` beweist die verbotenen Abkuerzungen
zwischen diesen Grenzen; die fachlichen P4-Tests beweisen die Schalenfaelle.

## C. Isolierter Bruch-Neustart

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Statusgrenze |
| :--- | :--- | :--- | :--- | :--- |
| FractionNeustart | `core/GenesisRuntime/FractionNeustart/CONTRACT.md` | `core/GenesisRuntime/FractionNeustart/` | `fraction_neustart_birth_transport.test.js` | isolierter Neubau; darf keinen parallelen allgemeinen P3-/P4-Pfad bilden |

Der Bruch-Neustart ist erst dann produktiver Teil der Hauptkette,
wenn sein Andockpunkt in Genesis und im P3-/P4-Vertrag ausdruecklich benannt,
sein Test im Standardlauf registriert
und der alte konkurrierende Pfad entfernt oder als Legacy markiert ist.

## D. Core-A-Fassaden und Adapter

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Core-A-Zielfassade | `core_a/README.md` | `core_a/index.js` | `core_a_target_entrypoint.test.js` | zweiter Solver neben `core/GenesisRuntime/` |
| Bridge Boundary Adapter | `core_a/adapters/bridge_boundary/README.md` | `core_a/adapters/bridge_boundary/index.js` | `core_a_bridge_boundary_adapter.test.js` | A1 weiterrechnen oder Landing erzeugen |
| Bridge Landing Profile Adapter | `core_a/adapters/bridge_landing_profile/README.md` | `core_a/adapters/bridge_landing_profile/index.js` | `core_a_bridge_landing_profile_adapter.test.js` | B-Prozessschritt ausfuehren oder A2 weiterrechnen |
| Render-Scene Adapter | `core_a/adapters/render_scene/README.md` | `core_a/adapters/render_scene/index.js` | `core_a_render_scene_adapter.test.js` | Spalten, Baender, Reihen oder Shell-Kinder neu bestimmen |

`core_a` ist eine Migrations- und Vertragsfassade.
Die mathematische Wahrheit bleibt bis zu einer ausdruecklich dokumentierten Umschaltung
unter `core/GenesisRuntime/`.

## E. Bridge B

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Bridge-Vertragsfassade | `docs/Architecture/BRIDGE_B_VERTRAG_V1.md`, `bridge_b/README.md` | `bridge_b/index.js`, `contracts_in/`, `contracts_out/`, `layout_bridge/` | `bridge_b_target_entrypoint.test.js`, `bridge_b_position_contract.test.js` | allgemeine Solverregeln oder Rendererlogik |
| Transition Step | `bridge_b/transition_step/README.md` | `bridge_b/transition_step/index.js` | `bridge_b_transition_step.test.js`, `bridge_process_space_column_transition.test.js` | mehr als genau eine Landing-Zeile erzeugen oder alte A1-Spalten als A2-Termspalten fortschreiben |
| Reales Handoff | `projects/complex_exponent_transition/README.md` und Bridge-Vertrag | `projects/complex_exponent_transition/real_bridge_handoff/` | `real_bridge_handoff_cli.test.js`, `real_bridge_demo_payload_export.test.js`, `bridge_worksheet_final_render.test.js`, `bridge_arbitrary_log_base_projection.test.js`, `bridge_process_space_column_transition.test.js`, `worksheet_process_space_position_fidelity.test.js`, `worksheet_process_space_width_isolation.test.js` | A1- und A2-Verantwortung, ihre funktionalen Spaltenverteilungen oder ihre horizontalen Breitenprofile im B-Prozessschritt vermischen |

Die reine Bridge-Kette ist:

```text
boundary_state -> transition_step -> landing_state
```

Alles davor gehoert A1,
alles danach A2.

## F. Gemeinsame Vertragsbibliotheken

| Vertragsmodul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests |
| :--- | :--- | :--- | :--- |
| `solve_state` | `contracts/solve_state/README.md` | `contracts/solve_state/index.js` | `core_a_target_entrypoint.test.js` |
| `projection_state` | `contracts/projection_state/README.md` | `contracts/projection_state/index.js` | `core_a_target_entrypoint.test.js`, `core_a_render_scene_adapter.test.js` |
| `bridge_state` | `contracts/bridge_state/README.md` | `contracts/bridge_state/index.js` | `core_a_bridge_boundary_adapter.test.js`, `core_a_bridge_landing_profile_adapter.test.js`, `bridge_b_transition_step.test.js` |
| `render_scene` | `contracts/render_scene/README.md` | `contracts/render_scene/index.js` | `render_scene_contract_entrypoint.test.js` |
| `render_settings` | `contracts/render_settings/README.md` | `contracts/render_settings/index.js` | `cockpit_designer_target_entrypoint.test.js` |
| `worksheet_profile` | `contracts/worksheet_profile/README.md` | `contracts/worksheet_profile/index.js` | `cockpit_user_target_entrypoint.test.js` |

Contracts duerfen Felder,
Versionen und Invarianten definieren.
Sie duerfen weder Solver- noch funktionale oder visuelle Geometrie ausfuehren.
Sie sind gemeinsame Definitionen der Modulgrenzen,
aber keine zusaetzlichen fachlichen Prozessschritte.

## G. Renderer-Kernel und visuelle Geometrie

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Renderer-Fassade | `renderer_kernel/README.md`, `renderer_kernel/export/README.md` | `renderer_kernel/index.js`, `renderer_kernel/export/index.js` | `renderer_kernel_target_entrypoint.test.js` | Solver- oder funktionale P4-Geometrie |
| Render-Scene Ingest | `renderer_kernel/export/render_scene/README.md` | `renderer_kernel/export/render_scene/ingest.js` | `renderer_kernel_render_scene_ingest.test.js` | Szene reparieren oder fehlende Felder erfinden |
| Atom-Fassade | `renderer_kernel/atoms/README.md` | `renderer_kernel/atoms/index.js` | `render_kernel.test.js`, `renderer_kernel_target_entrypoint.test.js` | semantische Atomrollen umdeuten |
| Row-Fassade | `renderer_kernel/rows/README.md` | `renderer_kernel/rows/index.js` | `render_kernel.test.js`, `render_stretch_metrics.test.js` | funktionale Teilzeilen neu bestimmen |
| Shell-Fassade | `renderer_kernel/shells/README.md` | `renderer_kernel/shells/index.js` | `render_kernel.test.js`, `fraction_line_no_fraction_rendernode.test.js` | Schalen aus Text neu erkennen |
| Metrics-Fassade | `renderer_kernel/metrics/README.md` | `renderer_kernel/metrics/index.js` | `render_kernel.test.js` | funktionale Geometrie aus visuellen Messungen ableiten |

Die lokalen README-Dateien der Fassaden `atoms`, `rows`, `shells` und `metrics`
sind jetzt an Genesis angeglichen.
Der re-exportierte Altcode ist damit noch nicht automatisch freigegeben:
Row- und Shell-Pfade enthalten weiterhin Inferenz,
die nach Vervollstaendigung des funktionalen Szenenvertrags entfernt werden muss.

Der fruehere interne Scene Plan sowie die experimentellen Root- und
Group-Geometriepfade sind am 10. September 2026 nach `alt/` verschoben worden.
Sie rekonstruierten Kindspuren und Bounds aus geometrischem Einschluss und sind
deshalb weder aktive Module noch Grundlage fuer neue Rendererarbeit. Ein
spaeterer Neuaufbau beginnt wieder mit Richtlinie und Blindheitstest.

Die Ordner `renderer_kernel/fractions/`, `exponents/` und `bounds/`
sind derzeit nur geplante Zielstruktur.
Ohne Implementierung und eigenen registrierten Test sind sie keine aktiven Module.

## H. Produktive Worksheet- und Medienkette

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Eingabenormalisierung | `components/Arbeitsblatt_Druckansicht/INPUT_ADAPTER_CONTRACT.md` | `components/Arbeitsblatt_Druckansicht/inputAdapter.js` | `input_adapter.test.js` | Strategie- oder Familienfolgen bestimmen |
| Worksheet ViewModel | `components/Arbeitsblatt_Druckansicht/VIEW_MODEL_CONTRACT.md` | `viewModel.js` | `genesis_runtime_view_model_columns.test.js`, `worksheet_atomic_target_identity.test.js`, `worksheet_process_space_position_fidelity.test.js`, `worksheet_process_space_width_isolation.test.js`, Sinussatz- und Bruch-ViewModel-Tests | fehlende Core-Schalen oder Rollen synthetisieren; Atome filtern, buendeln, ihre Seite oder ihren Prozessraum erraten |
| Worksheet DisplayModel | `components/Arbeitsblatt_Druckansicht/DISPLAY_MODEL_CONTRACT.md` | `worksheetDisplayModel.js` | `worksheet_display_model.test.js`, `law_of_sines_display_slot_fidelity.test.js`, `worksheet_process_space_width_isolation.test.js` | funktionale Slots neu vergeben, Zellen teilen, zentrieren oder Prozessraumbreiten vermischen |
| Column Layout | `components/Arbeitsblatt_Druckansicht/columnLayoutCore/Handbuch.md` | `components/Arbeitsblatt_Druckansicht/columnLayoutCore/` | `latex_p4_column_layout.test.js`, `latex_export_display_slot_fidelity.test.js`, `worksheet_process_space_position_fidelity.test.js`, `worksheet_process_space_width_isolation.test.js` | semantische Spalten oder Breitenprofile verschiedener Prozessraeume zusammenlegen oder Shell-Baender umdeuten |
| Produktiver Render-Kern | `components/Arbeitsblatt_Druckansicht/renderKernelCore/README.md` | `components/Arbeitsblatt_Druckansicht/renderKernelCore/` | `render_kernel.test.js`, `render_stretch_metrics.test.js` | funktionale Schachtelung aus Text rekonstruieren |
| LaTeX/PDF-Exporter | `scripts/export_projection_pdf_core/README.md` | `scripts/export_projection_pdf_core/` | `latex_atomic_projection_rendering.test.js`, `latex_export_display_slot_fidelity.test.js`, `active_runtime_export_wrappers.test.js`, `latex_shell_color_inheritance_regression.test.js` | Zellen konsumieren oder Bruch-, Wurzel- und Potenzaggregate neu aufbauen |
| Produktives Cockpit | `docs/Projektstand/COCKPIT_RENDER_RUNBOOK.md` | `index.html`, `cockpit.js`, `cockpit.css`, `scripts/cockpit_server.mjs` | `browser_bundle.test.js`, `cockpit_server_controls.test.js`, `cockpit_color_targets.test.js`, `cockpit_fraction_collapse_color_trace.test.js` | Solver-, P4- oder Renderkorrekturen in der Bedienhuelle |
| Atomarer DOM-Renderer | `components/Arbeitsblatt_Druckansicht/DOM_RENDER_CONTRACT.md` | DOM-Erzeugung in `components/Arbeitsblatt_Druckansicht/logic.js` | `arbeitsblatt_druckansicht.test.js`; fokussierter Eins-zu-eins-Test folgt | Zellen unterdruecken, buendeln, konsumieren, ergaenzen oder verschieben |

Komplette Solver-Familienfolgen liegen getrennt in
`genesis_runtime_p2_sequences.test.js`.
Der Eingabeadaptertest prueft ausschliesslich lexikalische Normalisierung.

## I. Ziel-Cockpits und Presentation-Fassaden

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Statusgrenze |
| :--- | :--- | :--- | :--- | :--- |
| `cockpit_user` | `cockpit_user/README.md` und Untermodul-READMEs | `cockpit_user/` | `cockpit_user_target_entrypoint.test.js` | Migrationsfassade; Untermodule brauchen spaeter fokussierte Einzeltests |
| `cockpit_designer` | `cockpit_designer/README.md` und Untermodul-READMEs | `cockpit_designer/` | `cockpit_designer_target_entrypoint.test.js` | Migrationsfassade; keine Aufgaben- oder Solverlogik |
| `presentation` | `presentation/README.md` | `presentation/` | `presentation_entrypoints.test.js`, `shell_colors.test.js` | Migrationsfassade; Fassadentests sind registriert, fokussierte Teilmodultests fehlen |

## J. Aktive interne Nutzer-Cockpit-Module

| Modul | Fuehrende Richtlinie | Verantwortlicher Code | Zugeordnete Beweistests | Verbotene Doppelrolle |
| :--- | :--- | :--- | :--- | :--- |
| Theory Label Adapter | `cockpit_user/adapters/THEORY_LABEL_CONTRACT.md` | `cockpit_user/adapters/theory_labels/index.js` | `cockpit_theory_labels.test.js` | Renderzellen, Geometrie oder neue Core-Struktur erzeugen |
| Farbzielableitung | `cockpit_user/color_controls/README.md` | heute die Farbziel-Funktionen in `scripts/cockpit_server.mjs`; Auszug in die Zielfassade folgt | `cockpit_color_targets.test.js` | Prozessschritte erfinden, IDs fest codieren oder Geometrie berechnen |

## Standard-Runner-Regel

Der einzige normale Beweisweg ist:

- `tests/run_active_tests.js`
- aufgerufen ueber `npm test`

Der Runner entdeckt jede Datei `tests/active/*.test.js` automatisch.
Damit ist eine aktive Testdatei ohne Standardregistrierung technisch ausgeschlossen.
Manuelle, diagnostische oder historische Tests gehoeren nicht unter `tests/active/`.

Gemessener Stand am 16. September 2026: 85 Dateien unter `tests/active/`
plus 5 direkte Core-Validierungen, insgesamt 90 von 90 gruen. Drei aktive
Tests sichern Laufzeitumgebung, HTTP-Grenze und isolierte
Vorschau-Arbeitsraeume fuer den oeffentlichen Betrieb; der fokussierte
Spursegment-Test beweist zusaetzlich, dass ein algebraischer Wiedereintritt
keine fruehere Bruchbelegung verbreitert.

## Verbotene Vermischungen

- `P1` bestimmt keine Strategie.
- `P2` veraendert keine Struktur.
- `P3` erzeugt keine Spalten, Baender, Reihen oder Renderdaten.
- Die Runtime-Pipeline orchestriert nur und fuehrt keine semantische Normalisierung zwischen `P1`, `P2` und `P3` aus.
- Das Semantic Raster baut keine Shell- oder Mediengeometrie.
- Funktionale Schalengeometrie wird bottom-up im Core gebaut, nicht im Renderer.
- Projection Blocks bestimmen keine Spalten und keine Pixelhoehen.
- Der Writer erzeugt oder rettet keine Geometrie.
- Adapter uebersetzen Schemata, aber berechnen keine neue Ortswahrheit.
- Renderer bauen visuelle Geometrie, aber keine funktionale Geometrie.
- PDF und Cockpit uebermalen keine Fehler der Vorstufen.
- `bridge_b` fuehrt weder A1 noch A2 aus.

## Arbeitsregel

Vor jeder Codeaenderung wird in dieser Matrix genau eine Modulzeile benannt.

Danach werden in der lokalen Modulrichtlinie
genau eine Aufgabe,
der Ein- und Ausgangsvertrag
und die betroffene Situation benannt.

Wenn keine Zeile passt,
fehlt entweder ein Modul
oder die geplante Aenderung verletzt eine bestehende Grenze.

Dann wird zuerst Genesis erweitert oder berichtigt.
