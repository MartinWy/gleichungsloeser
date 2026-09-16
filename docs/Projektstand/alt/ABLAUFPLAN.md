# Ablaufplan: Gleichungsloeser

Status: aktiv  
Stand: 5. April 2026

## Zweck
Dieser Ablaufplan beschreibt die Reihenfolge, in der der Gleichungsloeser sauber fertiggestellt werden soll.
Er dient nicht als Ideensammlung, sondern als Arbeits- und Entscheidungsrahmen.

## Leitidee
Das Projekt wird nicht "irgendwie fertig", sondern in kontrollierten Schritten:
1. Zentralarchitektur und Positionstreue absichern
2. aktiven Kern gegen dieses Modell verifizieren
3. Soll-Ist-Luecken schliessen
4. Exportfaehigkeit als offizielle Kernleistung absichern
5. Legacy-Spuren fachlich sortieren
6. Komponentenweise finalisieren
7. Freeze vorbereiten

## Phase 1: Architektur-Boden legen
Ziel:
- Verantwortungen, Datenwelten und Verbote klar dokumentieren
- den Zwei-Durchlauf aus Genesis in die operative Architektur uebersetzen
- den Gleichungsloeser explizit als Projektzentrum festschreiben
- Komponenten lokal beschreiben
- Commit-Regeln pro Komponente festlegen

Status am 5. April 2026:
- weitgehend erledigt

Wichtige Dokumente:
- `PROTOCOL.md`
- `docs/Architecture/KERNARCHITEKTUR.md`
- `docs/Architecture/SYSTEMKARTE.md`
- `docs/Architecture/WIRING_PLAN.md`
- `docs/Architecture/STATE_MODEL.md`
- `docs/Architecture/EXPORT_MODEL.md`
- `docs/Architecture/COMPONENT_COMMIT_POLICY.md`

## Phase 2: Positionstreue und P4 absichern
Ziel:
- die durch Genesis beschriebene Positionstreue als Kernvertrag sichern
- PreFlight und Setzlauf explizit machen
- Topologie nicht als Nebenspur, sondern als Pflichtbereich behandeln

Aktuelle Prioritaeten:
1. `P4_Projektion`: Zwei-Durchlauf sauber operationalisieren
2. aktive Tests fuer Spalten- und Zeilenstabilitaet aufbauen
3. bestehende Topologie-Spuren auf fachliche Relevanz statt auf Dateipfade beurteilen

Abschlusskriterium:
- was sich algebraisch nicht aendert, bewegt sich horizontal nicht
- Loescher verhindern wirklich Nachruecken
- die globale Spaltenlogik ist ueber mehrere Zeilen hinweg testbar

## Phase 3: Aktiven Kern absichern
Ziel:
- sicherstellen, dass die heutige `P1`-bis-`P4`-Pipeline testbar und reproduzierbar laeuft
- den offiziellen Testlauf von alten Testspuren trennen
- `core/index.js` schrittweise zur echten Kernschnittstelle ausbauen

Status am 5. April 2026:
- teilweise erledigt

Ergebnis bisher:
- `npm test` prueft nur die aktive Architektur
- `npm run test:legacy` prueft die alte Testspur getrennt

Massgebliche Dateien:
- `package.json`
- `tests/run_active_tests.js`
- `tests/run_legacy_tests.js`
- `tests/README.md`

## Phase 4: Exportfaehigkeit als Kernleistung absichern
Ziel:
- dieselbe atomare Solve-Geschichte fuer Film, Arbeitsblatt und Diagnose bereitstellen
- Export als offizielle API statt als Nebenprodukt behandeln

Aktuelle Prioritaeten:
1. Rueckgabeobjekt von `core/index.js` in Richtung Kernschnittstelle erweitern
2. Exportmodell mit Theorie, Layout und Projektionsdaten fuellen
3. Ausgabeprofile klar von der Kernwahrheit trennen

Abschlusskriterium:
- ein externer Verbraucher kann die Umbaugeschichte lesen, ohne selbst neu zu loesen
- dieselben IDs bleiben ueber Theorie, Projektion und Export hinweg stabil
- Weglassungen fuer Arbeitsblaetter sind sauber als Ausgabefilter modelliert

## Phase 5: Soll-Ist-Luecken schliessen
Ziel:
- Diskrepanzen zwischen normativer Doku und aktuellem Code abbauen

Aktuelle Prioritaeten:
1. `P4_Projektion`: produktiven Orchestrator naeher an das Zwei-Pass-Zielbild ziehen
2. `P1_Eingabe`: ID-Vertrag fuer einen Solve-Lauf und Exportfaehigkeit sauber umsetzen
3. `P2` und `P3`: API-Sprache vereinheitlichen

Abschlusskriterium:
- jede aktive Komponente sagt in Code, Tests und Doku dasselbe ueber ihren Vertrag

## Phase 6: Legacy-Spuren entscheiden
Ziel:
- alte Test- und Komponentenpfade nicht laenger unklar zwischen "noch relevant" und "historisch" haengen lassen

Zu entscheiden pro Altspur:
- migrieren
- archivieren
- bewusst als legacy stehen lassen

Aktuelle Legacy-Kandidaten:
- `tests/bruch_mechanik.test.js`
- `tests/topologie_check.test.js`
- `tests/core/*`
- `components/FractionVisualizer`
- `components/ID_Inspektor`

Wichtiger Zusatz:
Topologie- und Positionstreue-Tests sind nicht automatisch legacy im fachlichen Sinn. Sie sind nur aktuell technisch auf alte Pfade verdrahtet.

Abschlusskriterium:
- jede Altspur ist entweder migriert oder explizit historisch markiert

## Phase 7: Komponentenweise Finalisierung
Ziel:
- jede aktive Komponente einzeln fertigziehen
- pro Komponente: Code, lokale Doku, Tests, offener Rest

Empfohlene Reihenfolge:
1. `P4_Projektion`
2. `P1_Eingabe`
3. `P2_Strategie_Analyse`
4. `P3_Umformung`
5. `core/index.js`
6. `components/Schalen_Inspektor`

Regel:
- pro Komponente ein Arbeitsblock
- pro Komponente moeglichst ein eigener Commit
- keine Misch-Commits ohne echten Querschnittsgrund

## Phase 8: Projekt-Freeze vorbereiten
Ziel:
- den Gleichungsloeser in einen Zustand bringen, in dem du wieder weisst, "was Sache ist"

Dazu gehoert:
- aktiver Testlauf gruen
- Positionstreue explizit nachgewiesen
- Exportmodell dokumentiert und anschlussfaehig
- Legacy-Status geklaert
- Projektstand aktuell
- Lessons Learned nachgezogen
- keine unerklaerten Schattenpfade mehr

Moegliche Freeze-Dokumente:
- `docs/Projektstand/SYSTEM-FREEZE_<datum>.md`
- `docs/Projektstand/STATUS_<datum>.md`

## Arbeitsprinzip fuer alle naechsten Schritte
- erst eine Komponente verstehen
- dann nur diese Komponente aendern
- lokale Doku sofort mitziehen
- Testlauf direkt danach
- erst dann zur naechsten Komponente wechseln

## Was als Naechstes konkret sinnvoll ist
Der naechste beste Schritt ist:
1. `P4_Projektion` als erste aktive Komponente sauber auf das Zwei-Durchlauf-Modell ziehen
2. `core/index.js` auf eine belastbare Kernschnittstelle ausrichten
3. aktive Tests fuer Positionstreue, globale Spaltenlogik und Exportfaehigkeit bauen
4. danach `P1_Eingabe` und den ID-Vertrag finalisieren

Begruendung:
Positionstreue ist das wichtigste Projektmerkmal. Und solange der Kern nicht sauber exportierbar ist, bleibt auch eine gute Theorie intern gefangen.
