import { transportShell } from "./transportShell.js";

function wrapExistingContent({
    shellId,
    rowKey,
    name,
    contentShell
}) {
    const content = transportShell(contentShell, {
        bandStart: contentShell.bandStart,
        rowStart: contentShell.rowStart,
        rowKey,
        shellId: `${shellId}::content`
    });
    const nameCol = content.bandStart - 2;
    const leftParenCol = content.bandStart - 1;
    const rightParenCol = content.bandEnd + 1;

    return {
        shellId,
        rowKey,
        shellState: "BORN",
        shellType: "FUNCTION_WRAPPER",
        name,
        bandStart: nameCol,
        bandEnd: rightParenCol,
        bandWidth: rightParenCol - nameCol + 1,
        intrinsicWidth: rightParenCol - nameCol + 1,
        intrinsicHeight: content.rowEnd - content.rowStart + 1,
        placedStart: nameCol,
        placedEnd: rightParenCol,
        rowStart: content.rowStart,
        rowEnd: content.rowEnd,
        nameSlot: {
            shellId,
            role: "function_name",
            value: name,
            col: nameCol,
            row: content.rowStart + Math.floor((content.rowEnd - content.rowStart) / 2)
        },
        parenLeft: {
            shellId,
            role: "paren_left",
            value: "(",
            col: leftParenCol,
            rowStart: content.rowStart,
            rowEnd: content.rowEnd
        },
        parenRight: {
            shellId,
            role: "paren_right",
            value: ")",
            col: rightParenCol,
            rowStart: content.rowStart,
            rowEnd: content.rowEnd
        },
        contentShell: content
    };
}

export {
    wrapExistingContent
};
