# Handbuch: Phase P1 - Eingabe (Atomisierung)
Quelle: Genesis-Gleichungsloeser-Maschine (v2.0)

## Definition Atome
Atome sind die kleinsten unveraenderlichen Einheiten einer Gleichung (Zahlen, Variablen, Operatoren, Anker).
**Atomare Erhaltung:** Atome bleiben in ihrer urspruenglichen symbolischen Form erhalten. Zahlen sind Symbole, keine Ergebnisse.

## Deterministische IDs (UUID-Permanence)
Jedes Atom und jede Schale erhaelt beim ersten Einlesen eine persistente ID.
Diese ID ist der Anker fuer die Positionstreue und darf sich waehrend des gesamten Loesungsprozesses nicht aendern.

Im heutigen produktiven Rahmen gilt jetzt:
- derselbe normalisierte Eingabestring erzeugt denselben initialen ID-Satz
- die Basis-IDs entstehen in `P1` deterministisch aus Eingabe-Namespace und laufstabilen Zaehlern
- spaeter erzeugte inverse Schalen bauen darauf mit Herkunftsmetadaten auf

## Berechnungsverbot & Schalen-Integritaet
Das System liest Ausdruecke exakt so ein, wie sie geschrieben stehen. Es findet beim Parsen keine numerische Auswertung oder algebraische Vereinfachung statt.

## Aktiver Parser-Rahmen
Der heutige produktive Parser kann bereits:
- `sqrt(...)` als `ROOT`-Schale lesen
- einfache Potenzen als `POWER`-Schalen lesen
- erste Funktionen wie `sin(x)` als `FUNCTION`-Schalen lesen
- Gruppen wie `(x+1)` oder `(2*3)` als `GROUP`-Schalen lesen
- implizite Multiplikation wie `2x`, `2sin(x)` oder `(2+1)x` in dieselbe kanonische Multiplikationsstruktur ueberfuehren wie `2*x`, `2*sin(x)` oder `(2+1)*x`
- aktive Bruchfaelle wie `x/2`, `x/(2+1)` oder `sin(x)/(2*3)` als `DIVISION`-Schale lesen, solange die Nennerseite als ein Ausdruckstraeger vorliegt
- negative Vorzeichen direkt vor einem aktiven Ausdruck wie `-x`, `-(x+1)` oder `-sin(x)` als eigene `NEGATION`-Schale lesen

## Wichtige Ehrlichkeit
- Der Parser ist noch kein vollstaendiger Algebra-Parser, sondern ein wachsender Familien-Parser fuer die aktive Kernspur.
- Der deterministische ID-Vertrag ist fuer den aktiven Ein-Zielvariablen-Rahmen eingezogen, aber noch nicht fuer alle kuenftigen Familien bewiesen.
- `NEGATION` wird im aktiven Kern nur dann als eigene Schale gelesen, wenn das Vorzeichen direkt vor dem aktiven Ausdruck steht.
- Ungruppierte Ketten oder tief verschachtelte Nennerlandschaften gehoeren noch nicht zum produktiven Parserrahmen.
