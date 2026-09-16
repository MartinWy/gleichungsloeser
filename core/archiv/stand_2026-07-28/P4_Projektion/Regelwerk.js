import {
  getAtomAnchorOffset,
  getAtomVisualWidth,
  getCollectionVisualWidth,
  isVisibleInlineSpanShell
} from "./VisualWidth.js";
import { planVerticalTracks } from "./VerticalTrackPlanner.js";

function resolveAnchorIndex(atoms) {
  const anchorIndex = atoms.findIndex((atom) => atom && atom.value === '=');
  return anchorIndex === -1 ? 0 : anchorIndex;
}

function createProjectedAtom(atom, row, col, extra = {}) {
  return {
    ...atom,
    ...extra,
    sourceAtomId: extra.sourceAtomId ?? atom?.id ?? null,
    row,
    col
  };
}

function isExpandableMultiplicationShell(atom) {
  return atom?.type === 'MULTIPLICATION'
    && Array.isArray(atom.content)
    && Array.isArray(atom.factor);
}

function hasVisibleGeneratedAdditiveShell(atom) {
  return ["ADDITION", "SUBTRACTION"].includes(atom?.type)
    && atom?.isVisible !== false
    && atom?.isGenerated === true;
}

function isNegationInlineSafeCollection(collection = []) {
  const visibleAtoms = (collection || []).filter((atom) => atom?.isVisible !== false);

  if (visibleAtoms.length === 0) {
    return true;
  }

  if (visibleAtoms.length === 1) {
    return !hasVisibleGeneratedAdditiveShell(visibleAtoms[0]);
  }

  if (visibleAtoms.length % 2 === 0) {
    return false;
  }

  return visibleAtoms.every((atom, index) => {
    if (index % 2 === 1) {
      return atom?.type === "OPERATOR" && atom.value === "*";
    }

    return atom
      && atom.isVisible !== false
      && !["ANCHOR", "OPERATOR"].includes(atom.type)
      && !hasVisibleGeneratedAdditiveShell(atom);
  });
}

function isExpandableNegationShell(atom) {
  return atom?.type === "NEGATION"
    && atom?.isVisible !== false
    && Array.isArray(atom?.content)
    && isNegationInlineSafeCollection(atom.content);
}

function isExpandableFunctionShell(atom) {
  return atom?.type === "FUNCTION"
    && atom?.isVisible !== false
    && Array.isArray(atom?.content);
}

function needsVisibleMultiplicationSeparator(atom) {
  const factor = Array.isArray(atom?.factor) ? atom.factor.filter((item) => item?.isVisible !== false) : [];
  return factor[0]?.type === 'NUMBER';
}

function createInlineSpanShell(atom, row, startCol, extra = {}) {
  const visualWidth = getAtomVisualWidth(atom);
  return createProjectedAtom(atom, row, startCol, {
    ...extra,
    layoutMode: "INLINE_SPAN_SHELL",
    visualStartCol: startCol,
    visualWidth,
    spanStartCol: startCol,
    spanEndCol: startCol + visualWidth - 1,
    colStart: startCol,
    colEnd: startCol + visualWidth - 1
  });
}

function buildChildProjectionExtra(baseExtra, atom, index) {
  const nextExtra = { ...baseExtra };

  if (typeof nextExtra.idPrefix === 'string' && nextExtra.idPrefix.length > 0) {
    nextExtra.id = `${nextExtra.idPrefix}::${atom?.id || index}`;
  }

  delete nextExtra.idPrefix;
  return nextExtra;
}

function projectAtomAtStart(atom, row, startCol, extra = {}) {
  const atomCol = startCol + getAtomAnchorOffset(atom);

  if (atom?.type === 'DIVISION') {
    return expandDivisionAtom(atom, row, atomCol, {
      ...extra,
      visualStartCol: startCol,
      visualWidth: getAtomVisualWidth(atom)
    });
  }

  if (isExpandableFunctionShell(atom)) {
    return expandFunctionShell(atom, row, startCol, extra);
  }

  if (isExpandableNegationShell(atom)) {
    return expandNegationShell(atom, row, startCol, extra);
  }

  if (isVisibleInlineSpanShell(atom)) {
    return [createInlineSpanShell(atom, row, startCol, extra)];
  }

  if (isExpandableMultiplicationShell(atom)) {
    return expandMultiplicationShell(atom, row, startCol, extra);
  }

  if (['ADDITION', 'SUBTRACTION'].includes(atom?.type) && atom.isGenerated === true) {
    return expandAdditiveInverseShell(atom, row, startCol, extra);
  }

  return [createProjectedAtom(atom, row, atomCol, extra)];
}

function projectInlineCollection(collection, row, startCol, extra = {}) {
  const projected = [];
  let cursor = startCol;

  collection.forEach((atom, index) => {
    projected.push(...projectAtomAtStart(atom, row, cursor, buildChildProjectionExtra(extra, atom, index)));
    cursor += getAtomVisualWidth(atom);
  });

  return projected;
}

function expandDivisionAtom(atom, row, col, options = {}) {
  const visualWidth = options.visualWidth ?? getAtomVisualWidth(atom);
  const visualStartCol = options.visualStartCol ?? (col - Math.floor((visualWidth - 1) / 2));
  const visualEndCol = visualStartCol + visualWidth - 1;
  const shellAtom = createProjectedAtom(atom, row, col, {
    layoutMode: 'VERTICAL_DIVISION',
    sourceAtomId: atom.id || null,
    visualStartCol,
    visualWidth,
    spanStartCol: visualStartCol,
    spanEndCol: visualEndCol
  });

  if (atom.isVisible === false) {
    return [shellAtom];
  }

  const projected = [shellAtom];
  const numerator = Array.isArray(atom.numerator) ? atom.numerator : [];
  const denominator = Array.isArray(atom.denominator) ? atom.denominator : [];
  const numeratorWidth = getCollectionVisualWidth(numerator);
  const denominatorWidth = getCollectionVisualWidth(denominator);
  const numeratorStartCol = visualStartCol + Math.floor((visualWidth - numeratorWidth) / 2);
  const denominatorStartCol = visualStartCol + Math.floor((visualWidth - denominatorWidth) / 2);

  projected.push(...projectInlineCollection(numerator, row - 1, numeratorStartCol, {
    idPrefix: `${atom.id}::numerator`,
    projectionRole: 'numerator',
    sourceShellId: atom.id,
    parentType: 'DIVISION',
    position: 'numerator'
  }));

  projected.push({
    id: `${atom.id}::fraction-line`,
    value: '---',
    type: 'FRACTION_LINE',
    isVisible: atom.isVisible,
    projectionRole: 'fraction_line',
    sourceShellId: atom.id,
    sourceAtomId: atom.id || null,
    parentType: 'DIVISION',
    row,
    col,
    colStart: visualStartCol,
    colEnd: visualEndCol
  });

  projected.push(...projectInlineCollection(denominator, row + 1, denominatorStartCol, {
    idPrefix: `${atom.id}::denominator`,
    projectionRole: 'denominator',
    sourceShellId: atom.id,
    parentType: 'DIVISION',
    position: 'denominator'
  }));

  return projected;
}

function expandMultiplicationShell(atom, row, startCol, extra = {}) {
  const visualWidth = getAtomVisualWidth(atom);
  const shellAtom = createProjectedAtom(atom, row, startCol, {
    layoutMode: 'LINEAR_PRODUCT_SHELL',
    sourceAtomId: atom.id || null,
    visualStartCol: startCol,
    visualWidth,
    spanStartCol: startCol,
    spanEndCol: startCol + visualWidth - 1,
    colStart: startCol,
    colEnd: startCol + visualWidth - 1,
    ...extra
  });

  if (atom.isVisible === false) {
    return [shellAtom];
  }

  const projected = [shellAtom];
  const content = Array.isArray(atom.content) ? atom.content : [];
  const factor = Array.isArray(atom.factor) ? atom.factor : [];
  const reverseFlow = atom.flowDirection === "rtl";
  const contentWidth = getCollectionVisualWidth(content);
  const factorWidth = getCollectionVisualWidth(factor);

  let contentStartCol = startCol;
  let operatorCol = startCol + contentWidth;
  let factorStartCol = operatorCol;

  if (reverseFlow) {
    factorStartCol = startCol;
    operatorCol = startCol + factorWidth;
    contentStartCol = operatorCol;
  }

  if (needsVisibleMultiplicationSeparator(atom)) {
    projected.push({
      id: `${shellAtom.id}::operator`,
      value: '*',
      type: 'OPERATOR',
      isVisible: atom.isVisible,
      projectionRole: 'product_operator',
      sourceShellId: shellAtom.id,
      sourceAtomId: atom.id || null,
      parentType: atom.type,
      row,
      col: operatorCol
    });

    if (reverseFlow) {
      contentStartCol += 1;
    } else {
      factorStartCol += 1;
    }
  }

  projected.push(...projectInlineCollection(reverseFlow ? factor : content, row, reverseFlow ? factorStartCol : contentStartCol, {
    idPrefix: `${shellAtom.id}::${reverseFlow ? "factor" : "content"}`,
    projectionRole: reverseFlow ? 'product_factor' : 'product_content',
    sourceShellId: shellAtom.id,
    parentType: atom.type,
    position: reverseFlow ? 'factor' : 'content'
  }));

  projected.push(...projectInlineCollection(reverseFlow ? content : factor, row, reverseFlow ? contentStartCol : factorStartCol, {
    idPrefix: `${shellAtom.id}::${reverseFlow ? "content" : "factor"}`,
    projectionRole: reverseFlow ? 'product_content' : 'product_factor',
    sourceShellId: shellAtom.id,
    parentType: atom.type,
    position: reverseFlow ? 'content' : 'factor'
  }));

  return projected;
}

function expandFunctionShell(atom, row, startCol, extra = {}) {
  const visualWidth = getAtomVisualWidth(atom);
  const shellAtom = createProjectedAtom(atom, row, startCol, {
    layoutMode: "LINEAR_FUNCTION_SHELL",
    sourceAtomId: atom.id || null,
    visualStartCol: startCol,
    visualWidth,
    spanStartCol: startCol,
    spanEndCol: startCol + visualWidth - 1,
    colStart: startCol,
    colEnd: startCol + visualWidth - 1,
    ...extra
  });

  if (atom.isVisible === false) {
    return [shellAtom];
  }

  const projected = [shellAtom];
  const content = Array.isArray(atom.content) ? atom.content : [];
  const functionName = atom.name || "f";
  const contentWidth = getCollectionVisualWidth(content);
  const contentStartCol = startCol + 2;
  const rightDelimiterCol = contentStartCol + contentWidth;

  projected.push({
    id: `${shellAtom.id}::name`,
    value: functionName,
    type: "FUNCTION_NAME",
    isVisible: atom.isVisible,
    projectionRole: "function_name",
    sourceShellId: shellAtom.id,
    sourceAtomId: atom.id || null,
    shellId: shellAtom.id,
    shellType: "function",
    functionName,
    parentType: atom.type,
    row,
    col: startCol
  });

  projected.push({
    id: `${shellAtom.id}::left-delimiter`,
    value: "(",
    type: "DELIMITER",
    isVisible: atom.isVisible,
    projectionRole: "function_left",
    sourceShellId: shellAtom.id,
    sourceAtomId: atom.id || null,
    shellId: shellAtom.id,
    shellType: "function",
    functionName,
    parentType: atom.type,
    row,
    col: startCol + 1
  });

  projected.push(...projectInlineCollection(content, row, contentStartCol, {
    idPrefix: `${shellAtom.id}::content`,
    projectionRole: "function_argument",
    sourceShellId: shellAtom.id,
    parentType: atom.type,
    position: "content"
  }));

  projected.push({
    id: `${shellAtom.id}::right-delimiter`,
    value: ")",
    type: "DELIMITER",
    isVisible: atom.isVisible,
    projectionRole: "function_right",
    sourceShellId: shellAtom.id,
    sourceAtomId: atom.id || null,
    shellId: shellAtom.id,
    shellType: "function",
    functionName,
    parentType: atom.type,
    row,
    col: rightDelimiterCol
  });

  return projected;
}

function expandNegationShell(atom, row, startCol, extra = {}) {
  const visualWidth = getAtomVisualWidth(atom);
  const shellAtom = createProjectedAtom(atom, row, startCol, {
    layoutMode: "LINEAR_NEGATION_SHELL",
    sourceAtomId: atom.id || null,
    visualStartCol: startCol,
    visualWidth,
    spanStartCol: startCol,
    spanEndCol: startCol + visualWidth - 1,
    colStart: startCol,
    colEnd: startCol + visualWidth - 1,
    ...extra
  });

  if (atom.isVisible === false) {
    return [shellAtom];
  }

  const projected = [shellAtom];
  const signSymbol = atom.sign || "-";
  const content = Array.isArray(atom.content) ? atom.content : [];

  projected.push({
    id: `${shellAtom.id}::sign`,
    value: signSymbol,
    type: "OPERATOR",
    isVisible: atom.isVisible,
    projectionRole: "negation_sign",
    sourceShellId: shellAtom.id,
    sourceAtomId: atom.id || null,
    parentType: atom.type,
    row,
    col: startCol
  });

  projected.push(...projectInlineCollection(content, row, startCol + 1, {
    idPrefix: `${shellAtom.id}::content`,
    projectionRole: "negation_content",
    sourceShellId: shellAtom.id,
    parentType: atom.type,
    position: "content"
  }));

  return projected;
}

function expandAdditiveInverseShell(atom, row, startCol, extra = {}) {
  const visualWidth = getAtomVisualWidth(atom);
  const shellAtom = createProjectedAtom(atom, row, startCol, {
    layoutMode: 'LINEAR_INVERSE_SHELL',
    sourceAtomId: atom.id || null,
    visualStartCol: startCol,
    visualWidth,
    spanStartCol: startCol,
    spanEndCol: startCol + visualWidth - 1,
    colStart: startCol,
    colEnd: startCol + visualWidth - 1,
    ...extra
  });

  if (atom.isVisible === false) {
    return [shellAtom];
  }

  const projected = [shellAtom];
  const content = Array.isArray(atom.content) ? atom.content : [];
  const passive = Array.isArray(atom.passive) ? atom.passive : [];
  const contentWidth = getCollectionVisualWidth(content);
  const operatorSymbol = atom.type === 'SUBTRACTION' ? '-' : '+';

  projected.push(...projectInlineCollection(content, row, startCol, {
    idPrefix: `${shellAtom.id}::content`,
    projectionRole: 'inverse_content',
    sourceShellId: shellAtom.id,
    parentType: atom.type
  }));

  const operatorCol = startCol + contentWidth;
  projected.push({
    id: `${shellAtom.id}::inverse-operator`,
    value: operatorSymbol,
    type: 'OPERATOR',
    isVisible: atom.isVisible,
    projectionRole: 'inverse_operator',
    sourceShellId: shellAtom.id,
    sourceAtomId: atom.id || null,
    parentType: atom.type,
    row,
    col: operatorCol
  });

  projected.push(...projectInlineCollection(passive, row, operatorCol + 1, {
    idPrefix: `${shellAtom.id}::passive`,
    projectionRole: 'inverse_passive',
    sourceShellId: shellAtom.id,
    parentType: atom.type,
    position: 'passive'
  }));

  return projected;
}

function getDivisionNumeratorOffsetCorrection(divisionAtom) {
  if (divisionAtom?.type !== "DIVISION") {
    return 0;
  }

  const numeratorWidth = getCollectionVisualWidth(Array.isArray(divisionAtom.numerator) ? divisionAtom.numerator : []);
  const denominatorWidth = getCollectionVisualWidth(Array.isArray(divisionAtom.denominator) ? divisionAtom.denominator : []);

  return Math.max(0, Math.floor((denominatorWidth - numeratorWidth) / 2));
}

function findPreviousHiddenDivisionInRow(atoms, index, row) {
  for (let candidateIndex = index - 1; candidateIndex >= 0; candidateIndex -= 1) {
    const candidate = atoms[candidateIndex];

    if (candidate?.row !== row) {
      continue;
    }

    if (candidate.type === "DIVISION" && candidate.isVisible === false) {
      return candidate;
    }
  }

  return null;
}

function alignEmergedAfterHiddenActiveShell(projectedAtoms) {
  return projectedAtoms.map((atom, index, atoms) => {
    const previous = atoms[index - 1];
    const previousHiddenDivision = findPreviousHiddenDivisionInRow(atoms, index, atom?.row);
    const numeratorOffsetCorrection = getDivisionNumeratorOffsetCorrection(previousHiddenDivision);
    const shouldKeepNumeratorOffset = atom?.visualMode === "EMERGED"
      && numeratorOffsetCorrection > 0
      && previous?.isVisible === false
      && atom.row === previous.row
      && ["DIVISION", "FUNCTION"].includes(previous.type);

    if (shouldKeepNumeratorOffset) {
      return {
        ...atom,
        col: atom.col - numeratorOffsetCorrection
      };
    }

    return atom;
  });
}
export const projectToGrid = (atoms, layoutPlan = {}, rowIndex = 0) => {
  const anchorIndex = resolveAnchorIndex(atoms);
  const rowPlan = Array.isArray(layoutPlan?.rows) ? layoutPlan.rows[rowIndex] : null;
  const plannedStartCols = rowPlan
    && Array.isArray(rowPlan.startCols)
    && rowPlan.startCols.length === atoms.length
      ? [...rowPlan.startCols]
      : null;
  const anchorColumn = layoutPlan.anchorColumn ?? getCollectionVisualWidth(atoms.slice(0, anchorIndex));
  const startCols = plannedStartCols ?? new Array(atoms.length).fill(anchorColumn);
  const verticalFallback = planVerticalTracks([{ atoms }]);
  const baselineRow = rowPlan?.baselineRow ?? verticalFallback.rows[0]?.baselineRow ?? rowIndex;

  if (!plannedStartCols) {
    let leftCursor = anchorColumn;
    for (let index = anchorIndex - 1; index >= 0; index -= 1) {
      const width = getAtomVisualWidth(atoms[index]);
      leftCursor -= width;
      startCols[index] = leftCursor;
    }

    let rightCursor = anchorColumn + 1;
    for (let index = anchorIndex + 1; index < atoms.length; index += 1) {
      startCols[index] = rightCursor;
      rightCursor += getAtomVisualWidth(atoms[index]);
    }
  }

  const projectedAtoms = atoms.flatMap((atom, index) => {
    return projectAtomAtStart(atom, baselineRow, startCols[index]);
  });

  if (plannedStartCols) {
    return projectedAtoms;
  }

  return alignEmergedAfterHiddenActiveShell(projectedAtoms);
};
