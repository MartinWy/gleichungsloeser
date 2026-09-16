# GenesisRuntime Legacy Projection Adapter Contract

Status: normativ
Stand: 16. September 2026
Vertrag: `genesis_runtime_legacy_projection_v1`

## Eine Aufgabe

`LegacyProjectionAdapter.js` bildet den vollstaendigen `p4_output_contract_v1`
mechanisch auf das noch von nachgelagerten Verbrauchern erwartete Zeilen- und Feldschema ab.

Der Adapter darf:

- Feldnamen eindeutig uebersetzen,
- lokale Reihen in absolute Stapelreihen umrechnen,
- bereits gelieferte Spannen und Rollen kopieren,
- Register und Diagnosehuellen fuer das Legacy-Schema verpacken.

Er darf nicht:

- Theoriezeilen rekursiv auswerten, um Projektionsrollen zu erraten,
- alte Rollen wie `factor`, `passive` oder `flowDirection` rekonstruieren,
- fehlende Eltern-, Kind-, Spalten-, Reihen- oder Shell-Daten ergaenzen,
- Projektionsatome zusammenfassen, unterdruecken oder ersetzen,
- neue funktionale Geometrie erzeugen.

Darum muss jedes atomare P4-Primitive bereits `role`, `collectionRole`,
`regionRole`, `parentShellId` und `parentShellType` tragen,
soweit es ein Schalenkind ist.
Ein fehlendes Pflichtfeld ist ein Grenzfehler und kein Anlass zur Inferenz.
Die von P4 gelieferte `displayForm` wird unveraendert durchgereicht;
der Adapter waehlt keine geschlossene oder zusammengesetzte Ersatzdarstellung.
Ebenso wird `isVisible` unveraendert kopiert. Insbesondere darf der Adapter
einen explizit eingeklappten POWER-Klammer-Slot nicht durch einen Defaultwert
wieder sichtbar machen; die Zelle bleibt fuer Profil und Diagnose vorhanden,
ohne Teil der sichtbaren Inhaltsfolge zu werden.
Die fuer POWER-Klammern gelieferten `rowSpanStart` und `rowSpanEnd` werden
ebenfalls unveraendert kopiert. Der Adapter darf ihre vertikale Basisspanne
nicht auf die Achsenzeile `localRow` reduzieren.
