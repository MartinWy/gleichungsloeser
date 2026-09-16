# Prozessmodell und Schalenstandard

Status: normativ
Stand: 10. September 2026

## Zweck

Dieses Dokument trennt zwei Achsen,
die gemeinsam jede Verarbeitung des Gleichungsloesers bestimmen:

1. die Prozesskette aus Modulen mit je genau einer Aufgabe
2. die kanonischen Schalenarten als Situationen innerhalb dieser Aufgaben

Die Trennung verhindert,
dass eine Operationsart zu einem versteckten Parallelprozess wird
oder mehrere Module dieselbe fachliche Entscheidung treffen.

## 1. Verbindliche Begriffe

### 1.1 Prozessschritt

Ein Prozessschritt ist genau eine Aufgabe der Pipeline.
Er besitzt genau ein verantwortliches Prozessmodul.

Beispiele:

- Eingabe semantisch strukturieren
- naechste Umformungsentscheidung waehlen
- gewaehlte Umformungsentscheidung ausfuehren
- globale Inhaltsspuren festlegen
- funktionale Schalengeometrie bottom-up bilden
- bereits bestimmte Projektionsatome ausschreiben
- funktionale in visuelle Geometrie abbilden

### 1.2 Umformungsschritt

Ein Umformungsschritt ist ein algebraischer Zeilenuebergang.
Er ist kein selbststaendiger Prozessschritt der gesamten Pipeline.

`P2` besitzt die Auswahl des Umformungsschritts.
`P3` besitzt seine semantische Ausfuehrung.
Die Runtime-Pipeline besitzt nur die Wiederholung dieser beiden Prozessmodule.

### 1.3 Schalenart und Situation

Eine Schalenart beschreibt eine kanonische semantische Struktur,
zum Beispiel `DIVISION`, `ROOT` oder `ADDITION`.

Eine Situation ist genauer.
Sie entsteht aus expliziten Vertragsmerkmalen wie:

- Schalenart
- Rolle des Zielkindes
- aktiver oder passiver Gleichungsseite
- sichtbarem oder verborgenem Zustand
- vorhandener Herkunft
- aeusserem und innerem Schalenpfad

Eine Situation wird niemals aus Rendertext,
Glyphen,
Pixelpositionen
oder visueller Nachbarschaft rekonstruiert.

### 1.4 Fallregel

Eine Fallregel beschreibt den Umgang genau eines Prozessmoduls
mit genau einer Situation.

Sie besitzt keine Aufgaben anderer Prozessmodule.
Eine P2-Fallregel darf deshalb eine `DIVISION` erkennen und eine Decision liefern,
aber sie darf die `DIVISION` nicht umbauen.

## 2. Das orthogonale Raster

Die Architektur wird als Raster gelesen:

```text
Prozessmodul x Situation -> genau eine Fallregel oder explizite Ablehnung
```

- Die Zeile besitzt die Aufgabe.
- Die Spalte besitzt die intrinsische Schalenwahrheit.
- Die Zelle besitzt nur den Umgang dieser Aufgabe mit dieser Schalenwahrheit.

Dadurch darf dieselbe `DIVISION` nacheinander von mehreren Modulen gelesen werden,
ohne dass mehrere Module dieselbe Frage beantworten:

| Prozessmodul | Eine Frage zur `DIVISION` |
| :--- | :--- |
| `P1_Input` | Welche Eingabeteile bilden Zaehler und Nenner? |
| `P2_Strategy` | Welche Umformungsentscheidung ist fuer den Zielpfad zulaessig? |
| `P3_Transformation` | Wie wird die bereits gewaehlte Decision strukturell umgesetzt? |
| `P4_Projection` | Welche funktionale Geometrie folgt bottom-up aus dieser Struktur? |
| Renderer | Wie werden die gelieferten funktionalen Zellen physisch gezeichnet? |

## 3. Kanonischer Schalenstandard

Jede aktive Schalenart besitzt genau einen kanonischen Schalenstandard.
Er definiert ausschliesslich intrinsische Aussagen dieser Schale.

Jeder Schalenstandard muss mindestens enthalten:

1. eindeutigen Typnamen und fachliche Bedeutung
2. erlaubte Kinderrollen
3. Kardinalitaet und Reihenfolge der Kinder
4. erlaubte Atom- und Unterschalentypen pro Rolle
5. kanonische Verschachtelungsregel von innen nach aussen
6. ID-, Herkunfts- und Lebenszyklusregeln
7. Sichtbarkeitszustaende und deren Bedeutung
8. unveraenderliche Strukturinvarianten
9. explizit ungueltige Formen
10. funktionalen Beitrag der fertigen Kindgeometrie zur Elternschale
11. eigene sichtbare Huelleprimitive, falls vorhanden
12. Beispiele fuer minimale, verschachtelte und ungueltige Instanzen
13. direkt zugeordneten Struktur- und Invariantentest

Der Schalenstandard bestimmt nicht:

- wann diese Schale algebraisch bearbeitet wird
- welche Umformungsentscheidung `P2` waehlt
- wie `P3` eine bestimmte Decision ausfuehrt
- in welchen Pixeln oder Papiermassen ein Renderer zeichnet

Diese Aussagen gehoeren in die jeweils zustaendige Modulrichtlinie.

## 4. Kanonischer Modulstandard

Jede Prozessmodulrichtlinie muss mindestens enthalten:

1. Modulname
2. genau eine als Verb formulierte Aufgabe
3. benannten Vorgaenger
4. versionierten Eingabevertrag
5. benannten Nachfolger
6. versionierten Ausgabevertrag
7. erlaubte Entscheidungen
8. verbotene Entscheidungen
9. explizites Fehlerverhalten
10. Situationsmatrix
11. verantwortlichen Codepfad
12. direkt zugeordneten Modul- und Grenztest

Die Situationsmatrix verwendet mindestens folgende Spalten:

| Situations-ID | Schalenstandard | explizite Vorbedingung | Status | eigene Aenderung | zu erhaltende Invarianten | Fehler |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| stabiler Name | kanonischer Verweis | nur strukturierte Felder | `unterstuetzt`, `durchreichen` oder `zurueckweisen` | nur die Modulaufgabe | alles ausserhalb der Aufgabe | expliziter Code |

Intrinsische Schalenaussagen werden nur referenziert
und nicht in jeder Modulrichtlinie neu erfunden.

## 5. Uebergabegesetz

Jede Modulgrenze besitzt einen expliziten Vertrag.

Es gilt:

```text
Vorgaenger erzeugt Zustand
-> gemeinsame Vertragspruefung
-> Nachfolger empfaengt genau diesen Zustand
```

Die Vertragspruefung besitzt genau eine Implementierung.
Produzent,
Grenztest
und Empfaenger verwenden dieselbe Definition.

Eine erfolgreiche Uebergabe ist vollstaendig.
Eine nicht vollstaendige Uebergabe erzeugt einen expliziten Fehler
und keine fachliche Ersatzausgabe.

Nach der Uebergabe darf der Vorgaenger den Zustand nicht weiter veraendern.
Der Nachfolger darf ihn nicht reparieren,
normalisieren,
vervollstaendigen
oder aus einer anderen Darstellung rekonstruieren.

Die Runtime-Pipeline darf:

- Module in normativer Reihenfolge aufrufen
- die P2/P3-Schleife gemaess Vertrag wiederholen
- einen vertraglich definierten Endzustand erkennen
- Fehler unveraendert nach aussen transportieren

Sie darf nicht:

- semantische Schalen erzeugen oder umhaengen
- eine Zielstruktur normalisieren
- eine Umformungsentscheidung treffen oder korrigieren
- funktionale Geometrie vorberechnen
- fehlende Vertragsdaten ergaenzen

## 6. Deterministische Fallauswahl

Fuer dieselbe gueltige Eingabe liefert ein Prozessmodul
dieselbe gueltige Ausgabe oder denselben expliziten Fehler.

Pro Eingabe gilt:

- genau eine passende Fallregel: Diese Regel wird ausgefuehrt.
- keine passende Fallregel: Der dokumentierte End- oder Fehlerfall wird geliefert.
- mehr als eine passende Fallregel: Die Modulrichtlinie ist mehrdeutig; die Verarbeitung stoppt.

Eine geordnete Regelliste ist nur dann erlaubt,
wenn die Reihenfolge fachlich notwendig ist.
Dann muessen Richtlinie und Test beweisen,
warum fruehere und spaetere Regeln nicht beliebig vertauschbar sind.

Eine technische Prioritaet darf niemals:

- ueberlappende Zustaendigkeiten verbergen
- eine ungueltige Struktur in eine passende Situation umdeuten
- einen unbekannten Fall als bekannten Fall behandeln
- den Fehler einer frueheren Fallregel durch eine spaetere Fallregel uebermalen

## 7. Innen-nach-aussen-Gesetz

Semantische und funktionale Schalen entstehen von innen nach aussen.

1. Die Kinderstruktur ist vollstaendig und gueltig.
2. Die Elternschale referenziert genau diese Kinder in kanonischen Rollen.
3. Bei einer Umformung aendert nur `P3` die semantische Eltern-Kind-Struktur.
4. `P4` verarbeitet die fertigen Kinder vor der Elternschale.
5. Die Elterngeometrie wird aus der bereits fertigen funktionalen Kindgeometrie gebildet.
6. Ein Renderer uebersetzt nur die gelieferten funktionalen Zellen und Huelleprimitive.

Keine aeussere Schicht darf eine fehlende innere Struktur raten.

### 7.1 Geburtslage und Transport eines unveraenderten Blatts

Die semantische Blatt-ID und die funktionale Geburtslage sind zwei getrennte Wahrheiten:

- P1 und P3 besitzen die semantische Identitaet und Schachtelung.
- Das globale P4-Raster besitzt die seitenweite semantische Grundspur.
- Die lokale P4-Geometrie darf einen bereits fertig gebauten Kindblock beim erstmaligen
  Einbau in eine aeussere Schale als Ganzes positionieren.
- Erst nach Abschluss der gesamten aeusseren Schalenfolge einer Gleichungsseite ist
  die absolute funktionale Geburtslage jedes enthaltenen Blatts festgeschrieben.
- Taucht dasselbe sichtbare Blatt mit derselben ID in einer spaeteren Theoriezeile auf
  derselben Gleichungsseite wieder auf, behaelt es diese Geburtslage.
- Wird seine aeussere Schale geoeffnet, bleibt nur das Blatt auf seiner Geburtsspur;
  eine nicht mehr vorhandene Schale wird nicht als leere Geometrie weitergefuehrt.

P3 darf fuer ein einzelnes atomisches Blatt keine `COLLECTION` nur zur Rettung einer
Spalte erfinden. P4 darf umgekehrt keine semantische Transportschale erfinden, sondern
muss die stabile ID als ausreichende Transportidentitaet verwenden.

## 8. Verbindliches Schalenregister

Dieses Register nennt alle derzeit in GenesisRuntime bekannten semantischen Schalenarten.
Die isolierten Standards liegen unter `SHELLS/`.
Familien- und Projektionsvertraege duerfen sie nur anwenden und praezisieren.

| Schalenart | Intrinsische Kernrolle | Vorhandene Wissensquelle | Isolierter Genesis-Schalenstandard |
| :--- | :--- | :--- | :---: |
| `GROUP` | explizite strukturelle Umgrenzung eines Inhalts | `docs/Architecture/FAMILIEN/GROUP_RELEASE.md` | `SHELLS/GROUP.md` |
| `FUNCTION` | benannte Funktionshuelle um Inhalt | trigonometrische und logarithmische Familienvertraege | `SHELLS/FUNCTION.md` |
| `ROOT` | Wurzelhuelle um Radikand und gegebenenfalls Index | `docs/Architecture/WURZEL_VERTRAG_V1.md` | `SHELLS/ROOT.md` |
| `POWER` | Potenzhuelle mit Basisinhalt und Exponent | `docs/Architecture/FAMILIEN/ROOT_POWER.md` | `SHELLS/POWER.md` |
| `NEGATION` | Vorzeichenhuelle um Inhalt | `docs/Architecture/FAMILIEN/NEGATIVE_SIGN_RELEASE.md` | `SHELLS/NEGATION.md` |
| `DIVISION` | geordnete Beziehung von Zaehler und Nenner | `docs/Architecture/BRUCH_VERTRAG_V2.md` | `SHELLS/DIVISION.md` |
| `MULTIPLICATION` | geordnete multiplikative Struktur | Fraction-Birth-Vertraege | `SHELLS/MULTIPLICATION.md` |
| `ADDITION` | geordnete additive Struktur | `docs/Architecture/FAMILIEN/ADDITION_RELEASE.md` | `SHELLS/ADDITION.md` |
| `SUBTRACTION` | gerichtete additive Struktur | Subtraktions-Familienvertraege | `SHELLS/SUBTRACTION.md` |
| `COLLECTION` | P3-Transportschale ohne neue Rechenoperation; keine Eingabeschale | P3-Vertrag und aktueller Runtime-Code | `SHELLS/COLLECTION.md` |

Alle hier registrierten Schalenarten besitzen inzwischen einen isolierten Standard.
Eine Schalenart ist damit dokumentiert, aber erst zusammen mit ihrem Modul- und
Grenzbeweis implementatorisch freigegeben.

Eine weitere Schalenart darf erst in Code oder Vertrag aufgenommen werden,
nachdem dieses Register erweitert
und ihr kanonischer Schalenstandard angelegt wurde.

## 9. Rolle der Familienvertraege

Die Dokumente unter `docs/Architecture/FAMILIEN/`
beschreiben Umformungssituationen ueber mehrere Prozessmodule hinweg.
Sie sind wertvolle Ende-zu-Ende-Szenarien,
aber weder Prozessmodule noch kanonische Schalenstandards.

Sie duerfen:

- eine fachliche Ausgangssituation beschreiben
- die erwartete Umformungsentscheidung nennen
- die erwartete Theoriezeilenfolge als Szenario dokumentieren
- auf die zustaendigen Modul- und Schalenstandards verweisen

Sie duerfen nicht:

- P2-, P3-, P4- und Renderer-Aufgaben in einem Codepfad vereinigen
- intrinsische Schalenregeln widerspruechlich neu definieren
- einen nicht registrierten Zwischenprozess legitimieren
- als Ersatz fuer fehlende Modul- oder Schalenstandards dienen

## 10. Dokumentations- und Baufolge

Fuer jede weitere Bereinigung gilt:

1. Genesis-Grundregel pruefen und gegebenenfalls zuerst berichtigen.
2. Betroffenen kanonischen Schalenstandard anlegen oder berichtigen.
3. Betroffene Modulrichtlinie und Situationsmatrix anpassen.
4. Uebergabevertrag festlegen.
5. Modul-, Situations-, Grenz- und Verbotsfalltests schreiben.
6. Erst danach den genau einen verantwortlichen Codepfad aendern.
7. Direkte Nachbarn und anschliessend den Gesamtfluss pruefen.

Wenn fuer eine geplante Codeaenderung weder eine Modulzeile
noch eine Situationszelle existiert,
stoppt die Codearbeit.
Dann fehlt Dokumentation
oder die Aenderung verletzt die Architektur.
