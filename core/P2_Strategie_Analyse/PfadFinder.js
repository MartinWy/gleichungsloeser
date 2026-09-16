/**
 * P2_Strategie_Analyse: aktive Familienentscheidungen fuer die aktuelle Kernspur.
 * Aktuell produktiv: group_release, negative Vorzeichenschalen, additive Richtungen, Bruchrichtungen, `trig_inverse`, `inverse_trig` und `root_power`.
 * Der produktive Kern arbeitet derzeit mit genau einer aktiv gewaehlten Zielvariable.
 */
import { normalizeEquationOuterGroups } from "../shared/redundantOuterGroups.js";

export class PfadFinder {
    static sichtbareElemente(struktur = []) {
        return (struktur || []).filter((element) => element && element.isVisible !== false);
    }

    static istMultiplikativerTraeger(element) {
        return Boolean(
            element
            && element.isVisible !== false
            && !["ANCHOR", "OPERATOR"].includes(element.type)
        );
    }

    static enthaeltZielvariable(element, targetVariable = "x") {
        if (!element) {
            return false;
        }

        if (element.type === "VARIABLE") {
            return element.value === targetVariable;
        }

        const nestedCollections = [
            element.content,
            element.numerator,
            element.denominator,
            element.factor,
            element.passive,
            element.exponentNodes
        ].filter(Array.isArray);
        return nestedCollections.some((collection) => collection.some((kind) => this.enthaeltZielvariable(kind, targetVariable)));
    }

    static enthaeltZielvariableInCollection(collection, targetVariable = "x") {
        return Array.isArray(collection) && collection.some((element) => this.enthaeltZielvariable(element, targetVariable));
    }

    static istPassiverAusdruck(element, targetVariable = "x") {
        if (!element || element.isVisible === false) {
            return false;
        }

        if (["ANCHOR", "OPERATOR"].includes(element.type)) {
            return false;
        }

        return !this.enthaeltZielvariable(element, targetVariable);
    }

    static istNichtLeereSegment(collection) {
        return Array.isArray(collection) && collection.length > 0;
    }

    static hatNumerischenExponent(element) {
        return typeof element?.exponent === "number" && Number.isFinite(element.exponent);
    }

    static istTrigonometrischeQuellfunktion(name) {
        return ["sin", "cos", "tan"].includes(name);
    }

    static trigInverseMeta(name) {
        return {
            sin: { inverseName: "asin", action: "INVERT_TO_ASIN", label: "Sinus invertieren" },
            cos: { inverseName: "acos", action: "INVERT_TO_ACOS", label: "Kosinus invertieren" },
            tan: { inverseName: "atan", action: "INVERT_TO_ATAN", label: "Tangens invertieren" }
        }[name] || null;
    }

    static istInverseTrigonometrischeQuellfunktion(name) {
        return ["asin", "acos", "atan"].includes(name);
    }

    static inverseTrigMeta(name) {
        return {
            asin: { inverseName: "sin", action: "INVERT_TO_SIN", label: "Arkussinus invertieren" },
            acos: { inverseName: "cos", action: "INVERT_TO_COS", label: "Arkuskosinus invertieren" },
            atan: { inverseName: "tan", action: "INVERT_TO_TAN", label: "Arkustangens invertieren" }
        }[name] || null;
    }

    static sammleSegmentIds(collection) {
        return (collection || []).filter(Boolean).map((element) => element.id).filter(Boolean);
    }

    static istMultiplikationsKette(struktur = []) {
        const sichtbareElemente = this.sichtbareElemente(struktur);

        if (sichtbareElemente.length < 3 || sichtbareElemente.length % 2 === 0) {
            return false;
        }

        return sichtbareElemente.every((element, index) => {
            if (index % 2 === 1) {
                return element?.type === "OPERATOR" && element.value === "*";
            }

            return this.istMultiplikativerTraeger(element);
        });
    }

    static zerlegeMultiplikationsKette(struktur = []) {
        const sichtbareElemente = this.sichtbareElemente(struktur);

        if (!this.istMultiplikationsKette(sichtbareElemente)) {
            return null;
        }

        return {
            factors: sichtbareElemente.filter((_, index) => index % 2 === 0),
            operators: sichtbareElemente.filter((_, index) => index % 2 === 1)
        };
    }

    static erkenneAktiveSchalenGrenze(struktur, targetVariable = "x") {
        const exponentPower = (struktur || []).find((element) =>
            element?.type === "POWER"
            && element.isVisible !== false
            && this.enthaeltZielvariableInCollection(element.exponentNodes, targetVariable)
            && !this.enthaeltZielvariableInCollection(element.content, targetVariable)
        );

        if (exponentPower) {
            return {
                code: "TARGET_IN_EXPONENT",
                message: `Die Zielvariable "${targetVariable}" liegt im Exponenten einer sichtbaren POWER-Schale. Diese Richtung geht an Bridge B ueber.`
            };
        }

        const divisionShell = (struktur || []).find((element) =>
            element?.type === "DIVISION"
            && element.isVisible !== false
            && !this.enthaeltZielvariableInCollection(element.numerator, targetVariable)
            && this.enthaeltZielvariableInCollection(element.denominator, targetVariable)
        );

        if (!divisionShell) {
            return null;
        }

        return {
            code: "TARGET_IN_DENOMINATOR",
            message: `Die Zielvariable "${targetVariable}" liegt im Nenner einer sichtbaren DIVISION-Schale. Diese Richtung ist noch nicht aktiviert.`
        };
    }

    static findeGroupReleaseAktion(struktur, targetVariable = "x") {
        const sichtbareElemente = (struktur || []).filter((element) => element && element.isVisible !== false);
        if (sichtbareElemente.length !== 1) {
            return null;
        }

        const gruppe = sichtbareElemente[0];
        if (gruppe.type !== "GROUP" || !this.enthaeltZielvariable(gruppe, targetVariable)) {
            return null;
        }

        const targetExpressionIds = this.sammleSegmentIds(gruppe.content || []);
        if (targetExpressionIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "group_release",
            targetId: gruppe.id,
            targetExpressionIds,
            sourceType: "GROUP",
            inverseType: "EXPLICIT_CONTENT",
            action: "RELEASE_GROUP_CONTENT",
            label: "Gruppe freilegen",
            argumentScope: "active_side_only"
        };
    }


    static findeNegativeSignReleaseAktion(struktur, targetVariable = "x") {
        const sichtbareElemente = (struktur || []).filter((element) => element && element.isVisible !== false);
        if (sichtbareElemente.length !== 1) {
            return null;
        }

        const negationShell = sichtbareElemente[0];
        if (negationShell.type !== "NEGATION" || !this.enthaeltZielvariable(negationShell, targetVariable)) {
            return null;
        }

        const targetExpressionIds = this.sammleSegmentIds(negationShell.content || []);
        if (targetExpressionIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "negative_sign_release",
            targetId: negationShell.id,
            targetExpressionIds,
            sourceType: "NEGATION",
            inverseType: "NEGATION",
            action: "MOVE_NEGATIVE_SIGN_TO_OPPOSITE_SIDE",
            label: "Vorzeichen umklappen",
            argumentScope: "whole_opposite_side"
        };
    }

    static findeNegierteMultiplikationsDivisionAktion(struktur, targetVariable = "x") {
        const sichtbareElemente = this.sichtbareElemente(struktur);
        if (sichtbareElemente.length !== 1) {
            return null;
        }

        const negationShell = sichtbareElemente[0];
        if (
            negationShell?.type !== "NEGATION"
            || negationShell.isVisible === false
            || !this.enthaeltZielvariable(negationShell, targetVariable)
        ) {
            return null;
        }

        const multiplicationChain = this.zerlegeMultiplikationsKette(negationShell.content || []);
        if (!multiplicationChain) {
            return null;
        }

        const targetFactors = multiplicationChain.factors.filter((factor) => this.enthaeltZielvariable(factor, targetVariable));
        const passiveFactors = multiplicationChain.factors.filter((factor) => !this.enthaeltZielvariable(factor, targetVariable));

        if (
            targetFactors.length !== 1
            || passiveFactors.length === 0
            || !passiveFactors.every((factor) => this.istPassiverAusdruck(factor, targetVariable))
        ) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "fraction_birth",
            targetId: targetFactors[0].id,
            targetExpressionIds: [targetFactors[0].id],
            containerTargetId: negationShell.id,
            passiveExpressionId: passiveFactors[0].id,
            passiveExpressionIds: passiveFactors.map((factor) => factor.id),
            factorId: passiveFactors[0].id,
            operatorId: multiplicationChain.operators[0]?.id || null,
            operatorIds: multiplicationChain.operators.map((operator) => operator.id),
            sourceType: "MULTIPLICATION",
            inverseType: "DIVISION",
            action: "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR",
            label: "Negativen Faktorblock in Nenner",
            argumentScope: "whole_opposite_side",
            wrappedByNegation: true
        };
    }

    static findeAdditionReleaseAktion(struktur, targetVariable = "x") {
        const sichtbareStruktur = this.sichtbareElemente(struktur);

        for (let index = 1; index < sichtbareStruktur.length - 1; index += 1) {
            const operator = sichtbareStruktur[index];
            if (!operator || operator.value !== "+" || operator.isVisible === false) {
                continue;
            }

            const leftSegment = sichtbareStruktur.slice(0, index);
            const rightSegment = sichtbareStruktur.slice(index + 1);
            if (!this.istNichtLeereSegment(leftSegment) || !this.istNichtLeereSegment(rightSegment)) {
                continue;
            }

            const leftCarriesTarget = this.enthaeltZielvariableInCollection(leftSegment, targetVariable);
            const rightCarriesTarget = this.enthaeltZielvariableInCollection(rightSegment, targetVariable);
            if (leftCarriesTarget === rightCarriesTarget) {
                continue;
            }

            const targetSide = leftCarriesTarget ? "left" : "right";
            const targetSegment = leftCarriesTarget ? leftSegment : rightSegment;
            const passiveSegment = leftCarriesTarget ? rightSegment : leftSegment;

            if (!passiveSegment.every((element) => this.istPassiverAusdruck(element, targetVariable))) {
                continue;
            }

            const targetExpressionIds = this.sammleSegmentIds(targetSegment);
            const passiveExpressionIds = this.sammleSegmentIds(passiveSegment);
            if (targetExpressionIds.length === 0 || passiveExpressionIds.length === 0) {
                continue;
            }

            return {
                typ: "STRATEGY_DECISION",
                family: "addition_release",
                targetId: targetExpressionIds[0],
                targetExpressionIds,
                passiveExpressionId: passiveExpressionIds[0],
                passiveExpressionIds,
                factorId: passiveExpressionIds[0],
                operatorId: operator.id,
                targetSide,
                sourceType: "ADDITION",
                inverseType: "SUBTRACTION",
                action: "MOVE_PASSIVE_EXPRESSION_TO_SUBTRACTION",
                label: "Ausdruck subtrahieren",
                argumentScope: "whole_opposite_side"
            };
        }

        return null;
    }

    static findeSubtractionReleaseAktion(struktur, targetVariable = "x") {
        const sichtbareStruktur = this.sichtbareElemente(struktur);

        for (let index = 1; index < sichtbareStruktur.length - 1; index += 1) {
            const operator = sichtbareStruktur[index];
            if (!operator || operator.value !== "-" || operator.isVisible === false) {
                continue;
            }

            const leftSegment = sichtbareStruktur.slice(0, index);
            const rightSegment = sichtbareStruktur.slice(index + 1);
            if (!this.istNichtLeereSegment(leftSegment) || !this.istNichtLeereSegment(rightSegment)) {
                continue;
            }

            const leftCarriesTarget = this.enthaeltZielvariableInCollection(leftSegment, targetVariable);
            const rightCarriesTarget = this.enthaeltZielvariableInCollection(rightSegment, targetVariable);
            if (!leftCarriesTarget || rightCarriesTarget) {
                continue;
            }

            if (!rightSegment.every((element) => this.istPassiverAusdruck(element, targetVariable))) {
                continue;
            }

            const targetExpressionIds = this.sammleSegmentIds(leftSegment);
            const passiveExpressionIds = this.sammleSegmentIds(rightSegment);
            if (targetExpressionIds.length === 0 || passiveExpressionIds.length === 0) {
                continue;
            }

            return {
                typ: "STRATEGY_DECISION",
                family: "subtraction_release",
                targetId: targetExpressionIds[0],
                targetExpressionIds,
                passiveExpressionId: passiveExpressionIds[0],
                passiveExpressionIds,
                factorId: passiveExpressionIds[0],
                operatorId: operator.id,
                targetSide: "left",
                sourceType: "SUBTRACTION",
                inverseType: "ADDITION",
                action: "MOVE_PASSIVE_EXPRESSION_TO_ADDITION",
                label: "Ausdruck addieren",
                argumentScope: "whole_opposite_side"
            };
        }

        return null;
    }

    static findeSubtrahendReleaseAktion(struktur, targetVariable = "x") {
        const sichtbareStruktur = this.sichtbareElemente(struktur);

        for (let index = 1; index < sichtbareStruktur.length - 1; index += 1) {
            const operator = sichtbareStruktur[index];
            if (!operator || operator.value !== "-" || operator.isVisible === false) {
                continue;
            }

            const leftSegment = sichtbareStruktur.slice(0, index);
            const rightSegment = sichtbareStruktur.slice(index + 1);
            if (!this.istNichtLeereSegment(leftSegment) || !this.istNichtLeereSegment(rightSegment)) {
                continue;
            }

            const leftCarriesTarget = this.enthaeltZielvariableInCollection(leftSegment, targetVariable);
            const rightCarriesTarget = this.enthaeltZielvariableInCollection(rightSegment, targetVariable);
            if (leftCarriesTarget || !rightCarriesTarget) {
                continue;
            }

            if (!leftSegment.every((element) => this.istPassiverAusdruck(element, targetVariable))) {
                continue;
            }

            const targetExpressionIds = this.sammleSegmentIds(rightSegment);
            const passiveExpressionIds = this.sammleSegmentIds(leftSegment);
            if (targetExpressionIds.length === 0 || passiveExpressionIds.length === 0) {
                continue;
            }

            return {
                typ: "STRATEGY_DECISION",
                family: "subtrahend_release",
                targetId: targetExpressionIds[0],
                targetExpressionIds,
                passiveExpressionId: passiveExpressionIds[0],
                passiveExpressionIds,
                factorId: passiveExpressionIds[0],
                operatorId: operator.id,
                targetSide: "right",
                sourceType: "SUBTRACTION",
                inverseType: "SUBTRACTION",
                action: "MOVE_MINUEND_TO_SUBTRACTION",
                label: "Minuend subtrahieren",
                argumentScope: "whole_opposite_side"
            };
        }

        return null;
    }

    static findeFractionBirthAktion(struktur, targetVariable = "x") {
        const sichtbareStruktur = this.sichtbareElemente(struktur);
        const multiplicationShell = struktur.find((element) =>
            element?.type === "MULTIPLICATION"
            && element.isVisible !== false
            && (
                this.enthaeltZielvariableInCollection(element.content, targetVariable)
                || this.enthaeltZielvariableInCollection(element.factor, targetVariable)
            )
        );

        if (multiplicationShell) {
            const contentCarriesTarget = this.enthaeltZielvariableInCollection(multiplicationShell.content, targetVariable);
            const factorCarriesTarget = this.enthaeltZielvariableInCollection(multiplicationShell.factor, targetVariable);

            if (contentCarriesTarget !== factorCarriesTarget) {
                const targetCollectionKey = contentCarriesTarget ? "content" : "factor";
                const passiveCollectionKey = contentCarriesTarget ? "factor" : "content";
                const targetCollection = Array.isArray(multiplicationShell[targetCollectionKey])
                    ? multiplicationShell[targetCollectionKey]
                    : [];
                const passiveCollection = Array.isArray(multiplicationShell[passiveCollectionKey])
                    ? multiplicationShell[passiveCollectionKey]
                    : [];

                if (passiveCollection.every((element) => this.istPassiverAusdruck(element, targetVariable))) {
                    const targetExpressionIds = this.sammleSegmentIds(targetCollection);
                    const passiveExpressionIds = this.sammleSegmentIds(passiveCollection);

                    if (targetExpressionIds.length > 0 && passiveExpressionIds.length > 0) {
                        return {
                            typ: "STRATEGY_DECISION",
                            family: "fraction_birth",
                            targetId: multiplicationShell.id,
                            targetExpressionIds,
                            targetCollectionKey,
                            passiveCollectionKey,
                            passiveExpressionId: passiveExpressionIds[0],
                            passiveExpressionIds,
                            factorId: passiveExpressionIds[0],
                            sourceType: "MULTIPLICATION",
                            inverseType: "DIVISION",
                            action: "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR",
                            label: "Ausdruck in Nenner",
                            argumentScope: "whole_opposite_side"
                        };
                    }
                }
            }
        }

        const multiplicationChain = this.zerlegeMultiplikationsKette(sichtbareStruktur);
        if (multiplicationChain) {
            const targetFactors = multiplicationChain.factors.filter((factor) => this.enthaeltZielvariable(factor, targetVariable));
            const passiveFactors = multiplicationChain.factors.filter((factor) => !this.enthaeltZielvariable(factor, targetVariable));

            if (
                targetFactors.length === 1
                && passiveFactors.length > 0
                && passiveFactors.every((factor) => this.istPassiverAusdruck(factor, targetVariable))
            ) {
                return {
                    typ: "STRATEGY_DECISION",
                    family: "fraction_birth",
                    targetId: targetFactors[0].id,
                    targetExpressionIds: [targetFactors[0].id],
                    passiveExpressionId: passiveFactors[0].id,
                    passiveExpressionIds: passiveFactors.map((factor) => factor.id),
                    factorId: passiveFactors[0].id,
                    operatorId: multiplicationChain.operators[0]?.id || null,
                    operatorIds: multiplicationChain.operators.map((operator) => operator.id),
                    sourceType: "MULTIPLICATION",
                    inverseType: "DIVISION",
                    action: "MOVE_PASSIVE_EXPRESSION_TO_DENOMINATOR",
                    label: "Ausdruck in Nenner",
                    argumentScope: "whole_opposite_side"
                };
            }
        }

        return null;
    }

    static findeFractionDenominatorReleaseAktion(struktur, targetVariable = "x") {
        const divisionShell = struktur.find((element) =>
            element?.type === "DIVISION"
            && element.isVisible !== false
            && !this.enthaeltZielvariableInCollection(element.numerator, targetVariable)
            && this.enthaeltZielvariableInCollection(element.denominator, targetVariable)
        );

        if (!divisionShell) {
            return null;
        }

        const numerator = Array.isArray(divisionShell.numerator) ? divisionShell.numerator : [];
        const denominator = Array.isArray(divisionShell.denominator) ? divisionShell.denominator : [];

        if (!numerator.every((element) => this.istPassiverAusdruck(element, targetVariable))) {
            return null;
        }

        const numeratorIds = this.sammleSegmentIds(numerator);
        const denominatorIds = this.sammleSegmentIds(denominator);
        if (numeratorIds.length === 0 || denominatorIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "fraction_denominator_release",
            targetId: divisionShell.id,
            targetExpressionIds: denominatorIds,
            passiveExpressionId: denominatorIds[0],
            passiveExpressionIds: denominatorIds,
            factorId: denominatorIds[0],
            sourceType: "DIVISION",
            inverseType: "MULTIPLICATION",
            action: "MOVE_DENOMINATOR_TARGET_TO_FACTOR",
            label: "Nennerziel zu Faktor",
            argumentScope: "whole_opposite_side"
        };
    }

    static findeFractionCollapseAktion(struktur, targetVariable = "x") {
        const divisionShell = struktur.find((element) =>
            element.type === "DIVISION"
            && element.isVisible !== false
            && this.enthaeltZielvariableInCollection(element.numerator, targetVariable)
            && !this.enthaeltZielvariableInCollection(element.denominator, targetVariable)
        );

        if (!divisionShell) {
            return null;
        }

        const denominator = Array.isArray(divisionShell.denominator) ? divisionShell.denominator : [];
        if (!denominator.every((element) => this.istPassiverAusdruck(element, targetVariable))) {
            return null;
        }

        const numeratorIds = this.sammleSegmentIds(divisionShell.numerator);
        const denominatorIds = this.sammleSegmentIds(denominator);
        if (numeratorIds.length === 0 || denominatorIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "fraction_collapse",
            targetId: divisionShell.id,
            targetExpressionIds: numeratorIds,
            passiveExpressionId: denominatorIds[0],
            passiveExpressionIds: denominatorIds,
            factorId: denominatorIds[0],
            sourceType: "DIVISION",
            inverseType: "MULTIPLICATION",
            action: "MOVE_DENOMINATOR_EXPRESSION_TO_FACTOR",
            label: "Nennerausdruck zu Faktor",
            argumentScope: "whole_opposite_side"
        };
    }

    static findeTrigInverseAktion(struktur, targetVariable = "x") {
        const funktionsschale = struktur.find((element) =>
            element?.type === "FUNCTION"
            && element.isVisible !== false
            && this.istTrigonometrischeQuellfunktion(element.name)
            && this.enthaeltZielvariable(element, targetVariable)
        );

        if (!funktionsschale) {
            return null;
        }

        const trigMeta = this.trigInverseMeta(funktionsschale.name);
        if (!trigMeta) {
            return null;
        }

        const targetExpressionIds = this.sammleSegmentIds(funktionsschale.content || []);
        if (targetExpressionIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "trig_inverse",
            targetId: funktionsschale.id,
            targetExpressionIds,
            sourceType: "FUNCTION",
            sourceName: funktionsschale.name,
            inverseType: "FUNCTION",
            inverseName: trigMeta.inverseName,
            action: trigMeta.action,
            label: trigMeta.label,
            argumentScope: "whole_opposite_side"
        };
    }

    static findeInverseTrigAktion(struktur, targetVariable = "x") {
        const funktionsschale = struktur.find((element) =>
            element?.type === "FUNCTION"
            && element.isVisible !== false
            && this.istInverseTrigonometrischeQuellfunktion(element.name)
            && this.enthaeltZielvariable(element, targetVariable)
        );

        if (!funktionsschale) {
            return null;
        }

        const trigMeta = this.inverseTrigMeta(funktionsschale.name);
        if (!trigMeta) {
            return null;
        }

        const targetExpressionIds = this.sammleSegmentIds(funktionsschale.content || []);
        if (targetExpressionIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "inverse_trig",
            targetId: funktionsschale.id,
            targetExpressionIds,
            sourceType: "FUNCTION",
            sourceName: funktionsschale.name,
            inverseType: "FUNCTION",
            inverseName: trigMeta.inverseName,
            action: trigMeta.action,
            label: trigMeta.label,
            argumentScope: "whole_opposite_side"
        };
    }

    static findeRootPowerAktion(struktur, targetVariable = "x") {
        const obersteSchale = struktur.find((element) =>
            (element.type === "ROOT" || element.type === "POWER")
            && element.isVisible !== false
        );

        if (!obersteSchale) {
            return null;
        }

        if (obersteSchale.type === "POWER") {
            if (
                !this.hatNumerischenExponent(obersteSchale)
                || !this.enthaeltZielvariableInCollection(obersteSchale.content, targetVariable)
            ) {
                return null;
            }
        } else if (!this.enthaeltZielvariable(obersteSchale, targetVariable)) {
            return null;
        }

        const sourceType = obersteSchale.type;
        const inverseType = sourceType === "ROOT" ? "POWER" : "ROOT";
        const action = sourceType === "ROOT" ? "INVERT_TO_POWER" : "INVERT_TO_ROOT";
        const label = sourceType === "ROOT" ? "Wurzel knacken" : "Potenz knacken";
        const inversionDegree = sourceType === "ROOT"
            ? (obersteSchale.degree || 2)
            : (obersteSchale.exponent || 2);

        return {
            typ: "STRATEGY_DECISION",
            family: "root_power",
            targetId: obersteSchale.id,
            targetExpressionIds: [obersteSchale.id],
            sourceType,
            inverseType,
            action,
            label,
            inversionDegree,
            argumentScope: "whole_opposite_side"
        };
    }

    static findePowerExponentReleaseAktion(struktur, targetVariable = "x") {
        const powerShell = (struktur || []).find((element) =>
            element?.type === "POWER"
            && element.isVisible !== false
            && !this.hatNumerischenExponent(element)
            && this.enthaeltZielvariableInCollection(element.exponentNodes, targetVariable)
            && !this.enthaeltZielvariableInCollection(element.content, targetVariable)
        );

        if (!powerShell) {
            return null;
        }

        const baseNodes = Array.isArray(powerShell.content) ? powerShell.content : [];
        const exponentNodes = Array.isArray(powerShell.exponentNodes) ? powerShell.exponentNodes : [];
        if (
            baseNodes.length === 0
            || exponentNodes.length === 0
            || !baseNodes.every((element) => this.istPassiverAusdruck(element, targetVariable))
        ) {
            return null;
        }

        const targetExpressionIds = this.sammleSegmentIds(exponentNodes);
        const passiveExpressionIds = this.sammleSegmentIds(baseNodes);
        if (targetExpressionIds.length === 0 || passiveExpressionIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "power_exponent_release",
            targetId: powerShell.id,
            targetExpressionIds,
            passiveExpressionId: passiveExpressionIds[0],
            passiveExpressionIds,
            factorId: passiveExpressionIds[0],
            sourceType: "POWER",
            inverseType: "DIVISION",
            inverseName: "log",
            action: "MOVE_POWER_EXPONENT_TO_LOG_DIVISION",
            label: "Exponent logarithmisch freilegen",
            argumentScope: "whole_opposite_side"
        };
    }

    static findePowerBaseReleaseAktion(struktur, targetVariable = "x") {
        const powerShell = (struktur || []).find((element) =>
            element?.type === "POWER"
            && element.isVisible !== false
            && !this.hatNumerischenExponent(element)
            && this.enthaeltZielvariableInCollection(element.content, targetVariable)
            && !this.enthaeltZielvariableInCollection(element.exponentNodes, targetVariable)
        );

        if (!powerShell) {
            return null;
        }

        const baseNodes = Array.isArray(powerShell.content) ? powerShell.content : [];
        const exponentNodes = Array.isArray(powerShell.exponentNodes) ? powerShell.exponentNodes : [];
        if (
            baseNodes.length === 0
            || exponentNodes.length === 0
            || !exponentNodes.every((element) => this.istPassiverAusdruck(element, targetVariable))
        ) {
            return null;
        }

        const targetExpressionIds = this.sammleSegmentIds(baseNodes);
        const passiveExpressionIds = this.sammleSegmentIds(exponentNodes);
        if (targetExpressionIds.length === 0 || passiveExpressionIds.length === 0) {
            return null;
        }

        return {
            typ: "STRATEGY_DECISION",
            family: "power_base_release",
            targetId: powerShell.id,
            targetExpressionIds,
            passiveExpressionId: passiveExpressionIds[0],
            passiveExpressionIds,
            factorId: passiveExpressionIds[0],
            sourceType: "POWER",
            inverseType: "POWER",
            action: "MOVE_POWER_BASE_TO_RECIPROCAL_EXPONENT",
            label: "Potenzbasis freilegen",
            argumentScope: "whole_opposite_side"
        };
    }

    static findeNaechsteAktion(struktur, options = {}) {
        const targetVariable = typeof options === "string" ? options : (options?.targetVariable || "x");
        const anchorIndexInOriginal = (struktur || []).findIndex(
            (element) => element?.isVisible !== false && element?.value === "="
        );

        const normalizedStruktur = anchorIndexInOriginal !== -1
            ? normalizeEquationOuterGroups(struktur)
            : struktur;
        const anchorIndex = normalizedStruktur.findIndex(
            (element) => element?.isVisible !== false && element?.value === "="
        );

        if (anchorIndex !== -1) {
            const leftSide = normalizedStruktur.slice(0, anchorIndex);
            const rightSide = normalizedStruktur.slice(anchorIndex + 1);
            const leftCarriesTarget = this.enthaeltZielvariableInCollection(leftSide, targetVariable);
            const rightCarriesTarget = this.enthaeltZielvariableInCollection(rightSide, targetVariable);

            if (leftCarriesTarget !== rightCarriesTarget) {
                const activeSide = leftCarriesTarget ? leftSide : rightSide;
                const sideDecision = this.findeNaechsteAktion(activeSide, { targetVariable });

                if (sideDecision && !sideDecision.equationSide) {
                    sideDecision.equationSide = leftCarriesTarget ? "left" : "right";
                    sideDecision.oppositeEquationSide = leftCarriesTarget ? "right" : "left";
                }

                return sideDecision;
            }
        }

        return this.findeGroupReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeNegierteMultiplikationsDivisionAktion(normalizedStruktur, targetVariable)
            || this.findeNegativeSignReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeAdditionReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeSubtractionReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeSubtrahendReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeFractionBirthAktion(normalizedStruktur, targetVariable)
            || this.findeFractionDenominatorReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeFractionCollapseAktion(normalizedStruktur, targetVariable)
            || this.findeTrigInverseAktion(normalizedStruktur, targetVariable)
            || this.findeInverseTrigAktion(normalizedStruktur, targetVariable)
            || this.findePowerExponentReleaseAktion(normalizedStruktur, targetVariable)
            || this.findePowerBaseReleaseAktion(normalizedStruktur, targetVariable)
            || this.findeRootPowerAktion(normalizedStruktur, targetVariable)
            || null;
    }
}
