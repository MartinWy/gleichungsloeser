# Schalenstandard MULTIPLICATION

Status: normativ
Stand: 15. September 2026
Schalenart: `MULTIPLICATION`

## Eine Aufgabe

`MULTIPLICATION` beschreibt ein geordnetes Produkt
aus mindestens zwei vollstaendigen Faktoren.

## Kanonische Kinder

- `factors`: mindestens zwei vollstaendige Ausdruckswurzelknoten in Eingabereihenfolge
- `multiplication_operators`: genau ein stabiles Operatoratom zwischen je zwei Faktoren

Ein Operatoratom darf als `isImplicit` markiert sein,
bleibt aber fuer Herkunft und atomare Projektion existent.

Kanonische Maschinenfelder sind `factors` und `operators`.

## Invarianten

- Faktoren werden vor der Produktschale aufgebaut.
- Die Schale ist vollstaendig zielunabhaengig.
- Es gibt keine intrinsischen Rollen `target`, `passive` oder `flowDirection`.
- Ziel- und Passivrollen entstehen erst in einer P2-Decision.
- Mehrere Faktoren brauchen keine `COLLECTION`; sie gehoeren derselben Produktschale.
- P3 erzeugt inverse Produktschalen mit denselben kanonischen Kindrollen.
- Die Reihenfolge in `factors` ist semantisch verbindlich und wird von P4 und
  Renderer unveraendert konsumiert.
- Fuer eine P1-Eingabeschale ist dies die Eingabereihenfolge.
- Fuer eine P3-Schale, die eine bereits sichtbare Gleichungsseite um einen neuen
  Faktor erweitert, ist dies die in Genesis definierte Aussenanlagerung:
  auf `left` neuer Faktor vor vorhandenem Ausdruck, auf `right` danach.
- Die Aussenanlagerung ist eine P3-Situationsregel und keine intrinsische
  `flowDirection` der Schale.

## Fehlerbedingungen

Ungueltig sind weniger als zwei Faktoren, fehlende oder ueberzaehlige Operatoren,
ein Wechsel der Faktorordnung fuer eine Zielvariable, eine P3-Erweiterung ohne
explizite Zielseite oder eine erst nach P1 gebaute Eingabeproduktschale.
