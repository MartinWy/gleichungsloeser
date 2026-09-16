// Am 10. September 2026 als vorkanonischer Test archiviert.
import { projectToGrid } from '../../core/topology/layout_engine.js';

const mockAtoms = [
  { id: "10", val: "10", isVisible: false },
  { id: "mult", val: "*", isVisible: false },
  { id: "x", val: "x", isVisible: true },
  { id: "eq", val: "=", isVisible: true },
  { id: "res", val: "25", isVisible: true }
];

const result = projectToGrid(mockAtoms);
console.log("ECHTES SYSTEM-ERGEBNIS (Layout):");
console.table(result.filter(a => a.isVisible).map(a => ({ id: a.id, val: a.val, col: a.col })));

const xPosition = result.find(a => a.id === 'x').col;
if (xPosition === 0) {
  console.log("CHECK: Kollaps erfolgreich. 'x' ist an Position 0.");
} else {
  console.error("FAIL: 'x' ist an Position " + xPosition);
  process.exit(1);
}
