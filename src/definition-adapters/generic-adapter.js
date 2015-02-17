import {classToFactory} from '../utils'

function procesDeps(deps) {
    const resultDeps = []
    deps = deps || []
    for(let i = 0; i < deps.length; i++) {
        const dep = deps[i]
        const isArray = Array.isArray(dep)
        const isPromise = (isArray && dep.length === 2 && typeof dep[1] === 'function')
        const isPath = isArray && !isPromise
        const definition = {
            promiseHandler: isPromise ? (dep[1] || ((p) => p)) : null,
            path: isPath ? dep : [],
            definition: isPromise ? dep[0] : isPath ? null : dep,
        }

        resultDeps.push(definition)
    }

    return resultDeps
}

export default class GenericAdapter {
    static extractMetaInfo(definition, debugPath) {
        const id = GenericAdapter.idFromDefinition(definition, debugPath)
        const isClass = definition.__class
        const di = isClass ? definition.__class : definition.__factory
        const deps = procesDeps(di.slice(1))
        const waitFor = procesDeps(definition.__waitFor)

        return {
            id: id,
            handler: isClass ? classToFactory(definition) : definition,
            name: di[0],
            waitFor: waitFor,
            deps: deps
        }
    }

    static idFromDefinition(definition, debugPath) {
        if (typeof definition !== 'function') {
            if (!debugPath) {
                debugPath = 'arg'
            }
            throw new Error('Getter is not a definition in ' + debugPath)
        }

        if (definition && !debugPath) {
            debugPath = definition.toString()
        }

        const di = definition.__factory || definition.__class

        if (!di) {
            throw new Error('Property .__factory or .__class not exist in ' + debugPath)
        }
        if (!Array.isArray(di)) {
            throw new Error('Property .__factory or .__class is not an array in ' + debugPath)
        }

        return di[0]
    }
}
