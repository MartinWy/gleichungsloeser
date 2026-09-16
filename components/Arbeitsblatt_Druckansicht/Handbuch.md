# Handbuch: Arbeitsblatt_Druckansicht

Status: produktiver Pfad aktiv; Genesis-Grenzen teilweise noch rot
Stand: 8. September 2026

## Zweck
Produktnaher Render-, Diagnose- und Arbeitsblattpfad fuer den aktuellen Solver-Kern.

## Dateien
- `index.html`
- `logic.js`
- `style.css`
- `viewModel.js`
- `inputAdapter.js`
- `renderKernel.js`
- `renderKernelCore/`
- `columnLayoutCore/`
- `atomWidthCatalog.js`
- `columnLayoutProfile.js`
- `columnTopology.js`
- `columnWidthAtoms.js`
- `columnWidths.js`
- `displayColumnLayout.js`

## Verantwortung
- Gleichung und Zielvariable entgegennehmen
- `core/index.js` direkt aufrufen
- alltagstaugliche, Unicode-nahe und LaTeX-nahe Eingaben vor dem Solve-Aufruf auf Kernsyntax normalisieren
- dabei die Bedeutung expliziter Gruppen unveraendert erhalten; die Umformhistorie gehoert ausschliesslich P2/P3
- die vom Kern gelieferten `projectionRows` als untereinander stehende Druckzeilen rendern
- die gestapelten Blockinformationen `localRow`, `stackedRow` und `stackedVisualRowCount` direkt aus der Kernprojektion lesen
- Bruchstrich-Spannweiten wie `colStart` und `colEnd` direkt aus der Kernprojektion lesen statt sie lokal zu erraten
- sichtbare Brueche niemals im ViewModel oder im DOM wieder zu einem einzigen Gesamtblock einklappen, sondern ihre projizierten Atome und Achsenzellen 1:1 weiterreichen
- explizit gelieferte `ROOT`-, `POWER`-, `FUNCTION`- und `GROUP`-Darstellungsformen in visuelle Renderknoten uebersetzen
- bei `DIVISION` exakt die vom Core gewaehlte sichtbare Darstellungsform setzen; weder Gesamtblock noch Innenprimitive selbst waehlen
- Layout-Metadaten wie `boxRole`, `axisBehavior`, `fractionDepth`, `scale` und `barThicknessEm` bis ins DOM/CSS weiterreichen
- Teilzeilen-Metriken wie `minHeightEm` fuer Oberzeile, Achsenzeile und Unterzeile aus dem Renderkern ableiten
- Teilzeilenbalance `axisBalanceEm` zusaetzlich als Blockwert weiterreichen, damit Huelle und Diagnose nicht aus Einzelzellen rueckwaerts schliessen muessen
- kleinen Teilzeilenversatz `axisShiftEm` aus dem Renderkern weiterreichen, damit Achsenzellen eines Blocks gemeinsam feinjustiert werden koennen
- expliziten Teilzeilenkontext wie `fraction_axis` oder `root_fraction_axis` weiterreichen, damit Diagnose und Huelle wissen, warum eine Achse gerade so behandelt wird
- explizite Bruchspanne `fractionSpanWidth` weiterreichen, damit schmale und breite Bruchbloecke im Renderkern unterschiedlich eng gesetzt werden koennen
- Teilzeilen-Mindesthoehen fuer sichtbare Bruchbloecke ebenfalls aus dieser Bruchspanne ableiten, damit `3/2` kompakter werden darf als `(5-3)/2`
- fuer einfache Bruchachsen eine kleine explizite Begleiter-Korrektur an `x`, `=` und andere Baseline-Nachbarn weiterreichen, damit diese gemeinsam mit dem Bruchstrich feiner fluchten koennen
- dieselbe Begleiter-Korrektur auch fuer `fraction_root_axis` und `fraction_power_axis` weiterreichen, damit die Huelle komplexe sichtbare Bruchachsen nicht wieder separat erraten muss
- sichtbare Bruchachsen als eigene Teilzeilenvertraege weiterreichen: `rowContentShiftEm` fuer Ober-/Unterzeile sowie `axisLineShiftEm` und Linienmetriken fuer die Achsenzeile
- Zellmetriken erst nach Kenntnis dieses Teilzeilenkontexts bilden, damit z. B. der Bruchstrich in `fraction_axis` anders gesetzt werden kann als in anderen Achsen
- Achsenhuellen wie `axisTopReserveEm`, `axisBottomReserveEm` und `axisBalanceEm` aus dem Renderkern bis in Diagnose und DOM sichtbar machen
- eine no-print-Diagnosespur mit `rowKinds`, `rowMetrics` und sichtbaren Zellpositionen anbieten
- Zellmetriken wie `shiftYEm`, `alignItems`, `lineHeightEm` und `lineThicknessEm` an DOM und CSS weiterreichen
- Diagnosewerte wie `absoluteRow`, `stackedRow`, `stackRowStart`, `stackRowEnd` und Achsenkoordinaten lesbar halten
- die eigentliche Spaltenlogik an `columnLayoutCore/` delegieren
- die eigentliche Render-Vorbereitung an `renderKernelCore/` delegieren
- die Top-Level-Dateien `atomWidthCatalog.js`, `columnLayoutProfile.js`, `columnTopology.js`, `columnWidthAtoms.js`, `columnWidths.js` und `displayColumnLayout.js` nur als oeffentliche Fassaden behalten
- die Top-Level-Datei `renderKernel.js` ebenfalls nur als oeffentliche Fassade behalten
- keine mathematische Logik duplizieren

## Architekturgrenze
- Der Kern bleibt die einzige semantische Wahrheit.
- P4 bleibt die einzige funktionale Geometriewahrheit.
- Diese Komponente ist reine Peripherie und damit bewusst plug-and-play.
- Gerendert wird nur, was der Solver bereits entschieden und projiziert hat.
- Fehlende Spuren, Schalen, Kindzuordnungen, Reihen oder Darstellungsformen werden als Vertragsfehler sichtbar gemacht.
- ViewModel, DisplayModel, Column Layout und Renderkern duerfen solche Fehler nicht aus Text, Nachbarschaft oder optischer Messung ausgleichen.

## Funktionale und visuelle Geometrie

Die Komponente liest funktionale Geometrie:

- Atom- und Shell-Identitaeten
- Kindbeziehungen
- funktionale Spalten, Reihen, Achsen und Baender
- explizite sichtbare Darstellungsform

Sie erzeugt nur visuelle Geometrie:

- physische Spaltenbreiten
- Pixel-, `em`- oder Papierlagen
- Fontmetriken
- Strichstaerken, Farben und CSS-/LaTeX-Darstellung

Eine optische Messung darf keine funktionale Spur verschieben,
keine Schale vergroessern
und keine fehlende Kindbeziehung erzeugen.

## Interne Module

| Modul | Fuehrende Richtlinie | Einzige Aufgabe |
| :--- | :--- | :--- |
| Eingabenormalisierung | `INPUT_ADAPTER_CONTRACT.md` | UI-Syntax bedeutungstreu in kanonische Kernsyntax uebertragen |
| Worksheet ViewModel | `VIEW_MODEL_CONTRACT.md` | Core-Projektion verlustfrei in Zellen abbilden |
| Worksheet DisplayModel | `DISPLAY_MODEL_CONTRACT.md` | explizite Display-Slots ohne neue Ortsentscheidung bereitstellen |
| Column Layout | `columnLayoutCore/Handbuch.md` | funktionale Spuren physisch breit machen |
| Render-Vorbereitung | `renderKernelCore/README.md` | gelieferte Rollen in visuelle Knoten und Metriken abbilden |
| Atomarer DOM-Renderer | `DOM_RENDER_CONTRACT.md` | jedes Display-Item genau einmal am gelieferten Ort zeichnen |

Keines dieser Module darf die Aufgabe eines anderen uebernehmen.

## Atomare Referenzkette

Bis Core und Uebergabevertraege vollstaendig gruen sind,
ist diese Kette verbindlich:

1. `viewModel.js` bildet jedes sichtbare Projektionsatom genau auf eine Worksheet-Zelle ab.
2. `worksheetDisplayModel.js` bildet jede Worksheet-Zelle genau auf ein Display-Item ab.
3. `logic.js` bildet jedes Display-Item genau auf ein sichtbares DOM-Primitiv ab.

Die jeweilige Stufe bewahrt ID, Rolle, Teilzeile, Spalte und Spanne.
Sie darf weder Elemente hinzufuegen noch entfernen.

Die heutige Umsetzung ist noch nicht konform:

- `viewModel.js` erzeugt teilweise synthetische Shell-Zellen
- geschlossene Shell-Zellen koennen projizierte Innenatome unterdruecken
- Root- und Division-Hilfspfade koennen zusaetzliche Zellformen bilden
- der LaTeX-Pfad konsumiert und rekonstruiert Zellgruppen

Diese Mechanismen bleiben Umsetzungsschuld.
Sie duerfen nicht benutzt werden,
um rote P3-/P4- oder Uebergabevertraege optisch auszugleichen.

## Rolle im Cockpit
- Das offizielle Cockpit startet ab dem 18. Juli 2026 in `index.html` als neue, kleine Huelle.
- Diese Komponente ist nicht mehr das Cockpit selbst, sondern der produktive Renderpfad darunter.
- Kuenftige Cockpit-Regler fuer Abstaende und Farben muessen auf dieselbe Renderkette aufsetzen.
- Es darf keine zweite UI-Wahrheit neben diesem Renderpfad entstehen.

## Aktueller Nutzen
- produktiver Renderpfad unter dem Cockpit v1
- druckbare Zeilenansicht fuer Lehrkraefte
- frei waehlbare Zielvariable ueber denselben Kernvertrag wie in der API
- tolerantere Vorstufe fuer Lehrereingaben, ohne den Kern mit mehreren UI-Sprachen zu belasten
- produktive Bruecke zwischen Kernprojektion, Rendervorbereitung und physischer Spaltenausgabe
