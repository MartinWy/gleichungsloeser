# Vercel-Containervertrag

Stand: 2026-09-16

## Eine Aufgabe

Dieses Modul verbindet die bereits definierte Containerlaufzeit mit Vercel.
Es deklariert genau einen Vercel-Service und leitet jeden eingehenden HTTP-Pfad
unveraendert an diesen Service weiter.

## Eingang

- `Dockerfile.vercel` als ausfuehrbare Containerbeschreibung
- der in `package.json` definierte Startbefehl

## Ausgang

- ein Service `api` mit `runtime: container`
- `Dockerfile.vercel` als dessen einziger Einstiegspunkt
- eine vollstaendige Catch-all-Weiterleitung auf `api`

## Invarianten

1. `vercel.json` benennt `Dockerfile.vercel` explizit als Einstiegspunkt.
2. Der Service laeuft aus der Projektwurzel und verwendet die
   Containerlaufzeit.
3. Die Catch-all-Regel leitet auch `/healthz`, `/api/render` und statische
   Cockpit-Pfade an denselben Prozess weiter.
4. Das Modul veraendert weder Request- noch Response-Inhalte.
5. Das Modul enthaelt keine Core-, Cockpit-, Projektions- oder Renderlogik.
6. Fehlende Anwendungspfade werden nicht geraten, umgeschrieben oder durch
   statische Ersatzseiten verdeckt.
7. Lokale Vercel-Projektbindung und Umgebungsdateien bleiben ausserhalb des
   Repository; sie sind Laufzeit- beziehungsweise Zugangsdaten, kein Code.

## Verantwortlicher Code

- `vercel.json`: Service- und Routingdeklaration
- `Dockerfile.vercel`: Laufzeitbild und Prozessstart

Der zugeordnete Beweis ist
`tests/active/vercel_container_contract.test.js`.
