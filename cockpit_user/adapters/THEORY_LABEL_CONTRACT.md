# Cockpit Theory Label Adapter

Status: normativ
Stand: 10. September 2026

## Eine Aufgabe

Der Adapter uebersetzt genau einen bereits kanonischen Genesis-Theorieknoten
in eine kurze, lesbare Beschriftung fuer Cockpit-Steuerungen.

```text
kanonischer Theorieknoten -> Diagnosebeschriftung
```

## Eingabe

- ein Theorieknoten aus dem Core-Output
- optional die Darstellungswahl fuer eine inverse Potenz

Der Adapter liest ausschliesslich vorhandene kanonische Rollen,
insbesondere `terms`, `operators`, `minuend`, `subtrahend`, `factors`,
`numerator`, `denominator`, `content`, `baseContent` und `exponentNodes`.

## Ausgabe

- genau ein String fuer Beschriftungen in Zeilen-, Sichtbarkeits- oder Farbreglern

Diese Ausgabe ist Diagnose und niemals Render- oder Geometriewahrheit.

## Darf nicht

- neue Theorie- oder Projektionsknoten erzeugen
- Spalten, Reihen, Baender oder visuelle Masse bestimmen
- Zellen fuer DOM oder PDF buendeln
- fehlende Core-Rollen aus Nachbarschaft oder Gleichungstext erraten
- eine alte Solver- oder Renderstruktur normalisieren

## Fehlerregel

Eine unbekannte strukturierte Schale wird nicht heuristisch zerlegt.
Ohne vorhandenen lesbaren Wert liefert der Adapter eine leere Beschriftung.

## Beweis

- `tests/active/cockpit_theory_labels.test.js`
