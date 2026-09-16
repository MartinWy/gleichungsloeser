# P2 Contract: Strategie_Analyse

## Oeffentliche API
`PfadFinder.findeNaechsteAktion(struktur, options?)`

## Eingabe
- ein struktureller Ausschnitt, aktuell typischerweise die aktive Gleichungsseite mit genau einer aktiv gewaehlten Zielvariable
- `options.targetVariable?`: Name der Zielvariable fuer diese Analyse

## Ausgabe
- Familien-Decision oder `null`

## Aktuelle Rueckgabeform
```js
{
  typ: "STRATEGY_DECISION",
  family: "group_release" | "negative_sign_release" | "root_power" | "fraction_birth" | "fraction_collapse" | "addition_release" | "subtraction_release" | "subtrahend_release" | "trig_inverse" | "inverse_trig",
  targetId,
  targetExpressionIds?,
  passiveExpressionId?,
  passiveExpressionIds?,
  factorId?,
  operatorId?,
  targetSide?,
  sourceType,
  inverseType,
  action,
  label,
  inversionDegree?,
  sourceName?,
  inverseName?,
  argumentScope: "active_side_only" | "whole_opposite_side"
}
```

## Verantwortung
- sichtbare aeusserste relevante Schale oder Huellrichtung finden
- sicherstellen, dass die Zielstruktur wirklich die aktiv gewaehlte Zielvariable traegt
- die zustaendige Umformungsfamilie benennen
- den naechsten strukturell zulaessigen Schritt explizit machen
- Familienparameter wie `targetExpressionIds`, `passiveExpressionIds`, `operatorId` oder `inversionDegree` mitgeben

## Verboten
- Struktur veraendern
- Projektion anreichern
- implizite Mehrfachschritte liefern

## Ist-Hinweise
- aktuell sind die Familien `group_release`, `negative_sign_release`, `addition_release`, `subtraction_release`, `subtrahend_release`, `fraction_birth`, `fraction_collapse`, `trig_inverse`, `inverse_trig` und `root_power` produktiv eingehangen
- `options.targetVariable` bestimmt, welche `VARIABLE` im aktuellen Lauf als aktiv gilt; andere Variablen koennen dadurch als passive Ausdrucksteile behandelt werden
- die additive Kategorie ist semantisch in zwei Richtungen getrennt: `ADDITION -> SUBTRACTION` und `SUBTRACTION -> ADDITION`
- `group_release` expliziert geschuetzte sichtbare Aussengruppen auf der aktiven Gleichungsseite, bevor innere Familien weiterarbeiten
- `negative_sign_release` behandelt ein Vorzeichen direkt vor dem aktiven Ausdruck als eigene sichtbare `NEGATION`-Schale und kippt es als ganze Schale auf die Gegenseite
- `subtrahend_release` behandelt `2-x`-artige Richtungen getrennt: linker passiver Minuend ohne Zielvariable, rechter Zielausdruck mit Zielvariable, Folge in `NEGATION` plus inverse `SUBTRACTION`
- `fraction_birth` arbeitet auf kanonischer Multiplikationsstruktur und unterscheidet Zielausdruck mit Zielvariable von passivem Ausdruck ohne Zielvariable
- `fraction_collapse` arbeitet im aktiven Rahmen auf sichtbaren `DIVISION`-Schalen mit variablem Zaehlerausdruck und passivem Nennerausdruck ohne Zielvariable
- `trig_inverse` arbeitet gerichtet auf sichtbaren trigonometrischen `FUNCTION`-Schalen (`sin`, `cos`, `tan`) mit aktivem Argumentausdruck
- `inverse_trig` arbeitet gerichtet auf sichtbaren inversen trigonometrischen `FUNCTION`-Schalen (`asin`, `acos`, `atan`) mit aktivem Argumentausdruck
- `passiveExpressionId` ist die semantisch fuehrende Feldbezeichnung fuer die erste ID des passiven Ausdrucks; `passiveExpressionIds` traegt die volle passive Segmentspur
- `factorId` bleibt als Kompatibilitaetsalias in der aktiven Kernspur erhalten
- `inversionDegree` traegt den heute aktiven `sqrt`- und `^2`-Rahmen explizit durch die Familie
- `argumentScope: "active_side_only"` markiert den Struktur-Freilegungsschritt ohne Inversion der Gegenseite
- `argumentScope: "whole_opposite_side"` markiert, dass die gesamte Gegenseite als zusammenhaengendes Inversionsargument behandelt wird
- `Konfiguration.js` beschreibt bereits mehr Prioritaetsideen, als der aktuelle Code einloest
