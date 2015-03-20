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

export function bindAll(object) {
    const keys = Object.keys(object)
    for(let i = 0; i < keys.length; i++) {
        const name = keys[i]
        object[name] = object[name].bind(object)
    }
}
