# bridge_landing_profile

Status: erster Landing-Profile-Adapter aktiv  
Stand: 16. September 2026

Dieser Adapter liest einen echten `solve_state`
aus dem aktiven Kern
und exportiert daraus das `landing_profile`
fuer den Bridge-Uebergang `B -> A2`.

Seit dem 10. August 2026 gilt dabei ausdruecklich:

- `landing_profile` kommt **nicht** mehr aus der Folgezeile von `A1`
- `landing_profile` kommt aus einem **isolierten A2-Probelauf**
  ab der realen Landing-Struktur
- der `=`-Anker bleibt der feste Grenzanker von `A1`
- die unveraenderte Durchreicheseite wird auf diesen Anker bezogen
- der komplexe Exponent ist vor dem Uebergang genau eine geschlossene
  Exponentenspur; seine inneren Atome besitzen dort keine eigenen Hauptzeilen-Spalten
- genau beim Uebergang wird diese eine Spur aufgefaltet
- die sichtbaren Kinder des geoeffneten Exponenten werden in ihrer gelieferten Reihenfolge
  als von P4 gelieferte, spaltentragende Inhalts-, Operator- und Schalenzellen
  auf kompakte normale `term_slots` direkt neben dem Anker abgebildet
- alte `power_base`- und `power_exponent`-Spalten werden nicht in das A2-Raster uebernommen

Er tut dabei bewusst nur diese Dinge:

1. die einzige `power_exponent_release`-Grenze finden
2. die reale Landing-Struktur direkt nach dieser Grenze lesen
3. ab genau dieser Struktur einen isolierten A2-Probelauf starten
4. aus dessen erster Projektionszeile die echte Reihenfolge der Zieltermspuren lesen
5. fuer diese Spuren einmalig kompakte Landing-Slots auf der normalen Achse vergeben

Die Zugehoerigkeit wird aus den kanonischen Kindrollen gelesen:
`content`, `baseContent`, `exponentNodes`, `numerator`, `denominator`,
`factors`, `operators`, `terms`, `minuend`, `subtrahend` und `degreeNodes`.
Die Reihenfolge und konkrete Zellzahl kommen danach ausschliesslich aus der
atomaren P4-Projektionszeile. Sichtbare Operator- und Schalenzellen sind eigene
Landing-Spuren.
Explizit unsichtbare P4-Huellezellen bleiben im Core-Zellprofil erhalten,
werden aber nicht zu sichtbaren `term_slots`. Der Adapter liest dafuer nur
Zellen mit `isVisible !== false` und trifft selbst keine Sichtbarkeitsentscheidung.
So wird beispielsweise die eine Boundary-Spur `2*x-1` in der Landing-Zeile
zu den fuenf Slots `2`, `*`, `x`, `-`, `1`.
Eine innere Potenz, Gruppe oder andere Schale bleibt dadurch anhand ihrer echten
P4-Zellen erhalten. Der Adapter darf bei einer Anzahlabweichung weder buendeln noch auffuellen,
sondern muss den fehlerhaften Produzenten sichtbar machen.
6. die Daten in den Vertragsraum `landing_profile` uebersetzen

Er tut dabei ausdruecklich **nicht**:

- eine neue Log-Zeile frei erfinden
- die Gleichung erneut parsen
- A1-Spaltenblindflug in A2 weiterziehen
- einen zweiten Positionssprung vorbereiten
- eine alte Hochstellungs- oder Basisspalte als Leerraum in A2 reservieren
