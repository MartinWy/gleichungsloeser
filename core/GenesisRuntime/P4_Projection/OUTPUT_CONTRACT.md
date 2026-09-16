# P4-Teilmodul: Output Contract

Status: normativ
Stand: 16. September 2026
Vertrag: `p4_output_contract_v1`

## Eine Aufgabe

`buildOutputContract.js` verpackt und validiert die bereits fertigen P4-Ergebnisse
als einzige Uebergabe an Adapter und Renderer.

Es darf nur globale Seitenverschiebungen relativ zum Gleichheitsanker anwenden,
wenn diese vollstaendig aus den gelieferten funktionalen Grenzen bestimmt sind.
Es darf keine Kindposition, Shellspanne oder sichtbare Zelle neu berechnen,
reparieren, raten oder unterdruecken.

Fehlt eine Pflichtzelle oder Pflichtgeometrie,
muss das Modul einen P4-Vertragsfehler liefern statt einen teilweisen Erfolgsvertrag.

Der Output fuehrt das abgeschlossene `p4_global_cell_profile_v1` mit. Pro
Theoriezeile bleiben damit Atomzellen, Huellezellen, belegte Bereiche und leere
globale Reservierungsbereiche fuer alle Verbraucher explizit pruefbar. Das
Output-Modul darf dieses Profil nur mit demselben globalen Seitenoffset wie die
Projektionsatome normalisieren.

`rawCol`, `rawColStart` und `rawColEnd` sind verschiedene Vertragsdaten:
`rawCol` bindet die semantische Identitaetsspur, waehrend die Start-/Endwerte
die vollstaendige funktionale Zelle beschreiben. Das Output-Modul verschiebt
beide nur gemeinsam um den bereits bestimmten Seitenoffset.

`collectionRanges` und `collectionAlignmentRanges` sind ebenfalls verschiedene
Vertragsdaten. Das erste Feld beschreibt die tatsaechlich belegten Kindzellen,
das zweite das von P4 festgelegte Ausrichtungsband. Beide werden lediglich in
das globale Seitensystem verschoben; keine nachfolgende Instanz darf daraus
eine neue Bruchzentrierung ableiten.

Die globale Seitenverschiebung ist pro Prozessseite genau ein gemeinsamer Wert
fuer alle Theoriezeilen. Dadurch ist jeder erst in einer spaeteren Zeile
belegte Shell-Slot bereits als leere Koordinatenspalte der vorherigen Zeilen
vorhanden. Das Output-Modul darf niemals nur die spaetere Zeile verbreitern
oder bestehende Zellen zeilenweise verschieben.

Bei einem atomaren kuerzeren Bruchkind beschreiben `colStart` und `colEnd` die
bereits von P4 festgelegte, mittige funktionale Zelle. `col` bleibt die
Identitaetsspur innerhalb dieser Zelle. Adapter und Renderer muessen deshalb
alle drei Werte getrennt und unveraendert abbilden.

Explizit unsichtbare POWER-Klammerzellen bleiben im Output und im globalen
Zellprofil erhalten. Ein physischer Breitenadapter darf ihre Spalte nur dann
mit Breite `0` abbilden, wenn keine sichtbare Zelle derselben globalen Spalte
eine Breite fordert. Er darf aus dieser Breitenentscheidung keine neue
Sichtbarkeitsentscheidung ableiten.

Sichtbare POWER-Klammerzellen tragen ihre vollstaendige funktionale
Basisspanne als `rowSpanStart` und `rowSpanEnd`. Diese Spanne schliesst alle
Teilzeilen der Basis einschliesslich eines inneren Exponenten ein, niemals aber
den Exponenten der umgebenden POWER. Adapter und Renderer muessen sie
unveraendert abbilden.
