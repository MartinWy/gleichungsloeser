# P4-Teilmodul: semantische Rasterverfeinerung

Status: normativ
Stand: 15. September 2026
Vertrag: `p4_refined_semantic_raster_v2`

## Eine Aufgabe

`refineSemanticRaster.js` validiert und schliesst ausschliesslich das bereits
vollstaendige globale Zellprofil ab.

Eingabe sind Theoriezeilen und `p4_global_semantic_raster_v2`.
Ausgabe ist direkt `p4_refined_semantic_raster_v2` im selben Rasterschema.
Das Modul gibt weder ein Ergebnisbuendel noch Shell-Daten zurueck.

Es darf keine Shell Blueprints oder neue Zellansprueche erzeugen,
keine horizontalen Platzierungen veraendern,
keine lokalen Reihen bauen und keine medienabhaengigen Masse verwenden.

Es prueft mindestens:

- vollstaendige Atom- und Huellezellgrenzen
- Uebereinstimmung von Spur und zeilenweiser Platzierung
- explizite Leerbereiche im gemeinsamen globalen Koordinatenraum
- dass kein nachfolgender Prozessschritt eine horizontale Nachkorrektur benoetigt
