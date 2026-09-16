# GENESIS CHRONICLE: Register der stabilen Zustaende

Mandat: Dieses Dokument markiert bekannte stabile technische Anker und wichtige Schutzregeln.

| Datum | Achievement / Feature | Technischer Anker | Status |
| :--- | :--- | :--- | :--- |
| 21. Februar 2026 | Symmetrie-Update fuer die alte 0-3-Architektur | `docs/Projektstand/STATUS_2026-02-21.md` | historisch dokumentiert |
| 25. Februar 2026 | Iterative Symmetrie als Meilenstein `v1.9` | `Projektstand/Status_2026-02-25.md` | historisch dokumentiert |
| 5. April 2026 | Architektur-Schicht fuer `P1` bis `P4` plus Komponenten-Doku eingefuehrt | `PROTOCOL.md`, `docs/Architecture/*`, lokale Komponenten-Doku | aktiv |
| 5. April 2026 | Aktiver Testlauf auf die heutige `P1`-bis-`P4`-Architektur umgestellt | `package.json`, `tests/run_active_tests.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 5. April 2026 | Freeze- und Git-Neustart-Entscheidung vorbereitet | `docs/Projektstand/SYSTEM_FREEZE_2026-04-05.md`, `docs/Projektstand/GIT_NEUSTART_PLAN_2026-04-05.md` | vorbereitet |
| 5. April 2026 | Genesis Maschine als fuehrende Textquelle auf den Architekturstand gezogen | `docs/Genesis/README.md`, `docs/Genesis/Genesis-Gleichungsloeser-Maschine (v1.md`, `docs/Step_Semantics.md` | aktiv |
| 5. April 2026 | Semantische Umformungen als Kategoriefamilien beschrieben | `docs/Architecture/KATEGORIEKARTE_UMFORMUNGEN.md` | aktiv |
| 6. April 2026 | Erste Referenzfamilie `root_power` als end-to-end-Familienvertrag angelegt | `docs/Architecture/FAMILIEN/README.md`, `docs/Architecture/FAMILIEN/ROOT_POWER.md` | aktiv |
| 6. April 2026 | `P2` liefert fuer `root_power` eine explizite Familien-Decision | `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P2_Strategie_Analyse/Validierung.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P2` waehlt fuer `root_power` nur noch variabletragende Zielschalen und traegt den Inversionsgrad explizit | `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P2_Strategie_Analyse/CONTRACT.md`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P3` wendet die `root_power`-Decision explizit an und mutiert die Eingabestruktur nicht mehr direkt | `core/P3_Umformung/Regelwerk.js`, `core/P3_Umformung/Validierung.test.js`, `core/index.js` | aktiv |
| 6. April 2026 | `P3` erzeugt inverse `root_power`-Schalen jetzt mit stabiler ID und Herkunftsmetadaten | `core/P3_Umformung/Regelwerk.js`, `core/P3_Umformung/Validierung.test.js`, `core/P3_Umformung/id_invarianz.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P4` gibt auch versteckten `POWER`-Schalen der aktiven Familie `root_power` eine sichtbare `GHOST_HOLE`-Spur | `core/P4_Projektion/LochLogik.js`, `core/P4_Projektion/Validierung.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | Der Orchestrator liefert fuer `root_power` eine kanonische `exportData`-Sicht | `core/index.js`, `core/CONTRACT.md`, `docs/Architecture/EXPORT_MODEL.md`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P4` arbeitet fuer die aktive Kernspur produktiv im echten Zwei-Durchlauf mit PreFlight und Setzlauf | `core/P4_Projektion/PreFlightEngine.js`, `core/P4_Projektion/index.js`, `core/index.js`, `core/P4_Projektion/Validierung.test.js` | aktiv |
| 6. April 2026 | `root_power` ist im aktuellen Familienrahmen end-to-end abgeschlossen | `docs/Architecture/FAMILIEN/ROOT_POWER.md`, `docs/Architecture/EXPORT_MODEL.md`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | Bruchfamilien wurden semantisch nach Richtung getrennt: `fraction_birth` statt unscharfem Multiplikationsblock, mit vorbereiteter Gegenrichtung `fraction_collapse` | `docs/Architecture/KATEGORIEKARTE_UMFORMUNGEN.md`, `docs/Architecture/FAMILIEN/FRACTION_BIRTH.md`, `docs/Architecture/FAMILIEN/FRACTION_COLLAPSE.md` | aktiv |
| 6. April 2026 | `fraction_collapse` ist im aktiven Minimalrahmen produktiv eingezogen: `DIVISION -> MULTIPLICATION` mit parserseitiger DIVISION-Schale und gruener Kernspur | `core/P1_Eingabe/Regelwerk.js`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `core/P4_Projektion/LochLogik.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P4` projiziert sichtbare `DIVISION`-Schalen jetzt topologisch als Zaehler, Bruchstrich und Nenner mit stabilem Shell-Anker | `core/P4_Projektion/Regelwerk.js`, `core/P4_Projektion/index.js`, `core/P4_Projektion/Validierung.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | Bruchfamilien wurden semantisch vom zu engen Faktor-/Einfachnenner-Schnitt auf den Ausdrucksrahmen `x-haltiger Ausdruck` gegen `x-freier passiver Ausdruck` korrigiert und mit Gruppentests abgesichert | `docs/Architecture/FAMILIEN/FRACTION_BIRTH.md`, `docs/Architecture/FAMILIEN/FRACTION_COLLAPSE.md`, `core/P2_Strategie_Analyse/PfadFinder.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | Der produktive Kernrahmen wurde explizit auf genau eine Zielvariable `x` begrenzt; Mehrzielvariablen gehoeren nicht in diesen Solver-Kern | `core/CONTRACT.md`, `docs/Architecture/FAMILIEN/README.md`, `docs/Architecture/STATE_MODEL.md` | aktiv |
| 6. April 2026 | Geschuetzte sichtbare Aussengruppen werden jetzt als eigene Familie `group_release` vor inneren Umbaufamilien freigelegt | `docs/Architecture/FAMILIEN/GROUP_RELEASE.md`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `core/P4_Projektion/Validierung.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | Der Export-/Diagnosepfad fuehrt jetzt rekursives Theorie-Register, Projektionsregister und `traceIndex` fuer tiefere Topologien | `core/index.js`, `docs/Architecture/EXPORT_MODEL.md`, `docs/Architecture/STATE_MODEL.md`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | Additive Richtungsfamilien wurden getrennt eingezogen: `addition_release` fuer `ADDITION -> SUBTRACTION` und `subtraction_release` fuer `SUBTRACTION -> ADDITION` | `docs/Architecture/FAMILIEN/ADDITION_RELEASE.md`, `docs/Architecture/FAMILIEN/SUBTRACTION_RELEASE.md`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P4` projiziert inverse additive Schalen jetzt explizit als Inhalt, Operator und passiven Ausdruck, ohne die Herkunftsspur zu verlieren | `core/P4_Projektion/LochLogik.js`, `core/P4_Projektion/Regelwerk.js`, `core/P4_Projektion/Validierung.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `P1` erzeugt fuer denselben normalisierten Eingabestring jetzt deterministische Initial-IDs; der Exportpfad ist dafuer aktiv abgesichert | `core/P1_Eingabe/Regelwerk.js`, `core/P1_Eingabe/Validierung.test.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `trig_inverse` wurde als gerichtete Familie `sin/cos/tan -> asin/acos/atan` produktiv eingezogen und laeuft jetzt sauber hinter Bruchrichtungen weiter | `docs/Architecture/FAMILIEN/TRIG_INVERSE.md`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `core/P4_Projektion/LochLogik.js`, `tests/active/core_solve_flow.test.js` | aktiv |
| 6. April 2026 | `inverse_trig` wurde als getrennte Gegenfamilie `asin/acos/atan -> sin/cos/tan` produktiv eingezogen | `docs/Architecture/FAMILIEN/INVERSE_TRIG.md`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `core/P4_Projektion/LochLogik.js`, `tests/active/core_solve_flow.test.js` | aktiv |

| 6. April 2026 | Der aktive Kern wurde seitenagnostisch fuer die einzige Zielvariable `x` gemacht; dieselben Familien arbeiten jetzt auch, wenn `x` rechts vom Gleichheitszeichen liegt | `core/index.js`, `core/P3_Umformung/Regelwerk.js`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P4_Projektion/LochLogik.js`, `tests/active/core_solve_flow.test.js`, aktive Familien- und Vertragsdoku | aktiv |
| 6. April 2026 | `negative_sign_release` wurde als eigene Vorzeichenfamilie produktiv eingezogen; ein Vorzeichen direkt vor dem aktiven Ausdruck gilt jetzt als eigene `NEGATION`-Schale und nicht als normale Bruchgeburt | `docs/Architecture/FAMILIEN/NEGATIVE_SIGN_RELEASE.md`, `core/P1_Eingabe/Regelwerk.js`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `core/P4_Projektion/LochLogik.js`, `tests/active/core_solve_flow.test.js`, lokale Vertragsdoku | aktiv |
| 6. April 2026 | `subtrahend_release` wurde als eigene Gegenrichtungsfamilie fuer `2-x` produktiv eingezogen; der Solver trennt jetzt `x-a`, `a-x` und reine Vorzeichenschalen explizit | `docs/Architecture/FAMILIEN/SUBTRAHEND_RELEASE.md`, `core/P2_Strategie_Analyse/PfadFinder.js`, `core/P3_Umformung/Regelwerk.js`, `core/P4_Projektion/Validierung.test.js`, `tests/active/core_solve_flow.test.js`, lokale Vertragsdoku | aktiv |
| 6. April 2026 | Die zeilenweise positionstreue interne Ausgabe wurde explizit als Kernvertrag festgezogen; eine spaetere Nutzeransicht bleibt Adapter auf dieselbe Systemantwort | `docs/Architecture/INTERNAL_OUTPUT_CONTRACT.md`, `docs/Architecture/EXPORT_MODEL.md`, `docs/Core_API.md`, `core/CONTRACT.md` | aktiv |
| 21. Juli 2026 | Die bisher gelebte Cockpit-Betriebsform wurde als Runbook festgeschrieben: lokaler Server auf `4173`, Eingabe rechts, gerenderte Ansicht links, Farben live pruefbar | `docs/Projektstand/COCKPIT_RENDER_RUNBOOK.md`, `docs/Projektstand/STATUS_2026-07-19.md`, `docs/Genesis/Genesis_Gleichungslöser_Mensch.md`, `docs/Genesis/README.md` | aktiv |

## Regressions-Abwehr
- Problem: Eine Phase wird umgebaut, aber die lokale Doku bleibt alt.
  Loesung: Code, lokale Doku und Tests zusammen aendern.
- Problem: Pfade werden umbenannt und Inspektoren oder Tests zeigen weiter auf Altpfade.
  Loesung: Pfadwechsel als Querschnittsaenderung behandeln und in `CHRONICLE` oder `Projektstand` festhalten.
- Problem: Struktur, Transformation und Projektion vermischen sich.
  Loesung: Jede Aenderung gegen `SYSTEMKARTE.md` und `WIRING_PLAN.md` pruefen.
- Problem: Historische Prototypen werden mit produktivem Core verwechselt.
  Loesung: Komponentenstatus explizit als `aktiv`, `prototypisch` oder `legacy` kennzeichnen.
- Problem: Die Historie wird so unuebersichtlich, dass Komponenten nicht mehr einzeln nachvollziehbar sind.
  Loesung: Freeze setzen und danach mit komponentenweiser Commit-Logik neu starten.
- Problem: Neue Umformungen landen als Einzelfallfix im Core.
  Loesung: zuerst Kategorie festlegen, dann Familienvertrag bauen, dann einhaengen.
