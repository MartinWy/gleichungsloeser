# Familienvertrag: `inverse_trig`

Status: aktive Aufbaukategorie im aktuellen Familienrahmen  
Stand: 6. April 2026

## Zweck
`inverse_trig` beschreibt die gerichtete Gegenfamilie
`asin/acos/atan -> sin/cos/tan`.
Eine sichtbare inverse trigonometrische Quellfunktion um den aktiven Ausdruck wird auf der aktiven Gleichungsseite abgebaut,
und auf der Gegenseite entsteht die passende direkte trigonometrische Funktionsschale.

## Familiengrenze
Die Familie ist zustaendig fuer Umformungen,
bei denen auf der aktiven Gleichungsseite eine sichtbare `FUNCTION`-Schale mit einem der Namen `asin`, `acos` oder `atan` liegt
und ihr Inhaltsausdruck die Zielvariable traegt.

Sie ist nicht zustaendig fuer:
- die Gegenrichtung `sin/cos/tan -> asin/acos/atan`
- nicht inverse trigonometrische Funktionen
- passive Funktionen ohne Zielvariable wie `asin(3)`
- mehrere Zielvariablen

## Aktiver Familienrahmen
- genau eine aktiv gewaehlte Zielvariable im ganzen Ausdruck
- eine sichtbare inverse trigonometrische Quellfunktion auf der aktiven Gleichungsseite
- ihr Inhaltsausdruck ist der aktive Zielausdruck
- die gesamte Gegenseite wird als Inversionsargument behandelt

Typische aktive Faelle:
- `asin(x)=1`
- `acos(x)=1`
- `atan(x)=2`
- `asin(x+1)=2`

Noch nicht Teil des aktiven Familienrahmens:
- allgemeine Funktionsumkehrungen ausserhalb von `asin/acos/atan`
- mehrere Zielvariablen

## Normativer Kern
- kein Rechnen, nur inverse trigonometrische Funktionsschale abbauen
- die Quellfunktion verschwindet nicht spurlos, sondern bleibt als Spur sichtbar
- der freigelegte Argumentausdruck behaelt seine IDs
- die Gegenseite wird als direkte trigonometrische `FUNCTION` derselben Richtung lesbar

## Verantwortung pro Phase
### P2
- sichtbare inverse trigonometrische Quellfunktion erkennen
- nur `asin`, `acos` und `atan` als aktive Quellnamen zulassen
- die passende direkte trigonometrische Funktion benennen

Normative Decision:
```js
{
  typ: "STRATEGY_DECISION",
  family: "inverse_trig",
  targetId: "...",
  targetExpressionIds: ["..."],
  sourceType: "FUNCTION",
  sourceName: "asin" | "acos" | "atan",
  inverseType: "FUNCTION",
  inverseName: "sin" | "cos" | "tan",
  action: "INVERT_TO_SIN" | "INVERT_TO_COS" | "INVERT_TO_TAN",
  label: "Arkussinus invertieren" | "Arkuskosinus invertieren" | "Arkustangens invertieren",
  argumentScope: "whole_opposite_side"
}
```

### P3
- die inverse trigonometrische Quellfunktion auf der aktiven Gleichungsseite unsichtbar machen
- ihren Inhalt freilegen
- auf der Gegenseite eine direkte trigonometrische `FUNCTION` mit stabiler generierter ID und Herkunftsmetadaten erzeugen

### P4
- versteckte inverse trigonometrische Quellfunktion als `GHOST_HOLE` halten
- freigelegtes Argument als `EMERGED` markieren
- generierte direkte trigonometrische `FUNCTION` als `INVERSE_SHELL` projizieren

### Export
Ein Exportverbraucher muss lesen koennen:
- welche inverse trigonometrische Quellfunktion abgebaut wurde
- welche direkte trigonometrische Funktion entstand
- welche IDs ueber Theorie und Projektion stabil blieben

## Definition of Done fuer den aktiven Rahmen
- `P2`, `P3`, `P4`, Export und Tests arbeiten produktiv fuer `asin`, `acos` und `atan`
- `sin`, `cos` und `tan` entstehen mit stabiler generierter ID und Herkunftsmetadaten
- die Familie bleibt von `trig_inverse` bewusst getrennt dokumentiert und getrennt eingehangen
