# GenesisRuntime P2 Strategy Contract

Status: normativer V1-Vertrag; Implementierung wird an den kanonischen P1-Vertrag angeglichen
Stand: 17. September 2026
Vertragsversion: `p2_strategy_v1`

## Aufgabe

`P2_Strategy` beantwortet genau eine fachliche Frage:

```text
Welche eine naechste Umformungsentscheidung ist fuer die aktive Zielspur erlaubt?
```

P2 bestimmt dafuer:

- welche Variablennamen vorkommen
- welche Zielvariable aktiv ist
- auf welcher Gleichungsseite sie liegt
- welche Seite aktiv und welche passiv ist
- welche genau eine Familienentscheidung als Naechstes gilt

P2 veraendert keine Struktur und baut keine Geometrie.

## Uebergabe

- Vorgaenger: `P1_Input` fuer den Initialzustand, danach `P3_Transformation` ueber die Runtime-Schleife
- Eingabe: `p1_input_v1` oder eine kanonische P3-Folgestruktur plus Zielvariablenauftrag
- Ausgabe: genau eine vollstaendige `STRATEGY_DECISION` oder ein vertraglich definierter Endzustand
- Nachfolger: `P3_Transformation` bei einer Decision, sonst Runtime-Abschluss

P2 darf nur die uebergebene Struktur lesen.
Es darf vor seiner Fallauswahl keinen zielabhaengigen Normalisierer aufrufen
und keine fuer eine Familie bequemere Struktur erzeugen lassen.

## Eingabe

- `request.requestedTargetVariable`
- die von P1 gelieferte kanonische Struktur

P2 darf nur sichtbare semantische Knoten und ihre explizite Schachtelung lesen.
Es darf keine Entscheidung aus Textserialisierung oder Renderdaten ableiten.

Jede Gleichungsseite besteht an der P2-Grenze aus genau einer Ausdruckswurzel.
P2 sucht daher nicht nach losen Nachbaratomen,
sondern prueft die kanonischen Kindrollen der jeweils aeussersten wirksamen Schale.

## Ausgabe

`runStrategyPhase(...)` liefert:

- `phaseId = P2_Strategy`
- `variableNames`
- `targetVariable`
- `equationSideAnalysis`
- `equationSides`
- `activeSideNodes`
- `oppositeSideNodes`
- `nextDecision`

`nextDecision` ist entweder `null`
oder genau ein Objekt mit mindestens:

```text
typ = STRATEGY_DECISION
family
targetId
targetExpressionIds
sourceType
inverseType
action
argumentScope
```

Jede schalenbezogene Decision benennt ausserdem:

- `sourceShellId`: die unveraendert gelesene aeussere Quellschale
- `targetRole`: die kanonische Kindrolle mit der Zielspur
- `targetExpressionIds`: die geordneten Wurzel-IDs dieser Zielrolle
- soweit vorhanden `passiveRole` und `passiveExpressionIds`
- die stabilen `operatorId` oder `operatorIds`, welche die betroffene Beziehung tragen

`targetId` bleibt das auszufuehrende Quellobjekt und ist bei einer Schalenentscheidung
identisch mit `sourceShellId`.
Eine umschliessende Zusatzschale wird ausschliesslich ueber `containerTargetId` benannt.

Die Rollen `targetRole` und `passiveRole` sind Decision-Daten.
Sie werden niemals als neue Felder in die gelesene P1- oder P3-Schale geschrieben.

Familien duerfen weitere explizite Felder liefern,
zum Beispiel `operatorId`, `operatorIds`, `passiveExpressionIds`,
`targetSide`, `inverseName` oder `inverseBaseText`.

`nextDecision = null` ist nur zulaessig,
wenn ein explizit definierter erfolgreicher Endzustand vorliegt.
Ist die Zielvariable noch nicht vertragsgemaess isoliert
und keine Fallregel passt,
muss P2 einen `UNSUPPORTED_STRATEGY_SITUATION`-Fehler liefern.

## Zielvariablenregeln

- Eine explizit verlangte Zielvariable muss durch rekursive Auswertung aller kanonischen Kindrollen vorkommen.
- Ohne explizite Wahl ist nur eine eindeutige automatische Wahl erlaubt.
- Die Zielvariable darf im aktiven Runtime-Vertrag nicht gleichzeitig auf beiden Gleichungsseiten vorkommen.
- Zielwahl und Seitentrennung geschehen vor der Familienentscheidung.

## Aktive Familien

Die Familienentscheidung ist nicht mehr offen.
Produktiv entschieden werden:

- `group_release`
- `negative_sign_release`
- `addition_release`
- `subtraction_release`
- `subtrahend_release`
- `subtracted_sum_release`
- `fraction_birth`
- `fraction_denominator_release`
- `fraction_collapse`
- `trig_inverse`
- `inverse_trig`
- `log_inverse`
- `power_exponent_release`
- `power_base_release`
- `root_power`

## Verbindliche Prioritaet

P2 prueft zuerst genau eine kanonische Nebenzeilen-Normalisierung und danach die
aktive Zielseite in dieser Reihenfolge
und beendet die Suche beim ersten passenden Vertrag:

1. auf der zielvariablenfreien Seite eine aeussere gruppierte Summe unter
   Subtraktion als `subtracted_sum_release` freigeben
2. sichtbare aeussere Gruppe freigeben
3. passiven Faktorblock unter einer Negationsschale als `fraction_birth` behandeln
4. einfache Negationsschale freigeben
5. Addition freigeben
6. Subtraktion mit Ziel links freigeben
7. Subtrahend mit Ziel rechts freigeben
8. allgemeinen passiven Faktor als `fraction_birth` verschieben
9. Ziel aus einem Nenner ueber `fraction_denominator_release` freigeben
10. passiven Nenner ueber `fraction_collapse` verschieben
11. direkte trigonometrische Funktion invertieren
12. inverse trigonometrische Funktion invertieren
13. Logarithmus invertieren
14. Ziel aus einem Exponenten freigeben
15. Ziel aus einer Potenzbasis freigeben
16. Wurzel oder numerische Potenz invertieren

Diese Reihenfolge ist fachlicher Vertrag.
Ein Adapter oder End-to-End-Test darf sie nicht nebenbei umdefinieren.

Die Reihenfolge ist keine Fehler-Fallbackkette.
P2 prueft nur die Vorbedingungen gegen die unveraenderte kanonische Struktur.
Sobald genau eine Regel gemaess dieser Ordnung ausgewaehlt ist,
beendet ein Fehler in ihrem Decision-Aufbau die Verarbeitung.
P2 darf danach keine spaetere Familie als Ersatz probieren.

Wenn zwei Regeln auf derselben fachlichen Ebene denselben Zustand beanspruchen,
ist der Vertrag mehrdeutig und muss berichtigt werden.
Die Prioritaet darf diese Ueberlappung nicht verdecken.

Insbesondere gilt:
Wenn nach einem vorherigen Umformungsschritt genau eine sichtbare aeussere `GROUP` die aktive Seite bildet,
ist `group_release` die naechste eigene Umformungsentscheidung.
Er darf nicht nur zur Verkuerzung der dargestellten Historie unterschlagen werden.

## Situationsmatrix

| Situation | Benoetigte Schalenlage | P2-Ausgabe |
| :--- | :--- | :--- |
| gruppierte passive Summe unter Minus | zielvariablenfreie Seite mit `SUBTRACTION.subtrahend -> GROUP.content -> ADDITION` | `subtracted_sum_release` |
| aeussere Gruppe | `GROUP` um aktive Zielspur | `group_release` |
| negativer Faktorblock | `NEGATION` um `MULTIPLICATION` mit passivem Faktor | `fraction_birth` mit explizitem Negationskontext |
| aeussere Negation | `NEGATION` um aktive Zielspur | `negative_sign_release` |
| Ziel in Addition | `ADDITION.terms`; genau ein Term traegt das Ziel | `addition_release` |
| Ziel als Minuend | `SUBTRACTION`, Ziel links | `subtraction_release` |
| Ziel als Subtrahend | `SUBTRACTION`, Ziel rechts | `subtrahend_release` |
| Ziel in Faktorstruktur, generische Gegenseite | `MULTIPLICATION.factors`; genau ein Faktor traegt das Ziel; Gegenseite ist keine einzelne sichtbare `DIVISION` | `fraction_birth` mit `inverseMode = denominator_division` |
| Ziel in Faktorstruktur, Gegenseite ist Bruch | wie zuvor; bewegter Faktor ist kein Bruch; Gegenseite besitzt genau eine sichtbare aeussere `DIVISION` | `fraction_birth` mit `inverseMode = extend_existing_denominator` und `oppositeDivisionId` |
| Ziel in Faktorstruktur, bewegter Faktor ist Bruch | wie zuvor; genau ein passiver Faktor ist unmittelbar oder durch genau eine `GROUP` gebundene `DIVISION` | `fraction_birth` mit `inverseMode = reciprocal_factor` und `reciprocalDivisionId` |
| Ziel im Nenner | `DIVISION`, Zielrolle Nenner | `fraction_denominator_release` |
| passiver Nenner | `DIVISION`, Ziel ausserhalb des passiven Nenners | `fraction_collapse` |
| direkte Trigonometrie | `FUNCTION` mit direktem trigonometrischem Namen | `trig_inverse` |
| inverse Trigonometrie | `FUNCTION` mit inversem trigonometrischem Namen | `inverse_trig` |
| Logarithmus | `FUNCTION` mit explizitem Logarithmusnamen und Basisdaten | `log_inverse` |
| Ziel im Exponenten | `POWER`, Zielrolle Exponent | `power_exponent_release` |
| Ziel in der Basis | `POWER`, Zielrolle Basis | `power_base_release` |
| aeussere Wurzel oder numerische Potenz | `ROOT` oder `POWER` mit passendem Zielpfad | `root_power` |
| Ziel vertraglich isoliert | keine wirksame aeussere Umformungsschale | `nextDecision = null` |
| sonstige nicht isolierte Lage | keine genau passende Fallregel | expliziter Fehler |

Bei `fraction_birth` wird ein passiver Faktor als Bruchform erkannt, wenn er
entweder unmittelbar eine `DIVISION` ist oder wenn genau eine `GROUP` genau
eine solche `DIVISION` bindet. P2 schreibt dafuer `inverseMode = reciprocal_factor`
und benennt die gefundene Divisionsschale explizit. Es entfernt oder veraendert
die Gruppe nicht selbst.

Die Bruchform des bewegten Faktors wird vor der Form der Gegenseite bewertet.
Ist der bewegte Faktor kein Bruch und besteht die Gegenseite aus genau einer
sichtbaren aeusseren `DIVISION`, schreibt P2 stattdessen
`inverseMode = extend_existing_denominator`,
`action = MOVE_PASSIVE_EXPRESSION_TO_EXISTING_DENOMINATOR`
und deren unveraenderte ID als `oppositeDivisionId` in die Decision.
Eine nur vermutete oder textuell erkannte Bruchform ist unzulaessig.
P2 baut den erweiterten Nenner nicht selbst.

## Verantwortlicher Code

- `runStrategyPhase.js`: Zielwahl, Seitentrennung und genau eine Decision
- `findNextDecision.js`: Familienpruefung und Prioritaetsordnung
- `targetSelection.js`: Zielvariablenvertrag
- `equationSides.js`: Gleichungsseitentrennung
- `decisionHelpers.js`: reine Hilfspruefungen und Decision-Aufbau

Keiner dieser Pfade darf P3-Strukturen oder P4-Geometrie erzeugen.

## Kanonische Schalenpruefung

P2 liest die in Genesis registrierten Rollen direkt:

| Schale | von P2 gelesene Rollen |
| :--- | :--- |
| `GROUP`, `FUNCTION`, `ROOT`, `NEGATION` | `content` |
| `POWER` | `content`, `exponentNodes` |
| `DIVISION` | `numerator`, `denominator` |
| `MULTIPLICATION` | `factors`, `operators` |
| `ADDITION` | `terms`, `operators` |
| `SUBTRACTION` | `minuend`, `operator`, `subtrahend` |
| `COLLECTION` | `content`; nur wenn die Schale nachweislich von P3 stammt |

Alte Eingaberollen wie `MULTIPLICATION.content`, `factor` oder `passive`
sind keine zulaessige P1/P2-Schnittstelle mehr.

## Zugeordnete Tests

Direkte Modulbeweise:

- `tests/active/genesis_runtime_p2_targeting.test.js`
- `tests/active/genesis_runtime_p2_decisions.test.js`
- `tests/active/genesis_runtime_p2_sequences.test.js`
- `tests/active/fraction_denominator_extension.test.js`

Nachbar- und End-to-End-Beweise:

- `tests/active/core_solve_flow.test.js`
- `tests/active/genesis_runtime_p2_sequences.test.js`

Die fruehere Vermischung im `tests/active/input_adapter.test.js`
ist aufgeloest.
Der Adaptertest prueft nur noch Normalisierung,
waehrend der P2-Sequenztest die ausdrueckliche `group_release`-Zeile beweist.

## Darf nicht

- P1-Struktur umschreiben
- eine fehlende P1-Schale vor der Fallauswahl erzeugen oder umhaengen
- P3 ausfuehren oder vorwegnehmen
- mehrere Familien gleichzeitig zur Ausfuehrung freigeben
- Reihen, Spalten, Baender oder Schalenhoehen erzeugen
- eine Familienentscheidung wegen einer gewuenschten Darstellung auslassen
- fehlende semantische Daten aus Text oder Nachbarschaft erraten
- Altlogik importieren oder einen zweiten Strategiepfad bilden
