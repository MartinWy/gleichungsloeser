# P4-Teilmodul: globales semantisches Raster

Status: normativ
Stand: 16. September 2026
Vertrag: `p4_global_semantic_raster_v2`

## Eine Aufgabe

`buildGlobalSemanticRaster.js` vergibt fuer jedes sichtbare semantische Blatt
und jeden im Blueprint gemeldeten Huellezellbedarf eine seitenweite stabile
funktionale Zelle innerhalb seines ununterbrochenen Spurabschnitts.

Eingabe sind unveraenderte Theoriezeilen und vollstaendige koordinatenfreie
Shell-Blueprints. Ausgabe ist das abgeschlossene globale Zellprofil mit
Blattplatzierungen, Huellezellplatzierungen, Spurordnung, semantischen Traces
und expliziten Leerreservierungen pro Theoriezeile.

Das Modul durchlaeuft die kanonischen Kindrollen aller Genesis-Schalen.
Operatoratome von Negation, Multiplikation, Addition und Subtraktion sind eigene Blaetter.
Exponentenatome sind eigene Blaetter mit der Rolle `power_exponent`.

Es darf keine Schale rekonstruieren, keine lokale Reihe festlegen und keine
Renderkoordinate erzeugen. Es muss jedoch die horizontalen funktionalen Regeln
der kanonischen Schalen anwenden, weil nur dieses Modul Zellspalten vergeben darf.

`rawColStart`, `rawCol` und `rawColEnd` dieses Moduls sind die endgueltige
horizontale Geburtslage. Sie sind kein provisorisches Grundraster. Eine
Bruchzentrierung, eine Funktionsklammer oder eine andere aeussere Huelle darf
diese Lage spaeter weder erweitern noch verschieben.

Das Profil fuehrt pro Theoriezeile mindestens:

- alle belegten Atom- und Huellezellbereiche
- alle in dieser Zeile leeren, aber global vorhandenen Koordinatenbereiche
- die vollstaendigen Zellgrenzen jeder sichtbaren Atomplatzierung
- die vollstaendigen Zellgrenzen jedes sichtbaren Huelleprimitivs
- die Zellgrenzen auch explizit eingeklappter POWER-Klammer-Slots samt
  `isVisible = false`, damit kein nachgelagertes Modul ihren Ort erfinden muss

Fehlt ein spaeter benoetigter Bereich im Profil, ist der Pre-flight rot. Ein
spaeteres Einfuegen oder Nachruecken ist keine zulaessige Reparatur.

## Semantische Identitaet und Spurabschnitt

Eine `sourceAtomId` beschreibt die bleibende semantische Identitaet. Sie ist
nicht automatisch der Schluessel einer einzigen horizontalen Spur ueber den
gesamten Lauf.

Ein Spurabschnitt ist die maximale Folge unmittelbar aufeinanderfolgender
Theoriezeilen, in denen dieselbe semantische Einheit auf derselben
Gleichungsseite sichtbar ist. Innerhalb dieses Abschnitts bleiben Zellzentrum
und Zellspanne stabil. Wechselt die Einheit algebraisch die Seite oder fehlt
sie auf der bisherigen Seite und tritt spaeter dort wieder ein, beginnt ein
neuer Spurabschnitt mit eigener Geburtslage. Alle Abschnitte verweisen weiter
auf dieselbe semantische Identitaet.

Die Lage eines spaeteren Spurabschnitts darf weder eine fruehere Schale noch
deren tatsaechliche Kindbelegung beeinflussen. Bei `DIVISION` enthalten
`collectionRanges` daher nur die in der betreffenden Theoriezeile aktiven
Spurabschnitte von Zaehler und Nenner. Das gemeinsame Bruchband steht getrennt
in `collectionAlignmentRanges`.

Fuer `FUNCTION` behandelt der Zellplaner `baseContent` und `content` als zwei
fertige, getrennte Kindbloecke. Ist eine Basis vorhanden, muss ihre gesamte
Spanne zwischen `function_name` und `function_left_paren` liegen; erst hinter
der linken Klammer beginnt die Argumentspanne. Damit gilt im Profil zwingend:

```text
function_name < baseContent < function_left_paren < content < function_right_paren
```

Ohne Basis entfaellt nur `baseContent`. Ein Renderer-Offset oder eine spaetere
Bridge-Verschiebung ist kein Ersatz fuer diese horizontale Profilinvariante.

Fuer `POWER` wird die fertige Basisspanne getrennt vom Exponenten gelesen.
Die beiden Pflichtslots liegen strikt als

```text
power_left_paren < content < power_right_paren < exponentNodes
```

und tragen die im Blueprint festgelegte gemeinsame Sichtbarkeit. Auch ein
unsichtbarer Slot bleibt eine bekannte funktionale Zelle. Seine physische
Breite ist nicht Aufgabe dieses Moduls. Er erweitert die sichtbare
`containerRange` seiner POWER-Schale nicht, bleibt aber als eigene Belegung im
globalen Zellprofil erhalten.

## Verantwortlicher Codepfad

- `buildGlobalSemanticRaster.js` erzeugt das globale Profil.
- `planGlobalCellPlacement.js` ist sein interner bottom-up Planungshelfer.
- `shellLayoutRules.js` ist die reine horizontale Regelbibliothek der kanonischen Schalen.
- `refineSemanticRaster.js` validiert und schliesst das Profil.

Diese Helfer bilden gemeinsam genau ein Prozessmodul mit genau einer Aufgabe:
die einmalige globale horizontale Zellvergabe.

## Beweis

- `tests/active/p4_function_base_cell_order.test.js`
- `tests/active/power_base_parenthesis_slots.test.js`
