# Modul 03: Projection Blocks

Status: normativ
Stand: 15. September 2026

## Aufgabe
Dieses Modul organisiert die vertikale Leselogik.

Seine eine Prozessaufgabe lautet:

```text
aus fertiger funktionaler Schalengeometrie die Block- und Teilzeilenstruktur festlegen
```

## Uebergabe

- Vorgaenger: Funktionale Schalengeometrie
- Eingabevertrag: feste globale Spuren plus vollstaendige funktionale Schalen-, Kind-, Band- und Achsengeometrie
- Ausgabevertrag: vollstaendige Projektionsbloecke und eindeutige Relativzeilenabbildung
- Nachfolger: Projection Writer

## Eingabe
- globale Inhaltsspalten
- Shell-Blueprints

## Ausgabe
- Projektionsbloecke pro Zeile
- Achsenzeile
- Ober- und Unterzeilen
- explizite Blockhoehen
- die eine Umrechnung zwischen Relativzeilen und Lokalzeilen

## Regeln
1. Eine Bruchachse ist eine echte Teilzeile, keine optische Schaetzung.
2. Freistehende Nachbarn derselben Gleichungszeile fluchten auf derselben Achse wie der Bruchstrich.
3. Dieselbe Blocklogik gilt spaeter auch fuer Wurzeln und weitere sichtbare Schalen.
4. Die Umrechnung `relativeRow <-> localRow` wird hier einmalig festgelegt und spaeter nur noch gelesen.
5. Bounds-/Shell-Zustandssammlung und Blockzeilenbau sind getrennte Unterbausteine.
6. Teilzeilen und Achsen sind funktionale Geometrie des Core.
7. Physische Pixel-, `em`- oder Papierhoehen gehoeren erst zur visuellen Geometrie des Renderers.
8. Eine aeussere obere Huellezeile wird nach dem vollstaendigen Kindrahmen
   bestimmt. Fuer `ROOT` gilt `root_overbar = radicand.minRelativeRow - 1`.
9. Eine Huellezeile darf keinen sichtbaren Inhalt ihres umspannten Kindrahmens
   belegen; eine solche Kollision ist ein Core-Fehler und kein Renderproblem.

## Situationsmatrix

| Situation | Status | Blockregel |
| :--- | :---: | :--- |
| rein lineare funktionale Geometrie | unterstuetzt | genau eine Achsenzeile verwenden |
| `DIVISION`-Geometrie | unterstuetzt | gelieferte Zaehler-, Achsen- und Nennerreihen abbilden |
| `POWER`-Geometrie | unterstuetzt | gelieferte Basis- und Exponentenreihen abbilden |
| `ROOT` mit ein- oder mehrzeiligem Radikanden | unterstuetzt | Oberstrich genau eine Reihe ueber der obersten Radikandreihe setzen und den fertigen Kindrahmen umschliessen |
| unveraenderte transportierte Schale | durchreichen | vorhandene relative Reihen und Achse erhalten |
| fehlende Achse oder unvollstaendige funktionale Geometrie | zurueckweisen | keine Default-Blockzeile erfinden |

## Verantwortlicher Codepfad

- `core/GenesisRuntime/P4_Projection/buildProjectionBlocks.js`
- `core/GenesisRuntime/P4_Projection/projectionTraversal.js`

## Zugeordnete Beweistests

- `tests/active/genesis_runtime_p4_projection.test.js`
- `tests/active/genesis_runtime_view_model_columns.test.js`
- `tests/active/worksheet_display_model.test.js`
- `tests/active/root_primitive_cell_separation.test.js`

Alle aktiven Beweistests muessen im Standard-Testlauf registriert sein.

## Verboten
- Achsen aus Textbox-Hoehen zu erraten
- Zeilen spaeter im Renderer nachzukorrigieren
- Bounds-Sammlung und Blockzeilenbau in einer einzigen Sammelfunktion zu verstecken
- funktionale Reihen aus Font- oder Glyphenhoehen abzuleiten
- visuelle Pixelhoehen im Core festzulegen
- fehlende funktionale Schalenreihen aus Text oder Schalentyp nachzubauen
- eine obere Huelle auf eine feste Achsendistanz zu setzen, ohne die oberste Kindzeile zu lesen
