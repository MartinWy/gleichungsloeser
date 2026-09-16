# Familienvertrag: `trig_inverse`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`trig_inverse` beschreibt die gerichtete Familie
`sin/cos/tan -> asin/acos/atan`.
Eine sichtbare trigonometrische Quellfunktion um den aktiven Ausdruck wird auf der aktiven Gleichungsseite abgebaut,
und auf der Gegenseite entsteht die passende inverse Funktionsschale.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen auf der aktiven Gleichungsseite eine sichtbare `FUNCTION`-Schale mit einem der Namen `sin`, `cos` oder `tan` liegt
und ihr Inhaltsausdruck die Zielvariable traegt.

Sie ist nicht zustaendig fuer:
- die Gegenrichtung `asin/acos/atan -> sin/cos/tan`
- nicht trigonometrische Funktionen
- passive Funktionen ohne Zielvariable wie `sin(3)`
- mehrere Zielvariablen

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- eine sichtbare trigonometrische Quellfunktion auf der aktiven Gleichungsseite
- ihr Inhaltsausdruck ist der aktive Zielausdruck
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `sin(x)=1`
- `cos(x)=1`
- `tan(x)=2`
- `sin(x+1)=2`
- `2sin(x)=10` nach vorgeschalteter `fraction_birth`
- `sin(x)/2=5` nach vorgeschalteter `fraction_collapse`

Noch nicht Teil des aktiven Familienrahmens:
- allgemeine Funktionsumkehrungen ausserhalb von `sin/cos/tan`
- mehrere Zielvariablen

## Normativer Kern
- kein Rechnen, nur Funktionsschale abbauen
- die Quellfunktion verschwindet nicht spurlos, sondern bleibt als Spur sichtbar
- der freigelegte Argumentausdruck behaelt seine IDs
- die Gegenseite wird als inverse `FUNCTION` derselben Richtung lesbar

## Verantwortung pro Phase
### P2
- sichtbare trigonometrische Quellfunktion erkennen
- nur `sin`, `cos` und `tan` als aktive Quellnamen zulassen
- die passende inverse Funktion benennen

Normative Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "trig_inverse",
  targetId: "...",
  targetExpressionIds: ["..."],
  sourceType: "FUNCTION",
  sourceName: "sin" | "cos" | "tan",
  inverseType: "FUNCTION",
  inverseName: "asin" | "acos" | "atan",
  action: "INVERT_TO_ASIN" | "INVERT_TO_ACOS" | "INVERT_TO_ATAN",
  label: "Sinus invertieren" | "Kosinus invertieren" | "Tangens invertieren",
  argumentScope: "whole_opposite_side"
}
```

### P3
- die trigonometrische Quellfunktion auf der aktiven Gleichungsseite unsichtbar machen
- ihren Inhalt freilegen
- auf der Gegenseite eine inverse `FUNCTION` mit stabiler generierter ID und Herkunftsmetadaten erzeugen

### P4
- versteckte trigonometrische Quellfunktion als `GHOST_HOLE` halten
- freigelegtes Argument als `EMERGED` markieren
- generierte inverse `FUNCTION` als `INVERSE_SHELL` projizieren

### Export
Ein Exportverbraucher muss lesen koennen:
- welche Quellfunktion abgebaut wurde
- welche inverse Funktion entstand
- welche IDs ueber Theorie und Projektion stabil blieben
- wie vorgeschaltete Familien wie `fraction_birth` oder `fraction_collapse` in derselben Spur weiterleben

## Definition of Done fuer den aktiven Rahmen
- `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `sin`, `cos` und `tan`
- `asin`, `acos` und `atan` entstehen mit stabiler generierter ID und Herkunftsmetadaten
- vorgeschaltete aktive Familien koennen in dieselbe trigonometrische Gegenseite hineinlaufen
- die Gegenrichtung bleibt bewusst als eigene Familie `inverse_trig` getrennt
