# Familienvertrag: `subtracted_sum_release`

Status: aktiv vorgesehen  
Stand: 15. September 2026

## Eine Aufgabe

`subtracted_sum_release` loest genau eine sichtbare gruppierte Summe auf, die
als Ganzes subtrahiert wird:

```text
U - (V + W + ...) -> U - V - W - ...
```

Die Familie ist keine Rendervereinfachung. Sie erzeugt eine eigene
Theoriezeile zwischen zwei anderen Umformungsschritten.

## P2-Situation

P2 darf die Familie nur waehlen, wenn genau eine zielvariablenfreie
Gleichungsseite diese aeussere Lage besitzt:

```text
SUBTRACTION
  minuend: [U]
  subtrahend:
    GROUP
      content:
        ADDITION
          terms: [V, W, ...]
```

Die Gruppe, die innere Addition, ihre geordneten Summanden und ihre Operatoren
werden durch IDs in der Decision bezeichnet. Kein Text und keine Projektionslage
darf zur Erkennung dienen. Passt die Lage auf beiden Seiten oder nicht eindeutig,
ist ein Vertragsfehler erforderlich.

## P3-Ausgabe

P3 entfernt genau die bezeichnete Gruppen- und Additionshuelle aus der sichtbaren
Folgestruktur und baut eine linksassoziative Kette kanonischer `SUBTRACTION`-Schalen.

- `U`, `V`, `W` und weitere Summanden behalten Identitaet und Reihenfolge.
- Das vorhandene aeussere Minus wird fuer den ersten Summanden weiterverwendet.
- Fuer jeden weiteren Summanden entsteht genau ein deterministischer sichtbarer
  Subtraktionsoperator.
- Die andere Gleichungsseite bleibt unveraendert.
- P3 trifft keine Layoutentscheidung.

## Nicht umfasst

- Gruppen ohne aeussere Subtraktion
- gruppierte Differenzen
- Multiplikation eines Klammerinhalts mit einem allgemeinen Faktor
- Vorzeichenauflosung auf der zieltragenden Seite
- Vereinfachung oder Sortierung der Summanden

Diese Situationen brauchen jeweils eine eigene dokumentierte Fallregel.

## Beweistests

- `tests/active/subtracted_sum_release.test.js`
- `tests/active/cosine_law_gamma.test.js`
