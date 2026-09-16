/**
 * P4_Projektion: Loch-Logik und Sichtbarkeitsmapping fuer aktive Familien.
 * Aktuell produktiv: group_release, additive Richtungen, Bruchrichtungen, `trig_inverse`, `inverse_trig` und `root_power`.
 */
export class Projektor {
    static berechneGrid(struktur) {
        return struktur.map((element) => {
            const istVerborgeneSpur = element.isVisible === false && element.type !== "ANCHOR";

            if (istVerborgeneSpur) {
                return { ...element, visualMode: "GHOST_HOLE" };
            }

            if (element.isBefreit) {
                return { ...element, visualMode: "EMERGED" };
            }

            if (["DIVISION", "MULTIPLICATION", "ADDITION", "SUBTRACTION", "FUNCTION", "ROOT", "POWER", "NEGATION"].includes(element.type) && element.isGenerated === true) {
                return { ...element, visualMode: "INVERSE_SHELL" };
            }

            return element;
        });
    }
}
