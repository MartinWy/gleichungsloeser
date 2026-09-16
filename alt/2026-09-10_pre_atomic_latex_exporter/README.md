# Vorkanonischer LaTeX-Exporter

Archiviert am 10. September 2026.

Dieser Ordner bewahrt den abgeloesten zusammensetzenden Exportkern auf. Er
konsumierte mehrere Worksheet-Zellen, um daraus unter anderem gemeinsame
Bruch-, Potenz- und Wurzelobjekte zu erzeugen. Das widerspricht dem aktuellen
atomaren Referenzvertrag:

```text
1 Worksheet-Zelle -> 1 LaTeX-/TikZ-Primitiv
```

Enthalten sind:

- der fruehere produktive Aggregationskern mit seinen Hilfsdateien
- die ehemalige isolierte `export_projection_pdf_core_neu`-Huelle
- der fruehere eigenstaendige B-Uebergangs-PDF-Generator
  `projects/complex_exponent_transition/render_b_real_transition.mjs`, der den
  entfernten Aggregationshelfer `stepLayout.js` importierte

Der kleine atomare Kern aus der isolierten Huelle ist seit diesem Stand der
einzige produktive Kern unter `scripts/export_projection_pdf_core/`.
Die Archivdateien sind nicht mehr Teil der aktiven Import- oder Testkette und
bleiben nur fuer Nachvollziehbarkeit und Wiederherstellung erhalten.
