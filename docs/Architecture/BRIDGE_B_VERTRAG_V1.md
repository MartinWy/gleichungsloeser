# Bridge-B Vertrag

Status: aktiv  
Stand: 2026-09-16

## Zweck

Dieses Dokument definiert den harten Prinzipvertrag fuer `B`.

`B` ist kein Solver.
`B` ist kein halbes `A2`.
`B` ist genau der Grenzschritt

```text
komplexer Exponent -> normaler Termraum
```

und sonst nichts.

## Rolle von B

`B` hat genau eine Aufgabe:

- die aktive Potenzschale mit komplexem Exponenten,
  die die Zielgroesse enthaelt,
  genau einmal zu brechen

`B` hat ausdruecklich **nicht** die Aufgabe:

- davor weitere A1-Schritte zu rechnen
- danach weitere A2-Schritte zu rechnen
- vorhandene Altinhalte neu zu gruppieren
- Positionen spaeter zu reparieren

## Ein-Zeilen-Regel

`B` erzeugt genau einen algebraischen Umbau.

Sichtbar bedeutet das:

- eine Boundary-Zeile
- eine Landing-Zeile

Mehr nicht.

Wenn danach weitere Zeilen sichtbar werden,
sind das bereits `A2`-Zeilen
und nicht mehr Teil von `B`.

## Eingaben

`B` arbeitet nur mit zwei echten Arbeitsdaten:

1. `boundary_state` von `A1`
2. `landing_profile` von `A2`

## Ausgangslage aus A1

`A1` liefert an `B`:

- den letzten gueltigen Zustand vor dem Grenzschritt
- den festen `=`-Anker
- die aktive Potenzschale
- ihre Basis
- ihren Exponenteninhalt
- alle unveraenderten Durchreichespuren

Wichtig:

- der komplexe Exponent ist in `A1` eine geschlossene Schale
- diese Schale gilt in `A1` als genau ein algebraischer Baustein
- ihre Innenatome werden in `A1` nicht freigelegt

## Zielvorgabe aus A2

`A2` liefert an `B` kein weiteres Rechnen,
sondern nur die Geometrie der ersten Zielzeile nach dem Wechsel.

`landing_profile` beantwortet nur:

```text
Wie muss die erste A2-Zeile aussehen,
damit danach ohne zweiten Positionssprung weitergerechnet werden kann?
```

## Harte Prinzipien

### 1. Spaltentreue ist Standard

Alles ausser dem geoeffneten Exponenten
behaelt seine Spur.

Das gilt insbesondere fuer:

- den `=`-Anker
- die durchgereichte Gegenseite
- passive Schalen,
  die durch `B` nicht geoeffnet werden

### 2. Der Bruch der Spaltentreue passiert nur einmal

Die einzige zulaessige kontrollierte Abweichung ist:

- der Exponenteninhalt verlaesst den Exponentenraum
  und wird als normaler Term gesetzt

Diese Neuverteilung findet genau im B-Schritt statt.

Boundary-Zeile und Landing-Zeile sind deshalb als ganze Zeilen
ausdruecklich **nicht** spaltentreu zueinander.
Das ist keine Renderer-Ausnahme,
sondern die eine funktionale Neuverteilung,
fuer die `B` zustaendig ist.

Dabei gilt zwingend:

- die Boundary-Zeile zeigt Basis und Exponent noch in ihrer vollstaendigen `POWER`-Geometrie
- in der Boundary-Zeile ist der gesamte komplexe Exponent genau **eine** geschlossene
  Termspur beziehungsweise genau **eine aeussere funktionale Spalte**
- die von P4 gelieferten inneren Inhalts- und Schalenzellen bleiben innerhalb dieser
  einen Exponentenspur vollstaendig erhalten; sie sind noch keine normalen A2-Spuren
- mit der Landing-Zeile enden die alten Basis- und Exponentenslots
- erst beim Uebergang in die Landing-Zeile wird diese eine Exponentenspur aufgefaltet
- der geoeffnete Exponenteninhalt erhaelt dort auf der normalen Achse eine neue,
  kompakte und streng geordnete Folge von `term_slots`
- jede sichtbare, diskret spaltentragende P4-Zelle des Exponenten erhaelt genau einen
  eigenen `term_slot`; dazu gehoeren Inhaltsatome, Operatoratome und explizite
  Schalenzellen wie Klammern oder die Zellen einer inneren `POWER`-Schale
- Spannprimitiven wie Bruchstriche behalten ihre von P4 gelieferte Schalen-Spannweite;
  B erfindet fuer sie weder Textzellen noch Ersatzspalten
- bei einer mehrspaltigen P4-Inhaltszelle sind `col`, `colStart` und `colEnd`
  drei getrennte Vertragswerte: `col` bleibt die Identitaetsspur, Start und Ende
  bleiben die Zellgrenzen
- B bildet beim Handoff Identitaetsspur und beide Zellgrenzen jeweils ueber
  passende Quell-/Zielatome ab; es darf `col` nicht aus der Mitte der Zellspanne
  neu berechnen
- `collectionRanges` und `collectionAlignmentRanges` werden mit derselben
  exakten Spaltenabbildung transportiert; B zentriert keinen Bruch neu
- Anzahl und Reihenfolge der `term_slots` muessen daher exakt der kanonischen
  atomaren Exponentenfolge entsprechen; B darf weder Atome buendeln noch Slots auffuellen
- eine alte Hochstellungs- oder Basisspalte darf in der Landing-Zeile keinen Leerraum reservieren
- eine neue Landing- oder A2-Spalte darf umgekehrt in keiner Boundary- oder
  frueheren A1-Zeile Breite reservieren
- die erste A2-Zeile uebernimmt genau diese Landing-Slots
- alle spaeteren A2-Zeilen transportieren die ueberlebenden Termspuren von dort aus weiter

Die Grenzkennung ist deshalb Pflichtdatum jeder zusammengesetzten
Worksheet-Projektionszeile:

```text
A1-Zeilen einschliesslich Boundary -> processSpaceId = a1
B-Landing und alle A2-Zeilen       -> processSpaceId = a2
```

`B` besitzt den Wechsel, aber keinen dritten dauerhaft positionstreuen
Spaltenraum: Seine Landing-Zeile ist zugleich die von A2 unveraendert zu
uebernehmende Startgeometrie. Ein physischer Slotschluessel lautet nach der
Grenze `processSpaceId + col`. Nur der Gleichheitsanker wird zwischen den
beiden Breitenprofilen gekoppelt.

Beispiel:

```text
Boundary-Zeile:  2^(2*x-1)  -> Exponent `2*x-1` = eine aeussere Exponentenspur
Landing-Zeile:   lg(...) = 2*x-1
                            | | | | |
                            2 * x - 1 = fuenf normale Termspuren
```

Die eine aeussere Boundary-Spur und die Zahl ihrer inneren P4-Zellen sind zwei
verschiedene Ebenen. B darf die alte aeussere Spalte nicht fortschreiben; es verwendet
die inneren Zellen nur als geordnete Quelle fuer die neuen normalen Landing-Slots.

Nicht spaltentreu bedeutet hier nicht beliebig:
Der `=`-Anker und die unveraenderte Durchreicheseite bleiben stabil.
Nur der aus der `POWER`-Schale geloeste Inhalt wechselt einmal kontrolliert
vom Exponentenraum in den normalen A2-Termraum.

Nach dieser Landung besitzt A2 die normale Termstruktur.
Eine spaetere A2-Operation wie Quadrieren ist kein zweiter Bridge-B-Schritt
und darf die bereits verbrauchte Boundary nicht erneut ausloesen.

### 3. Basis und inverse Funktion gehoeren zu derselben Geschichte

Wenn `B^f(x)` oder `e^f(x)` gebrochen wird,
dann wird die Basisgeschichte genau einmal in ihre inverse Funktionsgeschichte ueberfuehrt:

- `e -> ln`
- Basis `2 -> lg`
- Basis `10 -> log`
- jede andere Basis `B -> log_B`

`log_B` bezeichnet dabei nur die gemeinsame semantische Geschichte. Die
Landing-Projektion bleibt atomar:

- Funktionsname `log`
- optionaler vollstaendiger Basisblock `B`
- linke Funktionsklammer
- vollstaendige Kindgeometrie
- rechte Funktionsklammer

Die Basis darf weder in den Namenstext eingebaut noch ein zweites Mal ausgegeben
werden. Name, Basis und beide Klammern werden samt Spalten und Spannen exakt aus
der an den Gleichheitsanker ausgerichteten ersten A2-Projektionszeile uebernommen.
B darf ihre Lage nicht aus `carryStart`, `carryEnd` oder einer Textbreite ableiten.
Ist die Basis selbst mehratomig oder geschachtelt, uebernimmt B den gesamten von
P4 ausgewiesenen `baseContent`-Block einschliesslich seiner Operatoratome und
inneren Huelleprimitive. Die semantische Uebereinstimmung des inversen
Funktionskopfs wird gegen die `FUNCTION` der A2-Theoriezeile geprueft, niemals
durch Aneinanderhaengen sichtbarer Projektionsatomtexte. Ein Diagnosekopf wie
`log_(a+1)` ist keine Quelle fuer Basiszellen.

### 4. Links waechst die inverse Funktion nach links

Wenn die inverse Funktion auf der linken Seite entsteht,
dann baut sie sich links vor den vorhandenen Altinhalt.

Das bedeutet:

- der bestehende Inhalt links wird nicht nach rechts geschoben
- neue Huelle und neuer Funktionskopf wachsen nach aussen links

### 5. Rechts waechst neuer Zusatz nach rechts

Wenn auf der rechten Seite neue passive Teile entstehen,
dann werden sie rechts ausserhalb des bestehenden Bandes angehaengt.

### 6. Additive Ruecktransporte nach links werden vorne angebaut

Wenn in `A2` ein Additionsterm von rechts nach links umgestellt wird,
dann wird er links vorne angebaut.

Beispielhaft:

```text
ln(...) = 2x - 1
```

wird zu

```text
1 + ln(...) = 2x
```

nicht zu einer spaeter hineingeschobenen Variante im Inneren des alten linken Bandes.

### 7. B fuehrt keine Renderer-Entscheidungen aus

`B` entscheidet nicht:

- ob ein Malpunkt spaeter sichtbar bleibt
- wie eng Spalten optisch gezogen werden
- welche Linie wie dick ist

Das ist Renderer-Sache.

`B` liefert nur die Orts- und Shell-Wahrheit.

### 8. Nach B darf kein zweiter Startsprung mehr noetig sein

Die Landing-Zeile von `B`
muss bereits der ersten echten Startlage von `A2` entsprechen.

Nicht zulaessig ist:

- erst in `B` grob landen
- und dann in der ersten `A2`-Zeile noch einmal umsetzen
- alte `POWER`-Slots im A2-Raster als leere Abstandshalter weiterzufuehren

### 9. Fortsetzungsgeometrie wird nicht rekonstruiert

Alle A2-Fortsetzungszeilen uebernehmen die von P4 gelieferte funktionale
Schalen- und Bruchgeometrie. B darf insbesondere Bruchstriche, Zaehler,
Nenner oder verschachtelte Schalen nicht anhand benachbarter Teilzeilen
neu zentrieren oder in ihrer Spannweite veraendern.

Zulaessig ist nur die durch den Vertrag bestimmte einmalige Umsetzung der
Exponentenspur in die atomaren Landing-Slots sowie die daraus folgende
starre Spaltenverschiebung. Eine Geometrie-Reparatur in B oder im Renderer
ist verboten.

### 10. Durchgereichte Schalen bleiben vollstaendig

Die unveraenderte Durchreicheseite besteht nicht nur aus sichtbaren Textzellen.
Zu ihr gehoeren ebenso alle von P4 gelieferten strukturellen Spannprimitive und
Schalen-Spans, insbesondere `fraction_line` und `root_overbar`.

Fuer die exklusive Landing-Zeile gilt deshalb zwingend:

- ein strukturelles Primitiv darf nicht wegen eines leeren Textwerts verworfen werden
- Zaehler, Bruchstrich und Nenner einer durchgereichten `DIVISION` kommen genau einmal an
- die neue inverse `FUNCTION` umfasst die vollstaendige durchgereichte Kindgeometrie
- alle Landing-Atome und `shellSpans` verwenden dasselbe zeilenlokale Koordinatensystem
- bei einem Wechsel des Zeilenrasters wird die komplette Kindschale starr umgesetzt;
  einzelne Textatome duerfen nicht getrennt von ihrem Spannprimitiv verschoben werden
- die Spannen jeder auf die Termseite uebernommenen inneren Schale werden exakt ueber
  dieselbe eindeutige Quellzelle-zu-`term_slot`-Zuordnung auf das kompakte Landing-Raster
  abgebildet; ihre alten Boundary-Spalten duerfen nicht im `shellSpan` stehen bleiben
- jede Spannengrenze muss auf eine tatsaechlich zugeordnete Grenzzelle zurueckgehen;
  B darf fehlende Grenzen weder interpolieren noch aus Nachbarzellen schaetzen

B darf weder einen fehlenden Bruchstrich aus Zaehler und Nenner rekonstruieren
noch den Klammerumfang aus sichtbaren Nachbarzellen ableiten. Fehlt eine dieser
P4-Angaben, muss der Vertragsfehler sichtbar bleiben.

## Nicht erlaubt

- hybride Zeilen,
  die gleichzeitig B-Umbau und A2-Fortsetzung sind
- erneutes Freigeben schon freigelegter Exponenteninhalte
- nachtraegliches Umsortieren der Durchreichespuren
- lokale Reparaturen im Renderer,
  um eine falsche B-Landung zu kaschieren

## Nachweisraum

Dieser Vertrag gilt nur dann als echt,
wenn alle drei Ebenen vorhanden sind:

1. Doku
2. eigener Codepfad
3. gruener Testnachweis

Aktive Beweis-Tests dazu sind derzeit mindestens:

- `tests/active/bridge_b_transition_step.test.js`
- `tests/active/bridge_b_position_contract.test.js`
- `tests/active/bridge_process_space_column_transition.test.js`
- `tests/active/genesis_runtime_bridge.test.js`
- `tests/active/bridge_b_nested_exponent_regression.test.js`

## Kurzform

```text
A1 stoppt an der Potenzschale.
B bricht genau diese Schale.
A2 sieht keinen komplexen Exponenten mehr.
```

Und genauso wichtig:

```text
B loest nichts davor.
B loest nichts danach.
```
