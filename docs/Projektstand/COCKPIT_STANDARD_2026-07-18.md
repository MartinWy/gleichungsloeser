# Cockpit Standard 2026-07-18

Status: aktiv  
Stand: Samstag, 18. Juli 2026

## Zweck
Dieses Blatt fixiert den wiederhergestellten Arbeitsstandard, auf dem alle
kuenftigen Cockpit-Schritte aufbauen muessen.

Es dokumentiert bewusst zwei Dinge getrennt:
- den produktiven Render- und Layoutstandard
- die neue, minimale Cockpit-Huelle

Die frueheren Interface-Versuche gelten nicht als normativer UI-Stand.

## Nicht verhandelbarer Standard
- `core/index.js` bleibt die einzige semantische Wahrheit.
- `exportData` bleibt die verbindliche interne Pflichtausgabe.
- `projectionRows`, `layoutPlan`, IDs, Sichtbarkeiten und Spurrollen bleiben erhalten.
- LaTeX dient nur noch als Zeichensatz- und Exporttraeger.
- Die sichtbare Setzung kommt aus der eigenen Projektions-, Shell- und Spaltenlogik.

## Produktiver Renderpfad
Der aktuelle Standard fuer die sichtbare Setzung liegt heute in diesen Schichten:
- `core/P4_Projektion/`
- `components/Arbeitsblatt_Druckansicht/viewModel.js`
- `components/Arbeitsblatt_Druckansicht/renderKernel.js`
- `components/Arbeitsblatt_Druckansicht/renderKernelCore/`
- `components/Arbeitsblatt_Druckansicht/columnLayoutCore/`
- `presentation/column_layout/`
- `presentation/shell_colors/`

## Was als gesichert gilt
- Sichtbare Shells werden nicht mehr ueber klassisches LaTeX-Layout aufgebaut.
- Spalten, Shell-Spannen und Positionsstabilitaet kommen aus der eigenen Logik.
- Nachtraegliche Abstandssteuerung gehoert zum Standard und nicht zu einem Sonderpfad.
- Schalen- und Funktionsfarben gehoeren ebenfalls zum Standard und nicht zu einem Demo-Hack.
- Export, Arbeitsblatt und kuenftiges Cockpit muessen dieselbe Renderwahrheit benutzen.

## Offizieller Cockpit-Startpunkt
Der offizielle Einstieg fuer die kuenftige Nutzeroberflaeche ist ab jetzt:
- `index.html`

Dieser Einstieg ist in der ersten Stufe absichtlich klein:
- Eingabefeld fuer die Gleichung
- Eingabefeld fuer die Zielvariable
- `Start / Go`
- danach Rendern auf dem produktiven Standardpfad

## Architekturregel fuer alle naechsten Cockpit-Schritte
Alle weiteren Cockpit-Funktionen muessen Adapter auf den bestehenden Standard sein.

Erlaubt:
- Eingabemaske
- Regler fuer Abstaende
- Regler oder Picker fuer Farben
- Export-Buttons
- Diagnose-Umschalter

Nicht erlaubt:
- eine zweite Layoutwahrheit neben `columnLayoutCore/`
- ein zweiter Renderpfad neben `renderKernelCore/`
- ein neues mathematisches UI-Modell neben `core/index.js`
- experimentelle Sonderoberflaechen, die den Standard heimlich umgehen

## Naechste Cockpit-Stufen
1. Cockpit v1: Gleichung + Zielvariable + `Start / Go`
2. Cockpit v2: Abstandssteuerung auf dem bestehenden Spaltenstandard
3. Cockpit v3: Farbsteuerung auf dem bestehenden Shell- und Funktionsstandard

## Arbeitsregel ab jetzt
Wenn kuenftig von "dem Cockpit" gesprochen wird, ist damit immer eine Huelle
gemeint, die auf diesem Renderstandard sitzt.

Wir arbeiten nicht mehr an einem separaten Interface-Experiment weiter,
sondern nur noch an dieser Standardlinie.
