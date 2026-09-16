# Schalenstandard ADDITION

Status: normativ
Stand: 11. September 2026
Schalenart: `ADDITION`

## Eine Aufgabe

`ADDITION` beschreibt eine geordnete Summe
aus mindestens zwei vollstaendigen Summanden.

## Kanonische Kinder

- `terms`: mindestens zwei vollstaendige Ausdruckswurzelknoten in Eingabereihenfolge
- `addition_operators`: genau ein stabiles Plus-Atom zwischen je zwei Summanden

Kanonische Maschinenfelder sind `terms` und `operators`.

## Invarianten

- Multiplikative, dividierte, negierte und potenzierte Kinder sind vor der Addition fertig.
- Die Eingabereihenfolge und alle Kind-IDs bleiben erhalten.
- Es gibt keine intrinsischen Rollen `target`, `passive` oder `flowDirection`.
- Ziel- und Passivrollen gehoeren ausschliesslich zur P2-Decision.
- P3 erzeugt inverse Additionsschalen mit denselben kanonischen Kindrollen.
- Werden beim Isolieren eines Summanden mehrere passive Summanden gemeinsam
  auf die Gegenseite uebertragen, bilden sie dort genau einen gebundenen
  Subtrahenden: `Gegenseite - (passiv_1 + passiv_2 + ...)`.
- Die innere Summe behaelt Reihenfolge, Plusoperatoren und Kind-IDs. Die
  Negation wirkt auf den ganzen Verband; sie darf nicht nur auf dessen erstes
  Kind angewendet werden.
- Diese Bindung entsteht in P3 als sichtbare `GROUP` um die passive `ADDITION`.
  P4 und Renderer duerfen fehlende Klammern nicht ergaenzen oder erraten.

## Fehlerbedingungen

Ungueltig sind weniger als zwei Summanden, fehlende oder ueberzaehlige Plus-Atome,
eine zielabhaengige Umordnung oder lose Summanden ohne gemeinsame Additionsschale.
