function cloneRuntimeValue(value) {
    return JSON.parse(JSON.stringify(value));
}

export {
    cloneRuntimeValue
};
