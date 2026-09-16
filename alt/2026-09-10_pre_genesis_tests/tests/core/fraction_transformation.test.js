// Am 10. September 2026 als vorkanonischer Test archiviert.
import { FractionLogic } from '../../core/transformation/fraction_logic.js';
import assert from 'node:assert';

/**
 * Test: Bruch-Transformation (Multiplikation -> Nenner)
 * Referenz: Step Semantics / Genesis (Kein Kehrbruch, nur Abbau)
 */

console.log("▶ Running Test: Multiplication Displacement (to Denominator)...");

try {
    // 1. Setup Mock-Data (10 * x = 25)
    const atome = [
        { id: 'atom-number-0', value: '10', type: 'NUMBER', isVisible: true },
        { id: 'atom-operator-1', value: '*', type: 'OPERATOR', isVisible: true },
        { id: 'atom-variable-2', value: 'x', type: 'VARIABLE', isVisible: true },
        { id: 'atom-anchor-3', value: '=', type: 'ANCHOR', isVisible: true },
        { id: 'atom-number-4', value: '25', type: 'NUMBER', isVisible: true }
    ];

    const schale = {
        operator: atome[1], // Der '*'
        operand: atome[0],  // Die '10'
        typ: 'R2-TRANSFORM'
    };

    // 2. Transformation ausführen
    const ergebnis = FractionLogic.transformMultiplicationToDenominator(atome, schale);

    // 3. Assertions
    // Die Quell-Atome müssen unsichtbar sein (Löcher)
    assert.strictEqual(ergebnis.find(a => a.id === 'atom-number-0').isVisible, false, "10 sollte unsichtbar sein");
    assert.strictEqual(ergebnis.find(a => a.id === 'atom-operator-1').isVisible, false, "* sollte unsichtbar sein");

    // Die Zielvariable muss stabil bleiben
    assert.strictEqual(ergebnis.find(a => a.id === 'atom-variable-2').isVisible, true, "x muss sichtbar bleiben");

    // Die Gegenseite muss den inversen Operator und den Operanden enthalten
    const invOp = ergebnis.find(a => a.value === '/');
    const movedNum = ergebnis.find(a => a.value === '10' && a.isVisible === true);

    assert.ok(invOp, "Inverser Operator / fehlt");
    assert.ok(movedNum, "Verschobener Operand 10 fehlt auf der Gegenseite");
    assert.strictEqual(movedNum.id, 'moved-atom-number-0', "ID-Tracking für verschobene Atome korrupt");

    console.log("✅ Test erfolgreich: Multiplikation wurde in Nenner der Gegenseite verschoben.");

} catch (e) {
    console.error("❌ Test fehlgeschlagen:", e.message);
    process.exit(1);
}
