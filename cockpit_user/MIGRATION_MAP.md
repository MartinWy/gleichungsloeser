# cockpit_user: Migrationskarte

Status: erste Andockphase umgesetzt  
Stand: 9. August 2026

## Heutige Quellen

Der heutige produktive UI-Pfad lebt vor allem unter:

- `components/Arbeitsblatt_Druckansicht/`
- `browser/`

## Ziel

`cockpit_user/` soll spaeter das rechte Cockpit aufnehmen,
also die aufgabenbezogene Steuerung durch den Nutzer.

## Regel

`cockpit_user` steuert Darstellung und Export einer Aufgabe,
nicht die globale Geometrie des Renderers.

## Bereits umgesetzt

1. Ziel-Fassade `cockpit_user/index.js`
2. User-Cockpit-Contract unter `contracts/worksheet_profile/`
3. Controls fuer Aufgabe, Sichtbarkeit, Farben und Export
4. Referenz auf den produktiven Startpunkt `index.html` / `cockpit.js` / `scripts/cockpit_server.mjs`

## Noch nicht umgesetzt

1. keine produktive Umverdrahtung der laufenden App
2. keine Trennung der Alt-Implementierung in neue Unterordner
3. keine separate Test-Suite ausser den Ziel-Fassaden-Checks
