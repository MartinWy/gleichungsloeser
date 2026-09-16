import assert from "node:assert/strict";
import { buildCellMetrics, buildRenderNode, buildStepRowKinds, buildStepRowMetrics, formatCellText } from "../../components/Arbeitsblatt_Druckansicht/renderKernel.js";

assert.deepEqual(
  buildStepRowKinds(3, 1),
  ["above_axis", "axis", "below_axis"],
  "Der Renderkern soll sichtbare Bruchbloecke als Oberzeile, Achse und Unterzeile klassifizieren."
);

assert.deepEqual(
  buildStepRowMetrics(
    [
      { row: 0, kind: "number", renderNode: buildRenderNode({ type: "NUMBER", value: "3" }) },
      { row: 1, kind: "fraction_line" },
      { row: 2, kind: "number", renderNode: buildRenderNode({ type: "NUMBER", value: "2" }) }
    ],
    ["above_axis", "axis", "below_axis"]
  ),
  [
    {
      kind: "above_axis",
      minHeightEm: 0.88,
      cellCount: 1,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: null,
      axisBottomReserveEm: null,
      axisBalanceEm: null,
      axisContext: null,
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: null,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: null
    },
    {
      kind: "axis",
      minHeightEm: 1.12,
      cellCount: 1,
      hasFractionLine: true,
      hasNestedFraction: false,
      axisTopReserveEm: 0.27,
      axisBottomReserveEm: 0.05,
      axisBalanceEm: 0.22,
      axisContext: "fraction_axis",
      fractionSpanWidth: 1,
      rowContentShiftEm: null,
      axisLineShiftEm: 0,
      fractionLineHeightEm: 0.28,
      fractionLineThicknessEm: 0.09,
      axisCompanionShiftEm: null,
      axisShiftEm: 0
    },
    {
      kind: "below_axis",
      minHeightEm: 0.8,
      cellCount: 1,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: null,
      axisBottomReserveEm: null,
      axisBalanceEm: null,
      axisContext: null,
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: null,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: null
    }
  ],
  "Die Teilzeilen eines sichtbaren Bruchblocks sollen explizite Hoehenhinweise fuer die Arbeitsblattansicht tragen."
);

const implicitMultiplicationNode = buildRenderNode({
  type: "MULTIPLICATION",
  content: [{ type: "NUMBER", value: "5" }],
  factor: [{
    type: "GROUP",
    content: [
      { type: "NUMBER", value: "2" },
      { type: "VARIABLE", value: "a" }
    ]
  }]
});

assert.equal(implicitMultiplicationNode.type, "multiplication");
assert.equal(implicitMultiplicationNode.separator, "", "5(2a) soll im Renderkern implizit als Multiplikation gesetzt werden.");
assert.equal(implicitMultiplicationNode.right?.type, "group");

const explicitPointNode = buildRenderNode({
  type: "MULTIPLICATION",
  content: [{ type: "NUMBER", value: "5" }],
  factor: [{ type: "NUMBER", value: "2" }]
});

assert.equal(explicitPointNode.type, "multiplication");
assert.equal(explicitPointNode.separator, "·", "Reine Zahl-mal-Zahl-Multiplikation soll mit sichtbarem Punkt gesetzt werden.");
assert.equal(explicitPointNode.layout.boxRole, "multiplication");
assert.equal(explicitPointNode.layout.axisBehavior, "baseline");
assert.equal(explicitPointNode.layout.separatorVisible, true);
assert.equal(explicitPointNode.layout.separatorOpacity, 0.92, "Sichtbare Multiplikationspunkte sollen ihre Lesbarkeits-Metadaten im Renderkern mitliefern.");
assert.equal(explicitPointNode.layout.axisMinHeightEm, 1.12);
assert.equal(explicitPointNode.layout.aboveAxisMinHeightEm, 0.92);
assert.equal(explicitPointNode.layout.belowAxisMinHeightEm, 0.86);
assert.equal(explicitPointNode.layout.axisTopReserveEm, 0.18);
assert.equal(explicitPointNode.layout.axisBottomReserveEm, 0.14);
assert.equal(explicitPointNode.layout.axisBalanceEm, 0.04);
assert.equal(explicitPointNode.layout.axisAboveEm, 0.52);
assert.equal(explicitPointNode.layout.axisBelowEm, 0.28);
assert.equal(explicitPointNode.layout.boxHeightEm, 0.8);
assert.deepEqual(
  buildCellMetrics({
    kind: "number",
    rowKind: "axis",
    projectionRole: null,
    renderNode: explicitPointNode
  }),
  {
    alignItems: "flex-end",
    alignSelf: "end",
    shiftYEm: 0
  },
  "Flache Achsenzellen sollen ohne vertikale Zusatzverschiebung aus dem Renderkern kommen."
);

const powerNode = buildRenderNode({
  type: "POWER",
  exponent: 2,
  content: [{
    type: "DIVISION",
    numerator: [{ type: "NUMBER", value: "5" }],
    denominator: [{ type: "NUMBER", value: "2" }]
  }]
});

assert.equal(powerNode.type, "power");
assert.equal(powerNode.layout.boxRole, "power");
assert.equal(powerNode.layout.axisBehavior, "superscript");
assert.equal(powerNode.base?.type, "fraction", "Eine Potenz ueber einem Bruch soll im Renderkern die Bruchbasis strukturell erhalten.");
assert.equal(powerNode.base?.layout.boxRole, "fraction");
assert.equal(powerNode.base?.layout.axisBehavior, "fraction_axis");
assert.equal(powerNode.base?.layout.blockRows, 3);
assert.equal(powerNode.base?.layout.fractionDepth, 1);
assert.equal(powerNode.layout.maxFractionDepth, 1, "Verschachtelte Bruche sollen als Tiefeninformation bis zur Elternbox hochgereicht werden.");
assert.equal(powerNode.layout.containsFraction, true);
assert.equal(powerNode.layout.exponentLiftEm, 0.48, "Potenzen ueber einem Bruch sollen eine angehobene Exponentenachse melden.");
assert.equal(powerNode.layout.exponentGapEm, 0.03, "Potenzen ueber einem Bruch sollen seitliche Luft fuer den Exponenten melden.");
assert.equal(powerNode.layout.axisMinHeightEm, 1.26);
assert.equal(powerNode.layout.aboveAxisMinHeightEm, 1.01);
assert.equal(powerNode.layout.belowAxisMinHeightEm, 0.88);
assert.equal(powerNode.layout.axisTopReserveEm, 0.3);
assert.equal(powerNode.layout.axisBottomReserveEm, 0.2);
assert.equal(powerNode.layout.axisBalanceEm, 0.11);
assert.equal(powerNode.layout.axisAboveEm, 1);
assert.equal(powerNode.layout.axisBelowEm, 1);
assert.equal(powerNode.layout.boxHeightEm, 2);
assert.equal(powerNode.exponent, "2");

const simplePowerNode = buildRenderNode({
  type: "POWER",
  exponent: 2,
  content: [{ type: "NUMBER", value: "3" }]
});

assert.equal(simplePowerNode.type, "power");
assert.equal(simplePowerNode.layout.containsFraction, false);
assert.equal(simplePowerNode.layout.exponentLiftEm, 0.34);
assert.equal(simplePowerNode.layout.exponentGapEm, 0);
assert.equal(simplePowerNode.layout.axisMinHeightEm, 1.19);
assert.equal(simplePowerNode.layout.aboveAxisMinHeightEm, 0.96);
assert.equal(simplePowerNode.layout.belowAxisMinHeightEm, 0.86);
assert.equal(simplePowerNode.layout.axisTopReserveEm, 0.25);
assert.equal(simplePowerNode.layout.axisBottomReserveEm, 0.17);
assert.equal(simplePowerNode.layout.axisBalanceEm, 0.08);
assert.equal(simplePowerNode.layout.axisAboveEm, 0.86);
assert.equal(simplePowerNode.layout.axisBelowEm, 0.28);
assert.equal(simplePowerNode.layout.boxHeightEm, 1.14);

const complexExponentPowerNode = buildRenderNode({
  type: "POWER",
  exponent: "n",
  exponentNodes: [{
    type: "DIVISION",
    numerator: [{ type: "NUMBER", value: "1" }],
    denominator: [{ type: "NUMBER", value: "2" }]
  }],
  content: [{ type: "VARIABLE", value: "x" }]
});

assert.equal(complexExponentPowerNode.type, "power");
assert.equal(complexExponentPowerNode.exponentNode?.type, "fraction");
assert.ok(
  complexExponentPowerNode.layout.axisAboveEm > simplePowerNode.layout.axisAboveEm,
  "Eine Potenz mit strukturellem Bruch-Exponent muss ihre Achsenhuelle aus dem echten Exponenten-Unterbaum lesen."
);
assert.ok(
  complexExponentPowerNode.layout.boxHeightEm > simplePowerNode.layout.boxHeightEm,
  "Komplexe Exponenten duerfen nicht mehr nur als flache Text-Heuristik behandelt werden."
);

const rootOverFractionNode = buildRenderNode({
  type: "ROOT",
  content: [{
    type: "DIVISION",
    numerator: [{ type: "NUMBER", value: "5" }],
    denominator: [{ type: "NUMBER", value: "2" }]
  }]
});

assert.equal(rootOverFractionNode.type, "root");
assert.equal(rootOverFractionNode.layout.axisBehavior, "raised_overbar");
assert.equal(rootOverFractionNode.layout.containsFraction, true, "Wurzeln ueber Bruechen sollen ihre Bruchhaltigkeit an den Renderkern melden.");
assert.equal(rootOverFractionNode.layout.maxFractionDepth, 1);
assert.equal(rootOverFractionNode.layout.rootPadTopEm, 0.14, "Wurzeln ueber einem Bruch sollen mehr Luft zwischen Wurzelbalken und Inhalt melden.");
assert.equal(rootOverFractionNode.layout.rootPadLeftEm, 0.16, "Wurzeln ueber einem Bruch sollen eine verbreiterte Einrueckung melden.");
assert.equal(rootOverFractionNode.layout.rootSignScale, 1.18);
assert.equal(rootOverFractionNode.layout.rootMinHeightEm, 1.14);
assert.equal(rootOverFractionNode.layout.axisMinHeightEm, 1.2);
assert.equal(rootOverFractionNode.layout.aboveAxisMinHeightEm, 1.03);
assert.equal(rootOverFractionNode.layout.belowAxisMinHeightEm, 0.88);
assert.equal(rootOverFractionNode.layout.axisTopReserveEm, 0.24);
assert.equal(rootOverFractionNode.layout.axisBottomReserveEm, 0.14);
assert.equal(rootOverFractionNode.layout.axisBalanceEm, 0.1);
assert.equal(rootOverFractionNode.layout.axisAboveEm, 1.22);
assert.equal(rootOverFractionNode.layout.axisBelowEm, 1.04);
assert.equal(rootOverFractionNode.layout.boxHeightEm, 2.26);
assert.deepEqual(
  buildCellMetrics({
    kind: "root",
    rowKind: "axis",
    projectionRole: null,
    renderNode: rootOverFractionNode
  }),
  {
    alignItems: "flex-end",
    alignSelf: "end",
    shiftYEm: 0
  },
  "Eine einzelne Wurzelzelle soll ohne nachtraegliche Achsenkorrektur aus dem Renderkern kommen."
);

const simpleRootNode = buildRenderNode({
  type: "ROOT",
  content: [{ type: "VARIABLE", value: "x" }]
});

assert.equal(simpleRootNode.type, "root");
assert.equal(simpleRootNode.layout.containsFraction, false);
assert.equal(simpleRootNode.layout.axisMinHeightEm, 1.14);
assert.equal(simpleRootNode.layout.aboveAxisMinHeightEm, 0.98);
assert.equal(simpleRootNode.layout.belowAxisMinHeightEm, 0.86);
assert.equal(simpleRootNode.layout.axisTopReserveEm, 0.24);
assert.equal(simpleRootNode.layout.axisBottomReserveEm, 0.14);
assert.equal(simpleRootNode.layout.axisBalanceEm, 0.1);
assert.deepEqual(
  buildStepRowMetrics(
    [{ row: 1, kind: "root", renderNode: rootOverFractionNode }],
    ["above_axis", "axis", "below_axis"]
  ),
  [
    {
      kind: "above_axis",
      minHeightEm: 0.92,
      cellCount: 0,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: null,
      axisBottomReserveEm: null,
      axisBalanceEm: null,
      axisContext: null,
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: null,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: null
    },
    {
      kind: "axis",
      minHeightEm: 2.26,
      cellCount: 1,
      hasFractionLine: false,
      hasNestedFraction: true,
      axisTopReserveEm: 1.22,
      axisBottomReserveEm: 1.04,
      axisBalanceEm: 0.18,
      axisContext: "root_fraction_axis",
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: 0,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: 0
    },
    {
      kind: "below_axis",
      minHeightEm: 0.86,
      cellCount: 0,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: null,
      axisBottomReserveEm: null,
      axisBalanceEm: null,
      axisContext: null,
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: null,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: null
    }
  ],
  "Wurzeln ueber einem Bruch sollen dem Renderkern erhoehte Achsen- und Randhoehen melden."
);
assert.deepEqual(
  buildStepRowMetrics(
    [{ row: 0, kind: "power", renderNode: simplePowerNode }],
    ["axis"]
  ),
  [
    {
      kind: "axis",
      minHeightEm: 1.19,
      cellCount: 1,
      hasFractionLine: false,
      hasNestedFraction: false,
      axisTopReserveEm: 0.86,
      axisBottomReserveEm: 0.28,
      axisBalanceEm: 0.58,
      axisContext: "power_axis",
      fractionSpanWidth: null,
      rowContentShiftEm: null,
      axisLineShiftEm: 0,
      fractionLineHeightEm: null,
      fractionLineThicknessEm: null,
      axisCompanionShiftEm: null,
      axisShiftEm: 0
    }
  ],
  "Auch eine einfache Potenz ohne Bruch soll ihre Achsenhuelle explizit als einheitlichen Achsenvertrag melden."
);

assert.deepEqual(
  buildCellMetrics({
    kind: "variable",
    rowKind: "axis",
    projectionRole: null,
    rowAxisContext: "fraction_axis",
    rowAxisBottomReserveEm: 0.32,
    renderNode: buildRenderNode({ type: "VARIABLE", value: "x" })
  }),
  {
    alignItems: "flex-end",
    alignSelf: "end",
    shiftYEm: -0.04
  },
  "Achszellen sollen ihre Lage direkt aus derselben Unterreserve wie der Bruchstrich ableiten."
);

assert.equal(
  buildStepRowMetrics(
    [
      { row: 1, kind: "fraction_line" },
      { row: 1, kind: "root", renderNode: rootOverFractionNode }
    ],
    ["above_axis", "axis", "below_axis"]
  )[1].axisCompanionShiftEm,
  null,
  "Eine fraction_root_axis soll keine spaete Begleiter-Korrektur mehr exportieren."
);

assert.equal(
  buildStepRowMetrics(
    [
      { row: 1, kind: "fraction_line" },
      { row: 1, kind: "power", renderNode: powerNode }
    ],
    ["above_axis", "axis", "below_axis"]
  )[1].axisCompanionShiftEm,
  null,
  "Eine fraction_power_axis soll ebenfalls keine spaete Begleiter-Korrektur mehr exportieren."
);

assert.deepEqual(
  buildCellMetrics({
    kind: "anchor",
    rowKind: "axis",
    projectionRole: null,
    rowAxisContext: "fraction_root_axis",
    rowAxisBottomReserveEm: 0.32,
    renderNode: buildRenderNode({ type: "ANCHOR", value: "=" })
  }),
  {
    alignItems: "flex-end",
    alignSelf: "end",
    shiftYEm: 0
  },
  "Auch auf einer fraction_root_axis soll ein Achsenanker direkt aus derselben Unterreserve ausgerichtet werden."
);

assert.deepEqual(
  buildCellMetrics({
    kind: "anchor",
    rowKind: "axis",
    projectionRole: null,
    rowAxisContext: "fraction_power_axis",
    rowAxisBottomReserveEm: 0.32,
    renderNode: buildRenderNode({ type: "ANCHOR", value: "=" })
  }),
  {
    alignItems: "flex-end",
    alignSelf: "end",
    shiftYEm: 0
  },
  "Auch auf einer fraction_power_axis soll ein Achsenanker direkt aus derselben Unterreserve ausgerichtet werden."
);

const nestedFractionNode = buildRenderNode({
  type: "DIVISION",
  numerator: [{ type: "NUMBER", value: "5" }],
  denominator: [{
    type: "DIVISION",
    numerator: [{ type: "NUMBER", value: "1" }],
    denominator: [{ type: "NUMBER", value: "2" }]
  }]
});

assert.equal(nestedFractionNode.type, "fraction");
assert.equal(nestedFractionNode.layout.fractionDepth, 1);
assert.equal(nestedFractionNode.layout.maxFractionDepth, 2, "Aeussere Brueche sollen die tiefste Bruchverschachtelung ihrer Kinder kennen.");
assert.equal(nestedFractionNode.layout.axisAboveEm, 0.96);
assert.equal(nestedFractionNode.layout.axisBelowEm, 2.14);
assert.equal(nestedFractionNode.layout.boxHeightEm, 3.1);
assert.equal(nestedFractionNode.denominator?.type, "fraction");
assert.equal(nestedFractionNode.denominator?.layout.fractionDepth, 2);
assert.equal(nestedFractionNode.denominator?.layout.scale, 0.92, "Innere Brueche sollen kompakter gerendert werden koennen.");
assert.equal(nestedFractionNode.denominator?.layout.rowGapEm, 0.01);
assert.equal(nestedFractionNode.denominator?.layout.marginInlineEm, 0.04);
assert.equal(nestedFractionNode.denominator?.layout.barThicknessEm, 0.07);
assert.equal(nestedFractionNode.denominator?.layout.axisAboveEm, 0.95);
assert.equal(nestedFractionNode.denominator?.layout.axisBelowEm, 0.99);
assert.equal(nestedFractionNode.denominator?.layout.boxHeightEm, 1.94);
assert.equal(nestedFractionNode.denominator?.layout.axisMinHeightEm, 1.2);
assert.equal(nestedFractionNode.denominator?.layout.aboveAxisMinHeightEm, 0.99);
assert.equal(nestedFractionNode.denominator?.layout.belowAxisMinHeightEm, 0.92);
assert.equal(nestedFractionNode.denominator?.layout.axisTopReserveEm, 0.2);
assert.equal(nestedFractionNode.denominator?.layout.axisBottomReserveEm, 0.18);
assert.equal(nestedFractionNode.denominator?.layout.axisBalanceEm, 0.02);
assert.deepEqual(
  buildCellMetrics({
    kind: "number",
    rowKind: "below_axis",
    projectionRole: "denominator",
    renderNode: nestedFractionNode.denominator
  }),
  {
    alignItems: "flex-start",
    alignSelf: "start",
    shiftYEm: 0
  },
  "Ein verschachtelter Nenner soll seine Hoehe aus der eigenen Box tragen statt ueber einen Zusatzversatz."
);
assert.deepEqual(
  buildCellMetrics({
    kind: "fraction_line",
    rowKind: "axis",
    projectionRole: "fraction_line",
    col: 6,
    colStart: 6,
    colEnd: 8
  }),
  {
    alignItems: "flex-end",
    alignSelf: "end",
    shiftYEm: 0,
    lineHeightEm: 0.34,
    lineThicknessEm: 0.1
  },
  "Breitere Bruchstriche sollen ihre Linienhoehe und Staerke ohne separaten Linienversatz melden."
);

assert.equal(
  formatCellText({
    type: "MULTIPLICATION",
    content: [{ type: "NUMBER", value: "5" }],
    factor: [{ type: "NUMBER", value: "2" }]
  }),
  "5·2",
  "Die Textfallback der Druckansicht soll dieselbe studentische Multiplikationsregel verwenden."
);
