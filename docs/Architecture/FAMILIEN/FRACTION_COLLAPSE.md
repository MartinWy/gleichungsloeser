# Familienvertrag: `fraction_collapse`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen
Stand: 7. September 2026

## Zweck
`fraction_collapse` beschreibt die semantische Gegenbewegung zu `fraction_birth`.

Hier wird keine Multiplikationshuelle in einen Nenner verwandelt,
sondern eine bereits vorhandene Nenner- oder Divisionsstruktur wird abgebaut
und auf der Gegenseite wieder als Faktor sichtbar.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen die wirksame Aussenschale bereits eine Nenner- oder Divisionsrolle ist
und der passive Nennerausdruck als aeussere Gegenschale auf die Gegenseite gezogen werden kann.

Sie ist nicht zustaendig fuer:
- die Geburt eines neuen Nenners aus einer Multiplikation
- additive Aussenschalen
- tiefe Mehrfachumbauten in einem einzigen Schritt
- verschachtelte Nennerstrukturen ausserhalb des aktiven Ausdrucksrahmens

## Aktiver Familienrahmen
Die Familie ist heute bewusst auf den bereits produktiv sinnvoll einhaengbaren Rahmen begrenzt:
- sichtbare kanonische `DIVISION`-Schale auf der aktiven Gleichungsseite
- variabletragender Zaehlerausdruck
- genau ein sichtbarer passiver Nennerausdruck ohne Zielvariable
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `x/2=5`
- `x/(2+1)=5`
- `sin(x)/2=5`
- `sin(x)/(2*3)=5`

Noch nicht Teil des aktiven Familienrahmens:
- verschachtelte Brueche
- ungruppierte Nennerketten wie `x/2/3`
- voll vertikale Bruchprojektion mit eigener tiefer Teilankerlogik

## Strukturmuster
### Eingangsmuster
- eine Gleichung mit explizitem Gleichheitsanker
- auf der aktiven Gleichungsseite eine sichtbare `DIVISION`-Schale
- im Zaehler liegt die Zielvariable oder eine variabletragende Zielschale
- im Nenner liegt genau ein passiver Ausdruck ohne Zielvariable

### Ausgangsmuster
- die Quell-`DIVISION` bleibt auf der aktiven Gleichungsseite als versteckte Spur erhalten
- der Zaehler wird innerhalb einer sichtbaren, geschlossenen `COLLECTION`-Transportschale freigelegt
- auf der Gegenseite entsteht eine inverse `MULTIPLICATION`-Schale
- derselbe Nennerausdruck bleibt ueber IDs und Herkunftsmetadaten nachvollziehbar

## Normativer Kern
### Semantische Lesart
Die Familie fuehrt keine numerische Rechnung aus.
Sie beschreibt nur:
- welcher Nennerausdruck auf der aktiven Gleichungsseite abgebaut wird
- dass derselbe Nennerausdruck auf der Gegenseite als Faktor wieder auftaucht
- welche Spur davon in der Projektion sichtbar bleiben muss

### Umkehrpaar
- `DIVISION` -> `MULTIPLICATION`

Normsatz:
Die Gegenbewegung ist kein "einfach mal mal nehmen",
sondern ein expliziter struktureller Umbau,
bei dem dieselbe Nennerrolle ihre Identitaet behaelt
und auf der Gegenseite als Faktor lesbar bleibt.

Die entgegengesetzten Bruchrichtungen gehoeren nicht in dieselbe Familie,
sondern in `fraction_birth` und `fraction_denominator_release`.

## Verantwortung pro Phase
### P2: Strategie_Analyse
`fraction_collapse` muss erkennen,
ob die aktuelle Zielstruktur eine aktive `DIVISION`-Schale traegt,
aus der ein passiver Nennerausdruck auf die Gegenseite gezogen werden kann.

Normative Familien-Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "fraction_collapse",
  targetId: "...",
  passiveExpressionId: "...",
  factorId: "...", // Kompatibilitaetsalias
  sourceType: "DIVISION",
  inverseType: "MULTIPLICATION",
  action: "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR",
  label: "Nennerausdruck zu Faktor",
  argumentScope: "whole_opposite_side"
}
```

P2 darf dabei nur:
- die aktive `DIVISION`-Schale identifizieren
- Zaehlerausdruck und Nennerausdruck sauber unterscheiden
- die inverse Richtung explizit machen

P2 darf nicht:
- die Struktur veraendern
- tiefe Mehrfachnenner schon als fertige Familie ausgeben
- vertikale Topologie erraten, die parserseitig noch nicht gebaut ist

### P3: Umformung
`fraction_collapse` fuehrt genau einen strukturellen Hauptumbau aus.

Normativer Umbau:
- die Quell-`DIVISION` bleibt auf der aktiven Gleichungsseite als unsichtbare Spur bestehen
- der Zaehler wird freigelegt und als `isBefreit` markiert
- seine bisherige funktionale Zugehoerigkeit zum Zaehlerband bleibt durch eine sichtbare,
  generierte `COLLECTION`-Transportschale erhalten
- diese Transportschale traegt `transportSourceShellId`,
  `transportAlignmentMode = preserve_shell_band` und die unveraenderten Blatt-IDs
- auf der Gegenseite entsteht eine explizite inverse `MULTIPLICATION`-Schale
- diese inverse Schale erhaelt eine stabile generierte ID und Herkunftsmetadaten

P3 muss dabei sichern:
- unveraenderte Atome behalten ihre Identitaet
- derselbe Nennerausdruck bleibt ueber seine Herkunft lesbar
- die Gegenseite wird nicht berechnet, sondern nur strukturell umhuellt
- genau ein struktureller Hauptschritt pro Zeile
- die Reihenfolge eines neu erzeugten Faktors kommt fuer beide Gleichungsseiten
  aus der zentralen P3-Aussenanlagerung und nicht aus familienlokaler Sonderlogik

Die Freilegung hebt nur die aeussere `DIVISION` auf.
Sie hebt nicht zugleich die funktionale Herkunftsschale des Zaehlerbandes auf.
Ein Test darf den freigelegten Zaehler deshalb nicht nur als loses Top-Level-Atom suchen,
sondern muss ihn in der ausdruecklichen Transportschale pruefen.

### P4: Projektion
`fraction_collapse` muss denselben Umbau positionstreu lesbar machen.

P4-Aufgaben fuer diese Familie:
- die versteckte `DIVISION` als `GHOST_HOLE` sichtbar halten
- den freigelegten Zaehler als `EMERGED` markieren
- die inverse `MULTIPLICATION`-Schale als neue sichtbare Zielstruktur setzen
- die Herkunft des Nennerausdrucks fuer spaetere vertikale Bruchlogik lesbar halten
- sichtbare Ausgangs-`DIVISION` im aktiven Rahmen bereits als Zaehler, Bruchstrich und Nenner aufspannen
- entsteht das Produkt links, muss P4 die Prefix-Breite des neuen Faktors schon
  in frueheren Zeilen reservieren; entsteht es rechts, waechst der neue Faktor
  als Suffix nach rechts

Normativer Projektionssatz:
Der abgebaute Nennerausdruck darf nicht spurlos verschwinden,
und die Gegenseite darf nicht so erscheinen,
als sei die Faktorrolle schon immer die Ausgangsstruktur gewesen.

### Export
Ein Exportverbraucher muss aus dieser Familie lesen koennen:
- welcher Nennerausdruck verschoben wurde
- auf welche Zielstruktur sich die Verschiebung bezog
- welche inverse `MULTIPLICATION`-Schale entstand
- wie der Zusammenhang zwischen Nennerrolle und neuer Faktorrolle lautet
- welche IDs ueber Theorie- und Projektionsspur stabil blieben

## Invarianten
- keine numerische Auswertung
- kein "mal nehmen" als Rechentrick
- keine ID-Neuerzeugung fuer unveraenderte Atome
- der Quellnenner verschwindet nicht spurlos
- die Gegenseite wird als zusammenhaengendes Argument behandelt
- Positionstreue bleibt hoeher gewichtet als lokale Schoenheit

## Definition of Done fuer den aktuellen Familienrahmen
Die Familie gilt im aktuellen aktiven Rahmen erst dann als fertig,
wenn alle folgenden Punkte zusammen gelten:

- `P1` liest aktive Nennerausdruecke als sichtbare `DIVISION`-Schale
- `P2` liefert eine explizite Familien-Decision fuer aktive `DIVISION`-Faelle
- `P3` wendet die Decision an, ohne selbst neue Strategie zu erfinden
- `P3` erzeugt eine inverse `MULTIPLICATION`-Schale mit stabiler ID und Herkunftsmetadaten
- `P4` markiert versteckte `DIVISION` und freigelegten Zaehler konsistent
- `core/index.js` gibt die Familieninformation fuer Exportverbraucher weiter
- aktive Tests decken mindestens `x/2=5`, `x/(2+1)=5`, `sin(x)/2=5` und `sin(x)/(2*3)=5` ab

## Pflichtfaelle fuer Tests
- `x/2=5`
- `x/(2+1)=5`
- `sin(x)/2=5`
- `sin(x)/(2*3)=5`
- konstante Divisionen wie `9/3=5` duerfen nicht faelschlich als Familie erkannt werden
- der verschobene Nennerausdruck muss im Export lesbar bleiben
- der Gleichheitsanker muss ueber beide Zeilen auf derselben Spalte bleiben

## Bindung
Dieses Dokument wird gelesen zusammen mit:
- `docs/Architecture/KATEGORIEKARTE_UMFORMUNGEN.md`
- `docs/Architecture/FAMILIEN/FRACTION_BIRTH.md`
- `docs/Architecture/EXPORT_MODEL.md`
- `docs/Architecture/STATE_MODEL.md`
- `docs/System/GESAMTSYSTEM.md`
- `core/P2_Strategie_Analyse/CONTRACT.md`
- `core/P3_Umformung/CONTRACT.md`
- `core/P4_Projektion/CONTRACT.md`
- `core/CONTRACT.md`
