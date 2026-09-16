# P4 Contract: Projektion

## Zweck
`P4_Projektion` ist der Bereich, in dem Theorie in positionstreue Sichtbarkeit ueberfuehrt wird.
P4 ist normativ kein Ein-Schritt-Marker, sondern ein Zwei-Durchlauf-Modul.

P4 gehoert damit direkt zum Herz des Gleichungsloesers:
Ohne P4 gibt es keine belastbare Kernschnittstelle fuer Film, Arbeitsblatt oder andere Ausgabeformen.

## Oeffentliche Rollen
### PreFlight
- betrachtet die gesamte Folge der Theorie-Zeilen
- analysiert globale Spalten, Breiten und Anker
- erzeugt eine Layoutmatrix, damit spaeter nichts horizontal nachrueckt

### Setzlauf
- nimmt Theorie-Zustaende plus Layoutmatrix
- setzt `row` und `col`
- markiert `GHOST_HOLE`, `EMERGED` und andere sichtbare Projektionszustaende

## Aktuelle APIs
- `generateGlobalLayout(theoryRows)`
- `projectToGrid(atoms, layoutPlan, rowIndex)`
- `process(theoryRows, options?)`

## Interne Orchestrierung
- `index.js` ist nur die Integrationsgrenze nach aussen.
- `projectionEngine.js` beantwortet genau eine Frage: welcher Projektionspfad laeuft.
- `projectionRowUtils.js` normalisiert Theorie-Zeilen und gemeinsame Zeilenhilfen.
- `classicProjectionPipeline.js` fuehrt nur den klassischen Zwei-Durchlauf aus.
- die Neukern-Bruecke bleibt in `LegacyProjectionAdapter.js` und darf keine klassische Layoutlogik doppelt beantworten.

### Prozessoptionen
- `options.engine?`
- `classic`: produktiver Standardpfad mit heutigem Zwei-Durchlauf
- `neukern_adapter`: opt-in Bruecke, die den neuen P4-Neukern ausfuehrt und sein Ergebnis auf den bisherigen Projektionsvertrag abbildet

## Verantwortung
- Positionstreue relativ zum Gleichheitsanker sichern
- globale Spaltenlogik ueber mehrere Zeilen hinweg vorbereiten
- sichtbare Loch- und Befreiungsmarker setzen
- Export- und Darstellungsdaten lesbar machen
- dieselben Atome fuer Animation, Diagnose und statische Ausgabe referenzierbar halten

## Verboten
- Eingabe erneut parsen
- mathematische Inversionen ausfuehren
- Strategien bestimmen
- IDs neu erzeugen
- Ausgabeprofile durch lokale Umdeutung der Kernwahrheit simulieren

## Ist-Hinweise
- `generateGlobalLayout(theoryRows)` berechnet jetzt eine echte globale Anchor-/Spaltenmatrix ueber alle Theorie-Zeilen.
- `process(theoryRows)` bleibt ohne Optionen beim produktiven Zwei-Durchlauf: PreFlight zuerst, Setzlauf danach.
- `process(theoryRows, { engine: "neukern_adapter" })` ist jetzt als kontrollierte Bruecke in den neuen P4-Strang eingehangen.
- `LochLogik.berechneGrid()` setzt Marker wie `GHOST_HOLE` und `EMERGED` vor dem Setzlauf.
- versteckte `GROUP`-Schalen der aktiven Familie `group_release` bleiben als `GHOST_HOLE` sichtbar, waehrend freigelegte Gruppeninhalte als `EMERGED` lesbar bleiben.
- versteckte `ROOT`- und `POWER`-Schalen der aktiven Familie `root_power` bleiben positioniert sichtbar.
- versteckte Quellen der Familien `negative_sign_release`, `addition_release`, `subtraction_release`, `subtrahend_release`, `fraction_birth`, `fraction_collapse`, `trig_inverse` und `inverse_trig` bleiben ebenfalls als `GHOST_HOLE` lesbar.
- generierte inverse `NEGATION`-, `DIVISION`-, `MULTIPLICATION`-, `ADDITION`-, `SUBTRACTION`-, `FUNCTION`-, `ROOT`- und `POWER`-Schalen werden aktuell als `INVERSE_SHELL` markiert.
- sichtbare `DIVISION`-Schalen werden im Setzlauf topologisch in Zaehler, Bruchstrich und Nenner aufgefaechert, ohne den Shell-Anker zu verlieren.
- sobald in einer Gleichungszeile ein sichtbarer Bruch steht, liegen freistehende Gleichungsteile derselben Zeile auf der Achse des Bruchstrichs statt auf der Hoehe des Zaehlertexts.
- zusammengesetzte Zaehler und Nenner behalten dabei ihre internen Teilspalten; der Bruchstrich traegt dafuer bei Bedarf eine explizite Spannweite ueber `colStart` und `colEnd`.
- jede `projectionRow` bildet jetzt zusaetzlich einen expliziten Projektionsblock mit `localRowCount`, `axisLocalRow`, `stackRowStart` und `stackRowEnd`.
- projizierte Atome tragen neben ihrer bisherigen P4-Zeile jetzt auch `absoluteRow`, `localRow` und `stackedRow`.
- `stackedRow` dient Verbrauchern wie Arbeitsblatt oder Diagnose dazu, die Projektionsbloecke sequenziell untereinander zu setzen, ohne dass die Huelle globale Zeilen selbst raten muss.
- sichtbare inverse `ADDITION`- und `SUBTRACTION`-Schalen werden im Setzlauf linear in Inhalt, Operator und passiven Ausdruck aufgefaltet.
- projektionserweiterte Teilatome wie `numerator`, `denominator`, `inverse_content` oder `inverse_passive` tragen jetzt `sourceAtomId` zur Rueckbindung auf das Ursprungsatom.
- `PreFlightEngine.js` und `Regelwerk.js` sind jetzt produktiv im Orchestrator eingehangen.
