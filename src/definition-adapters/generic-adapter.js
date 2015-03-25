import {classToFactory, getDebugPath} from '../utils'

function procesDeps(deps) {
    const resultDeps = []
    deps = deps || []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length
    for(let i = 0; i < len; i++) {
        const name = names.length ? names[i] : void 0
        const dep = deps[name || i]
        const isPromise = Array.isArray(dep) && dep.length === 2 && typeof dep[1] === 'function'
        const isPath = typeof dep === 'string'
        const definition = isPromise ? dep[0] : (isPath ? null : dep)
        if (definition) {
            GenericAdapter.extractMetaInfo(definition)
        }
        resultDeps.push({
            name,
            promiseHandler: isPromise ? (dep[1] || ((p) => p)) : null,
            path: isPath ? dep.split('.') : [],
            definition: definition
        })
    }

    return resultDeps
}

export default class GenericAdapter {
    static factory(name, deps, fn) {
        fn = fn || state => state
        fn.__factory = [name, deps]

        return fn
    }

    updatable(Widget, {name, props, state}) {
        const factory = GenericAdapter.factory
        const stateDef = factory(name + '.state', state)

        Widget.__di = extractMetaInfo(factory(
            name + '.element',
            factory(name, {
                updater: factory(
                    name + '.updaterProvider',
                    {},
                    () => ((setState) => factory(name + '.updater', stateDef, state => setState(state)))
                ),
                props: factory(name + '.props', props),
                state: stateDef
            })
        ))
    }

    static idFromDefinition(definition, debugPath) {
        if (typeof definition !== 'function') {
            if (!debugPath) {
                debugPath = 'arg'
            }
            throw new Error('Getter is not a definition in ' + debugPath + ': ' + definition)
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

    /**
     *
     * @example
     *
     * definition:
     *
     * ['TestFn', Dep1, Dep2]
     * ['TestFn', Dep1, 'state.path.1']
     * ['TestFn', [Dep1, p => p.catch({})], 'state.path.2']
     * ['TestFn', {dep1: Dep1}]
     * ['TestFn', {dep1: [Dep1, p => p.catch({})]}]
     */
    static extractMetaInfo(definition, debugPath) {
        const id = GenericAdapter.idFromDefinition(definition, debugPath)

        if (!definition.__diCached) {
            const isClass = definition.__class
            const di = isClass ? definition.__class : definition.__factory
            const first = di[1]
            const deps = procesDeps((typeof first === 'object' && !Array.isArray(first)) ? first : di.slice(1))
            const waitFor = procesDeps(definition.__waitFor)

            const scopeSet = new Set()
            for(let i = 0; i < deps.length; i++) {
                const dep = deps[i]
                if (dep.path && dep.path.length) {
                    scopeSet.add(dep.path[0])
                } else {
                    const depMeta = GenericAdapter.extractMetaInfo(dep.definition, getDebugPath([debugPath, i]))
                    depMeta.scopes.forEach(path => scopeSet.add(path))
                }
            }
            const scopes = Array.from(scopeSet.values())

            definition.__diCached = {
                id,
                name: di[0],
                handler: isClass ? classToFactory(definition) : definition,
                scopes,
                scope: scopes.length ? scopes[0] : 'global',
                waitFor,
                deps
            }
        }
        return definition.__diCached
    }
}
