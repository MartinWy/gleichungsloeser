# Bruch-Vertrag V1

Status: verbindlicher Teilvertrag  
Stand: 2026-09-14

## Zweck

Dieses Dokument fixiert die Regeln fuer sichtbare Brueche.
Es gilt fuer jede sichtbare `DIVISION`-Schale im Kern,
auch wenn sie spaeter Teil von:

- Funktionen
- Klammern
- Wurzeln
- Potenzen
- anderen Bruechen

wird.

Der Vertrag ist absichtlich streng.
Er soll verhindern,
dass Bruchlogik spaeter noch einmal
im Renderer,
im Worksheet,
im PDF-Pfad
oder in einer Spezialansicht nachgebaut wird.

## Minimalvertrag in 6 Regeln

Dieser Abschnitt ist die kuerzeste verbindliche Form des Bruch-Vertrags.
Er ist absichtlich knapp
und soll vor jeder Detaildiskussion gelten.

### M1. Ein Bruch hat genau einen Geburtsmoment

Ein sichtbarer Bruch entsteht genau einmal.

In diesem Moment werden festgelegt:

- Zaehlerkollektion
- Nennerkollektion
- Achsenzeile
- Bruchband
- Ausrichtungsband, falls noetig
- Huelleband
- Innengeometrie

Danach wird diese Geometrie nicht neu erfunden.

### M2. Der Bruchstrich uebernimmt exakt das Bruchband

Der Bruchstrich wird nicht frei gezeichnet
und nicht spaeter optisch geraten.

Er uebernimmt exakt das Band,
das bei der Bruchgeburt fuer diesen Bruch festgelegt wurde.

Nicht erlaubt ist:

- kuenstlich zu kurzer Bruchstrich
- kuenstlich zu langer Bruchstrich
- Ableitung der Strichbreite aus spaeterem Leerraum

### M3. Zentrierung gehoert zur Geburt, nicht in spaetere Phasen

Wenn Zaehler oder Nenner schmaler sind als das Bruchband,
dann wird die Zentrierung genau im Geburtsmoment entschieden.

Nicht erlaubt ist:

- spaetere Preflight-Zentrierung
- spaetere Renderer-Zentrierung
- nachtraegliches horizontales Schieben einzelner Innenatome

### M4. Geschlossene Schalen bleiben als Schalen erhalten

Wenn Zaehler oder Nenner algebraisch nicht geoeffnet werden,
bleiben sie als geschlossene Schalen erhalten.

Sie duerfen als ganze Schalen wandern,
ohne ihre innere Ordnung zu verlieren.

Nicht erlaubt ist:

- spaeteres Zerlegen und Neu-Zusammensetzen
- spaeteres Auffaechern nur aus optischen Gruenden
- Wechsel zwischen Blockdenken und Atomdenken ohne explizite algebraische Oeffnung

### M5. Der Renderer zeichnet nur exportierte Geometrie

Der Renderer darf:

- Striche zeichnen
- Klammern zeichnen
- physische Staerken und Abstaende anwenden

Der Renderer darf nicht:

- Bruchband neu bestimmen
- Bruchmitte neu erraten
- Zaehler und Nenner lokal neu zentrieren
- Innenstrukturen aus Text oder Nachbarraum rekonstruieren

### M6. Verschachtelte Brueche aendern den Grundvertrag nicht

Auch bei Bruch in Bruch gilt derselbe Vertrag:

- der innere Bruch bleibt eigene Bruchschale
- der aeussere Bruch bleibt eigene Bruchschale
- die innere Geometrie bleibt erhalten
- neue aeussere Schalen duerfen nur neue Huelle-Slots hinzufuegen

Begriffe wie `Hauptbruch` und `Nebenbruch`
koennen spaeter als Darstellungsrollen sinnvoll sein,
sind aber nicht noetig,
um die Kernwahrheit des Bruchs zu definieren.

## Begriffe

### 1. Bruchschale

Ein sichtbarer Bruch ist eine eigene Schale mit stabiler Identitaet.

Pflichtidee:

- der Bruch ist kein Text
- der Bruch ist kein nachtraeglich gruppierter Renderblock
- der Bruch ist ein Kernobjekt

### 2. Zaehlerkollektion

Die sichtbaren Atome und Teilschalen oberhalb der Bruchachse,
die zu diesem Bruch gehoeren.

### 3. Nennerkollektion

Die sichtbaren Atome und Teilschalen unterhalb der Bruchachse,
die zu diesem Bruch gehoeren.

### 4. Achsenzeile

Die logische Teilzeile des Bruchs,
auf der der Bruchstrich liegt.

Wenn derselbe Projektionsblock ein `=` enthaelt,
liegt dieses ebenfalls auf seiner Achsenzeile.

### 5. Inhaltsband

Die horizontale Spanne,
die durch den mathematischen Inhalt des Bruchs belegt wird.

Bei einem sichtbaren Bruch ist das die Spanne,
ueber die Zaehler und Nenner mathematisch organisiert sind.

### 6. Ausrichtungsband

Die horizontale Bandwahrheit,
an der Zaehler und Nenner ausgerichtet werden,
wenn ein Bruch entsteht.

Wenn sich Inhaltsband und Ausrichtungsband unterscheiden,
muss der Core diese Differenz explizit exportieren.

### 7. Huelleband

Die gesamte horizontale Spanne der Bruchschale
einschliesslich sichtbarer Schalen-Slots.

Beim einfachen Bruch faellt das in der Regel
mit der Spanne des Bruchstrichs zusammen.

### 8. Innengeometrie

Ein sichtbarer Bruch besitzt zusaetzlich
eine feste Innengeometrie.

Diese Innengeometrie unterscheidet mindestens:

- Zaehlerband
- Nennerband
- Bruchachsenband
- optionale linke oder rechte Huelle-Slots
- optionale Operator-Slots innerhalb von Zaehler oder Nenner,
  wenn dort sichtbare zusammengesetzte Inhalte stehen

Die Innengeometrie gehoert zum Geburtsvertrag des Bruchs.
Sie wird nicht erst im Renderer oder in einer Folgelokalisierung erfunden.

## Verbindliche Regeln

### 1. Geburt genau einmal

Ein sichtbarer Bruch entsteht genau einmal.

In diesem Geburtsmoment muessen im Core festgelegt werden:

- `shellId`
- seine Zaehler- und Nennerzuordnung
- seine Achsenzeile
- sein Inhaltsband
- sein Huelleband
- seine Innengeometrie
- falls noetig sein Ausrichtungsband

Danach wird diese Bruchschale nur noch:

- weitergereicht
- als Ganzes mathematisch bewegt
- oder unsichtbar

Nicht erlaubt ist:

- dieselbe sichtbare Bruchschale spaeter neu zu vermessen
- dieselbe sichtbare Bruchschale spaeter noch einmal neu zu zentrieren
- dieselbe sichtbare Bruchschale spaeter aus ihrer Umgebung zu erraten
- dieselbe sichtbare Bruchschale spaeter intern neu aufzuteilen
- sichtbare Operator-Slots innerhalb ihrer Inhalte spaeter neu zu erfinden

### 1a. Die Bruchgeburt besteht aus genau vier Bauschritten

Wenn ein sichtbarer Bruch entsteht,
geschieht seine Geometrie in genau dieser Reihenfolge:

1. der Core bestimmt Zaehlerkollektion und Nennerkollektion
2. der Core bestimmt daraus das Bruchband
3. der Bruchstrich uebernimmt exakt dieses Bruchband
4. die schmalere Kollektion wird innerhalb dieses Bandes ausgerichtet

Wichtig:

- diese Ausrichtung ist Teil der Bruchgeburt
- sie ist keine Preflight-Verschiebung einzelner Blattspuren
- sie ist keine Spaetkorrektur des Renderers

Nicht erlaubt ist:

- Zaehler- oder Nennerblaetter vor der Bruchgeburt horizontal zu verschieben,
  nur damit der Bruch spaeter schoener aussieht
- linke und rechte Brueche ueber verschiedene Vorstufen zu behandeln
- den Bruchstrich als Vereinigungsmenge aller zufaellig beteiligten Blattspuren zu bauen

### 1b. Preflight ordnet Spuren, aber er zentriert keine Brueche

Der Preflight darf:

- bestehende Spuren lesen
- bestehende Spuren stabil halten
- fuer andere Schaltypen notwendige Mindestabstaende sichern

Der Preflight darf bei `DIVISION` nicht:

- Zaehlerblaetter nachtraeglich auf Nennerzentren ziehen
- Nennerblaetter nachtraeglich auf Zaehlerzentren ziehen
- Bruchzentrierung durch rohe `rawCol`-Manipulation vorwegnehmen

Die Zentrierung eines Bruchs gehoert ausschliesslich in den Geburtsmoment des Bruchs selbst.

### 2. Atome bleiben Atome

Die Atome im Zaehler und im Nenner bleiben echte Atome.

Sie verlieren innerhalb eines Bruchs nicht ihre Identitaet.
Sie duerfen auch innerhalb des Bruchs nicht
in Text oder Rendergruppen aufgeloest werden.

Wichtig:

- ein Bruch darf semantisch als eine Schale weitertransportiert werden
- trotzdem bleiben seine Innenatome projektionell sichtbar und identitaetsstabil
- "als Schale behandelt" bedeutet also algebraische Transporteinheit
  und nicht optische Verdichtung zu einem Einzelblock
- fuer den Renderer wird auch ein geschlossener Bruch nicht als Ausdruck uebergeben,
  sondern als Menge sichtbarer Primitive mit fester Position

### 3. Spalten werden nicht vom Renderer vergeben

Jedes sichtbare Atom des Bruchs bekommt seine Spalte im Core.

Der Renderer darf:

- diese Spalte sichtbar machen
- physische Breiten dafuer verwenden

Der Renderer darf nicht:

- Zaehler oder Nenner lokal nachzentrieren
- einzelne Atome horizontal verschieben
- aus dem Bruch optisch eine neue Mitte ableiten

### 4. Zaehler und Nenner duerfen dieselben Spalten benutzen

Zaehler und Nenner muessen nicht verschiedene Spalten besitzen.

Sie duerfen dieselben globalen Spalten benutzen,
wenn sie logisch ueber verschiedene Teilzeilen getrennt sind.

Die Trennung kommt aus:

- `localRow`
- `axisLocalRow`
- Ober-/Unterzeilen

nicht aus kuenstlich getrennten Horizontalspuren.

Praezisierung:

- wenn der Nenner oder Zaehler vorerst noch eine ungeoeffnete Schale ist, zum Beispiel `sin(alpha)`, dann darf der innere Inhaltskern dieser Schale trotzdem dieselben Bruchspalten wie die Gegenseite benutzen
- die Schalenhuelle wird darum gezeichnet, aber sie darf keine neue zentrale Inhalts-Spur erzwingen
- bereits gemeinsam gesetzte Bruchspalten duerfen spaeter weder im Raster noch in der Lokalisierung wieder auseinandergezogen werden
- wenn eine innere Schale spaeter algebraisch geoeffnet wird, entstehen dabei keine neuen Bruchspalten; sichtbar wird nur eine bereits bestehende Innenordnung

### 5. Bruchstrich gehoert auf die Achsenzeile

Der sichtbare Bruchstrich liegt auf der Achsenzeile des Bruchs.

Wenn ein aeusserer Gleichungsanker im selben Projektionsblock liegt,
muessen `=` und Bruchstrich logisch fluchten.

### 6. Zentrierung ist Kernarbeit

Wenn ein schmalerer Zaehler oder Nenner
innerhalb einer breiteren Bruchspanne mittig stehen soll,
darf das nur im Core entschieden werden.

Diese Zentrierung ist dann keine Spaetkorrektur,
sondern Teil der Geburtsgeometrie des Bruchs.

Danach gilt wieder Durchreichen.

Praezisierung:

- Zaehler- und Nennerblock werden zuerst getrennt und vollstaendig vermessen
- der laengere Block bestimmt das gemeinsame Bruchband und den Bruchstrich
- der kuerzere fertige Block wird als Einheit genau einmal auf dessen Mitte gesetzt
- bei gleicher Breite wird der Nennerblock auf die Mitte des Zaehlerbands gesetzt
- `collectionRanges` beschreiben weiterhin nur die tatsaechlich belegten Zellen
- `collectionAlignmentRanges` beschreiben fuer beide Kinder dasselbe gemeinsame Bruchband
- ein einzelnes kuerzeres Atom bleibt genau ein Display-Atom in genau einer
  funktionalen Zelle; P4 gibt dieser Zelle das gemeinsame Bruchband als
  `colStart`/`colEnd`
- der Renderer bildet diese gelieferten Zellgrenzen allgemein ab und leitet
  weder aus Nachbarzellen noch aus `collectionAlignmentRanges` eine andere
  Atomposition ab

### 7. Eingebettete Brueche behalten ihre eigene Geometrie

Wenn ein Bruch Teil einer groesseren Schale wird,
zum Beispiel Teil von:

- `log(...)`
- `asin(...)`
- einer Klammer
- einer Wurzel
- einem aeusseren Bruch

dann bleibt die innere Bruchgeometrie erhalten.

Die aeussere Schale darf die innere Bruchschale umhuellen,
aber nicht ihre innere Spalten- oder Teilzeilenlogik neu vergeben.

Praezisierung:

- ein innerer Bruch darf unveraendert als Zaehler oder Nenner eines aeusseren Bruchs erscheinen
- ein Funktionsname wie `asin` oder `log` darf sich spaeter um einen schon bestehenden Bruch aufbauen
- dabei entstehen nur neue Huelle-Slots der aeusseren Schale
- die innere Bruchbreite, seine Achsenzeile und seine Innen-Spalten bleiben unberuehrt
- wenn eine bereits geborene Bruchschale spaeter verschoben oder in eine andere aeussere Schale uebernommen wird,
  muessen `contentRange`, `alignmentRange`, `containerRange`, `collectionRanges` und Slot-Spuren
  gemeinsam mit derselben Verschiebung weitergereicht werden
- es ist nicht zulaessig, nur Teile dieser Geometrie zu verschieben
  und andere Baender auf alten Rohkoordinaten stehen zu lassen

### 7a. Geschlossene Nenner- oder Zaehlerbausteine duerfen als Elternbaustein auftreten

Wenn ein zusammengesetzter Ausdruck
im aktuellen Schritt algebraisch nicht geoeffnet wird,
darf er im aeusseren Bruch
als ein einziger Zaehler- oder Nennerbaustein erscheinen.

Beispiele:

- `-2ab`
- `sin(alpha)`
- eine Klammergruppe
- ein bereits bestehender innerer Bruch

Dabei gilt:

- die innere Struktur bleibt semantisch erhalten
- auf Elternebene zaehlt die geschlossene Schale aber als ein einziger Sammelbaustein
- daraus duerfen keine vorsorglich aufgefaecherten Zusatzspalten fuer die Innenatome folgen
- wenn der Baustein spaeter geoeffnet wird, muss seine Innenordnung bereits semantisch vorhanden sein

### 7b. Geschlossene Bausteine behalten ihre innere Geometrie

Wenn ein Zaehler- oder Nennerbaustein als geschlossene Schale transportiert wird,
bleibt seine innere Geometrie erhalten.

Das bedeutet:

- ein innerer Bruch behaelt seine eigene Bruchgeometrie
- eine Funktionsschale behaelt Namensslot, Klammer-Slots und Inhaltsband
- eine Multiplikationsschale behaelt ihre Faktorbausteine und ihre Operator-Slots

Der aeussere Bruch darf diesen Baustein
als einen gemeinsamen Elternbaustein behandeln.

Er darf aber nicht:

- die innere Geometrie dieses Bausteins neu ordnen
- innere Operatoren in Nachbarleerraum aufloesen
- den Baustein spaeter anders zentrieren als bei seiner Geburt

### 8. Schalen-Chrome und Bruchinhalt sind verschieden

Vorzeichen,
Funktionsnamen,
Klammern,
Wurzelhaken
und andere sichtbare Schalenzeichen
duerfen nicht stillschweigend
mit dem inneren Bruchinhalt verwechselt werden.

Darum braucht der Kern mindestens die Unterscheidung:

- Inhalt
- Huelle

und bei Bedarf zusaetzlich:

- Ausrichtung

### 8a. Semantische Inhaltsspalten sind nicht dasselbe wie Shell-Slots

Fuer sichtbare Brueche und ihre eingebetteten Schalen
muessen drei Dinge strikt unterschieden werden:

- semantische Inhaltsspalten
- sichtbare Shell-Slots
- rein physischer Leerraum

#### Semantische Inhaltsspalten

Das sind die echten mathematischen Spalten des Inhalts.

Beispiele:

- `a`
- `b`
- `alpha`
- `beta`
- ein Minuszeichen,
  wenn es als inhaltlicher Teil eines Terms sichtbar ist

Diese Spalten gehoeren zur Ortswahrheit des Core.

Sie duerfen spaeter:

- nicht geloescht werden
- nicht auf Breite `0` schrumpfen
- nicht lokal neu zentriert werden
- nicht durch einen Renderer neu zusammengelegt werden

#### Sichtbare Shell-Slots

Das sind sichtbare Huellelemente,
die sich um bereits vorhandenen Inhalt bauen.

Beispiele:

- Funktionsname `sin`
- linke und rechte Klammer
- Bruchstrich
- Wurzelhaken
- Wurzeloberstrich

Shell-Slots duerfen eigene sichtbare Breite besitzen.
Sie kommen zum Inhalt hinzu,
sie definieren aber nicht automatisch den inneren mathematischen Inhalt neu.

#### Rein physischer Leerraum

Das ist nur sichtbare Luft zwischen bereits feststehenden Slots
oder innerhalb einer einzelnen Display-Zelle.

Dieser Raum darf spaeter physisch schrumpfen,
wenn alle folgenden Bedingungen zugleich erfuellt sind:

- keine semantische Inhaltsspalte verschwindet
- kein Shell-Slot seine semantische Position verliert
- keine Mitte eines Bruchs,
  Zaehlers oder Nenners dadurch neu bestimmt wird
- kein Atom dadurch auf eine andere semantische Spur rutscht

Praezisierung:

- ein Renderer darf physische Breite optimieren
- er darf aber keine semantische Breite uminterpretieren
- eine zu breite Core-Huelle wird nicht dadurch korrekt,
  dass der Renderer sie am Ende optisch zusammendrueckt

Folgerung fuer Brueche:

- wenn ein Zaehler ueber einem Nenner zentriert wird,
  muss sich diese Zentrierung auf das semantische Ausrichtungsband beziehen
- ein ueberbreites Huelleband oder ein zu grob definiertes Shell-Band
  darf nicht stillschweigend als mathematische Mitte missverstanden werden
- wenn innerhalb eines Zaehler- oder Nennerbausteins ein sichtbarer Operator vorkommt,
  zum Beispiel ein Malpunkt,
  dann braucht dieser Operator einen expliziten semantischen Slot
  und darf nicht aus Nachbarbreiten geraten werden

### 9. Renderer zeichnet, aber loest nicht

Renderer, Worksheet und PDF duerfen:

- den Bruchstrich zeichnen
- sichtbare Klammern anhaengen
- physische Strichstaerke bestimmen
- Pixelabstaende und Fontmetriken anwenden

Sie arbeiten dabei aber nur mit sichtbaren Primitiven.

Das heisst:

- sichtbare Bruchinhalte duerfen nicht als Textblock neu zusammengesetzt werden
- ein Renderer darf aus `a`, `b`, `sin`, `(`, `beta`, `)` keinen neuen Ausdruck erraten
- der Renderer darf nur setzen,
  was der Core bereits als sichtbare Primitive geliefert hat

Sie duerfen nicht:

- Zaehler-/Nennerbreite neu interpretieren
- Bruchinhalte in Shells zusammenziehen
- Spalten neu ableiten
- Teilzeilen neu erraten

Praezisierung:

- ein sichtbarer Bruch darf im Renderer nicht als einzelner zusammengeschnuerter `DIVISION`-Block wiederauftauchen, wenn seine projizierten Zaehler-, Nenner- und Achsenzellen bereits vorliegen
- sichtbare Bruchgeometrie wird also durchgereicht, nicht rekonstruiert

### 10. Verschachtelte Brueche bleiben lesbar exportierbar

Auch ein Bruch in einem Bruch
oder ein Bruch in einer Funktion
muss exportierbar bleiben als:

- innere Bruchschale mit eigener Identitaet
- aeussere Schale mit eigener Identitaet
- dieselben Innenatome

Es darf nie nur noch eine optische Grossform uebrig bleiben.

## Pflichtdaten fuer sichtbare Brueche

Ein sichtbarer Bruch braucht im Exportvertrag mindestens:

- `rowId`
- `shellId`
- `side`
- `axisLocalRow`
- `minLocalRow`
- `maxLocalRow`
- `contentColStart`
- `contentColEnd`
- `colStart`
- `colEnd`
- `collectionRanges.numerator`
- `collectionRanges.denominator`

Wenn innerhalb des Bruchs geschlossene sichtbare Bausteine auftreten,
braucht der Exportvertrag zusaetzlich ihre feste Innengeometrie,
mindestens als:

- Inhaltsband
- Ausrichtungsband, falls verschieden
- Huelleband
- sichtbare Operator-Slots, falls vorhanden

Wenn das Ausrichtungsband nicht identisch
mit dem Inhaltsband ist,
braucht der Exportvertrag zusaetzlich explizite Ausrichtungsfelder.

## Verbindlicher Umsetzungsstand

Der aktive Core fuehrt sichtbare Brueche als echte Schalen mit stabiler
Identitaet, getrennten Zaehler- und Nennerkollektionen, eigener Achsenzeile und
eigenem Bruchstrich. Die Geburtsregistry bindet ihre fertige Geometrie an die
Schalen- und Blatt-IDs.

Der Pflichtvertrag fuer jede `DIVISION` umfasst:

1. `collectionRanges.numerator` und `collectionRanges.denominator` als
   tatsaechliche Belegungsbereiche,
2. `collectionAlignmentRanges.numerator` und
   `collectionAlignmentRanges.denominator` als identisches gemeinsames
   Bruchband,
3. den Bruchstrich mit exakt dieser Bandspanne,
4. eine einmalige Blockzentrierung bei der Geburt,
5. unveraenderten Transport der fertigen Geometrie.

Fehlt eines dieser Felder oder stimmt die Bandgleichheit nicht, ist die
P4-Uebergabe unvollstaendig. Writer, Output-Vertrag, Adapter und Renderer duerfen
diese Information weder rekonstruieren noch ersetzen.
