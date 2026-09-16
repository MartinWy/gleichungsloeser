# Familienvertrag: `group_release`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`group_release` beschreibt die strukturelle Freilegung einer geschuetzten sichtbaren Aussengruppe um den aktiven Ausdruck.

Die Familie ist bewusst keine Gegenseiten-Inversion.
Sie ist ein expliziter Struktur-Schritt auf der aktiven Gleichungsseite:
Die aeussere `GROUP`-Huelle bleibt als Spur erhalten,
und ihr Inhalt wird fuer die naechste inhaltliche Familie freigelegt.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen die analysierte Zielseite genau aus einer sichtbaren top-level `GROUP` besteht
und deren Inhalt die aktiv gewaehlte Zielvariable traegt.

Sie ist nicht zustaendig fuer:
- innere Gruppen, wenn aussen bereits eine andere aktive Familie sichtbar ist
- Gegenseiten-Inversionen
- passive Gruppen auf der Gegenseite
- numerische Vereinfachung oder Klammerausmultiplizieren

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- auf der analysierten Zielseite ist genau eine sichtbare top-level `GROUP` vorhanden
- der Gruppeninhalt traegt die Zielvariable
- die Gegenseite bleibt in diesem Schritt unveraendert

Typische aktive Faelle:
- `(x+1)=5`
- `(2*x)=10`
- `(x/2)=5`
- `((x))=5`

Noch nicht Teil des aktiven Familienrahmens:
- `x+(2+1)=5`
- `2*(x+1)=10`
- mehrere sichtbare top-level Elemente auf derselben aktiven Gleichungsseite neben derselben Aussengruppe
- Mehrzielvariablen

## Normativer Kern
- kein Rechnen, nur Struktur explizieren
- die Gruppenhuelle verschwindet nicht spurlos
- der Gruppeninhalt behaelt seine IDs
- die Gegenseite bekommt bewusst keine inverse Schale
- `group_release` ist ein `R1 Struktur explizieren`-Schritt vor spaeteren Umbaufamilien

## Verantwortung pro Phase
### P2
- erkennen, dass auf der aktiven Gleichungsseite genau eine sichtbare top-level `GROUP` liegt
- pruefen, dass ihr Inhalt die Zielvariable traegt
- die Freilegung als eigene Familie benennen

Normative Decision:
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

### P3
- die sichtbare Aussengruppe unsichtbar machen
- die Gruppenhuelle als Herkunftsspur behalten
- den Gruppeninhalt an derselben Stelle auf top-level freilegen
- freigelegte Inhaltsatome mit `isBefreit: true` markieren
- keine inverse Gegenseiten-Schale erzeugen

### P4
- die versteckte `GROUP`-Spur als `GHOST_HOLE` sichtbar halten
- den freigelegten Gruppeninhalt als `EMERGED` markieren
- den Gleichheitsanker spaltenstabil halten
- die innere Folgefamilie erst nach der Freilegungszeile sichtbar werden lassen

### Export
Ein Exportverbraucher muss lesen koennen:
- welche `GROUP` freigelegt wurde
- welche inneren Ausdrucks-IDs dabei sichtbar wurden
- dass keine inverse Gegenseiten-Schale entstanden ist
- dass dieselben Inhaltsatome ueber Freilegung und Folge-Schritt stabil bleiben

## Definition of Done fuer den aktiven Rahmen
- `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `(x+1)=5`, `(2*x)=10`, `(x/2)=5` und `((x))=5`
- `group_release` laeuft vor inneren Familien wie `addition_release`, `fraction_birth` und `fraction_collapse`
- die Gruppenhuelle bleibt als `GHOST_HOLE` sichtbar
- der Gruppeninhalt wird mit denselben IDs als `EMERGED` lesbar
- der Gleichheitsanker bleibt ueber die Freilegungszeile stabil

## Pflichtfaelle fuer Tests
- `(x+1)=5`
- `(2*x)=10`
- `(x/2)=5`
- `((x))=5`
- `x+(2+1)=5` darf nicht faelschlich als `group_release` gelesen werden
- `2*(x+1)=10` darf nicht faelschlich als `group_release` vor der aeusseren Multiplikation greifen

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
