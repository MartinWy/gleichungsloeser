# Modul 02: Shell Blueprints

Status: normativ
Stand: 15. September 2026

## Aufgabe
Dieses Modul beschreibt vor der globalen Spaltenvergabe den vollstaendigen
strukturellen Zellbedarf aller sichtbaren Schalen.

Seine eine Prozessaufgabe lautet:

```text
fuer jede sichtbare kanonische Schale einen koordinatenfreien Zellbedarfsplan beschreiben
```

## Uebergabe

- Vorgaenger: Theoriezeilenaufbau
- Eingabevertrag: vollstaendige Theoriezeilen ohne Geometrie
- Ausgabevertrag: vollstaendige Shell Blueprints mit Kindrollen und Huellezellbedarf, aber ohne horizontale Koordinaten
- Nachfolger: Global Semantic Raster

## Eingabe
- sichtbare Theoriezustande

## Ausgabe
- Kind- und Inhaltsrollen
- benoetigte Shell-Slotrollen
- explizite Beziehungen zwischen Inhalt und sichtbarer Schale

## Regeln
1. Der Blueprint beschreibt die Schale aus der bestehenden semantischen Eltern-Kind-Struktur.
2. Blueprints duerfen keine Spalten oder Spaltenspannen vergeben.
3. Bruch, Wurzel, Funktion, Gruppe und Potenz folgen demselben Prinzip.
4. Rechte Klammern, Bruchstriche und Wurzelhaken melden eigene Shell-Zellansprueche.
5. Sichtbarkeits-/Boundary-Sammlung und Blueprint-Aufbau sind getrennte Unterbausteine.
6. Die semantische Kindzugehoerigkeit kommt aus `P1` und `P3` und wird hier nur gelesen.
7. Blueprints werden von innen nach aussen verarbeitet: innere Schalen vor aeusseren Schalen.
8. Der Blueprint benennt die benoetigten funktionalen Huelleprimitive, aber keine Pixel- oder Fontmasse.

## Situationsmatrix

| Schalenart | Status | Blueprint-Aufgabe |
| :--- | :---: | :--- |
| `GROUP` | unterstuetzt | linke und rechte funktionale Begrenzung um bestehende Kindspuren beschreiben |
| `FUNCTION` | unterstuetzt | Funktionsname, Begrenzung und Argumentrolle beschreiben |
| `ROOT` | unterstuetzt | Haken-, Oberstrich- und Radikandrollen beschreiben |
| `POWER` | unterstuetzt | Basis- und Exponentenrollen sowie deren funktionale Beziehung beschreiben |
| `NEGATION` | unterstuetzt | Vorzeichen- und Inhaltsrolle beschreiben |
| `DIVISION` | unterstuetzt | Zaehler-, Achsen- und Nennerrollen beschreiben |
| `MULTIPLICATION`, `ADDITION`, `SUBTRACTION` | unterstuetzt | vorhandene lineare Kind- und Operatorrollen beschreiben; keine neuen Operatoren erzeugen |
| unveraenderte verborgene Schale | durchreichen | expliziten Sichtzustand erhalten; keine sichtbare Ersatzhuelle erfinden |
| `COLLECTION` oder andere Schale ohne kanonischen Standard | zurueckweisen | keinen Blueprint aus Inhalt oder Text ableiten |

## Verantwortlicher Codepfad

- `core/GenesisRuntime/P4_Projection/buildShellBlueprints.js`

## Zugeordnete Beweistests

- `tests/active/genesis_runtime_p4_projection.test.js`
- `tests/active/law_of_sines_start_shell_primitives.test.js`
- `tests/active/fraction_line_no_fraction_rendernode.test.js`

Alle aktiven Beweistests muessen im Standard-Testlauf registriert sein.

## Verboten
- denselben Inhalt innerhalb der Schale neu zu verteilen
- Inhalte lokal in der Schale zu zentrieren
- innere Breiten aus Boxlogik neu zu berechnen
- Sichtbarkeits- und Blueprintlogik in einer einzigen Sammelfunktion zu verstecken
- Kindzugehoerigkeit aus sichtbarem Text oder Nachbarraum zu rekonstruieren
- visuelle Renderer-Geometrie zu erzeugen
- Rasterspuren zu verschieben oder neue Zukunftsspalten anzulegen
- `rawCol`, `rawColStart` oder `rawColEnd` auszugeben
