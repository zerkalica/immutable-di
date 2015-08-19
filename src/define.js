import AbstractCursor from './cursors/abstract'
import Dep, {getId} from './utils/Dep'

const ids = {}

function convertId(dn) {
    if (!ids[dn]) {
        ids[dn] = getId()
    }

    return ids[dn]
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

export function Factory(deps, displayName) {
    return Dep({
        deps,
        displayName,
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
