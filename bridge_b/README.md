# bridge_b

Status: erste Ziel-Fassade aktiv  
Stand: 9. August 2026

## Zweck

`bridge_b` ist die kuenftige Ordnerwurzel
des Spezialisten fuer den Uebergang:

```text
komplexer Exponent -> normaler Termraum
```

Dieser Baustein ist nicht der allgemeine Solver,
sondern genau ein Brueckenschritt
zwischen zwei stabilen Zustaenden.

## Heute

Die aktuelle Vorarbeit liegt noch unter:

```text
projects/complex_exponent_transition/
```

Der produktive Altpfad bleibt dort unberuehrt.

Hier existieren jetzt bereits:

- `index.js` als Ziel-Fassade
- `contracts_in/` fuer die Eingabevertraege
- `contracts_out/` fuer den Ausgabevertrag
- `scene_logic/` mit Referenzen auf Dokumente, Snapshots und Prototypen
- `layout_bridge/` mit den harten Layout-Invarianten des Grenzschritts
- `transition_step/` mit dem ersten echten lokalen Bridge-Motor

Wichtig:

- Es wurde nichts aus `projects/complex_exponent_transition/` verschoben.
- Die neue Struktur referenziert den Altstand nur lesend.

## Regeln

- `bridge_b` darf spaeter nur ueber Contracts an den Kern andocken.
- Keine Rueckschreibungen in `core/`.
- Keine allgemeinen Solverregeln in `bridge_b`.
- `bridge_b` bleibt ein Ein-Schritt-System:
  Shell aufbrechen, landen, uebergeben.
