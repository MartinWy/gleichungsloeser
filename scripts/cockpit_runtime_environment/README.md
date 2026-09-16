# Richtlinie: Cockpit-Laufzeitumgebung

## Eine Aufgabe

Dieses Modul uebersetzt die Laufzeitumgebung in konkrete Serverparameter und
Werkzeugpfade. Es loest keine Gleichung, erzeugt keine Vorschau und verarbeitet
keine HTTP-Anfrage.

## Vertrag

- Lokaler Standard: Host `127.0.0.1`, Port `4173`.
- `HOST` und `PORT` duerfen diese Standards ueberschreiben.
- `PDFLATEX_BINARY` und `PDFTOPPM_BINARY` haben Vorrang.
- Ohne Override wird zuerst ein vorhandener bekannter lokaler Pfad und danach
  der jeweilige Programmname fuer die `PATH`-Aufloesung verwendet.
- Ein ungueltiger Port wird sofort abgewiesen.
