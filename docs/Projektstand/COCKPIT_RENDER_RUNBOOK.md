# Cockpit Render Runbook

Status: aktiv  
Stand: Donnerstag, 10. September 2026

## Zweck
Dieses Blatt ist die operative Anleitung dafuer,
wie das Projekt im Thread wirklich als Cockpit mit echter Renderseite ausgeliefert werden muss.

Es ist bewusst kein Architekturblatt,
sondern ein Betriebsblatt.

Es soll verhindern, dass in einem neuen Thread vergessen wird:
- welcher Link der richtige ist
- welcher Server die normative lokale Instanz ist
- was als echte Renderseite zaehlt
- wie Vorschau, PDF und Cockpit technisch zusammenhaengen

## Das konkrete Nutzungsmuster, das geliefert werden muss
Die gewuenschte Arbeitsform ist:

- das Cockpit laeuft auf einem lokalen Server
- der Nutzer oeffnet es in einem eigenen Browser-Tab
- rechts gibt es die Bedienseite
- links gibt es die gerenderte Produktansicht
- der Nutzer kann Gleichungen eingeben
- der Nutzer kann die Zielvariable setzen
- der Nutzer kann Cockpit-Farbziele waehlen
- und der Nutzer kann live beobachten, ob die gerenderte Ausgabe korrekt aussieht

Das ist der Referenzmodus fuer "Cockpit mit Renderseite".

## Was "Cockpit mit Renderseite" konkret bedeutet
Wenn der Nutzer das Cockpit verlangt,
ist damit nicht gemeint:
- eine statische Demo
- eine separate Codex-Spalte
- eine simulierte HTML-Nachbildung des Ergebnisses
- ein altes Interface-Experiment

Gemeint ist:
- eine echte lokale Seite im Browser
- mit rechter Bedienflaeche
- und linker produktiver Ausgabe
- die denselben Renderpfad benutzt wie PDF und Vorschau
- auf der Eingabe, Schrittfarben und Sichtpruefung zusammenkommen

## Normativer lokaler Einstieg
Der normative lokale Cockpit-Pfad ist:

- `http://127.0.0.1:4173/`

Wenn eine konkrete Gleichung direkt gezeigt werden soll,
ist der normative Deep Link:

- `http://127.0.0.1:4173/?equation=...&targetVariable=...`

Beispiel:

- `http://127.0.0.1:4173/?equation=a%2Fsin%28alpha%29%3Db%2Fsin%28beta%29&targetVariable=a`

## Was der Nutzer dort tun koennen muss
Die normative Cockpit-Nutzung umfasst heute:

- Gleichung eingeben
- Zielvariable eingeben
- `Start / Go` druecken
- die gerenderte Loesung links ansehen
- `PDF oeffnen` benutzen
- Umformungsschritte ueber die Cockpit-Farbpalette faerben
- sofort sehen, wie diese Farben in die gerenderte Ausgabe eingehen

Wenn diese Punkte nicht moeglich sind,
ist nicht das gewuenschte Cockpit geliefert.

## Standardvorgehen fuer einen neuen Thread
Wenn im Thread verlangt wird,
dass das Cockpit mit echter Renderseite gezeigt werden soll,
ist die Reihenfolge immer:

1. den lokalen Cockpit-Server auf `4173` starten oder frisch neu starten
2. dem Nutzer den Link `http://127.0.0.1:4173/` geben
3. falls gewuenscht einen Deep Link mit Gleichung und Zielvariable geben
4. sicherstellen, dass wirklich der produktive Renderpfad angesprochen wird
5. die sichtbare Ausgabe gegen die aktuelle Vorschau-Datei pruefen
6. pruefen, dass die Cockpit-Farbziele verfuegbar sind, wenn ein passender Fall vorliegt

Nicht zuerst machen:
- keine neue UI erfinden
- keinen Parallelpfad in einer anderen HTML-Datei bauen
- keine "Simulation" der Loesung im Chat beschreiben

## Technische Kette
Die produktive Kette lautet heute:

- `index.html`
- `cockpit.js`
- `scripts/cockpit_server.mjs`
- `core/index.js`
- `presentation/adapters/index.js`
- `components/Arbeitsblatt_Druckansicht/`
- `presentation/column_layout/`
- `scripts/export_projection_pdf_core/latexRendering.js`

Wichtig:
- `core/index.js` loest die Gleichung
- das produktive Cockpit nutzt dabei standardmaessig den aktiven Laufzeitpfad `runtimeEngine = "genesis_runtime"`
- `buildWorksheetViewModel(...)` baut die Sichtstruktur
- `buildLatexDocument(...)` erzeugt die finale Exportfassung
- der Server rendert daraus Vorschau-PNG und PDF

## Der echte Renderpfad des Cockpits
Das Cockpit zeigt nicht direkt eine selbstgebaute HTML-Gleichung,
sondern eine gerenderte Ausgabe.

Der relevante Serverpfad ist:

- `POST /api/render`

Er liefert:
- `previewUrl`
- `pdfUrl`
- Cockpit-Farbziele

Zur Laufzeit schreibt der Server nach:

- `.cockpit-preview/current.tex`
- `.cockpit-preview/current.pdf`
- `.cockpit-preview/current.png`

Davon ist fuer Sichtpruefungen besonders wichtig:

- `.cockpit-preview/current.png`

Das ist die naechste technische Wahrheit zu dem,
was der Nutzer links im Cockpit sieht.

Die Cockpit-Farbsteuerung kommt aus derselben Serverantwort
und darf nicht als zweite lokale Sonderlogik daneben gebaut werden.

## Atomare Uebergabe und Bridge-B-Grenze

Das Cockpit uebernimmt jede von P4 gelieferte sichtbare Zelle genau einmal.
Es darf weder einen zusammengesetzten Ausdruck zu einer Textzelle buendeln
noch fehlende Zellen aus einem Ausdruckstext rekonstruieren.

Fuer einen komplexen Potenzexponenten gelten zwei Ebenen gleichzeitig:

- In der Boundary-Zeile ist der Exponent genau ein aeusserer funktionaler
  Baustein innerhalb der `POWER`-Schale.
- Seine von P4 gelieferten inneren Inhalts-, Operator- und Schalenzellen
  bleiben dennoch einzeln sichtbar und werden vom Cockpit atomar gerendert.

`ein Boundary-Baustein` bedeutet deshalb nicht `eine gebuendelte DOM-/Textzelle`.
Die gemeinsame aeussere Zugehoerigkeit kommt aus dem `POWER`-`shellSpan`.

Erst Bridge B setzt diese innere Zellfolge einmal in kompakte normale
Landing-Slots um. Das Cockpit zeigt diese gelieferten Slots ebenfalls eins zu eins;
es berechnet weder die Kompaktheit noch schreibt es alte Exponentenspalten fort.

## Woran man erkennt, dass man auf dem richtigen Pfad ist
Ein korrekter Cockpit-Lauf erfuellt gleichzeitig:

- die Seite laeuft auf `127.0.0.1:4173`
- der `Start / Go`-Button erzeugt links eine neue gerenderte Ausgabe
- `PDF oeffnen` zeigt dieselbe Gleichung als Export
- `.cockpit-preview/current.png` passt zur sichtbaren linken Seite
- die Cockpit-Farbziele reagieren auf den aktuellen Umformungsfall
- die Farbwahl wird direkt in die gerenderte Ausgabe uebertragen
- die Ausgabe ist kein freihand gesetztes HTML-Experiment

## Server-Regel
Der Standardport ist:

- `4173`

Weitere Ports wie `4182`, `4183` oder andere lokale Testinstanzen sind:
- erlaubt als technische Nebenspuren
- aber nicht normativ

Wenn ein Nutzer von "dem Cockpit" spricht,
ist standardmaessig `4173` gemeint.

## Start- und Neustartregel
Der Cockpit-Server wird lokal ueber diese Datei betrieben:

- `scripts/cockpit_server.mjs`

Normativer Start:

```bash
PORT=4173 node scripts/cockpit_server.mjs
```

Alternativ ueber das Projekt-Script:

```bash
npm run cockpit
```

Wenn die sichtbare Ausgabe alt wirkt,
muss zuerst der Server neu gestartet werden,
bevor man fachliche Rueckschluesse zieht.

## Diagnosefall: "Go tut nichts"
Wenn der Nutzer meldet:
- `Start / Go` tut nichts
- Felder leeren sich
- links bleibt ein alter Zustand stehen
- der Link fuehlt sich falsch an

dann sind die ersten Verdachtsfaelle:

1. falscher oder alter lokaler Serverprozess
2. falscher Tab oder falscher Port
3. alte Vorschau-Datei aus einer frueheren Instanz
4. ein Interface-Pfad, der nicht auf `4173` zeigt

Dann gilt:

1. aktuellen Serverprozess pruefen
2. `4173` frisch starten
3. den Nutzer auf `http://127.0.0.1:4173/` schicken
4. wenn noetig gezielt `POST /api/render` ausloesen
5. `.cockpit-preview/current.png` gegen die sichtbare Ausgabe halten
6. pruefen, ob Cockpit-Farbziele und PDF-Link fuer den aktuellen Lauf mitkommen

## Wichtig fuer neue Threads
Ein neuer Thread darf nie stillschweigend annehmen,
dass das Cockpit "schon irgendwie offen" ist.

Er muss explizit wissen:
- der Standard-Link ist `4173`
- die sichtbare Wahrheit kommt aus `.cockpit-preview/current.png`
- der produktive Renderpfad laeuft ueber `scripts/cockpit_server.mjs`
- `index.html` ist nur die Huelle vor diesem Serverpfad
- die Nutzerarbeit umfasst Eingabe, Faerbung und Live-Sichtkontrolle auf derselben Seite

## Nicht erlaubte Abkuerzungen
Nicht korrekt sind:

- nur `file:///.../index.html` als Endzustand liefern
- eine HTML-Simulation ohne Serverrendering liefern
- das Cockpit in einer Codex-Seitenspalte "genug" finden
- einen Nebenport als Standard ausgeben
- `.cockpit-preview/` als Projektstand statt als Laufzeitordner behandeln

## Praktische Kurzform fuer kuenftige Uebergaben
Wenn der Nutzer spaeter wieder nach dem Cockpit fragt,
reicht als operative Erinnerung:

1. `4173` ist der Standard
2. Cockpit gleich Serverpfad, nicht Dateidemo
3. linke Seite = gerenderte Produktansicht
4. `.cockpit-preview/current.png` ist die schnelle Sichtkontrolle
5. bei Zweifel zuerst Server neu starten, dann erst Code verdaechtigen

## Verifikation nach Aenderungen
Nach Cockpit- oder Renderaenderungen sind mindestens diese Checks sinnvoll:

```bash
node tests/active/latex_p4_export.test.js
node tests/active/arbeitsblatt_druckansicht.test.js
node tests/active/worksheet_display_model.test.js
node tests/active/cockpit_color_targets.test.js
```

Wenn der Eingabepfad beruehrt wurde, zusaetzlich:

```bash
node tests/active/input_adapter.test.js
```

## Merksatz
Das Cockpit ist keine zweite Ansicht des Projekts.
Das Cockpit ist die Bedienhuelle vor derselben gerenderten Wahrheit.
