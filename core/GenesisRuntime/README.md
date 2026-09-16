# Genesis Runtime

Stand: 10. September 2026

Dies ist die aktive Zone fuer den echten Tabula-rasa-Neustart.

## Regel
Neuer Kerncode darf ab jetzt nur noch hier wachsen,
wenn er zur neuen Runtime gehoert.

Vor jeder Codeaenderung gilt:

```text
Genesis -> lokale Richtlinie -> Testvertrag -> Code -> gruener Beweis
```

## Einstieg
Der erste aktive Einstiegspunkt liegt in:

- `index.js`
- `runtimePipeline.js`

Die ersten Phasenmodule liegen in:

- `P1_Input/runInputPhase.js`
- `P2_Strategy/runStrategyPhase.js`
- `P3_Transformation/runTransformationPhase.js`
- `P4_Projection/runProjectionPhase.js`

Die schemafeste Bruecke zur bisherigen oeffentlichen Solve-Huelle liegt in:

- `LegacyProjectionAdapter.js`
- `LegacySolveAdapter.js`

Der produktive Aufruf verwendet ausdruecklich:

- `GenesisCore.solve(equation, { runtimeEngine: "genesis_runtime" })`

Der noch vorhandene Aufruf ohne `runtimeEngine` ist ein Migrationspfad und kein
zweiter massgeblicher Core-Vertrag. Seine historischen Erwartungen werden getrennt
im Legacy-Audit gefuehrt.

Aktive Phasenvertraege liegen in:

- `P1_Input/CONTRACT.md`
- `P2_Strategy/CONTRACT.md`
- `P3_Transformation/CONTRACT.md`
- `P4_Projection/CONTRACT.md`
- `P4_Projection/THEORY_ROWS_CONTRACT.md`
- `LEGACY_PROJECTION_ADAPTER_CONTRACT.md`
- `LEGACY_SOLVE_ADAPTER_CONTRACT.md`

## Verboten
- Imports aus `core/archiv/`
- versteckte Rueckgriffe auf alte Laufzeitentscheidungen
- lokale Korrekturlogik, die fruehere Phasen repariert
- funktionale Geometrie in Renderer oder Adapter verschieben

## Erlaubt
- Bezug auf Genesis-Dokumente unter `docs/Genesis/Neustart_2026-07-28/`
- saubere Neuschrift mit genau einer Verantwortung pro Modul
- explizite Vertrage zwischen den Phasen
