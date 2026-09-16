# Genesis Runtime Contract

Status: aktive Runtime; direkter Core-Vertrag gruen
Stand: 10. September 2026

## Zweck
Dieser Bereich ist die einzige aktive Runtime-Zone,
in der der neue Kern ohne Altlasten wachsen darf.

## Aktiver Stand
- `P1_Input` ist als Neuschrift aktiv.
- `P2_Strategy` bestimmt Zielvariable, aktive Seite, sichtbare Zielvorkommen und erste Familienentscheidungen als Neuschrift.
- `P3_Transformation` setzt additive, inverse und Bruchfamilien als Neuschrift um.
- `P4_Projection` schreibt Theoriezeilen, Raster, funktionale Schalengeometrie, Blockzeilen und Exportvertrag als Neuschrift.

## Oberregel
Jedes Prozessmodul in diesem Bereich muss:

- genau eine Aufgabe haben
- einen benannten Vorgaenger und Nachfolger haben
- seinen Ein- und Ausgabevertrag klar benennen
- fuer jede beanspruchte Schalenart eine explizite Fallregel, Durchreichregel oder Ablehnung besitzen
- keine alte Runtime rekonstruieren
- keine Imports aus `core/archiv/` verwenden

Eine Hilfsdatei ist nicht automatisch ein Prozessmodul.
Sie darf nur die eine Aufgabe ihres besitzenden Moduls technisch zerlegen
und keinen verdeckten fachlichen Uebergang schaffen.

Verbindliche Begriffe und Standards:

- `docs/Genesis/Neustart_2026-07-28/PROZESSMODELL_UND_SCHALENSTANDARD.md`
- `docs/Genesis/Neustart_2026-07-28/MODULES/00_MODULSTANDARD.md`

Die Runtime-Pipeline ist ausschliesslich Orchestrator.
Sie darf Module aufrufen,
die P2/P3-Schleife wiederholen,
Endzustaende erkennen
und Fehler transportieren.
Sie darf zwischen `P1`, `P2`, `P3` und `P4`
keine semantische Struktur erzeugen,
normalisieren
oder reparieren.

## Fuehrung
Die normative Fuehrung liegt in:

- `docs/Genesis/Genesis_Gleichungsloeser_Mensch.md`
- `docs/Genesis/Genesis_Gleichungsloeser_Maschine.md`
- `docs/Genesis/Neustart_2026-07-28/README.md`
- `docs/Genesis/Neustart_2026-07-28/TABULA_RASA_MANDAT.md`
- `docs/Genesis/Neustart_2026-07-28/PHASENKETTE_P1_BIS_RENDERER.md`
- `docs/Genesis/Neustart_2026-07-28/MODULE_MATRIX.md`

## Verboten
- alte P4-Korrekturlogik wiederverwenden
- Renderer- oder Exportlogik in den Kern ziehen
- mehrere konkurrierende Ortswahrheiten erzeugen
- funktionale Geometrie an Adapter oder Renderer delegieren
- eine spaetere Phase Fehler einer frueheren Phase ausgleichen lassen
- semantische Normalisierung in `runtimePipeline.js` oder einem nicht als Prozessmodul registrierten Zwischenpfad
- unbekannte Situationen durch Fallback oder nachtraegliche Inferenz als Erfolg ausgeben

## Modulbeweise

- P1: `tests/active/genesis_runtime_p1_input.test.js`
- P2: `tests/active/genesis_runtime_p2_targeting.test.js`, `genesis_runtime_p2_decisions.test.js`
- P3: `tests/active/genesis_runtime_p3_shells.test.js`
- P4: `tests/active/genesis_runtime_p4_projection.test.js`
- Gesamtfluss: `tests/active/core_solve_flow.test.js`, `tests/active/genesis_runtime_bridge.test.js`
- Zielwahl: `tests/active/target_variable_selection.test.js`
- komplexer Integrationsfall: `tests/active/cosine_law_gamma.test.js`

Die direkten P1-, P2-, P3- und P4-Einzelbeweise,
die Eigentumsgrenze der Runtime-Pipeline,
die oeffentliche Adaptergrenze
und der aktuelle Gesamtfluss sind gruen.

Historische Tests des frueheren Standardpfads gehoeren in den Legacy-Audit.
Sie duerfen insbesondere keine vorkanonischen Rollen wie `flowDirection`,
gebuendelte Ausdruckszellen oder reservierte Zukunftsspalten als Anforderung
an die GenesisRuntime zuruecktragen.
