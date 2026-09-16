# Test-Ampel

Stand: 16. September 2026

## Zweck und Lesart

Diese Ampel misst den aktuellen Standardlauf gegen Genesis und die Modulmatrix.
Sie veraendert keinen Vertrag.

Ein roter Test bedeutet nur,
dass Testvertrag und heutiger Code nicht uebereinstimmen.
Vor jeder Codeaenderung wird deshalb zuerst entschieden:

1. Verlangt der Test den gueltigen Genesis-Vertrag?
2. Welches einzelne Modul besitzt die Abweichung?
3. Ist zuerst die lokale Modulrichtlinie zu ergaenzen?

Ein Rendererfehler darf niemals durch eine Aenderung der korrekten Core-Wahrheit verdeckt werden.

## Gesamtstand

Gemessen mit `npm test` am 16. September 2026:

| Menge | Gesamt | Gruen | Rot |
| :--- | ---: | ---: | ---: |
| Kernvalidierungen unter `core/` | 5 | 5 | 0 |
| Dateien unter `tests/active/` | 86 | 86 | 0 |
| Standardlauf insgesamt | 91 | 91 | 0 |

Es stehen keine aktiven Tests mehr auf Rot.

Die vorkanonischen Tests wurden nicht geloescht,
sondern unter `alt/2026-09-10_pre_genesis_tests/` archiviert und durch
Genesis-Nachfolger ersetzt. Das Archiv enthaelt exakt 31 Tests und wird mit
`npm run test:legacy` als explizites Register geprueft; es ist kein zweiter
Produktivlauf.

## Gruene Core-Grenze

Alle direkt dem verbindlichen Genesis-Core zugeordneten Tests sind gruen:

- P1, P2 und P3 samt Entscheidungen, Zielwahl, Sequenzen und Schalen
- alle acht internen P4-Prozessmodule samt Modulgrenzen
- Gesamt-Solve-Flow, Zielvariablenwahl und Kosinussatz
- Bruchgeburt, Kehrbruch, Fraction Collapse und Sinussatz-Transport
- Legacy-Solve- und Legacy-Projektionsadapter
- Bridge-B-Grenze, Transition und reales Handoff
- A1-Exponentenspur und die einmalige, identitaetstreue Neuvergabe kompakter A2-Termspalten durch B
- Mehrsummandenbindung und gruppierter Kehrbruchfaktor
- eigener sichtbarer `subtracted_sum_release`-Schritt fuer `U-(V+W+...)`
- vollstaendiges globales P4-Zellprofil vor Blocks und Writer einschliesslich expliziter Zukunftsreservierungen
- getrennte Platzierungsspuren bei algebraischem Seitenwechsel und spaeterem
  Wiedereintritt derselben semantischen Identitaet; spaetere Geburtslagen
  verbreitern keine frueheren Bruchkinder
- allgemeine FUNCTION-Reihenfolge `Name < vollstaendige Basis < linke Klammer < Argument < rechte Klammer`
- verpflichtende POWER-Basis-Klammerzellen samt Core-Sichtbarkeit, horizontaler
  Ordnung und vertikaler Vollspanne ueber eine verschachtelte Potenzbasis

Damit ist die dokumentierte Core-Ausgangsgrenze vollstaendig gruen.

## Gruene nachgelagerte Kette

Auch die Abnehmer hinter dem Core sind im Standardlauf gruen:

- Core-A und alle Bridge-B-Grenzen
- Cockpit-Server, Farbziele und Theorie-Label-Adapter
- Worksheet ViewModel, DisplayModel und Column Layout
- physische Atomidentitaet innerhalb eines Prozessraums sowie genau ein Bridge-Wechsel
- funktional getrennte Spaltenraeume `a1` und `a2` sowie die ausschliesslich von B ausgefuehrte Spaltenneuvergabe
- beidseitige Breitenisolation der A1- und A2-Prozessraeume bei gemeinsamem Gleichheitsanker
- atomare freie Logarithmusbasis sowie vollstaendige, exakt aus A2 uebernommene Funktionsklammern nach Bridge B
- atomarer DOM- und LaTeX/PDF-Export
- zustandslose PNG-/PDF-Auslieferung innerhalb derselben Renderantwort samt
  bytegleicher Browser-Objekt-URL
- Render-Scene-Vertrag und blinder Renderer-Kernel-Ingest

Die frueher roten LaTeX-Tests verlangten die entfernte Sammelrenderer-Semantik.
Die frueher roten Scene-Plan-, Root- und Group-Tests verlangten die Rekonstruktion
funktionaler Geometrie aus sichtbaren Fragmenten. Beide Testgruppen liegen deshalb
mit Begruendung und aktivem Nachfolger im Archivregister `tests/LEGACY_STATUS.md`.

## Verbindliche Folgerung

Es gibt derzeit keine rote Testgrenze.

Gruen bedeutet nicht, dass jede geplante Fassade bereits vollstaendig ausgebaut ist.
Gelbe Architekturpunkte stehen getrennt in der Modul-Ampel. Sie duerfen erst nach
Richtlinie und fokussiertem Test erweitert werden. Insbesondere bleibt verboten,
im Renderer funktionale Geometrie zu rekonstruieren oder fehlende Core-Angaben
auszugleichen.

Der vollstaendige Standardlauf wird nach jeder isolierten Modulkorrektur erneut ausgefuehrt.
