# Familienvertrag: `addition_release`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`addition_release` beschreibt die semantische Richtung `ADDITION -> SUBTRACTION`.
Eine aeussere Summenhuelle um den aktiven Ausdruck wird entfernt,
und der passive Summand wird auf der Gegenseite als Subtraktionsrolle lesbar.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen auf der Zielseite eine top-level `+`-Struktur vorliegt,
genau ein Segment die Zielvariable traegt
und das andere Segment als passiver Ausdruck ohne Zielvariable auf die Gegenseite verschoben werden kann.

Sie ist nicht zustaendig fuer:
- `SUBTRACTION -> ADDITION`
- Mehrzielvariablen oder mehrere unterschiedliche Zielvariablen
- mehrere top-level additive Operatoren in einem einzigen Schritt
- versteckte Normalisierung oder numerische Vereinfachung

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- eine sichtbare top-level `+`-Huelle auf der aktiven Gleichungsseite
- genau ein aktives Segment mit Zielvariable
- genau ein passives Segment ohne Zielvariable
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `x+2=5`
- `2+x=5`
- `2*x+3=5`
- `x+(2+1)=5`
- `sqrt(x)+3=5`

Noch nicht Teil des aktiven Familienrahmens:
- mehrere top-level `+`-Operatoren wie `x+2+3=5`
- Plus/Minus-Mischketten in einem einzigen Schritt
- mehrere Zielvariablen

## Normativer Kern
- kein Rechnen, nur Huelle abbauen
- der passive Summand verschwindet nicht spurlos
- die Gegenseite wird nicht veraendert, sondern strukturell als `SUBTRACTION` umhuellt
- der aktive Ausdruck wird als freigelegt markiert

## Verantwortung pro Phase
### P2
- additive top-level Huelle erkennen
- aktives Segment und passives Segment unterscheiden
- `ADDITION -> SUBTRACTION` explizit machen

Normative Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "addition_release",
  targetId: "...",
  targetExpressionIds: ["..."],
  passiveExpressionId: "...",
  passiveExpressionIds: ["..."],
  operatorId: "...",
  targetSide: "left" | "right",
  sourceType: "ADDITION",
  inverseType: "SUBTRACTION",
  action: "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION",
  label: "Ausdruck subtrahieren",
  argumentScope: "whole_opposite_side"
}
```

### P3
- passives Segment plus `+` unsichtbar machen
- aktives Segment freilegen
- auf der Gegenseite eine inverse `SUBTRACTION`-Schale mit stabiler ID und Herkunftsmetadaten erzeugen

### P4
- versteckte Quellspur als `GHOST_HOLE` halten
- freigelegten aktiven Ausdruck als `EMERGED` markieren
- inverse `SUBTRACTION` linear in Inhalt, Operator und passiven Ausdruck projizieren

### Export
Ein Exportverbraucher muss lesen koennen:
- welches passive Segment verschoben wurde
- welche `SUBTRACTION` daraus entstand
- welche IDs ueber Theorie und Projektion stabil blieben

## Definition of Done fuer den aktiven Rahmen
- `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `x+2`, `2+x`, `2*x+3` und gruppierte passive Summanden
- die aeussere Addition hat Vorrang vor inneren Familien wie Multiplikation
- der passive Summand bleibt als Herkunftsspur lesbar
