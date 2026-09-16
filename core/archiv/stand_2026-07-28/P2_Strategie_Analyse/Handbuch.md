# Handbuch: Phase P2 - Strategie-Analyse
Quelle: Genesis-Gleichungslöser-Maschine (v2.0)

## Die Normative Instanz
Die Strategie ist die normative Instanz. Sie entscheidet nicht *wie* gerechnet wird, sondern *was* zulaessig ist. Der Gleichungsloeser agiert als **reiner Struktur-Solver**.

## Arbeitszentrum und Zwiebelschalenprinzip
- **Arbeitszentrum:** Die gesuchte Groesse ist im aktiven Kern genau eine aktiv gewaehlte Zielvariable; ihr Name ist frei waehlbar.
- **Zwiebelschalenprinzip:** Eine Gleichung wird strikt von aussen nach innen abgebaut. Es darf nur die aeusserste wirksame sichtbare Huellschale oder Huellrichtung bearbeitet werden, die die Zielvariable traegt.

## Tresor-Prinzip & Veto-Zwang
- Innere Strukturen sind fuer den Solver eine Blackbox, solange ihre Huellschale nicht an der Reihe ist. Eine wirksame Schale schuetzt ihren Inhaltsraum vollstaendig.
- **Veto-Zwang:** Versuche, Terme arithmetisch zu vereinfachen, werden durch ein aktives Veto unterbunden.

## Familien-Decision als Arbeitsformat
P2 liefert fuer aktive Kategorien keine blosse Aktionsbezeichnung mehr, sondern eine explizite Familien-Decision.

Aktiver Stand heute:
- `group_release` fuer geschuetzte sichtbare Aussengruppen
- `negative_sign_release` fuer `NEGATION -> NEGATION`
- `addition_release` fuer `ADDITION -> SUBTRACTION`
- `subtraction_release` fuer `SUBTRACTION -> ADDITION`
- `subtrahend_release` fuer `SUBTRACTION -> SUBTRACTION + NEGATION`
- `fraction_birth` fuer `MULTIPLICATION -> DIVISION`
- `fraction_collapse` fuer `DIVISION -> MULTIPLICATION`
- `trig_inverse` fuer `sin/cos/tan -> asin/acos/atan`
- `inverse_trig` fuer `asin/acos/atan -> sin/cos/tan`
- `root_power` fuer `ROOT <-> POWER`
- `argumentScope: "active_side_only"` markiert reine Struktur-Freilegung ohne Inversion der Gegenseite
- `argumentScope: "whole_opposite_side"` markiert Familien, die die gesamte Gegenseite als Ganzes invertieren

Beispiel `group_release`:
```js
{
  typ: "STRATEGY_DECISION",
  family: "group_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  sourceType: "GROUP",
  inverseType: "EXPLICIT_CONTENT",
  action: "RELEASE_GROUP_CONTENT",
  label: "Gruppe freilegen",
  argumentScope: "active_side_only"
}
```

Beispiel `root_power`:
```js
{
  typ: "STRATEGY_DECISION",
  family: "root_power",
  targetId: "...",
  sourceType: "ROOT" | "POWER",
  inverseType: "POWER" | "ROOT",
  action: "INVERT_TO_POWER" | "INVERT_TO_ROOT",
  label: "Wurzel knacken" | "Potenz knacken",
  inversionDegree: 2,
  argumentScope: "whole_opposite_side"
}
```

## Prioritaeten (Punkt-vor-Strich-Umkehrung)
1. Geschuetzte sichtbare Aussengruppen werden zuerst expliziert.
2. Eine sichtbare `NEGATION` direkt vor dem aktiven Ausdruck folgt als eigene Aussenschale `negative_sign_release`.
3. Additive Schalen (`+` / `-`) binden schwaecher und sind danach oft die aeusseren Schalen.
4. Innerhalb der aktiven Subtraktion bleiben `x-a` und `a-x` getrennte Familien: `subtraction_release` und `subtrahend_release`.
5. Multiplikative Schalen (`*` / `/`) folgen danach.
6. Gerichtete trigonometrische Quellfunktionen (`sin`, `cos`, `tan`) folgen als eigene Familie `trig_inverse`.
7. Gerichtete inverse trigonometrische Quellfunktionen (`asin`, `acos`, `atan`) folgen als eigene Familie `inverse_trig`.
8. Potenz-, Wurzel- und spaetere Spezialschalen werden gegen diese allgemeine Prioritaetsordnung eingebettet.
