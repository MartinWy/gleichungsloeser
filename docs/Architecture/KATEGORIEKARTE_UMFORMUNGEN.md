# Kategoriekarte: Semantische Umformungsfamilien

Status: normativ-operativer Bauplan  
Stand: 6. April 2026

## Zweck
Dieses Dokument ordnet die Umformungen des Gleichungsloesers nicht nach Einzelbeispielen,
sondern nach Strukturklassen.

Leitidee:
Gleiche Strukturen sollen gleich behandelt werden.
Nicht der konkrete Ausdruck ist die primaere Einheit,
sondern die semantische Umformungsfamilie.

## Grundsatz
Der Core bleibt ein gemeinsamer Solver-Kern.
Aber die semantische Umformung wird darunter in Familien modularisiert.

Das bedeutet:
- ein gemeinsamer Parser
- ein gemeinsamer Strategievertrag
- ein gemeinsamer Transformationsvertrag
- ein gemeinsamer Projektionsvertrag
- dazu pro Umformungsfamilie ein eigenes Regelpaket
- der produktive Kern arbeitet derzeit bewusst mit genau einer Zielvariable pro Solve-Lauf

## Ziel einer Familie
Jede Umformungsfamilie soll spaeter als eingehangene semantische Komponente behandelbar sein.

Eine Familie beschreibt:
- welches Strukturmuster sie erkennt
- wann sie zulaessig ist
- wie sie semantisch transformiert
- welche Projektionsfolgen sie erzeugt
- welche Exportinformationen sie liefern muss

## Vorschlag fuer die innere Modulform
Eine Familie soll spaeter mindestens diese Rollen haben:
- `matches(struktur)`
- `selectTarget(struktur)`
- `buildDecision(target)`
- `apply(struktur, decision)`
- `projectionHints(result)`
- `exportHints(result)`

Dazu gehoeren lokal:
- `CONTRACT.md`
- `matcher.js`
- `strategy.js`
- `transform.js`
- `projection_hints.js`
- `cases.test.js`

## Kategorielandkarte

### 1. Root-Power-Schalen
Kurzform:
- Wurzel <-> Potenz

Strukturmuster:
- aeussere `ROOT`-Schale um die Zielvariable
- aeussere `POWER`-Schale um die Zielvariable

Semantische Wirkung:
- die wirksame Schale wird auf der aktiven Gleichungsseite abgebaut
- auf der Gegenseite erscheint die inverse Schale

Stand heute:
- **aktiv und produktiv end-to-end**

### 2. Group-Release-Schalen
Kurzform:
- `GROUP -> EXPLICIT_CONTENT`

Strukturmuster:
- auf der aktiven Gleichungsseite liegt genau eine sichtbare top-level `GROUP` als geschuetzte Aussengruppe
- ihr Inhalt traegt die Zielvariable
- die Gegenseite bleibt in diesem Schritt unveraendert

Semantische Wirkung:
- die geschuetzte Aussengruppe wird expliziert
- die Gruppenhuelle bleibt als versteckte Spur erhalten
- der Inhalt wird auf derselben Seite freigelegt
- es entsteht bewusst keine inverse Gegenseiten-Schale

Stand heute:
- **aktiv eingezogen; geschuetzte sichtbare Aussengruppen werden vor inneren Familien freigelegt**

### 3. Negative-Sign-Release-Schalen
Kurzform:
- `NEGATION -> NEGATION`

Strukturmuster:
- eine sichtbare top-level `NEGATION`-Schale liegt direkt vor dem aktiven Ausdruck
- ihr Inhaltsausdruck traegt die Zielvariable
- die Gegenseite wird als ganzes Inversionsargument behandelt

Semantische Wirkung:
- die aeussere Vorzeichenschale wird von der aktiven Seite abgebaut
- der innere Ausdruck wird freigelegt
- auf der Gegenseite entsteht eine inverse `NEGATION`
- dies ist bewusst keine normale Bruchgeburt

Stand heute:
- **aktiv eingezogen; das Vorzeichen direkt vor dem aktiven Ausdruck wird als eigene Schale behandelt**

### 4. Addition-Release-Schalen
Kurzform:
- `ADDITION -> SUBTRACTION`

Strukturmuster:
- sichtbare top-level `+`-Huelle
- genau ein Segment traegt die Zielvariable
- genau ein Segment ist ein passiver Ausdruck ohne Zielvariable

Semantische Wirkung:
- der passive Summand wird von der Zielseite abgebaut
- auf der Gegenseite entsteht eine inverse `SUBTRACTION`

P2-Aufgabe:
- aktives Segment und passiven Summanden unterscheiden
- aeussere Addition vor inneren Familien priorisieren

P3-Aufgabe:
- passiven Summanden plus `+` unsichtbar machen
- aktiven Ausdruck freilegen
- inverse `SUBTRACTION` auf der Gegenseite erzeugen

P4-Aufgabe:
- additive Herkunftsspur halten
- inverse Schale linear als Inhalt, Operator und passiven Ausdruck projizieren

Exportbezug:
- welcher passive Summand verschoben wurde
- welche inverse `SUBTRACTION` daraus entstand

Stand heute:
- **aktiv im Ein-Zielvariablen-Rahmen eingezogen**

### 5. Subtraction-Release-Schalen
Kurzform:
- `SUBTRACTION -> ADDITION`

Strukturmuster:
- sichtbare top-level `-`-Huelle
- linkes Segment mit Zielvariable
- rechtes Segment ohne Zielvariable

Semantische Wirkung:
- der passive Subtrahend wird von der Zielseite abgebaut
- auf der Gegenseite entsteht eine inverse `ADDITION`

P2-Aufgabe:
- aktives linkes Segment und passiven rechten Ausdruck unterscheiden
- die Gegenrichtung `2-x` bewusst nicht heimlich mitloesen

P3-Aufgabe:
- passiven Subtrahenden plus `-` unsichtbar machen
- aktiven Ausdruck freilegen
- inverse `ADDITION` auf der Gegenseite erzeugen

P4-Aufgabe:
- additive Herkunftsspur halten
- inverse Schale linear als Inhalt, Operator und passiven Ausdruck projizieren

Exportbezug:
- welcher passive Subtrahend verschoben wurde
- welche inverse `ADDITION` daraus entstand

Stand heute:
- **aktiv im Ein-Zielvariablen-Rahmen eingezogen**

### 6. Subtrahend-Release-Schalen
Kurzform:
- `SUBTRACTION -> SUBTRACTION + NEGATION`

Strukturmuster:
- sichtbare top-level `-`-Huelle
- linkes Segment ohne Zielvariable
- rechtes Segment mit Zielvariable

Semantische Wirkung:
- der passive linke Minuend wird von der Zielseite abgebaut
- auf derselben Seite entsteht zunaechst eine sichtbare `NEGATION` um den Zielausdruck
- auf der Gegenseite entsteht eine inverse `SUBTRACTION`
- erst danach darf `negative_sign_release` die neue Vorzeichenschale weiter abbauen

Stand heute:
- **aktiv eingezogen; `2-x` ist bewusst von `x-2` getrennt**

### 7. Fraction-Birth-Schalen
Kurzform:
- `MULTIPLICATION -> DIVISION`

Strukturmuster:
- kanonische Multiplikationshuelle um die Zielstruktur
- genau ein Top-Level-Ausdruck traegt die Zielvariable
- genau ein Top-Level-Ausdruck traegt die Zielvariable nicht
- implizite und explizite Schreibweise werden gleich behandelt,
  sobald `P1` dieselbe Struktur erzeugt

Semantische Wirkung:
- ein passiver Ausdruck wird von der Zielseite abgebaut
- auf der Gegenseite wird daraus eine Nenner- oder Divisionsstruktur

Stand heute:
- **aktiv eingezogen; Zahlen, Gruppen und andere passive Ausdruckstraeger werden gleich behandelt, solange sie top-level ein Ausdruck ohne `x` sind**

### 8. Fraction-Collapse-Schalen
Kurzform:
- `DIVISION -> MULTIPLICATION`

Strukturmuster:
- explizite Zaehler-/Nenner-Struktur
- Zaehlerausdruck mit Zielvariable
- Nennerausdruck ohne Zielvariable
- vertikale Semantik statt nur linearer Tokenfolge

Semantische Wirkung:
- eine vorhandene Nennerstruktur wird abgebaut
- derselbe Nennerausdruck taucht auf der Gegenseite als Faktor auf

Stand heute:
- **aktiv eingezogen; aktive Gegenrichtung zu `fraction_birth` im Ausdrucksrahmen `Zaehler mit x / Nenner ohne x`**

### 9. Exponential-Logarithmus-Schalen
Kurzform:
- Exponential <-> Logarithmus

Strukturmuster:
- Zielvariable liegt im Exponenten
- explizite Basis bestimmt die inverse Schale

Semantische Wirkung:
- Exponentialhuelle wird freigelegt
- Gegenseite wird mit Logarithmus derselben Basis umschlossen

Stand heute:
- **normativ beschrieben, produktiv noch offen**

### 10. Allgemeine Gruppen- und Klammerschalen
Kurzform:
- geschuetzte Gruppenraeume

Strukturmuster:
- Klammern, Gruppen, geschachtelte Inhaltsraeume

Semantische Wirkung:
- definieren, was waehrend eines Schritts geschuetzt bleibt
- sind oft keine eigene Endumformung, aber eine zentrale Vorbedingung anderer Familien

Stand heute:
- **als allgemeiner Gruppenraum weiter konzeptionell wichtig; die aktive Aussengruppen-Freilegung selbst ist jetzt als `group_release` produktiv eingezogen**

### 11. Trigonometrische Umkehrschalen
Kurzform:
- `trig_inverse`: sin/cos/tan -> asin/acos/atan
- `inverse_trig`: asin/acos/atan -> sin/cos/tan

Stand heute:
- **aktiv eingezogen; beide gerichteten trigonometrischen Familien sind im Ein-Zielvariablen-Rahmen produktiv**

## Aktiver Familienrahmen am 6. April 2026
Aktiv im heutigen Produktivkern sind:
- `group_release`
- `negative_sign_release`
- `root_power`
- `fraction_birth`
- `fraction_collapse`
- `addition_release`
- `subtraction_release`
- `subtrahend_release`
- `trig_inverse`
- `inverse_trig`

Nicht aktiv sind derzeit bewusst:
- Mehrzielvariablen
- mehrere top-level additive Operatoren in einem einzigen Schritt
- neue Familien, die nur durch stilles Raten entstehen wuerden
