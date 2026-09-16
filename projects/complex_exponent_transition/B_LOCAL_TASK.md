# B Local Task

Status: Arbeitsvertrag  
Stand: 2026-08-07

## Zweck

Dieses Dokument beschreibt **nur** die lokale Aufgabe von `B`.

`B` ist der Systemwechsel-Schritt
zwischen einem alten Solverraum
und einem neuen Solverraum.

Fuer den Moment
werden `A1` und `A2`
bewusst ausgeklammert.

## Grundidee

`B` soll genau **eine** Aufgabe haben:

```text
einen gueltigen Grenzzustand
in einen gueltigen Startzustand
des neuen Systems ueberfuehren
```

Danach ist seine Arbeit beendet.

Noch schaerfer:

```text
vor B arbeitet A1
nach B arbeitet A2
B selbst macht nur den Systemwechsel
```

## Was B nicht tun soll

`B` soll **nicht**:

- die ganze Gleichung weiterloesen
- algebraische Schritte vor dem Grenzschritt nachholen
- algebraische Schritte nach dem Grenzschritt vorwegnehmen
- Vorstufen von `A1` mitdenken
- Folgeschritte von `A2` ausfuehren
- einen zweiten Positionssprung nach dem Uebergang erzeugen
- den alten Solver ueberschreiben oder umbauen

## Lokale Eingabe von B

Solange wir die Anbindung noch nicht definieren,
denkt `B` nur in einem **lokalen Grenzzustand**.

Beispiel links:

```text
y/a = B^(2x-1)
```

Beispiel rechts:

```text
B^(2x-1) = y/a
```

Wichtig:

- diese Beispiele dienen nur als Arbeitsbilder
- `B` arbeitet nur auf dem Grenzschritt selbst
- wenn vor dem Grenzschritt noch ein Faktor entfernt werden muss,
  ist das Sache von `A1`
- wenn nach dem Grenzschritt weiter nach `x` oder einer anderen Groesse geloest wird,
  ist das Sache von `A2`

## Lokale Ausgabe von B

`B` erzeugt genau **eine erste Zeile**
des neuen Systems.

Beispiel links:

```text
log_B(y/a) = 2x - 1
```

Beispiel rechts:

```text
2x - 1 = log_B(y/a)
```

Diese Ausgabe ist nicht nur mathematisch gueltig,
sondern bereits **in der endgueltigen Startlage**
des neuen Systems gesetzt.

Wichtig:

- `B` erzeugt keine zweite Folgezeile
- `B` loest den neuen Term nicht weiter auf
- `B` uebergibt genau an dem Punkt,
  an dem `A2` mit seiner normalen Logik uebernehmen kann

## Harte Invarianten

Die folgenden Regeln gelten lokal fuer `B`:

### 1. Das Gleichheitszeichen bleibt Anker

Das `=` bleibt waehrend des Systemwechsels
an seiner Stelle.

`B` darf den Systemwechsel
nicht durch ein Wandern des Gleichheitszeichens erklaeren.

### 2. Zwei Geschichten laufen gleichzeitig

Es gibt zwei gleichzeitige Veraenderungen:

- `B -> log_B`
- `2x - 1` verlaesst den Exponentenraum
  und erscheint als normaler Term

Diese beiden Geschichten werden nicht nacheinander,
sondern **als ein gemeinsamer Grenzschritt** gedacht.

### 3. Farbe ersetzt verlorene Positionstreue

Wenn die alte Spaltentreue
am Grenzschritt nicht erhalten werden kann,
muss `B` kenntlich machen:

- was sich aendert
- was inhaltlich gleich bleibt

Arbeitsregel:

- Blau = Operatorgeschichte `B <-> log_B`
- Orange = Inhaltsgeschichte `2x - 1`

### 3a. In B gibt es keine absoluten Reservespalten

`B` ist **nicht** mehr der Raum
der alten strengen Spaltentreue.

Sobald die Exponentenschale
in den normalen Termraum uebergeht,
ist die alte absolute Spaltenordnung
nicht mehr vollstaendig erhaltbar.

Deshalb gilt:

- `B` arbeitet **nicht** mit kuenstlich freigehaltenen Leer-Spalten
- `B` setzt **keine** spaeteren Zielspalten blind nach dem alten Raster fort
- `B` darf keine Abstaende erzeugen,
  die nur aus alten Reserven stammen

Wichtige Folge:

```text
Die Positionen in B ergeben sich fast nur
aus A1 Ende und A2 Anfang.
```

Das heisst:

- oben liest `B`,
  wo die Teile im Grenzzustand von `A1` wirklich stehen
- unten setzt `B`,
  wo sie in der ersten echten Zeile von `A2` wirklich landen muessen
- dazwischen vermittelt `B`
  nur die Identitaet der Geschichten,
  nicht ein starres Weiterleben alter Spalten

### 4. Kein zweiter Sprung nach der Landung

Die von `B` erzeugte erste Zeile
muss bereits so gesetzt sein,
dass der nachfolgende Solver
ohne erneute Repositionierung weiterarbeiten kann.

## Geometrische Pflicht von B

`B` darf nicht nur Mathematik liefern.

`B` muss zugleich die **Landeposition** des neuen Systems treffen.

Deshalb gehoert zur lokalen Aufgabe von `B`:

- die Breite des neuen Terms kennen
- die Seite kennen, auf der der neue Term landen wird
- feste Anker wie `=` respektieren
- die erste Zeile bereits im Raster des Folgesystems setzen

Aber:

- dieses Raster ist das **Start-Raster von A2**
- nicht das alte Vollraster von `A1`
- `B` darf also keine alten Leer-Spalten konservieren,
  wenn sie nur kuenstliche Distanz erzeugen

## Linksvariante

Beispiel:

```text
y/a = B^(2x-1)
```

nach

```text
log_B(y/a) = 2x - 1
```

Lokale Regel:

- die rechte Kante des neuen rechten Terms
  soll nach Moeglichkeit erhalten bleiben
- der Exponent darf beim Aufweiten
  nach links Raum gewinnen
- die Farbe muss den Zusammenhang tragen,
  auch wenn die alte Exponentenlage verloren geht
- einzelne Teile wie die `2`
  duerfen **nicht** nur deshalb in eigene Leer-Spalten fallen,
  weil dort im alten Raster zufaellig Platz war

## Rechtsvariante

Beispiel:

```text
B^(2x-1) = y/a
```

nach

```text
2x - 1 = log_B(y/a)
```

Lokale Regel:

- rechts muss nur die **echte Startlage von A2**
  getroffen werden
- die linke Seite landet bereits
  in der ersten echten Lage des neuen Systems
- auch hier darf nach der Landung
  kein zweiter Positionswechsel mehr noetig sein

Das ist **keine** Regel
des fruehzeitigen Leerraum-Reservierens im alten Raster,
sondern eine Regel
der richtigen Landung im neuen Raster.

## Erlaubte lokale Operationen

`B` darf lokal:

- Operator und Inhaltsgeschichte gleichzeitig umsetzen
- einen neuen Termraum berechnen
- Zielbreiten und Zielspalten des neuen Systems aus `A2` uebernehmen
- eine lokale Zielgeometrie setzen

`B` soll lokal **nicht**:

- weitere algebraische Folgeschritte ausfuehren
- mehrere Folgezeilen erzeugen
- alte Spalten mechanisch weitervererben,
  wenn dadurch kuenstliche Abstaende entstehen
- interne Regeln des alten oder neuen Gesamtsolvers nachspielen,
  wenn sie fuer den Grenzschritt selbst nicht noetig sind

## Minimaler Erfolg von B

`B` ist erfolgreich,
wenn am Ende genau dies erreicht ist:

1. mathematisch gueltiger Grenzschritt
2. Operatorgeschichte sichtbar
3. Inhaltsgeschichte sichtbar
4. `=` bleibt stabil
5. erste Zeile des neuen Systems steht schon in ihrer endgueltigen Solver-Lage
6. kein algebraischer Schritt vor oder nach der Grenze wurde von `B` mit uebernommen

## Spaeterer Anschluss

Erst **nachdem** `B` lokal sauber geloest ist,
werden wir definieren:

- was `A1` an `B` uebergibt
- was `A2` von `B` verlangt
- welches Profil `A2` fuer die Landeposition exportieren muss

Bis dahin gilt:

```text
Zuerst B sauber.
Dann erst A1 und A2 anschliessen.
```
