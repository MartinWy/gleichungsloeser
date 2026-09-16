// Am 10. September 2026 als vorkanonischer Test archiviert.
import { projectToGrid } from '../core/3_Projektion/Regelwerk.js';

function testVerticalAlignment() {
    console.log("--- START: Test Topologie (Vertikales Alignment) ---");
    
    const mockAtoms = [
        { id: "x", val: "x", isVisible: true },
        { id: "eq", val: "=", isVisible: true },
        { id: "res", val: "10", isVisible: true, id_ref: "res" },
        { id: "fraction-line-res", val: "---", isVisible: true },
        { id: "denominator", val: "2", isVisible: true, position: 'denominator' }
    ];

    const result = projectToGrid(mockAtoms);
    
    const res = result.find(a => a.id === 'res');
    const den = result.find(a => a.id === 'denominator');
    const line = result.find(a => a.id === 'fraction-line-res');

    console.log(`Zähler (res) Position: Row ${res.row}, Col ${res.col}`);
    console.log(`Bruchstrich Position: Row ${line.row}, Col ${line.col}`);
    console.log(`Nenner Position: Row ${den.row}, Col ${den.col}`);

    if (res.col === den.col && res.col === line.col && res.row === 0 && line.row === 1 && den.row === 2) {
        console.log("PASS: Vertikale Symmetrie und Alignment gewährleistet.");
    } else {
        console.log("FAIL: Alignment-Fehler.");
        process.exit(1);
    }
    console.log("--- TEST ENDE ---");
}

testVerticalAlignment();
