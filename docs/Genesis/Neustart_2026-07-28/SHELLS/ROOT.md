# Schalenstandard ROOT

Status: normativ
Stand: 15. September 2026
Schalenart: `ROOT`

## Eine Aufgabe

`ROOT` beschreibt eine Wurzelbeziehung
zwischen einem vollstaendigen Radikanden und einem positiven Wurzelgrad.

## Kanonische Kinder und Daten

- `root_radicand`: genau ein vollstaendiger Ausdruckswurzelknoten
- `root_degree`: positive ganze Zahl oder vollstaendiger Gradknoten; Standardwert `2`

Der Grad ist semantischer Inhalt.
Er darf nicht erst vom Renderer als dekorativer Index erfunden werden.

Kanonische Maschinenfelder sind `content: [radicandRoot]`, `degree`
und bei einem strukturierten expliziten Grad `degreeNodes: [degreeRoot]`.

## Invarianten

- Der Radikand wird vor der Wurzelschale aufgebaut.
- P1 bewahrt einen ausdruecklich angegebenen Grad.
- P3 erzeugt eine inverse Wurzel nur aufgrund einer P2-Decision.
- P4 baut Haken und Ueberstrich um die fertige funktionale Geometrie des Radikanden.
- Der Ueberstrich besitzt eine eigene funktionale Teilzeile. Seine Relativzeile
  ist exakt `radicand.minRelativeRow - 1`; er liegt damit immer oberhalb der
  gesamten Radikandgeometrie.
- Ein einfacher einzeiliger Radikand legt den Ueberstrich auf `-1`. Beginnt der
  Radikand wegen eines Exponenten bereits auf `-1`, liegt der Ueberstrich auf
  `-2`. Dasselbe Gesetz gilt ohne Sonderfall fuer noch tiefere Radikanden.
- Der optionale Wurzelgrad liegt links ausserhalb des Ueberstrichbands. Seine
  Zeile darf deshalb die Oberstrichzeile nicht bestimmen; massgeblich ist
  allein die oberste Zeile des Radikanden.
- `root_hook` und `root_overbar` sind zwei verschiedene funktionale Zellen.
  Ihre Spaltenbereiche duerfen sich nicht ueberschneiden. Der Ueberstrich
  beginnt in der unmittelbar auf die Hook-Zelle folgenden eigenen Zelle und
  reicht von dort bis zum rechten Ende des Radikandenbands.
- Haken und Ueberstrich duerfen sich in der visuellen Geometrie an ihrer
  gemeinsamen Zellgrenze beruehren. Der Renderer darf dafuer aber weder die
  Hook-Zelle in die Overbar-Spanne aufnehmen noch einen fehlenden Anschluss
  durch eine neue funktionale Spanne erfinden.
- Sichtbare Radikandatome bleiben auch neben den Huelleprimitiven atomar exportiert.

## Fehlerbedingungen

Ungueltig sind ein leerer Radikand, ein nichtpositiver Grad,
ein Radikand ohne eindeutige Kindzuordnung oder eine Wurzel,
deren Inhalt nur aus Rendertext rekonstruiert werden kann.
Ebenfalls ungueltig ist eine Wurzel, deren Hook- und Overbar-Primitiv dieselbe
funktionale Zelle belegen, oder deren Ueberstrich dieselbe Teilzeile wie ein
sichtbarer Teil des von ihm ueberspannten Radikanden belegt.
