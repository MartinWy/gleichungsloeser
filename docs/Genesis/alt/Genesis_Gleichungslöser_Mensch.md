# Genesis Gleichungslöser Mensch

Status: zentrales Handbuch  
Stand: 19. Juli 2026  
Rolle heute: verständliche Bauanleitung und Rekonstruktionsdokument

## 0. Warum dieses Dokument zentral ist
Dieses Dokument soll so gelesen werden, als wäre es vor dem Code geschrieben worden,
auch wenn es tatsächlich aus dem gebauten Projekt rückwirkend herausdestilliert wurde.

Es ist also keine bloße Begleitnotiz.
Es ist die Bauanleitung.

Wenn der gesamte Code verloren ginge, müsste man mit diesem Text,
den Genesis-Kurztexten und den Architekturblättern
das Projekt in kurzer Zeit neu aufbauen können.

Darum beschreibt dieses Dokument nicht nur Prinzipien,
sondern auch die operative Logik:
- wie Eingaben gelesen werden
- wie Schalen erkannt werden
- wie der nächste Schritt gewählt wird
- wie negative Hüllen behandelt werden
- wie Projektion und Positionstreue funktionieren
- wie Vorschau, PDF und Cockpit auf denselben Kern zugreifen

## 1. Das Wesen des Projekts
Der Gleichungslöser ist kein allgemeines CAS und kein Rechner, der nur schnell eine Endform liefert.

Er ist eine Maschine für nachvollziehbare Umformungen.
Sein Auftrag lautet:
- Gleichungen strukturell zerlegen
- genau einen zulässigen Schritt nach dem anderen finden
- diesen Schritt explizit ausführen
- die Sichtbarkeit des Umbaus bewahren
- eine Ausgabe erzeugen, in der ein Mensch die Geschichte des Umformens lesen kann

Das Ziel ist also nicht nur mathematische Korrektheit.
Das Ziel ist mathematische Korrektheit plus lesbare Umbaugeschichte.

## 2. Die wichtigste Leitidee
Der Gleichungslöser arbeitet mit zwei Wahrheiten gleichzeitig:
- mathematische Struktur
- sichtbare Position

Die mathematische Struktur sagt, was etwas ist.
Die sichtbare Position sagt, wo dieses Etwas im Umbau hingehört.

Der wichtigste Satz des ganzen Projekts lautet:

> Was sich algebraisch nicht ändert, darf sich horizontal nicht einfach verschieben.

Deshalb ist Positionstreue keine Kosmetik.
Sie ist Teil des Kernvertrags.

## 3. Wo die eigentliche Wahrheit liegt
Die eigentliche Wahrheit liegt im Kern unter `core/`.

Dort entstehen:
- die atomare Struktur
- die Schrittentscheidung
- die Umformung
- die positionstreue Projektion

Alles andere ist davon abgeleitet:
- Cockpit
- Vorschau
- PDF
- Arbeitsblatt
- spätere Diagnosebilder
- mögliche Film- oder Animationspfade

Die Oberflächen dürfen die innere Wahrheit zeigen,
aber sie dürfen keine zweite Wahrheit erfinden.

## 4. Die Grundbegriffe

### 4.1 Atom
Ein Atom ist die kleinste identitätsstabile Einheit,
die über den ganzen Solve-Lauf wiedererkannt werden soll.

Typische Atome sind:
- Variablen
- Zahlen
- Konstanten
- Operatoren
- Gleichheitsanker

Wichtig:
Ein Atom ist nicht einfach nur ein sichtbares Zeichen.
Es ist eine strukturelle Einheit mit Identität.

### 4.2 Schale
Eine Schale ist eine wirksame Hülle um einen Ausdruck.
Sie bestimmt, was in einem Schritt als Ganzes bearbeitet werden darf.

Typische Schalen sind:
- Gruppenklammern
- Funktionen wie `sin(x)` oder `cos(γ)`
- Potenzen
- Wurzeln
- Negationen
- Divisionen
- Multiplikationen
- Additions- und Subtraktionshüllen

### 4.3 Zielvariable
Der produktive Kern arbeitet pro Solve-Lauf mit genau einer Zielvariablen.

Diese Zielvariable:
- wird entweder automatisch erkannt
- oder explizit vorgegeben

Mehrere Vorkommen derselben Zielvariablen gehören aktuell nicht zum aktiven Kern.
Der heutige Solve-Lauf setzt voraus,
dass die Zielvariable im Ausgangsausdruck genau einmal vorkommt.

### 4.4 Aktive und passive Seite
Aktiv ist immer die Gleichungsseite,
auf der die Zielvariable im aktuellen Zustand liegt.

Alles auf dieser Seite,
was die Zielvariable direkt oder indirekt umhüllt,
bildet den aktiven Arbeitsraum.

Passiv sind dagegen:
- nicht aktive Ausdrucksteile auf derselben Seite
- oder ganze Ausdrucksteile der Gegenseite

### 4.5 Gleichheitsanker
Das Gleichheitszeichen ist der visuelle Anker.
Es hält die linke und rechte Seite zusammen
und stabilisiert die horizontale Ortswahrheit.

### 4.6 Löcher und Emergenz
Wenn eine Schale verschwindet,
verschwindet ihre Spur nicht spurlos.

Darum gibt es:
- `GHOST_HOLE`: hier war vorher etwas
- `EMERGED`: hier wurde etwas freigelegt

Das verhindert magisches Verdichten.

## 5. Die vier Kernphasen

### 5.1 P1 Eingabe
`P1` liest den Eingabestring und baut daraus die kanonische Struktur.

Aufgaben:
- Eingabe normalisieren
- Unicode- und Schreibvarianten auf den Kernstandard zurückführen
- stabile IDs vergeben
- Atome und Schalen anlegen

Wichtige aktuelle Regeln:
- Operatorvarianten wie typografische Minuszeichen oder Multiplikationszeichen werden normalisiert.
- Griechische Buchstaben dürfen als Wort oder Unicode vorkommen.
  Beispiele:
  - `gamma`
  - `γ`
  - `Γ`
- Funktionsnamen wie `sin`, `cos`, `tan`, `asin`, `acos`, `atan` werden als Funktionen erkannt.
- Implizite Multiplikation wird in eine kanonische Struktur überführt, ohne dass die Sichtbarkeit später verloren gehen darf.

### 5.2 P2 Strategie_Analyse
`P2` verändert noch nichts.
Es entscheidet nur, welcher Schritt als Nächstes zulässig ist.

Es beantwortet im Kern:
- Welche ist die äußerste wirksame Schale?
- Wo liegt die Zielvariable?
- Welche Hülle darf als Nächstes bearbeitet werden?
- Welche Umkehrschale ist dafür zuständig?

Wichtig:
`P2` liefert genau eine Familienentscheidung für genau einen Hauptschritt.
Keine Mehrfachschritte.
Keine versteckten Nebenrechnungen.

### 5.3 P3 Umformung
`P3` nimmt die Entscheidung von `P2`
und baut daraus die nächste Theorie-Zeile.

Es tut also das,
was im Schulbuch als „wir formen um“ gesehen wird.

Wichtig:
- `P3` führt die Strukturänderung aus
- `P3` erzeugt inverse Gegenschalen
- `P3` markiert freigelegte Inhalte
- `P3` entscheidet nicht über Layout

### 5.4 P4 Projektion
`P4` macht aus Theorie positionstreue Sichtbarkeit.

`P4` ist kein Mini-Renderer,
sondern ein eigener Kernabschnitt.

Es gibt zwei Durchläufe:
- PreFlight
- Setzlauf

Im PreFlight wird über die ganze Schrittfolge hinweg
eine globale semantische Ortsmatrix vorbereitet.

Im Setzlauf werden dann alle Zeilen
auf genau diese vorbereiteten Orte gesetzt.

## 6. Die operative Datenkette
Der heutige Kern liefert über `GenesisCore.solve(...)` ein Ergebnisobjekt,
das mindestens diese Ebenen enthält:
- Eingabe
- Zielvariable
- finale Struktur
- Schrittfolge
- `exportData`

`exportData` ist besonders wichtig.
Es ist nicht ein optionales Anhängsel,
sondern die verbindliche interne Pflichtausgabe.

Darin stecken:
- Theorie-Zeilen
- Projektionszeilen
- Registrierungen der Atome
- Layoutplan
- Exportprofile

Wer das Projekt neu aufbaut,
muss diesen Gedanken erhalten:

> Nicht die Oberfläche ist die Hauptausgabe des Kerns, sondern die strukturierte Export-Sicht auf dieselbe Wahrheit.

## 7. Schalenlogik: die eigentliche Arbeitslogik

### 7.1 Grundregel
Der Gleichungslöser arbeitet nach dem Zwiebelschalenprinzip.

Das bedeutet:
- immer von außen nach innen
- nur die äußerste wirksame Schale darf im aktuellen Schritt bearbeitet werden
- innere Inhalte bleiben währenddessen geschützt

### 7.2 Schalen sind strukturell, nicht optisch
Ob etwas eine Schale ist,
hängt nicht von seiner sichtbaren Größe ab,
sondern von seiner strukturellen Rolle im aktuellen Schritt.

Ein Ausdruck kann intern komplex sein
und trotzdem für den aktuellen Schritt als geschlossener Hüllenraum gelten.

### 7.3 Sichtbare Shell-Tinte ist nicht die Schale selbst
Die strukturelle Schale entsteht im Kern.
Die sichtbare Tinte dafür entsteht erst später in der Ausgabe.

Beispiele:
- eine Funktion ist im Kern eine `FUNCTION`-Schale
- sichtbar werden später Funktionsname und Funktionsklammern

Das ist wichtig,
damit die Ausgabe keine neue Mathematik erfindet.

## 8. Die Familienlogik des Umformens
Der aktuelle Kern arbeitet produktiv mit klar benannten Schrittfamilien.

Dazu gehören heute:
- `group_release`
- `negative_sign_release`
- `addition_release`
- `subtraction_release`
- `subtrahend_release`
- `fraction_birth`
- `fraction_collapse`
- `fraction_denominator_release`
- `root_power`
- `trig_inverse`
- `inverse_trig`

Nicht jede Familie ist immer gleich oft sichtbar,
aber der Wiederaufbau des Projekts sollte diese Familienstruktur berücksichtigen.

## 9. Was die einzelnen Familien bedeuten

### 9.1 `group_release`
Eine äußere schützende Gruppe wird zunächst expliziert,
bevor ein innerer Umbau stattfinden darf.

Das ist kein mathematischer Selbstzweck,
sondern eine Lesbarkeitsbedingung.

### 9.2 `addition_release`
Ein passiver additiver Ausdrucksteil ohne Zielvariable
wird über die Gegenseite als inverse Subtraktion entfernt.

Wichtig:
Additive Hüllen sind semantisch relevant.
Operativ baut der Kern sie schrittweise ab,
damit jeder sichtbare Umbau einzeln lesbar bleibt.

### 9.3 `subtraction_release`
Ein Ausdruck der Form `x-a`
wird als aktiver Ausdruck minus passiver Term behandelt.

Der passive Term wandert mit inverser Addition auf die Gegenseite.

### 9.4 `subtrahend_release`
Ein Ausdruck der Form `a-x`
ist nicht dasselbe wie `x-a`.

Hier ist der Zielausdruck rechts im Minusausdruck eingebettet.
Darum wird diese Richtung getrennt behandelt.

Das ist wichtig,
weil sich aus dieser Struktur nicht einfach dieselbe Gegenschale wie bei `x-a` ergibt.

### 9.5 `negative_sign_release`
Wenn direkt vor dem aktiven Ausdruck nur ein reines negatives Vorzeichen steht,
also semantisch eine eigenständige Negationsschale,
dann wird dieses Minus als ganze Schale auf die Gegenseite gekippt.

Wichtig:
Das gilt für das nackte Vorzeichen vor dem aktiven Ausdruck,
nicht automatisch für jeden negativen Faktorblock.

### 9.6 `fraction_birth`
Wenn der aktive Ausdruck in einer Multiplikationsumgebung steht
und die Zielvariable nur in einem Teil davon steckt,
dann werden die passiven Faktoren als Nenner aufgebaut.

Der heutige wichtige Entscheid dabei lautet:

> Passive Faktorblöcke werden nicht künstlich atomisiert, wenn sie semantisch gemeinsam bewegt werden müssen.

Beispiel:
`2*a*b*cos(gamma)=10` mit Zielvariable `gamma`

Dann ist `cos(gamma)` die aktive Funktionsschale,
und `2*a*b` ist der passive Faktorblock.
Es wird also nicht zuerst durch `b` und dann durch `a` und dann durch `2` geteilt,
sondern semantisch gemeinsam durch den passenden passiven Block.

### 9.7 `fraction_collapse`
Wenn der aktive Ausdruck bereits sichtbar in einer Division steht
und die Zielvariable im Zähler liegt,
wird der passive Nenner wieder als Faktor aufgebaut.

### 9.8 `root_power`
Wurzel und Potenz sind ein Inversionspaar.

Wenn die Zielvariable unter einer Wurzel liegt,
wird die Wurzel über die passende Potenz beseitigt.

Wenn die Zielvariable in einer Potenzhülle liegt,
wird der Umkehrschritt über die passende Wurzel oder Potenzinversion vorbereitet.

Wichtig:
Der heutige Kern trägt den Inversionsgrad explizit weiter.
Das ist wichtig für transparente Rekonstruktion.

### 9.9 `trig_inverse`
Trigonometrische Funktionen wie `sin`, `cos`, `tan`
werden über ihre inversen Funktionen geöffnet:
- `sin -> asin`
- `cos -> acos`
- `tan -> atan`

### 9.10 `inverse_trig`
Die inversen trigonometrischen Funktionen
werden in die andere Richtung wieder als normale trigonometrische Funktionen behandelt.

## 10. Die entscheidende Negationslogik
Die Negationslogik ist eines der wichtigsten Detailthemen des Projekts.

Sie darf nicht grob als „Minus ist Minus“ behandelt werden.

### 10.1 Nacktes negatives Vorzeichen
Ein nacktes Vorzeichen direkt vor dem aktiven Ausdruck
ist eine Negationsschale.

Beispielhaft:
- `-x = 5`

Hier greift `negative_sign_release`.

### 10.2 Negativer Faktorblock
Ein negativer Faktorblock wie `-2ab`
ist etwas anderes als ein nacktes Minus vor einem einzelnen Zielausdruck.

Wenn die Zielvariable in einer Funktionsschale steckt
und der restliche linke Teil ein passiver negativer Faktorblock ist,
dann darf dieser Block nicht künstlich auseinandergerissen werden.

Beispiel:
`a^2+b^2-2abcos(gamma)=c^2` mit Zielvariable `gamma`

Im entscheidenden Stadium wird daraus links semantisch:
- aktiver Ausdruck: `cos(gamma)`
- passiver Faktorblock: `-2ab`

Die normative Entscheidung lautet:
- das Minus bleibt Teil des passiven Blocks
- der Block wird als gemeinsamer Divisionsblock behandelt
- es wird nicht erst das Minus separat wegmultipliziert und danach noch durch `2ab` geteilt

Der Grund ist einfach:
Sobald `-2ab` strukturell ein gemeinsamer passiver Faktorblock ist,
ist die saubere Inversion die Division durch genau diesen gesamten Block.

### 10.3 Warum das wichtig ist
Wenn man negative Faktorblöcke falsch behandelt,
entstehen typische Fehler:
- Schalen verschmelzen
- Faktorblöcke werden visuell falsch zusammengezogen
- Brüche tragen falsche Spannweiten
- die Schrittfamilie wird mathematisch zwar ähnlich,
  aber didaktisch falsch lesbar

## 11. Addition, Multiplikation und Funktionsschalen
Ein wichtiges Prinzip des aktuellen Systems lautet:

> Was gemeinsam weggeht, muss semantisch auch gemeinsam erkennbar sein.

Das bedeutet:
- zusammenhängende additive passive Zonen müssen als zusammengehöriger Rahmen erkennbar bleiben
- zusammenhängende Faktorblöcke müssen als gemeinsamer passiver Block erkennbar bleiben
- Funktionsschalen wie `cos(gamma)` müssen als eigene wirksame Hülle erhalten bleiben

Welche Schale aktiv ist, hängt also nicht an der sichtbaren Position,
sondern an der Rolle relativ zur Zielvariable.

Beispiel:
In `a^2+b^2-2abcos(gamma)=c^2` mit Zielvariable `gamma` gilt im entscheidenden Stadium:
- `a^2+b^2` ist eine passive additive Zone
- `-2ab` ist ein passiver Faktorblock
- `cos(gamma)` ist die aktive Funktionsschale

Darum darf die Maschine nicht so tun,
als sei einfach nur irgendein sichtbares Stück Text übrig geblieben.
Sie muss wissen, welche semantischen Blöcke gemeinsam verschwinden,
geteilt werden oder in eine inverse Schale kippen.

Gleichzeitig gilt:

> Was gemeinsam behandelt wird, darf in der sichtbaren Projektion trotzdem interne Teilspalten behalten.

Darum kann ein gemeinsamer Faktorblock intern sichtbar bleiben als:
- `2`
- `*`
- `a`
- `*`
- `b`

ohne seine semantische Gemeinsamkeit zu verlieren.

## 12. Positionstreue im Detail
Positionstreue heißt nicht nur:
„alles bleibt ungefähr da“.

Sondern:
- der Gleichheitsanker bleibt stabil
- semantische P4-Spalten werden global über die ganze Schrittfolge vorbereitet
- lokale Optimierung einer Einzelzeile darf die Ortswahrheit nicht überschreiben
- verschwundene Struktur hinterlässt Lochspuren
- freigelegte Struktur wird als emergent markiert

## 13. Zwei Ebenen von Spalten
Der Gleichungslöser trennt streng:

### 13.1 Semantische P4-Spalten
Das sind die eigentlichen Orte der mathematischen Wahrheit.

### 13.2 Physische Display-Slots
Das sind die sichtbaren Plätze für Tinte.

Beispiele für sichtbare Shell-Slots:
- Wurzelhaken
- linke Klammer
- rechte Klammer
- Funktionsname
- Funktionsklammern
- Potenzklammern

Diese sichtbaren Slots dürfen erst in der Ausgabe entstehen.
Sie dürfen nicht rückwirkend die semantische Kernwahrheit verändern.

## 14. Wie Brüche behandelt werden
Brüche sind kein einzelnes Fließtext-Objekt,
sondern topologisch aufgefächerte Strukturen.

Ein sichtbarer Bruch besteht in der Projektion aus:
- Zählerbereich
- Bruchstrich
- Nennerbereich

Wichtige aktuelle Regeln:
- Zähler und Nenner behalten ihre internen Teilspalten
- der Bruchstrich kann eine explizite Spannweite tragen
- freie Gleichungsteile derselben Zeile sitzen auf der Achse des Bruchstrichs
- sichtbare Breite ergibt sich aus der semantischen Breite von Zähler und Nenner, nicht aus einem improvisierten Exporttrick

## 15. Render-Vorbereitung und Ausgabe
Nach `P4` ist die Mathematik nicht mehr offen.
Dann wird nicht mehr „neu gedacht“,
sondern sichtbar gesetzt.

Die heutige Kette lautet grob:
- `viewModel.js`
- `renderKernelCore/`
- `columnLayoutCore/`
- `displayColumnLayout.js`
- `export_projection_pdf_core/latexRendering.js`

Dabei gilt:
- `columnTopology.js` bestimmt sichtbare Shell-Slots
- `columnWidthAtoms.js` bestimmt lokale semantische Inhaltsbreiten
- `columnWidths.js` aggregiert globale Maximalbreiten
- `displayColumnLayout.js` führt beides zusammen
- der Exporter setzt nur noch

## 16. Das Cockpit
Das Cockpit ist die produktive Bedienhülle.

Es sitzt heute vor allem in:
- `index.html`
- `cockpit.js`
- `cockpit.css`
- `scripts/cockpit_server.mjs`

Seine Aufgabe ist:
- Eingabe sammeln
- Zielvariable setzen
- Renderlauf auslösen
- Vorschau zeigen
- PDF verlinken
- Farben und später Abstände steuern

Wichtig:
Das Cockpit ist keine zweite Mathematik.
Es darf keine eigene Solver- oder Layoutlogik aufbauen.

### 16.1 Betriebsform auf dem lokalen Server
Die bisherige Cockpit-Arbeitsform ist:

- lokaler Server auf `127.0.0.1:4173`
- echter Browser-Tab
- Eingabeseite rechts
- gerenderte Produktansicht links
- Gleichung eingeben
- Farben waehlen
- live sehen, ob die sichtbare Ausgabe stimmt

Das ist kein Sondermodus und kein neues Interface.
Das ist die produktive Bedienform des bisherigen Cockpits.

Die operative Anweisung dafuer steht in:
- `../Projektstand/COCKPIT_RENDER_RUNBOOK.md`

### 16.2 Schrittfarben und Spiegelung
Färbung ist im Gleichungslöser keine freie Dekoration,
sondern eine sichtbare Markierung semantischer Umformungskomponenten.

Darum gilt für den Wiederaufbau:
- Färbziele werden aus den Umformungsschritten abgeleitet
- angeboten werden nicht beliebige Zeichenketten,
  sondern semantische Komponenten des jeweiligen Schritts
- die UI liefert nur eine Farbpalette,
  nicht eine zweite Beschreibung der Mathematik

Besonders wichtig ist die Spiegelregel:
Wenn eine Schale über ihre Umkehrschale geöffnet oder geschlossen wird,
müssen beide Seiten desselben Umformungsereignisses gemeinsam einfärbbar sein.

Beispiele:
- `cos(...)` und `acos(...)`
- `sin(...)` und `asin(...)`
- Wurzel und zugehörige Potenz
- ein additiver Wegnahmeterm links und seine inverse Gegenschale rechts

Die Farbe hängt also nicht bloß am gedruckten Wort,
sondern am semantischen Ereignis,
das sich über mehrere Zeilen und beide Gleichungsseiten erstrecken kann.

## 17. Vorschau und `.cockpit-preview/`
Der Ordner `.cockpit-preview/` ist nur ein Arbeitsordner.

Dort landen zur Laufzeit zum Beispiel:
- `current.tex`
- `current.pdf`
- `current.png`

Diese Dateien sind:
- nützlich für die aktuelle Vorschau
- nützlich für Sichtprüfungen
- aber nicht der normative Projektstand

Wenn der Codeverlustfall eintritt,
ist nicht dieser Ordner die Rettung,
sondern die Kombination aus:
- Genesis
- Architekturblättern
- Tests
- produktivem Kernvertrag

## 18. Was unbedingt erhalten bleiben muss
Wenn das Projekt neu gebaut wird,
dürfen diese Entscheidungen nicht verloren gehen:

- der Kern ist die einzige semantische Wahrheit
- der Solve-Lauf trennt Struktur, Strategie, Umformung und Projektion
- `exportData` bleibt Pflichtausgabe
- die Zielvariable ist pro Solve-Lauf eindeutig
- Schalen werden von außen nach innen bearbeitet
- innere Inhalte geschützter Schalen werden nicht heimlich mitumgebaut
- negative Vorzeichen und negative Faktorblöcke werden unterschiedlich behandelt
- passive Faktorblöcke können gemeinsam invertiert werden
- Schrittfarben hängen an semantischen Umformungsereignissen und ihren Spiegelungen
- Positionstreue ist global, nicht zeilenlokal
- sichtbare Shell-Tinte ist nicht gleich semantische Kernbreite
- Cockpit, Vorschau, PDF und Arbeitsblatt müssen denselben Renderpfad benutzen

## 19. Wie man das Projekt neu aufbaut
Wenn das Projekt neu aufgebaut werden müsste,
ist die sinnvolle Reihenfolge:

1. Kernbegriffe festlegen: Atom, Schale, Zielvariable, Gleichheitsanker
2. P1 neu bauen: Eingaben normalisieren, Struktur und IDs erzeugen
3. P2 neu bauen: Familienentscheidungen auf Basis der äußersten wirksamen Schale
4. P3 neu bauen: explizite Umformung ohne Layoutlogik
5. `exportData` als stabile Pflichtausgabe definieren
6. P4 als Zwei-Durchlauf neu bauen: PreFlight und Setzlauf
7. Worksheet-ViewModel neu bauen
8. sichtbare Shell-Topologie und semantische Breite trennen
9. daraus die physische Slot-Karte erzeugen
10. erst danach Vorschau, PDF und Cockpit anbinden

Die wichtigste Regel dabei lautet:

> Nie mit der Oberfläche anfangen.
> Immer mit der semantischen Wahrheit anfangen.

## 20. Was dieses Dokument leisten soll
Dieses Dokument soll einem neuen Menschen im Projekt helfen,
das System schnell zu verstehen.

Es soll aber noch mehr leisten:
Es soll im Notfall als Wiederaufbauplan taugen.

Darum ist die richtige Lesart:
- nicht nur „Was glauben wir gerade?“
- sondern „So ist das System gemeint, so ist es gebaut, und so würden wir es wieder bauen.“

## 21. Merksatz
Der Gleichungslöser soll nicht nur richtig rechnen.
Er soll auch ehrlich, sichtbar und positionstreu zeigen,
was beim Umformen passiert.
