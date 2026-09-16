# Step Semantics

Status: normativ  
Stand: 12. Juli 2026  
Bindung: Genesis Gleichungsloeser Maschine + operative Architektur

## Zweck
Dieses Dokument definiert,
wie ein einzelner Umformungsschritt im Gleichungsloeser zu lesen ist.

Es legt fest:
- was ein Schritt ist
- was ein Schritt nicht ist
- welche Invarianten dabei gelten
- wie Struktur, Sichtbarkeit und Projektion zusammenhaengen

Es ist nicht dasselbe wie Genesis.

Genesis beschreibt das Wesen des Gesamtsystems.
`Step_Semantics.md` beschreibt den engeren Vertrag eines einzelnen Uebergangs von Zeile zu Zeile.

## 1. Zeile und Schritt
### Zeile
Eine Zeile ist ein vollstaendiger Gleichungszustand innerhalb der Theorie-Folge.

### Schritt
Ein Schritt ist der explizite Uebergang von einer Theorie-Zeile zur naechsten.

Normen:
- genau eine neue Zeile pro Schritt
- genau eine strukturelle Hauptveraenderung pro Schritt
- keine implizite Nebenoperation
- keine verdeckte Vereinfachung

## 2. Sichtbare Wirkung
Ein Schritt wird nicht durch sein mathematisches Fernziel definiert,
sondern durch seine sichtbare strukturelle Wirkung.

Folgesatz:
Was nicht sichtbar oder explizit markiert ist,
gilt nicht als geschehen.

## 3. Schritttypen
### R1 Struktur explizieren
- macht benoetigte Struktur sichtbar
- schafft die Lesbarkeit fuer einen spaeteren Transformationsschritt

### R2 Transformieren
- fuehrt den eigentlichen strukturellen Abbau oder Seitenuebertrag aus
- ist der Kern des Umformungsschritts

### R3 Darstellungsnormalisierung
- betrifft nur zulaessige Hygiene
- veraendert nicht die strukturelle Wahrheit

## 4. Zulassungsregeln
Zulaessig ist ein Schritt nur, wenn:
- die aeusserste wirksame Schale betroffen ist
- die Zielvariable und ihre Schalenlogik respektiert werden
- keine zweite strukturelle Veraenderung impliziert wird
- unbeteiligte Atome ihre Identitaet behalten

Unzulaessig ist insbesondere:
- mehrere strukturelle Umbauten in einem einzigen Schritt
- implizites Zusammenfassen innerhalb geschuetzter Schalen
- R3 als Ersatz fuer echte Transformation
- Projektion als Tarnung fuer fehlende Strukturarbeit

## 5. Invarianten eines Schritts
- Struktur und Sichtbarkeit muessen auseinanderlesbar bleiben.
- Was sich algebraisch nicht aendert, behaelt seine Atomidentitaet.
- Was sich algebraisch nicht aendert, darf sich spaeter horizontal nicht bewegen.
- Entfernte Struktur hinterlaesst in der Projektion eine nachvollziehbare Spur.

## 6. Umkehrschalen
Umkehrschalen sind bekannte semantische Paare,
aber ihre Anwendung ist niemals implizit.

Beispiele:
- Addition <-> Subtraktion
- Subtraktion mit aktivem linken Ausdruck (`x-a`) <-> `subtraction_release`
- Subtraktion mit aktivem rechten Ausdruck (`a-x`) <-> `subtrahend_release` plus anschliessendes `negative_sign_release`
- Multiplikation <-> Division
- negatives Vorzeichen direkt vor einem aktiven Ausdruck <-> negatives Vorzeichen auf der Gegenseite, im aktiven Kern explizit als `negative_sign_release`
- Potenz <-> Wurzel oder Logarithmus je nach expliziter Struktur
- trigonometrische Funktion <-> inverse Funktion, im aktiven Kern derzeit explizit getrennt als `trig_inverse` (`sin/cos/tan -> asin/acos/atan`) und `inverse_trig` (`asin/acos/atan -> sin/cos/tan`)

Norm:
Die Existenz eines Umkehrpaars ersetzt nie den expliziten Schritt.

## 7. Projektion und Schrittsemantik
Die Projektion gehoert nicht zur Regelentscheidung,
aber sie gehoert zur Lesbarkeit des Schritts.

Daher gilt:
- Theorie definiert, was passiert ist
- Projektion definiert, wie dieselbe Veraenderung positionstreu sichtbar bleibt
- `GHOST_HOLE` und `EMERGED` sind keine neue Mathematik, sondern sichtbare Schrittmarker

Wichtig fuer den heutigen Stand:
- semantische P4-Spalten gehoeren zur Schrittlesbarkeit
- physische Display-Slots gehoeren noch nicht zur Schrittwahrheit
- sichtbare Shell-Slots der Druckausgabe duplizieren keinen Schritt, sondern setzen ihn nur sichtbar um

## 8. Exportbezug
Ein Schritt muss spaeter von externen Verbrauchern gelesen werden koennen.
Deshalb gehoeren zur Schrittsemantik auch:
- stabile betroffene IDs
- explizite Umbauursache
- lesbare Zeilenfolge
- projektionsfaehige Sichtbarkeitsmarker

Nicht zur Schrittsemantik gehoeren dagegen:
- konkrete Profilwerte fuer Spaltenbreiten
- Papierabstaende zwischen Display-Slots
- mediumsspezifische LaTeX- oder UI-Details

## 9. Harte Verbote
- kein magisches Verschwinden
- keine impliziten Nebenrechnungen
- keine stillen Zieloptimierungen
- keine ID-Neuerzeugung im Verlauf spaeterer Phasen
- keine Verlagerung der Schrittwahrheit in UI oder Exportadapter

## 10. Bindung
Dieses Dokument wird gelesen zusammen mit:
- `docs/Genesis/Genesis-Gleichungsloeser-Maschine (v1.md`
- `docs/Genesis/Regelwerk_Extrakt/Atome_und_Schalen.md`
- `docs/Genesis/Regelwerk_Extrakt/Positionstreue.md`
- `docs/Architecture/GESAMTPROZESS.md`
- `docs/Architecture/ARCHITEKTUR_KURZ.md`
- `docs/Architecture/COLUMN_LAYOUT_PIPELINE.md`
- `docs/Architecture/STATE_MODEL.md`

## 11. Warum dieses Dokument bleibt
Dieses Dokument bleibt als eigene normative Schicht sinnvoll,
weil es eine Frage beantwortet, die Genesis und Modularchitektur nicht allein beantworten:

```text
Wann ist genau ein algebraischer Schritt als ein einziger,
zulaessiger und sichtbar lesbarer Schritt anerkannt?
```

Darum ist `Step_Semantics.md` keine blosse Dublette,
sondern das Schrittgesetz zwischen Genesis und den Familienregeln.
