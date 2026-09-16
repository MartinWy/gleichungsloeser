# Familienvertrag: `fraction_birth`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`fraction_birth` beschreibt die semantische Geburt einer Nenner- oder Divisionsstruktur aus einer aeusseren Multiplikationshuelle um die Zielvariable.

Die Familie ist die naechste Referenzkategorie nach `root_power`,
weil sie die Bruch-Geburt selbst beschreibt,
ohne schon die spaetere Gegenrichtung oder jede vertikale Bruch-Folge in dieselbe Familie zu pressen.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen ein aeusserer passiver Ausdruck die Zielstruktur auf der Zielseite multiplikativ huellt
und auf der Gegenseite eine Nenner- oder Divisionsrolle geboren wird.

Sie ist nicht zustaendig fuer:
- additive Aussenschalen
- die Gegenrichtung `fraction_collapse`
- voll ausgebaute Bruch-Schalen mit tiefer Zaehler/Nenner-Topologie
- gemischte Gruppen-, Bruch- oder Mehrfachumbauten in einem einzigen Schritt

## Aktiver Familienrahmen
Die Familie ist heute bewusst auf den bereits produktiv sinnvoll einhaengbaren Rahmen begrenzt:
- kanonische Top-Level-Multiplikation
- Zielvariable oder variabletragende Zielschale auf der aktiven Gleichungsseite
- genau ein passiver Top-Level-Ausdruck ohne Zielvariable
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `2x=10`
- `2*x=10`
- `x*2=10`
- `(2+1)x=10`
- `x(2+1)=10`
- `2sin(x)=10`
- `2*sin(x)=10`

Noch nicht Teil des aktiven Familienrahmens:
- ungruppierte Mehrfachprodukte wie `2*3*x=10` als ein einziger Gesamtumbau
- verschachtelte Gruppenprodukte mit mehreren passiven Ausdruckstraegern im selben Schritt
- voll ausgebaute tiefe Bruchprojektion

## Strukturmuster
### Eingangsmuster
- eine Gleichung mit explizitem Gleichheitsanker
- auf der aktiven Gleichungsseite eine sichtbare kanonische Multiplikationsstruktur
- genau ein Top-Level-Ausdruck traegt **nicht** die Zielvariable
- genau ein Zielausdruck traegt die Zielvariable
- die Gegenseite wird als Ganzes invertiert

### Ausgangsmuster
- passiver Ausdruck und `*` bleiben auf der aktiven Gleichungsseite als versteckte Spur erhalten
- der Zielausdruck bleibt sichtbar und kann als `EMERGED` markiert werden
- auf der Gegenseite entsteht eine explizite inverse `DIVISION`-Struktur
- ist der bezeichnete passive Faktor selbst eine geschlossene `DIVISION`,
  entsteht auf der Gegenseite eine `MULTIPLICATION` mit deren Kehrbruch als
  neuem Faktor
- der verschobene Ausdruck bleibt ueber IDs und Herkunftsmetadaten nachvollziehbar

## Normativer Kern
### Semantische Lesart
Die Familie fuehrt keine numerische Rechnung aus.
Sie beschreibt nur:
- welcher passive Ausdruck auf der aktiven Gleichungsseite abgebaut wird
- dass derselbe Ausdruck auf der Gegenseite als Nenner- oder Divisionsbestandteil wieder auftaucht
- welche Spur davon in der Projektion sichtbar bleiben muss

### Umkehrpaar
- `MULTIPLICATION` -> `DIVISION`

Normsatz:
Die Inversion ist ein expliziter struktureller Umbau. Ein normaler passiver
Faktor wird zur Nennerrolle. Eine von P2 ausdruecklich als
`reciprocal_factor` bezeichnete geschlossene `DIVISION` wird als vollstaendiger
Kehrbruchfaktor uebertragen. In beiden Situationen bleiben Ursprung und
Identitaet lesbar.

Die Gegenbewegung gehoert nicht in dieselbe Familie,
sondern spaeter in `fraction_collapse`.

## Verantwortung pro Phase
### P2: Strategie_Analyse
`fraction_birth` muss erkennen,
ob die aktuelle Zielstruktur eine aktive multiplikative Aussenschale traegt,
aus der eine Nennerrolle geboren werden kann.

Normative Familien-Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "fraction_birth",
  targetId: "...",
  passiveExpressionId: "...",
  factorId: "...", // Kompatibilitaetsalias
  operatorId: "...",
  sourceType: "MULTIPLICATION",
  inverseType: "DIVISION",
  action: "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR",
  label: "Ausdruck in Nenner",
  argumentScope: "whole_opposite_side"
}
```

P2 darf dabei nur:
- den aeusseren passiven Ausdruck identifizieren
- Zielausdruck und passiven Ausdruck unterscheiden
- die inverse Richtung explizit machen

P2 darf nicht:
- die Struktur veraendern
- stillschweigende Bruch-Topologie vorwegnehmen
- zwischen impliziter und expliziter Multiplikation semantisch unterscheiden,
  wenn `P1` bereits dieselbe kanonische Struktur geliefert hat

### P3: Umformung
`fraction_birth` fuehrt genau einen strukturellen Hauptumbau aus.

Normativer Umbau:
- der passive Quellausdruck bleibt auf der aktiven Gleichungsseite als unsichtbare Spur bestehen
- der `*`-Operator bleibt auf der aktiven Gleichungsseite als unsichtbare Spur bestehen
- der Zielausdruck bleibt sichtbar und kann als freigelegt markiert werden
- auf der Gegenseite entsteht eine explizite inverse `DIVISION`-Schale
- im expliziten `reciprocal_factor`-Modus entsteht stattdessen eine
  `MULTIPLICATION` mit einem neuen Kehrbruchfaktor
- diese inverse Schale erhaelt eine stabile generierte ID und Herkunftsmetadaten
- die Faktorenfolge dieser `MULTIPLICATION` folgt der zentralen
  P3-Aussenanlagerung: links neuer Faktor zuerst, rechts neuer Faktor zuletzt

P3 muss dabei sichern:
- unveraenderte Atome behalten ihre Identitaet
- derselbe passive Ausdruck bleibt ueber seine Herkunft lesbar
- die Gegenseite wird nicht berechnet,
  sondern nur strukturell umhuellt
- genau ein struktureller Hauptschritt pro Zeile

### P4: Projektion
`fraction_birth` muss denselben Umbau positionstreu lesbar machen.

P4-Aufgaben fuer diese Familie:
- versteckten passiven Ausdruck und versteckten `*` als `GHOST_HOLE` sichtbar halten
- den freigelegten Zielausdruck als `EMERGED` markieren
- die inverse `DIVISION`-Schale als neue sichtbare Zielstruktur setzen
- die Bruch-Geburt im aktiven Rahmen bereits als sichtbare `DIVISION` mit Zaehler, Bruchstrich und Nenner projezieren,
  ohne schon volle Mehrfachnenner-Topologie zu simulieren

Normativer Projektionssatz:
Der entfernte passive Ausdruck darf nicht spurlos verschwinden,
und die Gegenseite darf nicht so erscheinen,
als sei Division schon immer die Ausgangsstruktur gewesen.

### Export
Ein Exportverbraucher muss aus dieser Familie lesen koennen:
- welcher passive Ausdruck verschoben wurde
- auf welche Zielstruktur sich die Verschiebung bezog
- welche inverse `DIVISION`-Schale entstand
- wie der Zusammenhang zwischen Quellausdruck und Nennerrolle lautet
- welche IDs ueber Theorie- und Projektionsspur stabil blieben

## Invarianten
- keine numerische Auswertung
- kein implizit geratener Kehrbruch; Kehrbruch nur nach expliziter P2-Decision
- keine ID-Neuerzeugung fuer unveraenderte Atome
- der Quellausdruck verschwindet nicht spurlos
- die Gegenseite wird als zusammenhaengendes Argument behandelt
- Positionstreue bleibt hoeher gewichtet als lokale Schoenheit

## Definition of Done fuer den aktuellen Familienrahmen
Die Familie gilt im aktuellen aktiven Rahmen erst dann als fertig,
wenn alle folgenden Punkte zusammen gelten:

- `P2` liefert eine explizite Familien-Decision fuer aktive kanonische Multiplikationsfaelle
- `P2` unterscheidet Zielausdruck und passiven Ausdruck sauber
- `P3` wendet die Decision an,
  ohne selbst neue Strategie zu erfinden
- `P3` erzeugt eine inverse `DIVISION`-Schale mit stabiler ID und Herkunftsmetadaten
- `P4` markiert versteckten passiven Ausdruck, versteckten Operator und freigelegten Zielausdruck konsistent
- `core/index.js` gibt die Familieninformation fuer Exportverbraucher weiter
- aktive Tests decken mindestens `2x=10`, `2*x=10`, `x*2=10`, `(2+1)x=10`, `x(2+1)=10`, `2sin(x)=10` und `2*sin(x)=10` ab
- Mischfaelle ohne zustaendige Multiplikationshuelle liefern sauber `null` oder No-Op

## Pflichtfaelle fuer Tests
- `2x=10`
- `2*x=10`
- `x*2=10`
- `(2+1)x=10`
- `x(2+1)=10`
- `2sin(x)=10`
- `2*sin(x)=10`
- lineare Faelle ohne kanonische Multiplikationshuelle duerfen nicht faelschlich als Familie erkannt werden
- der verschobene passive Ausdruck muss im Export lesbar bleiben
- der Gleichheitsanker muss ueber beide Zeilen auf derselben Spalte bleiben

## Bindung
Dieses Dokument wird gelesen zusammen mit:
- `docs/Architecture/KATEGORIEKARTE_UMFORMUNGEN.md`
- `docs/Architecture/EXPORT_MODEL.md`
- `docs/Architecture/STATE_MODEL.md`
- `docs/Step_Semantics.md`
- `core/P2_Strategie_Analyse/CONTRACT.md`
- `core/P3_Umformung/CONTRACT.md`
- `core/P4_Projektion/CONTRACT.md`
- `core/CONTRACT.md`
