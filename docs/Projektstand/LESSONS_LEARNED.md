# Lessons Learned

Stand: 5. April 2026

## 2026-08-11
- Wenn ein Atom im Core bereits eine Spalte besitzt, darf der Renderer diese Spur nicht spaeter optisch "korrigieren".
- Zentrierung ist keine freie Renderer-Heuristik, sondern nur dann erlaubt, wenn der Core sie selbst als Geometrie geliefert hat.
- Bruchstrichstaerke ist eine globale Renderregel und darf nicht aus lokalen Einzelzellen oder einzelnen Bruchfaellen abgeleitet werden.
- Wenn eine Klammer ploetzlich "komisch" wirkt, ist oft nicht die Klammer falsch, sondern der Inneninhalt wurde unerlaubt nachtraeglich verschoben.

## 2026-04-05
- Pfadumbauten ohne Nachzug der Inspektoren und Tests erzeugen stille Architekturbrueche.
- Komponenten waren schon recht gut getrennt, aber die Erklaerung dieser Trennung fehlte.
- Lokale Doku direkt am Code ist wichtiger als spaetere Rekonstruktion aus Sessions oder Erinnerungen.
- `isVisible` und nachgelagerte Projektionsmarker sind ein gutes Mittel gegen unsichtbare Kaskaden.
- Normative Aussagen und Ist-Code muessen getrennt benannt werden, sonst entsteht falsche Sicherheit.
- Export muss als Kernschnittstelle modelliert werden; sonst erfinden Film oder Arbeitsblatt spaeter ihre eigene Wahrheit.
- Ausgabeprofile muessen auf derselben atomaren Solve-Geschichte sitzen und duerfen nicht die Kernstruktur umdeuten.

## Arbeitsregel fuer die Zukunft
- Nach jeder relevanten Architektur- oder Vertragsaenderung kommt ein kurzer Eintrag in dieses Dokument.
- Ein Lesson-Learned-Eintrag ist kein Roman; er soll eine konkrete Schutzregel fuer spaetere Arbeit liefern.
