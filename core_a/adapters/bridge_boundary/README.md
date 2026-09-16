# bridge_boundary

Status: Boundary-Adapter auf kanonischen Genesis-Schalen
Stand: 16. September 2026

Dieser Adapter liest einen echten `solve_state`
aus dem aktiven Kern
und exportiert daraus den `boundary_state`
fuer den Bridge-Uebergang `A1 -> B`.

Er tut dabei bewusst nur vier Dinge:

1. die einzige `power_exponent_release`-Grenze finden
2. die Zeile direkt davor als Grenzzeile lesen
3. echte Anker-, Potenz- und Gegenausdrucksdaten herausziehen
4. diese Daten in den Vertragsraum `boundary_state` uebersetzen

Die Exponentenstruktur wird ausschliesslich in der kanonischen Reihenfolge gelesen:

- `MULTIPLICATION`: Faktoren und Operatoren abwechselnd
- `ADDITION`: Terme und Operatoren abwechselnd
- `SUBTRACTION`: Minuend, Operator, Subtrahend
- weitere Schalen ueber ihre registrierten Genesis-Kindrollen

Alte Rollen wie `content/factor/passive` oder `flowDirection`
sind keine zulaessige Boundary-Eingabe mehr.

Der Adapter exportiert die von P4 wirklich gelieferten inneren Inhalts-, Operator-
und Schalenzellen als `ordered_cells` innerhalb genau einer geschlossenen
Boundary-Termspur (`functional_track_count: 1`). Die Folge ist an dieser Stelle
nur die nachweisbare innere Ordnung; sie reserviert noch keine normalen
Landing-Spalten. Theorie-Text darf diese Zellfolge nicht ersetzen.

Explizit unsichtbare P4-Huellezellen gehoeren weiterhin zum Core-Zellprofil,
aber nicht zur sichtbaren Inhaltsfolge, die B in normale A2-Termslots oeffnet.
Der Adapter uebernimmt daher nur Projektionszellen mit `isVisible !== false` in
`ordered_cells`. Er entscheidet die Sichtbarkeit nicht selbst und darf einen
eingeklappten POWER-Klammer-Slot weder als Landing-Term behandeln noch sichtbar machen.

Er tut dabei ausdruecklich **nicht**:

- den Kern weiterrechnen
- die Log-Zeile selbst erzeugen
- A2-Geometrie planen
- alte Reservespalten kuenstlich fortschreiben
