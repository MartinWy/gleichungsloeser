# Input-Adapter-Vertrag

Status: Richtlinie, Code und fokussierter Standardtest vorhanden
Stand: 7. September 2026

## Aufgabe

Der Input-Adapter uebersetzt verschiedene Schreibweisen derselben Eingabe
in genau eine kanonische Textsyntax fuer P1.

Er beantwortet nur:

```text
Wie wird dieselbe vom Benutzer eingegebene Struktur in der Syntax von P1 geschrieben?
```

## Eingabe und Ausgabe

Verantwortliche Funktionen:

- `normalizeEquationInput(value)`
- `normalizeTargetVariableInput(value)`

`normalizeEquationInput` liefert mindestens:

- den unveraenderten Rohwert
- den normalisierten Wert
- ein explizites Signal, ob sich die Schreibweise geaendert hat

## Erlaubt

- Unicode-Operatoren bedeutungsgleich normalisieren
- LaTeX-Kommandos fuer Wurzel, Bruch, Funktion, Potenz und griechische Namen in kanonische Syntax uebersetzen
- reine LaTeX-Transportklammern in die entsprechenden kanonischen Strukturzeichen uebertragen
- Leerraum und andere rein lexikalische Oberflaechenunterschiede normalisieren
- Zielvariablennamen lexikalisch normalisieren

## Verboten

- Gruppen entfernen, nur um spaetere Loesungsschritte zu sparen
- Terme vereinfachen oder umordnen
- implizite Multiplikation fachlich anders deuten als P1
- Zielvariable oder naechste Familie bestimmen
- `group_release` oder eine andere P2-Decision unterdruecken
- Core-Fehler durch eine alternative Eingabestruktur umgehen
- Projektions- oder Renderdaten erzeugen

Der Adapter darf Quellsyntax abbauen,
aber keine semantische Schale abbauen.
Ob eine kanonische `GROUP` mathematisch freigegeben wird,
entscheidet ausschliesslich P2/P3.

## Verantwortlicher Code

- `components/Arbeitsblatt_Druckansicht/inputAdapter.js`

## Testvertrag

Der fokussierte Adaptertest ist:

- `tests/active/input_adapter.test.js`

Er prueft ausschliesslich:

- Rohwert, Normalform und Aenderungssignal
- Gleichungs- und Zielvariablennormalisierung
- parsebare kanonische Syntax
- Abwesenheit jeder Solver- oder Familienentscheidung

Komplette Solver-Familienfolgen liegen getrennt in:

- `tests/active/genesis_runtime_p2_sequences.test.js`

Dieser P2-Test erwartet nach `fraction_collapse` ausdruecklich
die vom aktiven P2-Vertrag geforderte `group_release`.

## Nachweisbedingung

Der fokussierte registrierte Test beweist:

1. verschiedene Schreibweisen derselben Struktur ergeben dieselbe kanonische Eingabe
2. explizite mathematische Gruppierung bleibt erhalten
3. der Adapter erzeugt weder Zielwahl noch Familienentscheidungen
4. P1 erhaelt eine parsebare kanonische Syntax
