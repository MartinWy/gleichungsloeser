# Familienvertrag: `root_power`

Status: aktive Referenzfamilie im aktuellen Familienrahmen abgeschlossen  
Stand: 6. April 2026

## Zweck
`root_power` beschreibt den strukturellen Schalenabbau und Gegenaufbau zwischen
Wurzel und Potenz.

Die Familie ist die erste Referenzkategorie des Gleichungsloesers,
weil sie heute schon am weitesten produktiv eingeloest ist
und sich gut eignet,
um den kuenftigen Familienbaukasten zu normieren.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen die aeusserste wirksame Schale um die Zielvariable eine `ROOT`- oder `POWER`-Schale ist.

Sie ist nicht zustaendig fuer:
- additive oder multiplikative Aussenschalen
- Bruch-Geburt oder Bruch-Abbau
- Exponential- oder Logarithmusfaelle
- gemischte Mehrfachumbauten in einem einzigen Schritt

## Aktiver Familienrahmen
Die Familie ist heute bewusst auf den bereits produktiv getragenen Rahmen begrenzt:
- `sqrt(...)`
- sichtbare `POWER`-Schalen mit explizitem Exponenten
- genau ein struktureller Hauptumbau pro Zeile

Verallgemeinerungen auf komplexere Wurzelgrade oder Mischschalen sind kein Widerspruch,
sondern spaetere Erweiterungen derselben Familie.

## Strukturmuster
### Eingangsmuster
- eine Gleichung mit explizitem Gleichheitsanker
- auf der aktiven Gleichungsseite eine sichtbare aeusserste `ROOT`- oder `POWER`-Schale
- die Zielvariable liegt in `content` dieser Schale
- die Gegenseite wird als ganzes Gegenargument behandelt

### Ausgangsmuster
- die Ursprungsschale auf der aktiven Gleichungsseite bleibt als versteckter Anker erhalten
- ihr Inhalt wird sichtbar freigelegt
- die Gegenseite erhaelt die inverse Schale
- unbeteiligte Atome behalten ihre Identitaet

## Normativer Kern
### Semantische Lesart
Die Familie fuehrt keine numerische Rechnung aus.
Sie beschreibt nur:
- welche aeussere Schale auf der aktiven Gleichungsseite abgebaut wird
- welche inverse Schale auf der Gegenseite sichtbar wird
- welche Spur davon in der Projektion lesbar bleiben muss

### Schalenpaar
- `ROOT` -> `POWER`
- `POWER` -> `ROOT`

Normsatz:
Die Inversion ist explizit.
Sie darf nicht als stilles algebraisches Fernziel erscheinen.

## Verantwortung pro Phase
### P2: Strategie_Analyse
`root_power` muss erkennen,
ob die aktuelle Zielschale zu dieser Familie gehoert.

Normative Familien-Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "root_power",
  targetId: "...",
  sourceType: "ROOT",
  inverseType: "POWER",
  action: "INVERT_TO_POWER",
  label: "Wurzel knacken",
  inversionDegree: 2,
  argumentScope: "whole_opposite_side"
}
```

Oder entsprechend:
```js
{
  typ: "STRATEGY_DECISION",
  family: "root_power",
  targetId: "...",
  sourceType: "POWER",
  inverseType: "ROOT",
  action: "INVERT_TO_ROOT",
  label: "Potenz knacken",
  inversionDegree: 2,
  argumentScope: "whole_opposite_side"
}
```

P2 darf dabei nur:
- die Familie identifizieren
- die aeusserste wirksame Zielschale benennen
- den Inversionsgrad mitgeben
- die inverse Richtung explizit machen

P2 darf nicht:
- die Struktur veraendern
- Layout vorberechnen
- stillschweigende Nebenumbauten andeuten

### P3: Umformung
`root_power` fuehrt genau einen strukturellen Hauptumbau aus.

Normativer Umbau:
- die Ursprungsschale auf der aktiven Gleichungsseite bleibt in der Struktur bestehen
- dieselbe Ursprungsschale wird unsichtbar oder projektiv gelocht markiert
- ihr Inhalt wird freigelegt
- die Gegenseite wird als ein Argument der inversen Schale behandelt
- die inverse Schale entsteht explizit auf der Gegenseite
- die inverse Schale erhaelt eine stabile generierte ID und Herkunftsmetadaten

P3 muss dabei sichern:
- die Ursprungsschale behaelt ihre Identitaet
- freigelegte Atome behalten ihre Identitaet
- die Gegenseite wird nicht berechnet,
  sondern nur strukturell umschlossen
- genau ein struktureller Hauptschritt pro Zeile
- die Umformung arbeitet gegen die uebergebene Familien-Decision
- die Eingabestruktur wird nicht direkt mutiert

### P4: Projektion
`root_power` muss dieselbe Veraenderung positionstreu lesbar machen.

P4-Aufgaben fuer diese Familie:
- die verborgene Ursprungsschale als sichtbare Spur halten
- versteckte `ROOT`- und `POWER`-Schalen als `GHOST_HOLE` markieren
- freigelegte Inhalte als `EMERGED` markieren
- ueber alle Theorie-Zeilen zuerst eine globale Layoutmatrix bauen
- erst danach alle Zeilen gegen dieselbe Ankerspalte setzen

Normativer Projektionssatz:
Was auf der aktiven Gleichungsseite abgebaut wurde,
darf auf der Gegenseite nicht einfach kommentarlos erscheinen.
Die entfernte Schale muss als Spur sichtbar bleiben.

### Export
Ein Exportverbraucher wie Film- oder Arbeitsblattgenerator muss aus dieser Familie lesen koennen:
- welche Familie den Schritt getragen hat
- welche Ursprungsschale betroffen war
- welche Atome freigelegt wurden
- welche inverse Schale entstand
- welche IDs ueber beide Zeilen gleich geblieben sind
- welche Projektionsanker zu dieser Umformung gehoeren

## Invarianten
- keine numerische Auswertung
- keine ID-Neuerzeugung fuer unveraenderte Atome
- inverse Schalen haben stabile generierte IDs
- keine zweite strukturelle Hauptveraenderung im selben Schritt
- die Ursprungsschale verschwindet nicht spurlos
- die Gegenseite wird als zusammenhaengendes Argument behandelt
- Positionstreue bleibt hoeher gewichtet als lokale Schoenheit

## Aktueller Abschlussstand im aktiven Familienrahmen
### Produktiv vorhanden
- `P2` erkennt sichtbare `ROOT`- und `POWER`-Schalen
- `P2` liefert eine explizite Familien-Decision mit `family`, `sourceType`, `inverseType`, `inversionDegree` und `argumentScope`
- `P2` greift nur, wenn die ausgewaehlte Schale eine Zielvariable enthaelt
- `P3` wendet diese Familien-Decision explizit an
- `P3` fuehrt die Umformung auf einer geklonten Struktur aus
- inverse `ROOT`- und `POWER`-Schalen erhalten stabile generierte IDs und Herkunftsmetadaten
- `P4` arbeitet fuer die aktive Kernspur produktiv im Zwei-Durchlauf
- versteckte `ROOT`- und `POWER`-Schalen werden als `GHOST_HOLE` positioniert sichtbar
- der Orchestrator liefert eine kanonische `exportData`-Sicht fuer Film, Arbeitsblatt und Diagnose
- das Exportregister kann inverse Schalen derselben Familie mit stabiler ID lesen
- aktive Basistests fuer `P2`, `P3`, `P4` und `core` bestehen

### Konkrete Codeanker heute
- `core/P2_Strategie_Analyse/PfadFinder.js`
- `core/P3_Umformung/Regelwerk.js`
- `core/P4_Projektion/PreFlightEngine.js`
- `core/P4_Projektion/Regelwerk.js`
- `core/P4_Projektion/index.js`
- `core/index.js`
- `tests/active/core_solve_flow.test.js`

## Definition of Done fuer `root_power`
Die folgende Liste ist im aktuellen Familienrahmen erreicht:

- `P2` liefert eine explizite Familien-Decision fuer `ROOT` und `POWER`
- `P2` waehlt nur variabletragende Zielschalen
- `P3` wendet die Entscheidung an,
  ohne selbst neue Strategie zu erfinden
- `P3` behandelt die Gegenseite als ganzes Inversionsargument
- `P3` gibt inversen Schalen stabile IDs und Herkunftsmetadaten
- `P4` markiert Ursprungsschale und Befreiung konsistent positionstreu
- `core/index.js` gibt die Familieninformation fuer Exportverbraucher weiter
- IDs bleiben ueber Theorie- und Projektionsspur konsistent
- aktive Tests decken beide Richtungen der Familie ab
- Mischfaelle ohne zustaendige `root_power`-Schale liefern sauber `null` oder No-Op

## Pflichtfaelle fuer Tests
- `sqrt(x)=5`
- `x^2=9`
- `sqrt(x+1)=5`
- versteckte Ursprungsschale darf nicht erneut gewaehlt werden
- unveraenderte IDs bleiben stabil
- inverse Schalen muessen im Exportregister auftauchen
- Ursprungsschale bleibt als sichtbare Projektionsspur nachvollziehbar
- Gleichheitsanker bleibt ueber beide Zeilen auf derselben Spalte

## Naechste Ausbaurichtung ausserhalb des aktiven Familienrahmens
- hoehere Wurzelgrade und komplexere Potenzgrade als Verallgemeinerung derselben Familie
- eigene Adapter auf das Exportmodell fuer Film und Arbeitsblatt
- feinere Layoutregeln fuer spaetere Gruppen- und Bruchfaelle

## Einhaengelogik fuer spaeter
`root_power` ist die Referenzfamilie,
nach der spaeter weitere Familien organisiert werden sollen.

Zielbild:
- `matcher.js` erkennt die Familie
- `strategy.js` baut die Familien-Decision
- `transform.js` fuehrt nur den strukturellen Umbau aus
- `projection_hints.js` beschreibt die projektiven Folgen
- `cases.test.js` prueft nur diese Familie

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
