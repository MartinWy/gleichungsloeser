# Schalenstandard POWER

Status: normativ  
Stand: 16. September 2026
Schalenart: `POWER`

## Eine Aufgabe

Die `POWER`-Schale beschreibt genau die gerichtete Beziehung

```text
Basis ^ Exponent
```

zwischen einer vollstaendigen Basisstruktur und einer vollstaendigen Exponentenstruktur.
Sie loest keine Gleichung,
waehlt keine Umformungsstrategie
und erzeugt keine visuelle Ersatzformel.

## Kanonische Kinder

Eine sichtbare `POWER`-Schale besitzt genau zwei Rollen:

1. `power_base`
2. `power_exponent`

Beide Rollen sind obligatorisch.
Ein leerer, fehlender oder nur aus dem Eingabetext rekonstruierbarer Exponent
ist kein gueltiger `POWER`-Zustand.

In der kanonischen Maschinenform stehen sie in:

- `content: [baseRoot]`
- `exponentNodes: [exponentRoot]`

Das zusaetzliche Feld `exponent` ist nur ein kanonischer Kurzwert
und ersetzt niemals `exponentNodes`.

Basis und Exponent duerfen selbst Atome oder bereits vollstaendige innere Schalen sein.
Ihre innere Reihenfolge und Identitaet bleiben erhalten.

Zusaetzlich besitzt jede `POWER`-Schale genau zwei eigene Huellezellen um die
vollstaendige Basis:

1. `power_left_paren`
2. `power_right_paren`

Diese beiden Slots gehoeren zur `POWER`-Schale und nicht zu ihrer Basis.
Sie werden bereits im koordinatenfreien P4-Blueprint verlangt und spaeter als
getrennte funktionale Zellen gesetzt. Der Exponentenblock gehoert nicht in
diese Klammerhuelle. Es gilt deshalb stets:

```text
power_left_paren < vollstaendiger power_base-Block < power_right_paren < power_exponent-Block
```

Die Slots duerfen weder eine Basis- noch eine Exponentenzelle teilen.

Beide Slots tragen ausserdem dieselbe vertikale Basisspanne:

```text
rowSpanStart = minRelativeRow des vollstaendigen power_base-Blocks
rowSpanEnd   = maxRelativeRow des vollstaendigen power_base-Blocks
```

Damit umschliesst `(a^b)^c` auch visuell den inneren Exponenten `b`, waehrend
der aeussere Exponent `c` ausserhalb bleibt. Eine Klammer nur auf der Achsenzeile
ist fuer eine mehrzeilige Basis kein gueltiger POWER-Zustand.

## Strukturelle Sichtbarkeit der Basis-Klammern

Beide Klammer-Slots existieren grundsaetzlich. P4 entscheidet ihre
Sichtbarkeit ausschliesslich aus der bereits kanonischen Basisstruktur.
Die Entscheidung ist fuer beide Slots identisch und wird als `isVisible`
ausgegeben.

Die Klammern sind sichtbar, wenn die Basis ohne sie eine andere oder
mehrdeutige Bindung erhielte. Das gilt mindestens fuer:

- eine `POWER` als Basis einer weiteren `POWER`
- mehrere sichtbare Basiswurzeln
- eine ungehuellte additive, subtraktive, negative oder multiplikative Basis

Die Klammern duerfen unsichtbar sein, wenn die Basis bereits eindeutig ist:

- genau ein atomares Blatt
- genau eine bereits sichtbare `GROUP`-Schale
- genau eine `FUNCTION`-, `ROOT`- oder `DIVISION`-Schale mit eigener Huelle

Unsichtbar bedeutet nicht unbekannt oder vom Renderer weggelassen. Der Slot
bleibt Teil des Core-Vertrags, traegt `isVisible = false` und kann in der
physischen Breitenkarte nur dann auf Breite `0` fallen, wenn dieselbe globale
Spalte in keiner Theoriezeile ein sichtbares Primitiv traegt. Die Entscheidung
ueber Sichtbarkeit trifft nie der Renderer. Ein unsichtbarer Slot erweitert
die sichtbare `containerRange` der POWER-Schale nicht; seine Zelle bleibt
trotzdem im globalen Zellprofil und in der atomaren Ausgabe nachweisbar.

## Aufbau von innen nach aussen

1. Die funktionale Geometrie der Basis ist fertig.
2. Die funktionale Geometrie des Exponenten ist fertig.
3. Erst dann legt die `POWER`-Schale ihre Beziehung darum.
4. P4 legt die beiden Basis-Klammer-Slots mit dessen horizontaler und vertikaler
   Vollspanne um den fertigen Basisblock.
5. `P4` exportiert Basis, Exponent und Klammer-Slots mit derselben `sourceShellId`.

Der Exponent liegt funktional ueber der Achse der Basis.
Seine konkrete Teilzeile, Spalte und Spanne kommen ausschliesslich aus `P4`.

## Sichtbarkeitsvertrag

Ist die `POWER`-Schale in einer Theoriezeile sichtbar,
dann muessen `power_base` und `power_exponent` in dieser Zeile sichtbar exportiert werden.
Die beiden Basis-Klammer-Slots muessen in jedem Fall exportiert werden;
`isVisible` benennt ausdruecklich, ob ihr Glyph gezeichnet wird.

Im atomaren Referenzmodus gilt zwingend:

```text
sichtbare power_base-Zelle     -> genau ein sichtbares Basisprimitiv
sichtbare power_exponent-Zelle -> genau ein sichtbares Exponentenprimitiv
sichtbare Klammerzelle          -> genau ein sichtbares Klammerprimitiv
unsichtbare Klammerzelle        -> kein sichtbares Primitiv, keine Ersatzerzeugung
```

Ein Medienadapter oder Renderer darf den Exponenten nicht:

- unterdruecken
- in die Basiszelle aufnehmen
- aus `sourceShellNode`, Text oder Nachbarschaft neu erzeugen
- durch eine zusammengesetzte Schreibweise `Basis^{Exponent}` ersetzen
- verschieben, um eine fehlende funktionale Lage auszugleichen
- Basis-Klammern aus dem Typ oder Text der Basis selbst ableiten
- unsichtbare Basis-Klammern sichtbar machen oder sichtbare unterdruecken

Der Renderer uebersetzt nur die gelieferte funktionale Lage in visuelle Koordinaten.

## Kontrolliertes Ende der Schale in Bridge B

Beim vertraglich benannten Uebergang `A1 -> B -> A2`
endet die sichtbare `POWER`-Schale in der Boundary-Zeile.
Diese Boundary-Zeile muss Basis und Exponent weiterhin vollstaendig zeigen.

`B` darf danach genau einmal die funktionale Lage des Exponenteninhalts aendern:

- aus `power_exponent` ueber der Basis
- in geordnete normale `term_slots` auf der Achse der Landing-Zeile

Dabei gilt atomar eins zu eins:

- der gesamte Exponent ist an der Boundary genau eine aeussere funktionale Termspur
- seine inneren P4-Zellen bleiben innerhalb dieser Spur vollstaendig erhalten
- beim Oeffnen bekommt jede diskret spaltentragende Inhalts-, Operator- oder
  Schalenzelle des Exponenten genau einen normalen Landing-Slot
- `2*x-1` landet daher als fuenf geordnete Zellen: `2`, `*`, `x`, `-`, `1`
- eine innere Schale wie `x^2` bleibt durch ihre gelieferten P4-Zellen eindeutig;
  weder B noch der Renderer duerfen sie aus einem Text neu aufbauen
- keine gelieferte Zelle darf gebuendelt, weggelassen oder aus Nachbarschaft rekonstruiert werden

Die alten Basis- und Exponentenslots enden an der Boundary.
Sie duerfen die Landing-Zeile und die anschliessenden A2-Zeilen nicht blockieren.
A2 uebernimmt die von `B` gelieferten Landing-Slots ohne weiteren Startsprung.
Weitere A2-Operationen laufen danach ausschliesslich in A2;
sie reaktivieren die bereits abgeschlossene Bridge nicht.

Das ist keine Renderer-Reparatur,
sondern die ausdrueckliche funktionale Ausgabe des einen B-Prozessschritts.

## Situationen

Der Standard gilt unveraendert fuer:

- atomare Basis und atomaren Exponenten
- zusammengesetzte Basis oder zusammengesetzten Exponenten
- gruppierte Inhalte
- Wurzeln und Brueche in Basis oder Exponent
- verschachtelte Potenzen
- durch `P3` erzeugte inverse `POWER`-Schalen
- Transport derselben sichtbaren Potenz in spaetere Theoriezeilen
- kontrolliertes Oeffnen der Schale an der dokumentierten Bridge-B-Grenze

Spezielle Fallregeln duerfen die beiden kanonischen Rollen genauer behandeln,
aber weder eine dritte Rollenwahrheit einfuehren
noch eine der beiden Rollen entfernen.

## Fehlerbedingungen

Die Uebergabe ist explizit fehlerhaft, wenn:

- eine sichtbare `POWER`-Schale keine Basis oder keinen Exponenten besitzt
- Basis und Exponent nicht eindeutig derselben Schale zugeordnet sind
- ein sichtbares Kind keine vollstaendige funktionale Position besitzt
- ein nachgelagertes Modul eine der beiden sichtbaren Zellen verliert
- ein Renderer die fehlende Rolle erraten oder aus einer Gesamtformel gewinnen muesste
- einer `POWER` einer der beiden Basis-Klammer-Slots fehlt
- die beiden Basis-Klammern unterschiedliche Sichtbarkeit tragen
- eine sichtbare Klammerzelle den Basis- oder Exponentenblock ueberdeckt
- eine sichtbare Basis-Klammer nicht ueber alle funktionalen Teilzeilen der
  vollstaendigen Basis spannt

## Zugeordnete Beweise

- `tests/active/genesis_runtime_p4_projection.test.js` beweist die funktionale Exponentenrolle in `P4`.
- `tests/active/genesis_runtime_view_model_columns.test.js` beweist die Uebergabe in die Worksheet-Zelle.
- `tests/active/latex_export_display_slot_fidelity.test.js` beweist die atomare Eins-zu-eins-Ausgabe im isolierten PDF-Renderer.
- `tests/active/power_base_parenthesis_slots.test.js` beweist Pflichtslots,
  strukturelle Sichtbarkeit und die disjunkte Ordnung bei verschachtelten Potenzen.
