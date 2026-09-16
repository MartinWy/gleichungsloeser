# Prototypes

Hier liegen sichtbare Einzelansichten fuer das getrennte Renderprojekt.

Sie sind:

- isoliert vom aktiven Gleichungsloeser
- sichtbar und direkt pruefbar
- nur lesend gegenueber dem bestehenden Kern

Aktueller Prototyp:

- `renderer-settings-demo.html`
- `fraction-layout-principles.html`

Zweck:

- die Rollen von produktivem User-Cockpit und separater Designer-Ansicht sichtbar trennen
- links globale Rendergeometrie an verschachtelten Demonstratoren pruefen
- Bruch-Geburt, Bruch-Transport und Bruch-Einbettung als grosse Definitionsblaetter sichtbar machen
- darunter den echten Produktpfad mit Gleichung, Zeilenschaltern und Schrittfarben parallel testen
- den Sprung vom Design-Tool in die jeweilige Debug-Ansicht ueber einen eigenen Button pruefbar machen
- nur freigegebene oder rein isolierte Darstellungen sichtbar machen

Die frueheren Root- und Group-Debugansichten samt Datengeneratoren liegen im
Archiv `alt/2026-09-10_pre_atomic_renderer_kernel/`, weil ihre aktive
Geometriekette Schalenbeziehungen aus Bounds rekonstruierte.
