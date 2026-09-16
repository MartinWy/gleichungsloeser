# groups

Status: visuelle Group-Stufe vorhanden; funktionaler Eingabevertrag noch verletzt  
Stand: 7. September 2026

Hier liegt die getrennte Klammerstufe des neuen Renderkerns.

Sie arbeitet in zwei Schritten:

- `index.js`
  baut aus dem generischen Szenenplan eine reine Klammer-Geometrie
- `projection.js`
  macht daraus die erste sichtbare Klammerprojektion

Die Regeln sind dieselben wie bei der Root-Stufe:

- keine Solverlogik
- keine zweite mathematische Wahrheit
- nur lesender Zugriff auf den bestehenden Szenenraum
- linke Klammer, rechte Klammer und Inhalt bleiben getrennt

Der Core liefert dafuer bereits:

- explizite linke und rechte Huelleprimitive
- funktionales Inhalts- und Huelleband
- funktionale obere, Achsen- und untere Reihe
- explizite Kindschalen

Die Group-Stufe darf daraus nur die visuelle Klammerform bauen.

## Verboten

- Klammerhoehe aus gescannten Inhaltsknoten ableiten
- die Mittelachse aus optischen Inhaltsbounds neu bestimmen
- verschachtelte Shells durch geometrischen Einschluss als Kinder entdecken
- fehlende Klammerbaender aus linker und rechter Tinte rekonstruieren
- Inhalte fuer eine optisch passendere Klammer neu zentrieren

## Bekannte Umsetzungsschuld

Der aktuelle Code bildet Kind- und Inhaltsbounds teilweise noch
ueber Einschlusspruefungen des Szenenplans.
Das ist eine dokumentierte Abweichung vom Genesis-Vertrag.

## Zugeordnete Tests

- `tests/active/renderer_kernel_group_geometry_plan.test.js`
- `tests/active/renderer_kernel_group_projection.test.js`

Der Geometrieplan ist derzeit rot.
Ein zusaetzlicher Blindheitstest muss fehlende funktionale Pflichtfelder ablehnen.
