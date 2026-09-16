# Projektverfassung: Gleichungsloeser

Status: normativ  
Stand: 12. Juli 2026

## Kernprinzipien
1. Dokumentation vor Umbau: Erst Verantwortung und Grenzen schriftlich festhalten, dann tiefer umbauen.
2. Struktur vor Rechnung: Der Solver ist primaer ein Struktur-Solver.
3. Sichtbarkeit ist Teil der Wahrheit: Was im Lernprozess verschwindet, wird markiert und nicht heimlich kollabiert.
4. Phasenreinheit vor Komfort: `P1`, `P2`, `P3`, `P4` bleiben getrennt.
5. Lokale Verantwortung: Jede Komponente erklaert sich in ihrem eigenen Ordner.
6. Komponentenhistorie vor Sammel-Commit: Aenderungen sollen kuenftig pro Komponente nachvollziehbar sein.
7. Operative Referenz: Der verbindliche Gesamtprozess wird in `docs/Architecture/GESAMTPROZESS.md` beschrieben.
8. Stabile Module vor Folgeumbau: Was in sich funktioniert, wird nicht angefasst, bis eine neue Anforderung den Vertrag erweitert.
9. Sichtbare Shell-Topologie und semantische Breite bleiben getrennte Verantwortungen.

## Die Zwei-Ebenen-Regel
- Normative Ebene: `Genesis`, `Step_Semantics`, Verfassung, Architekturregeln
- Operative Ebene: Core, Komponenten, Tests, Projektstand

Normative Texte sagen, was gelten soll.
Operative Texte sagen, was heute im Code tatsaechlich passiert.

## Schutz gegen Kaskaden
- Vertragsanpassungen muessen sichtbar sein.
- Jede Komponente hat definierte Eingaben und Ausgaben.
- UI bleibt Beobachter oder Diagnosewerkzeug.
- Querschnittsaenderungen duerfen nicht als lokale Kleinigkeit eingecheckt werden.
- Aenderungen sollen moeglichst nur eine klar zustaendige Komponente treffen.

## Dokumentationspflicht
Zu jeder relevanten Komponente gehoeren mindestens:
- ein lokales Handbuch oder ein Vertrag
- Referenzen auf zugehoerige Tests
- ein klarer Status: aktiv, prototypisch oder legacy

## Historische Ehrlichkeit
Alte Dateien, alte Pfade und alte Prototypen werden nicht stillschweigend als aktuell dargestellt.
Abweichungen zwischen Soll und Ist werden im Projektstand festgehalten.
