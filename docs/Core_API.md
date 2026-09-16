# Core API: Kernschnittstelle des Gleichungsloesers

## Grundsatz
Die API des Gleichungsloesers ist nicht nur fuer interne Debug-Ausgaben da.
Sie ist die offizielle Schnittstelle des Projektkerns.
An ihr haengen spaeter Diagnose, Film, Arbeitsblatt und weitere Ausgabeformen.

Solange noch keine offizielle Nutzeransicht existiert,
ist diese API bereits die erste pruefbare Systemausgabe des Solvers.

Wichtige Eingabegrenze:
`solve(...)` erwartet weiter die **kanonische Kernsyntax**.
Tolerantere UI-Schreibweisen oder LaTeX-nahe Eingaben gehoeren in vorgelagerte Input-Adapter,
nicht in den Rechenkern selbst.

## Solve
`solve(equation)`

Liefert aktuell ein kanonisches Rueckgabeobjekt mit:
- atomarem Register
- Theorie-Zeilenfolge inklusive Initialzeile
- Projektionszeilen aus dem produktiven Zwei-Durchlauf
- globalem `layoutPlan`
- Exportdaten fuer externe Verbraucher

Wichtig:
Diese Rueckgabe ist nicht nur Exportstoff fuer spaeter,
sondern schon heute die verbindliche interne Antwort des Kerns auf eine Gleichungseingabe.

## Transformationsspur
Der Core erzeugt zuerst Theorie-Zustaende mit stabilen Atom-IDs.
Diese Folge ist die Grundlage fuer Projektion und Export.

## PreFlight
`generateGlobalLayout(theoryRows)`
- betrachtet die gesamte theoretische Folge
- analysiert globale Spalten-/Breitenlogik
- bereitet eine Layoutmatrix fuer den Setzlauf vor

## Setzlauf
`projectToGrid(atoms, layoutPlan, rowIndex)`
- setzt `row` und `col` gegen die globale Matrix
- haelt den Gleichheitsanker ueber alle Zeilen stabil
- ist der zweite produktive Durchlauf von `P4`

## Anker
- das Gleichheitszeichen ist der globale Projektionsanker
- stabile Atom-IDs sichern Zeilenkontinuitaet und Exportfaehigkeit

## Export
Der Export ist keine Zusatzfunktion ausserhalb des Kerns,
sondern eine offizielle Kernschnittstelle.

Ein externer Verbraucher muss dieselben Atome und dieselbe Umbaugeschichte lesen koennen,
ohne selbst erneut zu loesen.

Aktiver Ist-Stand:
- `exportData.atomRegister`
- `exportData.theoryRows`
- `exportData.projectionRows`
- `exportData.layoutPlan`
- `exportData.exportProfiles`
