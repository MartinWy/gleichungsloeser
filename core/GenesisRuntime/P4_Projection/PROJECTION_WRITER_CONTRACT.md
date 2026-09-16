# P4-Teilmodul: Projektionswriter

Status: normativ
Stand: 16. September 2026
Vertrag: `p4_written_projection_rows_v1`

## Eine Aufgabe

`writeProjectionRows.js` schreibt aus `p4_refined_semantic_raster_v2`,
`p4_local_geometry_v4` und `p4_projection_blocks_v2`
die atomaren `p4_written_projection_rows_v1`.

Der Writer schreibt sowohl die dort fertig bestimmten Atomspannen als auch
die getrennten Belegungs- und Ausrichtungsbaender der Schalen unveraendert aus.

Jede sichtbare Core-Zelle wird genau einmal mit stabiler `sourceNodeId`
an ihrer gelieferten funktionalen Position ausgegeben.
Fuer Inhaltsatome schreibt der Writer neben `rawCol` die aus dem globalen
Zellprofil materialisierte Zellspanne `rawColStart` bis `rawColEnd` unveraendert aus.
Eine mehrspaltige Atomzelle bleibt genau ein Projektionsatom und ist keine
Buendelung mehrerer Inhalte.
Solange der atomare Referenzmodus gilt,
traegt jedes ausgegebene Primitive explizit `displayForm = atomic`.
Schalenkinder tragen ihre bereits bekannte `collectionRole`,
`parentShellId` und `parentShellType` bis zur Adaptergrenze mit.
Bei strukturierten Potenzkindern bezeichnet `regionRole`
die durchgaengige Region `power_base` oder `power_exponent`,
waehrend `role` die atomare Primitive wie Inhalt oder Operator benennt.
Keine der beiden Informationen darf die andere ersetzen.
Exponentenkinder bleiben einzelne `content`-Atome mit Rolle `power_exponent`.
Operatoratome bleiben einzelne `content`-Atome mit ihrer Operationsrolle.
Ihr P1-Merkmal `isImplicit` wird unveraendert am Projektionsatom ausgegeben,
damit kein Verbraucher zur Sichtbarkeits- oder Stilentscheidung in den
Theoriebaum zurueckgreifen muss.

Die Pflichtslots `power_left_paren` und `power_right_paren` werden auch dann
als getrennte Projektionsatome ausgeschrieben, wenn P4 sie mit
`isVisible = false` eingeklappt hat. Der Writer kopiert diese Entscheidung;
er darf weder einen Slot entfernen noch dessen Sichtbarkeit neu bewerten.
Auch die vom Projection Block gelieferte vertikale Basisspanne wird als
`rowSpanStart` und `rowSpanEnd` unveraendert an beide POWER-Klammeratome
geschrieben; der Writer darf sie nicht auf die Achsenzeile verkuerzen.

Die bereits von P2 festgelegte Zielvariable darf der Writer auf einem atomaren
`VARIABLE`-Blatt als `isTarget = true` kenntlich machen. Er waehlt dabei kein
Ziel neu, sondern schreibt nur die vorhandene Entscheidung an die ausgegebene
Zelle. Nicht passende und nicht-variable Zellen tragen `isTarget = false`.

Der Writer darf keine Position aus Nachbarschaft ableiten,
keine fehlende Zelle ergaenzen und keine Shell-Geometrie nachberechnen.
