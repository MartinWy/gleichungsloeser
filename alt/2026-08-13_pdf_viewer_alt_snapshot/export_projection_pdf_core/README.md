# export_projection_pdf_core

Status: aktiv  
Stand: 12. Juli 2026

## Zweck

Dieses Untermodul enthaelt den eigentlichen Renderkern fuer den LaTeX-/PDF-Export.

Die Trennung ist absichtlich:

- `scripts/export_projection_pdf.mjs` orchestriert nur CLI, Dateischreiben und `pdflatex`
- `export_projection_pdf_core/` rendert nur LaTeX/TikZ aus fertigen Projektions- und Layoutdaten

## Dateien

- `shared.js`: kleine gemeinsame Hilfsfunktionen fuer Zellbreiten und LaTeX-Escaping
- `stepLayout.js`: vertikale Metrik pro Loesungsschritt
- `latexRendering.js`: Aufbau der LaTeX-Nodes, Shell-Darstellung und Diagnoseoverlay
- `index.js`: oeffentlicher Einstieg des Untermoduls

## Regel

```text
Keine Breitenregeln hier erfinden.
Keine sichtbaren Shell-Slots hier definieren.
Nur konsumieren und setzen.
```

Die inhaltlichen Regeln kommen aus:

- `components/Arbeitsblatt_Druckansicht/columnLayoutCore/`
- `components/Arbeitsblatt_Druckansicht/displayColumnLayout.js`
- `components/Arbeitsblatt_Druckansicht/renderKernel.js`
