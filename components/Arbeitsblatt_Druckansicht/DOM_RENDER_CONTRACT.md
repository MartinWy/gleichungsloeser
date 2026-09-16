# Atomarer DOM-Rendervertrag

Status: normativ; produktiver Pfad noch nicht atomar freigegeben
Stand: 8. September 2026

## Einzige Aufgabe

Der DOM-Renderer zeichnet jedes gelieferte Display-Item
als genau ein sichtbares Primitiv an dessen gelieferter Stelle.

Im atomaren Referenzmodus gilt:

```text
1 Display-Item -> 1 sichtbares DOM-Primitiv
```

Ein flaechenhaftes Element wie ein Bruchstrich oder Wurzeloberstrich
bleibt ein einzelnes Primitiv auf seiner gelieferten Spanne.

## Eingabe

- Display-Items mit ID, Rolle, Zeile und Spaltenlage
- rein visuelle Parameter wie Rastermass, Font, Farbe und Strichstaerke

## Ausgabe

- genau ein sichtbares DOM-Primitiv je Display-Item
- Diagnoseattribute fuer Quell-ID, Rolle und Lage

## Erlaubt

- Text oder die explizit benannte Huelleprimitive zeichnen
- funktionale Grid-Linien in CSS-Grid-Linien uebersetzen
- Font, Farbe, Strichstaerke und einheitliche Rastermasse anwenden

## Verboten

- ein geliefertes `*` oder anderes sichtbares Atom typografisch unterdruecken
- mehrere Items zu einer Formel oder Shell zusammenziehen
- Items aufgrund einer aeusseren Schale konsumieren
- fehlende Items aus Renderknoten, Text oder Nachbarschaft erzeugen
- Positionen verschieben, nachzentrieren oder uebermalen

## Verantwortlicher Code

- DOM-Erzeugung in `components/Arbeitsblatt_Druckansicht/logic.js`

## Zugeordnete Tests

- `tests/active/arbeitsblatt_druckansicht.test.js`
- ein fokussierter atomarer DOM-Test ist als naechster Vertragsbeweis anzulegen

Die bisherige Erwartung,
ein vom Core sichtbar geliefertes gewoehnliches Multiplikationszeichen zu verstecken,
widerspricht dem atomaren Referenzvertrag.
Eine spaetere typografische Unterdrueckung gehoert in einen getrennten Schoensatzmodus
mit eigenem Aequivalenzbeweis.
