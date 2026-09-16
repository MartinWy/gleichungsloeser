# Test Strategy

Status: operativ  
Stand: 10. September 2026

## 1. Testarten
| Typ | Ziel | Ort |
| :--- | :--- | :--- |
| Komponenten-Tests | lokale Regeln einer Phase pruefen | moeglichst im Komponentenordner oder klar zugeordnet |
| Integrations-Tests | Zusammenspiel von `P1` bis `P4` pruefen | produktiver Core-Pfad |
| PreFlight-/Topologie-Tests | globale Spalten- und Positionstreue pruefen | `P4` und zugeordnete Integrationspfade |
| Visuelle Tests | Darstellung und Diagnosefluss pruefen | `components/*` |
| Historische Tests | alte Experimente oder Altpfade dokumentieren | `alt/2026-09-10_pre_genesis_tests/`, ausserhalb der aktiven Testsuite |

## 2. Aktueller Ist-Stand
- `npm test` und `npm run test:active` laufen ueber `tests/run_active_tests.js`.
- Die aktive Suite prueft die heutige GenesisRuntime-Welt von `P1` bis `P4`
  und den produktiven Solve-Flow mit `runtimeEngine = "genesis_runtime"`.
- `npm run test:legacy` zeigt einen getrennten Audit fuer die unter
  `alt/2026-09-10_pre_genesis_tests/` erhaltenen historischen Tests und deren
  explizite Statusentscheidung.
- Ein Teil dieser Legacy-Tests ist fachlich weiterhin wichtig, weil er auf Positionstreue und Topologie zielt.

## 3. Aktive Suite
- `core/P1_Eingabe/Validierung.test.js`
- `core/P2_Strategie_Analyse/Validierung.test.js`
- `core/P3_Umformung/Validierung.test.js`
- `core/P3_Umformung/id_invarianz.test.js`
- `core/P4_Projektion/Validierung.test.js`
- `tests/active/core_solve_flow.test.js`
- `tests/active/target_variable_selection.test.js`
- `tests/active/cosine_law_gamma.test.js`
- `tests/active/p4_positionstreue.test.js`
- `tests/active/p4_mehrschritt_positionstreue.test.js`

## 4. Priorisierte Testluecken
1. weitere solve-nahe Topologie-Faelle mit verschachtelten Nennern oder tieferen Gruppenketten
2. aktive Tests fuer PreFlight und globale Spaltenlogik in tieferen Topologien
3. aktive Tests fuer echte positionstreue `row`/`col`-Setzung ueber laengere Familienketten
4. weitere schwere Topologie-Faelle gezielt aus dem Legacy-Bereich in moderne P4- oder Solve-Tests uebersetzen

Vorkanonische Varianten dieser drei Solve-Tests sind im Archiv und im
Legacy-Audit erhalten.
Die aktiven Fassungen duerfen keine alten Aggregate,
visuelle `flowDirection`
oder gebuendelte Ausdruckstexte als Core-Ausgabe verlangen.
