# Kanonische Schalenstandards

Status: normativ
Stand: 9. September 2026

Dieser Ordner ist die einzige Genesis-Quelle fuer intrinsische Aussagen
ueber semantische Schalenarten.
Prozessmodule verweisen auf diese Standards
und beschreiben nur ihren eigenen Umgang mit der jeweiligen Schale.

## Aktives Register

| Schalenart | Standard | Erzeuger der Eingangsschale |
| :--- | :--- | :--- |
| `GROUP` | `GROUP.md` | P1; bei Umformungen P3 |
| `FUNCTION` | `FUNCTION.md` | P1; bei Umformungen P3 |
| `ROOT` | `ROOT.md` | P1; bei Umformungen P3 |
| `POWER` | `POWER.md` | P1; bei Umformungen P3 |
| `NEGATION` | `NEGATION.md` | P1; bei Umformungen P3 |
| `DIVISION` | `DIVISION.md` | P1; bei Umformungen P3 |
| `MULTIPLICATION` | `MULTIPLICATION.md` | P1; bei Umformungen P3 |
| `ADDITION` | `ADDITION.md` | P1; bei Umformungen P3 |
| `SUBTRACTION` | `SUBTRACTION.md` | P1; bei Umformungen P3 |
| `COLLECTION` | `COLLECTION.md` | ausschliesslich P3 |

Atome und der Gleichheitsanker sind keine Schalen.
Ihre P1-Regeln stehen im P1-Eingabevertrag.

## Gemeinsames Gesetz

Jede sichtbare Schale besitzt:

- genau eine stabile Identitaet
- genau einen Schalentyp
- vollstaendige Kinder in den Rollen ihres Standards
- eine eindeutige Herkunft
- einen expliziten Sichtbarkeitszustand

Kinder werden zuerst vollstaendig aufgebaut.
Erst danach wird die Elternschale darum gelegt.
Kein spaeteres Modul darf fehlende Kinder oder Rollen aus Text oder Darstellung erraten.

