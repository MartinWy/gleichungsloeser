# GenesisRuntime P3 Transformation Contract

Status: normativer V2-Vertrag
Stand: 17. September 2026
Vertragsversion: `p3_transformation_v2`

## Aufgabe
`P3_Transformation` setzt die von `P2_Strategy` gelieferte Familien-Decision strukturell um
und baut die naechste Theoriezeile des neuen Kerns.

Das ist seine einzige Prozessaufgabe:

```text
eine gueltige Decision genau einmal semantisch ausfuehren
```

## Uebergabe

- Vorgaenger: `P2_Strategy`
- Eingabe: unveraenderte kanonische Struktur plus genau eine vollstaendige `STRATEGY_DECISION`
- Ausgabe: genau eine naechste kanonische Struktur plus zugehoeriger History-Eintrag
- Nachfolger: Runtime-Schleife und danach erneut `P2_Strategy`; am Ende `buildTheoryRows`

P3 uebergibt entweder eine vollstaendig gueltige neue Theoriezeilenstruktur
oder einen expliziten Transformationsfehler.
Es darf keine teilweise umgeformte Erfolgsstruktur ausgeben.

## Verantwortet aktuell
- `group_release`
- `negative_sign_release`
- `addition_release`
- `subtraction_release`
- `subtrahend_release`
- `subtracted_sum_release`
- `trig_inverse`
- `inverse_trig`
- `root_power`
- `fraction_birth`
- `fraction_denominator_release`
- `fraction_collapse`
- `log_inverse`
- `power_exponent_release`
- `power_base_release`

## Liefert aktuell
- `contractVersion = "p3_transformation_v2"`
- `appliedDecision`
- `initialStructure`
- `nextStructure`
- `history`

## Situationsmatrix

Die Situations-ID von P3 ist die bereits von P2 festgelegte `family`.
P3 waehlt nicht zwischen Familien.

| Decision-Familie | P3-Status | Eine eigene Aenderung |
| :--- | :---: | :--- |
| `group_release` | unterstuetzt | genau die bezeichnete Gruppe freilegen |
| `negative_sign_release` | unterstuetzt | genau die bezeichnete Negation freilegen und die inverse Gegenschale bauen |
| `addition_release` | unterstuetzt | bezeichneten passiven Summanden als inverse Subtraktion uebertragen |
| `subtraction_release` | unterstuetzt | bezeichneten passiven Subtraktionsteil als inverse Addition uebertragen |
| `subtrahend_release` | unterstuetzt | bezeichneten Minuend uebertragen und die explizite Negationszwischenstruktur bilden |
| `subtracted_sum_release` | unterstuetzt | genau die bezeichnete Gruppe entfernen und ihr aeusseres Minus ueber die geordneten Summanden verteilen |
| `fraction_birth` | unterstuetzt | bezeichneten passiven Faktor als inverse `DIVISION` oder einen passiven Bruchfaktor als `MULTIPLICATION` mit Kehrbruch uebertragen |
| `fraction_denominator_release` | unterstuetzt | bezeichnete Nenner-Zielstruktur freilegen |
| `fraction_collapse` | unterstuetzt | genau die bezeichnete `DIVISION` oeffnen und die inverse `MULTIPLICATION` bilden |
| `trig_inverse` | unterstuetzt | bezeichnete direkte Funktion oeffnen und inverse Funktion bilden |
| `inverse_trig` | unterstuetzt | bezeichnete inverse Funktion oeffnen und direkte Funktion bilden |
| `log_inverse` | unterstuetzt | bezeichneten Logarithmus oeffnen und inverse Potenzstruktur bilden |
| `power_exponent_release` | unterstuetzt | bezeichnete Exponentenrolle freilegen und inverse Struktur bilden |
| `power_base_release` | unterstuetzt | bezeichnete Basisrolle freilegen und inverse Struktur bilden |
| `root_power` | unterstuetzt | bezeichnete `ROOT`- oder `POWER`-Schale oeffnen und Gegenschale bilden |
| unbekannte oder unvollstaendige Decision | zurueckweisen | keine Struktur veraendern |

Alle nicht von der Decision adressierten IDs,
Kindrollen,
Schalen
und Gleichungsseiten bleiben invariant,
soweit die jeweilige Fallregel nicht eine explizite Gegenschale verlangt.

Nach genau einer Ausfuehrung besitzt jede Gleichungsseite wieder genau eine sichtbare
Ausdruckswurzel. Die geoeffnete Quellschale darf fuer die Historie unsichtbar erhalten bleiben;
ihre sichtbare Nachfolgerwurzel muss jedoch vollstaendig kanonisch sein.

## Kanonische Ausgabeform

P3 erzeugt Rechenoperationen ausschliesslich in den Genesis-Rollen:

| erzeugte Schale | obligatorische Rollen |
| :--- | :--- |
| `NEGATION` | `operator`, `content: [root]` |
| `DIVISION` | `numerator: [root]`, `operator`, `denominator: [root]` |
| `MULTIPLICATION` | `factors: [root, ...]`, `operators: [OPERATOR, ...]` |
| `ADDITION` | `terms: [root, ...]`, `operators: [OPERATOR, ...]` |
| `SUBTRACTION` | `minuend: [root]`, `operator`, `subtrahend: [root]` |
| `POWER` | `content: [root]`, `exponentNodes: [root]`, `exponent` als Kurzwert |

Jedes durch P3 neu eingefuehrte Operationszeichen ist ein sichtbares,
deterministisch aus Decision und Quellschale abgeleitetes `OPERATOR`-Atom.

Die frueheren Rollen `content/factor`, `content/passive` und `flowDirection`
sind keine kanonische P3-Ausgabe. Eine visuelle Flussrichtung ist P4-Sache.
Zwischen P3 und dem naechsten P2-Lauf darf kein Normalisierer stehen.

Die geordnete Rolle `factors` traegt dagegen die semantische Schreivreihenfolge.
Erweitert eine inverse P3-Operation die bereits vorhandene Gegenseite um einen
neuen Faktor, gilt fuer alle betroffenen Familien dieselbe zentrale Regel:

| Seite der erzeugten `MULTIPLICATION` | kanonische Faktorenfolge |
| :--- | :--- |
| `left` | `[neuer Faktor, vorhandener Gegenausdruck]` |
| `right` | `[vorhandener Gegenausdruck, neuer Faktor]` |

Der vorhandene Ausdruck bleibt damit gleichheitsnah, der neue Faktor waechst
am aeusseren Seitenrand an. Jede Gleichungsseiten-Erzeugung muss die erzeugte
Seite explizit an den zentralen Multiplikationsschalen-Erzeuger uebergeben.
Ohne diese Information muss P3 abbrechen; eine Default-Reihenfolge ist verboten.
Interne Produkte, die lediglich eine schon vorhandene Faktorfolge geschlossen
transportieren, bewahren stattdessen genau deren vorhandene Reihenfolge.

`COLLECTION` ist gemaess `SHELLS/COLLECTION.md`
eine ausschliesslich von P3 erzeugte Transportschale ohne eigene Rechenoperation.
P3 darf sie nur innerhalb einer ausgefuehrten Decision erzeugen,
wenn ein bereits vorhandener Kindverband semantisch unveraendert weiterleben muss.
Sie darf keine fehlende Operationsschale ersetzen
und keinen zielabhaengigen Faktorblock fuer P2 vorbereiten.

Besteht der freigelegte unveraenderte Inhalt aus genau einem atomischen Blatt,
bleibt dieses Blatt mit unveraenderter ID die sichtbare Ausdruckswurzel.
P3 erzeugt dafuer keine singleton-`COLLECTION` und keine Geometrie-Metadaten.
Der Erhalt der bereits geborenen funktionalen Blattspur ist allein Aufgabe von P4.

## Regelt jetzt ebenfalls
- erzeugte Gegenschalen fuer `ADDITION`, `SUBTRACTION`, `MULTIPLICATION` und `DIVISION`
- Freilegung sichtbarer Zielsegmente aus Gruppen oder Zaehlern
- Folgezeilen, die von `P2` direkt wieder lesbar bleiben muessen
- unberuehrte Restterme bleiben als vollstaendige Ausdruckswurzeln erhalten
  - beim `fraction_denominator_release` wird der unberuehrte Zaehler weder zerlegt noch neu gruppiert
- beim `fraction_collapse` wird nur die aktive `DIVISION` geoeffnet
  - die bereits vollstaendige Zaehlerwurzel wird unveraendert freigegeben
  - die passive Gegenseite wird nicht neu aufgebaut, sondern nur von aussen durch eine neue `MULTIPLICATION` erweitert
  - bereits vorhandene passive Schalen behalten dabei ihre Shell-ID und semantische Innenstruktur
  - P4 ist danach allein dafuer verantwortlich, die bereits geborene funktionale Bandgeometrie geschlossen zu transportieren
- erzeugte Negation ueber zusammengesetztem Inhalt bindet diesen Inhalt sofort
  - wenn eine generierte `NEGATION` ueber einen additiven Ausdruck gelegt wird, bekommt sie im Kern eine sichtbare `GROUP`
  - dadurch bleibt aus `-(c-b)` eine gebundene Schale und nicht nur ein loses Minus vor Einzelatomen
- erzeugte Subtraktion bindet einen zusammengesetzten additiven Subtrahenden sofort
  - wird eine vollstaendige `ADDITION` oder `SUBTRACTION` als Subtrahend transportiert, bekommt sie im Kern eine sichtbare `GROUP`
  - dadurch bleibt beispielsweise `c^2-(a^2+b^2)` mathematisch erhalten und tritt nicht als `c^2-a^2+b^2` aus
  - P4 und Renderer duerfen diese fehlende Bindung nicht nachtraeglich erraten
- eine nachfolgende `subtracted_sum_release`-Decision ist ein eigener sichtbarer
  Schritt und hebt diese Bindung kontrolliert wieder auf
  - aus `U-(V+W+...)` entsteht linksassoziativ `U-V-W-...`
  - die Summanden behalten ihre IDs und Reihenfolge
  - fuer jeden nach dem ersten abgezogenen Summanden entsteht genau ein neuer,
    deterministisch aus der Decision abgeleiteter Subtraktionsoperator
  - die Familie arbeitet nur auf der von P2 explizit bezeichneten Gleichungsseite
- ein passiver Bruchfaktor wird durch `fraction_birth` als Kehrbruchfaktor ausgefuehrt
  - das gilt auch fuer eine einzelne `GROUP`, deren einziges sichtbares Kind die bezeichnete `DIVISION` ist
  - P3 vertauscht nur deren vollstaendige Zaehler- und Nennerwurzeln und baut darum eine neue `MULTIPLICATION`
  - P3 erkennt dabei keine neue Familie; es folgt ausschliesslich dem expliziten `inverseMode` und der von P2 benannten Divisions-ID
  - auch diese neue Multiplikationsschale folgt der zentralen Aussenanlagerung
    der Seite, auf der sie erzeugt wird
- trifft `fraction_birth` mit `inverseMode = extend_existing_denominator` auf die
  von P2 durch `oppositeDivisionId` bezeichnete sichtbare Gegenseiten-`DIVISION`,
  erweitert P3 deren Nenner ohne Doppelbruch
  - die alte Divisionsschale wird als historische Quellschale verborgen und
    genau eine neue sichtbare `DIVISION` mit explizitem `extendedFromDivisionId`
    erzeugt
  - ihre Zaehlerrolle ist die unveraenderte sichtbare Zaehlerwurzel der Quelle
  - ihre Nennerrolle ist genau eine `MULTIPLICATION` aus altem Nenner und neuem
    Faktor; links lautet die Faktorenfolge `[neuer Faktor, alter Nenner]`,
    rechts `[alter Nenner, neuer Faktor]`
  - ist der alte Nenner bereits eine ungruppierte `MULTIPLICATION`, wird deren
    geordnete Faktorenfolge um genau einen aeusseren Faktor erweitert, nicht in
    eine zweite Multiplikation verschachtelt
  - die vorhandene Divisionsoperator-ID sowie alle vorhandenen Kind-IDs bleiben
    erhalten; nur die neue Nenner-`MULTIPLICATION` und ihr neuer
    Verknuepfungsoperator erhalten deterministische IDs
  - fehlt die bezeichnete direkte Gegenseiten-`DIVISION`, muss P3 abbrechen und
    darf weder eine andere Bruchschale suchen noch auf normalen Doppelbruch
    zurueckfallen

## Darf nicht
- Strategie neu waehlen
- eine Decision durch eine passendere Familie ersetzen
- eine unvollstaendige Decision aus der Struktur ergaenzen
- Projektion vorbereiten
- Spalten, Reihen, Baender, Achsen oder visuelle Darstellungsformen festlegen
- die Faktorenfolge nach Renderbedarf oder aus einer impliziten Default-Seite bestimmen
- Altlogik importieren

## Zugeordnete Tests

- `tests/active/genesis_runtime_p3_shells.test.js`
- `tests/active/addition_release_left_prefix_flow.test.js`
- `tests/active/law_of_sines_numerator_shell_transport.test.js`
- `tests/active/law_of_sines_right_numerator_shell_transport.test.js`
- `tests/active/multiplication_side_outward_flow.test.js`
- `tests/active/fraction_denominator_extension.test.js`

Die beiden Sinussatz-Tests muessen den Einzelblattfall gemaess diesem Vertrag pruefen:
stabile Atom-ID und stabile P4-Geburtsspur, aber keine erfundene `COLLECTION`.
