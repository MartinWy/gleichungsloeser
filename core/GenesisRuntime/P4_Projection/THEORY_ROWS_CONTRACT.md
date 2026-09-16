# P4-Teilmodul: Theoriezeilenaufbau

Status: Richtlinie, Code und fokussierter Standardtest vorhanden
Stand: 9. September 2026
Vertrag: `p4_theory_rows_v1`

## Aufgabe

`buildTheoryRows.js` baut aus dem bereits entschiedenen Runtime-Verlauf
eine unveraenderte, geordnete Folge von Theoriezeilen.

Es beantwortet nur:

```text
Welche semantischen Zustaende gehoeren in welcher Reihenfolge zur Loesungsgeschichte?
```

## Uebergabe

- Vorgaenger: abgeschlossene Runtime-Pipeline mit Initialstruktur und History
- Eingabe: bereits entschiedene semantische Zustaende
- Ausgabe: geordnete, tief kopierte Theoriezeilen ohne Geometrie
- Nachfolger: `buildGlobalSemanticRaster.js`

Alle semantischen Schalenarten werden unveraendert durchgereicht.
Das Modul besitzt deshalb keine schalenspezifische Umformungsregel.
Unbekannte, aber im Eingabevertrag gueltige Schalen werden ebenfalls tief kopiert;
ungueltige Strukturen werden nicht repariert.

## Eingabe

- `inputPhase.structure`
- `transformationPhase.initialStructure`
- `transformationPhase.history[]`
- die je Historieneintrag bereits vorhandene `strategy`

## Ausgabe

Die erste Zeile beschreibt den Initialzustand:

```text
rowId = r0
stepIndex = 0
source = initial
strategy = null
```

Jeder Historieneintrag erzeugt danach genau eine weitere Zeile:

```text
rowId = r{n}
stepIndex = n
source = transformation
strategy = unveraenderte Kopie der bereits ausgefuehrten Decision
```

Jede Theoriezeile enthaelt:

- eine tiefe Kopie der semantischen Atome
- `anchorIndex` und `anchor`
- `left` und `right` als reine Sicht auf die kopierte Gleichungsstruktur

## Eigentumsgrenze

Das Modul darf:

- vorhandene Zustaende klonen
- sie deterministisch nummerieren
- sie am bereits vorhandenen Gleichheitsanker in links und rechts teilen

Es darf nicht:

- eine Umformung erfinden oder wiederholen
- Strategien neu entscheiden
- Atome, Operatoren oder Schalen umsortieren
- Sichtbarkeit oder Eltern-Kind-Zuordnung veraendern
- Spalten, Baender, Reihenhoehen oder Renderdaten erzeugen
- fehlende Historieneintraege ergaenzen

P3 besitzt die semantische Aenderung.
Dieses Modul besitzt nur die unveraenderte Zeilenfolge fuer P4.

## Verantwortlicher Code

- `core/GenesisRuntime/P4_Projection/buildTheoryRows.js`

## Testvertrag

Der fokussierte Test lautet:

- `tests/active/genesis_runtime_p4_theory_rows.test.js`

Er muss mindestens beweisen:

1. Initialzustand plus `n` Historieneintraege ergeben genau `n + 1` Theoriezeilen.
2. Reihenfolge, `rowId`, `stepIndex`, `source` und `strategy` sind deterministisch.
3. Eingabe- und Historienobjekte werden tief kopiert und nicht mutiert.
4. `left`, `anchor` und `right` entsprechen exakt derselben kopierten Struktur.
5. Das Modul fuegt keinerlei P4-Spalte, Schalenband oder Renderfeld hinzu.

Der Test ist im Standardlauf registriert und aktuell gruen.
