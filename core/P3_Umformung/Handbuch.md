# Handbuch: Phase P3 - Umformung (TRANSFORMATION_LOGIC)
Quelle: Genesis-Gleichungslöser-Maschine (v2.0) / Step Semantics

## 1. Strukturfreigabe und inverse Operationen
P3 fuehrt keine Mathematik im Sinn von Rechnen aus.
Die Phase baut nur sichtbar und semantisch korrekt um.

### R1 Struktur explizieren
- **GROUP -> EXPLICIT_CONTENT**
  - Eine geschuetzte sichtbare Aussengruppe auf der Zielseite wird unsichtbar gemacht.
  - Ihr Inhalt wird auf derselben Seite freigelegt.
  - Die Gegenseite bleibt dabei unveraendert.

### R2 Inverse Operationen
- **Addition (+) <-> Subtraktion (-)**
- **Multiplikation (*) <-> Division (/)**
- **NEGATION (- direkt vor aktivem Ausdruck) -> NEGATION auf der Gegenseite**
- **ROOT (Wurzel) -> POWER (n=2)**
- **POWER (n=2) -> ROOT**
- **sin/cos/tan -> asin/acos/atan**
- **asin/acos/atan -> sin/cos/tan**

### Spaetere Erweiterung
- **EXPONENTIAL ($x \in$ Exponent) -> LOG**
  - normativ beschrieben, im aktiven Kern aber noch nicht produktiv eingezogen

## 2. Familien-Decision als Pflichtvertrag
P3 erfindet die Strategie nicht selbst.
Die Phase arbeitet gegen eine explizite Decision aus `P2`.

Aktiver Stand heute:
- `group_release` blendet die geschuetzte Aussengruppe auf der aktiven Gleichungsseite aus und legt ihren Inhalt frei
- `negative_sign_release` blendet eine sichtbare `NEGATION` auf der aktiven Gleichungsseite aus, legt ihren Inhaltsausdruck frei und erzeugt auf der Gegenseite eine inverse `NEGATION`
- `addition_release` blendet den passiven Summanden plus `+` aus und erzeugt auf der Gegenseite eine inverse `SUBTRACTION`
- `subtraction_release` blendet den passiven Subtrahenden plus `-` aus und erzeugt auf der Gegenseite eine inverse `ADDITION`
- `subtrahend_release` blendet den linken Minuend plus `-` aus, erzeugt auf derselben Seite eine sichtbare `NEGATION` und auf der Gegenseite eine inverse `SUBTRACTION`
- `fraction_birth` blendet den passiven Ausdruck plus `*` aus und erzeugt auf der Gegenseite eine inverse `DIVISION`
- `fraction_collapse` blendet die sichtbare `DIVISION` auf der aktiven Gleichungsseite aus, legt den Zaehler frei und erzeugt auf der Gegenseite eine inverse `MULTIPLICATION`
- `trig_inverse` blendet die sichtbare trigonometrische `FUNCTION` auf der aktiven Gleichungsseite aus, legt ihr Argument frei und erzeugt auf der Gegenseite die passende inverse `FUNCTION`
- `inverse_trig` blendet die sichtbare inverse trigonometrische `FUNCTION` auf der aktiven Gleichungsseite aus, legt ihr Argument frei und erzeugt auf der Gegenseite die passende direkte `FUNCTION`
- `root_power` blendet die Quellschale aus, legt ihren Inhalt frei und erzeugt auf der Gegenseite die inverse Schale
- `targetId` bestimmt die zu bearbeitende Ursprungsschale oder Ursprungshuelle
- `argumentScope` unterscheidet reine Freilegung (`active_side_only`) von Inversion der gesamten Gegenseite (`whole_opposite_side`)

## 3. Arithmetische Enthaltsamkeit & Schalen-Integritaet (Eiserne Regeln)
- **Berechnungsverbot:** Es findet im Core keine numerische Berechnung oder Auswertung statt.
- **Bruch-Invarianz:** Brueche werden nur strukturell abgebaut, niemals durch Kehrbruch-Multiplikation invertiert.
- **Zulaessige Aesthetik:** Reine visuelle Hygiene ist erlaubt, sofern die interne Struktur identisch bleibt.
- **ID-Transfer:** Unveraenderte Atome behalten beim Seitenwechsel ihre UUID. Reine Freilegung behaelt dieselben IDs; inverse Schalen bekommen eine neue, aber stabile generierte ID mit Herkunftsmetadaten.
- **Keine Direktmutation:** Die Umformung arbeitet auf einer geklonten Struktur, damit spaetere Schritte die Herkunft klar lesen koennen.

## 4. Symmetrie-Protokoll
Normale R2-Umformungen wahren das Gleichgewicht durch die komplementaere inverse Struktur auf der Gegenseite, wobei der gesamte bestehende Ausdruck von Seite B als einheitliches Argument behandelt wird.

Ausnahme im aktiven Kern:
- `group_release` ist kein Gegenseiten-Schritt, sondern ein reiner `R1 Struktur explizieren`-Schritt.
- Die Symmetrie bleibt hier nicht durch eine rechte Inversionsschale erhalten, sondern durch sichtbare Freilegung bei unveraenderter Gegenseite.
