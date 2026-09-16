# Modul 00: Verbindlicher Modulstandard

Status: normativ
Stand: 8. September 2026

## Zweck

Dieses Dokument legt fest,
wann ein Baustein im aktiven Gleichungsloeser als Modul gelten darf.

Ein Modul ist hier ein `Prozessmodul`:
Es uebernimmt den gueltigen Vertragszustand einer festgelegten Vorinstanz,
erfuellt genau eine als Verb formulierbare Aufgabe
und uebergibt einen gueltigen Vertragszustand an eine festgelegte Folgeinstanz.

Eine Operationsart oder Schalenart ist kein Prozessmodul.
Addition, Multiplikation, Bruch, Wurzel und weitere Situationen
werden als Fallregeln innerhalb der jeweils zustaendigen Modulaufgabe beschrieben.

Eine Hilfsdatei ist ebenfalls nicht automatisch ein Modul.
Sie darf dieselbe fachliche Aufgabe technisch zerlegen,
aber weder einen verdeckten Uebergabepunkt
noch eine zweite Zustaendigkeit erzeugen.

Die Regel ist verbindlich:

```text
Richtlinie -> Testvertrag -> Code -> gruener Beweis
```

## Die vier Pflichtteile

### 1. Richtlinie

Jedes Modul besitzt genau eine fuehrende Richtlinie.

Sie benennt mindestens:

- genau eine Aufgabe
- festgelegten Vorgaenger
- versionierten Eingabevertrag
- festgelegten Nachfolger
- versionierten Ausgabevertrag
- erlaubte Entscheidungen
- verbotene Entscheidungen
- explizites Fehlerverhalten
- eine Situationsmatrix fuer alle beanspruchten Schalentypen und Rollen
- den verantwortlichen Codepfad
- den verantwortlichen Testpfad

Die Richtlinie wird vor dem Code erstellt oder angepasst.

### 2. Testvertrag und Test

Jedes aktive Modul besitzt mindestens einen direkt zugeordneten aktiven Test.
Sein Testvertrag wird vor der Implementierung festgelegt.

Der Test muss:

- die eigene Aufgabe des Moduls pruefen
- mindestens eine verbotene Vermischung als Sperre abdecken
- den Eingabe- und Ausgabevertrag an der Modulgrenze pruefen
- jede als unterstuetzt beanspruchte Situation mindestens durch einen positiven Fall beweisen
- Durchreich- und Ablehnungsfaelle getrennt beweisen
- Mehrdeutigkeit als Fehler beweisen, wenn Fallregeln einander ueberlappen koennten
- im Standard-Testlauf registriert sein

Eine Datei unter `tests/active/`,
die nicht vom Standard-Testlauf ausgefuehrt wird,
ist kein wirksamer Beweis.

### 3. Code

Jede in der Richtlinie benannte Aufgabe besitzt genau einen verantwortlichen Codepfad.

Er darf:

- nur die Entscheidungen seines Moduls treffen
- die Eingabe seines Vertrags lesen
- die Ausgabe seines Vertrags erzeugen

Er darf nicht:

- Fehler eines frueheren Moduls verdeckt reparieren
- dieselbe Entscheidung wie ein anderes Modul erneut treffen
- fehlende Vertragsdaten aus Text, Nachbarschaft oder Darstellung erraten
- eine unbekannte Situation ueber einen technischen Fallback als Erfolg ausgeben
- semantische Nebenwirkungen ausserhalb seines benannten Ein- und Ausgangs erzeugen

## Verbindlicher Modulablauf

Jedes Prozessmodul folgt demselben Ablauf:

1. Es erhaelt den Zustand ausschliesslich ueber seinen Eingabevertrag.
2. Die Vertragspruefung akzeptiert den Zustand oder erzeugt einen expliziten Fehler.
3. Das Modul fuehrt genau seine eine Aufgabe aus.
4. Die Situationsmatrix liefert genau eine passende Fallregel.
5. Der Ausgabevertrag ist vollstaendig erfuellt oder es wird keine fachliche Ausgabe erzeugt.
6. Die Ausgabe geht ausschliesslich an den benannten Nachfolger.

Die Vertragspruefung ist ein einheitlicher Uebergabemechanismus,
keine zweite fachliche Aufgabe des Moduls.
Die Gueltigkeitsregel eines Vertrags besitzt genau eine Implementierung,
die Produzent, Grenztest und Empfaenger gemeinsam verwenden.

## Situationsmatrix

Jede Modulrichtlinie fuehrt fuer jede beanspruchte Situation genau einen Status:

- `unterstuetzt`: Das Modul fuehrt seine eigene Aufgabe nach einer benannten Fallregel aus.
- `durchreichen`: Das Modul veraendert den fuer seine Aufgabe irrelevanten Teil nachweislich nicht.
- `zurueckweisen`: Der Eingabevertrag erlaubt diese Situation an dieser Stelle nicht.

Die Situation wird nur aus expliziten strukturierten Vertragsfeldern bestimmt,
zum Beispiel aus Schalentyp,
Kindrolle,
Zielpfad,
Gleichungsseite,
Sichtbarkeit
und Herkunft.

Sie darf nicht aus Rendertext,
Glyphen,
Pixeln
oder benachbarten Zellen geraten werden.

Genau eine Fallregel muss passen.
Keine passende Fallregel ist ein definierter End- oder Fehlerfall.
Mehrere passende Fallregeln sind ein Mehrdeutigkeitsfehler.

Eine Prioritaetsfolge ist nur zulaessig,
wenn ihre Reihenfolge fachlich notwendig,
in der Modulrichtlinie vollstaendig beschrieben
und durch einen eigenen Test bewiesen ist.
Sie darf nicht als Auffangmechanismus fuer ueberlappende Zustaendigkeiten dienen.

## Bezug zu Schalenstandards

Intrinsische Schalenaussagen werden nicht in mehreren Modulrichtlinien wiederholt.
Sie stehen in genau einem kanonischen Schalenstandard.

Die Modulrichtlinie verweist darauf
und beschreibt nur die eigene Aufgabe fuer diese Schale.

Der verbindliche Grundstandard und das Schalenregister stehen in:

- `../PROZESSMODELL_UND_SCHALENSTANDARD.md`

Eine neue Schalenart darf erst im Code auftreten,
nachdem sie dort registriert
und ihr kanonischer Schalenstandard angelegt wurde.

### 4. Gruener Beweis

Ein vorhandener Test ist noch kein erfolgreicher Nachweis.

Darum werden getrennt bewertet:

- Richtlinie vorhanden
- Vorgaenger, Eingabe, Ausgabe und Nachfolger benannt
- Situationsmatrix vollstaendig
- alle referenzierten Schalenstandards vorhanden
- Code vorhanden
- Test vorhanden und registriert
- Test heute gruen

Ein Modul mit rotem Test bleibt aktiv bearbeitbar,
aber es ist nicht freigegeben.

## Aktivierungsregel

Ein Ordner oder eine Fassade darf nur dann als `aktiv` bezeichnet werden,
wenn Richtlinie, verantwortlicher Code und registrierter Test vorhanden sind.

Andernfalls lautet der Status eindeutig:

- `geplant`
- `isolierter Neubau`
- `Migration`
- `Legacy`
- oder `Archiv`

Eine vorbereitete Ordnerstruktur ist noch kein aktives Modul.

## Aenderungsreihenfolge

Bei jeder Verbesserung gilt:

1. Genesis auf neue oder geaenderte Grundprinzipien pruefen
2. Genesis zuerst aktualisieren, wenn die Grundregel noch fehlt
3. lokale Modulrichtlinie aktualisieren
4. Test als Vertragsbeweis erstellen oder anpassen
5. erst dann den verantwortlichen Code aendern
6. Modultest ausfuehren
7. Schutztests der direkten Nachbarn ausfuehren
8. vollstaendigen Standard-Testlauf ausfuehren

## Dokumentenhierarchie

Bei Widerspruechen gilt diese Reihenfolge:

1. `docs/Genesis/Genesis_Gleichungsloeser_Mensch.md`
2. `docs/Genesis/Genesis_Gleichungsloeser_Maschine.md`
3. die Dokumente unter `docs/Genesis/Neustart_2026-07-28/`
4. die fuehrende lokale Modulrichtlinie
5. weitere Architektur-, Status- und Handover-Dokumente

Spaetere Detailvertraege duerfen Genesis praezisieren,
aber nicht unbemerkt aendern.

Wenn ein Detailvertrag eine bessere Grundregel entdeckt,
wird zuerst Genesis berichtigt.
Danach wird der Detailvertrag daran ausgerichtet.

## Ein-Eigentuemer-Regel

Jede fachliche Frage hat genau einen Eigentuemer.

Beispiele:

- Term-Schachtelung: `P1` und bei Umbauten `P3`
- naechster Loeseschritt: `P2`
- globale Spur und funktionale Schalengeometrie: `P4`
- physische Pixel-, em- oder Papierumsetzung: Renderer
- genau ein komplexer Exponenten-Uebergang: `bridge_b`

Wenn zwei Module dieselbe Frage beantworten,
ist die Architektur verletzt.

## Stoppsignale

Die Arbeit am Code stoppt sofort,
wenn eine dieser Situationen eintritt:

- die neue Regel steht noch nicht in Genesis
- das Modul besitzt keine eindeutige lokale Richtlinie
- zwei Codepfade beanspruchen dieselbe Entscheidung
- zwischen zwei benannten Modulen veraendert ein nicht registrierter Hilfspfad fachliche Daten
- eine beanspruchte Situation fehlt in der Situationsmatrix
- eine Schalenart besitzt keinen kanonischen Schalenstandard
- der zugeordnete Test fehlt im Standard-Runner
- ein nachgelagertes Modul soll einen vorgelagerten Fehler ausgleichen
