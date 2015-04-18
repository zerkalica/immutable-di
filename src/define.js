import {classToFactory} from './utils'

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

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const FN_MAGIC = 'function'
function getFunctionName(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '')
    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
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

function Def({id, handler, deps}) {
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

function Class(Service, deps) {
    return Def({
        id: getId(Service),
        handler: classToFactory(Service),
        deps: deps || {}
    })
}

function Factory(Service, deps) {
    return Def({
        id: getId(Service),
        handler: Service,
        deps: deps || {}
    })
}

function WaitFor(deps) {
    return processDeps(deps)
}

function cache(cb) {
    return function(Service, a2, a3) {
        Service.__di = cb(Service, a2, a3)
        return Service
    }
}

function cachedWaitFor(Service, deps) {
    Service.__di.waitFor = WaitFor(deps)
    return Service
}

function cachedDef(options) {
    function fn(p) {
        return p
    }
    fn.__di = Def(options)
    return fn
}

const Promises = {
    ignore(p) {
        return p.catch(() => {})
    }
}

export default {
    getId,
    getDef: getDef,
    Def: cachedDef,
    Class: cache(Class),
    Factory: cache(Factory),
    WaitFor: cachedWaitFor,
    Promises: Promises
}
