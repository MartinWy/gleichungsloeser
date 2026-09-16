# GenesisRuntime Legacy Solve Adapter Contract

Status: normativ
Stand: 9. September 2026
Vertrag: `genesis_runtime_legacy_solve_v1`

## Eine Aufgabe

`LegacySolveAdapter.js` verpackt das Ergebnis der GenesisRuntime
in die bestehende oeffentliche Solve-Huelle.

Es ruft genau den Projection Adapter auf,
ordnet dessen Folgezeilen den bereits vorhandenen Strategien zu
und baut die bestehenden Exportregister.

Es darf keine Strategie auswaehlen,
keine Struktur umformen,
keine Projektionszelle veraendern
und keinen Fehler aus P1 bis P4 als Erfolg verpacken.
