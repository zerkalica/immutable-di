export function isPromise(data) {
    return false
}

export function getDebugPath(debugPath, name) {
    return 'getDebugPath.mock'
}

export function classToFactory(Constructor, args) {
    return () => new Constructor(args)
}
