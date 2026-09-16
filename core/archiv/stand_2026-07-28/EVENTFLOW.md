# Core Eventflow

## Solve-Flow
1. Eingabestring an `P1` uebergeben.
2. Struktur notfalls auf Arrayform normieren.
3. aktive Gleichungsseite fuer `P2` abtrennen.
4. `P2` fuer diese aktive Gleichungsseite nach der naechsten Aktion fragen.
5. wenn keine Aktion kommt: abbrechen.
6. `P3` mit Gesamtstruktur und Familien-Decision anwenden.
7. jede neue Theorie-Zeile in die Solve-History schreiben.
8. nach dem Solve-Lauf die gesamte Theorie-Zeilenfolge an `P4` uebergeben.
9. `P4` fuehrt PreFlight und Setzlauf ueber alle Zeilen aus.
10. `exportData` aus Theorie, Projektionszeilen und Layoutplan ableiten.

## Abbruchbedingungen
- `P2` liefert `null`
- `maxSteps` ist erreicht
- Fehler im Try/Catch
