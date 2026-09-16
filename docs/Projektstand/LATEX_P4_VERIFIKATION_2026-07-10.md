# LaTeX-P4-Verifikation 2026-07-10

## Erkenntnisfortschritt

Der sichtbare Durchbruch entstand erst, als LaTeX nicht mehr frei ueber die inneren Abstaende entscheiden durfte. Eine normale Formel wie `\frac{5-3}{a}` ist mathematisch korrekt, gibt aber die P4-Spalten im Inneren auf.

Die tragfaehige Form ist:

```latex
\frac{\pFourCell{5}\pFourCell{-}\pFourCell{3}}{\pFourCell{}\pFourCell{a}\pFourCell{}}
```

Damit bleibt der Bruch echte LaTeX-Mathematik, aber die inneren Orte bleiben P4-gebunden.

## Gepruefte Faelle

| Fall | Ergebnis | Beobachtung |
| --- | --- | --- |
| `2*x=5` | traegt | einfacher Bruch wird als `\frac{\pFourCell{5}}{\pFourCell{2}}` gesetzt |
| `a*x+3=5` | traegt | breiter Zaehler bleibt mit `5`, `-`, `3` auf festen P4-Zellen |
| `sin(x)/(2a)=5` | verbessert | sichtbarer Startbruch nutzt feste P4-Zellen; Funktionsschalen werden ueber `renderNode` strukturell nach LaTeX serialisiert |
| `2*sqrt(x+3)=5` | traegt fuer diesen Fall | die Wurzel wird als echter LaTeX-Root mit festen P4-Zellen `x`, `+`, `3` gesetzt; `(5/2)^2` nutzt dieselbe feste P4-Bruchbox wie die Zeile davor, also keine automatische LaTeX-Verkleinerung |
| `2*sqrt((x+3)/(2+1))=5` | traegt als komplexerer Stresstest | Bruch unter Wurzel, Gruppen im Zaehler/Nenner und Potenz ueber Bruch bleiben strukturell LaTeX, aber intern P4-zellgebunden |

## Fazit

Das Prinzip traegt fuer sichtbare P4-Bruchachsen. Der strukturelle LaTeX-Serializer ist jetzt der richtige Weg fuer Renderknoten wie Funktion, Wurzel, Potenz, Multiplikation und verschachtelte Divisionen. Die Wurzel exportiert nun ihren P4-Span. Verschachtelte Brueche werden inzwischen ebenfalls als feste P4-Bruchboxen gesetzt, damit LaTeX sie nicht kleiner skaliert. Die naechste offene Kernfrage ist, ob dasselbe Span-Prinzip fuer andere Schalen wie Gruppen, Funktionen und Potenzen ebenfalls verbindlich werden soll.

Die zentrale Regel bleibt:

```text
P4 bestimmt die Orte.
LaTeX setzt die mathematische Schale.
Feste P4-Zellen halten die inneren Orte stabil.
```

## Artefakte

Die erzeugten Pruef-PDFs liegen unter:

```text
Projektstand/pdf/check_2_x_5.pdf
Projektstand/pdf/check_a_x_3_5.pdf
Projektstand/pdf/check_sin_x_2a_5.pdf
Projektstand/pdf/check_2_sqrt_x_3_5.pdf
Projektstand/pdf/check_complex_2_sqrt_x_3_over_2_plus_1_5.pdf
```
