# Schalenstandard FUNCTION

Status: normativ
Stand: 16. September 2026
Schalenart: `FUNCTION`

## Eine Aufgabe

`FUNCTION` beschreibt die Anwendung einer benannten Funktion
auf einen vollstaendigen Argumentausdruck.

## Kanonische Kinder und Daten

Obligatorisch sind:

- `function_name`: kanonischer Funktionsname
- `function_argument`: genau ein vollstaendiger Ausdruckswurzelknoten

Optional ist:

- `function_base`: genau ein vollstaendiger Basis-Ausdruck bei Funktionen wie `log_B`

Funktionsname, Argument und optionale Basis gehoeren eindeutig derselben Shell-ID.

Kanonische Maschinenfelder:

- `name`
- `content: [argumentRoot]`
- optional `baseContent: [baseRoot]`

## Invarianten

- Das Argument wird vor der Funktionsschale aufgebaut.
- P4 muss die vollstaendigen funktionalen Zellgrenzen des fertigen Arguments
  verwenden. Besitzt ein Argumentatom eine von seiner Identitaetsspur `col`
  abweichende Zelle `colStart` bis `colEnd`, gehoert diese gesamte Zellspanne
  zum Argumentblock.
- `function_name`, `function_left_paren`, Argumentblock und
  `function_right_paren` besitzen disjunkte funktionale Zellen. Der Name liegt
  vollstaendig vor der linken Klammer, die linke Klammer vollstaendig vor dem
  Argument und die rechte Klammer vollstaendig hinter dem Argument.
- Ist `baseContent` vorhanden, wird zuerst dessen vollstaendige innere
  Geometrie aufgebaut. Danach gilt fuer die aeussere FUNCTION-Huelle strikt:
  `function_name < baseContent < function_left_paren < content < function_right_paren`.
  Die Vergleiche gelten fuer die Grenzen der vollstaendigen Bloecke, nicht nur
  fuer einzelne Zellzentren. Ohne Basis entfaellt ausschliesslich `baseContent`.
- Die optionale Basis ist kein Teil des Argumentbands. Sie liegt in einem
  eigenen Basisband zwischen Namensslot und linker Klammer. Auch eine
  mehratomige oder selbst geschachtelte Basis wird als fertiger Block dort
  eingesetzt; kein Kind dieses Blocks darf eine Klammer- oder Argumentzelle
  der FUNCTION belegen.
- Diese Slotfolge gilt fuer eingelesene und fuer von P3 erzeugte Funktionen
  gleichermassen, insbesondere fuer inverse Funktionen wie `asin`, `acos` und
  `atan`.
- Erscheint eine FUNCTION erst in einer spaeteren Theoriezeile, muessen ihre
  Name- und Klammerkoordinaten im gemeinsamen Prozessraster der vorherigen
  Zeilen bereits frei sein. Bestehende Kindzellen duerfen fuer die neue Huelle
  in keiner Zeile nachtraeglich verschoben werden.
- Die Zeichenlaenge eines Funktionsnamens veraendert nicht die Zahl seiner
  strukturellen Slots. Der eigene `function_name`-Slot darf visuell breit sein,
  aber weder eine Klammer- noch eine Argumentzelle mitbenutzen.
- Die Funktionsklammer umfasst die vollstaendige, bereits fertige funktionale
  Geometrie des Arguments. Bei einem Bruchargument gehoeren insbesondere
  Zaehler, Bruchstrich und Nenner innerhalb derselben Klammerhuelle zusammen.
- Funktionsklammern und Argument muessen dasselbe zeilenlokale Koordinatensystem
  verwenden. Eine Modulgrenze darf weder alte Kindzeilen mit einem neuen
  Eltern-Span mischen noch den Klammerumfang aus sichtbarem Text erraten.
- Eine optionale Basis ist semantischer Inhalt und kein Renderindex.
- P1 erkennt nur registrierte Funktionsnamen.
- P3 erzeugt inverse Funktionsschalen nur aufgrund einer P2-Decision.
- Ein Renderer darf Argument oder Basis weder aus dem Funktionsnamen noch aus Text rekonstruieren.

## Fehlerbedingungen

Ungueltig sind ein unbekannter oder leerer Name, ein fehlendes Argument,
mehrere ungebundene Argumentwurzeln oder eine textuell eingebettete,
strukturell fehlende Basis. Ungueltig ist auch jede FUNCTION-Geometrie, in der
Name, Klammer oder fertiger Argumentblock dieselbe funktionale Zelle ganz oder
teilweise belegen, sowie jede Geometrie, in der `baseContent` nicht vollstaendig
zwischen Funktionsname und linker Argumentklammer liegt.

## Beweis

- `tests/active/p4_function_base_cell_order.test.js`
