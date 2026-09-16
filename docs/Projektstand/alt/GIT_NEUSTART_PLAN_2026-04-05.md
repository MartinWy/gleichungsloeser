# Git Neustart Plan: 5. April 2026

Status: vorbereitet, noch nicht ausgefuehrt  
Projekt: Gleichungsloeser

## Ziel
Die Git-Historie des Projekts soll operativ neu beginnen,
ohne die alte Welt inhaltlich zu verleugnen.

Das Ziel ist nicht mehrere getrennte Repositories pro Komponente,
sondern eine neue, saubere Historie mit klarer Commit-Folge pro Kernbaustein.

## Grundentscheidung
- Vergangenheit wird archiviert, nicht operativ fortgeschrieben
- neue Historie startet auf Basis des Freeze-Stands
- kuenftige Commits werden komponentenweise aufgebaut

## Empfohlenes Vorgehen
### Phase A: Archivanker setzen
1. aktuellen Freeze-Stand dokumentieren
2. alten Stand eindeutig markieren
3. sicherstellen, dass der alte Zustand spaeter referenzierbar bleibt

Empfohlene technische Form:
- Archiv-Branch oder Archiv-Tag fuer den Altstand

### Phase B: Neue Historie beginnen
1. neue orphan-Historie oder neues sauberes Ziel-Repository erzeugen
2. nur den gewuenschten Freeze-Inhalt uebernehmen
3. ersten Commit als Systemgrundlage setzen

### Phase C: Komponentenweise Commit-Folge aufbauen
Empfohlene Reihenfolge:
1. Architekturgrundlage und Projektregeln
2. `P1_Eingabe`
3. `P2_Strategie_Analyse`
4. `P3_Umformung`
5. `P4_Projektion`
6. `core/index.js`
7. aktive Tests
8. Diagnose-/Inspektor-Komponenten
9. verbleibende Exportadapter

## Commit-Logik fuer die neue Historie
### Commit 1
Architektur und Schutzregeln

Inhalt:
- `PROTOCOL.md`
- `CHRONICLE.md`
- `docs/Architecture/*`
- `docs/Genesis/Projektverfassung.md`
- zentrale Projektstandsdateien

Zweck:
Der neue Stammbaum startet mit Klarheit ueber Verantwortung und Grenzen.

### Commit 2
`P1_Eingabe`

Inhalt:
- `core/P1_Eingabe/*`
- zugehoerige Tests und lokale Doku

Zweck:
Atomare Struktur und ID-Basis sauber isolieren.

### Commit 3
`P2_Strategie_Analyse`

Inhalt:
- `core/P2_Strategie_Analyse/*`
- lokale Tests und Doku

### Commit 4
`P3_Umformung`

Inhalt:
- `core/P3_Umformung/*`
- lokale Tests und Doku

### Commit 5
`P4_Projektion`

Inhalt:
- `core/P4_Projektion/*`
- Positionstreue-Tests
- lokale Doku

### Commit 6
Orchestrator

Inhalt:
- `core/index.js`
- `core/README.md`
- `core/CONTRACT.md`
- `core/EVENTFLOW.md`
- integrative Tests

### Commit 7
Aktive Testsuite und Test-Runner

Inhalt:
- `package.json`
- `tests/run_active_tests.js`
- `tests/active/*`
- `tests/README.md`

### Commit 8
Aktive Diagnose-Komponenten

Inhalt:
- nur aktive oder bewusst uebernommene Komponenten
- lokale Handbuecher

## Was nicht in den Neustart hineinrutschen soll
- unerklaerte Legacy-Pfade
- `.DS_Store`
- Altspuren ohne Status
- Misch-Commits ueber mehrere Kernkomponenten ohne Querschnittsgrund

## Entscheidungsregel fuer Legacy nach dem Neustart
Jede Altspur bekommt genau einen Status:
- `migrieren`
- `archiviert`
- `bewusst legacy`

Ohne solche Entscheidung darf nichts still in die neue Historie gezogen werden.

## Konkrete technische Optionen
### Option 1: Orphan-Branch im bestehenden Repo
Vorteile:
- alte Historie bleibt im selben Repository erreichbar
- neuer Start kann direkt im Projekt erfolgen

Nachteile:
- das Repo bleibt historisch schwerer

### Option 2: Neues sauberes Repository fuer die Zukunft
Vorteile:
- maximal klare operative Trennung
- neue Historie ist vollkommen sauber

Nachteile:
- Archiv und Zukunft liegen an zwei Orten

## Empfehlung
Fuer dieses Projekt wirkt am sinnvollsten:
- alter Stand bleibt als Archiv referenzierbar
- operative Zukunft startet als neue Historie
- die neue Historie wird im selben Projektbestand komponentenweise aufgebaut

## Noch nicht ausgefuehrt
Zum Zeitpunkt dieses Dokuments wurden noch keine destruktiven Git-Schritte ausgefuehrt.
Dieses Dokument ist die Vorbereitung fuer den eigentlichen Cut.
