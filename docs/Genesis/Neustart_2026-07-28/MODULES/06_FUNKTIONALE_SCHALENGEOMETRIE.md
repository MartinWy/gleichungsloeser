# Modul 06: Funktionale Profilmaterialisierung

Status: normativ
Stand: 15. September 2026

## Aufgabe

Dieses Modul macht das bereits abgeschlossene globale Zellprofil in der von
Projection Blocks und Writer benoetigten Form zugreifbar.

Seine eine Prozessaufgabe lautet:

```text
festes globales Zellprofil unveraendert in die nachfolgenden Zugriffssichten materialisieren
```

## Uebergabe

- Vorgaenger: Global Semantic Raster einschliesslich Rastervalidierung
- Eingabevertrag: Theoriezeilen, koordinatenfreie Shell-Bedarfsplaene und vollstaendiges `p4_global_cell_profile_v1`
- Ausgabevertrag: lokalisierte Blueprint-Sicht sowie Atomzentrum- und Atomspannen-Maps ohne neue Ortsentscheidung
- Nachfolger: Projection Blocks

## Eigentumsgrenze

Die horizontale funktionale Geometrie entsteht bereits im Global Semantic
Raster bottom-up von innen nach aussen. Dort werden festgelegt:

- stabile Atomzentren
- vollstaendige Atomzellspannen
- Huellezellen fuer Funktionen, Gruppen, Wurzeln und Brueche
- Inhalts-, Ausrichtungs- und Huellebaender
- Bruchzentrierung
- Geburtslage und geschlossener Transport
- leere Zukunftsbereiche frueherer Theoriezeilen

Dieses Modul liest diese Daten nur. Es besitzt weder eine zweite Registry noch
einen zweiten Zentrierungs- oder Verschiebungslauf.

## Regeln

1. Jede materialisierte Zelle stimmt exakt mit `rawColStart`, `rawCol` und `rawColEnd` des globalen Profils ueberein.
2. Theoriezeilen und Profilzeilen muessen dieselben `rowId` besitzen.
3. Koordinatenfreie und lokalisierte Blueprints muessen dieselben `rowShellKey` besitzen.
4. Ein explizit leerer Bedarfsplan ist fuer eine schalenfreie Theoriezeile gueltig.
5. Fehlende oder zusaetzliche Bedarfsplaene sind Vertragsfehler.
6. Es gibt keinen Rueckfall auf Grundspuren, Text, Nachbarschaft oder Renderer-Geometrie.

## Situationsmatrix

| Situation | Status | Regel |
| :--- | :---: | :--- |
| vollstaendiges Profil mit beliebigen kanonischen Schalen | unterstuetzt | exakt materialisieren |
| schalenfreie Theoriezeile | unterstuetzt | Atomzellen exakt materialisieren |
| fehlende Profilzeile oder Atomzelle | zurueckweisen | expliziter Profilfehler |
| Blueprint-Menge widerspricht dem Profil | zurueckweisen | expliziter Blueprint-Widerspruch |
| nachtraegliche horizontale Aenderung verlangt | zurueckweisen | keine Ausgabe |

## Verantwortlicher Codepfad

- `core/GenesisRuntime/P4_Projection/localizeProjectionGeometry.js`

Die globale horizontale Planung gehoert dagegen ausschliesslich zu:

- `core/GenesisRuntime/P4_Projection/buildGlobalSemanticRaster.js`
- `core/GenesisRuntime/P4_Projection/planGlobalCellPlacement.js`
- `core/GenesisRuntime/P4_Projection/shellLayoutRules.js`

## Zugeordnete Beweistests

- `tests/active/genesis_runtime_p4_module_boundaries.test.js`
- `tests/active/global_cell_profile_preflight.test.js`
- `tests/active/genesis_runtime_p4_projection.test.js`

Alle aktiven Beweistests muessen im Standard-Testlauf registriert sein.
