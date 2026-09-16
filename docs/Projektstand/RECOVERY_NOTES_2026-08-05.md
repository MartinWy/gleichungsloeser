## Recovery Notes 2026-08-05

Zweck dieser Notiz:
Die zuletzt als positiv bewerteten Cockpit-Neuerungen sollen nach dem Ruecksprung auf `HEAD` schnell und regelbasiert wieder eingebaut werden koennen.

### Cockpit: positive Neuerungen

1. Kompaktere Cockpit-Beschriftungen
   - Farbziele kurz halten.
   - Zielvariable als `Ziel`.
   - Zeilen im Lueckentext als `Zeile N`.
   - Aufklappen mit einfachem Pfeil `>` bzw. `v`.

2. Lueckentext ueber ganze Zeilen plus Atome
   - Pro Zeile eine Checkbox.
   - Zeile aufklappbar zu den einzelnen Atomen.
   - Keine Unterstriche oder Platzhalterhilfen fuer Schueler.
   - Export als echte Luecken ueber `\\pFourGap{...}`.

3. Gesuchte Groesse isoliert einfaerbbar
   - Zielvariable als eigener Farb-Target-Typ.
   - Nicht nur ganze Schalen oder ganze Zeilen, sondern die gesuchte Groesse selbst.

4. Klammer-/Delimiter-Einstellungen im Cockpit
   - Wachsende Klammern ueber Cockpit justierbar.
   - Drei Werte waren bereits eingefuehrt:
     - `delimiterStretchThresholdEm`
     - `delimiterStretchPerHeightEm`
     - `delimiterStretchMaxExtraEm`
   - Diese Einstellungen sollten im Cockpit ans Ende, weil sie selten gebraucht werden.

5. Dynamische Klammergroesse im Export
   - Explizite Klammerzellen werden in LaTeX als dynamische Delimiter mit Hoehen-Strut gerendert.
   - Cockpit-Werte muessen die LaTeX-Ausgabe sichtbar aendern.

### Dateien fuer schnellen Wiedereinbau

- `cockpit.js`
  - kompakte Labels
  - Zeilen-/Atomsteuerung fuer Lueckentext
  - einfache Expand/Collapse-Symbole

- `cockpit.css`
  - vereinfachte und uebersichtlichere Cockpit-Darstellung

- `index.html`
  - Reihenfolge der Cockpit-Bloecke
  - Layout/Klammern ans Ende
  - Cache-Buster beim Wiedereinbau mitziehen

- `scripts/cockpit_server.mjs`
  - Server-seitige Ableitung von Farbtargets
  - Lueckentext-Targets
  - Anwendung der Cockpit-Layoutwerte

- `shared/cockpitLayoutSettings.js`
  - Normalisierung und Defaultwerte fuer die drei Delimiter-Einstellungen

- `tests/active/cockpit_layout_settings.test.js`
  - Regressionstest fuer Cockpit-Layoutwerte und Gap-Export

- `tests/active/cockpit_color_targets.test.js`
  - Regressionstest fuer Zielvariable/Farbtargets

### Wiedereinbau-Regeln

1. Projektion bleibt die einzige Wahrheit fuer sichtbare Positionen.
2. Renderer stellt dar, interpretiert aber nicht neu.
3. Versteckte Operatoren duerfen spaeter nicht wieder sichtbar werden.
4. Cockpit darf Darstellung parametrieren, aber keine mathematische Struktur uminterpretieren.
5. Neue Cockpit-Funktionen immer erst mit kleinem Regressionstest absichern.

### Nicht in diese Notiz aufnehmen

- aktuelle Wurzel-/Render-Experimente
- Debug-PDFs
- lokale Zwischenstaende zur Cosinus-/Pythagoras-Reparatur

