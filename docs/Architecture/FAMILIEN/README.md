# Familien-Spezifikationen

Dieser Ordner sammelt die semantischen Umformungsfamilien des Gleichungsloesers.

Leitregel:
- gleiche Strukturen werden gleich behandelt
- Familien beschreiben keine Einzelfaelle, sondern Strukturklassen
- der produktive Kern arbeitet derzeit mit genau einer Zielvariable pro Solve-Lauf
- jede Familie wird spaeter end-to-end durch `P2`, `P3`, `P4`, Export und Tests gezogen

Ablauf pro Familie:
1. Familienvertrag schreiben
2. Ist-Code gegen den Vertrag spiegeln
3. Luecken isolieren
4. Kategorie end-to-end einhaengen
5. lokale Tests und Exportspur absichern

Aktive Familienanker:
- `GROUP_RELEASE.md`
- `NEGATIVE_SIGN_RELEASE.md`
- `ROOT_POWER.md`
- `FRACTION_BIRTH.md`
- `FRACTION_COLLAPSE.md`
- `ADDITION_RELEASE.md`
- `SUBTRACTION_RELEASE.md`
- `SUBTRAHEND_RELEASE.md`
- `TRIG_INVERSE.md`
- `INVERSE_TRIG.md`

Wichtige Richtungsregel:
- gegenlaeufige Inversionsrichtungen werden getrennt dokumentiert und getrennt eingehangen
