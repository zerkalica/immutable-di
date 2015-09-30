import getFunctionName from './getFunctionName'
import {IDeps} from '../asserts'

export type IDependency = (v: any) => any


let lastId = 1
export function getId() {
    return lastId++
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
