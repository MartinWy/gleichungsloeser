# System Freeze: 5. April 2026

Status: vorbereiteter Freeze-Stand  
Projekt: Gleichungsloeser  
Branch zum Zeitpunkt der Aufnahme: `main`  
Letzter bekannter Commit-Anker: `e5155a03`

## Zweck
Dieses Dokument markiert den Punkt, an dem die bisherige Projektgeschichte
nicht mehr als operative Arbeitsgeschichte weitergefuehrt werden soll.

Ab diesem Freeze gilt:
- die alte Historie bleibt nur noch Archiv
- die operative Zukunft soll mit einer neuen, sauberen Git-Historie beginnen
- die neue Historie wird komponentenweise aufgebaut

## Warum dieser Freeze noetig ist
Der aktuelle Git-Baum ist fachlich nicht wertlos, aber historisch zu laut geworden.
Zu viele Aenderungen, Altpfade, Testspuren und Legacy-Reste liegen gleichzeitig im Sichtfeld.
Dadurch wird schwer erkennbar:
- was zum aktiven Kern gehoert
- was nur historisch ist
- welche Aenderung zu welcher Komponente gehoert

Der Freeze trennt deshalb zwei Dinge:
1. historische Herkunft
2. operative Zukunft

## Was am Freeze-Punkt als kanonisch vorbereitet ist
### Architektur
- `PROTOCOL.md`
- `docs/Architecture/KERNARCHITEKTUR.md`
- `docs/Architecture/SYSTEMKARTE.md`
- `docs/Architecture/WIRING_PLAN.md`
- `docs/Architecture/STATE_MODEL.md`
- `docs/Architecture/EXPORT_MODEL.md`
- `docs/Architecture/CHANGE_RULES.md`
- `docs/Architecture/COMPONENT_COMMIT_POLICY.md`

### Kernkomponenten
- `core/index.js`
- `core/P1_Eingabe/*`
- `core/P2_Strategie_Analyse/*`
- `core/P3_Umformung/*`
- `core/P4_Projektion/*`

### Projektstand
- `docs/Projektstand/ABLAUFPLAN.md`
- `docs/Projektstand/EINSCHAETZUNG_2026-04-05.md`
- `docs/Projektstand/LESSONS_LEARNED.md`
- `docs/Projektstand/STATUS_2026-04-05.md`

### Aktive Testspur
- `package.json`
- `tests/run_active_tests.js`
- `tests/active/*`
- lokale aktive Tests in `core/P2_*`, `core/P3_*`, `core/P4_*`

## Was dieser Freeze noch nicht behauptet
Der Freeze bedeutet nicht, dass das Projekt fachlich fertig ist.
Er bedeutet nur:
- ab hier soll die Zukunft sauber nachvollziehbar werden
- Altlasten sollen die neue Historie nicht mehr verwischen

Weiterhin offen:
- voller Zwei-Durchlauf in `P4`
- stabile IDs in `P1`
- exportfaehige Rueckgabe in `core/index.js`
- Entscheidung pro Legacy-Spur: migrieren oder archivieren

## Operative Regel nach dem Freeze
Ab der neuen Historie wird nicht mehr paketweise ueber das Gesamtprojekt committed.
Stattdessen gilt:
- pro Komponente ein Arbeitsblock
- pro Komponente moeglichst ein eigener Commit
- Querschnittsaenderungen muessen explizit als solche markiert sein

## Archivregel
Die alte Historie soll nicht geloescht werden, sondern nur ihre operative Fuehrungsrolle verlieren.
Empfohlen ist deshalb:
- alter `main` oder bisheriger Stand bleibt referenzierbar
- neuer Start erfolgt getrennt als neue Historie
- der Freeze-Anker bleibt in diesem Dokument festgehalten
