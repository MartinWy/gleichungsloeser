# State Model: Datenformen und Invarianten

Status: operativ  
Stand: 6. April 2026

Begriffliche Grundlage:
- fuer die verbindliche Sprache rund um `Theoriezeile`, `Projektionsblock`, `Teilzeile` und `stackedRow` siehe [BEGRIFFSBLATT_PROJEKTION.md](/Users/martinwyrwich/Developer/math-projects/Gleichungslöser/docs/Architecture/BEGRIFFSBLATT_PROJEKTION.md)

## 1. Eingabe
```js
"sqrt(x^2)=5"
```

Produktiver Rahmen heute:
- genau eine Zielvariable pro Solve-Lauf
- der Name dieser Zielvariable ist frei waehlbar
- bei genau einer Variablen in der Gleichung wird sie automatisch verwendet
- bei mehreren Variablen muss die Zielvariable explizit benannt werden
- keine Mehrzielvariablenlogik im Kern
- komplexere Variablenwelten gehoeren in andockende Projekte

## 2. Strukturzustand nach P1
```js
[
  {
    id: "shell-root-...",
    type: "ROOT",
    isVisible: true,
    content: [...]
  },
  {
    id: "atom-anchor-...",
    value: "=",
    type: "ANCHOR",
    isVisible: true
  }
]
```

Wichtig:
- IDs muessen innerhalb eines Solve-Laufs ueber alle Zeilen hinweg stabil bleiben.
- Diese IDs muessen exportfaehig sein, damit spaetere Systeme dieselben Atome weiterverwenden koennen.
- Derselbe normalisierte Eingabestring liefert im aktiven Kern jetzt denselben initialen ID-Satz.
- Die atomare Struktur ist die kanonische Grundwahrheit des Systems.

## 3. Strategiezustand nach P2
Beispiel `group_release`:
```js
{
  typ: "STRATEGY_DECISION",
  family: "group_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  sourceType: "GROUP",
  inverseType: "EXPLICIT_CONTENT",
  action: "RELEASE_GROUP_CONTENT",
  label: "Gruppe freilegen",
  argumentScope: "active_side_only"
}
```

Beispiel `root_power`:
```js
{
  typ: "STRATEGY_DECISION",
  family: "root_power",
  targetId: "...",
  sourceType: "ROOT",
  inverseType: "POWER",
  action: "INVERT_TO_POWER",
  label: "Wurzel knacken"
}
```

Beispiel `addition_release`:
```js
{
  typ: "STRATEGY_DECISION",
  family: "addition_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  passiveExpressionId: "...",
  passiveExpressionIds: ["..."],
  operatorId: "...",
  sourceType: "ADDITION",
  inverseType: "SUBTRACTION",
  action: "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION",
  label: "Ausdruck subtrahieren"
}
```

Beispiel `negative_sign_release`:
```js
{
  typ: "STRATEGY_DECISION",
  family: "negative_sign_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  sourceType: "NEGATION",
  inverseType: "NEGATION",
  action: "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE",
  label: "Vorzeichen umklappen"
}
```

## 4. Theorie-Zustand nach P3
Merkmale:
- die ausgewaehlte Schale auf der aktiven Gleichungsseite kann auf `isVisible: false` gesetzt sein
- freigelegte Inhalte koennen `isBefreit: true` tragen
- auf der Gegenseite kann eine inverse neue Schale angehaengt werden
- inverse Schalen koennen `originTargetId`, `originPassiveExpressionId`, `generatedByFamily` und `generatedByAction` tragen
- die IDs der uebrigen Atome bleiben erhalten
- die Zeilenfolge bildet die kanonische Umbaugeschichte des Solve-Laufs

## 5. P4 ist zweigeteilt
### 5.1 PreFlight-Zustand
Der PreFlight betrachtet die gesamte Zeilenfolge und baut eine globale Matrix, damit spaeter nichts horizontal nachrueckt.

Beispiel:
```js
{
  mode: "two_pass_preflight",
  anchorColumn: 2,
  columnCount: 4,
  rowCount: 2,
  leftSpan: 2,
  rightSpan: 1,
  rows: [...]
}
```

### 5.2 Projektionszustand / Setzlauf
Der Setzlauf versieht Atome mit sichtbaren Positionen und Markern.

Beispiel:
```js
{
  id: "atom-variable-...",
  row: 1,
  col: 1,
  isVisible: true,
  visualMode: "EMERGED"
}
```

## 6. Markerlogik
Aktiver Ist-Stand:
- versteckte `GROUP`-Schalen aktiver `group_release`-Schritte werden zu `visualMode: 'GHOST_HOLE'`
- versteckte `ROOT`-Schalen werden zu `visualMode: 'GHOST_HOLE'`
- versteckte `POWER`-Schalen werden ebenfalls zu `visualMode: 'GHOST_HOLE'`
- versteckte `NEGATION`-Schalen werden ebenfalls zu `visualMode: 'GHOST_HOLE'`
- freigelegte Elemente mit `isBefreit` werden zu `visualMode: 'EMERGED'`
- generierte inverse `NEGATION`-, `ADDITION`-, `SUBTRACTION`-, `ROOT`- und `POWER`-Schalen werden als `INVERSE_SHELL` markiert; `ADDITION` und `SUBTRACTION` werden dabei linear aufgefaechert
- `subtrahend_release` fuehrt dabei bewusst zwei sichtbare Shell-Spuren gleichzeitig: eine aktive `NEGATION` und eine inverse `SUBTRACTION`
- generierte inverse und direkte `FUNCTION`-Schalen aus den trigonometrischen Familien werden ebenfalls als `INVERSE_SHELL` markiert
- sichtbare `DIVISION`-Schalen werden topologisch als Zaehler, Bruchstrich und Nenner projiziert
- `projectToGrid(atoms, layoutPlan, rowIndex)` setzt produktiv `row` und `col`

## 7. Rueckgabeobjekt des Orchestrators
Aktueller Ist-Stand:
```js
{
  eingabe: "...",
  finaleStruktur: [...],
  schritte: [
    {
      strategie: {...},
      struktur: [...]
    }
  ],
  exportData: {
    eingabe: "...",
    atomRegister: [...],
    projectionAtomRegister: [...],
    traceIndex: {...},
    theoryRows: [...],
    projectionRows: [...],
    layoutPlan: {...},
    exportProfiles: {...}
  }
}
```

## 8. Exportzustand
Der Exportzustand ist keine zweite Wahrheit,
sondern die offiziell nach aussen gegebene Form derselben atomaren Solve-Geschichte.

Er enthaelt aktuell mindestens:
- stabile IDs
- rekursives Theorie-Atomregister inklusive verschachtelter Ausdrucksatome
- Projektions-Atomregister inklusive topologischer Teilatome
- `traceIndex` fuer die Rueckbindung von Theorie- und Projektionsspur
- Theorie-Zeilenfolge inklusive Initialzeile
- Strategie- und Umbauinformationen
- positionstreue Projektionsdaten aus dem Zwei-Durchlauf
- Ausgabeprofile fuer verschiedene Verbraucher

## 9. Invarianten
- Strukturveraenderung und Sichtbarkeitsveraenderung muessen explizit sein.
- `P2` darf `null` zurueckgeben, wenn kein weiterer Schritt identifiziert wird.
- Der produktive Kern arbeitet mit genau einer aktiv gewaehlten Zielvariable pro Solve-Lauf.
- Derselbe normalisierte Eingabestring muss denselben initialen ID-Satz erzeugen.
- Positionstreue ist relativ zum Gleichheitsanker invariant.
- Was sich algebraisch nicht aendert, darf sich horizontal nicht bewegen.
- Loecher (`GHOST_HOLE`) duerfen kein heimliches Nachruecken erlauben.
- Film- und Arbeitsblatt-Ausgaben duerfen keine neuen Atomidentitaeten erzeugen.
- Weglassungen fuer didaktische Ausgabeformen duerfen die kanonische Solve-Geschichte nicht ueberschreiben.

## 10. Offene Soll-Ist-Luecken
- Der deterministische P1-ID-Rahmen ist fuer den aktiven Ein-Zielvariablen-Kern eingezogen, aber noch nicht fuer alle kuenftigen Familien bewiesen.
- Der Zwei-Durchlauf ist fuer die aktive Kernspur produktiv eingezogen, aber die globale Layoutmatrix ist noch bewusst schlicht und noch nicht auf spaeter schwere Topologien aller Familien erweitert.
- Teile der alten Tests und Komponenten referenzieren fruehere Topologiepfade, obwohl ihre Fachidee weiter relevant ist.
