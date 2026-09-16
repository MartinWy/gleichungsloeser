# transition_step

Status: erster produktiver Bridge-Motor aktiv  
Stand: 10. September 2026

## Zweck

Dieses Modul bildet den kleinsten echten Arbeitskern von `bridge_b`.

Es bekommt:

- `boundary_state`
- `landing_profile`

und erzeugt:

- `landing_state`

## Rolle

`transition_step` macht genau den lokalen Grenzschritt:

```text
komplexe Exponentenschale
-> erste echte Startlage von A2
```

Dabei gilt:

- kein Rueckgriff auf Solverregeln von `A1`
- kein Vorgriff auf Folgeschritte von `A2`
- kein zweiter Positionssprung nach der Landung
- die Boundary-Geometrie der `POWER`-Schale endet vor der Landing-Zeile
- der gesamte Exponenteninhalt kommt als genau eine geschlossene
  funktionale Boundary-Spur an
- diese eine Spur wird genau hier einmal in ihre von P4 gelieferten,
  spaltentragenden Inhalts-, Operator- und Schalenzellen aufgefaltet;
  jede davon belegt einen eigenen normalen Landing-Slot
- der Exponenteninhalt landet in den kompakten normalen `term_slots`
  des uebergebenen `landing_profile`
- alte Basis- und Exponentenslots werden nicht als Leerraum weitergereicht
- die Zahl der Zielslots muss exakt der gelieferten Folge `ordered_cells`
  entsprechen; B darf weder buendeln noch auffuellen
- eine unveraendert durchgereichte Schale bleibt mitsamt ihren textlosen
  Spannprimitiven und `shellSpans` vollstaendig
- die exklusive Landing-Zeile verwendet fuer Kindgeometrie, inverse
  Funktionshuelle und Gleichheitsanker genau ein gemeinsames zeilenlokales Raster
- der Bruchstrich wird als P4-Strukturzelle weitergereicht und niemals wegen
  eines leeren Textwerts entfernt

## Heute

`index.js` exportiert bereits:

- Validierung des Bridge-Eingabepaares
- Erzeugung eines `landing_state`
- ein kleines Manifest des Ein-Schritt-Motors

Der Anschluss an `A1` und `A2`
ist damit noch **nicht** umgesetzt.

Aber:

Die innere lokale Bridge-Logik
existiert jetzt als eigener,
testbarer Baustein.
