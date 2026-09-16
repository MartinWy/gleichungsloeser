# Test-Ampel

Stand: 2026-08-29

Basis dieses Blatts ist ein echter aktiver Lauf mit:

```text
node tests/run_active_tests.js
```

Ergebnis:

- `50` aktive Tests insgesamt
- `31` gruen
- `19` rot

## Leseschluessel

- `gruen`: Test besteht heute wirklich.
- `gelb`: Doku und Codepfad existieren, aber der heutige Nachweis ist nur teilweise gruen.
- `rot`: aktueller Testlauf widerspricht dem Vertrag oder bricht schon vor der Vertragspruefung ab.

## Was ein Fehlschlag bedeutet

- Ein roter Test heisst nicht: "die Idee ist vielleicht falsch".
- Ein roter Test heisst: Der aktuelle Code liefert nicht das, was der Test als Vertrag fordert.
- Wenn ein Test mit `TypeError` endet, ist der Codepfad schon vor der eigentlichen Vertragspruefung gebrochen.
- Wenn ein Test mit `expected != actual` endet, ist der Vertrag klar, aber die Umsetzung weicht ab.

## Modul-Ampel

Diese Matrix beantwortet fuer die Hauptmodule vier getrennte Fragen:

1. `Doku`: Ist die Rolle dokumentiert?
2. `Code`: Gibt es einen eigenen verantwortlichen Pfad?
3. `Test`: Gibt es aktive Tests auf genau diese Rolle?
4. `Beweis erfolgreich`: Ist der heutige Nachweis wirklich gruen?

| Modul | Doku | Code | Test | Beweis erfolgreich | Kurzurteil |
| --- | --- | --- | --- | --- | --- |
| `P1_Input` | `gruen` | `gruen` | `gruen` | `gruen` | Eingabevalidierung ist heute sauber nachgewiesen. |
| `P2_Strategy` | `gruen` | `gruen` | `gruen` | `gruen` | Targeting und Entscheidungslogik sind heute gruen. |
| `P3_Transformation` | `gruen` | `gelb` | `gruen` | `rot` | Es gibt klare Tests, aber P3 bricht aktuell an mindestens einem harten Vertrag. |
| `P4_Projection` | `gruen` | `gelb` | `gruen` | `rot` | Position, Spalten und sichtbare Projektion sind nicht durchgehend bewiesen. |
| `core_a` | `gruen` | `gelb` | `gruen` | `gelb` | Fassade und mehrere Adapter sind da, aber Grenzadapter und Szenenbreite sind noch rot. |
| `bridge_b` | `gruen` | `gelb` | `gruen` | `gelb` | Kleiner B-Schritt ist gruen, produktiver B-Handoff ist es nicht durchgehend. |
| `renderer_kernel` | `gruen` | `gelb` | `gruen` | `rot` | Szenen-, Root- und Group-Geometrie sind heute nicht stabil gruen. |
| `Arbeitsblatt_Druckansicht` | `gelb` | `rot` | `gruen` | `rot` | Sichtbare Ausgabe hat aktive Tests, verletzt aber noch zentrale Layoutvertraege. |
| `PDF-/LaTeX-Exporter` | `gruen` | `rot` | `gruen` | `rot` | Exportkern existiert, aber Bruch- und Wurzelvertraege sind im Export noch nicht erfuellt. |
| `Entrypoints/Fassaden` | `gruen` | `gruen` | `gruen` | `gruen-gelb` | Die meisten Ziel-Fassaden sind gruen; einzelne Adapter daneben sind noch rot. |

## Vollstaendige Testliste

### 1. Basisvalidierungen P1 bis P4

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `gruen` | `core/P1_Eingabe/Validierung.test.js` | P1-Eingabevalidierung der aktiven Pipeline. | Eingabelayer ist heute gruen. |
| `gruen` | `core/P2_Strategie_Analyse/Validierung.test.js` | P2-Analyse und Zielwahl. | Strategielayer ist heute gruen. |
| `rot` | `core/P3_Umformung/Validierung.test.js` | P3-Umformungsvertraege der alten Kernvalidierung. | Bricht mit `TypeError` auf `operatorId` von `null`. |
| `gruen` | `core/P3_Umformung/id_invarianz.test.js` | ID-Invarianz in P3. | ID-Durchreichung ist hier gruen. |
| `gruen` | `core/P4_Projektion/Validierung.test.js` | Grundvalidierung der P4-Projektion. | Basisprojektion ist in diesem Test gruen. |

### 2. Loeserfluss, Runtime und fachliche Vertraege

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `rot` | `tests/active/core_solve_flow.test.js` | Reale Schrittfamilien, redundante Gruppen, Wurzel-, Bruch- und Potenzfluss. | Ein redundanter Aussengruppenfall erzeugt wieder zu viele Schritte. |
| `gruen` | `tests/active/genesis_runtime_isolation.test.js` | Runtime ist von alten Pfaden isoliert. | Isolationspfad ist gruen. |
| `gruen` | `tests/active/genesis_runtime_p1_input.test.js` | Neue Runtime-P1-Normalisierung. | Gruen. |
| `gruen` | `tests/active/genesis_runtime_p2_targeting.test.js` | Zielvariablenauswahl in der Runtime. | Gruen. |
| `gruen` | `tests/active/genesis_runtime_p2_decisions.test.js` | P2-Entscheidungen der Runtime. | Gruen. |
| `rot` | `tests/active/genesis_runtime_p3_shells.test.js` | P3-Shell-Erzeugung und Freigabe. | Ein erwartetes Shell-/Generatorobjekt fehlt aktuell ganz. |
| `rot` | `tests/active/genesis_runtime_p4_projection.test.js` | P4-Projektion mit festen Rollen, Spalten und Operatorlagen. | Mindestens ein harter Projektionsvertrag ist falsch. |
| `gruen` | `tests/active/fraction_collapse_closed_shell_transport.test.js` | Beim Bruchkollaps bleibt die geschlossene Schale transportierbar. | Gruen. |
| `gruen` | `tests/active/fraction_line_no_fraction_rendernode.test.js` | Bruchstriche tragen keinen kompletten Rekonstruktionsnode mehr. | Gruen. |
| `gruen` | `tests/active/law_of_sines_start_shell_primitives.test.js` | Passive `sin(...)`-Schalen bleiben am Start als Primitive sichtbar. | Gruen. |
| `gruen` | `tests/active/law_of_sines_numerator_shell_transport.test.js` | Zaehlerschale bleibt beim Nennerabbau geschlossen transportiert. | Gruen. |
| `gruen` | `tests/active/genesis_runtime_bridge.test.js` | Runtime-Bridge und Legacy-Adapter fuer echte Solve-Flows. | Gruen. |
| `rot` | `tests/active/genesis_runtime_view_model_columns.test.js` | Spaltenstabilitaet im View-Model, auch bei B und Sinussatz. | Mindestens ein Spaltenvertrag ist noch verletzt. |
| `gruen` | `tests/active/p4_positionstreue.test.js` | Kernregel: Positionstreue in P4. | Gruen. |
| `gruen` | `tests/active/p4_mehrschritt_positionstreue.test.js` | Positionstreue ueber mehrere Schritte. | Gruen. |
| `rot` | `tests/active/target_variable_selection.test.js` | Zielvariable bleibt nach Inversschritten auf ihrer Bahn. | Zielvariable landet aktuell auf der falschen Spur (`8` statt `10`). |
| `rot` | `tests/active/cosine_law_gamma.test.js` | Cosinussatz nach `gamma`, besonders negativer Faktorblock. | Aktiver Negativblock wird noch falsch zerlegt. |

### 3. Eingabeadapter und Export-Wrapper

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `rot` | `tests/active/input_adapter.test.js` | Latex-/Unicode-Normalisierung und erwartete Familienfolgen. | Im Log-Fall entsteht noch eine unerwuenschte Extra-Familie. |
| `gruen` | `tests/active/inspect_equation.test.js` | Inspektionsskript fuer Gleichungen. | Gruen. |
| `rot` | `tests/active/active_runtime_export_wrappers.test.js` | Aktive Export-Wrapper fuer PDF/Inspection mit Runtime. | Komplexer Exponent wird im TeX noch nicht vertragsgemaess exportiert. |

### 4. Arbeitsblatt, Anzeige und LaTeX/PDF

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `rot` | `tests/active/arbeitsblatt_druckansicht.test.js` | Druckansicht liest P4 blind, ohne Zusatzrekonstruktion. | Zeilenhoehe und gestapelte Blockhoehe stimmen nicht ueberein (`7` statt `5`). |
| `rot` | `tests/active/worksheet_display_model.test.js` | Display-Model uebernimmt explizite P4-Slots und Grenzen. | Ein expliziter Root-Lead-Slot fehlt noch. |
| `rot` | `tests/active/latex_p4_export.test.js` | LaTeX exportiert echte P4-Brueche und P4-Zellen. | Einfache Brueche werden noch nicht rein als `pFourFraction` ausgegeben. |
| `rot` | `tests/active/latex_p4_column_layout.test.js` | LaTeX-Layout fuer Spalten, Roots und sichtbare Fuehrung. | Die Wurzel exportiert noch nicht den echten Radikandeninhalt. |

### 5. Renderer-Kern

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `gruen` | `tests/active/render_kernel.test.js` | Grundfunktion des Renderer-Kerns. | Gruen. |
| `gruen` | `tests/active/renderer_kernel_render_scene_ingest.test.js` | Renderer liest Render-Scene-Daten direkt ein. | Gruen. |
| `rot` | `tests/active/renderer_kernel_scene_plan.test.js` | Szenenplan und globale Slotzahl. | Eine Soll-Slotzahl weicht ab (`12` statt `13`). |
| `rot` | `tests/active/renderer_kernel_root_geometry_plan.test.js` | Geometrieplan fuer Wurzeln. | Root-Geometrie ist zu klein (`2` statt `4`). |
| `rot` | `tests/active/renderer_kernel_root_projection.test.js` | Tatsaechliche Root-Projektion im Renderkern. | Root-Projektion liefert falsche Groesse/Position (`162` statt `242`). |
| `rot` | `tests/active/renderer_kernel_group_geometry_plan.test.js` | Klammergeometrie und obere Spur als eigener Track. | Oberer Klammertrack wird nicht korrekt gesetzt (`0` statt `1`). |
| `gruen` | `tests/active/renderer_kernel_group_projection.test.js` | Gruppen-/Klammerprojektion im Kernel. | Dieser Teilpfad ist gruen. |

### 6. Entrypoints, Ziel-Fassaden und Adapter

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `gruen` | `tests/active/browser_bundle.test.js` | Browser-Bundle laedt ohne erzwungenen Modulpfad. | Gruen. |
| `gruen` | `tests/active/cockpit_server_controls.test.js` | Serversteuerung des Cockpits. | Gruen. |
| `gruen` | `tests/active/renderer_kernel_target_entrypoint.test.js` | Oeffentlicher Ziel-Einstieg fuer `renderer_kernel`. | Gruen. |
| `gruen` | `tests/active/cockpit_designer_target_entrypoint.test.js` | Ziel-Einstieg fuer `cockpit_designer`. | Gruen. |
| `gruen` | `tests/active/bridge_b_target_entrypoint.test.js` | Ziel-Einstieg fuer `bridge_b`. | Gruen. |
| `gruen` | `tests/active/cockpit_user_target_entrypoint.test.js` | Ziel-Einstieg fuer `cockpit_user`. | Gruen. |
| `gruen` | `tests/active/core_a_target_entrypoint.test.js` | Ziel-Einstieg fuer `core_a`. | Gruen. |
| `rot` | `tests/active/core_a_bridge_boundary_adapter.test.js` | Grenzadapter von `core_a` nach B, besonders Exponenten-Tokenisierung. | `2x-1` bleibt noch als `2x` statt `2`,`x`,`-`,`1` zusammen. |
| `gruen` | `tests/active/core_a_bridge_landing_profile_adapter.test.js` | Landing-Profil fuer die Rueckgabe aus B nach A2. | Gruen. |
| `rot` | `tests/active/core_a_render_scene_adapter.test.js` | `core_a` erzeugt Szenenbreite direkt aus der Projektion. | Szenenbreite ist noch falsch (`25` statt `23`). |
| `gruen` | `tests/active/render_scene_contract_entrypoint.test.js` | Oeffentlicher Vertragseinstieg fuer `render_scene`. | Gruen. |

### 7. Reale B-/Bridge-Pfade

| Status | Test | Prueft kurz | Heutiges Signal |
| --- | --- | --- | --- |
| `gruen` | `tests/active/real_bridge_handoff_cli.test.js` | Reale CLI fuer den B-Handoff. | Gruen. |
| `gruen` | `tests/active/real_bridge_demo_payload_export.test.js` | Realer Demo-Payload-Export fuer B. | Gruen. |
| `gruen` | `tests/active/bridge_b_transition_step.test.js` | Kleinster lokaler B-Schritt: genau ein Uebergang. | Gruen. |

## Was heute objektiv gruen ist

- P1 und P2 der GenesisRuntime
- Grundvalidierungen von P4
- zentrale Bruch-Transporttests
- Sinussatz-Startschalen als Primitive
- Bridge-Wrapper und kleine B-Transition
- die meisten Ziel-Fassaden und Entrypoints
- die beiden expliziten P4-Positionstreue-Tests

## Was heute objektiv rot ist

- P3-Validierung des Kerns
- mehrere Runtime-Vertraege fuer Shells, Projektion und Spalten
- Arbeitsblatt- und Display-Ausgabe
- LaTeX-/PDF-Export von Bruch und Wurzel
- mehrere Renderer-Kernel-Geometriepfade
- Boundary-Adapter von `core_a` nach B
- Zielspur-Haltung und Cosinussatz-`gamma`

## Wichtigste Lesart dieses Blatts

Dieses Blatt sagt nicht:

- dass alles schlecht ist
- oder dass alles neu gebaut werden muss

Dieses Blatt sagt:

- welche Teile heute wirklich nachgewiesen gruen sind
- welche Teile nur dokumentiert sind
- und welche Teile im Code heute noch dem Vertrag widersprechen

Der Unterschied ist wichtig:

```text
Vertrag vorhanden != Umsetzung vorhanden
Test vorhanden != Beweis erfolgreich
```

## Naechster sinnvoller Arbeitsmodus

Fuer jedes rote Feld sollte die Reihenfolge strikt so sein:

1. Vertrag benennen
2. genau einen verantwortlichen Codepfad benennen
3. den zugehoerigen aktiven Test nennen
4. erst dann die Umsetzung aendern
5. danach den gruenen Testnachweis erneut laufen lassen
