# Handbuch: columnLayoutCore

Status: produktiver atomarer Layoutpfad; funktionale Topologie kommt vollstaendig aus dem Core
Stand: 16. September 2026

## Zweck
Gebuendelter Spaltenlayout-Kern der Arbeitsblatt-Druckansicht.

Dieses Untermodul berechnet weder Algebra noch funktionale Geometrie.
Es baut nur die physische Spaltenkarte
auf Basis des bereits vollstaendig projizierten Worksheet-Modells.

Die verbindliche Rasterregel fuer Brueche, Wurzeln und sichtbare Schalen steht in:
- `docs/Architecture/FRACTION_ROOT_SPALTENTREUE_CONTRACT.md`

## Dateien
- `index.js`
- `atomWidthCatalog.js`
- `columnLayoutProfile.js`
- `columnTopology.js`
- `columnWidthAtoms.js`
- `columnWidths.js`
- `displayColumnLayout.js`
- `processSpaceLayout.js`

## Verantwortung
- explizite Atombreiten katalogisieren
- benannte Layoutprofile bereitstellen
- explizite funktionale Spalten und Shell-Slots lesen
- physische Atombreiten fuer bereits zugeordnete Spalten bestimmen
- diese visuellen Breiten innerhalb jedes ausdruecklich gelieferten
  Prozessraums konsistent aggregieren
- funktionale Slots und visuelle Breiten zu einer physischen Display-Karte zusammenfuehren
- explizit unsichtbare Core-Slots nur dann auf Breite `0` kollabieren, wenn
  dieselbe globale Spalte keine sichtbare Zelle mit Breitenbedarf traegt
- dieselbe atomare Identitaet innerhalb derselben Gleichungsseite und desselben
  Prozessraums in jeder Folgezeile auf exakt demselben physischen Slotzentrum halten

## Architekturgrenze
- keine Algebra
- keine neue Projektion
- keine funktionale Shell-Topologie
- keine neuen Display-Slots fuer fehlende Core-Primitive
- keine Rekonstruktion von Spannen oder Kindbeziehungen aus sichtbaren Zellen
- keine Export-Latex-Erzeugung
- keine synthetische Bruch-, Wurzel-, Potenz- oder Funktionszelle
- keine eigene Entscheidung, ob eine POWER-Basis Klammern benoetigt
- keine zweite Wahrheit neben dem Kern und dem Worksheet-ViewModel

Ein dokumentierter Systemwechsel wie Bridge B beendet den alten Prozessraum.
Die Landing-Zeile darf deshalb genau einmal ein neues lokales Termband beginnen.
Ab dieser Landing-Zeile muss A2 dieselben Slotzentren ohne zweiten Sprung uebernehmen.
Column Layout darf weder die alten POWER-Slots in das Landing-Band durchziehen noch
die neue Landing-Lage pro Folgezeile erneut aus sichtbaren Breiten berechnen.

Die Isolation ist beidseitig: A1-Breiten duerfen A2 nicht beeinflussen und
A2-Breiten duerfen A1 nicht rueckwirkend beeinflussen. Column Layout baut fuer
jede `processSpaceId` eine eigene physische Breitenkarte. Es richtet diese
Karten ausschliesslich am bereits gelieferten Gleichheitsanker aus und bildet
sie danach ohne neue fachliche Positionierung auf ein gemeinsames
Ausgabegitter ab. Gleiche numerische `col`-Werte in verschiedenen
Prozessraeumen sind keine gemeinsame physische Spalte.

## Interne Trennung
- `atomWidthCatalog.js`: nur bekannte Einzelatome
- `columnLayoutProfile.js`: nur Profilwerte und konfigurierbare Abstaende
- `columnTopology.js`: nur Abbildung explizit gelieferter funktionaler Slots; keine Topologieerfindung
- `columnWidthAtoms.js`: nur lokale visuelle Atombreiten
- `columnWidths.js`: nur globale visuelle Breitenaggregation fuer stabile physische Spalten
- `displayColumnLayout.js`: nur Zusammenfuehrung zur physischen Slot-Karte
- `processSpaceLayout.js`: nur Isolation benannter Breitenkarten und ihre
  Ausrichtung am gelieferten Gleichheitsanker
- `index.js`: nur Fassade

## Wichtiger Hinweis
Die Top-Level-Dateien unter `components/Arbeitsblatt_Druckansicht/*.js`
bleiben aus Kompatibilitaetsgruenden als duenne Re-Export-Fassaden bestehen.

Die eigentliche Fachlogik lebt hier.

Mit `Fachlogik` ist ausschliesslich visuelle Layoutlogik gemeint.
Der aktuelle Code ist gegen diese engere Grenze zu pruefen,
bevor weitere Layoutkorrekturen vorgenommen werden.

## Zugeordnete Tests

- `tests/active/latex_p4_column_layout.test.js`
- `tests/active/latex_export_display_slot_fidelity.test.js`
- `tests/active/worksheet_display_model.test.js`
- `tests/active/worksheet_process_space_position_fidelity.test.js`
- `tests/active/worksheet_process_space_width_isolation.test.js`

Ein Test darf eine fehlende funktionale Spalte nicht durch erwartete lokale Topologie legitimieren.
