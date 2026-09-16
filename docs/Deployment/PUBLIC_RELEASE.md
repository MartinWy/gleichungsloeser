# Oeffentlicher Betrieb des Gleichungsloesers

Stand: 2026-09-16

## Zweck

Die oeffentliche Testinstanz muss dieselbe Anwendung ausliefern wie das lokale
Cockpit. Insbesondere bleibt `POST /api/render` erhalten. Eine rein statische
GitHub-Pages-Ausgabe ist deshalb kein vollstaendiger Ersatz.

## Vorrang der Fachvertraege

Die Bereitstellung darf weder den Core noch seine funktionale Geometrie
veraendern. Der Server orchestriert nur Eingabe, Core-Aufruf, Projektion und
Dateiausgabe. Er darf keine mathematischen Fehler raten, uebermalen oder
ausgleichen.

## Hosting-Vertrag

1. Das oeffentliche Repository enthaelt nur dieses Projekt und keine
   Geschwisterprojekte des lokalen Sammel-Repositories.
2. Der Prozess liest Host und Port aus der Laufzeitumgebung. Lokal bleibt
   `127.0.0.1:4173` der Standard; im Container wird auf `0.0.0.0` gebunden.
3. `pdflatex` und `pdftoppm` werden ueber Umgebungsvariablen oder den `PATH`
   gefunden. Benutzerbezogene absolute Pfade sind kein Deployment-Vertrag.
4. Jeder Renderauftrag erhaelt einen eigenen Arbeitsraum und eigene URLs.
   Gleichzeitige Nutzer duerfen niemals dieselben `current.*`-Dateien teilen.
5. Ausgelieferte Pfade muessen innerhalb des jeweils erlaubten Wurzelordners
   liegen. Pfadtraversalen werden abgewiesen.
6. Der JSON-Request-Body ist begrenzt. Uebergrosse Requests werden vor Core und
   LaTeX abgewiesen.
7. `GET /healthz` prueft nur die Erreichbarkeit des Prozesses und startet keine
   mathematische Verarbeitung.
8. Der Container enthaelt Node.js, LaTeX und Poppler. Das Dateisystem der
   Hosting-Instanz gilt als fluechtig; Vorschauen sind keine dauerhafte Ablage.

## Veroeffentlichungsfolge

1. Dokumentation und Modulrichtlinien aktualisieren.
2. Aktive Tests lokal vollstaendig gruen ausfuehren.
3. Cockpit im Browser gegen den lokalen Server pruefen.
4. Einen sauberen Export des Projektordners erzeugen.
5. Den Export als eigenes oeffentliches GitHub-Repository veroeffentlichen.
6. Die Node-Anwendung aus diesem Repository als Docker-Webdienst bereitstellen.
7. Gesundheitsroute und einen echten Renderauftrag ueber die oeffentliche URL
   pruefen.
