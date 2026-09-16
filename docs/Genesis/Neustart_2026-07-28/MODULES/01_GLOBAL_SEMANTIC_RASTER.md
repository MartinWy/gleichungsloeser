# Modul 01: Global Semantic Raster

Status: normativ
Stand: 15. September 2026

## Aufgabe
Dieses Modul erzeugt die einzige globale Ortswahrheit des Systems.

Seine eine Prozessaufgabe lautet:

```text
alle horizontalen funktionalen Zellen ueber alle Theoriezeilen genau einmal festlegen
```

## Uebergabe

- Vorgaenger: Shell-Bedarfsplan
- Eingabevertrag: geordnete, semantisch vollstaendige Theoriezeilen plus vollstaendiger struktureller Zellbedarf aller sichtbaren Schalen
- Ausgabevertrag: vollstaendiges globales Zellprofil mit endgueltigen Atom-, Huelle- und Reservierungszellen
- Nachfolger: Funktionale Schalengeometrie

## Eingabe
- Theoriezeilen
- Atom- und Shell-Identitaeten
- Wissen ueber denselben mathematischen Teilbaum ueber mehrere Zeilen
- strukturelle Blueprints mit allen benoetigten Huellezellrollen, aber ohne Spalten

## Ausgabe
- globale Inhaltsspalten
- explizite Platzierungsspalten pro Gleichungsseite
- Spurbindung desselben Inhalts innerhalb jedes ununterbrochenen Spurabschnitts
  der Zeilenfolge
- endgueltige `colStart`, `col` und `colEnd` jeder Atom- und Huellezelle
- belegte und freigehaltene Bereiche jeder Theoriezeile
- vorbereitete Zukunftszellen fuer spaeter auftretende Schalenhuellen

## Regeln
1. Dieselbe semantische Einheit behaelt dieselbe Spur, solange sie nicht algebraisch veraendert wurde.
2. Spuridentitaet und Zellspanne sind verschiedene Vertragsfelder, werden aber gemeinsam und endgueltig in diesem Modul festgelegt.
3. Dieselbe semantische Einheit darf mehrere explizite Platzierungen besitzen,
   wenn sie im Umbau sichtbar an eine andere Gleichungsstelle wandert. Ein
   Spurabschnitt ist dabei der maximal zusammenhaengende Aufenthalt in
   aufeinanderfolgenden Theoriezeilen auf derselben Gleichungsseite.
4. Diese Mehrfachplatzierung wird hier einmalig entschieden und spaeter nur noch gelesen.
5. Zukunftsbedarf fuer sichere spaetere Schalenhuellen wird hier als konkrete
   freie Koordinatenzelle festgelegt, nicht nur abstrakt vorgemerkt. Die
   konkrete Huellebeziehung baut weiterhin erst die funktionale
   Schalengeometrie. Ihre horizontalen Zellen stehen aber bereits fest und
   duerfen nicht erst zeilenlokal eingeschoben werden.
6. Geschlossene Innenatome werden nicht vorsorglich aufgefaechert, nur weil sie theoretisch spaeter einmal aus ihrer Schale geloest werden koennten.
7. Das Modul kennt keine Medienbox. Es liest jedoch die kanonischen
   funktionalen Zellanforderungen von Bruch, Wurzel, Funktion und allen anderen
   aktiven Schalen, weil sonst kein vollstaendiges globales Profil moeglich ist.
8. Das Modul liefert funktionale Zellorte und -spannen, aber keine Medienbreiten.
9. Zeilenentfaltung, Trace-Aufbau und Spalten-/Placement-Layout sind getrennte Unterbausteine.
10. Dieselbe `sourceAtomId` auf derselben Gleichungsseite behaelt nur innerhalb
    desselben ununterbrochenen Spurabschnitts dieselbe funktionale Spur. Ein
    algebraischer Seitenwechsel, eine Abwesenheit auf dieser Seite mit
    spaeterem Wiedereintritt oder ein dokumentierter Systemwechsel erzeugt
    explizit eine neue Geburtslage. Die semantische Identitaet bleibt dabei
    erhalten.
11. Beim Systemwechsel `A1 -> B -> A2` endet die alte POWER-Spur an der
    Boundary. B setzt genau eine neue Landing-Lage; A2 uebernimmt diese Lage
    ohne einen zweiten Sprung.
12. Die Geburtslage eines spaeteren Spurabschnitts darf keine tatsaechliche
    Kindbelegung einer frueheren Theoriezeile verbreitern. Insbesondere bleiben
    `collectionRanges` eines Bruchs auf die dort aktiven Kindbloecke begrenzt;
    nur `collectionAlignmentRanges` duerfen das gemeinsame Bruchband tragen.

Die Gleichungsseite und der Systemwechsel muessen bereits in den
Uebergabedaten stehen. Kein nachfolgendes Modul darf sie aus Text, Abstand oder
sichtbarer Nachbarschaft erraten.

## Situationsmatrix

| Situation | Status | Rasterregel |
| :--- | :---: | :--- |
| identitaetsstabiles Atom in beliebiger kanonischer Schale | unterstuetzt | dieselbe Spur erhalten |
| algebraisch bewegtes Atom mit expliziter Herkunft | unterstuetzt | alte Identitaet erhalten und pro ununterbrochenem Aufenthalt eine neue Platzierung registrieren |
| neue Schale mit expliziter Herkunft | unterstuetzt | benoetigte Huellezellen und fruehere Leerreservierungen fest zuordnen; keine Huellebeziehung bauen |
| unveraenderte sichtbare oder verborgene Schale | durchreichen | Kindspuren und bestehende Platzierungen nicht veraendern |
| Schalenart ohne kanonischen Standard | zurueckweisen | keine Spalten ueber Heuristik erzeugen |

## Verantwortlicher Codepfad

- `core/GenesisRuntime/P4_Projection/buildGlobalSemanticRaster.js`
- `core/GenesisRuntime/P4_Projection/planGlobalCellPlacement.js`
- `core/GenesisRuntime/P4_Projection/refineSemanticRaster.js`
- `core/GenesisRuntime/P4_Projection/shellLayoutRules.js` als reine Regelbibliothek

Beide Dateien bilden gemeinsam genau dieses Rastermodul.
Kein anderer Pfad darf eine konkurrierende globale Spaltenwahrheit erzeugen.

## Zugeordnete Beweistests

- `tests/active/p4_positionstreue.test.js`
- `tests/active/p4_mehrschritt_positionstreue.test.js`
- `tests/active/genesis_runtime_p4_projection.test.js`
- `tests/active/target_variable_selection.test.js`
- `tests/active/worksheet_process_space_position_fidelity.test.js`
- `tests/active/function_slot_cell_separation.test.js`
- `tests/active/global_cell_profile_preflight.test.js`
- `tests/active/global_semantic_trace_segmentation.test.js`

Alle aktiven Beweistests muessen im Standard-Testlauf registriert sein.

## Verboten
- eine horizontale Zellentscheidung an Shell-Geometrie, Writer oder Renderer zu delegieren
- spaeteres Nachruecken
- Ausgabeprofil-Logik
- stilles Ueberschreiben einer Platzierung durch dieselbe semantische ID
- Zusammenfassen zweier durch einen algebraischen Umzug getrennter Auftritte
  zu einer einzigen Spur
- Zeilen-, Trace- und Platzierungslogik in einer einzigen Sammelfunktion zu verstecken
- Band-, Reihen- oder Achsengeometrie beziehungsweise visuelle Medienbreiten selbst zu bauen
- Shell Blueprints als Nebenausgabe des Raster-Feinschliffs zu erzeugen
