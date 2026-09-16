# bridge_b: Migrationskarte

Status: erste Andockphase umgesetzt  
Stand: 9. August 2026

## Heutige Quelle

Die aktuelle Vorarbeit liegt unter:

```text
projects/complex_exponent_transition/
```

## Ziel

`bridge_b/` soll spaeter nur den Brueckenschritt enthalten
zwischen:

- stabilem Vorzustand aus `core_a`
- stabilem Nachzustand fuer den Folgefluss

## Regel

`bridge_b` liest und uebersetzt.
`bridge_b` schreibt nicht in den Kern zurueck.

## Bereits umgesetzt

1. Ziel-Fassade `bridge_b/index.js`
2. eigener Contract-Raum unter `contracts/bridge_state/`
3. Referenzsammlung fuer Alt-Dokumente, Snapshots und Prototypen
4. explizite Layout-Invarianten fuer den Grenzschritt
5. erster produktiver `transition_step`
   fuer `boundary_state + landing_profile -> landing_state`

## Noch nicht umgesetzt

1. keine produktive Umverdrahtung des Altpfads
2. keine Anbindung an `core_a`
3. keine Anbindung an ein spaeteres `A2`
4. noch keine Rueckkopplung in Renderer- oder Filmszenen
