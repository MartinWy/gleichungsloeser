# Archiv: vorkanonische Tests

Stand: 10. September 2026

## Zweck

Dieses Verzeichnis bewahrt einunddreissig eindeutig abgeloeste Tests ausserhalb des
produktiven Testordners auf. Kein Test wurde geloescht.

Die Dateien beschreiben fruehere Architekturen, alte Importpfade oder vor
Genesis geltende Ausgabeformen. Sie sind historische Quellen, aber keine
Richtlinien fuer den heutigen Code.

## Verbindliche Grenze

- `npm test` fuehrt ausschliesslich heutige Tests aus.
- `npm run test:legacy` listet dieses Archiv und seine aktiven Nachfolger auf,
  fuehrt die archivierten Dateien aber nicht aus.
- Der vollstaendige Status jeder Datei steht in `tests/LEGACY_STATUS.md`.
- Rueckverschieben in `tests/` ist nur nach einer neuen dokumentierten
  Vertragsentscheidung zulaessig.

## Bewahrte Struktur

Die fruehere Lage unter `tests/`, `tests/core/` und `tests/legacy/` bleibt unter
dem Unterordner `tests/` nachvollziehbar. Dadurch sind Herkunft und alte
relative Beziehungen sichtbar, ohne den produktiven Ordner zu verunreinigen.

Die zwei am 10. September nachtraeglich abgeloesten Display-Tests tragen im
Archiv den Zusatz `_pre_atomic`, damit ihre vorkanonische Erwartung bereits am
Dateinamen erkennbar ist.

Dasselbe gilt fuer die spaeter am selben Tag erkannten Tests auf synthetische
Bruchteil- und Root-Gesamtzellen.

Die elf zuletzt aufgenommenen Dateien tragen ebenfalls `_pre_atomic`. Sie
prueften die entfernte LaTeX-Makrofamilie, nachtraegliche Renderer-Zentrierung
oder die abgeloeste `stepLayout`-Hilfs-API. Ihre weiterhin gueltigen Aussagen
sind in kleine aktuelle Modul- und Integrationsbeweise ueberfuehrt.

Weitere sechs Tests gehoerten zur nicht freigegebenen rekonstruktiven
Renderer-Kernel-Fassade. Sie liegen zusammen mit dem zugehoerigen Code im
getrennten Renderer-Archiv und werden durch atomare Ingest-, P4- und
Ausgabebeweise ersetzt.
