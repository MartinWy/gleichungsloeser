# GenesisRuntime P1 Input Contract

Status: normativer V1-Vertrag; Implementierung wird angeglichen
Stand: 9. September 2026
Vertragsversion: `p1_input_v1`

## Aufgabe
`P1_Input` liest den Eingabestring des neuen Kerns
und baut daraus die erste kanonische Struktur.

Das ist seine einzige Prozessaufgabe.

## Uebergabe

- Vorgaenger: `runtimePipeline` als reiner Orchestrator
- Eingabe: kanonischer Rohauftrag aus Gleichung und Eingabeoptionen
- Ausgabe: vollstaendige, zielunabhaengige semantische Anfangsstruktur
- Nachfolger: `P2_Strategy`

P1 uebergibt entweder eine vollstaendig gueltige Anfangsstruktur
oder einen expliziten Eingabefehler.
Zwischen P1 und P2 darf keine weitere Instanz die semantische Struktur normalisieren.

## Verantwortet
- Quellstring normalisieren
- deterministische Initial-IDs vergeben
- Atome, Operatoren und Schalen lesen
- implizite Multiplikation kanonisieren
- negative Vorzeichen als `NEGATION`-Schale lesen
- Bruchketten als `DIVISION`-Schalen lesen
- Potenzen als `POWER`-Schalen lesen

`Quellstring normalisieren` meint nur die kanonische Kernsyntax innerhalb von P1.
UI-spezifische LaTeX- oder Unicode-Schreibweisen gehoeren in den Input-Adapter.
P1 allein entscheidet danach die semantische Schachtelung der Eingabe.

`Zielunabhaengig` bedeutet:

- dieselbe Gleichung erzeugt unabhaengig von der spaeter gewaehlten Zielvariable dieselbe Anfangsstruktur
- Addition, Subtraktion und Multiplikation werden als kanonische semantische Struktur in P1 festgelegt
- P2 darf zur Strategieauswahl keine fehlende Operationsschale erzeugen lassen
- eine zielabhaengige `COLLECTION`- oder `MULTIPLICATION`-Schale nach P1 ist keine Normalisierung, sondern eine verbotene semantische Umformung ausserhalb von P3

## Liefert
- `contractVersion = "p1_input_v1"`
- `normalizedEquation`
- `namespace`
- `structure`

## Maschinenform der Ausgabe

`structure` ist ausschliesslich die Gleichungshuelle:

```text
[
  genau eine linke Ausdruckswurzel,
  genau ein ANCHOR-Atom "=",
  genau eine rechte Ausdruckswurzel
]
```

Atome besitzen `id`, `type`, `value` und `isVisible`.
Jede sichtbare Operationsschale besitzt `id`, `type`, `isVisible`
und ihre vollstaendigen Kinder in diesen kanonischen Feldern:

| Schale | Kanonische Maschinenfelder |
| :--- | :--- |
| `GROUP` | `content: [root]` |
| `FUNCTION` | `name`, `content: [root]`, optional `baseContent: [root]` |
| `ROOT` | `content: [root]`, `degree`, optional `degreeNodes: [root]` |
| `POWER` | `content: [root]`, `exponentNodes: [root]`, zusaetzlich `exponent` als kanonischer Kurzwert |
| `NEGATION` | `operator`, `content: [root]` |
| `DIVISION` | `numerator: [root]`, `operator`, `denominator: [root]` |
| `MULTIPLICATION` | `factors: [root, ...]`, `operators: [OPERATOR, ...]` |
| `ADDITION` | `terms: [root, ...]`, `operators: [OPERATOR, ...]` |
| `SUBTRACTION` | `minuend: [root]`, `operator`, `subtrahend: [root]` |

`operator` und die Eintraege in `operators`
sind stabile sichtbare `OPERATOR`-Atome aus der Eingabe.
Auch ein impliziter Multiplikationsoperator bleibt als Atom erhalten
und traegt `isImplicit = true`.

`COLLECTION` ist gemaess `SHELLS/COLLECTION.md` keine zulaessige P1-Ausgabe.
Die Felder `target`, `passive`, `factor` und `flowDirection`
sind keine P1-Schalenrollen.

## Praezedenz und Assoziativitaet

P1 baut deterministisch in dieser Reihenfolge:

1. Atome und explizite Gruppen
2. Funktionen, Wurzeln und Potenzen
3. unitaere Negation
4. Multiplikation und Division, linksassoziativ
5. Addition und Subtraktion, linksassoziativ
6. Gleichungshuelle mit genau einem Anker

Dadurch gibt es je Gleichungsseite genau eine Ausdruckswurzel.

## Situationsmatrix

Bis die einzelnen kanonischen Schalenstandards herausgeloest sind,
ist diese Matrix normativ,
aber dokumentarisch noch nicht vollstaendig bewiesen.

| Eingangssituation | P1-Status | P1-Aufgabe |
| :--- | :---: | :--- |
| Atome und Gleichheitsanker | unterstuetzt | kanonisch erkennen und stabile IDs vergeben |
| `GROUP` | unterstuetzt | Inhalt zuerst bauen, danach die Gruppe darum legen |
| `FUNCTION` | unterstuetzt | Argument zuerst bauen, danach die benannte Funktion darum legen |
| `ROOT` | unterstuetzt | Radikand zuerst bauen, danach die Wurzel darum legen |
| `POWER` | unterstuetzt | Basis und Exponent zuerst bauen, danach die Potenzbeziehung bilden |
| `NEGATION` | unterstuetzt | Inhalt zuerst bauen, danach die Negation darum legen |
| `DIVISION` | unterstuetzt | Zaehler und Nenner zuerst bauen, danach die Division bilden |
| `MULTIPLICATION` | unterstuetzt | Faktoren zielunabhaengig als kanonische Multiplikationsstruktur bilden |
| `ADDITION` | unterstuetzt | Summanden zielunabhaengig als kanonische Additionsstruktur bilden |
| `SUBTRACTION` | unterstuetzt | gerichtete Operanden zielunabhaengig als kanonische Subtraktionsstruktur bilden |
| `COLLECTION` | zurueckweisen | `COLLECTION` ist eine P3-Transportschale und niemals P1-Ausgabe |

## Eingabefehler

P1 weist mindestens zurueck:

- keinen oder mehr als einen Gleichheitsanker
- leere linke oder rechte Gleichungsseite
- leere Gruppe, Funktion oder Wurzel
- fehlenden Operanden oder Exponenten
- unbekannte Zeichen und unbekannte Funktionsnamen
- strukturell unbalancierte Klammern
- eine Struktur, die mehr als eine Ausdruckswurzel auf einer Gleichungsseite uebrig liesse

## Darf nicht
- Zielvariable bestimmen
- Umformungsfamilien entscheiden
- zielabhaengige semantische Schalen bauen
- Projektion oder Spalten festlegen
- Imports aus Archiv oder alten Kernpfaden nutzen
- Gruppen nur zur Verkuerzung der spaeteren Loesungshistorie entfernen
- funktionale Reihen, Spalten, Baender oder Renderdaten erzeugen

## Zugeordneter Test

- `tests/active/genesis_runtime_p1_input.test.js`
