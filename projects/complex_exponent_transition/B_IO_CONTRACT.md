# B IO Contract

Status: Arbeitsvertrag  
Stand: 2026-09-17

## Zweck

Dieses Dokument beschreibt die **konkrete lokale Schnittstelle** von `B`.

Es beantwortet nur diese Frage:

```text
Welche Daten braucht B,
und welche Daten muss B liefern,
damit der Grenzschritt sauber gelingt?
```

## Rolle von B

`B` ist kein allgemeiner Solver.

`B` ist ein **einmaliger Systemwechsel-Schritt**.

`B` bekommt einen gueltigen Grenzzustand
mit einer komplexen Exponentenschale
und liefert genau **eine erste Startzeile**
des neuen Systems.

Boundary und Landing teilen nur die ausdruecklich vereinbarten Identitaeten und
den Gleichheitsanker, nicht das alte POWER-Spaltenraster. Der Wechsel in das
Landing-Termband ist genau eine neue Geburtslage. Die erste A2-Folgezeile darf
danach keinen weiteren Positionssprung ausfuehren.

Explizit unsichtbare P4-Huellezellen bleiben zwar Bestandteil des globalen
Core-Zellprofils, sind aber keine sichtbaren Boundary- oder Landing-Termspuren.
Alle B-Adapter uebernehmen `isVisible` unveraendert und filtern solche Zellen
aus sichtbaren `ordered_cells` und `term_slots`; B darf ihre Sichtbarkeit weder
neu bewerten noch aus ihrem Text ableiten.

Eine Zellidentitaet besteht im Uebergang mindestens aus ihrer stabilen Atom-
oder Schalenreferenz und ihrer lokalen Zeilenlage. Eine blosse numerische
Spaltennummer ist keine Identitaet. Insbesondere duerfen Zaehlerzelle,
Bruchstrich und Nennerzelle in derselben Spalte verschiedener lokaler Zeilen
liegen und nach der Landung dennoch verschiedene Zielspalten besitzen.

Fuer die exklusive Landing-Zeile gilt daher:

- die Durchreicheseite wird atomweise aus der Boundary uebernommen
- Shell-Spannen werden aus den gebundenen Kindidentitaeten abgeleitet
- der neue Funktionskopf, seine optionale Basis und beide Klammern benutzen
  ihre expliziten A2-Profilslots relativ zur unveraenderten Kindschale
- Funktionskopf und Klammern behalten dabei exakt die kanonischen P4-Rollen
  `function_name`, `function_left_paren` und `function_right_paren`; diese
  Rollen duerfen an der Grenze nicht in Darstellungsaliasnamen umgeschrieben
  werden
- nur die geoeffneten Exponentenatome werden auf `term_slots` abgebildet

Eine globale Tabelle `sourceCol -> targetCol`, eine Auswahl unter mehreren
Treffern oder ein nachtraegliches optisches Ausgleichen ist verboten.

## Eingabe von B

`B` arbeitet lokal mit zwei Eingaben:

1. `boundary_state`
2. `landing_profile`

## 1. boundary_state

`boundary_state` beschreibt den letzten gueltigen Zustand
vor dem Systemwechsel.

Minimal gedacht:

```json
{
  "equation_text": "y/a = B^(2x-1)",
  "variant": "left",
  "target_symbol": "x",
  "anchors": {
    "equals": {
      "x": 310
    }
  },
  "power_shell": {
    "side": "right",
    "base_text": "B",
    "content_text": "2x-1",
    "contains_target": true
  },
  "carry_through": {
    "other_side_text": "y/a"
  }
}
```

### Pflichtbedeutung

- `equation_text`
  - rein lesbare Diagnose
- `variant`
  - `left` oder `right`
- `target_symbol`
  - gesuchte Groesse
- `anchors.equals`
  - festes Gleichheitszeichen
- `power_shell`
  - die Exponentenschale,
    die `B` aufbrechen darf
- `carry_through`
  - alles,
    was unveraendert in den neuen Zustand uebergeht

## boundary_state ist nicht nur Text

Fuer `B` reicht ein bloesser Gleichungstext
wie

```text
y/a = B^(2x-1)
```

nicht aus.

`B` muss wissen:

- wo die relevante Schale sitzt
- was ihre Basis ist
- was ihr Inhalt ist
- was davon inhaltlich identisch bleibt
- welche Anker erhalten bleiben muessen

Deshalb gilt:

```text
equation_text ist nur Diagnose.
Die eigentliche Arbeitsbasis von B ist strukturiert.
```

## Vier Schichten von boundary_state

`boundary_state` sollte gedanklich aus vier Schichten bestehen.

### 1. Diagnose-Schicht

Nur zum Lesen,
Debuggen
und Dokumentieren.

Beispiele:

- `equation_text`
- `notes`
- `preview_latex`

Diese Schicht ist hilfreich,
aber fuer `B` nicht hinreichend.

### 2. Semantik-Schicht

Diese Schicht beschreibt,
welche mathematischen Einheiten wirklich vorliegen.

Beispiele:

- linke Seite
- rechte Seite
- relevante Exponentenschale
- Basis der Schale
- Inhalt der Schale
- gesuchte Groesse

Diese Schicht ist fuer `B` zwingend.

### 3. Identitaets-Schicht

Diese Schicht sagt,
welche Inhalte spaeter dieselbe Spur behalten sollen.

Beispiele:

- `B` und `log_B` gehoeren zur selben Operatorgeschichte
- `2x-1` bleibt dieselbe Inhaltsgeschichte
- `y/a` wird durchgereicht

Diese Schicht ist fuer Farbe,
Nachverfolgbarkeit
und Shell-Break relevant.

### 4. Geometrie-Schicht

Diese Schicht beschreibt,
welche festen Anker
oder Mindestinformationen zur Lage schon vorliegen.

Beispiele:

- Position des `=`
- auf welcher Seite die Schale sitzt
- welche Seite durchgereicht wird

Diese Schicht ist fuer `B` ebenfalls zwingend,
damit kein neuer Sprung entsteht.

## Was in boundary_state atomar vorliegen muss

Fuer `B` muessen mindestens diese Informationen
nicht nur als Text,
sondern strukturiert vorliegen:

1. `variant`
   - `left` oder `right`

2. `target_symbol`
   - zum Beispiel `x`

3. `anchors.equals`
   - fester Gleichheitsanker

4. `power_shell.side`
   - auf welcher Seite die relevante Exponentenschale sitzt

5. `power_shell.base`
   - die Basis als eigene Einheit,
     nicht nur als Teil eines Strings

6. `power_shell.content`
   - der Exponenteninhalt als eigene Einheit,
     nicht nur als Teil eines Strings
   - `functional_track_count` ist an der Boundary zwingend `1`
   - `ordered_cells` beschreibt die von P4 gelieferte innere Zellreihenfolge
     dieser einen Spur,
     erzeugt dort aber noch keine normalen Hauptzeilen-Spalten

7. `carry_through`
   - der Teil,
     der mathematisch durchgereicht wird

   Operativ gilt:
   `B` darf den durchgereichten Teil
   nicht aus einer Hilfs-ID allein rekonstruieren.
   Massgeblich ist die reale Boundary-Spur
   auf der carry-through-Seite
   relativ zum festen Gleichheitsanker.

   Die reale Boundary-Spur umfasst dabei Textzellen **und** strukturelle
   P4-Primitiven samt Schalen-Spans. Ein `fraction_line` bleibt trotz fehlendem
   Textwert ein verpflichtender Bestandteil seiner `DIVISION`.

8. `identity_map`
   - welche Geschichten spaeter dieselbe Spur behalten

Fuer jede innere Schale in `power_shell.content` muessen die IDs ihrer Grenzzellen
erhalten bleiben. B setzt deren `shellSpan` in der Landing-Zeile ausschliesslich ueber
die eindeutige Zuordnung dieser Grenzzellen zu den kompakten `term_slots` um.
Ein alter Boundary-Spaltenwert ist dort ungueltig; eine nicht eindeutig zuordenbare
Spannengrenze ist ein Vertragsfehler und kein Anlass zum Raten.

Mehrspaltige Inhaltszellen besitzen dabei drei unabhaengige Geometriewerte:

- `col`: Identitaetsspur des Atoms
- `colStart`: linke Grenze seiner funktionalen Zelle
- `colEnd`: rechte Grenze seiner funktionalen Zelle

B muss alle drei Werte anhand desselben Quell-/Zielatoms exakt abbilden. Es darf
die Identitaetsspur weder aus der Zellmitte neu bilden noch auf eine Zellgrenze
reduzieren. Schalenfelder in `collectionRanges` und
`collectionAlignmentRanges` werden ueber diese exakte Abbildung mitgefuehrt;
sie sind keine Aufforderung an B, eine Bruchausrichtung neu zu berechnen.

## Was nur Diagnose sein darf

Folgende Dinge duerfen rein lesbar
und nicht operativ sein:

- `equation_text`
- freier Kommentar
- Exporttitel
- Bildschirmvorschau
- gerenderte Latex-Zeichenkette

Wenn nur diese Diagnose-Daten vorliegen,
ist `B` noch nicht arbeitsfaehig.

## Empfohlene strengere Form von boundary_state

Arbeitsnah gedacht koennte `boundary_state`
spaeter eher so aussehen:

```json
{
  "equation_text": "y/a = B^(2x-1)",
  "variant": "left",
  "target_symbol": "x",
  "anchors": {
    "equals": { "x": 310 }
  },
  "power_shell": {
    "shell_id": "power_1",
    "side": "right",
    "base": {
      "id": "base_B",
      "text": "B",
      "role": "operator_source"
    },
    "content": {
      "id": "exp_content_1",
      "text": "2x-1",
      "contains_target": true,
      "functional_track_count": 1,
      "ordered_cells": [
        { "id": "exp_1", "text": "2", "role": "content" },
        { "id": "exp_2", "text": "*", "role": "content" },
        { "id": "exp_3", "text": "x", "role": "target" },
        { "id": "exp_4", "text": "-", "role": "content" },
        { "id": "exp_5", "text": "1", "role": "content" }
      ]
    }
  },
  "carry_through": {
    "side": "left",
    "text": "y/a",
    "group_id": "carry_group_1"
  },
  "identity_map": {
    "operator_story": ["base_B", "log_B"],
    "content_story": ["exp_content_1", "rhs_content_1"]
  }
}
```

## Minimalentscheidung fuer B

Wenn wir spaeter Daten einsparen wollen,
sollte die Sparregel nicht lauten:

```text
so wenig wie moeglich
```

sondern:

```text
so wenig Diagnose wie moeglich,
aber so viel Struktur wie noetig
```

Denn `B` ist klein,
aber nicht blind.

## 2. landing_profile

`landing_profile` beschreibt,
wie die **erste Zeile des neuen Systems**
gesetzt sein muss.

Es ist **keine Algebra**,
sondern ein Zielraster.

Minimal gedacht:

```json
{
  "system_id": "A2",
  "variant": "left",
  "equals_anchor_x": 310,
  "term_side": "right",
  "term_zone": {
    "x": 436,
    "width": 220
  },
  "term_slots": [
    { "role": "content_1", "x": 466 },
    { "role": "content_2", "x": 514 },
    { "role": "content_3", "x": 570 },
    { "role": "content_4", "x": 616 },
    { "role": "content_5", "x": 664 }
  ],
  "source_exponent_track_count": 1,
  "no_second_jump": true
}
```

### Pflichtbedeutung

- `system_id`
  - Zielsystem nach der Grenze
- `variant`
  - links oder rechts
- `equals_anchor_x`
  - feste Ankerposition
- `term_side`
  - wohin der geoeffnete Inhalt landet
- `term_zone`
  - reservierter Zielraum
- `term_slots`
  - die echten Zielspalten des ersten Solverzustands
- `source_exponent_track_count`
  - muss `1` sein: B oeffnet genau eine geschlossene Exponentenspur
  - die Zahl der `term_slots` muss exakt der Zahl der sichtbaren
    diskret spaltentragenden `ordered_cells` in dieser Spur entsprechen
- `no_second_jump`
  - Garantiewunsch:
    nach der Landung keine neue Repositionierung

## Vollstaendige Durchreichung in die Landing-Zeile

Wenn die Durchreicheseite eine fertige Schale enthaelt, muss B sie als
funktionale Einheit in das zeilenlokale Raster des `landing_profile` uebernehmen.
Bei einer `DIVISION` bedeutet das genau:

```text
Zaehler + fraction_line + Nenner + DIVISION-shellSpan
```

Erzeugt B darum eine inverse `FUNCTION`, muss deren Schalen-Span die komplette
Kindgeometrie umfassen. Atome aus dem Boundary-Raster und Schalen-Spans aus dem
Landing-Raster duerfen nicht unveraendert miteinander vermischt werden.

Sichtbarer Text ist kein Filterkriterium fuer strukturelle P4-Primitiven.
Der Renderer erhaelt die vollstaendige funktionale Geometrie und darf fehlende
Linien oder Klammerumfaenge weder ergaenzen noch erraten.

## landing_profile ist kein Vorschaubild

Fuer `B` reicht es nicht,
wenn `A2` nur indirekt andeutet,
wie die erste neue Zeile ungefaehr aussehen koennte.

`landing_profile` ist deshalb:

```text
kein Bild,
keine Textnotiz,
keine zweite Gleichung,
sondern ein strukturiertes Zielprofil
```

Es beschreibt,
wie `A2` seine **erste echte Startzeile**
gesetzt haben will.

Die Spurzahlen vor und nach B sind bewusst nicht identisch:

```text
boundary_state: eine geschlossene Exponentenspur `2*x-1`
landing_profile: fuenf atomare Slots `2`, `*`, `x`, `-`, `1`
```

Die inneren P4-Zellen der Boundary-Spur sind Identitaets-, Schalen- und
Reihenfolgedaten. Sie sind keine alten A2-Spalten und duerfen nicht als solche
weitergetragen werden. Beim Oeffnen werden genau diese gelieferten Zellen auf
die neuen Slots gesetzt; eine innere Schale wird dabei nicht aus Text erraten.

## landing_profile ist die Forderung von A2 an B

`boundary_state` sagt:

```text
Von hier komme ich.
```

`landing_profile` sagt:

```text
Hier musst du mich absetzen.
```

Damit ist `landing_profile`
nicht Diagnose,
sondern ein echter Anschlussvertrag.

## Vier Schichten von landing_profile

Auch `landing_profile`
sollte gedanklich in Schichten beschrieben werden.

### 1. Diagnose-Schicht

Nur zum Lesen und Debuggen.

Beispiele:

- `system_id`
- `preview_equation`
- `notes`

Hilfreich,
aber fuer `B` allein nicht ausreichend.

### 2. Anker-Schicht

Diese Schicht beschreibt,
welche Positionen nicht mehr rutschen duerfen.

Beispiele:

- `equals_anchor_x`
- feste Startkante des Zielraums
- feste Seite des Terms

Diese Schicht ist fuer `B` zwingend.

### 3. Slot-Schicht

Diese Schicht beschreibt die echten Zielspalten
der ersten Solverzeile.

Beispiele:

- `term_zone`
- `term_slots`
- reservierte Breite fuer `log_B(y/a)`

Diese Schicht ist fuer `B` zwingend.

### 4. Fortsetzungs-Schicht

Diese Schicht beschreibt,
welche Anschlussgarantie der neue Solver verlangt.

Beispiele:

- `no_second_jump`
- erste Zeile ist schon Solver-Startlage
- kein nachtraegliches Nachruecken noetig

Auch diese Schicht ist fuer `B` zwingend.

## Was in landing_profile atomar vorliegen muss

Fuer `B` muessen mindestens diese Informationen
strukturiert und nicht nur textlich vorliegen:

1. `variant`
   - links oder rechts

2. `equals_anchor_x`
   - fester Gleichheitsanker

3. `term_side`
   - auf welcher Seite der geoeffnete Inhalt landen soll

4. `term_zone`
   - reservierter Zielraum

5. `term_slots`
   - die echten Zielspalten des ersten Solverzustands

6. `carry_through_side`
   - auf welcher Seite der durchgereichte Ausdruck stehen wird

7. `carry_through_zone`
   - Mindestbereich fuer den durchgereichten Ausdruck

8. `no_second_jump`
   - Anschlussgarantie fuer die erste echte Solverzeile

9. `function_shell_slots`
   - bei einer neu entstehenden inversen Funktion die exakten A2-Zellen fuer
     Funktionsname, optionalen vollstaendigen Basisblock, linke Klammer und rechte Klammer
   - diese Zellen stammen aus der echten P4-Projektion der Landing-Zeile
   - ein zusammengesetzter Diagnosekopf wie `log_3` ist kein Zellinhalt
   - B darf diese Zellen nicht relativ zur Durchreichespanne neu anordnen
   - ein mehratomiger `baseContent`-Block wird samt Operatoratomen und inneren
     Huelleprimitiven vollstaendig uebernommen; sichtbare Atomtexte duerfen nicht
     zu einer vermeintlichen Basisformel zusammengesetzt werden
   - der Diagnosekopf wird ausschliesslich gegen die semantische `FUNCTION` der
     A2-Theoriezeile verifiziert, nicht gegen eine Textrekonstruktion aus P4-Zellen

## Was nur Diagnose sein darf

Rein diagnostisch bleiben duerfen:

- `preview_equation`
- freie Kommentare
- ein Titel fuer die Variante
- eine Render-Vorschau
- ein Screenshot oder Preview-Latex

Wenn nur diese Diagnose-Daten vorliegen,
ist `B` noch nicht arbeitsfaehig.

## Empfohlene strengere Form von landing_profile

Arbeitsnah gedacht koennte `landing_profile`
spaeter eher so aussehen:

```json
{
  "system_id": "A2",
  "variant": "left",
  "preview_equation": "log_B(y/a) = 2x-1",
  "equals_anchor_x": 310,
  "term_side": "right",
  "carry_through_side": "left",
  "carry_through_zone": {
    "x": 40,
    "width": 236
  },
  "term_zone": {
    "x": 436,
    "width": 220
  },
  "term_slots": [
    { "role": "content_1", "x": 466 },
    { "role": "content_2", "x": 514 },
    { "role": "content_3", "x": 570 },
    { "role": "content_4", "x": 616 }
  ],
  "stories": {
    "operator_target": {
      "text": "log_B",
      "side": "left"
    },
    "content_target": {
      "text": "2x-1",
      "side": "right"
    }
  },
  "no_second_jump": true
}
```

## Minimalentscheidung fuer A2

Wenn `A2` spaeter ein `landing_profile` exportiert,
sollte die Sparregel nicht lauten:

```text
ich liefere nur eine Vorschaugleichung
```

sondern:

```text
ich liefere die kleinste moegliche Struktur,
mit der B sicher landen kann
```

## Warum das wichtig ist

Wenn `landing_profile` zu weich bleibt,
passiert fast sicher einer dieser Fehler:

- `B` muss Zielgeometrie erraten
- `B` erzeugt eine falsche erste Startlage
- `A2` muss nach der Landung noch einmal umsetzen

Genau das wollen wir vermeiden.

## Ausgabe von B

`B` liefert genau eine Ausgabe:

1. `landing_state`

## landing_state

`landing_state` ist die **erste echte Zeile**
des neuen Systems.

Dabei gilt ausdrucklich:

```text
landing_state ist kein abgeschnittenes A1-Raster.
landing_state ist schon die echte erste Lage von A2.
```

Deshalb:

- keine kuenstlich freigehaltenen Leer-Spalten
- keine mechanische Fortsetzung alter Spaltenreste
- keine Abstaende,
  die nur aus dem frueheren Exponentenraster stammen

Minimal gedacht:

```json
{
  "equation_text": "log_B(y/a) = 2x-1",
  "variant": "left",
  "anchors": {
    "equals": {
      "x": 310
    }
  },
  "stories": {
    "operator": {
      "source": "B",
      "target": "log_B",
      "color_role": "blue"
    },
    "content": {
      "source": "2x-1",
      "target": "2x-1",
      "color_role": "orange"
    }
  },
  "layout": {
    "term_zone_x": 436,
    "term_slots": [466, 514, 570, 616]
  },
  "step_meta": {
    "operation_type": "power_shell_break",
    "display_text": "log_B"
  }
}
```

### Pflichtbedeutung

- `equation_text`
  - Diagnoseform der ersten neuen Zeile
- `anchors`
  - feste Ankerlage
- `stories`
  - welche Identitaet farblich mitgetragen wird
- `layout`
  - tatsaechliche Solver-Startlage
  - ohne kuenstliche Leer-Spalten aus dem Vorzustand
- `step_meta`
  - spaetere Dokumentation
    hinter dem Ordnungsstrich

## Zusatzzwang fuer geschlossene Durchreich-Schalen

Wenn die durchgereichte Seite am Grenzschritt bereits
eine sichtbare Schale ist,
zum Beispiel:

- ein Bruch
- eine Klammergruppe
- eine Funktionsschale

dann gilt fuer `B`:

- diese Schale bleibt als bestehende Schale erhalten
- `B` darf nur eine neue aeussere Operatorschale darum bauen
- die innere Schale wird dabei nicht geoeffnet,
  nicht neu zentriert
  und nicht intern neu verteilt

Beispielmuster:

```text
Bruchschale  ->  log_B(Bruchschale)
```

und nicht:

```text
Bruchschale  ->  log_B(lose neu verteilte Einzelteile)
```

## Zusatzzwang fuer den Exponenteninhaltswechsel

Der fruehere Exponenteninhalt wechselt im Grenzschritt
aus dem Exponentenmodus in den normalen Termmodus.

Darum gilt fuer `landing_state`:

- derselbe Inhalt bleibt dieselbe Geschichte
- aber er erscheint bereits in Grundgroesse
- und auf normaler horizontaler Ebene

`A2` bekommt also keinen verkleinerten Exponentenrest,
sondern bereits normalen Terminhalt.

## Keine Reservierung hypothetischer Zukunftsspalten

`B` darf keine kuenstlichen Zusatzspalten anlegen,
nur weil ein innerer Inhalt theoretisch spaeter
einmal geoeffnet werden koennte.

Wenn eine geschlossene Schale im Folgepfad geschlossen bleibt,
genuegt:

- stabile semantische Innenstruktur
- stabile Huelle
- stabile Anschlusslage
- keine eigenen Zukunftsspalten fuer Innenatome,
  wenn diese nie von ihrer Schale getrennt werden

Nicht erlaubt ist:

- vorsorgliches Auffaechern fuer hypothetische spaetere Einzelschritte
- Weitertragen alter Exponentenabstaende in die erste normale Solverzeile

## Anschlussfolge fuer den ersten normalen Folgeschritt

Die von `B` gelieferte Startlage muss so gebaut sein,
dass der erste echte Folgeschritt von `A2`
ohne zweite Positionskorrektur moeglich ist.

Wenn `A2` im ersten Folgeschritt zum Beispiel:

- einen Summanden auf die andere Seite bringt
- oder einen aeusseren Bruch aufbaut

dann gilt:

- neu bewegte Inhalte bekommen erst in diesem Schritt eigene neue Spalten
- bereits vorhandene Schalen bleiben bis dahin an ihrer Stelle
- wenn eine ganze Seite in den Zaehler oder Nenner eines neuen Bruchs eingeht,
  geht sie als bestehende Schale hinein
- der neue Faktor im Nenner oder Zaehler wird im neuen Bruchband zentriert,
  ohne den bestehenden Zaehler- oder Nennerinhalt intern umzubauen

## Lokale Transformation von B

Lokal gedacht arbeitet `B` in genau diesen Schritten:

1. `boundary_state` lesen
2. pruefen,
   dass genau eine relevante Exponentenschale vorliegt
3. mathematische Zielgleichung des Grenzschritts bilden
4. `landing_profile` lesen
5. `=` auf seinem Anker halten
6. Operatorgeschichte `B -> log_B` setzen
7. Inhaltsgeschichte `2x-1` in den Zielraum setzen
8. `landing_state` ausgeben

Wichtig zu Schritt 7:

Der Zielraum wird nicht
durch altes Reservieren leerer Slots gebaut.

Er wird aus der echten Startlage von `A2`
abgeleitet.

## Was B wissen muss

`B` muss **nicht** wissen:

- wie `A1` vorher gerechnet hat
- wie `A2` nachher weiterrechnet
- welche Folgeschritte spaeter kommen

`B` muss nur wissen:

- welche Schale geoeffnet wird
- welche Inhalte identisch bleiben
- wo die erste Zeile des neuen Systems landen muss

## Linksvariante

Eingabe:

```text
y/a = B^(2x-1)
```

Ausgabe:

```text
log_B(y/a) = 2x - 1
```

Pflicht:

- `=` bleibt fest
- rechter Zielterm landet sofort im Raster des neuen Systems
- der rechte Term darf gegen links aufweiten,
  solange seine Landeposition stimmt

## Rechtsvariante

Eingabe:

```text
B^(2x-1) = y/a
```

Ausgabe:

```text
2x - 1 = log_B(y/a)
```

Pflicht:

- `=` bleibt fest
- der rechte Bereich fuer `log_B(y/a)` muss direkt
  in seiner Startlage des neuen Systems reserviert sein
- die linke Seite landet schon in ihrer Solver-Startform

## Fehlerfall

`B` soll abbrechen,
wenn einer dieser Faelle eintritt:

- keine relevante Exponentenschale gefunden
- mehr als eine relevante Exponentenschale gefunden
- `landing_profile` fehlt
- `landing_profile` widerspricht dem Variantentyp
- `=` hat keine feste Ankerinformation

## Kurzform

```text
boundary_state
plus
landing_profile
ergibt
landing_state
```

Mehr soll `B` nicht tun.
