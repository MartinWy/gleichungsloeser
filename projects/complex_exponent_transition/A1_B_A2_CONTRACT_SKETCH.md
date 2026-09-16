# A1 B A2 Contract Sketch

Status: Skizze  
Stand: 2026-08-08

## Zweck

Dieses Dokument ist **noch kein Endvertrag**.

Es skizziert nur,
wie `A1`, `B` und `A2`
spaeter gekoppelt werden koennten,
ohne den bestehenden Kern anzutasten.

## Leitbild

```text
A1 bringt die Gleichung bis zur Grenze.
B macht genau den Systemwechsel.
A2 rechnet von dort normal weiter.
```

## Rollen

### A1

- alter oder alter-naher Solver vor der Grenze
- behandelt die komplexe Exponentenschale als Stop-Zustand
- liefert den letzten gueltigen Zustand vor dem Wechsel

### B

- einziger Shell-Breaker
- bricht die komplexe Exponentenschale auf
- erzeugt die erste Startzeile des neuen Systems
- fuehrt weder den letzten Schritt von `A1`
  noch den ersten echten Folgeschritt von `A2` aus
- darf die neue Lage nicht aus alten Reservespalten ableiten

### A2

- Solver nach der Grenze
- bekommt keinen komplexen Exponenten mehr
- arbeitet danach mit seiner normalen Schalenlogik weiter

## Vermutete Datengrenzen

### A1 -> B

`A1` soll an `B` liefern:

- `boundary_state`
- optional ein exportiertes Solverprofil,
  falls es fuer Anker oder Raster noetig ist

Wichtig:

`boundary_state` darf dabei nicht nur
eine textuelle Gleichung sein.

`A1` muss fuer `B` mindestens atomar markieren:

- wo die relevante Exponentenschale sitzt
- was ihre Basis ist
- was ihr Inhalt ist
- welcher Teil durchgereicht wird
- wo das `=` als Anker liegt

### B -> A2

`B` soll an `A2` liefern:

- `landing_state`

### A2 -> B

`A2` soll an `B` im Vorfeld liefern:

- `landing_profile`

Nicht die ganzen Regeln,
sondern nur die Zielgeometrie
der ersten Solverzeile nach der Grenze.

Wichtig:

`landing_profile` darf dabei nicht nur sagen:

```text
ich haette gerne spaeter
log_B(y/a) = 2x-1
```

sondern muss strukturiert liefern:

- festen `=`-Anker
- Zielseite des geoeffneten Inhalts
- Zielraum des durchgereichten Ausdrucks
- echte Zielslots der ersten Solverzeile
- Garantie,
  dass danach kein zweiter Sprung mehr noetig ist

## Wichtigste Entkopplung

`A1` und `A2` muessen einander nicht direkt kennen.

Sie sind nur ueber `B`
und ueber einen gemeinsamen Vertragsraum verbunden:

- `boundary_state`
- `landing_profile`
- `landing_state`

## Vorlaeufiger Anschlussfluss

```text
A1
  -> boundary_state

A2
  -> landing_profile

B
  -> landing_state

A2
  -> normale Fortsetzung
```

## Offene Frage

Die offene Kernfrage ist:

```text
Wie kommt A2 zu seinem landing_profile,
ohne dass der ganze Prozess schon einmal gelaufen sein muss?
```

Arbeitsvermutung:

`A2` braucht einen kleinen Probe-Modus,
der nur die erste Zeile des neuen Systems planen kann.

Also eher:

```text
probe(target_equation) -> landing_profile
```

und nicht:

```text
solve_everything(target_equation)
```

## Arbeitsantwort auf die Probe-Frage

Unsere bisher beste Antwort ist also:

`A2` muss den ganzen Prozess **nicht** schon einmal komplett durchlaufen.

Aber `A2` braucht sehr wahrscheinlich
einen kleinen Vorab-Modus,
der nur dies beantworten kann:

```text
Wenn ich mit genau dieser Zielgleichung starten wuerde,
wo stuende meine erste Solverzeile?
```

Genau diese Antwort wird dann als `landing_profile`
an `B` uebergeben.

Wichtig:

`landing_profile` bedeutet dabei **nicht**,
dass `B` ein altes Spaltenraster weiterzieht.

Es bedeutet:

- `A2` liefert seine echte erste Startlage
- `B` trifft genau diese Lage
- `B` vermittelt nur den Uebergang,
  nicht die Fortsetzung alter Leer-Spalten

## Was wir noch nicht festlegen

Noch offen bleibt:

- ob `A1` und `A2` dieselbe Codebasis direkt teilen
- ob `A2` ein Fork,
  ein Profil
  oder ein Modus von `A-core` wird
- wie genau das Probe-Verfahren implementiert wird

## Was schon klar ist

Schon jetzt klar ist:

- `B` muss klein bleiben
- `B` darf nur einen Grenzschritt ausfuehren
- `B` darf nicht stellvertretend fuer `A1` vorbereiten
- `B` darf nicht stellvertretend fuer `A2` weiterrechnen
- `B` muss die Endlage des neuen Systems sofort treffen
- `B` darf keine kuenstlichen Abstaende aus alten Rasterresten erzeugen
- nach `B` darf kein zweiter Positionssprung noetig sein
- der alte Solver darf nicht ueberschrieben werden

## Kurzform

```text
A1 stoppt an der Exponentenschale.
B bricht sie.
A2 sieht sie nie mehr.
```

Und ebenso wichtig:

```text
B entfernt nichts davor.
B loest nichts danach.
```
