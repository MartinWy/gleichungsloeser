# Projektstand: Gleichungsloeser

Stand: 19. Mai 2026

## Schnellzugriff
Der massgebliche Wiedereinstiegspunkt ist jetzt:
- [HANDOVER_2026-05-19.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Projektstand/HANDOVER_2026-05-19.md)
- [ARCHITEKTUR_KURZ.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Architecture/ARCHITEKTUR_KURZ.md)

## Kurzstatus
- Rechenkern: fuer den aktiven Rahmen weitgehend stabil
- Projektionskern: als eigene Schicht klar modelliert
- Renderkern: als eigene Schicht begonnen, mit Layout-Metadaten bis in CSS durchgezogen, aber noch nicht typografisch fertig
- Input-Adapter: begonnen, damit mehrere Eingabe-UIs denselben Kern bedienen koennen
- Diagnosekanaele: Browser-Diagnose und Terminal-Inspektor fuer schnelle Kernpruefung vorhanden
- Achsenhuellen: Renderkern traegt jetzt neben Mindesthoehen auch explizite Ober-/Unterreserven und eine Achsenbalance an der mathematischen Achse; Teilzeilen tragen dieselbe Balance zusaetzlich als eigenen Blockwert, einen kleinen Achsenversatz `axisShiftEm` und einen expliziten Achsenkontext wie `baseline_axis`, `fraction_axis`, `root_fraction_axis`
- Bruchspannungs-Vertrag: sichtbare Bruchachsen tragen jetzt zusaetzlich eine explizite `fractionSpanWidth`, damit schmale und breite Bruchbloecke unterschiedlich eng gesetzt und im Inspektor eindeutig verstanden werden koennen
- Achsenbegleiter-Vertrag: einfache Bruchachsen tragen jetzt zusaetzlich eine kleine explizite Begleiter-Korrektur fuer Nachbarzeichen wie `x` und `=`, damit Bruchstrich und Achsenbegleiter nicht mehr nur zufaellig, sondern bewusst gemeinsam fluchten
- Komplexe sichtbare Bruchachsen: derselbe Achsenbegleiter-Vertrag gilt jetzt auch fuer `fraction_root_axis` und `fraction_power_axis`
- Zeilenvertrag fuer sichtbare Bruchachsen: `rowContentShiftEm`, `axisLineShiftEm` und die Linienmetriken sitzen jetzt explizit in den `rowMetrics` statt nur indirekt in der Zelllogik

## Technischer Stand heute
- Freeze-Commit auf Branch `freeze-projektionskern-2026-05-19`: `062fabd`
- `npm test`: **14/14 aktiv gruen**
- `npm run test:legacy`: gruen als Audit
- `npm run inspect -- "2*x+3=5" --target x`: zeigt Rechenkern-, Projektionsblock- und Renderspur im Terminal

## Wichtige Dokumente
- [HANDOVER_2026-05-19.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Projektstand/HANDOVER_2026-05-19.md)
- [ARCHITEKTUR_KURZ.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Architecture/ARCHITEKTUR_KURZ.md)
- [BEGRIFFSBLATT_PROJEKTION.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Architecture/BEGRIFFSBLATT_PROJEKTION.md)
- [EXPORT_MODEL.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Architecture/EXPORT_MODEL.md)
- [STATE_MODEL.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Architecture/STATE_MODEL.md)

## Merksatz
Sprachen und UIs duerfen vielfaeltig sein.  
Der Kern soll trotzdem genau eine kanonische Wahrheit behalten.
