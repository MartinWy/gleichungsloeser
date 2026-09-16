# cockpit_user

Status: erste Ziel-Fassade aktiv  
Stand: 9. August 2026

## Zweck

`cockpit_user` ist die kuenftige Ordnerwurzel
des rechten Cockpits
fuer die Aufgabenformatierung durch den Nutzer.

Hierhin gehoeren spaeter:

- Zeilen ausblenden
- Atome ausblenden
- Farben fuer Aufgaben
- Exportoptionen
- Arbeitsblattnahe UI

## Heute

Die produktive Nutzeroberflaeche liegt noch im bestehenden System
und wird heute nicht umverdrahtet.

Dieser Ordner ist nicht mehr nur vorbereitet.

Hier existieren jetzt bereits:

- `index.js` als Ziel-Fassade
- `ui/` mit Referenz auf `index.html`, `cockpit.js`, `cockpit.css` und `scripts/cockpit_server.mjs`
- `worksheet_controls/` fuer Gleichung, Zielvariable und Potenzstil
- `visibility_controls/` fuer Zeilenschalter mit erhaltener Layoutluecke
- `color_controls/` fuer aufgabenbezogene Farben
- `export_controls/` fuer Vorschau und PDF
- `adapters/` fuer das gemeinsame User-Cockpit-Manifest

Wichtig:

- Der produktive Cockpit-Pfad bleibt unveraendert.
- Die neue Struktur beschreibt ihn nur ueber Contracts und Fassaden.

## Regeln

- `cockpit_user` darf spaeter nicht direkt in P1 bis P4 importieren.
- Kommunikation mit dem Kern nur ueber freigegebene Adapter und Contracts.
- Keine Renderfeinjustierung auf globaler Ebene in diesem Cockpit.
- Ausgeblendete Zeilen behalten ihren Platz im Layout.
