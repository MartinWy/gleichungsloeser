export const USER_VISIBILITY_CONTROL_DEFINITIONS = Object.freeze([
    {
        key: "hiddenStepIndexes",
        controlType: "step-visibility",
        label: "Zeilen",
        summaryPattern: "Zeile {index}",
        disclosureMode: "details-per-row",
        atomPreview: "expandable",
        preserveLayoutGap: true
    }
]);

export const USER_VISIBILITY_INVARIANTS = Object.freeze([
    "Unsichtbare Zeilen ruecken nicht nach oben.",
    "Zeilenschalter arbeiten pro Solverzeile.",
    "Atomlisten werden nur als Aufklappdetail gezeigt."
]);
