# Export Model: Kanonische Ausgabe fuer Film, Arbeitsblatt und weitere Verbraucher

Status: normativ-operativer Zwischenstand  
Stand: 6. April 2026

## Zweck
Dieses Dokument legt fest, was der Gleichungsloeser nach aussen liefern muss,
damit andere Systeme mit denselben Daten arbeiten koennen.

Export bedeutet hier nicht Endbild speichern.
Export bedeutet:
Die atomare Gleichung, ihre Umbaugeschichte und ihre positionstreue Projektion
in einer wiederverwendbaren Form bereitstellen.

## Grundsatz
Das Exportmodell ist eine abgeleitete, aber kanonisch definierte Sicht auf den Solve-Kern.
Es darf keine zweite Wahrheit neben dem Kern erzeugen.

Im heutigen Projektauftrag ist dieses Exportmodell zugleich die erste verbindliche systeminterne Ausgabe des Solvers.
Bevor es eine schoene Nutzeransicht gibt, muss der Kern bereits zeilenweise, atomar und positionstreu nach aussen lesbar sein.

Wichtiger Rahmen des heutigen Kerns:
- der produktive Solver arbeitet derzeit bewusst mit genau einer Zielvariable pro Solve-Lauf
- der Name dieser Zielvariable wird als Teil des Exports mitgefuehrt
- Film, Arbeitsblatt und Diagnose konsumieren dieselbe atomare Solve-Geschichte
- Ausgabeprofile duerfen gewichten oder ausblenden, aber nicht die Kernwahrheit umschreiben

## Mindestinhalt des Exportmodells
### 1. Eingabeblock
- urspruengliche Eingabe
- optionale Metadaten zum Solve-Lauf

### 2. Atomregister
- alle Theorie-Atome mit stabilen IDs, auch in verschachtelten Schalenraeumen
- Typ, Wert, Schalenzuordnung, Sichtbarkeitsflags
- generierte inverse Schalen mit Herkunftsmetadaten wie `originTargetId`, `originPassiveExpressionId`, `generatedByFamily` und `generatedByAction`
- Beziehung zum Gleichheitsanker oder anderen Strukturankern

### 3. Projektionsregister und Trace-Pfad
- alle projizierten Atome inklusive topologischer Teilatome mit stabilen Projektions-IDs
- Rueckbindung ueber `sourceAtomId` auf das Ursprungsatom
- atomarer `traceIndex`, der Theorie- und Projektionsspur pro ID zusammenhaelt

### 4. Theorie-Zeilenfolge
- Reihenfolge der algebraischen Zustaende inklusive Initialzeile
- pro Zeile die atomare Struktur
- pro Zeile die Logik, warum diese Zeile entstanden ist

### 5. Umbau-Logik
- Strategieentscheidung
- betroffene IDs
- Art des Umbaus
- optional menschenlesbares Label

### 6. Layout- und Projektionsblock
- globale Spaltenmatrix
- Positionen pro Zeile und Atom
- `row`, `col`, Marker wie `GHOST_HOLE` oder `EMERGED`
- pro Projektionsblock auch `localRowCount`, `axisLocalRow`, `stackRowStart`, `stackRowEnd`
- pro projiziertem Atom auch `absoluteRow`, `localRow` und `stackedRow`
- projektionsabgeleitete Topologie-Atome wie `projectionRole: "numerator" | "fraction_line" | "denominator"`
- inverse lineare Schalen koennen zusaetzlich Rollen wie `inverse_content`, `inverse_operator` und `inverse_passive` tragen
- sichtbare und unsichtbare Elemente bleiben nachvollziehbar

### 7. Ausgabeprofile
Das Exportmodell kann unterschiedliche Ausgabeprofile bedienen:
- `film`
- `arbeitsblatt`
- `diagnose`
- spaeter weitere

Wichtig:
Diese Profile waehlen aus oder gewichten anders.
Sie veraendern nicht die zugrundeliegenden Atome oder die Umbaugeschichte.

## Aktueller produktiver Zwischenstand
`core/index.js` liefert heute bereits:
```js
{
  eingabe,
  finaleStruktur,
  schritte,
  exportData: {
    eingabe,
    atomRegister,
    projectionAtomRegister,
    traceIndex,
    theoryRows,
    projectionRows,
    layoutPlan,
    exportProfiles
  }
}
```

Wichtige Ehrlichkeit:
- `atomRegister`, `theoryRows`, `projectionRows` und `layoutPlan` sind produktiv vorhanden
- `atomRegister` ist jetzt rekursiv und enthaelt auch verschachtelte Ausdrucksatome aus `content`, `numerator`, `denominator`, `factor` und `passive`.
- `projectionAtomRegister` enthaelt jetzt auch topologische Teilatome wie Bruchstriche, Zaehler-/Nenner- und inverse Rollen.
- `traceIndex` bindet Ursprungsatome und Projektion ueber `sourceAtomId` zusammen und staerkt damit Film- und Diagnoseverbraucher.
- der Zwei-Durchlauf ist fuer die aktive Kernspur eingezogen
- `projectionRows` exportieren jetzt echte lokale Projektionsbloecke, damit Verbraucher nicht mehr selbst raten muessen, welche Teilzeile Zaehlerebene, Achse oder Nenner ist
- `layoutPlan.stackedVisualRowCount` beschreibt die voll gestapelte Sequenzhoehe aller Projektionsbloecke fuer lineare Ausgaben wie Arbeitsblatt oder Diagnose
- die aktive Strukturfreigabe `group_release` exportiert versteckte `GROUP`-Schalen und freigelegte Inhaltsatome mit derselben ID-Spur
- inverse `root_power`-Schalen werden mit stabiler generierter ID und Herkunftsmetadaten exportiert
- die aktiven Bruchrichtungen `fraction_birth` und `fraction_collapse` exportieren inverse `DIVISION`- beziehungsweise `MULTIPLICATION`-Schalen mit Herkunftsmetadaten fuer den verschobenen passiven Ausdruck
- `negative_sign_release` exportiert inverse `NEGATION`-Schalen mit `originTargetId`, `targetExpressionIds` und derselben ID-Spur fuer den freigelegten Inhaltsausdruck
- `subtrahend_release` exportiert zugleich eine aktive Zwischen-`NEGATION` und eine inverse `SUBTRACTION` mit Herkunftsmetadaten fuer den verschobenen Minuend-Ausdruck
- die aktiven additiven Richtungen `addition_release` und `subtraction_release` exportieren inverse `SUBTRACTION`- beziehungsweise `ADDITION`-Schalen mit Herkunftsmetadaten fuer den verschobenen passiven Ausdruck
- `trig_inverse` exportiert inverse `FUNCTION`-Schalen mit `originSourceName`, `inverseName` und derselben ID-Spur fuer das freigelegte Funktionsargument
- `inverse_trig` exportiert direkte trigonometrische `FUNCTION`-Schalen mit denselben Herkunftsmetadaten und derselben ID-Spur fuer das freigelegte Funktionsargument
- die Layoutmatrix ist noch bewusst einfach und noch nicht auf spaeter schwere Topologien aller kuenftigen Familien erweitert

## Beispiel-Zielbild
```js
{
  eingabe: "sqrt(x^2)=5",
  theoryRows: [
    {
      rowId: "theory-0",
      atoms: [...],
      strategy: null
    },
    {
      rowId: "theory-1",
      atoms: [...],
      strategy: {
        family: "root_power",
        action: "INVERT_TO_POWER",
        targetId: "shell-left-1",
        label: "Wurzel knacken"
      }
    }
  ],
  layoutPlan: {
    mode: "two_pass_preflight",
    anchorColumn: 2,
    columnCount: 4,
    rowCount: 2
  },
  projectionRows: [
    {
      rowId: "projection-0",
      positionedAtoms: [...]
    },
    {
      rowId: "projection-1",
      positionedAtoms: [...]
    }
  ],
  exportProfiles: {
    film: {...},
    arbeitsblatt: {...},
    diagnose: {...}
  }
}
```

## Verbrauchsregeln
### Filmgenerator
Ein Filmgenerator darf:
- dieselben Atome ueber mehrere Zeilen hinweg verfolgen
- Bewegungen, Auftauchen und Verschwinden animieren
- Strategieinformationen in Animation oder Sprecherlogik uebersetzen
- heute bereits `projectionRows`, `projectionAtomRegister` und `traceIndex` gemeinsam nutzen, um dieselben Atome ueber Theorie und Projektion hinweg zu verfolgen

Ein Filmgenerator darf nicht:
- neue IDs erfinden
- Umbaugeschichte umschreiben
- fehlende Positionen raten, wenn der Kern sie liefern muss

### Arbeitsblattgenerator
Ein Arbeitsblattgenerator darf:
- Zeilen oder Hinweise ausblenden
- Teilaufgaben aus demselben Material erzeugen
- fokussierte didaktische Ausschnitte bilden

Ein Arbeitsblattgenerator darf nicht:
- die kanonische atomare Struktur veraendern
- heimlich Atome zusammenziehen oder neu nummerieren
- die logische Herkunft eines Schritts verlieren

## Architekturfolgen
- Export ist eine offizielle API des Kerns.
- Positionstreue ist Exportvoraussetzung, nicht nur UI-Verhalten.
- Stabile IDs sind Pflicht, weil Film und Arbeitsblatt dieselben Atome referenzieren.
- Generierte inverse Schalen brauchen ebenfalls stabile IDs und Herkunftsmetadaten.
- Jede kuenftige Ausgabeform ist ein Adapter auf das Exportmodell.
