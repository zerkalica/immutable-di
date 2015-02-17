export function isPromise(data) {
    return typeof data === 'object' && typeof data.then === 'function'
}

export function getDebugPath(args) {
    const [debugPath, name] = args || []
    return  (debugPath ? (debugPath + '.') : '') + (name ? name : 'unk')
}

export function classToFactory(Constructor) {
    function F(args) {
        return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;

    return (...args) => new F(args);
}
