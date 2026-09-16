# Complex Expression Rendering

Reines Seitenprojekt fuer das Setzen hochgradig komplexer Ausdruecke.

Ziel:
- komplexe verschachtelte Ausdruecke sauber setzen
- ohne jeden Eingriff in den aktuellen Gleichungsloeser-Stand
- ohne A, B oder den bestehenden Renderer zu ueberschreiben

Status:
- dieses Projekt ist bewusst isoliert
- vorhandenes Wissen darf kopiert werden
- bestehender Code darf hier nur als Referenz dienen, nicht als Ziel fuer Eingriffe

Erster Referenzfall:
- `examples/example_001_nested_root_fraction.json`
- LaTeX:
  `\\sqrt{\\frac{1+b^2}{\\left(\\sqrt{\\left(\\frac{1}{2-a}\\right)}\\right)}}`

Wichtigste Regel:
- Wurzeln, Klammern, Potenzen und Funktionsschalen sind keine Spalten.
- Eine gemeinsame Spalte existiert nur dort, wo Elemente wirklich uebereinander stehen.
- Alle normalen Atome behalten im ganzen Prozess dieselbe Schriftgroesse.
- Es gibt genau zwei Groessen:
  normale Atome und Exponenten.

Praktische Folge:
- dieses Projekt denkt nicht in einem globalen Spaltenraster
- dieses Projekt denkt in lokalen Stapeln, Schalen und Schachtelungen
- Wurzeln und Klammern werden nicht aus Zellen gebaut, sondern ueber bereits gesetzte Inhalte projiziert

Artefakte:
- Referenzfaelle liegen in `examples/`
- Golden-Reference-Ausgaben werden nach `reference_outputs/` geschrieben
- der Standalone-Referenzrenderer ist `render_reference_latex.mjs`
- die frueheren Root- und Group-Debugpfade waren an rekonstruktive
  Renderer-Kernel-Prototypen gebunden und liegen seit dem 10. September 2026
  unter `alt/2026-09-10_pre_atomic_renderer_kernel/`
