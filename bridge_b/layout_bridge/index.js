import { BRIDGE_VARIANT_RULES } from "../../contracts/bridge_state/index.js";

export const BRIDGE_LAYOUT_INVARIANTS = Object.freeze([
    "Das Gleichheitszeichen bleibt ortsfest.",
    "Der carry-through-Ausdruck bleibt mathematisch unveraendert.",
    "Der geoeffnete Exponenteninhalt landet sofort in der Startlage des Folgesystems.",
    "Es gibt keinen zweiten Positionssprung nach der Landung.",
    "Alte Leer- und Reservespalten duerfen keine neuen Abstaende erzwingen."
]);

export const BRIDGE_LAYOUT_PHASES = Object.freeze([
    {
        id: "read-boundary-state",
        description: "Grenzzustand mit Exponentenschale lesen."
    },
    {
        id: "read-landing-profile",
        description: "Zielprofil der ersten echten Zeile des Folgesystems lesen."
    },
    {
        id: "pin-equals-anchor",
        description: "Gleichheitszeichen auf seinem Anker fixieren."
    },
    {
        id: "rewrite-operator-story",
        description: "Basisgeschichte in die Logarithmusgeschichte ueberfuehren."
    },
    {
        id: "land-content-story",
        description: "Exponenteninhalt in die Zielslots des Folgesystems setzen."
    },
    {
        id: "emit-landing-state",
        description: "Erste echte A2-Zeile ausgeben."
    }
]);

export function buildBridgeLayoutManifest() {
    return {
        invariants: BRIDGE_LAYOUT_INVARIANTS,
        phases: BRIDGE_LAYOUT_PHASES,
        variants: BRIDGE_VARIANT_RULES
    };
}
