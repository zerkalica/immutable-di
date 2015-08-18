import getFunctionName from './utils/get-function-name'

export type DependencyType = (v: any) => any

export type DiDefinitionType = {
    name: ?string,
    path: ?Array<string>,
    definition: DependencyType
}

export const __Container = '__DICONTAINER__'

function normalizeDeps(d) {
    const resultDeps = []
    const deps = d || []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length

    for (let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        resultDeps.push({
            name,
            definition: Array.isArray(dep) ? Path(dep) : dep
        })
    }

    return resultDeps
}

function updateIdsMap(acc, normalizedDeps) {
    for (let i = 0, j = normalizedDeps.length; i < j; i++) {
        const dep = normalizedDeps[i]
        if (dep.definition === __Container) {
            break
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
                    const key = parts.toString()
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
export const __pathToIdsMap = {}

function Dep({id, displayName, deps, isClass, isCachedTemporary, isSetter, path}) {
    return function dep(Service) {
        id = id || (Service.__di ? Service.__di.id : lastId++)
        const dn = displayName || Service.displayName || getFunctionName(Service) || id
        const newDeps = normalizeDeps(deps)
        const acc = {
            map: __pathToIdsMap,
            isAction: false,
            id: isCachedTemporary ? null : id
        }
        updateIdsMap(acc, newDeps)

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

export function Class(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isClass: true
    })
}

export function Factory(deps, displayName) {
    return Dep({
        deps,
        displayName
    })
}

export function Facet(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isCachedTemporary: true
    })
}

export function Getter(path) {
    const key = path.join('.')
    const id = 'get#' + key
    function getter(container) {
        return container.select(path).get
    }
    return Dep({
        deps: [__Container],
        displayName: id,
        id
    })(getter)
}

export function Path(path) {
    const key = path.join('.')
    const id = 'path#' + key
    function getData(get) {
        return get()
    }

    return Dep({
        deps: [Getter(path)],
        displayName: id,
        id,
        isCachedTemporary: true,
        path
    })(getData)
}

export function Assign(path) {
    const key = path.join('.')
    const id = 'assign#' + key
    function assigner(container) {
        return container.select(path).assign
    }
    return Dep({
        deps: [__Container],
        displayName: id,
        id,
        isSetter: true
    })(assigner)
}

export function Setter(path) {
    const key = path.join('.')
    const id = 'setter#' + key
    function setter(container) {
        return container.select(path).set
    }

    return Dep({
        deps: [__Container],
        displayName: id,
        id,
        isSetter: true
    })(setter)
}

export function Def(data) {
    const id = 'def#' + JSON.stringify(data)
    function def() {
        return data
    }

    return Dep({
        displayName: id,
        id
    })(def)
}
