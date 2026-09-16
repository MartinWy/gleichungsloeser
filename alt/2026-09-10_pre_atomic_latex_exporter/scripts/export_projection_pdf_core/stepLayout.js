import { estimateRenderNodeHeight } from "../../components/Arbeitsblatt_Druckansicht/renderVerticalGeometry.js";

function estimateCellsHeight(cells = []) {
    return Math.max(1.1, ...cells.map((cell) => estimateRenderNodeHeight(cell.renderNode)));
}

function resolveFractionDisplayGap(profile = {}) {
    const numeratorGapEm = Number(profile?.fractionDisplayEm?.numeratorGapEm);
    const denominatorGapEm = Number(profile?.fractionDisplayEm?.denominatorGapEm);

    return {
        numeratorGapEm: Number.isFinite(numeratorGapEm) && numeratorGapEm >= 0 ? numeratorGapEm : 0.14,
        denominatorGapEm: Number.isFinite(denominatorGapEm) && denominatorGapEm >= 0 ? denominatorGapEm : 0.18
    };
}

function estimateFractionFormulaHeight(step, line, profile = {}) {
    const colStart = Number.isInteger(line.colStart) ? line.colStart : line.col;
    const colEnd = Number.isInteger(line.colEnd) ? line.colEnd : line.col;
    const numerator = step.cells.filter((cell) => (
        cell.row === line.row - 1
        && cell.col >= colStart
        && cell.col <= colEnd
        && cell.kind !== "fraction_line"
    ));
    const denominator = step.cells.filter((cell) => (
        cell.row === line.row + 1
        && cell.col >= colStart
        && cell.col <= colEnd
        && cell.kind !== "fraction_line"
    ));
    const { numeratorGapEm, denominatorGapEm } = resolveFractionDisplayGap(profile);

    return estimateCellsHeight(numerator) + estimateCellsHeight(denominator) + 0.61 + numeratorGapEm + denominatorGapEm;
}

function estimateStepHeight(step, profile = {}) {
    const fractionHeights = step.cells
        .filter((cell) => cell.kind === "fraction_line")
        .map((line) => estimateFractionFormulaHeight(step, line, profile));
    const cellHeights = step.cells
        .filter((cell) => cell.kind !== "fraction_line")
        .map((cell) => estimateRenderNodeHeight(cell.renderNode));
    const metricHeights = (step.rowMetrics || []).map((metric) => metric?.minHeightEm || 0);
    const rowMetricHeight = metricHeights.length > 0 ? metricHeights.reduce((sum, value) => sum + value, 0) : 0;

    return Math.max(1.45, rowMetricHeight, ...fractionHeights, ...cellHeights);
}

function resolveInterStepGapRows(viewModel, defaultGapEm = 0.95) {
    const stepCount = Array.isArray(viewModel?.steps) ? viewModel.steps.length : 0;
    if (stepCount <= 1) {
        return [];
    }

    const gapAfterStep = Array.from({ length: stepCount - 1 }, () => defaultGapEm);
    const layoutRows = Array.isArray(viewModel?.layout?.rows) ? viewModel.layout.rows : [];

    layoutRows
        .filter((row) => row?.kind === "step_gap" && Number.isInteger(row?.stepIndex))
        .forEach((row) => {
            const stepIndex = row.stepIndex;
            if (stepIndex < 0 || stepIndex >= gapAfterStep.length) {
                return;
            }

            const gapHeightEm = Number(row?.minHeightEm);
            if (Number.isFinite(gapHeightEm) && gapHeightEm >= 0) {
                gapAfterStep[stepIndex] = gapHeightEm;
            }
        });

    return gapAfterStep;
}

export function buildStepLayout(viewModel, profile = {}) {
    const heights = viewModel.steps.map((step) => estimateStepHeight(step, profile));
    const yByStep = [];
    const defaultStepGapEm = Number(profile?.stepGapEm);
    const resolvedDefaultStepGapEm = Number.isFinite(defaultStepGapEm) && defaultStepGapEm >= 0
        ? defaultStepGapEm
        : 0.95;
    const gapAfterStep = resolveInterStepGapRows(viewModel, resolvedDefaultStepGapEm);

    heights.forEach((height, index) => {
        if (index === 0) {
            yByStep.push(1 + (height / 2));
            return;
        }

        const interStepGapEm = gapAfterStep[index - 1] ?? resolvedDefaultStepGapEm;
        yByStep.push(yByStep[index - 1] + (heights[index - 1] / 2) + (height / 2) + interStepGapEm);
    });

    return {
        heights,
        yByStep,
        bottom: (yByStep[yByStep.length - 1] || 1) + ((heights[heights.length - 1] || 1.45) / 2) + 0.9
    };
}
