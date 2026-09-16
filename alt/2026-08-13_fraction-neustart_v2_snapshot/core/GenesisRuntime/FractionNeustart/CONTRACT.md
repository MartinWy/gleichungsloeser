# Fraction Neustart Contract

Status: neu, isoliert, nicht an den Altpfad gekoppelt

## Zweck

Dieser Bereich baut sichtbare Brueche neu auf.

Er ersetzt nichts im bestehenden Pfad.
Er ist ein getrennter Neubau fuer genau zwei Dinge:

1. Bruch-Geburt
2. Bruch-Transport bei geschlossenen Schalen

## Oberregel

Ein sichtbarer Bruch besteht aus drei Schalen:

- Zaehler-Schale
- Nenner-Schale
- Bruch-Schale

Die Bruch-Schale besitzt genau ein Bruchband.
Der Bruchstrich uebernimmt dieses Bruchband.
Zaehler und Nenner werden innerhalb dieses Bruchbandes platziert.

## Geburtsregeln

### G1. Der Bruch wird genau einmal geboren

Im Geburtsmoment werden festgelegt:

- `bandStart`
- `bandEnd`
- `bandWidth`
- Zaehlerplatzierung
- Nennerplatzierung
- Bruchstrichband

### G2. Der Bruchstrich uebernimmt exakt das Bruchband

Der Bruchstrich ist nie kuerzer und nie laenger als:

- `bandStart`
- `bandEnd`

### G3. Zentrierung gehoert zur Geburt

Wenn Zaehler oder Nenner schmaler sind als das Bruchband,
wird ihre innere Platzierung im Geburtsmoment festgelegt.

Danach wird diese Platzierung nicht neu berechnet.

### G4. Geschlossene Schalen bleiben geschlossen

Wenn `sin(alpha)` oder `sin(beta)` algebraisch nicht geoeffnet werden,
wandern sie als geschlossene Schalen weiter.

Ihre innere Slot-Geometrie bleibt erhalten.

## Transportregeln

### T1. Wenn der Nenner entfernt wird, bleibt die Zaehler-Schale stehen

Bei `a / sin(alpha)` und Nenner-Freigabe bleibt links nicht nur das Atom `a`,
sondern die geborene Zaehler-Schale mit derselben Breite bestehen.

### T2. Geschlossene Brueche wandern als Bruch-Schalen

Wenn rechts `b / sin(beta)` geschlossen bleibt,
wandert dieser Bruch als ganze Schale weiter:

- mit demselben Bruchband
- mit demselben Bruchstrichband
- mit derselben inneren Nenner-Schale

### T3. Neue Nachbarn bekommen eigene Slots

Wenn rechts spaeter ein Malpunkt und `sin(alpha)` hinzukommen,
dann bekommen sie eigene Slots rechts neben der geschlossenen Bruch-Schale.

Die innere Geometrie des Bruchs wird dadurch nicht veraendert.

## Exportregel

Dieser Neubau exportiert nicht nur freie Atome.

Er exportiert:

- geschlossene Schalen mit explizitem Band
- innere Slots der Schalen
- explizite Strichprimitive

Der Renderer darf diese Daten sichtbar machen,
aber nicht neu deuten.
