# Complex Exponent Transition Separation

Status: verbindlich  
Stand: 2026-08-07

## Zweck

Dieses Blatt trennt den bestehenden Gleichungsloeser
vom neuen Folgeprojekt fuer den Uebergang
eines komplexen Exponenten
in eine normale horizontale Termstruktur.

Der vorhandene Solver- und Rendererstand
gilt dabei als zu schuetzender Kern.

## Freeze-Punkt

Der aktuelle Kernstand,
der nicht mehr durch das Folgeprojekt gefaehrdet werden soll,
liegt spaetestens bei Commit:

```text
88057a3
Support logarithm shells through runtime inversion
```

## Ausgangslage

Im bestehenden Projekt gilt:

- Solange ein Exponent Exponent bleibt,
  darf er visuell als zusammenhaengende Einheit behandelt werden.
- Wird der Exponent jedoch "heruntergeholt",
  aendert sich die sichtbare Topologie.
- Dieser Wechsel ist nicht nur ein weiterer Zeilenschritt,
  sondern ein Uebergang zwischen zwei geometrisch verschiedenen Raeumen.

Genau dieser Uebergang
ist **nicht mehr Teil des bestehenden Projekts**.

## Harte Trennungsregel

```text
Der aktive Gleichungsloeser liefert stabile mathematische Zustaende.
Das Folgeprojekt fuer komplexe Exponenten erzeugt nur den visuellen Uebergang zwischen solchen Zustaenden.
Es gibt keine Rueckwirkung vom Folgeprojekt in den aktiven Kern.
```

## Was im bestehenden Projekt bleibt

- P1 bis P4 des Gleichungsloesers
- die bestehende Ortswahrheit
- der bestehende Cockpit-/PDF-Renderer
- alle bereits erreichten Regeln zu Spaltentreue und Schalenverhalten

## Was in das Folgeprojekt ausgelagert wird

- der visuelle Szenenwechsel zwischen
  `Exponent-als-Einheit`
  und
  `Term-auf-normaler-Ebene`
- Zoom-, Falt-, Kamera- oder Transformationslogik
- neue Zwischenraeume,
  die im bestehenden P4 nie existiert haben
- alle Experimente mit nichttrivialen Bahnkurven,
  morphenden Layouts oder Fokusfenstern

## Verbotene Rueckkopplungen

Nicht erlaubt sind:

- neue Imports aus dem Folgeprojekt nach `core/`
- neue Imports aus dem Folgeprojekt nach `components/Arbeitsblatt_Druckansicht/`
- stilles Mitverwenden von Uebergangslogik im Cockpit
- neue Sonderfaelle im bestehenden Renderer
- Aenderungen an P1, P2, P3 oder P4,
  nur damit der neue Uebergang leichter wird

## Erlaubte Kopplung

Erlaubt ist nur eine **einseitige, lesende Uebergabe**:

1. der bestehende Kern exportiert einen stabilen mathematischen Zustand
2. das Folgeprojekt liest diesen Zustand
3. das Folgeprojekt erzeugt daraus eine eigene Szene oder Sequenz

Das Folgeprojekt darf diese Daten:

- lesen
- kopieren
- in eigenes Format uebersetzen

Es darf sie nicht:

- zurueckschreiben
- mutieren
- als neue Pflicht fuer den Kern definieren

## Architekturregel

Der bestehende Gleichungsloeser bleibt ein System fuer:

- Regeln
- Theoriezeilen
- Positionstreue
- feste Shell-Topologie pro Zeile

Das Folgeprojekt wird ein System fuer:

- topologischen Szenenwechsel
- Blickfuehrung
- Fokus
- Transformationsraum zwischen zwei festen Zustaenden

## Empfehlung

Das Folgeprojekt sollte seine eigene Ordnerwurzel haben
und nur ueber einen expliziten Contract
mit dem bestehenden Projekt sprechen.

Siehe dazu:

- [../../projects/complex_exponent_transition/README.md](../../projects/complex_exponent_transition/README.md)
- [../../projects/complex_exponent_transition/CONTRACT.md](../../projects/complex_exponent_transition/CONTRACT.md)
