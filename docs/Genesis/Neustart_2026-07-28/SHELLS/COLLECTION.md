# Schalenstandard COLLECTION

Status: normativ
Stand: 10. September 2026
Schalenart: `COLLECTION`

## Fachliche Entscheidung

`COLLECTION` ist keine Rechenoperation und keine Eingabeschale.
Sie ist eine kanonische, ausschliesslich von P3 erzeugte Transportschale.

Ihre eine Aufgabe lautet:
Mehrere bereits vollstaendige und semantisch unveraenderte Kinder
unter einer stabilen Transportidentitaet zusammenhalten,
wenn eine aeussere Quellschale geoeffnet wird
und genau dieser Kindverband als Ganzes weiterleben muss.

## Kanonische Kinder und Herkunft

- `transport_content`: mindestens zwei geordnete vollstaendige Kinder oder genau eine bereits zusammengesetzte Ausdruckswurzel
- `transport_source_shell_id`: ID der geoeffneten Quellschale
- `transport_leaf_ids`: unveraenderte IDs aller transportierten Blaetter
- `generated_by_decision`: eindeutige P2-/P3-Herkunft

Die aktuelle Maschinenform verwendet dafuer `content`,
`transportSourceShellId`, `transportLeafIds`
und die vorhandenen `generatedBy...`-Herkunftsfelder.

## Invarianten

- P1 erzeugt niemals `COLLECTION`.
- P2 erzeugt niemals `COLLECTION`.
- Nur P3 darf sie als Teil genau einer ausgefuehrten Decision erzeugen.
- Sie fuegt keine mathematische Operation und keine neue Kindreihenfolge hinzu.
- Sie ersetzt keine `GROUP`, `MULTIPLICATION`, `ADDITION` oder andere fehlende Operationsschale.
- Sie darf nicht erzeugt werden, nur um Ziel- und Passivteile fuer P2 bequemer zu machen.
- Ein einzelnes atomisches Blatt ist kein Kindverband und darf deshalb nicht allein
  fuer den Erhalt seiner funktionalen Spalte in eine `COLLECTION` gehuellt werden.
- Bei einem einzelnen bereits zusammengesetzten Ausdrucksknoten ist eine `COLLECTION`
  nur zulaessig, wenn gerade dessen vollstaendige zusammengesetzte Wurzel als Verband
  die explizite Transportidentitaet der geoeffneten Quellschale benoetigt.
- P4 liest ihre Transportidentitaet, erzeugt aber keine neue Sammlung.
- Der Renderer darf sie weder erfinden noch in eine Rechenoperation umdeuten.

## Zulaessige Situation

Zulaessig ist insbesondere die P3-Freilegung eines Zaehler- oder Nennerverbands,
wenn die aeussere `DIVISION` geoeffnet wird,
die unveraenderten Kinder aber als bereits geborener Verband weitertransportiert werden.

## Fehlerbedingungen

Ungueltig sind:

- eine `COLLECTION` aus P1 oder der Runtime-Orchestrierung
- fehlende Herkunft zur ausgefuehrten P3-Decision
- neue, entfernte oder umgeordnete Kinder
- Verwendung als zielabhaengiger Faktorblock
- Verwendung als unspezifischer Auffangcontainer
- Ableitung aus Layout- oder Rendererbedarf
- eine `COLLECTION` um genau ein atomisches Blatt allein aus Geometriebedarf
