import getFunctionName from '../utils/get-function-name'
import getDef from './get'

import Container from '../container'

export type DependencyType = (v: any) => any

export type DiDefinitionType = {
    name: ?string,
    path: ?Array<string>,
    definition: DependencyType
}

function normalizeDeps(deps) {
    const resultDeps = []
    deps = deps || []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length

    for (let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        const path = Array.isArray(dep) ? dep : null
        const pathKey = path ? path.join('.') : null
        resultDeps.push({
            name,
            path,
            pathKey,
            definition: path ? null : dep
        })
    }

    return resultDeps
}

function updateIdsMap(map, id, normalizedDeps) {
    for (let i = 0, j = normalizedDeps.length; i < j; i++) {
        const dep = normalizedDeps[i]
        const path = dep.path
        if (path && path.length) {
            if (id) {
                const parts = []
                for (let ii = 0, jj = path.length; ii < jj; ii++) {
                    parts.push(path[ii])
                    const key = parts.toString()
                    let ids = map[key]
                    if (!ids) {
                        ids = []
                        map[key] = ids
                    }
                    if (ids.indexOf(id) === -1) {
                        ids.push(id)
                    }
                }
            }
        } else {
            if (!dep.definition) {
                throw new Error('no definition in dep: ' + dep)
            }
            if (!dep.definition.__di) {
                throw new Error('no definition in dep.definition: ' + dep.definition)
            }
            updateIdsMap(map, id, getDef(dep.definition).deps)
        }
    }
}

let lastId = 1
export const __pathToIdsMap = {}

function getDeps(id, deps) {
    const normalizedDeps = normalizeDeps(deps)
    updateIdsMap(__pathToIdsMap, id, normalizedDeps)
    return normalizedDeps
}

function Dep({deps, displayName, isClass, isCachedTemporary}) {
    return function __Dep(Service) {
        const id = (Service.__di ? Service.__di.id : lastId++)
        Service.__di = {
            id: id,
            displayName: displayName || Service.displayName || getFunctionName(Service) || id,
            isClass,
            isCachedTemporary,
            isOptions: !Array.isArray(deps),
            deps: getDeps(isCachedTemporary ? null : id, deps)
        }

        return Service
    }
}

export function Class(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isClass: true,
        isCachedTemporary: false
    })
}

export function Factory(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isClass: false,
        isCachedTemporary: false
    })
}

export function Facet(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isClass: false,
        isCachedTemporary: true
    })
}

export function Getter(path, displayName) {
    const key = path.join('.')
    function getter(container) {
        return container.select(path, key).get
    }

    return Facet([Container], displayName || 'get_' + path.join('_'))(getter)
}

export function Setter(path, displayName) {
    const key = path.join('.')
    function setter(container) {
        return container.select(path, key).set
    }

    return Facet([Container], displayName || 'set_' + path.join('_'))(setter)
}
