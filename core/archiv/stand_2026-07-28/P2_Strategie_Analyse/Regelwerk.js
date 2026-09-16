export class Schalen_Analysierer {
    static ermittleAeussereSchale(atome, zielVariable = 'x') {
        const ankerIndex = atome.findIndex(a => a.value === '=');
        const zielSeite = atome.slice(0, ankerIndex).some(a => a.value === zielVariable) 
                          ? atome.slice(0, ankerIndex) 
                          : atome.slice(ankerIndex + 1);

        // Suche nach Multiplikation außerhalb von Klammern
        // Beispiel: (2x - 1) * 3
        const multIndex = zielSeite.findLastIndex(a => a.value === '*');
        if (multIndex !== -1) {
            const operator = zielSeite[multIndex];
            // Wir identifizieren den Faktor (hier die 3) als Operand der Schale
            const operand = zielSeite[multIndex + 1];
            
            return { 
                operator: operator, 
                operand: operand, 
                typ: 'R2-TRANSFORM',
                kontext: 'KLAMMER_AUFLOESUNG'
            };
        }

        // Standard-Arithmetik Fallback...
        return null;
    }
}
