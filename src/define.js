import Listeners from './flux/listeners'
import {classToFactory} from './utils'

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
        resultDeps.push({
            name,
            promiseHandler: isPromise ? (dep[1] || ((p) => p)) : null,
            path: isPath ? dep.split('.') : null,
            definition: definition
        })
    }

    return resultDeps
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const FN_MAGIC = 'function'
function getFunctionName(func) {
    return func
        .toString()
        .replace(STRIP_COMMENTS, '')
        .slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
}

function getScopes(normalizedDeps, scopeSet) {
    for(let i = 0; i < normalizedDeps.length; i++) {
        const dep = normalizedDeps[i]
        if (dep.path && dep.path.length) {
            scopeSet.add(dep.path[0])
        } else {
            getScopes(getDef(dep).deps, scopeSet)
        }
    }
}

const ids = new Set()
function getId(Service) {
    const id = getFunctionName(Service)
    if (ids.has(id)) {
        throw new Error('Already registered service with id: ' + id)
    }
    ids.add(id)

    return id
}

export function getDef(Service) {
    return Service.__di
}

function Def({id, handler, deps}) {
    const normalizedDeps = procesDeps(deps)
    const scopeSet = new Set()
    getScopes(normalizedDeps, scopeSet)
    const scopes = Array.from(scopeSet.values())

    return {
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

function WaitFor(Service, deps) {
    return processDeps(deps)
}

function passthru(options) {
    return options
}

function State(Service, {props, state}) {
    const id = getId(Service)
    let propsDef = p => p
    let stateDef = p => p
    stateDef.__di = Def({
        id: id + '.state',
        deps: state,
        handler: passthru
    })
    propsDef.__di = Def({
        id: id + '.props',
        deps: props,
        handler: passthru
    })

    let diGetter = ({props, state, listeners}) => ({
        service: Service,
        options: {
            props,
            state,
            updater: listeners.createUpdater({id: id + '.updater', state})
        }
    })

    return Def({
        id: id + '.getter',
        handler: diGetter,
        deps: {
            listeners: Listeners,
            state: stateDef,
            props: propsDef
        }
    })
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
    let fn = p => p
    fn.__di = Def(options)
    return fn
}

export default {
    State: cache(State),
    Class: cache(Class),
    Factory: cache(Factory),
    WaitFor: cachedWaitFor,
    Def: cachedDef,
}
