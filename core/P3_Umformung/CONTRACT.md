# P3 Contract: Umformung

Status: aktiv
Stand: 13. Juli 2026

## Auftrag
`P3_Umformung` setzt die von `P2` gelieferte Familien-Decision strukturell um und erzeugt die naechste Theorie-Zeile.

## Oeffentliche API
`Umformer.invertiere(struktur, entscheidung, options?)`

## Eingabe
- komplette Gleichungsstruktur als Array
- explizite Familien-Decision aus `P2`
- optionale Umformungs-Policy, aktuell insbesondere `rightSideFactorPlacement`

## Ausgabe
- neue Struktur als Array

## Eigentum dieser Phase
`P3` besitzt:
- Verifikation der aktiven Zielschale
- Freilegung, Ausblendung und Erzeugung inverser Schalen
- Aufbau der naechsten Theorie-Zeile
- Herkunftsmetadaten neuer Schalen
- deklarative Reihenfolge neu erzeugter Gegenschalen, soweit diese eine strukturierte Anordnung brauchen

`P3` besitzt nicht:
- Strategiewahl
- semantische Slotplanung
- sichtbare Breiten- oder Rendermetrik

## Verantwortung
- Gleichheitsanker finden
- die von `P2` benannte Zielschale oder Huelle verifizieren
- diese Huelle freilegen oder unsichtbar markieren
- je nach Familie eine inverse Gegenschale erzeugen oder eine Aussengruppe lokal freilegen
- inverse Schalen mit stabiler generierter ID und Herkunftsmetadaten versehen
- ohne Direktmutation der Eingabestruktur arbeiten

## Verboten
- neue Strategie erfinden
- Layout oder Grid berechnen
- stillschweigend vereinfachen

## Wichtige Ist-Hinweise
- produktiv verarbeitet werden heute die aktiven Familien aus `P2`
- freigelegte Inhalte erhalten `isBefreit: true`
- inverse Schalen tragen stabile generierte IDs plus Herkunftsmetadaten
- `originFactorId` bleibt als Kompatibilitaetsalias in der aktiven Kernspur erhalten
- die Reihenfolge neu erzeugter Multiplikationsschalen auf der rechten Seite wird zentral ueber `Konfiguration.js` gesteuert und nicht ad hoc im Familiencode verteilt

## Aendern, wenn ...
- die richtige Decision den falschen strukturellen Umbau ergibt
- eine inverse Schale falsch gebaut wird
- Herkunftsmetadaten oder ID-Invarianz verletzt werden

## Nicht hier aendern, wenn ...
- die falsche Familie gewaehlt wurde
- die Struktur richtig ist, aber spaeter sichtbar driftet
