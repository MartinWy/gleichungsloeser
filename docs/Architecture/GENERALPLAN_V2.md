# Generalplan V2

Status: normatives Zielbild  
Stand: 2026-08-11

## Zweck

Dieses Dokument fasst den aktuellen Zielzustand
in moeglichst wenigen, starken Prinzipien zusammen.

Es soll besser sein als der Vor-Umbau-Stand,
nicht komplizierter.

## Kernidee

Der Loeser arbeitet intern mit:

- Atomen
- Schalen
- geschlossenen sichtbaren Bloecken

Der Core bewegt algebraisch auch ganze Schalen.
Der Renderer bekommt am Ende keine frei zu interpretierenden Ausdruecke,
sondern nur feste Sichtwahrheiten:

- Atome
- geschlossene sichtbare Bloecke
- sichtbare Primitive fuer Schalengeometrie

Damit gilt zugleich:

- Schalen duerfen als Ganze wandern
- sichtbare Struktur darf dabei nicht verloren gehen
- Renderer bauen nie eigene mathematische Struktur auf
- geschlossene Bloecke duerfen sichtbar als Block bleiben,
  ohne ihre innere Atomordnung zu verlieren

## Die vier Hauptprinzipien

### 1. Eine einzige Ortswahrheit

`P4` ist die einzige Ortswahrheit.

Dort werden festgelegt:

- Spalten
- Teilzeilen
- Achsenzeilen
- Inhaltsbaender
- Ausrichtungsbaender
- Huellebaender

Spaetere Module lesen nur.

### 2. Durchreichen statt Neuaufbauen

Alles, was mathematisch nicht bewegt wird,
wird unveraendert in die naechste Zeile weitergereicht.

Es wird spaeter nicht:

- neu gruppiert
- neu zentriert
- neu gemessen
- neu als Block zusammengesetzt

### 3. Geschlossene Schalen sind Transporteinheiten

Geschlossen oder geoeffnet
ist kein Unterschied der Geometrie,
sondern nur des algebraischen Zugriffs.

Das heisst:

- eine geschlossene Schale darf als Ganzes wandern
- ihre Innenatome bleiben trotzdem dieselben Atome
- beim Oeffnen entsteht keine neue Innenordnung
- sichtbar wird nur eine bereits vorhandene Ordnung
- wenn eine geschlossene Schale bereits als sichtbarer Block geboren wurde,
  darf sie auch als sichtbarer Block weitergereicht werden
- dieser Block ist keine algebraische Blackbox,
  sondern nur eine geschlossene Sichtform derselben bekannten Innenatome

### 4. Renderer zeichnen Primitive

Renderer, Worksheet, PDF und Cockpit
zeichnen nur die vom Core gelieferten Sichtwahrheiten.

Dazu gehoeren mindestens:

- Atome
- geschlossene sichtbare Bloecke
- Bruchstriche
- linke und rechte Klammern
- Wurzelhaken
- Wurzeloberstriche
- Funktionsnamen
- Gleichheitszeichen

Der Renderer kennt keine Algebra
und erzeugt keine eigene Struktur.

Das bedeutet konkret:

- er darf Atome direkt zeichnen
- er darf einen vom Core schon definierten geschlossenen Block als Block zeichnen
- er darf aber nie selbst entscheiden,
  welche Atome zusammen einen neuen Block bilden

## Rollen der Hauptkomponenten

### Core A

Der allgemeine Gleichungsloeser.

Aufgaben:

- lesen
- entscheiden
- umformen
- Projektion als Ortswahrheit erzeugen

Nicht seine Aufgabe:

- Pixel- oder Textlayout
- Reparaturlogik fuer spaete Ansichten

### Bridge B

Die Bruecke fuer den Systemwechsel
vom komplexen Exponenten
zum normalen Term.

Aufgabe:

- genau einen Uebergang erzeugen

Nicht ihre Aufgabe:

- allgemeine Gleichungsumformung
- zweiter Renderer
- versteckte A-Sonderlogik

### A1 -> B -> A2

Das Zielbild bleibt:

- `A1` arbeitet bis zur Grenze
- `B` macht genau den Uebergang
- `A2` arbeitet danach wieder mit denselben Regeln wie `A1`

Dabei soll moeglichst derselbe Core genutzt werden.
Der Unterschied zwischen `A1` und `A2`
liegt nicht in verschiedenen Geometriegesetzen,
sondern nur darin,
welche Schalen algebraisch noch geschlossen bleiben.

### Renderer

Renderer setzen nur das um,
was der Core geliefert hat.

Sie duerfen:

- messen
- zeichnen
- globale Sichtparameter anwenden
- geschlossene Kernbloecke als geschlossene Bloecke darstellen

Sie duerfen nicht:

- Struktur erfinden
- Spalten neu vergeben
- Inhalte umzentrieren
- Schalen algebraisch zerlegen oder wieder zusammensetzen
- neue Bloecke aus Atomen erfinden

## Konsequenzen fuer Brueche

Ein Bruch bleibt immer eine Schale mit stabiler Identitaet.

Wichtig:

- Zaehler und Nenner duerfen dieselben Spalten nutzen
- die Trennung kommt aus Teilzeilen,
  nicht aus erzwungenen Zusatzspalten
- geschlossene Nenner- oder Zaehlerbausteine
  bleiben als Schalen erhalten
- beim Einbetten in `log`, `asin`, Klammern oder weitere Brueche
  bleibt die innere Bruchgeometrie erhalten

## Konsequenzen fuer den naechsten Arbeitsschritt

Bevor weiterer Renderer-Code angepasst wird,
muss der aktuelle Core gegen diese Regeln geprueft werden:

1. Liefert `P4` wirklich die einzige Ortswahrheit?
2. Werden geschlossene Schalen nur transportiert,
   statt spaeter neu aufgebaut?
3. Bleiben Innenatome identitaetsstabil?
4. Zeichnet die Arbeitsblattansicht nur Primitive,
   statt selbst Struktur zu interpretieren?

Erst danach lohnt sich die naechste Reparaturrunde.
