import getFunctionName from './utils/getFunctionName'

export function IDep(dep) {
    if (process.env.NODE_ENV === 'development') {
        if (typeof dep === 'function') {
            const name = dep.displayName || getFunctionName(dep)
            if (!dep.__di) {
                throw new TypeError('Dep ' + name + ' has no __di static property')
            }
            if (!dep.__di.id) {
                throw new TypeError('Dep ' + name + ' has no id')
            }
        } else if (!Array.isArray(dep)) {
            throw new TypeError('Dep ' + dep + ' is not a function or array')
        }
    }
}

export function IDeps(deps) {
    if (process.env.NODE_ENV === 'development') {
        if (Array.isArray(deps)) {
            deps.forEach(dep => IDep(dep))
        } else {
            if (typeof deps !== 'object') {
                throw new Error('stateMap is not an object')
            }
            Object.keys(deps).forEach(k => IDep(deps[k]))
        }
    }
}

export function IPath(path) {
    if (process.env.NODE_ENV === 'development') {
        if (!Array.isArray(path)) {
            throw new TypeError('path is not an array')
        }
        path.forEach(p => {
            if (typeof p !== 'string') {
                throw new TypeError('Path element is not a string in array: ' + path)
            }
        })
    }
}
