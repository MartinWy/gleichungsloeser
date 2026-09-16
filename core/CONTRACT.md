# Core Contract

Hinweis:
Dieses Dokument beschreibt den bisherigen Core-Vertrag auf Wurzelebene.
Die normative Fuehrung fuer den echten Tabula-rasa-Neustart liegt ab jetzt unter:

- `core/GenesisRuntime/`
- `docs/Genesis/Neustart_2026-07-28/`

## Oeffentliche API
`GenesisCore.solve(equation, options?)`

## Eingabe
- `equation`: String
- `options.targetVariable?`: optionale Zielvariable; bei genau einer Variablen in der Gleichung wird sie sonst automatisch erkannt
- `options.runtimeEngine?`: optionaler Laufzeitpfad; erlaubt aktuell `genesis_runtime` als opt-in Bruecke in den neuen Tabula-rasa-Kern
- `options.projectionEngine?`: optionaler Projektionspfad; erlaubt aktuell `classic` (Standard) oder `neukern_adapter` (opt-in Bruecke zum neuen P4-Kern)
- `options.rightSideFactorPlacement?`: optionale Policy fuer neu entstehende Faktoren auf der rechten Gleichungsseite; erlaubt aktuell `suffix` (`asin(5)*2`) oder `prefix` (`2*asin(5)`)

## Ausgabe
```js
{
  eingabe: string,
  targetVariable: string | null,
  finaleStruktur: Array,
  schritte: Array<{ strategie: Object, struktur: Array }>,
  exportData: {
    eingabe: string,
    targetVariable: string | null,
    atomRegister: Array,
    projectionAtomRegister: Array,
    traceIndex: Object,
    theoryRows: Array,
    projectionRows: Array,
    layoutPlan: Object,
    exportProfiles: Object
  }
}
```

Im Fehlerfall aktuell:
```js
{ fehler: string }
```

## Verantwortung
- Phasen in der richtigen Reihenfolge aufrufen
- zuerst reine Theorie-Zeilen erzeugen
- danach den produktiven Zwei-Durchlauf von `P4` ausloesen
- History pro Schritt ablegen
- eine kanonische Exportsicht auf dieselbe Kernwahrheit bereitstellen
- `exportData` als systeminterne Pflichtausgabe des Kerns stabil halten, auch wenn eine spaetere Nutzeransicht anders gestaltet wird

## Interne Orchestrierung
- `core/index.js` fuehrt nur den Solve-Ablauf, Zielvariablenlogik und Fehlervertrag.
- `core/solveOptions.js` normalisiert ausschliesslich die Solve-Optionen.
- `core/solveTargeting.js` beantwortet ausschliesslich Zielvariablen- und Seitenfragen.
- `core/atomTraversal.js` beantwortet nur rekursiven Baumdurchlauf ueber Kernatome.
- `core/solveProjectionOutput.js` ist die einzige Bruecke von Theorie-History zu `theoryRows`, `P4`-Projektion und `exportData`.
- `core/clone.js` kapselt das kanonische Tiefenklonen fuer Kernmodule.

## Erlaubte Abhaengigkeiten
- `P1_Eingabe/Regelwerk.js`
- `P2_Strategie_Analyse/PfadFinder.js`
- `P3_Umformung/Regelwerk.js`
- `P4_Projektion/index.js`

## Verboten
- neue mathematische Regeln im Orchestrator verstecken
- UI-spezifische Logik in den produktiven Solve-Flow ziehen
- eine zweite inhaltliche Wahrheit neben der Kernstruktur erfinden

## Ist-Stand
- Das Schrittlimit ist aktuell fest auf `10` gesetzt.
- Es wird genau die Gleichungsseite analysiert, auf der die aktiv gewaehlte Zielvariable liegt.
- Der produktive Kern arbeitet pro Solve-Lauf mit genau einer Zielvariable, deren Name frei waehlbar ist.
- Der produktive Kern verarbeitet nur Gleichungen, in denen die Zielvariable im Ausgangsausdruck genau einmal vorkommt.
- Alphabetische Bezeichner wie `x`, `a`, `m` oder `alpha` koennen als Zielvariable dienen, solange sie in der Gleichung vorkommen.
- Wenn in der Gleichung genau eine Variable vorkommt, wird sie automatisch als Zielvariable verwendet.
- Wenn mehrere Variablen vorkommen, muss `options.targetVariable` die gesuchte Variable explizit benennen.
- Wenn `options.targetVariable` angegeben ist, aber in der Gleichung nicht vorkommt, liefert der Kern einen klaren Fehler.
- `options.rightSideFactorPlacement` aendert nur die Reihenfolge neu erzeugter Faktoren auf der rechten Gleichungsseite; links bleibt die Faktorstellung unveraendert.
- `options.runtimeEngine` steuert den Solve-Laufpfad vor jeder klassischen P1-bis-P4-Orchestrierung.
- Ohne `options.runtimeEngine` bleibt der bisherige Kern der produktive Standardpfad.
- Mit `options.runtimeEngine = "genesis_runtime"` nutzt `solve()` die opt-in Bruecke in den neuen Tabula-rasa-Kern und adaptiert dessen Ergebnis auf den bisherigen Exportvertrag.
- Unbekannte `options.runtimeEngine`-Werte liefern einen klaren Fehler und werden nicht stillschweigend ignoriert.
- `options.projectionEngine` steuert nur den P4-Projektionspfad; P1 bis P3 bleiben unveraendert dieselbe semantische Kernwahrheit.
- Ohne `options.projectionEngine` bleibt `classic` der produktive Standardpfad.
- Mehrfachvorkommen derselben Zielvariable, auch ueber beide Gleichungsseiten verteilt, gehoeren nicht zum aktiven Kern.
- Die initialen Basis-IDs aus `P1` sind fuer denselben normalisierten Eingabestring jetzt deterministisch.
- Der aktive Familienrahmen umfasst aktuell `group_release`, `negative_sign_release`, `root_power`, `fraction_birth`, `fraction_denominator_release`, `fraction_collapse`, `addition_release`, `subtraction_release`, `subtrahend_release`, `trig_inverse` und `inverse_trig`.
- Fehler werden als Objekt statt per Throw zurueckgegeben.
- `exportData.layoutPlan` ist kein Platzhalter mehr, sondern eine produktiv erzeugte Zwei-Pass-Layoutbeschreibung.
- `exportData` enthaelt jetzt ein rekursives Theorie-Register, ein Projektionsregister und einen atomaren `traceIndex` fuer Film und Diagnose.
- `exportData` ist im heutigen Projektstand bereits die verbindliche systeminterne Ausgabe, ueber die zeilenweise Theorie, Projektion und Positionstreue pruefbar bleiben.
