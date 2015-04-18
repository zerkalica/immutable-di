import {classToFactory, getFunctionName} from './utils'
import WrapActionMethods from './flux/wrap-action-methods'

function pass(p) {
    return p
}

function processDeps(deps) {
    const resultDeps = []
    deps = deps || []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length
    for(let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        const isPromise = Array.isArray(dep)
            && dep.length === 2
            && typeof dep[1] === 'function'
        const isPath = typeof dep === 'string'
        const path = isPath ? null : dep
        const definition = isPromise ? dep[0] : path
        resultDeps.push({
            name,
            promiseHandler: isPromise ? (dep[1] || pass) : null,
            path: isPath ? dep.split('.') : null,
            definition: definition
        })
    }

    return resultDeps
}

function getScopes(normalizedDeps, scopeSet) {
    for(let i = 0; i < normalizedDeps.length; i++) {
        const dep = normalizedDeps[i]
        if (dep.path && dep.path.length) {
            scopeSet.add(dep.path[0])
        } else {
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
        id = getFunctionName(Service) + '[' + idPrefix + ']'
        lastId++
    }

    return id
}

function getDef(Service) {
    return Service.__di
}

function extractDef({id, handler, deps}) {
    const normalizedDeps = processDeps(deps)
    const scopeSet = new Set()
    getScopes(normalizedDeps, scopeSet)
    const scopes = Array.from(scopeSet.values())

    return {
        id,
        handler,
        scope: scopes.length ? scopes[0] : 'global',
        deps: normalizedDeps
    }
}


const Annotation = {
    Class(Service, deps) {
        Service.__di = extractDef({
            id: getId(Service),
            handler: classToFactory(Service),
            deps: deps || {}
        })
        return Service
    },

    Factory(Service, deps) {
        Service.__di = extractDef({
            id: getId(Service),
            handler: Service,
            deps: deps || {}
        })
        return Service
    },

    WaitFor(Service, deps) {
        Service.__di.waitFor = processDeps(deps)
        return Service
    },

    Def(Service, deps) {
        Service.__di = extractDef(deps)
        return Service
    },

    Action(Service, deps) {
        WrapActionMethods(Service)
        Service.__di = extractDef({
            id: getId(Service),
            handler: classToFactory(Service),
            deps: deps || {}
        })
        return Service
    }
}

const Promises = {
    ignore(p) {
        return p.catch(() => {})
    }
}

export default {
    getDef,
    Promises,
    Def: Annotation.Def,
    Class: Annotation.Class,
    Action: Annotation.Action,
    Factory: Annotation.Factory,
    WaitFor: Annotation.WaitFor
}
