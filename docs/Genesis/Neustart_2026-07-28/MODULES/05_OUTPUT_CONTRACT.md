# Modul 05: Output Contract

Status: normativ
Stand: 15. September 2026

## Aufgabe
Dieses Modul verpackt und validiert die fertige Projektionswahrheit
als einzige Kernschnittstelle fuer alle Ausgabemedien.

Das ist seine einzige Prozessaufgabe.

## Uebergabe

- Vorgaenger: Projection Writer
- Eingabevertrag: vollstaendige geschriebene Projektionszeilen, Schalenauftreten, Trace- und Geometrieobjekte
- Ausgabevertrag: versionierter, vollstaendig validierter Core Output Contract
- Nachfolger: reine Schema-Adapter

## Eingabe
- explizite Projektionsstruktur aus dem Projection Writer

## Ausgabe
- ein stabiles Exportmodell fuer Arbeitsblatt, PDF, Film und Diagnose

## Regeln
1. Alle Medien lesen dieselbe Struktur.
2. Kein Medium darf semantische Orte neu bestimmen.
3. Medien duerfen nur Sichtbarkeits-Slots physisch breit machen.
4. Jede Medienansicht ist Ableitung, nie zweite Wahrheit.
5. Kompatibilitaet zu aelteren Ausgabepfaden entsteht nur ueber explizite Adapter.
6. Ein Adapter darf Reihen und Felder umformen, aber keine semantischen Orte neu berechnen.
7. Register- und Trace-Aufbau sind eigene Unterbausteine.
8. Layoutplan und Medienprofile sind eigene Unterbausteine.
9. Jeder Projektionsblock liefert seine innere Teilzeilenstruktur explizit.
10. Die Achsenzeile eines Blocks ist Kerninformation und nicht Renderer-Heuristik.
11. `=` und aeusserer Haupt-Bruchstrich derselben Struktur fluchten auf derselben Achsenzeile.
12. Renderer und Adapter duerfen Teilzeilen physisch ausformen, aber nicht logisch umdeuten.
13. Wenn ein Medium fuer eine saubere Darstellung weitere Rollen braucht, muessen diese upstream explizit geliefert werden.
14. Sichtbare Brueche folgen dem Teilvertrag `docs/Architecture/BRUCH_VERTRAG_V2.md`.
15. Geschlossene sichtbare Schalen duerfen als Block exportiert werden, aber nur zusaetzlich zur atomaren Innenwahrheit.
16. Ein geschlossener sichtbarer Block ist eine Exportform, keine neue Semantik.
17. Wenn eine Schale spaeter geoeffnet wird, darf kein Medium neue Innenordnung erzeugen; sichtbar werden darf nur bereits exportierte Innenordnung.
18. Funktionale Geometrie und visuelle Geometrie werden strikt getrennt.
19. Der Core exportiert Spuren, Baender, Reihen, Achsen, Kindzugehoerigkeit und funktionale Huelleprimitive.
20. Renderer bauen daraus Pixel-, `em`- oder Papiergeometrie, ohne die funktionale Wahrheit zu veraendern.
21. Fuer jede sichtbare Schale ist explizit angegeben, ob atomare Primitive, Shell-Primitive oder eine geschlossene Blockform sichtbar gesetzt werden.
22. Mehrspaltige Atomzellen sowie disjunkte Hook-/Overbar-Spannen werden
    unveraendert verpackt; das Output-Modul darf daraus keine neue Ausrichtung bauen.
23. Das vollstaendige globale Zellprofil mit Atomzellen, Huellezellen,
    Belegungsbereichen und leeren Reservierungsbereichen wird mit demselben
    globalen Seitenoffset wie die Projektionsatome verpackt.

## Situationsmatrix

| Situation | Status | Output-Regel |
| :--- | :---: | :--- |
| vollstaendiges Projektionsatom | unterstuetzt | alle Pflichtfelder unveraendert verpacken |
| vollstaendiges Schalenauftreten | unterstuetzt | Identitaet, Kinder, Baender, Reihen, Primitive und Darstellungsform unveraendert verpacken |
| explizit unsichtbares Auftreten | durchreichen | Sichtzustand und funktionale Spur erhalten |
| unbekannte optionale Metadaten | durchreichen | ohne fachliche Deutung erhalten, sofern die Vertragsversion sie erlaubt |
| fehlende Pflichtgeometrie oder ungueltige Referenz | zurueckweisen | keinen Wert aus Nachbarn, Text oder Bounds rekonstruieren |

## Doppelte Wahrheit bei geschlossenen Schalen

Wenn ein Ausdruck im aktuellen Umformungsschritt algebraisch geschlossen bleibt,
muessen zwei Wahrheiten gleichzeitig im Exportmodell stehen:

1. die innere Atomwahrheit
2. die sichtbare geschlossene Blockform

Beispiele:

- ein sichtbarer Bruch
- `sin(alpha)`
- `asin(...)`
- eine Klammergruppe

Die Blockform darf:

- als Ganzes weitergereicht werden
- als Ganzes in eine neue aeussere Schale eintreten
- vom Renderer direkt als geschlossene Form gezeichnet werden

Die Blockform darf nicht:

- ihre Innenatome ersetzen
- dem Renderer erlauben, die Innenstruktur neu zu erfinden
- innere Spalten oder Teilzeilen beim Oeffnen neu zu vergeben

Der Renderer darf nicht selbst zwischen den drei exportierten Ebenen waehlen.
Die sichtbare Darstellungsform ist Teil des Output Contract.
So werden weder Inhalte eigenmaechtig gebuendelt
noch Block und Innenprimitive doppelt gezeichnet.

## Verantwortlicher Codepfad

- `core/GenesisRuntime/P4_Projection/buildOutputContract.js`

## Zugeordnete Beweistests

- `tests/active/genesis_runtime_bridge.test.js`
- `tests/active/core_a_render_scene_adapter.test.js`
- `tests/active/render_scene_contract_entrypoint.test.js`
- `tests/active/latex_export_display_slot_fidelity.test.js`
- `tests/active/fraction_collection_alignment.test.js`
- `tests/active/root_primitive_cell_separation.test.js`
- `tests/active/global_cell_profile_preflight.test.js`

Alle aktiven Beweistests muessen im Standard-Testlauf registriert sein.

## Verboten
- Rekonstruktion semantischer Spannen
- lokale Nachkorrektur von Bruch oder Wurzel
- mathematische Umschreibung fuer eine schoenere Darstellung
- Legacy-Kompatibilitaet direkt in Writer oder Renderer verstecken
- Trace-, Register- oder Layoutlogik stillschweigend in einer grossen Sammelfunktion verstecken
- visuelle Pixel-, Font- oder Papiermasse als funktionale Core-Wahrheit ausgeben
- Spalten, Bounds, Anker oder Schalenlagen fuer einen unvollstaendigen Writer-Output neu berechnen
