# core_a: Migrationskarte

Status: erste Andockphase umgesetzt  
Stand: 9. August 2026

## Heutige Quelle

Der produktive mathematische Kern lebt heute unter:

```text
core/
```

## Ziel

`core_a/` wird spaeter die kanonische Heimat fuer:

- P1 Eingabe
- P2 Strategie
- P3 Umformung
- P4 Projektion
- Kernadapter
- Kernexports

## Regel

Vor einem echten Move muessen zuerst

1. Imports inventarisiert,
2. Rueckgabe-Contracts festgelegt,
3. Tests fuer die neue Wurzel vorbereitet

sein.

## Bereits umgesetzt

1. Ziel-Fassade `core_a/index.js`
2. Solve-Vertrag unter `contracts/solve_state/`
3. Projektionsvertrag unter `contracts/projection_state/`
4. Adapter-Metadaten fuer den aktiven Einstiegspunkt `core/index.js`

## Noch nicht umgesetzt

1. keine produktive Umverdrahtung auf `core_a/`
2. keine Kopien der P1-P4-Dateien
3. keine neue interne Ordnerbefuellung ausser Fassade und Vertrag
