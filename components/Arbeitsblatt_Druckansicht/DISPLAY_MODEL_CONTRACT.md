# Worksheet-DisplayModel-Vertrag

Status: normativ; atomare Nachfolger fuer vorkanonische Tests festgelegt
Stand: 16. September 2026

## Einzige Aufgabe

`worksheetDisplayModel.js` uebersetzt jede vorhandene Worksheet-Zelle
in genau ein physisch platzierbares Display-Item.

Im atomaren Referenzmodus gilt:

```text
1 Worksheet-Zelle -> 1 Display-Item
```

## Eingabe

- Worksheet-Zellen mit funktionaler Zeile, Spalte oder Spanne
- die vom ViewModel unveraendert transportierte `processSpaceId`
- ein rein visuelles Spaltenprofil

## Ausgabe

- genau ein Display-Item je Eingabezelle
- physische Start- und Endlinien fuer dieselbe funktionale Lage
- getrennte Breitenkarten je `processSpaceId`, ausschliesslich am gemeinsamen
  Gleichheitsanker zu einem Ausgabegitter gekoppelt
- keine neuen mathematischen oder funktionalen Elemente

## Erlaubt

- eine funktionale Rastereinheit in eine physische Displaybreite uebersetzen
- Grid-Linien aus bereits vorhandenen Spalten und Spannen bilden
- visuelle Profilwerte anwenden
- eine funktional vorhandene, vom Core explizit unsichtbar gesetzte
  POWER-Klammer-Spalte mit Breite `0` abbilden, sofern dieselbe globale Spalte
  keine sichtbare Zelle traegt
- bereits benannte Prozessraeume getrennt vermessen und ihre fertigen
  physischen Linien ohne gegenseitige Breitenwirkung zusammenfuehren
- jedes P4-Schalenprimitiv als das Display-Item genau seiner bereits
  vorhandenen Worksheet-Zelle behandeln; insbesondere bleiben `root_hook` und
  `root_overbar` getrennt
- ein sichtbares POWER-Klammerprimitiv physisch ueber genau die von P4
  gelieferte `rowSpanStart`/`rowSpanEnd`-Spanne strecken

## Verboten

- Zellen hinzufuegen, entfernen, verbinden oder teilen
- funktionale Spannen erweitern oder verkuerzen
- Root-Vorslots, Bruchspannen oder Klammerbahnen aus Inhalt erraten
- POWER-Klammern aus der Art des Basisinhalts ergaenzen oder entfernen
- die Hoehe einer POWER-Klammer aus Text, Nachbarn oder dem Theoriebaum schaetzen
- fehlende Positionen durch Nachbarschaft oder Textbreite ersetzen
- Breiten verschiedener Prozessraeume unter demselben numerischen `col`-Wert
  zusammenfassen

## Verantwortlicher Code

- `components/Arbeitsblatt_Druckansicht/worksheetDisplayModel.js`
- physische Slotabbildung in `components/Arbeitsblatt_Druckansicht/columnLayoutCore/`

## Zugeordnete Tests

- `tests/active/worksheet_display_model.test.js`
- `tests/active/law_of_sines_display_slot_fidelity.test.js`
- `tests/active/worksheet_process_space_width_isolation.test.js`

Die beiden vorkanonischen Testfassungen mit gebuendelten Root-/Zaehlerzellen,
fest verdrahteten alten IDs und nachtraeglichen Root-Vorslots sind unter
`alt/2026-09-10_pre_genesis_tests/tests/legacy/` erhalten. Ihre aktiven
Nachfolger pruefen ausschliesslich die heutige atomare Modulgrenze.
