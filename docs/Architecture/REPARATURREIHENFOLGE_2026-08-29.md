# Reparaturreihenfolge

Stand: 2026-08-29

## Zweck

Diese Datei beantwortet nur eine Frage:

```text
In welcher Reihenfolge werden die roten Tests repariert,
wenn wir strikt auf Prinzipienebene arbeiten wollen?
```

Sie ist ausdruecklich **keine** Liste von Einzelfall-Fixes.

Sie ist eine Abhaengigkeitskette.

Wenn die Reihenfolge eingehalten wird,
dann reparieren spaetere Schritte nicht mehr heimlich das,
was fruehere Module haetten korrekt liefern muessen.

## Leitregel

Die Reihenfolge folgt der Magna Carta:

1. erst Algebra
2. dann Grenzuebergabe
3. dann Ortswahrheit
4. dann Render-Szene
5. dann blinde Verbraucher
6. ganz am Ende Export

Anders gesagt:

```text
Kein Cockpit-Fix.
Kein PDF-Fix.
Kein Renderer-Fix.
bevor Core, B-Grenze und P4 wirklich gruen sind.
```

## Nicht Teil dieser Reparaturrunde

Diese Runde betrifft **nicht**:

- `cockpit_user`
- `cockpit_designer`
- kosmetische Spaltenbreiten
- visuelles Feintuning
- neue Features

Im Moment geht es fast ausschliesslich um:

- Positionstreue
- klare Modulgrenzen
- harte Uebergabevertraege
- blind konsumierende Ausgabe

## Reparaturblock 1

Titel:
`Algebraische Wahrheit vor jeder Projektion`

Warum zuerst:

- Wenn P3 nicht sauber ist,
  sind alle spaeteren roten Bilder nur Folgefehler.
- Wenn hier schon falsche Familien,
  redundante Gruppen
  oder fehlende Shell-Objekte entstehen,
  ist jeder Renderer-Befund unzuverlaessig.

Reihenfolge:

1. `core/P3_Umformung/Validierung.test.js`
2. `tests/active/core_solve_flow.test.js`
3. `tests/active/genesis_runtime_p3_shells.test.js`
4. `tests/active/input_adapter.test.js`

Was hier geklaert sein muss:

- keine redundanten Aussengruppen
- keine unerwuenschten Extra-Familien
- jeder P3-Schritt erzeugt die erwarteten Shell-Objekte
- kein `TypeError` vor dem eigentlichen Vertragsnachweis

Stop-Bedingung:

- alle vier Tests sind gruen

## Reparaturblock 2

Titel:
`A1 -> B -> A2 Grenzvertrag wirklich scharf machen`

Warum jetzt:

- `B` darf nur genau einen Grenzschritt machen
- `B` darf nichts davor loesen
- `B` darf nichts danach weiterrechnen
- erst wenn diese Grenze hart ist,
  lohnt es sich,
  Spalten- und Projektionsprobleme in B ernsthaft zu beheben

Reihenfolge:

5. `tests/active/core_a_bridge_boundary_adapter.test.js`
6. `tests/active/bridge_b_transition_step.test.js`
7. `tests/active/genesis_runtime_bridge.test.js`

Wichtig:

- `6` und `7` sind heute schon gruen,
  bleiben hier aber absichtlich in der Reihenfolge,
  weil sie die Schutzwaende fuer `5` sind
- `5` ist der rote Reparaturtest,
  `6` und `7` sind die Beweiswaechter,
  dass die Reparatur nicht wieder hybrid wird

Was hier geklaert sein muss:

- A1 behandelt den komplexen Exponenten als geschlossene Schale
- B bricht nur diese eine Schale auf
- B erzeugt genau eine Landungszeile
- A2 sieht keinen komplexen Exponenten mehr
- `2x-1` wird in der Grenzlogik korrekt als normale Termstruktur uebergeben
- die andere Gleichungsseite bleibt durchgereicht und positionstreu

Stop-Bedingung:

- `core_a_bridge_boundary_adapter.test.js` wird gruen
- `bridge_b_transition_step.test.js` bleibt gruen
- `genesis_runtime_bridge.test.js` bleibt gruen

## Reparaturblock 3

Titel:
`P4 als einzige Ortswahrheit wieder voll herstellen`

Warum erst nach Block 1 und 2:

- P4 darf nur projizieren,
  was algebraisch und an der B-Grenze bereits sauber ist
- viele sichtbare Fehler sind in Wahrheit P4-Folgen,
  aber nicht deren Ursache

Reihenfolge:

8. `tests/active/genesis_runtime_p4_projection.test.js`
9. `tests/active/genesis_runtime_view_model_columns.test.js`
10. `tests/active/target_variable_selection.test.js`
11. `tests/active/cosine_law_gamma.test.js`

Was hier geklaert sein muss:

- unveraenderte Atome werden wirklich nur durchgereicht
- Zielvariable bleibt auf ihrer Spur
- Operatoren landen in ihren vorgesehenen Slots
- aktive negative Faktorbloecke bleiben als das sichtbar,
  was der Vertrag verlangt
- B-Landungszeilen werden so in Spalten zerlegt,
  dass A2 danach ohne zweiten Sprung weiterarbeiten kann

Stop-Bedingung:

- alle vier Tests sind gruen

## Reparaturblock 4

Titel:
`Render-Scene-Vertrag und Szenenplanung`

Warum erst jetzt:

- Renderer duerfen nur lesen
- also muss vorher klar sein,
  welche P4-Wahrheit sie blind konsumieren
- erst dann kann man pruefen,
  ob die Szene diese Wahrheit sauber uebernimmt

Reihenfolge:

12. `tests/active/core_a_render_scene_adapter.test.js`
13. `tests/active/renderer_kernel_scene_plan.test.js`

Was hier geklaert sein muss:

- Szenenbreite entsteht direkt aus Projektion
- keine stillen Zusatzspalten
- keine heimliche Rekonstruktion im Szenenadapter
- keine zweite Geometriewahrheit zwischen P4 und Renderer

Stop-Bedingung:

- beide Tests sind gruen

## Reparaturblock 5

Titel:
`Elementargeometrie fuer Wurzel und Klammer`

Warum erst nach Szenenplanung:

- Wurzel- und Klammergeometrie bauen auf Scene-Plan und P4 auf
- solange Slotzahl und Semantikgrenzen noch unsicher sind,
  wuerde jeder Root- oder Group-Fix wieder auf Sand stehen

Reihenfolge:

14. `tests/active/renderer_kernel_root_geometry_plan.test.js`
15. `tests/active/renderer_kernel_root_projection.test.js`
16. `tests/active/renderer_kernel_group_geometry_plan.test.js`

Was hier geklaert sein muss:

- Wurzel bekommt ihre Geometrie aus klaren Ober-, Achsen- und Unterspuren
- Root-Haken und Oberstrich entstehen nicht frei,
  sondern aus Core-/Scene-Daten
- Klammern spannen genau die ihnen zugewiesene Hoehe
- Group-Tracks sind eigene Spuren
  und nicht Nebeneffekt anderer Hoehen

Stop-Bedingung:

- alle drei Tests sind gruen

## Reparaturblock 6

Titel:
`Arbeitsblatt und Anzeige werden wirklich blind`

Warum erst jetzt:

- Arbeitsblatt und Display duerfen keine Rettungslogik enthalten
- wenn sie vorher gruengemacht werden,
  kaschieren sie nur Core- oder Rendererfehler

Reihenfolge:

17. `tests/active/arbeitsblatt_druckansicht.test.js`
18. `tests/active/worksheet_display_model.test.js`

Was hier geklaert sein muss:

- Zeilenhoehen kommen direkt aus Projektionsblock und Scene-Plan
- sichtbare Blocks werden nicht lokal neu erfunden
- Wurzel-, Bruch- und Klammergrenzen werden aus gelieferten Spuren gelesen
- das Arbeitsblatt wird kein zweiter Core

Stop-Bedingung:

- beide Tests sind gruen

## Reparaturblock 7

Titel:
`LaTeX/PDF als letzter blinder Verbraucher`

Warum zuletzt:

- LaTeX ist die haerteste Sichtprobe
- wenn hier zuerst repariert wird,
  beginnt man fast sicher wieder,
  Symptome statt Ursachen zu bekleben

Reihenfolge:

19. `tests/active/latex_p4_export.test.js`
20. `tests/active/latex_p4_column_layout.test.js`
21. `tests/active/active_runtime_export_wrappers.test.js`

Wichtig:

- die Nummerierung endet hier bewusst bei `21`,
  obwohl nur `19` Tests rot sind
- Grund:
  auch hier bleiben gruene Schutztests und Wrapperlogik in der Beweiskette relevant
- `active_runtime_export_wrappers.test.js` ist rot
  und haengt fachlich hinter den beiden LaTeX-Kerntests

Was hier geklaert sein muss:

- TeX exportiert echte P4-Brueche
- Wurzeln tragen echten Radikandeninhalt
- komplexe Exponenten werden im Export nicht wieder verwischt
- Export ist nur Sichtpfad,
  nicht zweiter Rekonstrukteur

Stop-Bedingung:

- alle drei Tests sind gruen

## Die 19 roten Tests in reiner Prioritaetsfolge

Wenn du nur eine nackte Reihenfolge willst,
ohne die gruene Schutzlogik dazwischen,
dann ist sie:

1. `core/P3_Umformung/Validierung.test.js`
2. `tests/active/core_solve_flow.test.js`
3. `tests/active/genesis_runtime_p3_shells.test.js`
4. `tests/active/input_adapter.test.js`
5. `tests/active/core_a_bridge_boundary_adapter.test.js`
6. `tests/active/genesis_runtime_p4_projection.test.js`
7. `tests/active/genesis_runtime_view_model_columns.test.js`
8. `tests/active/target_variable_selection.test.js`
9. `tests/active/cosine_law_gamma.test.js`
10. `tests/active/core_a_render_scene_adapter.test.js`
11. `tests/active/renderer_kernel_scene_plan.test.js`
12. `tests/active/renderer_kernel_root_geometry_plan.test.js`
13. `tests/active/renderer_kernel_root_projection.test.js`
14. `tests/active/renderer_kernel_group_geometry_plan.test.js`
15. `tests/active/arbeitsblatt_druckansicht.test.js`
16. `tests/active/worksheet_display_model.test.js`
17. `tests/active/latex_p4_export.test.js`
18. `tests/active/latex_p4_column_layout.test.js`
19. `tests/active/active_runtime_export_wrappers.test.js`

## Warum diese Reihenfolge besser ist als bloesses Reparieren

Diese Reihenfolge verhindert vier typische Rueckfaelle:

- Renderer repariert Core-Fehler
- Export repariert Renderer-Fehler
- Arbeitsblatt repariert P4-Fehler
- B repariert heimlich A2 oder A1

Sie erzwingt stattdessen:

- erst Ursache
- dann Uebergabe
- dann Sichtbarkeit

## Arbeitsregel fuer die naechste echte Reparaturrunde

Pro rotem Test immer nur dieses Schema:

1. Vertrag benennen
2. verantwortliches Modul benennen
3. gruene Schutztests benennen,
   die dabei nicht kaputtgehen duerfen
4. genau diesen Codepfad aendern
5. roten Test wieder laufen lassen
6. Schutztests sofort nachziehen

Wenn ein Fix nur mit nachtraeglicher Sonderlogik in spaeteren Modulen funktioniert,
ist es kein Fix.
