# Oeffentlicher Betrieb des Gleichungsloesers

Stand: 2026-09-16

## Zweck

Die oeffentliche Testinstanz muss dieselbe Anwendung ausliefern wie das lokale
Cockpit. Insbesondere bleibt `POST /api/render` erhalten. Eine rein statische
GitHub-Pages-Ausgabe ist deshalb kein vollstaendiger Ersatz.

Der oeffentliche Repository- und Dienstname lautet verbindlich
`gleichungsloeser`.

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
4. Jeder Renderauftrag erhaelt einen eigenen Arbeitsraum. Gleichzeitige Nutzer
   duerfen niemals dieselben `current.*`-Dateien teilen.
5. Ausgelieferte Pfade muessen innerhalb des jeweils erlaubten Wurzelordners
   liegen. Pfadtraversalen werden abgewiesen.
6. Der JSON-Request-Body ist begrenzt. Uebergrosse Requests werden vor Core und
   LaTeX abgewiesen.
7. `GET /healthz` prueft nur die Erreichbarkeit des Prozesses und startet keine
   mathematische Verarbeitung.
8. Der Container enthaelt Node.js, LaTeX und Poppler. Das Dateisystem der
   Hosting-Instanz gilt als fluechtig; Vorschauen sind keine dauerhafte Ablage.
9. PNG und PDF werden innerhalb desselben `POST /api/render` erzeugt und als
   unveraenderte Artefakte in dessen Antwort uebergeben. Das Cockpit darf fuer
   diese Ausgabe keinen zweiten Dateiaufruf an dieselbe Instanz voraussetzen.
10. Die Vorschauauslieferung liest fertige Dateien nur ein und kodiert sie. Sie
    darf weder Core-Wahrheit noch funktionale oder visuelle Geometrie deuten,
    reparieren oder neu rendern.

## Vercel-Hobby-Vertrag

Die primaere oeffentliche Testinstanz laeuft als Vercel-Container aus
`Dockerfile.vercel`. Der Server bindet an `0.0.0.0` und an den von Vercel
uebergebenen Port. `Dockerfile` und `render.yaml` bleiben nur alternative
Containerbeschreibungen; sie bestimmen nicht den Vercel-Lauf.

Da eine Folgeanfrage auf einer anderen zustandslosen Instanz landen kann,
sind lokale Vorschaupfade kein oeffentlicher Ausgabevertrag. Temporaere
Arbeitsraeume dienen ausschliesslich der Erzeugung waehrend eines Renderauftrags.

## Veroeffentlichungsfolge

1. Dokumentation und Modulrichtlinien aktualisieren.
2. Aktive Tests lokal vollstaendig gruen ausfuehren.
3. Cockpit im Browser gegen den lokalen Server pruefen.
4. Einen sauberen Export des Projektordners erzeugen.
5. Den Export als eigenes oeffentliches GitHub-Repository veroeffentlichen.
6. Die Node-Anwendung aus diesem Repository ueber `Dockerfile.vercel` mit dem
   Vercel-Hobby-Konto bereitstellen.
7. Gesundheitsroute und einen echten Renderauftrag ueber die oeffentliche URL
   pruefen.
