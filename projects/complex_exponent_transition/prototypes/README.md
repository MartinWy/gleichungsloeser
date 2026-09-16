# Prototypes

Hier koennen spaeter isolierte visuelle Prototypen entstehen,
zum Beispiel:

- Kamera- oder Zoomtests
- Kippungsstudien
- Entfaltungsstudien
- kleine HTML-/Canvas-Demos

Regel:

Prototypen bleiben lokal zu diesem Folgeprojekt
und werden nicht in den aktiven Cockpit-Renderer eingehakt.

Aktueller Sicht-Prototyp fuer den lokalen Grenzschritt:

- `b-paper-prototype.html`
- `real_transition_demo.html`

`real_transition_demo.html` liest jetzt standardmaessig
ein echtes Hand-off-Paket aus:

- `../snapshots/real_bridge_handoff_left.json`

Optional kann ueber `?payload=...`
eine andere reale Payload-Datei geladen werden,
zum Beispiel die Rechtsvariante.
