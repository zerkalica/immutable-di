import AbstractCursor from './cursors/abstract'
import Dep, {getId} from './utils/Dep'
import {IPath} from './asserts'
import getFunctionName from './utils/getFunctionName'

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

function getName(prefix, path) {
    return prefix + '@' + path.join('.')
}

function makeDef(fn, path, dep) {
    IPath(path)
    const displayName = getName(getFunctionName(fn), path)
    fn.displayName = displayName
    fn.__di = {
        displayName,
        id: convertId(displayName),
        deps: [{definition: dep}]
    }

    return fn
}

export function Cursor(path) {
    return Cursor.extend(makeDef(function cursor(state) {
        return state.select(path)
    }, path, AbstractCursor))
}
Cursor.extend = pass

export function Path(pth) {
    const p = makeDef(function path(cursor) {
        return cursor.get()
    }, pth, Cursor(pth))
    p.__di.isCachedTemporary = true
    p.__di.path = pth
    return Path.extend(p)
}
Path.extend = pass

export function Getter(path) {
    return Getter.extend(makeDef(function getter(cursor) {
        return cursor.get
    }, path, Cursor(path)))
}
Getter.extend = pass

export function Assign(path) {
    return Assign.extend(makeDef(function assign(cursor) {
        return cursor.assign
    }, path, Cursor(path)))
}
Assign.extend = pass

export function Setter(path) {
    return Setter.extend(makeDef(function setter(cursor) {
        return cursor.set
    }, path, Cursor(path)))
}
Setter.extend = pass

export function Apply(path) {
    return Apply.extend(makeDef(function apply(cursor) {
        return cursor.apply
    }, path, Cursor(path)))
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
