# renderer_kernel

Status: atomare Ziel-Fassade und Render-Scene-Ingest aktiv
Stand: 10. September 2026

## Zweck

`renderer_kernel` ist die Ordnerwurzel
fuer die allgemeine visuelle Geometrie.

Seine Eingabe ist eine vollstaendige funktionale Geometrie aus dem Core.
Der Renderer bildet diese auf Pixel, `em`, SVG- oder Papierkoordinaten ab.
Er erzeugt keine zweite funktionale Geometrie.

Hierhin sollen spaeter die reinen Renderregeln:

- Wurzeln
- Klammern
- Exponenten
- Brueche
- Bounds-Kaskaden
- Zeilenhoehen
- Shell-Projektion

## Heute

Die heutige Renderlogik ist noch verteilt,
vor allem unter:

```text
presentation/render_kernel/
projects/complex_expression_rendering/
components/Arbeitsblatt_Druckansicht/
```

Der Altpfad bleibt unberuehrt.

Hier existieren jetzt bereits:

- `index.js` als lesende Ziel-Fassade
- `atoms/`, `rows/`, `shells/`, `metrics/` als erste lesende Gruppen
- `export/` als neutraler Aussenrand mit `render_scene`-Anschluss
- `export/render_scene/` als erster echter Szenen-Ingest

Noch nicht passiert:

- kein Verschieben der Altdateien
- kein Umbau der produktiven Renderlogik

## Verbindliche Grenze

Der Core liefert mindestens:

- stabile Atom- und Schalenidentitaeten
- explizite Eltern-Kind-Zuordnung
- funktionale Reihen, Achsen, Spalten und Baender
- funktionale Spannen sichtbarer Primitive
- die explizite sichtbare Darstellungsform

Der Renderer darf:

- vorhandene funktionale Spuren physisch skalieren
- Font- und Glyphenmetriken fuer die Tinte bestimmen
- Strichstaerken, Farben und Mediumparameter anwenden
- aus gelieferten Funktionspunkten SVG-, Canvas-, DOM- oder PDF-Geometrie erzeugen

Der Renderer darf nicht:

- Solverstrategien oder Algebra kennen
- Shell-Kinder durch geometrische Einschlusspruefungen entdecken
- Shell-Spannen aus sichtbaren Atomen neu bilden
- Reihenrollen oder Achsen aus Zellinhalten erraten
- fehlende Core-Daten durch Fallback-Geometrie ersetzen
- offene oder geschlossene Darstellung selbst waehlen

Fehlen notwendige funktionale Felder,
muss der betreffende Vertrag oder Ingest fehlschlagen.

## Verbindliche erste Ausbaustufe: atomarer Renderer

Der erste freizugebende Renderer ist kein Schoensatz,
sondern der Referenzbeweis fuer den Core-Output.

Er bildet genau ab:

```text
eine gelieferte Zelle -> ein visuelles Primitiv am gelieferten Ort
```

Dabei bleiben unveraendert:

- ID und Rolle
- Zeile und Teilzeile
- Spalte oder gelieferte Spanne
- Sichtbarkeit

Er darf nur eine feste physische Rastereinheit,
Font,
Farbe
und Strichstaerke anwenden.
Er darf keine Zellen zusammenfassen,
ersetzen,
unterdruecken,
verbrauchen
oder ergaenzen.

Die heute vorhandenen zusammengesetzten Shell- und LaTeX-Pfade
sind kein Ersatz fuer diesen Beweis.
Sie bleiben nachgeordnet,
bis der atomare Pfad und seine Eins-zu-eins-Tests gruen sind.

## Bekannte Umsetzungsschuld

Die frueheren Root- und Group-Pfade leiteten Kindspuren und Bounds aus dem
generischen Szenenplan und geometrischem Einschluss ab.
Die aktuellen Row- und Shell-Fassaden re-exportieren ausserdem Altlogik,
die Rollen oder Strukturen aus Zellinhalten ableitet.

Diese Pfade widersprachen dem Zielvertrag und liegen deshalb seit dem
10. September 2026 mit ihren Tests unter `alt/`. Sie duerfen nicht durch
weitere Rekonstruktion reaktiviert werden.

## Zugeordnete Tests

- `tests/active/renderer_kernel_target_entrypoint.test.js`
- `tests/active/renderer_kernel_render_scene_ingest.test.js`
- `tests/active/render_kernel.test.js`
- `tests/active/render_stretch_metrics.test.js`

Der Ziel-Einstieg und Ingest beweisen nur die aktuell freigegebenen APIs.

## Arbeitsreihenfolge

1. funktionalen Core-/Szenenvertrag vervollstaendigen
2. Blindheitstests festlegen
3. Root- oder Group-Tinte als neue reine Feldabbildung bauen
4. erst danach eine produktive Verdrahtung erwaegen
