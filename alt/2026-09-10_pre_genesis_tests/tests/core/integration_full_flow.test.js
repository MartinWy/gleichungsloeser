// Am 10. September 2026 als vorkanonischer Test archiviert.
import { transformMultiplicationToDenominator } from '../../core/transformation/fraction_logic.js';
import { projectToGrid } from '../../core/topology/layout_engine.js';

// 1. Setup: Startzustand 10 * x = 25
const initialAtoms = [
  { id: "atom-num-10", val: "10", type: "number", isVisible: true },
  { id: "atom-op-mult", val: "*", type: "operator", isVisible: true },
  { id: "atom-var-x", val: "x", type: "variable", isVisible: true },
  { id: "atom-op-eq", val: "=", type: "operator", isVisible: true },
  { id: "atom-num-25", val: "25", type: "number", isVisible: true, id_ref: "res" } // Markierung als Ergebnis-Zähler
];

console.log("🚀 Starte Integrationstest: Full Flow...");

// 2. Transformation (Phase 2)
// Wir simulieren den Schritt: /10 auf beiden Seiten
const transformedAtoms = transformMultiplicationToDenominator(initialAtoms, "atom-num-10");

// 3. Topologie-Mapping (Phase 3)
const finalGrid = projectToGrid(transformedAtoms);

// 4. Validierung der Kette
console.log("FINALES GITTER-PROTOKOLL:");
console.table(finalGrid.filter(a => a.row !== -1).map(a => ({
  val: a.val,
  row: a.row,
  col: a.col,
  visible: a.isVisible
})));

// Check 1: Ist das x am Anfang?
const xAtom = finalGrid.find(a => a.val === 'x');
const isXFirst = xAtom.col === 0;

// Check 2: Ist der Bruch vertikal zentriert unter der 25?
const resCol = finalGrid.find(a => a.id_ref === 'res').col;
const lineCol = finalGrid.find(a => a.id === 'fraction-line-res').col;
const denCol = finalGrid.find(a => a.position === 'denominator').col;

if (isXFirst && resCol === lineCol && lineCol === denCol) {
  console.log("✅ INTEGRATION ERFOLGREICH: Logik und Topologie sind synchron.");
} else {
  console.error("❌ INTEGRATION FEHLGESCHLAGEN: Versatz im Gitter detektiert.");
  process.exit(1);
}
