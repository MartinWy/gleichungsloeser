# roots

Status: visuelle Root-Stufe vorhanden; funktionaler Eingabevertrag noch verletzt
Stand: 7. September 2026

Hier liegt die getrennte Spezialstufe
fuer visuelle Wurzelgeometrie.

Sie muss aus der Render-Szene bereits explizit lesen:

- Wurzelspalte
- Oberstrich
- Inhaltsbereich
- funktionale Cover-Baender der Wurzel
- explizite Kindspuren innerhalb der Wurzel

## Heute

Vorhanden sind jetzt:

- `buildRootGeometryPlan(scene)`
- `buildRootGeometryPlanFromScenePlan(scenePlan)`
- `buildRootGeometrySequencePlan(sequencePlan)`
- `buildRootGeometryManifest()`
- `buildRootProjectionSpec(...)`
- `buildRootProjectionSpecs(...)`
- `buildRootProjectionManifest()`

Die Root-Stufe ist jetzt zweigeteilt:

- Geometrie:
  bildet gelieferte funktionale Bounds, Hook, Oberstrich und Inhaltsraum
  in eine visuelle Geometrie ab
- Projektion:
  erzeugt daraus die erste sichtbare Wurzelzeichnung
  ohne schon den produktiven SVG/PDF-Renderer zu ersetzen

## Invariante

- Der generische Szenenplan bleibt allgemein.
- Die Wurzelstufe ist ein visueller Spezialist nach dem Szenenplan.
- Hook, Oberstrich und Inhalt werden nicht mehr vermischt.
- Verschachtelte Potenzen oder andere Shells innerhalb der Wurzel bleiben als eigene Kindspuren sichtbar.
- Zeichnung folgt erst nach der Geometrie und darf keine neue Mathematik einfuehren.

## Harte Eingabegrenze

Der Root-Renderer darf nicht:

- Inhaltsatome ueber geometrischen Einschluss in einer Wurzel suchen
- verschachtelte Schalen ueber `isSpanInside` zu Kindern erklaeren
- `contentBounds`, `hookColumn` oder Oberstrichband aus verteilten Fragmenten neu zusammensetzen
- bei fehlenden Root-Feldern auf `frameBounds`, Shell-Mitglieder oder Text zurueckfallen

Der funktionale Root-Vertrag wird im Core von innen nach aussen gebaut.
Diese Stufe wandelt seine Reihen und Spalten nur noch in physische Koordinaten um.

## Bekannte Umsetzungsschuld

`renderer_kernel/roots/index.js` sammelt heute noch Inhaltsatome und Kindschalen
ueber geometrischen Einschluss und verwendet mehrere Bounds-Fallbacks.
Das ist nach Genesis nicht zulaessig.
Der Pfad bleibt rot,
bis der Szenenvertrag die funktionalen Root-Felder vollstaendig liefert
und diese Rekonstruktion entfernt ist.

## Zugeordnete Tests

- `tests/active/renderer_kernel_root_geometry_plan.test.js`
- `tests/active/renderer_kernel_root_projection.test.js`
- `tests/active/root_chrome_overlay_contract.test.js`
- `tests/active/root_shell_projection_export.test.js`

Die Tests muessen kuenftig getrennt beweisen:

1. Core und Adapter liefern vollstaendige funktionale Root-Geometrie.
2. Der Renderer bildet nur diese Geometrie physisch ab.
3. Bei fehlenden Pflichtfeldern wird abgebrochen statt geraten.
