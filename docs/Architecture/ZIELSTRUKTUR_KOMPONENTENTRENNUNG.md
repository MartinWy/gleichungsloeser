# Zielstruktur: Komponententrennung

Status: normatives Zielbild  
Stand: 9. August 2026

## Zweck

Dieses Blatt beantwortet die Frage,
wie der Gleichungsloeser auf Ordnerebene so getrennt werden kann,
dass einzelne Projektteile veraendert werden koennen,
ohne die anderen Teile zu gefaehrden.

Die Trennung soll nicht nur gedanklich,
sondern auch auf Datei- und Importebene gelten.

## Kurzantwort

Ja, diese Trennung ist moeglich.

Sie sollte aber nicht aus vier,
sondern aus **fuenf** fachlichen Hauptkomponenten bestehen:

1. `core_a`
2. `bridge_b`
3. `renderer_kernel`
4. `cockpit_user`
5. `cockpit_designer`

Der zusaetzliche Baustein `renderer_kernel`
ist noetig,
weil der bisherige Kern sonst weiter eine Doppelrolle haette:
Mathematik **und** Geometrie.

## Leitprinzip

```text
Jede Hauptkomponente hat genau eine primaere Verantwortung
und spricht mit den anderen nur ueber explizite Contracts.
```

## Harte Migrationsregel

```text
Wir verschieben keine produktiven Dateien.
Wir kopieren in neue Zielstrukturen oder schreiben sauber neu.
```

Begruendung:

- der alte Pfad bleibt lauffaehig
- der neue Pfad kann separat getestet werden
- gebastelte Altdateien muessen nicht konserviert werden
- Rueckbau bleibt jederzeit moeglich

Wenn ein vorhandener Baustein:

- vermischt,
- unklar,
- mehrfach ueberschrieben
- oder sichtbar geflickt

ist,
dann wird er fuer die neue Struktur nicht verschoben,
sondern durch einen sauberen Neubau ersetzt.

## Zielbaum

```text
Gleichungsloeser/
|
+-- core_a/
|   +-- README.md
|   +-- index.js
|   +-- P1_Eingabe/
|   +-- P2_Strategie_Analyse/
|   +-- P3_Umformung/
|   +-- P4_Projektion/
|   +-- adapters/
|   +-- contracts_out/
|   `-- tests/
|
+-- bridge_b/
|   +-- README.md
|   +-- index.js
|   +-- contracts_in/
|   +-- contracts_out/
|   +-- scene_logic/
|   +-- layout_bridge/
|   `-- tests/
|
+-- renderer_kernel/
|   +-- README.md
|   +-- atoms/
|   +-- shells/
|   +-- fractions/
|   +-- roots/
|   +-- exponents/
|   +-- rows/
|   +-- bounds/
|   +-- metrics/
|   +-- export/
|   `-- tests/
|
+-- cockpit_user/
|   +-- README.md
|   +-- ui/
|   +-- worksheet_controls/
|   +-- visibility_controls/
|   +-- color_controls/
|   +-- export_controls/
|   +-- adapters/
|   `-- tests/
|
+-- cockpit_designer/
|   +-- README.md
|   +-- ui/
|   +-- root_controls/
|   +-- parenthesis_controls/
|   +-- exponent_controls/
|   +-- diagnostics/
|   +-- adapters/
|   `-- tests/
|
+-- contracts/
|   +-- solve_state/
|   +-- projection_state/
|   +-- bridge_state/
|   +-- render_scene/
|   +-- render_settings/
|   `-- worksheet_profile/
|
+-- shared/
|   +-- ids/
|   +-- util/
|   `-- validation/
|
+-- scripts/
+-- tests/
+-- docs/
|
`-- incubation/
    +-- complex_exponent_transition/
    `-- complex_expression_rendering/
```

## Verantwortungen

### 1. `core_a`

Verantwortung:

- mathematische Kernwahrheit
- Loesungsstrategie
- Theoriezeilen
- positionstreue Solve-Zustaende
- kanonische Exportdaten fuer andere Systeme

Darf nicht:

- Zoomlogik bauen
- Uebergangsszenen bauen
- Designer-UI enthalten
- Renderfeinheiten direkt an UI-Reglern aufhaengen

### 2. `bridge_b`

Verantwortung:

- genau der Spezialfall
  `komplexer Exponent -> normaler Termraum`
- visueller und struktureller Brueckenschritt
- Einlesen des stabilen Vorzustands
- Erzeugen des stabilen Nachzustands
- optional Erzeugen von Zwischenzustand oder Filmszene

Darf nicht:

- `core_a` ueberschreiben
- neue Solverregeln fuer allgemeine Gleichungen erfinden
- sich direkt in P1 bis P4 einklinken

### 3. `renderer_kernel`

Verantwortung:

- Geometrie von Atomen
- Geometrie von Wurzeln
- Geometrie von Klammern
- Geometrie von Exponenten
- Bounds-Kaskaden
- Zeilenhoehen
- Shell-Projektion
- PDF-/SVG-/Preview-nahe Renderdaten

Wichtig:

`renderer_kernel` ist **nicht** der Solver.
Er kennt keine Umformungsstrategie.
Er kennt nur Renderstrukturen und Renderregeln.

### 4. `cockpit_user`

Verantwortung:

- rechtes Cockpit
- Aufgabenformatierung durch den Nutzer
- Sichtbarkeit von Zeilen
- Sichtbarkeit von Atomen
- Farbzuweisung fuer didaktische Aufgaben
- Exportoptionen fuer Arbeitsblatt und PDF

Der Nutzer aendert hier nicht die Geometrie des Systems,
sondern nur die Darstellung einer konkreten Aufgabe.

### 5. `cockpit_designer`

Verantwortung:

- linkes Cockpit
- globale Render-Stellschrauben
- Wurzelparameter
- Klammerparameter
- Exponentenparameter
- Diagnose- und Stresstest-Ansichten

Dieses Cockpit arbeitet nicht auf Aufgabenebene,
sondern auf Renderer-Ebene.

## Warum die Trennung nur mit `renderer_kernel` sauber ist

Ohne `renderer_kernel`
wuerden sowohl `core_a` als auch `bridge_b`
eigene Renderannahmen tragen.

Dann gaebe es zwei Gefahren:

1. Mathematik und Geometrie bleiben vermischt.
2. `core_a` und `bridge_b` laufen renderseitig auseinander.

Darum gilt:

```text
Core A und Bridge B liefern Strukturen.
Der Renderer-Kernel setzt Geometrie.
Beide Cockpits steuern nur ueber Contracts,
nicht ueber direkte Eingriffe in den Solver.
```

## Importregeln

### Erlaubt

- `cockpit_user -> contracts`
- `cockpit_user -> renderer_kernel`
- `cockpit_user -> core_a` nur ueber Adapter
- `cockpit_designer -> contracts`
- `cockpit_designer -> renderer_kernel`
- `bridge_b -> contracts`
- `bridge_b -> renderer_kernel`
- `core_a -> contracts`
- `tests/* -> alle Zielkomponenten`

### Verboten

- `core_a -> bridge_b`
- `core_a -> cockpit_user`
- `core_a -> cockpit_designer`
- `bridge_b -> core_a/P*` direkt
- `bridge_b -> cockpit_user`
- `bridge_b -> cockpit_designer`
- `renderer_kernel -> core_a`
- `renderer_kernel -> bridge_b`
- `cockpit_user -> core_a/P*` direkt
- `cockpit_designer -> core_a/P*` direkt

## Mapping vom heutigen Stand auf das Zielbild

### Heute -> Ziel

| Heute | Ziel |
| :--- | :--- |
| `core/` | `core_a/` |
| `projects/complex_exponent_transition/` | spaeter `bridge_b/`, bis dahin `incubation/complex_exponent_transition/` |
| `projects/complex_expression_rendering/` | spaeter aufgeteilt in `renderer_kernel/` und `cockpit_designer/`, bis dahin `incubation/complex_expression_rendering/` |
| `presentation/render_kernel/` | spaeter in `renderer_kernel/` integrieren |
| `components/Arbeitsblatt_Druckansicht/` | spaeter `cockpit_user/` |
| Diagnose-Inspektoren | spaeter `cockpit_designer/diagnostics/` oder `legacy/` |

## Migrationsregel

Der Umbau darf nicht als grosser Sprung passieren.
Er muss in kontrollierten Schritten erfolgen.

Dabei gilt zusaetzlich:

- kein produktiver Move
- keine Umbenennung als erster Schritt
- keine Loeschung des alten Pfads,
  solange der neue Pfad nicht bewiesen stabil ist

### Phase 0

Freeze-Punkt sichern.

Erledigt mit Commit:

```text
bbca993
Checkpoint separated transition and renderer workstreams
```

### Phase 1

Nur Dokumente und Contracts festlegen.
Noch keine produktiven Verschiebungen.

### Phase 2

Leere Zielordner mit `README.md` anlegen.
Noch keine inhaltlichen Moves.

### Phase 3

`bridge_b` als lesende Komponente isolieren.
Der bisherige Spezialpfad bleibt funktional unveraendert,
wird aber fachlich in den neuen Ordner kopiert
oder dort sauber neu aufgebaut.

### Phase 4

`renderer_kernel` aus den heutigen Renderbausteinen herausziehen:

- aktuelle Rendergeometrie
- Shell-Regeln
- Bounds-Kaskaden
- Preview-Ausgabe

Auch hier gilt:

- zuerst Re-Export oder Kopie
- erst spaeter moegliche Archivierung des alten Pfads

### Phase 5

`cockpit_designer` an `renderer_kernel` anschliessen.
Die heutigen globalen Stellschrauben werden dorthin uebernommen.

### Phase 6

`cockpit_user` an `core_a` und `renderer_kernel` anschliessen.
Dabei bleiben Aufgabenformatierung und Renderfeinjustierung getrennt.

### Phase 7

Legacy- und Uebergangsordner markieren oder archivieren.

## Was heute noch **nicht** gemacht werden soll

Heute soll noch **nicht**:

- `core/` verschoben werden
- `components/Arbeitsblatt_Druckansicht/` verschoben werden
- `presentation/render_kernel/` auseinandergerissen werden
- der aktive Browser-Einstieg neu verdrahtet werden

Heute soll nur das Zielbild festgelegt werden.

## Entscheidungsregel fuer den naechsten Umbau

Der erste echte Strukturumbau sollte **nicht**
mit `core_a` beginnen.

Er sollte mit dem am wenigsten gefaehrlichen Bereich beginnen:

1. `renderer_kernel` vorbereiten
2. `cockpit_designer` andocken
3. erst danach `bridge_b`
4. `core_a` zuletzt umbenennen oder umhaengen

So bleibt der produktive Kern am laengsten unberuehrt.

## Ergebnis

Die gewuenschte Trennung ist nicht nur moeglich,
sondern sinnvoll.

Die fachlich saubere Form ist:

```text
Core A
Bridge B
Renderer-Kernel
Cockpit User
Cockpit Designer
```

und **nicht** nur:

```text
Core A
Core B
Cockpit User
Cockpit Designer
```

weil sonst die Renderverantwortung wieder in den Kernen landet.
