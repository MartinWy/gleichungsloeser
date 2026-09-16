# Extrakt: Atome und Schalen

Status: normativ  
Stand: 12. Juli 2026  
Quelle: Genesis Gleichungsloeser Maschine

## Zweck
Dieser Extrakt definiert die kleinsten strukturellen Einheiten,
mit denen der Gleichungsloeser arbeitet.

## Atom
Ein Atom ist die kleinste identitaetsstabile strukturelle Einheit,
die im Solve-Lauf weiterverfolgt werden kann.

Normen:
- ein Atom behaelt seine ID ueber die gesamte Umbaugeschichte
- ein Atom darf spaeter in Projektion und Export wiedererkannt werden
- ein Atom wird nicht deshalb aufgeloest, weil es visuell vereinfacht dargestellt werden koennte

Typische atomare Einheiten sind:
- Variablen
- Konstanten
- Zahlen als Symbole
- Operatoranker wie das Gleichheitszeichen

## Schale
Eine Schale ist die wirksame Huelle einer strukturellen Operation.
Sie bestimmt, was in einem Schritt als Ganzes bearbeitet werden darf.

Normen:
- nur die aeusserste wirksame Schale ist im aktuellen Schritt zulaessig
- innere Inhalte bleiben waehrenddessen geschuetzt
- Schalenabbau folgt dem Zwiebelschalenprinzip

## Strukturregel
Die Frage "atomar oder Schale" ist keine Frage der visuellen Groesse,
sondern der strukturellen Rolle im aktuellen Schritt.

Folgesatz:
Etwas kann intern komplex sein
und dennoch fuer den aktuellen Schritt als geschuetzter Inhaltsraum gelten.

## Bezug zur Projektion
Atome tragen Identitaet.
Schalen tragen strukturelle Wirksamkeit.
Die Projektion macht spaeter sichtbar,
welche Schale entfernt wurde und welche Atome gleich geblieben sind.

## Strukturelle Schale und sichtbare Shell-Tinte
Die strukturelle Schale ist nicht dasselbe wie ihre spaetere sichtbare Tinte.

Normen:
- die strukturelle Schale entsteht im Kern
- sichtbare Shell-Teile wie Klammern, Wurzelhaken oder Funktionsnamen entstehen erst in der Ausgabe-Topologie
- die Ausgabe darf keine neue strukturelle Schale erfinden
