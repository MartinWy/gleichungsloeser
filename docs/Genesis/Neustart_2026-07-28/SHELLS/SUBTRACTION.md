# Schalenstandard SUBTRACTION

Status: normativ
Stand: 10. September 2026
Schalenart: `SUBTRACTION`

## Eine Aufgabe

`SUBTRACTION` beschreibt eine gerichtete binaere Differenz.

## Kanonische Kinder

- `minuend`: genau ein vollstaendiger Ausdruckswurzelknoten
- `subtraction_operator`: genau ein stabiles Minus-Atom
- `subtrahend`: genau ein vollstaendiger Ausdruckswurzelknoten

Kanonische Maschinenfelder sind `minuend: [root]`, `operator`
und `subtrahend: [root]`.

## Invarianten

- Minuend und Subtrahend sind nicht vertauschbar.
- Addition und Subtraktion werden mit gleicher Praezedenz linksassoziativ gelesen.
- `a-b-c` bedeutet `(a-b)-c`.
- Ein Minus am Ausdrucksanfang oder nach einem Operator gehoert zu `NEGATION`.
- Es gibt keine intrinsischen Rollen `target`, `passive` oder `flowDirection`.
- P3 erzeugt inverse Subtraktionsschalen mit denselben kanonischen Kindrollen.
- Wird ein additiver Ausdruck als ganzer Subtrahend in eine neu erzeugte
  `SUBTRACTION` eingesetzt, muss P3 ihn mit einer sichtbaren `GROUP` binden.
  `R - (A + B)` darf weder semantisch noch in P4 als `R - A + B` austreten.
- Die bindende `GROUP` ist Teil der neuen kanonischen Theoriezeile.
  P4 projiziert daraus nur noch die beiden Klammerprimitive;
  ein Renderer darf die Klammern weder erraten noch weglassen.

## Fehlerbedingungen

Ungueltig sind fehlender Minuend oder Subtrahend, ein fehlendes Minus-Atom,
eine zielabhaengige Vertauschung, eine Verwechslung mit unitaerer Negation
oder ein ungebundener additiver Gesamtausdruck in der Subtrahendrolle.
