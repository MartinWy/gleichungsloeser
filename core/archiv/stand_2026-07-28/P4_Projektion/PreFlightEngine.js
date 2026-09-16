import { planSemanticTracks } from "./TrackLayoutPlanner.js";
import { planVerticalTracks } from "./VerticalTrackPlanner.js";

export function generateGlobalLayout(theoryRows) {
    const semanticLayout = planSemanticTracks(theoryRows);
    const verticalLayout = planVerticalTracks(theoryRows);

    return {
        mode: 'two_pass_preflight',
        rowCount: theoryRows.length,
        ...semanticLayout,
        rows: semanticLayout.rows.map((row, index) => ({
            ...row,
            baselineRow: verticalLayout.rows[index]?.baselineRow ?? index
        }))
    };
}
