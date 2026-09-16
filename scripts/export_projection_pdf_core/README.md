# export_projection_pdf_core

Status: produktiver atomarer Exportpfad; Zusammenfuehrung festgelegt
Stand: 10. September 2026

## Zweck

Dieses Untermodul enthaelt den eigentlichen Renderkern fuer den LaTeX-/PDF-Export.

Die Trennung ist absichtlich:

- `scripts/export_projection_pdf.mjs` orchestriert nur CLI, Dateischreiben und `pdflatex`
- `export_projection_pdf_core/` rendert nur LaTeX/TikZ aus fertigen Projektions- und Layoutdaten

## Dateien

- `latexRendering.js`: atomare Abbildung der fertigen Display-Items auf
  einzelne LaTeX-/TikZ-Primitiven
- `index.js`: oeffentlicher Einstieg des Untermoduls

## Regel

```text
Keine Breitenregeln hier erfinden.
Keine sichtbaren Shell-Slots hier definieren.
Keine Schalen, Kinder, Reihen oder Darstellungsformen rekonstruieren.
Nur konsumieren und setzen.
```

Zusaetzlich gilt im atomaren Referenzbetrieb:

```text
1 Worksheet-Zelle -> 1 LaTeX-/TikZ-Primitiv
```

Der Exporter darf insbesondere keine Zell-IDs konsumieren und daraus eine
synthetische Potenz-, Bruch- oder Wurzelformel bauen.

Der Exporter erzeugt ausschliesslich visuelle Geometrie:

- physische LaTeX-/TikZ-Koordinaten
- Font- und Boxmasse innerhalb gelieferter funktionaler Baender
- Linienstaerken, Farben und Seitenlayout

Er darf keine funktionale Geometrie aus `\\frac`, `\\sqrt`, Textbreiten
oder sichtbaren Nachbarknoten ableiten.
Wenn der Core eine notwendige Schalen- oder Darstellungsangabe nicht liefert,
muss der Exportvertrag rot bleiben.

Die inhaltlichen Regeln kommen aus:

- `components/Arbeitsblatt_Druckansicht/columnLayoutCore/`
- `components/Arbeitsblatt_Druckansicht/displayColumnLayout.js`
- `components/Arbeitsblatt_Druckansicht/renderKernel.js`

## Zugeordnete Tests

- `tests/active/latex_atomic_projection_rendering.test.js`
- `tests/active/latex_export_display_slot_fidelity.test.js`
- `tests/active/active_runtime_export_wrappers.test.js`
- `tests/active/latex_shell_color_inheritance_regression.test.js`

Vorkanonische Aggregationstests werden getrennt archiviert und duerfen diesen
atomaren Vertrag nicht rot stellen.
