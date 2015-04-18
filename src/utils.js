export function getDebugPath(args) {
    const [debugPath, name] = args || []
    return (debugPath ? (debugPath + '.') : '') + (name ? name : 'unk')
}

export function classToFactory(Constructor) {
    function F(args) {
        return Constructor.apply(this, args)
    }
    F.prototype = Constructor.prototype

    return (...args) => new F(args)
}

export function bindAll(object) {
    const keys = Object.keys(object)
    for(let i = 0; i < keys.length; i++) {
        const name = keys[i]
        const prop = object[name]
        if (object.hasOwnProperty(name) && typeof prop === 'function') {
            object[name] = prop.bind(object)
        }
    }
}

export function convertArgsToOptions(args, argsNames) {
    const obj = {}
    for(let i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i]
    }
    return obj
}
