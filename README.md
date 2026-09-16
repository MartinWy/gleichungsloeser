# Genesis Gleichungsloeser

Ein modularer Gleichungsloeser, der Rechenschritte als funktionale Geometrie
aufbaut und anschliessend atomar rendert.

## Lokal starten

Voraussetzungen sind Node.js 22, `pdflatex` und `pdftoppm`.

```bash
npm test
npm start
```

Danach ist das Cockpit unter <http://127.0.0.1:4173/> erreichbar.

## Architektur

Die verbindliche Grundlage ist
[`docs/Genesis/Genesis_Gleichungsloeser_Maschine.md`](docs/Genesis/Genesis_Gleichungsloeser_Maschine.md).
Jedes Prozessmodul uebernimmt genau einen Schritt, erfuellt genau eine Aufgabe
und uebergibt sein Ergebnis an die naechste Instanz. Der Core bestimmt die
funktionale Geometrie; der Renderer stellt sie dar und darf sie nicht erraten
oder korrigieren.

## Oeffentlicher Betrieb

Der Server benoetigt wegen der PDF- und PNG-Erzeugung eine Node-, LaTeX- und
Poppler-Laufzeit. Fuer die primaere Vercel-Testinstanz beschreibt
`Dockerfile.vercel` diese Umgebung. `vercel.json` startet sie als
Container-Service und leitet alle Routen an diesen Prozess weiter;
`Dockerfile` und `render.yaml` bleiben als alternative Containerkonfiguration
erhalten.
Der vollstaendige Vertrag steht in
[`docs/Deployment/PUBLIC_RELEASE.md`](docs/Deployment/PUBLIC_RELEASE.md).

Der Quelltext ist derzeit ohne Open-Source-Lizenz veroeffentlicht. Alle Rechte
bleiben vorbehalten.
