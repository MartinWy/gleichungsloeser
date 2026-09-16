# Schalenstandard NEGATION

Status: normativ
Stand: 9. September 2026
Schalenart: `NEGATION`

## Eine Aufgabe

`NEGATION` beschreibt die unitaere Vorzeichenoperation
auf genau einem vollstaendigen Ausdruck.

## Kanonische Kinder

- `negated_content`: genau ein vollstaendiger Ausdruckswurzelknoten
- `negation_operator`: genau ein stabiles Minus-Atom

Die unitaere Negation ist von der binaeren `SUBTRACTION` zu unterscheiden.

Kanonische Maschinenfelder sind `operator` und `content: [root]`.

## Invarianten

- P1 entscheidet die Unitaet ausschliesslich aus syntaktischer Operatorlage.
- Die Entscheidung ist zielunabhaengig.
- `-a*b` negiert den gemaess Praezedenz vollstaendigen Produktknoten.
- P3 darf eine inverse Negation nur aufgrund einer P2-Decision erzeugen.
- Das Minus darf weder an ein einzelnes Kind geklebt noch vom Renderer ergaenzt werden.

## Fehlerbedingungen

Ungueltig sind eine Negation ohne Inhalt, ein fehlendes Minus-Atom,
mehrere ungebundene Inhaltswurzeln oder eine Verwechslung mit Subtraktion.
