# Regelwerk P3

Status: normativ-operativ  
Stand: 13. Juli 2026

## Auftrag
`P3_Umformung` setzt die von `P2` gelieferte Familien-Decision strukturell um
und erzeugt daraus die naechste Theorie-Zeile.

## Darf
- die benannte Zielschale verifizieren
- sie freilegen, ausblenden oder umkehren
- inverse Schalen mit Herkunftsmetadaten erzeugen
- die Gleichung als neue Struktur zusammensetzen

## Darf nicht
- die Strategie neu erfinden
- Layout oder Breiten berechnen
- stillschweigend rechnen oder vereinfachen

## Invarianten
- genau ein Hauptumbau pro Schritt
- unveraenderte Atome behalten ihre Identitaet
- inverse Schalen erhalten neue, aber nachvollziehbare Herkunft
- keine Direktmutation der Eingabestruktur

## Produktiver Rahmen heute
`P3` verarbeitet die aktiven Familien aus `P2`.
Es gilt:
- `group_release` nur als Freilegung auf derselben Seite
- Umkehrfamilien erzeugen die Gegenstruktur explizit
- Brueche werden strukturell und nicht als stille Kehrbruchlogik behandelt
- die Reihenfolge neu entstehender Multiplikationsfaktoren wird nicht in einzelnen Familien gepatcht, sondern zentral ueber `Konfiguration.js` festgelegt

## Wenn hier etwas schieflaeuft
Typische Symptome:
- falscher Ausdruck wandert
- Vorzeichen, Nenner oder Funktionshuelle werden falsch umgesetzt
- dieselbe Decision fuehrt zu inkonsistenter neuer Struktur

Dann ist `P3` der richtige Ort.
