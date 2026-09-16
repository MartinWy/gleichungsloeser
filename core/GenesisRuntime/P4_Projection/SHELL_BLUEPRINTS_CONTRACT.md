# P4-Teilmodul: Schalen-Blueprints

Status: normativ
Stand: 16. September 2026
Vertrag: `p4_shell_blueprints_v2`

## Eine Aufgabe

`buildShellBlueprints.js` ermittelt von innen nach aussen fuer jede sichtbare
Schale ihren koordinatenfreien strukturellen Zellbedarf.

Eingabe sind Theoriezeilen ohne Geometrie.
Ausgabe ist `p4_shell_blueprints_v2` mit genau einem Blueprint je
`rowId + shellId`, seinen Kindrollen und den benoetigten Huellezellrollen.

Die kanonischen Rollen `factors`, `terms`, `minuend`, `subtrahend`,
`numerator`, `denominator`, `content` und `exponentNodes` werden direkt gelesen.
Ein Blueprint darf keine fehlende Rolle aus Text, Nachbarschaft oder alten Rollen erraten.
Insbesondere darf das Modul keine zur Praezedenzerhaltung benoetigte `GROUP`
um einen additiven Subtrahenden erfinden.
Diese Bindung muss bereits als sichtbare P3-Schale im Theoriezeilenvertrag vorliegen.

Das Modul darf keine globalen Spuren oder horizontale Zellgrenzen erzeugen,
keine lokalen Reihen nummerieren und keine Projektionsatome schreiben.

Ein Blueprint mit `rawCol`, `rawColStart` oder `rawColEnd` ist ungueltig.

Fuer jede `POWER` deklariert der Blueprint unabhaengig von der spaeteren
Sichtbarkeit genau die beiden Slots `power_left_paren` und
`power_right_paren`. Dieses Modul klassifiziert die fertige Basisstruktur
einmal nach dem POWER-Schalenstandard und schreibt fuer beide Slots dieselbe
explizite Sichtbarkeit. Es berechnet dabei keine Spalte und keine Glyphenbreite.
