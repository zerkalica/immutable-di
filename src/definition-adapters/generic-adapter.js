import {construct, getDebugPath} from '../utils'

export function extractMetaInfo(definition, debugPath, fallbackName) {
    const id = idFromDefinition(definition, debugPath, fallbackName)
    const isClass = definition.__class
    const di = isClass ? definition.__class : definition.__factory
    if (!di) {
        throw new Error('Property .__factory or .__class not exist in ' + getDebugPath(debugPath, fallbackName))
    }
    if (!Array.isArray(di)) {
        throw new Error('Property .__factory or .__class is not an array in ' + getDebugPath(debugPath, fallbackName))
    }

    const deps = di.slice(1)
    const resultDeps = []
    for(let i = 0; i < deps.length; i++) {
        const dep = deps[i]
        const isArray = Array.isArray(dep)
        const isPromise = (isArray && dep.length === 2 && typeof dep[1] === 'function')
        const isPath = isArray && !isPromise
        const definition = {
            type: isPromise ? 'promise' : (isPath ? 'path' : 'definition'),
            promiseHandler: isPromise ? dep[1] : null,
            path: isPath ? dep : null,
            definition: isPromise ? dep[0] : dep,
        }

        resultDeps.push(definition)
    }

    return {
        id: id,
        handler: isClass ? construct.bind(null, definition) : definition,
        isProducer: definition.__producer === true,
        name: di[0],
        deps: resultDeps
    }
}

export function idFromDefinition(definition, debugPath, fallbackName) {
    if (typeof definition !== 'function') {
        throw new Error('Getter is not a function in ' + getDebugPath(debugPath, fallbackName))
    }
    return definition
}
