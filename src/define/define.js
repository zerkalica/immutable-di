import getFunctionName from '../utils/get-function-name'
import getDef from './get'

function pass(p) {
    return p
}

function processDeps(deps) {
    const resultDeps = []
    deps = deps || []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length
    for (let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        const isArray = Array.isArray(dep)
        const isPromise = isArray && dep.length === 2
        const isProto = isArray && dep.length === 1
        const isPath = typeof dep === 'string'
        const path = isPath ? null : dep
        const definition = (isPromise || isProto) ? dep[0] : path
        resultDeps.push({
            name,
            promiseHandler: isPromise ? (dep[1] || pass) : null,
            path: isPath ? dep.split('.') : null,
            definition: definition,
            isProto
        })
    }

    return resultDeps
}

function getScopes(normalizedDeps, scopeSet) {
    for (let i = 0; i < normalizedDeps.length; i++) {
        const dep = normalizedDeps[i]
        if (dep.path && dep.path.length) {
            scopeSet.add(dep.path[0])
        } else if (!dep.isProto) {
            if (!dep.definition) {
                throw new Error('no definition in dep: ' + dep)
            }
            if (!dep.definition.__di) {
                throw new Error('no definition in dep.definition: ' + dep.definition)
            }
            getScopes(getDef(dep.definition).deps, scopeSet)
        }
    }
}

let lastId = 1
function getId(Service, idPrefix) {
    idPrefix = idPrefix || lastId
    let id = Service.__id
    if (!id) {
        id = getFunctionName(Service) + '#' + idPrefix
        lastId++
    }

    return id
}

function extractDef({id, deps, isClass}) {
    const normalizedDeps = processDeps(deps)
    const scopeSet = new Set()
    getScopes(normalizedDeps, scopeSet)
    const scopes = []
    scopeSet.forEach(scope => scopes.push(scope))

    return {
        id,
        isClass,
        scope: scopes.length ? scopes[0] : 'global',
        deps: normalizedDeps
    }
}

export function Class(deps, id) {
    return function __Class(Service) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: true,
            deps: deps || {}
        })

        return Service
    }
}

export function Factory(deps, id) {
    return function __Factory(Service) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: false,
            deps: deps || {}
        })
        return Service
    }
}
