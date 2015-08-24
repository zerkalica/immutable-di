import getFunctionName from './getFunctionName'
import {IDeps} from '../asserts'

export type IDependency = (v: any) => any

function normalizeDeps(deps, pathMapper) {
    const resultDeps = []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length
    for (let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        resultDeps.push({
            name,
            definition: Array.isArray(dep) ? pathMapper(dep) : dep
        })
    }

    return resultDeps
}

function updateIdsMap(acc, normalizedDeps) {
    for (let i = 0, j = normalizedDeps.length; i < j; i++) {
        const dep = normalizedDeps[i]
        if (!dep.definition.__di) {
            throw new Error('Not a definition: ' + i + ': ' + JSON.stringify(dep))
        }
        const {path, isSetter, deps} = dep.definition.__di
        if (isSetter) {
            acc.isAction = true
        }

        if (path && path.length) {
            if (acc.id) {
                const parts = []
                for (let ii = 0, jj = path.length; ii < jj; ii++) {
                    parts.push(path[ii])
                    const key = parts.join('.')
                    let ids = acc.map[key]
                    if (!ids) {
                        ids = []
                        acc.map[key] = ids
                    }
                    if (ids.indexOf(acc.id) === -1) {
                        ids.push(acc.id)
                    }
                }
            }
        } else {
            updateIdsMap(acc, deps)
        }
    }
}

let lastId = 1
export function getId() {
    return lastId++
}

export const __pathToIdsMap = {}

export default function Dep({
    deps,
    displayName,
    id,
    isCachedTemporary,
    isClass,
    isSetter,
    path,
    pathMapper
}) {
    const _deps = deps || []
    IDeps(_deps)
    return function dep(Service) {
        id = id || (Service.__di ? Service.__di.id : getId())
        const dn = displayName || Service.displayName || getFunctionName(Service) || id
        const newDeps = normalizeDeps(_deps, pathMapper)
        const acc = {
            map: __pathToIdsMap,
            isAction: false,
            id: isCachedTemporary ? null : id
        }
        try {
            updateIdsMap(acc, newDeps)
        } catch (e) {
            e.message = 'Definition ' + dn + ': ' + e.message
            throw e
        }
        Service.displayName = displayName
        Service.__di = {
            deps: newDeps,
            displayName: dn,
            id: id,
            isAction: acc.isAction,
            isSetter: !!isSetter,
            isCachedTemporary: !!isCachedTemporary,
            isClass: !!isClass,
            isOptions: !Array.isArray(deps),
            path
        }

        return Service
    }
}
