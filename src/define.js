import AbstractCursor from './cursors/abstract'
import Dep, {getId} from './utils/Dep'
import {IPath} from './asserts'

const ids = {}

function pass(p) {
    return p
}

function convertId(dn) {
    if (!ids[dn]) {
        ids[dn] = getId()
    }

    return ids[dn]
}

export function Getter(path) {
    IPath(path)
    const key = path.join('.')
    const displayName = 'get_' + key
    function getter(cursor) {
        return cursor.select(path).get
    }
    return Getter.extend(Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName)
    }))(getter)
}
Getter.extend = pass

export function Path(path) {
    IPath(path)
    const key = path.join('.')
    const displayName = 'path_' + key
    function getData(get) {
        return get()
    }

    return Path.extend(Dep({
        deps: [Getter(path)],
        displayName,
        id: convertId(displayName),
        isCachedTemporary: true,
        path
    }))(getData)
}
Path.extend = pass

export function Assign(path) {
    IPath(path)
    const key = path.join('.')
    const displayName = 'assign_' + key
    function assigner(cursor) {
        return cursor.select(path).assign
    }

    return Assign.extend(Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName),
        isSetter: true
    }))(assigner)
}
Assign.extend = pass

export function Setter(path) {
    IPath(path)
    const key = path.join('.')
    const displayName = 'setter_' + key
    function setter(cursor) {
        return cursor.select(path).set
    }

    return Setter.extend(Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName),
        isSetter: true
    }))(setter)
}
Setter.extend = pass

export function Apply(path) {
    IPath(path)
    const key = path.join('.')
    const displayName = 'apply_' + key
    function setter(cursor) {
        return cursor.select(path).apply
    }

    return Apply.extend(Dep({
        deps: [AbstractCursor],
        displayName,
        id: convertId(displayName),
        isSetter: true
    }))(setter)
}
Apply.extend = pass

export function Def(data) {
    const displayName = 'def_' + JSON.stringify(data)
    function def() {
        return data
    }

    return Def.extend(Dep({
        displayName,
        id: convertId(displayName)
    }))(def)
}
Def.extend = pass

export function Class(deps, displayName) {
    return Class.extend(Dep({
        deps,
        displayName,
        isClass: true,
        pathMapper: Path
    }))
}
Class.extend = pass

export function Facet(deps, displayName) {
    return Facet.extend(Dep({
        deps,
        displayName,
        isCachedTemporary: true,
        pathMapper: Path
    }))
}
Facet.extend = pass

export function Factory(deps, displayName) {
    return Factory.extend(Dep({
        deps,
        displayName,
        pathMapper: Path
    }))
}
Factory.extend = pass
