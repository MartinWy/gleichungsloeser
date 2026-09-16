# Modul 04: Projection Writer

Status: normativ
Stand: 15. September 2026

## Aufgabe
Dieses Modul schreibt die bereits festgelegte Wahrheitsstruktur als Projektionsatome aus.

Das ist seine einzige Prozessaufgabe.

## Uebergabe

- Vorgaenger: Projection Blocks
- Eingabevertrag: vollstaendige Inhalts-, Schalen- und Blockgeometrie
- Ausgabevertrag: explizite Projektionsatome und Schalenauftreten ohne neu berechnete Geometrie
- Nachfolger: Output Contract

## Eingabe
- globale Inhaltsspalten
- Shell-Blueprints
- Blockdefinitionen

## Ausgabe
- Projektionsatome mit `row`, `col`, `colStart`, `colEnd`
- Rollen wie `numerator`, `denominator`, `fraction_line`, `function_name`
- stabile Rueckbindungen auf semantische Quellen

## Regeln
1. Der Writer liest nur und schreibt aus.
2. Er darf keine neue Geometrie erzeugen.
3. Er darf nichts lokal zentrieren, strecken oder zusammenziehen.
4. Er darf nur explizite Shell-Slots und explizite Inhaltsspalten verwenden.
5. Shell-Blueprints werden zeilenlokal gelesen. Dieselbe `shellId` in zwei Theoriezeilen sind zwei verschiedene Projektionseintraege, weil Sichtbarkeit und Slotbelegung pro Zeile verschieden sein koennen.
6. Shell-spezifische Horizontalregeln wie Klammerabstaende, Funktionsvorlauf, Wurzelhaken oder Bruchbreite werden zentral vorbereitet und hier nur gelesen.
   Diese Geometrie wird intern weiter getrennt in Boundary-Umrechnung, Geometrie-Primitiven und Shell-Layouts.
7. Shell-spezifische Slotbeschreibungen wie Slotname, Slottyp, Rollenname und Zeilenmodus werden zentral vorbereitet und hier nur noch ausgespielt.
8. Die konkrete Projektion von Shell-Containern und Shell-Slots wird zentral beschrieben und hier nur zusammengesetzt, nicht pro Shell-Typ neu erfunden.
9. Auch Blattprojektion, Blattrollen und Blatt-Traversal werden zentral beschrieben. Der Writer fuehrt nur zusammen, was bereits festgelegt ist.
10. Auch der eigentliche Zeilenzusammenbau mit Default-Blockzeilen und Startkontexten liegt ausserhalb des Writers.
11. Der Writer schreibt die explizite Darstellungsform einer Schale aus; er entscheidet sie nicht.
12. Eine aus dem globalen Zellprofil materialisierte mehrspaltige Atomzelle wird als
    genau ein Atom mit unveraendertem `colStart` und `colEnd` ausgeschrieben.

## Situationsmatrix

| Situation | Status | Writer-Regel |
| :--- | :---: | :--- |
| sichtbares Atom | unterstuetzt | genau eine bereits bestimmte Position und Rolle ausschreiben |
| sichtbares Huelleprimitiv einer kanonischen Schale | unterstuetzt | genau einen bereits bestimmten Slot ausschreiben |
| explizit verborgene Atom- oder Schalenrolle | durchreichen | Sichtzustand und Spur ohne sichtbaren Ersatz ausschreiben |
| geschlossene Blockform mit expliziter Darstellungswahl | unterstuetzt | genau die gewaehlte Form markieren; keine Form selbst waehlen |
| fehlende Position, Rolle, Spanne, Teilzeile oder Darstellungswahl | zurueckweisen | Writer-Vertragsfehler statt Fallback |

## Verantwortlicher Codepfad

- `core/GenesisRuntime/P4_Projection/writeProjectionRows.js`

## Zugeordnete Beweistests

- `tests/active/genesis_runtime_p4_projection.test.js`
- `tests/active/fraction_line_no_fraction_rendernode.test.js`
- `tests/active/law_of_sines_start_shell_primitives.test.js`
- `tests/active/fraction_collection_alignment.test.js`
- `tests/active/root_primitive_cell_separation.test.js`

Alle aktiven Beweistests muessen im Standard-Testlauf registriert sein.

## Verboten
- lokale Bruchlogik
- lokale Wurzel-Offsets
- lokale Funktions- oder Klammergeometrie
- lokale Slot-Definitionen pro Schalentyp
- lokale Container- oder Slot-Erzeugung pro Schalentyp
- lokale Blatt-Rollenlogik oder Blatt-Traversal
- lokaler Zeilenzusammenbau oder lokale Default-Blockzeilen
- Rekonstruktion aus frueheren Medienmodellen
- Auswahl zwischen atomarer, primitiver oder geschlossener Blockdarstellung
- Erzeugen einer Default-Position, Default-Teilzeile oder synthetischen Ersatzrolle
