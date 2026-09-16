# Vertrag: Function Notation

Stand: 16. September 2026

## Eine Aufgabe

`functionNotation.js` normalisiert ausschliesslich den sichtbaren Namen einer
bereits bestimmten Funktion und ihre bereits gelieferte optionale Basis.

Es entscheidet nicht:

- welche Umformung auszufuehren ist
- wo Funktion, Basis oder Argument liegen
- welche Zellen zusammengehoeren
- wie Klammern oder Brueche gezeichnet werden

## Kanonische Abbildung

| gelieferter Name | gelieferte Basis | sichtbarer Kopf |
| :--- | :--- | :--- |
| `ln` | beliebig | `ln` ohne zusaetzliche Basis |
| `lg` | beliebig | `lg` ohne zusaetzliche Basis |
| `log` | `2` | `lg` |
| `log` | `e` | `ln` |
| `log` | `10` oder leer | `log` |
| `log` | sonstige Basis | semantischer Diagnosekopf `log_<Basis>` |
| sonstige Funktion | optionale Basis | Name, bei Bedarf mit gelieferter Basis |

Die Abbildung veraendert nur die semantische Beschriftung. Eine freie
Funktionsbasis bleibt eine eigene funktionale Zelle; ein Renderer oder eine
Bridge darf sie nicht mit dem Namen zu einer gemeinsamen Zelle verbinden.

Der Wert `displayHead = log_<Basis>` ist ausschliesslich ein Vergleichs- und
Diagnosewert. Im atomaren Output gelten zwingend getrennte Zellen fuer:

```text
function_name = log
function_base = <Basis>
function_left_paren = (
content = ...
function_right_paren = )
```

Keine dieser Zellen darf durch `log_<Basis>` ersetzt werden.

Bei vorhandener Basis ist auch ihre horizontale Reihenfolge bereits Teil des
Core-Vertrags:

```text
function_name < function_base < function_left_paren < content < function_right_paren
```

Bei einer mehrzelligen Basis steht anstelle von `function_base` deren
vollstaendige Zellspanne. Dieses Modul und der Renderer duerfen diese Ordnung
weder herstellen noch korrigieren.

## Beweistest

- `tests/active/logarithm_notation_regression.test.js`
