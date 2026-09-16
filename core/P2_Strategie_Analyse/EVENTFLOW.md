# P2 Eventflow

1. Die analysierte Struktur wird im aktiven Kern auf genau der Gleichungsseite gelesen, auf der die aktiv gewaehlte Zielvariable liegt.
2. Es werden nur sichtbare top-level Elemente beruecksichtigt.
3. Wenn auf der aktiven Gleichungsseite genau eine sichtbare `GROUP` liegt und ihr Inhalt die Zielvariable traegt, baut P2 zuerst eine Familien-Decision fuer `group_release`.
4. Danach prueft P2 eine sichtbare top-level `NEGATION` als eigene Familie `negative_sign_release`.
5. Danach prueft P2 aeussere additive Richtungen: `addition_release`, `subtraction_release` und `subtrahend_release`.
6. Danach prueft P2 multiplikative Richtungen: `fraction_birth` und `fraction_collapse`.
7. Danach prueft P2 gerichtete trigonometrische Umkehrungen: `trig_inverse` und `inverse_trig`.
8. Danach prueft P2 `root_power` fuer sichtbare variabletragende `ROOT`- oder `POWER`-Schalen.
9. Falls keine zulaessige sichtbare Familie gefunden wird, liefert `P2` `null`.
