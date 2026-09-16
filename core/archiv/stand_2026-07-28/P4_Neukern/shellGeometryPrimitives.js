export function createCenteredRawCol(rawColStart = 0, rawColEnd = 0) {
    return Math.floor((rawColStart + rawColEnd) / 2);
}

export function createContainerRange(rawColStart = 0, rawColEnd = 0) {
    return {
        rawColStart,
        rawColEnd,
        rawCol: createCenteredRawCol(rawColStart, rawColEnd)
    };
}

export function createSingleSlot(rawCol = 0, extra = {}) {
    return {
        rawCol,
        rawColStart: rawCol,
        rawColEnd: rawCol,
        ...extra
    };
}

export function createSpanningSlot(rawColStart = 0, rawColEnd = 0, extra = {}) {
    return {
        rawCol: createCenteredRawCol(rawColStart, rawColEnd),
        rawColStart,
        rawColEnd,
        ...extra
    };
}
