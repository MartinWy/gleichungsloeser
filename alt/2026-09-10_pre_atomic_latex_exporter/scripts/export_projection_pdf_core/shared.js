import { resolveGreekLatexCommand } from "../../components/Arbeitsblatt_Druckansicht/greekSymbols.js";

export const fallbackCellWidthEm = 1.12;
export const hiddenColumnWidthEm = 0;

export function escapeLatexText(text) {
    return String(text)
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\$/g, "\\$")
        .replace(/&/g, "\\&")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/%/g, "\\%")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}");
}

export function escapeLatexMathAtom(text) {
    const greekCommand = resolveGreekLatexCommand(text);
    if (greekCommand) {
        return greekCommand;
    }

    if (text === "*" || text === "·") {
        return "\\cdot{}";
    }

    return String(text)
        .replace(/\\/g, "\\backslash ")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/_/g, "\\_")
        .replace(/%/g, "\\%")
        .replace(/&/g, "\\&")
        .replace(/#/g, "\\#")
        .replace(/\$/g, "\\$");
}

export function formatEm(value) {
    const rounded = Math.round((value || 0) * 1000) / 1000;
    return String(rounded).replace(/0+$/u, "").replace(/\.$/u, "") || "0";
}

export function p4Cell(content, widthEm = fallbackCellWidthEm) {
    return `\\pFourCell{${formatEm(widthEm)}}{${content || ""}}`;
}

export function hasCellSpan(cell) {
    return Number.isInteger(cell?.colStart)
        && Number.isInteger(cell?.colEnd)
        && cell.colEnd > cell.colStart;
}

export function columnWidthFor(columnLayout, col) {
    return columnLayout?.widths?.[col] ?? fallbackCellWidthEm;
}

export function spanWidth(columnLayout, colStart, colEnd) {
    let width = 0;

    for (let col = colStart; col <= colEnd; col += 1) {
        width += columnWidthFor(columnLayout, col);
    }

    return width;
}

export function widthsForSpan(columnLayout, colStart, colEnd) {
    const widths = [];

    for (let col = colStart; col <= colEnd; col += 1) {
        widths.push(columnWidthFor(columnLayout, col));
    }

    return widths;
}
