import AbstractCursor from './cursors/abstract'
import Dep, {getId} from './utils/Dep'
import MonitorFactory from './history/MonitorFactory'

const ids = {}

function convertId(dn) {
    if (!ids[dn]) {
        ids[dn] = getId()
    }

    return ids[dn]
}

export const settings = {
    debug: false
}

export function Getter(path) {
    const key = path.join('.')
    const displayName = 'get#' + key
    function getter(cursor) {
        return cursor.select(path).get
    }
    return Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName)
    })(getter)
}

export function Path(path) {
    const key = path.join('.')
    const displayName = 'path#' + key
    function getData(get) {
        return get()
    }

    return Dep({
        deps: [Getter(path)],
        displayName,
        id: convertId(displayName),
        isCachedTemporary: true,
        path
    })(getData)
}

export function Assign(path) {
    const key = path.join('.')
    const displayName = 'assign#' + key
    function assigner(cursor) {
        return cursor.select(path).assign
    }

    return Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName),
        isSetter: true
    })(assigner)
}

export function Setter(path) {
    const key = path.join('.')
    const displayName = 'setter#' + key
    function setter(cursor) {
        return cursor.select(path).set
    }

    return Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName),
        isSetter: true
    })(setter)
}

export function Apply(path) {
    const key = path.join('.')
    const displayName = 'apply#' + key
    function setter(cursor) {
        return cursor.select(path).apply
    }

    return Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName),
        isSetter: true
    })(setter)
}

export function Def(data) {
    const displayName = 'def#' + JSON.stringify(data)
    function def() {
        return data
    }

    return Dep({
        displayName,
        id: convertId(displayName)
    })(def)
}

export function Class(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isClass: true,
        pathMapper: Path
    })
}

export function Facet(deps, displayName) {
    return Dep({
        deps,
        displayName,
        isCachedTemporary: true,
        pathMapper: Path
    })
}

export function Factory(deps, displayName) {
    const origDep = Dep({
        deps,
        displayName,
        pathMapper: Path
    })

    return settings.debug ? MonitorFactory(origDep) : origDep
}
