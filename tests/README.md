# Test Uebersicht

## Aktive Tests
Der Standardlauf `npm test` prueft nur die aktuelle `P1`-bis-`P4`-Pipeline.

Stand 15. September 2026:

- `77` Testdateien unter `tests/active/`
- `5` direkte Core-Validierungen
- `82/82` gruen, `0` rot

Aktive Testpfade:
- `core/P1_Eingabe/Validierung.test.js`
- `core/P2_Strategie_Analyse/Validierung.test.js`
- `core/P3_Umformung/Validierung.test.js`
- `core/P3_Umformung/id_invarianz.test.js`
- `core/P4_Projektion/Validierung.test.js`
- `tests/active/core_solve_flow.test.js`
- `tests/active/browser_bundle.test.js`
- `tests/active/arbeitsblatt_druckansicht.test.js`
- `tests/active/p4_positionstreue.test.js`
- `tests/active/p4_mehrschritt_positionstreue.test.js`
- `tests/active/function_slot_cell_separation.test.js`
- `tests/active/global_cell_profile_preflight.test.js`
- `tests/active/target_variable_selection.test.js`

Der neue Positionstreue-Test sichert zusaetzlich ab:
- vertikale Bruchprojektion bleibt an einer stabilen globalen Spalte zentriert
- der Gleichheitsanker bleibt auch bei vertikal aufgefaecherten Folgezeilen stabil
- die unveraenderte Zielvariable driftet bei `fraction_birth` und `fraction_collapse` horizontal nicht

Der globale Zellprofil-Test sichert zusaetzlich ab:

- der koordinatenfreie Shell-Bedarfsplan kommt vor jeder Spaltenvergabe
- Atom- und Huellezellen stehen vor Blocks und Writer mit vollstaendigem `rawColStart`, `rawCol` und `rawColEnd` fest
- spaetere Funktionsnamen und Klammern besitzen bereits in frueheren Theoriezeilen explizit freie Rasterbereiche
- kein nachfolgender P4-Schritt veraendert die im Pre-flight festgelegte horizontale Zellwahrheit

Der neue Mehrschritt-Test sichert zusaetzlich ab:
- die globale Spaltenlogik bleibt ueber `fraction_birth -> trig_inverse` stabil
- die globale Spaltenlogik bleibt ueber `fraction_collapse -> trig_inverse` stabil
- der gruppierte Pflichtfall `sin(x)/(2*3)=5` bleibt ueber Nennerrolle, Faktorrolle und Folgefamilie rueckverfolgbar
- die Kette `fraction_birth -> group_release -> trig_inverse` bleibt fuer `2*(sin(x))=10` spaltenstabil
- aktive Zielspur und Gegenseite driften auch bei Familienwechseln nicht horizontal

Der neue verschachtelte Bruch-Test sichert zusaetzlich ab:
- im Sinussatz nach `beta` behalten `b` und das eingebettete `a` zwischen den letzten beiden Schritten dieselbe Spur
- der PDF-Renderer verschiebt Bruchkinder nicht nachtraeglich horizontal
- alle sichtbaren Bruchstriche verwenden dieselbe globale Strichstaerke statt lokaler Einzelfallwerte

Der neue Zielvariablen-Test sichert zusaetzlich ab:
- Gleichungen mit genau einer Variablen wie `a` werden automatisch auf diese Variable bezogen
- das gilt auch fuer mehrbuchstabige Namen wie `alpha`
- bei mehreren Variablen kann die Zielvariable explizit ueber `solve(equation, { targetVariable })` gewaehlt werden
- andere Variablen werden dann korrekt als passive Ausdruecke behandelt, zum Beispiel in `sin(x)/(2a)=5` bei `targetVariable: "x"`
- dieselbe Passivlogik gilt auch auf der rechten Gleichungsseite, zum Beispiel in `5=sin(m)/(2a)` bei `targetVariable: "m"`
- eine explizit angeforderte Zielvariable, die in der Gleichung gar nicht vorkommt, liefert einen klaren Fehler

Die strukturellen Wurzeltests sichern zusaetzlich ab:

- mehrere passive Summanden werden in P3 als genau ein gebundener
  Subtrahend transportiert; der Renderer darf die Klammer nicht erfinden
- ein passiver Bruchfaktor wird auch durch reine Ein-Kind-Gruppen hindurch in
  P2 erkannt und in P3 als Multiplikation mit dem Kehrbruch ausgefuehrt
- dieselbe Atomidentitaet bleibt auf derselben Gleichungsseite innerhalb eines
  Prozessraums physisch positionstreu
- die B-Boundary beendet den Potenzraum genau einmal; B-Landing und A2 teilen
  danach denselben neuen lokalen Termraum
- der komplexe Exponent bleibt in A1 genau eine aeussere funktionale Spur;
  erst B vergibt fuer die identitaetstreu gelesenen Innenzellen neue kompakte
  A2-Termspalten, und zwar in beiden Gleichungsrichtungen
- A1 und B-Landung/A2 aggregieren ihre physischen Breiten getrennt; nur der
  Gleichheitsanker koppelt beide Raumprofile
- `side` wird als Core-Datum durch das ViewModel transportiert und von keinem
  Verbraucher aus der sichtbaren Lage geraten

Der neue Druckansicht-Test sichert zusaetzlich ab:
- die produktive Root- und Komponenten-UI liest ihre Zeilen direkt aus `projectionRows`
- lineare Inversionsschalen werden nicht doppelt als Container und Teilatome gerendert
- die Druckansicht uebernimmt globale Spaltenbreite, Bruchlinien und die gestapelte Blockhoehe aus der Projektion
- sichtbare Druckzellen werden auch im globalen Arbeitsblattlayout nicht mehr auf dieselbe Grid-Position gelegt
- passive Nicht-Zielvariablen wie `a` bleiben in der gedruckten Gegenseite fachlich lesbar

Der neue Browser-Bundle-Test sichert zusaetzlich ab:
- fuer Root und Komponentenpfad wird ein klassisches Browser-Bundle ohne ES-Modul-Ladezwang erzeugt
- `index.html` und die Druckansicht koennen damit als einfache Browser-Seiten geoefnet werden

## Historische Testspur
Die abgeloesten Topologie-, Solve-, Cockpit- und vorkanonischen Display-Tests liegen nicht mehr zwischen
den produktiven Tests. Sie sind als lesbare historische Referenz unter
`alt/2026-09-10_pre_genesis_tests/tests/` erhalten.

Sie duerfen weder vom Standardlauf importiert noch als heutiger Vertrag gelesen
werden. Ihre heutige Einordnung und ihre aktiven Nachfolger stehen in
`tests/LEGACY_STATUS.md` und im README des Archivs.

Der Archiv-Audit umfasst derzeit einunddreissig eindeutig abgeloeste Tests.
Keiner davon wird im produktiven Lauf ausgefuehrt.

Wichtig:
Ein gruener Standardlauf bedeutet im neuen Repo nur,
dass die aktive Kernspur gruen ist.

Aktueller Arbeitsstand:
- `npm run test:legacy` fuehrt keinen Blindlauf ueber kaputte Altimporte mehr aus, sondern zeigt den expliziten Archiv-Audit.
- die heutige Entscheidung je Altdatei steht in `tests/LEGACY_STATUS.md`
