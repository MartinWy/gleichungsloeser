# Magna Carta

Status: verbindlich  
Stand: 2026-09-07

## Zweck

Diese Datei ist die feste Prinzipienliste fuer das Projekt.
Sie ist vor jedem Eingriff zu lesen.

Wenn ein Umbau, Fix oder neues Feature einer Regel hier widerspricht,
gilt nicht der schnelle Patch,
sondern die Regel.

## Lesepflicht vor jedem Eingriff

1. `docs/Genesis/Genesis_Gleichungsloeser_Mensch.md`
2. `docs/Genesis/Genesis_Gleichungsloeser_Maschine.md`
3. `docs/Genesis/Neustart_2026-07-28/README.md`
4. `docs/Architecture/MAGNA_CARTA.md`
5. `docs/Architecture/BRUCH_VERTRAG_V2.md` bei jeder Aenderung an Bruechen
6. `docs/Architecture/WURZEL_VERTRAG_V1.md` bei jeder Aenderung an Wurzeln
7. `docs/Architecture/BRIDGE_B_VERTRAG_V1.md` bei jeder Aenderung an `B`

Genesis ist die Bibel des Projekts.
Diese Magna Carta fasst ihre Regeln zusammen,
darf sie aber nicht ueberstimmen.

## Verbindliche Prinzipien

### 1. Regeln statt Sonderfaelle

Es gibt keine Einzelfall-Reparaturen.
Es gibt keine Gleichungs-spezifischen Workarounds.
Jede Aenderung muss als allgemeine Regel formulierbar sein.

### 2. Eine Aufgabe pro Modul

Jedes Modul ist nur fuer genau seine Aufgabe zustaendig.

```text
P1 liest.
P2 entscheidet.
P3 formt um.
P4 erzeugt die einzige funktionale Orts- und Geometriewahrheit.
Renderer, PDF, Cockpit und Film bauen daraus nur visuelle Geometrie.
```

### 3. Eine einzige Ortswahrheit

Es gibt genau eine Ortswahrheit.
Sie entsteht in `P4`.
Spaetere Module duerfen nichts rekonstruieren,
was frueher haette entschieden werden muessen.

### 4. Atome behalten ihre Spalte

Ein Atom behaelt seine Spalte,
solange es nicht durch eine mathematische Operation
auf die andere Seite gestellt oder sonst real bewegt wird.

### 5. Durchreichen statt Neuaufbauen

Alles, was an seiner Stelle bleibt,
wird in die naechste Zeile weitergereicht.
Unveraenderte Atome werden nicht spaeter neu erfunden,
neu gruppiert oder neu positioniert.

### 6. Jede sichtbare Entitaet hat genau einen Geburtszeitpunkt

Jedes sichtbare Atom und jede sichtbare Schale
wird genau einmal eingefuehrt.

Danach wird es nur:

- weitergereicht
- mathematisch bewegt
- als Huelle ueber bereits vorhandenen Atomen benutzt
- oder unsichtbar, wenn es fachlich aufgehoben ist

Was bereits sichtbar vorhanden ist,
darf spaeter nicht noch einmal
als zweite Darstellung derselben Struktur rekonstruiert werden.

### 7. Schalen werden getrennt gesetzt

Wurzelzeichen, Bruchstriche, Klammern und vergleichbare Schalen
werden getrennt von den Atomen gesetzt.

Die Atome im Inneren bleiben echte Atome
und behalten ihre Spalten auch innerhalb von:

- Wurzeln
- Bruechen
- Klammern
- Funktionsargumenten

Die funktionale Schalengeometrie entsteht im Core.
Dazu gehoeren mindestens:

- ihre Inhaltsbreite
- ihre Huellebreite
- ihre obere Teilzeile
- ihre Achsenzeile
- ihre untere Teilzeile

Wenn eine sichtbare Schale neu entsteht,
entsteht auch diese Geometrie im Core
und wird danach nur noch weitergereicht oder mathematisch bewegt.

Wichtig ist die Unterscheidung zwischen:

- semantisch geschlossener Schale
- sichtbar projizierter Schale

Eine semantisch geschlossene Schale ist keine optisch zusammengeschobene Blackbox.
Sie darf in der Umformlogik als Einheit behandelt werden,
waehrend ihre innere Projektionswahrheit sichtbar bleibt.

Das bedeutet:

- Atome innerhalb einer geschlossenen Schale bleiben echte Atome
- ihre Spalten bleiben im Core bekannt
- eine geschlossene Schale ist also Transporteinheit,
  nicht algebraische Blackbox
- geoeffnet und geschlossen sind damit keine zwei verschiedenen Geometrien,
  sondern nur zwei verschiedene algebraische Zustaende
- beim Oeffnen entsteht keine neue Innengeometrie,
  sondern nur neue algebraische Adressierbarkeit

Zusaetzlich gilt:

- was im Core als stabiler sichtbarer Block geboren wird,
  darf als geschlossener Block weitergereicht werden,
  solange diese Schale algebraisch nicht geoeffnet wird
- ein solcher Block behaelt seine innere Atomordnung
  und seine bekannte Ausrichtungs-Spanne
- der Renderer darf ihn dann als geschlossenen Block sichtbar setzen,
  ohne seine Innenatome neu zu verteilen
- beim spaeteren Oeffnen zerfaellt der Block nicht in neu berechnete Geometrie,
  sondern die bereits bekannte Innenordnung wird wieder direkt sichtbar

Damit unterscheiden wir kuenftig sauber zwischen:

- Atomen als Identitaetstraegern
- geschlossenen Bloecken als sichtbaren Transporteinheiten
- sichtbaren Primitiven,
  mit denen der Renderer diese Wahrheiten zeichnet

Wenn eine Schale spaeter geoeffnet wird,
entstehen dadurch keine neuen Innen-Spalten.
Das Oeffnen macht nur wieder algebraisch adressierbar,
was projektionell bereits angelegt war.

Jede sichtbare Schale braucht zusaetzlich
eine feste Innengeometrie.

Diese Innengeometrie beschreibt nicht nur,
dass es Inhalt gibt,
sondern wie dieser Inhalt intern organisiert ist.

Dazu gehoeren je nach Schaltyp mindestens:

- Inhaltsbausteine
- deren innere Spuren oder Sammlungen
- sichtbare Operator-Slots
- gemeinsame Ausrichtungsachsen
- feste Huelle-Slots links und rechts

Wichtig:

- eine Schale darf algebraisch als Ganzes wandern
- ihre Innengeometrie darf dabei aber nicht neu gebaut werden
- weder Core-Folgeschritte noch Renderer duerfen spaeter erraten,
  wo innerhalb der Schale Operator, Inhalt oder Zentrierachse liegen

Beispielhaft gilt das fuer:

- Brueche mit Zaehler-, Nenner- und Bruchachsenband
- Multiplikationen mit explizitem oder implizitem Operator-Slot
- Funktionsschalen mit Namensslot, linker Klammer, Inhaltsband, rechter Klammer

Wenn ein sichtbarer Operator spaeter gebraucht wird,
zum Beispiel ein Malpunkt,
dann braucht dieser Operator eine eigene Spur oder einen eigenen Slot
innerhalb der Schale.

Dieser Slot darf:

- anfangs unsichtbar sein
- spaeter sichtbar werden
- physisch schmal bleiben

Dieser Slot darf nicht:

- spaeter aus Nachbarabstaenden erraten werden
- fremde Inhalts-Spalten verschieben
- lokal im Renderer entstehen

Zulaessig sind jedoch vorbereitete Zukunftsspalten
fuer spaeter auftretende Schalenhuellen,
wenn ihr kuenftiger Geburtsraum
aus der Umbaugeschichte bereits zwingend hervorgeht.

Beispiele:

- eine spaeter noetige aeussere Funktionsklammer
- ein spaeter noetiger inverser Funktionsname links vor bestehendem Inhalt
- eine spaeter noetige aeussere Bruchhuelle
- andere sichere Huelle-Slots,
  die fuer Spurstabilitaet frueh reserviert werden muessen

Nicht zulaessig ist dagegen,
geschlossene Innenatome vorsorglich horizontal aufzufaechern,
wenn sie spaeter gar nicht aus ihrer Schale herausgeloest werden.

Dabei gilt zusaetzlich:

- vorbereitete Zukunftsspalten fuer Schalenhuellen koennen asymmetrisch sein,
  also nur links oder nur rechts des spaeter umhuellten Inhalts entstehen
- der bereits vorhandene Inneninhalt bleibt dabei an seiner Stelle
  und die neue Huelle baut sich spaeter nur darum auf
- eine zusammengesetzte geschlossene Schale,
  zum Beispiel ein Faktor wie `-2ab`,
  darf auf Elternebene als ein einziger Baustein erscheinen,
  solange ihre Innenatome nicht algebraisch freigelegt werden

Nicht erlaubt ist:

- eine sichtbare Schale spaeter noch einmal neu zu vermessen
- eine Schalenhoehe aus Textformen wie `sqrt(...)` oder `f(...)` abzuleiten
- Inneninhalt fuer die Hoehenmessung spaeter noch einmal zu rekonstruieren
- die Innengeometrie einer bestehenden Schale spaeter neu zu synthetisieren
- sichtbare Operatoren spaeter aus Leerraum oder Textzusammenhang abzuleiten

Fuer sichtbare Brueche gilt der praezise Teilvertrag in:

- `docs/Architecture/BRUCH_VERTRAG_V2.md`

Fuer sichtbare Wurzeln gilt der praezise Teilvertrag in:

- `docs/Architecture/WURZEL_VERTRAG_V1.md`

Zusaetzlich gilt fuer alle sichtbaren Schalen:

- der Renderer ist blind
- er liest nur exportierte Band- und Reihenwahrheit
- er darf keine Bruch-, Wurzel-, Klammer- oder Funktionsgeometrie neu herleiten
- er baut ausschliesslich visuelle Geometrie aus der gelieferten funktionalen Geometrie

### 8. Teilzeilen und Achsenzeilen sind Kernvertrag

Ein Projektionsblock besitzt:

- globale Spalten
- lokale Teilzeilen
- genau eine Achsenzeile `axisLocalRow`

Jedes sichtbare Atom kennt mindestens:

- seine Spalte `col`
- seine Teilzeile `localRow`

Jede sichtbare Schale kennt mindestens:

- ihre linke und rechte Spaltengrenze
- ihre obere Teilzeile
- ihre Achsenzeile
- ihre untere Teilzeile

Dabei gilt:

- das Gleichheitszeichen `=` liegt auf der Achsenzeile
- ein aeusserer Bruchstrich derselben Struktur liegt ebenfalls auf dieser Achsenzeile
- hohe Nachbarn derselben Teilzeile vergroessern die Teilzeilenhoehe,
  aber sie verschieben nicht die Achsenlage
- Teilzeilen werden nicht spaeter aus Textbox-Hoehen,
  optischer Mittelung oder Renderer-Heuristik erraten

Wenn eine neue aeussere Schale spaeter um bestehenden Inhalt entsteht,
zum Beispiel eine Funktionsklammer oder ein aeusserer Bruch,
dann bekommt diese neue Schale ihre eigene Huellegeometrie genau in diesem Geburtsmoment.

Dabei gilt:

- der umhuellte Inhalt behaelt sein bisheriges Band
- neue linke oder rechte Huelle-Slots werden als neue Shell-Geometrie erzeugt
- der Inneninhalt wird dafuer nicht neu zentriert, neu gruppiert oder neu verteilt

### 9. Renderer duerfen nichts erfinden

Renderer, Worksheet, PDF und Cockpit duerfen:

- keine neue Struktur erfinden
- keine neuen Spaltenlagen herleiten
- keine Rettungslogik fuer kaputte Vorstufen bauen
- keine Solver- oder Projektionslogik nachspielen

Praezisierung:

- Renderer duerfen die vom Core gelieferte X-Spur eines sichtbaren Atoms nicht veraendern
- Renderer duerfen Inhalte eines Bruchs nicht nachtraeglich auf die Bruchmitte ziehen,
  wenn der Core diesem Inhalt bereits eine Spalte gegeben hat
- Renderer duerfen Klammern, Wurzeln und Bruchstriche nur an die vom Core gelieferte Geometrie anheften,
  nicht aber dadurch den Inneninhalt neu platzieren
- gemeinsame Sichtregeln wie Bruchstrichstaerke sind globale Renderregeln
  und gelten fuer alle Brueche gleich statt pro Einzelfall
- Renderer kennen keine Mathematik,
  sondern nur sichtbare Primitive mit Position
- sichtbare Primitive sind mindestens:
  Atome,
  Bruchstriche,
  linke und rechte Klammern,
  Wurzelhaken,
  Wurzeloberstriche,
  Funktionsnamen
- der Renderer darf keine geschlossene Schale erst zerlegen
- der Renderer darf keine offene Schale spaeter wieder zu einem neuen mathematischen Block verdichten
- der Renderer darf jedoch einen vom Core bereits als geschlossene sichtbare Transporteinheit beschriebenen Block
  als Block zeichnen,
  wenn der Core diese Darstellungsform fuer das konkrete Zeilenauftreten explizit gewaehlt hat,
  solange dabei weder Innenatome neu verteilt
  noch neue mathematische Struktur erfunden wird
- algebraischer Transport ganzer Schalen im Core
  ist daher mit atomarer Identitaet
  und blockweiser Sichtausgabe vereinbar

Ergaenzung zur Breitenlogik:

- semantische Inhaltsspalten entstehen im Core und bleiben bis zum Ende erhalten
- sichtbare Shell-Slots duerfen eigene Breite besitzen,
  ohne neue mathematische Inhaltsspalten zu erzeugen
- rein physischer Leerraum darf spaeter sichtbar schrumpfen,
  aber nur dann,
  wenn dadurch keine semantische Spalte,
  kein Shell-Slot
  und kein Ausrichtungsband umgedeutet wird
- Renderer duerfen also physische Breite optimieren,
  aber keine semantische Breite neu definieren

### 10. Sichtbares gehoert an die richtige Quelle

Wenn etwas sichtbar sein soll,
muss das zustaendige Vor-Modul es explizit liefern.
Spaetere Module duerfen fehlende Wahrheiten nicht kompensieren.

### 11. Cockpit ist Steuerung, nicht Zweitsystem

Das Cockpit ist Arbeitsoberflaeche und Kontrollraum.
Es ist weder ein zweiter Solver
noch ein zweiter Renderer
noch ein Ort fuer lokale Notfalllogik.

Wenn das Cockpit Loesungszeilen ausblendet,
darf es diese Zeilen nicht aus der Kernfolge entfernen.
Die Zeile bleibt mit ihrer Orts-ID,
ihrer Zeilenhoehe
und ihrem Platz in der Zeilenreihenfolge erhalten.

Ausblendung ist nur eine spaete Sichtbarkeitsregel.
Sie unterdrueckt sichtbare Tinte,
aber sie veraendert nicht die Zeilenstruktur.
Nachfolgende Zeilen duerfen dadurch nicht nach oben wandern.

### 12. Tests pruefen Regeln

Tests pruefen keine Lieblingsgleichungen,
sondern Regeln.
Konkrete Gleichungen sind nur Beispiele,
an denen geprueft wird,
ob die Regel wirklich allgemein traegt.

### 13. Neue Prinzipien muessen zuerst hier hinein

Wenn im Projekt eine neue harte Regel entdeckt,
vereinbart oder praezisiert wird,
muss sie in diese Datei aufgenommen werden.
Erst danach oder gleichzeitig darf der Code folgen.

### 14. Migrationen kopieren oder bauen neu

Strukturumbauten duerfen den bisherigen produktiven Pfad
nicht durch Verschieben destabilisieren.

Darum gilt:

- produktive Dateien werden bei einer Migration nicht verschoben
- neue Zielstrukturen entstehen zuerst durch Kopie
- wenn ein alter Baustein sichtbar gebastelt,
  vermischt oder unklar geworden ist,
  wird er nicht uebernommen,
  sondern sauber neu geschrieben

Erst wenn der neue Pfad:

- dokumentiert ist
- getestet ist
- aktiv verdrahtet ist
- und der alte Pfad eindeutig ersetzt werden darf

kann der alte Pfad spaeter archiviert werden.

## Eingriffsprotokoll

Vor jedem Eingriff ist explizit zu klaeren:

1. Welches Modul ist der einzige legitime Ort fuer die Aenderung?
2. Wird hier Struktur rekonstruiert, die frueher entstehen muesste?
3. Bleiben unbewegte Atome in ihrer Spalte?
4. Werden Schalen getrennt von Atomen gesetzt?
5. Ist die Aenderung eine Regel und kein Sonderfall?
6. Welcher Test belegt genau diese Regel?

## Sofortige Stoppsignale

Wenn einer dieser Saetze zutrifft, muss der Eingriff gestoppt werden:

- "Wir flicken das nur schnell fuer diese Gleichung."
- "Der Renderer kann das spaeter noch zurechtbiegen."
- "Wir verschieben das Atom nur optisch."
- "Wir ziehen die Datei einfach rueber."
- "Wir bauen die fehlende Struktur hier unten noch einmal nach."
- "Das bleibt undokumentiert, wir merken uns die Regel einfach."
