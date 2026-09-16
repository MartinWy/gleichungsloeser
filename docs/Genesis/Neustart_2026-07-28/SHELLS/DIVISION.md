# Schalenstandard DIVISION

Status: normativ
Stand: 14. September 2026
Schalenart: `DIVISION`

## Eine Aufgabe

`DIVISION` beschreibt die gerichtete Beziehung
eines vollstaendigen Zaehlerausdrucks zu einem vollstaendigen Nennerausdruck.

## Kanonische Kinder

- `numerator`: genau ein vollstaendiger Ausdruckswurzelknoten
- `division_operator`: genau ein stabiles Divisionsoperator-Atom aus der Eingabe oder Herkunft
- `denominator`: genau ein vollstaendiger Ausdruckswurzelknoten

Zaehler und Nenner sind geordnet und nicht vertauschbar.

Kanonische Maschinenfelder sind `numerator: [root]`, `operator`
und `denominator: [root]`.

## Invarianten

- Multiplikation und Division werden mit gleicher Praezedenz linksassoziativ gelesen.
- `a*b/c` bedeutet `(a*b)/c`.
- `a/b*c` bedeutet `(a/b)*c`.
- P3 darf eine Division nur aufgrund einer P2-Decision erzeugen oder oeffnen.
- Ist ein passiver Faktor selbst eine vollstaendige `DIVISION`, wird seine
  inverse Operation kanonisch als Multiplikation mit dem Kehrbruch erzeugt.
  Dasselbe gilt, wenn genau eine explizite `GROUP` genau diese eine `DIVISION`
  bindet; die Gruppierung aendert die Rechenart des Faktors nicht.
- Der Kehrbruch vertauscht ausschliesslich die vollstaendigen Zaehler- und
  Nennerwurzeln. Deren innere Schalen, Reihenfolge und IDs bleiben erhalten.
- Ein Renderer darf die alternative Doppelbruchform nicht aus optischen
  Gruenden nachtraeglich in einen Kehrbruch umformen. Die Entscheidung gehoert
  zu P2 und ihre strukturelle Ausfuehrung zu P3.
- P4 baut die funktionale Bruchgeometrie um bereits fertige Kinder.
- P4 bestimmt die tatsaechliche funktionale Breite des vollstaendigen
  Zaehlerblocks und des vollstaendigen Nennerblocks getrennt.
- Zur vollstaendigen Blockbreite gehoeren auch bereits gebaute sichtbare
  Primitive einer Kindschale, etwa Funktionsname, Klammern oder Wurzelhaken.
  Ein engeres inneres Ausrichtungsband darf die Termbreite nicht ersetzen.
- Der laengere der beiden Kindbloecke bestimmt das gemeinsame Bruchband und
  damit die funktionale Laenge des Bruchstrichs.
- Der kuerzere Kindblock wird bei der Geburt der `DIVISION` als vollstaendiger,
  bereits fertiger Block genau einmal auf die Mitte dieses Bruchbands gesetzt.
  P4 darf dafuer nur den ganzen Kindblock starr verschieben; seine innere
  Zellordnung und seine bereits fertigen Unterschalen bleiben unveraendert.
- Bei gleicher funktionaler Breite muessen beide Kindbloecke dieselbe Mitte
  erhalten. Deterministischer Bezug ist das Zaehlerband; nur ein abweichend
  liegender Nennerblock wird als Ganzes auf dessen Mitte gesetzt.
- `collectionRanges.numerator` und `collectionRanges.denominator` beschreiben
  weiterhin die tatsaechlich belegten Zellen der beiden Kindbloecke.
  `collectionAlignmentRanges.numerator` und
  `collectionAlignmentRanges.denominator` beschreiben dagegen fuer beide
  Kinder dasselbe vollstaendige Bruchband. Belegung und Ausrichtung duerfen
  nicht miteinander verwechselt werden.
- Besteht der kuerzere Kindblock unmittelbar aus genau einem atomaren Kind,
  bleibt dieses Kind genau ein atomares Display-Atom und genau eine funktionale
  Projektionszelle. P4 gibt dieser einen Zelle die Grenzen des gemeinsamen
  Bruchbands (`colStart`/`colEnd`) und setzt ihre Identitaetsspalte `col`
  deterministisch auf die rechte der beiden Mittelspalten, falls die Bandmitte
  zwischen zwei Spalten liegt. Die Zellgrenzen, nicht `col`, legen die
  geometrische Mitte des Display-Atoms fest.
- Der Renderer bildet diese bereits fertige Zelle mit ihren gelieferten
  Grenzen ab und setzt ihren atomaren Inhalt mit seiner allgemeinen
  Zellabbildung in die Zellmitte. Er darf weder das Bruchband rekonstruieren
  noch aus Nachbarzellen oder `collectionAlignmentRanges` eine andere Position
  ableiten.
- Die fertige Ausrichtung gehoert zur Geburtsgeometrie der `DIVISION` und wird
  auf derselben Gleichungsseite zusammen mit den IDs transportiert. Sie darf
  beim Oeffnen des Bruchs weder zusammenfallen noch von einem Renderer neu
  berechnet werden.
- Der Bruchstrich ist ein eigenes strukturelles Spannprimitiv der `DIVISION`.
  Er besitzt auch ohne Textwert eine vollstaendige funktionale Identitaet,
  Zeile und Spalten-Spannweite und darf an keiner Modulgrenze als leere
  Textzelle behandelt oder entfernt werden.
- Wird eine fertige `DIVISION` unveraendert durchgereicht, muessen Zaehler,
  Bruchstrich, Nenner und der zugehoerige `DIVISION`-Schalen-Span gemeinsam
  genau einmal im Koordinatensystem der Empfaengerzeile ankommen.
- Bleibt bei der Ausrichtung eines kuerzeren Kindblocks aufgrund verschiedener
  Breitenparitaet nur eine Mittelachse zwischen zwei diskreten Zellen,
  verwendet P4 fuer die tatsaechliche innere Belegung deterministisch die rechte
  der beiden naechsten Lagen. Das gemeinsame `collectionAlignmentRange` traegt
  weiterhin die exakte Bruchachse. P4 erzeugt dafuer weder eine halbe noch eine
  zusaetzliche Zelle.
- Ein Renderer darf keinen Bruch aus `/`, Text oder Nachbarzellen rekonstruieren.
- Eine lineare Diagnose- oder Vertragsdarstellung mit `/` muss die Schalenidentitaet
  eindeutig erhalten. Additive oder subtraktive Zaehler sowie zusammengesetzte
  Nenner werden deshalb geklammert: `(a-2)/c`, `a/(b*c)`, `a/(b-c)`.
- Diese Klammern gehoeren nur zur eindeutigen linearen Serialisierung. Sie ersetzen
  weder die funktionale Bruchgeometrie von P4 noch erzeugen sie Rendergeometrie.

## Fehlerbedingungen

Ungueltig sind leerer Zaehler oder Nenner, fehlender Operator,
mehrdeutige Kindreihenfolge oder eine Division durch einen syntaktisch leeren Ausdruck.
Ungueltig ist auch ein Bruch, dessen Strich nicht vom laengeren Kindblock
bestimmt wird oder dessen kuerzerer Kindblock nicht auf der Mitte des
gemeinsamen Bruchbands liegt. Ebenso ungueltig ist ein atomarer Zaehler oder
Nenner, dessen gelieferte Zellgrenzen nicht dieselbe Mitte wie das gemeinsame
Bruchband besitzen.
