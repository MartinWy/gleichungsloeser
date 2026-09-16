# shells

Status: Migrationsfassade; funktionale Shell-Entscheidungen muessen aus dem Altpfad entfernt werden
Stand: 7. September 2026

## Aufgabe

Dieses Modul zeichnet die visuelle Huelle bereits funktional beschriebener Schalen.

Der Core liefert pro sichtbarem Auftreten mindestens:

- `shellId` und zeilenlokale Auftretensidentitaet
- Schalentyp und explizite Kind-IDs
- Inhalts-, Ausrichtungs- und Huelleband
- funktionale Reihen und Achsen
- sichtbare Huelleprimitive
- explizite Darstellungsform

Dieses Modul darf physische Pfade und Glyphen fuer diese Huelle erzeugen.

Es darf nicht:

- sichtbare Schalen aus Atomen oder Text zerlegen oder zusammensetzen
- Klammern, Funktionen, Brueche, Potenzen oder Wurzeln semantisch erkennen
- Inhaltsbounds durch Scannen benachbarter Knoten bilden
- eine offene oder geschlossene Form waehlen
- Innenatome und Blockform doppelt sichtbar setzen

## Verantwortlicher Code

- `renderer_kernel/shells/index.js`
- derzeitiger Migrationsursprung: `components/Arbeitsblatt_Druckansicht/displayShellModel.js`

Die Funktion `decomposeVisibleShells` ist nur dann zulaessig,
wenn sie eine explizit gelieferte Darstellungsform mechanisch abbildet.
Eine Rekonstruktion aus der semantischen Struktur waere ein Core-Verstoss.

## Zugeordnete Tests

- `tests/active/render_kernel.test.js`
- `tests/active/fraction_line_no_fraction_rendernode.test.js`
- kuenftig ein fokussierter Blindheitstest ohne Textrekonstruktion
