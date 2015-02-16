export function isPromise(data) {
    return typeof data === 'object' && typeof data.then === 'function'
}

export function getDebugPath(args) {
    const [debugPath, name] = args || []
    return  (debugPath || '') + '.' + (name || 'unk')
}

export function classToFactory(Constructor, args) {
    function F() {
        return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;

    return () => new F();
}
