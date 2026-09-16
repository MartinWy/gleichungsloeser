# color_controls

Status: produktive Aufgabe beschrieben
Stand: 16. September 2026

## Eine Aufgabe

Die Farbsteuerung leitet fuer jeden tatsaechlich ausgefuehrten Prozessschritt
die adressierbaren Farbselektoren und eine lesbare Reglerbeschriftung ab.

Sie darf:

- stabile Atom- und Shell-IDs aus Strategie, Theoriezeile und Projektionszeile sammeln
- den reinen Theorie-Label-Adapter fuer die Reglerbeschriftung verwenden

Sie darf nicht:

- einen im Core nicht vorhandenen Prozessschritt erfinden
- IDs fest codieren
- Renderzellen oder Geometrie erzeugen
- fehlende Core-Atome durch Text ersetzen

Ein zusammengesetzter, als Ganzes verschobener Ausdruck ist genau ein Farbziel
des tatsaechlichen Schritts. Seine vorhandenen inneren Atome und seine bindende
Schale duerfen ueber ihre stabilen IDs gemeinsam adressiert werden.

Die Grenze des Farbzieles ist immer die vom Core in der Strategie benannte
Operandengrenze. Die Farbsteuerung darf diese Grenze nicht anhand der spaeteren
Darstellung verengen oder erweitern.

Fuer `fraction_birth` mit `inverseMode = reciprocal_factor` gilt deshalb:

- Der passive `DIVISION`-Operand ist als ganze Quellschale das Farbziel.
- Zaehlerschale, Bruchoperator und Nennerschale samt ihrer sichtbaren Nachfahren
  gehoeren gemeinsam dazu.
- Die daraus erzeugte reziproke `DIVISION`-Schale ist dasselbe Farbziel im
  Ergebniszustand und wird ebenfalls vollstaendig adressiert.
- Die IDs werden aus Quell-Theoriezeile, Strategie und Ergebnis-Theoriezeile
  uebernommen; Textvergleich und gleichungsspezifische Sonderfaelle sind verboten.

Eine gewoehnliche `fraction_birth`, die einen bislang ungegliederten Faktor als
Nenner einsetzt, behaelt ihr engeres Ziel `Faktor -> Nenner`. Nur der vom Core
ausdruecklich als ganzer Kehrbruchfaktor ausgewiesene Operand aktiviert die
vollstaendige Bruchschalen-Regel.

Fuer `root_power` gilt entsprechend die Schalenherkunft als Grenze:

- Die in der Strategie bezeichnete Quellschale und die in der Ergebniszeile
  mit `generatedByFamily = root_power` sowie passendem `originTargetId`
  erzeugte Gegenschale bilden gemeinsam das Schrittziel.
- Bei einer erzeugten `ROOT` reicht genau ihre stabile Schalen-ID aus, damit
  die atomaren Primitive `root_hook` und `root_overbar` gemeinsam adressiert
  werden.
- Der Radikand wird nicht in dieses Schalenfarbziel aufgenommen.
- Die Ableitung darf nicht nach einem Darstellungsmerkmal wie
  `visualMode = INVERSE_SHELL` suchen; massgeblich sind ausschliesslich die
  Core-Identitaet und die dokumentierte Herkunftsbeziehung.

Fuer `trig_inverse` und `inverse_trig` ist das Farbziel eine reine
Funktionshuelle:

- Quellfunktion und erzeugte inverse Funktion werden ueber ihre stabilen IDs
  verbunden.
- Adressiert werden nur die atomaren Huelleprimitive, deren `sourceAtomId` der
  jeweiligen FUNCTION-ID entspricht.
- Ein `shell-id`-Selektor ist hier verboten, weil er auch Argumentzellen mit
  derselben `sourceShellId` erfassen wuerde.
- Das Funktionsargument und insbesondere eine darin liegende Zielvariable
  bleiben dem eigenen Atom- beziehungsweise Operandenziel vorbehalten.
