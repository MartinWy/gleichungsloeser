# Worksheet-ViewModel-Vertrag

Status: normativ; nativer Genesis-Pfad freigegeben
Stand: 16. September 2026

## Einzige Aufgabe

`viewModel.js` uebersetzt den P4-Output schemafest in Worksheet-Zellen.
Es ist kein Renderer und kein zweiter Schalenbauer.

Im atomaren Referenzmodus gilt:

```text
1 projectionRow -> 1 Worksheet-Schritt
1 sichtbares projectionAtom -> 1 Worksheet-Zelle
```

Das ViewModel darf damit weder eine fachliche Zwischenzeile erfinden noch eine
vom P4-Output gelieferte Zeile auslassen. Die Anzahl der Rechenschritte ist eine
Core-Entscheidung und keine Darstellungsentscheidung.

## Eingabe

- `projectionRows`
- die darin bereits festgelegten IDs, Rollen, Zeilen, Spalten und Spannen
- die ausdrueckliche `processSpaceId` jeder Zeile, falls ein dokumentierter
  Systemwechsel mehrere horizontale Raumprofile erzeugt
- explizite Schalenmetadaten und Darstellungsformen

## Ausgabe

Jede Zelle bewahrt mindestens:

- Quell- und Projektions-ID
- Projektionsrolle
- `rowId` und `localRow`
- die von P4 gelieferte Gleichungsseite `side`
- `col` oder `colStart + colEnd`
- Sichtbarkeit und explizite Darstellungsform
- die stabile semantische `sourceAtomId` eines bereits atomaren Projektionsatoms
- `processSpaceId` unveraendert auf Schritt und Zelle

## Erlaubt

- Feldnamen schemafest uebersetzen
- vorhandene Werte kopieren
- rein diagnostische Verweise anhaengen
- fuer Text oder Tinte einen visuellen Knotentyp waehlen,
  wenn die funktionale Rolle bereits explizit geliefert wurde
- ein bereits als `VARIABLE`, `NUMBER`, `OPERATOR` oder `ANCHOR`
  geliefertes Projektionsatom unmittelbar als seine eigene atomare Repraesentation lesen
- `isImplicit` als unveraendertes Metadatum mitfuehren; liefert P4 das zugehoerige
  Operatoratom sichtbar aus, bleibt auch diese Zelle sichtbar
- die von P4 gelieferten Schalenprimitive wie `root_hook`, `root_overbar`,
  `fraction_line` und Klammern als getrennte Worksheet-Zellen bewahren
- `power_left_paren` und `power_right_paren` ausschliesslich nach dem von P4
  gelieferten `isVisible` ein- oder ausblenden; niemals den Klammerbedarf aus
  dem Potenz-Unterbaum oder dem sichtbaren Text neu bestimmen
- fuer sichtbare POWER-Klammern `rowSpanStart` und `rowSpanEnd` des nativen
  P4-Atoms unveraendert uebernehmen; die Basis- oder Exponenthoehe darf hier
  nicht erneut analysiert werden
- den vom nativen P4-Atom gelieferten `sourceNodeType` auch im Exponentenraum
  unveraendert uebernehmen; `power_exponent` ist eine Rolle und kein Zahlentyp
- im nativen Genesis-Pfad `isTarget` unveraendert vom P4-Projektionsatom
  uebernehmen; ein Ziel darf weder durch Textvergleich noch ueber einen
  Shell-Proxy neu bestimmt werden
- den Zeilenmodus `native_atomic` am zugehoerigen Worksheet-Schritt erhalten,
  damit nachfolgende rein visuelle Module keine Legacy-Huellenslots ergaenzen
- die vom Handoff gelieferte `processSpaceId` ohne Ableitung oder Umbenennung
  an alle Zellen der Zeile weiterreichen

## Verboten

- projizierte Atome wegen einer aeusseren Schale entfernen
- einen von P4 gelieferten Multiplikationsoperator durch Rueckblick in den
  Theoriebaum ausblenden
- mehrere Projektionsatome zu einer Ersatz-Zelle buendeln
- synthetische Root-, Division-, Group- oder Function-Zellen erzeugen
- `root_hook` und `root_overbar` entfernen und daraus im ViewModel eine neue
  komplette Wurzelschale samt eigener Hoehenberechnung bauen
- Position, Spanne oder Sichtbarkeit korrigieren
- Prozessraeume aus Zeilenindex, Text, Familie oder Spaltenlage erraten
- die Gleichungsseite aus Spaltenlage, Ankerabstand oder Text neu erraten
- Schachtelung aus Theoriebaum, Text oder Nachbarschaft rekonstruieren
- eine Variable nur deshalb in `NUMBER` umdeuten, weil sie in einer Exponentenrolle steht

## Verantwortlicher Code

- `components/Arbeitsblatt_Druckansicht/viewModel.js`

## Zugeordnete Tests

- `tests/active/genesis_runtime_view_model_columns.test.js`
- `tests/active/worksheet_atomic_target_identity.test.js`
- `tests/active/worksheet_process_space_width_isolation.test.js`

Der native Genesis-Pfad ist durch Zeilen-, ID-, Spalten-, Operator- und
Wurzelprimitiv-Beweise als atomare Eins-zu-eins-Abbildung freigegeben.

Ein davon getrennter Kompatibilitaetspfad fuer vorkanonische Projektionsdaten
darf weiterhin alte Darstellungsformen lesen. Er ist kein Vertrag fuer neue
Module und darf nicht in den nativen Genesis-Pfad zurueckwirken.
