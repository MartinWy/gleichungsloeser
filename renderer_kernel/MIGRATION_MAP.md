# renderer_kernel: Migrationskarte

Status: atomare Andockphase vorhanden; rekonstruktive Prototypen archiviert
Stand: 10. September 2026

## Zweck

Dieses Blatt beschreibt,
welche heutigen Renderbausteine spaeter
in `renderer_kernel/` zusammengefuehrt werden sollen.

Es wird heute noch **nichts** verschoben.

Vor jeder Extraktion gilt:
Altlogik wird nur uebernommen,
wenn sie ausschliesslich visuelle Geometrie erzeugt.
Funktionale Rekonstruktion aus Zellen, Text oder Bounds wird nicht migriert,
sondern nach Vervollstaendigung des Core-Vertrags entfernt.

## Heutige Quellen

### 1. Produktive Render-Vorbereitung

- `components/Arbeitsblatt_Druckansicht/renderKernelCore/index.js`
- `components/Arbeitsblatt_Druckansicht/renderKernelCore/renderNodeFactory.js`
- `components/Arbeitsblatt_Druckansicht/renderKernelCore/rowMetrics.js`
- `components/Arbeitsblatt_Druckansicht/renderKernelCore/shared.js`

### 2. Produktive Render-Helfer in der Druckansicht

- `components/Arbeitsblatt_Druckansicht/renderStretchMetrics.js`
- `components/Arbeitsblatt_Druckansicht/renderVerticalGeometry.js`
- `components/Arbeitsblatt_Druckansicht/renderNodeMetrics.js`
- `components/Arbeitsblatt_Druckansicht/displayShellModel.js`
- `components/Arbeitsblatt_Druckansicht/functionNotation.js`

### 3. Heutige Fassade

- `presentation/render_kernel/index.js`

### 4. Separates Render-Forschungsprojekt

- `projects/complex_expression_rendering/render_flat_expression_svg.mjs`
- `projects/complex_expression_rendering/render_structure_diagnostic_svg.mjs`
- `projects/complex_expression_rendering/render_reference_latex.mjs`
- `projects/complex_expression_rendering/prototypes/renderer-settings-demo.html`

## Zielzuordnung

| Heute | Spaeter |
| :--- | :--- |
| rein visuelle Teile aus `renderNodeFactory.js` | `renderer_kernel/atoms/`; Shell-Rekonstruktion wird nicht uebernommen |
| rein physische Teile aus `rowMetrics.js` | `renderer_kernel/rows/`; Achsen- und Rolleninferenz wird nicht uebernommen |
| `shared.js` | `renderer_kernel/metrics/` oder `renderer_kernel/bounds/` |
| `renderStretchMetrics.js` | `renderer_kernel/roots/` und `renderer_kernel/shells/` |
| `renderVerticalGeometry.js` | `renderer_kernel/rows/` |
| `renderNodeMetrics.js` | `renderer_kernel/metrics/` |
| rein visuelle Teile aus `displayShellModel.js` | `renderer_kernel/shells/`; Schalenzerlegung aus Struktur wird nicht uebernommen |
| `functionNotation.js` | `renderer_kernel/shells/` oder spaeter `renderer_kernel/atoms/` |
| `presentation/render_kernel/index.js` | `renderer_kernel/export/` |
| `render_flat_expression_svg.mjs` | Referenz- und Forschungslogik fuer `roots/`, `exponents/`, `bounds/`, `shells/` |
| `renderer-settings-demo.html` | Referenz fuer `cockpit_designer/`, nicht fuer den Kern selbst |

## Regel

```text
Erst die Verantwortung zuschneiden,
dann Dateien verschieben.
Nie Dateien nur nach Namen umhaengen.
```

## Bereits umgesetzt

1. lesende Ziel-Fassade `renderer_kernel/index.js`
2. erste Gruppierung in `atoms`, `rows`, `shells`, `metrics`
3. neutraler Export-Rand unter `renderer_kernel/export/`
4. Anbindung an den gemeinsamen `render_scene`-Vertrag
5. erster lesender `render_scene`-Ingest

Ein frueher interner Szenenplan sowie Root- und Group-Prototypen wurden nicht
freigegeben: Sie rekonstruierten Schalenmitgliedschaft und Bounds. Dieser Stand
liegt unter `alt/2026-09-10_pre_atomic_renderer_kernel/`.

## Noch nicht umgesetzt

1. keine produktive Umverdrahtung im Altpfad
2. keine Extraktion der echten Renderdateien
3. keine vollstaendige Trennung der Spezialbereiche `fractions`, `exponents`, `bounds` in echte Codeeinheiten
4. Row- und Shell-Fassaden verweisen noch auf nicht bereinigte Altlogik

## Erster realistischer Extraktionsschritt

Die naechste Extraktion beginnt erst nach:

1. vollstaendigem funktionalem `projection_state`-Vertrag
2. verlustfreier `render_scene`-Abbildung
3. negativen Blindheitstests

Danach beginnt sie mit den am klarsten getrennten visuellen Teilen:

1. `metrics/`
2. physische Atommetriken in `atoms/`
3. physische Reihenabbildung in `rows/`
4. Root- und Group-Tinte
5. weitere Shell-Tinte

Nicht mit der ganzen Fassade auf einmal.
