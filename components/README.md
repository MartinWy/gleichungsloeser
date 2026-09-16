# Components Overview

Der Ordner `components/` enthaelt Browser-Komponenten fuer Diagnose, Demo oder Visualisierung.

## Regel
Jede Komponente verwaltet idealerweise ihre zugehoerigen Dateien lokal:
- `index.html`
- optionale `logic.js`
- optionale `style.css`
- lokale `Handbuch.md`

## Architekturgrenze
Diese Komponenten sind nicht die produktive Wahrheit des Solvers.
Sie zeigen, pruefen oder illustrieren Kernlogik.

Wichtiger Zusatz:
Aktive Komponenten duerfen vorgelagerte **Input-Adapter** besitzen,
solange diese nur auf die kanonische Kernsyntax normalisieren
und keine zweite mathematische Wahrheit neben dem Core aufbauen.

## Statusklassen
- `aktiv`: mit dem aktuellen Core-Pfad verbunden
- `prototypisch`: experimentell oder nur als Vorlage
- `legacy`: verweist noch auf alte Pfade oder alte Architekturwelten
