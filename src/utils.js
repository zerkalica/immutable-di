export function isPromise(data) {
    return typeof data === 'object' && typeof data.then === 'function'
}

export function getDebugPath(args) {
    const [debugPath, name] = args || []
    return  (debugPath || '') + '.' + (name || 'unk')
}

export function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;

    return new F();
}
