# Genesis Neustart 2026-07-28

Status: normativ-operativ  
Stand: 15. September 2026
Zweck: sauberer Neustart des Projektkerns mit dem Wissen aus allen bisherigen Schleifen

## Einordnung in Genesis

Dieses Dokument ist ein operativer Anhang der beiden zentralen Genesis-Fassungen:

1. `docs/Genesis/Genesis_Gleichungsloeser_Mensch.md`
2. `docs/Genesis/Genesis_Gleichungsloeser_Maschine.md`

Bei einem Widerspruch werden zuerst diese beiden Hauptfassungen berichtigt.
Danach werden dieser Anhang,
die lokale Modulrichtlinie,
der Testvertrag
und erst dann der Code angepasst.

Die verbindliche Trennung von Prozessschritt,
Umformungsschritt,
Schalenstandard
und modulspezifischer Fallregel steht in:

- `PROZESSMODELL_UND_SCHALENSTANDARD.md`
- `SHELLS/README.md` und die dort registrierten isolierten Schalenstandards

## Ausgangslage
Wir beginnen den strukturellen Neustart des Gleichungsloesers bewusst neu.

Nicht das bestehende Verhalten wird weiter geflickt,
sondern die Kernlogik wird neu geordnet:

- von Genesis her
- mit genau einer Ortswahrheit
- mit klar getrennten Modulen
- mit genau einer Verantwortung pro Modul
- ohne Rekonstruktion in spaeteren Schichten
- mit Archiv statt Altlast

## Tabula-Rasa-Regel
Dieser Neustart ist kein Umbau im Bestand.

Altes Wissen bleibt erhalten,
aber alter Runtime-Code ist nicht mehr fuehrend.

Die harte Fuehrung dafuer steht in:

- `TABULA_RASA_MANDAT.md`

## Nicht verhandelbare Grundsaetze
1. Es gibt genau eine Spaltenwahrheit.
2. Diese Spaltenwahrheit entsteht vollstaendig im Proflight.
3. Danach wird nur noch nach unten weitergereicht.
4. Kein spaeteres Modul darf Spalten neu bestimmen.
5. Sichtbare Schalen bauen sich um bestehende Spalten auf.
6. Semantische Schachtelung entsteht in `P1` und `P3`.
7. Funktionale Geometrie entsteht in `P4` bottom-up von innen nach aussen.
8. Renderer bauen daraus visuelle Geometrie, interpretieren die funktionale Geometrie aber nicht neu.
9. Ein Problem muss an genau einer Stelle loesbar sein.
10. Jedes aktive Modul besitzt Richtlinie, Code und einen im Standardlauf registrierten Test.
11. Ein Prozessschritt ist genau eine Modulaufgabe und keine mathematische Operationsart.
12. Jede aktive Schalenart besitzt einen kanonischen Schalenstandard.
13. Jede Modulgrenze liefert einen vollstaendig gueltigen Zustand oder einen expliziten Fehler.
14. Zwischen zwei benannten Prozessmodulen ist keine versteckte Fachtransformation erlaubt.
15. Fehler werden niemals als einzelne Gleichungs-, Symbol-, Screenshot- oder
    Beispielspezialfaelle geloest. Jeder reproduzierbare Fehler wird auf die
    verletzte allgemeine Strukturinvariante zurueckgefuehrt und genau im
    verantwortlichen Modul behoben.
16. Vor der Spaltenvergabe meldet ein koordinatenfreier Shell-Bedarfsplan alle
    Atom- und Huellezellansprueche der gesamten Theoriezeilenfolge.
17. Das Global Semantic Raster vergibt danach `colStart`, `col` und `colEnd`
    jeder funktionalen Zelle genau einmal und fuehrt belegte sowie freie
    Rasterbereiche pro Theoriezeile explizit.
18. Funktionale Profilmaterialisierung, Projection Blocks, Writer, Adapter und
    Renderer sind gegenueber dieser horizontalen Zellwahrheit schreibgeschuetzt.

## Wurzelregel fuer Fehlerkorrekturen

Jede Fehlerkorrektur folgt verbindlich dieser Reihenfolge:

```text
Gegenbeispiel
-> verletzte allgemeine Invariante benennen
-> genau ein Eigentuemer-Modul bestimmen
-> Genesis und lokalen Vertrag berichtigen
-> allgemeinen Positiv- oder Negativtest schreiben
-> erst danach den Code des Eigentuemer-Moduls aendern
```

Der Test darf nicht nur die gemeldete Beispielgleichung konservieren. Er muss
die betroffene Strukturklasse mit neutralen Symbolen oder mehreren Varianten
beweisen. Verboten sind Abfragen auf konkrete Gleichungstexte, besondere
Variablennamen, Screenshot-Abmessungen oder nachtraegliche Renderer-Korrekturen.

Wenn sich kein einziges Eigentuemer-Modul benennen laesst, wird nicht
implementiert. Dann fehlt entweder ein Vertrag oder die bestehende
Modultrennung ist falsch und muss zuerst in Genesis geklaert werden.

## Der neue Soll-Ablauf
1. Theorie entsteht semantisch.
2. Proflight simuliert die gesamte Umbaufolge.
3. Der Proflight legt globale Inhaltsspalten und Shell-Spannen fest.
4. P4 baut die funktionale Geometrie von inneren Atomen und Schalen zu aeusseren Schalen auf.
5. P4 schreibt diese Wahrheit als explizite Projektionsstruktur aus.
6. Arbeitsblatt, PDF, Film und weitere Medien bauen daraus nur visuelle Geometrie.

## Der neue P4-Kern
Der neue P4-Kern ist Teil des aktiven Tabula-rasa-Neustarts.

Alter Runtime-Code bleibt nur noch als Archivwissen erhalten
und ist nicht mehr die fuehrende Architekturgrundlage.

Der einzige aktive Runtime-Strang liegt unter:

- `core/GenesisRuntime/`

Der erste aktive Runtime-Einstieg fuer diesen Neustart liegt jetzt in:

- `core/GenesisRuntime/index.js`
- `core/GenesisRuntime/runtimePipeline.js`

Die aktive Projektionskette liegt aktuell in:

- `core/GenesisRuntime/P4_Projection/buildTheoryRows.js`
- `core/GenesisRuntime/P4_Projection/buildGlobalSemanticRaster.js`
- `core/GenesisRuntime/P4_Projection/refineSemanticRaster.js`
- `core/GenesisRuntime/P4_Projection/buildShellBlueprints.js`
- `core/GenesisRuntime/P4_Projection/localizeProjectionGeometry.js`
- `core/GenesisRuntime/P4_Projection/buildProjectionBlocks.js`
- `core/GenesisRuntime/P4_Projection/writeProjectionRows.js`
- `core/GenesisRuntime/P4_Projection/buildOutputContract.js`

## Modulkarte
Die uebergeordnete Phasenkette steht in:

- `PHASENKETTE_P1_BIS_RENDERER.md`

Die Modulkarte fuer den Neustart steht in:

- `MODULE_MATRIX.md`

Die einzelnen Regelwerke stehen in:

- `MODULES/00_MODULSTANDARD.md`
- `MODULES/01_GLOBAL_SEMANTIC_RASTER.md`
- `MODULES/02_SHELL_BLUEPRINTS.md`
- `MODULES/03_PROJECTION_BLOCKS.md`
- `MODULES/04_PROJECTION_WRITER.md`
- `MODULES/05_OUTPUT_CONTRACT.md`
- `MODULES/06_FUNKTIONALE_SCHALENGEOMETRIE.md`

Die isolierten Schalenstandards stehen in:

- `SHELLS/README.md`
- `SHELLS/ADDITION.md`
- `SHELLS/COLLECTION.md`
- `SHELLS/DIVISION.md`
- `SHELLS/FUNCTION.md`
- `SHELLS/GROUP.md`
- `SHELLS/MULTIPLICATION.md`
- `SHELLS/NEGATION.md`
- `SHELLS/POWER.md`
- `SHELLS/ROOT.md`
- `SHELLS/SUBTRACTION.md`

## Fuehrungsregel
Fuer den Neustart gilt:

- diese Dokumente beschreiben den Soll-Zustand
- der neue Code darf nur auf diese Struktur hin wachsen
- alter Code ist Referenz fuer Wissen, aber nicht mehr fuer Architekturentscheidungen
- neuer Runtime-Code gehoert nur in die aktive Runtime-Zone

## Modulregel

Ein Modul ist erst vollstaendig aktiv,
wenn folgende Dinge getrennt nachgewiesen sind:

1. fuehrende Richtlinie
2. benannter Vorgaenger, Eingabevertrag, Ausgabe und Nachfolger
3. vollstaendige Situationsmatrix mit kanonischen Schalenverweisen
4. genau ein verantwortlicher Codepfad
5. mindestens ein zugeordneter und im Standardlauf registrierter Test
6. heutiger gruener Beweis

Eine vorbereitete Zielstruktur ohne Code oder Test bleibt `geplant`.
Ein vorhandener, aber roter Test bedeutet:
Das Modul ist nicht freigegeben.

## Anhang: Modulliste und Verantwortung
Diese Kurzliste stoert bewusst nicht den Lesefluss des Haupttexts.
Die ausfuehrliche Gesamtkarte steht in:

- `MODULE_MATRIX.md`

Die Kurzfassung fuer den aktiven Genesis-Neustart lautet:

| Modul | Aktive Datei | Aufgabe |
| :--- | :--- | :--- |
| Runtime-Einstieg | `core/GenesisRuntime/index.js` | exportiert genau den aktiven Einstieg des neuen Kerns |
| Runtime-Pipeline | `core/GenesisRuntime/runtimePipeline.js` | orchestriert `P1 -> P2 -> P3 -> P4` und baut die Rueckgabehuelle |
| P1 Eingabe | `core/GenesisRuntime/P1_Input/runInputPhase.js` | parst und normalisiert die Eingabe zu einer kanonischen Anfangsstruktur |
| P2 Strategie | `core/GenesisRuntime/P2_Strategy/runStrategyPhase.js` | waehlt genau die naechste zulaessige Umformungsentscheidung |
| P3 Umformung | `core/GenesisRuntime/P3_Transformation/runTransformationPhase.js` | setzt genau diese Decision strukturell um und erzeugt die Theorie-History |
| P4 Theoriezeilen | `core/GenesisRuntime/P4_Projection/buildTheoryRows.js` | ueberfuehrt Anfangsstruktur und History in eine vollstaendige Theoriezeilenfolge |
| P4 Shell-Bedarfsplan | `core/GenesisRuntime/P4_Projection/buildShellBlueprints.js` | meldet alle Huellezellansprueche koordinatenfrei vor der Spaltenvergabe |
| P4 Global Semantic Raster | `core/GenesisRuntime/P4_Projection/buildGlobalSemanticRaster.js` und `planGlobalCellPlacement.js` | vergibt alle horizontalen Atom-, Huelle- und Zukunftszellen bottom-up genau einmal |
| P4 Raster-Feinschliff | `core/GenesisRuntime/P4_Projection/refineSemanticRaster.js` | validiert und schliesst das vollstaendige globale Zellprofil ohne neue Zellansprueche ab |
| P4 Funktionale Profilmaterialisierung | `core/GenesisRuntime/P4_Projection/localizeProjectionGeometry.js` | uebergibt das feste Zellprofil ohne horizontale Neuberechnung |
| P4 Projection Blocks | `core/GenesisRuntime/P4_Projection/buildProjectionBlocks.js` | legt die vertikale Teilzeilenstruktur mit Achse, Ober- und Unterzeilen fest |
| P4 Projection Writer | `core/GenesisRuntime/P4_Projection/writeProjectionRows.js` | schreibt die bereits entschiedene Ortswahrheit als Projektionsatome aus |
| P4 Output Contract | `core/GenesisRuntime/P4_Projection/buildOutputContract.js` | verpackt und validiert dieselbe Kernwahrheit fuer Renderer, PDF, Film und Diagnose |
| Medienadapter | `components/*`, `core_a/adapters/*` | uebersetzen nur das Schema, ohne funktionale Geometrie neu zu bestimmen |
| Renderer | `renderer_kernel/`, `components/Arbeitsblatt_Druckansicht/renderKernelCore/`, `export_projection_pdf*` | bauen visuelle Geometrie aus der funktionalen Kerngeometrie |
| Bridge B | `bridge_b/transition_step/` | erzeugt genau einen kontrollierten B-Prozessschritt und keine allgemeinen Solve-Umformungen |
