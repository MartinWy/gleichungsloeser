# Familienvertrag: `negative_sign_release`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`negative_sign_release` beschreibt die semantische Behandlung einer aeusseren `NEGATION`-Schale vor dem aktiven Ausdruck.
Das Vorzeichen direkt vor einem zielvariablenhaltigen Ausdruck wird als eigene Schale gelesen
und als ganze Schale auf die Gegenseite umgeklappt.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen auf der aktiven Gleichungsseite genau eine sichtbare top-level `NEGATION`-Schale liegt
und ihr Inhaltsausdruck die Zielvariable traegt.

Sie ist nicht zustaendig fuer:
- negative Zeichen innerhalb eines passiven Ausdrucks ohne Zielvariable
- `SUBTRACTION`-Faelle wie `2-x=5`, die zuerst von `subtrahend_release` in eine sichtbare `NEGATION` ueberfuehrt werden
- normale `fraction_birth`-Faelle wie `2x=10`
- Mehrzielvariablen

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- eine sichtbare top-level `NEGATION`-Schale auf der aktiven Gleichungsseite
- der Inhaltsausdruck der `NEGATION` traegt die Zielvariable
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `-x=5`
- `-(x+1)=5`
- `-sin(x)=5`
- `5=-x`

Noch nicht Teil des aktiven Familienrahmens:
- doppelte oder geschachtelte Vorzeichenschalen wie `-(-x)=5`
- Mehrzielvariablen

## Normativer Kern
- das Vorzeichen direkt vor der aktiven Schale ist keine blosse Schreibweise
- die `NEGATION` wird als eigene Aussenschale behandelt
- beim Abbau entsteht bewusst keine normale Bruchgeburt
- der aktive Inhaltsausdruck wird freigelegt
- auf der Gegenseite entsteht eine inverse `NEGATION`-Schale mit stabiler ID und Herkunftsspur

## Verantwortung pro Phase
### P2
- sichtbare top-level `NEGATION`-Schale vor dem aktiven Ausdruck erkennen
- den aktiven Inhaltsausdruck als Zielausdruck markieren
- explizit machen, dass dieselbe Vorzeichenschale auf die Gegenseite umklappt

Normative Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "negative_sign_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  sourceType: "NEGATION",
  inverseType: "NEGATION",
  action: "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE",
  label: "Vorzeichen umklappen",
  argumentScope: "whole_opposite_side"
}
```

### P3
- sichtbare Quell-`NEGATION` unsichtbar machen
- ihren Inhaltsausdruck mit derselben ID-Spur freilegen
- auf der Gegenseite eine inverse `NEGATION`-Schale mit stabiler generierter ID erzeugen
- die Gegenseite dabei als ganzes Inversionsargument behandeln

### P4
- versteckte Quell-`NEGATION` als `GHOST_HOLE` halten
- freigelegten Inhaltsausdruck als `EMERGED` markieren
- inverse `NEGATION` als `INVERSE_SHELL` sichtbar lassen

### Export
Ein Exportverbraucher muss lesen koennen:
- welche Quell-`NEGATION` abgebaut wurde
- welche inverse `NEGATION` daraus entstand
- welche freigelegten Inhaltsatome dieselbe ID-Spur behalten haben

## Definition of Done fuer den aktiven Rahmen
- `P1`, `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `-x`, `-(x+1)`, `-sin(x)` und den Rechtsseitenfall `5=-x`
- die Familie bleibt bewusst von `fraction_birth` getrennt
- `2-x=5` wird jetzt bewusst erst von `subtrahend_release` getragen und danach erst von `negative_sign_release` weiterbearbeitet
