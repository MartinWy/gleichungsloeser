# Richtlinie: Cockpit-HTTP-Grenze

## Eine Aufgabe

Dieses Modul schuetzt die HTTP-Grenze. Es begrenzt Request-Bodies und loest nur
Pfade auf, die innerhalb eines ausdruecklich erlaubten Wurzelordners liegen.
Es kennt weder Algebra noch Rendering.

## Vertrag

- Der Standardwert fuer JSON-Requests ist hoechstens 64 KiB.
- Bei Ueberschreitung wird der Request verworfen.
- URL-Pfade werden dekodiert und normalisiert.
- `..`, absolute Ausbrueche und andere Pfade ausserhalb der erlaubten Wurzel
  werden abgewiesen.
