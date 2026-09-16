# Schalenstandard GROUP

Status: normativ
Stand: 9. September 2026
Schalenart: `GROUP`

## Eine Aufgabe

`GROUP` bewahrt eine ausdruecklich gesetzte strukturelle Umgrenzung.
Sie veraendert den mathematischen Wert ihres Inhalts nicht,
legt aber fest, dass der vollstaendige Inhalt als ein Kind einer aeusseren Operation gilt.

## Kanonische Kinder

Eine `GROUP` besitzt genau eine Rolle:

- `group_content`: genau ein vollstaendiger Ausdruckswurzelknoten

Kanonisches Maschinenfeld: `content: [root]`.

Die Klammerzeichen selbst sind keine unabhaengigen semantischen Kinder.
P4 erzeugt ihre funktionalen Huelleprimitive aus der sichtbaren `GROUP`-Schale.

## Invarianten

- P1 bewahrt jede fachlich wirksame explizite Eingabegruppe.
- P1 entfernt Gruppen nicht, um eine kuerzere Loesungshistorie zu erzeugen.
- P3 darf eine `GROUP` nur aufgrund einer expliziten Decision erzeugen oder oeffnen.
- Inhalt, Reihenfolge und IDs der Kinder bleiben beim Transport unveraendert.
- Eine Gruppe darf nicht als Ersatz fuer eine fehlende Operationsschale dienen.

## Fehlerbedingungen

Ungueltig sind eine leere Gruppe, mehrere ungebundene Ausdruckswurzeln im Inhalt,
eine nur aus Renderklammern rekonstruierte Gruppe oder eine Gruppe ohne stabile ID.
