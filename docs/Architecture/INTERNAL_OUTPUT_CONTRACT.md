# Internal Output Contract: Zeilenweise positionstreue Pflichtausgabe des Kerns

Status: normativ-operativer Kernvertrag  
Stand: 7. September 2026

## Zweck
Dieses Dokument fixiert die systeminterne Ausgabe des Gleichungsloesers.
Sie ist nicht die spaetere Browser-Ansicht fuer den Menschen,
sondern die maschinell belastbare Kernantwort des Solvers.

Genau diese Ausgabe dient spaeter als Grundlage fuer:
- Diagnose
- Film
- Arbeitsblatt
- visuelle Pruefung
- Fehlerdetektion

Die Ausgabe darf dabei nicht nur lose Atome beschreiben.
Sie muss zusaetzlich ausdruecklich kenntlich machen koennen,
welche sichtbaren Einheiten geschlossene Transporteinheiten sind,
also als Block weitergereicht werden,
ohne ihre innere Atomordnung zu verlieren.

## Grundsatz
Der Gleichungsloeser gilt intern erst dann als korrekt anschlussfaehig,
wenn er eine zeilenweise, atomare und positionstreue Ausgabe liefert.

Das ist kein spaeter UI-Schritt,
sondern Teil der Kernwahrheit des Projekts.

## Pflichtmerkmale
Die interne Ausgabe muss:
- jede Theorie-Zeile explizit enthalten
- jede Projektionszeile explizit enthalten
- den Gleichheitsanker ueber alle Zeilen hinweg stabil halten
- Atome und Schalen ueber IDs wiedererkennbar machen
- sichtbare, versteckte und inverse Rollen lesbar halten
- fuer Film, Arbeitsblatt und Diagnose ohne Neuloesen konsumierbar sein
- die funktionale Geometrie jeder sichtbaren Schale von innen nach aussen vollstaendig liefern
- pro Schalenauftreten die sichtbare Darstellungsform explizit benennen

## Pflichtdaten fuer Projektionsbloecke
Jeder Projektionsblock muss mindestens explizit liefern:
- `rowId`
- `localRowCount`
- `axisLocalRow`

Empfohlen und fuer eindeutige Medienadapter spaeter sehr hilfreich:
- `rowRoles`
- `stackRowStart`
- `stackRowEnd`

Nach Genesis sind diese Angaben fuer sichtbare Schalen nicht mehr nur hilfreich,
sondern Teil des funktionalen Pflichtvertrags.

## Pflichtdaten fuer projizierte Atome
Jedes sichtbare projizierte Atom muss mindestens explizit liefern:
- stabile ID
- `col`
- `localRow`
- `projectionRole`

Diese atomare Wahrheit bleibt immer erhalten,
auch wenn ein spaeteres Medium eine geschlossene sichtbare Transporteinheit
als Block zeichnet.

Wenn eine sichtbare Schale nicht nur punktfoermig,
sondern spannend ist,
muss sie zusaetzlich ihre Spanne explizit liefern,
zum Beispiel ueber:
- `colStart`
- `colEnd`
- `localTopRow`
- `axisLocalRow`
- `localBottomRow`

Wenn eine solche sichtbare Schale spaeter weitergereicht oder seitenverschoben wird,
muessen ihre exportierten Geometriebaender gemeinsam verschoben werden.
Insbesondere duerfen `contentRange`, `alignmentRange` und `containerRange`
nicht auf unterschiedlichen Horizontalstaenden enden.

## Geschlossene sichtbare Transporteinheiten

Wenn eine sichtbare Struktur im Kern als geschlossene Schale bestehen bleibt,
darf der Kern sie zusaetzlich als geschlossene sichtbare Transporteinheit exportieren.

Das bedeutet:
- die innere Atomliste bleibt erhalten
- die innere Atom-Spaltenwahrheit bleibt erhalten
- die sichtbare Einheit bekommt zusaetzlich eine eigene Ausrichtungs-Spanne
- der Renderer darf diese geschlossene Einheit als Block zeichnen,
  ohne ihre innere Struktur neu zu berechnen

Nicht erlaubt ist:
- innere Atome zu verwerfen,
  nur weil der Block geschlossen bleibt
- geschlossene Einheiten spaeter erst im Renderer neu zu erkennen
- geschlossene Einheiten beim Zeichnen algebraisch neu zusammenzusetzen

Der Kern exportiert also kuenftig zwei zugleich gueltige Wahrheiten:
- atomare Innenordnung
- geschlossene sichtbare Blockgeometrie

Zusaetzlich exportiert der Core pro Zeilenauftreten eine explizite Darstellungsform.
Der Renderer nutzt genau diese Form sichtbar,
waehrend die atomare Innenordnung voll erhalten bleibt.

## Teilzeilenvertrag
Die Teilzeilen eines Projektionsblocks sind Kernwahrheit.

Daraus folgt:
- `=` liegt auf der Achsenzeile
- ein aeusserer Bruchstrich derselben Struktur liegt auf derselben Achsenzeile
- Zaehler liegt oberhalb dieser Achse
- Nenner liegt unterhalb dieser Achse
- hohe Nachbarterme derselben Teilzeile vergroessern nur die physische Zeilenhoehe,
  aber sie veraendern nicht die logische Teilzeile des Atoms

## Grenze zwischen Kern und Renderer
Der Kern entscheidet:
- welche Spalte ein Atom hat
- welche Teilzeile ein Atom hat
- welche Spanne eine sichtbare Schale hat
- welche Teilzeile die Achse des Blocks ist
- welches Inhaltsband eine Seite hat
- welches Huelleband eine Seite hat,
  wenn spaetere Schalen links oder rechts vor bestehendem Inhalt Raum brauchen
- welche exportierten Spalten echte semantische Inhaltsspalten sind
- welche exportierten Spuren sichtbare Shell-Slots sind
- wo nur physischer Leerraum zwischen bereits bekannten Spuren liegt

Der Renderer entscheidet:
- wie hoch eine Teilzeile physisch sein muss
- wie Klammern, Wurzeln und Bruchstriche gezeichnet werden
- welche rein physischen Font- und Strichreserven innerhalb bereits gelieferter funktionaler Reihen noetig sind
- wie bereits bekannte Spuren physisch knapp gesetzt werden,
  solange ihre semantische Identitaet unberuehrt bleibt
- wie ein vom Kern bereits definierter geschlossener sichtbarer Block
  physisch als eine Einheit gezeichnet wird

Der Renderer entscheidet nicht:
- welche Teilzeile ein Atom "eigentlich" haben sollte
- wo ein Nenner "schoener" stuende
- ob ein Bruch lokal neu zentriert werden soll
- welche semantische Spanne eine sichtbare Struktur nachtraeglich bekommt
- ob ein spaeteres Huelleband noetig waere;
  das muss bereits aus dem Kernvertrag hervorgehen
- ob eine semantische Inhaltsspalte auf Breite `0` schrumpfen duerfte
- ob ein Huelleband mathematisch als neues Ausrichtungsband gelesen werden sollte
- ob mehrere Atome spontan zu einem neuen geschlossenen Block verschmolzen werden sollen
- welche atomare oder geschlossene Darstellungsform sichtbar sein soll

## Mindestform heute
Der heutige Kernvertrag liegt in `exportData`.
Pflichtbestandteile sind:
- `theoryRows`
- `projectionRows`
- `layoutPlan`
- `atomRegister`
- `projectionAtomRegister`
- `traceIndex`

Diese Felder bilden zusammen die systeminterne Pflichtausgabe.

## Nicht Teil dieses Vertrags
Nicht Teil dieses Vertrags sind:
- eine schoene Browser-Oberflaeche
- benutzerfreundliche Eingabehilfen
- didaktische Reduktion fuer Menschen
- Farben, Animation oder Arbeitsblatt-Inszenierung als fertige Oberflaechenentscheidung

Diese Dinge duerfen spaeter auf derselben Kernantwort aufsetzen.
Sie ersetzen sie nicht.

## Darstellungsfreiheit spaeter
Eine spaetere Anzeige darf:
- Farben oder Hervorhebungen setzen
- physische Strichstaerken, Fontmasse und Medienprofile anwenden
- vom Core ausdruecklich angebotene Darstellungsvarianten auswaehlen

Aber nur unter einer Bedingung:
Die vollstaendige mathematische Struktur bleibt intern erhalten und exportierbar,
und die Anzeige erfindet keine eigene funktionale Sichtbarkeitsentscheidung.

## Architekturfolge
Solange keine offizielle Nutzeransicht existiert,
ist `exportData` bereits die erste pruefbare Sicht des Systems.

Das bedeutet:
- Tests pruefen nicht nur Rechenschritte,
  sondern auch zeilenweise Positionstreue.
- Eine kuenftige UI wird Adapter auf diese Ausgabe.
- Eine spaetere Gestaltungslogik wird dieselben Atome und IDs weiterverwenden.

## Nicht verhandelbare Regel
Wenn spaeter eine schoenere Anzeige gebaut wird,
darf sie niemals verlangen,
dass Theorie-Zeilen, Projektionszeilen oder Layoutdaten aus dem Kern entfernt werden.

Die interne zeilenweise positionstreue Ausgabe ist Pflichtbestandteil des Gleichungsloesers.
