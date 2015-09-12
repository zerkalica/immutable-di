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


let lastId = 1
export function getId() {
    // http://jsperf.com/number-vs-string-object-keys-access
    return 'p' + lastId++
}

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
        Service.displayName = displayName
        Service.__di = {
            deps: newDeps,
            displayName: dn,
            id: id,
            isSetter: isSetter,
            isCachedTemporary: !!isCachedTemporary,
            isClass: !!isClass,
            isOptions: !Array.isArray(deps),
            path
        }

        return Service
    }
}
