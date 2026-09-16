# export_projection_pdf_core_neu

Neuer, isolierter PDF-Viewer fuer das Cockpit.

Status: isolierter visueller Verbraucher; Standardbeweis gruen
Stand: 7. September 2026

Grundsatz:

- der Core exportiert die Ortswahrheit
- das ViewModel exportiert Zellen, Baender und Reihen
- dieser Viewer setzt nur noch diese Daten

Verboten in diesem Pfad:

- spaetere Bruch-Zentrierung
- spaetere Band-Neuberechnung
- spaetere Shell-Zerlegung aus Text
- lokale Geometrie-Korrekturen "nach Augenmass"

Der Viewer darf nur:

- Zellbaender in physische X-Spannen uebersetzen
- Reihen in physische Y-Lagen uebersetzen
- exportierte Atome und Shell-Zellen setzen
- Bruchstriche exakt ueber ihr exportiertes Band zeichnen
- explizite Wrapper wie Klammern als reine Tinte ueber der exportierten Band- und Reihenwahrheit zeichnen
- bei `POWER` die getrennt gelieferten Zellen `power_base` und `power_exponent`
  jeweils genau einmal an ihrer gelieferten funktionalen Position setzen

`reine Tinte` bedeutet:
Der Viewer darf Font- und Glyphenmetriken fuer den physischen Pfad bestimmen,
aber keine funktionale Spanne, Hoehe, Achse oder Kindzuordnung aendern.

Erste Prioritaet dieses Neustarts:

- sichtbare Brueche
- geschlossene Schalen
- Positionsstabilitaet zwischen zwei Zeilen

Zugeordneter Standardtest:

- `tests/active/latex_export_display_slot_fidelity.test.js`

Dieser Test umfasst auch den `POWER`-Beweis:
Ein in `P4` sichtbarer Exponent muss im isolierten Viewer als eigenes sichtbares Primitiv erscheinen.

Der Test ist registriert und aktuell gruen.
Die produktive Einbindung bleibt davon getrennt und weiterhin offen.
