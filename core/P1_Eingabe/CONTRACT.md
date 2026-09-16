# P1 Contract: Eingabe

## Oeffentliche API
`Atomisierer.process(input)`

## Eingabe
- `input`: String

## Ausgabe
- Array aus Atomen und Schalenobjekten

## Aktuelle Objektformen
- Atome:
```js
{ id, value, type, isVisible: true }
```
- Schalen:
```js
{ id, type: "ROOT" | "POWER" | "FUNCTION" | "GROUP" | "NEGATION", isVisible: true, content: [...] }
{ id, type: "DIVISION", isVisible: true, numerator: [...], denominator: [...] }
```

## Verantwortung
- Leerzeichen entfernen
- `sqrt(...)`-Schalen erkennen
- einfache Potenzschalen erkennen
- erste Funktions- und Gruppenschalen erkennen
- implizite Multiplikation in eine kanonische `*`-Struktur ueberfuehren
- aktive `DIVISION`-Faelle wie `x/2`, `x/(2+1)` oder `sin(x)/(2*3)` als sichtbare `DIVISION`-Schale lesen
- negative Vorzeichen direkt vor einem aktiven Ausdruck wie `-x`, `-(x+1)` oder `-sin(x)` als sichtbare `NEGATION`-Schale lesen
- restliche Zeichen als Atome zusammenfassen
- deterministische Initial-IDs fuer denselben normalisierten Eingabestring erzeugen

## Verboten
- numerisch auswerten
- strategische Prioritaeten setzen
- Projektionsmarker setzen

## Wichtige Ist-Hinweise
- IDs entstehen jetzt deterministisch aus einem normalisierten Eingabe-Namespace plus laufstabilen Zaehlern.
- Derselbe normalisierte Eingabestring liefert damit denselben initialen ID-Satz.
- Potenzen sind derzeit weiter vereinfacht und gehen von expliziten Exponenten aus.
- implizite Multiplikation wie `2x` oder `2sin(x)` wird heute auf Strukturebene zu `2*x` beziehungsweise `2*sin(x)` kanonisiert.
- ein negatives Vorzeichen direkt vor einem aktiven Ausdruck wird heute als eigene `NEGATION`-Schale gelesen, nicht nur als Schreibweise.
- Nennerausdruecke werden im aktiven Rahmen als ganze Ausdruckstraeger modelliert, solange die Nennerseite parserseitig als ein Ausdruckstraeger vorliegt.
- ungruppierte Ketten wie `x/2*3` werden noch nicht als vollstaendige Nenner-Topologie gelesen.
- der deterministische ID-Vertrag ist fuer den aktiven Ein-Zielvariablen-Parserrahmen produktiv eingezogen.
