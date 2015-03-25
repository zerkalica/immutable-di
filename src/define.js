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

export function getDef(Service) {
    return Service.__di
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

function Def(Service, {id, isClass, deps}) {
    if (!getDef(Service)) {
        const normalizedDeps = procesDeps(deps)
        const scopeSet = new Set()
        getScopes(normalizedDeps, scopeSet)
        const scopes = Array.from(scopeSet.values())

        Service.__di = {
            isClass,
            scope: scopes.length ? scopes[0] : 'global',
            deps: normalizedDeps
        }
    }
    return Service
}

export function Class(Service, deps) {
    Def(Service, {id: getId(Service), deps, isClass: true})
}

export function Factory(Service, deps) {
    Def(Service, {id: getId(Service), deps, isClass: false})
}

export function WaitFor(Service, deps) {
    if (!Service.__waitFor) {
        Service.__waitFor = processDeps(deps)
    }
}

class Updater {
    update = p => p
    getter: null
    constructor(dispatcher) {
        this._dispatcher = dispatcher
    }

    mount(cb) {
        this.update = cb
        this._dispatcher.mount(this.getter)
    }
    unmount() {
        this._dispatcher.unmount(this.getter)
    }
}

export function Statefull(Service, {props, state}) {
    if (!Service.__diGetter) {
        const id = getId(Service)
        const stateDef = Def(p => p, {id + '.state', deps: state})
        const propsDef = Def(p => p, {id + '.props', deps: props})
        const updater = new Updater()

        Service.__diGetter = function __diGetter({props, state}) {
            updater._dispatcher = props.dispatcher
            updater.update({props, state})
            return {
                props,
                state,
                updater
            }
        }

        Def(Service.__diGetter, {
            id,
            deps: {
                state: stateDef,
                props: propsDef
            },
            isClass: false
        })

        updater.getter = Service.__diGetter
    }
}
