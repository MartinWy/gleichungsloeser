# Genesis Gleichungsloeser Maschine

Status: normativ  
Stand: 19. Juli 2026  
Rolle heute: normative Kurzfassung und Verdichtung

## 0. Grundsatz
Der Gleichungsloeser ist kein allgemeines CAS und kein Optimierer.
Er ist ein Struktur-, Sichtbarkeits-, Projektions- und Ausgabesystem fuer nachvollziehbare algebraische Umformungen.

Er soll nicht "irgendwie loesen",
sondern eine kanonische, atomare und positionstreue Umbaugeschichte erzeugen,
die spaeter von Diagnose, Film oder Arbeitsblatt weiterverwendet werden kann.

## 1. Zentrum des Systems
Das Herz des Projekts liegt unter `core/`.
Nicht UI, nicht Diagnose und nicht Ausgabeformate tragen die Wahrheit,
sondern der Solve-Kern.

Der Solve-Kern muss drei Ebenen zugleich liefern:
1. atomare Struktur der Gleichung
2. logische Umbaugeschichte
3. positionstreue Projektion fuer Darstellung und Export

Alles Weitere ist Ableitung.

Die lesbare Vollbeschreibung liegt heute im Dokument
`Genesis_Gleichungslöser_Mensch.md`.
Diese Maschinenfassung verdichtet denselben Kern auf Vertragsniveau.

Zum heutigen Stand gehoert ausdruecklich:
- `exportData` bleibt Pflichtausgabe des Kerns
- Vorschau, PDF, Arbeitsblatt und kuenftige weitere Medien muessen dieselbe Umbaugeschichte konsumieren
- das Cockpit ist Bedienhülle und nicht zweite mathematische Instanz

## 2. Arbeits- und Darstellungszentrum
- Arbeitszentrum: die Zielvariable und die sie umschliessenden wirksamen Schalen
- Darstellungszentrum: das Gleichheitszeichen als stabiler visueller und topologischer Anker

Diese beiden Zentren duerfen nicht verwechselt werden.
Die algebraische Arbeit richtet sich an der Zielvariable aus.
Die visuelle Invarianz richtet sich am Gleichheitsanker aus.

## 3. Die vier Kernphasen
### P1 Eingabe
- ueberfuehrt den Eingabestring in eine atomare Struktur
- vergibt stabile IDs
- legt Schalen, Operatoren und Anker offen

### P2 Strategie_Analyse
- bestimmt den naechsten zulaessigen strukturellen Schritt
- entscheidet nicht ueber Darstellung
- fuehrt keine Transformation aus

### P3 Umformung
- erzeugt den naechsten Theorie-Zustand
- veraendert Struktur explizit
- laesst unbeteiligte Atomidentitaeten bestehen

### P4 Projektion
- berechnet die positionstreue Setzbasis
- fuehrt PreFlight und Setzlauf durch
- markiert Sichtbarkeitszustaende wie `GHOST_HOLE` und `EMERGED`
- bleibt medienneutral und nicht typografisch

## 4. Die zwei grossen Doppelpasse
Der heutige Gleichungsloeser arbeitet normativ nicht nur in einem,
sondern in zwei logisch getrennten Doppellaeufen.

### A. Kern-Doppellauf
1. `P1` bis `P3` erzeugen die reine Theorie-Folge.
2. `P4 PreFlight` sieht die gesamte Theorie-Folge und legt globale semantische Orte fest.
3. `P4 Setzlauf` setzt danach jede Zeile auf genau diese vorbereiteten Orte.

Folgesatz:

```text
Wenn sich algebraisch nichts aendert,
darf sich der horizontale Ort spaeter nicht aendern.
```

### B. Ausgabe-Doppellauf
1. Die Projektion wird in ein renderbares ViewModel uebersetzt.
2. Die sichtbare Shell-Topologie wird getrennt von den semantischen Breiten bestimmt.
3. Die semantischen Breiten werden ueber den ganzen Loesungsprozess global aggregiert.
4. Erst danach werden beide Welten zu einer physischen Display-Karte zusammengefuehrt.
5. Der Export setzt diese Karte nur noch im gewaehlten Medium um.

Folgesatz:

```text
Sichtbare Shell-Topologie ist nicht dasselbe wie semantische Spaltenbreite.
```

## 5. Die Ontologie der Spalten
Der heutige Vertrag unterscheidet strikt zwischen zwei Ebenen:

### Semantische P4-Spalten
Sie kommen aus dem Kernlauf.
Sie tragen Positionstreue ueber den gesamten Loesungsprozess.

### Physische Display-Slots
Sie kommen erst in der Ausgabe.
Sie tragen sichtbare Tinte und Papierbreite.

Normen:
- semantische P4-Spalten duerfen im Kern nicht verschwinden
- physische Display-Slots duerfen nur in der Ausgabe entstehen
- sichtbare Shell-Tinte darf nicht heimlich in semantische Inhaltsbreite hineingemischt werden

## 6. Sichtbare Shell-Teile
Sichtbare Shell-Teile bekommen eigene Display-Slots,
wenn sie als eigene Tinte Platz brauchen.

Heute verbindlich:
- Wurzelhaken links
- Gruppenklammer links
- Gruppenklammer rechts
- Funktionsname vor dem Argument
- Funktionsklammer links
- Funktionsklammer rechts
- Potenzklammer links
- Potenzklammer rechts zusammen mit Exponent

Diese sichtbaren Teile werden nur dann gesetzt und nur dann breit,
wenn sie in der geschriebenen Darstellung wirklich vorkommen.

Normen:
- die Breite des Bruchs folgt aus Zaehler und Nenner
- Zaehler und Nenner bekommen im Bruch nicht automatisch kuenstliche aeussere Gruppenklammern
- sichtbare Klammern oder Wurzelteile brauchen Raum nur dann, wenn sie wirklich geschrieben werden

## 7. Atomare Wahrheit
Atome sind nicht nur Tokens,
sondern die kleinsten identitaetsstabilen Einheiten der spaeteren Umbaugeschichte.

Normen:
- Atome behalten ihre Identitaet ueber den Solve-Lauf hinweg
- Atome werden nicht heimlich zusammengezogen
- innere Inhalte wirksamer Schalen bleiben waehrend eines Schritts unangetastet
- Sichtbarkeit und Struktur muessen getrennt lesbar bleiben

## 8. Schalenprinzip
Schalen sind strukturelle Huellformen.
Sie folgen dem Zwiebelschalenprinzip:
- von aussen nach innen
- nur die aeusserste wirksame Schale darf im aktuellen Schritt bearbeitet werden
- innere Strukturen bleiben waehrenddessen geschuetzt

Der Solver ist deshalb primaer ein Schalenabbau-System und kein numerischer Rechner.

## 9. Sichtbarkeit, Loecher und Emergenz
Was geschieht, muss sichtbar werden.
Was nicht sichtbar ist, gilt nicht als passiert.

Daraus folgen:
- entfernte Schalen hinterlassen sichtbare Leerstelle
- `GHOST_HOLE` markiert den Ort einer entfernten Struktur
- `EMERGED` markiert freigelegte relevante Elemente
- es gibt kein magisches Verschwinden durch Nachruecken

## 10. Positionstreue
Die wichtigste visuelle Invariante lautet:
Was sich algebraisch nicht aendert, darf sich horizontal nicht bewegen.

Dafuer gelten:
- Spalten bleiben relativ zum Gleichheitsanker stabil
- globale semantische Layoutlogik wird ueber die gesamte Zeilenfolge gebildet
- lokale Zeilenoptimierung darf keine neue Wahrheit erzeugen
- Loecher verhindern heimliches Verdichten
- physische Papierbreite darf am Ende angepasst werden, aber nicht die semantische Ortswahrheit

## 11. Modulare Verantwortung
Der heutige Vertrag ist ausdruecklich modular.
Jede Komponente soll genau das tun, wofuer sie zustaendig ist.

### Kern
- `core/index.js`: orchestriert den Solve-Lauf und baut die kanonische Rueckgabe
- `P1`: Struktur
- `P2`: Strategie
- `P3`: Umformung
- `P4`: semantische Projektion

### Render-Vorbereitung
- `viewModel.js`: uebersetzt Projektionsdaten in ein renderbares Worksheet-Modell
- `renderKernelCore/renderNodeFactory.js`: bildet Renderknoten und Zelltexte
- `renderKernelCore/rowMetrics.js`: bildet vertikale Teilzeilen- und Achsenmetriken
- `renderKernel.js`: bleibt nur oeffentliche Fassade

### Spaltenlayout
Die konkrete Spaltenlayout-Komponente liegt gebuendelt unter:

```text
components/Arbeitsblatt_Druckansicht/columnLayoutCore/
```

Dort gilt:
- `atomWidthCatalog.js`: explizite Liste bekannter Atombreiten
- `columnLayoutProfile.js`: nur Profile, Zahlenwerte und konfigurierbare Abstaende
- `columnTopology.js`: nur sichtbare Shell-Slots
- `columnWidthAtoms.js`: nur lokale semantische Inhaltsbreiten
- `columnWidths.js`: nur globale Maximalaggregation ueber den Loesungsprozess
- `displayColumnLayout.js`: fuehrt sichtbare Shell-Slots und semantische Breiten zur physischen Slot-Karte zusammen

### Export
- der Exporter konsumiert die fertige Slot-Karte
- er darf weder neue semantische Spalten noch neue Breitenregeln noch neue Shell-Topologie erfinden

### Cockpit
Die produktive Bedienhuelle liegt heute in:

```text
index.html
cockpit.js
cockpit.css
scripts/cockpit_server.mjs
```

Normen:
- das Cockpit darf Eingaben sammeln, Renderlaeufe ausloesen und Farben oder Abstaende steuern
- das Cockpit darf keine zweite Solver-Logik aufbauen
- das Cockpit darf keine zweite Layoutwahrheit aufbauen
- Vorschau und PDF muessen aus demselben produktiven Renderpfad kommen
- `.cockpit-preview/` ist nur Laufzeit-Ausgabe und kein normativer Projektstand

## 12. Harte Aenderungsregel
Wenn etwas in sich funktioniert, bleibt es unangetastet,
bis eine neue Anforderung seinen Vertrag erweitert.

Fuer gezielte Aenderungen gilt:
- nur Zahlenwerte aendern: Profil
- neues Einzelatom aufnehmen: Atomkatalog
- neue sichtbare Shell-Spalte einfuehren: Topologie
- lokale Inhaltsbreite aendern: `columnWidthAtoms.js`
- globale Aggregationsregel aendern: `columnWidths.js`
- physische Zusammenfuehrung aendern: `displayColumnLayout.js`

Folgesatz:

```text
Eine gute Aenderung trifft idealerweise genau eine Komponente.
```

## 13. Exportfaehigkeit
Der Kern muss spaeter nicht nur fuer die direkte Anzeige funktionieren,
sondern fuer weitere Verbraucher dieselbe Umbaugeschichte bereitstellen.

Deshalb gehoert zum normativen Zielbild:
- atomare Struktur
- Theorie-Zeilenfolge
- Strategie- und Umbauinformationen
- positionstreue Projektionsdaten
- Ausgabeprofile fuer Film, Arbeitsblatt und Diagnose
- eine steuerbare Cockpit-Huelle, die dieselbe Ausgabe ohne Sonderpfade bedient

Weglassungen fuer Arbeitsblaetter sind nur Ausgabefilter.
Animationen fuer Filme muessen dieselben Atome und dieselbe Umbaugeschichte nutzen.

## 14. Was nicht zum Core gehoert
Nicht Bestandteil des Cores sind:
- numerische Vereinfachung
- algebraische Zieloptimierung
- freie Layoutkosmetik, die Strukturwahrheit veraendert
- eigene Solver-Logik in Diagnose- oder Exportkomponenten
- typografische Sonderregeln als Ersatz fuer fehlende Kernstruktur
- langlebige Vorschauartefakte als Ersatz fuer pruefbaren Code- und Teststand

Zulaessig bleibt nur aesthetische Hygiene,
sofern die interne Struktur und die Identitaet der Atome unveraendert bleiben.

## 15. Harte Verbote
- keine impliziten Nebenoperationen
- keine Mehrfachveraenderung in einem Schritt
- keine ID-Neuerzeugung in spaeteren Phasen
- keine neue Mathematik in `P4`
- keine zweite Wahrheit in UI, Film oder Arbeitsblatt
- kein Nachruecken, das den Umbau unsichtbar macht
- keine sichtbare Shell-Tinte ohne expliziten topologischen Ort
- keine Breitenentscheidung im Exporter, die den Profil- und Layoutvertrag ueberschreibt
- keine Bedienoberflaeche, die den produktiven Renderpfad umgeht

## 16. Bindung an operative Dokumente
Diese Genesis ist normativ.
Die operative Uebersetzung liegt heute insbesondere in:

- `../Architecture/GESAMTPROZESS.md`
- `../Architecture/ARCHITEKTUR_KURZ.md`
- `../Architecture/COLUMN_LAYOUT_PIPELINE.md`
- `../Architecture/LATEX_P4_RENDERING.md`
- `../Architecture/STATE_MODEL.md`
- `../Architecture/EXPORT_MODEL.md`
- `../Step_Semantics.md`

Wenn Genesis und operative Architektur auseinanderlaufen,
muss die Abweichung sichtbar dokumentiert und anschliessend bereinigt werden.
