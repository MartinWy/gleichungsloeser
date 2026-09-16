# P4-Teilmodul: funktionale Profilmaterialisierung

Status: normativ
Stand: 15. September 2026
Vertrag: `p4_local_geometry_v4`

## Eine Aufgabe

`localizeProjectionGeometry.js` materialisiert das abgeschlossene
`p4_refined_semantic_raster_v2` fuer Projection Blocks und Writer.

Eingabe sind:

- die unveraenderten Theoriezeilen
- der koordinatenfreie Shell-Bedarfsplan `p4_shell_blueprints_v2`
- das vollstaendige globale Zellprofil `p4_global_cell_profile_v1`

Ausgabe sind:

- dieselben bereits lokalisierten Shell-Blueprints
- eine Map der bereits festgelegten Atomzentren
- eine Map der bereits festgelegten Atomzellspannen

## Harte Grenze

Dieses Modul ist kein zweiter Layoutlauf.

Es darf insbesondere nicht:

- `rawColStart`, `rawCol` oder `rawColEnd` erzeugen oder veraendern
- eine Schale, Kindrolle oder Huellezelle rekonstruieren
- einen Bruch zentrieren
- Funktionsname oder Klammern nachtraeglich einfuegen
- Geburtslagen neu berechnen
- lokale Reihen oder Medienmasse bestimmen

Fehlt eine Zelle im globalen Profil oder widersprechen sich Theoriezeilen,
Bedarfsplaene und Profil, bricht das Modul mit einem expliziten Vertragsfehler
ab. Es gibt keine Reparatur und keinen Fallback auf provisorische Grundspuren.

## Situationsmatrix

| Situation | Status | Materialisierungsregel |
| :--- | :---: | :--- |
| vollstaendiges, widerspruchsfreies Zellprofil | unterstuetzt | Zellwerte unveraendert in Maps und Blueprint-Sichten uebertragen |
| schalenfreie Theoriezeile mit explizit leerem Bedarfsplan | unterstuetzt | Atomzellen unveraendert materialisieren |
| fehlende Profilzeile oder fehlende Atomzelle | zurueckweisen | expliziter Profilfehler |
| fehlender oder zusaetzlicher Shell-Bedarfsplan | zurueckweisen | expliziter Blueprint-Widerspruch |
| Versuch einer horizontalen Nachkorrektur | zurueckweisen | keine Ausgabe erzeugen |

## Beweise

- `tests/active/genesis_runtime_p4_module_boundaries.test.js`
- `tests/active/global_cell_profile_preflight.test.js`
- `tests/active/genesis_runtime_p4_projection.test.js`

Der zweite Test vergleicht jede spaeter ausgeschriebene horizontale Zelle mit
der bereits im Pre-flight vorhandenen Profilzelle.
