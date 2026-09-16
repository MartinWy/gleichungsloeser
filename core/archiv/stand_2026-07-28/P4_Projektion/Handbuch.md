# Handbuch: Phase P4 - Projektion
Quelle: Genesis-Gleichungslöser-Maschine (v2.0)

## Darstellungszentrum und Positionstreue
- **Darstellungszentrum:** Das Gleichheitszeichen ist der invariante Ankerpunkt. Es bleibt ueber alle Schritte hinweg an der exakt gleichen vertikalen und horizontalen Position fixiert.
- **Positionstreue:** Was sich algebraisch nicht aendert, darf sich visuell nicht bewegen. Elemente behalten ihre relative Position zum Darstellungszentrum bei.

## Zwei-Durchlauf als produktiver Pfad
P4 arbeitet jetzt fuer die aktive Kernspur wirklich in zwei Durchlaeufen:
1. **PreFlight:** Alle Theorie-Zeilen werden gemeinsam gelesen, damit eine globale Spaltenmatrix entsteht.
2. **Setzlauf:** Jede Zeile wird gegen diese gemeinsame Matrix gesetzt und erhaelt erst dann `row`, `col` und Sichtbarkeitsmarker.

## Vakuum-Erhaltung (GHOST_HOLE)
Wird eine Schale oder ein Term entfernt, bleibt an seiner Stelle eine explizite visuelle Leerstelle (`isVisible = false`).
Diese Vakuum-Erhaltung erzeugt ein **GHOST_HOLE**. Dies macht die Umformung fuer den Lernenden raeumlich nachvollziehbar und verhindert ein Zusammenrutschen der restlichen Atome.

Aktiver Stand fuer die Familienprojektion:
- versteckte `ROOT`-Schalen werden als `GHOST_HOLE` sichtbar
- versteckte `POWER`-Schalen werden ebenfalls als `GHOST_HOLE` sichtbar
- versteckte `NEGATION`-Schalen werden ebenfalls als `GHOST_HOLE` sichtbar
- versteckte trigonometrische Quellfunktionen bleiben ebenfalls als `GHOST_HOLE` sichtbar
- versteckte inverse trigonometrische Quellfunktionen bleiben ebenfalls als `GHOST_HOLE` sichtbar
- generierte `NEGATION`-, `FUNCTION`-, `ROOT`- und `POWER`-Schalen werden als `INVERSE_SHELL` markiert
- diese Spuren bleiben im Setzlauf auf echten globalen Spalten verankert
- sichtbare `DIVISION`-Schalen bleiben vertikal um eine gemeinsame Bruchspalte organisiert; mehrteilige Nenner werden symmetrisch um diese Spalte zentriert
- sobald eine Zeile einen sichtbaren Bruch enthaelt, werden freie Gleichungsteile derselben Zeile auf die Bruchachse gelegt; `x` und `=` sitzen dann auf Hoehe des Bruchstrichs
- zusammengesetzte Zaehler behalten ihre bestehenden Teilspalten auch nach einer Bruchgeburt; der Bruchstrich spannt dann explizit ueber die volle Breite des Zaehlerausdrucks
- jede Projektionszeile wird dabei auch als lokaler Block exportiert: `localRowCount` beschreibt die Teilzeilenhoehe, `axisLocalRow` die mathematische Achse innerhalb dieses Blocks
- fuer sequenzielle Verbraucher wird derselbe Block zusaetzlich ueber `stackRowStart`, `stackRowEnd` und `stackedRow` in eine gestapelte Folge uebersetzt
- die unveraenderte Zielvariable bleibt bei `fraction_birth` und `fraction_collapse` horizontal auf derselben Spalte verankert
- auch ueber die Ketten `fraction_birth -> trig_inverse` und `fraction_collapse -> trig_inverse` bleiben Zielspur, Gegenseite und Gleichheitsanker global spaltenstabil
- auch ueber die Kette `fraction_birth -> group_release -> trig_inverse` bleibt die aktive Spur nach der Gruppenfreilegung und dem Folge-Schritt global spaltenstabil

## EMERGED-Zustand
Wenn alle umschliessenden Schalen der Zielvariable entfernt wurden und sie komplett freigelegt ist, erreicht sie den Zustand **EMERGED**. Dies signalisiert visuell den erfolgreichen Abschluss der Isolation.
