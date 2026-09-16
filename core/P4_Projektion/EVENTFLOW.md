# P4 Eventflow

## Produktiver Zwei-Durchlauf
1. Der Orchestrator uebergibt die gesamte Theorie-Zeilenfolge an `P4`.
2. `generateGlobalLayout(theoryRows)` analysiert alle Zeilen gemeinsam.
3. Daraus entstehen globale Werte wie `anchorColumn`, `columnCount`, `rowCount` und die Zeilen-Spans.
4. Fuer jede Theorie-Zeile setzt `LochLogik` zunaechst die Sichtbarkeitsmarker.
5. Erst danach setzt `projectToGrid(...)` die Atome mit `row` und `col` in die globale Matrix.
6. `process(theoryRows)` liefert `layoutPlan` plus `projectionRows` fuer Export und weitere Verbraucher.

## Aktueller Ist-Stand
- der produktive Core nutzt diesen Zwei-Durchlauf jetzt fuer die aktive Kernspur
- `root_power` wird damit nicht mehr zeilenweise isoliert projiziert
- Gleichheitsanker bleiben ueber alle Projektionszeilen auf derselben Spalte
