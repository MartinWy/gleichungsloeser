# Modul-Ampel

Stand: 16. September 2026

## Grundlage

Normativ sind zuerst:

- `docs/Genesis/Neustart_2026-07-28/PROZESSMODELL_UND_SCHALENSTANDARD.md`
- `docs/Genesis/Neustart_2026-07-28/MODULE_MATRIX.md`
- die dort zugeordnete Richtlinie jedes Moduls

Der gemessene Einzelteststand steht in `docs/Architecture/TEST_AMPEL_2026-09-07.md`.

- `gruen`: Richtlinie, verantwortlicher Code und registrierter Beweis stimmen ueberein.
- `gelb`: isoliert oder nur teilweise bewiesen; noch nicht als vollstaendiger Produktivpfad freigegeben.
- `rot`: ein zugeordneter Vertrag ist rot oder der Code uebernimmt eine fremde Aufgabe.

Ein nachgelagerter Verbraucher darf einen Fehler seiner Vorstufe niemals erraten,
ausgleichen oder uebermalen.

## Gesamturteil

Der Standardlauf umfasst 91 aktive Tests. Alle 91 sind gruen; kein aktives
Modul steht wegen eines roten Tests auf Rot. Gelbe Eintraege bezeichnen nur
noch begrenzte oder geplante Ausbauzonen.

31 vorkanonische Tests liegen als historische Referenz unter
`alt/2026-09-10_pre_genesis_tests/`. Sie sind nicht Teil des Produktivlaufs.

## A. Verbindlicher Genesis-Solve-Kern

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| Runtime-Einstieg und Pipeline | gruen | Isolation und Gesamtfluss sind gruen; die Pipeline orchestriert nur. |
| P1 Input | gruen | Zielunabhaengige Operations- und Schalenstruktur direkt geprueft. |
| P2 Strategy | gruen | Targeting, Entscheidungen, Folgen, passive Summenklammer-Aufloesung und gebundene Bruchfaktor-Erkennung gruen. |
| P3 Transformation | gruen | Schalen, Mehrsummandenbindung mit eigener Folgeauflosung, Kehrbruch, seitenabhaengige Aussenanlagerung neuer Faktoren und Transport gruen. |
| Gesamt-Solve-Flow | gruen | Zielwahl, Kosinussatz und Familienfolgen gruen. |
| Legacy-Projektionsadapter | gruen | Schemauebersetzung ohne neue fachliche Geometrie geprueft. |
| Legacy-Solve-Adapter | gruen | Ergebnisuebersetzung ohne zweite Solverlogik geprueft. |

## B. Interne P4-Projektionskette

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| Theoriezeilenaufbau | gruen | Reihenfolge, IDs, Klonung und Geometriefreiheit direkt geprueft. |
| Shell-Bedarfsplan | gruen | Meldet Kindrollen und alle Huellezellansprueche koordinatenfrei vor der Spaltenvergabe. |
| Global Semantic Raster | gruen | Vergibt alle Atom-, Huelle- und Zukunftszellen einmalig und vollstaendig; semantische Identitaet und ununterbrochene Platzierungsspuren sind getrennt, sodass ein spaeterer Wiedereintritt keine fruehere Kindbelegung verbreitert; die vollstaendige Basis einer FUNCTION liegt nachweislich zwischen Name und linker Argumentklammer; jede POWER besitzt ihre beiden Basis-Klammerzellen. |
| Semantic Raster Refinement | gruen | Validiert das vollstaendige Zellprofil, ohne neue Zellansprueche zu erzeugen. |
| Funktionale Profilmaterialisierung | gruen | Liest die feste Geburtslage fuer nachfolgende Band- und Blockvertraege, ohne horizontale Nachkorrektur. |
| Projection Blocks | gruen | Verpackt vorhandene funktionale Geometrie ohne neue Ortsentscheidung; sichtbare POWER-Klammern erhalten die vollstaendige vertikale Basisspanne. |
| Projection Writer | gruen | Schreibt atomare Projektionszellen; keine Sammelcontainer treten aus. |
| Output Contract | gruen | Native Reihen, Spannen und Atomregister sind geprueft. |

## C. Isolierter Bruch-Neustart

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| FractionNeustart | gelb | Geburt und Transport gruen; der Neubau bleibt bis zu einem dokumentierten Andockpunkt isoliert. |

## D. Core-A und Bridge B

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| Core-A-Zielfassade | gruen | Registrierter Fassadentest gruen; kein zweiter Solver. |
| Bridge Boundary Adapter | gruen | Boundary-Adaptertest gruen. |
| Bridge Landing Profile Adapter | gruen | Landing-Adaptertest gruen. |
| Render-Scene Adapter | gruen | Atomare Szenenbreite und Identitaet geprueft. |
| Bridge-Vertragsfassade | gruen | Ziel- und Positionsvertrag gruen. |
| Bridge Transition Step | gruen | Genau ein B-Schritt, inklusive identitaetstreuer Neuvergabe der A2-Termspalten aus einer A1-Exponentenspur, gruen. |
| Reales Bridge-Handoff | gruen | Getrennte Spaltenraeume, Boundary, lokale Landing, atomare freie Logarithmusbasis und exakte A2-Funktionshuelle ohne zweiten Sprung gruen. |

## E. Gemeinsame Vertragsbibliotheken

| Vertragsmodul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| `solve_state` | gruen | Core-A-Vertragseinstieg gruen. |
| `projection_state` | gruen | Render-Scene-Adapter gruen. |
| `bridge_state` | gruen | Boundary, Landing und Transition gruen. |
| `render_scene` | gelb | V1-Einstieg und blinder Ingest gruen; der vollstaendige V2-Negativvertrag ist noch nicht implementiert. |
| `render_settings` | gruen | Designer-Zieleinstieg gruen. |
| `worksheet_profile` | gruen | User-Cockpit-Zieleinstieg gruen. |

Contracts definieren nur Form, Version und Invarianten.
Sie berechnen keine semantische, funktionale oder visuelle Geometrie.

## F. Cockpit, Worksheet und Medien

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| Eingabenormalisierung | gruen | Lexikalischer Adaptertest gruen. |
| Worksheet ViewModel | gruen | Atomare Eins-zu-eins-Abbildung, Zielidentitaet und `side`-Durchreichung gruen. |
| Worksheet DisplayModel | gruen | Display-Slots und atomare Abbildung gruen. |
| Column Layout | gruen | Physische Slotabbildung, Prozessraumtreue sowie Bruch-, Wurzel- und Exponentspuren gruen. |
| Produktiver Render-Kern | gruen | Basiskern und Stretch-Metrik gruen. |
| LaTeX/PDF-Exporter | gruen | Atomare Potenz-, Bruch-, Funktions-, Logarithmus- und Wurzelabbildung gruen. |
| Cockpit-Vorschauauslieferung | gruen | PNG und PDF werden bytegleich innerhalb derselben Renderantwort transportiert und im Browser als lokale Objekt-URLs genutzt; kein Folgezugriff auf ein Instanzdateisystem. |
| Produktives Cockpit | gruen | Serversteuerung, Farbziele, Theorie-Label und Browser-Bundle gruen. |
| Atomarer DOM-Renderer | gruen | Produktiver Druckansichtstest und atomare Zielidentitaet gruen. |

## G. Renderer-Kernel

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| Renderer-Fassade | gruen | Oeffentliche API endet am atomaren Ingest; Negativtest gruen. |
| Render-Scene Ingest | gruen | Vorhandene Szene wird schemafest und ohne Reparatur eingelesen. |
| Atom-Fassade | gelb | Basisbeweis gruen; eigener vollstaendiger Blindheitstest fehlt. |
| Row-Fassade | gelb | Stretch-Beweis gruen; verbleibender Altpfad ist noch auf Inferenzfreiheit zu pruefen. |
| Shell-Fassade | gelb | Bruchstrich-Beweis gruen; verbleibender Altpfad ist noch auf Inferenzfreiheit zu pruefen. |
| Metrics-Fassade | gelb | Reine Metrikpfade gruen, aber noch ohne eigenen fokussierten Modultest. |

Der fruehere Scene Plan sowie die Root- und Group-Rekonstruktionsmodule sind
kein aktiver Renderer-Kernel mehr. Code, Richtlinien, Prototypen und sechs
zugehoerige Tests liegen unter `alt/`.

## H. Ziel-Cockpits und Presentation

| Modul | Ampel | Aktueller Beweis |
| :--- | :---: | :--- |
| `cockpit_user` | gelb | Zieleinstieg, Farben und Theorie-Label gruen; weitere Untermodultests fehlen. |
| `cockpit_designer` | gelb | Zieleinstieg gruen; weitere Untermodultests fehlen. |
| `presentation` | gelb | Fassaden und Farben gruen; weitere fokussierte Teilmodultests fehlen. |

## Naechste Reihenfolge

Es gibt keine rote Reparaturschlange. Weitere Arbeit beginnt deshalb immer an
einem gelben, zuvor dokumentierten Modul und folgt dieser Ordnung:

1. die benoetigte Modulgrenze in Genesis beziehungsweise der lokalen Richtlinie festlegen
2. einen fokussierten Beweis schreiben
3. genau das besitzende Modul implementieren
4. den vollstaendigen Standardlauf ausfuehren

Renderer bleiben dabei reine Abnehmer der funktionalen Core-Geometrie.
