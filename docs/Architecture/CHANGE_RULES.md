# Change Rules

Status: normativ  
Stand: 5. April 2026

## 1. Lokale Aenderung
Eine lokale Aenderung betrifft genau eine Komponente, wenn:
- ihre Verantwortung gleich bleibt
- ihre Ein- und Ausgaben gleich bleiben
- keine fremden Komponenten angepasst werden muessen

Pflicht im selben Commit:
- Code
- lokale Doku
- lokale oder zugeordnete Tests

## 2. Vertragsaenderung
Eine Vertragsaenderung liegt vor, wenn sich Eingaben, Ausgaben, Feldnamen oder Sichtbarkeitsregeln aendern.

Pflicht im selben Commit:
- lokale Doku der Komponente
- `docs/Architecture/STATE_MODEL.md`
- `docs/Architecture/WIRING_PLAN.md`, falls Verdrahtung betroffen ist
- `docs/Architecture/EXPORT_MODEL.md`, falls externe Verbraucher betroffen sind

## 3. Querschnittsaenderung
Eine Querschnittsaenderung betrifft mehrere Komponenten oder Pfadwelten.

Pflicht:
- in der Commit-Nachricht klar benennen
- in `docs/Projektstand/LESSONS_LEARNED.md` oder einem aktuellen Statusdokument festhalten
- keine Tarnung als rein lokaler Fix

## 4. Adapter-Aenderung
Eine Adapter-Aenderung betrifft Film, Arbeitsblatt, Diagnose oder andere Ausgabeformen.

Pflicht:
- pruefen, ob die Kernwahrheit stabil bleibt
- keine neue Solver-Logik im Adapter verstecken
- Exportprofil und Kernprofil sauber auseinanderhalten

## 5. Nicht erlaubt
- Code aendern und die lokale Doku liegenlassen
- alte Pfade weiterverwenden, ohne den Legacy-Status auszuweisen
- produktive Wahrheit in Diagnose-Komponenten verlagern
- mehrere Komponenten in einem Commit mischen, obwohl keine gemeinsame Vertragsaenderung vorliegt
- Weglassungen oder Animationserleichterungen als Veraenderung der Kernstruktur tarnen
