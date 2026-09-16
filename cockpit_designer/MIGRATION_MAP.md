# cockpit_designer: Migrationskarte

Status: vorbereitend  
Stand: 9. August 2026

## Zweck

Dieses Blatt beschreibt,
welche heutigen Designer- und Diagnosepfade spaeter
im linken Render-Cockpit zusammenlaufen sollen.

## Heutige Quellen

- `projects/complex_expression_rendering/prototypes/renderer-settings-demo.html`
- `projects/complex_expression_rendering/README.md`
- `projects/complex_expression_rendering/ARCHITECTURE.md`
- `components/Schalen_Inspektor/`
- `components/Umzugs_Inspektor/` als didaktische Referenz
- `Projektstand/visuals/` als statische Vergleichsbilder

## Ziel

`cockpit_designer` soll spaeter **nicht** Renderregeln besitzen,
sondern nur Regler, Diagnose und Testansichten
fuer den `renderer_kernel`.

## Regel

```text
Designer-UI steuert.
Renderer-Kernel rechnet.
```
