# Complex Exponent Transition

## Zweck

Dies ist ein **separates Folgeprojekt**.

Es behandelt nicht die Algebra des bestehenden Gleichungsloesers,
sondern nur den visuellen Uebergang
zwischen zwei mathematisch festen Zustaenden:

1. ein komplexer Exponent bleibt als Einheit im Exponentenraum
2. derselbe Inhalt erscheint spaeter als normaler Term auf horizontaler Ebene

## Leitidee

```text
Der bestehende Gleichungsloeser produziert Zustaende.
Dieses Projekt produziert den Uebergang zwischen Zustaenden.
```

## Harte Systemgrenze

Fuer dieses Projekt gilt ohne Ausnahme:

```text
A1 rechnet bis zur Grenze.
B macht genau einen Schritt:
den komplexen Exponenten in den normalen Termraum ueberfuehren.
A2 rechnet erst danach weiter.
```

Das heisst:

- `B` entfernt keine Faktoren vor dem Grenzschritt
- `B` fuehrt keine Folgeumformungen nach dem Grenzschritt aus
- `B` baut nur die Bruecke zwischen zwei bereits gueltigen Solverzustaenden

Die beiden sichtbaren B-Zeilen muessen nicht spaltentreu zueinander sein.
Die Boundary-Zeile beendet die alte `POWER`-Geometrie.
In der Boundary-Zeile ist der gesamte komplexe Exponent genau eine geschlossene
Termspur und eine funktionale Spalte. Erst die Landing-Zeile faltet diese Spur auf:
jedes sichtbare Inhaltsatom und jeder sichtbare Operator bekommt dort genau einen
eigenen normalen `term_slot`.
Die Landing-Zeile setzt den Exponenteninhalt kompakt auf die normale Achse
und definiert damit bereits die Startspuren fuer `A2`.
Alte Basis- oder Exponentenspalten duerfen dort keinen Leerraum mehr blockieren.
Umgekehrt duerfen die neu belegten Landing- und A2-Spalten keinen Leerraum in
der A1-Boundary oder in frueheren A1-Zeilen erzeugen. Die zusammengesetzte
Ausgabe kennzeichnet A1-Zeilen mit `processSpaceId = a1` und die B-Landung samt
A2-Folgezeilen mit `processSpaceId = a2`. Beide Breitenprofile bleiben getrennt
und werden nur am gemeinsamen Gleichheitsanker ausgerichtet.

Die anschliessenden A2-Zeilen behalten ihre vollstaendige, von P4 gelieferte
funktionale Geometrie. Dieses Projekt darf verschachtelte Brueche nicht aus
benachbarten Teilzeilen neu berechnen, neu zentrieren oder verkleinern.

Dasselbe gilt bereits fuer die exklusive B-Landing-Zeile: Eine unveraendert
durchgereichte Schale umfasst auch textlose Spannprimitive wie `fraction_line`.
Die inverse Funktionshuelle und ihr vollstaendiges Argument muessen gemeinsam
im zeilenlokalen Raster der Landing-Zeile stehen. B darf Boundary-Kindzeilen
nicht mit unverschobenen Landing-Schalen-Spans mischen.

Die Abbildung geschieht identitaetsbasiert. Dieselbe numerische Quellspalte
kann in verschiedenen lokalen Zeilen mehrere verschiedene Zellen tragen und
darf deshalb nicht als globaler Abbildungsschluessel verwendet werden. Die
durchgereichte Kindschale behaelt ihre Boundary-Zellen; neue Huellezellen und
die geoeffneten Exponentenatome erhalten ausschliesslich die im Landing-Profil
benannten Zielzellen.

## Nichtziel

Dieses Projekt darf nicht:

- den aktiven Solver erweitern
- P1 bis P4 veraendern
- den bestehenden Cockpit-Renderer umbauen
- Rueckwirkungen in den aktiven Kern erzeugen

## Ordner

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [A1_B_A2_CONTRACT_SKETCH.md](./A1_B_A2_CONTRACT_SKETCH.md)
- [B_LOCAL_TASK.md](./B_LOCAL_TASK.md)
- [B_IO_CONTRACT.md](./B_IO_CONTRACT.md)
- [CONTRACT.md](./CONTRACT.md)
- [SCENE_IDEAS.md](./SCENE_IDEAS.md)
- [snapshots/README.md](./snapshots/README.md)
- [prototypes/README.md](./prototypes/README.md)
- [tests/README.md](./tests/README.md)

## Minimaler Arbeitsmodus

Das Projekt kann mit zwei festen Szenen beginnen:

- `before`: Exponent bleibt kompakt
- `after`: derselbe Inhalt liegt auf normaler Ebene

Alle Zwischenbilder,
Kamerawege
und Bahnkurven
gehoeren dann diesem Projekt
und nicht dem bestehenden Gleichungsloeser.

## Reale Hand-off-Inspektion

Der erste echte Anschluss
zwischen `core_a` und `bridge_b`
liegt jetzt auch als Inspektor vor:

```text
node projects/complex_exponent_transition/inspect_real_bridge_handoff.mjs "y=a*B^(2x-1)" --target x --json
```

Der Befehl liest genau einen echten `solve_state`
aus dem aktiven Kern
und erzeugt daraus:

- `boundary_state`
- `landing_profile`
- `landing_state`

ohne eine zweite Gleichung frei zu erfinden.

Die Inspektionsszenen lesen Basis und Exponent ueber die von P4 gelieferten
`regionRole`-Werte `power_base` und `power_exponent`.
Bei einem strukturierten Exponenten duerfen sie nicht verlangen,
dass jedes innere Atom die Potenzschale als unmittelbare Elternschale besitzt.

## Schutzregel

Der bestehende Kern wird nur gelesen,
nicht beruehrt.

Der Uebergang ist hier ein eigener visueller Raum,
kein Patch des bestehenden Renderers.

## Aktiver Darstellungsweg

Der fruehere eigenstaendige PDF-Generator
`render_b_real_transition.mjs` ist seit dem 11. September 2026 archiviert. Er
importierte den abgeloesten Sammelrenderer `stepLayout.js` und konnte deshalb
keinen heutigen atomaren Referenzweg mehr darstellen.

Produktiv gilt ausschliesslich:

```text
P4-Zellen -> Worksheet-ViewModel -> atomarer Export/Renderer
```

Der B-Uebergang liefert dafuer nur `boundary_state` und `landing_state`. Er
besitzt keinen zweiten Renderpfad und darf die funktionale Geometrie weder
ergaenzen noch rekonstruieren.
