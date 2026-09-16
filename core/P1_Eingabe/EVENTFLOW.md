# P1 Eventflow

1. Eingabestring kommt an.
2. Leerzeichen werden entfernt.
3. Der String wird rekursiv von links nach rechts gelesen.
4. Bei `sqrt(` wird die passende Klammer gesucht und ein `ROOT`-Objekt gebaut.
5. Bei Funktionsnamen mit Klammer wird eine `FUNCTION`-Schale gebaut.
6. Bei einer freien Klammer wird eine `GROUP`-Schale gebaut.
7. Bei einfachem `^` wird ein `POWER`-Objekt gebaut.
8. Sonst werden Zeichen zu Atomen typisiert.
9. Anschliessend wird implizite Multiplikation auf Strukturebene als expliziter `*`-Operator eingefuegt.
10. Einfache Segmentformen wie `x/2` oder `sin(x)/2` werden zu einer `DIVISION`-Schale verdichtet.
11. Das Ergebnis wird als Array zurueckgegeben.
