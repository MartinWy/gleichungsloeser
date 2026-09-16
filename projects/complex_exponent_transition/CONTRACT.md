# Transition Contract

Status: verbindlich  
Stand: 2026-08-07

## Grundregel

Dieses Projekt ist ein **reiner Verbraucher**.

Es liest Zustaende aus dem bestehenden System
oder aus eigenen Vorbereitungsdateien
und hoechstens das **exportierte Profil** des alten Loesers
und erzeugt daraus eine Uebergangssequenz.

Es schreibt nichts in das Ursprungssystem zurueck.

Der alte zentrale Loeser
bleibt vollständig autonom
und arbeitet weiter nur nach seinen eigenen Regeln.

Der neue Uebergangsloeser
oder dieses Projekt
hat **keinen Zugriff auf die innere Regellogik** des alten Loesers.

Wenn spaeter ein neuer Loeser
nach aehnlichen Prinzipien
wie der alte Loeser arbeiten soll,
dann nur als **eigene Kopie oder eigener Fork**.

Er darf die Prinzipien des alten Loesers
vollstaendig nachbauen.

Nicht erlaubt ist nur,
den alten Loeser dafuer zu ueberschreiben oder umzubauen.

## Eingangsvertrag

Das Projekt arbeitet mit zwei expliziten Szenenzustaenden:

1. `before_state`
2. `after_state`
3. optional `solver_profile`

Beide Zustaende muessen fuer sich genommen bereits gueltig sein.

Der Uebergang erfindet nicht die Mathematik,
sondern nur die Bewegung zwischen diesen Zustaenden.

Wenn ein `solver_profile` vorliegt,
darf es nur als Geometrie-,
Raster-
oder Anschlussprofil verwendet werden.

Es ist **kein Ersatz** fuer interne Solverregeln.

## Erlaubte Herkunft von `before_state`

- `outputContract`
- `theoryRows`
- `projectionRows`
- eine explizit exportierte Snapshot-Datei des bestehenden Systems

## Erlaubte Herkunft von `solver_profile`

- ein explizit exportiertes Layoutprofil des alten Loesers
- ein Anschlussprofil des Folge-Systems
- eine Diagnose- oder Handover-Datei,
  die nur Geometrie und Anschlussregeln beschreibt

## Erlaubte Herkunft von `after_state`

- ein zweiter Snapshot
- ein manuell definierter Zielzustand
- ein eigenes Layout des Folgeprojekts

Wichtig:

```text
Der bestehende Gleichungsloeser muss den Zielzustand nicht selbst erzeugen.
```

Ebenso wichtig:

```text
Der neue Uebergangsloeser darf den alten Gleichungsloeser nicht
durch implizites Nachbauen seiner Regeln simulieren.
```

## Pflichtfelder eines Szenensnapshots

Ein Snapshot fuer dieses Projekt soll mindestens enthalten:

```json
{
  "sceneId": "before_state",
  "sourceProject": "6_Gleichungsloeser",
  "sourceCommit": "88057a3",
  "coordinateSpace": "p4_projection_or_transition_local",
  "atoms": [],
  "shells": [],
  "focusIds": [],
  "notes": ""
}
```

## Identitaetsregel

Wenn ein mathematisches Element
vor und nach dem Uebergang
dieselbe inhaltliche Identitaet hat,
soll es im Transition-Projekt
eine stabile Referenz behalten.

Das muss nicht dieselbe Darstellung sein,
aber dieselbe semantische Spur.

## Verbotene Annahmen

Nicht erlaubt ist:

- stillschweigend den aktiven Renderer als Animationsengine mitzubenutzen
- neue Solverregeln im Snapshot-Importer zu verstecken
- fehlende Zielzustande durch Ad-hoc-Mathematik zu erraten
- das bestehende P4 zu zwingen,
  bereits Uebergangsgeometrie zu liefern
- den alten Loeser durch neue Regellogik zu ueberschreiben
- so zu planen,
  als duerfte der neue Loeser den alten Solver direkt steuern
- eine zweite Positionskorrektur nach dem Systemwechsel einzuplanen,
  wenn diese nur deshalb noetig waere,
  weil die Landeposition nicht rechtzeitig aus dem Profil bestimmt wurde
- Aenderungen am alten Loeser vorzunehmen,
  nur um eine Uebergangsidee technisch anschlussfaehig zu machen

## Ausgangsvertrag

Das Projekt liefert nur eigene Artefakte,
zum Beispiel:

- Szenenplaene
- Bewegungsgraphen
- Zwischenframes
- Kamera- oder Zoomskripte
- Demo-Renderings

Keines dieser Artefakte
ist automatisch Teil des aktiven Gleichungsloesers.
