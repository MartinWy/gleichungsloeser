# cockpit_designer

Status: Platzhalterstruktur  
Stand: 9. August 2026

## Zweck

`cockpit_designer` ist die kuenftige Ordnerwurzel
des linken Cockpits
fuer die globale Feinjustierung des Renderers.

Hierhin gehoeren spaeter:

- Wurzelregler
- Klammerregler
- Exponentenregler
- Stresstest- und Diagnoseansichten

## Heute

Die aktuelle Designer-Vorarbeit liegt noch unter:

```text
projects/complex_expression_rendering/
```

Der Ordner ist nur als Zielstruktur vorbereitet.

## Regeln

- Keine Aufgabenlogik in `cockpit_designer`.
- Keine Solverlogik in `cockpit_designer`.
- Zugriff spaeter nur ueber den `renderer_kernel` und Contracts.
