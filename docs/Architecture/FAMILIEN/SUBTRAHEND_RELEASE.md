# Familienvertrag: `subtrahend_release`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`subtrahend_release` beschreibt die gerichtete Subtraktionsfamilie,
bei der der aktive Ausdruck rechts vom aeusseren `-` liegt.
Der passive linke Minuend wird auf der Gegenseite als `SUBTRACTION` lesbar,
waehrend der aktive Ausdruck auf seiner Seite zuerst als `NEGATION`-Schale sichtbar wird.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen auf der aktiven Gleichungsseite eine sichtbare top-level `-`-Struktur vorliegt,
das linke Segment keine Zielvariable traegt
und das rechte Segment die Zielvariable traegt.

Sie ist nicht zustaendig fuer:
- `x-a=...` als Richtung `subtraction_release`
- eine bereits sichtbare `NEGATION`-Schale wie `-x=...`
- mehrere top-level additive Operatoren in einem einzigen Schritt
- Mehrzielvariablen

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- sichtbare top-level `SUBTRACTION` auf der aktiven Gleichungsseite
- linkes Segment ohne Zielvariable
- rechtes Segment mit Zielvariable
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `2-x=5`
- `(2+1)-x=5`
- `2-sin(x)=5`
- `5=2-x`

Noch nicht Teil des aktiven Familienrahmens:
- mehrere top-level additive Operatoren wie `2-x+3=5`
- doppelte Vorzeichenstufen wie `2-(-x)=5`
- Mehrzielvariablen

## Normativer Kern
- kein Rechnen, nur Huelle und Richtung explizit machen
- der passive linke Minuend verschwindet nicht spurlos
- auf der aktiven Seite entsteht zunaechst bewusst eine `NEGATION`-Schale um den Zielausdruck
- auf der Gegenseite entsteht eine inverse `SUBTRACTION`
- erst der folgende Schritt `negative_sign_release` darf diese Negationsschale weiter abbauen

## Verantwortung pro Phase
### P2
- top-level `SUBTRACTION` erkennen
- linken passiven Minuend und rechten aktiven Subtrahenden unterscheiden
- `SUBTRACTION -> SUBTRACTION + NEGATION` explizit machen

Normative Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "subtrahend_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  passiveExpressionId: "...",
  passiveExpressionIds: ["..."],
  operatorId: "...",
  targetSide: "right",
  sourceType: "SUBTRACTION",
  inverseType: "SUBTRACTION",
  action: "MOVE_MINUEND_TO_SUBTRACTION",
  label: "Minuend subtrahieren",
  argumentScope: "whole_opposite_side"
}
```

### P3
- linken passiven Minuend plus `-` unsichtbar machen
- auf derselben aktiven Seite eine sichtbare generierte `NEGATION`-Schale um den Zielausdruck erzeugen
- auf der Gegenseite eine inverse `SUBTRACTION`-Schale mit stabiler ID und Herkunftsmetadaten erzeugen

### P4
- versteckten Minuend und versteckten Operator als `GHOST_HOLE` halten
- die neue aktive `NEGATION` als `INVERSE_SHELL` sichtbar halten
- die inverse `SUBTRACTION` auf der Gegenseite linear in Inhalt, Operator und passiven Ausdruck projizieren

### Export
Ein Exportverbraucher muss lesen koennen:
- welcher passive Minuend verschoben wurde
- welche inverse `SUBTRACTION` daraus entstand
- welche aktive `NEGATION` als Zwischenstufe vor dem Vorzeichenabbau entstanden ist
- welche IDs ueber beide Folgezeilen stabil bleiben

## Definition of Done fuer den aktiven Rahmen
- `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `2-x` und den Rechtsseitenfall `5=2-x`
- die Familie bleibt bewusst von `subtraction_release` und `negative_sign_release` getrennt
- `2-x=5` fuehrt produktiv in die Folge `subtrahend_release -> negative_sign_release`
