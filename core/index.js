import { Atomisierer } from './P1_Eingabe/Regelwerk.js';
import { PfadFinder } from './P2_Strategie_Analyse/PfadFinder.js';
import { Umformer } from './P3_Umformung/Regelwerk.js';
import { clone } from './clone.js';
import { normalizeSolveOptions, validateSolveOptions } from './solveOptions.js';
import { buildSolveProjectionOutput } from './solveProjectionOutput.js';
import { runGenesisRuntime } from './GenesisRuntime/index.js';
import { buildLegacySolveResultFromGenesisRuntime } from './GenesisRuntime/LegacySolveAdapter.js';
import { normalizeEquationOuterGroups } from './shared/redundantOuterGroups.js';
import {
    analyzeEquationSide,
    resolveTargetVariable,
    splitEquationSides,
    validateCoreTargetOccurrence
} from './solveTargeting.js';

const GenesisCore = {
    async solve(equation, options = {}) {
        try {
            const solveOptions = normalizeSolveOptions(options);
            validateSolveOptions(solveOptions);

            if (solveOptions.runtimeEngine === "genesis_runtime") {
                const runtimeResult = await runGenesisRuntime(equation, {
                    targetVariable: solveOptions.targetVariable
                });

                return buildLegacySolveResultFromGenesisRuntime(runtimeResult);
            }

            let currentStruktur = Atomisierer.process(equation);
            if (!Array.isArray(currentStruktur)) currentStruktur = [currentStruktur];
            currentStruktur = normalizeEquationOuterGroups(currentStruktur);

            const targetVariable = resolveTargetVariable(currentStruktur, solveOptions);
            validateCoreTargetOccurrence(currentStruktur, targetVariable);
            const initialStruktur = clone(currentStruktur);
            const history = [];
            let maxSteps = 10;

            while (maxSteps > 0) {
                const equationSideAnalysis = analyzeEquationSide(currentStruktur, targetVariable);
                const equationSide = equationSideAnalysis.side;
                const { left, right } = splitEquationSides(currentStruktur);

                if (equationSideAnalysis.state === "both") {
                    throw new Error(
                        `Die Zielvariable "${targetVariable}" steht auf beiden Gleichungsseiten. `
                        + "Der aktive Kern verarbeitet nur Gleichungen, in denen die Zielvariable genau einmal vorkommt."
                    );
                }

                if (!equationSide) {
                    break;
                }

                const aktiveSeite = equationSide === 'right' ? right : left;
                const entscheidung = PfadFinder.findeNaechsteAktion(aktiveSeite, { targetVariable });
                const aktiveGrenze = PfadFinder.erkenneAktiveSchalenGrenze(aktiveSeite, targetVariable);

                if (!entscheidung) {
                    if (aktiveGrenze?.message) {
                        throw new Error(aktiveGrenze.message);
                    }

                    break;
                }

                if (
                    aktiveGrenze?.code === "TARGET_IN_EXPONENT"
                    && ["power_exponent_release", "power_base_release"].includes(entscheidung.family)
                ) {
                    break;
                }

                entscheidung.equationSide = equationSide;
                entscheidung.oppositeEquationSide = equationSide === 'right' ? 'left' : 'right';
                entscheidung.targetVariable = targetVariable;

                currentStruktur = Umformer.invertiere(currentStruktur, entscheidung, solveOptions);

                history.push({
                    strategie: clone(entscheidung),
                    struktur: clone(currentStruktur)
                });

                maxSteps--;
            }

            const {
                projectedSteps,
                finaleStruktur,
                exportData
            } = buildSolveProjectionOutput({
                equation,
                targetVariable,
                initialStruktur,
                history,
                currentStruktur,
                projectionEngine: solveOptions.projectionEngine
            });

            return {
                eingabe: equation,
                targetVariable,
                finaleStruktur,
                schritte: projectedSteps,
                exportData
            };
        } catch (e) {
            return { fehler: e.message };
        }
    }
};

export default GenesisCore;
