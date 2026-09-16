# Presentation-Fassade

Status: Richtlinie vorhanden; Fassade und Teilpfade in Migration
Stand: 7. September 2026

## Aufgabe

`presentation/` ist die gemeinsame oeffentliche Fassade
fuer visuelle Verbraucher und visuelle Hilfsmittel.

Die Fassade besitzt keine mathematische oder funktionale Geometriewahrheit.
Sie stellt vorhandene Module nur unter stabilen Einstiegspunkten bereit.

## Teilmodule und Eigentum

| Teilmodul | Verantwortlicher Pfad | Einzige Aufgabe |
| :--- | :--- | :--- |
| Adapter-Fassade | `presentation/adapters/` | vorhandene Eingabe-, ViewModel- und DisplayModel-Adapter exportieren |
| Column-Layout-Fassade | `presentation/column_layout/` | physisches Spaltenlayout exportieren |
| Render-Kernel-Fassade | `presentation/render_kernel/` | visuellen Renderer-Kernel exportieren |
| LaTeX/PDF-Fassade | `presentation/media/latex_pdf/` | vorhandenen LaTeX-Erzeuger exportieren |
| Spursatz | `presentation/spursatz/` | versionierte Glyphen- und Delimiterdaten validieren und visuelle Primitive daraus bauen |
| Schalenfarben | `presentation/shell_colors/` | explizite Stilregeln auf vorhandene IDs und Rollen anwenden |

Jedes Teilmodul bleibt innerhalb dieser einen Aufgabe.
Die Fassade selbst enthaelt nur Exporte.

## Eingabegrenze

Presentation darf lesen:

- kanonische Adapterausgaben
- funktionale Geometrie aus dem Core-/Szenenvertrag
- explizite Atom-, Shell- und Fokus-IDs
- visuelle Profile, Farben, Fonts und Medienparameter

Presentation darf nicht:

- Solverstrategien oder Umformungen entscheiden
- funktionale Spalten, Reihen, Achsen, Baender oder Kindbeziehungen erzeugen
- Shell-Typen oder Darstellungsformen aus Text erraten
- einen roten Core- oder Adaptervertrag optisch ausgleichen
- dieselbe visuelle Aufgabe in mehreren Teilmodulen implementieren

## Spursatz-Grenze

Der Spursatz darf:

- einen versionierten Font-Snapshot validieren
- bekannte Glyphen und Delimiter adressieren
- aus diesen Daten physische Linien- und Glyphenprimitive erzeugen
- bereits gelieferte funktionale Spannen in physische Koordinaten abbilden

Er darf keine mathematische Schale erzeugen.
`buildFractionPrimitive` oder `buildRadicalPrimitive`
bauen nur Tinte fuer eine bereits funktional beschriebene Schale.

## Schalenfarben-Grenze

Schalenfarben duerfen nur explizite IDs, Rollen und Selektoren gestalten.
Sie duerfen keine Zugehoerigkeit erzeugen
und nicht aus gleicher Farbe auf gleiche Semantik schliessen.

## Verantwortlicher Code

- `presentation/index.js`
- die in der Modultabelle genannten Unterpfade

## Zugeordnete Tests

- `tests/active/presentation_entrypoints.test.js`
- `tests/active/shell_colors.test.js`

Beide Tests sind heute im Standardlauf registriert und gruen.

Noch fehlen fokussierte Modultests fuer:

- Spursatz-Snapshotvalidierung
- visuelle Primitive ohne funktionale Rekonstruktion
- Adapter-Fassaden ohne zusaetzliche Entscheidungen

Bis Richtlinie und fokussierte Teilmodultests vollstaendig sind,
bleibt `presentation/` eine Migrationsfassade und ist nicht voll freigegeben.
