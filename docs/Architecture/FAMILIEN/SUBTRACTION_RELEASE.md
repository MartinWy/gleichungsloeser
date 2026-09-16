# Familienvertrag: `subtraction_release`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`subtraction_release` beschreibt die semantische Richtung `SUBTRACTION -> ADDITION`.
Eine aeussere Differenzhuelle um den aktiven Ausdruck wird entfernt,
und der passive Subtrahend wird auf der Gegenseite als Additionsrolle lesbar.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen auf der Zielseite eine top-level `-`-Struktur vorliegt,
das linke Segment die Zielvariable traegt
und das rechte Segment als passiver Ausdruck ohne Zielvariable auf die Gegenseite verschoben werden kann.

Sie ist nicht zustaendig fuer:
- `ADDITION -> SUBTRACTION`
- Faelle wie `2-x=5`, die jetzt zur eigenen Gegenfamilie `subtrahend_release` gehoeren
- mehrere top-level additive Operatoren in einem einzigen Schritt
- Mehrzielvariablen

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- eine sichtbare top-level `-`-Huelle auf der aktiven Gleichungsseite
- linkes Segment mit Zielvariable
- rechtes Segment ohne Zielvariable
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `x-2=5`
- `2*x-3=5`
- `x-(2+1)=5`
- `sqrt(x)-3=5`

Noch nicht Teil des aktiven Familienrahmens:
- mehrere top-level additive Operatoren wie `x-2+3=5`
- mehrere Zielvariablen

## Normativer Kern
- kein Rechnen, nur Huelle abbauen
- der passive Subtrahend verschwindet nicht spurlos
- die Gegenseite wird nicht veraendert, sondern strukturell als `ADDITION` umhuellt
- der aktive Ausdruck wird als freigelegt markiert

## Verantwortung pro Phase
### P2
- top-level Subtraktion erkennen
- linkes aktives Segment und rechten passiven Ausdruck unterscheiden
- `SUBTRACTION -> ADDITION` explizit machen

Normative Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "subtraction_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  passiveExpressionId: "...",
  passiveExpressionIds: ["..."],
  operatorId: "...",
  targetSide: "left",
  sourceType: "SUBTRACTION",
  inverseType: "ADDITION",
  action: "MOVE_PASSIVE_EXPRESSION_TO_ADDITION",
  label: "Ausdruck addieren",
  argumentScope: "whole_opposite_side"
}
```

### P3
- passives Segment plus `-` unsichtbar machen
- aktives Segment freilegen
- auf der Gegenseite eine inverse `ADDITION`-Schale mit stabiler ID und Herkunftsmetadaten erzeugen

### P4
- versteckte Quellspur als `GHOST_HOLE` halten
- freigelegten aktiven Ausdruck als `EMERGED` markieren
- inverse `ADDITION` linear in Inhalt, Operator und passiven Ausdruck projizieren

### Export
Ein Exportverbraucher muss lesen koennen:
- welches passive Segment verschoben wurde
- welche `ADDITION` daraus entstand
- welche IDs ueber Theorie und Projektion stabil blieben

## Definition of Done fuer den aktiven Rahmen
- `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `x-2` und gruppierte passive Subtrahenden
- die Gegenrichtung `2-x` wird jetzt bewusst von der eigenen Familie `subtrahend_release` getragen
- der passive Subtrahend bleibt als Herkunftsspur lesbar
