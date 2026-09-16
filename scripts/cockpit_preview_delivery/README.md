# Richtlinie: Cockpit-Vorschauauslieferung

## Eine Aufgabe

Dieses Modul uebergibt die bereits erzeugten PNG- und PDF-Dateien als
unveraenderte, in sich geschlossene Antwortartefakte und macht genau diese
Artefakte im Browser als lokale Objekt-URLs nutzbar. Es rendert, deutet und
veraendert keine Inhalte.

## Eingabevertrag

- Der Aufrufer uebergibt genau einen PNG- und einen PDF-Dateipfad.
- Beide Pfade muessen auf vorhandene, nicht leere regulaere Dateien zeigen.
- Die Erzeugung der Dateien ist abgeschlossen.

## Ausgabevertrag

- `previewArtifact` traegt den MIME-Typ `image/png`.
- `pdfArtifact` traegt den MIME-Typ `application/pdf`.
- `base64` enthaelt jeweils exakt die Bytes der Eingabedatei.
- Die Browser-Seite erzeugt daraus eine Objekt-URL mit demselben MIME-Typ und
  denselben Bytes.
- Die Antwort ist unabhaengig davon, ob der temporaere Arbeitsraum nach dem
  aktuellen Request noch existiert oder eine Folgeanfrage dieselbe Instanz
  erreicht.

## Verbotene Doppelrolle

Das Modul kompiliert kein LaTeX, erzeugt keine Vorschaugeometrie, veraendert
keine Bytes und baut keine oeffentlichen Server-Dateipfade. Browser-Objekt-URLs
sind nur lokale Lebenszyklusobjekte und muessen nach ihrer Nutzung freigegeben
werden.
