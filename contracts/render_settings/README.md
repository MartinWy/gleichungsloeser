# render_settings

Status: visueller Einstellungsvertrag aktiv
Stand: 7. September 2026

Vertrag fuer globale Render-Einstellungen.

Der gemeinsame Settings-Vertrag trennt derzeit vier Gruppen:

- `roots`: Wurzelgeometrie
- `fractions`: Hauptbruchstrich, Nebenbruchstrich und deren symmetrischer Ueberstand
- `exponents`: Potenzgeometrie
- `parentheses`: Klammergeometrie

Die Definitionen in [index.js](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/contracts/render_settings/index.js) sind die einzige Quelle fuer Defaults, Reglerbereiche und Gruppenzuordnung.

Alle Werte dieses Vertrags sind visuelle Geometrie oder Stil:

- Pixel- und Fontmasse
- Strichstaerken
- physische Ueberstaende
- Skalierung und optische Feinabstaende

Sie duerfen nur innerhalb bereits gelieferter funktionaler Reihen, Spalten und Baender wirken.
Kein Regler darf:

- funktionale Spalten oder Reihen hinzufuegen
- Shell-Kinder oder Shell-Spannen aendern
- eine fehlende Core-Geometrie kompensieren
- einen roten Core-Vertrag optisch uebermalen

Zugeordneter Test:

- `tests/active/cockpit_designer_target_entrypoint.test.js`
