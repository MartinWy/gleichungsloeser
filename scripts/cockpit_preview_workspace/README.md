# Richtlinie: Cockpit-Vorschau-Arbeitsraum

## Eine Aufgabe

Dieses Modul vergibt fuer jeden Renderauftrag einen eigenen, nicht
kollidierenden Arbeitsraum. Es kompiliert nicht und liefert keine Dateien aus.

## Vertrag

- Jeder Aufruf erzeugt unterhalb des Vorschauordners ein neues Verzeichnis.
- Die Dateinamen innerhalb dieses Verzeichnisses bleiben `current.tex`,
  `current.pdf` und `current.png`.
- Die oeffentliche Kennung enthaelt keine Pfadseparatoren.
- Zwei Arbeitsraeume duerfen niemals dieselbe Kennung oder denselben Pfad
  erhalten.
