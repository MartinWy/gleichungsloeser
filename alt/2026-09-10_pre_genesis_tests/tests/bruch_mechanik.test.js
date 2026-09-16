// Am 10. September 2026 als vorkanonischer Test archiviert.
import { solver } from '../core/2_Umformung/Regelwerk.js';

// Simulation: 2 * x = 10 -> x = 10 / 2
const initialRow = { 
  left: { type: 'multiplication', factor: '2', variable: 'x' }, 
  right: { type: 'atom', value: '10' }, 
  target: 'x'
};

const result = solver.applyInverse(initialRow);

console.log('--- Transformation Ergebnis ---');
console.log('Zähler Gegenseite:', result.right.numerator);
console.log('Nenner Gegenseite (Ex-Faktor):', result.right.denominator);
