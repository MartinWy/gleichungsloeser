# P4-Teilmodul: Projektionsbloecke

Status: normativ
Stand: 16. September 2026
Vertrag: `p4_projection_blocks_v2`

## Eine Aufgabe

`buildProjectionBlocks.js` fasst `p4_local_geometry_v4`
einer Theoriezeile in lokale Reihen-, Achsen- und Shell-Blockgrenzen.
Ausgabe ist `p4_projection_blocks_v2`.

Es liest semantische Kindrollen nur zur Zuordnung bereits vorhandener Geometrie.
Es darf keine Spalten erfinden, kein Raster verfeinern,
keine Shell-Huelle planen und keine Projektionsatome schreiben.
Jeder erzeugte Shell-Block muss auf einen bereits lokalisierten Blueprint verweisen.

Jeder Kindausdruck wird zuerst als vollstaendiger relativer Zeilenrahmen gebaut.
Lineare Schalen richten die Achsen ihrer Kinder an der eigenen Achse aus.

Eine `DIVISION` setzt danach:

- den vollstaendigen Zaehlerrahmen so, dass dessen unterste Reihe genau eine Reihe ueber der Bruchachse liegt
- den vollstaendigen Nennerrahmen so, dass dessen oberste Reihe genau eine Reihe unter der Bruchachse liegt

Damit entstehen auch bei verschachtelten Bruechen keine Ueberlagerungen.
Eine Funktions-, Gruppen-, Additions- oder Multiplikationsschale um einen Bruch
liegt auf der bereits fertigen inneren Bruchachse.
Keine geerbte Kindrolle darf ein zweites Mal als neue Verschiebung ausgewertet werden.

Eine `ROOT` setzt ihre eigenen Huellezeilen erst nach dem vollstaendigen Aufbau
des Radikandrahmens:

- `root_hook` bleibt auf der Achsenzeile der Wurzelschale
- `root_overbar.relativeRow = radicand.minRelativeRow - 1`
- der optionale Wurzelgrad ist nicht Teil des ueberspannten Radikandbands und
  darf die Oberstrichzeile nicht nach oben verschieben

Damit besitzt der Oberstrich immer eine eigene funktionale Teilzeile oberhalb
aller sichtbaren Radikandteile, auch oberhalb von Exponenten oder inneren
mehrzeiligen Schalen. Eine starre Oberstrichzeile relativ zur Gleichungsachse
ist verboten. Der Writer und alle Renderer konsumieren diese Reihe unveraendert.

Eine `POWER` fuehrt ihre beiden Basis-Klammer-Slots auf der Achse der
POWER-Schale. Der Block uebernimmt ihre bereits bestimmte Sichtbarkeit und
ihre horizontalen Zellen. Zusaetzlich setzt er fuer beide Slots
`rowSpanStart` und `rowSpanEnd` exakt auf die fertige vertikale Spanne des
`power_base`-Kindblocks. Der aeussere Exponentenblock ist nicht Teil dieser
Spanne. Der Block entscheidet weder Klammerbedarf noch Spalten neu.
