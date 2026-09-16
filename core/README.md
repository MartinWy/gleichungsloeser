# Core Overview

Stand: 28. Juli 2026

## Harte Trennung
Der Core ist ab jetzt in zwei Zonen getrennt:

- `GenesisRuntime/`: einzige aktive Zone fuer den Tabula-rasa-Neustart
- `archiv/`: eingefrorene historische Runtime-Staende

## GenesisRuntime
Hier darf neuer Kerncode ohne Altlasten wachsen.

Fuehrung:
- `GenesisRuntime/README.md`
- `GenesisRuntime/CONTRACT.md`
- `docs/Genesis/Neustart_2026-07-28/`

## Archiv
Hier liegt Wissen aus frueheren Runtime-Pfaden.

Fuehrung:
- `archiv/README.md`
- `archiv/stand_2026-07-28/`

## Hinweis
Die bisherigen Kernordner auf `core/`-Ebene bleiben als sichtbarer Referenzstand vorerst erhalten,
sind aber nicht mehr die normative Architekturgrundlage fuer den Neustart.
