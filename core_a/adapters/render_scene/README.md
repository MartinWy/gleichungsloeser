# render_scene

Status: V1-Adapter aktiv; atomare Zielidentitaet verbindlich  
Stand: 10. September 2026

Dieser Adapter uebersetzt den bestehenden Kernexport
aus `projectionRows` plus `layoutPlan`
in den neutralen Vertragsraum `render_scene`.

Er darf dabei bewusst nur vier Dinge tun:

1. Projektionszeilen lesen
2. sichtbare Render-Knoten in Szenenknoten uebersetzen
3. funktionale Reihen-, Schalen-, Kind- und Darstellungsfelder verlustfrei kopieren
4. pro Projektionszeile eine Szene ausgeben

Er tut dabei ausdruecklich **nicht**:

- neue Mathematik entscheiden
- neue Spalten berechnen
- funktionale Geometrie veraendern oder vervollstaendigen
- Shell- oder Kindidentitaeten aus Fragmenten erraten
- Fokus-IDs durch Textvergleich erzeugen
- Szenenbounds als Ersatz fuer fehlende Core-Baender verwenden
- den Kern rueckwaerts beeinflussen

## Verbindliche Abbildung

Der Adapter darf Feldnamen und Verschachtelung des Schemas aendern,
aber keine Bedeutung.

Insbesondere gilt:

- `projectionRow.shellSpans` bleibt die kanonische Quelle der funktionalen Schalenauftreten.
- `shellId`, `parentShellId`, Kind-IDs, Geburtszeile und Transportzustand bleiben unveraendert.
- funktionale Reihen und Spalten bleiben Zahlen desselben Koordinatenraums.
- die explizite sichtbare Darstellungsform wird unveraendert durchgereicht.
- Pixel-, `em`- und Papierwerte entstehen hier nicht.

## Zielidentitaet

`focusIds` entstehen ausschliesslich aus dem vom Core gelieferten
`isTarget = true`. Textgleichheit ist keine Zielidentitaet und darf hier nicht
als Ersatz verwendet werden.

## Verbleibende Umsetzungsschuld

Der aktuelle Adapter kopiert `shellSpans` nur in `rowMeta`,
waehrend nachgelagerte Szenenplaene eigene Tracks aus Knotenfragmenten bilden.

Der Renderer muss diese kanonischen Core-Spannen direkt lesen.

## Zugeordnete Tests

- `tests/active/core_a_render_scene_adapter.test.js`
- `tests/active/render_scene_contract_entrypoint.test.js`
- `tests/active/renderer_kernel_render_scene_ingest.test.js`

Der Adaptertest prueft die Szenenbreite gegen die tatsaechlichen P4-Zellgrenzen
und die Fokusspur gegen explizite Core-Zielmarkierungen.
