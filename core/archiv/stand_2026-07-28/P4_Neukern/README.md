# P4 Neukoern

Dieser Ordner ist der neue, saubere P4-Strang.

Er wird bewusst getrennt vom aktuellen produktiven Pfad aufgebaut.
Ziel ist ein Kern,
in dem globale Spalten, sichtbare Schalen und Projektionsatome
ohne lokale Re-Geometrie beschrieben werden.

## Prinzip
- erst globale Inhaltsspalten
- dann explizite Platzierungen dieser Inhalte ueber alle Theoriezeilen
- dann sichtbare Schalen
- dann Blockzeilen
- dann explizite Projektionsatome

## Aktueller Stand
- Grundvertraege und Modulkette sind angelegt
- der Ordner dient jetzt als Einstieg fuer die neue Implementierung
- der opt-in Einstieg ist bereits an den alten Solve-/P4-Pfad angeschlossen ueber `process(theoryRows, { engine: "neukern_adapter" })`
- Shell-Blueprint-Lookups sind zeilenlokal: dieselbe `shellId` darf sich ueber verschiedene Theoriezeilen nicht gegenseitig ueberschreiben
- Leaf-Projektion, Shell-Projektion und Zeilen-Normalisierung sind bereits als getrennte Bausteine aus dem Writer herausgezogen
- die eigentliche Projektionszeile wird ebenfalls separat aufgebaut; der Writer verknuepft nur noch die vorbereiteten Bausteine
- die Vorstufen-Aufloesung lebt stufenweise in `resolve...Inputs`-Funktionen direkt bei den Modulen, nicht verteilt ueber mehrere Aufrufer
- Ergebnisbau und Vorstufen-Aufloesung sind getrennt: `resolve...Inputs` loest Voraussetzungen auf, `create...FromResolvedInputs` baut daraus das Ergebnis
- im Output Contract sind Trace/Register und Layout/Profile ebenfalls eigene Bausteine statt Nebenlogik einer Sammeldatei
- auch Projection Blocks sind weiter zerlegt: Bounds/Shell-Zustaende und Blockzeilenbau sind getrennte Bausteine
- auch Shell Blueprints sind getrennt: Sichtbarkeits-/Boundary-Sammlung und Blueprint-Aufbau leben in eigenen Bausteinen
- auch das Global Semantic Raster ist getrennt: Zeilenentfaltung, Trace-Aufbau und Spalten-/Placement-Layout sind eigene Bausteine
- auch Shell-Geometrie ist getrennt: Boundary-Umrechnung, Geometrie-Primitiven und Shell-Layouts sind eigene Bausteine
- auch die Querschnittsstruktur ist getrennt: Placement, Shell-Taxonomie und Boundary-/Blueprint-Lookups leben in eigenen Bausteinen
- auch die vertikale Hilfslogik ist getrennt: Bounds, Zeilensemantik und Blockframe leben in eigenen Bausteinen
- auch die Vertragsbasis ist getrennt: Metadaten, Theorie-Normalisierung und Draft-Grundgeruest leben in eigenen Bausteinen
- der alte P4-Pfad bleibt bis zur produktiven Uebernahme unberuehrt nutzbar
