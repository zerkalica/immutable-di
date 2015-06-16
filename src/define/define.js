import getFunctionName from '../utils/get-function-name'
import getDef from './get'

function pass(p) {
    return p
}

function processDeps(deps) {
    const resultDeps = []
    deps = deps || []
    const isArray = Array.isArray(deps)
    const names = isArray ? [] : Object.keys(deps)
    const len = isArray ? deps.length : names.length

    for (let i = 0; i < len; i++) {
        const name = names.length ? names[i] : undefined
        const dep = deps[name || i]
        const isArray = Array.isArray(dep)
        resultDeps.push({
            name,
            path: isArray ? dep : null,
            definition: isArray ? null : dep,
            promiseHandler: null,
            isProto: false
        })
    }

    return resultDeps
}

function updateIdsMap(map, id, normalizedDeps) {
    for (let i = 0; i < normalizedDeps.length; i++) {
        const dep = normalizedDeps[i]
        if (dep.path && dep.path.length) {
            const parts = []
            dep.path.forEach(part=> {
                parts.push(part)
                const key = parts.toString()
                let ids = map.get(key)
                if (!ids) {
                    ids = []
                    map.set(key, ids)
                }
                if (ids.indexOf(id) === -1) {
                    ids.push(id)
                }
            })
        } else if (!dep.isProto) {
            if (!dep.definition) {
                throw new Error('no definition in dep: ' + dep)
            }
            if (!dep.definition.__di) {
                throw new Error('no definition in dep.definition: ' + dep.definition)
            }
            updateIdsMap(map, id, getDef(dep.definition).deps)
        }
    }
}

let lastId = 1
function getId(Service, idPrefix) {
    idPrefix = idPrefix || lastId
    let id = Service.__id
    if (!id) {
        id = getFunctionName(Service) + '#' + idPrefix
        lastId++
    }

    return id
}

const __pathToIdsMap = new Map()

function extractDef({id, deps, isClass}) {
    const normalizedDeps = processDeps(deps)
    updateIdsMap(__pathToIdsMap, id, normalizedDeps)

    return {
        id,
        isClass,
        deps: normalizedDeps
    }
}

export {__pathToIdsMap}

export function Class(deps, id) {
    return function __Class(Service) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: true,
            deps: deps || {}
        })

        return Service
    }
}

export function Factory(deps, id) {
    return function __Factory(Service) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: false,
            deps: deps || {}
        })
        return Service
    }
}
