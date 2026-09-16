// Am 10. September 2026 als vorkanonischer Test archiviert.
import { projectToGrid } from '../../core/topology/layout_engine.js';

// Setup: Die Ausgangslage nach der logischen Verschiebung von (10+5)
// Das System muss nun 100 / (2 * (10+5)) rendern.
const monsterAtoms = [
  { id: "p1", val: "(", isVisible: false },
  { id: "n10", val: "10", isVisible: false },
  { id: "plus", val: "+", isVisible: false },
  { id: "n5", val: "5", isVisible: false },
  { id: "p2", val: ")", isVisible: false },
  { id: "mult", val: "*", isVisible: false },
  { id: "var-x", val: "x", isVisible: true },
  { id: "eq", val: "=", isVisible: true },
  { id: "res-num", val: "100", isVisible: true, id_ref: "res" },
  { id: "res-line", val: "---", isVisible: true, id_ref: "res-line" },
  { id: "res-den", val: "2", isVisible: true, position: 'denominator' },
  { id: "op-mult-new", val: "*", isVisible: true, position: 'denominator' },
  { id: "moved-group", val: "(10+5)", isVisible: true, position: 'denominator' }
];

console.log("🧪 MONSTER-STRESS-TEST: Vertikale Stapelung komplexer Nenner...");

const finalGrid = projectToGrid(monsterAtoms);

console.log("ERGEBNIS-KOORDINATEN:");
console.table(finalGrid.filter(a => a.isVisible).map(a => ({
  val: a.val,
  row: a.row,
  col: a.col
})));

// Validierung: Sind alle Nenner-Teile (2, *, (10+5)) unter der 100?
const resCol = finalGrid.find(a => a.id === 'res-num').col;
const componentsUnder = finalGrid.filter(a => a.position === 'denominator');
const allAligned = componentsUnder.every(a => a.col === resCol);

if (allAligned) {
  console.log("✅ SKALIERUNG ERFOLGREICH: Komplexe Nenner-Gruppen halten die Spalte.");
} else {
  console.error("❌ ARCHITEKTUR-BRUCH: Nenner-Elemente driften horizontal ab!");
  process.exit(1);
}
