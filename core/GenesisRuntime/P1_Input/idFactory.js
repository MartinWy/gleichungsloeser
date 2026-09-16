function hashSource(source) {
    let hash = 2166136261;

    for (let index = 0; index < source.length; index += 1) {
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
}

function createRuntimeNamespace(source) {
    return `${source.length.toString(36)}-${hashSource(source)}`;
}

function createRuntimeIdFactory(source) {
    const namespace = createRuntimeNamespace(source);
    const counters = Object.create(null);

    function nextSequence(bucket, kind) {
        const key = `${bucket}:${kind}`;
        const nextValue = (counters[key] || 0) + 1;
        counters[key] = nextValue;
        return String(nextValue).padStart(4, "0");
    }

    return {
        source,
        namespace,
        createAtomId(kind) {
            return `atom-${kind}-${namespace}-${nextSequence("atom", kind)}`;
        },
        createShellId(kind) {
            return `shell-${kind}-${namespace}-${nextSequence("shell", kind)}`;
        }
    };
}

export {
    createRuntimeIdFactory,
    createRuntimeNamespace,
    hashSource
};
