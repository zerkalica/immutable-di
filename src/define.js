import AbstractCursor from './cursors/abstract'
import Dep from './utils/Dep'

export function Getter(path) {
    const key = path.join('.')
    const id = 'get#' + key
    function getter(cursor) {
        return cursor.select(path).get
    }
    return Dep({
        deps: [AbstractCursor],
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
    function assigner(cursor) {
        return cursor.select(path).assign
    }

    return Dep({
        deps: [AbstractCursor],
        displayName: id,
        id,
        isSetter: true
    })(assigner)
}

export function Setter(path) {
    const key = path.join('.')
    const id = 'setter#' + key
    function setter(cursor) {
        return cursor.select(path).set
    }

    return Dep({
        deps: [AbstractCursor],
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
