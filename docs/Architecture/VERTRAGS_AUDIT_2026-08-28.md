# Vertrags-Audit

Status: Arbeitsstand  
Stand: 2026-08-28

## Zweck

Diese Datei beantwortet nicht,
wie die Architektur idealerweise gemeint ist,
sondern was derzeit bereits

- dokumentiert
- im Code erzwungen
- und per Test abgesichert

ist.

Sie soll verhindern,
dass Prinzipien nur in Texten existieren,
waehrend der Code weiterhin hybride Pfade zulaesst.

## Kurzurteil

Ein kompletter Neustart ist im Moment nicht die erste Pflicht.

Die erste Pflicht ist,
die schon formulierten Modulgrenzen
als harten Nachweisraum zusammenzufuehren:

- Vertrag
- verantwortlicher Code
- Sperrtest

Ohne diese Kopplung
wuerde auch ein neuer Neustart
wieder in weiche Grenzen zurueckfallen.

## Audit-Regel

Ein Modul gilt erst dann als sauber begrenzt,
wenn alle drei Ebenen vorhanden sind:

1. dokumentierter Vertrag
2. genau ein verantwortlicher Codepfad
3. mindestens ein Test,
   der einen Vertragsbruch sichtbar scheitern laesst

Fehlt eine dieser Ebenen,
ist die Grenze nicht hart.

## Modulmatrix

### 1. Magna Carta

Vertrag:
- [MAGNA_CARTA.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/docs/Architecture/MAGNA_CARTA.md)

Rolle:
- oberste Prinzipien
- Regeln statt Sonderfaelle
- eine Aufgabe pro Modul
- eine Ortswahrheit
- Durchreichen statt Neuaufbauen

Code-Erzwingung:
- nicht direkt

Test-Erzwingung:
- nicht direkt als Sammeltest

Bewertung:
- `gelb`

Grund:
- normativ stark
- technisch aber nur indirekt umgesetzt

### 2. GenesisRuntime gesamt

Vertrag:
- [CONTRACT.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/core/GenesisRuntime/CONTRACT.md)

Rolle:
- P1 bis P4 als aktive Neuschrift
- keine konkurrierenden Ortswahrheiten

Code-Erzwingung:
- teilweise durch die neue Modulstruktur

Test-Erzwingung:
- viele aktive Tests im Ordner `tests/active/`

Bewertung:
- `gelb`

Grund:
- die Runtime ist modularer als frueher
- aber Adapter- und Brueckenpfade koennen weiterhin Modulgrenzen verwischen

### 3. P4 Projection

Vertrag:
- [P4_Projection/CONTRACT.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/core/GenesisRuntime/P4_Projection/CONTRACT.md)

Rolle:
- einzige Projektionswahrheit
- Atome, Schalengeometrie und geschlossene sichtbare Blockform

Code-Erzwingung:
- `core/GenesisRuntime/P4_Projection/`

Test-Erzwingung:
- u. a. `tests/active/genesis_runtime_p4_projection.test.js`
- u. a. `tests/active/genesis_runtime_view_model_columns.test.js`

Bewertung:
- `gelb-gruen`

Grund:
- die Grenze ist klarer als in anderen Bereichen
- aber Render- und Handoff-Pfade koennen noch Wirkung auf spaetere Darstellung nehmen,
  die nicht vollstaendig nur aus P4 gespeist ist

### 4. A1-B-A2 Kopplung

Vertrag:
- [A1_B_A2_CONTRACT_SKETCH.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/projects/complex_exponent_transition/A1_B_A2_CONTRACT_SKETCH.md)

Rolle:
- A1 stoppt an der Grenze
- B macht genau den Grenzschritt
- A2 rechnet danach normal weiter

Code-Erzwingung:
- unvollstaendig

Test-Erzwingung:
- nur teilweise

Bewertung:
- `rot`

Grund:
- der Vertrag ist ausdruecklich noch eine Skizze
- damit fehlt bereits auf Vertragsebene die volle Haerte

### 5. B IO Contract

Vertrag:
- [B_IO_CONTRACT.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/projects/complex_exponent_transition/B_IO_CONTRACT.md)

Rolle:
- `B` ist kein allgemeiner Solver
- `B` ist ein einmaliger Systemwechsel-Schritt
- `B` liefert genau eine erste Startzeile des neuen Systems

Code-Erzwingung:
- aktuell nicht vollstaendig

Beleg:
- [real_bridge_handoff/index.js](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/projects/complex_exponent_transition/real_bridge_handoff/index.js:1279)
- [real_bridge_handoff/index.js](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/projects/complex_exponent_transition/real_bridge_handoff/index.js:918)

Test-Erzwingung:
- [bridge_b_position_contract.test.js](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/tests/active/bridge_b_position_contract.test.js)

Bewertung:
- `rot`

Grund:
- der Vertrag sagt:
  `B` liefert genau eine Startzeile
- der aktuelle Handoff-Pfad zieht aber weitere `A2`-Zeilen hinein
  und bearbeitet sie weiter
- damit ist die Modulgrenze dokumentiert,
  aber nicht hart verriegelt

### 6. Bruchvertrag

Vertrag:
- [BRUCH_VERTRAG_V2.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/docs/Architecture/BRUCH_VERTRAG_V2.md)
- [FractionNeustart/CONTRACT.md](/Users/martinwyrwich/Developer/math-projects/6_Gleichungslöser/core/GenesisRuntime/FractionNeustart/CONTRACT.md)

Rolle:
- Geburt, Transport und Sichtbarkeit von Bruechen

Code-Erzwingung:
- teilweise in `core/GenesisRuntime/FractionNeustart/`
- teilweise in P3 und P4

Test-Erzwingung:
- mehrere spezifische Bruchtests

Bewertung:
- `gelb`

Grund:
- es gibt schon deutlich mehr Struktur als frueher
- aber bei Grenzfaellen zeigt sich noch,
  dass Bruchgeometrie und Transportgeschichte
  nicht ueberall gleich hart gekoppelt sind

## Wichtigste aktuelle Luecke

Die derzeit groesste harte Luecke ist nicht der Renderer allein,
sondern die unvollstaendige Verriegelung der Grenze:

```text
A1 -> B -> A2
```

Im Vertrag ist `B` klein.
Im Code ist `B` teilweise noch gross.

Solange das so bleibt,
entstehen rueckwirkende oder hybride Effekte,
auch wenn die Prinzipien in der Dokumentation korrekt sind.

## Was du nicht tun musst

Du solltest nicht:

- jedes Prinzip zweimal neu formulieren
- jede Grenze erst in Doku und dann noch einmal separat fuer den Code anstossen
- manuell jede Datei selbst gegen jede Vertragsdatei lesen muessen

Das ist Agentenarbeit,
nicht Nutzerarbeit.

## Was jetzt sinnvoller ist als ein kompletter Neustart

1. jede Modulgrenze von `gelb` oder `rot`
   in einen harten Sperrtest uebersetzen
2. zuerst `B` so verriegeln,
   dass es technisch nur noch genau eine Landing-Zeile liefern kann
3. danach erst die darueberliegenden Darstellungsfehler neu bewerten
4. nur wenn diese Verriegelung im Code unmoeglich oder unverhaeltnismaessig ist,
   ist ein echter Modul-Neustart gerechtfertigt

## Vorlaeufiges Urteil

Stand 2026-08-28:

- ein pauschaler fuenfter Neustart ist noch nicht nachgewiesen noetig
- aber ein blindes Weiterreparieren ist ebenso falsch
- der naechste richtige Schritt ist ein harter Vertragsumbau
  an der Grenze `A1 -> B -> A2`

Erst wenn diese Grenze technisch sauber verriegelt ist,
laesst sich fair beurteilen,
ob die restlichen Probleme aus dem Renderer,
aus P4
oder aus der Brueckenlogik kommen.
