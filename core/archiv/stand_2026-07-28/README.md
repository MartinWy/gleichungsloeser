# Core Overview

Der Core ist die produktive Pipeline des Gleichungsloesers.

## Aufbau
- `index.js`: Orchestrator
- `P1_Eingabe`: strukturierte Einlesephase
- `P2_Strategie_Analyse`: naechste zulaessige Aktion
- `P3_Umformung`: strukturelle Veraenderung
- `P4_Projektion`: Sichtbarkeits- und Darstellungsmarker

## Ziel
Der Core soll so organisiert sein, dass eine Aenderung in einer Phase nicht automatisch alle anderen Phasen verschiebt.

## Doku-Regel
Fuer jede aktive Phase liegen lokale Vertrags- und Eventflow-Dateien im jeweiligen Ordner.
